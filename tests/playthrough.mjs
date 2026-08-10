/* ============ PLAYTHROUGH — simulazioni complete headless (no browser) ============
   Uso: node tests/playthrough.mjs

   Basato sull'harness collaudato di dnd-corona-di-mezzanotte/tests/playthrough.mjs:
   carica engine.js, combat.js, dice.js (+ dati) in un vm.Context Node con uno stub
   minimale di document/localStorage/timer, e gioca partite complete cliccando
   programmaticamente i bottoni generati dal gioco (choices, azioni di combattimento,
   overlay dei dadi, selezione eroe per le prove), esattamente come farebbe un utente.

   Obiettivo: scovare bug di RUNTIME (eccezioni, scene mancanti, loop infiniti,
   stato incoerente) che i controlli statici di validate.mjs non possono vedere,
   perché richiedono di ESEGUIRE la logica di gioco (combattimenti, prove, salvataggi). */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import vm from 'vm';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

// Ordine di caricamento IDENTICO a index.html (main.js escluso: qui non serve la UI del titolo).
const FILES = [
  'js/sound.js', 'js/sprites.js', 'js/scenes.js', 'js/characters.js', 'js/campaign.js',
  'js/epilogues.js', 'js/rules.js', 'js/dice.js', 'js/combat.js', 'js/engine.js',
];
const SOURCES = FILES.map(f => ({ name: f, code: readFileSync(join(root, f), 'utf8') }));

let failures = 0;
function fail(msg) { failures++; console.error('  ❌ FAIL:', msg); }
function section(name) { console.log('\n▶', name); }

/* ==================== RNG SEEDABILE ==================== */

function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ==================== DOM FINTO MINIMALE ==================== */

function makeFakeCtx(canvasEl) {
  const store = { canvas: canvasEl };
  const noop = () => {};
  return new Proxy(store, {
    get(target, prop) {
      if (prop in target) return target[prop];
      if (prop === 'measureText') return () => ({ width: 8 });
      if (prop === 'createLinearGradient' || prop === 'createRadialGradient') {
        return () => ({ addColorStop: noop });
      }
      return noop;
    },
    set(target, prop, value) { target[prop] = value; return true; },
  });
}

class FakeElement {
  constructor(tag = 'div') {
    this.tagName = String(tag).toUpperCase();
    this._id = '';
    this._className = '';
    this.children = [];
    this.parentNode = null;
    this.style = {};
    this.dataset = {};
    this._innerHTML = '';
    this._textContent = '';
    this.disabled = false;
    this.value = '';
    this.onclick = null;
    this.oninput = null;
    this.width = 300;
    this.height = 150;
    this.clientWidth = 300;
    this.clientHeight = 150;
    this._ctx = null;
    this.scrollTop = 0;
    this.scrollHeight = 0;
    this._listeners = {};
  }
  get id() { return this._id; }
  set id(v) { this._id = v; }
  get className() { return this._className; }
  set className(v) { this._className = String(v); }
  get classList() {
    const self = this;
    const toks = () => self._className.split(/\s+/).filter(Boolean);
    return {
      add: (...cls) => { const s = new Set(toks()); cls.forEach(c => s.add(c)); self._className = [...s].join(' '); },
      remove: (...cls) => { const s = new Set(toks()); cls.forEach(c => s.delete(c)); self._className = [...s].join(' '); },
      contains: (c) => toks().includes(c),
      toggle: (c) => { if (toks().includes(c)) self.classList.remove(c); else self.classList.add(c); },
    };
  }
  get innerHTML() { return this._innerHTML; }
  set innerHTML(v) { this._innerHTML = v; this.children = []; }
  get textContent() { return this._textContent; }
  set textContent(v) { this._textContent = String(v); }
  // Alias tollerante: alcuni punti del gioco leggono .parentElement (standard DOM) invece
  // di .parentNode. Se non è mai stato collegato a nulla (es. i canvas, che nello stub non
  // vengono mai "appendChild-ati" da nessuna parte), si auto-crea un contenitore fittizio.
  get parentElement() {
    if (!this.parentNode) this.parentNode = new FakeElement('div');
    return this.parentNode;
  }
  set parentElement(v) { this.parentNode = v; }
  appendChild(child) { this.children.push(child); child.parentNode = this; return child; }
  removeChild(child) { const i = this.children.indexOf(child); if (i >= 0) this.children.splice(i, 1); return child; }
  remove() { if (this.parentNode) this.parentNode.removeChild(this); }
  addEventListener(type, fn) { (this._listeners[type] = this._listeners[type] || []).push(fn); }
  removeEventListener() {}
  querySelector() { return null; }
  querySelectorAll() { return []; }
  getContext(type) { if (!this._ctx) this._ctx = makeFakeCtx(this); return this._ctx; }
}

const CANVAS_SIZES = {
  'title-canvas': [480, 270], 'scene-canvas': [960, 360], 'combat-canvas': [960, 380],
  'dice-canvas': [140, 140], 'map-canvas': [720, 480],
};

const KNOWN_IDS_WITH_CLASS = {
  'screen-title': 'screen active', 'screen-howto': 'screen', 'screen-setup': 'screen',
  'screen-game': 'screen', 'screen-combat': 'screen',
  'modal-char': 'modal hidden', 'modal-generic': 'modal hidden', 'dice-overlay': 'modal hidden',
  'combat-banner': 'combat-banner hidden',
  'btn-dice-continue': 'btn btn-big hidden',
};

function makeDocument() {
  const elementsById = new Map();
  function getElementById(id) {
    if (!elementsById.has(id)) {
      const tag = /canvas/.test(id) ? 'canvas' : 'div';
      const el = new FakeElement(tag);
      el._id = id;
      if (KNOWN_IDS_WITH_CLASS[id] !== undefined) el.className = KNOWN_IDS_WITH_CLASS[id];
      if (CANVAS_SIZES[id]) { el.width = CANVAS_SIZES[id][0]; el.height = CANVAS_SIZES[id][1]; }
      elementsById.set(id, el);
    }
    return elementsById.get(id);
  }
  for (const id of Object.keys(KNOWN_IDS_WITH_CLASS)) getElementById(id);
  return {
    getElementById,
    createElement: (tag) => new FakeElement(tag),
    querySelectorAll(sel) {
      if (sel === '.screen') return [...elementsById.values()].filter(e => e.classList.contains('screen'));
      return [];
    },
    addEventListener() {},
  };
}

/* ==================== SANDBOX / CARICAMENTO SCRIPT ==================== */

const scriptCache = SOURCES.map(s => ({ name: s.name, script: new vm.Script(s.code, { filename: s.name }) }));
const scriptGetG = new vm.Script('(typeof G !== "undefined" ? G : null)');
const scriptGetApi = new vm.Script('({Engine, Combat, Dice, HEROES, BESTIARY, ITEMS, CAMPAIGN, CAMPAIGN_START, WORLD_MAP})');

