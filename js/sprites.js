/* ============ SPRITES — pixel art procedurale ============
   Ogni sprite è una mappa di caratteri 16x16. Ogni carattere è un colore
   nella palette dello sprite. '.' = trasparente.                        */

const Sprites = (() => {

  function drawSprite(ctx, map, palette, x, y, scale, flip = false) {
    const h = map.length, w = map[0].length;
    // 'scale' è la dimensione della cella di una griglia 16: mappe a risoluzione
    // doppia (32x32) occupano lo STESSO ingombro con il doppio del dettaglio.
    const px = scale * 16 / h;
    for (let r = 0; r < h; r++) {
      for (let c = 0; c < w; c++) {
        const ch = map[r][flip ? w - 1 - c : c];
        if (ch === '.') continue;
        const col = palette[ch];
        if (!col) continue;
        ctx.fillStyle = col;
        // ceil per evitare cuciture tra celle non intere
        ctx.fillRect(x + c * px, y + r * px, Math.ceil(px), Math.ceil(px));
      }
    }
  }

  function renderToCanvas(canvas, spriteDef, bg = '#1a1114') {
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const scale = Math.min(canvas.width, canvas.height) / 16;
    const off = Math.floor((canvas.width - scale * 16) / 2);
    drawSprite(ctx, spriteDef.map, spriteDef.palette, off, off, scale);
  }

  /* ---------- I CINQUE AMICI ---------- */

// Gaetano — l'ingegnere satellitare: occhiali, polo blu col badge, multimetro (32x32)
  const gaetano = {
    palette: { s:'#e0b090', h:'#2a2018', e:'#2a2a35', o:'#4a4a55', p:'#2a4a7a', P:'#1d3558', d:'#3a3a45', w:'#fff', k:'#8a5a48', n:'#c89878', K:'#1a1a22', y:'#e8c840', G:'#7ae0a8', B:'#d85040' },
    map: [
      '................................',
      '................................',
      '..........hhhhhhhhhhhh..........',
      '.........hhhhhhhhhhhhhh.........',
      '.........hhhhhhhhhhhhhh.........',
      '.........hhhhhhhhhhhhhh.........',
      '.........hhshhhsshhhshh.........',
      '.........hhswwwsswwwshh.........',
      '.........hhswewsswewshh.........',
      '.........ssssssnnssssss.........',
      '..........sssskkkkssss..........',
      '..........ssssssssssss..........',
      '..............ssss..............',
      '..............ssss..............',
      '.........ppppPPPPPPpppp.........',
      '.......pppppBBppppppppppp.......',
      '.......ppppPBBPPPPPPPpppp.......',
      '.......ppppPPPPPPPPPPpppp.......',
      '.......ppppPPPPPPPPPPpppyyyyyy..',
      '.......ppppPPPPPPPPPPpppyGGGGy..',
      '.......ppppPPPPPPPPPPpppyGGGGy..',
      '.......ssppPPPPPPPPPPppssGGGGy..',
      '.......ssppppppppppppppssyyyyy..',
      '...........dddd..dddd...yyKyKy..',
      '...........dddd..dddd...yyyyyy..',
      '...........dddd..dddd...yyyyyy..',
      '...........dddd..dddd...........',
      '...........dddd..dddd...........',
      '...........dddd..dddd...........',
      '..........KKKKK..KKKKK..........',
      '..........KKKKK..KKKKK..........',
      '................................',
    ],
  };

// Natalino — il parrucchiere: ciuffo scolpito, orecchino, forbicione d'argento (32x32)
  const natalino = {
    palette: { s:'#e2b28e', h:'#1d1812', H:'#3a2c1c', e:'#2a2a35', c:'#7a2432', C:'#5a1a26', d:'#2a2a32', w:'#fff', k:'#8a5a48', n:'#c89878', K:'#1a1a22', m:'#d8dce8', M:'#9aa0b0', g:'#e8c840' },
    map: [
      '...........HHHHHHHHH............',
      '...........HhhhhhhHH............',
      '.........hhhhhhhhhhhhhh.........',
      '.........hhhhhhhhhhhhhh.........',
      '.........hhhhhhhhhhhhhh.........',
      '.........hhhhhhhhhhhhhh.........',
      '.........hhshhhsshhhshh.........',
      '.........hhswwwsswwwshh.........',
      '..........sswewsswewss..........',
      '..........sssssnnsssssg.........',
      '..........sssskkkkssss..........',
      '..........ssssssssssss..........',
      '..............ssss..............',
      '..............ssss......mm..mm..',
      '.........ccccCCccCCcccc.mm..mm..',
      '.......ccccccccggcccccccc.mmm...',
      '.......ccccCCCCCCCCCCcccc.wMm...',
      '.......ccccCCCCCCCCCCcccc.mmm...',
      '.......ccccCCCCCCCCCCccccmm.mm..',
      '.......ccccCCCCCCCCCCccccgg.gg..',
      '.......ccccCCCCCCCCCCccssgg.gg..',
      '.......ssccCCCCCCCCCCccss.......',
      '.......ssccccccccccccccss.......',
      '...........dddd..dddd...........',
      '...........dddd..dddd...........',
      '...........dddd..dddd...........',
      '...........dddd..dddd...........',
      '...........dddd..dddd...........',
      '...........dddd..dddd...........',
      '..........KKKKK..KKKKK..........',
      '..........KKKKK..KKKKK..........',
      '................................',
    ],
  };

// Claudia — l'immagine è SUA: telefono alzato col flash, top magenta (32x32)
  const claudia = {
    palette: { s:'#e8bc98', h:'#241a14', e:'#3a2a20', t:'#a83a6a', T:'#7a2848', D:'#2e2e3a', w:'#fff', k:'#a06a58', n:'#d0a080', K:'#1a1a22', f:'#1a1a22', F:'#5ad8e0', r:'#b04858' },
    map: [
      '................................',
      '..........hhhhhhhhhhhh...w......',
      '.........hhhhhhhhhhhhhh.w.w.....',
      '.........hhhhhhhhhhhhhhfffff....',
      '........hhhhhhhhhhhhhhhfFFFf....',
      '........hhhsssssssssshhfFFFf....',
      '........hhhshhhsshhhshhfFFFf....',
      '........hhhswwwsswwwshhfFFFf....',
      '........hhhswewsswewshhfffff....',
      '........hhhssssnnsssshhhss......',
      '........hhhsssrrrrssshhhss......',
      '........hhhsssssssssshhhss......',
      '........hhh...ssss...hhhss......',
      '........hhh...ssss...hhhss......',
      '........hhhtttttttttthhhss......',
      '.......thhhtttttttttthh.........',
      '.......ttttTTTTTTTTTTtt.........',
      '.......ttttTTTTTTTTTTtt.........',
      '.......ttttTTTTTTTTTTtt.........',
      '.......ttttTTTTTTTTTTtt.........',
      '.......ttttTTTTTTTTTTtt.........',
      '.......ssttTTTTTTTTTTtt.........',
      '.......sstttttttttttttt.........',
      '..........DDDDDDDDDDDD..........',
      '..........DDDDDDDDDDDD..........',
      '..........DDDDDDDDDDDD..........',
      '...........ssss..ssss...........',
      '...........ssss..ssss...........',
      '...........ssss..ssss...........',
      '..........KKKKK..KKKKK..........',
      '..........KKKKK..KKKKK..........',
      '................................',
    ],
  };

// Federico — il persuasore: giacca sui revers, svapo coi cerchi, birra al limone (32x32)
  const federico = {
    palette: { s:'#e0b090', h:'#33261a', b:'#4a3826', e:'#2a3a4a', c:'#5a88b0', C:'#3d6890', j:'#2c2c38', d:'#3a3a45', w:'#fff', k:'#1d1812', n:'#c89878', K:'#1a1a22', v:'#b8bcd0', y:'#e8c840', Y:'#f8f4d8', L:'#c8a020' },
    map: [
      '................................',
      '................................',
      '..........hhhhhhhhhhhh..........',
      '.........hhhhhhhhhhhhhh.........',
      '.........hhhhhhhhhhhhhh.........',
      '.........hhhhhhhhhhhhhh.........',
      '..........sshhhsshhhss.......vvv',
      '..........sswwwsswwwss.......v.v',
      '..........sswewsswewss.......vvv',
      '..........sssssnnsssss..........',
      '..........bbsskkkkssbb......vv..',
      '..........bbbbkkkkbbbb......vv..',
      '...........bbbbbbbbbb...........',
      '..............ssss..............',
      '.........jjjjjccccjjjjj.....v...',
      '.......jjjjjjjccccjjjjjjj.......',
      '.......jjjjjjjCCCCjjjjjjj.......',
      '.......jjjjjjjCwCCjjjjjjj..v....',
      '.....yyyyjjjCCCCCCCCjjjjj.......',
      '.....yyyyjjjCCCCCCCCjjjjj.......',
      '.....YYYYjjjCCCwCCCCjjjjvvvv....',
      '.....YLssjjjCCCCCCCCjjjsvvvv....',
      '.....yyssjjjccccccccjjjss.......',
      '.....yyyy..dddd..dddd...........',
      '.....yyyy..dddd..dddd...........',
      '...........dddd..dddd...........',
      '...........dddd..dddd...........',
      '...........dddd..dddd...........',
      '...........dddd..dddd...........',
      '..........KKKKK..KKKKK..........',
      '..........KKKKK..KKKKK..........',
      '................................',
    ],
  };

// Emanuela — la guaritrice: chignon, phon da 2200 watt, borsa con la croce (32x32)
  const emanuela = {
    palette: { s:'#ecc2a0', h:'#8a6238', H:'#6e4c28', e:'#3a2a20', t:'#3d8a80', T:'#2a655e', D:'#2e2e3a', w:'#fff', k:'#a06a58', n:'#d0a080', K:'#1a1a22', f:'#8a92b8', F:'#5a628a', r:'#b05858', b:'#8a5a35' },
    map: [
      '............HHHHHHHH............',
      '............HhhhhhhH............',
      '............HHHHHHHH............',
      '.........hhhhhhhhhhhhhh.........',
      '.........hhhhhhhhhhhhhh.........',
      '.........hhhhhhhhhhhhhh.........',
      '.........hhshhhsshhhshh.........',
      '.........hhswwwsswwwshh.........',
      '.........hhswewsswewshh.........',
      '.........hhssssnnsssshh.........',
      '..........ssssrrrrssss..........',
      '..........ssssssssssss..........',
      '..............ssss..............',
      '..............ssss..............',
      '.........tttttttttttttt.........',
      '.......tttttttttttttttttt......w',
      '.......ttttTTTTTTTTTTtttfffff...',
      '.....bbbtttTTTTTTTTTTtttfffffFF.',
      '.....bbbtttTTTTTTTTTTtttfffffFFw',
      '....bbbbbttTTTTTTTTTTtttfffff...',
      '....bbwbbttTTTTTTTTTTttssFF.....',
      '....bwwwbttTTTTTTTTTTttssFF....w',
      '....bbwbbttttttttttttttssFF.....',
      '....bbbbb..DDDD..DDDD...........',
      '...........DDDD..DDDD...........',
      '...........DDDD..DDDD...........',
      '...........DDDD..DDDD...........',
      '...........DDDD..DDDD...........',
      '...........DDDD..DDDD...........',
      '..........KKKKK..KKKKK..........',
      '..........KKKKK..KKKKK..........',
      '................................',
    ],
  };

  /* ---------- LE CREATURE DEL BELVEDERE ---------- */

  // Ombra di un ospite: accappatoio bianco, dentro il buio
  const ombra = {
    palette: { a:'#e8e4dc', A:'#c8c2b4', v:'#12090e', e:'#c0392b' },
    map: [
      '.....aaaaaa.....',
      '....aavvvvaa....',
      '...aavvvvvvaa...',
      '...avvevvevva...',
      '...aavvvvvvaa...',
      '....aavvvvaa....',
      '...aaaaaaaaaa...',
      '..aaAAAAAAAAaa..',
      '..aAAvvvvvvAAa..',
      '..aAAvvvvvvAAa..',
      '..aAAvvvvvvAAa..',
      '..aaAAAAAAAAaa..',
      '...aaaaaaaaaa...',
      '...aav....vaa...',
      '....v......v....',
      '................',
    ].map(r => r.replace(/ /g, '.').padEnd(16, '.').slice(0, 16)),
  };

  // Cameriere in livrea: manichino, testa liscia e pallida
  const cameriere = {
    palette: { m:'#ddd2c4', M:'#b8ac9c', k:'#1d1a22', K:'#2e2a35', w:'#f0ece4', g:'#c8a032' },
    map: [
      '.....mmmmmm.....',
      '....mmmmmmmm....',
      '...mmMMMMMMmm...',
      '...mmMMMMMMmm...',
      '...mmmMMMMmmm...',
      '....mmmmmmmm....',
      '..kkkkkwwkkkkk..',
      '..kKKKKwwKKKKk..',
      '..kKkKKwwKKkKk..',
      '..kKKKKggKKKKk..',
      '..kKKKKKKKKKKk..',
      '..kKKKKKKKKKKk..',
      '..kkkkkkkkkkkk..',
      '...kkk....kkk...',
      '...mm......mm...',
      '................',
    ].map(r => r.replace(/ /g, '.').padEnd(16, '.').slice(0, 16)),
  };

  // Bambola della nursery: porcellana crepata, vestitino
  const bambola = {
    palette: { p:'#f0e2d6', P:'#d4c2b2', e:'#1a1a22', r:'#a83a4a', c:'#7a2432', C:'#5a1a26', k:'#3a2a20', x:'#8a7462' },
    map: [
      '....kkkkkkkk....',
      '...kkkkkkkkkk...',
      '..kkpppppppp kk.',
      '..kppeppppep pk.',
      '..kpppppxppp pk.',
      '..kpprrpprr ppk.',
      '...ppppkkpppp...',
      '....pppppppp....',
      '....cccccccc....',
      '...ccCCCCCCcc...',
      '..pccCCCCCCcc p.',
      '..ccccccccccc c.',
      '..cccccccccccc..',
      '...pp......pp...',
      '...pp......pp...',
      '................',
    ].map(r => r.replace(/ /g, '.').padEnd(16, '.').slice(0, 16)),
  };

  // Il Giardiniere: spaventapasseri con cesoie
  const spaventapasseri = {
    palette: { p:'#c8a25a', P:'#a8843e', v:'#171017', j:'#4a5238', J:'#38402a', t:'#6e5238', m:'#8a8f9e', M:'#b8bec9' },
    map: [
      '....pppppppp....',
      '...pPPPPPPPPp...',
      '..ppppppppppp p.',
      '....vvvvvvvv....',
      '...vvpvvvvpvv...',
      '...vvvvvvvvvv...',
      '....vvpppvv v...',
      '..jjjjjjjjjjj m.',
      '..jJJJJJJJJj mm.',
      '.pjJJJJJJJJjmM..',
      '.pjJJtJJJtJj m..',
      '..jjjjjjjjjj m..',
      '...ttt..ttt.mm..',
      '...ttt..ttt.....',
      '...pp....pp.....',
      '................',
    ].map(r => r.replace(/ /g, '.').padEnd(16, '.').slice(0, 16)),
  };

  // Lupo della Nebbia: pallido, occhi da lumino
  const lupoNebbia = {
    palette: { f:'#b8bcc4', F:'#8a8e98', e:'#e8d84a', t:'#f0f0e8', n:'#3a3a45' },
    map: [
      '................',
      '................',
      '..F.........F...',
      '..FF.......FF...',
      '..FFFFFFFFFFF...',
      '..FfffffffffF...',
      '..FeffffffefF...',
      '..FfffffffffFF..',
      '..FffttttfffFFF.',
      '...FFffffFF..FF.',
      '..FFFFFFFFFF.F..',
      '..FffffffffF....',
      '..FfFF..FFfF....',
      '..FfF....FfF....',
      '..nn......nn....',
      '................',
    ].map(r => r.replace(/ /g, '.').padEnd(16, '.').slice(0, 16)),
  };

  // Lo Chef: enorme, grembiule, retina al posto della faccia
  const cuoco = {
    palette: { w:'#e8e4dc', W:'#c8c2b4', v:'#171017', g:'#d8d2c4', G:'#b0a894', s:'#8a8f9e', k:'#3a2a20' },
    map: [
      '....wwwwwwww....',
      '...wwwwwwwwww...',
      '...wWWWWWWWWw...',
      '....vvvvvvvv....',
      '...vvvvvvvvvv...',
      '...vvvWvvWvvv...',
      '....vvvvvvvv....',
      '..ggggggggggg g.',
      '..gGGGGGGGGGGg..',
      '.wgGGGGGGGGGGgw.',
      '.wgGGkGGGGkGGgw.',
      '.wgGGGGGGGGGGgs.',
      '..ggggggggggg ss',
      '...kkk....kkk.s.',
      '...kkk....kkk...',
      '................',
    ].map(r => r.replace(/ /g, '.').padEnd(16, '.').slice(0, 16)),
  };

  // Ritratto Affamato: cornice dorata, dentro qualcuno che sporge
  const ritratto = {
    palette: { g:'#c8a032', G:'#8a6a1d', v:'#171017', s:'#d8c8b8', e:'#c0392b' },
    map: [
      '.gggggggggggggg.',
      '.gGGGGGGGGGGGGg.',
      '.gGvvvvvvvvvvGg.',
      '.gGvvssssssvvGg.',
      '.gGvssevvesvvGg.',
      '.gGvssssssvv vGg',
      '.gGvvsssssvvvGg.',
      '.gGvvvssvvvvvGg.',
      '.gGvvsssssvvvGg.',
      '.gGvssssssssvGg.',
      '.gGvsvvvvvvsvGg.',
      '.gGvvvvvvvvvvGg.',
      '.gGGGGGGGGGGGGg.',
      '.gggggggggggggg.',
      '................',
      '................',
    ].map(r => r.replace(/ /g, '.').padEnd(16, '.').slice(0, 16)),
  };

  // Lord Gregorio: completo di lino, capelli bianchi, eleganza d'altri tempi
  const gregorio = {
    palette: { s:'#e6d2be', h:'#e8e4dc', H:'#c8c2b4', e:'#3a4a5a', l:'#cfc4ae', L:'#b0a58c', d:'#5a5244', w:'#fff', k:'#7a2432', n:'#d0b89c', K:'#1a1a22', m:'#c8ccd8' },
    map: [
      '................................',
      '..........HHHHHHHHHHHH..........',
      '.........hhhhhhhhhhhhhh.........',
      '.........hhhhhhhhhhhhhh.........',
      '.........hhhhhhhhhhhhhh.........',
      '.........HHssssssssssHH.........',
      '.........HHsHHHssHHHsHH.........',
      '.........HHswwwsswwwsHH.........',
      '.........HHswewsswewsHH.........',
      '..........sssssnnsssss..........',
      '..........sssskkkkssss..........',
      '..........ssssssssssss..........',
      '..............ssss..............',
      '..............ssss..............',
      '.........lllLLkkkkLLlll.........',
      '.......lllllLLkkkkLLlllll.......',
      '.......llllLLLLLLLLLLllll.k.....',
      '.......llllLLLLLLLLLLllll.ww....',
      '.......llllLLLLkLLLLLllll.ww....',
      '.......llllLLLLLLLLLLllll.ww....',
      '.......llllLLLLLLLLLLlllmmmmmmm.',
      '.......wwllLLLLLLLLLLllww.......',
      '.......wwllllllllllllllww.......',
      '........LL.dddd..dddd.LL........',
      '........LL.dddd..dddd.LL........',
      '........LL.dddd..dddd.LL........',
      '........LL.dddd..dddd.LL........',
      '...........dddd..dddd...........',
      '...........dddd..dddd...........',
      '..........KKKKK..KKKKK..........',
      '..........KKKKK..KKKKK..........',
      '................................',
    ],
  };

  // La Fame: il buco a forma di padrone di casa, col tovagliolo
  const gregorioFame = {
    palette: { v:'#0d070d', V:'#1d1017', e:'#c0392b', t:'#f0ece4', p:'#3a2030' },
    map: [
      '.....vvvvvv.....',
      '....vvvvvvvv....',
      '...vVVVVVVVVv...',
      '...vVeVVVVeVv...',
      '...vVVVVVVVVv...',
      '....vVVVVVVv....',
      '...vvvvvvvvvv...',
      '..vvvttttttvvv..',
      '..vVVttttttVVv..',
      '.pvVVVttttVVVvp.',
      '.pvVVVVVVVVVVvp.',
      '.pvVVVVVVVVVVvp.',
      '..vvVVVVVVVVvv..',
      '...vvv....vvv...',
      '....v......v....',
      '................',
    ].map(r => r.replace(/ /g, '.').padEnd(16, '.').slice(0, 16)),
  };

  // Ada: la signora del pozzo, 1899, luce tenue
  const ada = {
    palette: { s:'#e8e0d8', h:'#8a7a6a', H:'#6e604e', e:'#4a5a6a', d:'#c8c0b4', D:'#a89e8e', w:'#fff', g:'#c8a032', k:'#8a7462' },
    map: [
      '.....hhhhhh.....',
      '....hHHHHHHh....',
      '....hHHHHHHh....',
      '...hHssssss Hh..',
      '...hswsesws h...',
      '...hssssssss....',
      '....sss kkss....',
      '....dddddddd....',
      '...ddDDgDDdd d..',
      '...dDDDDDDDDd...',
      '..ddDDDDDDDDdd..',
      '..dDDDDDDDDDDd..',
      '..dddddddddddd..',
      '..dddddddddddd..',
      '...dd......dd...',
      '................',
    ].map(r => r.replace(/ /g, '.').padEnd(16, '.').slice(0, 16)),
  };

  // Don Michele: il sesto del Settantaquattro (tonaca nera, colletto, caffè)
  const donmichele = {
    palette: { s:'#e0c8b0', h:'#d8d4cc', H:'#b8b4ac', e:'#3a3a45', l:'#26222a', L:'#17141c', d:'#26222a', w:'#fff', k:'#e8e4dc', n:'#c8ac90', K:'#1a1a22', m:'#8a8478' },
    map: gregorio.map,
  };


  // Sofia — la ragazza del 1999: capelli mossi, occhiali da sole sui capelli, jeans
  const sofia = {
    palette: { s:'#e8bc98', h:'#3a2418', H:'#4d3020', e:'#3a2a20', o:'#2a2a35', t:'#c8642a', T:'#a04a1d', j:'#3d5a80', J:'#2d4666', w:'#fff', k:'#a06a58', n:'#d0a080', r:'#b05858', K:'#1a1a22' },
    map: [
      '................................',
      '................................',
      '.........hhhhhhhhhhhhhh.........',
      '.........hooooooooooooh.........',
      '........hhhhhhhhhhhhhhhh........',
      '........hhhsssssssssshhh........',
      '........hhhshhhsshhhshhh........',
      '........hhhswwwsswwwshhh........',
      '........hhhswewsswewshhh........',
      '........hhhssssnnsssshhh........',
      '........hhhsssrrrrssshhh........',
      '........hhhsssssssssshhh........',
      '........hhh...ssss...hhh........',
      '........hhh...ssss...hhh........',
      '.........jjjJttttttJjjj.........',
      '.......jjjjjJttttttJjjjjj.......',
      '.......jjjjjJTTTTTTJjjjjj.......',
      '.......jjjjjJTTTTTTJjjjjj.......',
      '.......jjjjjJTTTTTTJjjjjj.......',
      '.......jjjjjtTTTTTTtjjjjj.......',
      '.......jjjjjtTTTTTTtjjjjwo......',
      '.......ssjjjtTTTTTTtjjjso.......',
      '.......ssjjjttttttttjjjss.......',
      '..........jjjjjjjjjjjj..........',
      '..........jjjjjjjjjjjj..........',
      '..........jjjjjjjjjjjj..........',
      '...........ssss..ssss...........',
      '...........ssss..ssss...........',
      '...........ssss..ssss...........',
      '..........wwwww..wwwww..........',
      '..........wwwww..wwwww..........',
      '................................',
    ],
  };

  // Il Direttore — il riflesso di Gregorio: stesso volto, zero calore, completo NERO
  const direttore = {
    palette: { s:'#d8ccc0', h:'#e8e4dc', H:'#c8c2b4', e:'#8a1a2a', l:'#1d1a22', L:'#2e2a35', d:'#12101a', w:'#fff', k:'#5a1a26' },
    map: [
      '....hhhhhhhh....',
      '...hHHHHHHHHh...',
      '..hHssssssss Hh.',
      '..hsesssse ss h.',
      '...ssssssssss...',
      '...sss kksss s..',
      '....ssssssss....',
      '....llllllll....',
      '...llLLkkLLll...',
      '..sllLLkkLLlls..',
      '..slLLLLLLLLls..',
      '..sllllllllll s.',
      '...dddddddddd...',
      '...ddd....ddd...',
      '...ddd....ddd...',
      '................',
    ].map(r => r.replace(/ /g, '.').padEnd(16, '.').slice(0, 16)),
  };

  // Il Doppio — il vostro riflesso sbagliato: sagoma scura con gli occhi bianchi
  const doppio = {
    palette: { v:'#171020', V:'#241a2e', e:'#f0ece4', r:'#8a1a2a' },
    map: [
      '....vvvvvvvv....',
      '...vvvvvvvvvv...',
      '..vvVVVVVVVVv v.',
      '..vVeVVVVeVV v..',
      '..vVVVVVVVVV v..',
      '..vVVVrrVVVV....',
      '...vVVVVVVVv....',
      '....vvvvvvvv....',
      '...vvvvvvvvvv...',
      '..vvvVVVVVVvvv..',
      '..vvVVVVVVVVvv..',
      '..vvvvvvvvvvvv..',
      '...vvvvvvvvvv...',
      '...vvv....vvv...',
      '...vv......vv...',
      '................',
    ].map(r => r.replace(/ /g, '.').padEnd(16, '.').slice(0, 16)),
  };

  // Il Contabile — scheletro in maniche di camicia e mezze maniche, penna dietro l'orecchio
  const contabile = {
    palette: { b:'#e8e4d8', B:'#c8c2b0', e:'#1d1a22', c:'#e8e0d0', C:'#c8c0b0', v:'#3d5a50', g:'#c8a032', k:'#2a2a32' },
    map: [
      '....bbbbbbbb....',
      '...bbbbbbbbbb...',
      '..bbBBBBBBBBbbg.',
      '..bbeBBBBBBebb..',
      '..bbBBBBBBBBbb..',
      '..bbBeeeeeeBbb..',
      '...bbbbbbbbbb...',
      '....cccccccc....',
      '...ccCCCCCCcc...',
      '..bcvvvvvvvvcb..',
      '..bcvCCCCCCvcb..',
      '..bccccccccccb..',
      '...kkkkkkkkkk...',
      '...kkk....kkk...',
      '...bb......bb...',
      '................',
    ].map(r => r.replace(/ /g, '.').padEnd(16, '.').slice(0, 16)),
  };

  const registry = {
    gaetano, natalino, claudia, federico, emanuela, donmichele,
    ombra, cameriere, bambola, spaventapasseri, lupo_nebbia: lupoNebbia,
    cuoco, ritratto, gregorio, gregorio_fame: gregorioFame, ada,
    sofia, direttore, doppio, contabile,
  };

  return { drawSprite, renderToCanvas, registry };
})();
