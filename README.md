# 🕯 Il Relais di Lord Gregorio

**Un horror interattivo in stile D&D per 1-5 giocatori, con Narratore automatico. I protagonisti? Voi.**

🎮 **Gioca subito:** https://galiv04.github.io/relais-lord-gregorio/

## Cos'è

Cinque amici — due coppie e un parrucchiere single con delle ottime forbici — partono per un weekend in un relais sui monti d'Irpinia. Il posto è bellissimo. Il padrone di casa, Lord Gregorio, è l'ospite perfetto. La piscina, di sera, è un sogno.

C'è solo un dettaglio: **il Belvedere prende un gruppo di ospiti ogni venticinque anni.** E il registro, alla vostra pagina, dice già *"soggiorno: completo"*.

- 🎭 **5 protagonisti = voi**: ognuno interpreta sé stesso, con abilità nate dal proprio mestiere (le forbici professionali contano, in certe notti)
- 🎙 **Narratore automatico**: racconta, propone scelte macabre, tira i dadi, arbitra gli scontri
- 🗺 **71 scene**: l'arrivo, la cena, la sera in piscina col riflesso sbagliato, tre piste nella notte (la cantina, il piano proibito, il pozzo) e il Banchetto dell'alba
- 🌒 **3 finali**: uno si conquista, uno si sceglie (e non se ne parlerà mai più), uno si subisce
- ☠ **Condizioni, non morti**: al Belvedere nessuno muore — si viene avvelenati dal freddo, presi dalla casa, appesi alle pareti. Gli amici possono salvarti. Di solito.
- ⚔ Combattimenti a turni semplificati in stile D&D · 📖 regole in un click · 💾 salvataggio automatico su 3 slot con profili · 🎵 colonna sonora chiptune (dal carillon al valzer marcio del Banchetto) · 🕹 pixel art via canvas, zero dipendenze

## Come si gioca

1. Sera. Un solo schermo. Possibilmente a bordo piscina.
2. Ognuno seleziona sé stesso. Chi manca "non è partito".
3. Leggete ad alta voce, discutete, scegliete, tirate i dadi.
4. Durata: **2-3 ore.** Rigiocabile: le piste e i finali cambiano la notte.

## Sviluppo

Sito statico (HTML/CSS/JS vanilla, zero build). Motore di gioco condiviso con [La Corona di Mezzanotte](https://github.com/Galiv04/dnd-corona-di-mezzanotte).

```bash
node tests/validate.mjs      # controlli statici: grafo scene, dati, sprite, bilanciamento
node tests/playthrough.mjs   # partite complete simulate headless
```

---

*Creato con Claude Code. Non aprite a chi bussa con la voce di qualcuno che è già dentro. — G.*