function makeTimers() {
  let seq = 0;
  const timers = new Map();
  const pending = [];
  return {
    setTimeout(fn, _ms, ...args) {
      const id = ++seq;
      timers.set(id, { fn: () => fn(...args), repeat: false });
      pending.push(id);
      return id;
    },
    clearTimeout(id) { timers.delete(id); },
    setInterval(fn, _ms, ...args) {
      const id = ++seq;
      timers.set(id, { fn: () => fn(...args), repeat: true });
      pending.push(id);
      return id;
    },
    clearInterval(id) { timers.delete(id); },
    drain(maxSteps = 200000) {
      let steps = 0;
      while (pending.length) {
        steps++;
        if (steps > maxSteps) throw new Error('I timer non si esauriscono (probabile loop infinito in un setTimeout/setInterval del gioco)');
        const id = pending.shift();
        const t = timers.get(id);
        if (!t) continue;
        t.fn();
        if (t.repeat && timers.has(id)) pending.push(id);
      }
    },
  };
}

function buildGame(seed) {
  const doc = makeDocument();
  const storage = new Map();
  const localStorage = {
    getItem: k => (storage.has(k) ? storage.get(k) : null),
    setItem: (k, v) => storage.set(k, String(v)),
    removeItem: k => storage.delete(k),
  };
  const consoleErrors = [];
  const timers = makeTimers();
  const sandbox = {
    document: doc,
    window: {},
    localStorage,
    console: { log() {}, warn() {}, error: (...a) => consoleErrors.push(a.map(String).join(' ')), info() {} },
    setTimeout: timers.setTimeout,
    clearTimeout: timers.clearTimeout,
    setInterval: timers.setInterval,
    clearInterval: timers.clearInterval,
  };
  const context = vm.createContext(sandbox);
  for (const { name, script } of scriptCache) {
    try { script.runInContext(context); } catch (e) { throw new Error(`Errore caricando ${name}: ${e.message}`); }
  }
  const ctxMath = vm.runInContext('Math', context);
  ctxMath.random = mulberry32(seed);

  const api = scriptGetApi.runInContext(context);
  const getG = () => scriptGetG.runInContext(context);
  function act(fn) {
    const r = fn();
    timers.drain();
    return r;
  }
  return { context, doc, api, getG, consoleErrors, act };
}

/* ==================== UTILITA' DI INTERAZIONE ==================== */

function buttons(el) { return el.children.filter(c => c.tagName === 'BUTTON'); }
function enabledButtons(el) { return buttons(el).filter(b => !b.disabled); }

function matchButton(list, matcher) {
  if (matcher == null) return null;
  if (typeof matcher === 'string') return list.find(b => b.innerHTML.includes(matcher)) || null;
  if (matcher instanceof RegExp) return list.find(b => matcher.test(b.innerHTML)) || null;
  if (typeof matcher === 'function') return list.find(matcher) || null;
  return null;
}

// A differenza di Corona (sigle a 3 lettere "SAG: +2"), il Relais scrive il nome
// completo della statistica ("Saggezza: +2"): il pattern deve cercare solo ": +N"/": -N".
function statModFromButton(html) {
  const m = html.match(/:\s*([+-]?\d+)/);
  return m ? parseInt(m[1], 10) : 0;
}
function hpRatioFromButton(html) {
  const m = html.match(/PV\s*(\d+)\s*\/\s*(\d+)/);
  return m ? parseInt(m[1], 10) / Math.max(1, parseInt(m[2], 10)) : 1;
}

/* ==================== CONTROLLI DI COERENZA DELLO STATO ==================== */

function checkInvariants(G, where) {
  if (!G) return;
  if (!Number.isFinite(G.gold) || G.gold < 0) {
    throw new Error(`STATO INCOERENTE: Sangue Freddo invalido (${G.gold}) @ ${where}`);
  }
  for (const h of G.party) {
    if (!Number.isFinite(h.hp) || h.hp < 0 || h.hp > h.maxHp) {
      throw new Error(`STATO INCOERENTE: HP invalidi per "${h.id}" (${h.hp}/${h.maxHp}) @ ${where}`);
    }
    if (h.veleno !== undefined && typeof h.veleno !== 'boolean') {
      throw new Error(`STATO INCOERENTE: h.veleno non booleano per "${h.id}" (${JSON.stringify(h.veleno)}) @ ${where}`);
    }
    if (h.preso !== undefined && typeof h.preso !== 'boolean') {
      throw new Error(`STATO INCOERENTE: h.preso non booleano per "${h.id}" (${JSON.stringify(h.preso)}) @ ${where}`);
    }
  }
  for (const hid of Object.keys(G.uses || {})) {
    for (const abid of Object.keys(G.uses[hid])) {
      const v = G.uses[hid][abid];
      if (!Number.isFinite(v) || v < 0) {
        throw new Error(`STATO INCOERENTE: usi negativi/non-numerici ${hid}.${abid} = ${v} @ ${where}`);
      }
    }
  }
}

/* ==================== STRATEGIA DI COMBATTIMENTO ==================== */

function classifyCombatMenu(btns) {
  if (btns.some(b => /^🎯/.test(b.innerHTML))) return 'target'; // 🎯 = 🎯
  if (btns.some(b => /^❤|^💀/.test(b.innerHTML))) return 'ally'; // ❤ o 💀
  return 'main';
}

function pickWeakestTarget(btns) {
  const targets = btns.filter(b => !/Indietro/.test(b.innerHTML));
  targets.sort((a, b) => hpRatioFromButton(a.innerHTML) - hpRatioFromButton(b.innerHTML));
  return targets[0] || btns[0];
}

function pickAllyForHealing(btns) {
  const allies = btns.filter(b => !/Indietro/.test(b.innerHTML));
  const down = allies.find(b => /A TERRA/.test(b.innerHTML));
  if (down) return down;
  allies.sort((a, b) => hpRatioFromButton(a.innerHTML) - hpRatioFromButton(b.innerHTML));
  return allies[0] || btns[0];
}

function pickMainCombatAction(btns, turnCounter, G) {
  const enabled = btns.filter(b => !b.disabled);
  if (!enabled.length) return btns[0];
  const needHeal = G && G.party.some(h => h.down || h.hp / h.maxHp < 0.35);
  if (needHeal) {
    const healer = enabled.find(b => /Cura/i.test(b.innerHTML) && /^(✨|🧪)/.test(b.innerHTML)); // ✨ o 🧪
    if (healer) return healer;
  }
  const attack = enabled.find(b => /^⚔/.test(b.innerHTML)); // ⚔
  const abilities = enabled.filter(b => /^✨/.test(b.innerHTML)); // ✨
  const pool = [];
  if (attack) pool.push(attack);
  pool.push(...abilities);
  if (!pool.length) return enabled[0];
  return pool[turnCounter % pool.length];
}

