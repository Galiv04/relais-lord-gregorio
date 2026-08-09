/* ============ IL RELAIS DI LORD GREGORIO — campagna completa ============
   Formato identico al motore Corona. In più, gli EFFETTI DI CONDIZIONE:
   - captureRoller: true   → chi ha appena tirato (e fallito) viene PRESO dalla villa
   - poisonRoller: true    → chi ha appena tirato resta AVVELENATO (serve l'Antidoto)
   - freeAll: true         → libera tutti i PRESI
   - Valuta: G.gold = SANGUE FREDDO (🕯). Si guadagna con le scelte coraggiose,
     si perde davanti all'orrore. Alcune scelte richiedono nervi saldi.        */

const ITEMS = {
  kit_emanuela:     { name: 'Kit di Emanuela', desc: 'Garze, cerotti, ago da sutura e una calma innaturale. Ripristina 10 PV.', usable: true, heal: 10 },
  grappa_nonno:     { name: 'Grappa del Nonno di Gaetano', desc: 'Portata "per il brindisi". Ripristina 16 PV e un po\' di dignità.', usable: true, heal: 16 },
  antidoto:         { name: 'Antidoto di Erbe', desc: 'Le erbe giuste dell\'orto, bollite come dice il diario. Guarisce il VELENO del Belvedere.', usable: false, cureVeleno: true },
  sale_grosso:      { name: 'Sale Grosso Benedetto', desc: 'Dal barattolo in cucina, con un\'etichetta del 1899: "PER LORO". Da lancio: 2d8 danni, DOPPI alle creature della villa.', combat: { dice: [2, 8], holy: true }, icon: '🧂' },
  acqua_pozzo:      { name: 'Acqua del Pozzo Vecchio', desc: 'Gelida, e riflette un cielo che non è quello di stasera. Serve al rituale.', usable: false },
  diario_ada:       { name: 'Diario di Ada', desc: '1899. La moglie di Gregorio scrisse fino all\'ultima notte. Le ultime tre pagine sono strappate.', usable: false },
  chiave_cancello:  { name: 'Chiave del Cancello', desc: 'Ferro nero, pesante come una condanna. Apre l\'unico cancello del Belvedere.', usable: false },
  anello_1999:      { name: 'Anello del 1999', desc: 'Trovato sul fondo della piscina. Dentro è inciso: "A Sofia — per sempre qui".', usable: false },
  polaroid:         { name: 'Polaroid degli Ospiti', desc: 'Cinque ragazzi in piscina, datata 1999. Uno di loro è cerchiato in rosso.', usable: false },
  registro:         { name: 'Registro degli Ospiti', desc: '1899, 1924, 1949, 1974, 1999... e l\'ultima riga: i VOSTRI nomi, già scritti.', usable: false },
  accendino:        { name: 'Accendino di Federico', desc: '"Non fumo più, lo tengo per affezione." Stanotte vale oro.', usable: false },
  torcia_led:       { name: 'Torcia LED di Gaetano', desc: '1200 lumen, tre modalità. La terza non l\'avete mai provata.', usable: false },
  vino_1899:        { name: 'Bottiglia del 1899', desc: 'Il vino del primo Banchetto. L\'etichetta scritta a mano: "Da aprire solo per il Padrone".', usable: false },
  campanello:       { name: 'Campanello di Servizio', desc: 'Ottone lucido. Il cartellino dice: "Suonare in caso di bisogno. Verranno."', usable: false },
};

