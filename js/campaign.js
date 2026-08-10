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
  lanterna_1899: {
    name: 'Lanterna del 1899',
    desc: 'Ottone annerito, vetro fumé. Il Contabile: "Le creature della casa la conoscono. Non la temono: la RISPETTANO. C\'è differenza." Portata in giro, fa esitare chi vi assale — un attimo, non di più.',
    usable: false,
  },
  lettere_1899: {
    name: 'Lettere di Gregorio e Ada',
    desc: 'Un fascio legato con lo spago, grafia doppia — una elegante, una femminile e fitta. Parlano di un ampliamento del relais mai fatto: "per le famiglie", scriveva lui. Non c\'è mai stato tempo.',
    usable: false,
  },
  asso_di_denari: {
    name: 'Asso di Denari (portafortuna dei reduci)',
    desc: 'Il portafortuna dei reduci del 1949: l\'hanno tenuto in tasca per settant\'anni, e adesso è in tasca a voi. UNA volta, permette di RITIRARE una prova fallita — il gioco ve lo proporrà al momento giusto.',
    usable: false,
  },
  nastro_1974: {
    name: 'Nastro del \'74',
    desc: 'Una cassetta senza custodia: "ULTIMA REGISTRAZIONE — L. + comune". In uno scontro, la musica del \'74 CALMA le creature della casa: le più piccole si fermano un giro, le grandi esitano. Un uso solo: il nastro poi si spezza.',
    combat: { calm: true }, icon: '📼',
  },
  candela_motore: {
    name: 'Candela del motore (gruppo 2024)',
    desc: 'Una candela d\'accensione, ancora tiepida, con una targhetta d\'ottone: "Gruppo 2024". Gaetano la riconosce: è la SUA.',
    usable: false,
  },
  orologio_sofia:     { name: 'Orologio di Sofia', desc: 'Un modello economico da discount, cinturino di plastica scolorito. Fermo alle 23:58 del 31 luglio 1999 — due minuti prima che tutto cominciasse.', usable: false },
  inventario_riflesso: { name: 'L\'Inventario del Riflesso', desc: 'Il registro dove il Belvedere capovolto catalogava i suoi ospiti come oggetti. Le pagine strappate, quelle rimaste, battono ancora piano — come un cuore che non vuole fermarsi del tutto.', usable: false },
  campanello:       { name: 'Campanello di Servizio', desc: 'Ottone lucido. Il cartellino dice: "Suonare in caso di bisogno. Verranno."', usable: false },
  moka:             { name: 'Moka di Don Michele', desc: 'Caffè del paese, nero come la notte e due volte più forte. Ricarica TUTTE le abilità di una persona.', usable: true, recharge: true },
  bengala:          { name: 'Bengala di Federico', desc: '"Per le emergenze", diceva. Da lancio: 2d6 danni a TUTTI i nemici, che restano accecati (svantaggio).', combat: { dice: [2, 6], all: true, distract: true }, icon: '🧨' },
  campanella_1974:  { name: 'Campanella del 1974', desc: 'La campanella della vecchia chiesa di Pietrafonda. Don Michele: "Quando LEI si siede a tavola... suonate i vespri."', usable: false },
};

