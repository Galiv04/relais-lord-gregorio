/* ============ TEST AUTOMATICI — validazione dati e logica ============
   Uso: node tests/validate.mjs
   Verifica: integrità del grafo delle scene, dati personaggi/nemici/oggetti,
   sprite ben formati, raggiungibilità dei finali, sanità dei dadi, bilanciamento. */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

let failures = 0, warnings = 0, passed = 0;
function ok(msg) { passed++; }
function fail(msg) { failures++; console.error('  ❌ FAIL:', msg); }
function warn(msg) { warnings++; console.warn('  ⚠ WARN:', msg); }
function section(name) { console.log('\n▶', name); }

/* ---------- carica i moduli di gioco in un contesto Node ---------- */
const src = ['js/sprites.js', 'js/characters.js', 'js/campaign.js']
  .map(f => readFileSync(join(root, f), 'utf8'))
  .join('\n;\n');

const context = {};
const loader = new Function(`${src}; return { Sprites, HEROES, BESTIARY, ITEMS, CAMPAIGN, CAMPAIGN_START, WORLD_MAP, CHAPTERS: typeof CHAPTERS !== 'undefined' ? CHAPTERS : [] };`);
let g;
try {
  g = loader();
  ok('moduli caricati');
} catch (e) {
  console.error('❌ ERRORE FATALE nel caricamento dei moduli:', e.message);
  process.exit(1);
}
const { Sprites, HEROES, BESTIARY, ITEMS, CAMPAIGN, CAMPAIGN_START, WORLD_MAP, CHAPTERS } = g;

/* ---------- 1. grafo delle scene ---------- */
section('Grafo delle scene');

const sceneIds = new Set(Object.keys(CAMPAIGN));
const SPECIAL = new Set(['RETRY_COMBAT']);

function refsOf(scene) {
  const refs = [];
  for (const c of scene.choices || []) {
    if (c.next) refs.push(c.next);
    if (c.check) { refs.push(c.check.success, c.check.fail); }
  }
  if (scene.combat) { refs.push(scene.combat.victory, scene.combat.defeat); }
  if (scene.minigame) { refs.push(scene.minigame.success, scene.minigame.fail); }
  return refs.filter(Boolean);
}

let badRefs = 0;
for (const [id, scene] of Object.entries(CAMPAIGN)) {
  for (const ref of refsOf(scene)) {
    if (!sceneIds.has(ref) && !SPECIAL.has(ref)) { fail(`scena "${id}" punta a scena inesistente "${ref}"`); badRefs++; }
  }
}
if (!badRefs) { ok(); console.log(`  ✔ tutti i riferimenti tra ${sceneIds.size} scene sono validi`); }

// raggiungibilità da p1 (RETRY_COMBAT torna a una scena combat: consideriamo raggiungibili le scene combat già visitate)
const reachable = new Set();
const queue = [CAMPAIGN_START];
while (queue.length) {
  const id = queue.pop();
  if (reachable.has(id) || SPECIAL.has(id)) continue;
  reachable.add(id);
  const scene = CAMPAIGN[id];
  if (scene) queue.push(...refsOf(scene));
}
const unreachable = [...sceneIds].filter(id => !reachable.has(id));
if (unreachable.length) unreachable.forEach(id => fail(`scena orfana (mai raggiungibile): "${id}"`));
else { ok(); console.log(`  ✔ tutte le ${sceneIds.size} scene sono raggiungibili da "${CAMPAIGN_START}"`); }

// scene senza uscite (devono essere solo i finali)
for (const [id, scene] of Object.entries(CAMPAIGN)) {
  const exits = refsOf(scene).length;
  if (!exits && !scene.ending) fail(`scena "${id}" è un vicolo cieco (nessuna uscita e non è un finale)`);
  if (scene.ending && refsOf(scene).length) warn(`finale "${id}" ha delle uscite: strano`);
}
ok(); console.log('  ✔ nessun vicolo cieco fuori dai finali');

// i finali sono raggiungibili
const endings = Object.entries(CAMPAIGN).filter(([, s]) => s.ending).map(([id]) => id);
if (endings.length < 3) fail(`solo ${endings.length} finali trovati (attesi ≥3)`);
for (const e of endings) {
  if (!reachable.has(e)) fail(`finale "${e}" non raggiungibile`);
}
console.log(`  ✔ ${endings.length} finali, tutti raggiungibili: ${endings.join(', ')}`);

// entrambi i rami del bivio esistono
if (!reachable.has('k1') || !reachable.has('u1') || !reachable.has('b1')) fail('una delle tre piste della notte (cantina/piano/pozzo) non è raggiungibile');
else console.log('  ✔ tutte e tre le piste (cantina, piano proibito, pozzo) raggiungibili');

/* ---------- 2. scelte e requisiti ---------- */
section('Scelte, oggetti e flag');

