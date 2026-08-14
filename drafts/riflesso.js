/* ============ IL RIFLESSO — il mondo capovolto sotto la piscina ============
   DRAFT — non collegato al gioco. Formato identico a campaign.js/characters.js:
   sceneggiatura pronta per essere incollata/importata da chi integra (Gali).

   Punto d'ingresso previsto (da aggiungere in h1, fuori da questo file):
     { text: '...', next: 'w1_tuffo', requires: { flag: 'un_nodo_sciolto' }, once: true }

   Punto d'uscita: w_finale → next 'h1', sets { riflesso_fatto: true, ostaggi_liberati: true }.
   Se Sofia è stata liberata combattendo: sets anche { sofia_libera: true } (in w15_vittoria).
   Se Sofia è rimasta per scelta: sets { sofia_resta: true } (in w16_amaro), sofia_libera resta assente.
   Questi flag sono pensati per il 5° finale al Banchetto (ostaggi_liberati) e per far
   comparire Sofia nell'epilogo (sofia_libera).

   Meccaniche riusate senza modifiche dal motore: poisonRoller/captureRoller/freeAll,
   requires{flag/item}, check{stat,dc,success,fail}, combat{enemies,victory,defeat,loot},
   item/item2/removeItem, sets, gold. Le sconfitte in combattimento puntano tutte a
   'x_celle' (già esistente in campaign.js): stesso retry-loop del resto del gioco.
   L'Antidoto di Erbe (ITEMS.antidoto, già esistente) cura anche il gelo del Riflesso.

   Location usate (painter da creare): 'riflesso' (esterno/piscina capovolta, giardino
   all'incontrario, fuga finale) e 'riflesso_interno' (corridoi, stanze, sala
   dell'Inventario). La location 'piscina' (già esistente) è riusata per l'ingresso
   (w1_tuffo, ancora nel mondo reale) e per l'uscita (w_finale, di nuovo nel mondo reale).

   Sprite nuovi da disegnare: 'sofia' (25enne anni '90), 'direttore' (Gregorio gelido),
   'doppio' (riflesso oscuro di un ospite). 'cameriere_riflesso' riusa lo sprite
   esistente 'cameriere' (stessa livrea, mondo capovolto: nessun asset nuovo necessario). */

const RIFLESSO_ITEMS = {
  orologio_sofia:     { name: 'Orologio di Sofia', desc: 'Un modello economico da discount, cinturino di plastica scolorito. Fermo alle 23:58 del 31 luglio 1999 — due minuti prima che tutto cominciasse.', usable: false },
  inventario_riflesso: { name: 'L\'Inventario del Riflesso', desc: 'Il registro dove il Belvedere capovolto catalogava i suoi ospiti come oggetti. Le pagine strappate, quelle rimaste, battono ancora piano — come un cuore che non vuole fermarsi del tutto.', usable: false },
};

/* ---------- BESTIARIO DEL RIFLESSO (formato BESTIARY di characters.js) ---------- */

const RIFLESSO_ENEMIES = {
  cameriere_riflesso: {
    name: 'Cameriere del Riflesso', sprite: 'cameriere',
    maxHp: 16, ac: 13, ai: 'random', undead: true,
    attack: { name: 'Vassoio Capovolto', bonus: 3, dice: [1, 8], plus: 1 },
    flavor: 'Serve una cena che nessuno mangia da venticinque anni. Cammina all\'incontrario, ma arriva sempre prima.',
  },
  doppio: {
    name: 'Il Doppio', sprite: 'doppio',
    maxHp: 18, ac: 13, ai: 'smart', undead: true,
    attack: { name: 'Le Sue Stesse Mani', bonus: 4, dice: [1, 8], plus: 1 },
    flavor: 'Ha la faccia di chi lo guarda. Si muove un decimo di secondo prima, come un\'eco che non aspetta il suono.',
  },
  direttore: {
    name: 'Il Direttore', sprite: 'direttore',
    maxHp: 42, ac: 17, ai: 'smart', undead: true, boss: true, lifesteal: true,
    attack: { name: 'Il Timbro del Catalogo', bonus: 6, dice: [2, 8], plus: 2 },
    flavor: 'Ciò che Gregorio sarebbe diventato senza rimorso. Non urla mai. Non ne ha bisogno.',
  },
};