const CAMPAIGN = {

  /* ==================== PROLOGO — IL VIAGGIO ==================== */

  a0: {
    location: 'tornanti',
    caption: 'Autogrill di Baiano — ore 17:50, l\'ultimo caffè normale',
    text: `**Venerdì pomeriggio, autostrada per Avellino, poi su.**

L'autogrill di Baiano è l'ultimo avamposto della civiltà: cinque caffè, due Camogli, un pacco di taralli "per il viaggio" che Emanuela ha già razionato con criteri militari, e Natalino che torna dalla cassa con l'aria di chi ha vinto qualcosa.

> Natalino: "Ho preso i Gratta e Vinci. Cinque. Uno a testa. Se qualcuno vince, il weekend lo paga lui e Federico ci ridà l'anticipo."

> Federico: "L'anticipo era un AFFARE, e comunque il relais è già pagato, quindi tecnicamente—"

> Claudia: "Tecnicamente hai prenotato un posto che su Google Maps È UNA CHIAZZA VERDE. L'ho cercato stamattina: la foto satellitare si interrompe. C'è il bosco, c'è la strada, e poi c'è tipo... una sfocatura."

> Gaetano: "Compressione dell'immagine. Le zone di montagna le aggiornano ogni dieci anni, non ci vive nessuno—"

> Claudia: "Amore. La sfocatura è SOLO sul relais. Il bosco intorno è nitido che gli conti le foglie."

Un silenzio da autogrill, con le tazzine a mezz'aria. Poi Natalino gratta il primo biglietto, perde, e la vita riparte.

*(I Gratta e Vinci perdono tutti e cinque. Ovviamente. Ma questo lo scoprirete strada facendo.)*`,
    choices: [
      { text: '🚗 Si riparte: ultima ora di strada, poi i tornanti', next: 'a1' },
      { text: '⛽ Prima, il pieno al distributore qui fuori — il serbatoio è a metà', next: 'a0_benzina' },
    ],
  },

  a0_benzina: {
    location: 'tornanti',
    caption: 'Il distributore — l\'uomo che conosce la strada',
    text: `Il distributore fuori dall'autogrill ha un benzinaio VERO, di quelli che esistono ancora solo in provincia: canottiera sotto la camicia aperta, radiolina che gracchia i risultati dell'ippica, e l'occhio lungo di chi vede passare tutti.

> Il benzinaio: *(mentre il numeratore gira)* "Turisti? Dove andate di bello?"

> Federico: "Relais Belvedere. Sopra Pietrafonda."

La pompa si ferma. Non il numeratore: LA MANO del benzinaio, sull'impugnatura. Due secondi. Poi riprende, e lui non vi guarda più.

> Il benzinaio: "Bel posto. Bella piscina, dicono." *(riattacca la pompa, pulisce le mani in uno straccio con estrema cura)* "Sentite a me: se stanotte vi dicono di rientrare a mezzanotte... rientrate a mezzanotte. Non per la nebbia. La nebbia non c'entra un cazzo. Rientrate e basta."

> Natalino: "In che senso, scusi—"

> Il benzinaio: "Trentaquattro e cinquanta di verde. Il POS non funziona, come al solito. E ragazzi..." *(e qui vi guarda, uno per uno, con due occhi che hanno visto passare CINQUE macchine come la vostra, una ogni venticinque anni)* "...lasciate stare il pozzo."

**(Il serbatoio è pieno. Il silenzio in macchina, per i primi dieci minuti, anche. Sangue freddo +1: sapere di non sapere è già qualcosa.)**`,
    gold: 1,
    sets: { avviso_benzinaio: true },
    choices: [
      { text: '🚗 "Simpatico, il signore." Verso i tornanti.', next: 'a1' },
    ],
  },

  a1: {
    location: 'tornanti',
    caption: 'Strada provinciale — monti d\'Irpinia, ore 18:40',
    text: `**Venerdì pomeriggio. Cinque amici, una macchina piena come un uovo, e le montagne sopra Avellino che si mangiano il sole.**

Gaetano guida da un'ora e mezza. Claudia, di fianco, ha il telefono alzato da venti minuti: *"Niente segnale. NIENTE. Nemmeno una tacca ironica."* Dietro, Natalino è seduto in mezzo alle valigie come un faraone nel sarcofago, Federico difende la sua prenotazione — "cinque stelle, ragazzi, un AFFARE" — ed Emanuela ha già distribuito acqua e taralli a tutti, due volte.

Il navigatore ha smesso di parlare da tre tornanti. L'ultima cosa che ha detto è stata *"procedere sulla strada senza nome"*, e nessuno ha commentato perché nessuno voleva essere il primo.

Fuori, i castagneti si chiudono sopra la strada come dita. In basso, nella valle, un paesino di pietra grigia — il cartello dice **PIETRAFONDA, ab. 41** — con le persiane tutte chiuse. Tutte. Alle sette di sera di un venerdì d'estate.

> Natalino: "Quarantuno abitanti. QUARANTUNO. Chi è l'uno, mi chiedo. Io voglio conoscere l'uno. Anzi no, col cazzo: io voglio NON conoscerlo, l'uno."

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
    npc: ['gregorio'],
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
    npc: ['gregorio'],
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
    npc: ['gregorio'],
    caption: 'La cena delle nove — sala da pranzo',
    text: `La sala da pranzo è un piccolo teatro: un tavolo lungo apparecchiato d'argento, candelabri accesi, e le portefinestre che danno sulla piscina illuminata di turchese là fuori, fumante nell'aria fresca della montagna.

La cena è — non c'è altra parola — **straordinaria**. Pasta fatta in casa, un arrosto che si taglia col pensiero, verdure dell'orto. Gregorio serve tutto personalmente, con tempi da orologeria, raccontando la valle: i castagneti, il santuario lassù, il paese.

> Gregorio: "Pietrafonda si è svuotata negli anni. Restano gli anziani, e gli anziani vanno a letto presto. Per questo le persiane chiuse: **non è maleducazione. È memoria.**"

> Gaetano: "Memoria di cosa?"

> Gregorio: *(riempiendogli il bicchiere, senza fretta)* "Delle notti in cui conviene non guardare fuori. Ogni paese di montagna ne ha qualcuna. La vostra generazione le chiama superstizioni. La mia le chiamava **istruzioni.**"

Ride, e ridete anche voi, e il vino è così buono che la frase scivola via. Quasi.

C'è solo un dettaglio che Claudia registra senza volerlo, da professionista dell'osservazione: in tutta la sera, con cinque portate e sei brindisi, **Gregorio non ha mangiato né bevuto niente.** Nemmeno un'oliva.`,
    choices: [
      { text: '🍝 "Gregorio, ci racconti il menù: questa pasta è ILLEGALE."', next: 'a6_menu', once: true },
      { text: '🍷 Chiedere a Gregorio di unirsi al brindisi: insistere, con simpatia', tag: 'Prova di Carisma — CD 12', check: { stat: 'CAR', dc: 12, success: 'a6_brindisi', fail: 'a6_no_brindisi' } },
      { text: '🏊 Buttarla sul programma: "Gregorio, la piscina si può usare di sera?"', next: 'a7' },
    ],
  },

  a6_menu: {
    location: 'salaDaPranzo',
    npc: ['gregorio'],
    caption: 'Il menù del Belvedere — una storia per portata',
    text: `Gregorio si illumina — l'unico entusiasmo GENUINO che gli avete visto finora — e racconta il menù come si racconta una dinastia.

> Gregorio: "I fusilli al ferretto: ricetta della valle, la pasta si arrotola attorno a un ferro da calza. Questa è del **1924**: la portò la signora Margherita, che li faceva ogni domenica. Il forno non ha mai smesso di farli da allora. In sua memoria."

> Gregorio: "L'arrosto con le castagne: **1949**. Il signor Ernesto diceva che gli ricordava il rancio buono, quello delle domeniche in caserma. Ne mangiò tre porzioni, la sua prima sera. Anche l'ultima, a dire il vero."

> Gregorio: "E il dolce di stasera — mele annurche e miele di castagno — è del **1999**. La signorina Sofia lo definì, cito testualmente, 'una roba da paura'." *(sorride, e per la prima volta il sorriso è più triste dell\'orario di chiusura di un luna park)* "Il linguaggio dei giovani. Sempre così... profetico."

Emanuela posa la forchetta. Piano.

> Emanuela: "Gregorio. Lei parla degli ospiti come... come se il menù fosse un CIMITERO."

> Gregorio: *(riempiendole il bicchiere, gentilissimo)* "Signora mia. In ogni grande cucina, la memoria e il menù sono la stessa cosa. Qui al Belvedere... semplicemente non buttiamo via niente."

**(Ogni piatto è un ospite. Ogni annata è un gruppo. Sangue freddo +1, appetito -100. Flag: il menù della memoria.)**`,
    gold: 1,
    sets: { menu_memoria: true },
    choices: [
      { text: '🍷 Cambiare aria: il brindisi. INSISTERE che beva anche lui.', tag: 'Prova di Carisma — CD 12', check: { stat: 'CAR', dc: 12, success: 'a6_brindisi', fail: 'a6_no_brindisi' } },
      { text: '🏊 "Comunque buonissimo tutto, eh. La piscina si può usare di sera?"', next: 'a7' },
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
    stinger: 'jumpscare',
    caption: 'La piscina — il gioco del riflesso',
    text: `Il bagno riprende. La montagna riprende il suo silenzio. Emanuela organizza il torneo di apnea — regole da salone: *"chi bara paga gli aperitivi per un anno"* — e per un po' l'unica cosa inquietante della serata è quanto Gaetano tenga a vincere.

È durante la terza manche che Claudia, fuori a fare da giudice col telefono, inquadra la superficie dell'acqua per il replay.

E si blocca.

> Claudia: "...uscite un attimo. Tutti. **Con calma.**"

Nel telefono, il replay mostra la piscina dall'alto: l'acqua turchese, i corpi che nuotano, le risate. Tutto normale. Tranne il **riflesso delle stelle.**

Nell'acqua si riflette un cielo. Ma non È il cielo che avete sopra la testa: le costellazioni sono **diverse**, più fitte, disposte in figure che non avete mai visto su nessuna app di astronomia. E in quel cielo riflesso, bassa sull'orizzonte dell'acqua, c'è una **luna piena enorme e rossa.**

Alzate la testa: sopra di voi, la luna vera è un taglio sottile, bianco, al primo quarto.

> Gaetano: *(molto piano, da ingegnere che ha finito le spiegazioni)* "...rifrazione. No. Inversione termica. No. Ragazzi, io non... io non ho un cazzo di modello per QUELLA."

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

> Federico: "...era NUOVA, porca puttana. Comprata IERI."

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

Gaetano fa quello che farebbe qualunque ingegnere aerospaziale con dieci anni di studi: cade seduto all'indietro urlando *"MADONNA SANTISSIMA CHE CAZZO È"* e l'infradito finisce in acqua.

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

> Natalino: "Ok. Ricapitoliamo da professionisti, e scusate il francesismo che sto per usare. Sei accappatoi. Un cielo SBAGLIATO nell'acqua. Un'infradito rapita. E il paese laggiù—" *(indica la valle)* "—che alle sette aveva le persiane chiuse. Ragazzi: che cazzo di posto ci ha prenotato Federico."

> Emanuela: "E Gregorio che non mangia, non beve, ed è 'astemio dal 1899'."

> Claudia: "E il registro. Un gruppo ogni venticinque anni. **1999. 1974. 1949...**"

> Federico: *(dopo un lungo silenzio, con la voce di chi rilegge un contratto già firmato)* "...e il 2024 saremmo noi. Porca puttana. Ragazzi. Porca. Puttana." *(pausa)* "Da domani scrivo una recensione DEVASTANTE."

È quasi mezzanotte. Le luci della piscina, come promesso da Gregorio, cominciano a spegnersi una a una. E dalla valle, per la prima volta da quando siete arrivati, **la nebbia inizia a salire.** Lenta. Compatta. E — Gaetano lo nota con orrore geometrico — **contro pendenza.**`,
    choices: [
      { text: '🚪 Dentro. Ora. Come ha detto Gregorio: "a mezzanotte, dentro"', next: 'p4_rientro' },
      { text: '🚗 SUBITO IN MACCHINA. Si parte adesso, in accappatoio se serve', next: 'p4_fuga' },
    ],
  },

  p4_fuga: {
    location: 'relais',
    caption: 'Il tentativo di fuga — ore 23:52',
    text: `La decisione è unanime nel modo speciale in cui è unanime il panico: nessuno pronuncia la parola "scappiamo", ma Emanuela ha già le chiavi in mano, Claudia dice solo "MACCHINA. ORA." e in novanta secondi siete tutti vestiti a metà, con le valigie richiuse a morsi, giù per le scale.

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

> Natalino: "Io questa tisana non la bevo manco morto. Scusate il gioco di parole, ma sono le due e ho visto una piscina posseduta: il bon ton è ufficialmente SOSPESO."

Da qualche parte sopra di voi, al piano delle camere, **un pavimento scricchiola.** Una volta. Poi, educatamente, si ferma ad aspettare.`,
    choices: [{ text: 'Su. Insieme. Si va a capire che notte è questa', next: 'h1' }],
  },

  /* ==================== LA NOTTE SI CHIUDE — HUB ==================== */

  h1: {
    location: 'corridoio',
    stinger: 'campana',
    npc: ['gregorio'],
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
      { text: '🚶 Il cancello: chi non ha FIRMATO può ancora passare. Scendere a Pietrafonda', requires: { flag: 'firma_rinviata' }, next: 'pp1', once: true },
      { text: '🌊 Tornare alla PISCINA: il riflesso è una PORTA, e voi ormai lo sapete', next: 'w1_tuffo', requires: { flag: 'un_nodo_sciolto' }, once: true },
      { text: '💑 Gaetano e Claudia: due minuti, da soli, sul balcone', next: 'cuore_gc', once: true },
      { text: '💑 Federico ed Emanuela: la porta della loro camera è socchiusa', next: 'cuore_fe', once: true },
      { text: '🕯 Natalino: la finestra della Camera del Pozzo lo sta aspettando', next: 'cuore_nat', once: true },
      { text: '🌅 Basta così: barricarsi e aspettare l\'alba (verso il finale)', next: 'z1', requires: { flag: 'un_nodo_sciolto' } },
    ],
  },

  h2: {
    location: 'corridoio',
    npc: ['gregorio'],
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
    npc: ['cuoco'],
    caption: 'Il fondo della cantina — la cucina del Banchetto',
    text: `Oltre le rastrelliere, la cantina si apre in una **seconda cucina.** Non quella linda del piano di sopra: questa è del 1899 e non ha mai smesso di lavorare. Un forno a legna GRANDE COME UN'AUTO, acceso, con la fiamma che respira piano. Un tavolo da macellaio lungo quattro metri, segnato da centoventicinque anni di lame. Ganci vuoti al soffitto, **che oscillano** senza vento, come se qualcosa ci fosse appena stato appeso. O stesse per esserlo.

E al tavolo, di spalle, c'è **lo Chef.**

Due metri di grembiule ingiallito, un cappello da cuoco afflosciato, e il corpo... il corpo è SBAGLIATO nelle proporzioni, come disegnato a memoria da qualcuno che i cuochi li ha solo sentiti descrivere. Sta affilando una mannaia con movimenti lenti, amorevoli.

> Emanuela: *(un filo di voce)* "Natalì."

> Natalino: "Lo vedo."

> Emanuela: "Natalì, quello è alto due metri e mezzo."

> Natalino: "LO VEDO, Emanuè. Sto elaborando. Il mio psicologo saprà tutto lunedì."

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

> Emanuela: *(accendendo la piastra, gelida)* "Io in cucina ci sono cresciuta, pezzo di merda. Vediamo chi cucina chi."

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
    choices: [
      { text: '🕳 Dietro la cella frigorifera c\'è un pannello che NON dovrebbe muoversi...', next: 'os1', once: true },
      { text: 'Risalire. La notte non è finita', next: 'h1' },
    ],
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
      { text: '🚪 1949 — da dietro la porta, una radio gracchia un notiziario', next: 's49_1', once: true },
      { text: '🚪 1974 — sotto la porta, un odore d\'incenso vecchio di mezzo secolo', next: 's74_1', once: true },
      { text: '🪜 In fondo al corridoio, una scaletta a pioli sale verso una botola', next: 'sf1', once: true },
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

> Natalino: *(sottovoce, con sentimento)* "No no no, col cazzo, io i film con le bambole manco li GUARDO—"

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
    stinger: 'jumpscare',
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

> Natalino: *(chiudendo la porta con delicatezza estrema, come per non svegliarla)* "Nessuno. Dorme. Mai più. Ok? Nemmeno DOPO, a casa. Io un mese dormo in piedi come i cavalli, e col cazzo che mi vergogno a dirlo."

**(Il piano proibito non ha più segreti. Meglio tornare al corridoio e scegliere la prossima mossa.)**`,
    choices: [{ text: 'Giù, al corridoio delle tre porte', next: 'h1' }],
  },

  /* ==================== PISTA 3 — IL POZZO ==================== */

  b1: {
    location: 'giardino',
    caption: 'Il giardino di notte — il regno del Giardiniere',
    npc: [{ key: 'spaventapasseri', x: 0.52, y: 0.86, scale: 4 }],
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
    npc: [{ key: 'spaventapasseri', x: 0.62, y: 0.9, scale: 5 }],
    text: `Il piano regge per trenta metri. Poi la nebbia — che non entra MAI nella proprietà — trova il modo di vendicarsi: un banco sottile scavalca la siepe per un secondo, un secondo solo, e copre lo spaventapasseri come un sipario.

Quando il sipario si alza, lo spaventapasseri **non c'è più.**

*Clip.*

È dietro di voi. Nessuno l'ha sentito. Le cose impagliate non pesano. Il cappello di paglia si solleva di un grado, quel tanto che basta a mostrarvi che sotto non c'è una faccia: c'è **paglia e buio**, e il buio vi sta valutando come si valuta una siepe cresciuta male.

> Il Giardiniere: *(voce di foglie secche)* "Fuori... orario. Il giardino... si pota... di notte. E stanotte... siete NEL giardino."

Le cesoie si aprono con lo scatto oliato di centoventicinque anni di manutenzione amorevole.

> Federico: "Gaetano. GAETANO. Il tuo piano matematico faceva SCHIFO."

> Gaetano: "Il piano era PERFETTO, è la nebbia che bara, STRONZA—"

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
    choices: [
      { text: '🚗 Prima: la porta della rimessa è socchiusa, e dentro c\'è la VOSTRA macchina', next: 'gr1', once: true },
      { text: 'Al pozzo. È il momento.', next: 'b3_pozzo' },
    ],
  },

  b3_pozzo: {
    location: 'pozzo',
    caption: 'Il pozzo vecchio — ore 3:00',
    text: `Il pozzo vecchio, da vicino, è più antico della villa: la pietra è di un'altra epoca, coperta di incisioni consumate — non decorazioni: **conti.** File e file di tacche, a gruppi di cinque, come su un muro di prigione. Qualcuno, qui, ha contato qualcosa per molto, molto tempo.

La corda è tesa. Il secchio è giù. E dal fondo — non eco, non acqua: dal fondo — sale una voce.

La riconoscete tutti e cinque nello stesso istante, e tutti e cinque per un motivo diverso: perché è **la voce di vostra madre.** Di tutte e cinque le vostre madri, insieme, in una sola.

> La voce dal pozzo: *"...siete venuti. Ho piegato gli asciugamani per voi. Ho tirato su l'acqua per voi. CENTOVENTICINQUE ANNI che apparecchio l'acqua e nessuno che si cala a farmi compagnia. Gregorio non viene mai. Gregorio ha PAURA. Voi non avete paura, vero? Voi siete ospiti EDUCATI."*

La corda si muove. Piano. Su, e giù. Come un invito col dito.

> Federico: *(bianco come i lini del Belvedere)* "È Ada."

> Gaetano: *(molto piano)* "Ha la voce di mia madre. Ce l'ha SOLO PER ME o..."

> Claudia: "No. No, ce l'ha per tutti. Oddio. Oddio, che schifo di posto."

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

  /* ==================== PISTA SEGRETA — PIETRAFONDA ====================
     Disponibile solo se la firma è stata RINVIATA: il patto non vi tiene. Ancora. */

  pp1: {
    location: 'tornanti',
    caption: 'La discesa a Pietrafonda — ore 1:20',
    text: `Il cancello si apre.

Non cigola, non esita: si apre e basta, come una bocca che non ha motivo di mordere. Gregorio ve l'aveva lasciato intendere con lo sguardo, alla firma rinviata: *il patto tiene chi ha firmato.* Voi, tecnicamente, siete ancora ospiti **in prova.**

E la nebbia — il muro bianco che ha respinto i fari della macchina — davanti a voi si RITIRA. Un corridoio di aria pulita largo esattamente quanto cinque persone affiancate, giù per i tornanti, fino alle luci spente di Pietrafonda.

> Claudia: "Si apre solo per noi. Il che significa che può chiudersi solo per noi."

> Gaetano: "Andata e ritorno. Un'ora. E passiamo dalla macchina: se scendiamo in un paese fantasma alle una di notte, ci scendiamo EQUIPAGGIATI."

Dalla macchina, ferma dove l'avete lasciata, recuperate il **kit emergenze di Federico** — che si rivela contenere: un poncho, tre barrette scadute, e un **BENGALA** da stadio.

> Federico: "Per le emergenze."

> Natalino: "Fedé, in che emergenza serve un BENGALA da CURVA?"

> Federico: *(infilandolo nello zaino)* "Questa, evidentemente."

**(Ottenuto: BENGALA — da lancio, acceca e brucia tutto ciò che è nella stanza.)**`,
    item: 'bengala',
    sets: { discesa_paese: true },
    choices: [{ text: '⬇ Giù, nel corridoio di nebbia, verso il paese', next: 'pp2' }],
  },

  pp2: {
    location: 'paese',
    caption: 'Pietrafonda, ab. 41 — la piazza',
    text: `Pietrafonda di notte è un presepe a cui hanno soffiato via le candele.

Quarantuno case di pietra grigia, strette attorno a una piazza col campanile mozzato. Ogni persiana chiusa. Ogni comignolo freddo. Il bar — insegna arrugginita: **"DA PEPPE — dal 1961"** — ha ancora i tavolini fuori, impilati e incatenati con la cura di chi pensava di riaprire lunedì. Il lunedì, a giudicare dalla polvere, era venticinque anni fa.

E poi la vedete: **una luce.** Una sola, in tutto il paese. Una finestra al piano terra della casa addossata alla chiesa — la canonica — con dietro un'ombra che si muove piano, avanti e indietro, come chi cammina per non pensare.

> Natalino: "Quarantuno abitanti, e l'UNO è sveglio all'una di notte. Ragazzi. Ve l'avevo detto io che lo volevo conoscere."`,
    choices: [
      { text: '🚪 Bussare alla canonica: chi veglia stanotte, veglia per un motivo', next: 'pp3' },
      { text: '🔦 Prima, una torcia dentro al bar chiuso dal 1999', tag: 'Prova di Saggezza — CD 12', check: { stat: 'SAG', dc: 12, success: 'pp2_bar', fail: 'pp3' } },
    ],
  },

  pp2_bar: {
    location: 'paese',
    caption: 'Da Peppe — chiuso dal 1999',
    text: `La torcia LED di Gaetano attraversa la vetrina impolverata, e il bar restituisce la sua fotografia: sedie sui tavoli, la macchina del caffè coperta da un telo, il calendario fermo ad **agosto 1999.**

E sul bancone, ancora lì, cinque tazzine. Una fila di cinque tazzine sporche, mai lavate, con accanto un conto scritto a mano e mai battuto: *"5 caffè — offre Peppe. Ai ragazzi del Belvedere: tornate a raccontarmi com'è lassù."*

> Emanuela: *(piano)* "Sono scesi a prendere il caffè. La mattina prima. Come noi al ristorante, ieri."

Sotto il conto, aggiunto dopo, con una grafia più tremante: *"Settembre. Non sono tornati. Il paese lo sapeva e io gli ho fatto il caffè lo stesso. Che Dio mi perdoni."*

La firma è: **Peppe.** E sotto ancora, un'ultima riga, di mano diversa, che riconoscete — minuta, fitta, femminile:

*"Non era colpa tua, Peppe. Non è MAI stata colpa di nessuno di voi. — A."*

Ada scrive anche fuori dalla proprietà. Ada, in cinquant'anni, ha consolato **tutto il paese.**

**(Sangue freddo +2: adesso sapete per chi state combattendo, oltre che per voi.)**`,
    gold: 2,
    sets: { visto_bar_1999: true },
    choices: [{ text: 'Alla canonica', next: 'pp3' }],
  },

  pp3: {
    location: 'paese',
    caption: 'La canonica — Don Michele',
    npc: ['donmichele'],
    text: `La porta si apre prima che le nocche tocchino il legno. Sulla soglia c'è un uomo che il tempo ha piegato ma non convinto: novant'anni portati come una tonaca stirata, occhi lucidi e velocissimi, e in mano — non una Bibbia — **una tazza di caffè fumante.**

> Don Michele: "Cinque. Del Belvedere. In discesa e VIVI." *(vi conta col dito, due volte)* "E senza firma addosso — si vede, sapete: chi ha firmato ha la nebbia che gli cammina dietro. Entrate. Il caffè è pronto da cinquant'anni."

Dentro, la canonica è un archivio di guerra: ritagli, registri parrocchiali, una parete di foto. Gruppi di ragazzi in vacanza: 1949. 1974. 1999. Cerchiati, annotati, PIANTI.

> Don Michele: "1974. Io ero il sesto. Salimmo in sei da Napoli — io, mio fratello Aldo, e altri quattro. La sera della firma io dissi no. Non per coraggio: per SUPERBIA, non firmo mica io i registri degli alberghi... La nebbia mi lasciò scendere. Loro..." *(indica la foto: cinque ragazzi in piscina, un sesto ritagliato via)* "...loro no. Da cinquant'anni abito qui, dico messa a nessuno e suono i vespri ogni sera. Non per Dio, ragazzi. Perché LEI, lassù — la signora del pozzo — mi rispose UNA volta, nel '74. Disse: 'suona, che chi è dentro almeno sente l'ora.'"

Si versa un altro caffè. Le mani, per la prima volta, gli tremano.

> Don Michele: "Stanotte è il venticinquennio. E voi siete scesi a bussare alla MIA porta. Ditemi tutto. E poi vediamo cosa vi do."`,
    sets: { storia_1974: true },
    choices: [
      { text: '📖 Raccontargli tutto: il registro, il pozzo, i nodi, il Banchetto', next: 'pp4' },
      { text: '⛪ Prima: chiedergli della cripta dei registri parrocchiali', tag: 'Prova di Intelligenza — CD 12', check: { stat: 'INT', dc: 12, success: 'pp4_cripta', fail: 'pp4' } },
    ],
  },

  pp4_cripta: {
    location: 'paese',
    caption: 'La cripta dei registri',
    text: `L'intuizione è di quelle che Gaetano chiama "banali a posteriori": se il Belvedere tiene un registro... **anche la parrocchia tiene i suoi.**

Don Michele vi guida nella cripta sotto la chiesa, tra scaffali di registri parrocchiali che risalgono al Seicento. Battesimi, matrimoni, sepolture. E lì, alla voce "custodi del Belvedere", la mano di dodici parroci diversi ha annotato per due secoli la stessa cosa:

*1824: "sale al Belvedere il nuovo custode, forestiero."*
*1849: "sale il custode nuovo."*
*1874: "sale il custode."*
**Ogni venticinque anni. Anche PRIMA di Gregorio.**

> Gaetano: "Gregorio ha firmato nel 1899. Ma il ciclo era già vecchio di decenni. Lui non è il primo custode. È solo... il più longevo."

> Don Michele: "Il più TESTARDO. Gli altri cedevano al giro dopo: firmava un ospite nuovo e loro sparivano. Lui no. Lui è rimasto a fare il maggiordomo della cosa che l'ha fregato, pur di non passare la penna a un altro. Centoventicinque anni di dispetto, ragazzi. Quasi lo ammiro."

**(Segreto pesante: il patto è più vecchio di Gregorio — e un custode può RIFIUTARSI di passare la penna. Sangue freddo +2.)**`,
    sets: { segreto_custodi: true },
    gold: 2,
    choices: [{ text: 'Su, da Don Michele: il racconto e i doni', next: 'pp4' }],
  },

  pp4: {
    location: 'paese',
    caption: 'Il racconto e i doni',
    npc: ['donmichele'],
    text: `Il racconto dura un caffè intero — e con Don Michele il caffè è un'unità di misura seria. Ascolta senza interrompere: il registro coi vostri nomi già scritti, la piscina col cielo sbagliato, la voce dal pozzo, i nodi, il Banchetto delle 5:57.

Alla fine si alza, apre un armadio a muro, e comincia a posare cose sul tavolo con la precisione di un armiere.

> Don Michele: "**Uno.** La moka grande. Caffè di Pietrafonda: sveglia i vivi, e stanotte vi serve essere MOLTO vivi." *(posa la moka ancora calda)* "**Due.** Questa."

Ed è una **campanella di bronzo**, consumata, con incisa una data: 1974.

> Don Michele: "La campanella dei vespri della chiesa vecchia. La suono ogni sera da cinquant'anni, e ogni sera, lassù, QUALCOSA si ferma ad ascoltare. Non so cosa sia per lei — un ricordo, un dispetto, un orario. So che quando LEI si siede a tavola..." *(ve la mette in mano, e le sue mani adesso non tremano più)* "...voi suonate i vespri. E ditele che ve la manda il sesto del Settantaquattro."

Sulla porta, mentre uscite, aggiunge l'ultima cosa, quasi sottovoce:

> Don Michele: "Se vedete mio fratello Aldo — è in un ritratto, avrà vent'anni e la riga da una parte — ditegli che ho fatto il prete per sbaglio e il fratello per vocazione. Lui capisce."

**(Ottenute: MOKA e CAMPANELLA DEL 1974. Sangue freddo +2.)**`,
    item: 'moka',
    item2: 'campanella_1974',
    sets: { doni_don_michele: true },
    gold: 2,
    choices: [{ text: '⬆ Risalire, prima che la nebbia cambi idea', next: 'pp6' }],
  },

  pp6: {
    location: 'tornanti',
    caption: 'La risalita — la nebbia ha imparato',
    text: `Il corridoio nella nebbia è ancora lì. Più stretto.

All'andata ci passavate in cinque affiancati; adesso, a stento in due. E le pareti bianche non sono più ferme: **respirano**, dentro e fuori, e a ogni respiro il corridoio perde un centimetro. Il Belvedere ha capito dove siete andati. E ha capito, soprattutto, **cosa state riportando su.**

> Don Michele: *(dalla piazza, le mani a imbuto)* "CAMMINATE AL CENTRO! Non rispondete se vi chiama! E se vi tocca — NON È FREDDO, è solo PAURA, ripetetevelo!"

A metà salita, la nebbia vi chiama. Con la voce di Peppe che offre il caffè. Con la voce di Aldo che chiede del fratello. Con le voci di casa vostra — quelle a cui non si è mai abbastanza pronti.

Si cammina. Al centro. Insieme.`,
    choices: [
      { text: '🚶 Testa bassa e passo costante: guidare il gruppo attraverso', tag: 'Prova di Saggezza — CD 12', check: { stat: 'SAG', dc: 12, success: 'pp7', fail: 'pp6_ko' } },
      { text: '🏃 Di corsa, tutti insieme, contando i passi ad alta voce', tag: 'Prova di Costituzione — CD 12', check: { stat: 'COS', dc: 12, success: 'pp7', fail: 'pp6_ko' } },
    ],
  },

  pp6_ko: {
    location: 'tornanti',
    caption: 'La nebbia assaggia',
    text: `Qualcuno risponde.

È un attimo — una voce troppo simile a quella giusta, un *"aspetta"* detto col tono di casa — e un passo esce dal centro del corridoio. La nebbia non aspettava altro: un tentacolo bianco, delicato come un tovagliolo, avvolge il polso di chi ha risposto e **stringe.**

Le mani degli altri lo strappano indietro in un secondo — di nuovo, la disperazione coordinata delle famiglie vere — e il corridoio vi sputa fuori tutti e cinque, in ginocchio sulla ghiaia del Belvedere.

Ma il polso di chi ha risposto porta il segno: cinque dita bianche, fredde, che non se ne vanno.

**(Chi ha tirato è AVVELENATO dal freddo della nebbia — serve l'antidoto. -1 Sangue freddo.)**

> La voce di Don Michele: *(lontanissima, dalla valle)* "...VI AVEVO DETTO DI NON RISPONDERE!"`,
    poisonRoller: true,
    gold: -1,
    choices: [{ text: 'Dentro. Con quel che resta della dignità', next: 'pp7' }],
  },

  pp7: {
    location: 'hall',
    caption: 'Il rientro — Gregorio non ci crede',
    text: `Gregorio è nella hall, col candeliere, e quando vi vede entrare fa una cosa che in centoventicinque anni probabilmente non ha fatto mai: **resta senza parole.**

> Gregorio: "Siete... USCITI." *(conta, ricontra)* "E siete TORNATI. Di vostra volontà. Dentro." *(posa il candeliere, si siede sulle scale, e per un attimo è solo un uomo molto vecchio e molto stanco)* "Signori, in tutta la storia di questa casa, nessuno è mai tornato DENTRO potendo restare fuori. Siete magnifici. E completamente scemi. Le due cose, ho imparato quassù, viaggiano spesso insieme."

Poi vede la campanella. E il modo in cui la guarda — come si guarda una fotografia di famiglia in casa d'altri — vi dice che sa ESATTAMENTE cos'è.

> Gregorio: "I vespri di Don Michele." *(si rialza, si ricompone, maggiordomo di nuovo)* "Ada li ascolta ogni sera, sapete. Si ferma. Qualunque cosa stia facendo, alle otto, si ferma. Io fingo di non accorgermene da cinquant'anni: certe cose, tra la signora e il paese, non riguardano il personale."

Si avvia verso il corridoio, poi si volta:

> Gregorio: "Il sesto del Settantaquattro. Ditegli, quando tutto questo finisce... che suo fratello Aldo, nel ritratto, **sorride.** Sono io che spolvero le cornici: lo so per certo."

**(La pista di Pietrafonda è completa. Sangue freddo +1.)**`,
    gold: 1,
    sets: { pista_paese: true, un_nodo_sciolto: true },
    choices: [{ text: 'Al corridoio delle tre porte', next: 'h1' }],
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

> Natalino: *(massaggiandosi il collo)* "Ragazzi, punto della situazione: siamo chiusi in una dispensa per esseri umani, il maggiordomo immortale ci ha rimboccato le coperte, e domani ho due colori e una permanente. Quindi adesso usciamo di qua e sfasciamo tutto, va bene? VA BENE."

**(Tutti i PV e le abilità sono ripristinati. Chi era PRESO è di nuovo con voi. Riproverete lo scontro: stavolta, tattica.)**`,
    fullHeal: true,
    freeAll: true,
    choices: [{ text: '↩ Tornare là fuori e riprovare', next: 'RETRY_COMBAT' }],
  },

  /* ==================== APPROFONDIMENTI OPZIONALI ==================== */


  /* ==================== BLOCCO 1 — L'OSSARIO ====================
     Sotto la cantina, dietro la cella frigorifera del Banchetto: la
     sotto-cantina del 1899. Non ostile. Il Contabile è stanchissimo,
     non famelico. Aggancio suggerito: k5_dopo_chef (vedi report). */

  os1: {
    location: 'ossario',
    caption: 'Dietro il freezer del Banchetto',
    text: `Il freezer a pozzetto della cucina del Banchetto ha un pannello sul retro che non dovrebbe muoversi.

Si muove.

Dietro, non c'è il muro che ci si aspetterebbe da una villa liberty del 1899: c'è pietra **più vecchia**, tagliata a mano, annerita da un fuoco che non è quello del forno a legna. Un corridoio in discesa, basso, dove Federico deve chinarsi e ne fa un dramma degno del suo miglior cliente scontento.

> Federico: "Ok, informazione che nessuno mi aveva dato: sotto la cantina c'è un'ALTRA cantina. Chi lo sapeva? Perché non è nella brochure che ho corretto IO?"

> Gaetano: *(illuminando le pareti col telefono)* "Questa muratura non è del 1899. È più antica. Il relais non ha costruito sopra il niente: ha costruito sopra qualcos'altro che già c'era."

L'aria che sale dal basso non è fredda come sopra: è **ferma**, densa, con un odore di cera vecchia e carta ingiallita — un ufficio, non una tomba. In fondo al corridoio, il bagliore tremolante di una candela che nessuno, stasera, ha acceso.

> Natalino: "Ragazzi, ho fatto la cresima, due diciottesimi di cugini e un funerale, ma questo è il colloquio di lavoro più assurdo della mia vita. E ci vengo comunque, perché sono un cretino curioso."

**(Sangue freddo +1: siete scesi comunque. Flag: sceso nell'ossario.)**`,
    gold: 1,
    sets: { sceso_ossario: true },
    choices: [{ text: 'Scendere fino in fondo', next: 'os2' }],
  },

  os2: {
    location: 'ossario',
    caption: 'Le tacche originali del 1899',
    text: `Il corridoio finisce in una stanza tonda, bassa, con la pietra incisa dal pavimento al soffitto: **tacche.** Migliaia. A gruppi di cinque, come al pozzo — ma qui sono più profonde, irregolari, fatte con qualcosa che non era uno scalpello. Un'unghia. Un coltello da cucina. La disperazione, quando ci si mette, **taglia la pietra.**

Sono le tacche originali. Quelle del pozzo, capite guardando queste, non hanno inventato niente: hanno solo copiato il metodo di chi lo inventò la prima notte, nel 1899, per non perdere il conto di quanti mancavano.

> Claudia: *(la torcia che trema appena)* "Contiamole. Il primo gruppo. Quello di Gregorio."

Sei tacche, in alto, più vecchie di tutte le altre. Cinque sono attraversate da un taglio netto, come si fa quando un conto è chiuso. La sesta no. La sesta è ancora **aperta**, netta, in attesa, esattamente come una firma che manca.

> Emanuela: *(piano)* "Centoventicinque anni e la sua tacca è ancora lì. Aperta. Gregorio non ha mai chiuso il conto — nemmeno il SUO."

Nessuno ha una battuta pronta per questa. Perfino Natalino resta zitto un secondo di più del solito.

**(Flag: la tacca di Gregorio, ancora aperta. Sangue freddo +1.)**`,
    gold: 1,
    sets: { tacca_di_gregorio: true },
    choices: [{ text: 'Proseguire nella sotto-cantina', next: 'os3' }],
  },

  os3: {
    location: 'ossario',
    caption: 'I bagagli mai ritirati',
    text: `La stanza successiva è un deposito bagagli che nessun hotel al mondo dovrebbe avere: valigie impilate per epoca, ognuna con un cartellino di riconsegna mai staccato.

**1924:** bauli di cuoio con adesivi sbiaditi — Capri, Positano, un Grand Tour da signori. **1949:** una valigia di cartone rigido legata con lo spago, un mazzo di carte incastrato nella fibbia. **1974:** uno zaino tie-dye con le toppe cucite a mano, un fiore di stoffa ancora appuntato. **1999:** uno zaino Invicta, quello con la sagoma dell'alpinista, identico a uno che qualcuno di voi ha ancora in soffitta a casa.

> Claudia: *(la voce che si incrina per un attimo)* "Quello zaino ce l'avevo anch'io. Quello ESATTO."

E poi, vicino alla porta, in un angolo tenuto libero apposta, **cinque valigie nuove.** Pulite. Etichette moderne. Della marca che avete voi, tutti e cinque, parcheggiata al piano di sopra nelle vostre camere.

> Natalino: *(la voce piatta, per una volta senza battute)* "Ragazzi. Quelle sono un modello uscito quest'anno. La casa non le ha rubate. La casa se le è... **preparate.**"

Nessuno tocca niente. Si esce da quella stanza come si esce da un funerale: in silenzio, senza girarsi.

**(Flag: visti i bagagli mai ritirati. -1 Sangue freddo — sapere fa male.)**`,
    gold: -1,
    sets: { bagagli_visti: true },
    choices: [{ text: 'Avanti, verso la luce della candela', next: 'os4' }],
  },

  os4: {
    location: 'ossario',
    caption: 'Il Contabile',
    text: `L'ultima stanza è un ufficio. Un tavolo di legno scuro, una candela vera (questa sì, accesa da qualcuno), e dietro il tavolo, in maniche di camicia, con le bretelle ancora allacciate e il colletto slacciato come chi ha finito il turno e non è mai più riuscito ad alzarsi: **uno scheletro.** Seduto composto. Una penna d'oca in una mano d'ossa, un librone apertissimo davanti.

Non si volta di scatto. Non ha bisogno di scatti: alza gli occhi (che non ha, ma il gesto è quello) e vi guarda con una stanchezza che attraversa il vestito, le ossa, il secolo.

> Il Contabile: "Ah. Ospiti. Fate presto, se potete: sono indietro con la contabilità da... be', da centoventicinque anni, a essere sinceri. Cinque presi nel '99, cinque nel '74... i conti non tornano MAI, e io sono quello che deve farli tornare." *(intinge la penna, senza scrivere)* "Lo Chef, di sopra, è mio fratello minore. Fa più rumore di me perché lavora ancora con le mani. Io lavoro solo con la testa. È peggio."

Sul tavolo, tra le carte, un **Libro Mastro** rilegato in pelle scura, chiuso con un lucchetto piccolo, ridicolo, quasi domestico.

> Il Contabile: "Non ve lo mostro gratis. Non per malizia: per ABITUDINE. Centoventicinque anni di 'niente gratis' lasciano il segno anche su chi non ha più pelle."`,
    choices: [
      { text: '☕ Offrirgli la moka di Don Michele, ancora calda', requires: { item: 'moka' }, removeItem: 'moka', next: 'os5' },
      { text: '🗣 Sedersi e basta: parlargli, senza doni, come si fa con un collega a fine turno', next: 'os6' },
    ],
  },

  os5: {
    location: 'ossario',
    caption: 'Il Libro Mastro',
    text: `Il Contabile guarda la moka come un uomo affogato guarda una corda. La prende con due dita d'osso, quasi tremando, e se la porta a un naso che non ha — e ANNUSA. Davvero, annusa.

> Il Contabile: "Caffè. Vero. Da centoventicinque anni mi offrono solo vino che non voglio bere e sale che non mi serve." *(posa la moka con una cura assurda, come una reliquia)* "Per questo, vi mostro il Libro."

Il lucchetto si apre da solo, come tutto in questa casa. Le pagine sono colonne di numeri: presi, mancanti, saldi, deficit. Nell'ultima colonna, sotto una data di stasera già scritta, il totale è in rosso.

> Il Contabile: "Il patto è in PERDITA. Da generazioni. Ogni venticinque anni la casa prende cinque persone e ne riceve, in cambio, solo PAURA — che si consuma in una notte e non nutre niente. Nessuno, capite, l'ha mai nutrita di quello che vuole VERAMENTE: presenze felici. Gente che resta perché VUOLE, non perché è stata contata." *(richiude il libro, piano)* "Ve lo dico perché siete i primi, in centoventicinque anni di colonne, a offrirmi un caffè invece di un'offerta. Prendete questa." *(spinge sul tavolo una lanterna d'ottone annerita)* "Le creature di sopra la rispettano. Non chiedetemi perché contabile e rispetto vadano insieme: è l'unica cosa bella che ho imparato qui sotto."

**(Segreto: il patto è in perdita — la casa ha fame perché nessuno l'ha mai nutrita di gioia vera. Flag: segreto_contabile. Sangue freddo +3.)**`,
    item: 'lanterna_1899',
    gold: 3,
    sets: { segreto_contabile: true, contabile_visto: true },
    choices: [{ text: 'Salutarlo con rispetto e risalire', next: 'os6' }],
  },

  os6: {
    location: 'ossario',
    caption: 'Il saluto del Contabile',
    text: `Che abbiate portato il caffè o solo la vostra compagnia, il Contabile a un certo punto smette di scrivere e resta fermo, la penna appoggiata, come chi si concede una pausa che aspettava da un secolo.

> Il Contabile: "Sapete qual è la cosa più strana di questo lavoro? Nessuno viene MAI a salutarmi. Vengono presi, o vengono a prendere qualcosa. Voi siete i primi che si sono seduti."

Con un gesto lento — le ossa che scricchiolano, ma con garbo, come articolazioni che si scusano — apre un cassetto e ne tira fuori una **lanterna d'ottone**, annerita, il vetro fumé.

> Il Contabile: "Prendetela. Le creature di sopra la conoscono da centoventicinque anni: non la temono, la RISPETTANO. C'è una bella differenza, in questa casa, tra le due cose. E se incontrate mio fratello di nuovo... ditegli che il caffè, quaggiù, un giorno arriva anche a lui."

Vi accompagna fino al corridoio in salita con la candela in mano, e sulla soglia, prima di tornare al suo tavolo e ai suoi conti eterni, aggiunge una cosa che nessuno di voi si aspettava da uno scheletro seduto:

> Il Contabile: "Buona fortuna, ragazzi. Fatemi tornare i conti in positivo, per una volta."

**(Oggetto: LANTERNA DEL 1899. Sangue freddo +1.)**`,
    gold: 1,
    sets: { ossario_visitato: true },
    item: 'lanterna_1899',
    choices: [{ text: 'Su, verso il corridoio delle tre porte', next: 'h1' }],
  },

  /* ==================== BLOCCO 2 — LA SOFFITTA ====================
     Sopra il piano proibito: il telescopio puntato sulla piscina, le
     casse di Gregorio e Ada, il nido dei ritratti vuoti. 1 scontro
     evitabile con 'ritratto'. Aggancio suggerito: una quarta scelta
     in u1 (vedi report). */

  sf1: {
    location: 'soffitta',
    caption: 'La botola della soffitta',
    text: `In fondo al corridoio del piano proibito, oltre l'ultima porta con targhetta, il soffitto ha una botola che nessuno aveva notato entrando — perché, giurereste, non c'era.

Una scaletta a pioli arrugginita scende (sale?) da lì. Claudia, che nota tutto, nota anche questo:

> Claudia: "La polvere sui pioli è mossa. Qualcuno ci è salito. Di recente. O qualcuno ci scende. Spesso."

Su, l'aria cambia ancora: meno "casa vecchia sotto la casa nuova" e più semplicemente **soffitta**, con quell'odore secco di legno e stoffa che hanno tutte le soffitte del mondo, ovunque siano. Una finestra rotonda, tipo occhio di bue, lascia entrare la luce lunare a fette. Casse impilate, coperte da lenzuoli, e in mezzo alla stanza, montato su un treppiede d'ottone lucidissimo — **lucidissimo, mentre tutto il resto è polvere** — un telescopio.

Puntato non verso il tetto, non verso il cielo. Punta **giù**, attraverso un'asola tagliata apposta nel pavimento, verso qualcosa al piano di sotto.

> Gaetano: *(gli occhi già accesi di curiosità scientifica pura, la paura per un attimo in secondo piano)* "Un telescopio puntato IN BASSO. Questo è il primo dato di stasera che mi fa venire voglia di prendere appunti invece che scappare."

**(Sangue freddo +1: la curiosità, stasera, è anche coraggio.)**`,
    gold: 1,
    choices: [{ text: 'Guardare dentro il telescopio', next: 'sf2' }],
  },

  sf2: {
    location: 'soffitta',
    caption: 'Il telescopio puntato sulla piscina',
    text: `Gaetano si china sull'oculare con la concentrazione di chi calibra un satellite, e per una volta nessuno lo interrompe: persino Natalino capisce che questo non è il momento delle battute.

L'asola nel pavimento inquadra, con una precisione impossibile per un tubo d'ottone del secolo scorso, la **piscina**, due piani più in basso, turchese e fumante nella notte.

> Gaetano: "È a fuoco perfetto. Troppo perfetto. Questo strumento non dovrebbe... okay, non pensiamoci. Guardate qua: si vede il riflesso della luna sull'acqua."

Il riflesso è rosso. Non del rosso caldo di una luna basso sull'orizzonte: di un rosso **umido**, che pulsa piano, con un ritmo che non è quello delle onde.

> Claudia: *(che si è fatta passare l'oculare senza chiedere il permesso, da brava fotografa che non si fida di occhi non suoi)* "Gaetano. Quella non è la luna."

Non lo è. Guardando meglio — e nessuno di voi vorrebbe guardare meglio, ma lo fate — il riflesso rosso ha un contorno. Una pupilla verticale, stretta, che nell'increspatura dell'acqua sembra **muoversi**, orientarsi, come qualcosa che sta cercando la messa a fuoco esattamente come avete fatto voi.

Sta guardando in alto. Verso il telescopio. Verso voi.

**(Rivelazione: la luna rossa nella piscina non è una luna. È un occhio. Flag: visto_occhio. Sangue freddo +2.)**`,
    gold: 2,
    sets: { visto_occhio: true },
    choices: [{ text: 'Staccarsi dall\'oculare e continuare a esplorare la soffitta', next: 'sf3' }],
  },

  sf3: {
    location: 'soffitta',
    caption: 'Le casse di Gregorio e Ada',
    text: `Sotto i lenzuoli, le casse custodiscono una vita che nessuno di voi immaginava per un uomo in completo di lino color tortora: la vita **prima** del 1899.

Un abito da sposa, ingiallito ma piegato con una cura che ha resistito a un secolo, la seta ancora profumata di qualcosa di floreale che il tempo non è riuscito a portare via del tutto. Un fascio di lettere legate con lo spago: due grafie, una elegante e maschile, una femminile e fitta — la grafia di Ada, la stessa del registro, la stessa dei cartellini dell'orto.

E sotto tutto, un rotolo di disegni tecnici ingialliti: il progetto, mai realizzato, di un **ampliamento del Belvedere.** Una manica nuova, più stanze, un disegno a matita di bambini che giocano in un prato che nel 1899 non esisteva ancora.

In cima al foglio, la scritta di Gregorio: *"Per le famiglie. Quando avremo tempo."*

> Emanuela: *(le lettere in mano, la voce che si spezza appena)* "Non hanno mai avuto tempo. Hanno firmato il patto tre mesi dopo questo disegno."

> Federico: *(per una volta, senza una battuta pronta)* "...cazzo."

Nessun'altra parola sembra adatta. Le lettere finiscono nello zaino con un rispetto che la notte, finora, non aveva ancora richiesto.

**(Oggetto: LETTERE DI GREGORIO E ADA. Sangue freddo +1.)**`,
    item: 'lettere_1899',
    gold: 1,
    sets: { lettere_lette: true },
    choices: [{ text: 'In fondo alla soffitta c\'è ancora un angolo buio da controllare', next: 'sf4' }],
  },

  sf4: {
    location: 'soffitta',
    caption: 'Il nido dei ritratti vuoti',
    text: `L'angolo più buio della soffitta non è buio per caso: qualcosa ci ha ammassato, in centoventicinque anni, decine di **cornici vuote.** Tele bianche, senza un pennello che le abbia mai toccate, impilate in cerchio come un nido — un nido costruito da chi aspetta ancora di essere dipinto dentro.

Al centro del nido, tre cornici sono leggermente diverse: la tela dentro non è bianca. È **quasi** un dipinto — un'ombra di colore, un accenno di forma umana, come una fotografia che si sta sviluppando da un secolo e non finisce mai.

> Gaetano: *(sottovoce)* "Sono i ritratti del '74. Quelli mancanti. Il quadro finale non l'hanno mai finito perché... perché non li avevano ancora presi tutti."

Le cornici, ad un tratto, **tremano.** Non per il vento — in soffitta non c'è vento — ma per qualcosa dentro che, sentendosi osservato, si sveglia.

*(Chi si muove con attenzione, senza far scricchiolare le assi, può ritirarsi prima che le cornici finiscano di svegliarsi.)*`,
    choices: [
      { text: '🤫 Ritirarsi con calma assoluta, un passo alla volta', tag: 'Prova di Destrezza — CD 12', check: { stat: 'DES', dc: 12, success: 'sf6', fail: 'sf5' } },
      { text: '👁 Restare a guardare: forse capiscono che non siete nemici', tag: 'Prova di Saggezza — CD 12', check: { stat: 'SAG', dc: 12, success: 'sf6', fail: 'sf5' } },
    ],
  },

  sf5: {
    location: 'soffitta',
    caption: 'I ritratti si svegliano — SCONTRO',
    text: `Non funziona. Un'asse scricchiola, o forse è solo che questa casa aspettava una scusa: le cornici si aprono con un suono di tela che si strappa dal proprio stesso quadro, e ne escono forme umane fatte di colore ancora fresco, gli occhi due macchie scure che non hanno ancora deciso dove guardare.

> Uno dei ritratti: *(una voce impastata, come pittura che parla)* "...compagnia. FINALMENTE."

*(Sono creature della villa: Colpo di Phon e sale fanno danni doppi. Sono lente ma tenaci — non lasciatevi circondare tra le casse.)*`,
    combat: {
      enemies: ['ritratto', 'ritratto'],
      victory: 'sf6',
      defeat: 'x_celle',
      loot: { gold: 1 },
    },
  },

  sf6: {
    location: 'soffitta',
    caption: 'Giù dalla soffitta',
    text: `Che siate riusciti a ritirarvi in silenzio o che abbiate appena finito di respingere due tele con troppa voglia di compagnia, la soffitta torna quieta nello stesso modo in cui era quieta prima: **in attesa.**

Scendendo, l'ultima cosa che si vede, voltandosi, è il telescopio d'ottone — ancora puntato giù, verso l'asola nel pavimento, verso la piscina, verso quell'occhio rosso che, per quanto ne sapete, non ha MAI smesso di guardare in su.

> Natalino: *(richiudendo la botola con un tonfo un po' più forte del necessario)* "Ok. Da stasera, quando faccio il bagno, mi vesto anche in acqua. Punto."

Nessuno ride, ma tutti, per un secondo, immaginano di farlo.

**(La soffitta non ha più segreti. Meglio tornare al corridoio del piano proibito.)**`,
    choices: [{ text: 'Giù, al corridoio delle tre porte', next: 'h1' }],
  },

  /* ==================== BLOCCO 3 — STANZA 1949 ====================
     Piano proibito, porta con targhetta "1949": i reduci, la radio a
     valvole, la mano di scopa interrotta. Aggancio: quinta scelta in
     u1 (porta "1949"). */

  s49_1: {
    location: 'camera',
    caption: 'Stanza 1949 — il notiziario in loop',
    text: `La porta con la targhetta "1949" si apre su una stanza in penombra color seppia, e la prima cosa che arriva non è un'immagine: è un **suono.** Una radio a valvole, sul comò, trasmette un notiziario con la voce impostata di un altro secolo — e lo trasmette in loop, sempre lo stesso, da settantacinque anni.

*"...12 agosto 1949. Il Presidente ha ricevuto... si segnalano temporali sull'Appennino... la ricostruzione procede..."* Poi un fruscio, e ricomincia da capo.

Attorno a un tavolino rotondo, cinque sedie. Su quattro, seduti in giacca e camicia come reduci in libera uscita, ci sono **quattro uomini fermi**, immobili, con le carte in mano e gli occhi chiusi — non morti, capite guardando bene: **in pausa.** Come un film fermato a metà fotogramma.

Sul tavolo, davanti alla quinta sedia vuota, una mano di scopa **interrotta a metà.** Le carte sono ancora scoperte, in attesa di chi le completi.

> Emanuela: *(piano, con la delicatezza che riserva ai clienti anziani)* "Sono i reduci del '49. Il gruppo dopo Gregorio. Sembra... malinconico, più che spaventoso."

> Federico: "Fino a prova contraria. Diamo tempo alla serata."`,
    choices: [{ text: 'Sedersi al posto vuoto e finire la mano', next: 's49_2' }],
  },

  s49_2: {
    location: 'camera',
    caption: 'La mano interrotta',
    text: `Chi si siede al posto vuoto sente il legno della sedia ancora tiepido — settantacinque anni, e ancora tiepido — e la mano di scopa, guardata da vicino, è più complicata di quanto sembrasse: bisogna contare i denari già calati, ricordare chi ha preso l'ultima presa, capire quale carta chiude il conto senza rubare la scopa a chi, tra i quattro fermi, l'aveva già quasi in mano.

I quattro reduci non si muovono. Ma **aspettano.** Si sente, nell'aria, la stessa tensione di un tavolo vero, di un bar vero, di un venerdì sera vero.

> La radio, sotto: *"...si segnalano temporali sull'Appennino..."*

*(Prova di Intelligenza — CD 12: contare bene le carte residue e chiudere la mano nel modo giusto.)*`,
    choices: [
      { text: '🃏 Calcolare la mano con attenzione: contare, ricordare, chiudere', tag: 'Prova di Intelligenza — CD 12', check: { stat: 'INT', dc: 12, success: 's49_3', fail: 's49_3_ko' } },
    ],
  },

  s49_3: {
    location: 'camera',
    caption: 'Scopa!',
    text: `La carta giusta scende sul tavolo con un colpetto secco, e per un istante — un istante solo — i quattro reduci **aprono gli occhi insieme** e sorridono, non di un sorriso dipinto o storto: di un sorriso vero, da tavolo di bar, da partita vinta bene.

> Uno dei reduci: *(la voce che arriva da lontano, come da una radio tra due stazioni)* "Bella mano, ragazzo. Bella mano, ragazza. Non ci giocava nessuno con noi da... be'. Da un bel po'."

Poi richiudono gli occhi, tornano fermi, e la radio, sotto, per un secondo — UN secondo — cambia notiziario: *"...e i migliori auguri a chi gioca ancora onestamente."* Poi torna al 12 agosto 1949 come se niente fosse.

Sul tavolo, dove prima c'erano le carte, resta un solo asso, appoggiato in bella vista.

> Natalino: *(intascandolo con la delicatezza di chi ha appena vinto una scommessa che non sapeva di aver fatto)* "Un asso di denari da un morto che gioca bene a scopa. Se questa non è la serata più napoletana della mia vita, non so cosa lo sia."

**(Oggetto: ASSO DI DENARI. Sangue freddo +2.)**`,
    item: 'asso_di_denari',
    gold: 2,
    sets: { carte_1949_vinte: true },
    choices: [{ text: 'Chiudere la porta con rispetto e tornare al corridoio', next: 's74_1' }],
  },

  s49_3_ko: {
    location: 'camera',
    caption: 'Mano sbagliata',
    text: `La carta scelta è quasi giusta — quasi — e "quasi giusta", a scopa, vuol dire che si prende la presa sbagliata. I quattro reduci non si arrabbiano: semplicemente, per un istante, **scuotono la testa**, tutti insieme, con la delusione paziente di chi ha visto perdere generazioni di nipoti alle carte.

> Uno dei reduci: *(la voce lontana, quasi tenera)* "Ci vuole più attenzione, ragazzo. Ma la volontà c'era. Va bene lo stesso."

La radio, sotto, non cambia notiziario. Continua il suo 12 agosto 1949, indifferente, eterna. I quattro tornano fermi, immobili, in attesa del prossimo che si sederà a quel tavolo — chissà quando, chissà chi.

Non c'è nessun regalo, stavolta. Solo la sedia che torna a raffreddarsi, e una strana malinconia che nessuno del gruppo si aspettava di sentire per quattro sconosciuti morti da settantacinque anni.

> Claudia: *(uscendo, la voce bassa)* "Speravo tanto vincessimo. Per loro, dico. Più che per noi."

**(Nessun oggetto — ma la partita l'avete giocata con onore. Sangue freddo +1.)**`,
    gold: 1,
    sets: { carte_1949_perse: true },
    choices: [{ text: 'Chiudere la porta con rispetto e tornare al corridoio', next: 's74_1' }],
  },

  /* ==================== BLOCCO 3b — STANZA 1974 ====================
     Piano proibito, porta con targhetta "1974": la comune hippy, il
     nastro dell'ultima registrazione. Aggancio: sesta scelta in u1
     (porta "1974") — qui collegata anche in coda a s49_3/s49_3_ko
     per comodità di sequenza, il flusso reale lo decide chi cabla. */

  s74_1: {
    location: 'camera',
    caption: 'Stanza 1974 — la comune',
    text: `Se la stanza del '49 è malinconica, quella del '74 è **psichedelica e inquietante insieme**, il che è un tono che nessuno di voi aveva ancora provato stasera. Manifesti alle pareti — pace, fiori, un sole con la faccia sorridente che a guardarlo bene sorride un po' troppo largo. Una chitarra acustica appoggiata a una poltrona a sacco sgonfia. L'odore di incenso, ancora acceso da qualche parte, dolciastro e vecchio.

Il gruppo del '74, capite dai poster e dagli appunti sparsi, non era un gruppo di amici in vacanza come gli altri: era una **comune**, arrivata al Belvedere apposta, convinta di poter "liberare la casa con l'amore". C'è un manifesto scritto a mano, tra i fiori disegnati: *"L'AMORE SCIOGLIE OGNI PATTO — venite a liberare Villa Belvedere, 10-25 agosto 1974."*

> Gaetano: "Sono venuti apposta. Non in vacanza: in missione."

> Natalino: "E hanno prenotato comunque cinque notti. Ottimisti fino alla fine, questi."

In un angolo, su un mangianastri a pile ancora inserite, una cassetta senza custodia aspetta di essere premuta.

**(Sangue freddo +1: la curiosità, anche qui, vince sulla paura.)**`,
    gold: 1,
    choices: [{ text: 'Premere PLAY sul mangianastri', next: 's74_2' }],
  },

  s74_2: {
    location: 'camera',
    caption: 'L\'ultima registrazione',
    text: `Il nastro parte con un fruscio, poi delle voci — giovani, allegre, sicure di sé in un modo che solo il 1974 sapeva essere sicuro di sé — che intonano un canto sull'accordatura più strana che abbiate sentito: non stonata per errore, stonata **apposta**, come se qualcuno avesse cercato una frequenza che le orecchie umane non userebbero mai per cantare, ma che qualcos'altro, in questa casa, avrebbe ascoltato volentieri.

> Voce dal nastro (una ragazza, ridendo): *"Ok, ok, registriamo l'ultima. Se funziona, domani la casa è libera e noi siamo gli eroi di Woodstock d'Irpinia."*

> Voce dal nastro (un ragazzo): *"E se non funziona?"*

> Voce dal nastro (la ragazza, dopo una pausa che il nastro conserva fedelmente): *"...allora almeno abbiamo cantato bene."*

Il canto continua per un altro minuto, poi si interrompe di netto — non un fruscio, non un finale: un **taglio secco**, come una forbice sul nastro stesso. Silenzio.

> Emanuela: *(spegnendo il mangianastri con rispetto)* "Non hanno mai finito di registrare il ritornello."

> Claudia: "Ma l'accordatura... l'hanno trovata. Si sente. È strana, ma... calma. Anche a me, e sto tremando da un'ora."

**(Flag: sentita l'ultima registrazione del '74. Sangue freddo +2.)**`,
    gold: 2,
    sets: { nastro_1974_ascoltato: true },
    choices: [{ text: 'Prendere la cassetta e portarla con voi', next: 's74_3' }],
  },

  s74_3: {
    location: 'camera',
    caption: 'La cassetta',
    text: `La cassetta esce dal mangianastri con un clic che suona quasi come un permesso concesso. Sull'etichetta, la stessa grafia allegra della ragazza che rideva nella registrazione: *"ULTIMA — se qualcuno la trova, suonatela a chi ha paura. Funziona anche per quello."*

Nessuno del gruppo del '74 è mai uscito da questa stanza per l'ultima volta a piedi propri, questo lo sapete già senza bisogno che ve lo dica nessuno. Ma quell'accordatura strana, quasi stonata apposta, l'hanno trovata DAVVERO — si sente ancora nell'aria, un ronzio bassissimo che il corpo registra prima delle orecchie, e che lascia, invece di paura, una calma innaturale ma benvenuta.

> Federico: *(intascando la cassetta con più cura di quanta metta di solito nei suoi contratti)* "Cinque hippy che hanno provato a fregare una casa maledetta con una canzone. Sapete cosa? Rispetto assoluto. Anche se ha funzionato a metà."

> Natalino: "A metà è meglio di niente, stronzo mio. Stanotte prendiamo anche la metà."

**(Oggetto: NASTRO DEL '74. Sangue freddo +1.)**`,
    item: 'nastro_1974',
    gold: 1,
    sets: { stanza_1974_visitata: true },
    choices: [{ text: 'Chiudere la porta e tornare al corridoio', next: 'h1' }],
  },

  /* ==================== BLOCCO 4 — SCENE DEL CUORE ====================
     Momenti 1-a-1, opzionali, durante la notte. Aggancio: tre scelte
     "once" in h1, che Gali aggiungerà a mano (vedi report). */

  cuore_gc: {
    location: 'giardino',
    caption: 'Gaetano e Claudia — il balcone',
    text: `Si allontanano dal gruppo con la scusa più debole del mondo — "controlliamo se da qui c'è campo" — e nessuno li ferma, perché a volte una scusa debole è solo un modo educato di chiedere due minuti da soli.

Il balcone della Camera dei Melograni guarda la valle, la nebbia ferma al confine come una promessa che qualcuno, chissà chi, ha deciso di mantenere. Gaetano si appoggia alla ringhiera con le braccia incrociate, la faccia di chi sta elaborando dati che non gli tornano.

> Gaetano: "Claudia. Stanotte la scienza non basta. Ho passato un'ora a cercare una spiegazione razionale per un maggiordomo che perde ciocche di capelli come un orologio che scarica la batteria, e non ce l'ho. Non c'è. E questo... questo mi fa più paura del mostro."

> Claudia: *(prendendogli la mano, senza il minimo sarcasmo, per la prima volta stasera)* "Lo so. Ti ho visto la faccia mentre lo dicevi."

> Gaetano: "Ho paura, Claudia. Vera. Non 'gestita', non 'analizzata'. Paura."

Lei non risponde con una battuta. Alza il telefono — la fotocamera, non i social, tanto qui non c'è campo comunque — e scatta.

> Claudia: "Così, quando saremo vecchi, ti ricordo che una volta hai avuto torto. E che ti è andata bene lo stesso avermi vicino."

Non dice altro. Non ce n'è bisogno: si tengono per mano guardando la nebbia che non entra, per un minuto intero, prima di tornare dagli altri.

**(Sangue freddo +2: la paura condivisa pesa meno. Flag: cuore_gc.)**`,
    gold: 2,
    sets: { cuore_gc: true },
    choices: [{ text: 'Tornare dagli altri', next: 'h1' }],
  },

  cuore_fe: {
    location: 'camera',
    caption: 'Federico e Emanuela — la Camera del Glicine',
    text: `Federico si siede sul bordo del letto con la faccia di chi ha finalmente smesso di vendere qualcosa — nemmeno a se stesso.

> Federico: "Emanuela. Scusami. Ho prenotato IO questo posto. 'Cinque stelle, un affare', ho detto. Ho pure scritto la brochure, cazzo. Se stanotte finisce male, la colpa è tutta—"

> Emanuela: *(interrompendolo, senza alzare la voce)* "Fede. Se avessi saputo che questo posto era pieno di gente morta, sarei venuta lo stesso. Con te vado ovunque, anche in un posto orribile con le cinque stelle finte. Soprattutto lì, forse."

Lui la guarda come se non si aspettasse una risposta così semplice a una colpa che si stava costruendo così complicata. Emanuela, intanto, ha già la borsa in grembo — quella infinita, quella di cui nessuno ha mai visto il fondo — e ne tira fuori, con la naturalezza di chi pesca le chiavi di casa, **la cosa più assurda e perfetta della serata.**

> Emanuela: "Ecco. L'avevo presa per scherzo, in tabaccheria, prima di partire."

Nella sua mano, un piccolo ferro di cavallo di plastica dorata, di quelli da portachiavi da due euro, con scritto: *"PORTA FORTUNA — Made in China".*

> Federico: *(scoppiando a ridere, la prima risata vera da ore)* "Emanuela. Amore mio. Questo ci salverà la vita."

> Emanuela: "Non lo so. Ma intanto ci ha fatto ridere due minuti. Stanotte, prendiamo pure quello."

**(Sangue freddo +2. Flag: cuore_fe.)**`,
    gold: 2,
    sets: { cuore_fe: true },
    choices: [{ text: 'Restare ancora un momento così', next: 'cuore_fe_esito' }],
  },

  cuore_fe_esito: {
    location: 'camera',
    caption: 'Il ferro di cavallo',
    text: `Restano un momento in silenzio, il ferro di cavallo di plastica appoggiato sul comodino come un trofeo assurdo, e per la prima volta da quando sono arrivati al Belvedere nessuno dei due ha bisogno di dire niente di intelligente, di rassicurante, di professionale.

> Emanuela: *(appuntandoglielo al collo della camicia, come una spilla)* "Tienilo addosso. Ti dà un'aria ridicola che ti serviva."

> Federico: "Ridicolo e vivo è il mio nuovo obiettivo di carriera."

Si baciano, brevemente, senza tragedia — solo due persone che si vogliono bene e per un minuto hanno deciso che la casa maledetta può aspettare fuori dalla porta. Poi Emanuela richiude la borsa con uno scatto secco, professionale, e torna la donna che tiene in piedi il gruppo.

> Emanuela: "Ok. Basta romanticismo, dobbiamo tornare dagli altri prima che Natalino inventi una teoria assurda senza di noi."

Escono mano nella mano, il ferro di cavallo che tintinna piano a ogni passo — l'unico rumore ridicolo e vivo in una casa che di rumori ridicoli non ne fa mai.

**(Il momento è passato, ma resta. Nessun altro effetto: solo cuore.)**`,
    choices: [{ text: 'Tornare dagli altri', next: 'h1' }],
  },

  cuore_nat: {
    location: 'camera',
    caption: 'Natalino, solo, alla finestra del Pozzo',
    text: `Natalino torna nella sua camera — quella "singolare", quella con la finestra sul pozzo — con la scusa di andare a prendere un cambio, e invece si ferma alla finestra e ci resta.

La corda del pozzo, di sotto, è tesa come sempre. Ma stasera, per la prima volta, Natalino non ha paura di parlarle.

> Natalino: "Ehi. Tu. La signora del pozzo. Lo so che mi senti, la casa sente sempre tutto." *(si siede sul davanzale, le gambe fuori, la sigaretta che non fuma da anni tenuta in mano solo per il gesto)* "Volevo dirti una cosa da uomo a... a quello che sei. Tu almeno c'hai un pozzo tuo. Un posto che ti aspetta, che ti tiene il posto, che nessuno ti toglie mai. Io c'ho un bilocale in affitto a Napoli e un coinquilino che lascia sempre i piatti sporchi. Fai un po' il conto di chi sta peggio."

Nessuna risposta, per un lungo momento. Poi, dal fondo del giardino, un suono piccolo: la corda che si tende una volta, poi si allenta — come una risata trattenuta.

> Natalino: *(sorridendo, da solo, nel buio)* "Ecco. Vedi che ci capiamo."

Due che la solitudine la conoscono davvero, per una volta, non hanno bisogno di spiegarsela a vicenda.

**(Sangue freddo +2. Flag: cuore_nat.)**`,
    gold: 2,
    sets: { cuore_nat: true },
    choices: [{ text: 'Restare un altro minuto alla finestra', next: 'cuore_nat_esito' }],
  },

  cuore_nat_esito: {
    location: 'camera',
    caption: 'La risposta del pozzo',
    text: `Natalino sta per rientrare quando la corda, di sotto, si muove ancora — non a strappi, questa volta: **piano**, dolce, come una mano che accarezza una testa senza volerla svegliare.

E poi, chiarissima, arriva una voce. Non dal pozzo: **da vicino**, come se qualcuno si fosse seduto sul davanzale accanto a lui senza far rumore.

> La voce di Ada: *"...single per scelta, hai detto a Gregorio. Anche io, alla fine, l'ho scelto. O forse me l'hanno fatto scegliere. Non fa differenza, dopo un po'."* *(una pausa, quasi affettuosa)* *"Tienilo, il bilocale. Coi piatti sporchi. È più di quello che ho io."*

Natalino non risponde subito. Quando lo fa, la voce gli trema solo un pochino — il minimo indispensabile per un uomo che ha fatto della battuta pronta un mestiere.

> Natalino: "Se un giorno usciamo da qui vive, ti giuro che ti mando una cartolina. Con la faccia di Capri sopra, pure se sono stato solo qui."

Nessuna risposta, ma la corda, scendendo verso il buio, per un attimo sembra **salutare.**

**(Nessun altro effetto meccanico. Solo un pezzo di notte che resterà.)**`,
    choices: [{ text: 'Tornare dagli altri, con gli occhi un po\' lucidi', next: 'h1' }],
  },

  /* ==================== BLOCCO 5 — IL GARAGE ====================
     La rimessa dell'auto, motore appeso al muro come un trofeo.
     Prova DES per recuperare pezzi senza far cadere tutto. Aggancio
     suggerito: una scelta in b2_orto, prima del pozzo (vedi report). */

  gr1: {
    location: 'garage',
    caption: 'La rimessa — il motore in bacheca',
    text: `Oltre l'orto di Ada, una porta di legno tarlato che nel pomeriggio nessuno aveva notato conduce a una rimessa di pietra — fresca, ordinata, con un odore di olio motore e cera per mobili che non dovrebbero mai stare nella stessa frase.

Dentro, la vostra macchina non è parcheggiata. È **smontata.** Il motore è appeso al muro come un trofeo di caccia, i pezzi separati e disposti con la precisione di un museo, ognuno su una targhetta d'ottone incisa a mano: *"Carburatore — gruppo 2024." "Testata — gruppo 2024." "Candela n°3 — gruppo 2024."*

> Gaetano: *(la voce che sale di un'ottava, tra l'orrore e l'indignazione tecnica)* "Quella... quella è la MIA macchina. È il MIO motore. L'ho smontato IO, una volta, per un tagliando. So esattamente come deve stare quella guarnizione, e non sta così!"

Accanto, altre due bacheche più vecchie: un motore di **Bianchina** targato "gruppo 1974" e uno di **Panda** targato "gruppo 1999", entrambi smontati con la stessa cura museale, entrambi immobili da decenni sotto un velo di polvere che il resto della casa non permette a niente.

> Natalino: "Ok, ADESSO ho paura. Prima gli scheletri, va bene, ci sto. Ma un museo dell'auto tenuto da un pazzo con la passione della meccanica mi mette DAVVERO a disagio."

**(Sangue freddo +1: l'assurdo, stanotte, fa quasi ridere. Flag: garage_visto.)**`,
    gold: 1,
    sets: { garage_visto: true },
    choices: [{ text: 'Gaetano vuole recuperare un pezzo del SUO motore', next: 'gr2' }],
  },

  gr2: {
    location: 'garage',
    caption: 'Il recupero',
    text: `Gaetano si avvicina alla bacheca del 2024 con la determinazione di un ingegnere che rivuole ciò che è suo, e con la delicatezza di chi capisce, guardando bene, che ogni pezzo è appeso a un gancio sottile, collegato al successivo con un fil di ferro quasi invisibile — un domino perfetto, pronto a crollare tutto insieme al primo errore.

> Gaetano: "Se tiro il pezzo sbagliato nell'ordine sbagliato, cade TUTTO. Centinaia di componenti. Sulla pietra. Con un rumore che sveglierebbe pure lo Chef due piani più giù."

*(Prova di Destrezza — CD 13: staccare la candela senza far cadere il resto della bacheca.)*`,
    choices: [
      { text: '🔧 Sfilarla con calma millimetrica', tag: 'Prova di Destrezza — CD 13', check: { stat: 'DES', dc: 13, success: 'gr3', fail: 'gr3_ko' } },
    ],
  },

  gr3: {
    location: 'garage',
    caption: 'La candela recuperata',
    text: `La candela esce dal suo gancio con un piccolo *clic* pulito, e nient'altro si muove: il domino resta in equilibrio, silenzioso, come se anche la bacheca fosse sollevata di non dover crollare.

> Gaetano: *(la candela in mano, ancora tiepida come se il motore fosse stato spento un minuto fa, non anni)* "È tiepida. Cazzo, è TIEPIDA. Questa macchina, da qualche parte, sta ancora girando."

> Federico: "Non pensarci. Metti in tasca e andiamo, prima che decida di volerla indietro."

Sulla targhetta d'ottone, ancora attaccata alla candela, la scritta resta leggibile: *"Candela n°3 — gruppo 2024."* Il proprio gruppo. La propria auto. Il proprio nome, quasi, se la casa avesse deciso di scriverlo lì invece che nel registro.

**(Oggetto: CANDELA DEL MOTORE. Sangue freddo +1.)**`,
    item: 'candela_motore',
    gold: 1,
    choices: [{ text: 'Uscire dalla rimessa e tornare verso il pozzo', next: 'b3_pozzo' }],
  },

  gr3_ko: {
    location: 'garage',
    caption: 'Il crollo',
    text: `La candela si stacca, ma il fil di ferro accanto si impiglia in un polsino, e in un secondo l'intero domino di pezzi ordinatissimi crolla dal muro con un frastuono di ottone e metallo che sembra durare un minuto intero, anche se saranno stati tre secondi.

> Gaetano: *(tra i pezzi sparsi, la faccia di chi ha rovinato il proprio lavoro con le proprie mani)* "...ho ricreato il rumore esatto di un incidente. Nella rimessa. Di notte."

Da fuori, lontano ma non abbastanza, un fruscio di foglie secche si muove — lento, curioso, **sveglio.** Le cesoie del Giardiniere, da qualche parte nella nebbia, si aprono con un piccolo scatto oliato.

> Natalino: "Ok, direi che qualcuno ha sentito. Prendiamo il pezzo e ANDIAMO, prima che arrivi a fare la potatura anche a noi."

La candela, per fortuna, è già in tasca di Gaetano — tiepida, intatta — anche in mezzo al disastro.

**(Oggetto: CANDELA DEL MOTORE, ottenuta col fracasso. Flag: giardiniere_allertato. -1 Sangue freddo.)**`,
    item: 'candela_motore',
    gold: -1,
    sets: { giardiniere_allertato: true },
    choices: [{ text: 'Correre fuori dalla rimessa, verso il pozzo', next: 'b3_pozzo' }],
  },

  /* ==================== IL RIFLESSO — IL MONDO SOTTO ==================== */


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
      enemies: ['doppio'],
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

  /* ==================== L'ALBA — IL BANCHETTO ==================== */

  z1: {
    location: 'salaBanchetto',
    stinger: 'campana',
    npc: ['gregorio'],
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
      { text: '🔔 Suonare la campanella di Don Michele: "quando LEI si siede a tavola..."', requires: { item: 'campanella_1974' }, removeItem: 'campanella_1974', next: 'z_vespri' },
      { text: '🫙 L\'offerta impensabile: non UN nome. Un RICORDO a testa: questa notte, intera.', next: 'z_smemorati' },
      { text: '🖋 La scelta di cui non parlerete mai più: UNO di voi prende la penna', next: 'z_custode' },
      { text: '🍽 Sedersi. Tutti e cinque. C\'è una pace terribile, nello smettere di lottare...', next: 'z_resa' },
    ],
  },

  z_vespri: {
    location: 'salaBanchetto',
    caption: 'I vespri del Settantaquattro',
    text: `La campanella di bronzo esce dallo zaino, e la sala — la casa intera — se ne accorge PRIMA che suoni. I candelabri si irrigidiscono. I ritratti trattengono il fiato dipinto.

*Din.*

Un suono piccolo, stonato, umanissimo: la campanella di una chiesa di paese, suonata da mani che tremano da cinquant'anni. Rimbalza sul pavimento a scacchi, sale lungo i lampadari — e da qualche parte, sotto la casa, **il pozzo risponde.**

> La voce di ADA: *(non più solo dal pavimento: da OVUNQUE, chiara, giovane, in piedi)* "...i vespri. Lui suona ANCORA i vespri."

E la Fame — la cosa a capotavola, la casa affamata, il patto vestito da padrone — per la prima volta in centoventicinque anni esita, perché tutte le voci che ha rubato si sono girate INSIEME verso il suono.

> Ada: "Ditegli che li ho sentiti. Tutti. Ogni sera, per cinquant'anni. E adesso, ospiti..." *(l'acqua canta nelle tubature come un esercito che si sveglia)* "...adesso SÌ che apparecchiamo NOI."

**(Ada è in campo apertamente e la casa VACILLA: nello scontro finale partirete con VANTAGGIO, e la Fame sarà più debole nei primi giri.)**`,
    sets: { vespri_suonati: true, casa_vacilla: true, sorpresa: true, ada_alleata: true },
    choices: [
      { text: '🧂💧 Adesso il rituale: sale, acqua, nome', requires: { flag: 'rituale_noto' }, next: 'z2_rituale' },
      { text: '⚔ Adesso la battaglia: che venga a riscuotere, se ci riesce', next: 'z3_boss' },
    ],
  },

  z_smemorati: {
    location: 'salaBanchetto',
    caption: 'Il prezzo che nessuno aveva previsto',
    text: `L'idea è di quelle che possono venire solo alle sei meno venti del mattino, dopo una notte intera di orrore: se il patto vuole NUTRIRSI — e se il vino in cantina è fatto di ricordi — allora forse non gli serve una persona intera.

Forse bastano **cinque ricordi.** Uno a testa. Lo stesso, per tutti: **questa notte.**

La casa ci pensa. La sentite pensare: le travi che scricchiolano piano, i lampadari che tintinnano come un abaco. È un'offerta nuova — in centoventicinque anni nessuno le ha mai offerto qualcosa di SPONTANEO — e la novità, per una creatura che vive di rituali, è la tentazione più grande che esista.

> La Fame: *(con mille voci, INCURIOSITA)* "...cinque notti intere. Cinque paure fresche. Cinque amicizie... così strette." *(il tovagliolo si riannoda)* "Accetto. Ma sappiatelo, ospiti: mi prendo TUTTO, di stanotte. Il terrore E il coraggio. La piscina E il pozzo. Ricorderete di essere venuti. Non ricorderete di essere stati GRANDI."

> Gregorio: *(piano, sconvolto)* "Nessuno ha mai... signori, pensateci: dimenticherete anche di esserVI salvati. Vi resterà solo una vacanza qualunque e un vuoto grande così. È QUESTO che volete?"

*(È una via d'uscita pulita. Nessun combattimento, nessun custode, tutti a casa. Il prezzo è la storia stessa: la vostra.)*`,
    choices: [
      { text: '🫙 Sì. Offrire i ricordi. Tutti insieme, mano nella mano.', next: 'e_smemorati' },
      { text: '↩ No. Questa notte è NOSTRA, e ce la teniamo. Si torna alle armi.', next: 'z1', gold: 2 },
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

> Gregorio: *(un ultimo filo di voce, da lontanissimo)* "ALZATEVI, CAZZO. Scusate il francese. Centoventicinque anni di etichetta e la butto via adesso: ALZATEVI."

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

> Claudia: *(alzando il treppiede come una mazza)* "Io c'ho messo DIECI ANNI a farmi una carriera, brutto stronzo di una casa: non finisco appesa a una parete come un centrino."

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

> Federico: *(arrotolando le maniche del pigiama)* "Va bene. VA BENE. La versione breve della proposta: vaffanculo. Con rispetto. Ma vaffanculo."

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

  e_smemorati: {
    location: 'albaRelais',
    caption: 'EPILOGO — La Vacanza Qualunque',
    text: `**Lunedì mattina, a casa.**

La vacanza è stata... bella? Bella. Il relais era curato, il padrone di casa gentile — Gregorio, no, Giorgio? — la piscina fantastica. Avete dormito benissimo. Strano solo che nessuno abbia fatto foto la seconda sera: ottantasette foto il primo giorno e poi il nulla, come se i telefoni fossero rimasti in camera.

C'è qualcos'altro, però. Piccole cose.

Natalino ha comprato una campanella di bronzo a un mercatino, "non so, mi diceva qualcosa", e la tiene in salone. Emanuela ha piantato erbe argentate sul balcone, e non ricorda dove ha preso i semi. Claudia ha uno scatto in galleria che non sa spiegare — sei asciugamani su sei lettini — e non riesce a cancellarlo. Gaetano, ogni tanto, calcola a mente quanto dista Avellino, e non sa perché. Federico ha disdetto un cliente per andare a trovare "un vecchio prete che fa un caffè incredibile", e nessuno gli ha chiesto come lo conosce.

E ogni anno, l'ultima settimana di agosto, arriva una cartolina. Una villa liberty, una piscina turchese, una grafia elegante:

*"Il Belvedere ringrazia i suoi ospiti più generosi. Le vostre stanze sono sempre pronte. — G. & A."*

La leggete insieme, ogni anno, tutti e cinque. E ogni anno, per un momento che nessuno confessa agli altri, vi trovate a piangere **senza nessun motivo al mondo.**

**🫙 FINE — Avete vinto. È costato solo la notte in cui siete stati più grandi di così. Rigiocate: stavolta, tenetevela.**`,
    sets: { finale_smemorati: true },
    ending: true,
  },

};

/* Scena iniziale della campagna */
const CAMPAIGN_START = 'a0';

/* Mappa del mondo: luoghi del Belvedere (per il canvas della mappa) */
const WORLD_MAP = [
  { key: 'tornanti', label: 'I Tornanti',      x: 0.12, y: 0.80, scenes: ['a0', 'a0_benzina', 'a1', 'a1b'] },
  { key: 'relais',   label: 'Il Relais',       x: 0.40, y: 0.30, scenes: ['a2', 'a2_siepi', 'p4_fuga', 'gr1', 'gr2', 'gr3', 'gr3_ko'] },
  { key: 'hall',     label: 'La Hall',         x: 0.56, y: 0.48, scenes: ['a3', 'a3_registro', 'a3_registro_ko', 'a4_firma', 'a4_rinvio', 'a4_firma_forzata', 'p4_rientro'] },
  { key: 'camere',   label: 'Le Camere',       x: 0.74, y: 0.32, scenes: ['a5', 'a5_pozzo', 'h1', 'h2', 'u1', 'u2_1999', 'u2_1924', 'u2_1899', 'u3_medaglione', 'u3_bambole_fight', 'u3_bambole_vinte', 'u5_specchio', 'u4_porta_vuota', 'sf1', 'sf2', 'sf3', 'sf4', 'sf5', 'sf6', 's49_1', 's49_2', 's49_3', 's49_3_ko', 's74_1', 's74_2', 's74_3', 'cuore_gc', 'cuore_fe', 'cuore_fe_esito', 'cuore_nat', 'cuore_nat_esito'] },
  { key: 'pranzo',   label: 'Sala da Pranzo',  x: 0.46, y: 0.62, scenes: ['a6', 'a6_menu', 'a6_brindisi', 'a6_no_brindisi', 'a7', 'z1', 'z2_vino', 'z2_trattativa', 'z2_rituale', 'z3_boss', 'z3_boss_arrabbiato', 'z3_boss_indebolito', 'z4_fase2', 'z5_vittoria', 'z6_alba', 'e_alba', 'z_custode', 'e_custode', 'z_resa', 'e_ospiti', 'z_vespri', 'z_smemorati', 'e_smemorati'] },
  { key: 'riflesso', label: 'Il Riflesso',      x: 0.10, y: 0.28, scenes: ['w1_tuffo', 'w2_riflesso', 'w2_riflesso_ko', 'w3_giardino', 'w3_pattuglia_combat', 'w4_sofia', 'w5_racconto', 'w6_1924', 'w7_ronda', 'w7_ronda_combat', 'w8_direttore', 'w9_studio', 'w9_studio_combat', 'w10_orologio', 'w10_orologio_reso', 'w11_inventario', 'w12_tradimento', 'w12_sofia', 'w14_direttore_boss', 'w15_vittoria', 'w16_amaro', 'w17_fuga', 'w17_fuga_ko', 'w18_soglia', 'w_finale'] },
  { key: 'paese',    label: 'Pietrafonda',     x: 0.16, y: 0.90, scenes: ['pp1', 'pp2', 'pp2_bar', 'pp3', 'pp4_cripta', 'pp4', 'pp6', 'pp6_ko', 'pp7'] },
  { key: 'piscina',  label: 'La Piscina',      x: 0.22, y: 0.50, scenes: ['p1', 'p1_accappatoio', 'p1_accappatoio_ko', 'p2', 'p2_esperimento', 'p2_esperimento_ko', 'p3_fuori'] },
  { key: 'cantina',  label: 'La Cantina',      x: 0.62, y: 0.78, scenes: ['k1', 'k2_sofia', 'k2_sofia_ko', 'k3', 'k4_scambio', 'k4_chef_fight', 'k4_furto', 'k4_furto_ko', 'k5_dopo_chef', 'x_celle', 'os1', 'os2', 'os3', 'os4', 'os5', 'os6'] },
  { key: 'pozzo',    label: 'Il Pozzo',        x: 0.86, y: 0.66, scenes: ['b1', 'b2_giardiniere_fight', 'b2_orto', 'b3_pozzo', 'b4_medaglione', 'b4_vino', 'b4_parole', 'b4_ira', 'b4_calata', 'b4_calata_ko'] },
];