const CAMPAIGN = {

  /* ==================== PROLOGO — I TORNANTI ==================== */

  a1: {
    location: 'tornanti',
    caption: 'Strada provinciale — monti d\'Irpinia, ore 18:40',
    text: `**Venerdì pomeriggio. Cinque amici, una macchina piena come un uovo, e le montagne sopra Avellino che si mangiano il sole.**

Gaetano guida da un'ora e mezza. Claudia, di fianco, ha il telefono alzato da venti minuti: *"Niente segnale. NIENTE. Nemmeno una tacca ironica."* Dietro, Natalino è seduto in mezzo alle valigie come un faraone nel sarcofago, Federico difende la sua prenotazione — "cinque stelle, ragazzi, un AFFARE" — ed Emanuela ha già distribuito acqua e taralli a tutti, due volte.

Il navigatore ha smesso di parlare da tre tornanti. L'ultima cosa che ha detto è stata *"procedere sulla strada senza nome"*, e nessuno ha commentato perché nessuno voleva essere il primo.

Fuori, i castagneti si chiudono sopra la strada come dita. In basso, nella valle, un paesino di pietra grigia — il cartello dice **PIETRAFONDA, ab. 41** — con le persiane tutte chiuse. Tutte. Alle sette di sera di un venerdì d'estate.

> Natalino: "Quarantuno abitanti. Chi è l'uno? Io voglio conoscere l'UNO."

L'ultimo tornante gira attorno a un muro a secco, e il **Relais Belvedere** appare tutto insieme: una villa liberty color osso, aggrappata al fianco della montagna, con le finestre già accese di una luce calda color miele. È bellissima. È esattamente come nelle foto.

È l'unica casa nel raggio di chilometri con le luci accese.`,
    choices: [
      { text: '🚗 "Ragazzi. Siamo arrivati." Imboccate il viale del relais', next: 'a2' },
      { text: '📵 Prima, un ultimo tentativo di mandare la posizione a qualcuno', next: 'a1b' },
    ],
  },

  a1b: {
    location: 'tornanti',
    caption: 'La piazzola dell\'ultimo tentativo',
    text: `Gaetano accosta nella piazzola panoramica. Cinque telefoni si alzano verso il cielo come un piccolo rito pagano.

Niente. Zero. Claudia sale perfino sul guardrail — *"da qui parte SEMPRE"* — niente.

> Federico: "È il bello del posto! Digital detox! L'ho anche scritto io nella brochure— cioè, l'ho LETTO nella brochure."

> Claudia: *(scendendo dal guardrail)* "Federico. Cosa hai scritto nella brochure."

> Federico: "Ho fatto una piccola consulenza per il relais in cambio dello sconto. Comunicazione di base. 'Un rifugio fuori dal tempo', roba così."

*Un rifugio fuori dal tempo.* Sotto di voi, Pietrafonda spegne l'unica finestra che era rimasta accesa. Alle 18:52.

**(Il gruppo si scambia il primo sguardo della serata. Ne seguiranno altri.)**`,
    choices: [
      { text: '🚗 Al relais, prima che faccia buio del tutto', next: 'a2' },
    ],
  },

  a2: {
    location: 'relais',
    caption: 'Relais Belvedere — il viale d\'ingresso',
    text: `Il viale è di ghiaia bianca, perfetta, rastrellata a onde regolari come un giardino zen. La macchina la rovina per quaranta metri e a tutti, inspiegabilmente, **dispiace**.

Ai lati, siepi di bosso potate a forme che al primo sguardo sembrano animali e al secondo sguardo preferite non riguardare. In fondo, sotto la pensilina liberty, c'è un uomo.

Non "arriva". Non "esce ad accogliervi". **C'è.** Come se fosse lì da un tempo indefinito, con le mani dietro la schiena e un completo di lino color tortora senza una piega.

> L'uomo: "Benvenuti al Belvedere. Io sono **Gregorio**." *(un mezzo inchino, perfetto)* "Il viaggio è stato lungo. Le montagne non si lasciano raggiungere volentieri — è ciò che le rende preziose. Prego: le valigie le porto io."

Ha una sessantina d'anni portati come un abito su misura, mani curate, e una voce che sembra arrivare da un vecchio disco: calda, con una patina. Prende **quattro valigie insieme** senza il minimo sforzo e senza che ve ne accorgiate davvero, perché il suo sorriso tiene gli occhi occupati.

> Gregorio: "Gli altri ospiti non sono ancora... nel pieno della stagione. Stanotte il Belvedere è tutto vostro. **Esattamente come dev'essere.**"`,
    choices: [
      { text: '🤝 Presentazioni e convenevoli: siete pur sempre educati', next: 'a3' },
      { text: '👀 Mentre parla, dare un\'occhiata alle siepi. Un attimo fa erano diverse.', tag: 'Prova di Saggezza — CD 11', check: { stat: 'SAG', dc: 11, success: 'a2_siepi', fail: 'a3' } },
    ],
  },

  a2_siepi: {
    location: 'relais',
    caption: 'Il viale — le siepi',
    text: `Chi di voi ha l'occhio fino si volta al momento giusto.

Le siepi sono ferme. Ovvio che sono ferme, sono siepi. Ma la terza a sinistra — quella che entrando sembrava un cervo — adesso è **rivolta verso di voi**. Non piegata dal vento: *girata*. La ghiaia intorno alla sua base è smossa in un semicerchio, come sotto una porta che qualcuno ha aperto.

E nel bosso, all'altezza di dove un cervo avrebbe gli occhi, ci sono due buchi. Vuoti. Della misura esatta di due occhi.

> Gregorio: *(senza voltarsi, dalla soglia)* "Il giardiniere è un artista. Lavora solo di notte — il bosso, dice, si lascia convincere meglio al buio. Non fateci caso se lo sentite... potare."

**(Sangue freddo +1: l'avete visto e non avete urlato. Flag: il giardiniere.)**`,
    rep: 0,
    gold: 1,
    sets: { visto_giardiniere: true },
    choices: [{ text: 'Entrate. Insieme.', next: 'a3' }],
  },

  a3: {
    location: 'hall',
    caption: 'La hall del Belvedere',
    text: `Dentro, il Belvedere è **splendido** — e lo è in un modo che mette a disagio solo dopo qualche secondo, come una fotografia ritoccata troppo bene.

Pavimento a scacchi bianchi e neri, lucido da specchiarsi. Un lampadario di cristallo che tintinna piano *senza corrente d'aria*. Alle pareti, **ritratti a olio**: gruppi di persone in vacanza, epoche diverse — costumi anni '20, basette anni '70, un gruppo con gli occhiali da sole sollevati sui capelli che potrebbe essere del '99. Tutti sorridono. Tutti sono stati dipinti *in piscina*.

> Emanuela: *(piano, a Natalino)* "Chi si fa fare un ritratto a olio in costume da bagno?"

> Natalino: *(piano, a Emanuela)* "Gente con più soldi che gusto. O gente che non ha scelto la posa."

Sul bancone della reception: un **registro degli ospiti** aperto, una penna stilografica, e un **campanello d'ottone** con un cartellino scritto a mano: *"Suonare in caso di bisogno. Verranno."*

> Gregorio: "Una firma sola per il gruppo, se non vi dispiace. È una formalità antica. Al Belvedere teniamo molto... alle formalità antiche."`,
    choices: [
      { text: '✍️ Firmate il registro. È solo un registro.', next: 'a4_firma' },
      { text: '📖 Prima, sfogliare il registro all\'indietro. Le formalità antiche incuriosiscono.', tag: 'Prova di Intelligenza — CD 11', check: { stat: 'INT', dc: 11, success: 'a3_registro', fail: 'a3_registro_ko' } },
    ],
  },

  a3_registro: {
    location: 'hall',
    caption: 'Il registro — lettura veloce',
    text: `Chi di voi sfoglia, sfoglia SVELTO, col pollice, come si fa coi documenti in ufficio quando il capo si avvicina.

Le pagine sono poche e i gruppi pochissimi: il Belvedere non riceve spesso. Ma le date... le date hanno un ritmo.

**1899.** Sei nomi, grafia d'epoca. **1924.** Cinque nomi. **1949.** Cinque. **1974.** Cinque. **1999.** Cinque nomi — e accanto all'ultimo, una grafia diversa, minuta, ha aggiunto: *"rimasto"*.

Venticinque anni esatti tra un gruppo e l'altro. Nessun ospite in mezzo. E l'ultima pagina — quella di oggi — ha già una riga compilata, con una calligrafia elegante che non è di nessuno di voi:

***Gaetano, Claudia, Federico, Emanuela, Natalino — soggiorno: completo.***

La parola "completo" è scritta con una cura particolare.

> Gregorio: *(materializzandosi accanto, gentile)* "Ah, l'ho compilata io per farvi risparmiare tempo. Manca solo la firma. **La firma è importante.**"

**(Avete visto le date. Flag: il venticinquennio. Sangue freddo +1.)**`,
    sets: { visto_registro: true },
    gold: 1,
    choices: [
      { text: '✍️ Firmate. Con gli occhi aperti, ma firmate.', next: 'a4_firma' },
      { text: '🗣 "Firmiamo domani con calma. Il viaggio, la stanchezza..."', tag: 'Prova di Carisma — CD 12', check: { stat: 'CAR', dc: 12, success: 'a4_rinvio', fail: 'a4_firma_forzata' } },
    ],
  },

  a3_registro_ko: {
    location: 'hall',
    caption: 'Il registro — lettura interrotta',
    text: `Le dita sfogliano all'indietro — 1999... 1974... — ma una mano si posa sulla pagina. Non forte. **Precisa.** Come un fermacarte che ha deciso da solo dove stare.

> Gregorio: "Le storie degli altri ospiti sono la parte più noiosa di un albergo, mi creda. Le vostre, invece..." *(gira il registro verso di voi, la pagina di oggi, la penna già in mano)* "...le vostre cominciano stasera."

I vostri nomi sono **già scritti**, in una calligrafia elegante che non è di nessuno di voi. Manca solo la firma.

> Federico: *(sottovoce)* "Efficienza. Cinque stelle. Ve l'avevo detto."

> Claudia: *(sottovoce)* "Federico, sapeva i nostri nomi in ordine di posto in macchina."`,
    choices: [
      { text: '✍️ Firmate: siete stanchi e il letto chiama', next: 'a4_firma' },
    ],
  },

  a4_rinvio: {
    location: 'hall',
    caption: 'La firma rimandata',
    text: `Federico entra in modalità professionale: sorriso da chiusura contratto, mano sul cuore.

> Federico: "Gregorio, lei è un padrone di casa d'altri tempi e noi siamo CIALTRONI d'altri tempi: guardi come siamo conciati. Firmare un documento così elegante in queste condizioni sarebbe una mancanza di rispetto. **Domattina**, riposati, con la mano ferma. Glielo firmo pure in corsivo inglese."

Un silenzio lungo. Il lampadario smette di tintinnare — e ve ne accorgete solo ora, perché il tintinnio c'era da quando siete entrati.

> Gregorio: *(alla fine, con un sorriso che arriva un decimo di secondo in ritardo)* "Che gruppo... **interessante**. Domattina, dunque. Il Belvedere è paziente. Ha avuto molto tempo per impararlo."

Riprende le valigie. Il lampadario ricomincia a tintinnare.

**(La firma NON è stata messa. Questo, stanotte, conterà. Sangue freddo +2.)**`,
    sets: { firma_rinviata: true },
    gold: 2,
    choices: [{ text: 'Alle camere', next: 'a5' }],
  },

  a4_firma_forzata: {
    location: 'hall',
    caption: 'La firma',
    text: `> Gregorio: *(dolcissimo, inamovibile)* "Temo di dover insistere. Le assicurazioni, i regolamenti... viviamo in tempi complicati perfino quassù. **Una firma sola** e non ci pensiamo più."

La penna stilografica è già in mano a qualcuno di voi — nessuno ricorda di averla presa. La punta tocca la carta e il tratto esce nero, lucido, *più nero dell'inchiostro*.

Firmato. Il registro si chiude da solo con un tonfo soffice, come un applauso a una mano.

> Gregorio: "**Benvenuti al Belvedere.** Ora è ufficiale."

E per un attimo — un attimo solo — la luce color miele della hall diventa più calda, come un forno quando ci si mette dentro qualcosa.`,
    sets: { firma_messa: true },
    choices: [{ text: 'Alle camere', next: 'a5' }],
  },

  a4_firma: {
    location: 'hall',
    caption: 'La firma',
    text: `Una firma sola per il gruppo. La mette chi ha la calligrafia migliore — cioè Natalino, dopo un breve dibattito e due smentite.

La penna stilografica scrive con un nero **profondissimo**, quasi bagnato. La firma resta lucida qualche secondo di troppo prima di asciugarsi, come se la carta ci pensasse su.

> Gregorio: "**Perfetto.** Benvenuti al Belvedere. Ora è ufficiale." *(chiude il registro con due dita, con la tenerezza di chi rimbocca una coperta)* "Vi mostro le camere. Poi, alle nove, la cena. Ho preparato personalmente: è il primo soggiorno della stagione, e i primi soggiorni... si onorano."

Mentre salite le scale, Claudia si volta un secondo verso il bancone.

Il registro è di nuovo aperto. Sulla pagina di oggi.

**(La firma è stata messa.)**`,
    sets: { firma_messa: true },
    choices: [{ text: 'Alle camere', next: 'a5' }],
  },

  a5: {
    location: 'corridoio',
    caption: 'Il corridoio delle camere — primo piano',
    text: `Il corridoio del primo piano è lungo, coi tappeti rossi che bevono il rumore dei passi e le lampade a muro che si accendono **una alla volta, mentre passate** — mai prima, mai dopo.

> Gregorio: "Le coppie qui: la **Camera del Glicine** per il signor Federico e la signora Emanuela, la **Camera dei Melograni** per il signor Gaetano e la signora Claudia. E per il signor Natalino..." *(si ferma davanti all'ultima porta, in fondo, dove il corridoio gira nel buio)* "...la **Camera del Pozzo**. La migliore. La riserviamo sempre all'ospite... singolare."

> Natalino: "'Singolare'. Ho fatto trent'anni di battute sui single, ma detta da lei fa un altro effetto, Gregorio."

> Gregorio: *(sorriso)* "Dalla sua finestra si vede il pozzo vecchio del giardino. Alcuni ospiti lo trovano rilassante. Altri tengono le tende chiuse. **Sono valide entrambe le scuole di pensiero.**"

Le camere sono perfette: lini freschi, fiori tagliati stasera, acqua e frutta. Su ogni cuscino, un cioccolatino artigianale e un biglietto scritto a mano: *"Il Belvedere vi aspettava."*

Non "vi aspetta". **Vi aspettava.**`,
    choices: [
      { text: '🧳 Disfare le valigie e prepararsi per cena', next: 'a6' },
      { text: '🪟 Natalino apre le tende della Camera del Pozzo. Ovviamente.', next: 'a5_pozzo' },
    ],
  },

  a5_pozzo: {
    location: 'camera',
    caption: 'Camera del Pozzo — la finestra',
    text: `Natalino è single, parrucchiere e napoletano d'adozione: non esiste al mondo tenda che resti chiusa davanti a lui.

Il giardino sul retro, da quassù, è uno scacchiere di siepi e ghiaia azzurrina sotto l'ultima luce. E in mezzo, esattamente al centro, il **pozzo vecchio**: pietra scura, tetto a cuspide, un secchio legato a una corda che scende nel buio.

Carino. Rustico. Da foto.

Poi Natalino nota il dettaglio: **la corda è tesa.** Non penzola: TIRA, piano, con degli strappi regolari, come quando all'altro capo c'è qualcosa che... risale con calma.

Bussa alla parete. *"Emanuè. Emanuela. Vieni un attimo."*

Quando Emanuela arriva, la corda penzola immobile, il secchio dondola appena, e sul bordo del pozzo c'è una cosa che prima non c'era: **un asciugamano del relais, piegato con cura. Come a bordo piscina.**

> Emanuela: "...il vento."

> Natalino: "Sì. Il vento. Il famoso vento che piega gli asciugamani."

**(Flag: il pozzo. Sangue freddo +1 per il sopralluogo.)**`,
    sets: { visto_pozzo: true },
    gold: 1,
    choices: [{ text: 'Scendete per la cena. In gruppo. Da ora in poi, sempre in gruppo.', next: 'a6' }],
  },

  a6: {
    location: 'salaDaPranzo',
    caption: 'La cena delle nove — sala da pranzo',
    text: `La sala da pranzo è un piccolo teatro: un tavolo lungo apparecchiato d'argento, candelabri accesi, e le portefinestre che danno sulla piscina illuminata di turchese là fuori, fumante nell'aria fresca della montagna.

La cena è — non c'è altra parola — **straordinaria**. Pasta fatta in casa, un arrosto che si taglia col pensiero, verdure dell'orto. Gregorio serve tutto personalmente, con tempi da orologeria, raccontando la valle: i castagneti, il santuario lassù, il paese.

> Gregorio: "Pietrafonda si è svuotata negli anni. Restano gli anziani, e gli anziani vanno a letto presto. Per questo le persiane chiuse: **non è maleducazione. È memoria.**"

> Gaetano: "Memoria di cosa?"

> Gregorio: *(riempiendogli il bicchiere, senza fretta)* "Delle notti in cui conviene non guardare fuori. Ogni paese di montagna ne ha qualcuna. La vostra generazione le chiama superstizioni. La mia le chiamava **istruzioni.**"

Ride, e ridete anche voi, e il vino è così buono che la frase scivola via. Quasi.

C'è solo un dettaglio che Claudia registra senza volerlo, da professionista dell'osservazione: in tutta la sera, con cinque portate e sei brindisi, **Gregorio non ha mangiato né bevuto niente.** Nemmeno un'oliva.`,
    choices: [
      { text: '🍷 Chiedere a Gregorio di unirsi al brindisi: insistere, con simpatia', tag: 'Prova di Carisma — CD 12', check: { stat: 'CAR', dc: 12, success: 'a6_brindisi', fail: 'a6_no_brindisi' } },
      { text: '🏊 Buttarla sul programma: "Gregorio, la piscina si può usare di sera?"', next: 'a7' },
    ],
  },

  a6_brindisi: {
    location: 'salaDaPranzo',
    caption: 'Il brindisi di Gregorio',
    text: `Federico si alza col bicchiere, e quando Federico si alza col bicchiere le probabilità di scampo sono note a tutti.

> Federico: "Gregorio! Lei stasera ci ha trattati come famiglia, e nella mia famiglia chi non brinda paga il conto. Un dito di vino. UNO. Per il Belvedere!"

Gregorio guarda il bicchiere. Lo guarda per un secondo di troppo — il tempo che si dedica a un oggetto d'epoca, o a una trappola.

> Gregorio: "Per il Belvedere, dunque."

Se lo versa. Lo alza. Lo **appoggia alle labbra chiuse.** E lo ripone, pieno esattamente come prima, con un sorriso da fotografia.

> Gregorio: "Squisito. Complimenti a me." *(una pausa perfetta)* "Sapete, sono astemio dal 1899."

Ridete tutti. È chiaramente una battuta. È CHIARAMENTE una battuta.

> Gregorio: *(raccogliendo i piatti)* "La piscina è vostra, signori. La notte al Belvedere è la parte migliore del soggiorno. **Vi aspetta dalle nove di stasera... da molto prima, a dire il vero.**"

**(Flag: astemio dal 1899. Sangue freddo +1.)**`,
    sets: { battuta_1899: true },
    gold: 1,
    choices: [{ text: '🏊 In piscina!', next: 'p1' }],
  },

  a6_no_brindisi: {
    location: 'salaDaPranzo',
    caption: 'Il brindisi mancato',
    text: `> Gregorio: *(posando la bottiglia con una carezza)* "Il padrone di casa che beve coi suoi ospiti finisce per raccontare i segreti della casa. E una casa senza segreti, signori..." *(apre le portefinestre sulla piscina turchese, fumante nella notte)* "...è solo un mucchio di stanze."

Il discorso muore lì, elegantissimo, e non c'è modo di rianimarlo: Gregorio è già altrove, a versare l'amaro, a consigliare la grappa di castagne, a essere il miglior padrone di casa che abbiate mai incontrato.

> Emanuela: *(a bassa voce, mentre gli altri ridono di una battuta di Natalino)* "Ragazzi. Non ha mangiato. In tutta la sera."

> Gaetano: "Avrà mangiato prima. In cucina. Fanno tutti così."

> Emanuela: "Gaetà. Amore mio. C'è UN coperto in cucina, l'ho visto passando. È **pulito e impolverato insieme.**"

> Gregorio: *(da dietro, sorridente, col vassoio degli amari)* "La piscina è pronta, signori. La notte al Belvedere è la parte migliore del soggiorno."`,
    choices: [{ text: '🏊 In piscina!', next: 'p1' }],
  },

  a7: {
    location: 'salaDaPranzo',
    caption: 'Il programma della serata',
    text: `> Gregorio: "La piscina di sera è **il cuore del Belvedere.** Riscaldata a trentadue gradi, illuminata fino a mezzanotte. La nebbia che sale dalla valle si ferma sempre al bordo del giardino — un capriccio delle correnti, dicono. Fa uno spettacolo che gli ospiti ricordano per il resto della vita."

Lo dice con una soddisfazione precisa, da collezionista.

> Gregorio: "Gli accappatoi sono già ai lettini. Le luci le spengo io a mezzanotte: è l'unica regola della casa. **A mezzanotte, dentro.** La montagna, di notte, non è dei villeggianti."

Raccoglie i piatti in un silenzio perfetto, e sulla soglia della cucina si ferma, di spalle:

> Gregorio: "Ah. Se doveste sentire il giardiniere lavorare, non fateci caso. Il bosso si pota meglio al buio. **Lui dice che così le siepi non lo vedono arrivare.**"

La porta della cucina si chiude senza rumore.

> Natalino: "...ragazzi, io il bagno lo faccio comunque, sia chiaro. Però qualcuno tiene d'occhio le siepi."`,
    choices: [{ text: '🏊 In piscina!', next: 'p1' }],
  },

  /* ==================== LA SERA IN PISCINA ==================== */

  p1: {
    location: 'piscina',
    caption: 'La piscina del Belvedere — ore 22:10',
    text: `Ed eccola: la scena da cartolina che ha convinto tutti a partire.

La piscina è un rettangolo di luce turchese ritagliato nel buio della montagna, col vapore che sale in volute pigre nell'aria fredda. Intorno, il silenzio assoluto dei milleduecento metri: niente grilli, niente cani, niente paese — solo l'acqua che sciaborda piano contro il bordo, da sola.

L'acqua è PERFETTA. Trentadue gradi di perdono per ogni tornante. Per dieci minuti buoni il Belvedere è semplicemente il posto più bello dove siate mai stati: Federico fa il morto a galla dichiarando "ve l'avevo detto" alle stelle, Natalino ed Emanuela discutono di un cliente mitologico, Claudia fa le foto col telefono *"tanto per quando torna il segnale"*, Gaetano conta le stelle cadenti.

Poi Claudia abbassa il telefono.

> Claudia: "Ragazzi. Quanti lettini abbiamo?"

Sono **sei.** Sei lettini, disposti a semicerchio. Sei asciugamani arrotolati. Sei accappatoi bianchi appesi, con le iniziali ricamate in filo bordeaux: G, C, F, E, N...

...e sull'ultimo accappatoio, l'iniziale è ancora attaccata con gli spilli. Come se la sarta stesse **aspettando di sapere la lettera.**`,
    choices: [
      { text: '😅 "Ne avranno messo uno di scorta." Continuare il bagno: l\'acqua è troppo bella', next: 'p2' },
      { text: '🔍 Uscire a controllare l\'accappatoio da vicino', tag: 'Prova di Saggezza — CD 11', check: { stat: 'SAG', dc: 11, success: 'p1_accappatoio', fail: 'p1_accappatoio_ko' } },
    ],
  },

  p1_accappatoio: {
    location: 'piscina',
    caption: 'Il sesto accappatoio',
    text: `Chi esce dall'acqua lo fa con la nonchalance di chi va a prendere il telo — e ispeziona il sesto accappatoio con le mani che fingono di cercare le sigarette.

L'iniziale con gli spilli è un **cartamodello vuoto**: la sarta ha preparato il ricamo ma non l'ha cucito. Sotto, però, sulla stoffa, si vede il fantasma di **lettere precedenti**, scucite e ricucite più volte: una S. Una M. Una R. Il tessuto è consumato proprio lì, come una lavagna cancellata troppe volte.

E nella tasca dell'accappatoio c'è **un paio di occhiali da sole.** Modello anni '90, lenti sfumate. Dentro una stanghetta, a pennarello mezzo cancellato: *S. — Belvedere '99.*

> Natalino: *(dall'acqua)* "Che c'è scritto? Perché hai la faccia di quando il cliente dice 'fai tu'?"

**(Oggetto trovato: gli occhiali del '99 restano nella tasca — ma il dettaglio è registrato. Flag: il sesto ospite. Sangue freddo +1.)**`,
    sets: { sesto_ospite: true },
    gold: 1,
    choices: [{ text: 'Tornare in acqua e fare finta di niente. Malissimo.', next: 'p2' }],
  },

  p1_accappatoio_ko: {
    location: 'piscina',
    caption: 'Il sesto accappatoio — ispezione goffa',
    text: `Chi esce dall'acqua per controllare inciampa nel bordo del lettino, si aggrappa all'accappatoio misterioso, e l'appendino cede con uno **strappo di stoffa** che nel silenzio della montagna suona come una fucilata.

L'accappatoio finisce in terra. Gli spilli dell'iniziale si sparpagliano sul travertino con un tintinnio da carillon rotto.

E da qualche parte — non dalla villa: **dal buio oltre le siepi** — arriva un suono secco e ritmico. *Clip. Clip. Clip.*

Cesoie.

Che si fermano.

> Federico: *(piano)* "Il giardiniere lavora, avete sentito Gregorio. Lavora e basta. Rimetti a posto l'accappatoio, con CALMA, e torna in acqua."

L'accappatoio, raccolto in fretta, viene riappeso storto. Quando vi voltate di nuovo, tre vasche dopo, **è appeso dritto.** Perfetto. Con gli spilli rimessi a posto.

**(-1 Sangue freddo. Flag: il giardiniere vi ha sentiti.)**`,
    gold: -1,
    sets: { giardiniere_allertato: true },
    choices: [{ text: 'Tornare in acqua. Vicini.', next: 'p2' }],
  },

  p2: {
    location: 'piscina',
    caption: 'La piscina — il gioco del riflesso',
    text: `Il bagno riprende. La montagna riprende il suo silenzio. Emanuela organizza il torneo di apnea — regole da salone: *"chi bara paga gli aperitivi per un anno"* — e per un po' l'unica cosa inquietante della serata è quanto Gaetano tenga a vincere.

È durante la terza manche che Claudia, fuori a fare da giudice col telefono, inquadra la superficie dell'acqua per il replay.

E si blocca.

> Claudia: "...uscite un attimo. Tutti. **Con calma.**"

Nel telefono, il replay mostra la piscina dall'alto: l'acqua turchese, i corpi che nuotano, le risate. Tutto normale. Tranne il **riflesso delle stelle.**

Nell'acqua si riflette un cielo. Ma non È il cielo che avete sopra la testa: le costellazioni sono **diverse**, più fitte, disposte in figure che non avete mai visto su nessuna app di astronomia. E in quel cielo riflesso, bassa sull'orizzonte dell'acqua, c'è una **luna piena enorme e rossa.**

Alzate la testa: sopra di voi, la luna vera è un taglio sottile, bianco, al primo quarto.

> Gaetano: *(molto piano, da ingegnere che ha finito le spiegazioni)* "...rifrazione. No. Inversione termica. No. Ragazzi, io non..."

E mentre lo dice, nel riflesso, la luna rossa **inizia lentissimamente a salire.**`,
    choices: [
      { text: '🏃 FUORI DALL\'ACQUA. Tutti. ORA.', next: 'p3_fuori' },
      { text: '🔬 Gaetano vuole capire: un esperimento veloce, un oggetto a pelo d\'acqua', tag: 'Prova di Intelligenza — CD 12', check: { stat: 'INT', dc: 12, success: 'p2_esperimento', fail: 'p2_esperimento_ko' } },
    ],
  },

  p2_esperimento: {
    location: 'piscina',
    caption: 'L\'esperimento di Gaetano',
    text: `Gaetano, già fuori dall'acqua e col cervello in modalità laboratorio, prende la cosa più scientifica a portata di mano: l'infradito di Federico.

> Federico: "Quella è NUOVA—"

> Gaetano: "È per la scienza."

La posa a pelo d'acqua, delicatamente, al centro del riflesso della luna rossa.

L'infradito galleggia. Il suo riflesso **no.**

Nel cielo capovolto sotto la superficie, dove dovrebbe esserci l'ombra dell'infradito, non c'è niente: la luna rossa continua a salire, indisturbata, come se l'oggetto vero non esistesse. Come se — Gaetano lo dice ad alta voce, con la calma piatta delle pessime notizie — **"il riflesso non fosse un riflesso. È una finestra. Noi non ci siamo, dall'altra parte. O non ci siamo ANCORA."**

L'infradito, piano, comincia a ruotare su sé stessa. Controcorrente. Poi qualcosa, da sotto, la **tira giù.** Senza schizzi. Come un appunto preso.

> Federico: "...era NUOVA."

**(Sangue freddo +2: avete guardato nell'abisso con metodo. Flag: la finestra.)**`,
    sets: { vista_finestra: true },
    gold: 2,
    choices: [{ text: 'Fuori dall\'acqua. La scienza ha dato il suo verdetto.', next: 'p3_fuori' }],
  },

  p2_esperimento_ko: {
    location: 'piscina',
    caption: 'L\'esperimento — variabile imprevista',
    text: `Gaetano si china sul bordo per posare l'infradito-sonda a pelo d'acqua, con la concentrazione di un allunaggio.

E l'acqua **gli viene incontro.**

Non un'onda: un rigonfiamento, silenzioso e mirato, come un gatto che si inarca sotto la carezza. Il pelo dell'acqua tocca le dita di Gaetano ed è **gelido** — trentadue gradi ovunque, zero assoluto in quel punto esatto — e per un istante, nel riflesso, la luna rossa smette di salire.

Perché qualcosa, davanti a lei, si è affacciato a guardare. Una sagoma. In piedi sull'acqua capovolta. Col **taglio di capelli anni '90.**

Gaetano fa quello che farebbe qualunque ingegnere aerospaziale con dieci anni di studi: cade seduto all'indietro urlando *"MADONNA"* e l'infradito finisce in acqua.

Il rigonfiamento si ritira. L'infradito affonda **in verticale**, risucchiata, senza una bolla.

> Federico: "...era nuova."

**(-1 Sangue freddo. Chi ha tirato resta scosso: il gelo di quell'acqua non se ne va dalle dita — AVVELENATO dal freddo del Belvedere finché non trova un rimedio.)**`,
    gold: -1,
    poisonRoller: true,
    sets: { vista_sagoma_99: true },
    choices: [{ text: 'Fuori. FUORI. Tutti.', next: 'p3_fuori' }],
  },

  p3_fuori: {
    location: 'piscina',
    caption: 'Bordo piscina — ore 23:40',
    text: `Cinque persone in accappatoio, strette in semicerchio, che guardano una piscina come si guarda un cane che ha appena parlato.

L'acqua è tornata normale. Turchese, fumante, invitante. IL problema è esattamente questo: è invitante **come prima**, come se sapesse di aver esagerato e volesse rimediare.

> Natalino: "Ok. Ricapitoliamo da professionisti. Sei accappatoi. Un cielo sbagliato nell'acqua. Un'infradito rapita. E il paese laggiù—" *(indica la valle)* "—che alle sette aveva le persiane chiuse."

> Emanuela: "E Gregorio che non mangia, non beve, ed è 'astemio dal 1899'."

> Claudia: "E il registro. Un gruppo ogni venticinque anni. **1999. 1974. 1949...**"

> Federico: *(dopo un lungo silenzio, con la voce di chi rilegge un contratto già firmato)* "...e il 2024 saremmo noi. Ragazzi. Io da domani mattina scrivo una recensione DEVASTANTE."

È quasi mezzanotte. Le luci della piscina, come promesso da Gregorio, cominciano a spegnersi una a una. E dalla valle, per la prima volta da quando siete arrivati, **la nebbia inizia a salire.** Lenta. Compatta. E — Gaetano lo nota con orrore geometrico — **contro pendenza.**`,
    choices: [
      { text: '🚪 Dentro. Ora. Come ha detto Gregorio: "a mezzanotte, dentro"', next: 'p4_rientro' },
      { text: '🚗 SUBITO IN MACCHINA. Si parte adesso, in accappatoio se serve', next: 'p4_fuga' },
    ],
  },

  p4_fuga: {
    location: 'relais',
    caption: 'Il tentativo di fuga — ore 23:52',
    text: `La decisione è unanime nel modo speciale in cui è unanime il panico educato: nessuno lo dice ad alta voce, ma in novanta secondi siete tutti vestiti a metà, con le valigie richiuse a morsi, giù per le scale.

La macchina è dove l'avete lasciata. Si apre. Si accende. Gaetano ingrana la prima con la delicatezza di un rapinatore e il viale di ghiaia bianca scricchiola sotto le ruote — fino al **cancello.**

Il cancello di ferro nero, che all'arrivo era spalancato, è **chiuso.** Non c'era un cancello chiuso nelle foto. Non c'era proprio, il cancello, nelle foto.

E oltre le sbarre, la strada dei tornanti... non c'è. C'è la nebbia. Un muro verticale di nebbia bianca, ferma, spessa come lana, che comincia ESATTAMENTE al confine della proprietà. I fari ci sbattono contro e tornano indietro.

> Gregorio: *(la sua voce, gentile, dal citofono del cancello che NON ha fili)* "Signori. Capita a tutti i gruppi, la prima notte: è il soggiorno che si assesta. La montagna di notte non è dei villeggianti — ve l'avevo detto con largo anticipo. Rientrate, vi prego. Ho preparato una tisana. **Il Belvedere detesta veder partire gli ospiti... in anticipo.**"

Dietro la macchina, sulla ghiaia, il rumore delle cesoie. *Clip. Clip.* Vicinissimo.

**(-1 Sangue freddo. Il Belvedere è ufficialmente chiuso. Flag: avete provato a scappare.)**`,
    gold: -1,
    sets: { tentata_fuga: true },
    choices: [{ text: 'Rientrare. Compatti. E cominciare a fare sul serio', next: 'h1' }],
  },

  p4_rientro: {
    location: 'hall',
    caption: 'Il rientro — mezzanotte meno cinque',
    text: `Rientrate ordinati e velocissimi, con la compostezza isterica delle scolaresche in gita quando inizia il temporale.

Dentro, il Belvedere è caldo, profumato di legna e cera — e **diverso.** Niente di plateale: è tutto al suo posto, ed è proprio questo il punto. È al suo posto *di nuovo*, come una stanza riordinata da qualcuno mentre eravate fuori. I ritratti alle pareti sono tutti dritti. Il registro è chiuso. Il lampadario tintinna.

Solo una cosa è cambiata davvero: nella hall, appoggiata al bancone della reception, c'è **una tisaniera fumante con cinque tazze.** Cinque. Preparate prima che decideste di rientrare.

E accanto alle tazze, un biglietto con la solita calligrafia elegante:

*"La notte al Belvedere comincia a mezzanotte. Chiudete bene le finestre. Non aprite a chi bussa con la voce di qualcuno che è già dentro. — G."*

> Emanuela: *(rileggendo)* "...'con la voce di qualcuno che è già dentro'."

> Natalino: "Io questa tisana non la bevo manco morto. Scusate il gioco di parole."

Da qualche parte sopra di voi, al piano delle camere, **un pavimento scricchiola.** Una volta. Poi, educatamente, si ferma ad aspettare.`,
    choices: [{ text: 'Su. Insieme. Si va a capire che notte è questa', next: 'h1' }],
  },

  /* ==================== LA NOTTE SI CHIUDE — HUB ==================== */

  h1: {
    location: 'corridoio',
    caption: 'Il corridoio — mezzanotte',
    text: `A mezzanotte in punto, tre cose succedono insieme.

**Uno:** tutte le lampade del corridoio si accendono da sole, in fila, con un *tac-tac-tac* da plotone.

**Due:** l'aria cambia sapore — di colpo sa di cantina, di pietra bagnata, di **casa vecchia sotto la casa nuova.**

**Tre:** in fondo al corridoio, dove il muro ha sempre fatto angolo, adesso c'è una **porta.** Verde scuro, vernice screpolata, con una targhetta d'ottone: *"SOLO PERSONALE — dal 1899"*. È socchiusa. Dietro, buio e gradini che scendono.

> Gregorio: *(alle vostre spalle: nessuno l'ha sentito arrivare, MAI nessuno lo sente arrivare)* "Ah. La casa vi ha aperto. **Mi dispiace: speravo aveste più tempo.** Di solito lo lascia per l'ultima notte."

È in vestaglia da camera, impeccabile, con un candeliere in mano. E per la prima volta da quando lo conoscete, il suo sorriso non è in servizio: sembra, semplicemente, **stanco.** Una stanchezza da secoli.

> Gregorio: "Regole della notte, e ve le dico una volta sola perché una volta sola mi è permesso: **il Belvedere prende un gruppo ogni venticinque anni.** Io sono... il tramite. Non il padrone: il MAGGIORDOMO del patto. Da stanotte all'alba, la casa proverà a trattenervi. A prendervi **a uno a uno.** Chi viene preso non muore — il Belvedere non spreca — ma resta. Come sono rimasto io, nel 1899."

Si scosta, e il candeliere illumina tre direzioni: **la porta verde che scende in cantina**, **la scala di servizio che sale al piano proibito**, e in fondo, la portafinestra verso **il giardino e il pozzo.**

> Gregorio: "Il patto ha tre nodi: la CANTINA, dove dormono quelli di prima. Il **PIANO DI SOPRA**, dove la casa tiene i suoi ricordi. E il **POZZO**, dove abita la cosa con cui firmai. Scioglietene quanti riuscite prima dell'alba, e forse l'ultima parola sarà vostra. Io non posso aiutarvi oltre: ogni parola che vi dico, **la casa me la toglie da qualcos'altro.**"

E davvero: mentre lo dice, una ciocca dei suoi capelli diventa bianca.`,
    hub: true,
    choices: [
      { text: '🍷 Scendere in CANTINA — dove dormono quelli di prima', next: 'k1', once: true },
      { text: '🚪 Salire al PIANO PROIBITO — i ricordi della casa', next: 'u1', once: true },
      { text: '🌳 Uscire verso il POZZO — la cosa con cui Gregorio firmò', next: 'b1', once: true },
      { text: '❓ Trattenere Gregorio: ancora una domanda, gliela si legge in faccia', next: 'h2', once: true },
      { text: '🌅 Basta così: barricarsi e aspettare l\'alba (verso il finale)', next: 'z1', requires: { flag: 'un_nodo_sciolto' } },
    ],
  },

  h2: {
    location: 'corridoio',
    caption: 'L\'ultima domanda a Gregorio',
    text: `> Federico: "Gregorio. Una domanda sola. Nel 1899... eravate in sei?"

Il candeliere trema. Piano, ma trema.

> Gregorio: "In sei. Amici di Napoli e della valle. Io, mia moglie **Ada**, e altri quattro. Ridevamo come voi. Il quinto giorno la casa cominciò a prenderci, e l'ultima notte restammo in due: io e Ada. Il patto voleva l'ultimo nome. **Uno solo.**" *(guarda il candeliere)* "Io firmai più veloce."

Silenzio. Perfino il lampadario smette di tintinnare.

> Gregorio: "Da centoventicinque anni apparecchio tavole e stiro lenzuola aspettando un gruppo che sciolga i nodi che io non ebbi il coraggio di sciogliere. Ada è **nel pozzo**, signori. È lei che tira la corda, la sera. È lei che piega gli asciugamani." *(una ciocca ancora, bianca)* "Se arrivate da lei... ditele che il vino del 1899 **non l'ho mai aperto.**"

Si volta e se ne va lungo il corridoio, dritto, e le lampade si spengono al suo passaggio, una a una, per rispetto.

**(Flag: la storia di Ada. Sangue freddo +2 — sapere è coraggio.)**`,
    sets: { storia_ada: true },
    gold: 2,
    choices: [{ text: 'Tornare al corridoio delle tre porte', next: 'h1' }],
  },

  /* ==================== PISTA 1 — LA CANTINA ==================== */

  k1: {
    location: 'cantina',
    caption: 'La scala della cantina — "dove dormono quelli di prima"',
    text: `La porta verde si apre su una scala di pietra che scende più di quanto una villa dovrebbe permettersi. Dieci gradini. Venti. Trenta. L'aria si fa fredda e dolciastra — **cantina, terra, e sotto la terra qualcos'altro.**

Le pareti sono coperte di rastrelliere: **bottiglie di vino**, migliaia, tutte coricate, tutte senza polvere. Qualcuno le spolvera. Ogni giorno. Da sempre.

Claudia illumina le etichette col telefono. Sono scritte a mano. E non portano nomi di vitigni.

Portano **nomi di persone.**

*"Margherita, 1924." "Ernesto, 1949." "Sofia, 1999."*

> Gaetano: *(piano)* "Sono ordinate per annata. Cinque bottiglie ogni venticinque anni. E guardate là in fondo—"

In fondo alla cantina, oltre le rastrelliere, si vedono **cinque nicchie vuote**, già scavate nella parete. Pulite. Pronte. Sopra ognuna, una piccola targa d'ottone ancora senza nome.

E le bottiglie — è impossibile, ed è vero — quando ci passate davanti, **sussurrano.** Piano, come un ricordo che si gira nel sonno.`,
    choices: [
      { text: '👂 Avvicinare l\'orecchio a una bottiglia. A "Sofia, 1999".', tag: 'Prova di Saggezza — CD 12', check: { stat: 'SAG', dc: 12, success: 'k2_sofia', fail: 'k2_sofia_ko' } },
      { text: '🚶 Non toccare niente e proseguire verso il fondo', next: 'k3' },
    ],
  },

  k2_sofia: {
    location: 'cantina',
    caption: 'La bottiglia di Sofia',
    text: `Chi si china sulla bottiglia lo fa con rispetto, come su un letto d'ospedale.

Il sussurro si mette a fuoco lentamente, tipo una radio che trova la stazione. È una voce di ragazza, anni '90 fin nell'accento, e NON è spaventosa. È peggio: è **normale.** Stanca e normale.

> La bottiglia: *"...se senti, non sei di qui. Ascolta. Il vino siamo NOI — quello che ha tolto, per tenerci buoni: i ricordi belli, ci ha messi in cantina come si fa con le cose buone. Il resto di noi sta di sopra, nelle cornici. Non bere MAI. Non mangiare più niente, da mezzanotte in poi. E se vedi Gregorio... non odiarlo troppo. Anche lui sta in una bottiglia, da qualche parte. Solo che la sua cammina."*

Un silenzio. Poi, più piano:

> La bottiglia: *"...che anno è? È già il nostro turno di uscire? Mamma aspetta."*

Non c'è niente da rispondere che non sia una crudeltà. Rimettete la bottiglia nella rastrelliera **con due mani.**

**(Segreto: il vino sono i ricordi degli ospiti. Sangue freddo +2. Flag: la voce di Sofia.)**`,
    sets: { voce_sofia: true },
    gold: 2,
    choices: [{ text: 'Verso il fondo della cantina', next: 'k3' }],
  },

  k2_sofia_ko: {
    location: 'cantina',
    caption: 'La bottiglia sbagliata',
    text: `L'orecchio si avvicina alla bottiglia sbagliata — quella accanto, **senza etichetta** — e il sussurro sale di volume TUTTO INSIEME, come una mano che afferra.

*"FUORI FUORI FUORI FUORI—"*

Chi ascoltava si ritrae di scatto, sbatte nella rastrelliera, e una bottiglia — *"Ernesto, 1949"* — rotola, cade e **si spacca sul pavimento.**

Il vino non si sparge. Si ALZA: un vapore rosso scuro che per un secondo ha la forma di un uomo in costume da bagno anni '40, che vi guarda con una gratitudine terribile — *"grazie"*, dice una voce nell'aria, *"ditelo a mia sorella"* — e si dissolve verso l'alto, attraverso il soffitto, VIA.

Dal fondo della cantina, qualcosa di metallico si muove. Piatti. Coperti. **Una mannaia che si arrota.**

> La voce dello Chef: *(spessa, lenta, da sotto terra)* "Chi... tocca... la DISPENSA?"

**(-1 Sangue freddo. Ernesto è libero, ma lo Chef è sveglio. Flag: chef allertato.)**`,
    gold: -1,
    sets: { chef_allertato: true, ernesto_libero: true },
    choices: [{ text: 'Verso il fondo. Ormai.', next: 'k3' }],
  },

  k3: {
    location: 'cantina',
    caption: 'Il fondo della cantina — la cucina del Banchetto',
    text: `Oltre le rastrelliere, la cantina si apre in una **seconda cucina.** Non quella linda del piano di sopra: questa è del 1899 e non ha mai smesso di lavorare. Un forno a legna GRANDE COME UN'AUTO, acceso, con la fiamma che respira piano. Un tavolo da macellaio lungo quattro metri, segnato da centoventicinque anni di lame. Ganci vuoti al soffitto, **che oscillano** senza vento, come se qualcosa ci fosse appena stato appeso. O stesse per esserlo.

E al tavolo, di spalle, c'è **lo Chef.**

Due metri di grembiule ingiallito, un cappello da cuoco afflosciato, e il corpo... il corpo è sbagliato nelle proporzioni, come disegnato a memoria da qualcuno che i cuochi li ha solo sentiti descrivere. Sta affilando una mannaia con movimenti LENTI, amorevoli.

Senza voltarsi, parla. La voce è un forno che parla:

> Lo Chef: "Il menù del Banchetto è pronto da **venticinque anni.** Manca solo... la portata principale. Cinque coperti. Sempre cinque." *(la mannaia si ferma)* "Ma le regole sono regole: chi entra nella MIA cucina, o è un ingrediente... **o porta un ingrediente migliore.**"

Sul muro, accanto al forno, una mensola: un barattolo di **SALE GROSSO** con l'etichetta *"1899 — PER LORO"*, e una bottiglia diversa da tutte, dritta, con scritto a mano: *"Da aprire solo per il Padrone"*.`,
    choices: [
      { text: '💇 Natalino fa un passo avanti: "Un ingrediente migliore? Ce l\'ho. Una ciocca di capelli TAGLIATA AD ARTE. Roba che non vedi dal 1899."', tag: 'Prova di Carisma — CD 12', check: { stat: 'CAR', dc: 12, success: 'k4_scambio', fail: 'k4_chef_fight' } },
      { text: '⚔ Non si tratta con chi ha una mannaia: attaccare PRIMA', next: 'k4_chef_fight' },
      { text: '🤫 Distrarlo e arraffare sale e bottiglia dalla mensola', tag: 'Prova di Destrezza — CD 13', check: { stat: 'DES', dc: 13, success: 'k4_furto', fail: 'k4_furto_ko' } },
    ],
  },

  k4_scambio: {
    location: 'cantina',
    caption: 'La trattativa dello Chef',
    text: `Lo Chef si volta. Il davanti è peggio del dietro: al posto della faccia c'è una **retina da cuoco**, di quelle per i capelli, tesa sul nulla. Eppure, in qualche modo, vi guarda. E ascolta.

Natalino, con le mani che tremano SOLO fino al polso — dal polso in giù sono d'acciaio, trent'anni di mestiere — estrae le forbici, si fa porgere il capo da un volontario (Federico: "perché IO—", "perché hai più capelli, amore", risolve Emanuela) e taglia **una ciocca perfetta.** La piega. La presenta sul palmo come un gioiello.

> Natalino: "Taglio scalato, punte vive, MAI trattato. Nel 1899 questo lo chiamavate 'ricordo d'affetto'. Si usava nei medaglioni. VOI lo sapete cos'è un ricordo, in questa casa."

Un silenzio lungo come una lievitazione. Poi lo Chef prende la ciocca con due dita enormi, la annusa attraverso la retina, e fa una cosa oscena: **sospira di nostalgia.**

> Lo Chef: "...ricordo d'affetto. La signora Ada li faceva. Uno per ogni ospite. Li teneva nel medaglione, per non farli finire TUTTI nel vino." *(si scosta dalla mensola)* "Prendete il sale. Prendete la bottiglia del Padrone. E dite alla signora... che il suo forno lo tengo pulito."

**(Ottenuti: SALE GROSSO e la BOTTIGLIA DEL 1899. Lo Chef vi lascia passare. Sangue freddo +2. Nodo della cantina sciolto senza sangue!)**`,
    item: 'sale_grosso',
    item2: 'vino_1899',
    sets: { nodo_cantina: true, un_nodo_sciolto: true, chef_amico: true },
    gold: 2,
    choices: [{ text: 'Risalire. C\'è ancora tanta notte', next: 'h1' }],
  },

  k4_chef_fight: {
    location: 'cantina',
    caption: 'La cucina del Banchetto — SCONTRO',
    text: `Lo Chef si volta con tutta la lentezza di chi non ha mai avuto bisogno di correre.

> Lo Chef: "Ingredienti... **agitati.** Meglio: la carne si intenerisce."

Solleva la mannaia. Dal buio dietro il forno, due **camerieri in livrea** si raddrizzano dagli angoli dove stavano piegati come abiti su una sedia.

*(Consiglio da narratore: lo Chef è una creatura della villa — il Colpo di Phon di Emanuela e il sale fanno danni DOPPI. Se qualcuno è ferito, le cure PRIMA che dopo.)*`,
    combat: {
      enemies: ['cuoco', 'cameriere', 'cameriere'],
      victory: 'k5_dopo_chef',
      defeat: 'x_celle',
      loot: { gold: 2 },
    },
  },

  k4_furto: {
    location: 'cantina',
    caption: 'Il colpo della mensola',
    text: `Il piano nasce con gli sguardi, come al biliardino: Federico si schiarisce la voce e parte con la mossa che gli riesce meglio al mondo — **una domanda di quelle che non finiscono più.**

> Federico: "Chef, una curiosità da profano: il forno a legna, per un banchetto per sei, lo tiene a fiamma viva o preferisce un calore residuo? Perché ho letto — mi corregga — che la resa della castagna in Irpinia..."

Lo Chef si GIRA verso di lui, magnetizzato: nessuno gli chiede del suo lavoro da centoventicinque anni. E mentre la voce di Federico riempie la cucina come un gas inodore, la mano più rapida del gruppo scivola alla mensola: **il sale nel giubbotto, la bottiglia sotto braccio,** un passo indietro, zero rumore.

> Lo Chef: *(a Federico, quasi commosso)* "...la castagna vuole il calore RESIDUO. Lei capisce. Lei CAPISCE."

> Federico: "Mi lasci il suo... contatto. Facciamo una cosa insieme, un format. 'Cucine dall'Aldilà'. Ci pensi."

Uscite in fila indiana, con calma professionale. **(Ottenuti: SALE GROSSO e BOTTIGLIA DEL 1899. Nodo della cantina sciolto con destrezza. Sangue freddo +2.)**`,
    item: 'sale_grosso',
    item2: 'vino_1899',
    sets: { nodo_cantina: true, un_nodo_sciolto: true },
    gold: 2,
    choices: [{ text: 'Risalire, prima che ci ripensi', next: 'h1' }],
  },

  k4_furto_ko: {
    location: 'cantina',
    caption: 'Il colpo della mensola — mano di burro',
    text: `Il piano parte bene: Federico attacca il monologo sulla castagna irpina, lo Chef si volta ipnotizzato, la mano corre alla mensola—

—e il barattolo del sale, unto di un secolo di cucina, **scivola.**

Il rumore di vetro sul pavimento di pietra è l'esatto contrario del silenzio. Il sale si sparge a ventaglio e — questo nessuno se lo aspettava — dove tocca il pavimento, il pavimento **sfrigola**, come acqua su una piastra.

> Lo Chef: *(voltandosi per intero, la retina vuota puntata su di voi)* "Il MIO sale. Il sale della SIGNORA." *(afferra la mannaia)* "Sapete quanti banchetti ho dovuto insaporire SENZA, per non finirlo?!"

**(Il sale spanto per terra fa da barriera: comincerete lo scontro con VANTAGGIO al primo giro. Ma lo scontro comincia.)**`,
    sets: { sorpresa: true },
    combat: {
      enemies: ['cuoco', 'cameriere', 'cameriere'],
      victory: 'k5_dopo_chef',
      defeat: 'x_celle',
    },
  },

  k5_dopo_chef: {
    location: 'cantina',
    caption: 'La cucina, dopo',
    text: `Lo Chef crolla in ginocchio con un suono di pentole vuote, e resta lì, piegato, il cappello afflosciato sulla retina. Non è morto — le cose della villa non muoiono così — ma è **spento**, come un forno a fine servizio.

E da spento, con un filo di voce di fumo, dice la cosa più terribile della serata:

> Lo Chef: "...grazie. Sono... STANCO. Centoventicinque anni di menù uguale. Nessuno che assaggia. Nessuno che dice 'buono'. Cucinare per un patto... non è cucinare."

Sulla mensola, il barattolo di **SALE GROSSO** e la **BOTTIGLIA DEL 1899** sono vostri. Sul tavolo da macellaio, sotto la mannaia abbandonata, trovate anche un **quaderno di ricette** — e tra le ricette, scritta a matita da una mano femminile del 1899, una pagina diversa: *"Erbe contro il freddo di questa casa: bollire finché l'acqua non torna a sapere di orto. — A."*

**(Ottenuti: sale grosso, bottiglia del 1899, e la RICETTA DELL'ANTIDOTO di Ada. Nodo della cantina sciolto. Sangue freddo +1.)**`,
    item: 'sale_grosso',
    item2: 'vino_1899',
    sets: { nodo_cantina: true, un_nodo_sciolto: true, ricetta_antidoto: true },
    gold: 1,
    choices: [{ text: 'Risalire. La notte non è finita', next: 'h1' }],
  },

  /* ==================== PISTA 2 — IL PIANO PROIBITO ==================== */

  u1: {
    location: 'pianoProibito',
    caption: 'Il piano proibito — il corridoio dei venticinquenni',
    text: `La scala di servizio sale stretta, e a ogni gradino l'aria diventa più **ferma** — non fredda: ferma, come dentro una fotografia.

Il secondo piano non compare nelle foto del sito, e ora sapete perché. È un corridoio identico al vostro, ma **sbagliato nei dettagli**: la carta da parati cambia disegno ogni tre metri, i tappeti cambiano epoca, e le porte...

Le porte hanno **targhette con gli anni.**

*1899. 1924. 1949. 1974. 1999.* E in fondo, una sesta porta, nuova, con la vernice fresca e la targhetta ancora vuota — dalla fessura sotto filtra una luce calda, accogliente, **da camera pronta.**

> Emanuela: "È il piano dove la casa tiene i suoi ricordi, ha detto Gregorio."

> Claudia: "No. Guardate le targhette. È il piano dove la casa tiene **i suoi ospiti.** Una stanza per gruppo."

Da dietro la porta del 1924, attutito, arriva un suono: **un grammofono.** Un valzer, consumato, che salta sempre sullo stesso giro.

*(Potete aprire una porta o dirigervi in fondo. La casa vi lascia scegliere: le trappole migliori funzionano così.)*`,
    choices: [
      { text: '🚪 1999 — l\'anno di Sofia, il gruppo più vicino a voi', next: 'u2_1999' },
      { text: '🚪 1924 — la stanza del valzer', next: 'u2_1924' },
      { text: '🚪 1899 — la stanza dov\'è cominciato tutto', next: 'u2_1899' },
    ],
  },

  u2_1999: {
    location: 'camera',
    caption: 'Stanza 1999 — "Sofia era qui"',
    text: `La porta si apre su un'estate di venticinque anni fa, conservata come sotto vetro: poster alle pareti, una radio a cassette, cinque zaini ammucchiati in un angolo, **cinque asciugamani stesi ad asciugare da un quarto di secolo** — ancora umidi.

Sul letto, aperta, una rivista di gossip del luglio 1999. Sul comodino, una macchina fotografica **Polaroid** con una foto ancora nella fessura, sviluppata a metà.

La prendete. L'immagine mostra la piscina, di notte, e cinque ragazzi che ridono nell'acqua. È una bella foto. Sarebbe una bella foto, se non fosse per due dettagli:

**Uno:** intorno alla testa di una ragazza — mora, occhiali da sole sui capelli — qualcuno ha tracciato **un cerchio rosso**, a pennarello, con una calligrafia che ormai riconoscete.

**Due:** nella foto, fuori dall'acqua, ci sono **sei asciugamani.**

> Natalino: *(voce piatta)* "Il cerchio è come al mercato. Quando scegli il pesce."

Nell'armadio, appesa e inspiegabile, c'è anche una **muta da sub, taglia bambino**, con un cartellino: *"Per il pozzo. Mai usata. Meglio così."*

**(Oggetto: la POLAROID del 1999. Flag: il cerchio rosso. Sangue freddo +1.)**`,
    item: 'polaroid',
    sets: { cerchio_rosso: true },
    gold: 1,
    choices: [
      { text: '🚪 Ancora una stanza: la 1924 del valzer', next: 'u2_1924' },
      { text: '🚪 Ancora una stanza: la 1899 di Ada', next: 'u2_1899' },
      { text: '🚨 Basta stanze: la porta in fondo, quella con la targhetta vuota', next: 'u4_porta_vuota' },
    ],
  },

  u2_1924: {
    location: 'camera',
    caption: 'Stanza 1924 — il valzer che salta',
    text: `Charleston, cipria e un grammofono a tromba che suona da cento anni lo stesso giro di valzer, con la puntina che salta sempre sullo stesso punto — *"per sempre... per sempre... per sempre..."*

La stanza è piena di **bambole di porcellana.** Sedute sul letto, allineate sul comò, appollaiate sull'armadio. Trentadue — Claudia le conta d'istinto. Tutte con lo stesso sorriso dipinto e gli occhi di vetro che, in qualunque punto della stanza vi mettiate, **vi guardano con la coda dell'occhio.**

Al centro, su una sedia a dondolo, la bambola più grande tiene in grembo un **medaglione d'argento** a forma di cuore. Dentro — si vede dalla fessura — ciocche di capelli intrecciate, di colori diversi.

> Emanuela: "Il medaglione di Ada. 'Uno per ogni ospite, per non farli finire tutti nel vino' — l'ha detto lo Chef, l'ha scritto Sofia, scegliete voi. LO VOGLIO."

Il problema è che per prenderlo bisogna attraversare la stanza. E il valzer, da quando siete entrati, ha **smesso di saltare.** Sta suonando. Fluido. Come se la stanza si fosse svegliata e avesse voglia di ballare.`,
    choices: [
      { text: '🩰 Attraversare la stanza A TEMPO DI VALZER: la casa ama chi sta al gioco', tag: 'Prova di Destrezza — CD 12', check: { stat: 'DES', dc: 12, success: 'u3_medaglione', fail: 'u3_bambole_fight' } },
      { text: '💨 Corsa e presa al volo: dentro e fuori in tre secondi', tag: 'Prova di Forza — CD 13', check: { stat: 'FOR', dc: 13, success: 'u3_medaglione', fail: 'u3_bambole_fight' } },
    ],
  },

  u3_medaglione: {
    location: 'camera',
    caption: 'Il medaglione di Ada',
    text: `Funziona — e nessuno di voi dimenticherà COME funziona.

Chi attraversa la stanza lo fa assecondando il valzer: tre passi, una girata, un inchino alla bambola sulla sedia a dondolo — e trentadue teste di porcellana **si inclinano insieme**, in un applauso senza mani, RAPITE. La casa è vecchia e sola: chi le fa una cortesia, per un attimo, è di famiglia.

Il medaglione si lascia prendere dal grembo della bambola come un frutto maturo. Dentro, sei ciocche intrecciate — cinque more e castane, una **bianca.**

> Claudia: "Sei ciocche. Il gruppo del 1899 era di sei. Gregorio, Ada... e gli altri quattro."

Mentre uscite, il grammofono ricomincia educatamente a saltare — *"per sempre... per sempre..."* — e la bambola grande, sulla sedia a dondolo, adesso ha le mani **giunte in grembo**, composte, come chi ha finalmente consegnato una cosa che custodiva da troppo.

**(Oggetto: MEDAGLIONE DI ADA — al pozzo varrà una vita. Sangue freddo +2.)**`,
    sets: { medaglione: true },
    gold: 2,
    choices: [
      { text: '🚪 La stanza 1899 — quella di Ada', next: 'u2_1899' },
      { text: '🚨 La porta con la targhetta vuota, in fondo', next: 'u4_porta_vuota' },
    ],
  },

  u3_bambole_fight: {
    location: 'camera',
    caption: 'Stanza 1924 — le padrone di casa',
    text: `Il piano era buono. L'esecuzione, meno: un piede fuori tempo sul valzer — UN piede — e il grammofono si ferma con un graffio di puntina che attraversa la stanza come un'unghiata.

Silenzio.

Trentadue teste di porcellana **ruotano insieme**, con un solo *crick* coordinato, e vi guardano per la prima volta con tutti e due gli occhi.

> La bambola grande: *(senza muovere il sorriso dipinto)* "Fuori... tempo."

Si alzano. Non tutte — le bastano tre, le più grandi, quelle coi denti veri — mentre le altre ventinove restano sedute a **guardare**, che è peggio.

*(Sono creature della villa: phon e sale fanno danni doppi. Sono piccole e velocissime: attente ai più deboli del gruppo!)*`,
    combat: {
      enemies: ['bambola', 'bambola', 'bambola'],
      victory: 'u3_bambole_vinte',
      defeat: 'x_celle',
    },
  },

  u3_bambole_vinte: {
    location: 'camera',
    caption: 'Stanza 1924 — dopo la danza',
    text: `L'ultima bambola si affloscia con un tintinnio di porcellana, e le ventinove sedute — tutte insieme — **chiudono gli occhi.** Applauso finito. Spettacolo chiuso.

Il medaglione d'argento è vostro: dentro, sei ciocche intrecciate — cinque more e castane, una bianca. La bambola grande, ora a occhi chiusi sulla sua sedia a dondolo, sembra soltanto un giocattolo antico. Soltanto.

Sulla porta, uscendo, Emanuela si ferma e — nessuno saprà mai perché, e tutti la ameranno per questo — torna indietro e **rimette dritta la bambola caduta.**

Il grammofono riparte da solo. Il valzer. Che salta.

*"per sempre... per sempre..."*

**(Oggetto: MEDAGLIONE DI ADA. Sangue freddo +1.)**`,
    sets: { medaglione: true },
    gold: 1,
    choices: [
      { text: '🚪 La stanza 1899 — quella di Ada', next: 'u2_1899' },
      { text: '🚨 La porta con la targhetta vuota, in fondo', next: 'u4_porta_vuota' },
    ],
  },

  u2_1899: {
    location: 'camera',
    caption: 'Stanza 1899 — la camera di Ada',
    text: `Quest'ultima porta non è chiusa a chiave. Non ne ha bisogno: si apre su una camera così **triste** che il primo istinto è chiedere scusa ed uscire.

Una camera da sposi del 1899: il letto rifatto con gli angoli perfetti, un vestito da viaggio mai più indossato appeso all'attaccapanni, una valigia mai più aperta ai piedi del letto. Sul comò, una spazzola con ancora impigliati due capelli castani, e uno specchio COPERTO con un lenzuolo — al modo antico delle case in lutto.

E sulla scrivania, sotto la finestra da cui si vede il pozzo, **un diario aperto.**

L'ultima pagina scritta è del 21 agosto 1899:

*"G. dice che c'è un modo per uscirne, che ha parlato con la cosa nel pozzo, che serve solo una firma. Gli credo. Gli ho sempre creduto: è il suo talento. Se leggete queste righe, chiunque siate: i nodi della casa si sciolgono con TRE cose — il sale che è rimasto fedele, l'acqua che ricorda, e il nome dato per amore e non per fame. Le ultime tre pagine le ho strappate io. Le ho date al pozzo, perché certe istruzioni deve poterle dare solo chi le ha pagate. — Ada"*

**(Oggetto: DIARIO DI ADA. Il rituale ha una forma: sale + acqua + un nome. Nodo del piano sciolto. Sangue freddo +2.)**`,
    item: 'diario_ada',
    sets: { nodo_piano: true, un_nodo_sciolto: true, rituale_noto: true },
    gold: 2,
    choices: [
      { text: '🪞 Prima di uscire: scoprire lo specchio velato. Sapere è coraggio... no?', next: 'u5_specchio' },
      { text: '🚨 Rispettare il lutto e andare: la porta con la targhetta vuota aspetta', next: 'u4_porta_vuota' },
    ],
  },

  u5_specchio: {
    location: 'camera',
    caption: 'Lo specchio velato',
    text: `Il lenzuolo scivola via con un sospiro di polvere.

Lo specchio è bellissimo, cornice d'argento, vetro appena brunito — e **non riflette la stanza.** Riflette la sala da pranzo del piano di sotto, apparecchiata a festa: la tavola del Banchetto, i candelabri accesi, sei sedie.

Cinque sedie sono occupate da **voi.** Seduti composti, vestiti eleganti, gli occhi chiusi. Al centro della tavola, invece del cibo, ci sono cinque bottiglie NUOVE, ancora senza etichetta.

La sesta sedia, a capotavola, è vuota. E mentre guardate, il voi-riflesso più vicino allo specchio — è diverso per ognuno che guarda — **apre gli occhi e scuote la testa. Piano. Due volte.** Come a dire: *non così. Non finisce così, se non volete.*

Poi il riflesso torna sala vuota, e lo specchio torna specchio, e cinque facce pallidissime ci si guardano dentro.

> Federico: *(rimettendo il lenzuolo con cura maniacale)* "Ok. Rivotiamo sul concetto di 'sapere è coraggio'."

**(Avete visto il Banchetto com'è apparecchiato PER voi. -1 Sangue freddo, ma flag prezioso: l'avvertimento dello specchio.)**`,
    gold: -1,
    sets: { avvertimento_specchio: true },
    choices: [{ text: 'Alla porta con la targhetta vuota', next: 'u4_porta_vuota' }],
  },

  u4_porta_vuota: {
    location: 'pianoProibito',
    caption: 'La sesta porta — targhetta vuota',
    text: `Eccola. Vernice fresca, maniglia lucida, e quella luce calda da sotto la fessura, **da camera pronta per l'ospite.**

La targhetta d'ottone è vuota, ma da vicino si vede che è solo l'ULTIMO strato: sotto la superficie, in controluce, si intuiscono numeri incisi e limati via. *2024* — inciso e limato. *2024* — inciso e limato. Come se qualcuno continuasse a scriverlo e qualcun altro continuasse a cancellarlo.

> Gaetano: "Gregorio lo incide. E Gregorio lo lima. Da quando abbiamo prenotato, probabilmente. È... sta facendo resistenza. A modo suo. Da centoventicinque anni."

La porta non è chiusa. Dentro c'è una camera **identica in tutto alle vostre** — stessi lini, stessi fiori, stessi cioccolatini sui cuscini — tranne che per un dettaglio: i letti sono **cinque**, in fila, come in ospedale. E sopra ogni letto, al muro, una cornice vuota con una piccola luce da quadro già accesa.

Cinque cornici. Illuminate. In attesa.

> Natalino: *(chiudendo la porta con delicatezza estrema, come per non svegliarla)* "Nessuno. Dorme. Mai più. Ok? Nemmeno DOPO, a casa. Io un mese dormo in piedi come i cavalli."

**(Il piano proibito non ha più segreti. Meglio tornare al corridoio e scegliere la prossima mossa.)**`,
    choices: [{ text: 'Giù, al corridoio delle tre porte', next: 'h1' }],
  },

  /* ==================== PISTA 3 — IL POZZO ==================== */

  b1: {
    location: 'giardino',
    caption: 'Il giardino di notte — il regno del Giardiniere',
    text: `La portafinestra si apre sull'aria gelida della montagna, e il giardino di notte è un altro pianeta: la nebbia salita dalla valle si è fermata — DAVVERO — al confine esatto della proprietà, e ci gira intorno come un mare attorno a un'isola. Dentro il confine, tutto è nitido, azzurrino, **in ordine.**

Troppo in ordine. La ghiaia rastrellata a onde. Le siepi potate a forme che continuano a non voler essere guardate due volte. E in mezzo al prato, dove nel pomeriggio non c'era, uno **spaventapasseri**: giacca da lavoro, cappello di paglia, guanti da potatura. Con delle **cesoie vere** cucite alle maniche.

È rivolto verso il pozzo. Come un cartello stradale. O una sentinella.

> Claudia: *(sottovoce)* "Regola dei film: finché lo guardiamo, non si muove."

> Gaetano: "Claudia. Siamo in CINQUE. Possiamo guardarlo a turni. È l'unico problema della serata che si risolve con la matematica."

Il pozzo è a quaranta metri, oltre lo spaventapasseri, oltre l'orto recintato delle erbe. La corda, anche da qui, si vede: **tesa.** Qualcosa, giù, aspetta compagnia.`,
    choices: [
      { text: '👁 Il piano di Gaetano: attraversare il prato A TURNI DI SGUARDO, senza mai perderlo di vista', tag: 'Prova di Saggezza — CD 12', check: { stat: 'SAG', dc: 12, success: 'b2_orto', fail: 'b2_giardiniere_fight' } },
      { text: '🏃 Il piano di Natalino: di corsa lungo le siepi, fuori dalla sua vista', tag: 'Prova di Destrezza — CD 12', check: { stat: 'DES', dc: 12, success: 'b2_orto', fail: 'b2_giardiniere_fight' } },
    ],
  },

  b2_giardiniere_fight: {
    location: 'giardino',
    caption: 'Il Giardiniere — turno di notte',
    text: `Il piano regge per trenta metri. Poi la nebbia — che non entra MAI nella proprietà — trova il modo di vendicarsi: un banco sottile scavalca la siepe per un secondo, un secondo solo, e copre lo spaventapasseri come un sipario.

Quando il sipario si alza, lo spaventapasseri **non c'è più.**

*Clip.*

È dietro di voi. Nessuno l'ha sentito. Le cose impagliate non pesano. Il cappello di paglia si solleva di un grado, quel tanto che basta a mostrarvi che sotto non c'è una faccia: c'è **paglia e buio**, e il buio vi sta valutando come si valuta una siepe cresciuta male.

> Il Giardiniere: *(voce di foglie secche)* "Fuori... orario. Il giardino... si pota... di notte. E stanotte... siete NEL giardino."

Le cesoie si aprono con lo scatto oliato di centoventicinque anni di manutenzione amorevole.

*(È una creatura della villa: phon e sale doppi. Colpisce come una falciatrice: proteggetevi a vicenda!)*`,
    combat: {
      enemies: ['spaventapasseri', 'lupo_nebbia'],
      victory: 'b2_orto',
      defeat: 'x_celle',
      loot: { gold: 1 },
    },
  },

  b2_orto: {
    location: 'giardino',
    caption: 'L\'orto delle erbe — il regno di Ada',
    text: `L'orto è l'unico angolo del Belvedere che non fa paura — e questo, ormai l'avete capito, al Belvedere è un'informazione: qualcuno lo **protegge.**

File ordinate di erbe aromatiche, un recinto basso di castagno, e i cartellini dei semi scritti in una grafia femminile e fitta che riconoscete dal registro: la grafia che nel 1999 aggiunse *"rimasto"*. La grafia di **Ada.**

Rosmarino. Salvia. Assenzio. E in fondo, in un'aiuola tenuta come un altare, un'erba che non conoscete: foglie argentate che **si scostano da sole** quando avvicinate la mano, timide come mimose.

Il cartellino dice: *"CONTRO IL FREDDO DI QUESTA CASA. Bollire finché l'acqua non torna a sapere di orto. Per gli ospiti che tremano. — A."*

> Emanuela: "È la ricetta del quaderno dello Chef. Questa è la pianta." *(raccoglie con tre dita, da professionista delle mani)* "Chi ha preso il freddo di questa casa, stanotte torna caldo."

**(Ottenuto: ANTIDOTO DI ERBE — chiunque sia AVVELENATO dal gelo del Belvedere può essere curato. Sangue freddo +1.)**`,
    item: 'antidoto',
    gold: 1,
    choices: [{ text: 'Al pozzo. È il momento.', next: 'b3_pozzo' }],
  },

  b3_pozzo: {
    location: 'pozzo',
    caption: 'Il pozzo vecchio — ore 3:00',
    text: `Il pozzo vecchio, da vicino, è più antico della villa: la pietra è di un'altra epoca, coperta di incisioni consumate — non decorazioni: **conti.** File e file di tacche, a gruppi di cinque, come su un muro di prigione. Qualcuno, qui, ha contato qualcosa per molto, molto tempo.

La corda è tesa. Il secchio è giù. E dal fondo — non eco, non acqua: dal fondo — sale una voce.

La riconoscete tutti e cinque nello stesso istante, e tutti e cinque per un motivo diverso: perché è **la voce di vostra madre.** Di tutte e cinque le vostre madri, insieme, in una sola.

> La voce dal pozzo: *"...siete venuti. Ho piegato gli asciugamani per voi. Ho tirato su l'acqua per voi. CENTOVENTICINQUE ANNI che apparecchio l'acqua e nessuno che si cala a farmi compagnia. Gregorio non viene mai. Gregorio ha PAURA. Voi non avete paura, vero? Voi siete ospiti EDUCATI."*

La corda si muove. Piano. Su, e giù. Come un invito col dito.

> Federico: *(bianco)* "È Ada."

> La voce: *"Ada era il nome di sopra. Qui sotto i nomi si sciolgono come lo zucchero. Ne rimane il DOLCE. Volete sentire?"*`,
    choices: [
      { text: '💍 Mostrarle il MEDAGLIONE con le sei ciocche: ridarle il suo nome', requires: { flag: 'medaglione' }, next: 'b4_medaglione' },
      { text: '🍷 Calare nel secchio la BOTTIGLIA DEL 1899 e il messaggio di Gregorio', requires: { item: 'vino_1899' }, removeItem: 'vino_1899', next: 'b4_vino' },
      { text: '🗣 Parlarle di Gregorio: la storia che vi ha raccontato, la ciocca bianca, i 125 anni', requires: { flag: 'storia_ada' }, tag: 'Prova di Carisma — CD 12', check: { stat: 'CAR', dc: 12, success: 'b4_parole', fail: 'b4_ira' } },
      { text: '🪢 Qualcuno si cala nel pozzo. Qualcuno DEVE calarsi nel pozzo.', tag: 'Prova di Forza — CD 13', check: { stat: 'FOR', dc: 13, success: 'b4_calata', fail: 'b4_calata_ko' } },
    ],
  },

  b4_medaglione: {
    location: 'pozzo',
    caption: 'Il medaglione torna a casa',
    text: `Il medaglione d'argento scende nel pozzo dentro il secchio, con la delicatezza con cui si cala un neonato.

Silenzio. Lungo. Poi un suono che il pozzo non faceva da centoventicinque anni: **un respiro.**

> La voce: *"...il mio medaglione. Le mie ciocche. Margherita. Ernesto. Le ho fatte io, una per uno, la settimana buona, quando ridevamo ancora..."* *(la voce cambia: le cinque madri se ne vanno, ne resta UNA, giovane, del sud, del 1899)* *"...e la bianca è mia. Me la tagliai la notte della firma. Ada. Mi chiamo ADA. Il pozzo se l'era mangiato, il nome. VOI me l'avete riportato."*

L'acqua, giù, si illumina di un bianco tenue: non luce elettrica, non luna — **luce di nome ritrovato.**

> Ada: *"Ascoltate, ospiti gentili: il patto è una FIRMA nel registro, e le firme si sciolgono con tre cose — il sale fedele, la mia acqua, e un nome dato per amore. Prendete l'acqua: il secchio stanotte tira su per DAVVERO. E all'alba, al Banchetto, quando la casa chiederà il suo nome... ricordatele che i nomi si possono anche RESTITUIRE."*

Il secchio risale da solo, pieno di un'acqua che riflette il cielo giusto. **(Ottenuti: ACQUA DEL POZZO + l'alleanza di ADA. Nodo del pozzo sciolto nel modo migliore. Sangue freddo +3.)**`,
    item: 'acqua_pozzo',
    sets: { nodo_pozzo: true, un_nodo_sciolto: true, ada_alleata: true },
    gold: 3,
    choices: [{ text: 'Dentro. Verso l\'alba. Verso il Banchetto.', next: 'h1' }],
  },

  b4_vino: {
    location: 'pozzo',
    caption: 'Il vino mai aperto',
    text: `La bottiglia del 1899 scende nel secchio, e con lei il messaggio, ripetuto ad alta voce con la voce più ferma che il gruppo riesce a produrre alle tre di notte davanti a un pozzo che parla:

**"Gregorio dice che il vino del 1899 non l'ha mai aperto."**

Il silenzio che segue dura così tanto che Natalino fa per parlare due volte e viene zittito due volte. Poi, dal fondo:

> La voce: *"...centoventicinque vendemmie. Ne ha aperte centoventiquattro, per il Banchetto. Mai la nostra. Mai la MIA."* *(un suono che è metà singhiozzo e metà risata, e nessuna delle due metà è umana)* *"Quel cretino romantico. Quel VIGLIACCO romantico. Firma più veloce di me e poi mi tiene il vino da parte per centoventicinque anni."*

L'acqua giù si smuove, e la voce quando torna è più giovane. Più Ada.

> Ada: *"Ditegli che lo perdono a metà. La metà che serve. E prendete l'acqua: il rituale la vuole, e io voglio vedere questa casa PERDERE."*

**(Ottenuti: ACQUA DEL POZZO + il perdono a metà di Ada. Nodo del pozzo sciolto. Sangue freddo +2.)**`,
    item: 'acqua_pozzo',
    sets: { nodo_pozzo: true, un_nodo_sciolto: true, ada_perdono: true },
    gold: 2,
    choices: [{ text: 'Dentro. Verso l\'alba.', next: 'h1' }],
  },

  b4_parole: {
    location: 'pozzo',
    caption: 'Le parole giuste',
    text: `Parlare a un pozzo è il colloquio più difficile della vostra vita, e lo affrontate con l'unica tecnica che il gruppo padroneggia davvero: **la sincerità disordinata.**

Le raccontate di Gregorio in vestaglia col candeliere. Dei capelli che diventano bianchi una ciocca alla volta, una per ogni verità. Del *"ditele che il vino del 1899 non l'ho mai aperto"*. Del fatto che da centoventicinque anni stira lenzuola aspettando un gruppo abbastanza testardo da sciogliere i nodi che lui non ebbe il coraggio di sciogliere.

> La voce: *(dopo un silenzio di piombo)* "...vi ha detto che firmò più veloce. Non vi ha detto che io lo SPINSI. Che gli dissi 'firma tu, che hai la mano lesta'. Lo dissi per scherzo. Al Belvedere non si scherza: la casa prende ogni parola sul serio. È la sua unica regola. È la sua FAME."*

L'acqua giù si illumina appena.

> Ada: *"Prendete l'acqua. E all'alba, quando la casa chiederà un nome... sappiate che le parole dette per scherzo si possono RIMANGIARE. Ma solo davanti a tutti. Solo pagando il conto."*

**(Ottenuti: ACQUA DEL POZZO + la vera storia della firma. Nodo del pozzo sciolto. Sangue freddo +2.)**`,
    item: 'acqua_pozzo',
    sets: { nodo_pozzo: true, un_nodo_sciolto: true, verita_firma: true },
    gold: 2,
    choices: [{ text: 'Dentro. Verso l\'alba.', next: 'h1' }],
  },

  b4_ira: {
    location: 'pozzo',
    caption: 'La parola sbagliata',
    text: `Le parole partono bene e inciampano nel punto peggiore: qualcuno — la stanchezza, le tre di notte, la paura — chiama la voce **"il fantasma del pozzo".**

Il freddo arriva PRIMA del suono. La corda si tende di colpo, il secchio precipita giù, e dal fondo sale un vento gelido che sa di acqua ferma e di torto subito:

> La voce: *"FANTASMA?! Io sono l'OSPITE PIÙ ANZIANA di questa casa! Io ho un NOME, da qualche parte, e voi—"* *(la voce si spezza, si ricompone, madri e non-madri insieme)* *"—voi parlate come LORO. Come quelli che ci hanno CONTATE, le notti."*

Il gelo del pozzo morde chi ha parlato: entra dalle dita, sale per i polsi, si piazza nel petto come un inquilino. **(Chi ha tirato è AVVELENATO dal freddo del Belvedere: gli servirà l'Antidoto di erbe. -1 Sangue freddo.)**

Poi la voce si calma, di colpo, esausta:

> La voce: *"...scusate. Centoventicinque anni. Provate VOI. L'acqua ve la do lo stesso: non è colpa vostra, la casa. Ma imparate i nomi, ospiti. I nomi sono TUTTO, quassù."*

**(Ottenuta: ACQUA DEL POZZO. Nodo del pozzo sciolto — a caro prezzo.)**`,
    poisonRoller: true,
    gold: -1,
    item: 'acqua_pozzo',
    sets: { nodo_pozzo: true, un_nodo_sciolto: true },
    choices: [{ text: 'Dentro. E qualcuno prepari quell\'antidoto.', next: 'h1' }],
  },

  b4_calata: {
    location: 'pozzo',
    caption: 'La calata — il fondo del pozzo',
    text: `Qualcuno DEVE calarsi, e la corda regge, e le braccia del gruppo reggono, e i primi cinque metri sono solo pietra fredda e cuore in gola.

Al sesto metro, il pozzo **si allarga.** Non dovrebbe: i pozzi si stringono. Questo si apre in una camera tonda, asciutta, con l'acqua ferma solo al centro, come uno specchio appoggiato per terra. E intorno allo specchio d'acqua, disposte con cura su mensole di pietra: **le tre pagine strappate del diario**, un pettine d'argento, uno scialle piegato. La casa di qualcuno che ha fatto del fondo di un pozzo la sua stanza, in centoventicinque anni di pazienza.

La voce, quaggiù, non è terribile. È solo una donna seduta al buio da troppo tempo:

> Ada: *"Un ospite che SCENDE. Nessuno scende mai. Nemmeno lui... soprattutto lui."* *(un fruscio: le pagine si sollevano, si porgono da sole)* *"Prendile. C'è scritto come si scioglie una firma. E prendi l'acqua: di' agli altri che la vecchia del pozzo... apparecchia ancora bene."*

Risalire con le pagine in tasca e l'acqua nel secchio è la cosa più vicina a un trionfo che questa notte concederà.

**(Ottenuti: ACQUA DEL POZZO + LE TRE PAGINE DEL DIARIO — il rituale completo. Nodo del pozzo sciolto con CORAGGIO VERO. Sangue freddo +3.)**`,
    item: 'acqua_pozzo',
    sets: { nodo_pozzo: true, un_nodo_sciolto: true, pagine_diario: true, rituale_noto: true },
    gold: 3,
    choices: [{ text: 'Dentro. Verso l\'alba.', next: 'h1' }],
  },

  b4_calata_ko: {
    location: 'pozzo',
    caption: 'La calata — la corda ha fame',
    text: `La calata parte bene. Il problema non è la corda: è **il pozzo.**

Al quarto metro, la pietra sotto le mani diventa liscia come vetro, la corda si fa scivolosa come se sudasse, e da sotto — vicinissimo — la voce dice, con dolcezza terribile:

> La voce: *"...resta."*

Non è un ordine. È un desiderio con centoventicinque anni di forza dietro. Le dita si aprono da sole, la corda SFUGGE—

—e le mani degli altri quattro, aggrappate all'altro capo, tirano su di peso, tutti insieme, con la disperazione coordinata delle famiglie vere. Chi era giù riemerge dal bordo bianco come un cencio, con **un braccio segnato da cinque dita fredde** che non sono di nessuno del gruppo.

**(Chi si è calato è stato quasi PRESO: la villa lo ha marchiato — AVVELENATO dal freddo finché non trova l'antidoto. -1 Sangue freddo.)**

> La voce: *(mortificata, dal fondo)* "...scusate. È più forte di me. CENTOVENTICINQUE anni, capite? Tenete l'acqua. E non calatevi MAI più: la prossima volta non mi controllo."

Il secchio risale da solo, pieno.

**(Ottenuta: ACQUA DEL POZZO. Nodo sciolto, braccio segnato.)**`,
    poisonRoller: true,
    gold: -1,
    item: 'acqua_pozzo',
    sets: { nodo_pozzo: true, un_nodo_sciolto: true },
    choices: [{ text: 'Dentro. Subito.', next: 'h1' }],
  },

  /* ==================== LE CELLE (sconfitta non letale) ==================== */

  x_celle: {
    location: 'cantina',
    caption: 'Le celle della cantina — "il Belvedere non spreca"',
    text: `Buio. Poi pietra fredda sotto la schiena, e l'odore dolciastro della cantina.

Vi risvegliate TUTTI — anche chi era stato preso o era rimasto indietro — in una cella di pietra dietro la cucina del Banchetto, dietro una grata di ferro battuto con sopra un cartello scritto a mano, in bella grafia: *"DISPENSA OSPITI — non aprire prima dell'alba"*.

Le ferite sono state **medicate.** Bende pulite, perfino una coperta a testa. Su un vassoio, passato sotto la grata: tisana calda per cinque e biscotti fatti in casa.

> Gregorio: *(seduto su una sedia FUORI dalla cella, il candeliere in mano, i capelli molto più bianchi di ieri)* "Vi prego di non ringraziarmi: peggiora le cose. La casa vi ha presi, e io... io posso solo rallentarla. Fingere di aver perso le chiavi. L'ho già fatto quattro volte, stanotte." *(si alza, e la serratura della grata scatta da sola, aperta, alle sue spalle)* "Che sbadato. Le ho perse di nuovo."

Sulla soglia, senza voltarsi:

> Gregorio: "L'alba è vicina, signori. Se avete ancora qualcosa da sciogliere... **correte.**"

**(Tutti i PV e le abilità sono ripristinati. Chi era PRESO è di nuovo con voi. Riproverete lo scontro: stavolta, tattica.)**`,
    fullHeal: true,
    freeAll: true,
    choices: [{ text: '↩ Tornare là fuori e riprovare', next: 'RETRY_COMBAT' }],
  },

  /* ==================== L'ALBA — IL BANCHETTO ==================== */

  z1: {
    location: 'salaBanchetto',
    caption: 'Il Banchetto del Venticinquennio — ore 5:57',
    text: `Non c'è bisogno di cercare la sala del Banchetto. Alle 5:57, il Belvedere **ve la porta**: aprite una porta qualsiasi — QUALSIASI — e dietro c'è sempre lei.

È la sala da pranzo, ma vestita per la festa che ha aspettato venticinque anni: candelabri a ogni metro, argenteria del 1899 tirata a specchio, e la tavola apparecchiata per **sei.** Cinque sedie da un lato. Una a capotavola.

I ritratti degli ospiti sono stati staccati dalle pareti della hall e appesi QUI, tutti, come parenti a un matrimonio. Il gruppo del 1924 in costume da bagno. Il 1949. Il 1974. Sofia e i ragazzi del 1999. Vi guardano dalle cornici con l'espressione di chi vorrebbe gridare qualcosa attraverso un vetro spesso.

A capotavola, in un frac del 1899 stirato alla perfezione, c'è **Gregorio.** I capelli completamente bianchi, adesso. Davanti a lui, il registro degli ospiti, aperto sulla vostra pagina. Accanto al registro, la penna stilografica.

> Gregorio: "Signori. Vi presenterei il padrone di casa... ma lo conoscete già. Lo conoscete da quando avete varcato il cancello. **È la casa.** Io apparecchio soltanto."

E la casa — le pareti, i lampadari, i ritratti, il pavimento a scacchi — **respira.** Una volta. Tutti la sentite. Il Belvedere ha fame, e l'alba è tra ventidue minuti.

> Gregorio: "Le regole del Banchetto sono tre. Uno: si esce all'alba, o non si esce. Due: il patto vuole **una firma o un nome.** Tre..." *(e qui, per la prima volta, la voce del maggiordomo perfetto trema)* "...tre: il menù può ancora cambiare. Se avete sciolto i nodi... **è il momento di metterli sul tavolo.**"`,
    choices: [
      { text: '🧂💧 IL RITUALE: sale sulla firma, acqua di Ada sul registro, e restituire il nome', requires: { flag: 'rituale_noto' }, next: 'z2_rituale' },
      { text: '⚔ Il gruppo si mette in mezzo: se la casa vuole un nome, dovrà VENIRSELO A PRENDERE', next: 'z3_boss' },
      { text: '🗣 Federico chiede la parola: la trattativa della vita', tag: 'Prova di Carisma — CD 13', check: { stat: 'CAR', dc: 13, success: 'z2_trattativa', fail: 'z3_boss_arrabbiato' } },
      { text: '🍷 Prima di tutto: versare il vino del 1899 nel bicchiere di Gregorio', requires: { item: 'vino_1899' }, removeItem: 'vino_1899', next: 'z2_vino' },
      { text: '🖋 La scelta di cui non parlerete mai più: UNO di voi prende la penna', next: 'z_custode' },
      { text: '🍽 Sedersi. Tutti e cinque. C\'è una pace terribile, nello smettere di lottare...', next: 'z_resa' },
    ],
  },

  z_resa: {
    location: 'salaBanchetto',
    caption: 'Le sedie sono comode',
    text: `Le sedie sono comode. È la prima cosa che pensate sedendovi, ed è un pensiero SBAGLIATO in un modo così profondo che una parte di voi si mette a urlare da dietro un vetro spesso.

Il Belvedere, intorno, fa le fusa. I candelabri si riaccendono a una temperatura più morbida. I piatti — quando sono arrivati i piatti? — fumano di cose buonissime. Le gambe smettono di tremare. La stanchezza di una notte intera vi scende addosso come una coperta rimboccata da mani gentili, e la casa sussurra, con la voce di tutte le madri:

*"Ecco. Bravi. Era così semplice."*

> Gregorio: *(da qualche parte, lontanissimo, l'ultima voce vera della notte)* "NO. Ragazzi, no — ALZATEVI. Vi prego. Ho visto questa scena cinque volte. Chi si siede al Banchetto... non si alza per andarsene."

I ritratti alle pareti hanno smesso di sbattere nelle cornici. Adesso vi guardano e basta. C'è una cornice — grande, centrale, la migliore della sala — che è ancora vuota.

È larga esattamente quanto **cinque persone in costume da bagno.**

*(Ultima possibilità. Davvero l'ultima.)*`,
    choices: [
      { text: '🪑 Restare seduti. La cena è servita. Il Belvedere ha vinto.', next: 'e_ospiti' },
      { text: '🔥 ALZARSI. Rovesciare la sedia, rovesciare il tavolo, TORNARE A COMBATTERE', next: 'z1', gold: 2 },
    ],
  },

  z_custode: {
    location: 'salaBanchetto',
    caption: 'La penna sul registro',
    text: `C'è una terza via, e la conoscete da quando Gregorio ve l'ha raccontata in vestaglia, col candeliere in mano: **il patto vuole una firma o un nome.** Un nome SOLO.

Uno resta. Quattro escono. È l'aritmetica del Belvedere dal 1899, ed è l'unica offerta che la casa accetta sempre, subito, senza combattere.

La penna stilografica è lì, sul registro. Nessuno la tocca ancora. Vi guardate — e in questo silenzio c'è tutto: le due coppie che si stringono le mani sotto il tavolo, e Natalino che fa il conto che tutti stanno facendo e che nessuno dirà mai ad alta voce.

> Gregorio: *(piano, con centoventicinque anni di autorità in materia)* "Prima di decidere, ascoltate l'unico che l'ha già fatto: la casa non vi vorrà MALE. Vi vorrà e basta. Avrete stanze calde, lavoro buono, e ospiti ogni tanto. Ma le persone che amate invecchieranno **in fotografia.** Verranno a trovarvi ogni agosto, e ogni agosto sarà più difficile, per loro e per voi. Io lo rifarei? ...non rispondo. È questo, il punto: dopo centoventicinque anni ANCORA non so rispondere."

La penna aspetta. La casa aspetta. L'alba, fuori, non aspetta.`,
    choices: [
      { text: '🖋 Qualcuno firma. Guardatevi negli occhi: la storia non sceglierà per voi.', next: 'e_custode' },
      { text: '↩ No. NESSUNO resta. Si torna a giocarsela tutti insieme.', next: 'z1' },
    ],
  },

  z2_vino: {
    location: 'salaBanchetto',
    caption: 'Il brindisi di centoventicinque anni',
    text: `La bottiglia del 1899 — *"da aprire solo per il Padrone"* — viene stappata con le mani che tremano, e il vino scende nel bicchiere di Gregorio, denso e scuro come la notte che sta finendo.

Gregorio lo guarda come si guarda una lettera che non si ha il coraggio di aprire.

> Gregorio: "Questo è... noi lo comprammo per il ritorno. Per il brindisi del ritorno a valle. Sei bicchieri. Non l'ho mai—"

> Voi: "Lo sappiamo. Ce l'ha detto **Ada.** Dice che la perdona a metà. La metà che serve."

Il bicchiere si ferma a mezz'aria. E Gregorio — Lord Gregorio, il maggiordomo del patto, l'uomo che non mangia e non beve dal 1899 — **beve.**

Il vino scende. E con il vino, il tempo: le mani si segnano, le spalle si curvano, il frac si allarga su un corpo che finalmente si RICORDA di avere centosettant'anni. Ma gli occhi — gli occhi ringiovaniscono.

> Gregorio: *(posando il bicchiere, con una voce nuova, umana, del sud)* "Ecco. Ora il Padrone non ha più un maggiordomo intero da consumare. Ora sono solo un ospite ANCH'IO — l'ultimo del 1899. E gli ospiti, signori miei..." *(si alza, e strappa il frac come si strappa un contratto)* "...gli ospiti possono DISDIRE."

**(Gregorio è dalla vostra parte, apertamente. La casa lo sa. La casa è FURIOSA. Sangue freddo +2. Da qui, ogni strada è più luminosa.)**`,
    sets: { gregorio_umano: true },
    gold: 2,
    choices: [
      { text: '🧂💧 ORA il rituale: sale, acqua, e il nome da restituire', requires: { flag: 'rituale_noto' }, next: 'z2_rituale' },
      { text: '⚔ La casa manderà qualcuno a riscuotere: pronti a combattere', next: 'z3_boss' },
    ],
  },

  z2_trattativa: {
    location: 'salaBanchetto',
    caption: 'La trattativa della vita',
    text: `Federico si alza, si abbottona la giacca — la giacca del pigiama, ma il gesto conta — e guarda la sala come si guarda un consiglio d'amministrazione ostile.

> Federico: "Gentile... Belvedere. Ho analizzato il suo modello di business, e mi permetto: è INSOSTENIBILE. Cinque ospiti ogni venticinque anni? Con questi costi fissi? Casa mia, lei è in perdita da un secolo. Ma ho una proposta."

La casa respira. I ritratti si sporgono. GREGORIO si siede, incantato: nessuno ha mai fatto una PRESENTAZIONE al patto.

> Federico: "Lei non ha fame di ospiti. Ha fame di **presenze.** Di voci, di passi, di gente che riempia le stanze. E allora: il relais RIAPRE. Sul serio. Matrimoni, famiglie, gruppi — VIVI, che tornano, che lasciano recensioni. Presenze a rotazione invece che ospiti in bottiglia. Lei mangia tutto l'anno, noi usciamo di qui, e il primo evento glielo organizzo IO. Gratis. Serve solo che il contratto attuale... si chiuda."

Silenzio. Poi la casa — le travi, i muri, i lampadari — emette un suono che nessuna casa dovrebbe fare: **un mormorio interessato.**

**(La casa VACILLA: il finale è a un passo. Ma un patto non si chiude con le parole: serve il gesto — il rituale, o il combattimento, o un nome. Sangue freddo +2.)**`,
    sets: { casa_vacilla: true },
    gold: 2,
    choices: [
      { text: '🧂💧 Chiudere il contratto col rituale: sale, acqua, nome', requires: { flag: 'rituale_noto' }, next: 'z2_rituale' },
      { text: '⚔ La casa chiede comunque l\'ultima parola: che venga a prendersela', next: 'z3_boss' },
    ],
  },

  z2_rituale: {
    location: 'salaBanchetto',
    caption: 'Il rituale di Ada — sale, acqua, nome',
    text: `Le istruzioni di Ada, a metterle in fila, sono tre gesti semplici. Come tutte le cose enormi.

**Il sale che è rimasto fedele:** il barattolo del 1899 si apre, e il sale grosso scende sulla pagina del registro, sulla vostra firma, disegnando da solo un cerchio perfetto. Dove tocca l'inchiostro nero, l'inchiostro **sfrigola.**

**L'acqua che ricorda:** l'acqua del pozzo — l'acqua di Ada — bagna il sale, e il registro geme come una trave sotto il peso della neve. La firma si SCIOGLIE: l'inchiostro nero si stacca dalla carta e resta a galleggiare nell'acqua, contorcendosi, cercando un'altra pagina, un'altra mano, un altro nome—

**E il nome dato per amore:**

> La voce di ADA: *(dal pavimento, dalle tubature, dal pozzo che è sotto tutta la casa da sempre)* "**PRENDI IL MIO.**"

*(La casa URLA. I candelabri si spengono TUTTI. E nel buio, il Belvedere gioca l'ultima carta: se non può avere una firma... verrà a prendersi il banchetto con le mani.)*`,
    sets: { rituale_fatto: true },
    choices: [{ text: 'Nel buio, qualcosa di ENORME si alza da capotavola', next: 'z3_boss_indebolito' }],
  },

  z3_boss: {
    location: 'salaBanchetto',
    caption: 'LA FAME — il Padrone di Casa',
    text: `La casa smette di fingere.

I candelabri si spengono in sequenza, dal fondo verso di voi, come passi. I ritratti sbattono contro le pareti nelle cornici — non per minaccia: per AVVERTIRVI, capirete dopo. E a capotavola, la sedia vuota... non è più vuota.

C'è seduta una cosa che ha la forma di un padrone di casa: alta, elegante, con qualcosa che somiglia a un completo di lino se il lino fosse buio compresso. Non ha volto. Ha **un tovagliolo**, che si annoda al collo con gesti curati.

> La Fame: *(con la voce di Gregorio, rubata, come tutto il resto)* "Gli ospiti... al loro posto. Il Banchetto... è servito."

> Gregorio: *(da qualche parte, debole)* "...vi chiedo scusa. Fa sempre così: usa la voce del maggiordomo. Le voci sono la prima cosa che prende. COLPITELA NEL PIATTO: odia il sale, odia il phon della signora, odia tutto ciò che è CALDO E VIVO—"

**(BATTAGLIA FINALE — fase uno. È LA casa: sale e phon fanno danni doppi. Tenete le cure per la fase due: i banchetti hanno sempre due portate.)**`,
    combat: {
      enemies: ['gregorio', 'cameriere', 'cameriere'],
      victory: 'z4_fase2',
      defeat: 'x_celle',
      bossPhase: true,
    },
  },

  z3_boss_arrabbiato: {
    location: 'salaBanchetto',
    caption: 'La trattativa respinta',
    text: `Federico è a metà della slide immaginaria numero tre quando la casa **perde la pazienza.**

Tutti i candelabri si spengono insieme. Il registro si chiude di scatto sulla penna, come una bocca. E la voce che risponde non tratta:

> La Fame: "Il contratto... è FIRMATO. Le presenze... NON NUTRONO. Gli ospiti... nutrono. Prego... accomodarsi."

Le cinque sedie scattano indietro DA SOLE, invitanti, e il pavimento a scacchi comincia lentamente a inclinarsi verso la tavola, come un piatto verso una bocca.

> Federico: *(arrotolando le maniche del pigiama)* "Va bene. VA BENE. La versione breve della proposta: NO."

**(BATTAGLIA FINALE — fase uno, e la casa è di cattivo umore. Sale e phon fanno danni doppi!)**`,
    combat: {
      enemies: ['gregorio', 'cameriere', 'cameriere'],
      victory: 'z4_fase2',
      defeat: 'x_celle',
      bossPhase: true,
    },
  },

  z3_boss_indebolito: {
    location: 'salaBanchetto',
    caption: 'LA FAME — spogliata del patto',
    text: `Nel buio, la cosa a capotavola si alza — ma si alza MALE.

Il rituale le ha tolto la firma, e senza firma il Belvedere è solo una casa vecchia con una cosa dentro: ancora enorme, ancora affamata, ma **scollegata**, come un lampadario che pende da un filo solo. La sua forma da padrone di casa perde i contorni; il tovagliolo le scivola dal collo.

> La Fame: *(con MILLE voci adesso, tutte quelle rubate in centoventicinque anni)* "il BANCHETTO... si serve... COMUNQUE—"

> La voce di Ada: *(dalle fondamenta, chiara come una campana)* "**Il banchetto è FINITO. Fuori dalla mia cucina.**"

**(BATTAGLIA FINALE — versione indebolita: il rituale le ha già tolto metà della forza. Finitela.)**`,
    combat: {
      enemies: ['gregorio_fame'],
      victory: 'z5_vittoria',
      defeat: 'x_celle',
    },
  },

  z4_fase2: {
    location: 'salaBanchetto',
    caption: 'La seconda portata',
    text: `La forma da padrone di casa si accartoccia sulla sedia come un vestito vuoto — e per tre secondi la sala è ferma, e qualcuno fa l'errore di pensare che sia finita.

Poi TUTTI I RITRATTI SI SVUOTANO.

Le cornici restano appese, piene solo di sfondi dipinti — la piscina, il giardino — mentre ciò che le abitava **converge**, colando lungo le pareti, verso il centro della sala, dentro la forma afflosciata a capotavola. La cosa che si rialza non ha più niente del padrone di casa: è la FAME com'è davvero, sotto il lino e sotto l'etichetta — un buco a forma di ospite, con dentro centoventicinque anni di soggiorni.

> Gregorio: "LA SECONDA PORTATA! Colpite ADESSO: ha mangiato troppo per muoversi bene — sembra grossa ma è LENTA, è sempre stata LENTA, è per questo che ha bisogno che gli ospiti FIRMINO—"

**(FASE DUE: più feroce, ma il gruppo ormai sa come si fa. Tutto ciò che è caldo e vivo — phon, sale, coraggio — fa il doppio dei danni.)**`,
    combat: {
      enemies: ['gregorio_fame'],
      victory: 'z5_vittoria',
      defeat: 'x_celle',
    },
  },

  z5_vittoria: {
    location: 'salaBanchetto',
    caption: 'La fine del Banchetto',
    text: `L'ultimo colpo — sale, ceramica rovente, o pura ostinazione campana — attraversa la Fame da parte a parte.

E la Fame fa l'unica cosa che nessuno si aspettava: **si siede.** A capotavola. Composta. Come un ospite che ha finito.

> La Fame: *(con una voce sola, adesso: piccola, antica, STANCA)* "...centoventicinque anni... e nessuno che mi abbia mai chiesto... se avevo finito."

Si ripiega su sé stessa, sempre più piccola — un padrone di casa, un cappotto scuro, un'ombra su una sedia, una macchia, un niente. L'ultima cosa che resta di lei è il tovagliolo, piegato con cura accanto al piatto. *Il tovagliolo piegato: il segnale universale. Il pasto è finito.*

I ritratti alle pareti, vuoti degli sfondi, si riempiono di nuovo — ma stavolta di FACCE CHE SALUTANO: Sofia e i ragazzi del '99, i sei del 1924, Margherita, Ernesto — un attimo solo, il tempo di un cenno, di un *grazie* silenzioso attraverso il vetro — e poi le cornici restano bianche. Libere. **Vuote per sempre.**

Dalle finestre, sul filo dei monti, sta salendo **l'alba.**

*(continua)*`,
    sets: { fame_sconfitta: true },
    choices: [{ text: 'Guardare l\'alba. Ve la siete guadagnata', next: 'z6_alba' }],
  },

  z6_alba: {
    location: 'albaRelais',
    caption: 'L\'alba sul Belvedere',
    text: `L'alba, sui monti d'Irpinia, arriva come un perdono: prima grigia, poi rosa, poi di un oro che non chiede niente in cambio.

La nebbia della valle — il muro bianco che vi teneva chiusi — si ritira giù per i tornanti come la marea, e da Pietrafonda, in basso, arriva un suono che non sentivate da un'era: **un gallo.** Poi le campane. Poi, una alla volta, le persiane del paese che SI APRONO.

Il Belvedere, alle vostre spalle, è solo una bella villa liberty un po' stanca, coi muri che hanno bisogno di una mano di bianco e un giardino magnifico. Il cancello è **aperto.** La ghiaia del viale, per la prima volta, è in disordine — e non se ne cura nessuno.

Sul bordo della piscina, cinque accappatoi asciugano al primo sole. **Cinque.** Il sesto non c'è più. Da nessuna parte.

E sulla porta, con un vassoio di caffè VERO — lo sentite dal profumo, il caffè finto non esiste in Irpinia — c'è Gregorio. Umano, vecchio, vivo, con gli occhi di uno che deve recuperare centoventicinque anni di colazioni.

> Gregorio: "Signori. Il conto." *(posa il vassoio, e accanto al vassoio un foglio piegato)* "Offre la casa. **Adesso posso dirlo davvero.**"

Sul foglio, nella solita calligrafia elegante, c'è scritto solo: *"SALDATO. — Il Belvedere"*. E sotto, in un'altra grafia, femminile e fitta: *"Tornate a trovarci. Da OSPITI. — A."*`,
    choices: [
      { text: '☕ Il caffè, l\'abbraccio, e la domanda che resta: "Gregorio... e adesso?"', next: 'e_alba' },
    ],
  },

  /* ==================== EPILOGO ==================== */

  e_alba: {
    location: 'albaRelais',
    caption: 'EPILOGO — Il Relais riapre',
    text: `**Un anno dopo.**

Il "Relais Belvedere — da Gregorio e Ada" ha riaperto a giugno, e ad agosto era già pieno: matrimoni, famiglie, gruppi di amici. Le recensioni parlano di un padrone di casa d'altri tempi che sembra avere mille anni di mestiere, di una piscina che di sera è "un sogno", e di una signora che nessuno vede mai ma che piega gli asciugamani **meglio di qualunque hotel a cinque stelle.**

Il pozzo del giardino ha una targa nuova: *"Fontana di Ada — esprimete un desiderio EDUCATO."*

La comunicazione la cura — gratis, come promesso, e non gliel'ha chiesto nessuno di ricordarlo ogni volta — l'agenzia di Federico. La prima campagna ha vinto anche un premio. Lo slogan l'ha scritto Natalino, una sera, per scherzo:

**"Belvedere. Nessuno vi tratterrà."**

E voi cinque? Voi ci tornate ogni anno, l'ultima settimana di agosto. Stessa camera ciascuno — Natalino ha PRETESO la Camera del Pozzo — stessi lettini, stesso bagno di mezzanotte in piscina. L'acqua riflette il cielo giusto, adesso. Quasi sempre. E se qualche notte, nel riflesso, le stelle sembrano UN po' più fitte del dovuto... be'.

Ormai sapete come si fa: si alza il bicchiere verso il pozzo, si dice **"buonanotte, Ada"**, e si va a dormire.

**🌅 FINE — Avete rotto un patto di 125 anni, liberato una casa e adottato due fantasmi. La vacanza può cominciare.**`,
    ending: true,
  },

  e_custode: {
    location: 'albaRelais',
    caption: 'EPILOGO — Il Nuovo Custode',
    text: `La firma asciuga in fretta. Le firme date per amore, al Belvedere, asciugano sempre in fretta: la casa le riconosce, e le tratta con rispetto.

L'alba trova quattro persone al cancello con le valigie, e una sulla soglia, con le chiavi.

Non c'è stato bisogno di dirlo ad alta voce: lo sapevate tutti da quando la penna ha toccato la carta, forse da prima. Chi resta ha firmato **con la mano ferma** — questo gli altri lo racconteranno per sempre, ed è vero — e ha detto solo: *"Prenotate presto per agosto. Si riempie."*

**Un anno dopo**, il Relais Belvedere è il posto più bello dei monti d'Irpinia. Il custode nuovo ha fatto meraviglie: la piscina è un sogno, l'orto profuma fino in strada, e Gregorio — vecchio, libero, vivo — fa il portiere di giorno e il nonno di tutti la sera. La signora del pozzo piega gli asciugamani. La casa, be': la casa è FELICE, e una casa felice non ha fame, ha appetito. C'è differenza. Adesso lo sapete.

E l'ultima settimana di agosto, ogni anno, quattro amici salgono i tornanti con le valigie e il magone, e trovano il cancello aperto e cinque lettini a bordo piscina.

Il quinto accappatoio ha le iniziali ricamate in filo d'oro.

E chi lo indossa **sorride** — davvero, vi giurate ogni anno tornando a valle, sorride DAVVERO —

...ma non invecchia.

**🌒 FINE — Il Belvedere ha un nuovo custode, e voi una promessa da mantenere ogni agosto, per sempre. Nessuno ha mai vinto così tanto perdendo così tanto.**`,
    sets: { finale_custode: true },
    ending: true,
  },

  e_ospiti: {
    location: 'salaBanchetto',
    caption: 'EPILOGO — Ospiti per Sempre',
    text: `Il Relais Belvedere è, secondo chi c'è stato, il posto più accogliente dei monti d'Irpinia.

Il padrone di casa è un uomo d'altri tempi che sembra portare sulle spalle una stanchezza antica. La piscina, di sera, è un sogno turchese nel buio della montagna. E nel salone da pranzo c'è un quadro che tutti i visitatori si fermano a guardare: **cinque amici in piscina, che ridono.** È dipinto così bene che sembrano sul punto di voltarsi.

Due coppie e un ragazzo con un gran bel taglio di capelli, dicono le guide. Di un pittore ignoto. Datato — ed è curioso, per un dipinto così vivido — **2024.**

I clienti più attenti notano dettagli che le guide non spiegano: che gli occhi dei cinque seguono chi attraversa la sala. Che il venerdì sera, dal quadro, arriva un odore leggero di cloro e di lacca per capelli. E che se ti avvicini molto, molto vicino — così vicino che il custode compare sempre alle tue spalle a chiederti gentilmente di accomodarti a cena — senti una voce piccolissima, da dietro il vetro, che dice:

*"...ragazzi. RAGAZZI. Ho una teoria nuova su come si esce. Chi mi ascolta? Gaetano? GAETANO?"*

Il prossimo gruppo arriva tra venticinque anni. Il Belvedere è paziente.

E voi, ormai... anche.

**🖼 FINE — Il Belvedere ha il suo ritratto più bello. Rigiocate: quella cornice può restare vuota.**`,
    sets: { finale_ospiti: true },
    ending: true,
  },

};