function runCombat(game, scenario, state) {
  const { doc } = game;
  const LIMIT = 800;
  let steps = 0;
  let turnCounter = 0;
  while (true) {
    steps++;
    if (steps > LIMIT) throw new Error(`LOOP INFINITO sospetto nel combattimento (> ${LIMIT} azioni)`);

    const diceOverlay = doc.getElementById('dice-overlay');
    if (!diceOverlay.classList.contains('hidden')) {
      const btn = doc.getElementById('btn-dice-continue');
      if (typeof btn.onclick !== 'function') throw new Error('overlay dado visibile ma bottone "Continua" senza onclick');
      game.act(() => btn.onclick());
      checkInvariants(game.getG(), 'dopo tiro di dado in combattimento');
      continue;
    }
    const screenCombat = doc.getElementById('screen-combat');
    if (!screenCombat.classList.contains('active')) return; // combattimento risolto, siamo tornati alla scena

    const box = doc.getElementById('combat-actions');
    const btns = buttons(box);
    if (!btns.length) throw new Error('Nessuna azione di combattimento disponibile mentre "screen-combat" e\' attivo');

    const kind = classifyCombatMenu(btns);
    let chosen;
    if (state.strategy === 'passive' && kind === 'main') {
      chosen = btns.find(b => /Difesa totale/.test(b.innerHTML)) || enabledButtons(box)[0];
    } else if (kind === 'target') {
      chosen = pickWeakestTarget(btns);
    } else if (kind === 'ally') {
      chosen = pickAllyForHealing(btns);
    } else {
      chosen = pickMainCombatAction(btns, turnCounter++, game.getG());
    }
    if (!chosen) throw new Error(`Nessuna azione selezionabile in combattimento (kind=${kind})`);
    game.act(() => chosen.onclick());
    checkInvariants(game.getG(), 'dopo azione di combattimento');
  }
}

/* ==================== STRATEGIA DI NAVIGAZIONE SCENE ==================== */

// A differenza dell'hub di Corona (v1: sempre gli stessi bottoni, si può tornare
// all'infinito), l'hub h1 del Relais offre scelte "once": ogni visita ne consuma
// una diversa (finché non sono finite). Le "sequences" per-scenario indicano, in
// ORDINE, quale bottone scegliere a ogni visita successiva della stessa scena.
function pickSceneChoice(sceneId, btns, scenario, state) {
  const seq = scenario.sequences && scenario.sequences[sceneId];
  if (seq && seq.length) {
    state.seqIdx = state.seqIdx || {};
    const idx = state.seqIdx[sceneId] || 0;
    if (idx < seq.length) {
      const m = matchButton(btns, seq[idx]);
      if (m) { state.seqIdx[sceneId] = idx + 1; return m; }
    }
  }
  const forced = scenario.choices && scenario.choices[sceneId];
  if (forced) {
    const m = matchButton(btns, forced);
    if (m) return m;
  }
  return btns[Math.floor(scenario.rand() * btns.length)];
}

function pickCheckHero(btns, scenario) {
  const bias = scenario.checkBias || 'random';
  if (bias === 'random') return btns[Math.floor(scenario.rand() * btns.length)];
  const withMod = btns.map(b => ({ b, mod: statModFromButton(b.innerHTML) }));
  withMod.sort((x, y) => (bias === 'best' ? y.mod - x.mod : x.mod - y.mod));
  return withMod[0].b;
}

/* ==================== ESECUZIONE DI UNA PARTITA ==================== */

function runGame(scenario) {
  const game = buildGame(scenario.seed);
  scenario.rand = mulberry32(scenario.seed * 7919 + 13); // rand separato per le scelte, dal dado di gioco
  const { doc, api, getG } = game;
  const log = { scenes: [], ending: null, combats: 0 };
  const state = { strategy: 'aggressive', firstLossForced: !scenario.forceFirstCombatLoss, seqIdx: {} };

  try {
    game.act(() => api.Engine.newGame(
      scenario.heroes.map(id => ({ heroId: id, player: '' })),
      null,
      scenario.difficulty || 'normale',
    ));
  } catch (e) {
    return { ok: false, scenario, error: `Engine.newGame ha lanciato un'eccezione: ${e.stack || e}`, log };
  }

  const STEP_LIMIT = 2000;
  let steps = 0;
  try {
    checkInvariants(getG(), 'dopo newGame');
    while (true) {
      steps++;
      if (steps > STEP_LIMIT) throw new Error(`LOOP INFINITO sospetto nella navigazione (> ${STEP_LIMIT} passi totali)`);

      const G = getG();
      const sceneId = G.sceneId;
      const scene = api.CAMPAIGN[sceneId];
      if (!scene) throw new Error(`Scena non trovata: "${sceneId}" (riferita da qualche parte ma assente in CAMPAIGN)`);
      log.scenes.push(sceneId);

      if (scene.ending) { log.ending = sceneId; break; }

      // Qualunque modale generica (selezione eroe per una prova, modale informativa di
      // avvio in modalità Sopravvissuto, ecc.): i bottoni con un handler JS reale
      // (b.onclick assegnato via codice, non `onclick="..."` dentro l'HTML — quelli lì
      // il nostro DOM finto non li esegue, esattamente come farebbe un browser vero con
      // l'HTML statico, MA senza il parsing degli attributi inline) si cliccano; se non
      // ce ne sono di funzionali, si considera la modale "solo informativa" e si chiude.
      const modalGeneric = doc.getElementById('modal-generic');
      if (!modalGeneric.classList.contains('hidden')) {
        const content = doc.getElementById('modal-generic-content');
        const btns = buttons(content);
        const clickable = btns.filter(b => typeof b.onclick === 'function');
        if (!clickable.length) { modalGeneric.classList.add('hidden'); continue; }
        const chosen = pickCheckHero(clickable, scenario);
        game.act(() => chosen.onclick());
        checkInvariants(getG(), `dopo scelta eroe per prova in "${sceneId}"`);
        continue;
      }

      const diceOverlay = doc.getElementById('dice-overlay');
      if (!diceOverlay.classList.contains('hidden')) {
        const btn = doc.getElementById('btn-dice-continue');
        if (typeof btn.onclick !== 'function') throw new Error('overlay dado visibile ma bottone "Continua" senza onclick');
        game.act(() => btn.onclick());
        checkInvariants(getG(), `dopo tiro di dado fuori combattimento (scena "${sceneId}")`);
        continue;
      }

      if (scene.combat) {
        log.combats++;
        const box = doc.getElementById('choices');
        const startBtn = buttons(box)[0];
        if (!startBtn) throw new Error(`Bottone "INIZIA IL COMBATTIMENTO" mancante in scena "${sceneId}"`);
        if (scenario.forceFirstCombatLoss && !state.firstLossForced) {
          state.strategy = 'passive';
          state.firstLossForced = true;
        } else {
          state.strategy = 'aggressive';
        }
        game.act(() => startBtn.onclick());
        runCombat(game, scenario, state);
        checkInvariants(getG(), `dopo combattimento originato da "${sceneId}"`);
        continue;
      }

      const choicesBox = doc.getElementById('choices');
      const btns = enabledButtons(choicesBox);
      if (!btns.length) throw new Error(`Nessuna scelta disponibile in scena "${sceneId}" (vicolo cieco a runtime)`);
      const chosen = pickSceneChoice(sceneId, btns, scenario, state);
      if (!chosen) throw new Error(`pickSceneChoice non ha selezionato nulla in scena "${sceneId}"`);
      game.act(() => chosen.onclick());
      checkInvariants(getG(), `dopo scelta in "${sceneId}"`);
    }
  } catch (e) {
    return { ok: false, scenario, error: e.stack || String(e), log };
  }

  if (game.consoleErrors.length) {
    return { ok: false, scenario, error: `console.error catturati durante la partita: ${game.consoleErrors.join(' | ')}`, log };
  }
  return { ok: true, scenario, log };
}

