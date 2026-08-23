/* ============ LUOGHI — la lettura della scena ============
   Un pulsante sul quadro, e una scheda che spiega cosa si sta guardando.

   PERCHÉ ESISTE. Richiesta del committente, 23 agosto 2026: «ogni scena grafica,
   un tastino che puoi cliccare, un piccolo pop-up che ti spiega la scena, cosa
   vivi, elementi che potrebbero essere interessanti sia per la storia che per altre
   dinamiche nel gioco».

   COS'È E COSA NON È. È una didascalia da museo: dice cosa c'è nel quadro, perché
   quel posto esiste, e cosa ci si può fare. **Non anticipa niente.** Parla solo di
   quello che è già sullo schermo o già detto dal Narratore: se un dettaglio è una
   minaccia, la scheda lo nomina come lo nominerebbe un ospite («la corda è tesa»),
   non come lo sa l'autore. La sorpresa è del gioco.

   IL RIUSO. `apri()` e `aggiorna()` sono identici in tutti i giochi della serie
   (copia di riferimento in ../dnd-motore/tools/luoghi-rendering.js): si riscrive
   solo la tabella LUOGHI. Le chiavi sono quelle di `Scenes.painters`. */

const Luoghi = (() => {

  const LUOGHI = {
    tornanti: {
      titolo: 'La salita: dall’autogrill di Baiano ai milleduecento metri',
      ora: 'Venerdì pomeriggio, dalle 17:50 — l’ultimo caffè normale',
      guarda: [
        ['La strada', 'Tornanti stretti che salgono nel bosco. Il guard-rail c’è a tratti, e dove non c’è la valle comincia subito.'],
        ['Il distributore', 'Una pompa sola, l’insegna spenta, e un uomo che conosce la strada meglio di quanto vorrebbe.'],
        ['Il bosco', 'Castagni fitti, e più su i faggi. Sopra i mille metri la nebbia della valle si ferma da sola.'],
        ['La macchina piena', 'Sessanta euro di frutta e verdura, novanta dal macellaio, la mozzarella paisana e tre buste che pesano come un cadavere.'],
      ],
      storia: 'L’Irpinia è la montagna della Campania: mille metri di media, boschi di castagno, paesi che d’inverno restano in cinquanta. Da Baiano a Paternopoli sono quaranta minuti di tornanti, e l’ultima parte della strada non ha illuminazione perché non ha più abitanti da illuminare. Il terremoto del 1980 ha svuotato queste valli più di quanto le abbia distrutte.',
      gioco: 'È la strada, e la strada in questo gioco funziona in un modo solo: si sale. Il benzinaio dice una cosa che vale la pena di ricordare, e il Quaderno la registra: tornerà utile quando servirà sapere chi in questa storia è dalla vostra parte.',
    },

    relais: {
      titolo: 'Il Relais Belvedere — il viale d’ingresso',
      ora: 'Venerdì, ultima luce',
      guarda: [
        ['Il viale di ghiaia', 'Bianca, rastrellata a onde regolari come un giardino zen. La macchina la rovina per quaranta metri, e a tutti dispiace.'],
        ['Le siepi di bosso', 'Potate a forme che al primo sguardo sembrano animali. Al secondo sguardo preferite non riguardare.'],
        ['La pensilina liberty', 'Ferro e vetro colorato, del tipo che si faceva a fine Ottocento nelle ville di villeggiatura.'],
        ['L’uomo sotto la pensilina', 'Non arriva e non esce ad accogliervi. **C’è.** Come se fosse lì da un tempo indefinito.'],
      ],
      storia: 'Il Belvedere è una villa liberty del 1899 trasformata in relais: le ville di quell’epoca, in Irpinia, le costruivano i proprietari terrieri per l’estate, e quasi tutte hanno un pozzo prima della casa — perché prima veniva l’acqua e poi le stanze. La ghiaia rastrellata a onde non è un vezzo giapponese: serve a sentire i passi.',
      gioco: 'Da qui si entra e da qui, in teoria, si esce: la strada di ritorno è una delle cose che il gioco tiene d’occhio. Ogni personale del Belvedere che incontrate ha un ruolo preciso e un orario preciso, e gli orari si possono imparare.',
    },

    hall: {
      titolo: 'La hall del Belvedere',
      ora: 'L’arrivo, e tutte le volte che si passa',
      guarda: [
        ['Il pavimento a scacchi', 'Bianchi e neri, lucido da specchiarsi. Nei posti come questo lo specchiarsi non è un modo di dire.'],
        ['Il lampadario di cristallo', 'Tintinna piano **senza corrente d’aria**.'],
        ['I ritratti a olio', 'Gruppi di persone in vacanza, epoche diverse: costumi anni Venti, basette anni Settanta, occhiali da sole anni Novanta. Sono tutti gruppi da cinque.'],
        ['Il registro', 'Aperto sul banco. Le firme sono tante, e le date hanno una regolarità che non si nota se non la si cerca.'],
      ],
      storia: 'Il Belvedere è splendido nel modo in cui è splendida una fotografia ritoccata troppo bene: tutto è al suo posto, e proprio per questo qualcosa manca. I ritratti di gruppo appesi in una hall sono una tradizione vera degli alberghi di villeggiatura — si fotografavano gli ospiti dell’estate. Qui però sono dipinti, non fotografati, e dipingere un gruppo richiede che il gruppo resti fermo a lungo.',
      gioco: 'Il registro è una fonte di indizi e si può leggere con calma o di fretta: sono due scene diverse con due esiti diversi. La hall è anche il posto in cui si torna quando serve rimettere in fila quello che si è capito.',
    },

    corridoio: {
      titolo: 'Il corridoio delle camere, primo piano',
      ora: 'La sera, e le ore piccole',
      guarda: [
        ['I tappeti rossi', 'Bevono il rumore dei passi. Non si sente venire nessuno, e nessuno vi sente venire.'],
        ['Le lampade a muro', 'Si accendono **una alla volta, mentre passate**. Mai prima, mai dopo.'],
        ['Le targhette delle camere', 'Glicine, Melograni, Pozzo. Nomi di piante, e uno che non è una pianta.'],
        ['L’ultima porta, in fondo', 'Quella davanti a cui il maggiordomo si ferma un istante di troppo prima di dire il nome.'],
      ],
      storia: 'Nelle ville di villeggiatura le camere prendevano il nome dalla vista: la Camera del Glicine guardava il glicine. Il che vuol dire che la Camera del Pozzo guarda il pozzo, e che qualcuno, quando ha dato i nomi, ha considerato il pozzo un panorama.',
      gioco: 'Il corridoio è lo snodo: da qui si va in camera, si scende, o si prova la porta che non è la vostra. Quasi tutte le scene notturne del gioco cominciano da questo tappeto.',
    },

    camera: {
      titolo: 'La Camera del Pozzo',
      ora: 'Dal pomeriggio alla notte fonda',
      guarda: [
        ['La finestra', 'Guarda il giardino sul retro: uno scacchiere di siepi e ghiaia azzurrina sotto l’ultima luce.'],
        ['Il pozzo, in mezzo', 'Pietra scura, tetto a cuspide, un secchio legato a una corda che scende nel buio. Carino. Rustico. Da foto.'],
        ['La corda', 'È **tesa**. Una corda con un secchio vuoto in fondo non è tesa.'],
        ['La stanza', 'Letti alti, comò, il catino di porcellana per il decoro. Tutto vero, tutto d’epoca, tutto tirato a lucido.'],
      ],
      storia: 'I pozzi delle ville irpine scendono venti o trenta metri fino alla falda, e il secchio, quando è vuoto, galleggia sul nulla: la corda fa la pancia. Perché sia tesa serve peso in fondo, e serve che il peso stia dove è stato messo.',
      gioco: 'La camera è il posto in cui si riposa, e riposare in questo gioco serve: cura, e fa passare il tempo. Ma la finestra si può anche solo guardare, e guardare la stessa cosa in due momenti diversi è una delle meccaniche di questo gioco.',
    },

    piscina: {
      titolo: 'La piscina del Belvedere',
      ora: 'Le 22:10 — la scena da cartolina',
      guarda: [
        ['L’acqua', 'Un rettangolo di luce turchese ritagliato nel buio della montagna, col vapore che sale in volute pigre. Trentadue gradi di perdono per ogni tornante.'],
        ['Il silenzio', 'Assoluto: niente grilli, niente cani, niente paese. Solo l’acqua che sciaborda piano contro il bordo, **da sola**.'],
        ['Il bordo di travertino', 'Bianco, ancora tiepido di sole. Gli accappatoi piegati sopra.'],
        ['Gli accappatoi', 'Ne contate cinque, e vi conta cinque. Poi ne contate sei.'],
      ],
      storia: 'A milleduecento metri, ad agosto, la notte va a dieci gradi: una piscina riscaldata fa vapore come una pentola, e il vapore sopra l’acqua ferma sta immobile perché non c’è vento. Il silenzio, invece, non è normale: a quella quota i grilli ci sono, e i cani dei pastori pure.',
      gioco: 'La piscina è la porta. Tutto quello che accade dopo passa da questa superficie, e la superficie ha due lati. Quello che portate addosso quando la attraversate è quello che avrete di là.',
    },

    cantina: {
      titolo: 'La cantina — «dove dormono quelli di prima»',
      ora: 'Notte',
      guarda: [
        ['La scala di pietra', 'Scende più di quanto una villa dovrebbe permettersi. Dieci gradini. Venti. Trenta.'],
        ['L’aria', 'Fredda e dolciastra: cantina, terra, e sotto la terra qualcos’altro.'],
        ['Le rastrelliere', 'Migliaia di bottiglie coricate, **tutte senza polvere**. Qualcuno le spolvera. Ogni giorno.'],
        ['Le etichette', 'Scritte a mano. Non riportano un vitigno: riportano un nome e un anno.'],
      ],
      storia: 'In una cantina vera la polvere è il segno che il vino sta riposando: si spolvera solo quello che si guarda. Le etichette scritte a mano erano l’uso delle ville prima delle cantine sociali — ogni bottiglia era di qualcuno, e il nome sull’etichetta era il nome di chi l’aveva fatta.',
      gioco: 'Qui si trovano gli oggetti che risolvono le cose, e si trova l’anno che conta. La cantina è anche uno dei posti da cui il gioco riparte se cadete tutti: se ci arrivate, ci arrivate con quello che avevate allora.',
    },

    giardino: {
      titolo: 'Il giardino di notte — il regno del Giardiniere',
      ora: 'Dopo mezzanotte',
      guarda: [
        ['La nebbia', 'Salita dalla valle e fermata **al confine esatto della proprietà**. Ci gira intorno come il mare attorno a un’isola.'],
        ['Dentro il confine', 'Tutto nitido, azzurrino, in ordine. Troppo in ordine.'],
        ['La ghiaia', 'Rastrellata a onde. Se la attraversate, si sente.'],
        ['Le siepi', 'Potate a forme che continuano a non voler essere guardate due volte.'],
      ],
      storia: 'La nebbia di valle sale la sera e si ferma a una quota precisa: è l’inversione termica, e in Irpinia la si vede tutte le notti d’estate. Che si fermi al confine di una proprietà, invece, non è meteorologia.',
      gioco: 'Il giardino si attraversa, e attraversarlo fa rumore: qui la scelta fra la strada lunga e quella breve è una scelta vera. Il Giardiniere ha un mestiere e lo fa bene, e la ghiaia è il suo strumento di lavoro.',
    },

    pozzo: {
      titolo: 'Il pozzo vecchio',
      ora: 'Le tre di notte',
      guarda: [
        ['Il bordo', 'Pietra scura, larga un palmo. Ci si può sedere, e qualcuno ci si siede.'],
        ['Il secchio', 'Legato alla corda. Scende, e si può calare di un metro alla volta.'],
        ['Il buio dentro', 'La torcia del telefono arriva fino a un certo punto e poi smette di servire.'],
        ['Il tetto a cuspide', 'Quattro spioventi di tegole su quattro colonnine. È la parte del pozzo fatta per essere guardata.'],
      ],
      storia: 'Il pozzo è più vecchio della villa: nelle proprietà irpine si scavava prima l’acqua e poi si costruiva intorno. Un pozzo di fine Settecento, in queste valli, è un pozzo che ha visto passare tutte le famiglie che ci sono state.',
      gioco: 'È il punto più basso raggiungibile della proprietà, e le cose che contano in questo gioco stanno in basso. Il secchio è un oggetto che si usa: cala roba, e riporta su roba.',
    },

    paese: {
      titolo: 'Paternopoli, 41 abitanti',
      ora: 'Notte',
      guarda: [
        ['Le case', 'Quarantuno, di pietra grigia, strette attorno alla piazza. Ogni persiana chiusa, ogni comignolo freddo.'],
        ['Il campanile', 'Mozzato. In Irpinia i campanili mozzati hanno tutti la stessa data.'],
        ['Il bar', 'Insegna arrugginita: DA PEPPE — dal 1961. I tavolini sono ancora fuori, impilati e incatenati con la cura di chi pensava di riaprire lunedì.'],
        ['La canonica', 'Una finestra accesa. È l’unica del paese.'],
      ],
      storia: 'Paternopoli esiste per davvero, in provincia di Avellino, e come tutti i paesi dell’Alta Irpinia ha perso la sua gente in due ondate: l’emigrazione, e poi il **terremoto del 23 novembre 1980** — 6,9 di magnitudo, quasi tremila morti, e decine di paesi svuotati per sempre. I campanili mozzati sono di quella sera. I tavolini incatenati sono di chi pensava che sarebbe passata.',
      gioco: 'Il paese è dove si trovano le informazioni che il Belvedere non dà. Chi ci abita ancora è vivo e sta dalla vostra parte: don Michele sa cose, e le dice se gliele si chiede nel modo giusto.',
    },

    riflesso: {
      titolo: 'Dall’altra parte — il giardino capovolto',
      ora: 'Il tempo di qua non è quello di là',
      guarda: [
        ['La piscina', 'Stessa acqua, stesso bordo di travertino, stessi cinque corpi che riemergono. Non vi siete bagnati.'],
        ['La luna', 'Rossa. Di qua non lo era.'],
        ['Il giardino', 'Le stesse siepi, la stessa ghiaia. Rastrellata dall’altra parte.'],
        ['Il Belvedere', 'Illuminato a festa, e le finestre sono piene.'],
      ],
      storia: 'Attraversare la superficie non è nuotare: è un momento senza consistenza, come attraversare una fotografia. Nessuno si bagna, nessuno respira, e il secondo dura esattamente quanto serve a fare paura.',
      gioco: 'Di qua le regole cambiano: quello che di là era decorazione qui è funzionante, e viceversa. La cosa da tenere a mente è che la strada di ritorno esiste e non è dove l’avete lasciata.',
    },

    riflesso_interno: {
      titolo: 'Dentro il Belvedere, dall’altra parte',
      ora: 'La notte del venticinquennio',
      guarda: [
        ['Il corridoio di servizio', 'Basso, senza tappeti. Si tiene la testa giù: la casa **vede**, e stare dritti davanti a una finestra è come squillare un citofono.'],
        ['Sofia', 'Non è un fantasma. I fantasmi almeno hanno finito qualcosa.'],
        ['L’Inventario', 'Un elenco. Di gente.'],
        ['Le stanze', 'Ognuna ferma a un anno diverso, e ognuna con qualcuno dentro che quell’anno non ha finito.'],
      ],
      storia: 'Gli ostaggi sono stati presi la notte del venticinquennio e portati di qua. Non sono morti e non sono liberi: sono **in inventario**, che è una terza cosa e la peggiore delle tre.',
      gioco: 'Questa è la parte del gioco in cui si raccolgono nomi, e i nomi sono armi: pronunciare quello giusto al momento giusto cambia uno scontro. Chi vi aiuta qui lo fa a suo rischio, e il gioco tiene il conto di come lo trattate.',
    },

    ossario: {
      titolo: 'L’ossario, dietro il freezer del Banchetto',
      ora: 'Le ore piccole',
      guarda: [
        ['Il pannello dietro il freezer', 'Non dovrebbe muoversi. Si muove.'],
        ['La pietra', 'Più vecchia della villa: tagliata a mano, annerita da un fuoco che non è quello del forno a legna.'],
        ['Il corridoio in discesa', 'Basso. Chi è alto si china, e chi si china se ne lamenta.'],
        ['Le tacche del 1899', 'Originali. Qualcuno contava già allora, e contava la stessa cosa.'],
        ['I bagagli', 'Mai ritirati. Sono in ordine, per anno.'],
      ],
      storia: 'Una villa del 1899 costruita sopra qualcosa di più vecchio non è un’anomalia: in Irpinia si costruiva sulle fondazioni che c’erano, e quello che c’era prima spesso era religioso. Un ossario sotto una casa di villeggiatura vuol dire che la casa è stata messa lì apposta.',
      gioco: 'Qui sta il conto vero: quante volte è già successo. I bagagli sono etichettati, e le etichette si leggono. È anche la scena in cui il gioco vi dice, senza dirlo, quanto tempo avete.',
    },

    soffitta: {
      titolo: 'La soffitta, oltre la botola',
      ora: 'Dopo il piano proibito',
      guarda: [
        ['La botola', 'Nel soffitto in fondo al corridoio. Giurereste che entrando non c’era.'],
        ['La scaletta a pioli', 'Arrugginita. La polvere sui pioli è mossa: qualcuno ci è salito di recente, o qualcuno ci scende spesso.'],
        ['Il telescopio', 'Puntato. Non sul cielo: sulla piscina.'],
        ['Le casse', 'Di Gregorio e di Ada, con i nomi scritti sopra. Chiuse, e non a chiave.'],
      ],
      storia: 'Le soffitte delle ville liberty sono ambienti di servizio: ci si tenevano i bauli e ci dormiva la servitù d’estate. Un telescopio in soffitta guarda il cielo. Uno puntato in basso non è un telescopio: è un posto di osservazione.',
      gioco: 'La soffitta è la stanza delle risposte, e le risposte qui sono oggetti fisici: si aprono, si leggono, si portano via. Da qui si vede la piscina, che è la cosa che il gioco ha continuato a chiedervi di guardare.',
    },

    garage: {
      titolo: 'La rimessa — il motore in bacheca',
      ora: 'Oltre l’orto di Ada',
      guarda: [
        ['La porta di legno tarlato', 'Nel pomeriggio nessuno l’aveva notata.'],
        ['L’odore', 'Olio motore e cera per mobili. Due cose che non dovrebbero stare nella stessa frase.'],
        ['La vostra macchina', 'Non è parcheggiata. È **smontata**.'],
        ['Il motore', 'Appeso al muro come un trofeo di caccia, coi pezzi separati e disposti con la precisione di un museo.'],
        ['Le targhette', 'Ogni pezzo ha la sua. Scritte con la stessa mano delle etichette in cantina.'],
      ],
      storia: 'Smontare un motore e disporlo così non è vandalismo: è catalogazione. Chi lo ha fatto sapeva cosa faceva, ha preso il suo tempo, e ha voluto che si vedesse. Un pezzo mancante, in una collezione ordinata, è la cosa più visibile che ci sia.',
      gioco: 'Qui si recuperano pezzi, e i pezzi servono: la macchina è la strada di casa, e la strada di casa è un finale. Quello che vi manca alla fine è quello che non siete venuti a prendere.',
    },
    tornantiPiedi: {
      titolo: 'I ventisei tornanti, a piedi',
      ora: 'Le 3:40 di notte',
      guarda: [
        ['La strada', 'Ventisei tornanti. Natalino li ha contati salendo, e ha ragione: sono ventisei.'],
        ['Il cancello', 'Di notte non è chiuso. È l’unica cosa di questa proprietà che non fa resistenza.'],
        ['I filari', 'Vigneti a spalliera sui terrazzamenti, e in mezzo la paglia che copre i piedi delle viti.'],
        ['Il buio', 'Sopra i mille metri non c’è illuminazione perché non ci sono più abitanti da illuminare.'],
      ],
      storia: 'Due ore a piedi, in discesa, sono una stima onesta: ventisei tornanti di montagna fanno otto o nove chilometri di asfalto per due di distanza in linea d’aria. La paglia nei filari si mette a fine estate per tenere l’umidità nel terreno, e la potatura verde si fa di giorno — di notte non la fa nessuno.',
      gioco: 'È la via di fuga più ovvia, e il gioco la lascia aperta per davvero: si può provare. Quello che si incontra scendendo dipende da quanto la casa ha già capito di voi, e il Quaderno tiene il conto.',
    },

    salaDaPranzo: {
      titolo: 'La sala da pranzo — la cena delle nove',
      ora: 'Le 21:00',
      guarda: [
        ['Il tavolo', 'Lungo, apparecchiato d’argento. I coperti sono contati, e sono contati bene.'],
        ['I candelabri', 'Accesi. In una casa con la corrente elettrica, le candele sono una scelta.'],
        ['Le portefinestre', 'Danno sulla piscina illuminata di turchese, fumante nell’aria fresca della montagna.'],
        ['Le portate', 'Pasta fatta in casa, un arrosto, il dolce. Tre portate in un silenzio religioso.'],
        ['Il vino', 'Servito, versato, guardato. Non sa di niente.'],
      ],
      storia: 'Un menù raccontato portata per portata è una tradizione dei ristoranti di una certa età: il piatto viene presentato con la sua storia, e la storia serve a farti mangiare più lentamente. Il vino che non sa di niente, invece, non è una tradizione: un vino può essere cattivo, ossidato, tappato — ma un vino che non ha nessun sapore non esiste in natura.',
      gioco: 'La cena è la scena in cui si ascolta: il menù, il brindisi e quello che Gregorio dice fra le portate sono tre fonti diverse di indizi. Mangiare cura; bere no.',
    },

    pianoProibito: {
      titolo: 'Il piano proibito — il corridoio dei venticinquenni',
      ora: 'Notte',
      guarda: [
        ['La scala di servizio', 'Sale stretta, e a ogni gradino l’aria diventa più **ferma**. Non fredda: ferma, come dentro una fotografia.'],
        ['Il corridoio', 'Identico al vostro, ma sbagliato nei dettagli: la carta da parati cambia disegno dove non dovrebbe.'],
        ['Le targhette', 'Sulle porte, come al primo piano. La sesta è vuota.'],
        ['L’intercapedine', 'Fra due muri che al piano di sotto sono uno.'],
      ],
      storia: 'Il secondo piano non compare nelle fotografie del sito, e adesso si sa perché. Nelle ville liberty il piano alto era per la servitù e per i bauli: soffitti bassi, corridoio unico, e nessuna ragione di fotografarlo. Nessuna ragione, però, di rifarlo identico a quello degli ospiti.',
      gioco: 'Qui si trovano nomi e date, che in questo gioco sono le armi vere. Il piano è anche il punto da cui si arriva alla soffitta: la scaletta c’è, e la polvere sui pioli è mossa.',
    },

    salaBanchetto: {
      titolo: 'La sala del Banchetto',
      ora: 'La fine',
      guarda: [
        ['Il tavolo', 'Apparecchiato per tutti, coi posti già assegnati. C’è anche una sedia storta, accanto: quella dell’ospite maleducato.'],
        ['Il registro', 'Aperto, con la penna del 1899 accanto. È la stessa penna di tutte le firme.'],
        ['La bambola', 'Sta al suo posto da centoventicinque anni. Qualcuno, prima di andarsene, la accarezza.'],
        ['Il freezer', 'In cucina, dietro. Il pannello sul retro non dovrebbe muoversi.'],
        ['Gregorio', 'In piedi, come sempre. È l’unica persona di questa casa che non si è mai seduta.'],
      ],
      storia: 'Il banchetto è la forma che questa casa ha scelto per la cosa che fa: un pasto in cui gli ospiti sono anche il menù, e in cui tutto — le portate, i posti, il registro, la firma — è cerimonia. Le cerimonie hanno una regola: si possono interrompere solo dall’interno.',
      gioco: 'È la sala dello scontro finale, e non si vince con le statistiche: si vince con quello che si è raccolto e con chi si è portato. Un Gratta e Vinci, per esempio, è un oggetto vero dell’inventario.',
    },

    albaRelais: {
      titolo: 'L’alba sul Belvedere',
      ora: 'Dopo',
      guarda: [
        ['La penna', 'La stilografica di centoventicinque anni. Il suono che fa quando si rompe è piccolo.'],
        ['La casa', 'Perde la spinta tutta insieme: le luci, il lampadario che tintinnava, la ghiaia rastrellata.'],
        ['La valle', 'La nebbia si muove di nuovo, e attraversa il confine della proprietà come se non ci fosse.'],
        ['Paternopoli', 'Si sveglia. Qualche persiana si apre, e sono le prime di venticinque anni.'],
      ],
      storia: '«Il dispetto era amore.» È la frase che tiene insieme tutta la storia, e Gregorio la dice piano perché è una cosa che ha capito tardi. Il banchetto finisce come finiscono i banchetti: si sparecchia.',
      gioco: 'È l’epilogo, e il gioco fa i conti: chi è tornato, chi è rimasto, cosa avete firmato e cosa no. Il Relais, alla fine, riapre — e come riapre dipende da voi.',
    },
  };

  /* ---------- il rendering: identico in tutti i giochi della serie ---------- */

  const $ = id => document.getElementById(id);
  let corrente = null;

  function apri(key, titoloHUD) {
    const L = LUOGHI[key];
    if (!L) return;
    const box = $('modal-generic-content');
    if (!box) return;
    box.innerHTML = `<h2>🔎 ${L.titolo}</h2>`
      + `<p style="color:var(--text-dim);margin:-6px 0 14px">${L.ora}</p>`
      + (titoloHUD && titoloHUD !== L.titolo
          ? `<p style="color:var(--text-dim);font-size:.92em;margin:-10px 0 14px">Nel gioco, adesso: <b>${titoloHUD}</b></p>` : '')
      + `<h3>👁 Cosa vedete nel quadro</h3><ul style="margin:0 0 14px;padding-left:18px">`
      + L.guarda.map(([n, t]) => `<li style="margin-bottom:7px"><b>${n}.</b> ${t}</li>`).join('')
      + `</ul><h3>📜 Perché questo posto esiste</h3><p style="margin:0 0 14px">${L.storia}</p>`
      + `<h3>🎲 Cosa c'entra col gioco</h3><p style="margin:0 0 4px">${L.gioco}</p>`
      + `<p style="color:var(--text-dim);font-size:.86em;margin:14px 0 0">Questa scheda racconta solo quello che`
      + ` avete già davanti agli occhi: non anticipa niente di quello che deve ancora succedere.</p>`;
    const chiudi = document.createElement('button');
    chiudi.className = 'btn';
    chiudi.style.marginTop = '14px';
    chiudi.textContent = '↩ Torna alla scena';
    chiudi.onclick = () => $('modal-generic').classList.add('hidden');
    box.appendChild(chiudi);
    $('modal-generic').classList.remove('hidden');
  }

  /* Chiamata dal motore dopo ogni Scenes.paint(): accende il pulsante se questo
     luogo ha una scheda, lo spegne se non ce l'ha. Un luogo senza scheda non
     mostra un pulsante che apre il vuoto. */
  function aggiorna(key, titoloHUD) {
    corrente = key;
    const b = $('btn-scena');
    if (!b) return;
    const haScheda = !!LUOGHI[key];
    b.classList.toggle('hidden', !haScheda);
    if (!haScheda) return;
    b.onclick = () => apri(key, titoloHUD);
    b.title = 'Cosa sto guardando?';
  }

  return { LUOGHI, apri, aggiorna, corrente: () => corrente };
})();
