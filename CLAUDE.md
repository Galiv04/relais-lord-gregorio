# CLAUDE.md — Il Relais di Lord Gregorio

Horror interattivo in italiano per 1-5 giocatori. **Riusa il motore de "La Corona di Mezzanotte"**: la documentazione completa del motore, dello stile e del processo vive nel repo condiviso [Galiv04/dnd-motore](https://github.com/Galiv04/dnd-motore).

- **Live**: https://galiv04.github.io/relais-lord-gregorio/
- **Motore e guida di produzione**: `../dnd-motore/docs/` (`ARCHITETTURA.md`, `STILE-NARRATIVO.md`, `COME-CREARE-UNA-CAMPAGNA.md`, `LESSONS-LEARNED.md`, `PREFERENZE.md`, `PIPELINE-PRODUZIONE.md`)

## Cosa cambia rispetto alla Corona

| Aspetto | Relais |
|---|---|
| Tono | **Macabro cinematografico**: paura vera, twist macabri, umorismo nero nei dialoghi. Vedi `docs/STILE-NARRATIVO.md` della Corona per la voce base; qui il fallimento resta memorabile ma può COSTARE. |
| Protagonisti | I 5 amici reali (nomi di battesimo, lavori sfumati): Gaetano, Natalino, Claudia, Federico, Emanuela |
| Valuta | `G.gold` = **Sangue Freddo** 🕯 (coraggio del gruppo), non oro |
| Condizioni | `h.veleno` (−2 a prove e attacchi, si cura con `antidoto`) e `h.preso` (fuori gioco finché non liberato; `freeAll: true` nelle scene libera tutti). Effetti scena: `poisonRoller` / `captureRoller` colpiscono `G.lastRoller` (mai l'ultimo attivo) |
| Nemici | `undead: true` = creatura della villa → Colpo di Phon e sale = danni doppi |
| Finali | `e_alba` (rituale/vittoria), `e_custode` (uno resta — scelta), `e_ospiti` (resa — subìto), `e_smemorati` (un ricordo a testa), `e_penna` (il segreto della cripta: Gregorio rompe la penna — CAR 14), `e_custode_gregorio` (la Firma Volontaria: con gregorio_vacilla, lui ferma la mano) |
| Struttura | Prologo → piscina → hub `h1` con TRE piste NON esclusive (cantina `k*`, piano `u*`, pozzo `b*`) → Banchetto `z*` |
| Localizzazione | **Geografia reale** (richiesta di Gali, ago 2026): il Belvedere sta sopra **Paternopoli** (AV); si parte da **Minturno**; itinerario Domiziana → A16 → autogrill di Baiano → uscita per il Passo di Mirabella (ultimo distributore, quello di Gennaro) → Fontanarosa → tornanti per Paternopoli. Il Belvedere resta inventato. |

## Capacità del motore aggiunte in questo gioco (non presenti nella Corona)

Per le prossime campagne, il motore di QUESTO repo è il più avanzato. Novità utilizzabili:

- **Scelte**: `requires: { flag, flag2, notFlag, item, item2, notItem }` (tutte in AND — flag2 nato per la capitolazione: due conquiste insieme) · `removeItem` + `removeItem2` · `once: true` (sparisce dopo l'uso)
- **Oggetti da combattimento**: `combat: { dice, holy, distract, all, calm }` + `distractText` (testo di stordimento per oggetto) · `usable+heal` = pozione
- **Scene**: `stinger: '<nome>'` suona un effetto alla prima visita (VALIDATO: deve esistere in sound.js) · `damage`/`heal`/`freeAll`/`fullHeal`/`recharge` · `poisonRoller`/`captureRoller` su `G.lastRoller`
- **Sprite**: mappe 16x16 **o 32x32** (stesso ingombro, `drawSprite` normalizza) · uno sprite può riusare la mappa di un altro con palette diversa (vedi `donmichele`)
- **Scaling**: "porzioni ridotte" per gruppi 1-2 (auto) · difficoltà `facile`/`normale`/`incubo`
- **Meta-progressione**: `DIARY_FLAGS` (conoscenze nel diario) · `IMPRESE` con collezione persistente per profilo · `CRONACA` (epiloghi mondiali per flag) · `HERO_EPILOGUES` con un set per TIPO di finale · `CHAPTERS` + `Engine.showRevive()` ("Rivivi la Notte", sbloccato al primo finale)
- **Eclissi**: `moon(..., eclipse=true)` usa la fase di `Engine.eclipsePhaseFor(sceneId)` — la luna cresce e si arrossa con l'orologio della notte
- **Echi dei flag nei boss** (js/combat.js, blocco d'apertura del combattimento): `sorpresa`, `rituale_fatto`, `gregorio_umano`, `cucina_in_sciopero`, `cerchio_di_porcellana`, `menu_dei_vivi` — il posto giusto per far pesare in battaglia le scelte della notte
- **"Cosa manca e dove"** (agosto 2026, portata dalla Casa che non Finisce): `seenScenes`/`markSeen` in engine.js tracciano le scene viste CUMULATIVE per profilo; `chapterProgress()` calcola per capitolo la % di stanze viste (dai `prefixes` dei CHAPTERS) e le imprese mancanti, dedotte automaticamente dalla scena che imposta il flag; "Rivivi la Notte" mostra lo stato per capitolo e il finale mostra "🗝 Quello che il Belvedere non vi ha mostrato" (solo titoli: nessuno spoiler) col salto diretto al capitolo. Se si aggiungono scene o capitoli, aggiornare i `prefixes` dei CHAPTERS.
- **Minigiochi** (ago 2026, riusabile): `js/minigames.js` + `scene.minigame {type, hero, success, fail, config}` — tipi: corsa/indovinello/memoria/calcolo/filastrocca. Nel Relais: corsa delle siepi (b1), valzer del '24 (mg_valzer), ninna nanna delle bambole (u3_ninna), conti del Contabile (mg_conti). Il validatore segue gli archi minigame; il bot headless simula l'esito (`scenario.minigames`). Doc: `../dnd-motore/docs/MINIGIOCHI.md`
- **Checkpoint ai nodi**: `CHECKPOINT_FLAGS` in campaign.js — la prima volta che si completa un nodo il motore cura e ricarica il gruppo (modale). **Spaccio del Contabile** (os_spaccio, rivisitabile da h1): il Sangue Freddo si spende in cure/oggetti; su 'normale' i nemici hanno +12% PV per compensare.
- **4 validatori di coerenza** (tests/validate.mjs): flag di imprese/cronache/diario impostabili · stinger esistenti in sound.js · sprite/palette coerenti · capitoli di Rivivi la Notte con destinazioni e zaini validi — tenerli verdi previene le classi di bug trovate durante la produzione. Regola d'oro: **ogni flag narrativo deve avere un consumatore** (meccanica, diario, impresa o cronaca)

## Comandi

```bash
node tests/validate.mjs      # 16 controlli statici
node tests/playthrough.mjs   # partite simulate headless
```

Regole operative identiche alla Corona: **test verdi prima di ogni push** (e da agosto 2026 la CI di GitHub li riesegue a ogni push: badge nel README), audit visivo con `__audit`/`__auditGrid` (banco di prova iniettabile da console sul sito live), niente localhost su questa macchina, push con `curloptResolve` (già configurato), cache Pages ~10 minuti.

## Attenzione ai contenuti

I personaggi sono persone reali: mantenere i ritratti **affettuosi** — mai umiliare, mai dettagli privati riconoscibili oltre ai nomi di battesimo. Lord Gregorio è un personaggio di finzione gotica: nessun riferimento a persone reali oltre al nome dello scherzo.

## 🔎 Guardare le grafiche: strumenti, non pazienza

Prima di toccare un painter e prima di dire che una scena è a posto:

```bash
node ../dnd-motore/tools/fondali-in-png.mjs                 # tutti in /tmp/fondali
node ../dnd-motore/tools/fondali-in-png.mjs --solo nome     # uno, subito
node ../dnd-motore/tools/fondali-in-png.mjs --provino       # tutti su una lastra
node ../dnd-motore/tools/fondali-in-png.mjs --sfondo '#ff00ff'   # i buchi si vedono
node ../dnd-motore/tools/fondali-in-png.mjs --pulisci       # e si buttano
```

`tools/provino.html` fa la stessa cosa nel browser (anche da telefono, via Pages) con
fondo magenta, scala e velo di profondità.

**Le tre regole che valgono più di ogni ritocco** (lezioni 58-62):
1. **Un fondale ha UN soggetto**, grande almeno un terzo dell'inquadratura, più due o
   tre elementi di contesto sopra i cento pixel. Sotto i sessanta pixel un oggetto non
   dice cosa è, dice solo che c'è.
2. **Le proporzioni delle cose vere si cercano, non si stimano** — e un oggetto che dopo
   due tentativi non si riconosce si TOGLIE, non si ritocca una terza volta.
3. **Il quadro deve mostrare quello che il testo dice.** Si rilegge la scena, si segnano
   le cose che nomina, e si verifica che ci siano tutte.
