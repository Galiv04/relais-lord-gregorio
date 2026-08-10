/* ============ EPILOGHI PERSONALI E IMPRESE (achievement) ============ */

/* Epiloghi per persona, per tipo di finale:
   'alba'    = patto rotto, tutti liberi (e_alba, e anche e_ospiti mostra i suoi)
   'custode' = uno di voi è rimasto al Belvedere (e_custode)                    */

const HERO_EPILOGUES = {

  gaetano: {
    alba: `Gaetano ha passato i primi tre giorni a casa a scrivere una relazione tecnica di quarantadue pagine intitolata "Anomalie ottiche e termodinamiche osservate presso struttura ricettiva irpina", che non ha mai inviato a nessuno. L'ha stampata, rilegata e messa nella libreria, tra le tesi di laurea. Ogni tanto la apre, la sfoglia, la richiude. Ha aggiunto una sola nota a mano in copertina: "Verificato empiricamente. Non ripetere l'esperimento." Ai colleghi che gli chiedono della vacanza risponde: "Bella. Strutturalmente interessante." E quando un satellite passa sopra l'Irpinia, se può, gli fa fare una foto in più.`,
    custode: `Gaetano ha rifatto i calcoli cento volte: le probabilità, i rischi, le alternative. Il risultato è sempre lo stesso, e non lo consola mai. È lui che organizza il viaggio di agosto, ogni anno, con precisione militare: partenza alle 15:00, arrivo entro il tramonto, "perché i tornanti di notte no". È lui che porta i pezzi di ricambio per tutto ciò che al Belvedere può rompersi, e li monta in silenzio, e il custode lo guarda lavorare dalla soglia con un sorriso che non invecchia. Nessuno dei due dice niente. Gli ingegneri e i custodi si capiscono così: a manutenzione.`,
  },

  natalino: {
    alba: `Natalino è tornato al salone il martedì, e alla prima cliente che gli ha chiesto "novità?" ha risposto con la storia COMPLETA, senza omettere niente: le bambole, lo Chef, il pozzo che parla. La cliente ha riso per quaranta minuti e ha lasciato il triplo di mancia. Da allora è il suo numero: la racconta a puntate, un tornante a settimana, e c'è gente che prenota la piega SOLO per sentire il seguito. Le forbici professionali giapponesi sono tornate nella custodia, in vetrina, con una targhetta nuova: "In pensione. Con onore." E se gli chiedete se è tutto vero, alza le mani: "Amore mio, IO faccio i capelli. La storia si è fatta da sola."`,
    custode: `Natalino sale al Belvedere anche fuori stagione, "perché i capelli non conoscono calendario". Ha piazzato una poltrona da barbiere professionale nella dependance — l'ha portata su a pezzi, in tre viaggi, bestemmiando a ogni tornante — e una volta al mese fa il taglio a tutti: al custode, a Gregorio, e una spuntatina simbolica ai salici, "che si erano lasciati andare". È l'unico che nel salone del Belvedere parla ad alta voce, ride forte, mette la musica. La casa lo lascia fare. La casa, sospettano tutti, lo ASPETTA.`,
  },

  claudia: {
    alba: `Claudia ha ottantasette foto di quella notte e non ne ha pubblicata nemmeno una. Le tiene in un album privato che si chiama "NO", e lo apre solo quando qualcuno al lavoro dice che "l'engagement è tutto". La foto del riflesso sbagliato — quella con la luna rossa nell'acqua e la luna sottile nel cielo — l'ha stampata e messa in un cassetto, a faccia in giù. Ha ripreso a lavorare coi social del colosso degli occhiali, ma ha sviluppato una specialità nuova che in azienda nessuno le ha insegnato: capire al primo sguardo quando un'immagine MENTE. La pagano il doppio, adesso. Non sanno il perché. Lei sì.`,
    custode: `Claudia cura — da lontano, e senza farsi pagare — la comunicazione del Belvedere: due post a settimana, tono caldo, luce dorata. È brava al punto che il relais è pieno tutto l'anno, e nessun ospite ha mai notato niente. Solo lei sa che in ogni foto che pubblica c'è, da qualche parte, un dettaglio che non torna: un'ombra in più, un riflesso storto, una finestra accesa che non dovrebbe. Li lascia apposta. È il suo modo di dire la verità senza dirla: chi deve capire, capirà. Il custode, ogni volta, mette like per primo.`,
  },

  federico: {
    alba: `Federico ha aspettato tre mesi — "il tempo tecnico del lutto professionale" — e poi ha fatto la cosa che tutti temevano: è tornato su a proporre a Gregorio un piano di rilancio. Stavolta con un contratto VERO, letto riga per riga da tutti e cinque, con Gaetano che controllava le clausole e Natalino che controllava Gaetano. Il "Relais Belvedere — da Gregorio e Ada" è oggi il suo cliente migliore e l'unico di cui non parla mai nei casi studio. Quando gli chiedono perché, risponde con l'unica frase umile del suo repertorio: "Certi successi si festeggiano in silenzio." Poi però il fatturato lo mostra lo stesso.`,
    custode: `Federico non si è mai perdonato la prenotazione — "cinque stelle, ragazzi, un AFFARE" — e ha risolto come risolve tutto: lavorando il doppio. È lui che gestisce ogni dettaglio dei ritorni di agosto, lui che tiene i rapporti col paese, lui che ha convinto il comune di Pietrafonda a rifare la strada dei tornanti "per motivi turistici". Ogni anno, all'arrivo, consegna al custode un report rilegato: presenze, recensioni, progetti. Il custode lo sfoglia con finta attenzione e poi lo abbraccia, e Federico ogni volta dice "dai, che è un lavoro come un altro", e ogni volta non gli esce bene.`,
  },

  emanuela: {
    alba: `Emanuela ha rimesso il kit nella borsa, la borsa nell'armadio, e per due settimane non ha voluto sentir parlare di montagna. Poi, piano piano, le cose sono tornate al loro posto: il salone, le clienti, i pettegolezzi con Natalino tra un taglio e l'altro — che adesso hanno un capitolo segreto che le clienti non sentiranno mai. Nella borsa, però, c'è una cosa nuova: un mazzetto di erbe argentate, seccate, legate con lo spago. "Contro il freddo", dice se qualcuno chiede. Non specifica QUALE freddo. E quando una cliente arriva con le mani gelate e lo sguardo di chi ha visto qualcosa che non racconta, Emanuela le prepara una tisana senza chiedere niente. Certe ricette si tramandano così.`,
    custode: `Emanuela ha preso in mano la cosa come prende in mano tutto: praticamente. Ha piantato l'orto nuovo con le sue mani, ampliando quello di Ada — "le erbe vanno rinnovate, non discutere" — e ha lasciato al Belvedere un kit di pronto soccorso in ogni stanza, controllati e riforniti a ogni visita. Il custode dice che non servono. Lei li rifornisce lo stesso. L'ultima domenica di agosto, prima di ripartire, prepara sempre una teglia di parmigiana "per il viaggio" e la lascia in cucina, sapendo benissimo che il custode non mangia. La teglia, ogni anno, torna vuota e lavata. Nessuno dei due ha mai commentato.`,
  },

};