/* ==================== DEFINIZIONE DEGLI SCENARI ==================== */

let seedCounter = 1;
function nextSeed() { return seedCounter++ * 104729; }

// Sequenza di default per l'hub h1: visita cantina, poi piano proibito, poi pozzo,
// poi la domanda a Gregorio (h2), poi finalmente barrica/procede al Banchetto.
const DEFAULT_SEQUENCES = { h1: ['CANTINA', 'PIANO PROIBITO', 'POZZO', 'Trattenere Gregorio', 'barricarsi'] };

// Mappa di scelte "felici" di default per ogni scena che potrebbe presentarsi: ogni
// scenario ne eredita una copia e sovrascrive solo le chiavi che gli interessano.
const BASE_CHOICES = {
  a2: '🤝 Presentazioni e convenevoli',
  a2_siepi: 'Entrate. Insieme.',
  a3: '✍️ Firmate il registro', // firma diretta, senza controllare il registro
  a3_registro: '✍️ Firmate. Con gli occhi aperti',
  a3_registro_ko: '✍️ Firmate: siete stanchi',
  a4_rinvio: 'Alle camere',
  a4_firma_forzata: 'Alle camere',
  a4_firma: 'Alle camere',
  a5: '🧳 Disfare le valigie',
  a5_pozzo: 'Scendete per la cena',
  a6: '🏊 Buttarla sul programma',
  a6_brindisi: '🏊 In piscina!',
  a6_no_brindisi: '🏊 In piscina!',
  a7: '🏊 In piscina!',
  p1: '😅 "Ne avranno messo uno di scorta."',
  p1_accappatoio: 'Tornare in acqua e fare finta di niente',
  p1_accappatoio_ko: 'Tornare in acqua. Vicini.',
  p2: '🏃 FUORI DALL\'ACQUA',
  p2_esperimento: 'Fuori dall\'acqua. La scienza',
  p2_esperimento_ko: 'Fuori. FUORI. Tutti.',
  p3_fuori: '🚪 Dentro. Ora.',
  p4_fuga: 'Rientrare. Compatti.',
  p4_rientro: 'Su. Insieme.',
  h2: 'Tornare al corridoio',
  k1: '👂 Avvicinare l\'orecchio',
  k2_sofia: 'Verso il fondo della cantina',
  k2_sofia_ko: 'Verso il fondo. Ormai.',
  k3: '💇 Natalino fa un passo avanti',
  k4_scambio: 'Risalire. C\'è ancora tanta notte',
  k4_furto: 'Risalire, prima che ci ripensi',
  k5_dopo_chef: 'Risalire. La notte non è finita',
  u1: '🚪 1899 — la stanza dov\'è cominciato tutto',
  u2_1999: '🚪 Ancora una stanza: la 1924',
  u2_1924: 'Attraversare la stanza A TEMPO DI VALZER',
  u3_medaglione: '🚨 La porta con la targhetta vuota',
  u3_bambole_vinte: '🚨 La porta con la targhetta vuota',
  u2_1899: '🚨 Rispettare il lutto e andare',
  u5_specchio: 'Alla porta con la targhetta vuota',
  u4_porta_vuota: 'Giù, al corridoio delle tre porte',
  b1: '👁 Il piano di Gaetano',
  b2_orto: 'Al pozzo. È il momento.',
  b3_pozzo: '🪢 Qualcuno si cala nel pozzo',
  b4_medaglione: 'Dentro. Verso l\'alba. Verso il Banchetto.',
  b4_vino: 'Dentro. Verso l\'alba.',
  b4_parole: 'Dentro. Verso l\'alba.',
  b4_ira: 'Dentro. E qualcuno prepari',
  b4_calata: 'Dentro. Verso l\'alba.',
  b4_calata_ko: 'Dentro. Subito.',
  x_celle: '↩ Tornare là fuori e riprovare',
  z1: '⚔ Il gruppo si mette in mezzo',
  z2_vino: '⚔ La casa manderà qualcuno',
  z2_trattativa: '⚔ La casa chiede comunque',
  z2_rituale: 'Nel buio, qualcosa di ENORME',
  z_custode: '↩ No. NESSUNO resta.',
  z_resa: '🔥 ALZARSI. Rovesciare la sedia',
  z5_vittoria: 'Guardare l\'alba.',
  z6_alba: '☕ Il caffè, l\'abbraccio',
};

function scenario(name, heroes, choices, opts = {}) {
  return {
    name,
    seed: opts.seed ?? nextSeed(),
    heroes,
    choices: { ...BASE_CHOICES, ...choices },
    sequences: opts.sequences || DEFAULT_SEQUENCES,
    checkBias: opts.checkBias || 'best',
    forceFirstCombatLoss: !!opts.forceFirstCombatLoss,
    difficulty: opts.difficulty || 'normale',
  };
}

const scenarios = [];

/* ---- PROLOGO: le tre varianti della firma ---- */

scenarios.push(scenario('prologo: firma diretta (a4_firma), poi rientro standard', ['claudia', 'federico'], {
  a3: '✍️ Firmate il registro',
}));

scenarios.push(scenario('prologo: registro sfogliato (INT) poi firma subito', ['gaetano', 'natalino'], {
  a3: '📖 Prima, sfogliare il registro',
  a3_registro: '✍️ Firmate. Con gli occhi aperti',
}, { checkBias: 'best' }));

scenarios.push(scenario('prologo: registro sfogliato, poi FIRMA RINVIATA (CAR)', ['federico', 'natalino'], {
  a3: '📖 Prima, sfogliare il registro',
  a3_registro: '🗣 "Firmiamo domani con calma...',
}, { checkBias: 'best' }));

