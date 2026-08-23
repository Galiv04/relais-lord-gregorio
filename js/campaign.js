/* ============ IL RELAIS DI LORD GREGORIO — campagna completa ============
   Formato identico al motore Corona. In più, gli EFFETTI DI CONDIZIONE:
   - captureRoller: true   → chi ha appena tirato (e fallito) viene PRESO dalla villa
   - poisonRoller: true    → chi ha appena tirato resta AVVELENATO (serve l'Antidoto)
   - freeAll: true         → libera tutti i PRESI
   - Valuta: G.gold = SANGUE FREDDO (🕯). Si guadagna con le scelte coraggiose,
     si perde davanti all'orrore. Alcune scelte richiedono nervi saldi.        */

const ITEMS = {
  kit_emanuela:     { name: 'Kit di Emanuela', desc: 'Garze, cerotti, ago da sutura e una calma innaturale. Ripristina 10 PV.', usable: true, heal: 10 },
  grappa_nonno:     { name: 'Grappa del Nonno di Gaetano', desc: 'Portata "per il brindisi". Ripristina 16 PV e un po\' di dignità.', usable: true, heal: 16,
    lore: `Bottiglia di vetro riciclata — quella dell'aranciata — con un tappo di sughero tagliato a misura. Dentro, quaranta gradi di roba fatta in casa da un uomo che non c'è più.\n\nIl nonno di Gaetano la faceva ogni anno e la regalava a tutti; tutti dicevano che era troppo forte e lui rispondeva che era grappa. Questa è dell'ultima annata. Gaetano l'ha portata «per il brindisi», che era il suo modo di dire che voleva che ci fosse anche lui.\n\nBevuta stanotte rimette in piedi in un modo che la chimica non spiega. Il nonno non c'entra niente con questa casa. Forse funziona esattamente per quello.` },
  antidoto:         { name: 'Antidoto di Erbe', desc: 'Le erbe giuste dell\'orto, bollite come dice il diario. Guarisce il VELENO del Belvedere — anche in pieno scontro.', usable: true, heal: 0, cureVeleno: true },
  sale_grosso:      { name: 'Sale Grosso Benedetto', desc: 'Dal barattolo in cucina, con un\'etichetta del 1899: "PER LORO". Da lancio: 2d8 danni, DOPPI alle creature della villa.', combat: { dice: [2, 8], holy: true }, icon: '🧂',
    lore: `Un barattolo da conserve con la carta legata sopra con lo spago, e sulla carta due parole a inchiostro: «PER LORO».\n\nIl sale grosso di questa cucina è del 1899 e non è cambiato: il sale non scade, il sale non fa niente, il sale sta. Chi ha scritto quell'etichetta non stava minacciando nessuno — stava facendo un inventario. Il pane per noi, il sale per loro.\n\nTirato addosso alle cose della casa fa un male sproporzionato, e la ragione è che il sale è la sostanza più domestica che esista. Lo hanno lasciato entrare come si lascia entrare la cucina.` },
  acqua_pozzo:      { name: 'Acqua del Pozzo Vecchio', desc: 'Gelida, e riflette un cielo che non è quello di stasera. Serve al rituale.', usable: false },
  diario_ada:       { name: 'Diario di Ada', desc: '1899. La moglie di Gregorio scrisse fino all\'ultima notte. Leggere una pagina ad alta voce CONFONDE le creature della casa (1d4, svantaggio al prossimo attacco). Un uso: poi la pagina si dissolve.', combat: { distract: true, dice: [1, 4], distractText: ' — le parole di Ada lo inchiodano: conosce quel nome!' }, icon: '📖' },
  anello_1999:      { name: 'Anello del 1999', desc: 'Trovato sul fondo della piscina. Dentro è inciso: "A Sofia — per sempre qui".', usable: false },
  polaroid:         { name: 'Polaroid degli Ospiti', desc: 'Cinque ragazzi in piscina, datata 1999, uno cerchiato in rosso. La macchina ha ancora UNO scatto: il flash a bruciapelo ACCECA una creatura (svantaggio al prossimo attacco). La foto che esce, meglio non guardarla.', combat: { distract: true, dice: [1, 2], distractText: ' Il FLASH a bruciapelo lo acceca: svantaggio al prossimo attacco!' }, icon: '📸' },
  accendino:        { name: 'Accendino di Federico', desc: '"Non fumo più, lo tengo per affezione." Stanotte vale oro: una fiamma vera, CALDA E VIVA — le cose della villa la odiano (2d4, danni DOPPI alle creature della casa). Il gas basta per un colpo solo.', combat: { dice: [2, 4], holy: true }, icon: '🔥' },
  torcia_led:       { name: 'Torcia LED di Gaetano', desc: '1200 lumen, tre modalità. La terza — lo strobo tattico — non l\'avete mai provata: acceca TUTTI i nemici insieme (svantaggio al prossimo attacco). Tre secondi a 1200 lumen, poi la batteria muore per sempre.', combat: { all: true, distract: true, dice: [1, 2], distractText: ' accecato dallo strobo!' }, icon: '🔦' },
  vino_1899:        { name: 'Bottiglia del 1899', desc: 'Il vino del primo Banchetto. L\'etichetta scritta a mano: "Da aprire solo per il Padrone".', usable: false,
    lore: `Bordolese scura, vetro spesso, tappo affondato di due centimetri, ceralacca crepata. L'etichetta è scritta a mano con inchiostro ferrogallico: «Da aprire solo per il Padrone».\n\nIl vino dentro non è vino da almeno ottant'anni: è aceto e sedimento, e chi lo bevesse passerebbe la notte peggio di come la sta già passando.\n\nMa il punto non è bere. Il punto è che questa bottiglia era il regalo del primo Banchetto e non è stata aperta. Qualcuno, nel 1899, ha deciso che il Padrone non la meritava, e l'ha rimessa sullo scaffale. È il primo no detto in questa casa.` },
  lanterna_1899: {
    name: 'Lanterna del 1899',
    desc: 'Ottone annerito, vetro fumé. Il Contabile: "Le creature della casa la conoscono. Non la temono: la RISPETTANO. C\'è differenza." Portata in giro, fa esitare chi vi assale — un attimo, non di più.',
    usable: false,
    lore: `Ottone annerito, vetro fumé, e dentro una candela mai accesa: lo stoppino è ancora bianco.\n\nIl Contabile ha usato la parola giusta. Non «temono»: RISPETTANO. Le creature della casa si fermano quando la vedono nello stesso modo in cui un cameriere anziano si ferma davanti a un cliente che conosce da trent'anni — non per paura, per gerarchia.\n\nQuesta lanterna ha fatto luce al primo Banchetto. Chi la tiene in mano, per loro, è personale di servizio. È una promozione, e non è un complimento.`,
  },
  chiave_camera6: {
    name: 'Chiave della Camera 6',
    desc: 'Ottone annerito, etichetta di cartone: "Camera n. 6 — per quando la signora si deciderà". Il Belvedere non HA una camera 6. Ancora.',
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
    lore: `Una carta napoletana consumata fino al cartone, l'angolo destro tondo dall'uso, e sul dorso una macchia che è stata sangue tanto tempo fa.\n\nNel 1949 sette uomini tornati dalla guerra decisero che la fortuna andava tenuta in tasca a turno, un mese per uno. Il turno è andato avanti settant'anni: quando uno moriva, la carta passava. All'ultimo passaggio non c'era più nessuno a cui passarla.\n\nAdesso è in tasca a voi, e il turno è ricominciato. Serve una volta sola, e dopo la fortuna torna a essere quello che è sempre stata: una cosa che si tiene in tasca a turno.`,
  },
  nastro_1974: {
    name: 'Nastro del \'74',
    desc: 'Una cassetta senza custodia: "ULTIMA REGISTRAZIONE — L. + comune". In uno scontro, la musica del \'74 CALMA le creature della casa: le più piccole si fermano un giro, le grandi esitano. Un uso solo: il nastro poi si spezza.',
    combat: { calm: true }, icon: '📼',
    lore: `Una cassetta senza custodia, nastro marrone, etichetta scritta con una biro che scriveva male: «ULTIMA REGISTRAZIONE — L. + comune».\n\nL. è l'iniziale di lei. «Comune» è la banda del comune: dodici fiati e una grancassa, che nel 1974 in Irpinia era l'orchestra. Suonavano ai matrimoni e alle feste patronali, e quella sera suonavano qui.\n\nLa musica è brutta. Stonata, in ritardo, con un clarinetto che entra sempre un quarto dopo. Ed è per questo che le creature si fermano ad ascoltarla: è l'unica cosa in questa casa fatta da gente che non era buona a farla e l'ha fatta comunque.`,
  },
  candela_motore: {
    name: 'Candela del motore (gruppo 2024)',
    desc: 'Una candela d\'accensione, ancora TIEPIDA, targhetta d\'ottone: "Gruppo 2024". È la vostra. E da qualche parte, il motore che la aspetta gira ancora: scagliata contro una creatura, morde con la scintilla di un motore vivo (2d6). Un lancio solo — poi addio, macchina.',
    combat: { dice: [2, 6] }, icon: '⚡',
    lore: `Una candela d'accensione con la targhetta d'ottone legata al filo: «Gruppo 2024». È ancora tiepida.\n\nTiepida vuol dire che il motore da cui l'hanno tolta girava da poco. «2024» vuol dire che l'anno scorso è arrivato un gruppo come il vostro, con una macchina come la vostra, ed è arrivato fin qui.\n\nNessuno ha smontato la vostra candela: la macchina è ancora giù, col motore che si raffredda. Fra venticinque anni qualcuno troverà una targhetta d'ottone con scritto «Gruppo 2025», e la sentirà tiepida.`,
  },
  biglietto_1949: {
    name: 'Il biglietto mai consegnato (1949)',
    desc: 'Carta ingiallita, piegata in otto, mai aperta da chi doveva riceverla: "NON FIRMATE. Scendete stanotte. Il custode." Gregorio ci ha provato, una volta. Poi ha smesso di provarci.',
    usable: false,
  },
  erbe_ada: {
    name: 'Rametto d\'argento di Ada',
    desc: 'Un rametto delle erbe argentate dell\'orto, consegnato dalla padrona di casa in persona. "Contro il freddo. Il MIO." Cura il VELENO del Belvedere e scalda anche il resto (+3 PV).',
    usable: true, heal: 3, cureVeleno: true,
    lore: `Un rametto di quindici centimetri, foglie grigio-argento, odore di canfora e di orto la sera. Ada l'ha tagliato davanti a voi con le forbici da cucina e ve l'ha messo in mano chiudendovi le dita sopra.\n\n«Contro il freddo», ha detto. «Il MIO.»\n\nHa detto MIO con la maiuscola nella voce. Non ha spiegato se intendeva il freddo che sente lei o il freddo che manda lei, e voi non l'avete chiesto. Adesso avete in tasca un rametto che funziona e una domanda che non avete fatto.`,
  },
  taralli: {
    name: 'Taralli della spesa epica',
    desc: 'Dalla spesa colossale organizzata prima di partire: frutta, verdura, carne dal macellaio, mozzarella paisana e tre buste della Lidl. I taralli sono il presidio di emergenza: "Se stiamo per morire, almeno non a stomaco vuoto." +2 PV.',
    usable: true, heal: 2,
  },
  tronello: {
    name: 'Tronello di riserva',
    desc: 'Rollato da Natalino con la cura che mette nelle pieghe importanti. Rilassa i nervi come nient\'altro stanotte: +5 PV a chi lo fuma e un\'onestissima mezz\'ora di filosofia. "Non è vizio, è MANUTENZIONE."',
    usable: true, heal: 5,
  },
  birra_limone: {
    name: 'Birra al limone di Federico',
    desc: 'Dalla cassa di birre al limone caricata in macchina come un secondo bagaglio ("ne servono DIECI al giorno, è scienza"). Gelata al punto giusto anche quando non dovrebbe esserlo: +3 PV e un rutto di conforto.',
    usable: true, heal: 3,
  },
  ritratto_casa: {
    name: 'Il Ritratto della Casa',
    desc: 'Una cornice piccola, nascosta nell\'intercapedine: dentro, dipinto a olio, il Belvedere stesso — di giorno, pieno di gente, FELICE. La casa non regge la propria immagine: mostrata in combattimento, TUTTE le creature esitano (svantaggio) e la vergogna morde (1d4 a tutti). Un uso: poi la tela si copre di crepe.',
    combat: { all: true, distract: true, dice: [1, 4], distractText: ' — si è VISTA, e si vergogna!' }, icon: '🖼',
    lore: `Cornice di legno chiaro, venti centimetri per quindici, olio su tavoletta. Era murata nell'intercapedine con la faccia verso l'interno.\n\nDipinge il Belvedere di giorno. Non c'è nebbia: c'è luce piatta di pomeriggio, e sulla ghiaia davanti nove persone fanno cose normali — uno scarica una cassetta, due parlano, una bambina è di spalle. Il pittore ha messo le ombre giuste per le tre del pomeriggio di settembre.\n\nIl Belvedere odia questo quadro. Non perché lo tradisce: perché è vero. È esistito un pomeriggio in cui questo posto era soltanto una casa in Irpinia con della gente davanti, e finché il quadro c'è, quel pomeriggio non si può negare.`,
  },
  gratta_vinci: {
    name: 'Gratta e Vinci di Baiano (x5)',
    desc: 'Cinque biglietti comprati all\'ultimo avamposto della civiltà. Natalino li custodisce come reliquie: "Se qualcuno vince, il weekend lo paga lui." Nessuno ha ancora grattato niente.',
    usable: false,
  },
  orologio_sofia:     { name: 'Orologio di Sofia', desc: 'Fermo alle 23:58 del 31 luglio 1999. Lanciarlo a una creatura la BLOCCA un istante — l\'ora sbagliata le fa perdere il filo (1d4 danni, svantaggio). Poi è rotto per sempre.', combat: { distract: true, dice: [1, 4], distractText: ' — l\'orologio segna l\'ora sbagliata: la creatura esita!' }, icon: '⌚',
    lore: `Un orologio da donna, cinturino di pelle marrone screpolato, quadrante piccolo. Fermo alle 23:58 del 31 luglio 1999.\n\nNon è rotto: è carico. Se lo scuoti riparte per tre secondi e poi torna alle 23:58, e questo non è un guasto che esista in meccanica.\n\nSofia aveva ventidue anni e due minuti di vantaggio. Tirato addosso a una creatura, l'orologio le mostra un'ora che in questa casa non è mai arrivata, e per un istante quella perde il filo: qui dentro tutto gira su un orario, e i due minuti che mancano sono l'unico buco nell'orario.` },
  inventario_riflesso: { name: 'L\'Inventario del Riflesso', desc: 'Leggere il nome di una creatura dal registro capovolto la RICONOSCE: perde potere. 2d4 a TUTTI (le creature della casa sono tutte nell\'inventario). Un uso: poi le pagine si staccano.', combat: { all: true, distract: true, dice: [2, 4], distractText: ' — sentire il proprio nome dal registro lo inchioda!' }, icon: '📋' },
  campanello:       { name: 'Campanello di Servizio', desc: 'Ottone lucido. Il cartellino dice: "Suonare in caso di bisogno. Verranno." In combattimento il suono PARALIZZA le creature della casa (svantaggio al prossimo attacco, 1d4 danni a tutti). Un uso: poi il batacchio cade.', combat: { all: true, distract: true, dice: [1, 4], distractText: ' — il suono del padrone lo inchioda!' }, icon: '🔔' },
  moka:             { name: 'Moka di Don Michele', desc: 'Caffè del paese, nero come la notte e due volte più forte. Ricarica TUTTE le abilità di una persona.', usable: true, recharge: true },
  bengala:          { name: 'Bengala di Federico', desc: '"Per le emergenze", diceva. Da lancio: 2d6 danni a TUTTI i nemici, che restano accecati (svantaggio).', combat: { dice: [2, 6], all: true, distract: true }, icon: '🧨',
    lore: `Un bengala da segnalazione marittimo, cappuccio rosso, scadenza superata di quattro anni. Federico lo tiene nel bagagliaio dal 2021 «per le emergenze».\n\nNessuno gli ha mai chiesto quale emergenza, in provincia di Avellino, richieda un razzo da nave. Lui risponderebbe che il punto delle emergenze è che non sai quali sono.\n\nStasera aveva ragione lui. Fa una luce rossa che dura un minuto e si vede da tre chilometri, e in una casa che ha costruito il buio a mano, un minuto di rosso è un insulto personale.` },
  campanella_1974:  { name: 'Campanella del 1974', desc: 'La campanella della vecchia chiesa di Paternopoli. Don Michele: "Quando LEI si siede a tavola... suonate i vespri."', usable: false,
    lore: `Bronzo, grande come un pugno, col battente legato con lo spago perché la catenella si è rotta nel 1974 e nessuno l'ha aggiustata.\n\nÈ la campanella dei vespri della vecchia chiesa di Paternopoli, quella chiusa dopo il terremoto. Don Michele l'ha tenuta in sacrestia cinquant'anni senza suonarla mai: dice che una campana suonata fuori orario è una bugia detta a tutto il paese.\n\n«Quando LEI si siede a tavola», ha detto dandovela, «suonate i vespri.» Non ha spiegato altro. Ha solo guardato l'ora, come si guarda una cosa che si sa già.` },
  tisana_1899: { name: 'Tisana del 1899', desc: 'La miscela della casa quando la casa era una casa: malva, tiglio e qualcosa di montagna. Ripristina 12 PV.', usable: true, heal: 12 },
  caffe_contabile: { name: 'Caffè del Contabile', desc: 'Fatto con la moka che gli avete insegnato ad amare. Nero, doppio, NON negoziabile. Ricarica TUTTE le abilità di una persona.', usable: true, recharge: true },
};

/* I nodi che valgono un CHECKPOINT (cura+ricarica alla prima volta — vedi engine.js) */
const CHECKPOINT_FLAGS = ['nodo_cantina', 'nodo_pozzo', 'nodo_piano', 'pista_paese', 'riflesso_fatto'];

/* ---- Testi ispezionabili (Zaino → 📖 Ispeziona): leggere gli oggetti AL TAVOLO ---- */
ITEMS.diario_ada.lore = `Il diario si apre sempre sulla stessa pagina, come se avesse una piega d'abitudine.

"12 agosto 1899 — G. dice che c'è un modo per uscirne, che ha parlato con la cosa nel pozzo, che serve solo una firma. Gli credo. Gli ho sempre creduto: è il suo talento.

Se leggete queste righe, chiunque siate: i nodi della casa si sciolgono con TRE cose — il sale che è rimasto fedele, l'acqua che ricorda, e il nome dato per amore e non per fame.

Le ultime tre pagine le ho strappate io. Le ho date al pozzo, perché certe istruzioni deve poterle dare solo chi le ha pagate. — Ada"

(Le pagine successive sono scritte fitte, ma l'inchiostro scappa dagli occhi quando provate a leggerle: la casa permette UNA pagina per volta. In combattimento, leggerne una ad alta voce confonde le sue creature.)`;
ITEMS.acqua_pozzo.lore = `Un'acqua che pesa più di quanto dovrebbe, in una bottiglia che era della limonata.

Guardandoci dentro controluce, il riflesso NON è la stanza in cui vi trovate: è un cielo. Stellato, fermo, con una luna sottile — il cielo di un'altra notte, forse di centoventicinque anni fa. Se la inclinate, le stelle NON si muovono.

Sul fondo, una scritta a smalto, di mano femminile: "acqua che ricorda". È uno dei tre ingredienti del rituale. Ada l'ha data a voi: non si spreca, non si beve, non si lascia in giro.`;
ITEMS.gratta_vinci.lore = `Cinque Gratta e Vinci comprati all'autogrill di Baiano. Cinque possibilità, una promessa: l'ultimo si gratta FUORI, all'alba, tutti presenti.

L'ultimo è intatto. Natalino ci ha giurato sopra: si gratta FUORI di qui, all'alba, tutti e cinque presenti. Non è un biglietto. È una promessa con la patina d'argento.`;
ITEMS.antidoto.lore = `Erbe dell'orto bollite come dice il diario di Ada: "finché l'acqua non torna a sapere di orto."

L'odore è quello giusto — rosmarino, menta selvatica, e una cosa amara che non ha nome sul barattolo. Scalda le mani attraverso il vetro: è l'ESATTO contrario del freddo del Belvedere.

Chi è avvelenato dal freddo (☠ −2 a prove e attacchi) lo beve e guarisce. Anche in pieno combattimento.`;
ITEMS.tronello.lore = `Mezzo tronello, conservato con cura da Natalino "per il momento giusto".

Non è droga, ai sensi della serata: è DIPLOMAZIA. Al pozzo ne è già sceso metà, calato nel secchio come un'offerta, e la signora ha gradito. Questo mezzo resta per un cerchio di gruppo, se la notte concede una pausa — o per un'altra ambasciata.`;
ITEMS.taralli.lore = `I taralli della scorta di viaggio, miracolosamente sopravvissuti al bagagliaio.

Sanno di casa, di autostrada, di qualunque posto che NON sia questo. In una notte in cui la cena l'ha cucinata un morto, un tarallo è la cosa più viva che potete mettervi in bocca. (+PV quando usati: la normalità nutre.)`;
ITEMS.birra_limone.lore = `La birra al limone di Federico, ancora fresca per miracolo.

L'etichetta è di una marca vera, di un mondo vero, dove i frigoriferi servono a tenere fresche le cose e non le persone. Federico la conserva "per il brindisi della vittoria". Nessuno ha il coraggio di dirgli che porta sfiga dirlo ad alta voce. Anzi: ormai lo sapete, QUI le parole ad alta voce diventano contratti.`;
ITEMS.torcia_led.lore = `1200 lumen, tre modalità, di Gaetano. "Non si sa mai", aveva detto caricandola.

Sul retro, l'adesivo dell'inventario di laboratorio con il suo nome. La terza modalità — lo strobo tattico — non l'ha mai provata: il manuale dice "per disorientare aggressori". Il manuale non specificava di che secolo.`;
ITEMS.accendino.lore = `L'accendino di Federico. "Non fumo più, lo tengo per affezione."

È un ricordo di quando fumava, di sere lunghe e discorsi lunghi. La fiamma è piccola, viva, CALDA — e stanotte avete imparato che le cose della villa odiano esattamente questo: il caldo che non devono gestire loro. Il gas basta per un colpo solo: sceglietelo bene.`;
ITEMS.kit_emanuela.lore = `Il kit di Emanuela: garze, cerotti, ago da sutura, disinfettante, e una calma innaturale ripiegata sul fondo.

C'è un ordine, là dentro, che racconta la sua proprietaria meglio di qualunque biografia: ogni cosa al suo posto, ogni posto con la sua cosa. Sul coperchio, a pennarello: "NON SI MUORE SENZA APPUNTAMENTO. — E."`;
ITEMS.campanello.lore = `Ottone lucido da bancone, con il cartellino originale: "Suonare in caso di bisogno. Verranno."

Il punto, avete capito ormai, è chi sono LORO — e il fatto che il suono del padrone paralizza il personale: le creature della casa si bloccano sull'attenti. Funziona una volta: poi il batacchio cade, e certe telefonate è meglio non farle due volte.`;
ITEMS.lettere_1899.lore = `Un fascio di lettere legato con lo spago, grafia doppia: una elegante (G.), una fitta e femminile (A.).

Parlano dell'ampliamento mai fatto: le camere per le famiglie, i bambini nella dependance, il glicine da spostare. Progetti. Preventivi. Un futuro intero, scritto a quattro mani.

Nell'ultima, la regola di Ada: "in questa casa non si firmi MAI niente dopo cena. I contratti sono roba da mattina. Promettimelo." Datata 12 agosto 1899. Tre giorni prima del patto — firmato dopo cena.`;
ITEMS.biglietto_1949.lore = `Un biglietto piegato in otto, mai consegnato. La carta è consumata SOLO lungo le pieghe: aperto e richiuso mille volte, mai dato.

"NON FIRMATE. Scendete stanotte. Il custode."

Sotto, la data: 1949. Il gruppo del '49 è nei ritratti. Gregorio ci ha provato UNA volta — e da settantacinque anni si porta in tasca il coraggio che non ha avuto. Ridarglielo davanti a tutti, al Banchetto, potrebbe valere più di qualunque arma.`;
ITEMS.polaroid.lore = `Una Polaroid del luglio 1999: cinque ragazzi che ridono in piscina, di notte.

La ragazza mora con gli occhiali da sole sui capelli è Sofia. Intorno alla sua testa, un cerchio rosso a pennarello — la calligrafia ormai la riconoscete. Come al mercato, quando si sceglie.

E fuori dall'acqua, contateli: SEI asciugamani. La macchina ha ancora uno scatto. Meglio non pensare a chi ha scattato la foto.`;
ITEMS.anello_1999.lore = `Un anello sottile, dorato, restituito dal fondo della piscina in cambio di un'infradito.

Dentro, un'incisione consumata dall'acqua ma leggibile: "A Sofia — per sempre qui."

"Per sempre qui." Chi gliel'ha regalato non immaginava quanto la casa avrebbe preso alla lettera la dedica. Al pozzo — o a chi lo porta al dito da venticinque anni — questo anello vale una vita.`;
ITEMS.inventario_riflesso.lore = `Il registro del Direttore, strappato al mondo capovolto. Colonne ordinate: articolo, anno, stato di conservazione.

Leggerlo fa male agli occhi — le righe sono scritte SOTTO la carta, non sopra — ma i nomi si distinguono: ogni creatura della casa è a catalogo, con data di acquisizione. Leggere un nome ad alta voce in combattimento RICONOSCE la creatura: e ciò che viene riconosciuto, qui, perde potere. Le pagine reggono per un uso solo.`;
ITEMS.moka.lore = `La moka di Don Michele, ammaccata da cinquant'anni d'uso quotidiano e ancora perfetta.

Dentro c'è il caffè del paese: nero, cattivo, VERO. Il parroco l'ha caricata lui stesso: "Lassù vi serviranno le forze. E il caffè, ai morti, fa uno strano effetto: gli ricorda le mattine." Ricarica tutte le abilità di una persona — o, forse, qualcos'altro a qualcun altro.`;
ITEMS.chiave_camera6.lore = `Ottone annerito, pesante, con l'etichetta di cartone legata allo spago: "Camera n. 6 — per quando la signora si deciderà."

Il Belvedere non HA una camera numero 6. Le camere del piano proibito portano ANNI, non numeri. Eppure la chiave è comparsa nella borsa di Emanuela senza chiedere permesso — e le chiavi, in questa casa, aprono porte che si costruiscono all'occorrenza.`;


const CAMPAIGN = {

  /* ==================== PROLOGO — IL VIAGGIO ==================== */

  a0: {
    location: 'tornanti',
    caption: 'Autogrill di Baiano — ore 17:50, l\'ultimo caffè normale',
    gold: 1,
    text: `**Venerdì pomeriggio. Partiti da Minturno dopo pranzo: Domiziana, autostrada, e poi la A16 verso l'Irpinia.**

L'autogrill di Baiano è l'ultimo avamposto della civiltà: cinque caffè, due Camogli, e nel bagagliaio il bottino della spesa più epica della storia del gruppo — sessanta euro di frutta e verdura, novanta dal macellaio, mozzarella paisana, e tre buste della Lidl che pesano come un cadavere. Natalino torna dalla cassa raggiante.

> Natalino: "Ho preso i Gratta e Vinci. Cinque. Uno a testa. Se qualcuno vince, il weekend lo paga lui e Federico ci ridà l'anticipo."

> Federico: "L'anticipo era un AFFARE, e il relais è già pagato, quindi—" *(DIECI birre al limone strette al petto come un neonato)* "—questa è la scorta TATTICA. Ne servono dieci al giorno. È scienza."

> Emanuela: "Colazioni con la SFIDA — pancakes di Federico contro crêpes di Claudia — pasta zucchine e gamberi, grigliata di Gaetano. Quattro giorni NOI, la villa, la piscina e ZERO caos di Ferragosto."

> Claudia: "Le mie crêpes lo umiliano ogni anno e lui ogni anno ci riprova. Lo ammiro, giuro."

> Federico: *(cerchio di vapore dalla sigaretta elettronica)* "Quest'anno ho un OVETTO SEGRETO nella pastella. Sentirete."

> Claudia: "Tecnicamente hai prenotato un posto che su Google Maps È UNA CHIAZZA VERDE. La foto satellitare si interrompe: c'è il bosco, c'è la strada, e poi c'è tipo... una sfocatura."

> Gaetano: "Compressione dell'immagine. Le zone di montagna le aggiornano ogni dieci anni—"

> Claudia: "Amore. La sfocatura è SOLO sul relais. Il bosco intorno è nitido che gli conti le foglie."

Un silenzio da autogrill. Natalino gratta il primo biglietto, perde, e la vita riparte.

*(I Gratta e Vinci perdono tutti e cinque. Ovviamente.)*`,
    item2: 'birra_limone',
    item: 'gratta_vinci',
    choices: [
      { text: '🚗 Si riparte: ultima ora di strada, poi i tornanti', item: 'taralli', next: 'a1' },
      { text: '⛽ Prima, il pieno al distributore qui fuori — il serbatoio è a metà', item: 'taralli', next: 'a0_benzina' },
    ],
  },

  a0_benzina: {
    location: 'tornanti',
    caption: 'Il distributore — l\'uomo che conosce la strada',
    text: `Usciti dall'autostrada, la Statale delle Puglie vi porta al **Passo di Mirabella**: l'ultimo distributore prima dei tornanti per Fontanarosa e Paternopoli. E ha un benzinaio VERO, di quelli che esistono ancora solo in provincia: canottiera sotto la camicia aperta, radiolina che gracchia i risultati dell'ippica, e l'occhio lungo di chi vede passare tutti.

> Il benzinaio: *(mentre il numeratore gira)* "Turisti? Dove andate di bello?"

> Federico: "Relais Belvedere. Sopra Paternopoli."

La pompa si ferma. Non il numeratore: LA MANO del benzinaio, sull'impugnatura. Due secondi. Poi riprende, e lui non vi guarda più.

> Il benzinaio: "Bel posto. Bella piscina, dicono." *(riattacca la pompa, pulisce le mani in uno straccio con estrema cura)* "Sentite a me: se stanotte vi dicono di rientrare a mezzanotte... rientrate a mezzanotte. Non per la nebbia. La nebbia non c'entra un cazzo. Rientrate e basta."

> Natalino: "In che senso, scusi—"

> Il benzinaio: "Trentaquattro e cinquanta di verde. Il POS non funziona, come al solito. E ragazzi..." *(e qui vi guarda, uno per uno, con due occhi che hanno visto passare CINQUE macchine come la vostra, una ogni venticinque anni)* "...lasciate stare il pozzo."

**(Il serbatoio è pieno. Il silenzio in macchina, per i primi dieci minuti, anche. Sangue freddo +1: sapere di non sapere è già qualcosa.)**`,
    sets: { avviso_benzinaio: true },
    choices: [
      { text: '🚗 "Simpatico, il signore." Verso i tornanti', next: 'a1' },
      { text: '❓ "Scusi — il pozzo? QUALE pozzo?"', next: 'a0_benzina2' },
    ],
  },

  a0_benzina2: {
    location: 'tornanti',
    caption: 'Il benzinaio non risponde',
    text: `Il benzinaio ha già la schiena girata. La saracinesca scende a metà — alle sei e mezza di un venerdì d'estate, quando i distributori restano aperti fino a notte.

> Il benzinaio: *(senza voltarsi)* "Ho detto tutto quello che posso dire. Il resto lo dice la casa." *(la saracinesca scende del tutto, e la radiolina, dietro, cambia stazione da sola)* "Buona permanenza."

> Gaetano: "...ok. Io dico che era solo un vecchio strano."

> Claudia: "Anch'io. E lo penseremo entrambi fino a stanotte."

**(Sangue freddo +1: avete provato a capire. Non basta, ma conta.)**`,
    sets: { benzinaio_insistito: true },
    choices: [
      { text: '🚗 Verso i tornanti, col silenzio in macchina', next: 'a1' },
      { text: '📻 La radiolina ha cambiato stazione da sola: ascoltare cosa trasmette', once: true, next: 'a0_radio' },
    ],
  },

  a0_radio: {
    location: 'tornanti',
    caption: 'Quello che trasmette la radiolina',
    text: `Vi fermate. Dietro la saracinesca abbassata, la radiolina adesso non gracchia più l'ippica: trasmette **musica da balera**, di quelle orchestrine anni Cinquanta, piena di fruscio, come registrata da un'altra estate.

Poi la musica cala, e una voce d'annunciatore — cortese, d'epoca, TROPPO cortese — dice:

> La radio: *"...e questa era per i signori in viaggio verso il Belvedere. La direzione ricorda ai gentili ospiti che la cena è servita alle nove in punto, e che il rientro è previsto per la mezzanotte. La casa ringrazia. La casa ricorda. La casa **conta.**"*

Click. Ippica di nuovo. Cavalli, quote, il nulla di sempre.

> Emanuela: "Ha detto 'conta'? Conta COSA?"

> Federico: *(già in macchina, cintura allacciata, motore acceso)* "Ho votato che non lo vogliamo sapere. Salite."

Dietro la saracinesca, l'ombra del benzinaio non si è mossa di un millimetro. Sta con la testa china. Come uno che ha già sentito questa trasmissione. **Come uno che la sente ogni venticinque anni.**

**(Sangue freddo +1: la casa vi ha parlato per prima. Adesso lo sapete.)**`,
    sets: { radio_ascoltata: true },
    choices: [
      { text: '🚗 In macchina. SUBITO', next: 'a1' },
      { text: '🎶 Canticchiare il valzer della radio, per sdrammatizzare', once: true, heal: 1, next: 'a1' },
    ],
  },

  a1: {
    location: 'tornanti',
    caption: 'Strada provinciale — monti d\'Irpinia, ore 18:40',
    text: `**Venerdì pomeriggio. Cinque amici, una macchina piena come un uovo, e le colline della media valle del Calore che si mangiano il sole: Fontanarosa alle spalle, Paternopoli sopra di voi.**

Gaetano guida da un'ora e mezza. Claudia, di fianco, ha il telefono alzato da venti minuti: *"Niente segnale. NIENTE. Nemmeno una tacca ironica."* Dietro, Natalino è incastrato tra le buste della Lidl e le valigie come un faraone nel sarcofago, Federico difende la sua prenotazione — "cinque stelle, ragazzi, un AFFARE" — ed Emanuela ha già distribuito taralli e mozzarella a tutti, due volte, perché con quella spesa i viveri non finiranno MAI.

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

*Un rifugio fuori dal tempo.* Sotto di voi, Paternopoli spegne l'unica finestra che era rimasta accesa. Alle 18:52.

**(Il gruppo si scambia il primo sguardo della serata. Ne seguiranno altri. -1 Sangue freddo.)**`,
    gold: -1,
    sets: { nessun_segnale: true },
    choices: [
      { text: '🚗 Al relais, prima che faccia buio del tutto', next: 'a2' },
      { text: '📵 Spegnere i telefoni per risparmiare l\'ultima batteria: la notte sarà lunga', once: true, sets: { batterie_risparmiate: true }, next: 'a2' },
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
    gold: 1,
    text: `Chi di voi ha l'occhio fino si volta al momento giusto.

Le siepi sono ferme. Ovvio che sono ferme, sono siepi. Ma la terza a sinistra — quella che entrando sembrava un cervo — adesso è **rivolta verso di voi**. Non piegata dal vento: *girata*. La ghiaia intorno alla sua base è smossa in un semicerchio, come sotto una porta che qualcuno ha aperto.

E nel bosso, all'altezza di dove un cervo avrebbe gli occhi, ci sono due buchi. Vuoti. Della misura esatta di due occhi.

> Gregorio: *(senza voltarsi, dalla soglia)* "Il giardiniere è un artista. Lavora solo di notte — il bosso, dice, si lascia convincere meglio al buio. Non fateci caso se lo sentite... potare."

**(Sangue freddo +1: l'avete visto e non avete urlato. Flag: il giardiniere.)**`,
    rep: 0,
    sets: { visto_giardiniere: true },
    choices: [
      { text: '🚪 Entrate. Insieme', next: 'a3' },
      { text: '👀 Prima, un giro attorno alla facciata: le siepi meritano un\'occhiata', once: true, next: 'a2_siepi_b' },
    ],
  },

  a2_siepi_b: {
    location: 'relais',
    caption: 'Il giardino all\'ingresso',
    text: `La facciata del Belvedere ha sei finestre al primo piano, tutte illuminate. Cinque hanno le tende bianche. La sesta, in fondo a destra, ha una tenda **scura** — e per un istante, un istante che potrebbe essere un riflesso, qualcuno la sposta dall'interno.

Le siepi di bosso, viste da vicino, sono potate con una precisione chirurgica: ogni foglia nello stesso verso, ogni arco simmetrico al centimetro. Ma lo stile non è ornamentale. È **contenitivo**, come il giardiniere non stesse abbellendo le piante ma **impedendo loro di muoversi.**

> Gaetano: "Sai cosa mi ricorda? Le gabbie di Faraday. Le maglie che servono a tenere DENTRO qualcosa, non a decorare."

**(Flag: visto il giardino.)**`,
    sets: { giardino_ispezionato: true },
    choices: [
      { text: '🚪 Dentro. Basta siepi per stasera', next: 'a3' },
      { text: '🪟 Un\'ultima occhiata alla finestra con la tenda scura, prima di entrare', once: true, sets: { sesta_finestra_notata: true }, next: 'a3' },
    ],
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
    gold: 1,
    text: `Chi di voi sfoglia, sfoglia SVELTO, col pollice, come si fa coi documenti in ufficio quando il capo si avvicina.

Le pagine sono poche e i gruppi pochissimi: il Belvedere non riceve spesso. Ma le date... le date hanno un ritmo.

**1899.** Sei nomi, grafia d'epoca. **1924.** Cinque nomi. **1949.** Cinque. **1974.** Cinque. **1999.** Cinque nomi — e accanto all'ultimo, una grafia diversa, minuta, ha aggiunto: *"rimasto"*.

Venticinque anni esatti tra un gruppo e l'altro. Nessun ospite in mezzo. E l'ultima pagina — quella di oggi — ha già una riga compilata, con una calligrafia elegante che non è di nessuno di voi:

***Gaetano, Claudia, Federico, Emanuela, Natalino — soggiorno: completo.***

La parola "completo" è scritta con una cura particolare.

> Gregorio: *(materializzandosi accanto, gentile)* "Ah, l'ho compilata io per farvi risparmiare tempo. Manca solo la firma. **La firma è importante.**"

**(Avete visto le date. Flag: il venticinquennio. Sangue freddo +1.)**`,
    sets: { visto_registro: true },
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

> Claudia: *(sottovoce)* "Federico, sapeva i nostri nomi in ordine di posto in macchina."

**(Flag: registro sfogliato troppo tardi.)**`,
    sets: { registro_bloccato: true },
    choices: [
      { text: '✍️ Firmate: siete stanchi e il letto chiama', next: 'a4_firma' },
    ],
  },

  a4_rinvio: {
    location: 'hall',
    caption: 'La firma rimandata',
    gold: 1,
    text: `Federico entra in modalità professionale: sorriso da chiusura contratto, mano sul cuore.

> Federico: "Gregorio, lei è un padrone di casa d'altri tempi e noi siamo CIALTRONI d'altri tempi: guardi come siamo conciati. Firmare un documento così elegante in queste condizioni sarebbe una mancanza di rispetto. **Domattina**, riposati, con la mano ferma. Glielo firmo pure in corsivo inglese."

Un silenzio lungo. Il lampadario smette di tintinnare — e ve ne accorgete solo ora, perché il tintinnio c'era da quando siete entrati.

> Gregorio: *(alla fine, con un sorriso che arriva un decimo di secondo in ritardo)* "Che gruppo... **interessante**. Domattina, dunque. Il Belvedere è paziente. Ha avuto molto tempo per impararlo."

Riprende le valigie. Il lampadario ricomincia a tintinnare.

**(La firma NON è stata messa. Questo, stanotte, conterà. Sangue freddo +2.)**`,
    sets: { firma_rinviata: true },
    choices: [
      { text: 'Alle camere', next: 'a5' },
      { text: '👀 Osservare Gregorio allontanarsi: il lampadario si è fermato un istante prima di lui', once: true, next: 'a4_lampadario' },
    ],
  },

  a4_lampadario: {
    location: 'hall',
    caption: 'Il lampadario sa le cose prima',
    text: `Restate un passo indietro, e guardate. Gregorio attraversa la hall con le valigie — e il lampadario si ferma **un istante prima** che lui passi sotto. Non quando passa. PRIMA.

Come un cane che si mette sull'attenti quando il padrone è ancora sulle scale.

> Claudia: *(pianissimo)* "Avete presente quando entri in una stanza e la conversazione si spegne? Ecco. Qui lo fanno **i mobili.**"

E c'è di peggio, se si guarda bene: i cristalli del lampadario non pendono tutti dritti. Tre o quattro, sul lato verso la scala, restano **leggermente inclinati** — verso Gregorio, come girasoli. Quando lui sparisce oltre la porta, tornano giù. Uno alla volta. Con calma.

> Gaetano: "Fisica. Correnti d'aria. Microvibrazioni del pavimento."

> Emanuela: "Gaetano. I lampadari non hanno il senso dell'udito."

> Gaetano: "E infatti non ho detto che ce l'ha. Ho detto che me lo voglio credere fino a domattina."

**(Sangue freddo +1: la casa ha una gerarchia. E voi non siete in cima.)**`,
    sets: { lampadario_notato: true },
    choices: [
      { text: '🧳 Alle camere, senza passare sotto il lampadario', next: 'a5' },
      { text: '👋 Salutare il lampadario con un cenno: le gerarchie si rispettano', once: true, next: 'a5' },
    ],
  },

  a4_firma_forzata: {
    location: 'hall',
    caption: 'La firma — non c\'era scelta',
    text: `> Gregorio: *(dolcissimo, inamovibile)* "Temo di dover insistere. Le assicurazioni, i regolamenti... viviamo in tempi complicati perfino quassù. **Una firma sola** e non ci pensiamo più."

La penna stilografica è già in mano a qualcuno di voi — nessuno ricorda di averla presa. La punta tocca la carta e il tratto esce nero, lucido, *più nero dell'inchiostro*.

Firmato. Il registro si chiude da solo con un tonfo soffice, come un applauso a una mano.

> Gregorio: "**Benvenuti al Belvedere.** Ora è ufficiale."

E per un attimo — un attimo solo — la luce color miele della hall diventa più calda, come un forno quando ci si mette dentro qualcosa.`,
    sets: { firma_messa: true },
    choices: [
      { text: 'Alle camere', next: 'a5' },
      { text: '🕯 Controllare la luce della hall, rimasta più calda del dovuto', once: true, next: 'a4_luce' },
    ],
  },

  a4_luce: {
    location: 'hall',
    caption: 'La luce color miele',
    text: `Emanuela non si muove. Fissa le lampade della hall — quelle a muro, con i paralumi di stoffa color crema — e aspetta che la luce torni normale.

Non torna.

È rimasta più calda di prima. Non più forte: più **calda**, come il colore che prende un forno quando ci si mette dentro qualcosa e si chiude lo sportello. E adesso che ci fate caso, ha anche un suono: un ronzio bassissimo, sotto la soglia dell'udito, che non viene dalle lampadine. Viene **dai muri.**

> Emanuela: "La casa ha cambiato temperatura quando abbiamo firmato."

> Federico: "Le case non—"

> Emanuela: "Federico. Ho venduto immobili per anni. Lo so io per prima cosa fanno e non fanno le case. **Questa ci sta digerendo.**"

Nessuno ribatte. Il ronzio, per un secondo, sembra quasi... soddisfatto.

**(Sangue freddo +1: sapere in che tipo di stanza ci si trova è metà del mestiere.)**`,
    sets: { luce_hall_notata: true },
    choices: [
      { text: '🧳 Alle camere. E domattina si riparte presto', next: 'a5' },
      { text: '🌡 Toccare il muro un istante: caldo come una fronte febbricitante', once: true, damage: 1, next: 'a5' },
    ],
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
    choices: [
      { text: 'Alle camere', next: 'a5' },
      { text: '📖 Claudia torna a guardare il registro, già riaperto sulla pagina di oggi', once: true, next: 'a4_registro' },
    ],
  },

  a4_registro: {
    location: 'hall',
    caption: 'Il registro riaperto',
    text: `Claudia scende due gradini, torna al bancone, e guarda.

Il registro è aperto sulla pagina di oggi, sì. Ma non è questo il punto. Il punto è che sotto la vostra firma, nello spazio bianco, adesso c'è **una riga tracciata a matita.** Leggera, precisa, da contabile: il posto per la firma di qualcun altro.

E in margine, piccolissimo, un numero: **6.**

> Claudia: *(tornando su, con la voce di chi ha appena visto il preventivo sbagliato)* "Ragazzi. Noi siamo in cinque, giusto? Ditemi che siamo in cinque."

> Natalino: "Siamo in cinque, Claudia."

> Claudia: "Ecco. Allora perché la casa ha apparecchiato **sei firme?**"

Nessuno risponde. Di sopra, da qualche parte, una porta si chiude da sola — piano, con discrezione, come per non disturbare la conversazione.

**(Sangue freddo +1: l'avete visto in tempo. Chi è il sesto, lo scoprirete voi — o lo deciderà la casa.)**`,
    sets: { registro_riaperto_visto: true },
    choices: [
      { text: '🧳 Alle camere, contandovi per strada', next: 'a5' },
      { text: '✋ Contarvi ad alta voce, adesso: uno, due, tre, quattro, cinque', once: true, heal: 1, next: 'a5' },
    ],
  },

  a5: {
    location: 'corridoio',
    caption: 'Il corridoio delle camere — primo piano',
    text: `Il corridoio del primo piano è lungo, coi tappeti rossi che bevono il rumore dei passi e le lampade a muro che si accendono **una alla volta, mentre passate** — mai prima, mai dopo.

> Gregorio: "Le coppie qui: la **Camera del Glicine** per il signor Federico e la signora Emanuela, la **Camera dei Melograni** per il signor Gaetano e la signora Claudia. E per il signor Natalino..." *(si ferma davanti all'ultima porta, in fondo, dove il corridoio gira nel buio)* "...la **Camera del Pozzo**. La migliore. La riserviamo sempre all'ospite... singolare."

> Natalino: "'Singolare'. Ho fatto trent'anni di battute sui single, ma detta da lei fa un altro effetto, Gregorio."

> Gregorio: *(sorriso)* "Dalla sua finestra si vede il pozzo vecchio del giardino. Alcuni ospiti lo trovano rilassante. Altri tengono le tende chiuse. **Sono valide entrambe le scuole di pensiero.**"

Le camere sono perfette: lini freschi, fiori tagliati stasera, acqua e frutta. Su ogni cuscino, un cioccolatino artigianale e un biglietto scritto a mano: *"Il Belvedere vi aspettava."*

Mentre si disfano i bagagli, due oggetti finiscono — per abitudine, o per istinto — nelle tasche di chi li possiede: la **torcia LED** di Gaetano ("milleduecento lumen, non si sa mai") e l'**accendino** di Federico ("non fumo più, lo tengo per affezione"). Nessuno dei due sa ancora perché l'ha fatto. Lo sapranno.

**(Oggetti: TORCIA LED e ACCENDINO.)**

Non "vi aspetta". **Vi aspettava.**`,
    item: 'torcia_led',
    item2: 'accendino',
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
    choices: [
      { text: '🍽 Scendete per la cena. In gruppo. Da ora in poi, sempre in gruppo', next: 'a6' },
      { text: '📸 Claudia scatta la corda: nella foto è TESA verso l\'alto, come in trazione. Salvata', once: true, sets: { corda_fotografata: true }, next: 'a6' },
    ],
  },

  a6: {
    location: 'salaDaPranzo',
    npc: ['gregorio'],
    caption: 'La cena delle nove — sala da pranzo',
    gold: 1,
    text: `La sala da pranzo è un piccolo teatro: un tavolo lungo apparecchiato d'argento, candelabri accesi, e le portefinestre che danno sulla piscina illuminata di turchese là fuori, fumante nell'aria fresca della montagna.

La cena è un silenzio religioso che dura tre portate. Pasta fatta in casa, un arrosto che si taglia col pensiero, verdure dell'orto che sanno ancora di terra bagnata. Gregorio serve tutto personalmente, con tempi da orologeria, raccontando la valle: i castagneti, il santuario lassù, il paese.

> Gregorio: "Paternopoli si è svuotata negli anni. Restano gli anziani, e gli anziani vanno a letto presto. Per questo le persiane chiuse: **non è maleducazione. È memoria.**"

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

> Gregorio: "E il dolce di stasera — mele annurche e miele di castagno — è del **1999**. La signorina Sofia lo definì, cito testualmente, 'una roba da paura'." *(sorride, e stavolta il sorriso è più triste dell\'orario di chiusura di un luna park)* "Il linguaggio dei giovani. Sempre così... profetico."

Emanuela posa la forchetta. Piano.

> Emanuela: "Gregorio. Lei parla degli ospiti come... come se il menù fosse un CIMITERO."

> Gregorio: *(riempiendole il bicchiere, gentilissimo)* "Signora mia. In ogni grande cucina, la memoria e il menù sono la stessa cosa. Qui al Belvedere... semplicemente non buttiamo via niente."

> Federico: *(a bocca piena, scaramantico come sempre a modo suo)* "Comunque ragazzi, ve lo dico: con quello che ho mangiato, DOMANI MUOIO. Domani mi prende un infarto fulminante, sappiatelo."

> Emanuela: "Non si dice manco per scherzo, Federì."

> Federico: "E CHI scherza."

**(Ogni piatto è un ospite. Ogni annata è un gruppo. Sangue freddo +1, appetito -100. Flag: il menù della memoria.)**`,
    sets: { menu_memoria: true },
    choices: [
      { text: '🍷 Cambiare aria: il brindisi. INSISTERE che beva anche lui.', tag: 'Prova di Carisma — CD 12', check: { stat: 'CAR', dc: 12, success: 'a6_brindisi', fail: 'a6_no_brindisi' } },
      { text: '🏊 "Comunque buonissimo tutto, eh. La piscina si può usare di sera?"', next: 'a7' },
    ],
  },

  a6_brindisi: {
    location: 'salaDaPranzo',
    caption: 'Il brindisi di Gregorio',
    gold: 1,
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
    choices: [
      { text: '🏊 In piscina!', next: 'p1' },
      { text: '🍷 Annusare il proprio bicchiere: il vino di Gregorio non sa di niente', once: true, next: 'a6_vino' },
    ],
  },

  a6_vino: {
    location: 'salaDaPranzo',
    caption: 'Il vino che non sa di niente',
    text: `Mentre gli altri si alzano, Gaetano avvicina il naso al bicchiere di Gregorio — quello toccato dalle labbra chiuse, pieno esattamente come prima.

Niente. Non "un vino leggero": **niente.** Nessun odore. Nemmeno quello del vetro, nemmeno quello dell'acqua. Il naso dice che lì sotto non c'è NULLA — un buco a forma di bicchiere nell'aria della stanza.

Lo inclina appena. Il liquido si muove **in ritardo**, mezzo secondo dopo il polso, come un attore che ha dimenticato quando tocca a lui.

> Gaetano: *(posandolo con MOLTA delicatezza)* "Il vino è finto."

> Claudia: "Annacquato, vorrai dire."

> Gaetano: "No. FINTO. È... scenografia. Come i frutti di cera nelle vetrine." *(pausa, la peggiore delle pause)* "Claudia. Se il vino di Gregorio è scenografia... il NOSTRO cos'era?"

Dalla cucina, il rumore gentile dei piatti. E, appena percettibile sotto, un suono che nessuno vuole nominare: qualcuno che **conta i bicchieri.**

**(Sangue freddo +1: al Belvedere anche la cena recita. Meglio saperlo.)**`,
    sets: { vino_gregorio_annusato: true },
    choices: [
      { text: '🏊 In piscina — con una gran voglia di acqua VERA', next: 'p1' },
      { text: '💧 Bere un bicchiere d\'acqua del rubinetto, per sicurezza: sa d\'acqua. Sollievo', once: true, heal: 1, next: 'p1' },
    ],
  },

  a6_no_brindisi: {
    location: 'salaDaPranzo',
    caption: 'Il brindisi mancato',
    gold: 1,
    text: `> Gregorio: *(posando la bottiglia con una carezza)* "Il padrone di casa che beve coi suoi ospiti finisce per raccontare i segreti della casa. E una casa senza segreti, signori..." *(apre le portefinestre sulla piscina turchese, fumante nella notte)* "...è solo un mucchio di stanze."

Il discorso muore lì, elegantissimo, e non c'è modo di rianimarlo: Gregorio è già altrove, a versare l'amaro, a consigliare la grappa di castagne, a essere il miglior padrone di casa che abbiate mai incontrato.

> Emanuela: *(a bassa voce, mentre gli altri ridono di una battuta di Natalino)* "Ragazzi. Non ha mangiato. In tutta la sera."

> Gaetano: "Avrà mangiato prima. In cucina. Fanno tutti così."

> Emanuela: "Gaetà. Amore mio. C'è UN coperto in cucina, l'ho visto passando. È **pulito e impolverato insieme.**"

> Gregorio: *(da dietro, sorridente, col vassoio degli amari)* "La piscina è pronta, signori. La notte al Belvedere è la parte migliore del soggiorno."

**(Sangue freddo +1: qualcosa non torna, ma il gruppo se lo dice con gli occhi.)**`,
    sets: { brindisi_rifiutato: true },
    choices: [
      { text: '🏊 In piscina!', next: 'p1' },
      { text: '🍽 Dare un\'occhiata al coperto pulito e impolverato, in cucina', once: true, next: 'a6_coperto' },
    ],
  },

  a6_coperto: {
    location: 'salaDaPranzo',
    caption: 'Il coperto che aspetta',
    text: `Emanuela passa "per sbaglio" davanti alla porta della cucina, che è socchiusa. E lo vede bene, stavolta.

Un tavolino d'angolo, apparecchiato per UNO: piatto di porcellana buona, bicchiere di cristallo, posate d'argento allineate al millimetro. Tutto **pulito e impolverato insieme** — lucidato di fresco sotto una polvere di anni, come se qualcuno lo spolverasse ogni sera SENZA MAI USARLO.

E sul piatto, piegato a triangolo, un tovagliolo con un ricamo. Emanuela si sporge. Il ricamo dice: **"A."**

> Emanuela: *(tornando al tavolo, bianca)* "Il coperto in cucina è per una persona che non mangia da tanto. E ha l'iniziale."

> Natalino: "Che iniziale?"

> Emanuela: "A."

> Natalino: "...magari sta per 'Albergo'."

> Emanuela: "Certo. E lo apparecchiano ogni sera da cent'anni **per l'Albergo.**"

Dalla cucina, il rubinetto si apre da solo. Un attimo. Poi si chiude, educato.

**(Sangue freddo +1: c'è qualcuno che Gregorio aspetta a cena da molto, molto tempo.)**`,
    sets: { coperto_cucina_visto: true },
    choices: [
      { text: '🏊 In piscina, tutti insieme, nessuno da solo', next: 'p1' },
      { text: '🍫 Emanuela intasca un cioccolatino dal cesto: le prove si raccolgono', once: true, next: 'p1' },
    ],
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

> Natalino: "...ragazzi, io il bagno lo faccio comunque, sia chiaro. Però qualcuno tiene d'occhio le siepi."

**(Flag: programma della serata.)**`,
    sets: { programma_serata: true },
    choices: [
      { text: '🏊 In piscina!', next: 'p1' },
      { text: '🌙 Controllare le persiane del piano dalla veranda, prima di scendere', once: true, next: 'a7_persiane' },
    ],
  },

  a7_persiane: {
    location: 'salaDaPranzo',
    stinger: 'jumpscare',
    caption: 'Le persiane del secondo piano',
    text: `Dalla veranda si vede tutta la facciata. Primo piano: le vostre camere, le luci accese, le persiane aperte. Normale.

Secondo piano: **tutte le persiane chiuse.** Tutte tranne una.

La terza da sinistra è aperta a metà, e dietro il vetro non c'è luce — c'è quel buio particolare delle stanze abitate al buio, che è diverso dal buio delle stanze vuote, e chiunque abbia mai avuto paura da bambino sa distinguerli al primo colpo.

> Claudia: "La terza da sinistra era chiusa quando siamo arrivati. L'ho fotografata, la facciata. Ho la foto."

La tira fuori. Confrontate. Nella foto delle sei di sera: chiusa. Adesso: aperta a metà.

E mentre guardate la foto, con la coda dell'occhio, TUTTI E CINQUE nello stesso istante — la persiana **si chiude.** Senza vento. Senza rumore. Come una palpebra.

> Federico: "Ok. La piscina. SUBITO la piscina. Il cloro mi calma."

**(Sangue freddo +1: il piano proibito vi ha guardato per primo. Ora siete pari.)**`,
    sets: { persiane_controllate: true },
    choices: [
      { text: '🏊 In piscina, sotto il cielo aperto', next: 'p1' },
      { text: '📸 Uno scatto alla facciata, stavolta con data e ora', once: true, next: 'p1' },
    ],
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

...e sull'ultimo accappatoio, l'iniziale è ancora attaccata con gli spilli. Come se la sarta stesse **aspettando di sapere la lettera.**

Federico, sdraiato sul lettino buono, soffia verso il cielo uno dei suoi cerchi di vapore da manuale. Il cerchio sale, perfetto. Ma nel riflesso della piscina — Claudia lo nota e non lo dice subito — il cerchio **scende**: si allontana nell'acqua, giù, sempre più piccolo, come se dall'altra parte qualcuno lo stesse aspirando con calma.

> Federico: "Visto che roba? SETTE anni di pratica."

> Claudia: *(guardando l'acqua)* "...già. Che roba."
`,
    choices: [
      { text: '😅 "Ne avranno messo uno di scorta." Continuare il bagno: l\'acqua è troppo bella', next: 'p2' },
      { text: '🔍 Uscire a controllare l\'accappatoio da vicino', tag: 'Prova di Saggezza — CD 11', check: { stat: 'SAG', dc: 11, success: 'p1_accappatoio', fail: 'p1_accappatoio_ko' } },
    ],
  },

  p1_accappatoio: {
    location: 'piscina',
    caption: 'Il sesto accappatoio',
    gold: 1,
    text: `Chi esce dall'acqua lo fa con la nonchalance di chi va a prendere il telo — e ispeziona il sesto accappatoio con le mani che fingono di cercare le sigarette.

L'iniziale con gli spilli è un **cartamodello vuoto**: la sarta ha preparato il ricamo ma non l'ha cucito. Sotto, però, sulla stoffa, si vede il fantasma di **lettere precedenti**, scucite e ricucite più volte: una S. Una M. Una R. Il tessuto è consumato proprio lì, come una lavagna cancellata troppe volte.

E nella tasca dell'accappatoio c'è **un paio di occhiali da sole.** Modello anni '90, lenti sfumate. Dentro una stanghetta, a pennarello mezzo cancellato: *S. — Belvedere '99.*

> Natalino: *(dall'acqua)* "Che c'è scritto? Perché hai la faccia di quando il cliente dice 'fai tu'?"

**(Oggetto trovato: gli occhiali del '99 restano nella tasca — ma il dettaglio è registrato. Flag: il sesto ospite. Sangue freddo +1.)**`,
    sets: { sesto_ospite: true },
    choices: [
      { text: 'Tornare in acqua e fare finta di niente. Malissimo.', next: 'p2' },
      { text: '🕶 Provare gli occhiali del \'99, un secondo, prima di rimetterli via', once: true, next: 'p1_occhiali' },
    ],
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


  p1_occhiali: {
    location: 'piscina',
    caption: 'Gli occhiali del \'99',
    gold: 1,
    stinger: 'jumpscare',
    text: `Claudia li inforca. Un secondo. UN secondo solo.

Attraverso le lenti sfumate, la piscina è la stessa — l'acqua, il vapore, i lettini — ma la LUCE è un'altra: più calda, più gialla, luce di lampioni di venticinque anni fa. E i lettini non sono vuoti.

Cinque sagome sfocate, sdraiate, che ridono di qualcosa che non si sente. E una sesta, in piedi sul bordo, che non ride: GUARDA l'acqua. Da vicinissimo. Come chi ha visto qualcosa dentro.

Claudia si strappa gli occhiali dalla faccia. La piscina torna la vostra: vuota, tiepida, adesso.

> Claudia: *(rimettendoli nella tasca dell'accappatoio con due dita, come una cosa che scotta)* "Gli occhiali ricordano l'ultima cosa che hanno visto. E l'ultima cosa che hanno visto... è la sera in cui è successo."

> Federico: "Che stava guardando, la sesta sagoma?"

> Claudia: "L'acqua, Federico. Stava guardando l'acqua COME LA STIAMO GUARDANDO NOI ADESSO."

Nessuno rientra in piscina di corsa. Ma nessuno ci mette più i piedi con leggerezza.

**(Sangue freddo +1: un secondo dentro il 1999. Vi è bastato.)**`,
    sets: { occhiali_provati: true },
    choices: [
      { text: '🌊 In acqua, con MOLTO più rispetto', next: 'p2' },
    ],
  },

  p2: {
    location: 'piscina',
    stinger: 'jumpscare',
    caption: 'La piscina — il gioco del riflesso',
    gold: 1,
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
    gold: 1,
    text: `Gaetano, già fuori dall'acqua e col cervello in modalità laboratorio, prende la cosa più scientifica a portata di mano: l'infradito di Federico.

> Federico: "Quella è NUOVA—"

> Gaetano: "È per la scienza."

La posa a pelo d'acqua, delicatamente, al centro del riflesso della luna rossa.

L'infradito galleggia. Il suo riflesso **no.**

Nel cielo capovolto sotto la superficie, dove dovrebbe esserci l'ombra dell'infradito, non c'è niente: la luna rossa continua a salire, indisturbata, come se l'oggetto vero non esistesse. Come se — Gaetano lo dice ad alta voce, con la calma piatta delle pessime notizie — **"il riflesso non fosse un riflesso. È una finestra. Noi non ci siamo, dall'altra parte. O non ci siamo ANCORA."**

L'infradito, piano, comincia a ruotare su sé stessa. Controcorrente. Poi qualcosa, da sotto, la **tira giù.** Senza schizzi. Come un appunto preso.

> Federico: "...era NUOVA, porca puttana. Comprata IERI."

E poi — un secondo dopo, con la stessa calma da ufficio — qualcosa **risale.** Piccolo, dorato, rotola sul fondo fino al bordo e si ferma esattamente sotto la mano di Gaetano. Un anello. Dentro, un'incisione consumata dall'acqua ma leggibile: *"A Sofia — per sempre qui."*

> Gaetano: *(asciugandolo, piano)* "...ha preso l'infradito e ha emesso una RICEVUTA. Questa casa fa la contabilità anche degli scambi."

**(Sangue freddo +2: avete guardato nell'abisso con metodo. Oggetto: ANELLO DEL 1999. Flag: la finestra.)**`,
    item: 'anello_1999',
    sets: { vista_finestra: true },
    choices: [
      { text: 'Fuori dall\'acqua. La scienza ha dato il suo verdetto.', next: 'p3_fuori' },
      { text: '📸 Claudia fotografa l\'anello, prima che finisca in tasca', once: true, next: 'p2_foto_anello' },
    ],
  },

  p2_foto_anello: {
    location: 'piscina',
    stinger: 'jumpscare',
    caption: 'La foto dell\'anello',
    text: `Claudia mette l'anello sul palmo di Gaetano, inquadra col telefono, scatta col flash.

Guarda lo schermo. Riscatta. Guarda ancora. Poi gira il telefono verso il gruppo, e la sua mano non è fermissima.

Nella foto l'anello c'è, nitido, dorato, perfetto. Ma il palmo su cui è appoggiato **non è quello di Gaetano.** È una mano più piccola, più giovane, con lo smalto rosa consumato sulle unghie e un segno bianco all'anulare — il segno che lascia un anello portato per anni, **tolto da poco.**

> Claudia: "Gaetano. Dimmi che hai lo smalto rosa."

> Gaetano: *(guardando la propria mano, poi la foto, poi la propria mano)* "Riprovala. RIPROVALA."

Seconda foto, senza flash: la mano di Gaetano, normale, la sua. Ma l'anello, in questa, è **girato dall'altra parte** — con l'incisione in su, ben leggibile, come per farsi leggere: *"A Sofia — per sempre qui."*

> Claudia: *(salvando ENTRAMBE le foto)* "Sofia. Ovunque tu sia... ti stiamo cercando. Promesso."

**(Sangue freddo +1: la prima prova documentata. Sofia sa che ci siete.)**`,
    sets: { anello_fotografato: true },
    choices: [
      { text: 'Fuori dall\'acqua, con le foto al sicuro', next: 'p3_fuori' },
      { text: '💍 Infilare l\'anello nella tasca CON ZIP dello zaino: certe cose non si perdono due volte', once: true, heal: 1, next: 'p3_fuori' },
    ],
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
    gold: 1,
    text: `La decisione è unanime nel modo speciale in cui è unanime il panico: nessuno pronuncia la parola "scappiamo", ma Emanuela ha già le chiavi in mano, Claudia dice solo "MACCHINA. ORA." e in novanta secondi siete tutti vestiti a metà, con le valigie richiuse a morsi, giù per le scale.

La macchina è dove l'avete lasciata. Si apre. Si accende. Gaetano ingrana la prima con la delicatezza di un rapinatore e il viale di ghiaia bianca scricchiola sotto le ruote — fino al **cancello.**

Il cancello di ferro nero, che all'arrivo era spalancato, è **chiuso.** Non c'era un cancello chiuso nelle foto. Non c'era proprio, il cancello, nelle foto.

E oltre le sbarre, la strada dei tornanti... non c'è. C'è la nebbia. Un muro verticale di nebbia bianca, ferma, spessa come lana, che comincia ESATTAMENTE al confine della proprietà. I fari ci sbattono contro e tornano indietro.

> Gregorio: *(la sua voce, gentile, dal citofono del cancello che NON ha fili)* "Signori. Capita a tutti i gruppi, la prima notte: è il soggiorno che si assesta. La montagna di notte non è dei villeggianti — ve l'avevo detto con largo anticipo. Rientrate, vi prego. Ho preparato una tisana. **Il Belvedere detesta veder partire gli ospiti... in anticipo.**"

Dietro la macchina, sulla ghiaia, il rumore delle cesoie. *Clip. Clip.* Vicinissimo.

**(-1 Sangue freddo. Il Belvedere è ufficialmente chiuso. Flag: avete provato a scappare.)**`,
    gold: -1,
    sets: { tentata_fuga: true },
    choices: [
      { text: '🏠 Rientrare. Compatti. E cominciare a fare sul serio', next: 'h1' },
      { text: '🔦 Ultimo giro col fascio di luce: la nebbia si apre SOLO dove guarda Gregorio. Registrato', once: true, next: 'h1' },
    ],
  },

  p4_rientro: {
    location: 'hall',
    caption: 'Il rientro — mezzanotte meno cinque',
    gold: 1,
    text: `Rientrate ordinati e velocissimi, con la compostezza isterica delle scolaresche in gita quando inizia il temporale.

Dentro, il Belvedere è caldo, profumato di legna e cera — e **diverso.** Niente di plateale: è tutto al suo posto, ed è proprio questo il punto. È al suo posto *di nuovo*, come una stanza riordinata da qualcuno mentre eravate fuori. I ritratti alle pareti sono tutti dritti. Il registro è chiuso. Il lampadario tintinna.

Solo una cosa è cambiata davvero: nella hall, appoggiata al bancone della reception, c'è **una tisaniera fumante con cinque tazze.** Cinque. Preparate prima che decideste di rientrare.

E accanto alle tazze, un biglietto con la solita calligrafia elegante:

*"La notte al Belvedere comincia a mezzanotte. Chiudete bene le finestre. Non aprite a chi bussa con la voce di qualcuno che è già dentro. — G."*

> Emanuela: *(rileggendo)* "...'con la voce di qualcuno che è già dentro'."

> Natalino: "Io questa tisana non la bevo manco morto. Scusate il gioco di parole, ma è mezzanotte passata e ho visto una piscina posseduta: il bon ton è ufficialmente SOSPESO."

Da qualche parte sopra di voi, al piano delle camere, **un pavimento scricchiola.** Una volta. Poi, educatamente, si ferma ad aspettare.

Sul bancone della reception, il campanello di servizio luccica. Natalino, per ripicca pura, lo INTASCA: "'Verranno', eh? Vediamo se vengono quando chiamo IO."`,
    item: 'campanello',
    choices: [
      { text: '⬆ Su. Insieme. Si va a capire che notte è questa', next: 'h1' },
      { text: '🫖 La tisana: se è avvelenata almeno lo scopriamo subito', once: true, next: 'p4_tisana' },
    ],
  },

  /* ==================== LA NOTTE SI CHIUDE — HUB ==================== */


  p_vespe: {
    location: 'piscina',
    caption: 'Il minuto che non vi meritavate',
    stinger: 'jumpscare',
    text: `Un minuto. Lo volete, ve lo siete guadagnato, e per trenta secondi lo AVETE: l'acqua a trentadue gradi, il cielo giusto, il silenzio buono.

Poi la siepe comincia a RONZARE.

Non un'ape, non dieci: un rombo basso e fitto che sale dal fondo del giardino — dal pozzo, dal tetto a cuspide del pozzo — e sopra la siepe si alza uno sciame. Vespe. Ma sbagliate: **grigie**, grigie come cenere, con un volo troppo ordinato, a ranghi, come personale richiamato in servizio.

E poi lo sciame fa la cosa che vi toglie il fiato: si FERMA a mezz'aria, si addensa, e prende forma. Spalle. Testa. Le proporzioni di una persona in piedi sul bordo vasca — **la forma esatta del sesto accappatoio**, disegnata da diecimila vespe che sanno stare al loro posto.

> Natalino: *(uscendo dall'acqua all'indietro, senza staccare gli occhi)* "La casa ha finito i camerieri. È passata agli INSETTI."

> Gaetano: "Nidificano nel pozzo dal 1899. SECOLI di sciami, e stanotte li chiama tutti—"

> Claudia: "Meno analisi, più PHON!"

*(Consiglio da narratore: lo sciame è una creatura della villa — phon, sale e fiamma fanno danni DOPPI. È evasivo: i colpi mirati contano più della forza.)*`,
    combat: { enemies: ['sciame'], victory: 'p_vespe_vinto', defeat: 'x_celle', loot: { gold: 2 } },
  },

  p_vespe_vinto: {
    location: 'piscina',
    caption: 'Lo sciame si sfalda',
    gold: 1,
    text: `Lo sciame perde la forma un pezzo alla volta: prima le spalle, poi la testa, poi tutto il resto — le vespe grigie cadono a manciate, e toccando terra fanno un rumore che le vespe non fanno: **carta.** Un fruscio di carta.

Vi chinate a guardare. Ogni vespa caduta è raggomitolata su un frammento minuscolo di foglio ingiallito: le portavano ADDOSSO, come formiche col carico. Claudia ne raccoglie una manciata e ricompone i pezzi sul bordo vasca, alla luce del telefono.

Grafia elegante, del secolo scorso. Bozze. Decine di bozze della stessa frase, con correzioni:

*"Il patto vuole un nome—"* cancellato. *"Il patto ESIGE un nome—"* cancellato. *"Il patto accoglie il nome offerto—"* sottolineato due volte.

> Gaetano: "Sono le MINUTE del contratto. Del 1899. La casa ha riscritto la clausola finché non suonava... gentile." *(alza gli occhi)* "E le vespe le custodiscono da allora. Impollinano una cosa sola, qua dentro: le FIRME."

> Federico: *(che raccoglie un frammento con due dita, e lo guarda come si guarda un nemico di famiglia)* "'Il nome OFFERTO.' Ecco perché protocollano tutto quello che diciamo." *(se lo mette in tasca)* "Questo è mio. Da domani lo incornicio in ufficio: il primo copy della storia a cui NON firmerò mai."

**(Sangue freddo +2: adesso sapete come la casa scrive i suoi contratti — e chi glieli consegna.)**`,
    sets: { sciame_vinto: true },
    choices: [
      { text: '🚪 Dentro. Il minuto è finito da un pezzo', next: 'h1' },
    ],
  },


  pp7_campanella: {
    location: 'corridoio',
    npc: ['gregorio'],
    caption: 'La campanella, mostrata',
    gold: 1,
    text: `Prima di risalire, aprite la mano davanti a Gregorio: la campanella del 1974, piccola, d'ottone, col batacchio consumato da cinquant'anni di vespri.

Gregorio la guarda. E succede una cosa che il maggiordomo perfetto non si concede MAI: fa un passo indietro.

> Gregorio: "...la campanella della chiesa vecchia." *(la voce esce senza servizio, nuda)* "È il suono delle otto di sera, signori. Da cinquant'anni, quando suona, Ada si ferma. E io mi fermo. Tutta la CASA si ferma — e finge di no." *(allunga una mano, la ritira senza toccarla)* "Lui ve l'ha DATA. Il sesto ha dato via il suo orologio... a voi."

> Emanuela: "Perché pensa che sappiamo l'ora giusta per suonarla."

> Gregorio: *(ricomponendosi, ma con gli occhi ancora sulla campanella)* "Quando LEI si siede a tavola. Non prima. Non dopo. E signori... quando la sentirò, stanotte, saprò che è il momento in cui ANCHE IO devo scegliere da che parte stare."

**(Sangue freddo +1: adesso Gregorio SA che ce l'avete. E aspetta quel suono quanto Ada.)**`,
    sets: { campanella_mostrata: true },
    choices: [
      { text: '⬆ Al corridoio delle tre porte', next: 'h1' },
    ],
  },

  nat_saluto: {
    location: 'camera',
    caption: 'Il saluto alla finestra',
    text: `Prima di richiudere la finestra della Camera del Pozzo, Natalino si sporge un'ultima volta verso il giardino.

> Natalino: "Signò. Io vado, che di là c'è da fare. Grazie per la chiacchierata — e per il tiro, che non era male, per essere fumato da un pozzo."

Silenzio. Poi la corda, giù nel buio, si tende e si allenta due volte. Piano. Il gesto di chi saluta con la mano da una finestra troppo lontana per farsi vedere.

> La voce di Ada: *(appena percettibile, portata dal filo d'aria che entra)* "...single per scelta un corno, ragazzo. È che nessuna ti ha ancora VISTO alle tre di notte, gentile con una vecchia in fondo a un pozzo. Vai. E il tabacco, la prossima volta, portalo MIGLIORE."

Natalino richiude la finestra ridendo da solo, e la tenda — lo giurerebbe — si sistema da sé, come rimboccata.

**(Sangue freddo +1: c'è una signora del 1899 che ti fa i complimenti, Natalino. La serata è già vinta a metà.)**`,
    sets: { pozzo_salutato: true },
    choices: [
      { text: '↩ Tornare dagli altri, con gli occhi rossi e il cuore leggero', next: 'h1' },
    ],
  },

  s74_accordo: {
    location: 'camera',
    caption: 'L\'accordo per il Settantaquattro',
    text: `Natalino raccoglie la chitarra abbandonata — corde arrugginite, legno segnato — e prova UN accordo, il solo che ricorda da un'estate di gioventù: un LA minore, storto ma sincero.

La stanza risponde.

Non con un fantasma, non con un urlo: con l'ODORE. Incenso e sale, l'odore del 1974, che si alza dal pavimento come se l'accordo l'avesse svegliato. E per tre secondi — non di più — dietro il LA minore stonato ne sentite un altro, PULITO, suonato da dita che sapevano il fatto loro, che accompagna il vostro e lo corregge con gentilezza, come si fa coi principianti volenterosi.

> Natalino: *(posando la chitarra come si posa una cosa viva)* "Aldo suonava. Ci giurerei. Questo era il SUO la minore."

> Claudia: "E ti ha appena dato lezione."

> Natalino: "Il minimo, con quello che gli ho fatto sentire io."

Uscite in silenzio, e sulla porta l'odore d'incenso vi accompagna fino al corridoio — un applauso fatto d'aria, da chi non ha più mani.

**(Sangue freddo +1: il '74 vi ha sentiti. E ha gradito il pensiero più della tecnica.)**`,
    sets: { chitarra_provata: true },
    choices: [
      { text: '↩ Al corridoio delle tre porte, in punta di piedi', next: 'h1' },
    ],
  },


  w_finale_libera: {
    location: 'piscina',
    caption: 'Il ritorno — in sei',
    text: `L'acqua si richiude sopra le teste, e stavolta è acqua vera: bagna, scalda, sa di cloro. Risalite uno alla volta, contandovi per istinto — quattro, cinque...

...SEI.

Sofia riemerge per ultima, con un'esplosione di schiuma e un urlo che non è di paura: è il verso di chi non respirava aria VERA da venticinque anni. Resta a galla sulla schiena, gli occhi al cielo giusto — la luna bianca, sottile, NORMALE — e ride e basta, senza sarcasmo, senza catalogo.

> Sofia: "È... è FREDDA. L'acqua vera è fredda e CLORATA e PUZZA leggermente e io—" *(si passa una mano sulla faccia, e la mano trema)* "—io sento freddo. Ragazzi. SENTO FREDDO. È la cosa più bella del mondo."

> Emanuela: *(porgendole un accappatoio — il SESTO, che stanotte trova finalmente la sua proprietaria)* "Su, fuori, che il freddo bello diventa brutto in fretta. E domattina, colazione in sei."

Sofia si avvolge nell'accappatoio con le sue iniziali mai ricamate, e per la prima volta il Belvedere ha addosso qualcosa che non le ha imposto lui.

Da qualche parte nella villa, una porta verde in fondo a un corridoio aspetta ancora. Ma da stanotte, comunque vada: **il Riflesso è vuoto, e Sofia è di qua.**`,
    sets: { riflesso_fatto: true, ostaggi_liberati: true },
    gold: 1,
    choices: [
      { text: '🚪 Dentro, in sei: la notte non è finita', next: 'h1' },
      { text: '🏊 Un minuto in piscina. VERA. Ve lo meritate', once: true, next: 'p_vespe' },
    ],
  },


  p4_tisana: {
    location: 'corridoio',
    caption: 'La tisana della casa',
    gold: 1,
    text: `Federico — è sempre Federico — solleva la tazza fumante che la casa ha lasciato sul tavolino del corridoio, la annusa, e se la beve TUTTA, sotto gli occhi inorriditi degli altri quattro.

Tre secondi di silenzio da funerale.

> Federico: "...camomilla e miele. BUONA, peraltro." *(posa la tazza)* "Visto? Niente veleno. La casa non avvelena: la casa APPARECCHIA. Sono due modelli di business completamente diversi."

E mentre lo dice, la tazza vuota si RIEMPIE da sola. Lentamente. Con la stessa camomilla, alla stessa temperatura, e un biglietto piegato sotto il piattino che prima non c'era: *"Omaggio della casa. Ai clienti affezionati."*

> Federico: *(fissando la tazza piena)* "Ok. Adesso ho paura. ADESSO sì."

> Emanuela: "TRE ore. Hai resistito TRE ore più del previsto, per i miei standard."

Nessuno beve la seconda tazza. La casa, si direbbe, non se la prende: le piace di più così — con voi che SAPETE che potrebbe, e non lo fa. Per ora.

**(Sangue freddo +1: la tisana era innocua. Il messaggio, no.)**`,
    sets: { tisana_bevuta: true },
    choices: [
      { text: '🚪 Al corridoio delle tre porte — e niente più bevande omaggio', next: 'h1' },
    ],
  },

  h1: {
    location: 'corridoio',
    stinger: 'campana',
    npc: ['gregorio'],
    caption: 'Il corridoio — mezzanotte',
    text: `A mezzanotte, tre cose succedono insieme.

**Uno:** tutte le lampade del corridoio si accendono da sole, con un *tac-tac-tac* da plotone.

**Due:** l'aria cambia sapore — sa di cantina, di pietra bagnata, di **casa vecchia sotto la casa nuova.**

**Tre:** in fondo al corridoio c'è una **porta.** Vernice screpolata, targhetta d'ottone: *"SOLO PERSONALE — dal 1899"*. Socchiusa. Dietro, buio e gradini che scendono.

> Gregorio: *(alle vostre spalle, come sempre)* "Ah. La casa vi ha aperto. **Mi dispiace: speravo aveste più tempo.**"

Vestaglia impeccabile, candeliere in mano. Per la prima volta il suo sorriso non è in servizio: sembra **stanco.** Una stanchezza da secoli.

> Gregorio: "Regole della notte, e le dico una volta sola: **il Belvedere prende un gruppo ogni venticinque anni.** Io sono... il tramite. Il MAGGIORDOMO del patto. Da stanotte all'alba, la casa proverà a prendervi **a uno a uno.** Chi viene preso non muore — ma resta. Come me, dal 1899."

Il candeliere illumina tre direzioni: **la porta verde che scende in cantina**, **la scala di servizio che sale al piano proibito**, e la portafinestra verso **il giardino e il pozzo.**

> Gregorio: "Il patto ha tre nodi: la CANTINA, dove dormono quelli di prima. Il **PIANO DI SOPRA**, dove la casa tiene i suoi ricordi. E il **POZZO**, dove abita la cosa con cui firmai. Scioglietene quanti riuscite prima dell'alba. Io non posso aiutarvi oltre: ogni parola che vi dico, **la casa me la toglie da qualcos'altro.**"

Mentre lo dice, una ciocca dei suoi capelli diventa bianca.`,
    hub: true,
    choices: [
      { text: '🍷 Scendere in CANTINA — dove dormono quelli di prima', next: 'k1', once: true },
      { text: '🚪 Salire al PIANO PROIBITO — i ricordi della casa', next: 'u1', once: true },
      { text: '🌳 Uscire verso il POZZO — la cosa con cui Gregorio firmò', next: 'b1', once: true },
      { text: '❓ Trattenere Gregorio: ancora una domanda, gliela si legge in faccia', next: 'h2', once: true },
      { text: '🕯 Seguire Gregorio quando si ritira: dove DORME, un maggiordomo di 125 anni?', next: 'cst1', once: true },
      { text: '🚶 Il cancello: chi non ha FIRMATO può ancora passare. Scendere a Paternopoli', requires: { flag: 'firma_rinviata' }, next: 'pp1', once: true },
      { text: '🌊 Tornare alla PISCINA: il riflesso è una PORTA, e voi ormai lo sapete', next: 'w1_tuffo', requires: { flag: 'un_nodo_sciolto' }, once: true },
      { text: '💑 Gaetano e Claudia: due minuti, da soli, sul balcone', next: 'cuore_gc', once: true },
      { text: '💑 Federico ed Emanuela: la porta della loro camera è socchiusa', next: 'cuore_fe', once: true },
      { text: '🕯 Natalino: la finestra della Camera del Pozzo lo sta aspettando', next: 'cuore_nat', once: true },
      { text: '🎫 Cinque minuti di normalità: Natalino tira fuori i Gratta e Vinci di Baiano', requires: { item: 'gratta_vinci' }, next: 'gv1', once: true },
      { text: '🌿 Natalino alza una mano: "Io ho bisogno di un tronello. Da solo. Camera mia. CINQUE minuti."', next: 'nat_tronello', once: true },
      { text: '🌱 Emanuela prende il phon come una fondina: "Devo controllare una cosa nell\'orto. Da sola."', next: 'ema_orto', once: true },
      { text: '🌿🌿 Stavolta si condivide: il CERCHIO del tronello, sul balcone. Tutti. (consuma il tronello di riserva)', requires: { item: 'tronello' }, removeItem: 'tronello', next: 'tronello_cerchio', once: true },
      { text: '🧾 Giù dal Contabile: lo Spaccio è aperto (comprare, vendere coraggio)', requires: { flag: 'spaccio_aperto' }, next: 'os_spaccio' },
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
    choices: [
      { text: 'Tornare al corridoio delle tre porte', next: 'h1' },
      { text: '🕯 Un momento di silenzio per l\'uomo che fu, prima di giudicare quello che è', once: true, next: 'h1' },
      { text: '🕯 Osservare ancora un istante la ciocca bianca di Gregorio', once: true, next: 'h2_ciocca' },
    ],
  },

  h2_ciocca: {
    location: 'corridoio',
    caption: 'La ciocca bianca',
    text: `Lo guardate allontanarsi, e stavolta guardate DAVVERO.

La ciocca bianca di Gregorio non è bianca di età. È bianca **di assenza** — una striscia dove il colore non è caduto ma è stato PRESO, netta come un prelievo. E mentre lui cammina sotto le lampade che si spengono, la ciocca fa una cosa che i capelli non fanno: **non riflette la luce.** Le lampade la attraversano come se lì non ci fosse niente da illuminare.

> Natalino: *(sottovoce, da professionista)* "Ho fatto il parrucchiere trent'anni. Quella non è una ciocca bianca. Quella è una ciocca che NON C'È. È il buco che lascia una cosa strappata."

> Emanuela: "Strappata da chi?"

> Natalino: "Dalla casa. È l'acconto, ragazzi. La casa gli ha preso una ciocca nel 1899 e ancora se la tiene. Come si tengono le chiavi di casa di qualcuno... per poter entrare quando si vuole."

In fondo al corridoio, Gregorio si ferma un istante. Senza voltarsi. Come uno che ha sentito — e che sa che avete capito bene.

**(Sangue freddo +1: adesso sapete DOVE la casa tiene in pugno Gregorio.)**`,
    sets: { ciocca_bianca_osservata: true },
    choices: [
      { text: 'Tornare al corridoio delle tre porte', next: 'h1' },
    ],
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
      { text: '🔎 Cercare tra le rastrelliere l\'annata più vecchia di tutte: il 1899', once: true, next: 'k1_1899' },
      { text: '🚶 Non toccare niente e proseguire verso il fondo', next: 'k3' },
    ],
  },

  k1_1899: {
    location: 'cantina',
    caption: 'Lo scaffale del 1899',
    text: `Lo scaffale più in fondo, più in basso, dove la polvere ha vinto perfino sulla manutenzione della casa. Sei alloggiamenti scavati nella pietra viva — non nel legno come gli altri: **nella pietra**, come loculi.

Quattro bottiglie coricate: *"Vittoria, 1899." "Carmine, 1899." "Rosa, 1899." "Alfonso, 1899."* Gli amici saliti con Gregorio e Ada. I primi.

Il quinto alloggiamento è **vuoto ma consumato** — la pietra è levigata dove per decenni una bottiglia è stata presa, girata, spolverata, rimessa. Sull'etichetta rimasta incollata al bordo: *"Ada, 1899."* La bottiglia non c'è.

> Gaetano: "È quella che ci ha dato lo Chef. La bottiglia del Padrone. Quella che Gregorio non ha mai aperto... è LEI. È sempre stata lei."

E il sesto alloggiamento — il sesto — non è vuoto. C'è una bottiglia, coricata come le altre. Etichetta: *"Gregorio, 1899."*

È **piena.** Ma il vetro è opaco dall'INTERNO, come appannato dal fiato, e il tappo è messo **al contrario** — infilato dal di dentro, come se qualcuno l'avesse chiuso da dentro la bottiglia.

> Natalino: *(facendo un passo indietro)* "Ragazzi... se le bottiglie quaggiù sono le PERSONE, allora quello di sopra col candeliere è il TAPPO. Il vino — il vino VERO di Gregorio — è QUI."

Nessuno la tocca. Certe bottiglie si lasciano decidere a chi le ha riempite.

**(Sangue freddo +2: adesso sapete cos'è DAVVERO Gregorio — e dove la casa tiene l'originale.)**`,
    sets: { bottiglia_gregorio_vista: true },
    choices: [
      { text: '🚶 Verso il fondo della cantina, senza toccare niente', next: 'k3' },
      { text: '🧹 Spolverare piano le quattro bottiglie dei primi amici, uno per uno', once: true, heal: 1, next: 'k3' },
    ],
  },

  k2_sofia: {
    location: 'cantina',
    caption: 'La bottiglia di Sofia',
    gold: 1,
    text: `Chi si china sulla bottiglia lo fa con rispetto, come su un letto d'ospedale.

Il sussurro si mette a fuoco lentamente, tipo una radio che trova la stazione. È una voce di ragazza, anni '90 fin nell'accento, e NON è spaventosa. È peggio: è **normale.** Stanca e normale.

> La bottiglia: *"...se senti, non sei di qui. Ascolta. Il vino siamo NOI — quello che ha tolto, per tenerci buoni: i ricordi belli, ci ha messi in cantina come si fa con le cose buone. Il resto di noi sta di sopra, nelle cornici. Non bere MAI. Non mangiare più niente, da mezzanotte in poi. E se vedi Gregorio... non odiarlo troppo. Anche lui sta in una bottiglia, da qualche parte. Solo che la sua cammina."*

Un silenzio. Poi, più piano:

> La bottiglia: *"...che anno è? È già il nostro turno di uscire? Mamma aspetta."*

Non c'è niente da rispondere che non sia una crudeltà. Rimettete la bottiglia nella rastrelliera **con due mani.**

**(Segreto: il vino sono i ricordi degli ospiti. Sangue freddo +2. Flag: la voce di Sofia.)**`,
    sets: { voce_sofia: true },
    choices: [
      { text: 'Verso il fondo della cantina', next: 'k3' },
      { text: '🍾 Rimettere in fila le altre bottiglie della rastrelliera, con rispetto', once: true, sets: { bottiglie_riordinate: true }, next: 'k3' },
    ],
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
    gold: 1,
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
      { text: '📼 Mettere il NASTRO DEL \'74 sul tavolo da macellaio: nessuna mannaia ha mai vinto contro quella musica', requires: { item: 'nastro_1974' }, removeItem: 'nastro_1974', next: 'k4_nastro' },
      { text: '⚔ Non si tratta con chi ha una mannaia: attaccare PRIMA', next: 'k4_chef_fight' },
      { text: '🤫 Distrarlo e arraffare sale e bottiglia dalla mensola', tag: 'Prova di Destrezza — CD 13', requires: { notFlag: 'chef_allertato' }, check: { stat: 'DES', dc: 13, success: 'k4_furto', fail: 'k4_furto_ko' } },
      { text: '🤫 Provarci comunque — ma lo Chef è GIÀ sveglio, e la mannaia è già in mano: mani di velluto o niente', tag: 'Prova di Destrezza — CD 15', requires: { flag: 'chef_allertato' }, check: { stat: 'DES', dc: 15, success: 'k4_furto', fail: 'k4_furto_ko' } },
    ],
  },

  k4_scambio: {
    location: 'cantina',
    caption: 'La trattativa dello Chef',
    gold: 1,
    text: `Lo Chef si volta. Il davanti è peggio del dietro: al posto della faccia c'è una **retina da cuoco**, di quelle per i capelli, tesa sul nulla. Eppure, in qualche modo, vi guarda. E ascolta.

Natalino, con le mani che tremano SOLO fino al polso — dal polso in giù sono d'acciaio, trent'anni di mestiere — estrae le forbici, si fa porgere il capo da un volontario (Federico: "perché IO—", "perché hai più capelli, amore", risolve Emanuela) e taglia **una ciocca perfetta.** La piega. La presenta sul palmo come un gioiello.

> Natalino: "Taglio scalato, punte vive, MAI trattato. Nel 1899 questo lo chiamavate 'ricordo d'affetto'. Si usava nei medaglioni. VOI lo sapete cos'è un ricordo, in questa casa."

Un silenzio lungo come una lievitazione. Poi lo Chef prende la ciocca con due dita enormi, la annusa attraverso la retina, e fa una cosa oscena: **sospira di nostalgia.**

> Lo Chef: "...ricordo d'affetto. La signora Ada li faceva. Uno per ognuno del suo gruppo, i sei del 1899. Li teneva nel medaglione, per non farli finire TUTTI nel vino." *(si scosta dalla mensola)* "Prendete il sale. Prendete la bottiglia del Padrone. E dite alla signora... che il suo forno lo tengo pulito."

**(Ottenuti: SALE GROSSO e la BOTTIGLIA DEL 1899. Lo Chef vi lascia passare. Sangue freddo +2. Nodo della cantina sciolto senza sangue!)**`,
    item: 'sale_grosso',
    item2: 'vino_1899',
    sets: { nodo_cantina: true, un_nodo_sciolto: true, chef_amico: true },
    choices: [
      { text: 'Risalire. C\'è ancora tanta notte', next: 'h1' },
      { text: '🧹 Ripulire il tavolo da macellaio prima di andare, un gesto di cortesia', once: true, sets: { tavolo_ripulito: true }, next: 'h1' },
    ],
  },

  k4_nastro: {
    location: 'cantina',
    npc: ['cuoco'],
    caption: 'Il piatto del Settantaquattro',
    text: `Federico appoggia il registratore sul tavolo da macellaio — piano, come si posa un documento importante — e preme PLAY.

La voce del '74 riempie la cucina del 1899: chitarre scordate, risate sovrapposte, qualcuno che canta stonando con tutto il cuore. La mannaia si ferma **a metà colpo di cote.**

Lo Chef non si volta. Ma le spalle — due metri di spalle sbagliate — si abbassano di un centimetro.

> Lo Chef: "...il gruppo del Settantaquattro." *(la voce di forno, finalmente, tira fuori qualcosa che somiglia a un tono)* "Mangiavano TUTTO. Il coniglio alla cacciatora. La minestra maritata. Chiedevano il BIS. Ridevano a tavola e lodavano il cuoco, e uno di loro — quello coi capelli lunghi — scriveva le mie ricette su un quaderno."

*(clic. il nastro finisce, e si spezza da solo, educatamente, come chi esce in punta di piedi.)*

> Lo Chef: "Venticinque anni che cucino per gente che URLA invece di masticare." *(si volta. prende dalla mensola il sale del 1899 e la bottiglia del Padrone, e li mette sul tavolo, davanti a voi)* "Portata sostituita. Ai signori del Settantaquattro... non si dice di no. **Fuori dalla mia cucina. Siete ospiti, non ingredienti.**"

> Natalino: *(sottovoce, mentre uscite carichi)* "Abbiamo appena pagato una cena con una cassetta. Federì, questo a un MEETING non ti riesce."

**(Oggetti: SALE GROSSO e BOTTIGLIA DEL 1899. Il nastro si è spezzato per sempre. Nodo della cantina sciolto senza un graffio. Sangue freddo +2.)**`,
    item: 'sale_grosso',
    item2: 'vino_1899',
    sets: { nodo_cantina: true, un_nodo_sciolto: true, chef_amico: true },
    gold: 1,
    choices: [
      { text: 'Risalire. C\'è ancora tanta notte', next: 'h1' },
      { text: '📻 Chiedere allo Chef altre storie del gruppo del \'74, mentre si esce', once: true, next: 'k4_storie' },
    ],
  },

  k4_storie: {
    location: 'cantina',
    caption: 'Le storie del Settantaquattro',
    text: `Sulla soglia, Natalino si volta.

> Natalino: "Chef. Quello coi capelli lunghi, quello del quaderno. Com'era?"

Lo Chef resta immobile un tempo lungo. Poi, con la voce di forno più bassa che mai:

> Lo Chef: "Aldo. Si chiamava Aldo. Rideva forte e masticava piano — la combinazione più rara del mondo. L'ultima sera mi chiese la ricetta della minestra maritata 'per suo fratello, che era dovuto scendere prima'. Gliela scrissi io stesso, sul suo quaderno." *(pausa)* "La casa lo prese a mezzanotte e cinque, col quaderno in tasca. E da allora, ogni tanto, quando cucino la maritata... sento qualcuno che sfoglia pagine, dietro il muro. Cerca ancora la ricetta. Vuole ancora portarla al fratello."

> Claudia: *(piano)* "Il fratello. Quello che scese prima. Che fine ha fatto?"

> Lo Chef: *(tornando ai fornelli)* "Suona le campane, a Paternopoli. Da cinquant'anni. Adesso FUORI: certe storie, se le racconto tutte, la casa se ne accorge."

**(Sangue freddo +1: Aldo, il fratello di Don Michele. Il quaderno. Il muro. Tre pezzi che stanotte possono servire.)**`,
    sets: { storie_74_chieste: true },
    choices: [
      { text: 'Risalire, con un nome in più in tasca', next: 'h1' },
      { text: '🍲 Promettere allo Chef di assaggiare la maritata, un giorno, e di DIRE che è buona', once: true, heal: 1, next: 'h1' },
    ],
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
      loot: { gold: 2, items: ['birra_limone'] },
    },
  },

  k4_furto: {
    location: 'cantina',
    caption: 'Il colpo della mensola',
    gold: 1,
    text: `Il piano nasce con gli sguardi, come al biliardino: Federico si schiarisce la voce e parte con la mossa che gli riesce meglio al mondo — **una domanda di quelle che non finiscono più.**

> Federico: "Chef, una curiosità da profano: il forno a legna, per un banchetto per sei, lo tiene a fiamma viva o preferisce un calore residuo? Perché ho letto — mi corregga — che la resa della castagna in Irpinia..."

Lo Chef si GIRA verso di lui, magnetizzato: nessuno gli chiede del suo lavoro da centoventicinque anni. E mentre la voce di Federico riempie la cucina come un gas inodore, la mano più rapida del gruppo scivola alla mensola: **il sale nel giubbotto, la bottiglia sotto braccio,** un passo indietro, zero rumore.

> Lo Chef: *(a Federico, quasi commosso)* "...la castagna vuole il calore RESIDUO. Lei capisce. Lei CAPISCE."

> Federico: "Mi lasci il suo... contatto. Facciamo una cosa insieme, un format. 'Cucine dall'Aldilà'. Ci pensi."

Uscite in fila indiana, con calma professionale. **(Ottenuti: SALE GROSSO e BOTTIGLIA DEL 1899. Nodo della cantina sciolto con destrezza. Sangue freddo +2.)**`,
    item: 'sale_grosso',
    item2: 'vino_1899',
    sets: { nodo_cantina: true, un_nodo_sciolto: true },
    choices: [
      { text: 'Risalire, prima che ci ripensi', next: 'h1' },
      { text: '😏 Federico chiede davvero il contatto dello Chef, per il format tv', once: true, next: 'k4_contatto' },
    ],
  },

  k4_contatto: {
    location: 'cantina',
    caption: 'Il contatto dello Chef',
    gold: 1,
    text: `> Federico: *(sulla soglia, biglietto da visita già in mano, perché Federico ha SEMPRE un biglietto da visita)* "Chef. Dicevo sul serio. 'Cucine dall'Aldilà'. Format da otto puntate, lei racconta, io produco. Mi lasci un contatto."

Lo Chef lo guarda per la prima volta con tutta la retina. Poi prende un mozzicone di matita dal taschino, strappa un angolo di carta oleata, e SCRIVE. Lentamente, con la grafia di chi non scrive da un secolo.

Federico legge. Rilegge. Gira il foglietto verso il gruppo.

C'è scritto: *"Cucina del Belvedere — citofonare tre volte — chiedere del turno di notte. Disponibile dal 2049."*

> Federico: "...dal 2049."

> Lo Chef: "Il prossimo ciclo. Prima non mi cambiano il contratto." *(torna ai fornelli, e per un istante — UN istante — le spalle sbagliate ridono)* "Porti una troupe COL SALE, dottore. E buona fortuna per stanotte: se arrivate vivi all'alba... la prima puntata gliela concedo."

> Natalino: *(uscendo)* "Federì, hai appena fissato un meeting a venticinque anni. Nemmeno a Milano."

**(Sangue freddo +1: avete fatto ridere una cosa della villa. Vale più di quanto sembri.)**`,
    sets: { contatto_chef_chiesto: true },
    choices: [
      { text: 'Risalire, prima che il contratto cambi', next: 'h1' },
    ],
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
    gold: 1,
    text: `Lo Chef crolla in ginocchio con un suono di pentole vuote, e resta lì, piegato, il cappello afflosciato sulla retina. Non è morto — le cose della villa non muoiono così — ma è **spento**, come un forno a fine servizio.

E da spento, con un filo di voce di fumo, dice la cosa più terribile della serata:

> Lo Chef: "...grazie. Sono... STANCO. Centoventicinque anni di menù uguale. Nessuno che assaggia. Nessuno che dice 'buono'. Cucinare per un patto... non è cucinare."

Sulla mensola, il barattolo di **SALE GROSSO** e la **BOTTIGLIA DEL 1899** sono vostri. Sul tavolo da macellaio, sotto la mannaia abbandonata, trovate anche un **quaderno di ricette** — e tra le ricette, scritta a matita da una mano femminile del 1899, una pagina diversa: *"Erbe contro il freddo di questa casa: bollire finché l'acqua non torna a sapere di orto. — A."*

**(Ottenuti: sale grosso, bottiglia del 1899, e la RICETTA DELL'ANTIDOTO di Ada. Nodo della cantina sciolto. Sangue freddo +1.)**`,
    item: 'sale_grosso',
    item2: 'vino_1899',
    sets: { nodo_cantina: true, un_nodo_sciolto: true, ricetta_antidoto: true },
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
      { text: '🗝 Con la chiave in mano, il corridoio ha una porta IN PIÙ: ottone brunito, numero 6. Prima non c\'era.', requires: { item: 'chiave_camera6' }, once: true, next: 'u2_camera6' },
    ],
  },

  u2_camera6: {
    location: 'camera',
    stinger: 'fail',
    caption: 'La Camera n. 6',
    text: `La porta non c'era, all'andata. Nessuno di voi la ricorda, e Claudia ha le foto a provarlo. Ma adesso è lì, tra il 1899 e il 1924, discreta come una cosa che c'è sempre stata: ottone brunito, un **6** inciso, nessun anno. L'unica porta del piano con un NUMERO invece di una data — perché le date sono per chi è stato preso, e questa camera aspetta qualcuno che deve ancora DECIDERSI.

La chiave d'ottone entra nella serratura come se fosse stata fatta ieri — perché, capite adesso, è stata fatta ieri.

Dentro, la camera è **pronta.** Ma pronta in un modo che gela il sangue più di qualunque ragnatela: il letto è del 1899, rifatto con lenzuola di lino ricamate. Il comò è del 1924. La poltrona, anni Quaranta. La radio sul comodino, del '74. Le tende, IDENTICHE a quelle delle vostre camere, comprate quest'anno. **La casa l'ha arredata con un pezzo di ogni gruppo che ha preso** — un secolo di bottino disposto con amore mostruoso.

E sul letto, stesa con cura, una cosa che nessun albergo stende: **un abito da donna del 1899.** Scollo alto, bottoni di madreperla. Della taglia esatta di qualcuna che da centoventicinque anni abita in fondo a un pozzo.

> Emanuela: *(pianissimo)* "'Per quando la signora si deciderà.' Non è una camera per ospiti. È una PROPOSTA. La casa sta corteggiando Ada da un secolo: esci dal pozzo, entra dalla porta principale, e tutto questo è tuo."

> Claudia: "E Ada non si è mai decisa."

> Emanuela: "No. E adesso sappiamo che il pozzo non è la sua prigione." *(chiude piano la porta)* "È la sua RESISTENZA."

**(Sangue freddo +2: Ada dice no alla casa da 125 anni. Chi rifiuta così a lungo, è un'alleata — e la casa ha un punto debole: VUOLE essere scelta.)**`,
    sets: { camera6_vista: true },
    choices: [
      { text: '↩ Richiudere a chiave, per rispetto. Al corridoio', next: 'u1' },
    ],
  },

  u2_1999: {
    location: 'camera',
    caption: 'Stanza 1999 — "Sofia era qui"',
    gold: 1,
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
    choices: [
      { text: '🎒 Aprire lo zaino Invicta — quello identico a quello di Claudia', once: true, next: 'u2_zaino' },
      { text: '🚪 Ancora una stanza: la 1924 del valzer', next: 'u2_1924' },
      { text: '🚪 Ancora una stanza: la 1899 di Ada', next: 'u2_1899' },
      { text: '🚨 Basta stanze: la porta in fondo, quella con la targhetta vuota', next: 'u4_porta_vuota' },
    ],
  },

  u2_zaino: {
    location: 'camera',
    caption: 'Lo zaino Invicta',
    stinger: 'fail',
    text: `Claudia si inginocchia davanti allo zaino con la sagoma dell'alpinista, e la zip fa il rumore esatto che faceva nel 1999 — quel rumore che nessuno progetta e nessuno dimentica.

Dentro, l'estate di una ragazza di vent'anni, imballata con cura: un costume arrotolato, un walkman giallo con le pile ancora dentro, crema solare protezione 6 ("i NOVANTA", sospira Natalino), e un beauty con lo smalto rosa — **lo smalto rosa.** Quello della mano nella foto.

E in fondo, sotto tutto, un'agenda scolastica riciclata da diario. Claudia la apre all'ultima pagina scritta:

*"Giorno 3. Stanotte i ragazzi vogliono fare il bagno di mezzanotte. Il maggiordomo ha detto di rientrare per le 12 ma Marco dice che è una scemenza. Io c'ho un'ansia addosso che non so spiegare. Comunque domani si riparte, mamma mi aspetta per il pranzo di domenica. Le porto i fichi secchi che le piacciono."*

Sotto, con un'altra penna, più incerta, UNA riga aggiunta dopo:

*"Se qualcuno trova questo diario: il pranzo della domenica esiste ancora? Ditele che ci sarei voluta essere. — S."*

> Claudia: *(richiude piano, lo zaino, la zip, tutto, come si richiude una tomba ben tenuta)* "La casa conserva TUTTO tranne quello che conta. Il pranzo di domenica se l'è tenuto lei."

**(Sangue freddo +1, e una cosa da fare, fuori: la mamma di Sofia. Se c'è ancora. Qualcuno le deve dei fichi secchi e una frase.)**`,
    sets: { zaino_sofia_aperto: true },
    choices: [
      { text: '🚪 Uscire dalla stanza 1999, in silenzio', next: 'u1' },
      { text: '🎧 Premere PLAY sul walkman, solo un secondo', once: true, next: 'u2_walkman' },
    ],
  },

  u2_walkman: {
    location: 'camera',
    caption: 'PLAY',
    text: `Il tasto scende con uno scatto meccanico, e il nastro parte: una hit dell'estate '99, gracchiante, bellissima, con quel suono da cassetta riversata dalla radio — si sente perfino la voce del DJ tagliata a metà all'inizio, perché Sofia ha premuto REC un secondo in ritardo, come tutti, sempre.

Per dieci secondi, nella stanza ferma da venticinque anni, c'è **un'estate intera.** Natalino accenna il ritornello a mezza voce. Lo sapete tutti, quel pezzo. C'eravate anche voi, da qualche parte, quell'estate lì.

Poi la musica si abbassa da sola — non si ferma: si ABBASSA, come quando qualcuno vuole parlare sopra — e sul nastro, in mezzo alla canzone, c'è una voce di ragazza, vicinissima al microfono:

> La voce di Sofia, dal 1999: *"...prova, prova. Ok, funziona. Se sto ancora registrando quando lo riascolto, cancella tutto e scusa. Ma se questo nastro lo trova QUALCUN ALTRO... vuol dire che è vero quello che penso da stamattina. Che la casa ci ascolta. E allora ascoltami tu, chiunque sei: NON. FARE. IL BAGNO. DI—"*

**STOP.** Il tasto risale da solo. Con calma. Come un dito che si posa sulle labbra.

> Claudia: *(la mano ancora a mezz'aria)* "L'ha fermato la casa. Venticinque anni dopo. Il messaggio le fa ancora PAURA."

**(Sangue freddo +2: Sofia aveva capito TUTTO, e il suo avviso è arrivato — con venticinque anni di ritardo, ma è arrivato.)**`,
    sets: { walkman_ascoltato: true },
    choices: [
      { text: '🚪 Uscire dalla stanza 1999, portando il ritornello con voi', next: 'u1' },
    ],
  },

  u2_1924: {
    location: 'camera',
    caption: 'Stanza 1924 — il valzer che salta',
    text: `Charleston, cipria e un grammofono a tromba che suona da cento anni lo stesso giro di valzer, con la puntina che salta sempre sullo stesso punto — *"per sempre... per sempre... per sempre..."*

La stanza è piena di **bambole di porcellana.** Sedute sul letto, allineate sul comò, appollaiate sull'armadio. Trentadue — Claudia le conta d'istinto. Tutte con lo stesso sorriso dipinto e gli occhi di vetro che, in qualunque punto della stanza vi mettiate, **vi guardano con la coda dell'occhio.**

Al centro, su una sedia a dondolo, la bambola più grande tiene in grembo un **medaglione d'argento** a forma di cuore. Dentro — si vede dalla fessura — ciocche di capelli intrecciate, di colori diversi.

> Emanuela: "Il medaglione di Ada. 'Uno per ognuno del suo gruppo, per non farli finire tutti nel vino' — si sente dalla fessura: là dentro c'è qualcosa che il tempo non ha toccato. LO VOGLIO."

Il problema è che per prenderlo bisogna attraversare la stanza. E il valzer, da quando siete entrati, ha **smesso di saltare.** Sta suonando. Fluido. Come se la stanza si fosse svegliata e avesse voglia di ballare.`,
    choices: [
      { text: '🏮 Alzare la LANTERNA DEL 1899: le bambole della nursery conoscono quella luce', requires: { item: 'lanterna_1899' }, next: 'u3_lanterna' },
      { text: '🩰 Attraversare la stanza A TEMPO DI VALZER: la casa ama chi sta al gioco — 🎮 MINIGIOCO', next: 'mg_valzer' },
      { text: '💨 Corsa e presa al volo: dentro e fuori in tre secondi', tag: 'Prova di Forza — CD 13', check: { stat: 'FOR', dc: 13, success: 'u3_medaglione', fail: 'u3_bambole_fight' } },
    ],
  },


  mg_valzer: {
    location: 'camera',
    caption: 'Il valzer del grammofono',
    text: `Il grammofono suona il valzer che salta sempre sullo stesso giro, e la stanza — capite guardando il pavimento consumato in cerchi — vuole essere ATTRAVERSATA a tempo. Non camminata: BALLATA.

> Emanuela: "I passi sono quattro figure che si ripetono. Le fa il grammofono, le rifate voi. Sbagliata una figura, la stanza se ne accorge."

Il valzer riparte dall'inizio, paziente. Ha aspettato cent'anni: può aspettare che impariate.

*(🎮 MINIGIOCO — Il Valzer del 1924: guardate la sequenza di figure che si illumina e ripetetela. Cresce a ogni giro. Un errore, e la nursery si SVEGLIA.)*`,
    minigame: {
      type: 'memoria',
      success: 'u3_medaglione', fail: 'u3_ninna',
      tag: 'Il Valzer del 1924 — ripetete la sequenza, cresce a ogni giro',
      config: { titolo: '🩰 Il Valzer del 1924', simboli: ['🩰', '🎻', '🌹', '🕯'], lunghezza: 5 },
    },
  },

  u3_ninna: {
    location: 'camera',
    caption: 'La nursery si sveglia',
    stinger: 'jumpscare',
    text: `Un passo fuori tempo. UNO. Il grammofono si ferma con un graffio, e dalla nursery accanto arriva il suono che nessuna casa dovrebbe fare alle tre di notte: **trentadue teste di porcellana che ruotano insieme.**

Ma prima che si alzino, la bambola grande — quella coi denti veri — fa una cosa peggiore dell'attacco: comincia a CANTARE. Una ninna nanna, stonata di un quarto di tono, e si ferma a metà del verso. Aspettando.

> Claudia: *(pianissimo)* "Vuole che la finiamo. È un test. Le bambole cantano la ninna nanna di QUESTA casa — se sbagliamo il verso, capiscono che non siamo di famiglia."

> Natalino: "E se lo azzecchiamo?"

> Claudia: "Si RIADDORMENTANO. Forse. Pensate alla versione che canterebbe il Belvedere."

*(🎮 MINIGIOCO — La Ninna Nanna del 1924: completate il verso come lo canterebbero LORO. Una risposta sola.)*`,
    minigame: {
      type: 'filastrocca',
      success: 'u3_bambole_vinte', fail: 'u3_bambole_fight',
      tag: 'La Ninna Nanna del 1924 — completate il verso GIUSTO (il loro)',
      config: {
        titolo: '🧸 La Ninna Nanna del 1924',
        versi: 'Ninna nanna, ninna oh,\nquesto bimbo a chi lo do?\nLo darò ___',
        risposte: [
          { t: '...alla Befana, che lo tiene una settimana', ok: false },
          { t: '...all\'Uomo Nero, che lo tiene un anno intero', ok: false },
          { t: '...al Belvedere, che lo tiene VOLENTIERI', ok: true },
          { t: '...alla sua mamma, che gli canta la ninna nanna', ok: false },
        ],
      },
    },
  },

  u3_medaglione: {
    location: 'camera',
    caption: 'Il medaglione di Ada',
    gold: 1,
    text: `Funziona — e nessuno di voi dimenticherà COME funziona.

Chi attraversa la stanza lo fa assecondando il valzer: tre passi, una girata, un inchino alla bambola sulla sedia a dondolo — e trentadue teste di porcellana **si inclinano insieme**, in un applauso senza mani, RAPITE. La casa è vecchia e sola: chi le fa una cortesia, per un attimo, è di famiglia.

Il medaglione si lascia prendere dal grembo della bambola come un frutto maturo. Dentro, sei ciocche intrecciate — cinque more e castane, una **bianca.**

> Claudia: "Sei ciocche. Il gruppo del 1899 era di sei. Gregorio, Ada... e gli altri quattro."

Mentre uscite, il grammofono ricomincia educatamente a saltare — *"per sempre... per sempre..."* — e la bambola grande, sulla sedia a dondolo, adesso ha le mani **giunte in grembo**, composte, come chi ha finalmente consegnato una cosa che custodiva da troppo.

**(Oggetto: MEDAGLIONE DI ADA — al pozzo varrà una vita. Sangue freddo +2.)**`,
    sets: { medaglione: true },
    choices: [
      { text: '🚪 La stanza 1899 — quella di Ada', next: 'u2_1899' },
      { text: '🚨 La porta con la targhetta vuota, in fondo', next: 'u4_porta_vuota' },
    ],
  },

  u3_lanterna: {
    location: 'camera',
    caption: 'La luce della buonanotte',
    text: `Claudia alza la Lanterna del 1899 — quella dell'ossario, quella col vetro affumicato e la fiammella che non è mai morta davvero — e la stanza **cambia temperatura.**

Trentadue teste di porcellana si voltano verso la luce. Non con il *crick* coordinato della caccia: piano, una alla volta, come bambini quando si apre la porta della cameretta.

Perché è QUESTA la luce con cui qualcuno, nel 1899, faceva il giro della nursery a spegnere la giornata. La luce della buonanotte. L'ultima cosa gentile che questa stanza ricorda.

> La bambola grande: *(e il sorriso dipinto, per una volta, sembra solo un sorriso)* "...la lampada... di mamma Ada..."

Trentadue paia di palpebre di porcellana — che NON dovrebbero muoversi — scendono insieme, con un fruscio di ciglia dipinte. Le bambole dormono. La stanza russa piano, al ritmo del valzer.

La bambola grande, gli occhi già chiusi, solleva il medaglione dal grembo e lo tende nel vuoto — a chiunque, a voi, alla luce.

> Emanuela: *(prendendolo con due dita, in punta di piedi)* "Grazie. E... buonanotte, signorine."

**(Oggetto: MEDAGLIONE DI ADA, senza un graffio e senza un dado. La lanterna resta con voi. Sangue freddo +2.)**`,
    sets: { medaglione: true, bambole_addormentate: true },
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
    gold: 1,
    text: `L'ultima bambola si affloscia con un tintinnio di porcellana, e le ventinove sedute — tutte insieme — **chiudono gli occhi.** Applauso finito. Spettacolo chiuso.

Il medaglione d'argento è vostro: dentro, sei ciocche intrecciate — cinque more e castane, una bianca. La bambola grande, ora a occhi chiusi sulla sua sedia a dondolo, sembra soltanto un giocattolo antico. Soltanto.

Sulla porta, uscendo, Emanuela si ferma e — nessuno saprà mai perché, e tutti la ameranno per questo — torna indietro e **rimette dritta la bambola caduta.**

Il grammofono riparte da solo. Il valzer. Che salta.

*"per sempre... per sempre..."*

**(Oggetto: MEDAGLIONE DI ADA. Sangue freddo +1.)**`,
    sets: { medaglione: true },
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
    choices: [
      { text: 'Alla porta con la targhetta vuota', next: 'u4_porta_vuota' },
      { text: '🕯 Ricoprire lo specchio con più cura di come l\'avete trovato', once: true, sets: { specchio_ricoperto: true }, next: 'u4_porta_vuota' },
    ],
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
    choices: [
      { text: '📐 La mappa di fumo diceva un\'altra cosa: questa stanza è PIÙ LUNGA dei suoi muri. Misurarla.', requires: { flag: 'stanza_intravista' }, once: true, next: 'u4_intercapedine' },
      { text: 'Giù, al corridoio delle tre porte', next: 'h1' },
    ],
  },

  u4_intercapedine: {
    location: 'pianoProibito',
    caption: 'L\'intercapedine',
    gold: 1,
    text: `Gaetano conta i passi lungo la parete di fondo. Poi esce, conta i passi del corridoio, rientra, riconta. La faccia che fa è quella delle revisioni di progetto andate male.

> Gaetano: "Ottanta centimetri. La stanza è ottanta centimetri PIÙ CORTA di quanto dovrebbe. Il fumo aveva ragione: c'è un'intercapedine, dietro la parete delle cornici."

La quinta cornice — l'ultima della fila — non è appesa: è **incernierata.** Si apre come uno sportello, su un vano stretto e senza polvere, e dentro non c'è un tesoro, non c'è uno scheletro. C'è **un'altra cornice.** Piccola, avvolta in un panno di velluto, girata verso il muro.

Claudia la gira. E per un secondo nessuno respira.

Dentro la cornice, dipinto a olio con una cura da miniaturista, c'è **il Belvedere.** Di giorno. Le persiane aperte, i tavolini in giardino, gente che ride a bordo piscina — la villa com'era, o come avrebbe voluto essere, PRIMA. In un angolo, la firma: *"G., 1899. Per ricordarmi."*

> Claudia: *(piano, da professionista delle immagini)* "...la casa tiene un ritratto di sé stessa. Nascosto. Girato verso il muro." *(lo avvolge nel velluto, con più delicatezza del necessario)* "Le cose che nascondono la propria immagine, ragazzi, lo fanno per un motivo solo: non reggono il confronto. Questo ce lo portiamo. È un'ARMA."

**(Oggetto: IL RITRATTO DELLA CASA — mostrato in battaglia, la casa si vede e si vergogna. Sangue freddo +1. Flag: intercapedine_trovata.)**`,
    item: 'ritratto_casa',
    sets: { intercapedine_trovata: true },
    choices: [
      { text: 'Richiudere lo sportello-cornice, e giù al corridoio', next: 'h1' },
      { text: '🖼 Dare un\'ultima occhiata alle cornici vuote sopra i letti', once: true, sets: { cornici_riguardate: true }, next: 'h1' },
    ],
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
      { text: '⛽ Fermarsi un secondo: "LASCIATE STARE IL POZZO." Il benzinaio. Lo sapeva.', requires: { flag: 'avviso_benzinaio' }, once: true, next: 'b1_avviso' },
      { text: '👁 Il piano di Gaetano: attraversare il prato A TURNI DI SGUARDO, senza mai perderlo di vista', tag: 'Prova di Saggezza — CD 12', check: { stat: 'SAG', dc: 12, success: 'b2_orto', fail: 'b2_giardiniere_fight' } },
      { text: '🏃 Il piano di Natalino: di corsa lungo le siepi, fuori dalla sua vista — 🎮 MINIGIOCO', next: 'mg_corsa_siepi' },
    ],
  },


  mg_corsa_siepi: {
    location: 'giardino',
    caption: 'La corsa lungo le siepi',
    text: `Il piano di Natalino è semplice, che è il suo modo di dire "disperato": correre lungo il filare di siepi, piegati in due, PRIMA che lo spaventapasseri finisca il suo giro di ronda. Il bosso è potato a ostacoli — la casa lo pota APPOSTA, capite adesso — e il prato è una pista a tempo.

> Natalino: "Regola unica: non ci si ferma. Chi si ferma è potato."

Uno di voi corre. Gli altri guardano dal muretto, con il fiato che non serve a niente ma lo trattengono lo stesso.

*(🎮 MINIGIOCO — La Corsa delle Siepi: un tasto solo, SALTO. Superate le siepi potate senza inciampare tre volte. Chi corre lo sceglie il tavolo.)*`,
    minigame: {
      type: 'corsa', hero: null,
      success: 'b2_orto', fail: 'b2_giardiniere_fight',
      tag: 'La Corsa delle Siepi — un tasto, tre inciampi massimo',
      config: { titolo: '🌿 La Corsa delle Siepi', tema: 'siepi', ostacoli: 9, velocita: 260, cielo: '#10131c', suolo: '#1c2416' },
    },
  },

  b1_avviso: {
    location: 'giardino',
    caption: 'Le parole del benzinaio',
    text: `È Natalino a dirlo, fermo sulla ghiaia rastrellata, con la voce di chi sta riavvolgendo un nastro.

> Natalino: "Ragazzi. Il benzinaio. 'Lasciate stare il pozzo', ha detto. Non 'attenti al pozzo', non 'c'è un pozzo pericoloso'. LASCIATE STARE. Come si dice di una persona."

E adesso che siete qui, davanti alla corda tesa che tira piano verso il basso, le altre cose tornano su tutte insieme: la mano ferma sulla pompa quando Federico ha detto "Belvedere". Lo straccio passato sulle mani con TROPPA cura. E quegli occhi — Claudia lo dice a voce alta, piano — *"che hanno visto passare cinque macchine come la nostra, una ogni venticinque anni."*

> Claudia: "Le ha CONTATE. Sta laggiù da una vita a contare le macchine che salgono. E secondo voi... quante ne ha viste riscendere?"

Nessuno risponde. Ma da stanotte, se mai rivedrete quel distributore, avete una domanda da fargli — e il sospetto, che scalda più della paura, che lui stia lì APPOSTA: l'uomo che non può salire, che non può fermarvi, ma che a ogni giro ci prova. Con una frase sola, buttata lì tra il resto e la verde.

**(Il benzinaio SAPEVA. E vegliava. Sangue freddo +1. Flag: benzinaio_sapeva.)**`,
    sets: { benzinaio_sapeva: true },
    choices: [
      { text: '↩ Tornare a guardare lo spaventapasseri. Con più rispetto per chi avvisa.', next: 'b1' },
      { text: '⛽ Ripensare al volto del benzinaio, per ricordarne ogni dettaglio', once: true, next: 'b1_volto' },
    ],
  },

  b1_volto: {
    location: 'giardino',
    caption: 'Il volto del benzinaio, a memoria',
    text: `Claudia chiude gli occhi. È il suo mestiere, ricostruire le facce: lo fa coi clienti, coi fornitori, coi bugiardi.

> Claudia: "Canottiera. Camicia aperta. Settantacinque anni portati da montanaro. Rughe da sole, non da età. E..." *(si ferma, gli occhi ancora chiusi, la voce che cambia)* "...ragazzi. La radiolina. Ce l'aveva legata al polso. Con lo SPAGO. Chi si lega una radio al polso?"

> Gaetano: "Uno che non può permettersi di perderla."

> Claudia: *(riaprendo gli occhi)* "O uno che aspetta una TRASMISSIONE. Da tanto. E c'è un'altra cosa. Le mani. Se le è pulite con lo straccio TRE volte mentre eravamo lì — e non erano sporche. Era il gesto di uno che si toglie qualcosa di dosso. Come noi adesso, ogni volta che tocchiamo questa casa."

Il pezzo peggiore lo mette Natalino, guardando il pozzo:

> Natalino: "Settantacinque anni. Il Settantaquattro è cinquant'anni fa. Fate voi il conto: ne aveva VENTICINQUE, allora... e di che cosa può aver visto, da ragazzo, per passare la vita a fare benzina sotto QUESTA collina."

**(Sangue freddo +1: il benzinaio è un testimone. E i testimoni, a Paternopoli, fanno una fine sola: restano.)**`,
    sets: { volto_benzinaio_ricordato: true },
    choices: [
      { text: '↩ Al giardino. La corda tira ancora', next: 'b1' },
      { text: '📝 Gaetano annota tutto: testimone, orari, dettagli. Da ingegnere', once: true, next: 'b1' },
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
      victory: 'b2_vinto',
      defeat: 'x_celle',
      loot: { gold: 1 },
    },
  },

  b2_vinto: {
    location: 'giardino',
    caption: 'Il turno di notte è finito',
    gold: 1,
    text: `Del Giardiniere resta un cappello di paglia rovesciato sul prato all'inglese, una camicia vuota impigliata nella siepe, e le cesoie — chiuse per sempre, o almeno per stanotte — cadute aperte a metà, come una bocca a cui è mancata l'ultima parola.

Il lupo di nebbia si disfa per ultimo, controvoglia, un banco di foschia alla volta, e se ne torna oltre la siepe da dove la nebbia non dovrebbe passare.

> Federico: *(raddrizzandosi la giacca del pigiama come dopo una riunione andata male ma vinta)* "Verbalizziamo: lo spaventapasseri l'abbiamo spaventato NOI."

> Natalino: "Si sta già rifacendo, eh. La paglia è come la ricrescita: torna sempre. Ma per stanotte... il giardino è NOSTRO."

**(Il turno di notte del giardino è scoperto. Flag: giardiniere_potato. La strada per l'orto di Ada è libera.)**`,
    sets: { giardiniere_potato: true },
    choices: [
      { text: '🌿 Avanti, verso l\'orto delle erbe', next: 'b2_orto' },
      { text: '🧤 Raccogliere le cesoie: paglia o no, tagliano VERO', once: true, sets: { cesoie_raccolte: true }, next: 'b2_orto' },
    ],
  },

  b2_orto: {
    location: 'giardino',
    caption: 'L\'orto delle erbe — il regno di Ada',
    gold: 1,
    text: `L'orto è l'unico angolo del Belvedere che non fa paura — e questo, ormai l'avete capito, al Belvedere è un'informazione: qualcuno lo **protegge.**

File ordinate di erbe aromatiche, un recinto basso di castagno, e i cartellini dei semi scritti in una grafia femminile e fitta che riconoscete dal registro: la grafia che nel 1999 aggiunse *"rimasto"*. La grafia di **Ada.**

Rosmarino. Salvia. Assenzio. E in fondo, in un'aiuola tenuta come un altare, un'erba che non conoscete: foglie argentate che **si scostano da sole** quando avvicinate la mano, timide come mimose.

Il cartellino dice: *"CONTRO IL FREDDO DI QUESTA CASA. Bollire finché l'acqua non torna a sapere di orto. Per gli ospiti che tremano. — A."*

> Emanuela: "È la ricetta del quaderno dello Chef. Questa è la pianta." *(raccoglie con tre dita, da professionista delle mani)* "Chi ha preso il freddo di questa casa, stanotte torna caldo."

**(Ottenuto: ANTIDOTO DI ERBE — chiunque sia AVVELENATO dal gelo del Belvedere può essere curato. Sangue freddo +1.)**`,
    item: 'antidoto',
    choices: [
      { text: '🚗 Prima: la porta della rimessa è socchiusa, e dentro c\'è la VOSTRA macchina', next: 'gr1', once: true },
      { text: 'Al pozzo. È il momento.', next: 'b3_pozzo' },
    ],
  },


  b4_ultimo_tiro: {
    location: 'pozzo',
    caption: 'L\'ultimo tiro, in due',
    text: `Natalino si siede sul bordo del pozzo — SUL BORDO DEL POZZO, alle tre di notte, e nessuno ha più l'energia di fargli notare la follia — e accende quel che resta del tronello. Un tiro lui. Poi, senza dire niente, posa il resto acceso sul secchio e lo cala di un metro, dove il fumo può scendere da solo.

Per un minuto fumano così: lui sopra, lei sotto, il filo di fumo che sale e scende nel buio come un pensiero condiviso.

> La voce di Ada: *(dal fondo, morbida come non l'avete mai sentita)* "Mio marito non ha mai voluto che fumassi. 'Non è da signora', diceva. Centoventicinque anni dopo, fumo in un pozzo con un parrucchiere di Minturno." *(una pausa, e poi la cosa più vicina a una risata vera)* "La vita, ragazzo. Non è MAI da signora. È questo il bello."

> Natalino: *(soffiando il fumo verso le stelle)* "Signò, quando esce di lì, questa storia la raccontiamo insieme. Lei mette i centoventicinque anni, io metto il tabacco."

**(Sangue freddo +2, e +2 PV a tutti: certe pause riparano più delle cure. La casa, intorno, per un minuto intero non ha osato interrompere.)**`,
    gold: 2,
    heal: 2,
    sets: { ultimo_tiro_condiviso: true },
    choices: [
      { text: '↩ Al pozzo: la notte chiama', next: 'b3_pozzo' },
    ],
  },

  b3_pozzo: {
    location: 'pozzo',
    caption: 'Il pozzo vecchio — notte fonda',
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
      { text: '🌿 Mantenere la promessa di Natalino: calare nel secchio il mezzo tronello', requires: { item: 'tronello' }, removeItem: 'tronello', next: 'b4_tronello', once: true },
      { text: '🗣 Parlarle di Gregorio: la storia che vi ha raccontato, la ciocca bianca, i 125 anni', requires: { flag: 'storia_ada' }, tag: 'Prova di Carisma — CD 12', check: { stat: 'CAR', dc: 12, success: 'b4_parole', fail: 'b4_ira' } },
      { text: '🪢 Qualcuno si cala nel pozzo. Qualcuno DEVE calarsi nel pozzo.', tag: 'Prova di Forza — CD 13', check: { stat: 'FOR', dc: 13, success: 'b4_calata', fail: 'b4_calata_ko' } },
    ],
  },

  b4_medaglione: {
    location: 'pozzo',
    caption: 'Il medaglione torna a casa',
    text: `Il medaglione d'argento scende nel pozzo dentro il secchio, con la delicatezza con cui si cala un neonato.

Silenzio. Lungo. Poi un suono che il pozzo non faceva da centoventicinque anni: **un respiro.**

> La voce: *"...il mio medaglione. Le mie ciocche. Una per ognuno di noi sei, le ho fatte io la settimana buona, quando ridevamo ancora..."* *(la voce cambia: le cinque madri se ne vanno, ne resta UNA, giovane, del sud, del 1899)* *"...e la bianca è mia. Me la tagliai la notte della firma. Ada. Mi chiamo ADA. Il pozzo se l'era mangiato, il nome. VOI me l'avete riportato."*

L'acqua, giù, si illumina di un bianco tenue: non luce elettrica, non luna — **luce di nome ritrovato.**

> Ada: *"Ascoltate, ospiti gentili: il patto è una FIRMA nel registro, e le firme si sciolgono con tre cose — il sale fedele, la mia acqua, e un nome dato per amore. Prendete l'acqua: il secchio stanotte tira su per DAVVERO. E all'alba, al Banchetto, quando la casa chiederà il suo nome... ricordatele che i nomi si possono anche RESTITUIRE."*

Il secchio risale da solo, pieno di un'acqua che riflette il cielo giusto. **(Ottenuti: ACQUA DEL POZZO + l'alleanza di ADA. Nodo del pozzo sciolto nel modo migliore. Sangue freddo +3.)**`,
    item: 'acqua_pozzo',
    sets: { nodo_pozzo: true, un_nodo_sciolto: true, ada_alleata: true },
    gold: 2,
    choices: [
      { text: 'Dentro. Verso l\'alba. Verso il Banchetto.', next: 'h1' },
      { text: '💧 Bagnarsi le mani nell\'acqua del secchio, ora luminosa, un istante', once: true, sets: { acqua_toccata: true }, next: 'h1' },
    ],
  },

  b4_tronello: {
    location: 'pozzo',
    stinger: 'risata',
    caption: 'La promessa mantenuta',
    text: `Natalino si avvicina al pozzo con la solennità di chi consegna le chiavi di casa, posa il mezzo tronello nel secchio — adagiato su una foglia di fico, "che fa presentazione" — e lo cala giù, piano, un giro di manovella alla volta.

Silenzio. Poi, dal fondo, una fiammella che nessuno ha acceso. Un tiro. Uno solo, lentissimo.

E il pozzo fa una cosa che il Belvedere non sentiva dal 1974: **ride.** Una risata di donna, giovane e roca e completamente fuori orario, che sale lungo la pietra, attraversa il giardino, fa voltare di scatto i girasoli spenti dell'orto e — ne siete certi — raggiunge la casa, che per un attimo non sa come comportarsi.

> La voce dal pozzo: "...lo chiamavano CANNONE, nel Settantaquattro. Tronello è più elegante. Vinci tu, ragazzo."

> Natalino: *(commosso come a un matrimonio)* "Signora, lei è la migliore cliente che ho avuto da vent'anni a questa parte, e una volta le faccio anche la piega."

> La voce dal pozzo: "Piega li chiami tu i capelli? Allora affare fatto. E adesso andate: le risate, qui dentro, COSTANO. Ma questa... questa la pago volentieri."

**(La casa ha sentito Ada RIDERE dopo cinquant'anni: Sangue freddo +2, e tutti recuperano 2 PV — certe risate curano. Flag: ada_ride.)**`,
    gold: 2,
    heal: 2,
    sets: { ada_ride: true },
    choices: [
      { text: '↩ Lasciare il pozzo alla sua risata, e tornare alla notte', next: 'b3_pozzo' },
      { text: '🌿 Fumare l\'ultimo tiro tenuto da parte, in silenzio, con Ada', once: true, next: 'b4_ultimo_tiro' },
    ],
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
    gold: 1,
    choices: [
      { text: 'Dentro. Verso l\'alba.', next: 'h1' },
      { text: '🍷 Chiedere ad Ada se conserva altri ricordi di Gregorio', once: true, next: 'b4_ricordi' },
    ],
  },

  b4_ricordi: {
    location: 'pozzo',
    caption: 'I ricordi di Ada',
    text: `> Emanuela: *(china sul bordo, piano)* "Ada. Di lui... cosa ti ricordi? Di prima, intendo. Di prima della casa."

Il silenzio dal fondo, stavolta, è diverso. È il silenzio di chi fruga in un cassetto.

> Ada: *"...ballava male. Malissimo. Contava i passi ad alta voce, uno-due-tre, uno-due-tre, e mi pestava i piedi a ogni giro di valzer. E io ridevo, e lui si offendeva, e poi rideva anche lui."* *(l'acqua, giù, si muove appena — quasi un valzer)* *"E aveva paura dei temporali. Un uomo fatto. Ai tuoni mi stringeva la mano sotto il tavolo, e diceva che era per TRANQUILLIZZARE ME."*

Una pausa lunghissima. Poi, con una voce che per un istante ha di nuovo trent'anni:

> Ada: *"La casa mi ha preso quasi tutto, ospiti. I compleanni, il viaggio di nozze, la sua faccia da giovane. Ma il valzer contato male e la mano sotto il tavolo... quelli li tengo STRETTI. Sono il mio sale grosso. È per quelli che dico: il perdono a metà. Diteglielo. Capirà lui, quale metà."*

**(Sangue freddo +1: adesso sapete cosa tiene viva Ada da 125 anni. Non l'odio. L'altro.)**`,
    sets: { ricordi_gregorio_chiesti: true },
    choices: [
      { text: 'Dentro. Verso l\'alba, con un valzer in testa', next: 'h1' },
      { text: '💃 Emanuela accenna due passi di valzer, contati male apposta, per farla ridere', once: true, heal: 1, next: 'h1' },
    ],
  },

  b4_parole: {
    location: 'pozzo',
    caption: 'Le parole giuste',
    gold: 1,
    text: `Parlare a un pozzo è il colloquio più difficile della vostra vita, e lo affrontate con l'unica tecnica che il gruppo padroneggia davvero: **la sincerità disordinata.**

Le raccontate di Gregorio in vestaglia col candeliere. Dei capelli che diventano bianchi una ciocca alla volta, una per ogni verità. Del *"ditele che il vino del 1899 non l'ho mai aperto"*. Del fatto che da centoventicinque anni stira lenzuola aspettando un gruppo abbastanza testardo da sciogliere i nodi che lui non ebbe il coraggio di sciogliere.

> La voce: *(dopo un silenzio di piombo)* "...vi ha detto che firmò più veloce. Non vi ha detto che io lo SPINSI. Che gli dissi 'firma tu, che hai la mano lesta'. Lo dissi per scherzo. Al Belvedere non si scherza: la casa prende ogni parola sul serio. È la sua unica regola. È la sua FAME."*

L'acqua giù si illumina appena.

> Ada: *"Prendete l'acqua. E all'alba, quando la casa chiederà un nome... sappiate che le parole dette per scherzo si possono RIMANGIARE. Ma solo davanti a tutti. Solo pagando il conto."*

**(Ottenuti: ACQUA DEL POZZO + la vera storia della firma. Nodo del pozzo sciolto. Sangue freddo +2.)**`,
    item: 'acqua_pozzo',
    sets: { nodo_pozzo: true, un_nodo_sciolto: true, verita_firma: true },
    choices: [
      { text: 'Dentro. Verso l\'alba.', next: 'h1' },
      { text: '🤝 Promettere ad Ada di raccontare la sua storia, fuori, se ce la farete', once: true, next: 'b4_promessa' },
    ],
  },

  b4_promessa: {
    location: 'pozzo',
    stinger: 'risata',
    caption: 'La promessa ad Ada',
    gold: 1,
    text: `> Claudia: *(sul bordo, con la voce che usa per i giuramenti veri)* "Ada. Se usciamo di qui... la tua storia la raccontiamo. Con il tuo nome. A chiunque ci ascolti."

Dal fondo, per un tempo lungo, niente. Poi un suono che nessuno di voi dimenticherà: **una risata piccola**, incredula, arrugginita — una risata che non veniva usata da centoventicinque anni e che si sorprende di funzionare ancora.

> Ada: *"Il mio nome. Detto FUORI. Sotto il sole."* *(l'acqua trema)* *"Ospiti... quassù i nomi sono la moneta. La casa li prende, li mette in cantina, li serve a cena. Ma un nome detto FUORI, da vivi, gratis, per affetto... quello la casa non può toccarlo. Quello è un posto dove esisto e lei non entra."*

La corda, da sola, si arrotola ordinata sul bordo, come per ringraziarvi del disturbo.

> Ada: *"Andate. E se la casa stanotte vi chiede un nome... ricordatele che ne AVETE già dato uno. Il mio. In prestito. Le regole sono regole anche per lei."*

**(Sangue freddo +1: una promessa al Belvedere è una COSA. Stanotte, questa lavora per voi.)**`,
    sets: { promessa_ad_ada: true },
    choices: [
      { text: 'Dentro. Verso l\'alba, con una promessa da mantenere', next: 'h1' },
    ],
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
    choices: [
      { text: 'Dentro. E qualcuno prepari quell\'antidoto.', next: 'h1' },
      { text: '🙏 Chiedere scusa di nuovo, con parole più semplici', once: true, next: 'b4_scuse' },
    ],
  },

  b4_scuse: {
    location: 'pozzo',
    caption: 'Le scuse, rifatte bene',
    text: `Prima di andarvene, qualcuno torna al bordo. Niente giri di parole, stavolta.

> Natalino: "Signora. Ci scusi. Non 'fantasma'. Non 'la voce'. **Signora Ada del Belvedere.** Ci siamo spiegati male perché abbiamo paura, e la paura fa parlare da cafoni. A casa mia non si fa."

Il gelo, nel petto di chi è stato morso, non se ne va — quello ormai vuole l'antidoto. Ma dal pozzo sale qualcosa di diverso: un'aria appena più tiepida, come una porta socchiusa su una stanza col camino.

> Ada: *"...'Signora Ada del Belvedere'."* *(se lo rigira in bocca, il nome, come un sorso di vino buono)* *"Centoventicinque anni che nessuno me lo dice per intero. L'ultima volta fu il parroco, dal cancello, che non osava entrare."* *(pausa)* *"Le scuse rifatte valgono doppio, ospiti: le prime le detta la paura, le seconde le sceglie la persona. Andate. E il freddo che ha morso il vostro amico... ditegli che non ero io. Era la CASA, con la mia voce. Imparerete anche voi a distinguerci, prima dell'alba. Vi conviene."*

**(Sangue freddo +1: Ada e la casa NON sono la stessa cosa. Questa distinzione, stanotte, può salvare qualcuno.)**`,
    sets: { scuse_ripetute: true },
    choices: [
      { text: 'Dentro. E qualcuno prepari quell\'antidoto', next: 'h1' },
    ],
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
    gold: 2,
    choices: [
      { text: 'Dentro. Verso l\'alba.', next: 'h1' },
      { text: '📜 Rileggere le tre pagine del diario ad alta voce, prima di risalire', once: true, next: 'b4_pagine' },
    ],
  },

  b4_pagine: {
    location: 'pozzo',
    caption: 'Le tre pagine, ad alta voce',
    text: `Nella camera tonda, con l'acqua-specchio che fa da lume, le tre pagine si leggono ad alta voce. La grafia è fitta, elegante, del 1899 — e la voce di chi legge trema solo un poco.

**Prima pagina:** *"Il patto si scioglie come si strinse: a tavola. Servite alla casa ciò che la casa servì a voi — il SALE che restò fedele quando tutto il resto cambiò padrone, l'ACQUA che ricorda ogni faccia che ci si è specchiata, e il VINO dell'anno del torto — che io, se leggete queste righe, ho già riscosso per conto mio."*

**Seconda pagina:** *"Ma gli ingredienti sono nulla senza la PAROLA. La casa vive di nomi dati per fame: firma, contratto, menù. Si uccide con un nome dato per amore. Uno di voi dovrà dire un nome — il proprio, o quello di un altro — senza volerne niente in cambio. La casa non lo sa digerire, l'amore gratis. È l'unico piatto che rifiuta."*

**Terza pagina:** — e qui la grafia si spezza, diventa fretta pura — *"Mi resta un rigo. Se leggete: G. non firmò per viltà. Firmò perché io stavo per farlo, e la sua mano fu più svelta della mia paura. Mi ha rubato la firma come si ruba un conto al ristorante. Ricordateglielo, quando lo odierete. — A."*

Ada, dal buio, non dice niente. Ma l'acqua-specchio, per un istante, mostra due sagome che ballano un valzer contato male.

**(Sangue freddo +1: ora il rituale non è una lista — è una STORIA. E sapete perché Gregorio firmò.)**`,
    sets: { pagine_rilette: true, verita_firma: true },
    choices: [
      { text: 'Risalire. Verso l\'alba, con le istruzioni in tasca', next: 'h1' },
      { text: '🧺 Rimettere in ordine le mensole di Ada prima di risalire: si è ospiti anche quaggiù', once: true, heal: 1, next: 'h1' },
    ],
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
    caption: 'La discesa a Paternopoli — ore 1:20',
    text: `Il cancello si apre.

Non cigola, non esita: si apre e basta, come una bocca che non ha motivo di mordere. Gregorio ve l'aveva lasciato intendere con lo sguardo, alla firma rinviata: *il patto tiene chi ha firmato.* Voi, tecnicamente, siete ancora ospiti **in prova.**

E la nebbia — il muro bianco che ha respinto i fari della macchina — davanti a voi si RITIRA. Un corridoio di aria pulita largo esattamente quanto cinque persone affiancate, giù per i tornanti, fino alle luci spente di Paternopoli.

> Claudia: "Si apre solo per noi. Il che significa che può chiudersi solo per noi."

> Gaetano: "Andata e ritorno. Un'ora. E passiamo dalla macchina: se scendiamo in un paese fantasma alle una di notte, ci scendiamo EQUIPAGGIATI."

Dal fondo della valigia di Federico recuperate il **kit emergenze** che viaggia sempre con lui — che si rivela contenere: un poncho, tre barrette scadute, e un **BENGALA** da stadio.

> Federico: "Per le emergenze."

> Natalino: "Fedé, in che emergenza serve un BENGALA da CURVA?"

> Federico: *(infilandolo nello zaino)* "Questa, evidentemente."

**(Ottenuto: BENGALA — da lancio, acceca e brucia tutto ciò che è nella stanza.)**`,
    item: 'bengala',
    sets: { discesa_paese: true },
    choices: [
      { text: '⬇ Giù, nel corridoio di nebbia, verso il paese', next: 'pp2' },
      { text: '↩ Ripensarci: fuori dalla proprietà col buio è peggio', next: 'h1' },
    ],
  },

  pp2: {
    location: 'paese',
    caption: 'Paternopoli, ab. 41 — la piazza',
    text: `Paternopoli di notte è un presepe a cui hanno soffiato via le candele.

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

Ada scrive anche fuori dalla proprietà. Ada, in centoventicinque anni, ha consolato **tutto il paese.**

**(Sangue freddo +2: adesso sapete per chi state combattendo, oltre che per voi.)**`,
    gold: 1,
    sets: { visto_bar_1999: true },
    choices: [
      { text: 'Alla canonica', next: 'pp3' },
      { text: '☕ Lasciare qualche moneta sul bancone, per Peppe, ovunque sia', once: true, sets: { monete_lasciate: true }, next: 'pp3' },
    ],
  },

  pp3: {
    location: 'paese',
    caption: 'La canonica — Don Michele',
    gold: 1,
    npc: ['donmichele'],
    text: `La porta si apre prima che le nocche tocchino il legno. Sulla soglia c'è un uomo che il tempo ha piegato ma non convinto: settantacinque anni portati come una tonaca stirata, occhi lucidi e velocissimi, e in mano — non una Bibbia — **una tazza di caffè fumante.**

> Don Michele: "Cinque. Del Belvedere. In discesa e VIVI." *(vi conta col dito, due volte)* "E senza firma addosso — si vede, sapete: chi ha firmato ha la nebbia che gli cammina dietro. Entrate. Il caffè è pronto da cinquant'anni."

Dentro, la canonica è un archivio di guerra: ritagli, registri parrocchiali, una parete di foto. Gruppi di ragazzi in vacanza: 1949. 1974. 1999. Cerchiati, annotati, PIANTI.

> Don Michele: "1974. Io ero il sesto. Salimmo in sei da Napoli — io, mio fratello Aldo, e altri quattro. La sera della firma io dissi no. Non per coraggio: per SUPERBIA, non firmo mica io i registri degli alberghi... La nebbia mi lasciò scendere. Loro..." *(indica la foto: cinque ragazzi in piscina, un sesto ritagliato via)* "...loro no. Da cinquant'anni abito qui, dico messa a nessuno e suono i vespri ogni sera. Non per Dio, ragazzi. Perché LEI, lassù — la signora del pozzo — mi rispose UNA volta, nel '74. Disse: 'suona, che chi è dentro almeno sente l'ora.'"

Si versa un altro caffè. Le mani, adesso, gli tremano.

> Don Michele: "Stanotte è il venticinquennio. E voi siete scesi a bussare alla MIA porta. Ditemi tutto. E poi vediamo cosa vi do."`,
    sets: { storia_1974: true },
    choices: [
      { text: '🛣 "Don Michè... la strada che scende. Noi l\'abbiamo vista TORNARE. Il paese lo sa?"', requires: { flag: 'strada_che_torna' }, once: true, next: 'pp_anello' },
      { text: '📖 Raccontargli tutto: il registro, il pozzo, i nodi, il Banchetto', next: 'pp4' },
      { text: '⛪ Prima: chiedergli della cripta dei registri parrocchiali', tag: 'Prova di Intelligenza — CD 12', once: true, requires: { notFlag: 'segreto_custodi' }, check: { stat: 'INT', dc: 12, success: 'pp4_cripta', fail: 'pp4' } },
    ],
  },

  pp_anello: {
    location: 'paese',
    caption: 'La corriera del Settantaquattro',
    npc: ['donmichele'],
    text: `Don Michele posa la tazza. Con cura. Come si posa una cosa che altrimenti tremerebbe.

> Don Michele: "Il paese lo sa dal 1899, figlio mio. Solo che a Paternopoli le cose che si sanno non si DICONO: si chiudono le persiane e basta." *(va alla parete delle foto, ne stacca una: una corriera azzurra, anni Settanta, gente che saluta dai finestrini)* "La corriera. Fino al Settantaquattro saliva due volte a settimana. Poi gli autisti cominciarono a rifiutare la tratta. Dicevano che al tornante undici il paesaggio si RIPETEVA. Che l'ago della benzina non calava. Uno, Gennaro si chiamava, arrivò giù piangendo: disse che aveva guidato quaranta minuti in discesa e che il chilometraggio segnava ZERO."

Si risiede. Vi guarda uno per uno.

> Don Michele: "Io al mercato in valle ci scendo A PIEDI, ogni giovedì, da cinquant'anni. La strada ME lo lascia fare. Sapete perché? Perché io sono il SESTO. Non ho firmato. La strada non mi conta: per lei sono un errore di arrotondamento." *(e qui il sorriso gli riesce storto)* "Voi l'avete VISTA tornare e siete ancora lucidi. Bene. Vuol dire che quando lassù vi diranno 'potete andarvene quando volete'... saprete esattamente quanto vale quella frase."

**(Il paese lo sa dal 1899. Adesso lo sapete con le parole giuste. Flag: paese_sa. Sangue freddo +1.)**`,
    sets: { paese_sa: true },
    choices: [
      { text: '↩ Al tavolo di Don Michele: c\'è ancora tutto da raccontare', next: 'pp3' },
      { text: '📷 Fotografare la foto della corriera, per non dimenticare i volti', once: true, next: 'pp_foto_corriera' },
    ],
  },

  pp_foto_corriera: {
    location: 'paese',
    caption: 'I volti della corriera',
    text: `Claudia appoggia la foto sul tavolo, sotto la lampada, e la fotografa col telefono. Poi ingrandisce, per mettere a fuoco i volti che salutano dai finestrini.

E si ferma.

> Claudia: "Don Michele. Questa foto... di che anno è?"

> Don Michele: "Estate del Settantaquattro. L'ultima corsa piena."

> Claudia: *(girando lo schermo verso di lui, il dito su un finestrino in fondo)* "E allora chi è QUESTO?"

Nel penultimo finestrino, tra i ragazzi che salutano, c'è un uomo che non saluta. Camicia aperta, canottiera. Più giovane di cinquant'anni, ma la faccia è quella — la faccia che stamattina vi ha detto *"lasciate stare il pozzo"* mentre vi riempiva il serbatoio.

> Don Michele: *(dopo un silenzio lunghissimo, senza toccare la foto)* "...Gennaro. L'autista che scese piangendo. Comprò il distributore ai piedi della collina l'anno dopo, e da allora non è più salito. Dice che qualcuno deve pur stare al casello." *(alza gli occhi)* "Non ve l'ha detto, vero? Non lo dice mai. Fa solo il pieno, e avvisa. Da cinquant'anni. **A ogni giro.**"

**(Sangue freddo +1: il benzinaio ha un nome, una storia, e un posto di guardia. Paternopoli veglia come può.)**`,
    sets: { corriera_fotografata: true },
    choices: [
      { text: '↩ Al tavolo: c\'è ancora tutto da raccontare', next: 'pp3' },
      { text: '🙏 Riappendere la foto al muro, dritta, con cura', once: true, next: 'pp3' },
    ],
  },

  pp4_cripta: {
    location: 'paese',
    caption: 'La cripta dei registri',
    gold: 1,
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
    choices: [
      { text: '📖 Su, da Don Michele: raccontare tutto e chiedere aiuto', next: 'pp4' },
      { text: '↩ Al tavolo: la domanda più importante la farete dopo', next: 'pp3' },
    ],
  },

  pp4: {
    location: 'paese',
    caption: 'Il racconto e i doni',
    npc: ['donmichele'],
    text: `Il racconto dura un caffè intero — e con Don Michele il caffè è un'unità di misura seria. Ascolta senza interrompere: il registro coi vostri nomi già scritti, la piscina col cielo sbagliato, la voce dal pozzo, i nodi, il Banchetto delle 5:57.

Alla fine si alza, apre un armadio a muro, e comincia a posare cose sul tavolo con la precisione di un armiere.

> Don Michele: "**Uno.** La moka grande. Caffè di Paternopoli: sveglia i vivi, e stanotte vi serve essere MOLTO vivi." *(posa la moka ancora calda)* "**Due.** Questa."

Ed è una **campanella di bronzo**, consumata, con incisa una data: 1974.

> Don Michele: "La campanella dei vespri della chiesa vecchia. La suono ogni sera da cinquant'anni, e ogni sera, lassù, QUALCOSA si ferma ad ascoltare. Non so cosa sia per lei — un ricordo, un dispetto, un orario. So che quando LEI si siede a tavola..." *(ve la mette in mano, e le sue mani adesso non tremano più)* "...voi suonate i vespri. E ditele che ve la manda il sesto del Settantaquattro."

Sulla porta, mentre uscite, aggiunge l'ultima cosa, quasi sottovoce:

> Don Michele: "Se vedete mio fratello Aldo — è in un ritratto, avrà vent'anni e la riga da una parte — ditegli che ho fatto il prete per sbaglio e il fratello per vocazione. Lui capisce."

**(Ottenute: MOKA e CAMPANELLA DEL 1974. Sangue freddo +2.)**`,
    item: 'moka',
    item2: 'campanella_1974',
    sets: { doni_don_michele: true },
    gold: 1,
    choices: [
      { text: '⬆ Risalire, prima che la nebbia cambi idea', next: 'pp6' },
      { text: '🙏 Promettere a Don Michele di tornare a raccontargli come è andata', once: true, next: 'pp4_promessa' },
    ],
  },


  pp4_promessa: {
    location: 'paese',
    npc: ['donmichele'],
    caption: 'La promessa a Don Michele',
    gold: 1,
    text: `> Claudia: "Don Michele. Quando è finita — comunque finisca — noi torniamo qui. E le raccontiamo TUTTO. Parola."

Don Michele resta un momento con la moka a mezz'aria. Poi la posa, e fa una cosa da prete e una da fratello, insieme: vi benedice in fretta — quasi di nascosto, come si fa con chi non sa se ci crede — e poi vi indica la piazza col mento.

> Don Michele: "Vedete quella panchina? Cinquant'anni che ci si siede solo il sesto del Settantaquattro, ogni sera, a guardare su. Da domani..." *(e la voce, per la prima volta, gli si apre)* "...da domani ci porto DUE tazze. Una la lascio piena, per chi torna a raccontare. È il patto MIO, questo. Assai più onesto di quello lassù."

> Natalino: "Don Michè, se torniamo le tazze devono essere SEI."

> Don Michele: *(un sorriso che gli costa e che vale)* "Sei. E il caffè lo faccio doppio."

**(Sangue freddo +1: c'è una panchina a Paternopoli con delle tazze che vi aspettano. Le promesse in discesa pesano quanto quelle in salita.)**`,
    sets: { promessa_don_michele: true },
    choices: [
      { text: '⬆ Risalire, prima che la nebbia cambi idea', next: 'pp6' },
    ],
  },

  pp6: {
    location: 'tornanti',
    caption: 'La risalita — la nebbia ha imparato',
    gold: 1,
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

Le mani degli altri lo strappano indietro in un secondo — otto dita piantate nel tessuto della giacca, senza chiedere il permesso — e il corridoio vi sputa fuori tutti e cinque, in ginocchio sulla ghiaia del Belvedere.

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
    gold: 1,
    text: `Gregorio è nella hall, col candeliere, e quando vi vede entrare fa una cosa che in centoventicinque anni probabilmente non ha fatto mai: **resta senza parole.**

> Gregorio: "Siete... USCITI." *(conta, riconta)* "E siete TORNATI. Di vostra volontà. Dentro." *(posa il candeliere, si siede sulle scale, e per un attimo è solo un uomo molto vecchio e molto stanco)* "Signori, in tutta la storia di questa casa, nessuno è mai tornato DENTRO potendo restare fuori. Siete magnifici. E completamente scemi. Le due cose, ho imparato quassù, viaggiano spesso insieme."

Poi vede la campanella. E il modo in cui la guarda — con lo sguardo di chi riconosce una fotografia di famiglia in casa d'altri — vi dice che sa ESATTAMENTE cos'è.

> Gregorio: "I vespri di Don Michele." *(si rialza, si ricompone, maggiordomo di nuovo)* "Ada li ascolta ogni sera, sapete. Si ferma. Qualunque cosa stia facendo, alle otto, si ferma. Io fingo di non accorgermene da cinquant'anni: certe cose, tra la signora e il paese, non riguardano il personale."

Si avvia verso il corridoio, poi si volta:

> Gregorio: "Il sesto del Settantaquattro. Ditegli, quando tutto questo finisce... che suo fratello Aldo, nel ritratto, **sorride.** Sono io che spolvero le cornici: lo so per certo."

**(La pista di Paternopoli è completa. Sangue freddo +1.)**`,
    sets: { pista_paese: true, un_nodo_sciolto: true },
    choices: [
      { text: 'Al corridoio delle tre porte', next: 'h1' },
      { text: '🔔 Mostrare a Gregorio la campanella, prima di risalire le scale', once: true, next: 'pp7_campanella' },
    ],
  },

  /* ==================== LE CELLE (sconfitta non letale) ==================== */

  x_celle: {
    location: 'cantina',
    caption: 'Le celle della cantina — "il Belvedere non spreca"',
    gold: 2,
    text: `Buio. Poi pietra fredda sotto la schiena, e l'odore dolciastro della cantina.

Vi risvegliate TUTTI — anche chi era stato preso o era rimasto indietro — in una cella di pietra dietro la cucina del Banchetto, dietro una grata di ferro battuto con sopra un cartello scritto a mano, in bella grafia: *"DISPENSA OSPITI — non aprire prima dell'alba"*.

Le ferite sono state **medicate.** Bende pulite, perfino una coperta a testa. Su un vassoio, passato sotto la grata: tisana calda per cinque e biscotti fatti in casa.

> Gregorio: *(seduto su una sedia FUORI dalla cella, il candeliere in mano, i capelli molto più bianchi di ieri)* "Vi prego di non ringraziarmi: peggiora le cose. La casa vi ha presi, e io... io posso solo rallentarla. Fingere di aver perso le chiavi. Non è la prima volta che le perdo, stanotte." *(si alza, e la serratura della grata scatta da sola, aperta, alle sue spalle)* "Che sbadato. Le ho perse di nuovo."

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
    sets: { sceso_ossario: true },
    choices: [
      { text: '🕯 Scendere fino in fondo, verso la candela', next: 'os2' },
      { text: '🔙 Troppo buio, troppo vecchio: risalire e chiudere il pannello', next: 'h1' },
    ],
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
    sets: { tacca_di_gregorio: true },
    choices: [
      { text: 'Proseguire nella sotto-cantina', next: 'os3' },
      { text: '🔙 Troppo. Risalire e non parlare mai più di questo posto', next: 'h1' },
    ],
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
    choices: [
      { text: 'Avanti, verso la luce della candela', next: 'os4' },
      { text: '🧳 Controllare il cartellino delle valigie nuove, per un nome', once: true, next: 'os3_cartellino' },
    ],
  },

  os3_cartellino: {
    location: 'ossario',
    stinger: 'jumpscare',
    caption: 'Il cartellino delle valigie',
    text: `Nessuno vuole farlo. Lo fa Emanuela, perché qualcuno deve: due passi verso l'angolo tenuto libero, il telefono a fare luce, il cartellino della prima valigia sollevato con due dita.

È un cartellino del Belvedere, elegante, scritto a mano con l'inchiostro nero del registro. Dice:

*"Ospite n. 1 — soggiorno 2024 — ritiro previsto: MAI."*

Il secondo: *"Ospite n. 2 — ritiro previsto: MAI."* Il terzo, il quarto, uguali. E il quinto cartellino — Emanuela lo gira e le si ferma il fiato — il quinto non dice "ospite".

Dice: *"LA PIÙ ATTENTA. Che controlla i cartellini."*

Lo lascia ricadere come se scottasse.

> Emanuela: *(tornando indietro a passi misurati, la voce bassissima)* "Ragazzi. La casa non ci sta aspettando. La casa ci sta GUARDANDO. Adesso. Sa che siamo qui sotto. Sa CHI di noi fa cosa."

Da qualche parte sopra di voi, un pavimento scricchiola. Una volta. Come un applauso lento, a una mano.

**(Sangue freddo +1 — per il coraggio di aver guardato. Ma adesso lo sapete: siete OSSERVATI, stanza per stanza.)**`,
    sets: { cartellino_controllato: true },
    choices: [
      { text: 'Avanti, verso la luce della candela — e via da qui', next: 'os4' },
      { text: '✊ Strappare il QUINTO cartellino e tenerselo: la casa impari a non dare nomi', once: true, next: 'os4' },
    ],
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
    gold: 2,
    sets: { segreto_contabile: true, contabile_visto: true },
    choices: [
      { text: 'Salutarlo con rispetto e risalire, la lanterna in mano e il caffè nel destino di qualcuno', next: 'h1' },
      { text: '🕯 "Contabile... lei VENDE qualcosa, per caso?" (aprire lo Spaccio)', once: true, sets: { spaccio_aperto: true }, next: 'os_spaccio' },
      { text: '📖 Chiedere al Contabile quanti gruppi mancano ancora nei conti', once: true, next: 'os5_conti' },
    ],
  },

  os5_conti: {
    location: 'ossario',
    caption: 'Quanti gruppi mancano',
    text: `> Gaetano: "Un'ultima cosa, Contabile. I conti in rosso. Quanti gruppi servono ancora... per pareggiare?"

Il Contabile si ferma con la penna a mezz'aria. È la domanda di un collega, e la tratta come tale: riapre il Libro, scorre l'ultima colonna con un dito d'osso, e fa il conto A VOCE, come i contabili veri.

> Il Contabile: "Al ritmo attuale — cinque ospiti ogni venticinque anni, resa in paura pura, deprezzamento del terrore incluso..." *(la penna gratta, riporta, sottolinea)* "...la casa pareggia tra **settecentocinquant'anni.** Trenta gruppi ancora. Trenta." *(chiude il libro e per la prima volta la voce d'ufficio si incrina)* "Capite adesso perché vi ho mostrato le colonne? Non è un patto. Un patto FINISCE. Questo è un debito strutturato per non estinguersi MAI: ogni notte di paura genera gli interessi della successiva. Io lo certifico da centoventicinque anni, e da centoventicinque anni cerco UN cavillo."

Si sporge attraverso il tavolo, e la candela si abbassa da sola per non ascoltare:

> Il Contabile: "Il cavillo c'è. Ve l'ho già detto senza dirvelo: la casa è in perdita perché incassa la moneta SBAGLIATA. Se stanotte qualcuno le paga il conto in moneta BUONA — una cosa data per amore, gratis, senza contropartita — il debito si AZZERA per manifesta insolvibilità. Parola di contabile. È tutto lì, ragazzi. Andate a mandarmi in pensione."

**(Sangue freddo +1: trenta gruppi, o UNO che paghi in moneta buona. Il rituale, visto dai numeri.)**`,
    sets: { conti_chiesti: true },
    choices: [
      { text: 'Risalire, con il cavillo in tasca', next: 'h1' },
      { text: '🤝 Stringere la mano d\'ossa del Contabile, da collega a collega', once: true, heal: 1, next: 'h1' },
    ],
  },

  os6: {
    location: 'ossario',
    caption: 'Il saluto del Contabile',
    gold: 1,
    text: `Che abbiate portato il caffè o solo la vostra compagnia, il Contabile a un certo punto smette di scrivere e resta fermo, la penna appoggiata, come chi si concede una pausa che aspettava da un secolo.

> Il Contabile: "Sapete qual è la cosa più strana di questo lavoro? Nessuno viene MAI a salutarmi. Vengono presi, o vengono a prendere qualcosa. Voi siete i primi che si sono seduti."

Con un gesto lento — le ossa che scricchiolano, ma con garbo, come articolazioni che si scusano — apre un cassetto e ne tira fuori una **lanterna d'ottone**, annerita, il vetro fumé.

> Il Contabile: "Prendetela. Le creature di sopra la conoscono da centoventicinque anni: non la temono, la RISPETTANO. C'è una bella differenza, in questa casa, tra le due cose. E se incontrate mio fratello di nuovo... ditegli che il caffè, quaggiù, un giorno arriva anche a lui."

Vi accompagna fino al corridoio in salita con la candela in mano, e sulla soglia, prima di tornare al suo tavolo e ai suoi conti eterni, aggiunge una cosa che nessuno di voi si aspettava da uno scheletro seduto:

> Il Contabile: "Buona fortuna, ragazzi. Fatemi tornare i conti in positivo, per una volta."

**(Oggetto: LANTERNA DEL 1899. Sangue freddo +1.)**`,
    sets: { ossario_visitato: true },
    item: 'lanterna_1899',
    choices: [
      { text: 'Su, verso il corridoio delle tre porte', next: 'h1' },
      { text: '🕯 Offrire al Contabile un ultimo momento di compagnia, in silenzio', once: true, next: 'os6_compagnia' },
      { text: '🕯 "Contabile... lei VENDE qualcosa, per caso?" (aprire lo Spaccio)', once: true, sets: { spaccio_aperto: true }, next: 'os_spaccio' },
    ],
  },


  os_spaccio: {
    location: 'ossario',
    caption: 'Lo Spaccio del Contabile',
    gold: 1,
    text: `Il Contabile apre un registro diverso — più piccolo, con l'angolo consumato — e per la prima volta in centoventicinque anni fa una cosa che nessun ospite ha mai visto: **apre bottega.**

> Il Contabile: "Spaccio aziendale. Non ditelo alla casa: formalmente è 'gestione scorte'. Accetto UNA valuta sola — il sangue freddo. Il coraggio è l'unica moneta che quaggiù mantiene il valore: la casa lo toglie, io lo RIMETTO IN CIRCOLO. Economia circolare, si dice di sopra."

Sul tavolo, con cura da vetrina: barattoli di tisana, antidoti secondo la ricetta di Ada, sale del 1899, e una caffettiera che qualcuno gli ha insegnato ad amare.

> Il Contabile: "Listino sotto. Niente sconti, niente resi. E se avete cinque minuti... ci sarebbe un lavoretto. PAGATO, ovviamente: mica siamo la casa."

**(🕯 Il vostro Sangue Freddo si può SPENDERE qui — e guadagnare, chiudendo i conti. Lo Spaccio resta aperto: ci tornate dal corridoio delle tre porte.)**`,
    choices: [
      { text: '🍵 Tisana del 1899 — cura 12 PV a chi la beve', requiresGold: 3, gold: -3, item: 'tisana_1899' },
      { text: '🌿 Antidoto di Erbe — cura il freddo del Belvedere (☠)', requiresGold: 4, gold: -4, item: 'antidoto' },
      { text: '🧂 Sale Grosso Benedetto — 2d8 da lancio, DOPPI alle creature della villa', requiresGold: 5, gold: -5, item: 'sale_grosso' },
      { text: '☕ Caffè del Contabile — ricarica TUTTE le mosse di una persona', requiresGold: 6, gold: -6, item: 'caffe_contabile' },
      { text: '📊 Il lavoretto: aiutarlo a CHIUDERE I CONTI del giorno (paga 4 🕯) — 🎮 MINIGIOCO', once: true, next: 'mg_conti' },
      { text: '⬆ Risalire al corridoio delle tre porte', next: 'h1' },
    ],
  },

  mg_conti: {
    location: 'ossario',
    caption: 'I conti del giorno',
    text: `Il Contabile gira il librone verso di voi e vi porge la penna d'oca, dall'alto della sua stanchezza secolare.

> Il Contabile: "Cinque voci da chiudere. Rispondete giusto e in fretta: la contabilità è matematica più PAURA delle verifiche. Sbagliate poco, e la paga è vostra."

*(🎮 MINIGIOCO — I Conti del Patto: cinque domande, tempo limitato, si risponde ad alta voce tutti insieme. Servono quattro risposte giuste.)*`,
    minigame: {
      type: 'calcolo',
      success: 'os_conti_ok', fail: 'os_conti_ko',
      tag: 'I Conti del Patto — 5 domande a tempo, ne servono 4',
      config: {
        titolo: '🧾 I Conti del Patto',
        secondi: 20,
        domande: [
          { q: 'Il patto è del 1899. Siamo nel 2024: quanti anni di servizio ha Gregorio?', r: [ { t: '125', ok: true }, { t: '115', ok: false }, { t: '135', ok: false }, { t: '120', ok: false } ] },
          { q: 'Sei del 1899, più quattro annate da cinque (1924-1999): quante bottiglie coricate in cantina?', r: [ { t: '26', ok: true }, { t: '25', ok: false }, { t: '30', ok: false }, { t: '24', ok: false } ] },
          { q: 'La verde costa 34,50 €. Pagate con 50 €: quanto resto vi dà Gennaro?', r: [ { t: '15,50 €', ok: true }, { t: '16,50 €', ok: false }, { t: '15,00 €', ok: false }, { t: '14,50 €', ok: false } ] },
          { q: 'Un gruppo ogni 25 anni, e ne mancano 30 al pareggio: quanti ANNI mancano?', r: [ { t: '750', ok: true }, { t: '650', ok: false }, { t: '700', ok: false }, { t: '775', ok: false } ] },
          { q: 'La tavola del Banchetto ha 6 coperti. Voi siete 5: quanti posti restano... per la casa?', r: [ { t: '1', ok: true }, { t: '0', ok: false }, { t: '2', ok: false }, { t: '6', ok: false } ] },
        ],
      },
    },
  },

  os_conti_ok: {
    location: 'ossario',
    caption: 'Bilancio chiuso',
    text: `Il Contabile ricontrolla le cinque voci due volte — deformazione professionale — e poi fa un suono che le ossa non dovrebbero fare: un fischio di ammirazione.

> Il Contabile: "Quadrano. QUADRANO TUTTI. Centoventicinque anni che chiudo i giorni da solo, e voi me ne avete chiuso uno in cinque minuti." *(spinge sul tavolo una pila di monete che non sono monete: sono grumi di coraggio, caldi al tatto)* "La paga. Guadagnata. E una nota a margine, gratis: chi sa far di conto, al Banchetto, tratti PER ISCRITTO. La casa odia i numeri precisi: lasciano poco spazio alla fame."

**(🕯 Sangue Freddo +4: il primo stipendio mai pagato al Belvedere. Flag: i conti del giorno sono chiusi.)**`,
    gold: 2,
    sets: { conti_chiusi: true },
    choices: [
      { text: '↩ Allo Spaccio', next: 'os_spaccio' },
    ],
  },

  os_conti_ko: {
    location: 'ossario',
    caption: 'Bilancio in rosso',
    sets: { conti_sbagliati: true },
    text: `Il Contabile guarda le voci sbagliate con la faccia di chi ha visto crollare imperi per meno.

> Il Contabile: "No. No, no. Qui c'è un riporto saltato, qui avete arrotondato la PAURA per eccesso..." *(richiude il librone con dolcezza, come si chiude la porta a un parente che non ce la fa)* "Niente paga: sarei un pessimo contabile. Ma niente rancore: sareste pessimi ospiti. Il lavoretto resta fatto a metà — e a metà, quaggiù, non paga NESSUNO. Ci vuole coraggio anche a sbagliare i conti davanti a uno scheletro: quello ve lo riconosco. A voce. Gratis."

**(Niente paga stavolta. Il Contabile, però, non è tipo da rinfacciare.)**`,
    choices: [
      { text: '↩ Allo Spaccio, con l\'orgoglio ammaccato', next: 'os_spaccio' },
    ],
  },

  os6_compagnia: {
    location: 'ossario',
    caption: 'Cinque minuti di compagnia',
    gold: 1,
    text: `Non ve ne andate subito. Vi sedete — sulle casse, sul pavimento, dove capita — e restate lì, in silenzio, mentre il Contabile torna ai suoi numeri.

Non succede niente. Ed è la cosa più bella che potevate fargli.

La penna d'oca gratta. La candela respira. Natalino a un certo punto comincia a canticchiare a bocca chiusa — piano, una canzone napoletana che sua nonna metteva mentre stirava — e il Contabile, senza alzare la testa, si mette a **tenere il tempo con la penna.** Tac. Tac. Tac. Uno scheletro e un parrucchiere che fanno un duetto, alle quattro del mattino, sotto una casa che mangia le persone.

Quando vi alzate per andare, lui parla senza voltarsi:

> Il Contabile: "Centoventicinque anni che sto seduto a questo tavolo. Questi sono stati i primi cinque minuti in cui non li ho SENTITI passare." *(intinge la penna)* "Nel Libro, stanotte, alla voce 'entrate straordinarie', scrivo: cinque minuti di compagnia, valore inestimabile. Vediamo come se li digerisce, la casa, i conti fatti così."

**(Sangue freddo +1: avete pagato in moneta buona. E il Contabile l'ha MESSA A BILANCIO.)**`,
    sets: { compagnia_offerta: true },
    choices: [
      { text: 'Su, verso il corridoio delle tre porte', next: 'h1' },
    ],
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
    choices: [
      { text: '🔭 Guardare dentro il telescopio', next: 'sf2' },
      { text: '📦 Ignorare il telescopio — le casse sotto i lenzuoli interessano di più', next: 'sf3' },
    ],
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
    sets: { visto_occhio: true },
    choices: [
      { text: 'Staccarsi dall\'oculare e continuare a esplorare la soffitta', next: 'sf3' },
      { text: '🔙 L\'occhio basta: giù dalla soffitta, ADESSO', next: 'sf6' },
    ],
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
    sets: { lettere_lette: true },
    choices: [
      { text: '👤 In fondo alla soffitta c\'è ancora un angolo buio da controllare', next: 'sf4' },
      { text: '🔙 Abbastanza: le lettere bastano. Giù dalla soffitta', next: 'sf6' },
    ],
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
      enemies: ['ritratto', 'ritratto', 'ritratto'],
      victory: 'sf6',
      defeat: 'x_celle',
      loot: { gold: 1 },
    },
  },

  sf6: {
    location: 'soffitta',
    caption: 'Giù dalla soffitta',
    gold: 1,
    text: `Che siate riusciti a ritirarvi in silenzio o che abbiate appena finito di respingere due tele con troppa voglia di compagnia, la soffitta torna quieta nello stesso modo in cui era quieta prima: **in attesa.**

Scendendo, l'ultima cosa che si vede, voltandosi, è il telescopio d'ottone — ancora puntato giù, verso l'asola nel pavimento, verso la piscina, verso quell'occhio rosso che, per quanto ne sapete, non ha MAI smesso di guardare in su.

> Natalino: *(richiudendo la botola con un tonfo un po' più forte del necessario)* "Ok. Da stasera, quando faccio il bagno, mi vesto anche in acqua. Punto."

Nessuno ride, ma tutti, per un secondo, immaginano di farlo.

**(La soffitta non ha più segreti. Sangue freddo +1.)**`,
    sets: { soffitta_esplorata: true },
    choices: [
      { text: 'Giù, al corridoio delle tre porte', next: 'h1' },
      { text: '🔭 Ridare un\'ultima occhiata al telescopio, prima di chiudere la botola', once: true, sets: { telescopio_riguardato: true }, next: 'h1' },
    ],
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

> Federico: "Fino a prova contraria. Diamo tempo alla serata."

**(Flag: visti i reduci del '49.)**`,
    sets: { reduci_1949_visti: true },
    choices: [
      { text: '🃏 Sedersi al posto vuoto e finire la mano', next: 's49_2' },
      { text: '🔙 No. Non toccare niente: uscire e chiudere la porta piano', next: 'u1' },
    ],
  },

  s49_2: {
    location: 'camera',
    caption: 'La mano interrotta',
    gold: 1,
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
    gold: 1,
    text: `La carta giusta scende sul tavolo con un colpetto secco, e per un istante — un istante solo — i quattro reduci **aprono gli occhi insieme** e sorridono, non di un sorriso dipinto o storto: di un sorriso vero, da tavolo di bar, da partita vinta bene.

> Uno dei reduci: *(la voce che arriva da lontano, come da una radio tra due stazioni)* "Bella mano, ragazzo. Bella mano, ragazza. Non ci giocava nessuno con noi da... be'. Da un bel po'."

Poi richiudono gli occhi, tornano fermi, e la radio, sotto, per un secondo — UN secondo — cambia notiziario: *"...e i migliori auguri a chi gioca ancora onestamente."* Poi torna al 12 agosto 1949 come se niente fosse.

Sul tavolo, dove prima c'erano le carte, resta un solo asso, appoggiato in bella vista.

> Natalino: *(intascandolo con la delicatezza di chi ha appena vinto una scommessa che non sapeva di aver fatto)* "Un asso di denari da un morto che gioca bene a scopa. Se questa non è la serata più napoletana della mia vita, non so cosa lo sia."

**(Oggetto: ASSO DI DENARI. Sangue freddo +2.)**`,
    item: 'asso_di_denari',
    sets: { carte_1949_vinte: true },
    choices: [
      { text: '🚪 La porta accanto — 1974 — è socchiusa, e dall\'incenso ha un che di invitante', next: 's74_1' },
      { text: '🚶 Tornare al corridoio: questa notte è già abbastanza lunga', next: 'u1' },
    ],
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
    sets: { carte_1949_perse: true },
    choices: [
      { text: '🚪 La porta accanto — 1974 — è socchiusa, l\'incenso si sente da qui', next: 's74_1' },
      { text: '🚶 Basta porte: tornare al corridoio', next: 'u1' },
    ],
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
    choices: [
      { text: '▶ Premere PLAY sul mangianastri', next: 's74_2' },
      { text: '📜 Leggere il manifesto a mano della comune: "L\'AMORE SCIOGLIE OGNI PATTO"', once: true, next: 's74_1b' },
    ],
  },

  s74_1b: {
    location: 'camera',
    caption: 'Il manifesto della comune',
    text: `Il manifesto è scritto su un lenzuolo teso tra due canne di bambù, con una calligrafia tonda e fiori disegnati ai margini. È lungo, ingenuo, e letto adesso — con le cesoie del giardiniere nella testa e la nebbia che non entra e non esce — è la cosa più coraggiosa e più triste che abbiate letto stasera.

*"Al Belvedere: non ti temiamo. Non ti combattiamo. Ti AMIAMO."*

*"Veniamo in pace. Portiamo musica. Crediamo che ogni casa abbia un cuore, e che il cuore di una casa si apra come si apre il cuore di una persona: con la pazienza, il canto, e il perdono."*

*"Se dopo dieci giorni non sarà bastato: lasciamo comunque il nostro nome. Così saprete che qualcuno ci ha provato."*

Sotto, cinque firme con cognomi illeggibili e nomi scritti ENORMI: **Lucia, Marco, Giada, Peppino, Sara.**

> Emanuela: *(la voce sottile)* "Hanno firmato con il nome. Come amici. Non come vittime."

> Gaetano: "E alla casa non è bastato."

**(Flag: manifesto del '74 letto. Sangue freddo +1.)**`,
    sets: { manifesto_74_letto: true },
    choices: [
      { text: '▶ Adesso il mangianastri: sentire la loro voce', next: 's74_2' },
      { text: '✍️ Copiare i nomi delle cinque firme su un foglio, per non dimenticarli', once: true, sets: { nomi_comune_copiati: true }, next: 's74_2' },
    ],
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
    sets: { nastro_1974_ascoltato: true },
    choices: [
      { text: '📼 Prendere la cassetta e portarla con voi', next: 's74_3' },
      { text: '⏪ Riavvolgere e riascoltare: quel taglio secco nasconde qualcosa', once: true, next: 's74_taglio' },
    ],
  },

  s74_3: {
    location: 'camera',
    caption: 'La cassetta',
    text: `La cassetta esce dal mangianastri — e il mangianastri a pile, dopo un attimo di esitazione, finisce nello zaino: una cassetta senza niente che la suoni è solo plastica. La cassetta esce, dicevamo, con un clic che suona quasi come un permesso concesso. Sull'etichetta, la stessa grafia allegra della ragazza che rideva nella registrazione: *"ULTIMA — se qualcuno la trova, suonatela a chi ha paura. Funziona anche per quello."*

Nessuno del gruppo del '74 è mai uscito da questa stanza per l'ultima volta a piedi propri, questo lo sapete già senza bisogno che ve lo dica nessuno. Ma quell'accordatura strana, quasi stonata apposta, l'hanno trovata DAVVERO — si sente ancora nell'aria, un ronzio bassissimo che il corpo registra prima delle orecchie, e che lascia, invece di paura, una calma innaturale ma benvenuta.

> Federico: *(intascando la cassetta con più cura di quanta metta di solito nei suoi contratti)* "Cinque hippy che hanno provato a fregare una casa maledetta con una canzone. Sapete cosa? Rispetto assoluto. Anche se ha funzionato a metà."

> Natalino: "A metà è meglio di niente, stronzo mio. Stanotte prendiamo anche la metà."

**(Oggetto: NASTRO DEL '74. Sangue freddo +1.)**`,
    item: 'nastro_1974',
    sets: { stanza_1974_visitata: true },
    choices: [
      { text: 'Chiudere la porta e tornare al corridoio', next: 'h1' },
      { text: '🎸 Provare un accordo sulla chitarra abbandonata, per salutare la stanza', once: true, next: 's74_accordo' },
    ],
  },

  /* ==================== BLOCCO 4 — SCENE DEL CUORE ====================
     Momenti 1-a-1, opzionali, durante la notte. Aggancio: tre scelte
     "once" in h1, che Gali aggiungerà a mano (vedi report). */


  s74_taglio: {
    location: 'camera',
    caption: 'Dopo il taglio',
    text: `Riavvolgete. Riascoltate. Il canto, l'accordatura sbagliata-apposta, il taglio secco—

—e stavolta lasciate girare il nastro OLTRE il taglio. Due secondi di fruscio. Tre. E poi, bassissima, registrata per sbaglio da un microfono che nessuno aveva spento: **mezzo secondo di voce.**

Una voce di ragazza, lontana dal microfono, che dice — chiarissima nonostante tutto: *"...sta funzionando. Guardate le pareti, sta funz—"*

Fine del nastro. Fisica, stavolta: la bobina finisce lì.

> Claudia: "Stava FUNZIONANDO. La loro canzone stava funzionando, e poi qualcosa ha tagliato la registrazione."

> Gaetano: "O qualcuno. Le case non usano le forbici." *(pausa)* "Le case USAVANO i giardinieri."

Il mangianastri, spento, è più pesante di prima nelle mani di chi lo tiene. Non hanno perso, quelli del '74. Sono stati INTERROTTI. È diverso. È peggio — e stanotte, è anche un'istruzione: la loro musica FUNZIONAVA.

**(Sangue freddo +1: il nastro del '74 non è un ricordo. È un'arma collaudata, interrotta sul più bello.)**`,
    sets: { taglio_ascoltato: true },
    choices: [
      { text: '📼 Prendere la cassetta e uscire, in silenzio', next: 's74_3' },
    ],
  },

  cuore_gc: {
    location: 'giardino',
    caption: 'Gaetano e Claudia — il balcone',
    text: `Si allontanano dal gruppo con la scusa più debole del mondo — "controlliamo se da qui c'è campo" — e nessuno li ferma, perché a volte una scusa debole è solo un modo educato di chiedere due minuti da soli.

Il balcone della Camera dei Melograni guarda la valle, la nebbia ferma al confine come una promessa che qualcuno, chissà chi, ha deciso di mantenere. Gaetano si appoggia alla ringhiera con le braccia incrociate, la faccia di chi sta elaborando dati che non gli tornano.

> Gaetano: "Claudia. Stanotte la scienza non basta. Ho passato un'ora a cercare una spiegazione razionale per un maggiordomo che perde ciocche di capelli come un orologio che scarica la batteria, e non ce l'ho. Non c'è. E questo... questo mi fa più paura del mostro."

> Claudia: *(prendendogli la mano, senza il minimo sarcasmo, come non le era capitato in tutta la sera)* "Lo so. Ti ho visto la faccia mentre lo dicevi."

> Gaetano: "Ho paura, Claudia. Vera. Non 'gestita', non 'analizzata'. Paura."

Lei non risponde con una battuta. Alza il telefono — la fotocamera, non i social, tanto qui non c'è campo comunque — e scatta.

> Claudia: "Così, quando saremo vecchi, ti ricordo che una volta hai avuto torto. E che ti è andata bene lo stesso avermi vicino."

Non dice altro. Non ce n'è bisogno: si tengono per mano guardando la nebbia che non entra, per un minuto intero, prima di tornare dagli altri.

**(Sangue freddo +2: la paura condivisa pesa meno. Flag: cuore_gc.)**`,
    sets: { cuore_gc: true },
    choices: [
      { text: 'Restare ancora un minuto sul balcone', next: 'cuore_gc_esito' },
      { text: 'Tornare dagli altri', next: 'h1' },
    ],
  },

  cuore_gc_esito: {
    location: 'giardino',
    caption: 'La foto del balcone',
    gold: 1,
    text: `Claudia guarda lo scatto sullo schermo, per impostarlo come le viene naturale — e si ferma.

> Claudia: "...Gaetà. Guarda la nebbia."

Nella foto, il muro di nebbia dietro di loro è **più vicino** di quanto sia adesso, nella realtà — mezzo metro buono, forse di più, come se nell'attimo dello scatto si fosse sporto a guardare anche lui. Gaetano fa quello che farebbe Gaetano: alza il telefono, confronta l'inquadratura col paesaggio vero, due volte.

> Gaetano: "Confermo. La nebbia in foto non corrisponde. O il telefono mente, o..." *(si ferma. respira.)* "...o stanotte le foto vedono meglio di noi."

> Claudia: *(e invece di cancellarla, fa zoom sulle LORO mani, intrecciate sulla ringhiera — venute mosse, luminose, vive)* "Guarda qua, però. La casa può muovere la nebbia quanto le pare. QUESTO non lo tocca."

La imposta come sfondo. Con la nebbia sbagliata e tutto.

> Claudia: "È la mia preferita di sempre. Proprio PERCHÉ è venuta male."

**(Sangue freddo +1: certe prove non servono a vincere, servono a ricordare perché si combatte.)**`,
    sets: { foto_balcone: true },
    choices: [
      { text: 'Tornare dagli altri, mano nella mano', next: 'h1' },
      { text: '🧣 Claudia si stringe nella giacca di Gaetano, un minuto ancora', once: true, heal: 1, next: 'h1' },
      { text: '🌫 Restare a guardare la nebbia sbagliata ancora un istante', once: true, next: 'cuore_gc_nebbia' },
    ],
  },

  cuore_gc_nebbia: {
    location: 'giardino',
    caption: 'La nebbia che guarda',
    gold: 1,
    text: `Restano alla ringhiera, mano nella mano, a guardare il muro bianco fermo al confine del giardino. E a forza di guardarlo, lo vedono.

La nebbia **non è ferma.** Da lontano sembra un muro; da qui, adesso, si vede che dentro si muove — lenta, circolare, come acqua che gira in una pentola. E ogni tanto, nel bianco, si aprono dei varchi di un secondo: e nei varchi, ogni volta, c'è la STESSA COSA. Il tornante numero undici. Sempre quello. Da angolazioni diverse, come se qualcuno lo stesse... inquadrando.

> Gaetano: "La nebbia non nasconde la strada, Claudia. La nebbia la STA GUARDANDO. Come la guardia carceraria guarda il muro di cinta."

> Claudia: *(stringendogli la mano più forte)* "Allora domattina, quando scendiamo, sapremo dov'è puntato il faro. E passeremo quando gira dall'altra parte."

La nebbia, come se avesse sentito, smette per un istante di girare. Poi riprende, più piano. Quasi offesa.

**(Sangue freddo +1: la nebbia è la sentinella della strada. Saperlo, all'alba, può valere la fuga.)**`,
    sets: { nebbia_osservata_insieme: true },
    choices: [
      { text: 'Tornare dagli altri, mano nella mano', next: 'h1' },
    ],
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
    gold: 1,
    sets: { cuore_fe: true },
    choices: [
      { text: 'Restare ancora un momento così', next: 'cuore_fe_esito' },
      { text: '🧳 Emanuela ripesca dalla borsa infinita qualcos\'altro, tanto per ridere ancora', once: true, next: 'cuore_fe_borsa' },
    ],
  },

  cuore_fe_borsa: {
    location: 'camera',
    stinger: 'item',
    caption: 'Il fondo della borsa',
    text: `> Federico: "Cos'altro c'è là dentro? Dimmi la verità. C'è un DEFIBRILLATORE?"

Emanuela, con la faccia seria di chi esegue un inventario militare, comincia a estrarre: un pacchetto di crackers ("scorta"), un caricabatterie con TRE uscite ("scorta"), un mini cucito d'albergo rubato a Rimini nel 2016 ("vendetta"), e una boccetta di profumo tester senza etichetta.

E poi si ferma. Perché sotto tutto, in fondo al fondo, la mano tocca una cosa che LEI non ricorda di averci messo.

La tira fuori piano. È **una chiave.** Vecchia, pesante, d'ottone annerito, con un'etichetta di cartone legata allo spago. Sull'etichetta, in una grafia elegante e antica: *"Camera n. 6 — per quando la signora si deciderà."*

> Federico: *(dopo tre secondi interi di silenzio)* "Emanuela. Noi NON abbiamo una camera numero sei."

> Emanuela: *(rimettendo la chiave nella borsa, con calma, perché il panico non è mai stato un'opzione nel suo curriculum)* "Adesso ce l'abbiamo. E se la casa mi mette le cose in borsa senza chiedere... io me le TENGO. Vediamo chi si pente prima."

**(Oggetto: CHIAVE DELLA CAMERA 6. Nessuno sa quale porta apra. Ancora. Sangue freddo +1.)**`,
    sets: { borsa_riesplorata: true },
    item: 'chiave_camera6',
    choices: [
      { text: 'Restare ancora un momento così — a inventario chiuso', next: 'cuore_fe_esito' },
    ],
  },

  cuore_fe_esito: {
    location: 'camera',
    caption: 'Il ferro di cavallo',
    gold: 1,
    text: `Restano un momento in silenzio, il ferro di cavallo di plastica appoggiato sul comodino come un trofeo assurdo, e nessuno dei due sente più il bisogno di dire niente di intelligente, di rassicurante, di professionale.

> Emanuela: *(appuntandoglielo al collo della camicia, come una spilla)* "Tienilo addosso. Ti dà un'aria ridicola che ti serviva."

> Federico: "Ridicolo e vivo è il mio nuovo obiettivo di carriera."

Si baciano, brevemente, senza tragedia — solo due persone che si vogliono bene e per un minuto hanno deciso che la casa maledetta può aspettare fuori dalla porta. Poi Emanuela richiude la borsa con uno scatto secco, professionale, e torna la donna che tiene in piedi il gruppo.

> Emanuela: "Ok. Basta romanticismo, dobbiamo tornare dagli altri prima che Natalino inventi una teoria assurda senza di noi."

Escono mano nella mano, il ferro di cavallo che tintinna piano a ogni passo — l'unico rumore ridicolo e vivo in una casa che di rumori ridicoli non ne fa mai.

**(Il momento è passato, ma resta.)**`,
    sets: { ferro_cavallo: true },
    choices: [
      { text: 'Tornare dagli altri', next: 'h1' },
      { text: '📌 Appuntare il ferro di cavallo anche sulla borsa di Emanuela, per sicurezza doppia', once: true, sets: { ferro_cavallo_doppio: true }, next: 'h1' },
    ],
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
    gold: 1,
    sets: { cuore_nat: true },
    choices: [
      { text: 'Restare un altro minuto alla finestra', next: 'cuore_nat_esito' },
      { text: '🚬 Accendere la sigaretta mai fumata, solo per il gesto, guardando il pozzo', once: true, sets: { sigaretta_gesto: true }, next: 'cuore_nat_esito' },
    ],
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
    sets: { pozzo_risponde: true },
    choices: [
      { text: 'Tornare dagli altri, con gli occhi un po\' lucidi', next: 'h1' },
      { text: '🪟 Chiudere piano la tenda, lasciando alla signora un po\' di privacy', once: true, sets: { tenda_chiusa_con_rispetto: true }, next: 'h1' },
    ],
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
    sets: { garage_visto: true },
    choices: [
      { text: '🔧 Gaetano vuole recuperare un pezzo del SUO motore', next: 'gr2' },
      { text: '🔙 Non toccare niente: la bacheca è troppo perfetta per non essere una trappola', next: 'b3_pozzo' },
    ],
  },

  gr2: {
    location: 'garage',
    caption: 'Il recupero',
    text: `Gaetano si avvicina alla bacheca del 2024 con la determinazione di un ingegnere che rivuole ciò che è suo, e con la delicatezza di chi capisce, guardando bene, che ogni pezzo è appeso a un gancio sottile, collegato al successivo con un fil di ferro quasi invisibile — un domino perfetto, pronto a crollare tutto insieme al primo errore.

> Gaetano: "Se tiro il pezzo sbagliato nell'ordine sbagliato, cade TUTTO. Centinaia di componenti. Sulla pietra. Con un rumore che sveglierebbe pure lo Chef due piani più giù."

*(Prova di Destrezza — CD 13: staccare la candela senza far cadere il resto della bacheca.)*

**(Sangue freddo +1: provarci è già un piano.)**`,
    choices: [
      { text: '🔧 Sfilarla con calma millimetrica', tag: 'Prova di Destrezza — CD 13', check: { stat: 'DES', dc: 13, success: 'gr3', fail: 'gr3_ko' } },
    ],
  },

  gr3: {
    location: 'garage',
    caption: 'La candela recuperata',
    gold: 1,
    text: `La candela esce dal suo gancio con un piccolo *clic* pulito, e nient'altro si muove: il domino resta in equilibrio, silenzioso, come se anche la bacheca fosse sollevata di non dover crollare.

> Gaetano: *(la candela in mano, ancora tiepida come se il motore fosse stato spento un minuto fa, non anni)* "È tiepida. Cazzo, è TIEPIDA. Questa macchina, da qualche parte, sta ancora girando."

> Federico: "Non pensarci. Metti in tasca e andiamo, prima che decida di volerla indietro."

Sulla targhetta d'ottone, ancora attaccata alla candela, la scritta resta leggibile: *"Candela n°3 — gruppo 2024."* Il proprio gruppo. La propria auto. Il proprio nome, quasi, se la casa avesse deciso di scriverlo lì invece che nel registro.

**(Oggetto: CANDELA DEL MOTORE. Sangue freddo +1.)**`,
    item: 'candela_motore',
    choices: [
      { text: 'Uscire dalla rimessa e tornare verso il pozzo', next: 'b3_pozzo' },
      { text: '🏃 O al diavolo tutto: la macchina è morta, ma le GAMBE no. Scendere a piedi, ADESSO', next: 'ft1' },
    ],
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
    choices: [
      { text: 'Correre fuori dalla rimessa, verso il pozzo', next: 'b3_pozzo' },
      { text: '🏃 Col Giardiniere sveglio, restare è peggio: GIÙ per i tornanti, di corsa', requires: { notFlag: 'giardiniere_potato' }, next: 'ft1_inseguiti' },
      { text: '🏃 Il Giardiniere è paglia nei filari e il fracasso non ha padrone: GIÙ per i tornanti, con comodo', requires: { flag: 'giardiniere_potato' }, next: 'ft1' },
    ],
  },


  /* ==================== LA STRADA CHE TORNA (percorso opzionale) ==================== */

  ft1: {
    location: 'tornantiPiedi',
    caption: 'I tornanti a piedi — ore 3:40',
    gold: 1,
    text: `> Natalino: "Sentite. La macchina è appesa al muro come un salame, il pozzo parla, la casa respira. Io dico: STI CAZZI del pozzo. Sono ventisei tornanti. Li ho contati salendo. Due ore a piedi e siamo al bar di Fontanarosa a bere il caffè PIÙ meritato della storia."

Il cancello, di notte, non è chiuso: è **aperto**, spalancato sull'asfalto che scende nel buio tra gli ulivi. Ed è questa, forse, la cosa che dovrebbe insospettirvi di più: una casa che chiude a chiave anche le bacheche dei motori... lascia il portone sulla strada spalancato come un invito.

Vi incamminate. La notte fuori dalla proprietà è diversa — più fredda, più onesta. I pali delle vigne sfilano ai lati come sentinelle che hanno giurato di non guardare. Da qualche parte sotto, molto sotto, ci sono le luci vere: Paternopoli, la statale, il mondo dove i registri sono solo registri.

> Claudia: *(piano, dopo il primo tornante)* "...qualcuno sta contando i tornanti? Perché io li sto contando. E c'è qualcosa che non mi torna."

*(Prova di Saggezza — CD 12: capire COSA non torna, prima di scoprirlo nel modo peggiore.)*`,
    choices: [
      { text: '👁 Fermarsi e GUARDARE la strada: cosa non torna?', tag: 'Prova di Saggezza — CD 12', check: { stat: 'SAG', dc: 12, success: 'ft2_capito', fail: 'ft2_notte' } },
      { text: '↩ Ripensarci: la notte è della casa, e la casa lo sa. Tornare al pozzo', next: 'b3_pozzo' },
    ],
  },

  ft1_inseguiti: {
    location: 'tornantiPiedi',
    caption: 'La discesa col fiato dietro',
    text: `Uscite dalla rimessa che il fruscio è già più vicino, e la decisione la prende il corpo prima del cervello: **giù.** Per il cancello spalancato, sull'asfalto dei tornanti, di corsa, mentre dietro di voi la nebbia della proprietà si allunga oltre la siepe come un braccio.

*Clip.* — le cesoie. *Clip.* — più vicine. Le cose impagliate non pesano, non sudano, **non si stancano.**

> Federico: *(correndo, il fiatone di chi paga vent'anni di riunioni sedute)* "Io—CAZZO—io da domani—mi iscrivo—in palestra—GIURO—"

> Emanuela: "Se arrivi a domani ti ci porto IO. CORRI."

I tornanti scendono nel buio tra gli ulivi. Basta staccarlo: le cose del Belvedere, fuori dal Belvedere, forse valgono meno. Forse.

*(-1 Sangue freddo: correre col giardiniere alle spalle è peggio che restare.)*

*(Prova di Destrezza — CD 13: seminare il Giardiniere tra i filari, nel buio.)*`,
    gold: -1,
    sets: { fuga_inseguita: true },
    choices: [
      { text: '🌿 Tagliare per la vigna: i filari sono stretti, le cesoie no', tag: 'Prova di Destrezza — CD 13', check: { stat: 'DES', dc: 13, success: 'ft2_capito', fail: 'ft_cesoie' } },
    ],
  },

  ft_cesoie: {
    location: 'tornantiPiedi',
    caption: 'La potatura notturna',
    npc: [{ key: 'spaventapasseri', x: 0.62, y: 0.9, scale: 5 }],
    text: `Il filare era quello giusto. Il fosso in fondo al filare, no.

Claudia lo vede all'ultimo e grida, e chi la segue inchioda uno sull'altro come vagoni — e quando rialzate la testa dal groviglio, **lui è lì.** In mezzo al filare, fermo, il cappello di paglia inclinato di un grado. Non ha corso. Non ne ha avuto bisogno: le vigne sono SUE, le pota da centoventicinque anni, e conosce ogni fosso come voi conoscete le vostre tasche.

> Il Giardiniere: *(voce di foglie secche)* "Fuori... dalla proprietà. Di notte. I tralci che scappano... si POTANO. È così che si fa il vino buono."

Le cesoie si aprono con lo scatto oliato della manutenzione fatta con amore. Dalla nebbia dietro di lui, basso sul terreno, un ringhio che sa di cane e di niente.

> Natalino: "La palestra, Federì. Te lo dico da ora: non ti servirà a un CAZZO. Prendi un palo della vigna e MENA."

*(È una creatura della villa: phon e sale doppi. Qui non c'è nessun piano: solo voi, i pali delle vigne e la notte.)*`,
    combat: {
      enemies: ['spaventapasseri', 'lupo_nebbia', 'ombra_ospite'],
      victory: 'ft_cesoie_vinto',
      defeat: 'x_celle',
      loot: { gold: 1, items: ['taralli'] },
    },
  },

  ft_cesoie_vinto: {
    location: 'tornantiPiedi',
    caption: 'Paglia nei filari',
    gold: 1,
    text: `Quando finisce, del Giardiniere resta quello che è sempre stato: **paglia.** Sparsa tra i filari, un cappello rovesciato in un fosso, e le cesoie — chiuse — piantate in verticale nella terra come una piccola lapide che si è scavata da sola.

> Gaetano: *(riprendendo fiato, le mani sulle ginocchia)* "È... morto? Si può dire morto, di uno spaventapasseri?"

> Natalino: "Si dice SFATTO. Come i letti." *(raccoglie il cappello con la punta del palo da vigna, lo esamina, lo lascia cadere)* "Ma vi dico una cosa da professionista: le cose impagliate non muoiono. Si RIFANNO. Come la piega. Solo che ci vuole TEMPO, e stanotte il tempo è l'unica cosa che gli abbiamo tolto."

La nebbia, tutt'intorno, si ritira di un metro — piano, senza fretta, come un padrone che richiama un cane che ha perso l'incontro.

**(Il turno di notte del giardino è SCOPERTO: la paglia si ricompone lentamente. Flag: giardiniere_potato. Sangue freddo +1.)**`,
    sets: { giardiniere_potato: true },
    choices: [
      { text: '🚶 Rimettersi in cammino, lungo la strada che non scende', next: 'ft2_notte' },
      { text: '🌙 Fermarsi un momento: la luna sui filari è quasi bella, se dimentichi il resto', once: true, sets: { panorama_filari: true }, next: 'ft2_notte' },
    ],
  },

  ft2_capito: {
    location: 'tornantiPiedi',
    caption: 'Il terzo tornante — la geometria sbagliata',
    gold: 1,
    text: `Vi fermate al terzo tornante, dove la curva si apre sulla valle, e guardate GIÙ — davvero — invece di limitarvi a scendere.

Sotto di voi, tre tornanti più in basso, ci sono **cinque luci.** Piccole, in fila indiana, che scendono piano lungo la strada. Cinque telefoni con la torcia accesa.

> Claudia: *(lo zoom del telefono che trema)* "...quella è la mia giacca. Ragazzi. QUELLA È LA MIA GIACCA. Quelli siamo NOI, di spalle, tre tornanti più sotto. Ci sto zoommando addosso, porca puttana."

E in fondo alla valle, dove dovrebbe esserci Paternopoli, le luci del paese sono disposte in un modo che conoscete già: due finestre accese e una porta — la facciata del **Belvedere**, in scala, che vi aspetta in basso come vi aspetta in alto.

> Gaetano: *(la calma piatta delle pessime notizie, di nuovo)* "La strada non scende. GIRA. È un anello — un nastro di Möbius con l'asfalto sopra. Chi scende, sta salendo. Ventisei tornanti e ti riconsegna al cancello, dall'altra parte. Non siamo MAI stati sulla strada per Baiano: siamo sempre stati sul vialetto di casa sua."

Nessuno parla per dieci secondi. Poi Natalino, piano: "Però il caffè a Baiano me lo devi lo stesso."

**(Adesso lo SAPETE: le strade tornano. E ciò che si sa, al Banchetto, si può mettere sul tavolo. Flag: strada_che_torna. Sangue freddo +1.)**`,
    sets: { strada_che_torna: true },
    choices: [
      { text: '⛰ Risalire con la risposta in tasca: se la strada è un anello, l\'uscita è nel CENTRO. La casa.', next: 'b3_pozzo' },
      { text: '📸 Claudia fotografa le cinque luci in basso, come prova per il gruppo', once: true, next: 'ft2_foto_luci' },
    ],
  },

  ft2_foto_luci: {
    location: 'tornantiPiedi',
    caption: 'La foto delle cinque luci',
    gold: 1,
    text: `Claudia inquadra le cinque luci tre tornanti più sotto, zoom al massimo, e scatta.

Il telefono elabora un secondo di troppo. Poi mostra la foto, e la foto è PEGGIO della realtà.

Nella foto, le cinque figure in basso **non sono di spalle.** Sono ferme in mezzo alla strada, voltate verso l'alto — verso l'obiettivo — con le torce puntate in su. Cinque facce che da qui, a occhio nudo, non si distinguono. Nella foto si distinguono benissimo.

Sono le vostre. Ma **stanche.** Più magre. Con addosso gli stessi vestiti di stasera, però consumati — come dopo settimane. E quella in mezzo, la Claudia di sotto, tiene in mano un telefono puntato verso l'alto. **Sta fotografando anche lei.**

> Claudia: *(la voce che non trema, per pura professione)* "Ragazzi. Se là sotto ci siamo noi tra qualche settimana... io questa foto la TENGO. Perché se un giorno la mia galleria mostra la contro-foto — cinque luci in ALTO, scattata da laggiù — sapremo che siamo rimasti nel giro. E sapere è l'unica cosa che questa strada non può rubarci."

Il telefono, in tasca, resta caldo per tutta la risalita. Come una cosa che ha visto e non vuole dormire.

**(Sangue freddo +1: la prova che la strada è un anello. E un allarme piazzato nel futuro.)**`,
    sets: { luci_fotografate: true },
    choices: [
      { text: '⛰ Risalire: se la strada è un anello, l\'uscita è nel CENTRO. La casa', next: 'b3_pozzo' },
      { text: '👋 Salutare con la torcia le cinque luci, tre lampi lunghi: sappiate che vi vediamo', once: true, next: 'b3_pozzo' },
    ],
  },

  ft2_notte: {
    location: 'tornantiPiedi',
    caption: 'Un\'ora di buio',
    text: `Camminate. Cinquanta minuti, forse un'ora: i telefoni sono morti tutti insieme alle 3:47, come spenti da un interruttore, e da allora il tempo lo tenete a bestemmie.

Il freddo di quassù non è freddo di montagna: è freddo di **cantina**, e vi entra nei vestiti come se vi conoscesse. I tornanti scendono, scendono, scendono — e le luci della valle non si avvicinano MAI, ferme laggiù come dipinte.

Poi l'asfalto spiana, un cancello di ferro battuto esce dal buio, e le lanterne accese ai lati vi danno il bentornato.

**Il cancello del Belvedere.** Dall'altra parte. Aperto, illuminato, con il vialetto rastrellato di fresco — una porta tenuta spalancata per gli ospiti in ritardo.

> Emanuela: *(ferma, le braccia conserte, la voce di chi ha appena chiuso il registratore di cassa di una giornata orrenda)* "Abbiamo camminato un'ora. In discesa. Per arrivare più in ALTO di dove siamo partiti. Io non bestemmio mai, ragazzi. Mai. Ma stanotte il Padreterno mi deve una spiegazione e Gregorio DUE."

Rientrate in fila, gelati, zitti. La casa non infierisce: le lanterne, al vostro passaggio, si abbassano appena — quasi un inchino.

**(Un'ora persa, il gelo nelle ossa: -2 PV a tutti, -1 Sangue freddo. Ma adesso l'avete capito anche voi, nel modo peggiore.)**`,
    damage: 2,
    goldLoss: 1,
    sets: { strada_che_torna: true },
    choices: [
      { text: '🚪 Rientrare. Gelati, zitti, e con una certezza in meno', next: 'b3_pozzo' },
      { text: '🥶 Stringersi tutti insieme per scaldarsi, prima di rientrare', once: true, sets: { gruppo_stretto_freddo: true }, next: 'b3_pozzo' },
    ],
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
    gold: 1,
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
    choices: [
      { text: 'Uscire dall\'acqua e avvicinarsi al Belvedere capovolto', next: 'w3_giardino' },
      { text: '👀 Contare di nuovo gli accappatoi, per essere sicuri di aver capito bene', once: true, sets: { accappatoi_ricontati: true }, next: 'w3_giardino' },
    ],
  },

  w2_riflesso_ko: {
    location: 'riflesso',
    caption: 'Il tuffo — un ingresso più duro',
    gold: 1,
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

Da dietro le siepi finite, un secondo cameriere si stacca dall'ombra come un abito che scende dalla gruccia da solo. Il giardino capovolto smette di far muovere la ghiaia: vuole guardare.

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
    gold: 1,
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
    choices: [
      { text: '🗣 Seguirla: ha l\'aria di sapere esattamente dove state per andare', next: 'w5_racconto' },
      { text: '❓ "Prima: COME fai a essere ancora viva dopo venticinque anni?"', next: 'w5_racconto' },
    ],
  },

  w5_racconto: {
    location: 'riflesso_interno',
    npc: ['sofia'],
    caption: 'Il racconto di Sofia — l\'Inventario',
    gold: 1,
    text: `Sofia li porta dentro per un corridoio di servizio, tenendo tutti bassi — "la casa VEDE, state dritti davanti a una finestra ed è come squillare un citofono" — e racconta, veloce, come chi ha ripetuto la storia mille volte e mai a nessuno.

> Sofia: "Non siamo fantasmi. Vorrei tanto. I fantasmi almeno hanno FINITO qualcosa. Noi siamo — aspettate la parola giusta — OSTAGGI. Presi la notte del venticinquennio, portati di qua, e fermi. Non invecchiamo. Non moriamo. Non usciamo. Sono ancora la Sofia del 31 luglio 1999, a meno che qualcuno non rompa l'Inventario."

> Claudia: "L'Inventario."

> Sofia: "Il registro di QUA. Dall'altra parte tenete un registro con i nomi degli ospiti, no? Qui non scrivono nomi. Catalogano gli OGGETTI. 'Sofia — servizio da tè, 1999.' Io sono una voce di catalogo, gente. Come un piatto. Come un cucchiaio."

Lo dice ridendo — la risata di chi ha smesso di piangerci da vent'anni.

> Sofia: "I camerieri pattugliano. Il Direttore governa. E la casa — ATTENZIONE, questo è importante — vede tutto quello che si muove senza prudenza. Muovetevi come se ogni finestra fosse un occhio, perché lo è."

> Federico: "E il Direttore chi è?"

Sofia si ferma. Per la prima volta, la battuta pronta le manca.

> Sofia: "Il Direttore è quello che Gregorio sarebbe diventato, se non avesse mai avuto il coraggio di dispiacersi. Non ridete con lui. Non trattate senza un piano. E se vi offre qualcosa... contate le dita di chi ve lo offre. Non sono mai il numero giusto."`,
    sets: { inventario_scoperto: true, regole_casa_note: true },
    choices: [
      { text: '🗺 Chiedere il percorso più sicuro verso il cuore della casa', next: 'w6_1924' },
      { text: '⏩ "Andiamo. Subito. Ogni minuto qui il rischio sale"', next: 'w7_ronda' },
    ],
  },

  w6_1924: {
    location: 'riflesso_interno',
    npc: ['sofia'],
    caption: 'La stanza del 1924, di qua',
    gold: 1,
    text: `Sofia li guida in una sala da ballo capovolta, illuminata da lampadari che pendono verso l'alto invece che verso il basso — la luce cola dal soffitto come acqua controcorrente — e lì, fermi in una figura di ballo che non finisce mai, ci sono **cinque ragazzi del 1924** — fermi in una figura di ballo apparecchiata per sei coppie di passi. La sesta sedia, contro la parete, è vuota da cent'anni.

Non sono statue. Respirano, piano, a un ritmo di un respiro ogni trenta secondi. Hanno gli occhi aperti e vitrei, fissi sul punto dove il ballo li ha sorpresi cent'anni fa: un uomo con la mano tesa verso una donna che non l'ha mai presa, un altro che ride di una battuta che nessuno finirà mai di dire.

> Sofia: "Li chiamo i Ballerini. Sono qui da prima di me, di parecchio. A volte, se passi vicino, ti sussurrano una parola. Una sola. Sempre la stessa, per ognuno. La mia è... be'. Non ve la dico. È mia."

> Emanuela: *(la voce che le trema, come non le era ancora successo)* "Possiamo... svegliarli?"

> Sofia: "Non stanotte. Svegliarli uno a uno richiede tempo che non abbiamo, e la casa se ne accorgerebbe prima che arriviamo a tre. Ma se strappiamo l'Inventario — TUTTO l'Inventario — si svegliano tutti insieme, di colpo, come un allarme che finalmente smette di suonare."

Natalino si ferma davanti al ragazzo che ride della battuta eterna, e per un secondo, invece di una battuta sua, sceglie il silenzio — la prima volta di tutta la notte.

> Natalino: "Ok. Andiamo a rompere quel cazzo di catalogo."

**(Flag: visto il gruppo del 1924.)**`,
    sets: { gruppo_1924_visto: true },
    choices: [
      { text: 'Proseguire verso il cuore della casa capovolta', next: 'w7_ronda' },
      { text: '👂 Avvicinarsi a uno dei Ballerini, per sentire la parola sussurrata', once: true, next: 'w6_parola' },
    ],
  },

  w6_parola: {
    location: 'riflesso_interno',
    npc: ['sofia'],
    caption: 'La parola sussurrata',
    stinger: 'fail',
    text: `Emanuela si avvicina all'uomo con la mano tesa — quello che aspetta da cent'anni una mano che non arriva — e accosta l'orecchio, piano, come si fa coi bambini che parlano nel sonno.

Il sussurro c'è. Debolissimo, ritmico, consumato come un solco di vinile:

*"...un-due-tre. Un-due-tre. Un-due-tre..."*

Conta i passi. Da cent'anni. La figura di ballo non è finita, e lui la tiene VIVA contando, perché finché si conta si sta ancora ballando, e finché si balla non è ancora successo niente.

Emanuela sta per staccarsi quando il sussurro CAMBIA. Una volta sola. Il ritmo inciampa, e in mezzo al conteggio, chiarissima:

*"...un-due-tre. Un-due-SEI."*

E l'occhio vitreo — solo quello, in tutto il corpo immobile — ruota lentamente verso di lei.

> Sofia: *(tirandola indietro per un braccio, con più forza del necessario)* "Via. VIA. Quando sbagliano il conto vuol dire che la casa sta parlando ATTRAVERSO di loro. E la casa non conta mai per sbaglio."

> Emanuela: *(bianca)* "Ha detto sei. Noi siamo in cinque, Sofia. Perché QUI dentro tutti contano fino a SEI?"

Sofia non risponde. Ma affretta il passo, e per la prima volta da quando la conoscete... si guarda alle spalle.

**(Sangue freddo +1: la casa conta fino a sei da prima che arrivaste. Il sesto posto non è per uno di voi. È per qualcosa che DEVE ANCORA SEDERSI.)**`,
    sets: { parola_ballerino_sentita: true },
    choices: [
      { text: 'Proseguire verso il cuore della casa capovolta, contando fino a CINQUE', next: 'w7_ronda' },
    ],
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
    gold: 1,
    text: `La porta in fondo al corridoio si apre da sola, e dietro, in un ufficio che sembra la reception vista attraverso il gelo di un vetro, c'è un uomo.

Elegantissimo. Completo di lino grigio — un grigio senza calore, il colore delle cose che non hanno mai preso il sole. Mani curatissime, unite davanti a sé. Non si alza. Sorride con la bocca sola: gli occhi aspettano l'ordine di partecipare.

> Il Direttore: "Cinque nuovi articoli non catalogati, in giro per la casa fuori orario. E con loro, la signorina Sofia — servizio da tè, 1999 — che sa che le uscite non autorizzate si segnano." *(sposta un dito, senza fretta)* "Buonasera. Sono il Direttore. Gregorio, di là, vi accoglie con il calore. Io vi accolgo con l'ordine. È più efficiente e dura più a lungo."

> Gaetano: *(la voce ferma, ma le mani no)* "Lei è cosa, esattamente?"

> Il Direttore: "Sono ciò che resta quando si smette di dispiacersi. Gregorio si dispiace ancora — è la sua debolezza, e la ragione per cui questa casa, di là, perde ancora ospiti. Io non mi dispiaccio da molto tempo. Funziona meglio."

Si alza con un movimento troppo fluido per essere umano, e la luce fredda gli attraversa il petto come se non ci fosse niente, dentro il lino, a fermarla.

> Il Direttore: "Vi lascio andare. Stanotte. È più divertente vedere cosa farete con il tempo che vi resta prima che l'Inventario decida come catalogarvi."

**(Flag: il Direttore incontrato.)**`,
    sets: { direttore_incontrato: true },
    choices: [
      { text: 'Uscire dall\'ufficio prima che cambi idea', next: 'w9_studio' },
      { text: '📋 Sul tavolo c\'è una pratica sottile, in evidenza: "OFFERTA VERBALE — F." Chiedere.', once: true, next: 'w8_pratica' },
      { text: '🖐 Contarle, come ha detto Sofia: DIECI dita. Esatte, perfette. Ed è questo lo sbaglio', once: true, sets: { dita_direttore_contate: true }, next: 'w9_studio' },
    ],
  },


  w8_pratica: {
    location: 'riflesso_interno',
    npc: ['direttore'],
    caption: 'Offerta verbale — F.',
    stinger: 'fail',
    text: `Il Direttore segue il vostro sguardo fino alla pratica. E per la prima volta da quando siete entrati, sembra sinceramente CONTENTO di una domanda.

> Il Direttore: "Ah. Questa. Fresca di stasera." *(la apre con due dita, e legge con la voce di chi verbalizza)* "Offerta verbale numero 2024-barra-F. Dichiarante: l'ospite che ha effettuato la prenotazione. Testo: **'DOMANI MUOIO.'** Ripetuta a tavola, davanti a testimoni. Variante registrata a margine, sempre di stasera: **'domani mi prende un infarto fulminante.'**" *(richiude, congiunge le mani)* "Ai sensi del regolamento, una disponibilità dichiarata DUE volte davanti a testimoni costituisce offerta. La casa ringrazia. La pratica è aperta."

Silenzio. Di quelli in cui si sente il proprio sangue.

> Federico: "Era una BATTUTA. Si dice così, è un modo di—"

> Il Direttore: *(gentile come una ghigliottina)* "Il Belvedere non ha mai capito le battute, dottore. Ha capito benissimo i CONTRATTI, però. È il suo unico difetto: prende ogni parola sul serio." *(spinge la pratica di un centimetro verso di lui)* "Può recedere, naturalmente. Non qui: l'offerta è stata fatta DI LÀ, a tavola. E di là si ritira. Ad alta voce. Davanti a tutti. Pagando il conto — le parole rimangiate costano SEMPRE qualcosa, chieda alla signora del pozzo."

> Emanuela: *(sottovoce, prendendo Federico sottobraccio)* "Da stasera parli SOLO tramite ufficio stampa. Sono io, l'ufficio stampa."

**(La casa ha protocollato lo scherzo di Federico. Flag: l'offerta è APERTA — al Banchetto, qualcuno dovrà rimangiarsela ad alta voce. Sangue freddo +1: almeno adesso lo sapete.)**`,
    sets: { federico_offerta: true },
    choices: [
      { text: '🚪 Fuori di qui. E NESSUNO dice più niente ad alta voce', next: 'w9_studio' },
    ],
  },

  w9_studio: {
    location: 'riflesso_interno',
    npc: ['sofia'],
    caption: 'Lo studio privato — l\'orologio',
    text: `Sofia li porta in una stanza laterale che, dall'altra parte, corrisponde più o meno al bugigattolo dove Gregorio tiene le chiavi di scorta. Di qua, è una vetrina: pareti di vetro smerigliato, e dentro, su mensole numerate, **oggetti con targhette** — spazzole, occhiali da sole, una polaroid gemella di quella che forse avete già in tasca, un pettine, una cintura.

> Sofia: *(la voce che si fa piccola, come mai prima stanotte)* "Questa è la vetrina dei pezzi pregiati. Le cose che il Direttore tiene 'per affetto', dice lui. Il mio orologio è lì. Terzo scaffale. Fermo alle 23:58 del 31 luglio 1999 — l'ultimo minuto in cui è stato MIO."

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
    gold: 1,
    text: `Il terzo scaffale si apre — con la prudenza vincente o con il fragore della lotta appena vinta, non importa più — e l'orologio di Sofia è lì: cinturino di plastica scolorito, vetro incrinato a mezzaluna. Le lancette sono ferme sulle 23:58.

Sofia lo guarda come chi rivede una fotografia di sé bambini: con tenerezza e un imbarazzo che non c'entra niente con la vergogna.

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
    choices: [
      { text: 'Verso il cuore della casa: la Sala dell\'Inventario', next: 'w11_inventario' },
      { text: '🤗 Un abbraccio di gruppo a Sofia, prima di ripartire', once: true, next: 'w10_abbraccio' },
    ],
  },

  /* ==================== LA QUEST — L'INVENTARIO ==================== */

  w11_inventario: {
    location: 'riflesso_interno',
    npc: ['sofia', 'direttore'],
    caption: 'La Sala dell\'Inventario',
    text: `Sofia li guida per l'ultimo tratto con la sicurezza di chi l'ha percorso mille volte nella testa e mai nella realtà, e la porta in fondo — doppia, legno scuro, maniglia a penna d'oca — si apre su una sala senza equivalente dall'altra parte.

Scaffali fino al soffitto. Migliaia di **schede**, numerate, ognuna con un oggetto come fermacarte: specchietto, occhiali, spazzola, accendino senza gas. Sotto ogni oggetto, la scheda dice cosa — non CHI — è: *"Sofia — servizio da tè, 1999." "Margherita — ninnolo da comò, 1924." "Ernesto — posacenere, 1949."*

Al centro, su un leggio, il registro madre: **l'Inventario.** Aperto. E davanti, ad aspettarli come se li avesse invitati a cena, c'è il Direttore.

> Il Direttore: "Siete arrivati fin qui. Complimenti sinceri — e i miei complimenti, di questi tempi, sono la cosa più rara della casa." *(chiude piano l'Inventario, senza fretta)* "Vi propongo un affare da gentiluomini. Un pezzo nuovo, di buona qualità, catalogato con tutti gli onori — al posto di TUTTI i pezzi vecchi qui dentro. Uno di voi resta. Gli altri quattro, con la signorina Sofia, escono all'alba, liberi, con la mia firma di garanzia."

Il silenzio che segue, nessuna battuta di Natalino riesce a romperlo.

> Sofia: *(sottovoce, urgentissima)* "NON. Contate le dita, ve l'ho detto. Contate le dita di chi offre."

Il Direttore stende le mani sul leggio. Sono dieci. Esattamente dieci. E questo, in qualche modo, è la cosa più inquietante che abbiano visto stanotte.`,
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
      loot: { gold: 2, items: ['birra_limone'] },
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

Sofia si volta verso il gruppo, e per un momento — solo un momento — non ha più venticinque anni di sarcasmo addosso: ne ha di nuovo VENTI, di età vera, con tutta la paura che si porta dietro.

> Sofia: "È casa mia, ormai. Che cazzo di casa, lo so. Ma casa. Fatemi questo regalo: fatemi scegliere IO, per una volta, cosa mi succede."`,
    sets: { sofia_si_offre: true },
    choices: [
      { text: '🤝 Rispettare la sua scelta: "Sofia, se è questo che vuoi... grazie."', next: 'w16_amaro' },
      { text: '⚔ Rifiutare: "No. Nessuno resta. Combattiamo TUTTI insieme, e usciamo TUTTI insieme."', next: 'w14_direttore_boss' },
      { text: '⏰ "Sofì. Il tuo tempo è ripartito. Non devi restare per nessuno, nemmeno per noi."', once: true, requires: { flag: 'orologio_reso' }, next: 'w12_tempo' },
      { text: '💍 Mostrarle l\'anello ripescato dalla piscina: "A Sofia — per sempre qui." Qualcuno, fuori, non ha mai smesso.', once: true, requires: { item: 'anello_1999' }, removeItem: 'anello_1999', next: 'w12_anello' },
    ],
  },


  w10_abbraccio: {
    location: 'riflesso_interno',
    npc: ['sofia'],
    caption: 'L\'abbraccio',
    text: `Non lo decide nessuno: succede. Emanuela apre le braccia, e in due secondi Sofia si ritrova al centro di cinque persone che la stringono tutte insieme, come si stringe qualcuno che sta per partire — o che è appena tornato.

Sofia resta rigida per un istante intero. Le braccia lungo i fianchi, gli occhi aperti sopra la spalla di Claudia. Venticinque anni che nessuno la TOCCA — nel catalogo si spolvera, non si abbraccia — e il corpo se l'era scordato, come si scorda una lingua.

Poi la ricorda. Tutta insieme.

> Sofia: *(con la faccia affondata da qualche parte tra Emanuela e Natalino, la voce spezzata a metà)* "...siete CALDI. Porca miseria. Vi avevo scordati CALDI."

Resta lì dieci secondi buoni, e nessuno molla per primo. Quando vi staccate, il Riflesso intorno sembra un filo meno freddo — o forse siete voi, che avete lasciato un po' di caldo in giro.

> Sofia: *(ricomponendosi, ma senza fretta stavolta)* "Ok. OK. Se me lo rifate, giuro che vi catalogo io. Andiamo a rompere quel registro."

**(Sangue freddo +2: un abbraccio, nel Riflesso, vale un falò. E Sofia adesso combatte per QUALCUNO, non solo contro qualcosa.)**`,
    gold: 1,
    sets: { abbraccio_sofia: true },
    choices: [
      { text: '📋 Alla Sala dell\'Inventario, tutti insieme', next: 'w11_inventario' },
    ],
  },

  w12_anello: {
    location: 'riflesso_interno',
    npc: ['sofia'],
    caption: 'L\'anello, restituito',
    text: `Gaetano apre il palmo. L'anello dorato — ripescato dal fondo della piscina, dall'altra parte del mondo — brilla sotto la luce sbagliata del Riflesso come una cosa che non appartiene a nessuno dei due mondi. O a tutti e due.

Sofia non lo tocca. Lo GUARDA, e la faccia le fa una cosa che venticinque anni di catalogo non le avevano mai fatto fare: torna indietro. A un'estate precisa, a una sera precisa.

> Sofia: "Me l'aveva dato al molo, tre settimane prima di partire. Io gli avevo detto 'è troppo presto', e lui: 'lo so. Non è per adesso. È per SEMPRE, che è diverso.'" *(allunga un dito, sfiora l'incisione senza prenderlo)* "L'ho perso in piscina la seconda sera. Ci ho pianto di nascosto. Poi la casa mi ha preso e ho pensato: meglio così. Almeno l'anello è libero."

> Gaetano: "È tornato su da solo, Sofia. La piscina ce l'ha CONSEGNATO. Ha aspettato venticinque anni la mano giusta."

Sofia chiude il palmo di Gaetano sopra l'anello, piano, con entrambe le mani.

> Sofia: "Allora tienilo tu, fino alla fine. Se stanotte va bene... me lo ridai FUORI. Al sole. Come le cose che valgono." *(un respiro)* "E adesso andiamo, che ho appena ricordato PER CHI esco di qui."

**(Sangue freddo +2: l'anello ha di nuovo una storia e un appuntamento — e la casa NON se l'aspettava.)**`,
    sets: { anello_reso: true, sorpresa: true },
    choices: [
      { text: '⚔ Dal Direttore — con un appuntamento da difendere', next: 'w14_direttore_boss' },
    ],
  },

  w12_tempo: {
    location: 'riflesso_interno',
    npc: ['sofia'],
    caption: 'Il tempo ripartito',
    text: `> Natalino: "Sofì. Guardami. Il tuo orologio è tornato a camminare, l'hai sentito anche tu. Il tuo tempo è RIPARTITO. E il tempo che riparte non si spende facendo la guardia a un catalogo: si spende VIVENDO. Non devi restare per nessuno. Nemmeno per noi."

Sofia apre la bocca per rispondere con la battuta — la vedete formarsi, il sarcasmo di servizio degli ultimi venticinque anni — e la battuta non esce.

> Sofia: "...e se fuori non c'è più niente di mio? Venticinque anni, Natalino. Mia madre, i miei amici, il ragazzo del molo. Il MIO tempo là fuori è passato senza di me."

> Natalino: "E allora ne fai dell'ALTRO. Guarda me: quarantatré anni, faccio i capelli alla gente e stanotte ho parlato con un pozzo. Il tempo non si recupera, Sofì. Si RICOMINCIA. È l'unico trucco che ha."

Sofia guarda l'orologio che le batte al polso — tic, tic, tic, in avanti, solo in avanti — e per la prima volta da quando la conoscete fa un respiro che non sa di inventario.

> Sofia: "Ricominciare. Che parola enorme." *(alza gli occhi)* "Va bene. Ma prima si chiude il registro. TUTTO."

**(Sangue freddo +2: Sofia ha smesso di fare la guardia al proprio passato — e il Direttore ha appena perso il suo argomento migliore.)**`,
    sets: { tempo_ripartito: true, sorpresa: true },
    choices: [
      { text: '⚔ Dal Direttore — e stavolta il tempo gioca per voi', next: 'w14_direttore_boss' },
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
    gold: 2,
    choices: [
      { text: 'La casa continua a urlare: bisogna USCIRE, ora', next: 'w17_fuga' },
      { text: '🫂 Abbracciare Sofia — prima che la casa vi separi di nuovo', once: true, next: 'w15_abbraccio' },
    ],
  },


  w15_abbraccio: {
    location: 'riflesso_interno',
    npc: ['sofia'],
    caption: 'L\'abbraccio della vittoria',
    text: `La casa capovolta trema, le porte si spalancano a decine, e in mezzo al caos c'è UN secondo fermo: quello in cui Sofia si gira e vi trova già lì, a braccia aperte, tutti e cinque.

Stavolta non si irrigidisce. Stavolta ci si LANCIA — con la rincorsa di venticinque anni.

> Sofia: *(stretta al centro, ridendo e piangendo insieme al rumore della casa che crolla)* "ABBIAMO VINTO! Abbiamo vinto, brutti pazzi meravigliosi! Venticinque anni e mi mandano CINQUE TURISTI CON UN PHON!"

> Emanuela: *(stringendo più forte)* "Il phon è PROFESSIONALE, cara."

> Sofia: "È QUELLO CHE HO DETTO!"

Intorno a voi gli ostaggi liberati corrono verso le loro porte, e più d'uno — il gruppo del '24 al completo, un ragazzo del '74 col quaderno in tasca — rallenta un istante per toccare l'abbraccio con una mano, di passaggio, come si tocca un portafortuna.

> Sofia: *(staccandosi per ultima)* "Via. VIA, prima che il crollo ci catalogi come 'macerie assortite'. E là fuori... il primo caffè lo offro io. Con VENTICINQUE anni di interessi."

**(Sangue freddo +2: la vittoria abbracciata vale doppia. E avete un caffè in sospeso con Sofia — il migliore dei debiti.)**`,
    gold: 1,
    sets: { abbraccio_sofia: true },
    choices: [
      { text: '🏃 VIA — la casa capovolta sta crollando', next: 'w17_fuga' },
    ],
  },

  w16_amaro: {
    location: 'riflesso_interno',
    npc: ['direttore', 'sofia'],
    caption: 'Il prezzo pagato da Sofia',
    text: `Il Direttore intinge di nuovo la penna, e stavolta — è la prima volta in tutta la notte che succede — la usa esattamente come ha promesso.

> Il Direttore: "La signorina Sofia — servizio da tè, 1999 — CONFERMATA in catalogo, permanente, per volontà propria." *(la penna scorre con un suono che è quasi un sospiro)* "Tutti gli altri articoli: DECLASSIFICATI. Liberi. Con effetto immediato."

In tutta la casa capovolta, contemporaneamente, si sente lo stesso suono: porte che si spalancano, cinque voci del 1924 che finalmente smettono di ballare la stessa figura, gente che non parlava da decenni che ricomincia a farlo tutta insieme, in un brusio che sale dai piani come una marea.

Il Direttore strappa, con gesto quasi cerimonioso, le pagine di TUTTI tranne una — la sua, Sofia, servizio da tè — e le porge al gruppo, come un maggiordomo che consegna la fattura.

> Il Direttore: "Un accordo pulito. Ne ho pochi, di questi. Godetevelo."

Sofia li abbraccia uno per uno, veloce, feroce, come chi non ha tempo per farlo con calma.

> Sofia: "Andate. E se vedete Gregorio, di là, ditegli che ha ragione LUI: dispiacersi è la cosa più stupida e più giusta che esista. Ditegli che una di noi, almeno, ha scelto di restare per amore e non per fame. Fa differenza. Ditegliela, la differenza."

**(Ottenuto: le PAGINE STRAPPATE dell'Inventario. Ostaggi liberati — tranne una. Sangue freddo +2, amarissimo.)**`,
    sets: { patto_riflesso_chiuso: true, ostaggi_liberati: true, sofia_resta: true },
    item: 'inventario_riflesso',
    gold: 1,
    choices: [
      { text: 'Andare. Prima che la casa cambi idea su tutto il resto', next: 'w17_fuga' },
      { text: '💌 Promettere a Sofia di raccontare la sua storia, fuori, a chiunque vorrà ascoltare', once: true, next: 'w16_promessa' },
    ],
  },

  w16_promessa: {
    location: 'riflesso_interno',
    npc: ['sofia'],
    caption: 'La promessa a Sofia',
    text: `> Claudia: *(prendendole le mani, guardandola negli occhi)* "Sofia. Ascoltami. La tua storia la raccontiamo FUORI. Il tuo nome, il servizio da tè, la scelta che hai fatto stanotte. A chiunque ci ascolti. Per sempre."

Sofia resta immobile un istante. Poi fa una cosa che nessun ostaggio della casa ha mai fatto in centoventicinque anni: **piange.** Normalmente, umanamente, con le lacrime vere di una ragazza del '99 — e nel Riflesso, dove tutto è inventario, quelle lacrime cadono a terra e NON vengono catalogate. Il Direttore le guarda cadere e volta la testa, quasi con pudore.

> Sofia: "Venticinque anni che sono 'servizio da tè, 1999'. Un articolo. Un numero di catalogo." *(si asciuga con il polso, ride e piange insieme)* "E adesso, da qualche parte là fuori, sarò di nuovo 'Sofia, quella che ha tenuto la porta'. È... è il miglior contratto della mia vita. E l'ho firmato GRATIS."

> Il Direttore: *(sottovoce, annotando qualcosa a margine)* "...un articolo che diventa una storia. Deprezzamento inverso. Interessante. La casa detesterà questa voce di bilancio."

**(Sangue freddo +1: una promessa fatta nel Riflesso è scritta più a fondo di qualunque registro. E la casa lo SA.)**`,
    sets: { promessa_sofia: true },
    choices: [
      { text: 'Andare. Prima che la casa cambi idea su tutto il resto', next: 'w17_fuga' },
    ],
  },

  /* ==================== USCITA ==================== */

  w17_fuga: {
    location: 'riflesso',
    caption: 'La casa capovolta crolla su se stessa',
    text: `Che abbiate vinto lo scontro a mani nude o strappato un compromesso amarissimo, il risultato per la casa è lo stesso: le hanno portato via dei pezzi, e una casa che si nutre di ordine, privata dell'ordine, **crolla su se stessa** come un castello di carte in una stanza dove qualcuno ha aperto la finestra.

I corridoi si accorciano. Le porte con le targhette degli anni sbattono tutte insieme, in sequenza, come domino. Il cielo capovolto, fuori, comincia a girare — la luna rossa che scivola verso l'orizzonte troppo in fretta, come un orologio che qualcuno ha finalmente rimesso in moto a tutta velocità.

> Sofia *(o il ricordo della sua voce, se è rimasta indietro)*: "La piscina! Correte alla piscina, è l'unica porta che questa casa non può chiudere dall'interno!"

Il giardino capovolto, che all'andata camminava all'incontrario sotto i piedi, ora si muove semplicemente TROPPO, come un tappeto tirato da sotto. Bisogna correre dritti, in linea, senza guardare le siepi che si sciolgono in ombra dietro le spalle.

**(-1 Sangue freddo: il mondo si sta chiudendo.)**`,
    gold: -1,
    choices: [
      { text: '🏃 Correre in linea retta, tenendosi per le giacche, senza voltarsi MAI', tag: 'Prova di Costituzione — CD 13', check: { stat: 'COS', dc: 13, success: 'w18_soglia', fail: 'w17_fuga_ko' } },
    ],
  },

  w17_fuga_ko: {
    location: 'riflesso',
    caption: 'La casa cerca di trattenervi',
    text: `Un piede sbaglia l'appoggio sulla ghiaia che ancora si muove all'incontrario, e per un secondo un braccio di siepe sciolta — non più forma, solo ombra liquida — si stringe intorno a una caviglia con la forza di una casa che non vuole lasciare andare l'ultimo pezzo che le resta.

Le mani degli altri strappano via chi è caduto prima ancora di pensarci — un riflesso che nessuno ha insegnato a nessuno — e la siepe-ombra si scioglie in un gorgoglio frustrato, troppo lenta ormai per la casa che crolla intorno a lei.

Chi è stato preso porta il freddo del Riflesso nelle ossa, l'ennesima volta stanotte.

**(-1 Sangue freddo. Chi è caduto resta AVVELENATO: serve l'Antidoto, appena possibile.)**`,
    gold: -1,
    poisonRoller: true,
    choices: [{ text: 'Alla piscina. ADESSO.', next: 'w18_soglia' }],
  },

  w18_soglia: {
    location: 'riflesso',
    caption: 'La soglia della piscina capovolta',
    gold: 1,
    text: `La piscina, in questo angolo di mondo che sta collassando, è l'unica cosa che resta ferma: un rettangolo d'acqua immobile mentre tutto intorno crolla verso l'alto.

Sopra, la luna rossa è arrivata quasi al bordo dell'orizzonte capovolto — e più scende, più sembra CONTARVI, una per una le teste, esattamente come ha sempre fatto Gregorio dalla soglia del Belvedere vero.

> Gaetano: "Se quella luna finisce di contare prima che saltiamo dentro... non so cosa succede. E stavolta non voglio scoprirlo per scienza."

L'acqua, da qui, non riflette più il cielo giusto né quello sbagliato: riflette semplicemente **casa** — la piscina vera, quella di sopra, che aspetta dall'altra parte come una porta tenuta aperta da qualcuno con il piede.

Bisogna saltare tutti insieme, un'ultima volta, prima che il conto finisca.`,
    choices: [
      { text: '🌊 Saltare. Tutti insieme. Senza guardare la luna che conta', requires: { notFlag: 'sofia_libera' }, next: 'w_finale' },
      { text: '🌊 Saltare. Tutti insieme — SOFIA COMPRESA, stavolta', requires: { flag: 'sofia_libera' }, next: 'w_finale_libera' },
      { requires: { notFlag: 'sofia_libera' }, text: '👋 Un ultimo sguardo a Sofia — sta sorridendo, dall\'altra parte', next: 'w18_saluto' },
    ],
  },

  w18_saluto: {
    location: 'riflesso',
    caption: 'Il saluto di Sofia',
    text: `Sofia è ferma sull'orlo della piscina capovolta, in controluce contro la luna rossa che scende, e alza una mano — non un'onda da spiaggia, un gesto piccolo, da chi non ha salutato nessuno da venticinque anni e non si ricorda il gesto giusto.

> Sofia: "Ehi. Raccontate di noi, fuori. NON lasciate che ci dimentichino un'altra volta."

Poi sorride — il sorriso di una che aveva vent'anni nel '99 e ne ha ancora venti, ma con dentro la stanchezza di una vita intera — e si volta verso le porte che non si sono ancora chiuse, perché qualcuno deve tenerle aperte dall'interno.

**(Sangue freddo +1: quel saluto era per VOI.)**`,
    sets: { saluto_sofia: true },
    choices: [
      { text: '🌊 Saltare. Tutti insieme', next: 'w_finale' },
      { text: '🗣 Dire il suo nome ad alta voce — perché qualcuno lo ricordi anche di QUA', once: true, next: 'w18_nome' },
    ],
  },

  w18_nome: {
    location: 'riflesso',
    caption: 'Il nome, detto di qua',
    text: `Prima di saltare, vi mettete in fila sull'orlo dell'acqua capovolta. E lo dite. Tutti e cinque, insieme, ad alta voce, nel posto dove i nomi valgono più dell'oro:

**"SOFIA."**

Il Riflesso reagisce come una campana colpita. L'acqua capovolta si increspa in cerchi perfetti, le finestre della casa-specchio vibrano tutte insieme, e per un secondo — un secondo intero — ogni superficie riflettente del mondo di sotto mostra la stessa immagine: una ragazza mora con gli occhiali da sole sui capelli, che ride in una piscina d'estate, VIVA, prima di tutto questo.

> Il Direttore: *(da qualche parte dietro di voi, con la voce di chi verbalizza un evento raro)* "Un nome pronunciato in coro, di qua, senza chiedere niente in cambio. Ultimo precedente registrato: MAI. La signorina Sofia risulta ora iscritta in DUE registri. Quello della casa..." *(una pausa)* "...e il vostro. La casa ne detiene uno solo. Aritmetica sfavorevole, per lei. Ottimo lavoro, ospiti."

Sofia, in controluce, si porta una mano alla bocca. E il gesto del saluto, stavolta, le riesce perfetto.

**(Sangue freddo +1: Sofia esiste in due registri. Nessuna casa può cancellarli entrambi.)**`,
    sets: { nome_sofia_detto: true },
    choices: [
      { text: '🌊 Saltare. Tutti insieme', next: 'w_finale' },
    ],
  },

  w_finale: {
    location: 'piscina',
    caption: 'Il ritorno — la piscina vera',
    text: `L'acqua si richiude sopra le teste una seconda volta stanotte, e stavolta è acqua vera: bagna, scalda, sa di cloro e di piscina vera, la più bella sensazione della notte.

Risalgono in cinque. Sofia no: sull'orlo della piscina capovolta si è fermata, ha sorriso, e ha detto l'ultima cosa da capa che è sempre stata: "Questa parte della notte è vostra. Io tengo aperta la porta di qua — qualcuno deve pur farlo. Ci vediamo alle cornici." Risalite sul bordo della piscina VERA, quella di sopra, quella con la luna bianca sottile e normale nel cielo giusto.

Il Belvedere, qui, è ancora quello di sempre: caldo, elegante, in attesa. Ma qualcosa, nell'aria, è diverso — più leggero, come una casa che ha appena smesso di reggere un peso enorme senza saperlo dire.

L'**Inventario del Riflesso** — vuoto o quasi, a seconda di quanto sia costato stanotte — pesa in mano come un libro qualunque, adesso. Nessuna pagina sussurra più.

Da qualche parte nella villa, una porta verde in fondo a un corridoio aspetta ancora, e ci sono ancora ore prima dell'alba. Ma qualcosa, stanotte, è cambiato per sempre: **il Riflesso, sotto la piscina, ha un padrone di meno.**`,
    sets: { riflesso_fatto: true, ostaggi_liberati: true },
    choices: [
      { text: '🚪 Tornare al corridoio: la notte, di qua, non è ancora finita', next: 'h1' },
      { text: '🏊 Un minuto in piscina. VERA. Ve lo meritate', once: true, next: 'p_vespe' },
    ],
  },


  /* ==================== I GRATTA E VINCI DI BAIANO ==================== */

  nat_tronello: {
    location: 'camera',
    caption: 'Il tronello del pozzo',
    gold: 1,
    text: `Nessuno discute. In trent'anni di amicizia, "ho bisogno di un tronello da solo" ha lo stesso peso di "devo chiamare mia madre".

La Camera del Pozzo, da solo, fa un altro effetto. Natalino apre la finestra sul pozzo, si siede sul davanzale e rolla con la calma di chi ha le mani buone. Cartina, filtro, la piega giusta. *"Non è vizio,"* dice al buio, *"è manutenzione."*

Il primo tiro è il migliore della sua vita, e non per la qualità.

È al terzo che se ne accorge: **il fumo va verso il pozzo.** Non c'è vento — le foglie sono FERME — ma il fumo esce in un nastro ordinato, attraversa il giardino e scende nel pozzo come acqua in uno scarico.

> La voce dal pozzo: *(piano)* "...questo profumo lo conosco. I ragazzi del Settantaquattro... lo fumavano sul prato, la sera. Lo chiamavano in un altro modo. Ridevano fortissimo e mangiavano TUTTO. Il cuoco li adorava."

> Natalino: *(dopo un silenzio lunghissimo)* "Signora... lei mi sta dicendo che sto condividendo il tronello con un FANTASMA, e io le giuro che la cosa più strana è che mi sembra EDUCATO così."

> La voce dal pozzo: "Tienimene un tiro da parte, ragazzo. Per quando esco."

Natalino spegne con cura, ne conserva metà, e torna con gli occhi rossi e un'informazione nuova: **quelli del '74 il cuoco li ADORAVA.** E una promessa.

**(Oggetto: TRONELLO DI RISERVA. Flag: tronello_promesso. Sangue freddo +1.)**`,
    item: 'tronello',
    sets: { tronello_promesso: true },
    choices: [
      { text: '↩ Tornare dagli altri, con gli occhi rossi e una promessa nel taschino', next: 'h1' },
      { text: '🌿 Salutare la voce del pozzo, prima di richiudere la finestra', once: true, next: 'nat_saluto' },
    ],
  },

  tronello_cerchio: {
    location: 'corridoio',
    caption: 'Il cerchio del balcone',
    text: `Il balcone del primo piano guarda la valle, e la regola è una sola: **niente casa, niente patto, niente 1899.** Solo il cerchio.

Natalino accende la metà conservata e la fa girare: a Gaetano, che tira da ingegnere — dose calibrata; a Claudia, che tira da professionista, "meglio del mio ultimo teambuilding"; e a Emanuela — "vabbè, PROVO" — che tossisce quaranta secondi con la dignità di una regina.

> Federico: *(sigaretta elettronica in balcone "per solidarietà aerodinamica", cerchietti di vapore DENTRO il cerchio degli altri)* "Vi faccio da cornice. Gratis."

Per dieci minuti funziona. Ridete piano, come si ride in vacanza. La valle respira. La casa — per una volta — non.

Poi Gaetano lo dice: "...il fumo." Il fumo non si disperde: **si dispone.** Sopra le vostre teste, in linee ordinate — angoli retti, corridoi, stanze — la PIANTA del Belvedere, disegnata in fumo. E dove nella pianta vera c'è solo muro... **c'è una stanza in più.**

> Gaetano: "Quella stanza non esiste. Cioè: non esiste nei muri. Ma il fumo dice che—"

> Claudia: *(già in piedi, già lucida)* "La porta con la targhetta vuota. In fondo al corridoio del piano proibito. Il fumo ci ha appena dato la MAPPA."

L'ultimo filo di fumo scavalca la ringhiera e se ne va verso il pozzo — un tiro consegnato a domicilio.

> Natalino: *(guardandolo andare)* "...tienilo tu, signora. Era comunque tuo."

**(Il cerchio ristora: +3 PV a tutti, Sangue freddo +1. E adesso SAPETE della stanza che non c'è. Flag: fumata_di_gruppo, stanza_intravista.)**`,
    heal: 3,
    gold: 2,
    sets: { fumata_di_gruppo: true, stanza_intravista: true },
    choices: [
      { text: '↩ Rientrare dal balcone, più leggeri e con una mappa di fumo in testa', next: 'h1' },
      { text: '💨 Seguire con lo sguardo l\'ultimo filo di fumo fino al pozzo', once: true, next: 'tronello_fumo' },
    ],
  },

  tronello_fumo: {
    location: 'corridoio',
    stinger: 'risata',
    caption: 'Dove va il fumo',
    text: `Natalino resta alla ringhiera e segue il filo di fumo con lo sguardo, fino in fondo al giardino.

Il fumo scende dritto — nessun vento lo tocca, nemmeno quello che c'è — plana sopra le siepi, aggira lo spaventapasseri alla larga (ANCHE il fumo, notate, gli gira alla larga), e arriva al pozzo. E lì, invece di dissolversi, fa una cosa da ospite educato: **gira due volte intorno alla cuspide**, come si suona un campanello, e poi cala giù nel buio, lentamente, in spirale.

Passano tre secondi. Poi dal pozzo risale UN anello di fumo. Uno solo. Perfetto.

> Natalino: *(senza fiato)* "...ha risposto. La signora fuma. O sa fare i cerchietti meglio di Federico."

> Federico: *(dal balcone, punto sul vivo)* "Impossibile. Quella tecnica richiede ANNI."

> Natalino: "Centoventicinque, per esempio."

E per il resto della notte, nessuno di voi riuscirà a togliersi dalla testa l'immagine più assurda e più tenera della serata: una signora del 1899, in fondo a un pozzo, che accetta un tiro offerto e ringrazia con un anello di fumo — come si ringraziava una volta, con un gesto in più e una parola in meno.

**(Sangue freddo +1: perfino il fumo, stanotte, fa da ambasciatore. Ada è in ascolto — e gradisce.)**`,
    sets: { fumo_seguito: true },
    choices: [
      { text: '↩ Rientrare, più leggeri', next: 'h1' },
    ],
  },

  ema_orto: {
    location: 'giardino',
    caption: 'Emanuela e l\'orto di Ada',
    text: `Nessuno discute nemmeno stavolta — anche perché Emanuela è già uscita.

L'orto di Ada, di notte, è l'unico angolo del Belvedere che non fa paura. Emanuela si inginocchia tra le file di erbe come si inginocchia una che gli orti li ha visti fare da sua nonna: senza toccare niente, all'inizio. Solo guardando. Poi le mani partono da sole — un'erbaccia tolta con lo strappo giusto, un tutore raddrizzato, una foglia secca staccata con due dita.

Non lo fa per la casa. Lo fa perché **non si può guardare un orto tenuto così bene e non dargli una mano.** È più forte di lei.

> La voce dal pozzo: *(piano, vicinissima, come da dietro la siepe)* "...la menta la tagli come la tagliava mia madre."

> Emanuela: *(senza voltarsi, senza fermarsi, col tono di chi parla a una collega)* "Perché è il modo giusto. Se la strappi, il cespo si offende e non ricaccia più uguale."

> La voce dal pozzo: "L'ho detto per QUARANT'ANNI a quel disgraziato del Giardiniere." *(una pausa. e poi, più piano)* "Prendine un rametto. Di quelle d'argento, in fondo. Contro il freddo. Il MIO."

Emanuela lo taglia — come lo taglierebbe la madre di Ada — lo annusa, e se lo mette nella borsa senza fare cerimonie. Le giardiniere si ringraziano così: continuando a lavorare.

**(Oggetto: RAMETTO D'ARGENTO DI ADA — cura il veleno e scalda il resto. Sangue freddo +1. Flag: orto_curato.)**`,
    item: 'erbe_ada',
    sets: { orto_curato: true },
    choices: [
      { text: '↩ Rientrare, con le mani che sanno di menta e la borsa più ricca', next: 'h1' },
      { text: '🌿 Raccogliere anche un rametto di rosmarino, per la cena di domani', once: true, sets: { rosmarino_raccolto: true }, next: 'h1' },
    ],
  },

  cst1: {
    location: 'corridoio',
    caption: 'Il corridoio di servizio',
    text: `Gregorio si ritira sempre allo stesso modo: un inchino, "i signori mi perdoneranno", e poi sparisce oltre una porta che nessuno di voi ha mai guardato due volte — perché è fatta APPOSTA per non essere guardata due volte.

Stanotte la guardate. E la seguite.

Dietro, un corridoio di servizio stretto e nudo: niente tappeti che bevono i passi, niente lampade che si accendono al passaggio. Qui la casa non recita. Qui la casa è solo muri, e i muri sono solo muri.

> Claudia: *(sottovoce)* "Vi rendete conto che in tutta la notte non ci siamo MAI chiesti dove va? Centoventicinque anni di servizio. Dove si RITIRA, uno così?"

In fondo al corridoio, una porta senza numero e senza targhetta. Non chiusa a chiave — al Belvedere le chiavi servono a chi ha qualcosa da difendere, e il custode non possiede niente.

> Natalino: "Ragazzi. Questa è una violazione di domicilio bella e buona." *(pausa)* "Però è anche l'unica porta della casa che non ci ha mai minacciato. Io voto: entriamo."`,
    choices: [
      { text: '🚪 Entrare, piano, con rispetto', next: 'cst2' },
      { text: '↩ No: certe porte si lasciano stare. Tornare al corridoio', next: 'h1' },
    ],
  },

  cst2: {
    location: 'camera',
    caption: 'La stanza del custode',
    text: `È la stanza più piccola della casa, e la più pulita, e la più TRISTE.

Una branda militare con le coperte tirate a specchio — MAI usata: la polvere sotto la rete è uniforme come neve fresca, perché i custodi non dormono. Una divisa di ricambio appesa alla parete come un'altra pelle in attesa. Un calendario del 1899 fermo ad agosto, con un solo giorno cerchiato. E su un tavolino, sotto la finestra che guarda il pozzo — LUI la scelse, questa stanza, e adesso sapete perché — due cose.

La prima: un **quaderno**, riempito per centoventicinque anni con la stessa grafia elegante. Non un diario. **Prove generali.** Frasi di benvenuto scritte, provate, cancellate, riscritte: *"Benvenuti al Belvedere" — troppo freddo. "Che piacere avervi" — suona affamato. "I signori sono i benvenuti: la casa li aspettava" — così. Gentile. RIPROVA DOMANI.* Un uomo che ogni giorno, da un secolo, si esercita a sembrare umano — o a non smettere di esserlo.

La seconda: un **biglietto piegato in otto**, mai consegnato. Lo aprite con due dita. *"NON FIRMATE. Scendete stanotte. Il custode."* E sotto, una data: **1949.**

> Emanuela: *(piano)* "Ci ha provato. Una volta, almeno. Ha scritto questo, e poi... non l'ha dato. E il gruppo del '49 è nei ritratti."

Nessuno dice la cosa ovvia: che un biglietto del genere, stanotte, nessuno l'ha trovato sul proprio cuscino. Ma forse — il quaderno lo suggerisce — il modo di Gregorio di riprovarci, dopo il 1949, è stato un altro: restare. Limare la targhetta. Fare resistenza in silenzio, un giorno alla volta.

**(Oggetto: IL BIGLIETTO MAI CONSEGNATO. Sangue freddo +2. Flag: stanza_custode.)**`,
    item: 'biglietto_1949',
    sets: { stanza_custode: true },
    choices: [
      { text: '↩ Uscire come si esce da una chiesa: piano, e lasciando tutto com\'era', next: 'h1' },
      { text: '📓 Rileggere una pagina del quaderno delle prove generali, con rispetto', once: true, next: 'cst2_quaderno' },
    ],
  },

  cst2_quaderno: {
    location: 'camera',
    caption: 'L\'ultima pagina del quaderno',
    text: `Emanuela apre il quaderno all'ultima pagina scritta. La data è di **ieri.**

*"Domani arrivano in cinque. Ho stirato le lenzuola due volte. Ho provato il benvenuto allo specchio: ancora troppo affamato. RIPROVA."*

E sotto, con una grafia più piccola, più stanca, che nessun maggiordomo mostrerebbe mai a nessuno:

*"Nota per me stesso: il gruppo di domani ride forte. L'ho sentito dal telefono, quando hanno prenotato — ridevano di una cosa detta da uno di loro, tutti insieme, sopra le parole dell'altro. La casa li vuole PER QUESTO. Io... io vorrei solo sedermi al tavolo con loro, una volta, e ridere della cosa detta. Non succederà. Non deve succedere. Un custode che ride è un custode che spera, e un custode che spera fa errori. FIRMA VELOCE, GREGORIO. Come sempre. Come nel—"*

La frase si interrompe lì. L'inchiostro dell'ultima parola è **sbavato** — di una goccia sola, tonda, caduta dall'alto.

> Emanuela: *(richiudendo il quaderno con due mani, come si chiude una bara piccola)* "Ragazzi. Gregorio sapeva di noi. E ha PIANTO. Ieri."

**(Sangue freddo +1: il maggiordomo della casa che vi vuole mangiare... voleva solo ridere con voi. Ricordatevelo, al Banchetto.)**`,
    sets: { quaderno_riletto: true, gregorio_umano: true },
    choices: [
      { text: '↩ Uscire piano, lasciando tutto com\'era', next: 'h1' },
      { text: '🖊 Scrivere sotto l\'ultima riga: "STASERA RIDI CON NOI. — gli ospiti"', once: true, next: 'h1' },
    ],
  },

  gv1: {
    location: 'corridoio',
    caption: 'Cinque minuti di normalità',
    gold: 1,
    text: `Nel corridoio della casa che respira, Natalino si siede sul gradino, tira fuori dal portafoglio i cinque Gratta e Vinci di Baiano e li dispone sul marmo come un solitario.

> Natalino: "Regola dell'autogrill: si grattano nei momenti di merda. E scusate il francesismo, ma se questo non è IL momento, ditemi voi."

Gratta il primo con la chiave della camera. **RITENTA.** Il secondo: **RITENTA.** Il terzo vince *"un altro biglietto"* — che, fa notare Federico con la voce dell'esperienza contabile, "è il modo in cui ti dicono RITENTA facendoti pure tornare in tabaccheria". Il quarto: **RITENTA.**

> Emanuela: "Come da pronostico. Cinque euro alla lotteria della speranza."

> Natalino: *(che intasca l'ultimo biglietto, intatto, con una cura improvvisamente seria)* "L'ultimo no. L'ultimo lo gratto quando USCIAMO da qui. Tutti e cinque, con l'alba in faccia. È una promessa, non un biglietto."

E per un momento — cinque amici seduti su un gradino a perdere alla lotteria mentre la casa trattiene il respiro — per un momento è di nuovo soltanto una vacanza.

**(Sangue freddo +1: la normalità, stanotte, è un'arma. Flag: ultimo_biglietto.)**`,
    sets: { ultimo_biglietto: true },
    choices: [
      { text: '↩ Tornare al corridoio delle tre porte: la notte vi aspetta', next: 'h1' },
      { text: '🎫 Controllare ancora una volta i biglietti già grattati, non si sa mai', once: true, next: 'gv1_ricontrollo' },
    ],
  },

  gv1_ricontrollo: {
    location: 'corridoio',
    stinger: 'fail',
    caption: 'Il ricontrollo dei biglietti',
    text: `Federico — che nella vita ha controllato mille contratti — raccoglie i quattro biglietti persi e li rilegge uno per uno, per deformazione professionale.

E al terzo si blocca.

> Federico: "Natalino. Questo. Il 'RITENTA' del terzo biglietto. Guardalo bene."

Sotto la patina grattata, la scritta non dice più *RITENTA*. Dice — e le lettere sono le stesse, ma disposte diversamente, come se qualcuno le avesse RIORDINATE da quando le avete lette — dice: **"RIENTRATE."**

Silenzio. Natalino prende il biglietto. Lo gira. Lo rigira. Sul retro, dove ci sono le regole del concorso in corpo sei, una riga in mezzo alle altre recita: *"Il premio deve essere reclamato entro la mezzanotte del giorno di emissione. Trascorso tale termine, il giocatore risulta a tutti gli effetti PARTE DEL MONTEPREMI."*

> Natalino: *(rimettendo in tasca l'ultimo biglietto intatto, quello della promessa, con MOLTA più cura di prima)* "Ragazzi. Ho una notizia buona e una cattiva. La buona: la casa arriva pure dentro i Gratta e Vinci, quindi è NERVOSA, quindi le stiamo facendo paura. La cattiva..." *(si alza dal gradino)* "...è che mi sa che stanotte il montepremi siamo noi."

**(Sangue freddo +1: perfino i biglietti vi parlano. Rientrate. RIENTRATE. Lo dicono tutti, da stamattina. La domanda è: dentro COSA?)**`,
    sets: { biglietti_ricontrollati: true },
    choices: [
      { text: '↩ Al corridoio delle tre porte: la notte vi aspetta', next: 'h1' },
      { text: '🔥 Bruciare i quattro biglietti persi con l\'accendino: niente carta firmata in giro', once: true, requires: { item: 'accendino' }, next: 'h1' },
    ],
  },

  gvz: {
    location: 'salaBanchetto',
    caption: 'L\'ultimo biglietto',
    npc: ['gregorio'],
    text: `Natalino si siede al tavolo del Banchetto. Non sulla sedia che la casa gli ha apparecchiato: su quella ACCANTO, storta, da ospite maleducato. E davanti a Gregorio, davanti al registro aperto e alla penna del 1899, tira fuori l'ultimo Gratta e Vinci di Baiano.

> Natalino: "Avevo promesso di grattarlo all'alba, fuori. Ma sai che c'è? Lo gratto QUI. Davanti a te. Così impari come si fa un contratto onesto: due euro, e sai subito se hai perso."

La moneta raschia. E sotto la patina argentata, i simboli — che dovrebbero essere ciliegie, campane, il tesoro del faraone — vengono su in una tipografia che Natalino non ha mai visto ma che voi riconoscete tutti: **caratteri del 1899.**

*"HAI VINTO: UNA NOTTE. OSPITE DELLA CASA. PER SEMPRE."*

Il silenzio dura tre secondi. Poi Natalino guarda Gregorio negli occhi, sorride il suo miglior sorriso da bancone del sabato mattina, e **strappa il biglietto in due.**

> Natalino: "Ritenta."

I ritratti alle pareti — tutti, tutti e quattro i gruppi — fanno una cosa che i ritratti non fanno: **ridono.** Un fruscio secco di risate dentro le cornici. E Gregorio, per la seconda volta in centoventicinque anni, si ritrova a corto di programma.

**(Il Belvedere ha appena scoperto che si può perdere con stile: Sangue freddo +2.)**`,
    gold: 1,
    sets: { biglietto_strappato: true },
    choices: [
      { text: '↩ Tornare al tavolo, mentre i ritratti ridono ancora', next: 'z1' },
      { text: '😏 Raccogliere i pezzi del biglietto strappato, come souvenir', once: true, sets: { biglietto_strappato_raccolto: true }, next: 'z1' },
    ],
  },

  /* ==================== L'ALBA — IL BANCHETTO ==================== */


  z_stretta: {
    location: 'salaBanchetto',
    npc: ['gregorio'],
    caption: 'La stretta di mano',
    text: `Federico tende la mano a Gregorio. Non la mano da meeting — quella vera, quella che si dà ai traslochi e ai funerali.

Gregorio la guarda per un tempo lunghissimo. Centoventicinque anni che stringe mani in servizio: la stretta d'accoglienza, la stretta d'addio, la stretta che accompagna alla firma. Questa non è in catalogo.

> Gregorio: *(togliendosi il guanto — IL GUANTO — prima di stringere)* "Sa quand'è l'ultima volta che ho stretto una mano da uomo a uomo, signor Federico? Il 14 agosto 1899. Il mio amico Alfonso, prima della cena. Gli dissi 'ci vediamo a tavola'." *(stringe: la mano è fredda, ferma, e trema pochissimo)* "Non ci siamo mai più visti. Non da uomini."

> Federico: "Allora questa vale doppio. Per stanotte... e per quella che non vi siete dati."

Gregorio annuisce, si rimette il guanto con cura da liturgia, e per il resto della notte — lo noterete — terrà quella mano leggermente chiusa, come per non far scappare qualcosa.

**(Sangue freddo +2: avete stretto la mano all'uomo, non al maggiordomo. E l'uomo, adesso, esiste di nuovo.)**`,
    sets: { mano_stretta_gregorio: true },
    choices: [
      { text: '↩ Al tavolo: la notte non aspetta', next: 'z1' },
    ],
  },

  z2_ricetta: {
    location: 'salaBanchetto',
    npc: ['gregorio'],
    caption: 'La prima ricetta',
    text: `> Emanuela: "La prima ricetta te la do ADESSO, Gregorio. Così la casa sente che il menù dei vivi non è una promessa: è un fatto." *(conta sulle dita, con la voce da sabato pieno in salone)* "Pasta e patate con la provola. Quella di mia madre: le patate a pezzi grossi, la crosta di provola sopra, il mestolo che sta IN PIEDI nella pentola. Si fa in un'ora e sfama sei persone tristi trasformandole in sei persone felici. TESTATO."

Gregorio ascolta come si ascolta una sentenza d'assoluzione. E poi fa una cosa che nessuno si aspettava: tira fuori dal taschino una matita piccolissima e SCRIVE, sul polsino inamidato della camicia, come i camerieri veri quando il blocchetto è finito.

> Gregorio: "Pasta. E patate. Con la provola." *(rilegge, e la voce gli si incrina sull'ultima parola)* "È la prima voce nuova del menù dal 15 agosto 1899, signora. La casa la sta leggendo dal mio polso in questo momento. E per la prima volta in centoventicinque anni... non so dirle se ha fame o NOSTALGIA."

**(Sangue freddo +1: la prima ricetta è agli atti — scritta su un polsino, che è dove si scrivono le cose che contano.)**`,
    sets: { prima_ricetta_promessa: true },
    choices: [
      { text: '↩ Al tavolo, col menù nuovo che fermenta', next: 'z1' },
    ],
  },

  z2_carezza: {
    location: 'salaBanchetto',
    caption: 'La carezza alla bambola',
    text: `Emanuela si china sulla bambola più vicina — quella coi denti veri, quella che nel 1924 qualcuno ha pettinato per l'ultima volta — e le posa una mano sulla testa di porcellana. Piano. Come si fa coi bambini febbricitanti.

La bambola non si muove. Ma il carillon che tutte si portano dentro — quello che suona il valzer che salta — fa una nota sola, bassa, fuori programma. E le altre trentuno teste ruotano di un grado. Non verso di voi: verso LEI. Verso la carezza.

> Emanuela: "Nessuno vi ha mai pettinate più, vero? Dal '24." *(sistema una ciocca di capelli veri, ingialliti, dietro un orecchio di porcellana)* "Quando è finita, torno. Parola di parrucchiera: shampoo, piega e niente lacrime. Nemmeno le mie."

La bambola, sotto la mano, si SCALDA. Un grado, forse due. Quanto basta.

> Natalino: *(sottovoce)* "Emanuè, hai appena preso un appuntamento con trentadue bambole assassine."

> Emanuela: "Trentadue clienti nuove. Il salone si allarga."

**(Sangue freddo +1: le signorine del 1924 hanno una carezza in memoria, adesso. E chi è trattato da persona, combatte come tale.)**`,
    sets: { bambola_accarezzata: true },
    choices: [
      { text: '↩ Al tavolo, dentro il cerchio di porcellana', next: 'z1' },
    ],
  },

  z1: {
    location: 'salaBanchetto',
    stinger: 'campana',
    npc: ['gregorio'],
    caption: 'Il Banchetto del Venticinquennio — ore 5:57',
    gold: 1,
    text: `Non c'è bisogno di cercare la sala del Banchetto. Alle 5:57, il Belvedere **ve la porta**: aprite una porta qualsiasi — QUALSIASI — e dietro c'è sempre lei.

È la sala da pranzo, ma vestita per la festa che ha aspettato venticinque anni: candelabri a ogni metro, argenteria del 1899 tirata a specchio, e la tavola apparecchiata per **sei.** Cinque sedie da un lato. Una a capotavola.

I ritratti degli ospiti sono stati staccati dalle pareti della hall e appesi QUI, tutti, come parenti a un matrimonio. Il gruppo del 1924 in costume da bagno. Il 1949. Il 1974. Sofia e i ragazzi del 1999. Vi guardano dalle cornici con l'espressione di chi vorrebbe gridare qualcosa attraverso un vetro spesso.

A capotavola, in un frac del 1899 stirato alla perfezione, c'è **Gregorio.** I capelli completamente bianchi, adesso. Davanti a lui, il registro degli ospiti, aperto sulla vostra pagina. Accanto al registro, la penna stilografica.

> Gregorio: "Signori. Vi presenterei il padrone di casa... ma lo conoscete già. Lo conoscete da quando avete varcato il cancello. **È la casa.** Io apparecchio soltanto."

E la casa — le pareti, i lampadari, i ritratti, il pavimento a scacchi — **respira.** Una volta. Tutti la sentite. Il Belvedere ha fame, e l'alba è tra ventidue minuti.

> Gregorio: "Le regole del Banchetto sono tre. Uno: si esce all'alba, o non si esce. Due: il patto vuole **una firma o un nome.** Tre..." *(e qui, per la prima volta, la voce del maggiordomo perfetto trema)* "...tre: il menù può ancora cambiare. Se avete sciolto i nodi... **è il momento di metterli sul tavolo.**"`,
    choices: [
      { text: '🧂💧 IL RITUALE: sale sulla firma, acqua di Ada sul registro, e restituire il nome', requires: { flag: 'rituale_noto', item: 'sale_grosso', item2: 'acqua_pozzo' }, removeItem: 'sale_grosso', removeItem2: 'acqua_pozzo', next: 'z2_rituale' },
      { text: '📄 Posare sul registro IL SUO biglietto del 1949: "Ci hai già provato una volta. Riprova ADESSO."', requires: { item: 'biglietto_1949' }, removeItem: 'biglietto_1949', once: true, next: 'z_biglietto' },
      { text: '🖋 "Non ti chiediamo di passare la penna, Gregorio. Ti chiediamo di ROMPERLA." (il segreto della cripta)', requires: { flag: 'segreto_custodi' }, once: true, next: 'z_penna' },
      { text: '🖋📄 La penna si rompe SENZA chiedere: avete il segreto della cripta E il suo cuore del 1949 sul tavolo', requires: { flag: 'segreto_custodi', flag2: 'gregorio_vacilla' }, once: true, next: 'e_penna' },
      { text: '🛣 "Le strade TORNANO, Gregorio. Le abbiamo viste tornare. E un contratto firmato dentro una trappola... è NULLO."', requires: { flag: 'strada_che_torna' }, once: true, next: 'z2_strada' },
      { text: '🎫 Natalino mette i piedi sul tavolo del 1899 e gratta l\'ULTIMO Gratta e Vinci. Davanti a LUI.', requires: { flag: 'ultimo_biglietto' }, removeItem: 'gratta_vinci', once: true, next: 'gvz' },
      { text: '🍳 "Tu collezioni i piatti dei morti. Noi ti offriamo il MENÙ DEI VIVI." (la contro-offerta)', requires: { flag: 'menu_memoria' }, once: true, next: 'z2_menu_vivi' },
      { text: '🤝 Contare le carte sul tavolo: "Gregorio. La casa ha già PERSO. E lo sapete tutti e due."', requires: { flag: 'gregorio_umano', flag2: 'menu_dei_vivi' }, once: true, next: 'z2_capitolazione' },
      { text: '🍽 "CHEF! La portata è cambiata — chiedi alla casa se se la sente di dire di no ai signori del \'74."', requires: { flag: 'chef_amico' }, once: true, next: 'z2_alleato' },
      { text: '🧸 Emanuela fischia piano il valzer del 1924, verso il soffitto. E il soffitto... scricchiola di passini.', requires: { flag: 'bambole_addormentate' }, once: true, next: 'z2_bambole' },
      { text: '📱 Claudia alza il telefono e INQUADRA la sedia a capotavola. In diretta. "Sorridi."', once: true, next: 'z2_claudia' },
      { text: '⚔ Il gruppo si mette in mezzo: se la casa vuole un nome, dovrà VENIRSELO A PRENDERE', next: 'z3_boss' },
      { text: '🗣 Federico chiede la parola: la trattativa della vita', tag: 'Prova di Carisma — CD 13', once: true, requires: { notFlag: 'casa_rispetta' }, check: { stat: 'CAR', dc: 13, success: 'z2_trattativa', fail: 'z3_boss_arrabbiato' } },
      { text: '🗣 Federico riprende la parola — e stavolta la casa ASCOLTA. Nessun dado: il tavolo è cambiato', requires: { flag: 'casa_rispetta' }, next: 'z2_trattativa' },
      { text: '💌 Posare le lettere sul tavolo: "Queste le avete scritte VOI DUE. Prima del patto. Prima della fame."', requires: { item: 'lettere_1899' }, removeItem: 'lettere_1899', once: true, next: 'z_lettere' },
      { text: '🍷 Prima di tutto: versare il vino del 1899 nel bicchiere di Gregorio', requires: { item: 'vino_1899' }, removeItem: 'vino_1899', next: 'z2_vino' },
      { text: '💧 Riferire le parole del pozzo: "Ada ti perdona. A metà. LA METÀ CHE SERVE."', requires: { flag: 'ada_perdono' }, once: true, next: 'z2_perdono' },
      { text: '📋 PRIMA DI TUTTO: Federico si alza. C\'è una pratica da chiudere. "Ritiro l\'offerta."', requires: { flag: 'federico_offerta', notFlag: 'offerta_ritirata' }, once: true, next: 'z_offerta' },
      { text: '🔔 Suonare la campanella di Don Michele: "quando LEI si siede a tavola..."', requires: { item: 'campanella_1974' }, removeItem: 'campanella_1974', next: 'z_vespri' },
      { text: '🫙 L\'offerta impensabile: non UN nome. Un RICORDO a testa: questa notte, intera.', next: 'z_smemorati' },
      { text: '🖋 La scelta di cui non parlerete mai più: UNO di voi prende la penna', next: 'z_custode' },
      { text: '🍽 Sedersi. Tutti e cinque. C\'è una pace terribile, nello smettere di lottare...', next: 'z_resa' },
    ],
  },


  z_offerta: {
    location: 'salaBanchetto',
    npc: ['gregorio'],
    caption: 'Il recesso',
    gold: 1,
    text: `Federico si alza. Si abbottona la giacca — il gesto che fa prima dei meeting importanti — e parla alla sala. Non a Gregorio: alla SALA.

> Federico: "Belvedere. Sono io. Quello della prenotazione, quello delle cinque stelle, quello di 'domani muoio'." *(respira)* "RITIRO L'OFFERTA. Formalmente. Davanti a testimoni. Quella frase era mia, e me la rimangio: domani NON muoio. Domani mi sveglio, mi lamento del materasso, faccio colazione DUE volte e do la colpa dei tornanti a Gaetano. Ho... ho un sacco di impegni, domani."

La casa ci pensa. Si sente che ci pensa: il lampadario rallenta, i ritratti si sporgono, e da qualche parte sotto il pavimento un'acqua ferma si mette in ascolto.

> Gregorio: *(piano, senza alzare gli occhi)* "Il conto, dottore. Le parole rimangiate si pagano. È l'unica clausola che la casa non ha mai derogato."

> Federico: "Lo so." *(mette sul tavolo il coraggio, letteralmente: e la voce, per la prima volta stanotte, gli trema senza che provi a nasconderlo)* "Pago col sangue freddo. Tutto quello che serve. Mi terrò la paura, stanotte: è MIA, come la battuta. Almeno la paura non la protocollate."

Un suono attraversa il Belvedere: una pratica, da qualche parte, che si CHIUDE. Con la puntina. Per sempre.

> Emanuela: *(tirandolo giù per la giacca, con gli occhi lucidi e la voce da ufficio stampa)* "Il mio cliente non rilascia altre dichiarazioni."

**(L'offerta è RITIRATA: -2 Sangue freddo, pagati volentieri. E la Fame, stanotte, ha una carta in meno nel mazzo.)**`,
    goldLoss: 2,
    sets: { offerta_ritirata: true },
    choices: [
      { text: '↩ Al tavolo. E da domani, scaramanzia SOLO per iscritto', next: 'z1' },
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
      { text: '🧂💧 Adesso il rituale: sale, acqua, nome', requires: { flag: 'rituale_noto', item: 'sale_grosso', item2: 'acqua_pozzo' }, removeItem: 'sale_grosso', removeItem2: 'acqua_pozzo', next: 'z2_rituale' },
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
    gold: 1,
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

  z_biglietto: {
    location: 'salaBanchetto',
    npc: ['gregorio'],
    caption: 'Il biglietto del 1949',
    text: `Natalino lo posa sul registro senza una parola. Piegato in otto, ingiallito, MAI aperto da chi doveva riceverlo.

Gregorio lo guarda. E per la prima volta in tutta la notte — compresa la battaglia, compreso il vino, compreso tutto — fa un passo INDIETRO.

> Gregorio: "...dove."

> Natalino: "Nella tua stanza. Scusaci: siamo entrati piano e abbiamo lasciato tutto com'era." *(pausa)* "Tranne questo. Questo era troppo tuo per lasciartelo nascondere ancora."

Il maggiordomo perfetto prende il biglietto con due mani — come si prende una cosa che pesa cento volte il suo peso — e lo apre. Rilegge la propria grafia di settantasette anni fa. *NON FIRMATE. Scendete stanotte. Il custode.*

> Gregorio: "Lo scrissi il pomeriggio. Lo tenni in tasca tutta la cena. La signora del gruppo — Rosa, si chiamava — mi chiese se mi sentivo bene, perché continuavo a toccarmi il taschino." *(la voce, adesso, è solo di un uomo)* "Non lo consegnai. Ebbi paura. Non della casa: di sbagliare. Di rovinargli la vacanza per niente, se mi fossi inventato tutto." *(piega il biglietto, con cura, e se lo mette nel taschino — nello STESSO taschino)* "Settantasette anni che mi chiedo chi sarei, se l'avessi consegnato."

> Emanuela: "Uno che ci ha provato. Cioè quello che sei. La differenza, Gregorio, è solo che adesso lo SAI."

**(Il custode vacilla — e stavolta non si raddrizza: Sangue freddo +2. Flag: gregorio_vacilla.)**`,
    sets: { gregorio_vacilla: true },
    choices: [
      { text: '↩ Tornare al tavolo, lasciandogli il biglietto nel taschino', next: 'z1' },
      { text: '🤝 Stringere la mano a Gregorio, da uomo a uomo', once: true, next: 'z_stretta' },
    ],
  },

  z_lettere: {
    location: 'salaBanchetto',
    npc: ['gregorio'],
    caption: 'Le lettere che non hanno mai spedito',
    gold: 1,
    text: `Il fascio di lettere atterra sul tavolo tra le posate del 1899 con un tonfo morbido che fa tremare i candelabri.

Gregorio le riconosce prima di guardarle — dal nastro, dallo spago, dall'odore di carta vecchia che ha respirato per un secolo senza mai riaprire. Le sue mani e quelle di lei, intrecciate in una grafia doppia che progettava un futuro che non è mai arrivato.

> Gregorio: *(tocca lo spago senza scioglierlo — sa già cosa c'è dentro)* "L'ampliamento. Le camere per le famiglie. Lei voleva i bambini nella dependance — io dicevo che avrebbero rovinato la tappezzeria." *(la voce si rompe su 'tappezzeria', come se la parola fosse troppo normale per quello che è diventato)* "Non c'è mai stato tempo. Poi il patto, e il tempo è diventato TUTTO quello che avevo. E nessuno con cui riempirlo."

Le lettere restano sul tavolo. Gregorio non le riprende. Ma non le spinge via.

**(La memoria di quello che poteva essere pesa più di quella di quello che è stato: Gregorio è di nuovo UMANO. +1 a tutti i vostri tiri nella battaglia finale.)**`,
    sets: { gregorio_umano: true, lettere_lette: true },
    choices: [
      { text: '↩ Tornare al tavolo. Le lettere restano dove sono: al centro.', next: 'z1' },
      { text: '💌 Leggere ad alta voce un\'ultima riga delle lettere, per lui', once: true, next: 'z_lettere_riga' },
    ],
  },

  z_lettere_riga: {
    location: 'salaBanchetto',
    npc: ['gregorio'],
    caption: 'L\'ultima riga, ad alta voce',
    text: `Claudia scioglie lo spago con due dita — Gregorio non la ferma — e sfila l'ultima lettera del fascio. La carta è sottile come pelle. La grafia è quella femminile, fitta, in fondo alla pagina, dopo i progetti e i preventivi dell'ampliamento mai fatto.

Claudia legge ad alta voce, nel silenzio del Banchetto:

> *"...e quando le camere per le famiglie saranno pronte, marito mio, voglio una regola sola: che in questa casa non si firmi MAI niente dopo cena. Dopo cena si ride, si beve e si perdonano gli errori del giorno. I contratti sono roba da mattina. Promettimelo. — la tua Ada, che ti ama anche quando conti le lenzuola."*

La data, in alto: **12 agosto 1899.** Tre giorni prima del patto. Firmato dopo cena.

Gregorio non si muove. Poi, con un gesto lentissimo, prende la lettera dalle mani di Claudia, la piega, e se la mette **nel taschino della divisa** — sul cuore, dove i maggiordomi tengono il metro da tavola.

> Gregorio: "Me l'aveva fatta, quella regola. Me l'aveva fatta PROMETTERE." *(alza gli occhi, e per la prima volta stanotte sono occhi e basta)* "Signori... qualunque cosa accada tra poco: non firmate niente. È dopo cena."

**(Sangue freddo +1: la regola di Ada, detta dalla voce di Gregorio. La casa, intorno, ha appena perso un argomento.)**`,
    sets: { riga_letta_gregorio: true },
    choices: [
      { text: '↩ Al tavolo. E nessuno firma niente', next: 'z1' },
      { text: '🪢 Riannodare lo spago del fascio, stretto, come l\'ha tenuto lui per un secolo', once: true, heal: 1, next: 'z1' },
    ],
  },

  z_penna: {
    location: 'salaBanchetto',
    npc: ['gregorio'],
    caption: 'La proposta impensabile',
    gold: 1,
    text: `È Federico che si alza — ma stavolta non è un pitch. Parla piano, guardando Gregorio, e mette sul tavolo il telefono di Claudia, con lo schermo acceso: **i registri parrocchiali di Paternopoli, fotografati pagina per pagina.** L'unica prova che nessun gruppo, in centoventicinque anni, ha mai portato al Banchetto.

> Federico: "Dodici parroci, due secoli di annotazioni. 'Sale il custode nuovo.' Ogni venticinque anni, da PRIMA di te. Lo sappiamo, Gregorio. Sappiamo che il patto è più vecchio di te. E sappiamo l'altra cosa..." *(si china sul tavolo)* "...che un custode può RIFIUTARSI di passare la penna. Tu lo fai da centoventicinque anni. Per dispetto, dice Don Michele. Il sesto del Settantaquattro. Quello che ti suona i vespri OGNI SERA."

Gregorio non si muove. Ma la penna, accanto al registro, comincia a rotolare piano — avanti e indietro — come una cosa che ha sentito il proprio nome.

> Federico: "E allora ecco la proposta. Non ti chiediamo di passarla. Non ti chiediamo di tenerla. **Ti chiediamo di ROMPERLA.** Nessun custode nuovo. Nessun custode VECCHIO. Il ciclo non si passa: si CHIUDE. Tu hai retto questa casa per dispetto — adesso falla cadere per lo stesso identico motivo."

E la casa smette di respirare. Tutta. Anche i ritratti trattengono il fiato dentro le cornici.

> Gregorio: *(dopo un silenzio di venticinque anni)* "...e di me... cosa resta, signori? Centoventicinque anni. È l'unica cosa che sono."

*(È la trattativa più difficile della notte: Prova di Carisma — CD 14. Ditegli cosa resta.)*`,
    choices: [
      { text: '🗣 "Resta l\'uomo che ha tenuto chiusa questa porta per 125 anni. Il DISPETTO era amore, Gregorio."', tag: 'Prova di Carisma — CD 14', check: { stat: 'CAR', dc: 14, success: 'e_penna', fail: 'z_penna_no' } },
      { text: '↩ Non ancora: la parola pesa troppo. Tornare al tavolo', next: 'z1' },
    ],
  },

  z_penna_no: {
    location: 'salaBanchetto',
    npc: ['gregorio'],
    caption: 'La penna resta intera',
    text: `Gregorio ascolta fino in fondo. E per un momento — un momento intero — le dita guantate si posano sulla penna.

Poi la casa **stringe.** Si sente: un giro di vite nelle fondamenta, i ritratti che sbattono, il lampadario che scende di un centimetro come un pugno che si chiude. E Gregorio ritira la mano, piano, con la faccia di chi ha appena ricordato dov'è e COSA lo tiene.

> Gregorio: "...no. Non così. Non stanotte, non ancora. La casa ha sentito, signori — e ciò che la casa sente, la casa se lo LEGA. Vi ho dato l'unica cosa che potevo: il momento in cui ci ho PENSATO." *(si raddrizza, torna maggiordomo, ma la voce non torna del tutto)* "Fate presto, adesso. Qualunque cosa scegliate... fatela PRESTO."

> Emanuela: *(sottovoce)* "Ci ha pensato. Avete visto tutti che ci ha pensato, sì?"

**(La casa è allertata ma Gregorio ha vacillato: Sangue freddo +1. La penna può ancora rompersi — un'altra notte, un altro gruppo. Stanotte servono le altre strade.)**`,
    choices: [
      { text: '↩ Al tavolo: la notte non aspetta', next: 'z1' },
      { text: '🖋 Restare a guardare la penna un altro istante, in silenzio', once: true, next: 'z_penna_sguardo' },
    ],
  },

  z_penna_sguardo: {
    location: 'salaBanchetto',
    npc: ['gregorio'],
    caption: 'La penna, da vicino',
    text: `Restate un istante a guardarla, la stilografica del 1899, ferma sul registro come un chiodo sulla bara.

E da vicino — da MOLTO vicino — si vede quello che da lontano sfugge: la penna è **consumata.** Non dall'uso: dalla resistenza. Il fusto d'ebanite è pieno di impronte, sempre le stesse, scavate da centoventicinque anni della stessa mano che la prende, la solleva, e la riposa senza firmare. C'è un solco, vicino al pennino, dove il pollice di Gregorio ha premuto ogni notte del ventesimo e ventunesimo secolo — il solco di una firma INIZIATA e mai finita, decine di migliaia di volte.

> Gaetano: *(piano, con la voce che usa per i satelliti quando i conti tornano in modo terribile)* "Non è una penna. È un braccio di ferro. Sta durando da centoventicinque anni... e GUARDATE quanto è profondo il solco. Lui non sta vincendo, ragazzi. Sta PERDENDO. Piano. Un decimo di millimetro all'anno."

> Emanuela: "Quindi cosa stiamo guardando, esattamente?"

> Gaetano: "Il tempo che resta. E non è tanto."

La penna, sul registro, luccica appena. Come una cosa che sa di essere stata capita.

**(Sangue freddo +1: Gregorio non è una roccia — è una diga che perde. Stanotte era l'ULTIMA occasione buona. Muovetevi.)**`,
    sets: { penna_osservata: true },
    choices: [
      { text: '↩ Al tavolo: la notte non aspetta. Davvero', next: 'z1' },
    ],
  },

  e_penna: {
    location: 'albaRelais',
    stinger: 'penna',
    caption: 'EPILOGO — La Penna Spezzata',
    gold: 1,
    text: `> Gregorio: "...il dispetto era amore."

Lo dice piano. Poi prende la penna — la stilografica di centoventicinque anni — e la guarda per l'ultima volta.

> Gregorio: "Ada. Amore mio. Il banchetto è finito: **si sparecchia.**"

**CRACK.**

Il suono è piccolo. Quello che segue no: una casa che perde la spina dorsale — ogni trave, ogni firma che si SLEGA. I ritratti si svuotano: il '24 esce ridendo, il '49 si toglie il cappello, il '74 se ne va cantando stonato, e Sofia saluta con la mano — di nuovo vent'anni, e nessuna fretta.

E il Belvedere non crolla. Fa peggio: **diventa una casa.** Vecchia, bella, mortale.

Sulla soglia, nel primo sole, Gregorio invecchia centoventicinque anni in un minuto — e li porta benissimo. L'ultima cosa che fa, prima di diventare polvere che il vento si porta via, è un inchino. Da maggiordomo.

> La voce di Ada, dal pozzo: "Grazie, ragazzi. **Chiudete il cancello quando uscite.** Ma non a chiave: chissà che un giorno non torni utile, una casa così."

Scendete i tornanti a piedi, nel sole. La strada **scende e basta.** A Paternopoli, Don Michele ha smesso di suonare i vespri. Adesso suona — dice lui — "a festa, e MALE, che è più onesto."

**🖋 FINE — Nessun custode nuovo. Nessun custode vecchio. Avete convinto un maggiordomo di 125 anni a rompere la penna, e una casa a tornare mortale. L'avete scritto voi, questo finale.**`,
    sets: { finale_penna: true },
    ending: true,
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
      { text: '✋ ...ma una mano guantata si posa sulla penna PRIMA della vostra.', requires: { flag: 'gregorio_vacilla' }, next: 'e_custode_gregorio' },
      { text: '↩ No. NESSUNO resta. Si torna a giocarsela tutti insieme.', next: 'z1' },
    ],
  },

  z2_strada: {
    location: 'salaBanchetto',
    caption: 'La geometria denunciata',
    npc: ['gregorio'],
    text: `Gaetano si alza. Appoggia le mani sul tavolo e parla con la voce delle riunioni tecniche, quella di quando qualcuno ha sbagliato i conti.

> Gaetano: "Ventisei tornanti, Gregorio. Li abbiamo scesi. E da tre tornanti più in alto abbiamo visto NOI CAMMINARE là sotto — le nostre giacche, le nostre torce. La tua strada non porta via: RIPORTA. È un anello. Il tuo contratto è firmato da gente che non poteva andarsene. Chi scende sta salendo. Una trappola."

> Federico: *(alzandosi accanto a lui, e per una volta senza slide)* "Si chiama VIZIO DEL CONSENSO, Gregorio. Nullità del contratto. E questa, per una volta, la so io e non lui."

Per la prima volta in centoventicinque anni, il sorriso di Gregorio **scivola** — di un millimetro, come un quadro appeso male.

I ritratti si sporgono. Il '49 ha smesso di fingere di guardare altrove. Sofia ha gli occhi spalancati.

> Gregorio: *(piano, spolverando un'invisibile briciola dal frac)* "...in centoventicinque anni, signori, sono scappati in molti. Hanno corso, gridato, pianto, sparato — un signore del '24 aveva portato il fucile, pensate. Ma nessuno. Nessuno si era mai FERMATO. A guardare. La casa apprezza gli ospiti che leggono il contratto... fino in fondo."

Si inchina, di un grado. La casa trattiene il respiro.

> Gregorio: "Il menù, signori... può ancora cambiare. Ve l'avevo detto."

**(La casa vi rispetta: Sangue freddo +2. La trattativa parte da un altro tavolo.)**`,
    sets: { casa_rispetta: true },
    choices: [
      { text: '↩ Tornare al tavolo del Banchetto, con la casa che ora vi guarda in modo diverso', next: 'z1' },
      { text: '🛣 Ripetere a voce alta il numero dei tornanti, per fissarlo bene in mente', once: true, sets: { tornanti_ripetuti: true }, next: 'z1' },
    ],
  },

  z2_perdono: {
    location: 'salaBanchetto',
    npc: ['gregorio'],
    caption: 'La metà che serve',
    text: `È Emanuela a dirlo — con la voce che usa per le notizie difficili, quella che non trema mai per mestiere.

> Emanuela: "Gregorio. Siamo stati al pozzo. Le abbiamo calato la sua bottiglia, e lei ha risposto. Ha detto: *ditegli che lo perdono a metà. La metà che serve.*"

Il vassoio che Gregorio tiene in mano da centoventicinque anni — quello che non ha mai tremato, non una volta, non davanti a niente — **trema.**

Lo posa sul tavolo, piano, con due mani, come si posa una cosa che non si è più capaci di reggere. E per un momento lunghissimo il maggiordomo perfetto sta semplicemente FERMO, gli occhi da qualche parte nel 1899.

> Gregorio: "...a metà." *(e ride — corto, rotto, il primo suono non calcolato che gli sentite fare)* "È più di quanto abbia chiesto in centoventicinque anni. È ESATTAMENTE lei: mai un grammo di grazia più del necessario, mai uno di meno." *(si raddrizza. e qualcosa, nella postura, è diverso: più vecchio e più VIVO insieme)* "Signori. Qualunque cosa succeda tra qui e l'alba... il conto del Belvedere non vi riguarda più. Riguarda me. Come avrebbe dovuto essere dal principio."

**(Gregorio è di nuovo un UOMO, e un uomo furioso dalla vostra parte: +1 a tutti i vostri tiri nella battaglia finale. Sangue freddo +1.)**`,
    sets: { gregorio_umano: true },
    choices: [
      { text: '↩ Tornare al tavolo, con un maggiordomo in meno e un alleato in più', next: 'z1' },
      { text: '💧 Restare in silenzio un momento, lasciando che Gregorio si ricomponga', once: true, sets: { silenzio_rispettoso: true }, next: 'z1' },
    ],
  },

  z2_menu_vivi: {
    location: 'salaBanchetto',
    npc: ['gregorio'],
    caption: 'Il menù dei vivi',
    text: `È un'idea di Emanuela, ed è così semplice che nessuno l'aveva vista.

> Emanuela: "Gregorio. A cena ce l'hai spiegato tu: qui la memoria e il menù sono la stessa cosa. I fusilli della signora Margherita. L'arrosto di Ernesto. Il dolce di Sofia. Ricette di gente che NON ESCE." *(si alza, e conta sulle dita, col tono con cui detta la lista della spesa)* "Adesso ascolta la nostra offerta. Pancakes di Federico. Crêpes di Claudia — migliori, ma non diteglielo. La mia pasta zucchine e gamberi. Le bruschette di Natalino. E la grigliata stile Pasquetta di Gaetano, che da sola vale il viaggio."

> Gregorio: *(immobile)* "...non comprendo la proposta, signora."

> Emanuela: "Sì che la comprendi. Sono ricette che la casa può avere in UN SOLO modo: se usciamo vivi, e TORNIAMO. Ogni anno. Da ospiti paganti, che cucinano nella tua cucina e ti lasciano le ricette scritte. Il menù dei vivi cresce solo coi vivi, Gregorio. Quelli morti... li hai già tutti. E non ti hanno mai insegnato un piatto NUOVO in centoventicinque anni."

Il silenzio che segue non è vuoto: è il silenzio di una casa che sta FACENDO I CONTI. Si sente — nelle assi, nei lampadari — il patto che rimastica l'idea: una collezione che cresce per sempre, contro un pasto solo.

> Gregorio: *(piano, quasi a se stesso)* "...il forno. Il forno lo chiede da un secolo, un piatto nuovo." *(e a voi, con un inchino che stavolta sembra di ringraziamento)* "La proposta è agli atti, signori. La casa... ci sta pensando. E una casa che PENSA, stanotte, morde più piano."

**(La contro-offerta è sul tavolo: Sangue freddo +2. Flag: menu_dei_vivi.)**`,
    sets: { menu_dei_vivi: true },
    choices: [
      { text: '↩ Tornare al tavolo, lasciando la casa a fare i conti', next: 'z1' },
      { text: '📝 Promettere a Gregorio la prima ricetta, qui, subito', once: true, next: 'z2_ricetta' },
    ],
  },

  z2_vino: {
    location: 'salaBanchetto',
    caption: 'Il brindisi di centoventicinque anni',
    text: `La bottiglia del 1899 — *"da aprire solo per il Padrone"* — viene stappata con le mani che tremano, e il vino scende nel bicchiere di Gregorio, denso e scuro come la notte che sta finendo.

Gregorio lo guarda con l'occhio di chi tiene in mano una lettera che non ha il coraggio di aprire.

> Gregorio: "Questo è... noi lo comprammo per il ritorno. Per il brindisi del ritorno a valle. Sei bicchieri. Non l'ho mai—"

> Voi: "Lo sappiamo. Ce l'ha detto **Ada.** Dice che la perdona a metà. La metà che serve."

Il bicchiere si ferma a mezz'aria. E Gregorio — Lord Gregorio, il maggiordomo del patto, l'uomo che non mangia e non beve dal 1899 — **beve.**

Il vino scende. E con il vino, il tempo: le mani si segnano, le spalle si curvano, il frac si allarga su un corpo che finalmente si RICORDA di avere centosettant'anni. Ma gli occhi — gli occhi ringiovaniscono.

> Gregorio: *(posando il bicchiere, con una voce nuova, umana, del sud)* "Ecco. Ora il Padrone non ha più un maggiordomo intero da consumare. Ora sono solo un ospite ANCH'IO — l'ultimo del 1899. E gli ospiti, signori miei..." *(si alza, e strappa il frac come si strappa un contratto)* "...gli ospiti possono DISDIRE."

**(Gregorio è dalla vostra parte, apertamente. La casa lo sa. La casa è FURIOSA. Sangue freddo +2. Da qui, ogni strada è più luminosa.)**`,
    sets: { gregorio_umano: true },
    gold: 1,
    choices: [
      { text: '🧂💧 ORA il rituale: sale, acqua, e il nome da restituire', requires: { flag: 'rituale_noto', item: 'sale_grosso', item2: 'acqua_pozzo' }, removeItem: 'sale_grosso', removeItem2: 'acqua_pozzo', next: 'z2_rituale' },
      { text: '⚔ La casa manderà qualcuno a riscuotere: pronti a combattere', next: 'z3_boss' },
      { text: '↩ Tornare al tavolo con Gregorio al fianco: la notte ha ancora carte da giocare', next: 'z1' },
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
    gold: 1,
    choices: [
      { text: '🧂💧 Chiudere il contratto col rituale: sale, acqua, nome', requires: { flag: 'rituale_noto', item: 'sale_grosso', item2: 'acqua_pozzo' }, removeItem: 'sale_grosso', removeItem2: 'acqua_pozzo', next: 'z2_rituale' },
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
    choices: [
      { text: 'Nel buio, qualcosa di ENORME si alza da capotavola', next: 'z3_boss_indebolito' },
      { text: '🤝 Nel buio, cercare la mano di Gregorio — dalla VOSTRA parte', once: true, next: 'z2_mano' },
    ],
  },

  z2_mano: {
    location: 'salaBanchetto',
    caption: 'La mano nel buio',
    text: `Nel buio totale, mentre la casa urla e qualcosa di enorme si alza da capotavola, una mano del gruppo — non importa di chi, stanotte siete una cosa sola — si allunga verso il posto dove stava Gregorio.

E trova una mano guantata. Fredda come le altre notti. Ferma come mai.

> Gregorio: *(nel buio, la voce vicinissima, e per la prima volta in centoventicinque anni SENZA la voce da maggiordomo)* "Centoventiquattro banchetti. E nessuno... NESSUNO mi ha mai cercato nel buio. Cercavano l'uscita, cercavano le armi. Mai la mia mano."

La stretta si chiude — piano, poi forte, poi FEROCE, come chi si aggrappa dopo un secolo in mare aperto.

> Gregorio: "Da questa parte. Sto da questa parte, stanotte. Che mi costi quel che deve costare."

E quando la cosa a capotavola finisce di alzarsi, e i suoi occhi si accendono nel buio come due camini — trova il quadro che non ha MAI visto in centoventicinque anni: sei sagome, in fila, che si tengono per mano. **Il suo maggiordomo compreso.**

**(Sangue freddo +1: Gregorio ha scelto, e la casa l'ha visto. Il primo colpo della battaglia lo temerà anche LEI.)**`,
    sets: { mano_gregorio: true },
    choices: [
      { text: '⚔ Nel buio, qualcosa di ENORME finisce di alzarsi', next: 'z3_boss_indebolito' },
    ],
  },

  z2_claudia: {
    location: 'salaBanchetto',
    caption: 'La diretta',
    text: `Claudia si alza. Non prende il sale, non prende la penna: prende il **telefono**, lo gira in orizzontale con il gesto automatico di dieci anni di mestiere, e INQUADRA la sedia a capotavola.

> Claudia: "Allora. Io di lavoro faccio una cosa sola: decido COME si viene visti. Ci ho costruito una carriera. E tu—" *(il pallino rosso si accende)* "—tu sono centoventicinque anni che scegli l'inquadratura: i ritratti, il registro, il riflesso della piscina. Sempre TU a decidere l'immagine. Bene. **Adesso l'obiettivo è mio.**"

E la casa — che possiede ogni specchio, ogni ritratto, ogni superficie che riflette da centoventicinque anni — scopre in diretta cosa si prova a essere **guardata da un occhio che non è suo.**

I candelabri sfarfallano. Il registro si richiude piano, come chi si tira il lenzuolo fin sotto il naso. La sedia a capotavola scricchiola all'indietro di un centimetro.

> Claudia: *(al gruppo, senza abbassare il telefono)* "Non so quanto regge. Ma per il primo assalto... la stronza è in imbarazzo."

**(La casa è stata COLTA DI SORPRESA: primo giro di battaglia con VANTAGGIO. Sangue freddo +1.)**`,
    sets: { sorpresa: true },
    choices: [
      { text: '↩ Tornare al tavolo, col pallino rosso ancora acceso', next: 'z1' },
      { text: '📱 Salvare la diretta sul telefono, prima di spegnere', once: true, next: 'z2_diretta' },
    ],
  },

  z2_diretta: {
    location: 'salaBanchetto',
    stinger: 'fail',
    caption: 'Il file salvato',
    text: `Claudia ferma la registrazione e salva il file. Il telefono ci mette un secondo di troppo — di nuovo quel secondo di troppo — e poi mostra l'anteprima.

Il video c'è. Ventidue secondi. Ma l'anteprima non mostra la sedia a capotavola che avete inquadrato: mostra **la sala vista DALLA sedia.** Voi cinque, in piedi, il telefono in mano, le facce spaventate e feroci. Il punto di vista della casa.

> Claudia: *(scorrendo i fotogrammi, la voce sempre più piana)* "Ha ribaltato l'inquadratura. Ok. Va bene. Vuol dire che il file lo ARCHIVIA lei... ah no. Aspetta. Guardate l'ultimo fotogramma."

Nell'ultimo fotogramma, il punto di vista è tornato il SUO: la sedia a capotavola, vuota. Ma in basso, nell'angolo, dove i video mettono il timestamp, non c'è l'ora di stanotte.

C'è scritto: *"25° tentativo di ripresa. Il primo riuscito. Complimenti. — B."*

> Claudia: "B."

> Federico: "Belvedere. Si FIRMA. La casa si firma, ragazzi." *(pausa)* "Venticinque tentativi. Uno per gruppo. SIAMO I PRIMI CHE SONO RIUSCITI A FILMARLA."

**(Sangue freddo +1: il file esiste, e la casa lo sa. Una prova che esce viva da qui vale tutte le battaglie.)**`,
    sets: { diretta_salvata: true },
    choices: [
      { text: '↩ Al tavolo, col file al sicuro e l\'ultimo 4% di batteria tenuto da parte APPOSTA', next: 'z1' },
    ],
  },

  z2_alleato: {
    location: 'salaBanchetto',
    npc: ['cuoco'],
    caption: 'La cucina sciopera',
    text: `Per tre secondi non succede niente. Poi la porta di servizio esce **dai cardini.**

Lo Chef entra nella sala del Banchetto con la mannaia in pugno e centoventicinque anni di turni sulle spalle sbagliate, e per la prima volta da quando esiste questa casa... si mette **dalla vostra parte del tavolo.**

> Lo Chef: "No."

> La Fame: *(con la voce di Gregorio, gelida)* "Chef. Il menù—"

> Lo Chef: "il menù lo scrive la CUCINA." *(e la mannaia cala sul tavolo del 1899 — CRACK — piantandosi a due dita dal registro)* "Questi hanno trattato la MIA cucina — e quelli di prima — con RISPETTO. Sono OSPITI. Gli ospiti non si impiattano. E se la casa non è d'accordo..." *(si china verso la sedia a capotavola, e il forno che ha nella voce si apre tutto)* "...la casa stanotte cucina DA SOLA."

Si volta. Attraversa la sala. E i due camerieri — che stavano già scivolando fuori dalle pareti, i vassoi in mano — si guardano, guardano lo Chef, e **rientrano nelle pareti.** La cucina sciopera. Tutta.

> Natalino: "Emanuè... il cuoco di due metri e mezzo sta scioperando PER NOI. Io da domani lascio le mance TRIPLE, giuro sulla piastra."

**(La Fame dovrà servire da sola: fase uno SENZA camerieri. Sangue freddo +2.)**`,
    sets: { cucina_in_sciopero: true },
    choices: [
      { text: '⚔ Adesso sì: se la casa vuole un nome, dovrà venirselo a prendere. DA SOLA.', next: 'z3_boss_solo' },
      { text: '🍳 Chiedere allo Chef un ultimo consiglio da cucina: "Come si sgonfia una portata?"', once: true, next: 'z2_consiglio' },
    ],
  },

  z2_consiglio: {
    location: 'salaBanchetto',
    npc: ['cuoco'],
    caption: 'Il consiglio dello Chef',
    gold: 1,
    text: `> Emanuela: *(mentre lo Chef si avvia verso la cucina in sciopero)* "Chef! Un consiglio, da cucina a cucina. Come si sgonfia... una portata troppo piena di sé?"

Lo Chef si ferma sulla soglia. E si volta con la faccia di chi ha aspettato questa domanda per centoventicinque anni.

> Lo Chef: "Tre regole." *(alza un dito da macellaio)* "UNO: il soufflé crolla se apri il forno al momento sbagliato. Lei è cresciuta al buio e al chiuso: APRITELE gli sportelli. Luce, fuoco, calore vero — tutto quello che entra da fuori la sgonfia." *(secondo dito)* "DUE: le portate montate vanno servite SUBITO. Se la fate ASPETTARE — se perdete tempo, se la fate parlare, se le rompete il ritmo — si siede. Tutte le cose montate si siedono." *(terzo dito, e qui si china, e la voce di forno si fa quasi un sussurro)* "TRE, la più importante: nessun piatto sopravvive a un tavolo che NON HA FAME. Lei vive dell'appetito degli altri — della vostra paura, che è appetito al contrario. Guardatela come si guarda una minestra riscaldata, e vedrete cosa le succede."

Si infila nella cucina buia. Poi, dalla porta, un'ultima volta:

> Lo Chef: "E salatela. La minestra scema si sala SEMPRE."

**(Sangue freddo +1: tre debolezze vere — la luce viva, il ritmo rotto, la paura negata. Il sale l'avevate già capito.)**`,
    sets: { consiglio_chef: true },
    choices: [
      { text: '⚔ Al tavolo: la casa dovrà servirsi DA SOLA', next: 'z3_boss_solo' },
    ],
  },

  z3_boss_solo: {
    location: 'salaBanchetto',
    caption: 'LA FAME — servita male',
    text: `La casa smette di fingere, ma stavolta lo fa **in un silenzio sbagliato**: niente vassoi, niente passi di servizio, nessuno che sposti le sedie. La cucina è ferma. Il personale è fermo. La Fame si annoda il tovagliolo al collo **da sola** — e si vede che non le era mai successo.

> La Fame: *(con la voce di Gregorio, rubata)* "Il Banchetto... è servito... comunque."

> Gregorio: *(da qualche parte, debole ma quasi divertito)* "No, vecchia mia. Stanotte è servito MALE. Colpitela nel piatto: sale, phon, tutto ciò che è caldo e vivo!"

**(BATTAGLIA FINALE — fase uno, senza camerieri: lo sciopero dello Chef vi ha apparecchiato la strada.)**`,
    combat: {
      enemies: ['gregorio'],
      victory: 'z4_fase2',
      defeat: 'x_celle',
      bossPhase: true,
    },
  },

  z2_bambole: {
    location: 'salaBanchetto',
    caption: 'Le signorine del 1924',
    text: `Il valzer fischiato sale verso il soffitto, esile, un po' stonato — Emanuela non ha mai fischiato bene, e non è mai importato meno a nessuno.

E il soffitto risponde. Passini. Decine di passini di porcellana giù per le scale che nessuno sta guardando, lungo il corridoio, fino alla porta della sala — e le **bambole del 1924** entrano al Banchetto in fila per due, in punta di piedini, gli occhi ancora mezzi chiusi di sonno.

Trentadue. Sonnambule. Vengono al valzer come si viene a una ninna nanna cantata da qualcun altro, e si dispongono in cerchio **intorno a voi** — sedute per terra, composte, le mani in grembo. Un recinto di porcellana addormentata tra voi e la sedia a capotavola.

> La bambola grande: *(gli occhi chiusi, il sorriso dipinto rivolto verso capotavola)* "...loro... hanno spento la luce... come mamma Ada... loro... NON si toccano..."

E la casa — che può mangiare ospiti, camerieri, giardinieri e un secolo intero — esita davanti alle sue bambine addormentate. Il pavimento smette di inclinarsi. I candelabri si raddrizzano. Qualcosa, nel Belvedere, si vergogna.

> Emanuela: *(sottovoce, sistemando il phon nella cintura come una fondina)* "Grazie, signorine. Il resto lo facciamo noi. Voi dormite."

**(Un attimo di tregua nel cerchio di porcellana: +4 PV a tutti, Sangue freddo +2.)**`,
    heal: 4,
    gold: 2,
    sets: { cerchio_di_porcellana: true },
    choices: [
      { text: '↩ Tornare al tavolo, dentro il recinto delle signorine', next: 'z1' },
      { text: '🧸 Accarezzare piano la testa della bambola più vicina, per ringraziarla', once: true, next: 'z2_carezza' },
    ],
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
    gold: 1,
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

  z2_capitolazione: {
    location: 'salaBanchetto',
    npc: ['gregorio'],
    caption: 'La capitolazione',
    text: `È Gaetano a contarle, le carte — ad alta voce, con la calma di chi presenta i risultati di un collaudo.

> Gaetano: "Facciamo il punto. Il tuo maggiordomo è tornato UOMO, e sta dalla nostra parte del tavolo. Sul tavolo c'è un'offerta che la casa sta ancora rimasticando: il menù dei vivi, ricette nuove ogni anno, per sempre. E noi siamo ancora TUTTI in piedi alle sei meno un quarto." *(guarda la sedia a capotavola, dritto nel buio che la occupa)* "Casa. Tu il conto lo sai fare da centoventicinque anni. FALLO."

E Gregorio — umano, stanco, VIVO — fa la cosa che nessun custode ha mai fatto: si mette accanto a loro, di fronte alla propria casa, e parla da padrone.

> Gregorio: "Il signore ha ragione. La proposta è vantaggiosa. E io sono STANCO di apparecchiare per gente che non mastica." *(posa le mani sul tavolo del 1899)* "Il Banchetto è annullato per mancanza di portata principale. Il Belvedere RIAPRE — a ospiti veri, con ricette vere. È la mia ultima parola da custode... e la prima da albergatore."

La casa stringe. Una volta. Le assi gemono, i lampadari calano di un dito, i ritratti trattengono il fiato—

—e poi **molla.** Tutto insieme. Come una mano che dopo centoventicinque anni di pugno, finalmente, si apre.

Fuori, il cielo comincia a schiarire. Nessuna battaglia. Solo una casa vecchia, un uomo vecchio, e l'odore — impossibile, bellissimo — di caffè che sale dalla cucina, dove QUALCUNO ha già acceso il fuoco per la colazione.

**(La notte finisce senza sangue: la vittoria più rara del Belvedere. Sangue freddo +3. Flag: capitolazione.)**`,
    gold: 2,
    sets: { capitolazione: true, fame_sconfitta: true },
    choices: [
      { text: "🌅 Verso l'alba, tutti insieme — e verso la colazione", next: 'z6_alba' },
      { text: '🤝 Stringere la mano a Gregorio — da pari a pari, da albergatore a ospite', once: true, sets: { stretta_gregorio: true }, next: 'z6_alba' },
    ],
  },

  z5_vittoria: {
    location: 'salaBanchetto',
    caption: 'La fine del Banchetto',
    gold: 1,
    text: `L'ultimo colpo — sale, ceramica rovente, o pura ostinazione campana — attraversa la Fame da parte a parte.

E la Fame fa l'unica cosa che nessuno si aspettava: **si siede.** A capotavola. Composta. Come un ospite che ha finito.

> La Fame: *(con una voce sola, adesso: piccola, antica, STANCA)* "...centoventicinque anni... e nessuno che mi abbia mai chiesto... se avevo finito."

Si ripiega su sé stessa, sempre più piccola — un padrone di casa, un cappotto scuro, un'ombra su una sedia, una macchia, un niente. L'ultima cosa che resta di lei è il tovagliolo, piegato con cura accanto al piatto. *Il tovagliolo piegato: il segnale universale. Il pasto è finito.*

I ritratti alle pareti, vuoti degli sfondi, si riempiono di nuovo — ma stavolta di FACCE CHE SALUTANO: Sofia e i ragazzi del '99, i sei del 1924, Margherita, Ernesto — un attimo solo, il tempo di un cenno, di un *grazie* silenzioso attraverso il vetro — e poi le cornici restano bianche. Libere. **Vuote per sempre.**

Dalle finestre, sul filo dei monti, sta salendo **l'alba.**

*(continua)*`,
    sets: { fame_sconfitta: true },
    choices: [
      { text: 'Guardare l\'alba. Ve la siete guadagnata', next: 'z6_alba' },
      { text: '🖼 Contare le cornici vuote alle pareti — ognuna è qualcuno che torna a casa', once: true, sets: { cornici_contate: true }, next: 'z6_alba' },
    ],
  },

  z6_alba: {
    location: 'albaRelais',
    caption: 'L\'alba sul Belvedere',
    text: `L'alba, sui monti d'Irpinia, arriva come un perdono: prima grigia, poi rosa, poi di un oro che non chiede niente in cambio.

La nebbia della valle — il muro bianco che vi teneva chiusi — si ritira giù per i tornanti come la marea, e da Paternopoli, in basso, arriva un suono che non sentivate da un'era: **un gallo.** Poi le campane. Poi, una alla volta, le persiane del paese che SI APRONO.

Il Belvedere, alle vostre spalle, è solo una bella villa liberty un po' stanca, coi muri che hanno bisogno di una mano di bianco e un giardino magnifico. Il cancello è **aperto.** La ghiaia del viale, per una volta, è in disordine — e non se ne cura nessuno.

Sul bordo della piscina, cinque accappatoi asciugano al primo sole. **Cinque.** Il sesto non c'è più. Da nessuna parte.

E sulla porta, con un vassoio di caffè VERO — lo sentite dal profumo, il caffè finto non esiste in Irpinia — c'è Gregorio. Umano, vecchio, vivo, con gli occhi di uno che deve recuperare centoventicinque anni di colazioni.

> Gregorio: "Signori. Il conto." *(posa il vassoio, e accanto al vassoio un foglio piegato)* "Offre la casa. **Adesso posso dirlo davvero.**"

Sul foglio, nella solita calligrafia elegante, c'è scritto solo: *"SALDATO. — Il Belvedere"*. E sotto, in un'altra grafia, femminile e fitta: *"Tornate a trovarci. Da OSPITI. — A."*

**(Sangue freddo +3: l'alba, stasera, non era scontata.)**`,
    gold: 2,
    sets: { alba_vista: true },
    choices: [
      { text: '☕ Il caffè, l\'abbraccio, e la domanda che resta: "Gregorio... e adesso?"', next: 'e_alba' },
      { text: '👀 Guardare Paternopoli che si sveglia — le persiane, il gallo, il mondo vero', once: true, next: 'z6_pietrafonda' },
    ],
  },

  z6_pietrafonda: {
    location: 'albaRelais',
    stinger: 'campana',
    caption: 'Paternopoli si sveglia',
    gold: 1,
    text: `Prima del caffè, vi affacciate tutti e cinque alla balaustra a guardare il paese che si sveglia. Ve lo siete guadagnato.

Le persiane si aprono una via l'altra, e a ogni persiana corrisponde un rumore piccolo del mondo vero: una radio che parte con il giornale, una madre che chiama, una saracinesca che sale. E poi, giù al tornante zero, IL DETTAGLIO: il distributore ha la saracinesca alzata, e davanti alla pompa c'è **il benzinaio**, fermo, la mano sulla fronte a fare ombra, che guarda in su. Verso di voi.

Claudia alza un braccio. Lo agita, piano.

E il benzinaio — Gennaro, l'autista del Settantaquattro, l'uomo che ha contato cinque macchine salire e quasi nessuna scendere — resta immobile tre secondi. Poi si toglie il cappello. E lo tiene sul petto, come si fa al passaggio di qualcosa che merita rispetto.

> Natalino: *(con un groppo in gola che non prova nemmeno a nascondere)* "Ragazzi... ci sta salutando come si saluta chi TORNA. Secondo me è la prima volta che gli riesce."

Da qualche parte in paese, la campanella di Don Michele suona — a festa, e MALE, che è più onesto.

**(Sangue freddo +1: il paese vi ha visti riscendere. Dopo cinquant'anni, la statistica di Gennaro ha finalmente un segno più.)**`,
    sets: { pietrafonda_vista: true },
    choices: [
      { text: '☕ Il caffè, l\'abbraccio, e la domanda che resta', next: 'e_alba', sets: { ultimo_caffe: true } },
      { text: '👋 Rispondere al saluto di Gennaro, tutti e cinque, a braccia larghe', once: true, next: 'e_alba', sets: { saluto_a_gennaro: true } },
    ],
  },

  /* ==================== EPILOGO ==================== */

  e_alba: {
    location: 'albaRelais',
    caption: 'EPILOGO — Il Relais riapre',
    gold: 1,
    text: `**Un anno dopo.**

Il "Relais Belvedere — da Gregorio e Ada" ha riaperto a giugno, e ad agosto era già pieno: matrimoni, famiglie, gruppi di amici. Le recensioni parlano di un padrone di casa d'altri tempi, di una piscina che di sera è "un sogno", e di una signora invisibile che piega gli asciugamani **meglio di qualunque hotel a cinque stelle.**

Il pozzo del giardino ha una targa nuova: *"Fontana di Ada — esprimete un desiderio EDUCATO."*

La comunicazione la cura — gratis, come promesso — l'agenzia di Federico. Lo slogan l'ha scritto Natalino, per scherzo:

**"Belvedere. Nessuno vi tratterrà."**

E voi cinque? Voi ci tornate ogni anno, l'ultima settimana di agosto. Stessa camera ciascuno — Natalino ha PRETESO la Camera del Pozzo — stesso bagno di mezzanotte. L'acqua riflette il cielo giusto. Quasi sempre.

Ormai sapete come si fa: si alza il bicchiere verso il pozzo, si dice **"buonanotte, Ada"**, e si va a dormire.

Quella prima settimana ve la siete ripresa TUTTA: la sfida pancakes-crêpes è finita in pareggio (giudice Gregorio: *"entrambi... memorabili"* — Claudia pretende la revisione), la pasta di Emanuela ha commosso un maggiordomo di centoventicinque anni, le bruschette di Natalino sono entrate nel menù ufficiale, e la grigliata di Gaetano ha prodotto tanto fumo che Don Michele ha suonato una campana di saluto.

**🌅 FINE — Avete rotto un patto di 125 anni, liberato una casa e adottato due fantasmi. La vacanza può cominciare.**`,
    ending: true,
  },

  e_custode_gregorio: {
    location: 'albaRelais',
    caption: 'EPILOGO — La Firma Volontaria',
    stinger: 'campana',
    text: `La mano guantata arriva sulla penna un decimo di secondo prima di qualunque vostra. E stavolta non trema.

> Gregorio: "No, signori. Questa firma è MIA. Lo è sempre stata — solo che nel 1899 la misi per PAURA, e la paura non conta come consenso. Me l'avete insegnato voi, stanotte, col vostro vizio del contratto e i vostri biglietti ritrovati." *(apre il registro alla prima pagina, quella del 1899, e accanto alla firma antica — sbiadita, strappata alla fretta e al terrore — ne mette una NUOVA, lenta, in bella grafia)* "Gregorio. Custode. **Per scelta.**"

La casa trattiene il fiato. Perché in centoventicinque anni ha avuto prigionieri, vittime, ostaggi — ma un custode VOLONTARIO mai. E un patto firmato liberamente è una cosa diversa: non è più una catena. È un **contratto di lavoro.**

> Gregorio: *(e adesso sorride, davvero, mentre il primo sole gli attraversa la manica)* "Le condizioni le detto io, stavolta: gli ospiti entrano ED ESCONO. Le porte restano aperte. E ogni venticinquennio, invece del Banchetto..." *(vi guarda, uno per uno)* "...una RIMPATRIATA. Siete invitati. Portate le ricette."

Scendete i tornanti nel sole — la strada scende e basta — e l'ultima cosa che vedete del Belvedere, voltandovi al tornante undici, è il custode sulla soglia che vi saluta col vassoio, come il primo giorno. Ma il cancello, alle sue spalle, è **spalancato.** E lo resterà.

**✋ FINE — Uno è rimasto, ma nessuno è stato preso: la prima firma LIBERA nella storia del Belvedere. Il patto non è spezzato. È stato RINEGOZIATO.**`,
    sets: { finale_firma_volontaria: true },
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
    gold: 1,
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
    gold: 1,
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



/* Rivivi la Notte: punti d'ingresso per rigiocare rami mai visti, sbloccati
   dopo il primo finale del profilo. Ogni capitolo prepara flag e zaino minimi. */
const CHAPTERS = [
  { id: 'a0',       label: '🚗 Il viaggio — autogrill di Baiano', desc: 'Dall\'inizio: caffè, Gratta e Vinci e tornanti.', prefixes: ['a'] },
  { id: 'p1',       label: '🌊 La piscina di sera', desc: 'La scena da cartolina. E il riflesso sbagliato.', prefixes: ['p1', 'p2', 'p3', 'p4'] },
  { id: 'h1',       label: '🕯 Il corridoio di mezzanotte', desc: 'L\'hub delle tre piste: cantina, piano proibito, pozzo — e i momenti di respiro.', prefixes: ['h1', 'h2', 'gv1', 'nat_tronello', 'tronello_cerchio', 'ema_orto', 'cst', 'cuore_'] },
  { id: 'pp1',      label: '⛪ Paternopoli', desc: 'Il paese, Don Michele, la cripta dei custodi.', flags: { firma_rinviata: true }, prefixes: ['pp'] },
  { id: 'k1',       label: '🍷 La cantina', desc: 'Lo Chef, il forno del 1899 e l\'ossario là sotto.', prefixes: ['k', 'x_celle', 'os'] },
  { id: 'u1',       label: '🚪 Il piano proibito', desc: 'Le stanze dei gruppi: 1999, 1949, 1974, 1924, 1899 — e la soffitta.', prefixes: ['u', 'sf', 's49_', 's74_'] },
  { id: 'b1',       label: '🌳 Il pozzo e il garage', desc: 'Il regno del Giardiniere, la voce dal pozzo, la rimessa dei motori.', prefixes: ['b', 'gr'] },
  { id: 'ft1',      label: '🛣 La Strada che Torna', desc: 'Scendere a piedi, di notte. Ventisei tornanti. O forse no.', prefixes: ['ft'] },
  { id: 'w1_tuffo', label: '🌒 Il Riflesso', desc: 'Il mondo capovolto sotto la piscina. Sofia vi aspetta.', flags: { un_nodo_sciolto: true }, prefixes: ['w'] },
  { id: 'z1',       label: '🍽 Il Banchetto — tutte le carte in mano', desc: 'Ore 5:57 con ogni nodo sciolto e ogni segreto in tasca: provate i finali che vi mancano.',
    flags: { un_nodo_sciolto: true, rituale_noto: true, strada_che_torna: true, chef_amico: true, bambole_addormentate: true, segreto_custodi: true, ultimo_biglietto: true, storia_1974: true, menu_memoria: true },
    items: ['sale_grosso', 'acqua_pozzo', 'vino_1899', 'campanella_1974', 'gratta_vinci', 'biglietto_1949'], prefixes: ['z', 'e_', 'gvz'] },
  { id: 'z1_puro',  scene: 'z1', label: '🍽 Il Banchetto — a mani nude', desc: 'Ore 5:57 senza assi nella manica: la battaglia, la resa, la penna che non conoscete.',
    flags: { un_nodo_sciolto: true }, prefixes: ['z', 'e_', 'gvz'] },
];

/* Il Diario della Notte: le conoscenze acquisite, in chiaro, per chi gioca 4-6 ore
   e non deve ricordare tutto a memoria. Ordine = ordine di visualizzazione. */
const DIARY_FLAGS = [
  ['conti_sbagliati',      'I conti del Contabile, sbagliati in un modo nuovo. Niente paga — ma il Belvedere tiene i libri da centottant\'anni e nessuno gli ha mai chiesto di mostrarli: adesso sapete che si può chiedere.'],
  ['firma_rinviata',        'Federico ha RINVIATO la firma: chi non ha firmato può ancora varcare il cancello verso Paternopoli.'],
  ['benzinaio_sapeva',      'Il benzinaio di Baiano ha contato cinque macchine, una ogni 25 anni. Sta laggiù APPOSTA. E ha una frase sola per provarci: "lasciate stare il pozzo."'],
  ['garage_visto',          'Nella rimessa: la vostra auto è smontata in bacheca, pezzo per pezzo. E la candela era ancora tiepida.'],
  ['giardiniere_potato',    'Il Giardiniere è PAGLIA SPARSA nei filari: si sta rifacendo, ma stanotte il giardino non ha turno di notte.'],
  ['giardiniere_allertato', 'Il Giardiniere sa che girate di notte: le cesoie, da qualche parte nella nebbia, tengono il conto.'],
  ['strada_che_torna',      'Le strade TORNANO: i ventisei tornanti sono un anello. L\'uscita non è fuori — è nel centro. La casa.'],
  ['paese_sa',              'Paternopoli lo sa dal 1899: la corriera smise di salire nel \'74. La strada conta chi ha firmato — e Don Michele è un errore di arrotondamento.'],
  ['verita_firma',          'La verità sulla firma: non è un contratto, è un CONSENSO. La casa non può prendere chi non firma — può solo convincerlo a farlo. Tutto il Belvedere è un lungo, paziente convincimento.'],
  ['vista_sagoma_99',       'La sagoma vista in piscina, di notte: qualcuno del 1999 nuota ancora, nell\'ora esatta in cui l\'acqua se lo ricorda.'],
  ['ricetta_antidoto',      'La ricetta dell\'antidoto, strappata allo Chef: le erbe giuste dell\'orto di Ada, bollite finché il freddo non molla. Lui la sapeva a memoria. Da prima del 1899.'],
  ['storia_ada',            'Conoscete la storia di Gregorio e di Ada: la ciocca bianca, il patto, i centoventicinque anni.'],
  ['medaglione',            'Il MEDAGLIONE DI ADA è vostro: sei ciocche intrecciate. Al pozzo vale una vita.'],
  ['bambole_addormentate',  'Le signorine del 1924 DORMONO, grate alla luce di mamma Ada. Un valzer fischiato può chiamarle, se servisse.'],
  ['chef_amico',            'Lo Chef vi considera OSPITI: ai signori del \'74 non si dice di no. E gli ospiti non si impiattano.'],
  ['chef_allertato',        'La bottiglia di Ernesto si è spaccata e lo Chef si è SVEGLIATO: in cucina, adesso, rubare è molto più difficile.'],
  ['tacca_di_gregorio',     'Nell\'ossario, tra le tacche degli ospiti, ce n\'è UNA incisa e reincisa da centoventicinque anni: quella di Gregorio. Il primo prigioniero conta anche sé stesso.'],
  ['bagagli_visti',          'I bagagli mai ritirati, catalogati per anno sugli scaffali dell\'ossario. E in fondo, uno scaffale VUOTO con le targhette già scritte: "2024".'],
  ['sceso_ossario',         'Siete scesi nell\'ossario dietro la cella frigorifera: i bagagli mai ritirati, le tacche sul muro.'],
  ['segreto_contabile',     'Il Contabile vi ha confidato il suo segreto: anche la casa tiene una contabilità. E i conti non tornano.'],
  ['pista_paese',           'Paternopoli vi conosce: Don Michele, il bar del 1999, la cripta dei custodi.'],
  ['cerchio_rosso',         'Nella polaroid del 1999, uno dei cinque ragazzi è cerchiato in rosso. La grafia del cerchio è di Sofia. E il ragazzo cerchiato è l\'unico che nei ritratti della hall NON c\'è.'],
  ['visto_occhio',          'Dal telescopio della soffitta l\'avete visto: c\'è un OCCHIO nella piscina. Il riflesso guarda.'],
  ['regole_casa_note',      'Le tre regole del Belvedere, imparate sulla pelle: la casa sente tutto, la casa non dimentica, la casa RISPETTA chi gioca bene.'],
  ['un_nodo_sciolto',       'Almeno un nodo della casa è SCIOLTO: quando sarete pronti, ci si può barricare e aspettare il Banchetto.'],
  ['stanza_custode',        'La stanza del custode: la branda mai usata, il quaderno delle prove generali ("RIPROVA DOMANI") e il biglietto del 1949 mai consegnato. Gregorio ci ha provato. Una volta.'],
  ['gregorio_vacilla',      'Gregorio ha riletto il proprio biglietto del 1949 e se l\'è rimesso nel taschino. Stavolta il custode vacilla e NON si raddrizza.'],
  ['segreto_custodi',       'Il segreto della cripta: il patto è più VECCHIO di Gregorio — e un custode può RIFIUTARSI di passare la penna. O romperla.'],
  ['ada_perdono',           'Ada perdona Gregorio "a metà — la metà che serve". Parole da riferire: al Banchetto varranno un alleato.'],
  ['capitolazione',         'La casa ha mollato la presa senza battaglia: il Banchetto annullato per mancanza di portata principale. La vittoria più rara del Belvedere.'],
  ['menu_dei_vivi',         'La contro-offerta di Emanuela è agli atti: il menù dei VIVI — pancakes, crêpes, bruschette, la grigliata — che la casa può avere solo lasciandovi tornare. E una casa che pensa morde più piano.'],
  ['rituale_noto',          'Conoscete il RITUALE: sale sulla firma, acqua di Ada sul registro, e restituire il nome.'],
  ['orologio_reso',         'L\'orologio di Sofia è tornato al suo polso: il suo tempo, dopo venticinque anni, è ripartito.'],
  ['riflesso_fatto',        'Il Riflesso sotto la piscina ha un padrone di meno: gli ospiti trattenuti sono liberi.'],
  ['tronello_promesso',     'Ada vi ha chiesto un tiro di tronello "per quando esce". E i ragazzi del \'74, il cuoco li ADORAVA.'],
  ['stanza_intravista',     'Il fumo del cerchio ha disegnato la pianta del primo piano: in fondo al corridoio c\'è una STANZA CHE NON C\'È. La porta con la targhetta vuota.'],
  ['intercapedine_trovata', 'Dietro la quinta cornice: il ritratto che la casa tiene di sé — di giorno, felice, "per ricordarmi". Non regge il confronto: è un\'arma.'],
  ['orto_curato',           'Emanuela ha curato l\'orto di Ada, da giardiniera a giardiniera. Il rametto d\'argento nella sua borsa è un regalo della padrona di casa.'],
  ['cuore_fe',              'Il ferro di cavallo Made in China è appuntato al colletto di Federico: una volta per scontro, il suo primo 1 si ritira. "Ridicolo e vivo."'],
  ['foto_balcone',          'Sfondo del telefono di Claudia: la foto del balcone con la nebbia sbagliata — e le vostre mani, mosse e vive, che la casa non può toccare.'],
  ['ultimo_biglietto',      'Natalino conserva l\'ULTIMO Gratta e Vinci: "lo gratto quando usciamo, con l\'alba in faccia". È una promessa.'],
  ['biglietto_strappato',   'Il quinto biglietto aveva vinto "una notte, ospite della casa, per sempre". Natalino l\'ha strappato: RITENTA.'],
  ['casa_rispetta',         'Avete denunciato la trappola in faccia a Gregorio, e il suo sorriso è scivolato: la casa vi RISPETTA.'],
  ['cucina_in_sciopero',    'La cucina SCIOPERA per voi: la Fame, stanotte, serve da sola.'],
  ['sorpresa',              'La casa è stata colta di SORPRESA — una diretta, un sale spanto, un anello mostrato: comunque sia andata, il primo assalto è vostro.'],
  ['cerchio_di_porcellana', 'Trentadue signorine di porcellana fanno cerchio intorno a voi. La casa, davanti a loro, si vergogna.'],
  ['lettere_lette',         'Le lettere di Gregorio e Ada: l\'ampliamento per le famiglie, i bambini, il futuro che il patto ha cancellato. Posate sul tavolo del Banchetto, pesano più di qualsiasi arma.'],
  ['stanza_1974_visitata',  'La stanza del \'74 è vuota da cinquant\'anni: le brande disfatte, il mangianastri a pile, l\'etichetta di una ragazza che rideva. L\'accordatura, quella l\'hanno trovata.'],
  ['inventario_scoperto',   'L\'INVENTARIO: di qua non siete ospiti, siete ARTICOLI. Sofia — servizio da tè, 1999. Voi, ancora non catalogati. Finché il Direttore non decide come schedarvi.'],
  ['nessun_segnale',        'Nessun segnale sulla piazzola dei tornanti: cinque telefoni alzati al cielo come un rito pagano, e il cielo non risponde.'],
  ['benzinaio_insistito',   'Al benzinaio è stato chiesto del pozzo, e lui ha chiuso la saracinesca. A Baiano, alle sei e mezza di un venerdì d\'estate.'],
  ['giardino_ispezionato',  'Le siepi del Belvedere non sono ornamentali: sono contenitive. Gaetano le ha paragonate a gabbie di Faraday.'],
  ['registro_bloccato',     'Gregorio ha bloccato il registro prima che si vedessero le date: "le storie degli altri ospiti sono la parte più noiosa". I vostri nomi erano già scritti.'],
  ['brindisi_rifiutato',    'Gregorio non beve. Non mangia. Il suo coperto in cucina è pulito E impolverato insieme.'],
  ['programma_serata',      'Il programma di Gregorio: piscina fino a mezzanotte. Il giardiniere pota al buio. Le siepi, dice, non lo vedono arrivare.'],
  ['soffitta_esplorata',    'La soffitta è stata perquisita da cima a fondo: il telescopio, le casse, le lettere, i ritratti vuoti.'],
  ['reduci_1949_visti',     'La stanza del 1949: quattro reduci fermi a metà mano di scopa, da settantacinque anni. La radio del 12 agosto non si è mai fermata.'],
  ['fuga_inseguita',        'La discesa col Giardiniere alle spalle: cesoie nel buio, olivi che non giudicano, e la certezza che le cose della casa non si stancano mai.'],
  ['ferro_cavallo',         'Il ferro di cavallo Made in China di Emanuela, appuntato al colletto di Federico come una spilla. "Ridicolo e vivo."'],
  ['pozzo_risponde',        'Dal pozzo, la voce di Ada ha risposto a Natalino: "Single per scelta, hai detto. Anch\'io alla fine l\'ho scelto." Ha promesso una cartolina di Capri.'],
  ['manifesto_74_letto',    'Il manifesto della comune del \'74: cinque firme con i nomi enormi e la convinzione, ingenua e totale, che l\'amore scioglie ogni patto.'],
  ['saluto_sofia',          'Sofia ha salutato dall\'altra parte della piscina capovolta: "Raccontate di noi fuori. NON lasciate che ci dimentichino."'],
  ['alba_vista',            'L\'alba sul Belvedere: la nebbia che si ritira, il gallo, le persiane di Paternopoli che si aprono. E Gregorio con il caffè vero.'],
  ['batterie_risparmiate',  'Telefoni spenti alla piazzola: l\'ultima batteria risparmiata per una notte che non sapete ancora quanto sarà lunga.'],
  ['sesta_finestra_notata', 'La sesta finestra, quella con la tenda scura: l\'unica che non ha risposto alla luce della sera.'],
  ['biglietto_strappato_raccolto','I pezzi del biglietto strappato raccolti come souvenir: l\'ultimo gratta-e-vinci di una vita precedente.'],
  ['cornici_riguardate',    'Le cornici vuote sopra i letti: tutte uguali, tutte senza foto. Chi le ha svuotate ha fatto in fretta.'],
  ['accappatoi_ricontati',  'Gli accappatoi contati di nuovo: sei, come prima. Il sesto non ha smesso di esistere solo perché vi fa comodo.'],
  ['occhiali_provati',      'Gli occhiali del \'99 provati un istante: il mondo visto attraverso lenti vecchie di trent\'anni. Poi rimessi via, in fretta.'],
  ['bottiglie_riordinate',  'Le bottiglie della rastrelliera rimesse in fila con rispetto, come se la cantina meritasse ancora un po\' di ordine.'],
  ['chitarra_provata',      'Un accordo sulla chitarra abbandonata del \'74: stonato, triste, perfetto per salutare una stanza che non vi aspettava.'],
  ['nomi_comune_copiati',   'I cinque nomi del manifesto della comune, copiati su un foglio: persone vere, con firme enormi e una convinzione che non è bastata.'],
  ['tavolo_ripulito',       'Il tavolo da macellaio ripulito prima di andare: un gesto di cortesia verso una cucina che ha dato più di quanto dovesse.'],
  ['acqua_toccata',         'L\'acqua del secchio toccata con le dita: luminosa, fredda, e per un istante ha tremato come se qualcuno la guardasse dal fondo.'],
  ['promessa_ad_ada',       'La promessa fatta ad Ada in fondo al pozzo: raccontare la sua storia fuori, se ce la farete. Ada ha annuito senza parlare.'],
  ['ultimo_tiro_condiviso', 'L\'ultimo tiro tenuto da parte, fumato in silenzio con Ada: il fumo che sale nel pozzo si è perso prima del bordo.'],
  ['pozzo_salutato',        'La voce del pozzo salutata prima di richiudere la finestra: ha risposto con un eco che somigliava a un grazie.'],
  ['rosmarino_raccolto',    'Un rametto di rosmarino raccolto dall\'orto di Ada: per la cena di domani, se ci sarà un domani.'],
  ['borsa_riesplorata',     'Emanuela ha ripescato dalla borsa infinita qualcos\'altro: quella borsa contiene più cose di quante ne entrano.'],
  ['telescopio_riguardato', 'Un\'ultima occhiata al telescopio prima di chiudere la botola: puntato su qualcosa che non si vede da qui.'],
  ['specchio_ricoperto',    'Lo specchio velato ricoperto con più cura di come l\'avete trovato: quello che c\'è dentro non merita altra luce.'],
  ['sigaretta_gesto',       'La sigaretta mai fumata accesa solo per il gesto, guardando il pozzo: Natalino, da solo, ha bisogno di poco per stare bene.'],
  ['tenda_chiusa_con_rispetto','La tenda chiusa piano, lasciando alla signora un po\' di privacy: certi incontri si chiudono con le mani, non con le parole.'],
  ['ferro_cavallo_doppio',  'Il ferro di cavallo appuntato anche sulla borsa di Emanuela: doppia protezione, per chi ci crede e per chi non ci crede.'],
    ['silenzio_rispettoso',   'Un momento di silenzio lasciato a Gregorio per ricomporsi: il perdono ha un suono preciso, e quel suono era il vostro respiro.'],
  ['mano_stretta_gregorio', 'La mano stretta a Gregorio, da uomo a uomo: le dita fredde, la presa ferma. Un patto senza parole.'],
  ['tornanti_ripetuti',     'Il numero dei tornanti ripetuto a voce alta: la geometria della strada sbagliata, fissata in mente prima che cambi di nuovo.'],
  ['bambola_accarezzata',   'La testa della bambola accarezzata per ringraziarla: le signorine del 1924 non chiedevano molto. Solo di essere viste.'],
  ['prima_ricetta_promessa','La prima ricetta promessa a Gregorio, lì, subito: il menù dei vivi comincia da una promessa fatta a tavola.'],
  ['dita_direttore_contate','Le dita del Direttore, contate anche da voi: DIECI. Esatte, curate, perfette. Ed è proprio questo a essere sbagliato.'],
  ['campanella_mostrata',   'La campanella mostrata a Gregorio prima di risalire: lui l\'ha guardata senza dire niente, il che è già una risposta.'],
  ['promessa_don_michele',  'La promessa fatta a Don Michele: tornare a raccontargli com\'è andata. Ha annuito come chi sa che non tornerete, ma apprezza lo stesso.'],
  ['monete_lasciate',       'Qualche moneta lasciata sul bancone del bar di Peppe, chiuso dal 1999: un caffè pagato a un barista che non c\'è più.'],
  ['gruppo_stretto_freddo', 'Tutti stretti insieme per scaldarsi prima di rientrare: un\'ora di buio e di freddo che non dimenticherete.'],
  ['corda_fotografata',     'La foto della corda del pozzo: nella foto è TESA verso l\'alto, in trazione. Qualcosa, di sotto, si tiene pronto a salire.'],
  ['taglio_ascoltato',      'Oltre il taglio del nastro del \'74, mezzo secondo di voce: "...sta funzionando. Guardate le pareti—". Non hanno perso: sono stati INTERROTTI.'],
  ['tisana_bevuta',         'Federico ha bevuto la tisana della casa: camomilla e miele, innocua. Poi la tazza si è riempita da sola, con un biglietto: "Omaggio della casa."'],
  ['tempo_ripartito',       'Le parole di Natalino a Sofia: il tempo non si recupera, si RICOMINCIA. È l\'unico trucco che ha. E Sofia ha smesso di fare la guardia al passato.'],
  ['abbraccio_sofia',       '\"...siete CALDI. Vi avevo scordati CALDI.\" Il primo abbraccio di Sofia in venticinque anni: dieci secondi, e nessuno ha mollato per primo.'],
  ['radio_ascoltata',       'La radiolina del distributore, ascoltata fino in fondo: "la casa ringrazia, la casa ricorda, la casa CONTA." Trasmissione per soli ospiti in salita.'],
  ['lampadario_notato',     'Il lampadario che si ferma un istante PRIMA che Gregorio passi: in questa casa perfino i cristalli sanno chi comanda.'],
  ['luce_hall_notata',      'La luce della hall rimasta più calda dopo la firma: la casa ha cambiato temperatura, come un forno che si chiude.'],
  ['registro_riaperto_visto','Il registro riaperto da solo, con una riga a matita in più e un numero in margine: 6. Voi siete in cinque.'],
  ['vino_gregorio_annusato','Il vino di Gregorio annusato da vicino: nessun odore, nessun peso, nessuna verità. Scenografia in un bicchiere.'],
  ['coperto_cucina_visto',  'Il coperto apparecchiato in cucina, pulito e impolverato insieme, con un ricamo: "A." Qualcuno è atteso a cena da centoventicinque anni.'],
  ['persiane_controllate',  'La persiana del secondo piano, aperta a metà e poi richiusa senza vento: il piano proibito vi ha guardati per primo.'],
  ['anello_fotografato',    'La foto dell\'anello con la mano SBAGLIATA: smalto rosa, segno bianco all\'anulare. Sofia si è fatta vedere come ha potuto.'],
  ['ciocca_bianca_osservata','La ciocca di Gregorio non è bianca: è ASSENTE. È il pezzo che la casa gli tiene in pegno dal 1899.'],
  ['storie_74_chieste',     'Aldo del Settantaquattro: rideva forte, masticava piano, e fu preso col quaderno delle ricette in tasca. Il fratello suona le campane da allora.'],
  ['contatto_chef_chiesto', 'Il contatto dello Chef, per il format tv: "disponibile dal 2049, citofonare tre volte." Il primo appuntamento fissato con un morto.'],
  ['camera6_vista',         'La Camera n. 6, arredata con un pezzo di ogni gruppo preso: la proposta di matrimonio della casa ad Ada. Rifiutata da 125 anni.'],
  ['scuse_ripetute',        'Le scuse rifatte bene alla Signora Ada del Belvedere: le prime le detta la paura, le seconde le sceglie la persona.'],
  ['pagine_rilette',        'Le tre pagine del diario lette ad alta voce nella camera del pozzo: sale, acqua, e un nome dato per amore. E la verità sulla firma rubata.'],
  ['conti_chiesti',         'Il conto del Contabile: trenta gruppi per pareggiare — o UNO che paghi in moneta buona. Il rituale visto dai numeri.'],
  ['compagnia_offerta',     'Cinque minuti di compagnia al Contabile, messi a bilancio alla voce "entrate straordinarie, valore inestimabile."'],
  ['nebbia_osservata_insieme','La nebbia non nasconde la strada: la SORVEGLIA. Gira in tondo come un faro, e inquadra sempre il tornante undici.'],
  ['fumo_seguito',          'Il filo di fumo sceso fino al pozzo, i due giri di campanello attorno alla cuspide, e l\'anello di fumo risalito in risposta: Ada gradisce.'],
  ['nome_sofia_detto',      'Il nome di Sofia detto in coro nel Riflesso: iscritta in due registri, e la casa ne possiede uno solo.'],
  ['mano_gregorio',         'La mano di Gregorio cercata e trovata nel buio, dalla VOSTRA parte del tavolo. Nessun gruppo l\'aveva mai fatto.'],
  ['consiglio_chef',        'Le tre regole dello Chef per sgonfiare una portata montata: la luce viva, il ritmo rotto, e un tavolo che non ha fame.'],
  ['penna_osservata',       'Il solco nel fusto della penna del 1899: una firma iniziata e mai finita, decine di migliaia di volte. Una diga che perde.'],
  ['pietrafonda_vista',     'Paternopoli che si sveglia, e Gennaro giù al distributore che si toglie il cappello: la prima macchina che riscende, in cinquant\'anni di conta.'],
  ['biglietti_ricontrollati','Il terzo Gratta e Vinci ricontrollato: RITENTA era diventato RIENTRATE. E il regolamento parla di giocatori che diventano montepremi.'],
  ['luci_fotografate',      'La foto delle cinque luci tre tornanti più in basso: cinque facce stanche, le vostre, che fotografano verso l\'alto.'],
  ['corriera_fotografata',  'Il penultimo finestrino della corriera del \'74: Gennaro, giovane, che non saluta. Il testimone che comprò il distributore per fare la guardia.'],
  ['diretta_salvata',       'Il video della diretta: 25° tentativo di ripresa, il primo riuscito. Firmato "— B." La casa si firma.'],
  ['cartellino_controllato', 'I cartellini delle valigie pronte: "ritiro previsto: MAI". E il quinto, dedicato a chi controlla i cartellini.'],
  ['volto_benzinaio_ricordato','La radiolina legata al polso con lo spago, lo straccio passato tre volte su mani pulite: Gennaro si toglie la casa di dosso da cinquant\'anni.'],
  ['quaderno_riletto',      'L\'ultima pagina del quaderno di Gregorio, datata IERI: "il gruppo di domani ride forte." E una goccia tonda caduta sull\'ultima parola.'],
  ['promessa_sofia',        'La promessa a Sofia, che ha pianto lacrime NON catalogabili: da articolo di inventario a storia raccontata. Deprezzamento inverso.'],
  ['ricordi_gregorio_chiesti','I ricordi che Ada tiene stretti: il valzer contato male e la mano sotto il tavolo durante i temporali. Il suo sale grosso.'],
  ['federico_offerta',      'La pratica del Direttore: "OFFERTA VERBALE — F. Domani muoio, ripetuta davanti a testimoni." La casa non capisce le battute. I contratti sì.'],
  ['offerta_ritirata',      'Federico si è rimangiato la battuta ad alta voce, davanti alla casa, pagando il conto: "Domani NON muoio. Ho un sacco di impegni, domani."'],
  ['sciame_vinto',          'Lo sciame del pozzo, sconfitto a bordo piscina: diecimila vespe grigie che custodivano le minute del contratto del 1899. Impollinano una cosa sola: le firme.'],
  ['conti_chiusi',          'I conti del giorno, chiusi in cinque per il Contabile: il primo stipendio mai pagato al Belvedere. Chi sa far di conto tratta per iscritto.'],
  ['riga_letta_gregorio',   'La regola di Ada, 12 agosto 1899: "in questa casa non si firma MAI niente dopo cena." Tre giorni dopo, Gregorio firmò. Dopo cena.'],
  ['cesoie_raccolte',       'Le cesoie del Giardiniere, raccolte dall\'orto: ferro del 1899, affilato ogni notte da mani di paglia. Ora potano per voi.'],
  ['panorama_filari',       'I filari della valle visti dal muretto dell\'orto: geometrie perfette che nessun contadino ha piantato. La collina ha i suoi disegni.'],
  ['stretta_gregorio',      'La stretta di mano di Gregorio: fredda, ferma, e più GRATA di quanto un maggiordomo possa permettersi di mostrare.'],
  ['parola_ballerino_sentita','Il sussurro del Ballerino del 1924: un-due-tre, un-due-tre, un-due-SEI. La casa non conta mai per sbaglio.'],
  ['zaino_sofia_aperto',    'Lo zaino Invicta di Sofia: il walkman giallo, lo smalto rosa, e un diario che chiede se il pranzo della domenica esiste ancora.'],
  ['walkman_ascoltato',     'Il nastro di Sofia: una hit del \'99 e un avviso registrato di nascosto — "NON. FARE. IL BAGNO. DI—". La casa lo ha fermato anche stavolta.'],
  ['bottiglia_gregorio_vista','La sesta bottiglia del 1899: "Gregorio", piena, col tappo infilato da dentro. Quello di sopra col candeliere è il tappo. Il vino sta in cantina.'],
  ['cornici_contate',       'Le cornici della galleria, contate una per una: venti ritratti, venticinque posti. La casa apparecchia sempre in anticipo.'],
];

/* Mappa del mondo: luoghi del Belvedere (per il canvas della mappa) */
const WORLD_MAP = [
  { key: 'tornanti', label: 'I Tornanti',      x: 0.12, y: 0.80, scenes: ['a0_radio', 'ft2_foto_luci', 'a0', 'a0_benzina', 'a0_benzina2', 'a1', 'a1b', 'ft1', 'ft1_inseguiti', 'ft_cesoie', 'ft_cesoie_vinto', 'ft2_capito', 'ft2_notte'] },
  { key: 'relais',   label: 'Il Relais',       x: 0.40, y: 0.30, scenes: ['p4_tisana', 'a2', 'a2_siepi', 'a2_siepi_b', 'p4_fuga', 'gr1', 'gr2', 'gr3', 'gr3_ko'] },
  { key: 'hall',     label: 'La Hall',         x: 0.56, y: 0.48, scenes: ['a4_lampadario', 'a4_luce', 'a4_registro', 'a3', 'a3_registro', 'a3_registro_ko', 'a4_firma', 'a4_rinvio', 'a4_firma_forzata', 'p4_rientro'] },
  { key: 'camere',   label: 'Le Camere',       x: 0.74, y: 0.32, scenes: ['s74_taglio', 'nat_saluto', 's74_accordo', 'mg_valzer', 'u3_ninna', 'u2_zaino', 'u2_walkman', 'h2_ciocca', 'cuore_gc_nebbia', 'cuore_fe_borsa', 'u2_camera6', 'tronello_fumo', 'cst2_quaderno', 'gv1_ricontrollo', 'a5', 'a5_pozzo', 'h1', 'h2', 'gv1', 'nat_tronello', 'tronello_cerchio', 'ema_orto', 'cst1', 'cst2', 'u1', 'u2_1999', 'u2_1924', 'u2_1899', 'u3_medaglione', 'u3_lanterna', 'u3_bambole_fight', 'u3_bambole_vinte', 'u5_specchio', 'u4_porta_vuota', 'u4_intercapedine', 'sf1', 'sf2', 'sf3', 'sf4', 'sf5', 'sf6', 's49_1', 's49_2', 's49_3', 's49_3_ko', 's74_1', 's74_1b', 's74_2', 's74_3', 'cuore_gc', 'cuore_gc_esito', 'cuore_fe', 'cuore_fe_esito', 'cuore_nat', 'cuore_nat_esito'] },
  { key: 'pranzo',   label: 'Sala da Pranzo',  x: 0.46, y: 0.62, scenes: ['z_stretta', 'z2_ricetta', 'z2_carezza', 'z_offerta', 'a6_vino', 'a6_coperto', 'a7_persiane', 'z_lettere_riga', 'z2_mano', 'z2_diretta', 'z2_consiglio', 'z_penna_sguardo', 'z6_pietrafonda', 'a6', 'a6_menu', 'a6_brindisi', 'a6_no_brindisi', 'a7', 'z1', 'z2_vino', 'z2_perdono', 'z2_menu_vivi', 'z2_capitolazione', 'z2_trattativa', 'z2_rituale', 'gvz', 'z_biglietto', 'z_lettere', 'z2_strada', 'z2_alleato', 'z2_bambole', 'z2_claudia', 'z3_boss', 'z3_boss_solo', 'z3_boss_arrabbiato', 'z3_boss_indebolito', 'z4_fase2', 'z5_vittoria', 'z6_alba', 'e_alba', 'z_penna', 'z_penna_no', 'e_penna', 'z_custode', 'e_custode', 'e_custode_gregorio', 'z_resa', 'e_ospiti', 'z_vespri', 'z_smemorati', 'e_smemorati'] },
  { key: 'riflesso', label: 'Il Riflesso',      x: 0.10, y: 0.28, scenes: ['w10_abbraccio', 'w12_anello', 'w12_tempo', 'w15_abbraccio', 'w8_pratica', 'w6_parola', 'w16_promessa', 'w18_nome', 'w1_tuffo', 'w2_riflesso', 'w2_riflesso_ko', 'w3_giardino', 'w3_pattuglia_combat', 'w4_sofia', 'w5_racconto', 'w6_1924', 'w7_ronda', 'w7_ronda_combat', 'w8_direttore', 'w9_studio', 'w9_studio_combat', 'w10_orologio', 'w10_orologio_reso', 'w11_inventario', 'w12_tradimento', 'w12_sofia', 'w14_direttore_boss', 'w15_vittoria', 'w16_amaro', 'w17_fuga', 'w17_fuga_ko', 'w18_soglia', 'w18_saluto', 'w_finale'] },
  { key: 'paese',    label: 'Paternopoli',     x: 0.16, y: 0.90, scenes: ['pp4_promessa', 'pp7_campanella', 'pp_foto_corriera', 'pp1', 'pp2', 'pp2_bar', 'pp3', 'pp_anello', 'pp4_cripta', 'pp4', 'pp6', 'pp6_ko', 'pp7'] },
  { key: 'piscina',  label: 'La Piscina',      x: 0.22, y: 0.50, scenes: ['w_finale_libera', 'p1_occhiali', 'p_vespe', 'p_vespe_vinto', 'p2_foto_anello', 'p1', 'p1_accappatoio', 'p1_accappatoio_ko', 'p2', 'p2_esperimento', 'p2_esperimento_ko', 'p3_fuori'] },
  { key: 'cantina',  label: 'La Cantina',      x: 0.62, y: 0.78, scenes: ['os_spaccio', 'mg_conti', 'os_conti_ok', 'os_conti_ko', 'k1_1899', 'k4_storie', 'k4_contatto', 'os3_cartellino', 'os5_conti', 'os6_compagnia', 'k1', 'k2_sofia', 'k2_sofia_ko', 'k3', 'k4_scambio', 'k4_nastro', 'k4_chef_fight', 'k4_furto', 'k4_furto_ko', 'k5_dopo_chef', 'x_celle', 'os1', 'os2', 'os3', 'os4', 'os5', 'os6'] },
  { key: 'pozzo',    label: 'Il Pozzo',        x: 0.86, y: 0.66, scenes: ['b4_ultimo_tiro', 'mg_corsa_siepi', 'b1_volto', 'b4_ricordi', 'b4_promessa', 'b4_scuse', 'b4_pagine', 'b1', 'b1_avviso', 'b2_giardiniere_fight', 'b2_vinto', 'b2_orto', 'b3_pozzo', 'b4_medaglione', 'b4_tronello', 'b4_vino', 'b4_parole', 'b4_ira', 'b4_calata', 'b4_calata_ko'] },
];