const knownFlags = new Set();
for (const scene of Object.values(CAMPAIGN)) {
  if (scene.sets) Object.keys(scene.sets).forEach(f => knownFlags.add(f));
  for (const c of scene.choices || []) if (c.sets) Object.keys(c.sets).forEach(f => knownFlags.add(f));
}
let flagProblems = 0;
for (const [id, scene] of Object.entries(CAMPAIGN)) {
  for (const c of scene.choices || []) {
    if (c.requires?.flag && !knownFlags.has(c.requires.flag)) { fail(`scena "${id}": richiede flag mai impostato "${c.requires.flag}"`); flagProblems++; }
    for (const itemRef of [c.item, c.removeItem, c.requires?.item]) {
      if (itemRef && !ITEMS[itemRef]) { fail(`scena "${id}": oggetto inesistente "${itemRef}"`); flagProblems++; }
    }
    if (c.check && !['FOR','DES','COS','INT','SAG','CAR'].includes(c.check.stat)) { fail(`scena "${id}": statistica invalida "${c.check.stat}"`); flagProblems++; }
    if (c.check && (c.check.dc < 5 || c.check.dc > 20)) warn(`scena "${id}": CD insolita ${c.check.dc}`);
  }
  for (const itemRef of [scene.item, scene.item2, scene.onEnterOnce?.itemEach]) {
    if (itemRef && !ITEMS[itemRef]) { fail(`scena "${id}": oggetto inesistente "${itemRef}"`); flagProblems++; }
  }
}
if (!flagProblems) { ok(); console.log(`  ✔ tutti i flag (${knownFlags.size}) e gli oggetti referenziati esistono`); }

// oggetti chiave ottenibili prima di dove servono (controllo statico di percorso)
const keyItems = ['acqua_pozzo', 'sale_grosso', 'antidoto'];
for (const it of keyItems) {
  const given = Object.values(CAMPAIGN).some(s => s.item === it || s.item2 === it || (s.choices || []).some(c => c.item === it) || (s.combat?.loot?.items || []).includes(it));
  if (!given) fail(`oggetto chiave "${it}" non viene mai dato al giocatore`);
}
console.log('  ✔ oggetti chiave ottenibili');

/* ---------- 3. combattimenti ---------- */
section('Combattimenti');

let combatProblems = 0;
const combats = Object.entries(CAMPAIGN).filter(([, s]) => s.combat);
for (const [id, scene] of combats) {
  for (const e of scene.combat.enemies) {
    if (!BESTIARY[e]) { fail(`combattimento "${id}": nemico inesistente "${e}"`); combatProblems++; }
  }
  if (!scene.combat.victory || !scene.combat.defeat) { fail(`combattimento "${id}": manca victory/defeat`); combatProblems++; }
  for (const it of scene.combat.loot?.items || []) {
    if (!ITEMS[it]) { fail(`combattimento "${id}": loot inesistente "${it}"`); combatProblems++; }
  }
}
if (!combatProblems) { ok(); console.log(`  ✔ ${combats.length} combattimenti validi (nemici, esiti, loot)`); }

// le sconfitte non-boss portano a sconfitta_generica che deve poter tornare al combattimento
const defeats = new Set(combats.map(([, s]) => s.combat.defeat));
for (const d of defeats) {
  if (!CAMPAIGN[d]) fail(`scena di sconfitta "${d}" inesistente`);
}
console.log(`  ✔ scene di sconfitta esistenti: ${[...defeats].join(', ')}`);

/* ---------- 4. personaggi e bestiario ---------- */
section('Personaggi e bestiario');

let charProblems = 0;
if (HEROES.length !== 5) fail(`attesi 5 protagonisti, trovati ${HEROES.length}`);
for (const h of HEROES) {
  for (const k of ['id','name','class','tagline','role','stats','maxHp','ac','attack','abilities','passive','backstory','voice','sprite']) {
    if (h[k] === undefined) { fail(`eroe "${h.id}": campo mancante "${k}"`); charProblems++; }
  }
  if (!Sprites.registry[h.sprite]) { fail(`eroe "${h.id}": sprite mancante "${h.sprite}"`); charProblems++; }
  for (const s of ['FOR','DES','COS','INT','SAG','CAR']) {
    if (typeof h.stats[s] !== 'number') { fail(`eroe "${h.id}": stat mancante ${s}`); charProblems++; }
  }
  if (h.abilities.length < 2) { fail(`eroe "${h.id}": meno di 2 abilità`); charProblems++; }
  for (const ab of h.abilities) {
    if (!ab.id || !ab.name || !ab.uses || !ab.type || !ab.desc) { fail(`eroe "${h.id}": abilità incompleta "${ab.id}"`); charProblems++; }
  }
  if (h.backstory.length < 200) warn(`eroe "${h.id}": backstory corta (${h.backstory.length} caratteri)`);
}
for (const [key, b] of Object.entries(BESTIARY)) {
  if (!Sprites.registry[b.sprite]) { fail(`nemico "${key}": sprite mancante "${b.sprite}"`); charProblems++; }
  if (!b.attack || !b.attack.dice || b.attack.bonus === undefined) { fail(`nemico "${key}": attacco malformato`); charProblems++; }
}
if (!charProblems) { ok(); console.log(`  ✔ 5 protagonisti completi (stats, abilità, backstory, sprite) e ${Object.keys(BESTIARY).length} nemici validi`); }

/* ---------- 5. sprite ---------- */
section('Sprite pixel-art');

