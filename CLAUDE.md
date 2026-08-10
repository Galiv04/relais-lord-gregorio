# CLAUDE.md — Il Relais di Lord Gregorio

Horror interattivo in italiano per 1-5 giocatori. **Riusa il motore de "La Corona di Mezzanotte"**: la documentazione completa del motore, dello stile e del processo vive là.

- **Live**: https://galiv04.github.io/relais-lord-gregorio/
- **Motore e guida di produzione**: `../dnd-corona-di-mezzanotte/CLAUDE.md` (+ `docs/ARCHITETTURA.md`, `docs/STILE-NARRATIVO.md`, `docs/COME-CREARE-UNA-CAMPAGNA.md`, `docs/LESSONS-LEARNED.md`, `docs/PREFERENZE.md`)

## Cosa cambia rispetto alla Corona

| Aspetto | Relais |
|---|---|
| Tono | **Macabro cinematografico**: paura vera, twist macabri, umorismo nero nei dialoghi. Vedi `docs/STILE-NARRATIVO.md` della Corona per la voce base; qui il fallimento resta memorabile ma può COSTARE. |
| Protagonisti | I 5 amici reali (nomi di battesimo, lavori sfumati): Gaetano, Natalino, Claudia, Federico, Emanuela |
| Valuta | `G.gold` = **Sangue Freddo** 🕯 (coraggio del gruppo), non oro |
| Condizioni | `h.veleno` (−2 a prove e attacchi, si cura con `antidoto`) e `h.preso` (fuori gioco finché non liberato; `freeAll: true` nelle scene libera tutti). Effetti scena: `poisonRoller` / `captureRoller` colpiscono `G.lastRoller` (mai l'ultimo attivo) |
| Nemici | `undead: true` = creatura della villa → Colpo di Phon e sale = danni doppi |
| Finali | `e_alba` (rituale/vittoria), `e_custode` (uno resta — scelta), `e_ospiti` (resa — subìto), `e_smemorati` (un ricordo a testa), `e_penna` (il segreto della cripta: Gregorio rompe la penna — CAR 14) |
| Struttura | Prologo → piscina → hub `h1` con TRE piste NON esclusive (cantina `k*`, piano `u*`, pozzo `b*`) → Banchetto `z*` |
| Localizzazione | Pietrafonda e il Belvedere sono inventati; la geografia è irpina generica |

## Capacità del motore aggiunte in questo gioco (non presenti nella Corona)

Per le prossime campagne, il motore di QUESTO repo è il più avanzato. Novità utilizzabili:

- **Scelte**: `requires: { flag, notFlag, item, item2, notItem }` (tutte in AND) · `removeItem` + `removeItem2` · `once: true` (sparisce dopo l'uso)
- **Oggetti da combattimento**: `combat: { dice, holy, distract, all, calm }` + `distractText` (testo di stordimento per oggetto) · `usable+heal` = pozione
- **Scene**: `stinger: '<nome>'` suona un effetto alla prima visita (VALIDATO: deve esistere in sound.js) · `damage`/`heal`/`freeAll`/`fullHeal`/`recharge` · `poisonRoller`/`captureRoller` su `G.lastRoller`
- **Sprite**: mappe 16x16 **o 32x32** (stesso ingombro, `drawSprite` normalizza) · uno sprite può riusare la mappa di un altro con palette diversa (vedi `donmichele`)
- **Scaling**: "porzioni ridotte" per gruppi 1-2 (auto) · difficoltà `facile`/`normale`/`incubo`
- **Meta-progressione**: `DIARY_FLAGS` (conoscenze nel diario) · `IMPRESE` con collezione persistente per profilo · `CRONACA` (epiloghi mondiali per flag) · `HERO_EPILOGUES` con un set per TIPO di finale · `CHAPTERS` + `Engine.showRevive()` ("Rivivi la Notte", sbloccato al primo finale)
- **Eclissi**: `moon(..., eclipse=true)` usa la fase di `Engine.eclipsePhaseFor(sceneId)` — la luna cresce e si arrossa con l'orologio della notte
- **Echi dei flag nei boss** (js/combat.js, blocco d'apertura del combattimento): `sorpresa`, `rituale_fatto`, `gregorio_umano`, `cucina_in_sciopero`, `cerchio_di_porcellana`, `menu_dei_vivi` — il posto giusto per far pesare in battaglia le scelte della notte
- **4 validatori di coerenza** (tests/validate.mjs): flag di imprese/cronache/diario impostabili · stinger esistenti in sound.js · sprite/palette coerenti · capitoli di Rivivi la Notte con destinazioni e zaini validi — tenerli verdi previene le classi di bug trovate durante la produzione. Regola d'oro: **ogni flag narrativo deve avere un consumatore** (meccanica, diario, impresa o cronaca)

## Comandi

```bash
node tests/validate.mjs      # 16 controlli statici
node tests/playthrough.mjs   # partite simulate headless
```

Regole operative identiche alla Corona: **test verdi prima di ogni push** (e da agosto 2026 la CI di GitHub li riesegue a ogni push: badge nel README), audit visivo con `__audit`/`__auditGrid` (banco di prova iniettabile da console sul sito live), niente localhost su questa macchina, push con `curloptResolve` (già configurato), cache Pages ~10 minuti.

## Attenzione ai contenuti

I personaggi sono persone reali: mantenere i ritratti **affettuosi** — mai umiliare, mai dettagli privati riconoscibili oltre ai nomi di battesimo. Lord Gregorio è un personaggio di finzione gotica: nessun riferimento a persone reali oltre al nome dello scherzo.