/* ---------- IMPRESE — achievement di fine partita ---------- */
/* Ogni voce: { flag, icon, title, desc } — sbloccata se G.flags[flag] è veritiero. */

const IMPRESE = [
  { flag: 'visto_giardiniere',   icon: '🌳', title: 'Le Siepi Ricambiano',        desc: 'Avete notato il lavoro del Giardiniere già dal viale d\'ingresso.' },
  { flag: 'visto_registro',      icon: '📖', title: 'Lettori del Venticinquennio', desc: 'Avete sfogliato il registro all\'indietro PRIMA di firmare. 1999, 1974, 1949...' },
  { flag: 'firma_rinviata',      icon: '🖋', title: 'Domattina, Con Calma',        desc: 'Avete rimandato la firma. Il Belvedere non se l\'aspettava.' },
  { flag: 'visto_pozzo',         icon: '🪣', title: 'La Corda Tesa',               desc: 'Natalino ha aperto le tende della Camera del Pozzo. Ovviamente.' },
  { flag: 'battuta_1899',        icon: '🍷', title: '"Astemio dal 1899"',          desc: 'Avete costretto Gregorio al brindisi. Era CHIARAMENTE una battuta.' },
  { flag: 'sesto_ospite',        icon: '🥽', title: 'Il Sesto Accappatoio',        desc: 'Avete ispezionato l\'accappatoio senza iniziale. E gli occhiali del \'99.' },
  { flag: 'vista_finestra',      icon: '🔬', title: 'Metodo Scientifico',          desc: 'Gaetano ha sacrificato un\'infradito alla scienza. Era nuova.' },
  { flag: 'tentata_fuga',        icon: '🚗', title: 'In Accappatoio nel Bosco',    desc: 'Avete provato a scappare in piena notte. Il cancello aveva altri piani.' },
  { flag: 'storia_ada',          icon: '🕯', title: 'L\'Ultima Domanda',           desc: 'Avete trattenuto Gregorio: ogni verità gli è costata una ciocca bianca.' },
  { flag: 'voce_sofia',          icon: '🍾', title: 'Il Sussurro di Sofia',        desc: 'Avete ascoltato una bottiglia del 1999. Non lo dimenticherete.' },
  { flag: 'chef_amico',          icon: '👨‍🍳', title: 'Il Ricordo d\'Affetto',       desc: 'Avete commosso lo Chef con una ciocca tagliata ad arte. Nessun sangue.' },
  { flag: 'nodo_cantina',        icon: '🧂', title: 'Il Sale Fedele',              desc: 'Nodo della cantina sciolto: sale del 1899 e bottiglia del Padrone.' },
  { flag: 'medaglione',          icon: '💍', title: 'Il Valzer delle Bambole',     desc: 'Avete recuperato il medaglione di Ada dalla stanza del 1924.' },
  { flag: 'nodo_piano',          icon: '🚪', title: 'I Ricordi della Casa',        desc: 'Nodo del piano proibito sciolto: il diario di Ada è vostro.' },
  { flag: 'avvertimento_specchio', icon: '🪞', title: 'Lo Specchio Velato',        desc: 'Avete guardato il Banchetto apparecchiato per voi. E avete scelto di no.' },
  { flag: 'nodo_pozzo',          icon: '💧', title: 'L\'Acqua che Ricorda',        desc: 'Nodo del pozzo sciolto: Ada vi ha dato la sua acqua.' },
  { flag: 'ada_alleata',         icon: '👗', title: 'Il Nome Restituito',          desc: 'Avete ridato ad Ada il suo nome. Il pozzo non conta più le notti.' },
  { flag: 'pagine_diario',       icon: '📜', title: 'Chi Scende nel Pozzo',        desc: 'Qualcuno si è calato DAVVERO. Le tre pagine strappate sono vostre.' },
  { flag: 'gregorio_umano',      icon: '🥂', title: 'Il Brindisi del Ritorno',     desc: 'Gregorio ha bevuto il vino del 1899. Dopo centoventicinque anni.' },
  { flag: 'casa_vacilla',        icon: '📊', title: 'Il Pitch al Patto',           desc: 'Federico ha fatto una proposta commerciale a una casa affamata. E ha quasi chiuso.' },
  { flag: 'rituale_fatto',       icon: '🧂', title: 'Sale, Acqua e un Nome',       desc: 'Avete compiuto il rituale di Ada sulla firma. La casa lo ricorderà.' },
  { flag: 'fame_sconfitta',      icon: '🍽', title: 'Il Tovagliolo Piegato',       desc: 'Avete sconfitto la Fame. Il pasto è finito. Per sempre.' },
  { flag: 'finale_custode',      icon: '🗝', title: 'Il Nuovo Custode',            desc: 'Uno di voi è rimasto. Il finale di cui non parlerete mai più.' },
  { flag: 'finale_ospiti',       icon: '🖼', title: 'Il Ritratto Più Bello',       desc: 'Vi siete seduti al Banchetto. Il Belvedere ringrazia per la posa.' },
  { flag: 'pista_paese',         icon: '⛪', title: 'Il Sesto del Settantaquattro', desc: 'Siete scesi a Pietrafonda senza firma addosso, e siete TORNATI dentro.' },
  { flag: 'visto_bar_1999',      icon: '☕', title: 'Cinque Caffè, Offre Peppe',    desc: 'Avete letto il conto mai battuto del bar. E la consolazione di Ada.' },
  { flag: 'segreto_custodi',     icon: '📚', title: 'Più Vecchio di Gregorio',      desc: 'I registri parrocchiali: il patto cambia custode ogni 25 anni. Da SEMPRE.' },
  { flag: 'vespri_suonati',      icon: '🔔', title: 'I Vespri del Belvedere',       desc: 'Avete suonato la campanella di Don Michele davanti alla Fame. Ada ha risposto.' },
  { flag: 'finale_smemorati',    icon: '🫙', title: 'La Vacanza Qualunque',         desc: 'Avete pagato con la memoria della notte. Vittoria. Di chi, non lo ricordate.' },
];