const RIFLESSO_SCENES = {

  /* ==================== INGRESSO ==================== */

  w1_tuffo: {
    location: 'piscina',
    caption: 'La piscina, di nuovo — poco dopo mezzanotte',
    text: `Tra un nodo e l'altro, il gruppo si ritrova per un attimo davanti alla portafinestra che dà sulla piscina — nessuno l'aveva programmato, ma i piedi ci hanno portato tutti nello stesso punto, alla stessa ora.

Il riflesso, stanotte, non aspetta più: la luna rossa che nel primo bagno saliva pigra adesso è quasi allo zenit dell'acqua, enorme, immobile un istante prima di ogni battito — come un cuore che si prepara.

Claudia la fissa col telefono spento in mano, senza inquadrare niente: non le serve più una prova, le serve solo guardare.

> Claudia: "Se quella luna arriva al centro esatto della piscina... io un'idea la ho. E non mi piace."

> Gaetano: "Nemmeno a me piace, ma è la stessa idea: la finestra si apre quando le due lune si allineano. Prima non erano allineate. Ora quasi."

> Natalino: "Quindi mi state dicendo che il momento buono per fare una cazzata enorme... è ADESSO."

> Emanuela: "Ragazzi. Se di là ci sono altri come noi — altri gruppi, altri venticinquenni — forse è per QUESTO che la casa non ci ha ancora presi tutti. Forse manca un pezzo, dall'altra parte."

Federico guarda l'acqua, il riflesso, la luna che sale nell'ultimo tratto.

> Federico: "Va bene. Ma se qualcuno dice 'tanto è solo una piscina', lo tengo IO per la caviglia mentre affonda."

La luna rossa, nell'acqua, tocca il centro esatto.`,
    choices: [
      { text: '🏊 Tuffo di gruppo: mani intrecciate, tre, due, uno', tag: 'Prova di Costituzione — CD 12', check: { stat: 'COS', dc: 12, success: 'w2_riflesso', fail: 'w2_riflesso_ko' } },
      { text: '🔬 Gaetano frena tutti un secondo: vuole calcolare il PUNTO esatto d\'ingresso', tag: 'Prova di Intelligenza — CD 11', check: { stat: 'INT', dc: 11, success: 'w2_riflesso', fail: 'w2_riflesso_ko' } },
    ],
  },

  w2_riflesso: {
    location: 'riflesso',
    caption: 'Il tuffo — dall\'altra parte',
    text: `L'acqua si chiude sopra le teste e non è acqua: è un momento senza consistenza, come attraversare una fotografia. Nessuno si bagna. Nessuno respira, per un secondo che dura esattamente quanto serve a far paura, e poi —

— la superficie li restituisce. Stessa piscina. Stesso bordo di travertino. Stessi cinque corpi che riemergono tossendo un'aria che non hanno mai smesso di avere nei polmoni.

Ma sopra, nel cielo, la luna rossa non è più un riflesso: è LÌ, piena, enorme, al centro esatto della notte, e non ce n'è un'altra bianca a fare da controprova. Le finestre del Belvedere sono tutte accese — ma di una luce fredda, bianco-azzurra, che non scalda niente, nemmeno l'idea di calore.

E i lettini, in semicerchio, hanno gli accappatoi appesi. Cinque. Non sei.

> Natalino: "Aspetta aspetta aspetta. Di QUA ce n'erano sei. Di LÀ..."

> Claudia: "Di là ce n'erano sei perché il sesto eravamo noi. Qui il conto torna diverso. Il sesto siamo ancora noi. Solo che stavolta ci contano da questa parte."

Gaetano si volta verso il Belvedere: le persiane sono tutte aperte, per la prima volta da quando sono arrivati — di qua o di là che sia. E da una finestra al primo piano, controluce, si vede una sagoma che li osserva. Non si muove. Non si nasconde nemmeno.

> Federico: "Ok. Piano nuovo: usciamo dall'acqua, restiamo vivi, e qualcuno mi spiega PERCHÉ ho ancora l'accappatoio dell'altra parte addosso."

**(Flag: attraversata la finestra. Sangue freddo +1.)**`,
    sets: { riflesso_attraversato: true },
    gold: 1,
    choices: [{ text: 'Uscire dall\'acqua e avvicinarsi al Belvedere capovolto', next: 'w3_giardino' }],
  },

  w2_riflesso_ko: {
    location: 'riflesso',
    caption: 'Il tuffo — un ingresso più duro',
    text: `Il calcolo di Gaetano — o la stretta di mano di tutti — funziona lo stesso, ma funziona MALE: a metà del tuffo, l'acqua si accorge che qualcuno, dentro, ha ancora paura, e la paura, qui, PESA.

Per un istante che sembra un minuto, qualcuno resta sospeso a mezz'acqua, né di qua né di là, con i polmoni vuoti e la luna rossa che si allarga sopra la testa come una bocca. Le mani degli altri lo tirano dall'altra parte — letteralmente dall'ALTRA parte — e il Riflesso li sputa fuori tutti insieme, in un colpo, sul bordo della piscina capovolta.

Chi è rimasto sospeso più a lungo ha la pelle bianca dov'era rimasta a contatto col nulla tra i due mondi, e un freddo che non è di questa notte: gli entra nelle ossa e ci resta, un ospite che non hanno invitato.

> Emanuela: *(già con le mani sul polso di chi trema)* "Fermo. Fermo, respira. Questo non è il freddo della piscina."

Sopra, le finestre del Belvedere — capovolto, acceso di luce bianco-azzurra — restano tutte aperte. Cinque accappatoi ai lettini, non sei.

> Federico: "Porca puttana. Siamo appena entrati in una fotocopia più fredda di questa casa."

**(-1 Sangue freddo. Chi ha attraversato per ultimo resta AVVELENATO dal gelo del Riflesso: serve l'Antidoto.)**`,
    sets: { riflesso_attraversato: true },
    gold: -1,
    poisonRoller: true,
    choices: [{ text: 'Uscire dall\'acqua. Il Belvedere capovolto aspetta', next: 'w3_giardino' }],
  },

  /* ==================== IL MONDO ==================== */

  w3_giardino: {
    location: 'riflesso',
    npc: [{ key: 'cameriere', x: 0.55, y: 0.62, scale: 2.5 }],
    caption: 'Il giardino capovolto',
    text: `Il giardino, di qua, cammina all'incontrario: la ghiaia bianca si muove sotto i piedi in senso contrario a ogni passo, come un tapis roulant che non vuole collaborare. Le siepi sono le stesse forme di sempre, ma qui sono FINITE: il cervo ha ancora gli occhi, e stavolta li tiene chiusi, come se dormisse in piedi.

Tra le siepi, un **Cameriere del Riflesso** fa il suo giro — livrea bianco-ghiaccio invece che nera, passi troppo regolari, un vassoio vuoto in mano che porta avanti e indietro come fosse sempre in servizio e mai a un tavolo vero.

> Gaetano: *(sottovoce)* "Non guarda mai nella stessa direzione due volte di fila. C'è un pattern. Datemi dieci secondi e vi dico quando muoversi."

> Claudia: "Abbiamo dieci secondi, Gaetà, non un semestre."

Muoversi qui significa contare i suoi giri, sincronizzare i passi, e sperare che il giardino capovolto non decida di raccontare al padrone di casa quello che vede.`,
    choices: [
      { text: '👁 Contare i giri del cameriere e attraversare tra un passo e l\'altro', tag: 'Prova di Saggezza — CD 12', check: { stat: 'SAG', dc: 12, success: 'w4_sofia', fail: 'w3_pattuglia_combat' } },
      { text: '🏃 Rischiare lo scatto, da un\'ombra all\'altra', tag: 'Prova di Destrezza — CD 13', check: { stat: 'DES', dc: 13, success: 'w4_sofia', fail: 'w3_pattuglia_combat' } },
    ],
  },

  w3_pattuglia_combat: {
    location: 'riflesso',
    caption: 'Il cameriere si accorge di voi',
    text: `Il piede sbaglia il tempo di un decimo di secondo — basta. Il vassoio vuoto del Cameriere si gira verso di voi con uno scatto troppo rapido per essere meccanico, e la livrea bianco-ghiaccio si gonfia come se dentro non ci fosse un corpo ma una corrente d'aria arrabbiata.

> Il Cameriere: *(voce che è un sussurro moltiplicato)* "Ospiti... fuori turno. Il servizio... non è stato ordinato."

Da dietro le siepi finite, un secondo cameriere si stacca dall'ombra come un abito che scende dalla grucce da solo. Il giardino capovolto smette di far muovere la ghiaia: vuole guardare.

*(Sono creature del Riflesso: sale e Colpo di Phon fanno danni doppi, come dall'altra parte della casa. Attenti ai vassoi: fanno male come mazze.)*`,
    combat: {
      enemies: ['cameriere_riflesso', 'cameriere_riflesso'],
      victory: 'w4_sofia',
      defeat: 'x_celle',
      loot: { gold: 1 },
    },
  },

  w4_sofia: {
    location: 'riflesso',
    npc: ['sofia'],
    caption: 'Sofia',
    text: `Una voce li ferma a pochi passi dalla portafinestra della sala da pranzo capovolta — femminile, un accento che sa di Napoli anni '90, e una sicurezza che venticinque anni chiusa in un posto così non dovrebbero permettersi a nessuno, eppure.

> Sofia: "Fermi. FERMI, dico. Se entrate da quella porta con quella faccia da 'siamo-vivi-e-non-lo-sappiamo-ancora', vi beccano in due minuti."

Esce dall'ombra di una siepe finita: venticinque anni portati addosso, jeans a vita alta, un giubbotto sopra un top che ha smesso di essere di moda ventidue anni fa e in qualche modo è tornato di moda proprio adesso, occhiali da sole sui capelli anche di notte — per abitudine, non per bisogno.

> Sofia: "Sofia. Millenovecentonovantanove, se vi interessa l'annata." *(li conta col dito, due volte, esattamente come Gregorio all'arrivo)* "Cinque. Nuovi. Vivi vivi, non vivi-però. Madonna, quanto tempo che non vedo qualcuno con la faccia che avete voi."

> Natalino: "Che faccia abbiamo?"

> Sofia: "Quella di chi crede ancora che si possa vincere. Bella faccia. La tenevo anch'io, nel '99."

Si guarda intorno, poi torna a guardarli, e per un attimo la sicurezza scricchiola:

> Sofia: "Venticinque anni che mappo questa casa capovolta a memoria. Venticinque anni che aspetto qualcuno da fuori che non sia stato ancora catalogato. Voi siete la cosa più bella che mi sia capitata da quando il Grande Fratello non esisteva ancora — e per la cronaca, di qua non esiste ANCORA, ve lo dico prima che me lo chiediate."

**(Flag: Sofia incontrata. Sangue freddo +1.)**`,
    sets: { sofia_incontrata: true },
    gold: 1,
    choices: [{ text: 'Seguirla: ha l\'aria di sapere esattamente dove state per andare', next: 'w5_racconto' }],
  },

  w5_racconto: {
    location: 'riflesso_interno',
    npc: ['sofia'],
    caption: 'Il racconto di Sofia — l\'Inventario',
    text: `Sofia li porta dentro per un corridoio di servizio, tenendo tutti bassi sotto le finestre — "la casa VEDE, se state dritti in piedi davanti a una finestra è come squillare un citofono" — e mentre camminano, racconta, veloce, come chi ha ripetuto la stessa storia mille volte nella propria testa e mai a nessuno.

> Sofia: "Non siamo fantasmi. Vorrei tanto. I fantasmi almeno hanno FINITO qualcosa. Noi siamo — aspettate la parola giusta — OSTAGGI. Presi la notte del nostro venticinquennio, portati di qua, e da allora... fermi. Non invecchiamo. Non moriamo. Non usciamo. Io sono ancora la Sofia del 31 luglio 1999, per sempre, a meno che qualcuno non rompa l'Inventario."

> Claudia: "L'Inventario."

> Sofia: "Il registro di QUA. Dall'altra parte tenete un registro con i nomi degli ospiti, no? Qui è uguale, solo che non scrivono i nomi. Catalogano gli OGGETTI. 'Sofia — servizio da tè, 1999.' Io sono una voce di catalogo, gente. Come un piatto. Come un cucchiaio."

Lo dice ridendo, ma è la risata di chi ha smesso di piangerci sopra da vent'anni per pura decisione strategica.

> Sofia: "I camerieri pattugliano. Il Direttore governa. E la casa — ATTENZIONE, questo è importante — vede tutto quello che si muove senza prudenza. Muovetevi come se ogni finestra fosse un occhio, perché lo è."

> Federico: "E il Direttore chi è?"

Sofia si ferma un secondo, e per la prima volta da quando l'hanno incontrata, la battuta pronta le manca.

> Sofia: "Il Direttore è quello che Gregorio sarebbe diventato, se non avesse mai avuto il coraggio di dispiacersi per niente. Non ridete con lui. Non trattate con lui senza un piano. E se vi offre qualcosa... contate le dita di chi ve lo offre. Non sono mai il numero giusto."`,
    sets: { inventario_scoperto: true, regole_casa_note: true },
    choices: [{ text: 'Chiedere il percorso più sicuro verso il cuore della casa', next: 'w6_1924' }],
  },

  w6_1924: {
    location: 'riflesso_interno',
    npc: ['sofia'],
    caption: 'La stanza del 1924, di qua',
    text: `Sofia li guida in una sala da ballo capovolta, illuminata da lampadari che pendono verso l'alto invece che verso il basso — la luce cola dal soffitto come acqua controcorrente — e lì, fermi in una figura di ballo che non finisce mai, ci sono **sei ragazzi del 1924.**

Non sono statue. Respirano, piano, a un ritmo di un respiro ogni trenta secondi. Hanno gli occhi aperti e vitrei, fissi sul punto dove il ballo li ha sorpresi cent'anni fa: un uomo con la mano tesa verso una donna che non l'ha mai presa, un altro che ride di una battuta che nessuno finirà mai di dire.

> Sofia: "Li chiamo i Ballerini. Sono qui da prima di me, di parecchio. A volte, se passi vicino, ti sussurrano una parola. Una sola. Sempre la stessa, per ognuno. La mia è... be'. Non ve la dico. È mia."

> Emanuela: *(la voce che le trema, per la prima volta stanotte)* "Possiamo... svegliarli?"

> Sofia: "Non stanotte. Svegliarli uno a uno richiede tempo che non abbiamo, e la casa se ne accorgerebbe prima che arriviamo a tre. Ma se strappiamo l'Inventario — TUTTO l'Inventario — si svegliano tutti insieme, di colpo, come un allarme che finalmente smette di suonare."

Natalino si ferma davanti al ragazzo che ride della battuta eterna, e per un secondo, invece di una battuta sua, sceglie il silenzio — la prima volta di tutta la notte.

> Natalino: "Ok. Andiamo a rompere quel cazzo di catalogo."

**(Flag: visto il gruppo del 1924.)**`,
    sets: { gruppo_1924_visto: true },
    choices: [{ text: 'Proseguire verso il cuore della casa capovolta', next: 'w7_ronda' }],
  },

  w7_ronda: {
    location: 'riflesso_interno',
    caption: 'Il corridoio dei venticinquenni, di qua',
    text: `Il corridoio di qua è identico a quello di sopra — le porte con le targhette degli anni, 1899, 1924, 1949, 1974, 1999 — ma le porte sono AL CONTRARIO: si aprono verso l'interno del muro, in stanze che dall'altra parte non esistono.

Sofia si blocca con un braccio alzato, ferma tutti in un solo gesto imparato in venticinque anni.

> Sofia: "Due camerieri. Fine turno, cambio guardia. È il momento più scomodo della notte per farsi vedere e il più comodo per passare — si distraggono uno con l'altro per un attimo, tipo colleghi che si passano le consegne."

Il cambio di guardia dura pochi secondi: un cameriere consegna il vassoio vuoto a un altro cameriere vuoto, con un inchino identico, meccanico, ripetuto uguale da un secolo.

> Sofia: "Ora o mai più."`,
    choices: [
      { text: '🤫 Scivolare lungo il muro, nell\'attimo del cambio di guardia', tag: 'Prova di Destrezza — CD 13', check: { stat: 'DES', dc: 13, success: 'w8_direttore', fail: 'w7_ronda_combat' } },
      { text: '🗣 Federico prova a farsi passare per un ospite "nuovo assunto": un bluff totale', tag: 'Prova di Carisma — CD 13', check: { stat: 'CAR', dc: 13, success: 'w8_direttore', fail: 'w7_ronda_combat' } },
    ],
  },

  w7_ronda_combat: {
    location: 'riflesso_interno',
    caption: 'Il cambio di guardia va storto',
    text: `Il bluff, il passo, il timing — qualcosa si spezza a metà, e i due camerieri si voltano ENTRAMBI nello stesso istante, con la sincronia di chi non ha mai smesso di lavorare in coppia.

> I Camerieri: *(insieme, la stessa frase, la stessa voce raddoppiata)* "Ospiti... non registrati. Si procede... alla catalogazione."

Il vassoio vuoto del primo diventa, nelle sue mani, qualcosa con un bordo molto più affilato di un vassoio da colazione.

*(Sale e Colpo di Phon fanno danni doppi. Sono in due, coordinati: non lasciate nessuno isolato.)*`,
    combat: {
      enemies: ['cameriere_riflesso', 'cameriere_riflesso'],
      victory: 'w8_direttore',
      defeat: 'x_celle',
    },
  },

  w8_direttore: {
    location: 'riflesso_interno',
    npc: ['direttore'],
    caption: 'Il Direttore',
    text: `La porta in fondo al corridoio si apre da sola, senza corrente d'aria, esattamente come faceva quella di Gregorio dall'altra parte — e dietro, in un ufficio che sembra la reception della hall vista attraverso il gelo di un vetro, c'è un uomo.

Elegantissimo. Completo di lino, come Gregorio, ma il colore non è tortora: è un grigio senza calore, il colore delle cose che non hanno mai preso il sole. Mani curatissime, unite davanti a sé. Non si alza. Sorride sempre, con la bocca sola: gli occhi restano altrove, come se il resto della faccia stesse ancora aspettando l'ordine di partecipare.

> Il Direttore: "Cinque nuovi articoli non catalogati, in giro per la casa fuori orario. E con loro, la signorina Sofia — servizio da tè, 1999 — che sa perfettamente che le uscite non autorizzate si segnano sul registro." *(sposta un dito, senza fretta)* "Buonasera. Sono il Direttore. Gregorio, di là, vi accoglie con il calore. Io vi accolgo con l'ordine. È più efficiente, e con tutto il rispetto per il collega... dura più a lungo."

> Gaetano: *(la voce ferma, ma le mani no)* "Lei è cosa, esattamente?"

> Il Direttore: "Sono ciò che resta quando si smette di dispiacersi. Gregorio si dispiace ancora — è la sua debolezza, e la ragione per cui questa casa, di là, perde ancora ospiti. Io non mi dispiaccio da molto tempo. Funziona meglio."

Si alza, con un movimento troppo fluido per essere del tutto umano, e per un istante la luce fredda della stanza gli attraversa il petto come se non ci fosse niente, dentro il completo di lino, a fermarla.

> Il Direttore: "Vi lascio andare. Stanotte. È più divertente vedere cosa farete con il tempo che vi resta prima che l'Inventario decida come catalogarvi."

**(Flag: il Direttore incontrato.)**`,
    sets: { direttore_incontrato: true },
    choices: [{ text: 'Uscire dall\'ufficio prima che cambi idea', next: 'w9_studio' }],
  },

  w9_studio: {
    location: 'riflesso_interno',
    npc: ['sofia'],
    caption: 'Lo studio privato — l\'orologio',
    text: `Sofia li porta in una stanza laterale che, dall'altra parte, corrisponde più o meno al bugigattolo dove Gregorio tiene le chiavi di scorta. Di qua, è una vetrina: pareti di vetro smerigliato, e dentro, su mensole numerate, **oggetti con targhette** — spazzole, occhiali da sole, una polaroid gemella di quella che forse avete già in tasca, un pettine, una cintura.

> Sofia: *(la voce che si fa piccola, per la prima volta stanotte)* "Questa è la vetrina dei pezzi pregiati. Le cose che il Direttore tiene 'per affetto', dice lui. Il mio orologio è lì. Terzo scaffale. Fermo alle 23:58 del 31 luglio 1999 — l'ultimo minuto in cui è stato MIO."

Il terzo scaffale è a un'altezza scomoda, dietro un vetro che non sembra chiuso a chiave ma sembra, in qualche modo, GUARDATO. Qualcosa, dentro l'ombra oltre la vetrina, si muove appena — o forse è solo il riflesso di uno di voi, un po' storto.

> Natalino: "Sofì. Quel qualcosa nell'ombra ha la tua faccia."

> Sofia: *(senza voltarsi a guardare)* "Lo so. Non guardatelo negli occhi. È un pezzo di me che è rimasto qui troppo a lungo e ha smesso di stare dalla mia parte."`,
    choices: [
      { text: '🕰 Muoversi piano, senza fretta, senza rumore, verso il terzo scaffale', tag: 'Prova di Saggezza — CD 13', check: { stat: 'SAG', dc: 13, success: 'w10_orologio', fail: 'w9_studio_combat' } },
      { text: '🔧 Gaetano prova a forzare il meccanismo della vetrina con metodo', tag: 'Prova di Intelligenza — CD 13', check: { stat: 'INT', dc: 13, success: 'w10_orologio', fail: 'w9_studio_combat' } },
    ],
  },

  w9_studio_combat: {
    location: 'riflesso_interno',
    caption: 'Il Doppio di Sofia',
    text: `Il rumore — un vetro che vibra, un passo di troppo — basta. L'ombra oltre la vetrina si stacca dal vetro come una condensa che prende forma, e ha esattamente la faccia di Sofia. Stessi occhiali sui capelli. Stesso giubbotto. Ma gli occhi sono vuoti come quelli dei camerieri, e la bocca, quando si apre, non dice niente di suo:

> Il Doppio: *(con la voce di Sofia, ma sfasata, come un'eco che arriva prima del suono)* "Non... si... TOCCA. L'Inventario... decide. Non... voi."

> Sofia: *(la voce spezzata, ma ferma)* "Quello non sono io. Quello è quello che resta quando smetti di lottare per abitudine. Colpitelo. Per me."

*(Sale e Colpo di Phon doppi. Il Doppio imita: se qualcuno cura, potrebbe puntare proprio chi cura.)*`,
    combat: {
      enemies: ['doppio', 'cameriere_riflesso'],
      victory: 'w10_orologio',
      defeat: 'x_celle',
    },
  },

  w10_orologio: {
    location: 'riflesso_interno',
    npc: ['sofia'],
    caption: 'L\'orologio ritrovato',
    text: `Il terzo scaffale si apre — con la prudenza vincente o con il fragore della lotta appena vinta, non importa più — e l'orologio di Sofia è lì: cinturino di plastica scolorito, vetro incrinato a mezzaluna. Le lancette sono ferme sulle 23:58.

Sofia lo guarda come si guarda una fotografia di sé bambini: con tenerezza e un imbarazzo che non c'entra niente con la vergogna.

> Sofia: "Costava dodicimila lire. L'avevo comprato PROPRIO quella settimana, per il viaggio. Mi sembrava il colmo del lusso." *(ride, una risata vera, la prima)* "Venticinque anni, e sono ancora le 23:58 di quella sera. Due minuti prima di mezzanotte. Due minuti prima che tutto questo cominciasse."

Lo tiene in mano come si tiene una decisione che non si è ancora presa. Il gruppo si guarda: non serve dirselo, qualcuno dovrà scegliere cosa farne, e non c'è molto tempo per pensarci.

**(Ottenuto: OROLOGIO DI SOFIA.)**`,
    item: 'orologio_sofia',
    choices: [
      { text: '💗 Restituirlo a Sofia, subito, senza aspettare l\'alba di nessuno', next: 'w10_orologio_reso' },
      { text: '⏳ "Non ora, Sofì: prima usciamo tutti di qui." Rimandare il momento', next: 'w11_inventario' },
    ],
  },

  w10_orologio_reso: {
    location: 'riflesso_interno',
    npc: ['sofia'],
    caption: 'L\'orologio torna a casa',
    text: `Emanuela fa un passo avanti e prende delicatamente il polso di Sofia.

> Emanuela: "Sofì. Posso?"

Il cinturino di plastica si allaccia intorno al polso con un click piccolissimo — e per un decimo di secondo, nell'aria della stanza capovolta, si sente un TIC. Un solo tic. Il primo movimento di un orologio fermo da venticinque anni.

Sofia chiude gli occhi, e quando li riapre sono più vecchi di un secondo. Solo di un secondo. Ma è un secondo che le appartiene di nuovo, e non alla casa.

> Sofia: *(la voce che trema, per la prima volta senza sarcasmo a proteggerla)* "Non... non pensavo che ci sarebbe importato a qualcuno. Venticinque anni e nessuno che si fosse mai chiesto che ORA fosse, per me."

> Natalino: "Amore, ti sei fermata a un venerdì sera di fine estate col vetro rotto e la battuta pronta. Ci importava DA SUBITO."

Sofia si asciuga gli occhi con il dorso della mano, veloce, come chi non vuole che si veda, e poi torna a essere la Sofia di prima — solo un po' più leggera.

> Sofia: "Ok. Basta piagnucolare. C'è un catalogo da rompere."

**(Flag: l'orologio restituito. Sangue freddo +2.)**`,
    sets: { orologio_reso: true },
    removeItem: 'orologio_sofia',
    gold: 2,
    choices: [{ text: 'Verso il cuore della casa: la Sala dell\'Inventario', next: 'w11_inventario' }],
  },

  /* ==================== LA QUEST — L'INVENTARIO ==================== */

  w11_inventario: {
    location: 'riflesso_interno',
    npc: ['sofia', 'direttore'],
    caption: 'La Sala dell\'Inventario',
    text: `Sofia li guida per l'ultimo tratto con la sicurezza di chi lo ha percorso mille volte nella propria testa e mai una nella realtà, e la porta in fondo — doppia, di legno scuro, con una maniglia a forma di penna d'oca — si apre su una sala che non ha equivalente dall'altra parte della casa.

Scaffali fino al soffitto. Migliaia di **schede**, numerate, ognuna con un piccolo oggetto appoggiato sopra come un fermacarte: uno specchietto da borsetta, un paio di occhiali, una spazzola, un accendino senza gas. Sotto ogni oggetto, la scheda dice cosa — non CHI — è: *"Sofia — servizio da tè, 1999." "Margherita — ninnolo da comò, 1924." "Ernesto — posacenere, 1949."*

Al centro, su un leggio, il registro madre: **l'Inventario.** Aperto. E davanti, ad aspettarli come se li avesse invitati a cena, c'è il Direttore.

> Il Direttore: "Siete arrivati fin qui. Complimenti sinceri — e i miei complimenti, di questi tempi, sono la cosa più rara della casa." *(chiude piano l'Inventario, senza fretta)* "Vi propongo un affare da gentiluomini. Un pezzo nuovo, di buona qualità, catalogato con tutti gli onori — al posto di TUTTI i pezzi vecchi qui dentro. Uno di voi resta. Gli altri quattro, con la signorina Sofia, escono all'alba, liberi, con la mia firma di garanzia."

Il silenzio che segue è quello vero, quello che nessuna battuta di Natalino riesce a rompere per una volta.

> Sofia: *(sottovoce, urgentissima)* "NON. Contate le dita, ve l'ho detto. Contate le dita di chi offre."

Il Direttore stende le mani, sul leggio, come per mostrare che sono pulite. Sono dieci. Esattamente dieci. E questo, in qualche modo, è la cosa più inquietante che abbiano visto stanotte.`,
    choices: [
      { text: '🖋 Accettare: qualcuno del gruppo si offre davvero, per salvare tutti gli altri', next: 'w12_tradimento' },
      { text: '🕯 Fermarsi: "La decisione tocca a Sofia. È la sua casa da venticinque anni."', next: 'w12_sofia' },
      { text: '⚔ Rifiutare in blocco: "Nessuno resta. Si combatte."', next: 'w14_direttore_boss' },
    ],
  },

  w12_tradimento: {
    location: 'riflesso_interno',
    npc: ['direttore'],
    caption: 'Il patto tradito',
    text: `Il volontario fa un passo avanti — non importa chi, in questo momento è tutti e cinque insieme, perché nessuno lascia che sia solo — e il Direttore annuisce, quasi commosso, ed estrae dal taschino una penna che assomiglia esattamente troppo alla stilografica di Gregorio.

> Il Direttore: "Ammirevole. Genuinamente." *(intinge la penna in un calamaio che non c'era un secondo fa)* "Peccato che io non abbia mai detto CHE COSA avrei catalogato. Voi avete offerto un pezzo. Io prendo... l'intero SET."

Il pavimento della sala si chiude come una trappola per topi elegantissima: le porte scompaiono, gli scaffali scivolano a incastrarsi, e l'Inventario, sul leggio, comincia a scrivere DA SOLO, velocissimo, cinque righe che nessuno ha dettato.

> Sofia: "VE L'AVEVO DETTO. Le dita. Erano DIECI, ma non ha detto quante MANI—"

Il Direttore si toglie, con un gesto elegantissimo, la giacca — e sotto non c'è una camicia: c'è lo stesso buio compresso della Fame, dall'altra parte della casa, solo più ORDINATO, più freddo, catalogato pure lui.

*(È una creatura del Riflesso: sale e phon fanno danni doppi. È un boss vero: tenete le cure per dopo.)*`,
    sets: { tentato_sacrificio: true },
    combat: {
      enemies: ['direttore', 'cameriere_riflesso'],
      victory: 'w15_vittoria',
      defeat: 'x_celle',
      loot: { gold: 2 },
    },
  },

  w12_sofia: {
    location: 'riflesso_interno',
    npc: ['sofia', 'direttore'],
    caption: 'L\'offerta di Sofia',
    text: `Sofia fa un passo avanti prima che qualcuno del gruppo possa anche solo aprire la bocca, e si mette esattamente al centro, tra loro e il Direttore, come chi ha già fatto questo calcolo mille volte in venticinque anni di notti identiche.

> Sofia: "Resto io."

> Emanuela: "Sofia, NO—"

> Sofia: "Fatemi FINIRE. Resto io, perché sono già catalogata, perché conosco questa casa meglio di chiunque altro l'abbia mai conosciuta, e perché — ditemi che ho torto — voi cinque avete ancora una vita intera di là che io non ho più da venticinque anni. Non è eroismo. È matematica. Sono la scelta più economica per tutti."

Il Direttore, per la prima volta, sembra genuinamente interessato — non alla vittoria, ma alla PROPOSTA.

> Il Direttore: "Un pezzo già catalogato, offerto volontariamente, in cambio della liberazione di tutti gli altri. È... elegante. Accetto immediatamente, e per una volta senza trucchi: la signorina resta, tutti gli altri sono liberi all'alba."

Sofia si volta verso il gruppo, e per un momento — solo un momento — non ha più venticinque anni di sarcasmo addosso: ne ha solo venticinque, punto, di età vera, con tutta la paura che si porta dietro.

> Sofia: "È casa mia, ormai. Che cazzo di casa, lo so. Ma casa. Fatemi questo regalo: fatemi scegliere IO, per una volta, cosa mi succede."`,
    sets: { sofia_si_offre: true },
    choices: [
      { text: '🤝 Rispettare la sua scelta: "Sofia, se è questo che vuoi... grazie."', next: 'w16_amaro' },
      { text: '⚔ Rifiutare: "No. Nessuno resta. Combattiamo TUTTI insieme, e usciamo TUTTI insieme."', next: 'w14_direttore_boss' },
      { text: '⏰ "Sofì. Il tuo tempo è ripartito. Non devi restare per nessuno, nemmeno per noi."', requires: { flag: 'orologio_reso' }, sets: { sorpresa: true }, next: 'w14_direttore_boss' },
    ],
  },

  w14_direttore_boss: {
    location: 'riflesso_interno',
    npc: ['direttore', 'sofia'],
    caption: 'Lo scontro con il Direttore',
    text: `Non c'è più spazio per trattative, e in un certo senso è un sollievo: dopo una notte intera a misurare ogni parola, finalmente si può smettere di scegliere quella giusta.

Il Direttore posa la penna sul leggio con la cura di chi mette in ordine la scrivania prima di licenziare qualcuno.

> Il Direttore: "Peccato. Avrei preferito l'ordine al disordine. Ma va bene lo stesso: anche il disordine, alla fine, si CATALOGA."

Si toglie la giacca. Sotto, il buio compresso che ricorda la Fame dall'altra parte della casa — ma più freddo, più ordinato, senza un briciolo della fame disperata di Gregorio: questo è un mostro che LAVORA, non che soffre.

Sofia si mette in fila con voi, i pugni chiusi, il vecchio orologio da dodicimila lire — fermo o ripartito, non conta più — che le batte sul polso come un timer.

> Sofia: "Venticinque anni che aspettavo questa rissa. Colpitelo nel catalogo."

*(È una creatura del Riflesso: sale e Colpo di Phon fanno danni doppi. Attenti al Timbro: intrappola chi colpisce di più.)*`,
    combat: {
      enemies: ['direttore', 'cameriere_riflesso'],
      victory: 'w15_vittoria',
      defeat: 'x_celle',
      loot: { gold: 2 },
    },
  },

  w15_vittoria: {
    location: 'riflesso_interno',
    caption: 'L\'Inventario si strappa',
    text: `Il Direttore cade in ginocchio davanti al proprio leggio con un rumore di carta che si accartoccia — non di corpo che cede: di PAGINA. E mentre crolla, l'Inventario si apre da solo, tutte le pagine insieme, e comincia a **sfogliarsi all'incontrario**, velocissimo, come un film riavvolto.

> Il Direttore: *(una voce sempre più sottile, sempre più simile a carta che si liscia)* "Non potete... l'ordine è... l'unica cosa che..."

Qualcuno — non importa chi, in questo momento è di nuovo tutti e cinque insieme, più Sofia — afferra l'Inventario a due mani e comincia a **strapparne le pagine.** Una. Poi un'altra. Poi tutte, a manciate, mentre la casa capovolta intorno a loro URLA — un urlo di travi e di intonaco, di lampadari che cadono verso l'alto, di finestre che si aprono e si chiudono come denti.

Ogni pagina strappata vola verso l'alto e, a mezz'aria, **prende fuoco senza fiamma**, e nel punto dove brucia, da qualche parte nella casa, una porta con una targhetta d'anno si spalanca.

> Sofia: *(ridendo e piangendo nello stesso respiro)* "Stanno svegliandosi. Li SENTITE? Si stanno svegliando TUTTI!"

Quando l'ultima pagina si strappa, il Direttore non c'è più: resta solo il completo di lino grigio, vuoto, piegato su una sedia con la cura ossessiva di chi lo ha sempre stirato da solo.

**(Ottenuto: l'INVENTARIO DEL RIFLESSO, ormai vuoto. Sofia è LIBERA. Sangue freddo +3.)**`,
    sets: { direttore_sconfitto: true, ostaggi_liberati: true, sofia_libera: true },
    item: 'inventario_riflesso',
    gold: 3,
    choices: [{ text: 'La casa continua a urlare: bisogna USCIRE, ora', next: 'w17_fuga' }],
  },

  w16_amaro: {
    location: 'riflesso_interno',
    npc: ['direttore', 'sofia'],
    caption: 'Il prezzo pagato da Sofia',
    text: `Il Direttore intinge di nuovo la penna, e stavolta — è la prima volta in tutta la notte che succede — la usa esattamente come ha promesso.

> Il Direttore: "La signorina Sofia — servizio da tè, 1999 — CONFERMATA in catalogo, permanente, per volontà propria." *(la penna scorre con un suono che è quasi un sospiro)* "Tutti gli altri articoli: DECLASSIFICATI. Liberi. Con effetto immediato."

In tutta la casa capovolta, contemporaneamente, si sente lo stesso suono: porte che si spalancano, sei voci del 1924 che finalmente smettono di ballare la stessa figura, gente che non parlava da decenni che ricomincia a farlo tutta insieme, in un brusio che sale dai piani come una marea.

Il Direttore strappa, con gesto quasi cerimonioso, le pagine di TUTTI tranne una — la sua, Sofia, servizio da tè — e le porge al gruppo, come un maggiordomo che consegna la fattura.

> Il Direttore: "Un accordo pulito. Ne ho pochi, di questi. Godetevelo."

Sofia li abbraccia uno per uno, veloce, feroce, come chi non ha tempo per farlo con calma.

> Sofia: "Andate. E se vedete Gregorio, di là, ditegli che ha ragione LUI: dispiacersi è la cosa più stupida e più giusta che esista. Ditegli che una di noi, almeno, ha scelto di restare per amore e non per fame. Fa differenza. Ditegliela, la differenza."

**(Ottenuto: le PAGINE STRAPPATE dell'Inventario. Ostaggi liberati — tranne una. Sangue freddo +2, amarissimo.)**`,
    sets: { patto_riflesso_chiuso: true, ostaggi_liberati: true, sofia_resta: true },
    item: 'inventario_riflesso',
    gold: 2,
    choices: [{ text: 'Andare. Prima che la casa cambi idea su tutto il resto', next: 'w17_fuga' }],
  },

  /* ==================== USCITA ==================== */

  w17_fuga: {
    location: 'riflesso',
    caption: 'La casa capovolta crolla su se stessa',
    text: `Che abbiate vinto lo scontro a mani nude o strappato un compromesso amarissimo, il risultato per la casa è lo stesso: le hanno portato via dei pezzi, e una casa che si nutre di ordine, privata dell'ordine, **crolla su se stessa** come un castello di carte in una stanza dove qualcuno ha aperto la finestra.

I corridoi si accorciano. Le porte con le targhette degli anni sbattono tutte insieme, in sequenza, come domino. Il cielo capovolto, fuori, comincia a girare — la luna rossa che scivola verso l'orizzonte troppo in fretta, come un orologio che qualcuno ha finalmente rimesso in moto a tutta velocità.

> Sofia *(o il ricordo della sua voce, se è rimasta indietro)*: "La piscina! Correte alla piscina, è l'unica porta che questa casa non può chiudere dall'interno!"

Il giardino capovolto, che all'andata camminava all'incontrario sotto i piedi, ora si muove semplicemente TROPPO, come un tappeto tirato da sotto. Bisogna correre dritti, in linea, senza guardare le siepi che si sciolgono in ombra dietro le spalle.`,
    choices: [
      { text: '🏃 Correre in linea retta, tenendosi per le giacche, senza voltarsi MAI', tag: 'Prova di Costituzione — CD 13', check: { stat: 'COS', dc: 13, success: 'w18_soglia', fail: 'w17_fuga_ko' } },
    ],
  },

  w17_fuga_ko: {
    location: 'riflesso',
    caption: 'La casa cerca di trattenervi',
    text: `Un piede sbaglia l'appoggio sulla ghiaia che ancora si muove all'incontrario, e per un secondo un braccio di siepe sciolta — non più forma, solo ombra liquida — si stringe intorno a una caviglia con la forza di una casa che non vuole lasciare andare l'ultimo pezzo che le resta.

Le mani degli altri strappano via chi è caduto con la solita disperazione coordinata delle famiglie vere, e la siepe-ombra si scioglie in un gorgoglio frustrato, troppo lenta ormai per la casa che crolla intorno a lei.

Chi è stato preso porta il freddo del Riflesso nelle ossa, l'ennesima volta stanotte.

**(-1 Sangue freddo. Chi è caduto resta AVVELENATO: serve l'Antidoto, appena possibile.)**`,
    gold: -1,
    poisonRoller: true,
    choices: [{ text: 'Alla piscina. ADESSO.', next: 'w18_soglia' }],
  },

  w18_soglia: {
    location: 'riflesso',
    caption: 'La soglia della piscina capovolta',
    text: `La piscina, in questo angolo di mondo che sta collassando, è l'unica cosa che resta ferma: un rettangolo d'acqua immobile mentre tutto intorno crolla verso l'alto.

Sopra, la luna rossa è arrivata quasi al bordo dell'orizzonte capovolto — e più scende, più sembra CONTARVI, una per una le teste, esattamente come ha sempre fatto Gregorio dalla soglia del Belvedere vero.

> Gaetano: "Se quella luna finisce di contare prima che saltiamo dentro... non so cosa succede. E stavolta non voglio scoprirlo per scienza."

L'acqua, da qui, non riflette più il cielo giusto né quello sbagliato: riflette semplicemente **casa** — la piscina vera, quella di sopra, che aspetta dall'altra parte come una porta tenuta aperta da qualcuno con il piede.

Bisogna saltare tutti insieme, un'ultima volta, prima che il conto finisca.`,
    choices: [{ text: '🌊 Saltare. Tutti insieme. Senza guardare la luna che conta.', next: 'w_finale' }],
  },

  w_finale: {
    location: 'piscina',
    caption: 'Il ritorno — la piscina vera',
    text: `L'acqua si richiude sopra le teste una seconda volta stanotte, e stavolta è acqua vera: bagna, scalda, sa di cloro e di piscina vera, la più bella sensazione della notte.

Risalgono in cinque — sei, contando Sofia se ha scelto di venire con loro, o cinque e un vuoto pieno di gratitudine se ha scelto di restare — sul bordo della piscina VERA, quella di sopra, quella con la luna bianca sottile e normale nel cielo giusto.

Il Belvedere, qui, è ancora quello di sempre: caldo, elegante, in attesa. Ma qualcosa, nell'aria, è diverso — più leggero, come una casa che ha appena smesso di reggere un peso enorme senza saperlo dire.

L'**Inventario del Riflesso** — vuoto o quasi, a seconda di quanto sia costato stanotte — pesa in mano come un libro qualunque, adesso. Nessuna pagina sussurra più.

Da qualche parte nella villa, una porta verde in fondo a un corridoio aspetta ancora, e ci sono ancora ore prima dell'alba. Ma qualcosa, stanotte, è cambiato per sempre: **il Riflesso, sotto la piscina, ha un padrone di meno.**`,
    sets: { riflesso_fatto: true, ostaggi_liberati: true },
    choices: [{ text: 'Tornare al corridoio delle tre porte: la notte, di qua, non è ancora finita', next: 'h1' }],
  },

};