scenarios.push(scenario('prologo: registro letto male (INT fallita) poi firma forzata', ['emanuela', 'natalino'], {
  a3: '📖 Prima, sfogliare il registro',
}, { checkBias: 'worst' }));

/* ---- PISCINA: tutte le varianti richieste ---- */

scenarios.push(scenario('piscina: accappatoio ispezionato con successo (SAG)', ['claudia', 'emanuela'], {
  p1: '🔍 Uscire a controllare l\'accappatoio',
}, { checkBias: 'best' }));

scenarios.push(scenario('piscina: accappatoio ispezionato goffamente (SAG fallita)', ['federico', 'gaetano'], {
  p1: '🔍 Uscire a controllare l\'accappatoio',
}, { checkBias: 'worst' }));

scenarios.push(scenario('piscina: esperimento di Gaetano riuscito (INT) — vista la finestra', ['gaetano', 'claudia'], {
  p2: '🔬 Gaetano vuole capire',
}, { checkBias: 'best' }));

/* ---- FUGA / RIENTRO: entrambi i rami dopo p3_fuori ---- */

scenarios.push(scenario('dopo la piscina: tentata fuga (cancello chiuso)', ['natalino', 'federico'], {
  p3_fuori: '🚗 SUBITO IN MACCHINA',
}));

scenarios.push(scenario('dopo la piscina: rientro ordinato (tisaniera)', ['claudia', 'emanuela'], {
  p3_fuori: '🚪 Dentro. Ora.',
}));

/* ---- HUB h1 + h2 (storia di Ada) — copre anche il giro completo delle 3 piste ---- */

scenarios.push(scenario('hub completo: cantina + piano + pozzo + storia di Ada, poi rituale', ['claudia', 'federico'], {
  b3_pozzo: 'Parlarle di Gregorio', // richiede storia_ada (ottenuta con h2, visitato prima nella sequenza)
}, { checkBias: 'best' }));

/* ---- PISTA CANTINA: scambio (CAR), furto (DES), combattimento vinto ---- */

scenarios.push(scenario('cantina: scambio con lo Chef riuscito (CAR) — nodo sciolto senza sangue', ['natalino', 'federico'], {
  k3: '💇 Natalino fa un passo avanti',
  sequences: { h1: ['CANTINA', 'barricarsi'] },
}, { checkBias: 'best', sequences: { h1: ['CANTINA', 'barricarsi'] } }));

scenarios.push(scenario('cantina: furto dalla mensola riuscito (DES)', ['natalino', 'claudia'], {
  k3: '🤫 Distrarlo e arraffare sale',
}, { checkBias: 'best', sequences: { h1: ['CANTINA', 'barricarsi'] } }));

scenarios.push(scenario('cantina: attacco diretto allo Chef, k4_chef_fight VINTO', ['natalino', 'federico'], {
  k3: '⚔ Non si tratta con chi ha una mannaia',
}, { sequences: { h1: ['CANTINA', 'barricarsi'] } }));

/* ---- PISTA PIANO PROIBITO: stanza 1999, valzer (vinto/perso), 1899, specchio ---- */

scenarios.push(scenario('piano: tour completo 1999 -> 1924 (valzer DES vinto) -> 1899 -> specchio', ['natalino', 'claudia'], {
  u1: '🚪 1999 — l\'anno di Sofia',
  u2_1999: '🚪 Ancora una stanza: la 1924',
  u2_1924: 'Attraversare la stanza A TEMPO DI VALZER',
  u3_medaglione: '🚪 La stanza 1899',
  u2_1899: 'Prima di uscire: scoprire lo specchio velato',
}, { checkBias: 'best', sequences: { h1: ['PIANO PROIBITO', 'barricarsi'] } }));

scenarios.push(scenario('piano: valzer perso (DES fallita) -> u3_bambole_fight VINTO', ['gaetano', 'emanuela'], {
  u1: '🚪 1924 — la stanza del valzer',
  u2_1924: 'Attraversare la stanza A TEMPO DI VALZER',
}, { checkBias: 'worst', sequences: { h1: ['PIANO PROIBITO', 'barricarsi'] } }));

/* ---- PISTA POZZO: giardiniere evitato/combattuto, orto+antidoto, tutte le varianti ---- */

scenarios.push(scenario('pozzo: giardiniere evitato (SAG) -> orto -> calata riuscita (FOR)', ['claudia', 'gaetano'], {
  b1: '👁 Il piano di Gaetano',
  b3_pozzo: '🪢 Qualcuno si cala nel pozzo',
}, { checkBias: 'best', sequences: { h1: ['POZZO', 'barricarsi'] } }));

scenarios.push(scenario('pozzo: giardiniere combattuto (SAG fallita) -> b2_giardiniere_fight VINTO', ['natalino', 'federico'], {
  b1: '👁 Il piano di Gaetano',
}, { checkBias: 'worst', sequences: { h1: ['POZZO', 'barricarsi'] } }));

scenarios.push(scenario('pozzo: fuga di corsa (DES) evitando il giardiniere', ['natalino', 'claudia'], {
  b1: '🏃 Il piano di Natalino',
}, { checkBias: 'best', sequences: { h1: ['POZZO', 'barricarsi'] } }));

scenarios.push(scenario('pozzo: medaglione mostrato ad Ada (richiede il flag "medaglione")', ['natalino', 'claudia'], {
  u1: '🚪 1924 — la stanza del valzer',
  u2_1924: 'Attraversare la stanza A TEMPO DI VALZER',
  b3_pozzo: '💍 Mostrarle il MEDAGLIONE',
}, { checkBias: 'best', sequences: { h1: ['PIANO PROIBITO', 'POZZO', 'barricarsi'] } }));

scenarios.push(scenario('pozzo: bottiglia del 1899 calata ad Ada (richiede l\'oggetto "vino_1899")', ['natalino', 'federico'], {
  k3: '💇 Natalino fa un passo avanti',
  b3_pozzo: '🍷 Calare nel secchio la BOTTIGLIA',
}, { checkBias: 'best', sequences: { h1: ['CANTINA', 'POZZO', 'barricarsi'] } }));

scenarios.push(scenario('pozzo: parole giuste su Gregorio (CAR, richiede storia_ada) -> b4_parole', ['federico', 'natalino'], {
  b3_pozzo: 'Parlarle di Gregorio',
}, { checkBias: 'best', sequences: { h1: ['Trattenere Gregorio', 'POZZO', 'barricarsi'] } }));

scenarios.push(scenario('pozzo: parola sbagliata su Gregorio (CAR fallita, richiede storia_ada) -> b4_ira', ['gaetano', 'emanuela'], {
  b3_pozzo: 'Parlarle di Gregorio',
}, { checkBias: 'worst', sequences: { h1: ['Trattenere Gregorio', 'POZZO', 'barricarsi'] } }));

/* ---- FINALE: rituale completo, boss pieno, vino di Gregorio, trattativa, sconfitta+retry, z_custode/z_resa ---- */

