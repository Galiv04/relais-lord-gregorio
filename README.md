# 🕯 Il Relais di Lord Gregorio

**Un horror interattivo in stile D&D per 1-5 giocatori, con Narratore automatico. I protagonisti? Voi.**

🎮 **Gioca subito:** https://galiv04.github.io/relais-lord-gregorio/ · [![Test del Belvedere](https://github.com/Galiv04/relais-lord-gregorio/actions/workflows/tests.yml/badge.svg)](https://github.com/Galiv04/relais-lord-gregorio/actions/workflows/tests.yml)

## Cos'è

Cinque amici — due coppie e un parrucchiere single con delle ottime forbici — partono per un weekend in un relais sui monti d'Irpinia. Il posto è bellissimo. Il padrone di casa, Lord Gregorio, è l'ospite perfetto. La piscina, di sera, è un sogno.

C'è solo un dettaglio: **il Belvedere prende un gruppo di ospiti ogni venticinque anni.** E il registro, alla vostra pagina, dice già *"soggiorno: completo"*.

- 🎭 **5 protagonisti = voi**: ognuno interpreta sé stesso, con abilità nate dal proprio mestiere (le forbici professionali contano, in certe notti)
- 🎙 **Narratore automatico**: racconta, propone scelte macabre, tira i dadi, arbitra gli scontri
- 🗺 **Oltre 160 scene, ~35.000 parole**: l'autogrill di Baiano, il paese di Pietrafonda, la sera in piscina col riflesso sbagliato, tre piste nella notte (la cantina con l'ossario, il piano proibito fino alla soffitta, il pozzo e il garage), la **Strada che Torna** (i tornanti sono un anello — e vederlo cambia il finale), il mondo capovolto del **Riflesso** e il Banchetto dell'alba
- 🌒 **5 finali**: uno si conquista, uno si sceglie (e non se ne parlerà mai più), uno si subisce, uno si dimentica... e uno non era nemmeno previsto dal Belvedere: lo scrivete voi
- ☠ **Condizioni, non morti**: al Belvedere nessuno muore — si viene avvelenati dal freddo, presi dalla casa, appesi alle pareti. Gli amici possono salvarti. Di solito.
- 🎒 **Oltre 30 oggetti**, metà con effetti veri: l'Asso di Denari dei reduci ritira una prova fallita, la Lanterna del 1899 fa esitare le creature (e addormenta le bambole), il Nastro del '74 le ferma ad ascoltare (o ammansisce lo Chef — scegliete voi)
- 🔗 **Le piste si parlano**: ciò che scoprite in una apre strade nelle altre, e le gentilezze seminate nella notte tornano come alleati al Banchetto. Un 📔 Diario della Notte tiene il conto di ciò che sapete
- ⚖ **Tre difficoltà** (Tranquilla / Normale / Incubo) e **porzioni ridotte** in 1-2 giocatori — giocabile anche in solitaria
- 🗝 **Rivivi la Notte**: dopo il primo finale, 11 capitoli d'ingresso per giocare piste, segreti e finali che vi siete persi — con zaino e conoscenze già pronti
- 🏆 **Oltre 40 imprese con collezione persistente** per profilo: il Belvedere tiene il registro degli ospiti, voi tenete il suo
- ⚔ Combattimenti a turni in stile D&D, con **musica di battaglia diversa per luogo** · 📖 regole in un click · 💾 salvataggio automatico su 3 slot con profili + codici di esportazione tra dispositivi · 🎵 colonna sonora chiptune che cambia con la scena (dal carillon al valzer marcio del Banchetto) · 🕹 pixel art via canvas ispirata al vero relais irpino · zero dipendenze

## Come si gioca

1. Sera. Un solo schermo. Possibilmente a bordo piscina.
2. Ognuno seleziona sé stesso. Chi manca "non è partito".
3. Leggete ad alta voce, discutete, scegliete, tirate i dadi.
4. Durata: **almeno 4 ore** seguendo una pista; **fino a 6** esplorando tutto — Pietrafonda, il Riflesso, le scene di coppia, i cinque finali. Rigiocabile: le piste e i finali cambiano la notte.

⚠️ Linguaggio da adulti e paura vera: è la vostra vacanza, ma nella versione in cui qualcosa è andato molto storto.

## Sviluppo

Sito statico (HTML/CSS/JS vanilla, zero build). Motore di gioco condiviso con [La Corona di Mezzanotte](https://github.com/Galiv04/dnd-corona-di-mezzanotte).

```bash
node tests/validate.mjs      # controlli statici: grafo scene, dati, sprite, bilanciamento
node tests/playthrough.mjs   # oltre 150 partite complete simulate headless, 5/5 finali coperti
```

---

*Creato con Claude Code. Non aprite a chi bussa con la voce di qualcuno che è già dentro. — G.*
