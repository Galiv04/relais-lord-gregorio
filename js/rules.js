/* ============ REGOLE — guida rapida e "come si gioca" ============ */

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

<h3>🕯 Il Sangue Freddo</h3>
<p>È il coraggio collettivo del gruppo: si <b>guadagna</b> affrontando l'orrore a testa alta, si <b>perde</b> nei momenti peggiori.
Alcune scelte particolarmente audaci richiedono una certa dose di Sangue Freddo. Tenetevelo stretto.</p>

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

<div class="rules-section"><details><summary>🕯 Sangue Freddo</summary><div class="rules-body">
<p>Il coraggio del gruppo. Si guadagna guardando l'orrore negli occhi, si perde nei disastri.</p>
<p>Alcune scelte audaci richiedono una soglia minima di Sangue Freddo. Non è mai sprecato: è la vostra storia che diventa leggenda.</p>
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