let spriteProblems = 0;
for (const [name, def] of Object.entries(Sprites.registry)) {
  const n = def.map.length;
  if (n !== 16 && n !== 32) { fail(`sprite "${name}": ${n} righe (attese 16 o 32)`); spriteProblems++; }
  def.map.forEach((row, i) => {
    if (row.length !== n) { fail(`sprite "${name}" riga ${i}: ${row.length} colonne (attese ${n}, mappa quadrata)`); spriteProblems++; }
    for (const ch of row) {
      if (ch !== '.' && !def.palette[ch]) { fail(`sprite "${name}" riga ${i}: carattere "${ch}" non in palette`); spriteProblems++; }
    }
  });
  const solid = def.map.join('').split('').filter(c => c !== '.').length;
  if (solid < (n === 32 ? 160 : 40)) warn(`sprite "${name}": molto vuoto (${solid} pixel)`);
}
if (!spriteProblems) { ok(); console.log(`  ✔ ${Object.keys(Sprites.registry).length} sprite ben formati (16x16 o 32x32, palette coerenti)`); }

/* ---------- 6. mappa del mondo ---------- */
section('Mappa del mondo');

const mapped = new Set(WORLD_MAP.flatMap(l => l.scenes));
let unmapped = [...sceneIds].filter(id => !mapped.has(id) && id !== 'sconfitta_generica');
if (unmapped.length) unmapped.forEach(id => warn(`scena "${id}" senza luogo sulla mappa (userà fallback)`));
const mapGhost = [...mapped].filter(id => !sceneIds.has(id));
if (mapGhost.length) mapGhost.forEach(id => fail(`la mappa cita una scena inesistente "${id}"`));
else { ok(); console.log(`  ✔ mappa coerente: ${WORLD_MAP.length} luoghi, nessun riferimento fantasma`); }

/* ---------- 7. logica dei dadi ---------- */
section('Logica dei dadi (statistica)');

function roll(sides) { return 1 + Math.floor(Math.random() * sides); }
const N = 100000;
let sum = 0, min = 99, max = 0;
for (let i = 0; i < N; i++) { const r = roll(20); sum += r; min = Math.min(min, r); max = Math.max(max, r); }
const avg = sum / N;
if (min !== 1 || max !== 20) fail(`d20 fuori range: min=${min} max=${max}`);
else if (Math.abs(avg - 10.5) > 0.15) fail(`d20 media anomala: ${avg.toFixed(3)}`);
else { ok(); console.log(`  ✔ d20 uniforme su ${N} tiri (media ${avg.toFixed(2)}, range ${min}-${max})`); }

/* ---------- 8. bilanciamento (simulazione grezza) ---------- */
section('Bilanciamento (stime statistiche)');

function heroDPR(h) { // danno medio per round con attacco base
  const [n, s] = h.attack.dice;
  const statMod = h.stats[h.attack.stat] + (h.id === 'lyra' && h.attack.stat === 'INT' ? 2 : 0);
  const hitChance = Math.min(0.95, Math.max(0.05, (21 - (13 - (statMod + 2))) / 20)); // vs CA 13 media
  const avgDmg = n * (s + 1) / 2 + statMod + (h.attack.bonus || 0);
  return hitChance * avgDmg;
}
function enemyDPR(e) {
  const [n, s] = e.attack.dice;
  const hitChance = Math.min(0.95, Math.max(0.05, (21 - (14 - e.attack.bonus)) / 20)); // vs CA 14 media
  return hitChance * (n * (s + 1) / 2 + e.attack.plus);
}

// party minimo (2 eroi più deboli in danno) contro ogni combattimento
const dprs = HEROES.map(h => ({ id: h.id, dpr: heroDPR(h), hp: h.maxHp })).sort((a, b) => a.dpr - b.dpr);
const weakDuo = dprs.slice(0, 2);
const duoDPR = weakDuo.reduce((t, x) => t + x.dpr, 0) * 1.5; // ~x1.5 per abilità speciali
const duoHP = weakDuo.reduce((t, x) => t + x.hp, 0) + 20;    // + pozioni/cure

for (const [id, scene] of combats) {
  const totalEhp = scene.combat.enemies.reduce((t, e) => t + BESTIARY[e].maxHp, 0);
  const totalEdpr = scene.combat.enemies.reduce((t, e) => t + enemyDPR(BESTIARY[e]), 0);
  const roundsToWin = totalEhp / duoDPR;
  const roundsToLose = duoHP / totalEdpr;
  const margin = roundsToLose / roundsToWin;
  if (margin < 0.9) warn(`combattimento "${id}" molto duro per 2 giocatori (margine ${margin.toFixed(2)}): ok se boss`);
  else ok();
}
console.log('  ✔ stima di bilanciamento per party di 2 completata (vedi eventuali warn)');

const boss = BESTIARY.gregorio;
const fullParty = dprs.reduce((t, x) => t + x.dpr, 0) * 1.4;
console.log(`  ℹ boss fight: HP boss+fase2 = ${boss.maxHp + BESTIARY.gregorio_fame.maxHp}, DPR party completo ≈ ${fullParty.toFixed(1)} → ~${Math.ceil((boss.maxHp + BESTIARY.gregorio_fame.maxHp) / fullParty)} round`);

