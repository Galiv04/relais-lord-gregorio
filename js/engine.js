/* ============ ENGINE — stato di gioco, scene, prove, modali ============ */

let G = null; // stato di gioco globale

const Engine = (() => {

  const SLOTS = 3;
  const $ = id => document.getElementById(id);

  /* ---------- profili utente (ognuno ha i suoi 3 slot) ---------- */

  const PROFILES_KEY = 'relais-profiles';
  const CURRENT_PROFILE_KEY = 'relais-current-profile';
  const DEFAULT_PROFILE = 'Gli Ospiti del Belvedere';

  function listProfiles() {
    try {
      const raw = localStorage.getItem(PROFILES_KEY);
      const list = raw ? JSON.parse(raw) : [];
      return list.length ? list : [DEFAULT_PROFILE];
    } catch (e) { return [DEFAULT_PROFILE]; }
  }

  function saveProfiles(list) {
    try { localStorage.setItem(PROFILES_KEY, JSON.stringify(list)); } catch (e) {}
  }

  function currentProfile() {
    try { return localStorage.getItem(CURRENT_PROFILE_KEY) || DEFAULT_PROFILE; } catch (e) { return DEFAULT_PROFILE; }
  }

  function setCurrentProfile(name) {
    try { localStorage.setItem(CURRENT_PROFILE_KEY, name); } catch (e) {}
    const list = listProfiles();
    if (!list.includes(name)) { list.push(name); saveProfiles(list); }
  }

  const slotKey = (n, profile = null) => `relais-save-${encodeURIComponent(profile || currentProfile())}-slot-${n}`;

  // migrazione dai vecchi formati (salvataggio singolo e slot senza profilo)
  try {
    const legacy = localStorage.getItem('relais-legacy-none');
    if (legacy && !localStorage.getItem(`relais-save-slot-1`)) {
      localStorage.setItem('relais-save-slot-1', legacy);
      localStorage.removeItem('relais-legacy-none');
    }
    for (let n = 1; n <= SLOTS; n++) {
      const old = localStorage.getItem(`relais-save-slot-${n}`);
      if (old && !localStorage.getItem(slotKey(n, DEFAULT_PROFILE))) {
        localStorage.setItem(slotKey(n, DEFAULT_PROFILE), old);
        localStorage.removeItem(`relais-save-slot-${n}`);
      }
    }
    if (!localStorage.getItem(PROFILES_KEY)) saveProfiles([DEFAULT_PROFILE]);
    if (!localStorage.getItem(CURRENT_PROFILE_KEY)) setCurrentProfile(DEFAULT_PROFILE);
  } catch (e) {}

  /* ---------- stato ---------- */

  function newGame(selection, slot = null, difficulty = 'normale') {
    // selection: [{heroId, player}]
    if (slot == null) slot = firstFreeSlot() || 1;
    const solo = selection.length === 1;
    G = {
      party: selection.map(s => {
        const base = HEROES.find(h => h.id === s.heroId);
        const hero = { ...JSON.parse(JSON.stringify(base)), hp: base.maxHp, down: false, player: s.player || '' };
        if (solo) {
          // Modalità Eroe Solitario: più resistente, più risorse
          hero.maxHp += 10; hero.hp = hero.maxHp; hero.ac += 1;
          for (const ab of hero.abilities) ab.uses += 1;
        }
        return hero;
      }),
      uses: {},
      gold: solo ? 12 : 10,   // 🕯 Sangue Freddo
      inventory: solo ? ['kit_emanuela', 'grappa_nonno'] : ['kit_emanuela'],
      flags: solo ? { solo: true } : {},
      sceneId: CAMPAIGN_START,
      usedChoices: {},   // sceneId -> [testi scelti "once"]
      enteredScenes: {}, // sceneId -> true (per effetti one-shot)
      lastCombatSceneId: null,
      checkpointsDone: [],  // flag di CHECKPOINT_FLAGS già scattati
      lastCheckpoint: null, // { sceneId, flag, snapshot } — il punto di ripartenza
      koCount: {},          // sceneId del combattimento -> quante volte ci siete caduti
      ritiri: { ctx: null, n: 0 }, // ritiri comprati col Sangue Freddo nel contesto corrente
      history: [],       // tappe della storia (per il riepilogo alla ripresa)
      seenEnemies: [],   // nemici incontrati (per il bestiario)
      slot,
      difficulty,
      stats: { combats: 0, checksPassed: 0, checksFailed: 0, scenes: 0, start: Date.now(),
               goldEarned: 0, ritiriComprati: 0 },
    };
    for (const h of G.party) {
      G.uses[h.id] = {};
      for (const ab of h.abilities) G.uses[h.id][ab.id] = ab.uses;
    }
    saveGame();
    gotoScene(CAMPAIGN_START);
    {
      const box = $('modal-generic-content');
      let html = `<h2>📖 La Storia</h2>` + (typeof RULES_STORY !== 'undefined' ? RULES_STORY : '');
      if (solo) {
        html += `<h2 style="margin-top:16px">🌒 Modalità Sopravvissuto</h2>
        <p style="margin-bottom:12px">${G.party[0].name} affronta il Belvedere DA SOLO. Che incoscienza. Che stile. La notte concede:</p>
        <div class="ability-box"><span class="ability-name">❤ +10 PV massimi e +1 CA</span></div>
        <div class="ability-box"><span class="ability-name">✨ +1 uso a ogni abilità speciale</span></div>
        <div class="ability-box"><span class="ability-name">🎒 Il kit di Emanuela e la grappa del nonno già in borsa</span></div>
        <p style="color:var(--text-dim);margin-top:10px">Consiglio del narratore: nei film horror il gruppo si divide. Tu SEI già diviso. Compensa con la prudenza.</p>`;
      }
      html += `<button class="btn btn-gold" style="margin-top:12px" onclick="document.getElementById('modal-generic').classList.add('hidden')">🌙 Che la notte cominci</button>`;
      box.innerHTML = html;
      $('modal-generic').classList.remove('hidden');
    }
  }

  function saveGame() {
    if (!G) return;
    G.savedAt = Date.now();
    try { localStorage.setItem(slotKey(G.slot || 1), JSON.stringify(G)); } catch (e) { /* storage pieno o disabilitato */ }
  }

  function listSaves(profile = null) {
    const out = [];
    for (let n = 1; n <= SLOTS; n++) {
      try {
        const raw = localStorage.getItem(slotKey(n, profile));
        if (!raw) { out.push(null); continue; }
        const g = JSON.parse(raw);
        const scene = CAMPAIGN[g.sceneId];
        out.push({
          slot: n,
          heroes: (g.party || []).map(h => h.name.split(' ')[0]).join(', '),
          players: (g.party || []).map(h => h.player).filter(Boolean).join(', '),
          caption: scene ? scene.caption : '—',
          gold: g.gold,
          savedAt: g.savedAt || null,
          ended: !!(scene && scene.ending),
        });
      } catch (e) { out.push(null); }
    }
    return out;
  }

  function hasSave() { return listSaves().some(Boolean); }

  function firstFreeSlot() {
    const saves = listSaves();
    for (let n = 1; n <= SLOTS; n++) if (!saves[n - 1]) return n;
    return null;
  }

  function loadGame(slot = null) {
    try {
      if (slot == null) slot = listSaves().findIndex(Boolean) + 1;
      if (!slot) return false;
      const raw = localStorage.getItem(slotKey(slot));
      if (!raw) return false;
      G = JSON.parse(raw);
      G.slot = slot;
      if (!CAMPAIGN[G.sceneId]) G.sceneId = CAMPAIGN_START;
      renderScene(CAMPAIGN[G.sceneId], true);
      showRecap();
      return true;
    } catch (e) { return false; }
  }

  // "La storia finora": riepilogo alla ripresa della partita
  function showRecap() {
    if (!G || !G.history || G.history.length < 2) return;
    const beats = G.history.slice(-6).map(c => `<div class="ability-box" style="border-left-color:var(--gold)"><div class="ability-desc">📖 ${c}</div></div>`).join('');
    const box = $('modal-generic-content');
    box.innerHTML = `<h2>📜 La storia finora...</h2>
      <p style="color:var(--text-dim);margin-bottom:10px">Bentornati al Belvedere. Il gruppo (${G.party.map(h => h.name.split(' ')[0]).join(', ')}) ha 🕯 ${G.gold} di Sangue Freddo. Le ultime tappe della notte:</p>
      ${beats}
      <button class="btn btn-gold" style="margin-top:12px" onclick="document.getElementById('modal-generic').classList.add('hidden')">▶ Si riparte!</button>`;
    $('modal-generic').classList.remove('hidden');
  }

  function clearSave(slot = null, profile = null) {
    try {
      if (slot != null) localStorage.removeItem(slotKey(slot, profile));
      else if (G && G.slot) localStorage.removeItem(slotKey(G.slot));
    } catch (e) {}
  }

  /* ---------- codici di salvataggio (trasferimento tra dispositivi) ---------- */

  function exportCode(slot, profile = null) {
    try {
      const raw = localStorage.getItem(slotKey(slot, profile));
      if (!raw) return null;
      return btoa(unescape(encodeURIComponent(raw)));
    } catch (e) { return null; }
  }

  function importCode(code, slot, profile = null) {
    try {
      const raw = decodeURIComponent(escape(atob(code.trim())));
      const g = JSON.parse(raw);
      if (!g.party || !g.party.length || !g.sceneId) return 'Codice non valido: manca la compagnia o la scena.';
      if (!CAMPAIGN[g.sceneId]) g.sceneId = CAMPAIGN_START;
      localStorage.setItem(slotKey(slot, profile), JSON.stringify(g));
      return null; // nessun errore
    } catch (e) { return 'Codice non riconosciuto: controllate di averlo copiato per intero.'; }
  }

  function deleteProfile(name) {
    for (let n = 1; n <= SLOTS; n++) clearSave(n, name);
    const list = listProfiles().filter(p => p !== name);
    saveProfiles(list.length ? list : [DEFAULT_PROFILE]);
    if (currentProfile() === name) setCurrentProfile(list[0] || DEFAULT_PROFILE);
  }

  function renameProfile(oldName, newName) {
    if (!newName || listProfiles().includes(newName)) return false;
    for (let n = 1; n <= SLOTS; n++) {
      try {
        const raw = localStorage.getItem(slotKey(n, oldName));
        if (raw) { localStorage.setItem(slotKey(n, newName), raw); localStorage.removeItem(slotKey(n, oldName)); }
      } catch (e) {}
    }
    saveProfiles(listProfiles().map(p => p === oldName ? newName : p));
    if (currentProfile() === oldName) setCurrentProfile(newName);
    return true;
  }

  /* ---------- navigazione schermate ---------- */

  function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    $(id).classList.add('active');
  }

  function currentScene() { return CAMPAIGN[G && G.sceneId] || null; }

  /* ---------- formattazione testo ---------- */

  function formatText(text) {
    const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return esc(text)
      .split('\n')
      .map(line => {
        const m = line.match(/^&gt; ([^:]+): ?(.*)$/);
        if (m) return `<span class="speaker">${m[1]}:</span> ${m[2]}`;
        return line;
      })
      .join('\n')
      .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
      .replace(/\*(.+?)\*/g, '<i>$1</i>');
  }

  /* ---------- scene ---------- */

  /* Luoghi visti CUMULATIVI per profilo (tra tutte le notti): servono a
     "Rivivi la Notte" per dire quanto manca e DOVE. */
  const seenKey = () => 'relais-viste-' + encodeURIComponent(currentProfile());
  function seenScenes() {
    try { return new Set(JSON.parse(localStorage.getItem(seenKey()) || '[]')); } catch (e) { return new Set(); }
  }
  function markSeen(id) {
    try {
      const s = seenScenes();
      if (!s.has(id)) { s.add(id); localStorage.setItem(seenKey(), JSON.stringify([...s])); }
    } catch (e) {}
  }

  /* ============ 🕯 IL SANGUE FREDDO — COSA FA DAVVERO ============
     Una risorsa che non ha effetti visibili non esiste (LESSONS-LEARNED #15-16).
     Nel Relais il Sangue Freddo compra UNA cosa, e il gioco la dice dentro il gioco:
     il SECONDO TENTATIVO. Quando un dado va male — una prova di scena o un colpo
     mancato in combattimento — si può pagare e rifarlo. Il primo ritiro costa poco,
     il quarto costa quanto un'intera notte di coraggio: così il gruppo scommette,
     non compra l'onnipotenza. Il conto ricomincia da capo a ogni nuova scena e a
     ogni nuovo scontro (contesti separati), e la stessa valuta si spende anche allo
     Spaccio del Contabile: le due cose competono, ed è quello il bello. */

  const RITIRO_COSTI = [2, 3, 5, 8];   // oltre il quarto: +3 ciascuno, all'infinito

  function costoRitiro(n) {
    const k = Math.max(0, n | 0);
    if (k < RITIRO_COSTI.length) return RITIRO_COSTI[k];
    return RITIRO_COSTI[RITIRO_COSTI.length - 1] + 3 * (k - RITIRO_COSTI.length + 1);
  }

  // quanti ritiri sono già stati comprati NEL contesto ctx ('scena:<id>' / 'scontro:<id>')
  function ritiriFatti(ctx) {
    if (!G || !G.ritiri || G.ritiri.ctx !== ctx) return 0;
    return G.ritiri.n || 0;
  }

  function costoRitiroOra(ctx) { return costoRitiro(ritiriFatti(ctx)); }

  function puoiRitirare(ctx) { return !!G && G.gold >= costoRitiroOra(ctx); }

  /* Scala il costo e incrementa il contatore del contesto. Torna il costo pagato
     (numero, sempre > 0) oppure 0 se il saldo non bastava: si paga PRIMA di ritirare,
     mai dopo (LESSON #11: un passo indietro dopo la spesa regala azioni gratis). */
  function spendiRitiro(ctx) {
    if (!puoiRitirare(ctx)) return 0;
    const costo = costoRitiroOra(ctx);
    const n = ritiriFatti(ctx) + 1;
    G.gold = Math.max(0, G.gold - costo);
    G.ritiri = { ctx, n };
    if (!G.stats) G.stats = {};
    G.stats.ritiriComprati = (G.stats.ritiriComprati || 0) + 1;
    saveGame();
    return costo;
  }

  /* Quanti ritiri compra il saldo di ADESSO, pagandoli a costi crescenti. Senza ctx
     conta come una scena nuova (è il numero che serve alla HUD). */
  function ritiriDisponibili(ctx) {
    if (!G) return 0;
    let saldo = G.gold, n = ctx ? ritiriFatti(ctx) : 0, quanti = 0;
    while (saldo >= costoRitiro(n) && quanti < 99) { saldo -= costoRitiro(n); n++; quanti++; }
    return quanti;
  }

  /* Ogni movimento della valuta passa da qui: senza un contatore del RACCOLTO non si
     può misurare (né tarare) l'economia — e "quanto ne ho preso" è un dato di partita
     che il finale mostra accanto al saldo. */
  function muoviFreddo(delta) {
    if (!G || !delta) return 0;
    if (delta > 0) {
      if (!G.stats) G.stats = {};
      G.stats.goldEarned = (G.stats.goldEarned || 0) + delta;
    }
    G.gold = Math.max(0, G.gold + delta);
    return G.gold;
  }

  function gotoScene(id) {
    if (id === 'RETRY_COMBAT') id = G.lastCombatSceneId || CAMPAIGN_START;
    const scene = CAMPAIGN[id];
    if (!scene) { console.error('Scena mancante:', id); return; }
    G.sceneId = id;
    G.stats.scenes++;
    markSeen(id);

    const firstVisit = !G.enteredScenes[id];
    G.enteredScenes[id] = true;

    // effetti d'ingresso (solo alla prima visita)
    if (firstVisit) {
      if (scene.sets) Object.assign(G.flags, scene.sets);
      // CHECKPOINT: la prima volta che si completa un nodo/pista (lista per-gioco
      // CHECKPOINT_FLAGS in campaign.js) il gruppo recupera PV e mosse. Le condizioni
      // (veleno, preso) NON si curano qui: hanno le loro cure. Vedi docs/MINIGIOCHI.md.
      if (typeof CHECKPOINT_FLAGS !== 'undefined' && scene.sets) {
        if (!G.checkpointsDone) G.checkpointsDone = [];
        const nuovo = CHECKPOINT_FLAGS.find(f => scene.sets[f] && !G.checkpointsDone.includes(f));
        if (nuovo) {
          G.checkpointsDone.push(nuovo);
          // SNAPSHOT del checkpoint: se il Belvedere vi stende due volte nello stesso
          // punto, si riparte da QUI con lo stato di ADESSO (vedi riprendiDaCheckpoint).
          try {
            G.lastCheckpoint = { sceneId: G.sceneId, flag: nuovo, snapshot: JSON.stringify({
              party: G.party, uses: G.uses, gold: G.gold, inventory: G.inventory,
              flags: G.flags, checkpointsDone: G.checkpointsDone, koCount: G.koCount || {},
              enteredScenes: G.enteredScenes, usedChoices: G.usedChoices,
            }) };
          } catch (e) {}
          for (const h of G.party) {
            if (h.morto) continue;
            h.hp = h.maxHp; h.down = false;
            if (G.uses[h.id]) for (const ab of h.abilities) G.uses[h.id][ab.id] = ab.uses;
          }
          if (typeof Sound !== 'undefined') Sound.play('heal');
          setTimeout(() => {
            const box = $('modal-generic-content');
            box.innerHTML = `<h2>🕯 NODO SCIOLTO — Checkpoint</h2>
              <p style="font-size:20px;line-height:1.6;margin:10px 0">Il gruppo tira il fiato: <b>PV al massimo</b> e <b>tutte le mosse ricaricate</b>.<br>
              <span style="color:var(--text-dim)">Le condizioni (☠ veleno, 🕸 preso) restano: quelle vogliono le loro cure.</span></p>
              <button class="btn btn-gold" onclick="document.getElementById('modal-generic').classList.add('hidden')">▶ Si continua</button>`;
            $('modal-generic').classList.remove('hidden');
            renderPartyBar('party-bar');
          }, 900);
        }
      }
      if (scene.rep) G.flags.reputazione = (G.flags.reputazione || 0) + scene.rep;
      if (scene.gold) muoviFreddo(scene.gold);
      if (scene.goldLoss) muoviFreddo(-scene.goldLoss);
      if (scene.item) G.inventory.push(scene.item);
      if (scene.item2) G.inventory.push(scene.item2);
      if (scene.heal) {
        // le Provviste di Bocciolo rendono i riposi più nutrienti
        const bonus = (scene.recharge && G.inventory.includes('provviste')) ? 2 : 0;
        for (const h of G.party) if (!h.down) h.hp = Math.min(h.maxHp, h.hp + scene.heal + bonus);
      }
      if (scene.damage) for (const h of G.party) if (!h.down) h.hp = Math.max(1, h.hp - scene.damage);
      if (scene.onEnterOnce && scene.onEnterOnce.itemEach) {
        for (const h of G.party) G.inventory.push(scene.onEnterOnce.itemEach);
      }
      // condizioni del Belvedere: colpiscono chi ha appena tirato il dado
      if (scene.poisonRoller && G.lastRoller != null && G.party[G.lastRoller]) {
        G.party[G.lastRoller].veleno = true;
      }
      if (scene.captureRoller && G.lastRoller != null && G.party[G.lastRoller]) {
        const attivi = G.party.filter(h => !h.preso && !h.down).length;
        if (attivi > 1) G.party[G.lastRoller].preso = true; // mai catturare l'ultimo in piedi
      }
    }

    // effetti che devono valere a OGNI visita (scene di sconfitta e di riposo)
    if (scene.fullHeal) {
      for (const h of G.party) {
        h.hp = h.maxHp; h.down = false;
        for (const ab of h.abilities) G.uses[h.id][ab.id] = ab.uses;
      }
      if (!firstVisit && scene.goldLoss) muoviFreddo(-scene.goldLoss);
    }
    if (scene.recharge) {
      for (const h of G.party) for (const ab of h.abilities) G.uses[h.id][ab.id] = ab.uses;
    }
    if (scene.freeAll) {
      for (const h of G.party) h.preso = false; // la casa "perde le chiavi"
    }

    if (scene.combat) G.lastCombatSceneId = id;

    if (firstVisit && scene.stinger && typeof Sound !== 'undefined') Sound.play(scene.stinger);

    // cronologia per il riepilogo "la storia finora"
    if (!G.history) G.history = [];
    if (scene.caption && G.history[G.history.length - 1] !== scene.caption) {
      G.history.push(scene.caption);
      if (G.history.length > 60) G.history.shift();
    }

    saveGame();
    renderScene(scene);
  }

  let typeTimer = null;

  const MUSIC_BY_LOCATION = {
    tornanti: 'viaggio', tornantiPiedi: 'giardino', paese: 'viaggio', relais: 'villa', hall: 'villa', corridoio: 'villa',
    camera: 'carillon', salaDaPranzo: 'villa', piscina: 'piscina',
    cantina: 'cantina', pianoProibito: 'carillon', giardino: 'giardino',
    pozzo: 'pozzo', salaBanchetto: 'banchetto', albaRelais: 'alba',
    riflesso: 'riflesso', riflesso_interno: 'riflesso',
    ossario: 'ossario', soffitta: 'soffitta', garage: 'cantina',
  };

  function musicForScene(scene) {
    if (scene.ending) return 'alba';
    return MUSIC_BY_LOCATION[scene.location] || 'villa';
  }

  /* Quanto è fonda la notte, scena per scena (0 = tramonto, 1 = l'ora del Banchetto). */
  function eclipsePhaseFor(id) {
    if (/^e_/.test(id)) return 0;          // epiloghi: l'alba
    if (/^z/.test(id)) return 1;           // il Banchetto, ore 5:57
    if (/^(k|u|b)/.test(id)) return 0.8;   // le tre piste, notte fonda
    if (/^(h|x)/.test(id)) return 0.6;     // mezzanotte
    if (/^p/.test(id)) return 0.45;        // la piscina, ore 22:10
    if (/^a[5-7]/.test(id)) return 0.3;    // cena e camere
    return 0.15;                           // l'arrivo, il tramonto
  }

  function renderScene(scene, instant = false) {
    showScreen('screen-game');
    if (typeof Sound !== 'undefined') Sound.music(musicForScene(scene));
    if (typeof Scenes.setEclipse === 'function') Scenes.setEclipse(eclipsePhaseFor(G.sceneId));
    /* Le didascalie sono scritte come "Luogo, ora — frase": il luogo e l'ora vanno
       nell'HUD (orientamento), la frase sotto il quadro (didascalia dell'immagine).
       Senza trattino lungo l'HUD prende tutto e la didascalia sotto resta vuota. */
    const capIntera = scene.caption || '';
    const tagliaCap = capIntera.indexOf(' — ');
    const capLuogo = tagliaCap > 0 ? capIntera.slice(0, tagliaCap) : capIntera;
    const capFrase = tagliaCap > 0 ? capIntera.slice(tagliaCap + 3) : '';
    $('hud-location').textContent = '📍 ' + capLuogo;
    Scenes.paint('scene-canvas', scene.location, null, scene.npc);
    /* La scheda del luogo: il pulsante 🔎 sul quadro. Si accende solo se questo
       luogo ha una scheda scritta — un pulsante che apre il vuoto è peggio di
       nessun pulsante. Richiesta del committente, 23 agosto 2026. */
    if (typeof Luoghi !== 'undefined') Luoghi.aggiorna(scene.location, capLuogo);
    $('scene-caption').textContent = capFrase;
    $('scene-caption').classList.toggle('hidden', !capFrase);

    const narr = $('narration');
    const choicesEl = $('choices');
    choicesEl.innerHTML = '';

    const html = `<span class="dm-label">🎙 IL NARRATORE</span>` + formatText(scene.text);

    if (typeTimer) { clearInterval(typeTimer); typeTimer = null; }

    const finishRender = () => {
      narr.innerHTML = html;
      renderChoices(scene);
      renderPartyBar('party-bar');
    };

    if (instant) { finishRender(); return; }

    // effetto macchina da scrivere (cliccabile per saltare)
    narr.innerHTML = '';
    const plain = document.createElement('div');
    narr.appendChild(plain);
    let i = 0;
    const step = 3; // caratteri per tick
    const raw = scene.text;
    typeTimer = setInterval(() => {
      i += step;
      if (i >= raw.length) {
        clearInterval(typeTimer); typeTimer = null;
        finishRender();
      } else {
        plain.innerHTML = `<span class="dm-label">🎙 IL NARRATORE</span>` + formatText(raw.slice(0, i)) + '<span class="cursor"></span>';
      }
    }, 12);
    narr.onclick = () => {
      if (typeTimer) { clearInterval(typeTimer); typeTimer = null; finishRender(); }
    };
    renderPartyBar('party-bar');
  }

  function choiceAvailable(c) {
    if (c.requires) {
      if (c.requires.flag && !G.flags[c.requires.flag]) return false;
      if (c.requires.flag2 && !G.flags[c.requires.flag2]) return false;
      if (c.requires.notFlag && G.flags[c.requires.notFlag]) return false;
      if (c.requires.item && !G.inventory.includes(c.requires.item)) return false;
      if (c.requires.item2 && !G.inventory.includes(c.requires.item2)) return false;
      if (c.requires.notItem && G.inventory.includes(c.requires.notItem)) return false;
    }
    if (c.once && (G.usedChoices[G.sceneId] || []).includes(c.text)) return false;
    return true;
  }

  function renderChoices(scene) {
    const choicesEl = $('choices');
    choicesEl.innerHTML = '';

    if (scene.ending) {
      renderEnding(scene);
      return;
    }

    if (scene.minigame) {
      const b = document.createElement('button');
      b.className = 'choice-btn';
      b.innerHTML = `🎮 <b>SI GIOCA!</b> <span class="choice-tag">${scene.minigame.tag || 'Un minigioco: il gioco vi spiega le regole.'}</span>`;
      b.onclick = () => Minigames.start(scene.minigame, ok => {
        if (ok) { G.stats.checksPassed++; } else { G.stats.checksFailed++; }
        gotoScene(ok ? scene.minigame.success : scene.minigame.fail);
      });
      choicesEl.appendChild(b);
      return;
    }

    if (scene.combat) {
      const b = document.createElement('button');
      b.className = 'choice-btn';
      b.innerHTML = `⚔ <b>INIZIA IL COMBATTIMENTO!</b> <span class="choice-tag">Preparatevi: si combatte a turni, il gioco vi guida.</span>`;
      b.onclick = () => Combat.start(scene.combat, G.sceneId);
      choicesEl.appendChild(b);
      return;
    }

    for (const c of (scene.choices || [])) {
      if (!choiceAvailable(c)) continue;
      const b = document.createElement('button');
      b.className = 'choice-btn';
      let inner = c.text;
      if (c.tag) inner += ` <span class="choice-check">🎲 ${c.tag}</span>`;
      const poor = c.requiresGold && G.gold < c.requiresGold;
      if (poor) inner += ` <span class="choice-tag">(vi serve 🕯 ${c.requiresGold} di Sangue Freddo — ne avete ${G.gold})</span>`;
      b.innerHTML = inner;
      b.disabled = !!poor;
      b.onclick = () => resolveChoice(scene, c);
      choicesEl.appendChild(b);
    }

    /* ↩ SI RIPARTE DAL CHECKPOINT — offerta ESPLICITA nelle scene di sconfitta,
       dalla SECONDA caduta nello stesso scontro (la prima volta il gioco vi
       raccoglie e basta). È una scelta vera, non una punizione: tornare indietro
       vi restituisce il pezzo di storia che la sconfitta vi fa saltare, e vi costa
       tutto quello che avete raccolto da lì in poi (la modale lo dice per nome). */
    if (haCheckpoint() && isSceneDiSconfitta(G.sceneId) &&
        (G.koCount || {})[G.lastCombatSceneId] > 1) {
      const nodo = (CAMPAIGN[G.lastCheckpoint.sceneId] || {}).caption || 'l\'ultimo checkpoint';
      const b = document.createElement('button');
      b.className = 'choice-btn';
      b.id = 'btn-checkpoint-return';
      b.innerHTML = `↩ <b>🕯 Tornare indietro</b>: la notte si riavvolge fino a «${nodo}»` +
        ` <span class="choice-tag">Riprendete da lì: PV pieni, nessuno preso, la notte di nuovo intera — ma quello che avete raccolto dopo, il Belvedere se lo tiene</span>`;
      b.onclick = () => riprendiDaCheckpoint();
      choicesEl.appendChild(b);
    }
  }

  function resolveChoice(scene, c) {
    if (typeof Sound !== 'undefined') Sound.play(c.item ? 'item' : c.gold ? 'gold' : 'click');
    if (c.once) {
      if (!G.usedChoices[G.sceneId]) G.usedChoices[G.sceneId] = [];
      G.usedChoices[G.sceneId].push(c.text);
    }
    if (c.gold) muoviFreddo(c.gold);
    if (c.item) G.inventory.push(c.item);
    if (c.removeItem) {
      const i = G.inventory.indexOf(c.removeItem);
      if (i >= 0) G.inventory.splice(i, 1);
    }
    if (c.removeItem2) {
      const i = G.inventory.indexOf(c.removeItem2);
      if (i >= 0) G.inventory.splice(i, 1);
    }
    // effetti meccanici della SCELTA (non solo della scena): heal/damage/goldLoss.
    // Erano chiavi morte silenziose: decine di scelte le usavano senza effetto (ago 2026).
    if (c.heal) { for (const h of G.party) if (!h.down) h.hp = Math.min(h.maxHp, h.hp + c.heal); }
    if (c.damage) { for (const h of G.party) if (!h.down) h.hp = Math.max(1, h.hp - c.damage); }
    if (c.goldLoss) muoviFreddo(-c.goldLoss);
    if (c.sets) Object.assign(G.flags, c.sets);
    if (c.rep) G.flags.reputazione = (G.flags.reputazione || 0) + c.rep;
    saveGame();

    if (c.check) {
      pickHeroForCheck(c.check);
    } else if (c.next) {
      gotoScene(c.next);
    } else {
      // scelta "da negozio": resta nella scena e aggiorna
      renderScene(scene, true);
    }
  }

  /* ---------- prove di abilità ---------- */

  const STAT_NAMES = { FOR: 'Forza', DES: 'Destrezza', COS: 'Costituzione', INT: 'Intelligenza', SAG: 'Saggezza', CAR: 'Carisma' };

  function heroCheckMod(h, stat) {
    let m = h.stats[stat] || 0;
    if (h.veleno) m -= 2; // il freddo del Belvedere nelle ossa
    if (h.id === 'gaetano' && stat === 'INT') m += 2;
    if (h.id === 'claudia' && stat === 'SAG') m += 2;
    if (h.id === 'federico' && stat === 'CAR') m += 2;
    return m;
  }

  function pickHeroForCheck(check) {
    const box = $('modal-generic-content');
    box.innerHTML = `<h2>🎲 Prova di ${STAT_NAMES[check.stat]} — CD ${check.dc}</h2>
      <p style="margin-bottom:12px">Chi ci prova? Scegliete l'eroe (contano i suoi bonus!):</p>`;
    G.party.forEach((h, hIdx) => {
      if (h.down || h.preso) return;
      const mod = heroCheckMod(h, check.stat);
      const b = document.createElement('button');
      b.className = 'choice-btn';
      b.innerHTML = `${h.name}${h.veleno ? ' ☠' : ''} <span class="choice-tag">${STAT_NAMES[check.stat]}: ${mod >= 0 ? '+' + mod : mod}${h.veleno ? ' (avvelenato dal freddo)' : ''}${h.player ? ' · giocato da ' + h.player : ''}</span>`;
      b.onclick = () => {
        G.lastRoller = hIdx;   // il Belvedere ricorda chi ha osato tirare
        $('modal-generic').classList.add('hidden');
        // il costo dei ritiri cresce DENTRO la scena: uscirne azzera il conto
        const ctx = 'scena:' + G.sceneId;
        const TITOLI = { asso: 'RITIRA (l\'Asso di Denari!)', freddo: 'RITIRA a sangue freddo', null: 'tenta' };
        const rollIt = (comeMai) => Dice.showRoll({
          title: `${h.name} ${TITOLI[comeMai] || TITOLI.null}:<br>${STAT_NAMES[check.stat]} — CD ${check.dc}${h.veleno ? '<br><span style="color:var(--red);font-size:16px">☠ avvelenato dal freddo: −2 già contato nel bonus</span>' : ''}`,
          mod, dc: check.dc,
          onDone: res => {
            // PROVA FALLITA: due strade per un secondo tentativo, se esistono davvero.
            // L'Asso di Denari è un oggetto one-shot (si consuma), il Sangue Freddo si
            // paga e si può ripagare — a prezzo crescente dentro questa stessa scena.
            const asso = G.inventory.includes('asso_di_denari');
            if (!res.success && (asso || puoiRitirare(ctx))) {
              return offerReroll(ctx, asso,
                () => {   // 🃏 l'Asso dei reduci del '49
                  const i = G.inventory.indexOf('asso_di_denari');
                  if (i >= 0) G.inventory.splice(i, 1);
                  saveGame();
                  rollIt('asso');
                },
                () => {   // 🕯 il coraggio, pagato in contanti
                  if (!spendiRitiro(ctx)) { G.stats.checksFailed++; return gotoScene(check.fail); }
                  rollIt('freddo');
                },
                () => {   // 🙅 il fato, accettato
                  G.stats.checksFailed++;
                  gotoScene(check.fail);
                });
            }
            if (res.success) G.stats.checksPassed++; else G.stats.checksFailed++;
            gotoScene(res.success ? check.success : check.fail);
          },
        });
        rollIt(null);
      };
      box.appendChild(b);
    });
    $('modal-generic').classList.remove('hidden');
  }

  /* Bottone di modale con un id: creato come nodo VERO (così il simulatore headless,
     che non genera figli da innerHTML, lo vede e lo può cliccare — LESSON #28) e con
     l'handler esposto anche via getElementById, che nel browser è lo stesso nodo. */
  function modalBtn(box, id, html, fn) {
    const b = document.createElement('button');
    b.className = 'choice-btn';
    b.id = id;
    b.innerHTML = html;
    b.onclick = fn;
    box.appendChild(b);
    const byId = $(id);
    if (byId && byId !== b) byId.onclick = fn;
    return b;
  }

  /* IL SECONDO TENTATIVO su una prova fallita. Due strade, offerte solo se esistono:
     l'Asso di Denari dei reduci del '49 (oggetto, un uso solo) e il Sangue Freddo
     (valuta, costo crescente nella scena). Se non c'è né l'uno né l'altro questa
     modale non viene mai chiamata: il fato resta il fato. */
  function offerReroll(ctx, hasAsso, onAsso, onFreddo, onNo) {
    const box = $('modal-generic-content');
    const costo = costoRitiroOra(ctx);
    const puoi = puoiRitirare(ctx);
    let html = `<h2>🎲 Il dado ha detto no. Si insiste?</h2>`;
    if (hasAsso) {
      html += `<p style="margin-bottom:10px">In tasca, l'<b>Asso di Denari</b> dei reduci del '49 <i>scotta</i>: settant'anni di fortuna, un uso solo. Questo momento lo merita?</p>`;
    }
    if (puoi) {
      html += `<p style="margin-bottom:10px">E poi c'è il modo faticoso: <b>tenere il sangue freddo</b>. Respirare, contare fino a tre e rifare il gesto come se la casa non stesse guardando. Costa <b>🕯 ${costo}</b> — ne avete ${G.gold} — e il prossimo ritiro <i>in questa scena</i> ne vorrà ${costoRitiro(ritiriFatti(ctx) + 1)}: il coraggio, a ripeterlo, si paga sempre più caro.</p>`;
    }
    box.innerHTML = html;
    $('modal-generic').classList.remove('hidden');
    const chiudi = fn => () => { $('modal-generic').classList.add('hidden'); fn(); };
    if (hasAsso) {
      modalBtn(box, 'btn-reroll-yes', `🃏 <b>SÌ: i reduci vi prestano la loro fortuna!</b> (consuma l'Asso di Denari)`, chiudi(onAsso));
    }
    if (puoi) {
      modalBtn(box, 'btn-freddo-yes', `🕯 <b>Tenere il sangue freddo — rifai il tiro (costa ${costo})</b> <span class="choice-tag">Vi restano ${G.gold - costo} di Sangue Freddo</span>`, chiudi(onFreddo));
    }
    modalBtn(box, 'btn-reroll-no', `🙅 No, accettate il fato: quello che è andato storto, stanotte, resta storto`, chiudi(onNo));
  }

  /* Le scene che un combattimento usa come SCONFITTA: sono i punti in cui il
     gioco offre il ritorno al checkpoint (e non possono essere checkpoint loro). */
  let _sconfitte = null;
  function isSceneDiSconfitta(id) {
    if (!_sconfitte) {
      _sconfitte = new Set();
      for (const s of Object.values(CAMPAIGN)) {
        if (s.combat && s.combat.defeat) _sconfitte.add(s.combat.defeat);
      }
    }
    return _sconfitte.has(id);
  }

  /* Quante volte siete già caduti in QUESTO scontro (la prima volta il gioco vi
     raccoglie, dalla seconda si torna al checkpoint). Restituisce il conteggio
     aggiornato, compresa la caduta appena avvenuta. */
  function registraCaduta(sceneId) {
    if (!G) return 1;
    if (!G.koCount) G.koCount = {};
    const k = sceneId || G.sceneId || '?';
    G.koCount[k] = (G.koCount[k] || 0) + 1;
    return G.koCount[k];
  }

  function haCheckpoint() { return !!(G && G.lastCheckpoint && G.lastCheckpoint.snapshot); }

  /* ============ SE CADETE TUTTI: SI RIPARTE DAL CHECKPOINT ============
     Non «game over, ricomincia». La PRIMA volta che il Belvedere vi stende in
     uno scontro, Gregorio perde le chiavi e vi raccoglie (le scene di sconfitta
     scritte restano lì, intatte). La SECONDA volta nello stesso punto no: la
     notte torna indietro all'ultimo nodo sciolto, con lo stato di ALLORA.
     Quello che avete capito dopo, l'avete perso — e la modale lo dice per nome.
     Torna true se il ripristino è avvenuto, false se non c'è nessun checkpoint
     (chi cade prima del primo nodo si tiene la sconfitta scritta). */
  function riprendiDaCheckpoint() {
    /* PIETÀ PROGRESSIVA. Senza questo, un gruppo troppo debole per uno scontro
       rimbalza fra il checkpoint e la sconfitta all'infinito: nelle partite
       simulate il Belvedere ha rimandato il bot sullo stesso boss 225 volte. Ogni
       ritorno toglie il 12% delle forze a chi vi ha steso, fino a un terzo, e il
       log del combattimento lo DICE. Il gioco cede, non il giocatore. */
    if (G) {
      G.stats = G.stats || {};
      G.stats.checkpointRitorni = (G.stats.checkpointRitorni || 0) + 1;   // a vita: serve alle imprese
      /* Il conto che CONTA è per SCONTRO, non a vita: in una notte da quaranta
         combattimenti cadere cinque volte in punti diversi è normale, non un loop.
         Quello che va scontato — e sorvegliato — è rimbalzare sullo STESSO scontro. */
      const _scontro = G.lastCombatSceneId || G.sceneId || '?';
      G.stats.ritorniPerScontro = G.stats.ritorniPerScontro || {};
      G.stats.ritorniPerScontro[_scontro] = (G.stats.ritorniPerScontro[_scontro] || 0) + 1;
      G.pieta = Math.min(0.34, G.stats.ritorniPerScontro[_scontro] * 0.12);
    }

    const cp = G && G.lastCheckpoint;
    if (!cp || !cp.snapshot) return false;
    let s;
    try { s = JSON.parse(cp.snapshot); } catch (e) { return false; }
    if (!s || !s.party || !s.party.length) return false;

    // cosa vi state lasciando indietro, PER NOME (mai testo generico)
    const restanti = [...(s.inventory || [])];
    const perse = [];
    for (const it of (G.inventory || [])) {
      const i = restanti.indexOf(it);
      if (i >= 0) restanti.splice(i, 1); else perse.push(it);
    }
    const nomiPersi = perse.map(i => (ITEMS[i] ? ITEMS[i].name : i));
    const freddoPerso = Math.max(0, (G.gold || 0) - (s.gold || 0));

    G.party = s.party;
    G.uses = s.uses;
    G.gold = s.gold;
    G.inventory = s.inventory;
    G.flags = s.flags;
    G.checkpointsDone = s.checkpointsDone || [];
    G.koCount = s.koCount || {};
    G.ritiri = { ctx: null, n: 0 };   // la notte si riavvolge: anche i nervi ripartono da zero
    // si riavvolge ANCHE cosa è stato visitato: senza questo i flag one-shot
    // delle scene già entrate non si rimettono più e il contenuto si soft-locka.
    if (s.enteredScenes) G.enteredScenes = s.enteredScenes;
    if (s.usedChoices) G.usedChoices = s.usedChoices;
    for (const h of G.party) {
      h.hp = h.maxHp; h.down = false; h.preso = false; h.veleno = false; h.luckUsed = false;
    }
    G.stats = G.stats || {};
    G.stats.checkpointRitorni = (G.stats.checkpointRitorni || 0) + 1;

    // si NAVIGA prima e si racconta dopo: la modale è informativa, non un cancello
    // (un bottone con onclick inline non viene eseguito né dagli stub dei test né
    //  da chi chiude la modale con Esc: il ripristino non può dipendere da lui).
    gotoScene(cp.sceneId);

    const nodo = CAMPAIGN[cp.sceneId] ? CAMPAIGN[cp.sceneId].caption : 'un nodo che avevate sciolto';
    const box = $('modal-generic-content');
    box.innerHTML = `<h2 style="color:var(--red)">🕯 LA NOTTE VI HA RIMESSI INDIETRO</h2>
      <div class="backstory" style="white-space:pre-wrap">Vi risvegliate in piedi. È questa la cosa peggiore: non a terra, non in una cella — <b>in piedi</b>, con le mani asciutte e il respiro regolare, esattamente dove eravate quando avevate sciolto <i>${nodo}</i>.

Il candeliere di Gregorio è sul tavolo, con la cera colata dalla parte sbagliata: sta tornando su.

> Gregorio: <i>(da qualche parte, molto stanco)</i> "La casa ha rimesso a posto la serata. Lo fa quando gli ospiti la annoiano. Vi conviene non annoiarla due volte."

Quello che avete capito da lì in poi, <b>non c'è più</b>. E nelle tasche manca qualcosa.${nomiPersi.length ? `\n\n<span style="color:var(--red)">Vi manca:</span> ${nomiPersi.join(', ')}.` : `\n\n<span style="color:var(--text-dim)">Le tasche, almeno, sono come le avevate lasciate.</span>`}${freddoPerso ? `\n<span style="color:var(--red)">🕯 Sangue Freddo:</span> ne avevate messo insieme ${freddoPerso} in più. Ricominciate da ${G.gold}.` : ''}

<span style="color:var(--green)">PV al massimo, mosse ricaricate, nessuno è più preso.</span> L'alba, però, non vi ha aspettati.</div>
      <button class="btn btn-gold" style="margin-top:14px" onclick="document.getElementById('modal-generic').classList.add('hidden')">🕯 Rifarlo meglio</button>`;
    $('modal-generic').classList.remove('hidden');
    if (typeof Sound !== 'undefined') Sound.play('defeat');
    saveGame();
    return true;
  }

  /* ---------- barra del gruppo ---------- */

  function renderPartyBar(containerId, activeIdx = -1) {
    const bar = $(containerId);
    bar.innerHTML = '';
    G.party.forEach((h, i) => {
      const slot = document.createElement('div');
      slot.className = 'party-slot' + (i === activeIdx ? ' active-turn' : '') + ((h.down || h.preso) ? ' dead' : '');
      const cv = document.createElement('canvas');
      cv.width = 36; cv.height = 36;
      slot.appendChild(cv);
      const info = document.createElement('div');
      info.className = 'party-slot-info';
      const frac = h.hp / h.maxHp;
      info.innerHTML = `
        <div class="party-slot-name">${h.name.split(' ')[0]}</div>
        ${h.player ? `<div class="party-slot-player">${h.player}</div>` : ''}
        <div class="hp-bar"><div class="hp-fill ${frac > 0.5 ? 'high' : frac > 0.25 ? 'mid' : ''}" style="width:${Math.max(0, frac * 100)}%"></div></div>
        <span class="hp-text">${h.preso ? '🕸 PRESO' : h.down ? 'A TERRA' : (h.veleno ? '☠−2 ' : '') + h.hp + '/' + h.maxHp + ' PV'}</span>`;
      slot.appendChild(info);
      slot.onclick = () => showHeroSheet(h);
      bar.appendChild(slot);
      Sprites.renderToCanvas(cv, Sprites.registry[h.sprite]);
    });
  }

  /* ---------- schede e modali ---------- */

  function heroSheetHTML(h, withUses = true) {
    const stats = Object.entries(h.stats).map(([k, v]) =>
      `<div class="stat-chip"><span class="stat-label">${k}</span><span class="stat-val">${v >= 0 ? '+' + v : v}</span></div>`).join('');
    const abilities = h.abilities.map(ab => {
      const left = withUses && G && G.uses[h.id] ? ` — usi rimasti: <b>${G.uses[h.id][ab.id]}</b>` : ` — usi per avventura: <b>${ab.uses}</b>`;
      return `<div class="ability-box"><span class="ability-name">✨ ${ab.name}</span>${left}<div class="ability-desc">${ab.desc}</div></div>`;
    }).join('');
    const conditions = [];
    if (h.veleno) conditions.push(`<div class="ability-box" style="border-left:5px solid var(--red)"><span class="ability-name">☠ AVVELENATO — il freddo del Belvedere</span><div class="ability-desc"><b>−2 a TUTTE le prove e agli attacchi</b> finché dura. Si cura con l'<b>Antidoto di Erbe</b>: Zaino → "🌿 Cura il freddo". Il freddo non passa da solo: la casa non restituisce niente gratis.</div></div>`);
    if (h.preso) conditions.push(`<div class="ability-box" style="border-left:5px solid var(--red)"><span class="ability-name">🕸 PRESO dalla villa</span><div class="ability-desc">Fuori gioco finché il gruppo non lo libera. La casa lo tiene da parte — non gli farà male: lo sta CONSERVANDO.</div></div>`);
    if (h.down) conditions.push(`<div class="ability-box" style="border-left:5px solid var(--red)"><span class="ability-name">💀 A TERRA</span><div class="ability-desc">Serve una cura o una pozione per rialzarlo.</div></div>`);
    return `
      <h2>${h.name}</h2>
      <p style="color:var(--blue);font-size:20px">${h.class} — <i>${h.tagline}</i></p>
      ${h.player ? `<p style="color:var(--text-dim)">Giocato da: <b>${h.player}</b></p>` : ''}
      ${conditions.length ? `<h3>⚠️ Condizioni attive</h3>${conditions.join('')}` : ''}
      <div class="stat-row">
        <div class="stat-chip"><span class="stat-label">PV</span><span class="stat-val">${G ? h.hp + '/' + h.maxHp : h.maxHp}</span></div>
        <div class="stat-chip"><span class="stat-label">CA</span><span class="stat-val">${h.ac}</span></div>
        ${stats}
      </div>
      <h3>⚔ Attacco</h3>
      <div class="ability-box"><span class="ability-name">${h.attack.name}</span><div class="ability-desc">${h.attack.desc}</div></div>
      <h3>✨ Abilità speciali</h3>
      ${abilities}
      <div class="ability-box"><span class="ability-name">🌟 Passiva</span><div class="ability-desc">${h.passive}</div></div>
      <h3>📜 Storia</h3>
      <div class="backstory">${h.backstory}</div>
      <div class="backstory" style="border-left:5px solid var(--green)"><b>Come interpretarlo:</b> ${h.voice}</div>
      <p style="font-size:19px;color:var(--text-dim);margin-top:8px"><b>Ruolo nel gruppo:</b> ${h.role}</p>`;
  }

  function showHeroSheet(h) {
    const box = $('modal-generic-content');
    box.innerHTML = heroSheetHTML(h) + `<button class="btn" style="margin-top:14px" onclick="document.getElementById('modal-generic').classList.add('hidden')">✔ Chiudi</button>`;
    $('modal-generic').classList.remove('hidden');
  }

  /* Gli stati stanno nella scheda completa, ma servono nel riepilogo: nel mezzo di un
     combattimento nessuno apre cinque schede per sapere chi è conciato male. */
  function badgeStati(h) {
    const b = [];
    if (h.down) b.push('💀 A TERRA');
    if (h.preso) b.push('🕸 PRESO');
    if (h.veleno) b.push('☠ AVVELENATO');
    return b.length ? ' · ' + b.join(' · ') : '';
  }

  function showParty() {
    const box = $('modal-generic-content');
    box.innerHTML = `<h2>🎭 La Compagnia</h2>` +
      G.party.map((h, i) => `<div class="ability-box" style="cursor:pointer" onclick="Engine.showHeroSheetIdx(${i})">
        <span class="ability-name">${h.name}</span> — ${h.class}${h.player ? ' · ' + h.player : ''}
        <div class="ability-desc">PV ${h.hp}/${h.maxHp} · CA ${h.ac}${badgeStati(h)} — <i>tocca per la scheda completa</i></div>
      </div>`).join('') +
      `<button class="btn" style="margin-top:14px" onclick="document.getElementById('modal-generic').classList.add('hidden')">✔ Chiudi</button>`;
    $('modal-generic').classList.remove('hidden');
  }

  function showHeroSheetIdx(i) { showHeroSheet(G.party[i]); }

  function showInventory() {
    const box = $('modal-generic-content');
    const counts = {};
    for (const it of G.inventory) counts[it] = (counts[it] || 0) + 1;
    let itemsHtml = Object.entries(counts).map(([it, n]) => {
      const item = ITEMS[it];
      const useBtn = item.usable ? `<button class="btn btn-small" onclick="Engine.usePotionOutside('${it}')">🧪 Usa</button>` :
        item.cureVeleno ? `<button class="btn btn-small" onclick="Engine.useAntidote('${it}')">🌿 Cura il freddo</button>` : '';
      const loreBtn = item.lore ? `<button class="btn btn-small" onclick="Engine.inspectItem('${it}')">📖 Ispeziona</button>` : '';
      return `<div class="inv-item"><span class="inv-name">${item.name}${n > 1 ? ' ×' + n : ''}</span><span class="inv-desc">${item.desc}</span>${useBtn}${loreBtn}</div>`;
    }).join('') || '<p style="color:var(--text-dim)">Lo zaino è vuoto. Succede ai migliori.</p>';
    // La HUD deve contenere la SPIEGAZIONE, non un numero (LESSONS-LEARNED #16):
    // qui si legge cosa compra il Sangue Freddo e quanto ne resta in ritiri veri.
    const k = ritiriDisponibili();
    const dopo = costoRitiro(k);
    box.innerHTML = `<h2>🎒 Le Vostre Cose</h2>
      <div class="gold-display">🕯 Sangue Freddo: ${G.gold}</div>
      <div class="ability-box" style="border-left-color:var(--gold)">
        <span class="ability-name">🕯 A che serve tenere i nervi</span>
        <div class="ability-desc">È il vostro <b>secondo tentativo</b>. Quando un dado va male — una prova o un colpo mancato in uno scontro — il gioco vi chiede se volete <b>rifarlo</b>, e questo è il prezzo: il primo ritiro costa <b>${costoRitiro(0)}</b>, poi ${RITIRO_COSTI.slice(1).join(', ')}, e da lì tre in più ogni volta. Il conto <b>riparte da capo a ogni scena nuova e a ogni scontro nuovo</b>: dentro un singolo momento insistere costa caro, cambiare stanza no.<br>
        <b>Col saldo di adesso: ${k === 0 ? 'nessun ritiro' : k === 1 ? 'un ritiro solo' : k + ' ritiri'}.</b>${k > 0 ? ` (poi ve ne servirebbero ${dopo})` : ` Ne serv${costoRitiro(0) === 1 ? 'e' : 'ono'} ${costoRitiro(0)} per il prossimo.`}<br>
        <span style="color:var(--text-dim)">Lo stesso coraggio è contante allo <b>Spaccio del Contabile</b>, giù nell'ossario: tisane, antidoti, sale benedetto. Spenderlo in medicine o in secondi tentativi è la vera decisione della notte.</span></div>
      </div>
      ${itemsHtml}
      <button class="btn" style="margin-top:14px" onclick="document.getElementById('modal-generic').classList.add('hidden')">✔ Chiudi</button>`;
    $('modal-generic').classList.remove('hidden');
  }

  function inspectItem(itemId) {
    const item = ITEMS[itemId];
    if (!item || !item.lore) return;
    const box = $('modal-generic-content');
    box.innerHTML = `<h2>📖 ${item.name}</h2>
      <div class="backstory" style="white-space:pre-wrap">${item.lore}</div>
      <button class="btn" style="margin-top:14px" onclick="Engine.showInventory()">↩ Allo zaino</button>`;
    $('modal-generic').classList.remove('hidden');
  }

  function useAntidote(itemId) {
    const box = $('modal-generic-content');
    const avvelenati = G.party.filter(h => h.veleno);
    if (!avvelenati.length) {
      box.innerHTML = `<h2>🌿 ${ITEMS[itemId].name}</h2>
        <p style="margin-bottom:12px">Nessuno ha il freddo del Belvedere addosso, per ora. Conservatelo: la notte è lunga.</p>
        <button class="btn" onclick="Engine.showInventory()">↩ Indietro</button>`;
      $('modal-generic').classList.remove('hidden');
      return;
    }
    box.innerHTML = `<h2>🌿 ${ITEMS[itemId].name}</h2><p style="margin-bottom:12px">Chi lo beve?</p>` +
      G.party.map((h, i) => h.veleno ? `<button class="choice-btn" onclick="Engine.applyAntidote('${itemId}', ${i})">${h.name} <span class="choice-tag">☠ avvelenato dal freddo</span></button>` : '').join('');
    $('modal-generic').classList.remove('hidden');
  }

  function applyAntidote(itemId, heroIdx) {
    const i = G.inventory.indexOf(itemId);
    if (i < 0) return;
    G.inventory.splice(i, 1);
    G.party[heroIdx].veleno = false;
    saveGame();
    renderPartyBar('party-bar');
    showInventory();
  }

  function usePotionOutside(itemId) {
    const box = $('modal-generic-content');
    const item = ITEMS[itemId];
    box.innerHTML = `<h2>🧪 ${item.name}</h2><p style="margin-bottom:12px">Chi la beve?</p>` +
      G.party.map((h, i) => `<button class="choice-btn" onclick="Engine.applyPotion('${itemId}', ${i})">${h.name} <span class="choice-tag">PV ${h.hp}/${h.maxHp}${h.down ? ' — A TERRA' : ''}</span></button>`).join('');
    $('modal-generic').classList.remove('hidden');
  }

  function applyPotion(itemId, heroIdx) {
    const i = G.inventory.indexOf(itemId);
    if (i < 0) return;
    G.inventory.splice(i, 1);
    const h = G.party[heroIdx];
    if (ITEMS[itemId].recharge) {
      // il caffè di Don Michele: tutte le abilità di nuovo cariche
      for (const ab of h.abilities) G.uses[h.id][ab.id] = ab.uses;
      saveGame();
      renderPartyBar('party-bar');
      showInventory();
      return;
    }
    h.down = false;
    h.hp = Math.min(h.maxHp, Math.max(0, h.hp) + ITEMS[itemId].heal);
    saveGame();
    renderPartyBar('party-bar');
    showInventory();
  }

  function showRules() {
    const box = $('modal-generic-content');
    box.innerHTML = `<h2>📖 Regole Rapide</h2>${RULES_QUICK}
      <button class="btn" style="margin-top:14px" onclick="document.getElementById('modal-generic').classList.add('hidden')">✔ Chiudi</button>`;
    $('modal-generic').classList.remove('hidden');
  }

  /* ---------- mappa ---------- */

  /* La pianta è un canvas da 720 mostrato a 289 sul telefono: il 40%. Un'etichetta da
     9px arrivava a 3,6px, cioè un impasto. Nella pianta restano i NUMERI, che si leggono
     anche rimpiccioliti; i nomi stanno qui sotto in testo vero, che non rimpicciolisce
     con l'immagine. */
  function legendaMappa() {
    const cur = WORLD_MAP.find(w => w.scenes && G && w.scenes.includes(G.sceneId));
    return '<div class="mappa-legenda">' + WORLD_MAP.map((l, i) => {
      const qui = cur && cur.key === l.key;
      return `<span class="mappa-voce${qui ? ' qui' : ''}"><b>${i + 1}</b> ${l.label}${qui ? ' ⭐' : ''}</span>`;
    }).join('') + '</div>';
  }

  function showMap() {
    const box = $('modal-generic-content');
    box.innerHTML = `<h2>🗺 Il Belvedere — pianta della proprietà</h2><canvas id="map-canvas" width="720" height="480"></canvas>${legendaMappa()}
      <p style="color:var(--text-dim);font-size:19px;margin-top:8px">⭐ = dove siete adesso, e i numeri sulla pianta sono nell'elenco qui sopra. La nebbia segna il confine: di notte, il confine è ovunque.</p>
      <button class="btn" style="margin-top:10px" onclick="document.getElementById('modal-generic').classList.add('hidden')">✔ Chiudi</button>`;
    $('modal-generic').classList.remove('hidden');
    drawMap();
  }

  function drawMap() {
    const canvas = $('map-canvas');
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    const W = canvas.width, H = canvas.height;
    const r = Scenes.rng(500);

    // notte sui monti d'Irpinia
    Scenes.blocks(ctx, 0, 0, W, H, '#171019', 20, r, 0.12);
    // il crinale della montagna
    Scenes.hills(ctx, W, H * 0.2, 40, '#241a26', r, 36);
    // il muro di nebbia tutto intorno alla proprietà
    for (let i = 0; i < 5; i++) {
      ctx.fillStyle = `rgba(190,180,195,${0.03 + i * 0.012})`;
      ctx.fillRect(0, 0, W, 12 - i * 2);
      ctx.fillRect(0, H - 12 + i * 2, W, 12 - i * 2);
      ctx.fillRect(0, 0, 12 - i * 2, H);
      ctx.fillRect(W - 12 + i * 2, 0, 12 - i * 2, H);
    }

    // vialetti tra i luoghi
    ctx.strokeStyle = '#6e5a42'; ctx.lineWidth = 4; ctx.setLineDash([8, 6]);
    const pts = k => { const l = WORLD_MAP.find(w => w.key === k); return l ? [l.x * W, l.y * H] : [W / 2, H / 2]; };
    const path = (a, b) => { const [x1, y1] = pts(a), [x2, y2] = pts(b); ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); };
    path('tornanti', 'relais'); path('tornanti', 'paese'); path('relais', 'hall'); path('hall', 'pranzo'); path('hall', 'camere');
    path('pranzo', 'piscina'); path('camere', 'cantina'); path('camere', 'pozzo'); path('pranzo', 'cantina');
    path('tornanti', 'paese'); path('piscina', 'riflesso');
    ctx.setLineDash([]);

    const cur = WORLD_MAP.find(w => w.scenes.includes(G.sceneId));

    for (const loc of WORLD_MAP) {
      const x = loc.x * W, y = loc.y * H;
      if (loc.key === 'relais') {
        Scenes.blocks(ctx, x - 22, y - 20, 44, 22, '#c8bca8', 6, r, 0.08);
        ctx.fillStyle = '#5a3038';
        ctx.beginPath(); ctx.moveTo(x - 26, y - 20); ctx.lineTo(x, y - 34); ctx.lineTo(x + 26, y - 20); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#e8b64c'; ctx.fillRect(x - 12, y - 14, 6, 6); ctx.fillRect(x + 6, y - 14, 6, 6);
      } else if (loc.key === 'piscina') {
        ctx.fillStyle = '#2492ac'; ctx.fillRect(x - 18, y - 12, 36, 20);
        ctx.fillStyle = 'rgba(200,240,255,.4)'; ctx.fillRect(x - 12, y - 6, 12, 2); ctx.fillRect(x + 2, y + 2, 10, 2);
      } else if (loc.key === 'pozzo') {
        ctx.fillStyle = '#2e2a35'; ctx.fillRect(x - 10, y - 8, 20, 14);
        ctx.fillStyle = '#5a3038';
        ctx.beginPath(); ctx.moveTo(x - 14, y - 8); ctx.lineTo(x, y - 20); ctx.lineTo(x + 14, y - 8); ctx.closePath(); ctx.fill();
      } else if (loc.key === 'cantina') {
        ctx.fillStyle = '#243828'; ctx.fillRect(x - 12, y - 14, 24, 18);
        ctx.fillStyle = '#0d0a0c'; ctx.fillRect(x - 6, y - 9, 12, 13);
      } else if (loc.key === 'tornanti') {
        ctx.strokeStyle = '#332e3a'; ctx.lineWidth = 5;
        ctx.beginPath(); ctx.moveTo(x - 20, y + 12); ctx.quadraticCurveTo(x + 16, y + 4, x - 12, y - 4);
        ctx.quadraticCurveTo(x - 30, y - 10, x + 10, y - 16); ctx.stroke();
      } else if (loc.key === 'paese') {
        ctx.fillStyle = '#4a4450';
        for (let i = 0; i < 3; i++) ctx.fillRect(x - 16 + i * 12, y - 8 + (i % 2) * 3, 10, 10);
        ctx.fillStyle = '#5a5464'; ctx.fillRect(x + 2, y - 20, 6, 14);
        ctx.fillStyle = '#e8b64c'; ctx.fillRect(x + 3, y - 17, 3, 3);
      } else if (loc.key === 'camere') {
        ctx.fillStyle = '#3a2620'; ctx.fillRect(x - 12, y - 14, 24, 18);
        ctx.fillStyle = '#e8b64c'; ctx.fillRect(x - 6, y - 9, 5, 6); ctx.fillRect(x + 2, y - 9, 5, 6);
      } else if (loc.key === 'pranzo') {
        ctx.fillStyle = '#e8e0d0'; ctx.fillRect(x - 14, y - 8, 28, 5);
        ctx.fillStyle = '#4a2a20'; ctx.fillRect(x - 12, y - 3, 4, 8); ctx.fillRect(x + 8, y - 3, 4, 8);
        ctx.fillStyle = '#e8b64c'; ctx.fillRect(x - 2, y - 14, 4, 5);
      } else if (loc.key === 'paese') {
        for (let i = 0; i < 3; i++) {
          ctx.fillStyle = '#2a2228'; ctx.fillRect(x - 16 + i * 12, y - 8, 10, 10);
          ctx.fillStyle = '#1a1418'; ctx.fillRect(x - 13 + i * 12, y - 5, 4, 5);
        }
        ctx.fillStyle = '#5a3038';
        ctx.beginPath(); ctx.moveTo(x - 18, y - 8); ctx.lineTo(x, y - 18); ctx.lineTo(x + 18, y - 8); ctx.closePath(); ctx.fill();
      } else if (loc.key === 'riflesso') {
        // la piscina capovolta: un rettangolo d'acqua col cielo dentro
        ctx.fillStyle = '#123040'; ctx.fillRect(x - 18, y - 12, 36, 20);
        ctx.fillStyle = '#8a2432';
        for (let dy = -5; dy <= 5; dy += 3) {
          const hw = Math.floor(Math.sqrt(25 - dy * dy) / 3) * 3;
          ctx.fillRect(x - hw, y - 2 + dy, hw * 2, 3);
        }
        ctx.fillStyle = 'rgba(200,220,235,.35)'; ctx.fillRect(x - 14, y - 9, 8, 2); ctx.fillRect(x + 4, y + 3, 9, 2);
      } else {
        ctx.fillStyle = '#c8a032'; ctx.fillRect(x - 8, y - 10, 16, 12);
      }
      ctx.fillStyle = cur && cur.key === loc.key ? '#e8b64c' : '#b09a9c';
      ctx.font = "10px 'Press Start 2P'";
      ctx.textAlign = 'center';
      ctx.font = "26px 'Press Start 2P'";
      /* Il numero sta sotto il luogo, tranne quando sotto c'è un altro luogo vicino:
         nel Relais «I Tornanti» e «Paternopoli» distano 29 px in orizzontale e 48 in
         verticale, e il numero del primo cadeva sull'icona del secondo. In quel caso
         il numero va SOPRA. Vale per tutti: se un giorno due luoghi si avvicinano,
         la pianta si aggiusta da sola. */
      const sottoOccupato = WORLD_MAP.some(altro => altro !== loc
        && Math.abs(altro.x * W - x) < 60
        && (altro.y * H - y) > 0 && (altro.y * H - y) < 70);
      ctx.fillText(String(WORLD_MAP.indexOf(loc) + 1), x, sottoOccupato ? y - 34 : y + 48);
      if (cur && cur.key === loc.key) {
        ctx.fillStyle = '#e8b64c';
        ctx.font = "16px 'Press Start 2P'";
        ctx.fillText('⭐', x, y - 30);
      }
      ctx.textAlign = 'left';
    }

    // la luna rossa in un angolo
    ctx.fillStyle = '#8a2432';
    for (let dy = -14; dy <= 14; dy += 3) {
      const hw = Math.floor(Math.sqrt(196 - dy * dy) / 3) * 3;
      ctx.fillRect(W - 44 - hw, 40 + dy, hw * 2, 3);
    }
  }

  /* ---------- menu ---------- */

  function showMenu() {
    const box = $('modal-generic-content');
    box.innerHTML = `<h2>☰ Menu</h2>
      <p style="color:var(--text-dim);margin-bottom:14px">💾 Salvataggio automatico a ogni scena — utente <b>${currentProfile()}</b>, <b>slot ${G.slot || 1}</b> di 3. Potete chiudere il browser e riprendere quando volete.</p>
      <button class="choice-btn" onclick="document.getElementById('modal-generic').classList.add('hidden')">▶ Torna alla partita</button>
      <button class="choice-btn" onclick="Engine.showDiary()">📔 Diario di viaggio</button>
      <button class="choice-btn" onclick="Engine.showBestiary()">🐺 Bestiario (nemici incontrati)</button>
      <button class="choice-btn" onclick="Engine.backToTitle()">🏠 Torna al titolo (la partita resta salvata)</button>
      <button class="choice-btn" style="border-left-color:var(--red)" onclick="Engine.confirmRestart()">🗑 Ricomincia da capo (cancella il salvataggio)</button>`;
    $('modal-generic').classList.remove('hidden');
  }

  function reviveUnlocked() {
    try { return localStorage.getItem('relais-notte-finita-' + encodeURIComponent(currentProfile())) === '1'; } catch (e) { return false; }
  }

  /* "Rivivi la Notte" con il CONTO di quello che manca, capitolo per capitolo:
     % di luoghi visti (cumulativi del profilo) e imprese ancora da sbloccare LÌ. */
  function chapterProgress() {
    const seen = seenScenes();
    // impresa → capitolo: si deduce dalla scena che imposta il suo flag (zero manutenzione)
    const flagScene = {};
    for (const [id, sc] of Object.entries(CAMPAIGN)) {
      for (const f of Object.keys(sc.sets || {})) if (!(f in flagScene)) flagScene[f] = id;
      for (const ch of sc.choices || []) for (const f of Object.keys(ch.sets || {})) if (!(f in flagScene)) flagScene[f] = id;
    }
    let collezione = new Set();
    try { collezione = new Set(JSON.parse(localStorage.getItem('relais-imprese-' + encodeURIComponent(currentProfile())) || '[]')); } catch (e) {}
    return (c) => {
      if (!c.prefixes) return null;
      const match = id => c.prefixes.some(p => id.startsWith(p));
      const ids = Object.keys(CAMPAIGN).filter(match);
      const viste = ids.filter(id => seen.has(id)).length;
      const imprese = (typeof IMPRESE !== 'undefined' ? IMPRESE : []).filter(i => flagScene[i.flag] && match(flagScene[i.flag]));
      const mancanti = imprese.filter(i => !collezione.has(i.flag));
      return { pct: Math.round(viste / Math.max(1, ids.length) * 100), viste, tot: ids.length, imprese: imprese.length, mancanti };
    };
  }

  function showRevive() {
    const box = $('modal-generic-content');
    const progress = chapterProgress();
    const rows = (typeof CHAPTERS !== 'undefined' ? CHAPTERS : []).map((c, i) => {
      const p = progress(c);
      let stato = '';
      if (p) {
        const done = p.pct >= 100 && !p.mancanti.length;
        const manca = p.mancanti.length
          ? ` · 🏆 mancano ${p.mancanti.length}: <i>${p.mancanti.slice(0, 3).map(m => m.title).join(' · ')}${p.mancanti.length > 3 ? ' · …' : ''}</i>`
          : (p.imprese ? ' · 🏆 imprese complete' : '');
        stato = `<br><span style="color:${done ? 'var(--green)' : 'var(--gold)'}">${done ? '✅ COMPLETO' : `👁 esplorato ${p.pct}% (${p.viste}/${p.tot} luoghi)`}${manca}</span>`;
      }
      return `<button class="choice-btn" onclick="Engine.startChapter(${i})">${c.label} <span class="choice-tag">${c.desc}${stato}</span></button>`;
    }).join('');
    const seenAll = seenScenes().size;
    const totAll = Object.keys(CAMPAIGN).length;
    box.innerHTML = `<h2>🗝 Rivivi la Notte</h2>
      <p style="color:var(--text-dim);margin-bottom:10px">Avete già visto un'alba: adesso il Belvedere vi lascia scegliere DA DOVE ricominciare — e vi dice QUANTO vi manca. Tutti e cinque presenti, zaino e conoscenze preparati per il capitolo scelto. Esplorazione totale del profilo: <b>${Math.round(seenAll / totAll * 100)}%</b> (${seenAll}/${totAll} luoghi).</p>
      ${rows}
      <button class="btn" style="margin-top:12px" onclick="document.getElementById('modal-generic').classList.add('hidden')">↩ Indietro</button>`;
    $('modal-generic').classList.remove('hidden');
  }

  function startChapter(i) {
    const c = (typeof CHAPTERS !== 'undefined') ? CHAPTERS[i] : null;
    if (!c) return;
    const tutti = ['gaetano', 'natalino', 'claudia', 'federico', 'emanuela'].map(id => ({ heroId: id, player: '' }));
    newGame(tutti);
    $('modal-generic').classList.add('hidden');
    if (c.flags) Object.assign(G.flags, c.flags);
    if (c.items) for (const it of c.items) G.inventory.push(it);
    gotoScene(c.scene || c.id);
  }

  function showDiary() {
    const box = $('modal-generic-content');
    const beats = (G.history || []).map((c, i) => `<div class="ability-box" style="border-left-color:var(--gold)"><div class="ability-desc">${i + 1}. ${c}</div></div>`).join('') ||
      '<p style="color:var(--text-dim)">Il diario è ancora bianco. Le grandi storie iniziano così.</p>';
    let sapete = '';
    if (typeof DIARY_FLAGS !== 'undefined') {
      const note = DIARY_FLAGS.filter(([f]) => G.flags && G.flags[f])
        .map(([, t]) => `<div class="ability-box" style="border-left-color:var(--purple)"><div class="ability-desc">🕯 ${t}</div></div>`).join('');
      sapete = `<h2 style="margin-top:16px">🕯 Cose che la notte vi ha insegnato</h2>
        ${note || '<p style="color:var(--text-dim)">Ancora niente. Ma la notte è lunga, e il Belvedere insegna volentieri.</p>'}`;
    }
    box.innerHTML = `<h2>📔 Diario di Viaggio</h2>
      <p style="color:var(--text-dim);margin-bottom:10px">Le tappe della vostra impresa, in ordine:</p>
      ${beats}
      ${sapete}
      <button class="btn" style="margin-top:12px" onclick="Engine.showMenu()">↩ Menu</button>`;
  }

  function showBestiary() {
    const box = $('modal-generic-content');
    const seen = G.seenEnemies || [];
    let html = `<h2>🕯 Le Creature del Belvedere</h2>
      <p style="color:var(--text-dim);margin-bottom:10px">Creature incontrate finora: ${seen.length}. Le altre vi stanno già aspettando.</p>`;
    if (!seen.length) html += '<p style="color:var(--text-dim)">Nessuno scontro finora. Beati voi.</p>';
    for (const key of seen) {
      const b = BESTIARY[key];
      if (!b) continue;
      html += `<div class="ability-box" style="display:flex;gap:12px;align-items:center">
        <canvas data-sprite="${b.sprite}" width="56" height="56" style="border:2px solid var(--border);background:#111;flex-shrink:0"></canvas>
        <div><span class="ability-name">${b.name}</span>${b.undead ? ' <span style="color:var(--purple)">· non-morto</span>' : ''}${b.boss ? ' <span style="color:var(--red)">· BOSS</span>' : ''}
        <div class="ability-desc">${b.flavor}<br>PV ${b.maxHp} · CA ${b.ac} · ${b.attack.name}</div></div>
      </div>`;
    }
    html += `<button class="btn" style="margin-top:12px" onclick="Engine.showMenu()">↩ Menu</button>`;
    box.innerHTML = html;
    box.querySelectorAll('canvas[data-sprite]').forEach(cv => Sprites.renderToCanvas(cv, Sprites.registry[cv.dataset.sprite]));
  }

  function backToTitle() {
    $('modal-generic').classList.add('hidden');
    showScreen('screen-title');
    Main.refreshTitle();
  }

  function confirmRestart() {
    const box = $('modal-generic-content');
    box.innerHTML = `<h2>⚠ Sicuri sicuri?</h2>
      <p style="margin-bottom:14px">Cancellerete il salvataggio e tutta la gloria accumulata. Per sempre.</p>
      <button class="choice-btn" onclick="Engine.doRestart()">🗑 Sì, ricominciamo da capo</button>
      <button class="choice-btn" onclick="Engine.showMenu()">↩ No, torna al menu</button>`;
  }

  function doRestart() {
    clearSave();
    $('modal-generic').classList.add('hidden');
    showScreen('screen-title');
    Main.refreshTitle();
  }

  /* ---------- finale ---------- */

  function renderEnding(scene) {
    const choicesEl = $('choices');
    const mins = Math.round((Date.now() - G.stats.start) / 60000);

    // epiloghi personali degli eroi
    const endingType = G.sceneId === 'e_custode' ? 'custode' : G.sceneId === 'e_penna' ? 'penna' : G.sceneId === 'e_smemorati' ? 'smemorati' : G.sceneId === 'e_ospiti' ? null : 'alba';
    if (typeof HERO_EPILOGUES !== 'undefined' && endingType) {
      const epi = document.createElement('div');
      epi.innerHTML = `<h3 style="font-family:var(--font-pixel);font-size:14px;color:var(--blue);margin:14px 0 8px">🌟 E i nostri eroi?</h3>` +
        G.party.map(h => {
          const text = HERO_EPILOGUES[h.id] && HERO_EPILOGUES[h.id][endingType];
          return text ? `<div class="ability-box"><span class="ability-name">${h.name}${h.player ? ' (' + h.player + ')' : ''}</span><div class="ability-desc">${text}</div></div>` : '';
        }).join('');
      choicesEl.appendChild(epi);
    }

    // cronache di Lumelia: il mondo ricorda le vostre scelte
    if (typeof CRONACA !== 'undefined') {
      const righe = CRONACA.filter(c => G.flags[c.flag]);
      if (righe.length) {
        const cron = document.createElement('div');
        cron.innerHTML = `<h3 style="font-family:var(--font-pixel);font-size:14px;color:var(--purple);margin:14px 0 8px">📜 Cronache di Lumelia — sei mesi dopo</h3>` +
          righe.map(c => `<div class="ability-box" style="border-left-color:var(--purple)"><div class="ability-desc">${c.icon} ${c.text}</div></div>`).join('');
        choicesEl.appendChild(cron);
      }
    }

    // imprese sbloccate
    // sblocca "Rivivi la Notte" per il profilo: da adesso ogni ramo è visitabile a scelta
    try { localStorage.setItem('relais-notte-finita-' + encodeURIComponent(currentProfile()), '1'); } catch (e) {}
    if (typeof IMPRESE !== 'undefined') {
      const unlocked = IMPRESE.filter(i => G.flags[i.flag]);
      // la COLLEZIONE del profilo: le imprese restano sbloccate tra una notte e l'altra
      let collezione = unlocked.map(i => i.flag);
      try {
        const key = 'relais-imprese-' + encodeURIComponent(currentProfile());
        const prima = JSON.parse(localStorage.getItem(key) || '[]');
        collezione = [...new Set([...prima, ...collezione])].filter(f => IMPRESE.some(i => i.flag === f));
        localStorage.setItem(key, JSON.stringify(collezione));
      } catch (e) { /* localStorage pieno o assente: la collezione resta di sessione */ }
      if (unlocked.length) {
        const nuove = unlocked.length, totale = collezione.length;
        const ach = document.createElement('div');
        ach.innerHTML = `<h3 style="font-family:var(--font-pixel);font-size:14px;color:var(--gold);margin:14px 0 8px">🏆 Imprese di stanotte (${nuove}/${IMPRESE.length}) — Collezione di ${currentProfile()}: ${totale}/${IMPRESE.length}</h3>` +
          unlocked.map(i => `<div class="ability-box" style="border-left-color:var(--gold)"><span class="ability-name">${i.icon} ${i.title}</span><div class="ability-desc">${i.desc}</div></div>`).join('') +
          (totale < IMPRESE.length ? `<p style="color:var(--text-dim);font-size:18px;margin:6px 0 10px">Le altre ${IMPRESE.length - totale} imprese vi aspettano in una nuova notte — e la collezione le RICORDA.</p>` : `<p style="color:var(--gold);font-size:18px;margin:6px 0 10px">🏆 COLLEZIONE COMPLETA: avete spremuto il Belvedere fino all'ultima goccia. Chapeau.</p>`);
        choicesEl.appendChild(ach);
      }
    }

    const div = document.createElement('div');
    div.innerHTML = `
      <div class="ability-box" style="border-left-color:var(--gold)">
        <span class="ability-name">📊 Cronaca dell'impresa</span>
        <div class="ability-desc">
          Sopravvissuti: ${G.party.map(h => h.name.split(' ')[0]).join(', ')}<br>
          Scontri vinti: ${G.stats.combats} · Prove superate: ${G.stats.checksPassed} · Prove fallite: ${G.stats.checksFailed} (le più memorabili)<br>
          Sangue Freddo: 🕯 ${G.gold} rimasti su ${G.stats.goldEarned || 0} messi insieme stanotte${G.stats.ritiriComprati ? ` · ${G.stats.ritiriComprati} second${G.stats.ritiriComprati === 1 ? 'o' : 'i'} tentativ${G.stats.ritiriComprati === 1 ? 'o' : 'i'} comprat${G.stats.ritiriComprati === 1 ? 'o' : 'i'} a nervi saldi` : ' · nessun ritiro comprato: il dado, stanotte, ha avuto l\'ultima parola'}<br>
          Durata: circa ${mins} minuti<br>
          Esplorazione del Belvedere: ${Math.round(Object.keys(G.enteredScenes || {}).length / Object.keys(CAMPAIGN).length * 100)}% (${Object.keys(G.enteredScenes || {}).length} luoghi su ${Object.keys(CAMPAIGN).length})<br>
          Nodi sciolti: ${['nodo_cantina','nodo_piano','nodo_pozzo'].filter(n => G.flags[n]).length}/3 ${G.flags.gregorio_umano ? '· 🍷 Gregorio è tornato umano' : ''} ${G.flags.ada_alleata ? '· 💍 Ada è vostra alleata' : ''}
        </div>
      </div>`;
    choicesEl.appendChild(div);

    /* Quello che il Belvedere non vi ha mostrato: suggerimenti SENZA spoiler,
       col capitolo giusto da cui ricominciare (la feature "cosa manca e dove"). */
    const progress = chapterProgress();
    const daFare = (typeof CHAPTERS !== 'undefined' ? CHAPTERS : [])
      .map(c => ({ c, p: progress(c) }))
      .filter(x => x.p && (x.p.pct < 100 || x.p.mancanti.length))
      .sort((a, b) => (b.p.mancanti.length - a.p.mancanti.length) || (a.p.pct - b.p.pct));
    if (daFare.length) {
      const sugg = document.createElement('div');
      sugg.innerHTML = `<h3 style="font-family:var(--font-pixel);font-size:14px;color:var(--green);margin:14px 0 8px">🗝 Quello che il Belvedere non vi ha mostrato</h3>` +
        daFare.slice(0, 4).map(({ c, p }) =>
          `<div class="ability-box" style="border-left-color:var(--green)"><span class="ability-name">${c.label}</span>
            <div class="ability-desc">👁 esplorato ${p.pct}% (${p.viste}/${p.tot} luoghi)${p.mancanti.length ? ` · 🏆 ${p.mancanti.length} impres${p.mancanti.length === 1 ? 'a' : 'e'} ancora là dentro: <i>${p.mancanti.slice(0, 3).map(m => m.title).join(' · ')}${p.mancanti.length > 3 ? ' · …' : ''}</i>` : ''}</div>
          </div>`).join('') +
        `<p style="color:var(--text-dim);font-size:18px;margin:6px 0 2px">Nessuno spoiler: solo i titoli. Con <b>🗝 Rivivi la Notte</b> partite dal capitolo giusto, con zaino e conoscenze già pronti — senza rigiocare tutto.</p>`;
      choicesEl.appendChild(sugg);
      const goRevive = document.createElement('button');
      goRevive.className = 'choice-btn';
      goRevive.style.borderLeftColor = 'var(--green)';
      goRevive.innerHTML = `🗝 <b>Rivivi la Notte</b> <span class="choice-tag">Scegliete il capitolo: il gioco vi dice quanto manca in ognuno.</span>`;
      goRevive.onclick = () => showRevive();
      choicesEl.appendChild(goRevive);
    } else if (typeof CHAPTERS !== 'undefined') {
      const done = document.createElement('div');
      done.innerHTML = `<div class="ability-box" style="border-left-color:var(--gold)"><span class="ability-name">🏆 100%</span><div class="ability-desc">Avete visto OGNI luogo e sbloccato OGNI impresa. Il Belvedere non ha più niente da nascondervi. Voi, a lui, non dovete più niente.</div></div>`;
      choicesEl.appendChild(done);
    }

    const replay = document.createElement('button');
    replay.className = 'choice-btn';
    replay.innerHTML = `🔄 <b>Nuova partita</b> <span class="choice-tag">Provate l'altra strada al bivio, un altro modo di entrare nel castello, un altro finale...</span>`;
    replay.onclick = () => { clearSave(); showScreen('screen-title'); Main.refreshTitle(); };
    choicesEl.appendChild(replay);

    const title = document.createElement('button');
    title.className = 'choice-btn';
    title.innerHTML = `🏠 Torna al titolo`;
    title.onclick = () => { showScreen('screen-title'); Main.refreshTitle(); };
    choicesEl.appendChild(title);
  }

  return {
    newGame, saveGame, loadGame, hasSave, clearSave, listSaves, firstFreeSlot,
    listProfiles, currentProfile, setCurrentProfile, deleteProfile, renameProfile, exportCode, importCode,
    showScreen, gotoScene, currentScene, renderPartyBar,
    showParty, showHeroSheet, showHeroSheetIdx, showInventory, showRules, showMap, showMenu, showDiary, showBestiary, showRevive, startChapter, reviveUnlocked,
    usePotionOutside, applyPotion, useAntidote, applyAntidote, inspectItem, backToTitle, confirmRestart, doRestart,
    riprendiDaCheckpoint, registraCaduta, haCheckpoint,
    // 🕯 il Sangue Freddo compra il secondo tentativo (usato da qui e da js/combat.js)
    costoRitiro, costoRitiroOra, puoiRitirare, spendiRitiro, ritiriDisponibili, muoviFreddo,
    heroSheetHTML, formatText,
  };
})();