/* Mappa del Riflesso (per il canvas della mappa, formato di WORLD_MAP in campaign.js) */
const RIFLESSO_MAP_SCENES = [
  { key: 'riflesso_piscina',    label: 'La Piscina Capovolta',    x: 0.22, y: 0.50, scenes: ['w1_tuffo', 'w2_riflesso', 'w2_riflesso_ko', 'w17_fuga', 'w17_fuga_ko', 'w18_soglia', 'w_finale'] },
  { key: 'riflesso_giardino',   label: 'Il Giardino all\'Incontrario', x: 0.34, y: 0.62, scenes: ['w3_giardino', 'w3_pattuglia_combat', 'w4_sofia'] },
  { key: 'riflesso_villa',      label: 'Il Belvedere Capovolto',  x: 0.50, y: 0.40, scenes: ['w5_racconto', 'w6_1924', 'w7_ronda', 'w7_ronda_combat'] },
  { key: 'riflesso_direzione',  label: 'L\'Ufficio del Direttore', x: 0.62, y: 0.78, scenes: ['w8_direttore'] },
  { key: 'riflesso_studio',     label: 'Lo Studio Privato',       x: 0.74, y: 0.32, scenes: ['w9_studio', 'w9_studio_combat', 'w10_orologio', 'w10_orologio_reso'] },
  { key: 'riflesso_inventario', label: 'La Sala dell\'Inventario', x: 0.40, y: 0.55, scenes: ['w11_inventario', 'w12_tradimento', 'w12_sofia', 'w14_direttore_boss', 'w15_vittoria', 'w16_amaro'] },
];
