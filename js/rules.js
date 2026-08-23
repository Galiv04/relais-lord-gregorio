/* ============ REGOLE — guida rapida e "come si gioca" ============ */

const RULES_STORY = `
<h3>🚗 Dove siete</h3>
<p>Ferragosto. Cinque amici in macchina — <b>Gaetano, Natalino, Claudia, Federico, Emanuela</b> — con le valigie sopra le ginocchia e la scorta di taralli razionata con criteri militari. Quattro giorni di ferie vere, lontano dal caos: piscina, mangiate, il programma delle colazioni già concordato e già contestato.</p>
<p>Federico ha prenotato lui: <b>Relais Belvedere</b>, cinque stelle, "un AFFARE, ragazzi". È su una montagna dell'Irpinia, sopra un paese di quarantuno abitanti con tutte le persiane chiuse. Su Google Maps, la foto satellitare del relais è una chiazza sfocata. Il bosco intorno, nitido che si contano le foglie.</p>

<h3>🕯 Cosa sta succedendo</h3>
<p>Il relais è bellissimo. Davvero: il padrone di casa — <b>Lord Gregorio</b>, completo di lino, mani curate, una gentilezza da altro secolo — vi porta le valigie tutte insieme e vi tratta come ospiti attesi da tempo.</p>
<p>Ecco: <i>attesi</i>. Perché nel registro alla reception, sotto le firme di gruppi di altre epoche, c'è già una riga pronta. E in fondo al giardino c'è un pozzo che il benzinaio giù in valle vi ha sconsigliato con troppa precisione per essere un caso.</p>

<h3>🌒 Cosa vi aspetta</h3>
<p>Una notte sola, dal tramonto all'alba, dentro una casa che vi ha già inclusi nei suoi programmi. Tre strade da esplorare in libertà — la cantina, il piano che il padrone chiede di non visitare, il giardino col pozzo — un paese che sa tutto e non parla, e sei modi diversi in cui questa notte può finire.</p>
<p>Nessuno di voi è un eroe. Avete forbici professionali, un phon da 2200 watt, una borsa di prodotti per capelli e un ottimo istinto per le vibrazioni sbagliate. Basterà? Dipende da quello che deciderete di fare quando la casa sarà gentile con voi.</p>

<h3>🎲 Cosa serve al tavolo</h3>
<p>Da uno a cinque giocatori, un solo schermo, zero preparazione: uno legge ad alta voce, si discute, si sceglie insieme, e quando serve si tira il dado. Nella storia ci siete <b>sempre tutti e cinque</b>: al setup scegliete solo chi viene giocato. Salvataggio automatico: la notte si può interrompere e riprendere.</p>
<p><i>Avvertenza: paura vera, momenti macabri, linguaggio da adulti. E una regola che vale la pena ricordare: in questa casa la cortesia è un'arma, e la usano entrambe le parti.</i></p>`;