/* ---------- 9. testi ---------- */
section('Qualità dei testi');

let shortScenes = 0;
for (const [id, scene] of Object.entries(CAMPAIGN)) {
  if (!scene.text || scene.text.length < 80) { warn(`scena "${id}": testo molto corto`); shortScenes++; }
  if (!scene.caption) warn(`scena "${id}": manca la caption`);
  if (!scene.location) fail(`scena "${id}": manca la location`);
}
const totalChars = Object.values(CAMPAIGN).reduce((t, s) => t + (s.text || '').length, 0);
const words = Math.round(totalChars / 6);
console.log(`  ✔ ${Object.keys(CAMPAIGN).length} scene, ~${words} parole di narrazione (~${Math.round(words / 180)} min di sola lettura ad alta voce)`);
if (words < 6000) warn('campagna forse corta per 2-4 ore');




/* ---------- capitoli di "Rivivi la Notte": scene e oggetti devono esistere ---------- */
section('Capitoli di Rivivi la Notte');

let capitoliRotti = 0;
for (const c of CHAPTERS) {
  const dest = c.scene || c.id;
  if (!CAMPAIGN[dest]) { fail(`capitolo "${c.label}": la scena di destinazione "${dest}" non esiste`); capitoliRotti++; }
  for (const it of (c.items || [])) {
    if (!ITEMS[it]) { fail(`capitolo "${c.label}": l'oggetto preparato "${it}" non esiste in ITEMS`); capitoliRotti++; }
  }
  if (!c.label || !c.desc) { fail(`capitolo "${dest}": manca label o desc`); capitoliRotti++; }
}
if (!capitoliRotti) { ok(); console.log(`  ✔ ${CHAPTERS.length} capitoli, tutte le destinazioni e gli zaini preparati esistono`); }

/* ---------- stinger dichiarati dalle scene: devono esistere in sound.js ---------- */
section('Stinger delle scene (nessun suono fantasma)');

const soundSrc = readFileSync(join(root, 'js/sound.js'), 'utf8');
const effectsBlock = soundSrc.slice(soundSrc.indexOf('const effects = {'), soundSrc.indexOf('function play('));
const effectNames = new Set([...effectsBlock.matchAll(/^\s{4}([a-z_0-9]+)\(\)/gm)].map(m => m[1]));
let stingerMorti = 0;
for (const [id, scene] of Object.entries(CAMPAIGN)) {
  if (scene.stinger && !effectNames.has(scene.stinger)) {
    fail(`scena "${id}": stinger "${scene.stinger}" non esiste in sound.js (suono fantasma silenzioso)`);
    stingerMorti++;
  }
}
const conStinger = Object.values(CAMPAIGN).filter(sc => sc.stinger).length;
if (!stingerMorti) { ok(); console.log(`  ✔ ${conStinger} scene con stinger, tutti esistenti in sound.js (${effectNames.size} effetti nel catalogo)`); }

/* ---------- flag morti: imprese/cronache/diario devono poter scattare ---------- */
section('Flag di imprese, cronache e diario (nessun flag morto)');