scenarios.push(scenario('finale: rituale completo (rituale_noto da u2_1899) -> boss indebolito -> vittoria', ['claudia', 'emanuela'], {
  u1: '🚪 1899 — la stanza dov\'è cominciato tutto',
  z1: '🧂💧 IL RITUALE',
}, { checkBias: 'best', sequences: { h1: ['PIANO PROIBITO', 'barricarsi'] } }));

scenarios.push(scenario('finale: boss PIENO (z3_boss -> z4_fase2 -> vittoria), party di 5', HEROES_ALL(), {
  u1: '🚪 1899 — la stanza dov\'è cominciato tutto',
  z1: '⚔ Il gruppo si mette in mezzo',
}, { checkBias: 'best', sequences: { h1: ['PIANO PROIBITO', 'barricarsi'] }, difficulty: 'facile' }));

scenarios.push(scenario('finale: il vino di Gregorio (z2_vino, richiede vino_1899)', ['natalino', 'federico'], {
  k3: '💇 Natalino fa un passo avanti',
  z1: '🍷 Prima di tutto: versare il vino',
}, { checkBias: 'best', sequences: { h1: ['CANTINA', 'barricarsi'] }, difficulty: 'facile' }));

scenarios.push(scenario('finale: trattativa di Federico RIUSCITA (CAR) -> z2_trattativa', ['federico', 'emanuela'], {
  u1: '🚪 1899 — la stanza dov\'è cominciato tutto',
  z1: '🗣 Federico chiede la parola',
}, { checkBias: 'best', sequences: { h1: ['PIANO PROIBITO', 'barricarsi'] }, difficulty: 'facile' }));

scenarios.push(scenario('finale: trattativa di Federico FALLITA (CAR) -> z3_boss_arrabbiato', ['gaetano', 'natalino'], {
  u1: '🚪 1899 — la stanza dov\'è cominciato tutto',
  z1: '🗣 Federico chiede la parola',
}, { checkBias: 'worst', sequences: { h1: ['PIANO PROIBITO', 'barricarsi'] }, difficulty: 'facile' }));

scenarios.push(scenario('finale: sconfitta VOLUTA contro il boss -> x_celle -> RETRY vittorioso', ['claudia', 'federico'], {
  u1: '🚪 1899 — la stanza dov\'è cominciato tutto',
  z1: '⚔ Il gruppo si mette in mezzo',
}, { checkBias: 'best', sequences: { h1: ['PIANO PROIBITO', 'barricarsi'] }, forceFirstCombatLoss: true }));

scenarios.push(scenario('finale: z_custode -> qualcuno firma -> e_custode', ['natalino', 'emanuela'], {
  u1: '🚪 1899 — la stanza dov\'è cominciato tutto',
  z1: '🖋 La scelta di cui non parlerete mai più',
  z_custode: '🖋 Qualcuno firma',
}, { sequences: { h1: ['PIANO PROIBITO', 'barricarsi'] } }));

scenarios.push(scenario('finale: z_resa -> restare seduti -> e_ospiti', ['gaetano', 'claudia'], {
  u1: '🚪 1899 — la stanza dov\'è cominciato tutto',
  z1: '🍽 Sedersi. Tutti e cinque.',
  z_resa: 'Restare seduti',
}, { sequences: { h1: ['PIANO PROIBITO', 'barricarsi'] } }));

/* ---- Party solitario (1 eroe) — copre la modalità Sopravvissuto end-to-end ---- */

scenarios.push(scenario('modalità Sopravvissuto: Emanuela SOLA, rituale -> alba', ['emanuela'], {
  u1: '🚪 1899 — la stanza dov\'è cominciato tutto',
  z1: '🧂💧 IL RITUALE',
}, { checkBias: 'best', sequences: { h1: ['PIANO PROIBITO', 'barricarsi'] }, difficulty: 'facile' }));

/* ---- Round-robin extra per varietà (coppie diverse, seed diversi, bias misti) ---- */

const heroPairs = [
  ['gaetano', 'natalino'], ['claudia', 'federico'], ['federico', 'emanuela'],
  ['natalino', 'claudia'], ['gaetano', 'emanuela'], ['emanuela', 'natalino'],
];
for (let i = 0; i < 8; i++) {
  const heroes = heroPairs[i % heroPairs.length];
  scenarios.push(scenario(`variante extra #${i + 1} (coppia ${heroes.join('+')})`, heroes, {
    a3: i % 2 === 0 ? '📖 Prima, sfogliare il registro' : '✍️ Firmate il registro',
    p1: i % 3 === 0 ? '🔍 Uscire a controllare l\'accappatoio' : '😅 "Ne avranno messo uno di scorta."',
    p3_fuori: i % 2 === 0 ? '🚪 Dentro. Ora.' : '🚗 SUBITO IN MACCHINA',
    z1: i % 4 === 0 ? '⚔ Il gruppo si mette in mezzo' : '🧂💧 IL RITUALE',
    u1: '🚪 1899 — la stanza dov\'è cominciato tutto',
  }, { checkBias: i % 3 === 0 ? 'worst' : 'best', sequences: { h1: ['PIANO PROIBITO', 'CANTINA', 'barricarsi'] }, difficulty: 'facile' }));
}

/* ==================== ESECUZIONE (con retry adattivo per gli esiti a dado) ====================
   Alcuni contenuti dipendono dal SUCCESSO (o dal FALLIMENTO) di un tiro di dado, che il test
   può orientare scegliendo l'eroe con il modificatore migliore/peggiore (checkBias) ma non
   forzare con certezza (un 1 naturale fallisce sempre, un 20 naturale riesce sempre). Per
   garantire comunque la copertura, questi scenari vengono ripetuti con semi diversi finché lo
   scopo non è raggiunto: ogni tentativo conta comunque come una run a sé, loggata come le altre. */

section('Simulazione di partite complete (headless)');

const results = [];
function execute(sc) {
  const r = runGame(sc);
  results.push(r);
  const endingTxt = r.ok ? (r.log.ending || '(nessun finale?!)') : 'ERRORE';
  const line = `  ${r.ok ? '✅' : '❌'} [seed ${sc.seed}] ${sc.name} — scene: ${r.log.scenes.length}, combattimenti: ${r.log.combats}, esito: ${endingTxt}`;
  console.log(line);
  if (!r.ok) console.error(`      ↳ ${r.error.split('\n')[0]}`);
  return r;
}

function executeUntil(name, heroes, choices, opts, targetScenes, maxAttempts = 14) {
  let last = null;
  for (let i = 0; i < maxAttempts; i++) {
    const sc = scenario(`${name} (tentativo ${i + 1}/${maxAttempts})`, heroes, choices, { ...opts, seed: (opts.seedBase || 555000) + i * 131 });
    last = execute(sc);
    if (last.ok && targetScenes.every(id => last.log.scenes.includes(id))) return true;
  }
  console.error(`      ↳ ⚠ non raggiunto dopo ${maxAttempts} tentativi: ${targetScenes.join(', ')} (dipende da un tiro di dado — vedi copertura sotto)`);
  return false;
}

