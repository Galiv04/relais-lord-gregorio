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
      history: [],       // tappe della storia (per il riepilogo alla ripresa)
      seenEnemies: [],   // nemici incontrati (per il bestiario)
      slot,
      difficulty,
      stats: { combats: 0, checksPassed: 0, checksFailed: 0, scenes: 0, start: Date.now() },
    };
    for (const h of G.party) {
      G.uses[h.id] = {};
      for (const ab of h.abilities) G.uses[h.id][ab.id] = ab.uses;
    }
    saveGame();
    gotoScene(CAMPAIGN_START);
    if (solo) {
      const box = $('modal-generic-content');
      box.innerHTML = `<h2>🌒 Modalità Sopravvissuto</h2>
        <p style="margin-bottom:12px">${G.party[0].name} affronta il Belvedere DA SOLO. Che incoscienza. Che stile. La notte concede:</p>
        <div class="ability-box"><span class="ability-name">❤ +10 PV massimi e +1 CA</span></div>
        <div class="ability-box"><span class="ability-name">✨ +1 uso a ogni abilità speciale</span></div>
        <div class="ability-box"><span class="ability-name">🎒 Il kit di Emanuela e la grappa del nonno già in borsa</span></div>
        <p style="color:var(--text-dim);margin-top:10px">Consiglio del narratore: nei film horror il gruppo si divide. Tu SEI già diviso. Compensa con la prudenza.</p>
        <button class="btn btn-gold" style="margin-top:12px" onclick="document.getElementById('modal-generic').classList.add('hidden')">🌙 Che la notte cominci</button>`;
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

  function gotoScene(id) {
    if (id === 'RETRY_COMBAT') id = G.lastCombatSceneId || CAMPAIGN_START;
    const scene = CAMPAIGN[id];
    if (!scene) { console.error('Scena mancante:', id); return; }
    G.sceneId = id;
    G.stats.scenes++;

    const firstVisit = !G.enteredScenes[id];
    G.enteredScenes[id] = true;

    // effetti d'ingresso (solo alla prima visita)
    if (firstVisit) {
      if (scene.sets) Object.assign(G.flags, scene.sets);
      if (scene.rep) G.flags.reputazione = (G.flags.reputazione || 0) + scene.rep;
      if (scene.gold) G.gold = Math.max(0, G.gold + scene.gold);
      if (scene.goldLoss) G.gold = Math.max(0, G.gold - scene.goldLoss);
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
      if (!firstVisit && scene.goldLoss) G.gold = Math.max(0, G.gold - scene.goldLoss);
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
    $('hud-location').textContent = '📍 ' + (scene.caption || '');
    Scenes.paint('scene-canvas', scene.location, null, scene.npc);
    $('scene-caption').textContent = scene.caption || '';

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
      if (c.requires.notFlag && G.flags[c.requires.notFlag]) return false;
      if (c.requires.item && !G.inventory.includes(c.requires.item)) return false;
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
      if (poor) inner += ` <span class="choice-tag">(vi servono ${c.requiresGold} monete — ne avete ${G.gold})</span>`;
      b.innerHTML = inner;
      b.disabled = !!poor;
      b.onclick = () => resolveChoice(scene, c);
      choicesEl.appendChild(b);
    }
  }

  function resolveChoice(scene, c) {
    if (typeof Sound !== 'undefined') Sound.play(c.item ? 'item' : c.gold ? 'gold' : 'click');
    if (c.once) {
      if (!G.usedChoices[G.sceneId]) G.usedChoices[G.sceneId] = [];
      G.usedChoices[G.sceneId].push(c.text);
    }
    if (c.gold) G.gold = Math.max(0, G.gold + c.gold);
    if (c.item) G.inventory.push(c.item);
    if (c.removeItem) {
      const i = G.inventory.indexOf(c.removeItem);
      if (i >= 0) G.inventory.splice(i, 1);
    }
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
        const rollIt = (isReroll) => Dice.showRoll({
          title: `${h.name} ${isReroll ? 'RITIRA (l\'Asso di Denari!)' : 'tenta'}:<br>${STAT_NAMES[check.stat]} — CD ${check.dc}`,
          mod, dc: check.dc,
          onDone: res => {
            if (!res.success && !isReroll && G.inventory.includes('asso_di_denari')) {
              return offerReroll(() => {
                const i = G.inventory.indexOf('asso_di_denari');
                if (i >= 0) G.inventory.splice(i, 1);
                saveGame();
                rollIt(true);
              }, () => {
                G.stats.checksFailed++;
                gotoScene(check.fail);
              });
            }
            if (res.success) G.stats.checksPassed++; else G.stats.checksFailed++;
            gotoScene(res.success ? check.success : check.fail);
          },
        });
        rollIt(false);
      };
      box.appendChild(b);
    });
    $('modal-generic').classList.remove('hidden');
  }

  // proposta di ritiro con l'Asso di Denari dei reduci del 1949
  function offerReroll(onYes, onNo) {
    const box = $('modal-generic-content');
    box.innerHTML = `<h2>🃏 L'Asso di Denari scalda la tasca...</h2>
      <p style="margin-bottom:12px">La prova è fallita, ma in tasca l'Asso dei reduci del '49 <i>scotta</i>. Settant'anni di fortuna, un uso solo. Questo momento lo merita?</p>
      <button class="choice-btn" id="btn-reroll-yes">🃏 <b>SÌ: i reduci vi prestano la loro fortuna!</b> (consuma l'Asso di Denari)</button>
      <button class="choice-btn" id="btn-reroll-no">🙅 No, accettate il fato: sarà per un momento più importante</button>`;
    $('modal-generic').classList.remove('hidden');
    $('btn-reroll-yes').onclick = () => { $('modal-generic').classList.add('hidden'); onYes(); };
    $('btn-reroll-no').onclick = () => { $('modal-generic').classList.add('hidden'); onNo(); };
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
        <span class="hp-text">${h.preso ? '🕸 PRESO' : h.down ? 'A TERRA' : (h.veleno ? '☠ ' : '') + h.hp + '/' + h.maxHp + ' PV'}</span>`;
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
    return `
      <h2>${h.name}</h2>
      <p style="color:var(--blue);font-size:20px">${h.class} — <i>${h.tagline}</i></p>
      ${h.player ? `<p style="color:var(--text-dim)">Giocato da: <b>${h.player}</b></p>` : ''}
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

  function showParty() {
    const box = $('modal-generic-content');
    box.innerHTML = `<h2>🎭 La Compagnia</h2>` +
      G.party.map((h, i) => `<div class="ability-box" style="cursor:pointer" onclick="Engine.showHeroSheetIdx(${i})">
        <span class="ability-name">${h.name}</span> — ${h.class}${h.player ? ' · ' + h.player : ''}
        <div class="ability-desc">PV ${h.hp}/${h.maxHp} · CA ${h.ac} ${h.down ? '· 💀 A TERRA' : ''} — <i>tocca per la scheda completa</i></div>
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
      return `<div class="inv-item"><span class="inv-name">${item.name}${n > 1 ? ' ×' + n : ''}</span><span class="inv-desc">${item.desc}</span>${useBtn}</div>`;
    }).join('') || '<p style="color:var(--text-dim)">Lo zaino è vuoto. Succede ai migliori.</p>';
    box.innerHTML = `<h2>🎒 Le Vostre Cose</h2>
      <div class="gold-display">🕯 Sangue Freddo: ${G.gold}</div>
      ${itemsHtml}
      <button class="btn" style="margin-top:14px" onclick="document.getElementById('modal-generic').classList.add('hidden')">✔ Chiudi</button>`;
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

  function showMap() {
    const box = $('modal-generic-content');
    box.innerHTML = `<h2>🗺 Il Belvedere — pianta della proprietà</h2><canvas id="map-canvas" width="720" height="480"></canvas>
      <p style="color:var(--text-dim);font-size:19px;margin-top:8px">⭐ = dove siete adesso. La nebbia segna il confine: di notte, il confine è ovunque.</p>
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
      ctx.fillText(loc.label, x, y + 26);
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

  function showDiary() {
    const box = $('modal-generic-content');
    const beats = (G.history || []).map((c, i) => `<div class="ability-box" style="border-left-color:var(--gold)"><div class="ability-desc">${i + 1}. ${c}</div></div>`).join('') ||
      '<p style="color:var(--text-dim)">Il diario è ancora bianco. Le grandi storie iniziano così.</p>';
    box.innerHTML = `<h2>📔 Diario di Viaggio</h2>
      <p style="color:var(--text-dim);margin-bottom:10px">Le tappe della vostra impresa, in ordine:</p>
      ${beats}
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
    const endingType = G.sceneId === 'e_custode' ? 'custode' : G.sceneId === 'e_ospiti' ? null : 'alba';
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
    if (typeof IMPRESE !== 'undefined') {
      const unlocked = IMPRESE.filter(i => G.flags[i.flag]);
      if (unlocked.length) {
        const ach = document.createElement('div');
        ach.innerHTML = `<h3 style="font-family:var(--font-pixel);font-size:14px;color:var(--gold);margin:14px 0 8px">🏆 Imprese sbloccate (${unlocked.length}/${IMPRESE.length})</h3>` +
          unlocked.map(i => `<div class="ability-box" style="border-left-color:var(--gold)"><span class="ability-name">${i.icon} ${i.title}</span><div class="ability-desc">${i.desc}</div></div>`).join('') +
          `<p style="color:var(--text-dim);font-size:18px;margin:6px 0 10px">Le altre ${IMPRESE.length - unlocked.length} imprese vi aspettano in una nuova partita...</p>`;
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
          Sangue Freddo finale: 🕯 ${G.gold} · Durata: circa ${mins} minuti<br>
          Esplorazione del Belvedere: ${Math.round(Object.keys(G.enteredScenes || {}).length / Object.keys(CAMPAIGN).length * 100)}% (${Object.keys(G.enteredScenes || {}).length} luoghi su ${Object.keys(CAMPAIGN).length})<br>
          Nodi sciolti: ${['nodo_cantina','nodo_piano','nodo_pozzo'].filter(n => G.flags[n]).length}/3 ${G.flags.gregorio_umano ? '· 🍷 Gregorio è tornato umano' : ''} ${G.flags.ada_alleata ? '· 💍 Ada è vostra alleata' : ''}
        </div>
      </div>`;
    choicesEl.appendChild(div);

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
    showParty, showHeroSheet, showHeroSheetIdx, showInventory, showRules, showMap, showMenu, showDiary, showBestiary,
    usePotionOutside, applyPotion, useAntidote, applyAntidote, backToTitle, confirmRestart, doRestart,
    heroSheetHTML, formatText,
  };
})();