const epiSrc = readFileSync(join(root, 'js/epilogues.js'), 'utf8');
const campSrc = readFileSync(join(root, 'js/campaign.js'), 'utf8');
const setsBlocks = [...campSrc.matchAll(/sets:\s*{([^}]*)}/g)].map(m => m[1]).join(' ');
const settableFlags = new Set([...setsBlocks.matchAll(/([a-z_0-9]+)\s*:/g)].map(m => m[1]));
// flag impostati fuori dalle scene (motore/combattimento) — da tenere aggiornata a mano
const FLAG_ESTERNI = new Set(['rituale_fatto', 'sorpresa', 'stufato_consumato', 'reputazione']);
const flagRichiesti = new Set([
  ...[...epiSrc.matchAll(/flag:\s*'([a-z_0-9]+)'/g)].map(m => m[1]),
  ...[...campSrc.matchAll(/^\s*\['([a-z_0-9]+)',/gm)].map(m => m[1]), // DIARY_FLAGS
]);
let flagMorti = 0;
for (const f of flagRichiesti) {
  if (!settableFlags.has(f) && !FLAG_ESTERNI.has(f)) { fail(`flag "${f}" richiesto da imprese/cronache/diario ma MAI impostato da nessuna scena`); flagMorti++; }
}
if (!flagMorti) { ok(); console.log(`  ✔ ${flagRichiesti.size} flag di imprese/cronache/diario, tutti impostabili da almeno una scena`); }

// direzione inversa: flag impostati dalle scene ma senza NESSUN consumatore di gioco
// (né requires, né combat, né diario/imprese/cronache) — debito narrativo, non errore
const engineSrc2 = readFileSync(join(root, 'js/engine.js'), 'utf8') + readFileSync(join(root, 'js/combat.js'), 'utf8');
const consumatori = campSrc + engineSrc2 + epiSrc;
const senzaConsumatore = [...settableFlags].filter(f => {
  const inSets = (setsBlocks.match(new RegExp('\\b' + f + '\\b', 'g')) || []).length;
  const totale = (consumatori.match(new RegExp('\\b' + f + '\\b', 'g')) || []).length;
  return totale <= inSets;
});
if (senzaConsumatore.length) warn(`${senzaConsumatore.length} flag impostati ma senza consumatore di gioco (debito narrativo): ${senzaConsumatore.slice(0, 8).join(', ')}${senzaConsumatore.length > 8 ? ', …' : ''}`);


/* ---------- prove ripetibili: check senza once nelle scene rivisitabili ---------- */
section('Prove nei luoghi rivisitabili (nessuna prova ripetibile)');

const bersagliRitorno = new Set([...campSrc.matchAll(/text: ["']↩[^"']*["'][^\n]*?next: '([a-z_0-9]+)'/g)].map(m => m[1]));
let proveRipetibili = 0;
for (const sid of bersagliRitorno) {
  const m = campSrc.match(new RegExp('^  ' + sid + ': \\{', 'm'));
  if (!m) continue;
  const blocco = campSrc.slice(m.index, campSrc.indexOf('\n  },', m.index));
  for (const c of blocco.matchAll(/\{ text: '([^']{0,60})'[^\n]*?check: \{[^}]*\}[^\n]*\}/g)) {
    if (!c[0].includes('once')) { fail(`scena rivisitabile "${sid}": la prova "${c[1]}" è ripetibile (manca once)`); proveRipetibili++; }
  }
}
if (!proveRipetibili) { ok(); console.log(`  ✔ ${bersagliRitorno.size} scene rivisitabili, nessuna prova ripetibile`); }


/* ---------- se cadete tutti: ripartenza dal checkpoint (ago 2026) ----------
   Il motore promette due cose: (1) ogni sconfitta finisce in una scena che
   RIMETTE IN PIEDI il gruppo, (2) dalla seconda caduta nello stesso scontro
   compare la scelta di tornare all'ultimo checkpoint. Se una delle due non è
   implementata, la promessa è una bugia: qui si verifica staticamente. */
section('Ripartenza dal checkpoint (se cadete tutti)');

const engineTxt = readFileSync(join(root, 'js/engine.js'), 'utf8');
const combatTxt = readFileSync(join(root, 'js/combat.js'), 'utf8');
let cpProblemi = 0;

// 1. ogni destinazione di sconfitta esiste ed è una scena di recupero (fullHeal)
const destSconfitta = new Set(Object.values(CAMPAIGN).filter(s => s.combat && s.combat.defeat).map(s => s.combat.defeat));
for (const d of destSconfitta) {
  if (!CAMPAIGN[d]) { fail(`scena di sconfitta "${d}" inesistente`); cpProblemi++; continue; }
  if (!CAMPAIGN[d].fullHeal) {
    fail(`scena di sconfitta "${d}" non rimette in piedi il gruppo (manca fullHeal: true): il gruppo resterebbe a terra`);
    cpProblemi++;
  }
}

// 2. il motore implementa DAVVERO la ripartenza e la espone
for (const [frammento, cosa] of [
  ['function riprendiDaCheckpoint', 'la funzione riprendiDaCheckpoint()'],
  ['lastCheckpoint', 'lo snapshot G.lastCheckpoint'],
  ['function registraCaduta', 'il contatore delle cadute registraCaduta()'],
  ['btn-checkpoint-return', 'la SCELTA visibile di ritorno al checkpoint nelle scene di sconfitta'],
  ['riprendiDaCheckpoint, registraCaduta, haCheckpoint', 'l\'export di riprendiDaCheckpoint/registraCaduta/haCheckpoint'],
]) {
  if (!engineTxt.includes(frammento)) { fail(`js/engine.js: manca ${cosa}`); cpProblemi++; }
}
if (!combatTxt.includes('Engine.registraCaduta')) { fail('js/combat.js: defeat() non registra la caduta (Engine.registraCaduta)'); cpProblemi++; }

// 3. lo snapshot deve riavvolgere anche le scene VISITATE, o i flag one-shot si perdono
if (!/enteredScenes:\s*G\.enteredScenes/.test(engineTxt)) {
  fail('js/engine.js: lo snapshot del checkpoint non salva enteredScenes → i flag one-shot delle scene già viste non si rimetterebbero mai (soft-lock)');
  cpProblemi++;
}

// 4. i flag di CHECKPOINT_FLAGS devono essere impostabili da una scena RAGGIUNGIBILE
const cpFlags = (readFileSync(join(root, 'js/campaign.js'), 'utf8').match(/const CHECKPOINT_FLAGS\s*=\s*\[([^\]]*)\]/) || [])[1];
if (cpFlags) {
  const lista = [...cpFlags.matchAll(/'([a-z_0-9]+)'/g)].map(m => m[1]);
  for (const f of lista) {
    const sorgenti = Object.entries(CAMPAIGN).filter(([, s]) => s.sets && s.sets[f]).map(([id]) => id);
    if (!sorgenti.length) { fail(`CHECKPOINT_FLAGS: "${f}" non è impostato da NESSUNA scena (checkpoint morto)`); cpProblemi++; }
    else if (!sorgenti.some(id => reachable.has(id))) { fail(`CHECKPOINT_FLAGS: "${f}" è impostato solo da scene irraggiungibili`); cpProblemi++; }
  }
  console.log(`  ✔ ${lista.length} checkpoint (CHECKPOINT_FLAGS), tutti impostabili da scene raggiungibili`);
} else {
  console.log('  ℹ nessun CHECKPOINT_FLAGS: il punto di ripartenza è l\'ultima scena di riposo (fullHeal/recharge) visitata');
}