/* ---------- CRONACHE DEL BELVEDERE ----------
   Righe di epilogo mondiale mostrate nel finale SOLO se il flag è attivo. */

const CRONACA = [
  { flag: 'chef_amico',       text: 'Lo Chef ha appeso la mannaia: ora impasta pane per il paese, ogni alba. Sul grembiule, ricamata da mani che conoscete, una ciocca di capelli.' },
  { flag: 'ada_alleata',      text: 'Il pozzo non conta più le notti: le tacche sulla pietra si stanno cancellando da sole, una per sera, come un debito che si estingue.' },
  { flag: 'voce_sofia',       text: 'La bottiglia "Sofia, 1999" è stata stappata in giardino, al sole. Il profumo — dicono — era di crema solare e di risate. Poi, più niente. Libera.' },
  { flag: 'ernesto_libero',   text: 'A una sorella molto anziana, in una casa di riposo di Avellino, è sembrato di sentire il fratello dire "grazie". Ha smesso di aspettare. Ha iniziato a ricordare.' },
  { flag: 'gregorio_umano',   text: 'Gregorio invecchia di un anno all\'anno, come tutti, e lo trova MERAVIGLIOSO: festeggia due compleanni al mese "per recuperare l\'arretrato".' },
  { flag: 'storia_1974',      text: 'Don Michele è salito al Belvedere, dopo cinquant\'anni. Ha spolverato lui la cornice di Aldo. Nessuno ha sentito cosa si sono detti, ma i vespri, quella sera, sono durati il doppio.' },
  { flag: 'pista_paese',      text: 'Pietrafonda riapre le persiane. Il bar "Da Peppe" ha riacceso la macchina del caffè: il nuovo gestore batte per primo un conto rimasto aperto dal 1999. Cinque caffè. Offerti.' },
  { flag: 'medaglione',       text: 'Il medaglione d\'argento è tornato al pozzo, dove le sei ciocche intrecciate riposano insieme. Ogni tanto, di notte, qualcuno canticchia. In sei.' },
  { flag: 'avvertimento_specchio', text: 'Lo specchio della camera del 1899 adesso riflette solo la stanza. Qualche ospite giura di vederci, ogni tanto, cinque figure che salutano. Sorridendo.' },
];
