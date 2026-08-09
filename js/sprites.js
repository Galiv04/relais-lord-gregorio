/* ============ SPRITES — pixel art procedurale ============
   Ogni sprite è una mappa di caratteri 16x16. Ogni carattere è un colore
   nella palette dello sprite. '.' = trasparente.                        */

const Sprites = (() => {

  function drawSprite(ctx, map, palette, x, y, scale, flip = false) {
    const h = map.length, w = map[0].length;
    for (let r = 0; r < h; r++) {
      for (let c = 0; c < w; c++) {
        const ch = map[r][flip ? w - 1 - c : c];
        if (ch === '.') continue;
        const col = palette[ch];
        if (!col) continue;
        ctx.fillStyle = col;
        ctx.fillRect(x + c * scale, y + r * scale, scale, scale);
      }
    }
  }

  function renderToCanvas(canvas, spriteDef, bg = '#1a1114') {
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const scale = Math.floor(Math.min(canvas.width, canvas.height) / 16);
    const off = Math.floor((canvas.width - scale * 16) / 2);
    drawSprite(ctx, spriteDef.map, spriteDef.palette, off, off, scale);
  }

  /* ---------- I CINQUE AMICI ---------- */

  // Gaetano — l'ingegnere: occhiali, polo blu
  const gaetano = {
    palette: { s:'#e0b090', h:'#2a2018', e:'#2a2a35', o:'#4a4a55', p:'#2a4a7a', P:'#1d3558', d:'#3a3a45', w:'#fff', g:'#c8ccd8', k:'#8a5a48' },
    map: [
      '....hhhhhhhh....',
      '...hhhhhhhhhh...',
      '..hhssssssssh h.',
      '..hoooss ooos h.',
      '..hoeoss oeos h.',
      '...ssssssssss...',
      '...ssss kksss...',
      '....pppppppp....',
      '...pPPPPPPPPp...',
      '..spPPPPPPPPps..',
      '..spPPgPPPPPps..',
      '..sppppppppps s.',
      '...dddddddddd...',
      '...ddd....ddd...',
      '...ddd....ddd...',
      '................',
    ].map(r => r.replace(/ /g, '.').padEnd(16, '.').slice(0, 16)),
  };

  // Natalino — il parrucchiere: ciuffo scolpito, camicia bordeaux, forbici
  const natalino = {
    palette: { s:'#e2b28e', h:'#1d1812', H:'#2e2418', e:'#2a2a35', c:'#7a2432', C:'#5a1a26', d:'#2a2a32', w:'#fff', m:'#c8ccd8', k:'#8a5a48' },
    map: [
      '.....hhHHhh.....',
      '...hhHHHHHHhh...',
      '..hhHHhhhhHHh h.',
      '..hhssssssss h..',
      '..hswsesews s...',
      '...ssssssssss...',
      '...ssss kksss...',
      '....cccccccc....',
      '...cCCCCCCCCc...',
      '..scCCCCCCCCcs..',
      '..scCCCCCCCCcsm.',
      '..sccccccccc smm',
      '...dddddddddd.m.',
      '...ddd....ddd...',
      '...ddd....ddd...',
      '................',
    ].map(r => r.replace(/ /g, '.').padEnd(16, '.').slice(0, 16)),
  };

  // Claudia — l'osservatrice: capelli lunghi scuri, top magenta, telefono
  const claudia = {
    palette: { s:'#e8bc98', h:'#241a14', e:'#3a2a20', t:'#a83a6a', T:'#7a2848', d:'#2e2e3a', w:'#fff', f:'#1a1a22', F:'#5ad8e0', k:'#a06a58', a:'#a83a6a' },
    map: [
      '....hhhhhhhh....',
      '...hhhhhhhhhh...',
      '..hhssssssss hh.',
      '..hswsesews s h.',
      '..hssssssss s h.',
      '..hsss kksss.h..',
      '..h.ssssssss.h..',
      '..h.tttttttt.h..',
      '..hattTTTTtta h.',
      '..h ttTTTTtt fh.',
      '..h.tttttttt.fF.',
      '....tttttttt.f..',
      '....dddddddd....',
      '....dd....dd....',
      '....dd....dd....',
      '................',
    ].map(r => r.replace(/ /g, '.').padEnd(16, '.').slice(0, 16)),
  };

  // Federico — il persuasore: barba curata, camicia azzurra
  const federico = {
    palette: { s:'#e0b090', h:'#33261a', b:'#4a3826', e:'#2a3a4a', c:'#5a88b0', C:'#3d6890', d:'#3a3a45', w:'#fff', k:'#1d1812' },
    map: [
      '....hhhhhhhh....',
      '...hhhhhhhhhh...',
      '..hhssssssss h..',
      '..hswsesews s...',
      '..hsssssssss....',
      '..hbbssssbb b...',
      '...bbbkkbbb b...',
      '....cccccccc....',
      '...cCCCCCCCCc...',
      '..scCwCCCCwCcs..',
      '..scCCCCCCCCcs..',
      '..sccccccccc s..',
      '...dddddddddd...',
      '...ddd....ddd...',
      '...ddd....ddd...',
      '................',
    ].map(r => r.replace(/ /g, '.').padEnd(16, '.').slice(0, 16)),
  };

  // Emanuela — la guaritrice: capelli castano chiaro raccolti, maglia verde acqua, borsa
  const emanuela = {
    palette: { s:'#ecc2a0', h:'#8a6238', H:'#6e4c28', e:'#3a2a20', t:'#3d8a80', T:'#2a655e', d:'#2e2e3a', w:'#fff', b:'#8a5a35', k:'#a06a58' },
    map: [
      '.....hhhhhh.....',
      '....hHHHHHHh....',
      '...hHssssssHh...',
      '...hswsesws Hh..',
      '...hssssssss h..',
      '...hsss kksss...',
      '....ssssssss....',
      '....tttttttt....',
      '...ttTTTTTTtt...',
      '..sttTTTTTTtts..',
      '..stTTTTTTTTt sb',
      '..stttttttttsbb.',
      '...dddddddddd b.',
      '...ddd....ddd...',
      '...ddd....ddd...',
      '................',
    ].map(r => r.replace(/ /g, '.').padEnd(16, '.').slice(0, 16)),
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
    palette: { s:'#e6d2be', h:'#e8e4dc', H:'#c8c2b4', e:'#3a4a5a', l:'#cfc4ae', L:'#b0a58c', d:'#5a5244', w:'#fff', k:'#7a2432' },
    map: [
      '....hhhhhhhh....',
      '...hHHHHHHHHh...',
      '..hHssssssss Hh.',
      '..hswsesews s h.',
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

  const registry = {
    gaetano, natalino, claudia, federico, emanuela,
    ombra, cameriere, bambola, spaventapasseri, lupo_nebbia: lupoNebbia,
    cuoco, ritratto, gregorio, gregorio_fame: gregorioFame, ada,
  };

  return { drawSprite, renderToCanvas, registry };
})();