const RULES_HOWTO = `
<h3>🕯 Che gioco è questo?</h3>
<p>È un <b>horror interattivo</b> in stile Dungeons &amp; Dragons, pensato per chi non ha mai giocato.
Il computer fa da <b>Narratore</b>: racconta la storia, propone le scelte, tira i dadi e gestisce gli scontri.
Voi dovete solo <b>leggere ad alta voce, discutere e scegliere</b>. E ogni tanto, rimpiangere la scelta.</p>
<p><b>La particolarità:</b> i protagonisti siete VOI — Gaetano, Claudia, Federico, Emanuela e Natalino — in vacanza in un relais sui monti d'Irpinia. Quello che può andare storto, andrà storto.</p>

<h3>👥 Come si gioca (1-5 giocatori)</h3>
<p>Si gioca <b>tutti insieme su un solo schermo</b> (ideale: la sera, a bordo piscina, con una sola luce accesa).</p>
<p>1. Ognuno seleziona <b>sé stesso</b> tra i personaggi. Chi manca stasera, semplicemente "non è partito".<br>
2. A turno, uno fa da <b>lettore</b>: legge la narrazione ad alta voce (le voci dei personaggi valgono doppio).<br>
3. Le <b>scelte si discutono insieme</b>. Litigare fa parte dell'esperienza.<br>
4. Per le <b>prove di abilità</b>, scegliete CHI le tenta: ognuno è bravo in cose diverse (il gioco mostra i bonus).<br>
5. Negli <b>scontri</b> ognuno controlla sé stesso, nel proprio turno.</p>
<p><b>Da soli?</b> Potete controllare 2-3 amici, o UNO solo in <b>modalità Sopravvissuto</b> (con bonus). Coraggio.</p>

<h3>🎯 Le prove di abilità</h3>
<p>Quando tentate qualcosa di incerto (convincere, scalare, NON urlare), il gioco tira un <b>d20</b> e somma il bonus di chi ci prova.
Se il totale raggiunge la <b>CD</b> (difficoltà), è un successo.</p>
<p>Un <b>20 naturale</b> è sempre un trionfo. Un <b>1 naturale</b> è sempre una scena da film horror. La vostra.</p>

<h3>🕯 Il Sangue Freddo — il vostro secondo tentativo</h3>
<p>È il coraggio collettivo del gruppo: si <b>guadagna</b> affrontando l'orrore a testa alta, si <b>perde</b> nei momenti peggiori. E serve a una cosa precisa: <b>rifare un tiro andato male</b>.</p>
<p>Prova fallita o colpo mancato, il gioco vi chiede: <i>«tenere il sangue freddo e riprovare?»</i>. Il primo ritiro costa <b>2</b>, il secondo 3, poi 5, poi 8 — e da lì tre in più ogni volta.
Il conto <b>riparte da zero a ogni scena nuova e a ogni scontro nuovo</b>: insistere nello stesso momento diventa proibitivo, ricominciare altrove no.</p>
<p>Lo stesso coraggio è la moneta dello <b>Spaccio del Contabile</b> (tisane, antidoti, sale benedetto) e di qualche scelta particolarmente audace. È lì la decisione vera: medicine, o secondi tentativi?</p>

<h3>☠ Le condizioni del Belvedere</h3>
<p>Al Relais non si muore. Si finisce PEGGIO:</p>
<p>• <b>Avvelenato dal freddo</b> (☠): il gelo della casa addosso — <b>-2 a tutte le prove</b> finché qualcuno non prepara l'<b>Antidoto di erbe</b>.<br>
• <b>Preso</b> (🕸): la casa ti ha trattenuto — resti fuori gioco finché gli altri non ti liberano.<br>
• <b>A terra</b>: 0 PV, svenuto — una cura o il kit di Emanuela ti rimette in piedi.</p>
<p>Se cade TUTTO il gruppo... il Belvedere non spreca. Vi risveglierete. Da qualche parte.</p>

<h3>⚔ Gli scontri (semplici, promesso)</h3>
<p>A turni, in ordine di iniziativa. Nel tuo turno, UNA azione:</p>
<p>• <b>Attacco</b> con quello che hai (forbici professionali, piastra rovente, chiave inglese...)<br>
• <b>Abilità speciale</b>: le mosse forti di ciascuno. Usi limitati!<br>
• <b>Oggetto</b>: cure e oggetti da lancio (il sale, alle creature della villa, fa MALISSIMO)<br>
• <b>Difesa</b>: +3 alla tua CA fino al prossimo turno.</p>
<p><b>Trucco del mestiere:</b> le creature del Belvedere (ombre, manichini, bambole...) temono ciò che è CALDO e VIVO — il Colpo di Phon di Emanuela e il sale benedetto fanno danni doppi.</p>

<h3>📊 Le sigle in breve</h3>
<p><b>PV</b> = Punti Vita · <b>CA</b> = Classe Armatura · <b>CD</b> = difficoltà di una prova ·
<b>FOR/DES/COS/INT/SAG/CAR</b> = Forza, Destrezza, Costituzione, Intelligenza, Saggezza, Carisma.</p>

<h3>💡 Consigli per sopravvivere (forse)</h3>
<p>• Non esiste la scelta "giusta": esiste la storia che vi meritate.<br>
• Le prove fallite non rovinano la partita: la rendono INDIMENTICABILE.<br>
• Non dividete il gruppo. Sul serio. L'abbiamo scritto anche nel gioco.<br>
• Il gioco salva da solo a ogni scena: potete smettere quando volete. Ammesso che il Belvedere ve lo lasci credere.<br>
• Ci sono <b>3 finali</b>: uno si trova, uno si sceglie, uno si SUBISCE. Rigiocate.</p>

<h3>⌨ Scorciatoie e comodità</h3>
<p>• Tasti <b>1-9</b>: scelgono l'opzione corrispondente · <b>Invio</b>: conferma il dado · <b>Esc</b>: chiude le finestre.<br>
• Pulsanti in alto: <b>🔊</b> effetti · <b>🎵</b> musica · <b>A±</b> testo grande · <b>⛶</b> schermo intero.</p>

<h3>⏱ Durata</h3>
<p>Una notte completa dura <b>2-3 ore</b>. Si può spezzare in più serate: il salvataggio automatico vi aspetta. Lui sì.</p>
`;