if (!cpProblemi) { ok(); console.log(`  ✔ ${destSconfitta.size} scene di sconfitta valide (tutte rimettono in piedi il gruppo) e ripartenza dal checkpoint implementata ed esposta`); }

/* ---------- il Sangue Freddo deve FARE qualcosa (ago 2026) ----------
   Feedback del committente: «non mi convince questa valuta, alla fine non è
   davvero utilizzata, non fa nulla». Adesso compra il SECONDO TENTATIVO: qui si
   verifica (a) che il motore lo implementi e lo esponga davvero, (b) che i testi
   in gioco lo raccontino, (c) che l'economia non sia di nuovo inflazionata —
   una risorsa che si satura è peggio di nessuna risorsa (LESSONS-LEARNED #15). */
section('🕯 Il Sangue Freddo: secondo tentativo e sanità dell\'economia');

const rulesTxt = readFileSync(join(root, 'js/rules.js'), 'utf8');
let freddoProblemi = 0;

for (const [frammento, cosa] of [
  ['const RITIRO_COSTI', 'la tabella dei costi RITIRO_COSTI'],
  ['function costoRitiro', 'costoRitiro(n)'],
  ['function costoRitiroOra', 'costoRitiroOra(ctx)'],
  ['function puoiRitirare', 'puoiRitirare(ctx)'],
  ['function spendiRitiro', 'spendiRitiro(ctx)'],
  ['function ritiriDisponibili', 'ritiriDisponibili(ctx)'],
  ['costoRitiro, costoRitiroOra, puoiRitirare, spendiRitiro, ritiriDisponibili', 'l\'export dell\'API dei ritiri'],
  ['btn-freddo-yes', 'il bottone del ritiro nella modale delle prove di scena'],
  ['G.stats.goldEarned', 'il contatore G.stats.goldEarned (misura del raccolto)'],
  ['ritiri: { ctx: null, n: 0 }', 'il contatore G.ritiri inizializzato in newGame'],
  ['secondo tentativo', 'la spiegazione nella HUD dello zaino'],
]) {
  if (!engineTxt.includes(frammento)) { fail(`js/engine.js: manca ${cosa}`); freddoProblemi++; }
}
for (const [frammento, cosa] of [
  ['btn-freddo-combat', 'il bottone del ritiro dentro #combat-actions'],
  ['Engine.puoiRitirare', 'il controllo del saldo prima di offrire il ritiro'],
  ['Engine.spendiRitiro', 'la spesa della valuta PRIMA del ritiro'],
  ['Engine.muoviFreddo', 'il bottino di combattimento contato in goldEarned'],
]) {
  if (!combatTxt.includes(frammento)) { fail(`js/combat.js: manca ${cosa}`); freddoProblemi++; }
}
// se il testo promette una meccanica, deve esistere (LESSON #10): e viceversa
if (!/secondo tentativo/i.test(rulesTxt)) { fail('js/rules.js: le regole in gioco non spiegano che il Sangue Freddo compra il secondo tentativo'); freddoProblemi++; }
if (!/\b2\b[^.]{0,40}\b3\b[^.]{0,20}\b5\b[^.]{0,20}\b8\b/.test(rulesTxt.replace(/<[^>]+>/g, ''))) { fail('js/rules.js: le regole non dichiarano la scala dei costi (2, 3, 5, 8)'); freddoProblemi++; }
if (/vi servono \d+ monete|monete d'oro/.test(engineTxt + combatTxt)) { fail('la valuta del Relais è il Sangue Freddo, non le monete: un testo del motore parla ancora di monete'); freddoProblemi++; }

// economia: quanto Sangue Freddo esiste in TUTTA la campagna, e quanto se ne spende
let dato = 0, occasioniDare = 0, toltoScene = 0, occasioniSpendere = 0, spesaMax = 0, chiaviZero = 0;
for (const scene of Object.values(CAMPAIGN)) {
  if (scene.gold > 0) { dato += scene.gold; occasioniDare++; }
  if (scene.gold < 0) toltoScene += -scene.gold;
  if (scene.gold === 0) chiaviZero++;
  if (scene.goldLoss) toltoScene += scene.goldLoss;
  if (scene.combat?.loot?.gold) { dato += scene.combat.loot.gold; occasioniDare++; }
  for (const c of scene.choices || []) {
    if (c.gold > 0) { dato += c.gold; occasioniDare++; }
    if (c.gold === 0) chiaviZero++;
    if (c.requiresGold) { occasioniSpendere++; spesaMax = Math.max(spesaMax, c.requiresGold); }
    if (c.goldLoss) toltoScene += c.goldLoss;
  }
}
if (chiaviZero) { fail(`${chiaviZero} chiavi "gold: 0" nella campagna: una chiave che non fa niente è una bugia, va rimossa`); freddoProblemi++; }
/* Il tetto sul GRAFO è solo un indicatore: la misura vera è il raccolto MEDIANO per
   partita, che il playthrough calcola davvero e tiene fra 12 e 34. L'assunzione «una
   partita ne vede il 40%» era sbagliata di un fattore tre — la percorrenza reale di
   una notte è più vicina al 10-15% — e tenendo il tetto a 110 il raccolto mediano
   crollava a 5, cioè due ritiri in tutta la notte. Quando una misura diretta e una
   per procura litigano, vince quella diretta. */
const TETTO_CAMPAGNA = 200;
console.log(`  ℹ economia: 🕯 ${dato} disponibili in ${occasioniDare} occasioni su tutta la campagna, ${toltoScene} sottratti dalle scene, ${occasioniSpendere} scelte a pagamento (la più cara: ${spesaMax})`);
console.log(`  ℹ i ritiri costano 2/3/5/8 (+3 oltre il quarto): il motore è il vero pozzo della valuta, quindi il rapporto dare/spendere non si legge più dalle sole requiresGold`);
if (dato > TETTO_CAMPAGNA) {
  fail(`inflazione: ${dato} di Sangue Freddo disponibili in campagna (tetto ${TETTO_CAMPAGNA}). Il tetto si satura e il numero smette di significare qualcosa`);
  freddoProblemi++;
}
if (spesaMax > 8) { warn(`la scelta a pagamento più cara chiede ${spesaMax}: verificare che sia raggiungibile con un raccolto di 15-30`); }
if (!freddoProblemi) { ok(); console.log('  ✔ secondo tentativo implementato, esposto, spiegato nelle regole e nella HUD; economia entro il tetto'); }


/* ---------- densità: la metrica GIUSTA ---------- */
section('Densità (nodi di decisione, non scene)');

/* Storia di questa sezione: la soglia della serie era "corridoi ≤15%", dove corridoio
   = scena con una sola scelta. Misurandola sui cinque giochi è venuto fuori che
   Casa stava al 27% e Relais al 20% — ma leggendo le scene, quasi tutte erano BATTUTE:
   sotto-scene che chiudono un momento, cioè buona scrittura. Inseguire quel numero
   porta ad aggiungere seconde scelte finte, che è esattamente il difetto peggiore
   della serie. Quindi la metrica è cambiata, e misura due cose che contano davvero:

   1. SCELTE PER NODO DI DECISIONE: la media sulle sole scene con ≥2 scelte. È quanto
      è ricca una decisione quando il gioco te ne offre una. Soglia: ≥2.2.
   2. CORRIDOI STERILI: scene con una sola scelta E nessun effetto (niente item, sets,
      check, cure, danni, valuta, combat, minigioco, finale). Quelle sì sono
      riempitivo. Soglia: 0, o pochissime e giustificate.

   Il numero grezzo di corridoi resta stampato, ma come informazione, non come voto. */
{
  const idsTot = Object.keys(CAMPAIGN);
  const CAMBIA_SCENA = ['item', 'item2', 'sets', 'heal', 'damage', 'gold', 'goldLoss',
    'fullHeal', 'recharge', 'attenzione', 'unlockHero', 'freeAll', 'reviveAll',
    'killRoller', 'poisonRoller', 'captureRoller'];
  const CAMBIA_SCELTA = ['item', 'item2', 'sets', 'check', 'heal', 'damage', 'gold',
    'goldLoss', 'removeItem', 'removeItem2', 'sacrifice', 'requiresGold'];
  let scelteTot = 0, nodi = 0, scelteNodi = 0, corridoi = 0;
  const sterili = [];
  for (const [id, s] of Object.entries(CAMPAIGN)) {
    const ch = s.choices || [];
    scelteTot += ch.length;
    if (ch.length >= 2) { nodi++; scelteNodi += ch.length; continue; }
    if (ch.length !== 1) continue;
    corridoi++;
    const cambiaScena = CAMBIA_SCENA.some(k => s[k] !== undefined && s[k] !== false && s[k] !== 0);
    const c = ch[0] || {};
    const cambiaScelta = CAMBIA_SCELTA.some(k => c[k] !== undefined && c[k] !== false && c[k] !== 0);
    if (!cambiaScena && !cambiaScelta && !s.combat && !s.minigame && !s.ending) sterili.push(id);
  }
  const perNodo = nodi ? scelteNodi / nodi : 0;
  console.log(`  ℹ ${idsTot.length} scene · ${nodi} nodi di decisione (${Math.round(nodi / idsTot.length * 100)}%) · ${corridoi} scene-battuta con una sola uscita`);
  console.log(`  ℹ scelte per scena: ${(scelteTot / idsTot.length).toFixed(2)} (numero diluito dalle battute) · scelte per NODO: ${perNodo.toFixed(2)}`);
  if (perNodo < 2.2) fail(`solo ${perNodo.toFixed(2)} scelte per nodo di decisione: quando il gioco offre una scelta, deve offrirne almeno 2,2 in media`);
  else ok();
  if (sterili.length) {
    for (const id of sterili) warn(`corridoio STERILE "${id}": una sola uscita e nessun effetto — o gli si dà un effetto, o gli si dà una seconda azione vera, o si fonde con la scena accanto`);
    if (sterili.length > Math.max(3, Math.round(idsTot.length * 0.02))) {
      fail(`${sterili.length} corridoi sterili su ${idsTot.length} scene: è riempitivo, non ritmo`);
    }
  } else { ok(); console.log('  ✔ nessun corridoio sterile: ogni scena con una sola uscita cambia comunque qualcosa'); }
}

/* ---------- 44. testo dentro un canvas ----------
   Un canvas da 960 px mostrato a 355 rende ogni parola scritta dentro un impasto: il
   testo va in DOM, nel canvas restano numeri, icone e barre. Il controllo cerca ogni
   ctx.font sotto i 20px e guarda cosa ci si disegna: una stringa fissa (un'emoji, un
   simbolo) va bene, una stringa CALCOLATA — un nome, un'etichetta — è un errore. */
function testTestoNelCanvas() {
  console.log('\n▸ Testo dentro i canvas');
  /* Solo i canvas a misura FISSA: quelli di index.html (combattimento 960×380, pianta
     720×480) vengono mostrati a un terzo della loro larghezza e tutto dentro rimpicciolisce.
     js/minigames.js è escluso di proposito: là il canvas si dimensiona sulla finestra
     (`Math.min(720, document.body.clientWidth - 60)`), quindi è 1:1 e 12px resta 12px. */
  const files = ['js/combat.js', 'js/engine.js'];
  let sospetti = 0;
  for (const f of files) {
    let src;
    try { src = readFileSync(new URL('../' + f, import.meta.url), 'utf8'); } catch { continue; }
    const righe = src.split('\n');
    righe.forEach((r, i) => {
      const m = r.match(/ctx\.font\s*=\s*["'`](\d+)px/);
      if (!m || Number(m[1]) >= 20) return;
      const seguito = righe.slice(i, i + 3).join(' ');
      const dis = seguito.match(/ctx\.fillText\(\s*([^,]+),/);
      if (!dis) return;
      const arg = dis[1].trim();
      const parola = /\.(name|label|short|titolo|nome|testo|caption)\b/.test(arg);
      if (parola) {
        fail(`${f}:${i + 1} disegna un NOME a ${m[1]}px dentro un canvas a misura fissa (${arg.slice(0, 40)}): `
           + 'il canvas si rimpicciolisce sul telefono e la parola diventa illeggibile — va in DOM');
        sospetti++;
      }
    });
  }
  if (!sospetti) { ok(); console.log('  ✔ nel canvas solo numeri, icone e simboli: le parole stanno in DOM'); }
}
testTestoNelCanvas();

/* ---------- esito ---------- */

/* ---------- un boss non deve essere invincibile per costruzione ---------- */
section('Bilanciamento: nessuno uccide più veloce di quanto muoia');

/* Il numero che rende un nemico invincibile è il DANNO, non i punti vita: se
   uccide l'eroe più fragile in due colpi e ne servono otto per abbatterlo, la
   partita non si può vincere — e nei test il sintomo è un «loop di checkpoint»,
   cioè sembra un problema di struttura e non di numeri. (Lezione 27.) */
{
  const pvMin = Math.min(...HEROES.map(h => h.maxHp));
  let squilibrati = 0;
  for (const [key, b] of Object.entries(BESTIARY)) {
    if (!b.attack || !b.attack.dice) continue;
    const [n, facce] = b.attack.dice;
    const danno = n * (facce + 1) / 2 + (b.attack.plus || 0);
    const colpi = Math.ceil(pvMin / danno);
    if (colpi < 3) {
      const msg = `nemico "${key}": ${danno.toFixed(1)} danni medi uccidono l'eroe più fragile (${pvMin} PV) in ${colpi} colpi`;
      if (b.boss || b.isBoss) { fail(msg + ' — e è un BOSS, quindi ci vogliono molti turni per abbatterlo: invincibile per costruzione'); squilibrati++; }
      else warn(msg);
    }
  }
  /* e i gruppi: due nemici da 6 danni sono 12 al round */
  for (const [id, scene] of combats) {
    const vivi = (scene.combat.enemies || []).filter(e => BESTIARY[e]);
    if (vivi.length < 2) continue;
    const dprTot = vivi.reduce((t, e) => {
      const b = BESTIARY[e], [n, facce] = b.attack.dice;
      return t + n * (facce + 1) / 2 + (b.attack.plus || 0);
    }, 0);
    if (dprTot > pvMin / 2) warn(`combattimento "${id}": ${vivi.length} nemici per ${dprTot.toFixed(1)} danni potenziali al round contro ${pvMin} PV — un eroe cade in ${Math.ceil(pvMin / dprTot)} round`);
  }
  if (!squilibrati) { ok(); console.log(`  ✔ nessun boss uccide l'eroe più fragile in meno di 3 colpi (il più fragile ha ${pvMin} PV)`); }
}

console.log('\n' + '═'.repeat(50));
if (failures === 0) {
  console.log(`✅ TUTTI I TEST SUPERATI (${passed} controlli, ${warnings} avvisi non bloccanti)`);
  process.exit(0);
} else {
  console.log(`❌ ${failures} TEST FALLITI (${warnings} avvisi)`);
  process.exit(1);
}