console.log(`  Esecuzione di ${scenarios.length} partite pilotate + tentativi adattivi per gli esiti a dado...\n`);
for (const sc of scenarios) execute(sc);

// Piscina — l'esperimento di Gaetano va storto (INT fallita): AVVELENAMENTO narrativo
// (vedi nota sul bug G.lastRoller più sotto: la scena viene comunque raggiunta).
executeUntil('piscina: esperimento andato storto (INT fallita) -> p2_esperimento_ko', ['emanuela', 'natalino'],
  { p2: '🔬 Gaetano vuole capire' },
  { checkBias: 'worst', seedBase: 610000 }, ['p2_esperimento_ko']);

// Pozzo — calata riuscita (FOR) con le pagine del diario
executeUntil('pozzo: calata riuscita (FOR) -> b4_calata (pagine del diario)', ['gaetano', 'federico'],
  { b1: '👁 Il piano di Gaetano', b3_pozzo: '🪢 Qualcuno si cala nel pozzo' },
  { checkBias: 'best', seedBase: 620000, sequences: { h1: ['POZZO', 'barricarsi'] } }, ['b4_calata']);

// Pozzo — calata fallita (FOR) -> avvelenamento narrativo
executeUntil('pozzo: calata fallita (FOR) -> b4_calata_ko', ['claudia', 'emanuela'],
  { b1: '👁 Il piano di Gaetano', b3_pozzo: '🪢 Qualcuno si cala nel pozzo' },
  { checkBias: 'worst', seedBase: 630000, sequences: { h1: ['POZZO', 'barricarsi'] } }, ['b4_calata_ko']);

const fatalRuns = results.filter(r => !r.ok);
for (const r of fatalRuns) fail(`Partita "${r.scenario.name}" (seed ${r.scenario.seed}): ${r.error.split('\n')[0]}`);

/* ==================== VERIFICA DELLA COPERTURA ==================== */

section('Copertura dei percorsi richiesti');

const allScenesSeen = new Set(results.filter(r => r.ok).flatMap(r => r.log.scenes));
const allEndings = new Set(results.filter(r => r.ok && r.log.ending).map(r => r.log.ending));

function coverage(label, sceneIds) {
  const seen = sceneIds.filter(id => allScenesSeen.has(id));
  const ok = seen.length === sceneIds.length;
  console.log(`  ${ok ? '✅' : '❌'} ${label}: ${seen.join(', ') || '(nessuna)'}`);
  if (!ok) fail(`${label}: mancano ${sceneIds.filter(id => !allScenesSeen.has(id)).join(', ')}`);
}

coverage('Prologo — registro sfogliato', ['a3_registro']);
coverage('Prologo — firma diretta', ['a4_firma']);
coverage('Prologo — firma rinviata (CAR)', ['a4_rinvio']);

coverage('Piscina — accappatoio ispezionato (SAG successo)', ['p1_accappatoio']);
coverage('Piscina — esperimento riuscito (INT successo)', ['p2_esperimento']);
coverage('Piscina — esperimento fallito (INT fallita, avvelenamento narrativo)', ['p2_esperimento_ko']);

coverage('Tentata fuga', ['p4_fuga']);
coverage('Rientro ordinato', ['p4_rientro']);

coverage('Hub h1 raggiunto', ['h1']);
coverage('h2 — la storia di Ada', ['h2']);

coverage('Cantina — scambio con lo Chef (CAR)', ['k4_scambio']);
coverage('Cantina — furto dalla mensola (DES)', ['k4_furto']);
coverage('Cantina — combattimento contro lo Chef vinto', ['k4_chef_fight', 'k5_dopo_chef']);

coverage('Piano — stanza 1999', ['u2_1999']);
coverage('Piano — valzer vinto (DES) -> medaglione', ['u3_medaglione']);
coverage('Piano — valzer perso -> combattimento bambole vinto', ['u3_bambole_fight', 'u3_bambole_vinte']);
coverage('Piano — stanza 1899', ['u2_1899']);
coverage('Piano — specchio velato', ['u5_specchio']);

coverage('Pozzo — giardiniere evitato (SAG/DES)', ['b2_orto']);
coverage('Pozzo — giardiniere combattuto', ['b2_giardiniere_fight']);
coverage('Pozzo — medaglione ad Ada', ['b4_medaglione']);
coverage('Pozzo — bottiglia del 1899 ad Ada', ['b4_vino']);
coverage('Pozzo — parole giuste su Gregorio (CAR successo)', ['b4_parole']);
coverage('Pozzo — parola sbagliata (CAR fallita, avvelenamento narrativo)', ['b4_ira']);
coverage('Pozzo — calata riuscita (FOR)', ['b4_calata']);
coverage('Pozzo — calata fallita (FOR, avvelenamento narrativo)', ['b4_calata_ko']);

coverage('Finale — rituale completo', ['z2_rituale', 'z3_boss_indebolito', 'z5_vittoria', 'e_alba']);
coverage('Finale — boss pieno', ['z3_boss', 'z4_fase2', 'z5_vittoria']);
coverage('Finale — vino di Gregorio', ['z2_vino']);
coverage('Finale — trattativa riuscita', ['z2_trattativa']);
coverage('Finale — trattativa fallita', ['z3_boss_arrabbiato']);
coverage('Finale — sconfitta contro il boss -> celle', ['x_celle']);
{
  // La sconfitta forzata deve portare a x_celle e poi RIPROVARE lo stesso combattimento
  // (z3_boss compare due volte nel log: la volta persa e la volta vinta dopo il RETRY).
  const retryRun = results.find(r => r.ok && /sconfitta VOLUTA/.test(r.scenario.name));
  const timesBossSeen = retryRun ? retryRun.log.scenes.filter(id => id === 'z3_boss').length : 0;
  const ok = retryRun && timesBossSeen >= 2 && retryRun.log.scenes.includes('x_celle');
  console.log(`  ${ok ? '✅' : '❌'} RETRY_COMBAT dopo le celle: z3_boss affrontato ${timesBossSeen} volte`);
  if (!ok) fail(`RETRY_COMBAT: non risulta un secondo tentativo di z3_boss dopo x_celle (visto ${timesBossSeen} volte)`);
}
coverage('Finale — z_custode', ['z_custode']);
coverage('Finale — z_resa', ['z_resa']);

console.log(`  ${allEndings.size >= 3 ? '✅' : '❌'} Finali raggiunti (${allEndings.size}/3): ${[...allEndings].join(', ') || '(nessuno)'}`);
if (allEndings.size < 3) {
  const missing = ['e_alba', 'e_custode', 'e_ospiti'].filter(e => !allEndings.has(e));
  fail(`Finali non raggiunti in nessuna delle ${scenarios.length} run: ${missing.join(', ')}`);
}