/* Scena iniziale della campagna */
const CAMPAIGN_START = 'a1';

/* Mappa del mondo: luoghi del Belvedere (per il canvas della mappa) */
const WORLD_MAP = [
  { key: 'tornanti', label: 'I Tornanti',      x: 0.12, y: 0.80, scenes: ['a1', 'a1b'] },
  { key: 'relais',   label: 'Il Relais',       x: 0.40, y: 0.30, scenes: ['a2', 'a2_siepi', 'p4_fuga'] },
  { key: 'hall',     label: 'La Hall',         x: 0.56, y: 0.48, scenes: ['a3', 'a3_registro', 'a3_registro_ko', 'a4_firma', 'a4_rinvio', 'a4_firma_forzata', 'p4_rientro'] },
  { key: 'camere',   label: 'Le Camere',       x: 0.74, y: 0.32, scenes: ['a5', 'a5_pozzo', 'h1', 'h2', 'u1', 'u2_1999', 'u2_1924', 'u2_1899', 'u3_medaglione', 'u3_bambole_fight', 'u3_bambole_vinte', 'u5_specchio', 'u4_porta_vuota'] },
  { key: 'pranzo',   label: 'Sala da Pranzo',  x: 0.46, y: 0.62, scenes: ['a6', 'a6_brindisi', 'a6_no_brindisi', 'a7', 'z1', 'z2_vino', 'z2_trattativa', 'z2_rituale', 'z3_boss', 'z3_boss_arrabbiato', 'z3_boss_indebolito', 'z4_fase2', 'z5_vittoria', 'z6_alba', 'e_alba', 'z_custode', 'e_custode', 'z_resa', 'e_ospiti'] },
  { key: 'piscina',  label: 'La Piscina',      x: 0.22, y: 0.50, scenes: ['p1', 'p1_accappatoio', 'p1_accappatoio_ko', 'p2', 'p2_esperimento', 'p2_esperimento_ko', 'p3_fuori'] },
  { key: 'cantina',  label: 'La Cantina',      x: 0.62, y: 0.78, scenes: ['k1', 'k2_sofia', 'k2_sofia_ko', 'k3', 'k4_scambio', 'k4_chef_fight', 'k4_furto', 'k4_furto_ko', 'k5_dopo_chef', 'x_celle'] },
  { key: 'pozzo',    label: 'Il Pozzo',        x: 0.86, y: 0.66, scenes: ['b1', 'b2_giardiniere_fight', 'b2_orto', 'b3_pozzo', 'b4_medaglione', 'b4_vino', 'b4_parole', 'b4_ira', 'b4_calata', 'b4_calata_ko'] },
];