const RULES_QUICK = `
<div class="rules-section"><details open><summary>🎯 Prove di abilità</summary><div class="rules-body">
<p>Il gioco tira <b>1d20 + bonus</b> contro una <b>CD</b>: 10 = facile · 12 = media · 13-14 = difficile.</p>
<p><b>20 naturale</b> = trionfo automatico · <b>1 naturale</b> = disastro automatico.</p>
<p>Scegliete la persona giusta per ogni prova: il gioco mostra il bonus di ciascuno prima di tirare.</p>
</div></details></div>

<div class="rules-section"><details><summary>☠ Condizioni: avvelenato, preso, a terra</summary><div class="rules-body">
<p><b>☠ Avvelenato dal freddo</b> — -2 a tutte le prove e agli attacchi. Si cura con l'<b>Antidoto di erbe</b> (si trova nell'orto, con la ricetta di Ada).</p>
<p><b>🕸 Preso</b> — fuori gioco finché il gruppo non lo libera. La casa non spreca: nessuno muore davvero... in gioco.</p>
<p><b>A terra</b> — 0 PV: serve una cura (Mani d'Oro di Emanuela, kit, grappa) per rialzarsi.</p>
</div></details></div>

<div class="rules-section"><details><summary>⚔ Scontri — il tuo turno</summary><div class="rules-body">
<p><b>⚔ Attacco</b> — d20 + bonus vs CA del nemico → se colpisci: danni dell'arma.</p>
<p><b>✨ Abilità</b> — le mosse speciali (usi limitati; si ricaricano dopo una sconfitta e nei momenti di tregua).</p>
<p><b>🧂 Oggetti</b> — cure e oggetti da lancio. Il sale fa danni DOPPI alle creature della villa.</p>
<p><b>🛡 Difesa</b> — +3 CA fino al tuo prossimo turno.</p>
</div></details></div>

<div class="rules-section"><details><summary>🕯 Sangue Freddo = secondo tentativo</summary><div class="rules-body">
<p>Il coraggio del gruppo. Si guadagna guardando l'orrore negli occhi, si perde nei disastri. <b>E si spende per rifare un tiro andato male</b>: prova fallita o colpo mancato, il gioco vi offre il ritiro.</p>
<p>Prezzo: <b>2</b>, poi <b>3</b>, <b>5</b>, <b>8</b> (e +3 ogni volta in più). Il conto <b>riparte da zero in ogni scena nuova e in ogni scontro nuovo</b>: insistere costa, cambiare stanza no.</p>
<p>Lo Zaino (🎒) vi dice sempre quanti ritiri comprate col saldo di adesso. La stessa valuta serve allo <b>Spaccio del Contabile</b> e a qualche scelta audace: scegliete voi se pagare in medicine o in fortuna.</p>
</div></details></div>

<div class="rules-section"><details><summary>🔥 Creature della villa e danni "caldi"</summary><div class="rules-body">
<p>Ombre, manichini, bambole, lo Chef, il Giardiniere e la Fame sono <b>creature del Belvedere</b>: cose fredde e antiche.</p>
<p>Il <b>Colpo di Phon</b> di Emanuela e il <b>Sale Grosso</b> benedetto infliggono loro <b>danni doppi</b>. Usateli nei momenti che contano.</p>
</div></details></div>

<div class="rules-section"><details><summary>💀 E se perdiamo uno scontro?</summary><div class="rules-body">
<p>Il Belvedere non uccide: <b>conserva</b>. Vi risveglierete nelle celle della cantina, medicati e con la tisana calda (non bevetela), pronti a riprovare.</p>
<p>Perdere non è la fine: è materiale per gli aneddoti di domani a colazione.</p>
</div></details></div>

<div class="rules-section"><details><summary>📖 Chi legge? Chi decide?</summary><div class="rules-body">
<p>Consiglio: <b>ruotate il lettore</b> a ogni scena. Le scelte si discutono insieme; nei momenti macabri, decide chi ha più Sangue Freddo. O chi ha prenotato il relais: in fondo è colpa sua.</p>
</div></details></div>
`;