/* ==================== VERIFICHE DIRETTE: VELENO, MALUS -2, ANTIDOTO ====================
   Nota importante (vedi report finale): G.lastRoller — da cui dipendono sia `poisonRoller`
   che `captureRoller` in engine.js (gotoScene) — non viene MAI assegnato da nessuna parte
   nel codice di gioco (grep su js/*.js non trova alcuna assegnazione). Di conseguenza,
   scene come p2_esperimento_ko, b4_ira e b4_calata_ko — che narrativamente "avvelenano chi
   ha tirato" — non impostano MAI h.veleno=true nella pratica: la condizione
   `G.lastRoller != null` in gotoScene è sempre falsa. Qui sotto verifichiamo perciò il
   MECCANISMO del veleno/malus/antidoto forzando lo stato direttamente (bypassando il
   trigger narrativo rotto), per assicurarci che — SE mai venisse impostato correttamente —
   funzionerebbe. Il bug del trigger è riportato separatamente, non viene "corretto" qui. */

section('Verifiche dirette: malus -2 da veleno e cura con l\'Antidoto');

function findHeroButton(box, heroName) {
  return buttons(box).find(b => b.innerHTML.startsWith(heroName));
}

(function testVelenoMalus() {
  // baseline: Claudia (SAG 4 + passiva Scroll Infinito +2 = +6) SENZA veleno
  const gameA = buildGame(31337);
  gameA.act(() => gameA.api.Engine.newGame([{ heroId: 'claudia', player: '' }, { heroId: 'federico', player: '' }]));
  gameA.act(() => matchButton(buttons(gameA.doc.getElementById('choices')), 'Siamo arrivati').onclick());
  gameA.act(() => matchButton(buttons(gameA.doc.getElementById('choices')), 'occhiata alle siepi').onclick());
  const boxA = gameA.doc.getElementById('modal-generic-content');
  const btnA = findHeroButton(boxA, 'Claudia');
  if (!btnA) { fail('testVelenoMalus: bottone di Claudia non trovato nella modale della prova (a2, SAG)'); return; }
  const baseMod = statModFromButton(btnA.innerHTML);
  if (baseMod !== 6) fail(`testVelenoMalus: mod SAG base di Claudia inatteso: ${baseMod} (atteso 6 = 4 stat + 2 passiva)`);

  // stesso identico punto della storia, ma con Claudia avvelenata a forza (bypassando il
  // trigger narrativo rotto, vedi nota sopra)
  const gameB = buildGame(31337);
  gameB.act(() => gameB.api.Engine.newGame([{ heroId: 'claudia', player: '' }, { heroId: 'federico', player: '' }]));
  gameB.act(() => { gameB.getG().party[0].veleno = true; });
  gameB.act(() => matchButton(buttons(gameB.doc.getElementById('choices')), 'Siamo arrivati').onclick());
  gameB.act(() => matchButton(buttons(gameB.doc.getElementById('choices')), 'occhiata alle siepi').onclick());
  const boxB = gameB.doc.getElementById('modal-generic-content');
  const btnB = findHeroButton(boxB, 'Claudia');
  if (!btnB) { fail('testVelenoMalus: bottone di Claudia non trovato nella modale della prova (avvelenata)'); return; }
  const poisonedMod = statModFromButton(btnB.innerHTML);
  if (poisonedMod !== baseMod - 2) {
    fail(`testVelenoMalus: il malus -2 da veleno non risulta applicato correttamente (base=${baseMod}, avvelenata=${poisonedMod}, attesto ${baseMod - 2})`);
  } else {
    console.log(`  ✅ Malus -2 da veleno applicato correttamente alle prove (Claudia: ${baseMod} -> ${poisonedMod})`);
  }
  if (!/avvelenato dal freddo/i.test(btnB.innerHTML)) {
    fail('testVelenoMalus: l\'etichetta "avvelenato dal freddo" non appare sul bottone dell\'eroe avvelenato');
  }
})();

(function testAntidoto() {
  const game = buildGame(42424);
  game.act(() => game.api.Engine.newGame([{ heroId: 'emanuela', player: '' }, { heroId: 'gaetano', player: '' }]));
  const G = game.getG();
  G.party[0].veleno = true;
  G.inventory.push('antidoto');
  checkInvariants(G, 'prima della cura');

  // useAntidote() apre la modale con un bottone per ogni eroe avvelenato; il bottone vero
  // nel gioco ha `onclick="Engine.applyAntidote(...)"` scritto DENTRO l'HTML (non un vero
  // handler JS) — nel browser funziona (l'HTML viene parsato ed eseguito), ma il nostro DOM
  // finto non esegue attributi inline, quindi chiamiamo applyAntidote come farebbe il click.
  game.act(() => game.api.Engine.useAntidote('antidoto'));
  const box = game.doc.getElementById('modal-generic-content');
  if (!buttons(box).length) fail('testAntidoto: useAntidote non ha mostrato alcun bottone per l\'eroe avvelenato');

  game.act(() => game.api.Engine.applyAntidote('antidoto', 0));
  checkInvariants(G, 'dopo la cura');
  if (G.party[0].veleno !== false) fail(`testAntidoto: applyAntidote non ha rimosso il veleno (veleno=${G.party[0].veleno})`);
  if (G.inventory.includes('antidoto')) fail('testAntidoto: applyAntidote non ha consumato l\'Antidoto dall\'inventario');
  if (!G.party[0].veleno === false) console.log('  ✅ Engine.useAntidote/applyAntidote curano correttamente il veleno e consumano l\'oggetto');

  // useAntidote() su un gruppo senza nessun avvelenato non deve lanciare eccezioni
  const game2 = buildGame(51515);
  game2.act(() => game2.api.Engine.newGame([{ heroId: 'natalino', player: '' }]));
  game2.getG().inventory.push('antidoto');
  try {
    game2.act(() => game2.api.Engine.useAntidote('antidoto'));
  } catch (e) {
    fail(`testAntidoto: useAntidote senza avvelenati ha lanciato un'eccezione: ${e.message}`);
  }
})();

/* ==================== ESITO FINALE ==================== */

console.log('\n' + '═'.repeat(60));
if (failures === 0) {
  console.log(`✅ TUTTE LE PARTITE SIMULATE COMPLETATE SENZA ERRORI (${results.length} run, ${allScenesSeen.size} scene distinte visitate, ${allEndings.size}/3 finali)`);
  process.exit(0);
} else {
  console.log(`❌ ${failures} PROBLEMI RILEVATI su ${results.length} partite simulate`);
  process.exit(1);
}

function HEROES_ALL() { return ['gaetano', 'natalino', 'claudia', 'federico', 'emanuela']; }
