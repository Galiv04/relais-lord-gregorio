/* ============ APPROFONDIMENTI — contenuti opzionali della notte ============
   Bozza. NON collegata al gioco: da fondere a mano in js/campaign.js quando
   Gali avrà scelto gli agganci definitivi (vedi report dell'agente).
   Formato identico a CAMPAIGN/ITEMS in js/campaign.js.

   IMPORTANTE SUI PAINTER: js/scenes.js ha un disegnatore di sfondo per un
   set FISSO di location ('titolo','tornanti','relais','hall','corridoio',
   'camera','salaDaPranzo','piscina','cantina','pianoProibito','giardino',
   'pozzo','salaBanchetto','paese','albaRelais'). Una location non in
   quell'elenco fa CRASHARE il rendering (Scenes.paint chiama
   painters[locationKey] senza fallback sicuro). Per questo tutte le scene
   qui sotto riusano location esistenti, scelte per vicinanza tematica:
     - Ossario (os*)      -> 'cantina'      (è la sotto-cantina)
     - Garage (gr*)        -> 'cantina'      (nessun painter da rimessa;
                              i "ganci che oscillano" del painter cantina
                              calzano bene col motore appeso al muro)
     - Soffitta (sf*)      -> 'camera'       (stanza generica, come già
                              fanno u2_1899/u2_1924/u2_1999/a5_pozzo)
     - Stanza 1949 (s49_*) -> 'camera'
     - Stanza 1974 (s74_*) -> 'camera'
     - cuore_gc            -> 'giardino'     (balcone sotto le stelle)
     - cuore_fe, cuore_nat -> 'camera'       (cuore_nat riusa la stessa
                              location di a5_pozzo: la finestra del Pozzo) */

const EXTRA_ITEMS = {
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
    desc: 'Una carta sola, angoli morbidi di mani che l\'hanno tenuta per settant\'anni. Chi la porta in tasca sente, una volta nella notte, che il momento è quello giusto. (Effetto meccanico da cablare: +1 a una prova, una sola volta, poi si consuma.)',
    usable: false,
  },
  nastro_1974: {
    name: 'Nastro del \'74',
    desc: 'Una cassetta senza custodia, scritta a pennarello: "ULTIMA REGISTRAZIONE — L. + comune". Un\'accordatura strana, quasi stonata apposta. Chi la sente, si calma. Anche le cose che non dovrebbero calmarsi. (Effetto meccanico da cablare: musica calmante, forse in combattimento.)',
    usable: false,
  },
  candela_motore: {
    name: 'Candela del motore (gruppo 2024)',
    desc: 'Una candela d\'accensione, ancora tiepida, con una targhetta d\'ottone: "Gruppo 2024". Gaetano la riconosce: è la SUA. (Effetto meccanico da cablare: combinabile, forse con la macchina o in uno scontro.)',
    usable: false,
  },
};

const EXTRA_SCENES = {

  /* ==================== BLOCCO 1 — L'OSSARIO ====================
     Sotto la cantina, dietro la cella frigorifera del Banchetto: la
     sotto-cantina del 1899. Non ostile. Il Contabile è stanchissimo,
     non famelico. Aggancio suggerito: k5_dopo_chef (vedi report). */

  os1: {
    location: 'cantina',
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
    location: 'cantina',
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
    location: 'cantina',
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
    location: 'cantina',
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
    location: 'cantina',
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
    location: 'cantina',
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
    choices: [{ text: 'Su, verso il corridoio delle tre porte', next: 'h1' }],
  },

  /* ==================== BLOCCO 2 — LA SOFFITTA ====================
     Sopra il piano proibito: il telescopio puntato sulla piscina, le
     casse di Gregorio e Ada, il nido dei ritratti vuoti. 1 scontro
     evitabile con 'ritratto'. Aggancio suggerito: una quarta scelta
     in u1 (vedi report). */

  sf1: {
    location: 'camera',
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
    location: 'camera',
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
    location: 'camera',
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
    location: 'camera',
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
    location: 'camera',
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
    location: 'camera',
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
    location: 'cantina',
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
    location: 'cantina',
    caption: 'Il recupero',
    text: `Gaetano si avvicina alla bacheca del 2024 con la determinazione di un ingegnere che rivuole ciò che è suo, e con la delicatezza di chi capisce, guardando bene, che ogni pezzo è appeso a un gancio sottile, collegato al successivo con un fil di ferro quasi invisibile — un domino perfetto, pronto a crollare tutto insieme al primo errore.

> Gaetano: "Se tiro il pezzo sbagliato nell'ordine sbagliato, cade TUTTO. Centinaia di componenti. Sulla pietra. Con un rumore che sveglierebbe pure lo Chef due piani più giù."

*(Prova di Destrezza — CD 13: staccare la candela senza far cadere il resto della bacheca.)*`,
    choices: [
      { text: '🔧 Sfilarla con calma millimetrica', tag: 'Prova di Destrezza — CD 13', check: { stat: 'DES', dc: 13, success: 'gr3', fail: 'gr3_ko' } },
    ],
  },

  gr3: {
    location: 'cantina',
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
    location: 'cantina',
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

};

/* Raggruppamento per luogo (per il canvas della mappa, se e quando le
   scene verranno fuse in WORLD_MAP dentro js/campaign.js). */
const EXTRA_MAP = {
  ossario:  ['os1', 'os2', 'os3', 'os4', 'os5', 'os6'],
  soffitta: ['sf1', 'sf2', 'sf3', 'sf4', 'sf5', 'sf6'],
  stanza1949: ['s49_1', 's49_2', 's49_3', 's49_3_ko'],
  stanza1974: ['s74_1', 's74_2', 's74_3'],
  cuore:    ['cuore_gc', 'cuore_fe', 'cuore_fe_esito', 'cuore_nat', 'cuore_nat_esito'],
  garage:   ['gr1', 'gr2', 'gr3', 'gr3_ko'],
};
