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
| Finali | `e_alba` (rituale/vittoria), `e_custode` (uno resta — scelta), `e_ospiti` (resa — subìto) |
| Struttura | Prologo → piscina → hub `h1` con TRE piste NON esclusive (cantina `k*`, piano `u*`, pozzo `b*`) → Banchetto `z*` |
| Localizzazione | Pietrafonda e il Belvedere sono inventati; la geografia è irpina generica |

## Comandi

```bash
node tests/validate.mjs      # 16 controlli statici
node tests/playthrough.mjs   # partite simulate headless
```

Regole operative identiche alla Corona: **test verdi prima di ogni push**, audit visivo con `__audit`/`__auditGrid` (banco di prova iniettabile da console sul sito live), niente localhost su questa macchina, push con `curloptResolve` (già configurato), cache Pages ~10 minuti.

## Attenzione ai contenuti

I personaggi sono persone reali: mantenere i ritratti **affettuosi** — mai umiliare, mai dettagli privati riconoscibili oltre ai nomi di battesimo. Lord Gregorio è un personaggio di finzione gotica: nessun riferimento a persone reali oltre al nome dello scherzo.
