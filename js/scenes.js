/* ============ SCENES — sfondi pixel/blocchi procedurali ============ */

const Scenes = (() => {

  // RNG con seme, per texture riproducibili
  function rng(seed) {
    let s = seed >>> 0;
    return () => {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 4294967296;
    };
  }

  /* shade(colore, fattore) — schiarisce o scurisce.
     Accetta '#rrggbb' MA ANCHE 'rgb(r,g,b)', ed è una difesa, non un vezzo:
     shade() e mix() restituiscono entrambe 'rgb(...)', e blocks() chiama shade()
     sul colore che riceve. Se shade() sapesse leggere solo l'esadecimale,
     `blocks(..., mix(a,b,t), ...)` farebbe parseInt('gb(200,160,88)',16) = NaN,
     e NaN>>16&255 = 0: un NERO perfettamente valido che nessun controllo
     intercetta (lezione 63). Leggendo entrambi i formati il problema non può
     nascere in nessuno dei punti di chiamata, presenti e futuri. */
  function shade(col, f) {
    let n;
    if (col[0] === '#') n = parseInt(col.slice(1), 16);
    else {
      const m = col.match(/(\d+)\D+(\d+)\D+(\d+)/);
      n = m ? ((+m[1]) << 16) | ((+m[2]) << 8) | (+m[3]) : 0;
    }
    let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    r = Math.max(0, Math.min(255, Math.round(r * f)));
    g = Math.max(0, Math.min(255, Math.round(g * f)));
    b = Math.max(0, Math.min(255, Math.round(b * f)));
    return `rgb(${r},${g},${b})`;
  }

  // Riempi area con blocchi stile minecraft (variazione di tono per blocco)
  function blocks(ctx, x, y, w, h, color, blockSize, rand, variance = 0.18) {
    for (let by = y; by < y + h; by += blockSize) {
      for (let bx = x; bx < x + w; bx += blockSize) {
        const f = 1 - variance / 2 + rand() * variance;
        ctx.fillStyle = shade(color, f);
        ctx.fillRect(bx, by, Math.min(blockSize, x + w - bx), Math.min(blockSize, y + h - by));
        // bordo superiore più chiaro (effetto 3D blocco)
        ctx.fillStyle = shade(color, f * 1.15);
        ctx.fillRect(bx, by, Math.min(blockSize, x + w - bx), 2);
      }
    }
  }

  function skyGradient(ctx, W, H, top, bottom, bands = 8) {
    for (let i = 0; i < bands; i++) {
      const t = i / (bands - 1);
      const c1 = parseInt(top.slice(1), 16), c2 = parseInt(bottom.slice(1), 16);
      const r = Math.round(((c1 >> 16) & 255) * (1 - t) + ((c2 >> 16) & 255) * t);
      const g = Math.round(((c1 >> 8) & 255) * (1 - t) + ((c2 >> 8) & 255) * t);
      const b = Math.round((c1 & 255) * (1 - t) + (c2 & 255) * t);
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.fillRect(0, Math.floor(H * i / bands), W, Math.ceil(H / bands) + 1);
    }
  }

  function stars(ctx, W, H, rand, n = 60) {
    for (let i = 0; i < n; i++) {
      const x = Math.floor(rand() * W), y = Math.floor(rand() * H * 0.7);
      ctx.fillStyle = rand() > 0.8 ? '#fff' : '#9a90c0';
      const s = rand() > 0.9 ? 3 : 2;
      ctx.fillRect(x, y, s, s);
    }
  }

  /* ---------- ECLISSI ----------
     Fase 0 = appena iniziata (anello sottile e pallido)
     Fase 1 = mezzanotte (corona rossa larga e pulsante).
     La imposta il motore scena per scena: vedi Engine.eclipsePhaseFor().  */
  let eclipsePhase = 0.3;
  function setEclipse(p) { eclipsePhase = Math.max(0, Math.min(1, p)); }
  function getEclipse() { return eclipsePhase; }

  // Disco a pixel PERFETTAMENTE simmetrico (il vecchio disegno era storto)
  function pixelDisc(ctx, cx, cy, r, px = 3) {
    const CX = Math.round(cx / px) * px, CY = Math.round(cy / px) * px;
    const R = Math.max(px, Math.round(r / px) * px);
    for (let dy = -R; dy < R; dy += px) {
      const yy = dy + px / 2;                     // centro della riga: simmetrico per dy e -dy-px
      const hw = Math.sqrt(Math.max(0, R * R - yy * yy));
      const w = Math.max(px, Math.round(hw / px) * px);
      ctx.fillRect(CX - w, CY + dy, w * 2, px);
    }
  }

  function mix(a, b, t) {
    const ca = parseInt(a.slice(1), 16), cb = parseInt(b.slice(1), 16);
    const r = Math.round(((ca >> 16) & 255) * (1 - t) + ((cb >> 16) & 255) * t);
    const g = Math.round(((ca >> 8) & 255) * (1 - t) + ((cb >> 8) & 255) * t);
    const bl = Math.round((ca & 255) * (1 - t) + (cb & 255) * t);
    return `rgb(${r},${g},${bl})`;
  }

  function moon(ctx, x, y, r, color = '#e8e0f0', eclipse = false, phase = null) {
    const p = phase != null ? phase : eclipsePhase;
    if (!eclipse) { ctx.fillStyle = color; pixelDisc(ctx, x, y, r); return; }

    // alone esterno: si allarga e si arrossa con l'avanzare della notte
    const halo = Math.round(r * (0.5 + p * 1.4));
    ctx.fillStyle = `rgba(${Math.round(180 + 60 * p)},${Math.round(90 - 50 * p)},${Math.round(140 - 60 * p)},${0.05 + p * 0.10})`;
    pixelDisc(ctx, x, y, r + halo);
    ctx.fillStyle = `rgba(${Math.round(200 + 40 * p)},${Math.round(80 - 40 * p)},${Math.round(120 - 60 * p)},${0.06 + p * 0.12})`;
    pixelDisc(ctx, x, y, r + Math.round(halo * 0.55));

    // la corona: da tenue lilla a rosso sangue, sempre più spessa
    const ring = Math.round(3 + p * 9);
    ctx.fillStyle = mix('#c8b8e8', '#f0323e', p);
    pixelDisc(ctx, x, y, r + ring);
    // bordo interno più caldo, per dare spessore alla corona
    ctx.fillStyle = mix('#e8e0f0', '#ff6a52', Math.min(1, p * 1.2));
    pixelDisc(ctx, x, y, r + Math.round(ring * 0.45));

    // il disco nero che divora il sole
    ctx.fillStyle = mix('#2a1020', '#12060c', p);
    pixelDisc(ctx, x, y, r);

    // lingue di corona quando mezzanotte è vicina
    if (p > 0.55) {
      const n = 8, len = Math.round((p - 0.55) * r * 1.6);
      ctx.fillStyle = mix('#e8607a', '#ff3a3a', p);
      for (let i = 0; i < n; i++) {
        const a = i * (Math.PI * 2 / n) + p;
        const fx = x + Math.cos(a) * (r + ring + 1), fy = y + Math.sin(a) * (r + ring + 1);
        ctx.fillRect(Math.round(fx - 1), Math.round(fy - 1), 3, 3);
        ctx.fillRect(Math.round(fx + Math.cos(a) * len - 1), Math.round(fy + Math.sin(a) * len - 1), 3, 3);
      }
    }
  }

  /* ---------- helper di terreno e vegetazione ---------- */

  // Profilo di terreno irregolare: niente più bande orizzontali nette
  function ground(ctx, W, H, topY, color, rand, blockSize = 12, jag = 8) {
    for (let x = 0; x < W; x += blockSize) {
      const off = Math.round((rand() - 0.5) * jag / blockSize) * blockSize;
      blocks(ctx, x, topY + off, blockSize, H - topY - off, color, blockSize, rand, 0.22);
    }
  }

  // Colline morbide sul fondo (silhouette a gradini, non una banda piatta)
  function hills(ctx, W, baseY, height, color, rand, step = 24) {
    let h = height * (0.5 + rand() * 0.5);
    for (let x = 0; x < W; x += step) {
      h += (rand() - 0.5) * height * 0.5;
      h = Math.max(height * 0.25, Math.min(height, h));
      blocks(ctx, x, baseY - h, step, h + 4, color, 12, rand, 0.14);
    }
  }

  // ALBERO — la chioma poggia sul tronco (era il bug principale: fluttuava)
  function tree(ctx, x, groundY, size, leaf, trunk, rand) {
    const tw = Math.max(8, Math.round(size / 6) * 2);
    const topY = groundY - size;                    // cima del tronco
    blocks(ctx, x - tw / 2, topY, tw, size, trunk, 6, rand);
    // radici
    blocks(ctx, x - tw, groundY - 8, tw * 2, 8, trunk, 6, rand, 0.3);
    const lw = size * 1.15;
    // la chioma parte SOTTO la cima del tronco e la avvolge
    const leafBottom = topY + size * 0.22;
    blocks(ctx, x - lw / 2, leafBottom - lw * 0.5, lw, lw * 0.5, leaf, 8, rand, 0.28);
    blocks(ctx, x - lw * 0.36, leafBottom - lw * 0.8, lw * 0.72, lw * 0.34, leaf, 8, rand, 0.28);
    blocks(ctx, x - lw * 0.2, leafBottom - lw * 0.98, lw * 0.4, lw * 0.24, leaf, 8, rand, 0.28);
  }

  // Salice piangente: chioma larga + rami che ricadono
  function willow(ctx, x, groundY, size, leaf, trunk, rand) {
    const tw = Math.max(8, Math.round(size / 7) * 2);
    blocks(ctx, x - tw / 2, groundY - size, tw, size, trunk, 6, rand);
    const lw = size * 1.3;
    blocks(ctx, x - lw / 2, groundY - size - lw * 0.28, lw, lw * 0.42, leaf, 8, rand, 0.26);
    // rami cadenti, più corti ai lati
    for (let i = -4; i <= 4; i++) {
      const bx = x + i * (lw / 10);
      const len = size * (0.5 - Math.abs(i) * 0.05) + rand() * 10;
      blocks(ctx, bx - 3, groundY - size + lw * 0.1, 6, len, leaf, 6, rand, 0.34);
    }
  }

  // Ulivo: chioma argentata e tronco contorto — siamo in Irpinia
  function olive(ctx, x, groundY, size, rand, dark = false) {
    const trunk = dark ? '#3a2f22' : '#5a4a35';
    const leaf1 = dark ? '#3d4a38' : '#6a7a62';
    const leaf2 = dark ? '#4a5a44' : '#8a9a80';
    blocks(ctx, x - 4, groundY - size * 0.55, 8, size * 0.55, trunk, 5, rand, 0.3);
    blocks(ctx, x - 2 + (rand() > 0.5 ? 6 : -8), groundY - size * 0.7, 6, size * 0.3, trunk, 5, rand, 0.3);
    blocks(ctx, x - size * 0.42, groundY - size * 0.95, size * 0.84, size * 0.42, leaf1, 6, rand, 0.3);
    blocks(ctx, x - size * 0.3, groundY - size * 1.1, size * 0.6, size * 0.3, leaf2, 6, rand, 0.3);
  }

  // Filare di vigna in prospettiva: pali, fili e fogliame
  function vineyard(ctx, x, y, w, rows, rand, dark = false) {
    const leaf = dark ? '#243a26' : '#3d5a3a';
    const pole = dark ? '#33281c' : '#4a3a28';
    for (let rIdx = 0; rIdx < rows; rIdx++) {
      const ry = y + rIdx * 14;
      const rw = w * (1 - rIdx * 0.06);
      const rx = x + (w - rw) / 2;
      ctx.fillStyle = pole;
      for (let px = rx; px < rx + rw; px += 34) ctx.fillRect(px, ry - 12, 3, 14);
      ctx.fillStyle = dark ? '#4a4038' : '#6a5a45';
      ctx.fillRect(rx, ry - 10, rw, 1);
      blocks(ctx, rx, ry - 8, rw, 7, leaf, 6, rand, 0.3);
    }
  }

  // Ombrellone da piscina (bianco/tortora)
  function umbrella(ctx, x, groundY, size, rand) {
    ctx.fillStyle = '#8a8478'; ctx.fillRect(x - 1, groundY - size, 3, size);
    const uw = size * 0.9;
    ctx.fillStyle = '#e8e4da';
    for (let i = 0; i < 3; i++) {
      const t = i / 3;
      ctx.fillRect(x - uw / 2 + t * uw / 2, groundY - size - 8 + i * 4, uw - t * uw, 5);
    }
    ctx.fillStyle = '#c8c2b4';
    ctx.fillRect(x - uw / 2 + 4, groundY - size - 1, 6, 3); ctx.fillRect(x + uw / 2 - 10, groundY - size - 1, 6, 3);
  }

  // Lampioncino da giardino con globo caldo
  function globeLamp(ctx, x, groundY, h, rgb = '232,182,76') {
    ctx.fillStyle = '#2a2a30'; ctx.fillRect(x - 2, groundY - h, 4, h);
    ctx.fillRect(x - 5, groundY - 2, 10, 3);
    glow(ctx, x, groundY - h - 5, 18, 16, rgb);
    ctx.fillStyle = '#f0d8a0'; ctx.fillRect(x - 4, groundY - h - 9, 9, 9);
    ctx.fillStyle = '#fff'; ctx.fillRect(x - 2, groundY - h - 7, 3, 3);
  }

  function bush(ctx, x, groundY, size, color, rand) {
    blocks(ctx, x - size / 2, groundY - size * 0.6, size, size * 0.6, color, 6, rand, 0.3);
    blocks(ctx, x - size * 0.3, groundY - size * 0.85, size * 0.6, size * 0.3, color, 6, rand, 0.3);
  }

  function reeds(ctx, x, groundY, n, rand) {
    for (let i = 0; i < n; i++) {
      const rx = x + i * 5, h = 14 + rand() * 16;
      ctx.fillStyle = '#3d6a3a'; ctx.fillRect(rx, groundY - h, 3, h);
      ctx.fillStyle = '#7a6a2a'; ctx.fillRect(rx - 1, groundY - h - 7, 5, 7);
    }
  }

  /* ---------- helper di costruzioni ---------- */

  function house(ctx, x, groundY, w, h, wall, roof, rand, windowLit = true) {
    blocks(ctx, x, groundY - h, w, h, wall, 8, rand, 0.12);
    // tetto a spiovente: ogni gradino è più stretto e più alto
    const steps = 7, over = 14;
    for (let i = 0; i < steps; i++) {
      const t = i / steps;
      const rw = (w + over * 2) * (1 - t);
      blocks(ctx, x + (w - rw) / 2, groundY - h - 8 - i * 8, rw, 9, roof, 8, rand, 0.16);
    }
    // porta con architrave
    ctx.fillStyle = '#3a2a18'; ctx.fillRect(x + w / 2 - 9, groundY - 28, 18, 28);
    ctx.fillStyle = '#5a4530'; ctx.fillRect(x + w / 2 - 11, groundY - 31, 22, 4);
    ctx.fillStyle = '#c8a032'; ctx.fillRect(x + w / 2 + 4, groundY - 16, 3, 3); // maniglia
    if (windowLit) {
      for (const wx of [x + 10, x + w - 24]) {
        // l'alone passa da glow(), non da un fillRect: vedi il commento sopra
        // glow() — un rettangolo pallido dietro una luce si legge come un
        // quadro appeso, e questo è un helper esportato, quindi il difetto
        // ricomparirebbe in ogni casa di ogni prossimo fondale
        glow(ctx, wx + 7, groundY - h + 19, 34, 32, '245,197,66');
        ctx.fillStyle = '#f5c542'; ctx.fillRect(wx, groundY - h + 12, 14, 14);
        ctx.fillStyle = '#5a4530'; ctx.fillRect(wx + 6, groundY - h + 12, 2, 14);
      }
    }
  }

  // Torcia con staffa: non fluttua più a mezz'aria
  function torch(ctx, x, y, bracket = true) {
    if (bracket) { ctx.fillStyle = '#3a3a45'; ctx.fillRect(x - 5, y + 4, 16, 4); ctx.fillRect(x - 5, y + 4, 4, 12); }
    ctx.fillStyle = '#6e4a2a'; ctx.fillRect(x, y, 6, 22);
    glow(ctx, x + 3, y - 4, 38, 36, '245,166,35');   // tondo, come tutte le luci
    ctx.fillStyle = '#f5a623'; ctx.fillRect(x - 3, y - 10, 12, 12);
    ctx.fillStyle = '#f5e042'; ctx.fillRect(x, y - 7, 6, 6);
  }

  // Cartello di legno con righe di "scritta"
  function sign(ctx, x, groundY, w = 84, h = 30, lines = 2) {
    ctx.fillStyle = '#4a3524'; ctx.fillRect(x - 4, groundY - 46, 8, 46);
    ctx.fillStyle = '#6e5238'; ctx.fillRect(x - w / 2, groundY - 76, w, h);
    ctx.fillStyle = '#5a4530'; ctx.fillRect(x - w / 2, groundY - 76, w, 3);
    ctx.fillStyle = '#2e2118';
    for (let i = 0; i < lines; i++) {
      const lw = w * (0.5 + (i % 2) * 0.2);
      ctx.fillRect(x - lw / 2, groundY - 66 + i * 9, lw, 4);
    }
  }

  // Ponticello di legno sopra un ruscello
  function bridge(ctx, x, y, w, rand) {
    blocks(ctx, x, y, w, 12, '#6e5238', 10, rand, 0.16);
    blocks(ctx, x, y - 3, w, 4, '#8a6a45', 10, rand, 0.1);
    // parapetti
    for (const side of [0, 1]) {
      const px = x + (side ? w - 8 : 0);
      ctx.fillStyle = '#4a3524';
      ctx.fillRect(px, y - 30, 8, 30);
    }
    ctx.fillStyle = '#5a4530';
    ctx.fillRect(x, y - 26, w, 6);
    ctx.fillRect(x + w * 0.45, y - 30, 8, 30);
  }

  // Trave da miniera: montanti fino al soffitto + traversa
  function mineBeam(ctx, x, ceilY, floorY, rand) {
    blocks(ctx, x, ceilY, 14, floorY - ceilY, '#4a3524', 10, rand, 0.14);
    blocks(ctx, x + 70, ceilY, 14, floorY - ceilY, '#4a3524', 10, rand, 0.14);
    blocks(ctx, x - 8, ceilY, 100, 14, '#5a4530', 10, rand, 0.12);
  }

  /* ALONE LUMINOSO — UNITÀ: w e h sono la larghezza e l'altezza TOTALI
     dell'alone finito (circa 1,8·w per essere esatti), non un raggio.

     La versione precedente disegnava quattro fillRect concentrici di lato w·i
     con alpha 0,022·i: il rettangolo più esterno era quattro volte quello
     chiesto ed era opaco al 9% con un bordo a gradino secco. Non si leggeva
     come luce: si leggeva come un PANNELLO. Dietro il lampadario della hall
     sembrava un quadro appeso, in cielo sopra i tornanti una vetrata, e attorno
     al palo dello spaventapasseri era l'oggetto più grande della scena — più
     grande del palo che doveva illuminare. Lo stesso difetto, dodici volte.

     Adesso: sedici passi di ellisse a pixel (pixelEllipse) con alpha costante
     per passo, che si somma verso il centro. Il centro resta luminoso come
     prima (~0,20 composito), il bordo esterno vale un solo passo — sei volte
     più tenue — e soprattutto è TONDO, quindi non ha un contorno da leggere. */
  function glow(ctx, x, y, w, h, rgb) {
    const steps = 16;
    for (let i = steps; i >= 1; i--) {
      const t = i / steps;
      ctx.fillStyle = `rgba(${rgb},0.014)`;
      pixelEllipse(ctx, x, y, w * 0.9 * t, h * 0.9 * t, 3);
    }
  }

  // Ellisse a pixel, simmetrica come pixelDisc: rx e ry sono SEMIASSI.
  function pixelEllipse(ctx, cx, cy, rx, ry, px = 3) {
    const CX = Math.round(cx / px) * px, CY = Math.round(cy / px) * px;
    const RX = Math.max(px, Math.round(rx / px) * px);
    const RY = Math.max(px, Math.round(ry / px) * px);
    for (let dy = -RY; dy < RY; dy += px) {
      const yy = dy + px / 2;
      const k = 1 - (yy * yy) / (RY * RY);
      if (k <= 0) continue;
      const w = Math.max(px, Math.round(RX * Math.sqrt(k) / px) * px);
      ctx.fillRect(CX - w, CY + dy, w * 2, px);
    }
  }

  /* MURO DI NEBBIA fermo a un confine — «la nebbia si è fermata al confine
     esatto della proprietà, e ci gira intorno come un mare attorno a un'isola».

     Prima erano quattordici fillRect per lato, alti H·0,05 e distanziati
     H·0,062: fra una lingua e l'altra restava un vuoto REGOLARE, e ogni lingua
     aveva il bordo verticale netto. Regolarità più bordo netto fa un manufatto,
     non del vapore: si leggeva come un pannello a doghe, un radiatore messo in
     piedi ai due lati del giardino. Ed è l'elemento che tre scene nominano come
     la cosa più inquietante del posto.

     Adesso: un corpo continuo di colonne che si diradano verso l'interno
     (nessun vuoto possibile) più poche lingue grandi, sovrapposte e sfalsate,
     con la punta SFRANGIATA — la larghezza di ogni colonna cala di un valore
     casuale, così non esiste un filo dritto da nessuna parte. */
  function fogWall(ctx, W, H, side, rand, depth = 0.11, rgb = '190,180,195') {
    const inner = Math.max(12, Math.round(W * depth)), step = 3;
    for (let d = 0; d < inner; d += step) {
      const t = d / inner;
      ctx.fillStyle = `rgba(${rgb},${(0.115 * (1 - t) * (1 - t)).toFixed(3)})`;
      ctx.fillRect(side ? W - d - step : d, 0, step, H);
    }
    for (let i = 0; i < 7; i++) {
      const cy = Math.round(H * (0.05 + i * 0.15) + rand() * H * 0.05);
      const half0 = Math.round(H * (0.09 + rand() * 0.07));
      const len = Math.round(inner * (0.6 + rand() * 0.9));
      for (let c = 0; c < len; c += step) {
        const t = c / len;
        const half = Math.max(step, Math.round(half0 * (1 - t * t) - rand() * 5));
        ctx.fillStyle = `rgba(${rgb},0.05)`;
        ctx.fillRect(side ? W - c - step : c, Math.round((cy - half) / step) * step, step, half * 2);
      }
    }
  }

  // Luna crescente vera: disco chiaro + morso di cielo
  function crescentMoon(ctx, x, y, r, color = '#c8b8c0', skyColor = '#0a0710') {
    ctx.fillStyle = color;
    for (let dy = -r; dy <= r; dy += 3) {
      const hw = Math.floor(Math.sqrt(r * r - dy * dy) / 3) * 3;
      ctx.fillRect(x - hw, y + dy, hw * 2, 3);
    }
    ctx.fillStyle = skyColor;
    const off = Math.round(r * 0.45);
    for (let dy = -r; dy <= r; dy += 3) {
      const hw = Math.floor(Math.sqrt(r * r - dy * dy) / 3) * 3;
      ctx.fillRect(x - hw - off, y + dy, hw * 2, 3);
    }
  }

  function crystalVein(ctx, x, y, n, rand) {
    for (let i = 0; i < n; i++) {
      const cx = x + (rand() - 0.5) * 34, cy = y + (rand() - 0.5) * 26;
      const s = 6 + Math.round(rand() * 5);
      glow(ctx, cx + s / 2, cy + s / 2, s + 16, s + 16, '90,216,224');   // tondo, come tutte le luci
      ctx.fillStyle = '#5ad8e0'; ctx.fillRect(cx, cy, s, s);
      ctx.fillStyle = '#a0f0f5'; ctx.fillRect(cx + 1, cy + 1, Math.max(2, s - 4), Math.max(2, s - 4));
    }
  }

  /* RITRATTO A OLIO — UNO grande, con figure che si leggono davvero.

     Prima ce n'erano quattro da 62×76 nella hall, sei in sala del Banchetto e
     quattro nel Riflesso, e dentro ognuno «i sorrisi» erano quattro fillRect
     da 8×12. A otto pixel di lato una persona non è una persona: è una
     barretta, e quattro barrette in fila sotto una cornice dorata leggono
     esattamente come una FINESTRA CON LA TAPPARELLA. Il testo chiede l'opposto
     — «gruppi di persone in vacanza, epoche diverse: costumi anni '20, basette
     anni '70, un gruppo con gli occhiali», e al Banchetto «vi guardano con
     l'espressione di chi vorrebbe gridare».
     Quindi: il dettaglio dei volti sta DENTRO un ritratto grande, dove il
     giocatore lo cerca (lezione 59), e le altre cornici non pretendono di
     mostrare facce che a quella larghezza non ci stanno — vedi frameEdgeOn. */
  const COSTUMES = [
    { dress: '#2a2630', hair: '#241a14', hat: '#1d1a22' },   // anni '20, cuffia da bagno
    { dress: '#7a2432', hair: '#c8a86a', sides: true },      // anni '70, basette
    { dress: '#d8d0c4', hair: '#3a2a20', shades: true },      // il '99, occhiali sui capelli
    { dress: '#3a5a4a', hair: '#8a6a3a' }
  ];

  function oilPortrait(ctx, x, y, w, h, o = {}) {
    const pool = o.pool || '#3d6890';
    const back = o.back || '#6a4a3a';
    const skin = o.skin || '#d8c8b8';
    const frame = o.frame || '#c8a032';
    const n = o.figures || 3;
    // cornice con smusso: oro, ombra, oro
    ctx.fillStyle = frame; ctx.fillRect(x, y, w, h);
    ctx.fillStyle = shade(frame, 0.55); ctx.fillRect(x + 4, y + 4, w - 8, h - 8);
    ctx.fillStyle = shade(frame, 1.18); ctx.fillRect(x + 4, y + 4, w - 8, 3);
    ctx.fillStyle = frame; ctx.fillRect(x + 7, y + 7, w - 14, h - 14);
    const ix = x + 10, iy = y + 10, iw = w - 20, ih = h - 20;
    // la tela: il muro della villa in alto, l'acqua della piscina in basso
    ctx.fillStyle = back; ctx.fillRect(ix, iy, iw, ih);
    const waterY = iy + Math.round(ih * 0.30);
    // il muro della villa dipinto in fondo: due finestre e la linea del tetto,
    // così la fascia alta non resta una banda di colore vuota
    ctx.fillStyle = shade(back, 0.72); ctx.fillRect(ix, iy, iw, Math.max(3, Math.round(ih * 0.05)));
    ctx.fillStyle = shade(back, 0.5);
    ctx.fillRect(ix + Math.round(iw * 0.16), iy + Math.round(ih * 0.11), Math.round(iw * 0.12), Math.round(ih * 0.13));
    ctx.fillRect(ix + Math.round(iw * 0.66), iy + Math.round(ih * 0.11), Math.round(iw * 0.12), Math.round(ih * 0.13));
    ctx.fillStyle = pool; ctx.fillRect(ix, waterY, iw, ih - (waterY - iy));
    ctx.fillStyle = shade(pool, 0.68); ctx.fillRect(ix, waterY, iw, 3);   // il bordo vasca
    ctx.fillStyle = shade(pool, 1.4);                                     // increspature
    for (let k = 0; k < 4; k++) ctx.fillRect(ix + 6 + (k % 2) * Math.round(iw * 0.34), waterY + 9 + k * 8, Math.round(iw * 0.3), 2);
    /* le figure: mezzo busto TAGLIATO dal bordo inferiore, come in un ritratto
       vero, e la testa larga più di venti pixel — che è la misura sotto la
       quale una faccia torna a essere una macchia. */
    const step = iw / (n + 0.35);
    const hr = Math.max(9, Math.round(iw * 0.068));         // mezza larghezza della testa
    const bw = Math.round(hr * 3.1);
    for (let i = 0; i < n; i++) {
      const cx = Math.round(ix + step * (i + 0.55));
      const c = COSTUMES[(i + (o.epoca || 0)) % COSTUMES.length];  // epoca: cambia i costumi, così due ritratti non sono due copie
      const topY = iy + Math.round(ih * 0.34) + (i % 2 ? 5 : 0);   // teste non allineate
      const shY = topY + hr * 2 + 5;
      const bh = ih - (shY - iy);                                  // arriva al bordo: mezzo busto
      ctx.fillStyle = shade(skin, 0.82);                           // le braccia, dietro il busto
      ctx.fillRect(cx - bw / 2 - 5, shY + 7, 6, Math.round(bh * 0.55));
      ctx.fillRect(cx + bw / 2 - 1, shY + 7, 6, Math.round(bh * 0.55));
      ctx.fillStyle = c.dress; ctx.fillRect(cx - bw / 2, shY, bw, bh);
      ctx.fillStyle = shade(c.dress, 1.22); ctx.fillRect(cx - bw / 2, shY, bw, 3);
      ctx.fillStyle = shade(c.dress, 0.7);                         // scollatura
      ctx.fillRect(cx - 7, shY, 15, Math.round(bh * 0.16));
      ctx.fillStyle = skin;
      ctx.fillRect(cx - 4, shY - 6, 9, 7);                         // collo
      ctx.fillRect(cx - hr, topY, hr * 2, hr * 2 + 3);             // testa
      ctx.fillStyle = c.hair; ctx.fillRect(cx - hr, topY, hr * 2, Math.max(4, Math.round(hr * 0.66)));
      if (c.sides) { ctx.fillRect(cx - hr, topY + hr - 2, 3, hr); ctx.fillRect(cx + hr - 3, topY + hr - 2, 3, hr); }
      if (c.hat) { ctx.fillStyle = c.hat; ctx.fillRect(cx - hr - 2, topY - 4, hr * 2 + 4, 6); }
      if (c.shades) { ctx.fillStyle = '#2a2630'; ctx.fillRect(cx - hr - 1, topY - 1, hr * 2 + 2, 4); }
      ctx.fillStyle = '#1a1218';                                   // gli occhi
      ctx.fillRect(cx - hr + 3, topY + hr, 3, 3); ctx.fillRect(cx + hr - 6, topY + hr, 3, 3);
      ctx.fillStyle = shade(skin, 0.48);                           // il sorriso: una riga, non un blocco
      ctx.fillRect(cx - 4, topY + Math.round(hr * 1.55), 9, 2);
    }
  }

  /* Cornice di scorcio: le altre cornici della parete. Non ci si prova a
     mettere i volti — a quaranta pixel di larghezza non ci sta una faccia, e
     provarci è come si è arrivati alle tapparelle (lezione 60: si toglie). */
  function frameEdgeOn(ctx, x, y, w, h, tint) {
    ctx.fillStyle = '#c8a032'; ctx.fillRect(x, y, w, h);
    ctx.fillStyle = '#8a6a1d'; ctx.fillRect(x + 3, y + 3, w - 6, h - 6);
    ctx.fillStyle = tint || '#241a20'; ctx.fillRect(x + 5, y + 5, w - 10, h - 10);
    // un solo lampo obliquo sul vetro: con più righe orizzontali tornava a
    // sembrare una tapparella, che è il difetto da cui siamo partiti
    ctx.fillStyle = 'rgba(232,224,208,.10)';
    for (let i = 0; i < Math.round(h * 0.4); i += 3) ctx.fillRect(x + 5 + Math.round(i * 0.5), y + 8 + i, Math.max(3, w - 12 - Math.round(i * 0.5)), 3);
    ctx.fillStyle = '#e8d8a0'; ctx.fillRect(x + w - 4, y, 3, h);
  }

  function heroesRow(ctx, W, groundY, partySpriteKeys, scale = 4) {
    const n = partySpriteKeys.length;
    const totalW = n * 20 * scale;
    let x = Math.floor(W / 2 - totalW / 2);
    for (const key of partySpriteKeys) {
      const def = Sprites.registry[key];
      if (def) Sprites.drawSprite(ctx, def.map, def.palette, x, groundY - 16 * scale, scale);
      x += 20 * scale;
    }
  }

  /* ------------- PITTORI DI LOCATION ------------- */

  const painters = {

    titolo(ctx, W, H) {
      const r = rng(42);
      skyGradient(ctx, W, H, '#0d0508', '#2a0f16', 10);
      stars(ctx, W, H, r, 40);
      // luna piena, enorme, rossa: la luna SBAGLIATA
      moon(ctx, W * 0.72, H * 0.26, 44, '#8a2432', false);
      ctx.fillStyle = 'rgba(138,36,50,.14)'; ctx.fillRect(0, 0, W, H);
      const g = H * 0.84;
      hills(ctx, W, g, 60, '#120a0e', r, 36);
      // la villa in silhouette sul crinale
      blocks(ctx, W * 0.30, g - 96, W * 0.40, 96, '#241009', 8, r, 0.1);
      // ali laterali
      blocks(ctx, W * 0.24, g - 64, W * 0.10, 64, '#150c10', 8, r, 0.1);
      blocks(ctx, W * 0.66, g - 64, W * 0.10, 64, '#150c10', 8, r, 0.1);
      // tetto a padiglione
      for (let i = 0; i < 5; i++) {
        const rw = W * 0.44 - i * W * 0.04;
        blocks(ctx, W * 0.28 + (W * 0.44 - rw) / 2, g - 96 - 10 - i * 9, rw, 10, '#0f0a0c', 8, r, 0.1);
      }
      // torretta liberty
      blocks(ctx, W * 0.46, g - 150, W * 0.08, 60, '#2a1610', 8, r, 0.1);
      for (let i = 0; i < 4; i++) blocks(ctx, W * 0.455 + i * 4, g - 150 - 8 - i * 8, W * 0.09 - i * 8, 9, '#0f0a0c', 6, r, 0.1);
      // finestre accese color miele: TUTTE, e una alla volta ti accorgi che ti guardano
      ctx.fillStyle = '#e8b64c';
      for (let i = 0; i < 5; i++) ctx.fillRect(W * 0.33 + i * W * 0.07, g - 74, 10, 14);
      for (let i = 0; i < 4; i++) ctx.fillRect(W * 0.36 + i * W * 0.07, g - 44, 10, 14);
      ctx.fillRect(W * 0.475, g - 132, 10, 12);
      // il viale e il cancello
      blocks(ctx, 0, g, W, H - g, '#160d10', 10, r, 0.18);
      blocks(ctx, W * 0.46, g + 6, W * 0.08, H - g - 6, '#3a3038', 8, r, 0.14);
      ctx.fillStyle = '#0d070a';
      for (let i = 0; i < 6; i++) ctx.fillRect(W * 0.40 + i * W * 0.035, g + 14, 4, H - g - 18);
      ctx.fillRect(W * 0.395, g + 12, W * 0.21, 5);
      // i cinque sul viale, a sinistra del cancello (sfondo uniforme alle loro spalle)
      if (typeof Sprites !== 'undefined' && Sprites.registry) {
        ctx.save(); ctx.translate(-W * 0.21, 0);
        heroesRow(ctx, W, H - 4, ['gaetano', 'claudia', 'natalino', 'emanuela', 'federico'], 2);
        ctx.restore();
      }
      // nebbia bassa
      ctx.fillStyle = 'rgba(180,170,180,.08)';
      for (let i = 0; i < 8; i++) ctx.fillRect(r() * W, g - 8 + r() * 20, 80 + r() * 120, 6);
    },

    tornanti(ctx, W, H) {
      const r = rng(7);
      skyGradient(ctx, W, H, '#1a0f1d', '#4a2030', 10);
      stars(ctx, W, H, r, 26);
      moon(ctx, W * 0.84, 60, 22, '#c8b8c0', true);
      // profilo dei monti su più piani
      hills(ctx, W, H * 0.44, 70, '#1d1218', r, 40);
      hills(ctx, W, H * 0.62, 90, '#150d12', r, 34);
      const g = H - 60;
      hills(ctx, W, g + 8, 70, '#10090d', r, 30);
      ground(ctx, W, H, g, '#182018', r, 12, 10);
      // la strada che serpeggia a tornanti (dietro gli alberi del bordo)
      for (let i = 0; i < 4; i++) {
        const y = H * 0.52 + i * H * 0.115;
        blocks(ctx, W * (0.06 + (i % 2) * 0.16), y, W * 0.72, 15, '#332e3a', 12, r, 0.16);
        // la curva del tornante che raccorda le corsie
        const cx = (i % 2) ? W * 0.06 : W * 0.78;
        blocks(ctx, cx, y, W * 0.16, H * 0.115 + 14, '#332e3a', 12, r, 0.16);
        // linea di mezzeria sbiadita
        ctx.fillStyle = 'rgba(200,190,170,.16)';
        for (let d = 0; d < 8; d++) ctx.fillRect(W * (0.10 + (i % 2) * 0.16) + d * W * 0.085, y + 6, 16, 3);
      }
      // vigneto in pendenza sotto la strada (Aglianico, dicono i cartelli)
      vineyard(ctx, W * 0.55, H * 0.47, W * 0.4, 3, r, true);
      // castagni e ULIVI lungo la strada: siamo in Irpinia
      for (let i = 0; i < 3; i++) tree(ctx, 30 + i * (W / 2.6) + (r() * 30 - 15), g + 10, 66 + r() * 40, '#14201a', '#241a14', r);
      for (let i = 0; i < 3; i++) olive(ctx, 120 + i * (W / 2.8) + (r() * 24 - 12), g + 8, 46 + r() * 18, r, true);
      // il guardrail e la macchina piena come un uovo
      ctx.fillStyle = '#5a5a66'; ctx.fillRect(W * 0.08, H * 0.755, W * 0.7, 4);
      const cx = W * 0.34, cy = H * 0.652;
      ctx.fillStyle = '#7a2432'; ctx.fillRect(cx, cy, 74, 22);
      ctx.fillStyle = '#5a1a26'; ctx.fillRect(cx + 8, cy - 12, 52, 14);
      ctx.fillStyle = '#8ab8d0'; ctx.fillRect(cx + 12, cy - 9, 18, 9); ctx.fillRect(cx + 36, cy - 9, 18, 9);
      ctx.fillStyle = '#1a1a22'; ctx.fillRect(cx + 8, cy + 18, 14, 12); ctx.fillRect(cx + 52, cy + 18, 14, 12);
      ctx.fillStyle = '#e8e4c8'; ctx.fillRect(cx + 70, cy + 6, 6, 5);
      // valigie sul tetto
      ctx.fillStyle = '#8a5a35'; ctx.fillRect(cx + 14, cy - 20, 16, 8);
      ctx.fillStyle = '#4a5238'; ctx.fillRect(cx + 34, cy - 19, 14, 7);
      // Paternopoli in basso: persiane tutte chiuse
      for (let i = 0; i < 5; i++) {
        const px = W * 0.62 + (i % 3) * 30, py = H - 78 + Math.floor(i / 3) * 16;
        blocks(ctx, px, py, 24, 14, '#2a2228', 6, r, 0.12);
        ctx.fillStyle = '#1a1418'; ctx.fillRect(px + 4, py + 3, 5, 7); ctx.fillRect(px + 14, py + 3, 5, 7);
      }
    },

    tornantiPiedi(ctx, W, H) {
      // i tornanti di notte, A PIEDI: niente macchina, la luna rossa,
      // e tre tornanti più in basso... cinque lucine in fila che siete voi
      const r = rng(29);
      skyGradient(ctx, W, H, '#140a14', '#3a1420', 10);
      stars(ctx, W, H, r, 22);
      moon(ctx, W * 0.84, 60, 22, '#b04038', false); // la luna rossa dell'eclissi
      glow(ctx, W * 0.84, 60, 60, 40, '176,64,56');
      hills(ctx, W, H * 0.44, 70, '#1a0f14', r, 40);
      hills(ctx, W, H * 0.62, 90, '#120a0f', r, 34);
      const g = H - 60;
      hills(ctx, W, g + 8, 70, '#0d070a', r, 30);
      ground(ctx, W, H, g, '#141a14', r, 12, 10);
      // le corsie che scendono verso il fondovalle: più lontane, più sottili
      for (let i = 0; i < 3; i++) {
        const y = H * 0.50 + i * H * 0.075;
        blocks(ctx, W * (0.06 + (i % 2) * 0.16), y, W * 0.72, 10, '#2a2630', 10, r, 0.16);
        const cx = (i % 2) ? W * 0.06 : W * 0.78;
        blocks(ctx, cx, y, W * 0.16, H * 0.075 + 10, '#2a2630', 10, r, 0.16);
        ctx.fillStyle = 'rgba(200,190,170,.10)';
        for (let d = 0; d < 8; d++) ctx.fillRect(W * (0.10 + (i % 2) * 0.16) + d * W * 0.085, y + 4, 14, 2);
      }
      vineyard(ctx, W * 0.55, H * 0.44, W * 0.4, 3, r, true);
      // in fondo alla valle, dove dovrebbe esserci il paese: la facciata del
      // Belvedere in scala, e sta LONTANO, quindi sta piccola e vicina all'orizzonte
      const bx = W * 0.62, by = H * 0.70;
      blocks(ctx, bx, by, 42, 21, '#5a2c24', 6, r, 0.10);
      ctx.fillStyle = '#e8d8a0'; ctx.fillRect(bx + 6, by + 5, 7, 7); ctx.fillRect(bx + 29, by + 5, 7, 7);
      ctx.fillStyle = '#1a1014'; ctx.fillRect(bx + 18, by + 10, 7, 11);
      glow(ctx, bx + 9, by + 8, 14, 10, '232,216,160'); glow(ctx, bx + 32, by + 8, 14, 10, '232,216,160');
      for (let i = 0; i < 3; i++) tree(ctx, 30 + i * (W / 2.6) + (r() * 30 - 15), g + 10, 66 + r() * 40, '#101a14', '#1f1610', r);
      for (let i = 0; i < 3; i++) olive(ctx, 120 + i * (W / 2.8) + (r() * 24 - 12), g + 8, 46 + r() * 18, r, true);

      /* IL SOGGETTO: il tratto di tornante TRE CURVE PIÙ IN BASSO, e le cinque
         figure in fila indiana che scendono. ft2_capito e ft2_foto_luci girano
         tutte intorno al riconoscere cinque persone di spalle: prima erano
         cinque puntini da 3 px distanti 20, con gli aloni sovrapposti in
         un'unica macchia dentro un riquadro bruno — leggeva come la vetrina di
         un capannone, non come gente. Adesso quel tratto di strada è largo e
         basso nell'inquadratura, le figure stanno a 60 px l'una dall'altra e
         ognuna ha il suo cono di luce puntato in giù, dove lo punterebbe uno
         che cerca dove mettere i piedi. */
      const rx0 = W * 0.06, rw0 = W * 0.88, ry0 = H * 0.775;         // 279
      ctx.fillStyle = '#3a3644'; ctx.fillRect(rx0 - 4, ry0 - 5, rw0 + 8, 4);       // il guardrail a monte del tratto
      blocks(ctx, rx0, ry0, rw0, 36, '#2f2b36', 12, r, 0.13);                      // l'asfalto
      ctx.fillStyle = 'rgba(200,190,170,.13)';                                     // la mezzeria
      for (let d = 0; d < 14; d++) ctx.fillRect(rx0 + 14 + d * (rw0 / 14), ry0 + 17, 22, 3);
      for (let i = 0; i < 5; i++) {
        const fx = Math.round(W * 0.18 + i * 62), fb = Math.round(ry0 + 23 + i * 4);
        // il cono di luce: si allarga verso il basso, non è un alone tondo
        ctx.fillStyle = 'rgba(240,224,160,.085)';
        for (let k = 0; k < 9; k++) ctx.fillRect(fx + 4 - k, fb - 12 + k * 2, 5 + k * 3, 2);
        ctx.fillStyle = '#181420';                                                 // gambe
        ctx.fillRect(fx - 3, fb - 6, 3, 6); ctx.fillRect(fx + 1, fb - 6, 3, 6);
        ctx.fillRect(fx - 5, fb - 13, 10, 8);                                      // busto e spalle
        ctx.fillRect(fx - 2, fb - 19, 6, 5);                                       // testa, staccata di un pixel dal collo
        ctx.fillStyle = '#463c50'; ctx.fillRect(fx - 5, fb - 13, 10, 1);           // il filo di luce sulle spalle
        ctx.fillStyle = '#181420'; ctx.fillRect(fx - 1, fb - 14, 4, 1);            // il collo
        ctx.fillStyle = '#241d2c'; ctx.fillRect(fx + 4, fb - 12, 3, 5);            // il braccio che tiene il telefono
        ctx.fillStyle = '#f0e0a0'; ctx.fillRect(fx + 5, fb - 11, 3, 3);            // la torcia
      }
      // e il guardrail SOTTO I VOSTRI PIEDI: è da qui che state guardando giù
      blocks(ctx, 0, H - 26, W, 26, '#232028', 12, r, 0.12);
      ctx.fillStyle = '#4a4a55'; ctx.fillRect(0, H - 34, W, 5);
      ctx.fillStyle = '#33333c';
      for (let d = 0; d < 12; d++) ctx.fillRect(d * (W / 12) + 20, H - 30, 6, 14);
    },

    relais(ctx, W, H) {
      const r = rng(11);
      skyGradient(ctx, W, H, '#120a12', '#331522', 10);
      stars(ctx, W, H, r, 34);
      moon(ctx, W * 0.10, 58, 24, '#c8b8c0', true);
      const g = H - 70;
      hills(ctx, W, g - 40, 46, '#150d12', r, 34);
      // la villa gemella color ocra, più indietro a sinistra
      const twx = W * 0.06, tww = W * 0.17, twh = 92;
      blocks(ctx, twx, g - 24 - twh, tww, twh, '#7a5c26', 8, r, 0.1);
      for (let i = 0; i < 4; i++) {
        const rw = (tww + 16) * (1 - i / 5);
        blocks(ctx, twx - 8 + ((tww + 16) - rw) / 2, g - 24 - twh - 6 - i * 7, rw, 8, '#6e3a28', 7, r, 0.12);
      }
      ctx.fillStyle = '#e8b64c';
      ctx.fillRect(twx + 12, g - 24 - twh + 22, 10, 14); ctx.fillRect(twx + tww - 24, g - 24 - twh + 22, 10, 14);
      // camino-torretta della gemella (come nella foto)
      blocks(ctx, twx + tww * 0.6, g - 24 - twh - 34, 16, 34, '#6e5226', 6, r, 0.1);
      blocks(ctx, twx + tww * 0.58, g - 24 - twh - 42, 22, 9, '#5a3020', 6, r, 0.1);
      // LA VILLA: terracotta con cornicioni chiari
      const vx = W * 0.30, vw = W * 0.52, vh = 150;
      blocks(ctx, vx, g - vh, vw, vh, '#8a4038', 10, r, 0.1);
      /* TRE fasce, non due: piano terra, primo piano, secondo piano. Serve
         perché il gioco chiede di CONTARE e di guardare una finestra precisa —
         a2_siepi_b conta sei finestre al primo piano e nomina la sesta in
         fondo a destra, a7_persiane nomina la terza persiana da sinistra al
         secondo piano. Con due file da quattro finestre identiche il quadro
         non dava al giocatore niente da contare né da riconoscere. */
      const p2y = g - vh + 8, p1y = g - vh + 62, terraY = g - 32;   // secondo piano, primo piano, terra
      blocks(ctx, vx - 6, p1y - 8, vw + 12, 8, '#d8ccb8', 8, r, 0.05);       // marcapiano fra i due piani
      blocks(ctx, vx - 6, terraY - 8, vw + 12, 8, '#d8ccb8', 8, r, 0.05);    // marcapiano sul piano terra
      blocks(ctx, vx - 6, g - vh - 4, vw + 12, 7, '#d8ccb8', 8, r, 0.05);    // cornicione
      // tetto a coppi
      for (let i = 0; i < 5; i++) {
        const rw = (vw + 28) * (1 - i / 6);
        blocks(ctx, vx - 14 + ((vw + 28) - rw) / 2, g - vh - 12 - i * 9, rw, 10, '#6e3a28', 8, r, 0.16);
      }
      ctx.fillStyle = '#8a8478'; ctx.fillRect(vx + vw * 0.72, g - vh - 52, 3, 40); // l'antenna, dettaglio vero
      ctx.fillRect(vx + vw * 0.70, g - vh - 50, 9, 2);
      // il passo delle sei campate: lo usano entrambi i piani, così le finestre
      // di sopra stanno sopra quelle di sotto, come su una facciata vera
      const campata = fx => vx + 24 + fx * (vw - 78) / 5;
      /* SECONDO PIANO — tutte le persiane chiuse. Tutte tranne la TERZA DA
         SINISTRA, socchiusa su un nero più profondo del nero del cielo:
         a7_persiane fa confrontare una fotografia con quello che si vede. */
      /* E le persiane stanno nel BUIO: dietro non c'è nessuna luce, quindi il
         loro tono è quello del legno chiaro visto di notte, non quello del
         legno chiaro visto di giorno. Alla prima stesura erano #b8b2a4 —
         più chiare delle finestre accese di sotto — e l'occhio andava sulla
         fila spenta invece che su quella illuminata: si contavano le persiane
         e non le sei finestre che il testo fa contare. */
      for (let fx = 0; fx < 6; fx++) {
        const wx = campata(fx);
        ctx.fillStyle = '#3e3a32'; ctx.fillRect(wx - 4, p2y - 3, 27, 3);            // architrave
        ctx.fillStyle = '#6a6558'; ctx.fillRect(wx - 2, p2y, 23, 40);               // le due ante, chiuse
        ctx.fillStyle = '#565244';
        for (let d = 0; d < 8; d++) ctx.fillRect(wx - 1, p2y + 3 + d * 5, 21, 2);   // le doghe
        ctx.fillStyle = '#454135'; ctx.fillRect(wx + 9, p2y, 2, 40);                // la battuta centrale
        if (fx === 2) {
          ctx.fillStyle = '#050308'; ctx.fillRect(wx + 9, p2y + 1, 12, 38);         // il vano, e dentro NIENTE luce
          // l'anta aperta a metà è l'unica cosa illuminata del piano: la
          // prende la luna, di scorcio, ed è per questo che si nota
          ctx.fillStyle = '#a8a294'; ctx.fillRect(wx + 20, p2y, 6, 40);
          ctx.fillStyle = '#8a8578';
          for (let d = 0; d < 8; d++) ctx.fillRect(wx + 21, p2y + 3 + d * 5, 4, 2);
        }
      }
      /* PRIMO PIANO — SEI finestre, tutte illuminate. Cinque con le tende
         bianche; la SESTA, in fondo a destra, ha la tenda scura scostata da
         dentro, e nello spiraglio di luce c'è una sagoma. */
      for (let fx = 0; fx < 6; fx++) {
        const wx = campata(fx), wy = p1y;
        ctx.fillStyle = '#c8c2b4'; ctx.fillRect(wx - 11, wy, 9, 40); ctx.fillRect(wx + 21, wy, 9, 40);
        ctx.fillStyle = '#a8a294';
        for (let d = 0; d < 8; d++) { ctx.fillRect(wx - 10, wy + 3 + d * 5, 7, 2); ctx.fillRect(wx + 22, wy + 3 + d * 5, 7, 2); }
        glow(ctx, wx + 10, wy + 20, 30, 44, '232,182,76');
        ctx.fillStyle = '#e8b64c'; ctx.fillRect(wx, wy, 20, 40);                    // il vetro illuminato
        if (fx < 5) {
          // tende bianche, ma scaldate dalla luce che le attraversa, e strette
          // quanto basta perché il miele del vetro si veda ai lati: erano
          // larghe fino al bordo e la finestra non sembrava accesa
          ctx.fillStyle = '#f0dcae'; ctx.fillRect(wx + 2, wy + 2, 6, 36); ctx.fillRect(wx + 13, wy + 2, 6, 36);
          ctx.fillStyle = '#d4b878'; ctx.fillRect(wx + 2, wy + 2, 2, 36); ctx.fillRect(wx + 13, wy + 2, 2, 36); // la piega
          ctx.fillStyle = '#8a6a2d'; ctx.fillRect(wx + 9, wy, 2, 40);               // il montante
        } else {
          ctx.fillStyle = '#241c28';                                                // la tenda SCURA
          ctx.fillRect(wx, wy, 12, 40); ctx.fillRect(wx + 12, wy, 2, 22);           // il bordo, appena mosso
          ctx.fillStyle = '#120e16';                                                // e nello spiraglio, qualcuno
          ctx.fillRect(wx + 13, wy + 11, 5, 8); ctx.fillRect(wx + 12, wy + 20, 7, 14);
        }
      }
      // PIANO TERRA: l'ingresso sotto la pensilina liberty, e nient'altro
      ctx.fillStyle = '#d8ccb8'; ctx.fillRect(vx + vw / 2 - 26, terraY + 2, 52, 6);
      ctx.fillStyle = '#3a3440'; ctx.fillRect(vx + vw / 2 - 24, terraY + 8, 4, 24); ctx.fillRect(vx + vw / 2 + 20, terraY + 8, 4, 24);
      ctx.fillStyle = '#241a1e'; ctx.fillRect(vx + vw / 2 - 11, terraY + 2, 22, 30); // il portone a due battenti
      ctx.fillStyle = '#1a1216'; ctx.fillRect(vx + vw / 2, terraY + 2, 2, 30);
      ctx.fillStyle = '#c8a032'; ctx.fillRect(vx + vw / 2 + 4, terraY + 18, 3, 3);   // la maniglia
      // muro di cinta BIANCO (come nella foto), con la nebbia che preme oltre
      blocks(ctx, 0, g - 30, W * 0.055, 34, '#b0a89a', 8, r, 0.08);
      blocks(ctx, W * 0.87, g - 30, W * 0.13, 34, '#b0a89a', 8, r, 0.08);
      ctx.fillStyle = 'rgba(190,180,195,.14)';
      for (let i = 0; i < 6; i++) { ctx.fillRect(0, g - 44 - i * 5, W * 0.05, 5); ctx.fillRect(W * 0.875, g - 44 - i * 5, W * 0.125, 5); }
      // viale di ghiaia in prospettiva
      ground(ctx, W, H, g, '#1d1418', r, 12, 8);
      for (let i = 0; i < 7; i++) {
        const t = i / 7;
        const vw2 = W * (0.14 + t * 0.30);
        blocks(ctx, W * 0.5 - vw2 / 2, g + 4 + i * ((H - g - 6) / 7), vw2, (H - g) / 7 + 2, '#b8ac96', 10, r, 0.07);
      }
      ctx.fillStyle = 'rgba(90,80,70,.35)';
      for (let i = 0; i < 6; i++) {
        const t = i / 6;
        const vw2 = W * (0.15 + t * 0.28);
        ctx.fillRect(W * 0.5 - vw2 / 2, g + 10 + i * ((H - g - 10) / 6), vw2, 2);
      }
      // lampioncini a globo lungo il viale
      globeLamp(ctx, W * 0.34, g + 26, 34);
      globeLamp(ctx, W * 0.66, g + 26, 34);
      // ulivi e siepi coi buchi-occhi
      olive(ctx, W * 0.135, g + 2, 52, r, true);
      olive(ctx, W * 0.91, g + 4, 44, r, true);
      for (const [bx, bw] of [[0.17, 0.08], [0.845, 0.05]]) {
        blocks(ctx, W * bx, g - 34, W * bw, 38, '#1a2e1d', 8, r, 0.2);
        ctx.fillStyle = '#0a0f0a';
        ctx.fillRect(W * bx + 12, g - 26, 5, 5); ctx.fillRect(W * bx + 24, g - 26, 5, 5);
      }
    },

    hall(ctx, W, H) {
      const r = rng(19);
      blocks(ctx, 0, 0, W, H, '#2a2026', 16, r, 0.12);
      const floorY = H - 84;
      // pavimento a scacchi in prospettiva (file dal fondo, senza sovrapposizioni)
      let rowY = floorY;
      for (let row = 0; row < 5; row++) {
        const size = 16 + row * 7;
        for (let col = -12; col < 12; col++) {
          const x = W / 2 + col * size;
          ctx.fillStyle = ((col + row) % 2 === 0) ? '#d8d0c4' : '#1d181c';
          ctx.fillRect(x, rowY, size, size * 0.62);
        }
        rowY += size * 0.62;
      }
      // lampadario di cristallo
      ctx.fillStyle = '#8a8478'; ctx.fillRect(W * 0.5 - 2, 0, 4, 26);
      glow(ctx, W * 0.5, 52, 60, 34, '232,182,76');
      ctx.fillStyle = '#c8bca8'; ctx.fillRect(W * 0.5 - 34, 26, 68, 8);
      for (const dx of [-34, -20, -6, 8, 22, 28]) {
        ctx.fillStyle = '#e8e0d0'; ctx.fillRect(W * 0.5 + dx, 34, 5, 10);
        ctx.fillStyle = '#e8b64c'; ctx.fillRect(W * 0.5 + dx - 1, 44, 7, 7);
      }
      // IL RITRATTO A OLIO: uno grande, dove le facce si vedono per davvero.
      // È quello che a3 descrive ed è quello che z1 fa staccare dalla parete.
      oilPortrait(ctx, 66, 34, 206, 216, { figures: 3, pool: '#3d6890', back: '#6a4a3a' });
      // le altre cornici lungo la parete: di scorcio, senza volti
      frameEdgeOn(ctx, 636, 62, 42, 124);
      frameEdgeOn(ctx, 722, 70, 36, 110);
      frameEdgeOn(ctx, 800, 78, 30, 96);
      // il bancone della reception
      blocks(ctx, W * 0.36, floorY - 60, W * 0.28, 60, '#4a3226', 10, r, 0.1);
      blocks(ctx, W * 0.35, floorY - 68, W * 0.30, 10, '#5d4030', 10, r, 0.08);
      // registro aperto + campanello
      ctx.fillStyle = '#e8e0d0'; ctx.fillRect(W * 0.42, floorY - 78, 34, 12);
      ctx.fillStyle = '#8a8478'; ctx.fillRect(W * 0.585 - 6, floorY - 76, 12, 6);
      ctx.fillStyle = '#c8a032'; ctx.fillRect(W * 0.585 - 4, floorY - 80, 8, 5);
      // scalone sullo sfondo
      for (let i = 0; i < 6; i++) blocks(ctx, W * 0.72 + i * 8, floorY - 16 - i * 14, W * 0.20 - i * 12, 12, '#3a2c30', 8, r, 0.1);
      ctx.fillStyle = '#7a2432'; // passatoia
      for (let i = 0; i < 6; i++) ctx.fillRect(W * 0.76 + i * 8, floorY - 14 - i * 14, W * 0.10 - i * 8, 9);
    },

    corridoio(ctx, W, H) {
      const r = rng(23);
      blocks(ctx, 0, 0, W, H, '#241a1e', 16, r, 0.12);
      const floorY = H - 66;
      // tappeto rosso che beve i passi
      blocks(ctx, 0, floorY, W, H - floorY, '#20161a', 12, r, 0.12);
      blocks(ctx, W * 0.14, floorY + 8, W * 0.72, H - floorY - 12, '#5a1a26', 10, r, 0.14);
      ctx.fillStyle = '#c8a032';
      ctx.fillRect(W * 0.14, floorY + 8, W * 0.72, 3); ctx.fillRect(W * 0.14, H - 7, W * 0.72, 3);
      // porte con specchiature
      for (const fx of [0.08, 0.30, 0.52, 0.74]) {
        ctx.fillStyle = '#3a2620'; ctx.fillRect(W * fx, floorY - 118, 66, 118);
        ctx.fillStyle = '#2a1a16'; ctx.fillRect(W * fx + 8, floorY - 108, 50, 44);
        ctx.fillRect(W * fx + 8, floorY - 56, 50, 44);
        ctx.fillStyle = '#c8a032'; ctx.fillRect(W * fx + 54, floorY - 64, 6, 6);
        // numero d'ottone
        ctx.fillRect(W * fx + 26, floorY - 128, 14, 6);
      }
      // lampade a muro che si accendono al passaggio
      for (const fx of [0.20, 0.42, 0.64, 0.86]) {
        glow(ctx, W * fx + 4, H * 0.32, 22, 22, '232,182,76');
        ctx.fillStyle = '#8a8478'; ctx.fillRect(W * fx, H * 0.34, 9, 12);
        ctx.fillStyle = '#e8b64c'; ctx.fillRect(W * fx + 1, H * 0.30, 7, 9);
      }
      // in fondo, la porta verde socchiusa su gradini che scendono
      ctx.fillStyle = '#243828'; ctx.fillRect(W * 0.90, floorY - 112, 54, 112);
      ctx.fillStyle = '#182818'; ctx.fillRect(W * 0.905, floorY - 104, 20, 104);
      ctx.fillStyle = '#c8bca8'; ctx.fillRect(W * 0.955, floorY - 66, 5, 8);
      ctx.fillStyle = '#0d0a0c'; ctx.fillRect(W * 0.905, floorY - 104, 12, 104);
    },

    camera(ctx, W, H) {
      const r = rng(31);
      blocks(ctx, 0, 0, W, H, '#2a2026', 16, r, 0.1);
      const floorY = H - 70;
      blocks(ctx, 0, floorY, W, H - floorY, '#3a2c26', 12, r, 0.12);
      // carta da parati a righe d'epoca
      ctx.fillStyle = 'rgba(200,160,120,.06)';
      for (let x = 0; x < W; x += 26) ctx.fillRect(x, 0, 9, floorY);
      // finestra sulla notte (e sul pozzo, laggiù)
      ctx.fillStyle = '#3a2620'; ctx.fillRect(W * 0.64, 36, 120, 100);
      ctx.fillStyle = '#100a14'; ctx.fillRect(W * 0.64 + 8, 44, 104, 84);
      ctx.fillStyle = '#c8b8c0'; ctx.fillRect(W * 0.64 + 78, 54, 12, 12);
      // il pozzo, piccolo, in giardino
      ctx.fillStyle = '#2e2a35'; ctx.fillRect(W * 0.64 + 30, 100, 18, 14);
      ctx.fillStyle = '#4a3226'; ctx.fillRect(W * 0.64 + 33, 92, 12, 6);
      ctx.fillStyle = '#3a2620'; ctx.fillRect(W * 0.64 + 60, 44, 4, 84);
      // letto con testiera e lini freschi
      blocks(ctx, W * 0.085, floorY - 92, W * 0.025, 92, '#4a3226', 8, r, 0.1);   // testiera
      blocks(ctx, W * 0.085, floorY - 96, W * 0.24, 10, '#5a4030', 8, r, 0.08);
      blocks(ctx, W * 0.10, floorY - 40, W * 0.24, 40, '#5a4030', 8, r, 0.1);     // struttura
      blocks(ctx, W * 0.10, floorY - 56, W * 0.24, 20, '#e8e0d0', 8, r, 0.05);    // coperta
      blocks(ctx, W * 0.10, floorY - 48, W * 0.24, 6, '#c8b8a8', 8, r, 0.06);     // risvolto
      blocks(ctx, W * 0.11, floorY - 66, W * 0.07, 12, '#f0ece4', 6, r, 0.04);    // cuscino
      // il cioccolatino e il biglietto sul cuscino
      ctx.fillStyle = '#4a2a1d'; ctx.fillRect(W * 0.135, floorY - 63, 6, 4);
      ctx.fillStyle = '#e8e4dc'; ctx.fillRect(W * 0.23, floorY - 62, 13, 8);
      ctx.fillStyle = '#8a5a48'; ctx.fillRect(W * 0.235, floorY - 60, 9, 1);
      // comodino con candela
      blocks(ctx, W * 0.47, floorY - 34, 34, 34, '#4a3226', 8, r, 0.1);
      glow(ctx, W * 0.485 + 5, floorY - 48, 18, 16, '232,182,76');
      ctx.fillStyle = '#e8e0d0'; ctx.fillRect(W * 0.485, floorY - 46, 7, 12);
      ctx.fillStyle = '#e8b64c'; ctx.fillRect(W * 0.485 + 1, floorY - 52, 5, 6);
      // armadio
      blocks(ctx, W * 0.86, floorY - 120, W * 0.10, 120, '#3a2620', 8, r, 0.1);
      ctx.fillStyle = '#2a1a16'; ctx.fillRect(W * 0.865, floorY - 112, W * 0.04, 104);
      ctx.fillStyle = '#c8a032'; ctx.fillRect(W * 0.905, floorY - 70, 4, 6);
    },

    salaDaPranzo(ctx, W, H) {
      const r = rng(37);
      blocks(ctx, 0, 0, W, H, '#241a1e', 16, r, 0.12);
      const floorY = H - 76;
      blocks(ctx, 0, floorY, W, H - floorY, '#33241d', 12, r, 0.12);
      // portefinestre sulla piscina turchese
      for (const fx of [0.70, 0.86]) {
        ctx.fillStyle = '#3a2620'; ctx.fillRect(W * fx, 30, 86, floorY - 40);
        ctx.fillStyle = '#0d1420'; ctx.fillRect(W * fx + 6, 38, 74, floorY - 56);
        ctx.fillStyle = 'rgba(61,138,160,.14)'; ctx.fillRect(W * fx + 6, floorY - 84, 74, 60);
        ctx.fillStyle = '#2a7a8a'; ctx.fillRect(W * fx + 10, floorY - 60, 66, 36);
        ctx.fillStyle = 'rgba(120,220,235,.25)'; ctx.fillRect(W * fx + 14, floorY - 56, 26, 4);
        ctx.fillStyle = 'rgba(200,240,255,.25)';
        for (let i = 0; i < 4; i++) ctx.fillRect(W * fx + 14 + r() * 50, floorY - 54 + r() * 24, 12, 2);
        ctx.fillStyle = '#3a2620'; ctx.fillRect(W * fx + 41, 38, 4, floorY - 56);
      }
      // il tavolo lungo apparecchiato d'argento
      blocks(ctx, W * 0.08, floorY - 46, W * 0.52, 14, '#e8e0d0', 10, r, 0.05);
      blocks(ctx, W * 0.08, floorY - 32, W * 0.52, 6, '#5a4030', 8, r, 0.1);
      ctx.fillStyle = '#4a3226';
      ctx.fillRect(W * 0.11, floorY - 26, 12, 26); ctx.fillRect(W * 0.54, floorY - 26, 12, 26);
      // piatti e calici di liquido rosso vivo
      for (let i = 0; i < 5; i++) {
        const px = W * 0.12 + i * W * 0.095;
        ctx.fillStyle = '#c8ccd8'; ctx.fillRect(px, floorY - 50, 16, 5);
        ctx.fillStyle = '#7a2432'; ctx.fillRect(px + 20, floorY - 56, 6, 8);
        ctx.fillStyle = '#c8ccd8'; ctx.fillRect(px + 19, floorY - 48, 8, 2);
      }
      // candelabri
      for (const fx of [0.16, 0.40]) {
        ctx.fillStyle = '#c8a032'; ctx.fillRect(W * fx, floorY - 72, 5, 22);
        ctx.fillRect(W * fx - 10, floorY - 66, 25, 4);
        for (const dx of [-10, 0, 10]) {
          glow(ctx, W * fx + dx + 2, floorY - 76, 12, 10, '232,182,76');
          ctx.fillStyle = '#e8e0d0'; ctx.fillRect(W * fx + dx, floorY - 74, 5, 8);
          ctx.fillStyle = '#e8b64c'; ctx.fillRect(W * fx + dx, floorY - 79, 5, 5);
        }
      }
      // credenza con l'argenteria del 1899
      blocks(ctx, 0, floorY - 90, W * 0.06, 90, '#3a2620', 8, r, 0.1);
      ctx.fillStyle = '#c8ccd8';
      for (let i = 0; i < 4; i++) ctx.fillRect(6, floorY - 82 + i * 20, W * 0.04, 5);
    },

    piscina(ctx, W, H) {
      const r = rng(41);
      skyGradient(ctx, W, H, '#0a0710', '#1d1020', 10);
      stars(ctx, W, H, r, 44);
      // la luna vera: un taglio sottile
      crescentMoon(ctx, W * 0.86, 46, 16, '#c8b8c0', '#0a0710');
      const deck = H * 0.44;
      hills(ctx, W, deck - 30, 40, '#0f0a10', r, 36);
      // travertino del bordo
      blocks(ctx, 0, deck, W, H - deck, '#4a4038', 12, r, 0.1);
      // LA PISCINA: rettangolo di luce turchese nel buio
      const px = W * 0.14, pw = W * 0.72, py = deck + 22, ph = H - py - 16;
      glow(ctx, px + pw / 2, py + ph / 2, pw * 0.9, ph * 0.9, '61,158,178');
      blocks(ctx, px, py, pw, ph, '#1d7a92', 12, r, 0.14);
      blocks(ctx, px + 8, py + 8, pw - 16, ph - 16, '#2492ac', 12, r, 0.12);
      // vapore che sale in volute pigre (più visibile, a colonne sfalsate)
      for (let i = 0; i < 8; i++) {
        const vx = px + 20 + i * (pw / 8) + (r() - 0.5) * 20;
        ctx.fillStyle = 'rgba(225,242,246,.16)';
        ctx.fillRect(vx, py - 10, 20 + r() * 14, 6);
        ctx.fillStyle = 'rgba(225,242,246,.10)';
        ctx.fillRect(vx + 6, py - 22, 16 + r() * 10, 6);
        ctx.fillStyle = 'rgba(225,242,246,.06)';
        ctx.fillRect(vx + 12, py - 34, 12 + r() * 8, 6);
      }
      // il riflesso SBAGLIATO: luna piena rossa NELL'ACQUA, con scia
      ctx.fillStyle = 'rgba(138,36,50,.10)'; ctx.fillRect(px + pw * 0.44, py + 8, pw * 0.38, ph - 16);
      ctx.fillStyle = 'rgba(138,36,50,.14)'; ctx.fillRect(px + pw * 0.52, py + 8, pw * 0.22, ph - 16);
      const moonY = py + ph * (0.8 - eclipsePhase * 0.55);
      moon(ctx, px + pw * 0.62, moonY, 22, '#8a2432', true);
      ctx.fillStyle = 'rgba(170,50,64,.5)';
      for (let i = 0; i < 6; i++) ctx.fillRect(px + pw * 0.54 + r() * pw * 0.18, py + 12 + r() * (ph - 24), 10 + r() * 14, 3);
      // costellazioni sbagliate, fitte, nell'acqua
      ctx.fillStyle = '#d8ccd8';
      for (let i = 0; i < 22; i++) ctx.fillRect(px + 12 + r() * (pw - 24), py + 10 + r() * (ph - 20), 2, 2);
      // increspature
      ctx.fillStyle = 'rgba(230,250,255,.22)';
      for (let i = 0; i < 9; i++) ctx.fillRect(px + 10 + r() * (pw - 40), py + 8 + r() * (ph - 16), 18 + r() * 26, 2);
      // il muro di cinta bianco sul fondo, oltre i lettini
      blocks(ctx, 0, deck - 26, W, 14, '#8a8478', 8, r, 0.08);
      // lo spigolo della villa terracotta che si affaccia a destra
      blocks(ctx, W * 0.86, deck - 96, W * 0.14, 72, '#8a4038', 8, r, 0.1);
      blocks(ctx, W * 0.85, deck - 102, W * 0.15, 8, '#6e3a28', 8, r, 0.12);
      ctx.fillStyle = '#c8c2b4'; ctx.fillRect(W * 0.885, deck - 82, 8, 22);
      ctx.fillStyle = '#a8a294'; for (let d = 0; d < 4; d++) ctx.fillRect(W * 0.886, deck - 79 + d * 5, 6, 2);
      glow(ctx, W * 0.925 + 7, deck - 70, 18, 20, '232,182,76');
      ctx.fillStyle = '#e8b64c'; ctx.fillRect(W * 0.92, deck - 82, 14, 22);
      // SEI lettini con SEI accappatoi
      for (let i = 0; i < 6; i++) {
        const lx = W * 0.055 + i * W * 0.155, ly = deck + 4;
        ctx.fillStyle = '#5a5048'; ctx.fillRect(lx, ly - 12, 44, 10);
        ctx.fillStyle = '#3a342e'; ctx.fillRect(lx + 2, ly - 2, 4, 6); ctx.fillRect(lx + 38, ly - 2, 4, 6);
        // accappatoio bianco appeso al gancio del lettino (il sesto è quello "in attesa")
        ctx.fillStyle = '#8a8478'; ctx.fillRect(lx + 19, ly - 34, 4, 6);
        ctx.fillStyle = i === 5 ? '#e0dcd2' : '#f0ece4';
        ctx.fillRect(lx + 12, ly - 29, 18, 18);
        ctx.fillRect(lx + 15, ly - 33, 12, 6);
        ctx.fillStyle = i === 5 ? '#b0aca2' : '#d8d2c6';
        ctx.fillRect(lx + 20, ly - 29, 2, 18);
        ctx.fillStyle = '#7a2432'; ctx.fillRect(lx + 14, ly - 25, 5, 4);
        if (i % 2 === 0) umbrella(ctx, lx + 36, ly - 6, 40, r);
      }
      // le luci sott'acqua
      for (const fx of [0.22, 0.5, 0.78]) {
        glow(ctx, W * fx, py + ph - 42, 26, 14, '120,220,235');
        ctx.fillStyle = '#a8e8f0'; ctx.fillRect(W * fx - 5, py + ph - 44, 10, 5);
      }
    },

    cantina(ctx, W, H) {
      const r = rng(43);
      blocks(ctx, 0, 0, W, H, '#1d1216', 16, r, 0.2);
      const floorY = H - 54;
      blocks(ctx, 0, floorY, W, H - floorY, '#140c10', 14, r, 0.16);
      // pilastri delle volte
      for (const fx of [0.03, 0.32, 0.64, 0.95]) {
        blocks(ctx, W * fx - 12, H * 0.10, 26, H - 54 - H * 0.10, '#2e2026', 10, r, 0.14);
        blocks(ctx, W * fx - 18, H * 0.08, 38, 16, '#332430', 10, r, 0.12);
      }
      // rastrelliere di bottiglie coi nomi (bottiglie orizzontali, collo verso di voi)
      for (const fx of [0.06, 0.38, 0.70]) {
        blocks(ctx, W * fx, H * 0.30, W * 0.24, H * 0.48, '#241812', 8, r, 0.12);
        for (let row = 0; row < 5; row++) {
          ctx.fillStyle = '#171009';
          ctx.fillRect(W * fx + 4, H * 0.315 + row * H * 0.092, W * 0.24 - 8, H * 0.075);
          for (let col = 0; col < 4; col++) {
            const bx = W * fx + 10 + col * (W * 0.24 - 24) / 4, by = H * 0.325 + row * H * 0.092;
            ctx.fillStyle = '#2d5a3d'; ctx.fillRect(bx, by, 22, 9);           // corpo
            ctx.fillStyle = '#1d4029'; ctx.fillRect(bx + 22, by + 2, 7, 5);   // collo
            ctx.fillStyle = '#e8e0d0'; ctx.fillRect(bx + 5, by + 2, 10, 5);   // etichetta col nome
          }
        }
      }
      // in fondo: il forno del Banchetto, acceso da 125 anni
      blocks(ctx, W * 0.42, floorY - 74, W * 0.16, 74, '#3a2c30', 8, r, 0.14);
      blocks(ctx, W * 0.41, floorY - 82, W * 0.18, 12, '#443440', 8, r, 0.1);
      glow(ctx, W * 0.5, floorY - 26, 80, 44, '200,90,40');
      ctx.fillStyle = '#1a0f0a'; ctx.fillRect(W * 0.445, floorY - 52, W * 0.11, 40);
      ctx.fillStyle = '#c85a28'; ctx.fillRect(W * 0.455, floorY - 46, W * 0.09, 32);
      ctx.fillStyle = '#e8a04c'; ctx.fillRect(W * 0.468, floorY - 38, W * 0.064, 22);
      ctx.fillStyle = '#f5d878'; ctx.fillRect(W * 0.478, floorY - 30, W * 0.044, 12);
      // ganci che oscillano senza vento
      ctx.fillStyle = '#8a8478';
      for (const fx of [0.30, 0.44, 0.58, 0.72]) {
        ctx.fillRect(W * fx, H * 0.12, 3, 26);
        ctx.fillRect(W * fx - 3, H * 0.12 + 26, 9, 4);
      }
      // candele verdi da cripta
      for (const fx of [0.10, 0.90]) {
        glow(ctx, W * fx + 3, H * 0.52, 18, 18, '95,224,138');
        ctx.fillStyle = '#e8e0d0'; ctx.fillRect(W * fx, H * 0.54, 7, 14);
        ctx.fillStyle = '#5fe08a'; ctx.fillRect(W * fx + 1, H * 0.50, 5, 6);
      }
    },

    pianoProibito(ctx, W, H) {
      const r = rng(53);
      const floorY = H - 62;
      // carta da parati che CAMBIA disegno a fasce
      const bands = ['#2a1d22', '#241f2a', '#2e2220', '#1f242a', '#2c1e26'];
      for (let i = 0; i < 5; i++) blocks(ctx, i * W / 5, 0, W / 5 + 2, floorY, bands[i], 14, r, 0.1);
      ctx.fillStyle = 'rgba(200,160,120,.05)';
      for (let x = 0; x < W; x += 22) ctx.fillRect(x, 0, 7, floorY);
      blocks(ctx, 0, floorY, W, H - floorY, '#1d1216', 12, r, 0.14);
      // tappeti di epoche diverse
      blocks(ctx, W * 0.02, floorY + 6, W * 0.30, H - floorY - 10, '#5a1a26', 10, r, 0.12);
      blocks(ctx, W * 0.36, floorY + 6, W * 0.30, H - floorY - 10, '#1d3a3a', 10, r, 0.12);
      blocks(ctx, W * 0.70, floorY + 6, W * 0.28, H - floorY - 10, '#4a3a1d', 10, r, 0.12);
      // le porte con le targhette degli anni
      const anni = ['1899', '1924', '1949', '1974', '1999'];
      for (let i = 0; i < 5; i++) {
        const dx = W * 0.05 + i * W * 0.16;
        ctx.fillStyle = '#3a2620'; ctx.fillRect(dx, floorY - 110, 58, 110);
        ctx.fillStyle = '#2a1a16'; ctx.fillRect(dx + 7, floorY - 100, 44, 40);
        ctx.fillRect(dx + 7, floorY - 52, 44, 40);
        ctx.fillStyle = '#c8a032'; ctx.fillRect(dx + 20, floorY - 120, 20, 8);
        ctx.fillStyle = '#c8a032'; ctx.fillRect(dx + 48, floorY - 60, 5, 5);
      }
      // la SESTA porta: vernice fresca, luce da sotto
      const sx = W * 0.86;
      ctx.fillStyle = '#4a3226'; ctx.fillRect(sx, floorY - 112, 60, 112);
      ctx.fillStyle = '#5d4030'; ctx.fillRect(sx + 6, floorY - 104, 48, 96);
      ctx.fillStyle = '#d8d0c0'; ctx.fillRect(sx + 22, floorY - 122, 20, 8);
      glow(ctx, sx + 30, floorY + 2, 50, 8, '232,182,76');
      ctx.fillStyle = '#e8b64c'; ctx.fillRect(sx + 4, floorY - 2, 52, 3);
      // una lampada tremolante
      glow(ctx, W * 0.5, H * 0.24, 20, 20, '232,182,76');
      ctx.fillStyle = '#8a8478'; ctx.fillRect(W * 0.5 - 4, H * 0.26, 9, 12);
    },

    giardino(ctx, W, H) {
      const r = rng(61);
      skyGradient(ctx, W, H, '#0a0710', '#141020', 10);
      stars(ctx, W, H, r, 30);
      crescentMoon(ctx, W * 0.16, 50, 18, '#c8b8c0', '#0a0710');
      const g = H - 66;
      hills(ctx, W, g - 20, 34, '#0f150f', r, 34);
      ground(ctx, W, H, g, '#16241a', r, 12, 8);
      /* ghiaia azzurrina rastrellata a onde: un vialetto in PROSPETTIVA, che
         si allarga venendo avanti. Il rettangolo piatto di prima leggeva come
         il bordo di una vasca. */
      for (let i = 0; i < 6; i++) {
        const gw = W * (0.26 + (i / 6) * 0.20);
        blocks(ctx, W * 0.5 - gw / 2, g + 8 + i * ((H - g - 10) / 6), gw, (H - g) / 6 + 4, '#28303c', 8, r, 0.12);
      }
      ctx.fillStyle = 'rgba(164,180,204,.10)';
      for (let i = 0; i < 6; i++) {
        const gw = W * (0.24 + (i / 6) * 0.19);
        ctx.fillRect(W * 0.5 - gw / 2, g + 14 + i * ((H - g - 12) / 6), gw, 2);          // le onde del rastrello
      }
      /* Il capanno, l'orto e la siepe stanno IN FONDO al giardino, quindi
         stanno piccoli: il metro della scena è lo spaventapasseri, che è alto
         come un uomo (lezione 51). */
      // il capanno degli attrezzi, la porta socchiusa sul buio
      blocks(ctx, W * 0.05, g - 62, W * 0.135, 62, '#241c14', 8, r, 0.14);
      for (let i = 0; i < 4; i++) blocks(ctx, W * 0.045 + i * 5, g - 70 - i * 5, W * 0.145 - i * 10, 7, '#1a140e', 6, r, 0.1);
      ctx.fillStyle = '#0d0a08'; ctx.fillRect(W * 0.105, g - 44, 16, 44);
      ctx.fillStyle = '#d8dce8'; ctx.fillRect(W * 0.088, g - 36, 3, 13);             // il luccichio delle cesoie appese
      ctx.fillStyle = '#9aa0b0'; ctx.fillRect(W * 0.085, g - 24, 5, 4);
      /* UNA siepe sola, e grande. Prima ce n'erano due da 96×54 che dovevano
         essere animali: a quella misura un animale di bosso non è un animale,
         sono due macchie con due buchi (lezione 60). Questa è alta 140 px, ha
         il collo e la testa della potatura sopra il corpo, e i due buchi
         all'altezza degli occhi restano dove il testo li mette. */
      const hx = Math.round(W * 0.74), hw = Math.round(W * 0.20);
      blocks(ctx, hx, g - 72, hw, 76, '#14261a', 8, r, 0.2);
      blocks(ctx, hx + Math.round(hw * 0.52), g - 132, Math.round(hw * 0.30), 62, '#101f15', 8, r, 0.2);   // il collo
      blocks(ctx, hx + Math.round(hw * 0.44), g - 146, Math.round(hw * 0.46), 22, '#101f15', 8, r, 0.2);   // il muso
      ctx.fillStyle = '#060a06';
      ctx.fillRect(hx + Math.round(hw * 0.56), g - 140, 6, 6); ctx.fillRect(hx + Math.round(hw * 0.76), g - 140, 6, 6);
      // l'orto recintato di Ada, in fondo, coi cartellini dei semi
      blocks(ctx, W * 0.34, g - 30, W * 0.22, 26, '#1d2e1d', 8, r, 0.16);
      ctx.fillStyle = '#4a3226';
      for (let i = 0; i < 7; i++) ctx.fillRect(W * 0.34 + i * W * 0.032, g - 36, 4, 12);
      ctx.fillRect(W * 0.34, g - 30, W * 0.22, 3);
      ctx.fillStyle = '#a8b8ac';
      for (let i = 0; i < 6; i++) ctx.fillRect(W * 0.355 + i * W * 0.033, g - 24 + (i % 2) * 4, 3, 9);
      // UNA lanterna sola: la seconda faceva solo concorrenza al soggetto
      ctx.fillStyle = '#3a3440'; ctx.fillRect(W * 0.245, g - 52, 6, 52);
      glow(ctx, W * 0.248, g - 60, 20, 18, '232,182,76');
      ctx.fillStyle = '#e8b64c'; ctx.fillRect(W * 0.239, g - 63, 11, 12);

      /* LO SPAVENTAPASSERI — il soggetto del quadro, e finalmente grande
         quanto un uomo: 210 px dal cappello alla ghiaia, la traversa da 140,
         la giacca da lavoro larga 70 e il cappello di paglia da 50.
         Prima era un bastone da 6 px con una traversa da 68 e una giacca da
         24×18, e l'unica cosa grande in quella zona era l'alone rettangolare
         che gli stava attorno: si leggeva il rettangolo, non il palo.
         b1 lo nomina pezzo per pezzo — «giacca da lavoro, cappello di paglia,
         guanti da potatura, con delle CESOIE VERE cucite alle maniche» — e
         quindi ci sono tutti, cesoie comprese. */
      const spx = Math.round(W * 0.46), spb = g + 8;
      ctx.fillStyle = '#3a2a1c'; ctx.fillRect(spx - 6, spb - 198, 13, 198);          // il palo
      ctx.fillStyle = '#26190f'; ctx.fillRect(spx + 2, spb - 198, 5, 198);           // il lato in ombra
      ctx.fillStyle = '#33241a'; ctx.fillRect(spx - 70, spb - 160, 140, 11);         // la traversa, 140 px
      ctx.fillStyle = '#241a12'; ctx.fillRect(spx - 70, spb - 149, 140, 3);
      ctx.fillStyle = '#6a5a3a'; ctx.fillRect(spx - 10, spb - 163, 20, 17);          // la fasciatura di corda
      // le maniche appese alla traversa, e in punta i guanti da potatura
      for (const s of [-1, 1]) {
        const ax = s < 0 ? spx - 62 : spx + 40;
        ctx.fillStyle = '#443a2e'; ctx.fillRect(ax, spb - 152, 22, 54);
        ctx.fillStyle = '#37301f'; ctx.fillRect(ax + (s < 0 ? 0 : 17), spb - 152, 5, 54);
        ctx.fillStyle = '#2a2018'; ctx.fillRect(ax + 1, spb - 100, 20, 14);          // il guanto
        // LE CESOIE cucite alla manica: perno in alto e due lame che si aprono
        ctx.fillStyle = '#6a7280'; ctx.fillRect(ax + 4, spb - 87, 14, 3);
        for (let k = 0; k < 20; k += 2) {
          ctx.fillStyle = k > 14 ? '#d8dce8' : '#aab0bc';
          ctx.fillRect(ax + 5 - Math.round(k * 0.22), spb - 84 + k, 3, 2);
          ctx.fillRect(ax + 14 + Math.round(k * 0.22), spb - 84 + k, 3, 2);
        }
      }
      // la giacca da lavoro, floscia: 70 px di spalle
      ctx.fillStyle = '#4a4034'; ctx.fillRect(spx - 35, spb - 154, 70, 80);
      ctx.fillStyle = '#3d3428';
      ctx.fillRect(spx - 35, spb - 154, 70, 4); ctx.fillRect(spx - 4, spb - 150, 8, 76);   // l'abbottonatura
      ctx.fillRect(spx - 35, spb - 92, 70, 6);                                      // l'orlo che pende
      ctx.fillStyle = '#5a5040'; ctx.fillRect(spx - 33, spb - 146, 5, 60);          // la piega che prende la luna
      // il cappello di paglia: 50 px di falda, dove starebbe la testa
      ctx.fillStyle = '#8a7a4a'; ctx.fillRect(spx - 25, spb - 186, 50, 8);
      ctx.fillStyle = '#9a8a56'; ctx.fillRect(spx - 25, spb - 186, 50, 3);
      ctx.fillStyle = '#7a6a3e'; ctx.fillRect(spx - 15, spb - 200, 30, 15);
      ctx.fillStyle = '#5a4c2a'; ctx.fillRect(spx - 15, spb - 190, 30, 4);          // il nastro
      // il muro di nebbia, ultimo: preme sul giardino da fuori
      fogWall(ctx, W, H, 0, r, 0.10);
      fogWall(ctx, W, H, 1, r, 0.10);
    },

    pozzo(ctx, W, H) {
      const r = rng(71);
      skyGradient(ctx, W, H, '#0a0710', '#181022', 10);
      stars(ctx, W, H, r, 36);
      crescentMoon(ctx, W * 0.80, 48, 18, '#c8b8c0', '#0a0710');
      const g = H - 60;
      hills(ctx, W, g - 26, 36, '#0f150f', r, 34);
      ground(ctx, W, H, g, '#16241a', r, 12, 8);
      for (let i = 0; i < 3; i++) willow(ctx, W * (0.12 + i * 0.38), g + 6, 70 + r() * 20, '#14261c', '#241a14', r);
      // IL POZZO, al centro esatto
      const wx = W * 0.5 - 55, wy = g - 74;
      blocks(ctx, wx, wy, 110, 74, '#2e2a35', 8, r, 0.16);
      blocks(ctx, wx - 6, wy - 8, 122, 12, '#3a3644', 8, r, 0.12);
      // le tacche dei conti, a gruppi di cinque
      ctx.fillStyle = '#1d1a24';
      for (let row = 0; row < 3; row++) for (let i = 0; i < 9; i++) {
        ctx.fillRect(wx + 8 + i * 11, wy + 14 + row * 18, 2, 10);
      }
      // il tetto a cuspide
      ctx.fillStyle = '#4a3226';
      ctx.fillRect(wx + 6, wy - 60, 7, 56); ctx.fillRect(wx + 97, wy - 60, 7, 56);
      for (let i = 0; i < 5; i++) blocks(ctx, wx - 4 + i * 6, wy - 66 - i * 7, 118 - i * 12, 8, '#5a3038', 6, r, 0.12);
      // l'argano e la corda TESA
      ctx.fillStyle = '#3a2620'; ctx.fillRect(wx + 20, wy - 46, 70, 7);
      ctx.fillStyle = '#c8bca8'; ctx.fillRect(wx + 53, wy - 40, 3, 40);
      // il buio dentro: più buio del buio
      ctx.fillStyle = '#050308'; ctx.fillRect(wx + 12, wy + 4, 86, 8);
      // il bagliore tenue dal fondo
      glow(ctx, wx + 55, wy + 10, 40, 10, '168,216,232');
      // l'asciugamano piegato sul bordo, come a bordo piscina
      ctx.fillStyle = '#f0ece4'; ctx.fillRect(wx + 78, wy - 7, 22, 8);
      ctx.fillStyle = '#7a2432'; ctx.fillRect(wx + 86, wy - 5, 6, 3);
      // il secchio accanto
      ctx.fillStyle = '#4a4a55'; ctx.fillRect(wx - 24, g - 18, 18, 16);
      ctx.fillStyle = '#3a3a45'; ctx.fillRect(wx - 26, g - 20, 22, 4);
    },

    salaBanchetto(ctx, W, H) {
      const r = rng(83);
      blocks(ctx, 0, 0, W, H, '#1f151a', 16, r, 0.14);
      const floorY = H - 78;
      // pavimento a scacchi, più scuro del solito (file dal fondo)
      let rowY = floorY;
      for (let row = 0; row < 5; row++) {
        const size = 16 + row * 7;
        for (let col = -12; col < 12; col++) {
          const x = W / 2 + col * size;
          ctx.fillStyle = ((col + row) % 2 === 0) ? '#8a8074' : '#14100e';
          ctx.fillRect(x, rowY, size, size * 0.62);
        }
        rowY += size * 0.62;
      }
      /* i ritratti trasferiti QUI, fitti come parenti a un matrimonio: DUE
         abbastanza grandi da mostrare le facce che «vorrebbero gridare», e le
         altre cornici di scorcio. Sei riquadri da 54×66 non erano sei gruppi
         di ospiti: erano sei tapparelle (vedi oilPortrait). */
      oilPortrait(ctx, 44, 14, 184, 190, { figures: 3, pool: '#2a4a68', back: '#5a3a2e' });
      frameEdgeOn(ctx, 252, 40, 40, 128); frameEdgeOn(ctx, 318, 46, 34, 114); frameEdgeOn(ctx, 380, 52, 28, 100);
      oilPortrait(ctx, 430, 18, 180, 186, { figures: 3, epoca: 2, pool: '#2a4a68', back: '#4a3444' });
      frameEdgeOn(ctx, 636, 40, 40, 128); frameEdgeOn(ctx, 700, 46, 34, 114);
      frameEdgeOn(ctx, 760, 52, 28, 100); frameEdgeOn(ctx, 818, 58, 24, 88);
      // il tavolo del Banchetto: SEI coperti
      blocks(ctx, W * 0.12, floorY - 48, W * 0.62, 16, '#e8e0d0', 10, r, 0.05);
      blocks(ctx, W * 0.12, floorY - 32, W * 0.62, 7, '#4a2a20', 8, r, 0.1);
      ctx.fillStyle = '#3a2018';
      ctx.fillRect(W * 0.15, floorY - 25, 13, 25); ctx.fillRect(W * 0.66, floorY - 25, 13, 25);
      for (let i = 0; i < 6; i++) {
        const px = W * 0.15 + i * W * 0.092;
        ctx.fillStyle = '#c8ccd8'; ctx.fillRect(px, floorY - 52, 15, 5);
        ctx.fillStyle = '#7a2432'; ctx.fillRect(px + 18, floorY - 58, 6, 8);
      }
      // candelabri OVUNQUE
      for (const fx of [0.06, 0.30, 0.56, 0.82]) {
        ctx.fillStyle = '#c8a032'; ctx.fillRect(W * fx, floorY - 84, 5, 30);
        ctx.fillRect(W * fx - 11, floorY - 78, 27, 4);
        for (const dx of [-11, 0, 11]) {
          glow(ctx, W * fx + dx + 2, floorY - 88, 12, 10, '232,182,76');
          ctx.fillStyle = '#e8e0d0'; ctx.fillRect(W * fx + dx, floorY - 86, 5, 8);
          ctx.fillStyle = '#e8b64c'; ctx.fillRect(W * fx + dx, floorY - 91, 5, 5);
        }
      }
      // la sedia a capotavola, in ombra
      ctx.fillStyle = '#100a0e'; ctx.fillRect(W * 0.79, floorY - 74, 40, 74);
      ctx.fillStyle = '#1d1216'; ctx.fillRect(W * 0.795, floorY - 68, 36, 62);
      glow(ctx, W * 0.81, floorY - 50, 30, 30, '20,8,16');
    },


    paese(ctx, W, H) {
      const r = rng(103);
      skyGradient(ctx, W, H, '#0a0710', '#171022', 10);
      stars(ctx, W, H, r, 40);
      crescentMoon(ctx, W * 0.88, 44, 16, '#c8b8c0', '#0a0710');
      const g = H - 64;
      hills(ctx, W, g - 34, 44, '#100a12', r, 34);
      // il campanile mozzato
      blocks(ctx, W * 0.46, g - 168, 44, 168, '#3a3644', 8, r, 0.12);
      blocks(ctx, W * 0.44, g - 178, 52, 14, '#443f50', 8, r, 0.1);
      ctx.fillStyle = '#171017'; ctx.fillRect(W * 0.465, g - 160, 30, 24);
      // la chiesa e la canonica addossata
      blocks(ctx, W * 0.52, g - 96, W * 0.14, 96, '#4a4450', 8, r, 0.1);
      for (let i = 0; i < 5; i++) blocks(ctx, W * 0.515 + i * 6, g - 104 - i * 7, W * 0.15 - i * 12, 8, '#332e3a', 6, r, 0.1);
      blocks(ctx, W * 0.67, g - 70, W * 0.10, 70, '#57505e', 8, r, 0.1);
      // LA luce: la finestra della canonica
      glow(ctx, W * 0.71, g - 44, 30, 26, '232,182,76');
      ctx.fillStyle = '#e8b64c'; ctx.fillRect(W * 0.695, g - 52, 16, 18);
      ctx.fillStyle = '#8a6a2d'; ctx.fillRect(W * 0.702, g - 52, 2, 18);
      // le case buie, persiane chiuse
      for (const [fx, fw, fh] of [[0.04, 0.11, 62], [0.17, 0.09, 50], [0.28, 0.12, 70], [0.82, 0.12, 58]]) {
        blocks(ctx, W * fx, g - fh, W * fw, fh, '#3d3844', 8, r, 0.1);
        for (let i = 0; i < 4; i++) blocks(ctx, W * fx + 4 + i * 5, g - fh - 6 - i * 5, W * fw - 8 - i * 10, 7, '#2a2530', 6, r, 0.1);
        ctx.fillStyle = '#211d26';
        ctx.fillRect(W * fx + 8, g - fh + 12, 12, 16); ctx.fillRect(W * fx + W * fw - 20, g - fh + 12, 12, 16);
      }
      // la piazza: sampietrini e la fontanella asciutta
      ground(ctx, W, H, g, '#2a2530', r, 10, 6);
      blocks(ctx, W * 0.36, g + 16, 40, 18, '#4a4450', 6, r, 0.12);
      ctx.fillStyle = '#38333e'; ctx.fillRect(W * 0.365 + 14, g + 6, 8, 12);
      // il bar "Da Peppe": insegna e tavolini incatenati
      blocks(ctx, W * 0.05, g - 26, 60, 8, '#57505e', 6, r, 0.1);
      ctx.fillStyle = '#8a3a3a'; ctx.fillRect(W * 0.055, g - 40, 48, 12);
      ctx.fillStyle = '#d8d0c0'; ctx.fillRect(W * 0.06, g - 37, 38, 3); ctx.fillRect(W * 0.06, g - 32, 26, 2);
      ctx.fillStyle = '#4a4450';
      ctx.fillRect(W * 0.10, g - 14, 16, 14); ctx.fillRect(W * 0.125, g - 20, 14, 20);
      // la corriera azzurra, ferma dal 1974: gomme a terra, un velo di polvere
      const bx = W * 0.80, by = g - 4;
      ctx.fillStyle = '#4a7a9a'; ctx.fillRect(bx, by - 26, 92, 26);            // carrozzeria
      ctx.fillStyle = '#3a6a8a'; ctx.fillRect(bx, by - 26, 92, 5);             // fascia del tetto
      ctx.fillStyle = '#1a2530';                                               // finestrini bui
      for (let i = 0; i < 5; i++) ctx.fillRect(bx + 6 + i * 17, by - 21, 12, 10);
      ctx.fillStyle = '#2a2228'; ctx.fillRect(bx + 10, by - 2, 14, 7); ctx.fillRect(bx + 66, by - 2, 14, 7); // gomme sgonfie
      ctx.fillStyle = '#c8c2b0'; ctx.fillRect(bx + 30, by - 24, 34, 4);        // cartello di linea sbiadito
      ctx.fillStyle = 'rgba(190,180,195,.14)'; ctx.fillRect(bx, by - 27, 92, 27); // il velo di polvere
      ctx.fillStyle = '#8a8478'; ctx.fillRect(bx + 84, by - 12, 6, 3);         // lo specchietto storto
      // la nebbia ferma sui bordi del paese
      for (let i = 0; i < 4; i++) {
        ctx.fillStyle = `rgba(190,180,195,${0.03 + i * 0.012})`;
        ctx.fillRect(0, H - 26 + i * 5, W, 8);
      }
    },


    riflesso(ctx, W, H) {
      const r = rng(151);
      // il cielo del Riflesso: rosso cupo, la luna piena ROSSA domina
      skyGradient(ctx, W, H, '#1d060c', '#3a0d18', 10);
      // stelle SBAGLIATE: fitte, in costellazioni geometriche
      ctx.fillStyle = '#d8ccd8';
      for (let i = 0; i < 40; i++) {
        const gx = 40 + (i % 8) * (W / 8), gy = 20 + Math.floor(i / 8) * 26;
        ctx.fillRect(gx + (r() > 0.5 ? 6 : 0), gy, 2, 2);
      }
      moon(ctx, W * 0.5, 64, 40, '#8a2432', false);
      glow(ctx, W * 0.5, 64, 90, 90, '138,36,50');
      const deck = H * 0.44;
      hills(ctx, W, deck - 30, 40, '#170a10', r, 36);
      blocks(ctx, 0, deck, W, H - deck, '#3a3430', 12, r, 0.1);
      // la piscina del Riflesso: acqua NERA che mostra il mondo giusto
      const px = W * 0.14, pw = W * 0.72, py = deck + 22, ph = H - py - 16;
      blocks(ctx, px, py, pw, ph, '#0c1218', 12, r, 0.14);
      // dentro l'acqua: il cielo NORMALE, con la luna sottile — casa vostra, laggiù
      ctx.fillStyle = '#9a90c0';
      for (let i = 0; i < 12; i++) ctx.fillRect(px + 12 + r() * (pw - 24), py + 10 + r() * (ph - 20), 2, 2);
      crescentMoon(ctx, px + pw * 0.6, py + ph * 0.5, 12, '#c8b8c0', '#0c1218');
      ctx.fillStyle = 'rgba(200,184,232,.14)'; ctx.fillRect(px + pw * 0.52, py + 6, pw * 0.2, ph - 12);
      // CINQUE lettini (di qua il sesto siete voi)
      for (let i = 0; i < 5; i++) {
        const lx = W * 0.08 + i * W * 0.17, ly = deck + 4;
        ctx.fillStyle = '#4a4440'; ctx.fillRect(lx, ly - 12, 44, 10);
        ctx.fillStyle = '#c8c2b4'; ctx.fillRect(lx + 12, ly - 26, 18, 15);
      }
      // ombrelloni NERI del Riflesso: aperti di notte, come lutti
      for (const fx of [0.20, 0.56, 0.88]) {
        const ux = W * fx, uy = deck + 2;
        ctx.fillStyle = '#3a3234'; ctx.fillRect(ux - 1, uy - 34, 3, 34);
        ctx.fillStyle = '#2a1218';
        for (let k = 0; k < 5; k++) ctx.fillRect(ux - 22 + k * 2, uy - 34 + k * 3, 44 - k * 4, 4);
        ctx.fillStyle = '#4a2028'; ctx.fillRect(ux - 22, uy - 22, 44, 2);
      }
      // il muro di cinta, scuro, col bordo che nel mondo giusto è bianco
      blocks(ctx, 0, deck - 12, W, 12, '#241d22', 8, r, 0.12);
      ctx.fillStyle = '#3a3036'; ctx.fillRect(0, deck - 13, W, 2);
      // sul lettino di mezzo: un accappatoio piegato, senza iniziale — il sesto posto
      ctx.fillStyle = '#d8d2c6'; ctx.fillRect(W * 0.08 + 2 * W * 0.17 + 12, deck - 24, 18, 12);
      ctx.fillStyle = '#b0aca2'; ctx.fillRect(W * 0.08 + 2 * W * 0.17 + 14, deck - 20, 14, 2);
      // la luna rossa cola sull'acqua nera
      ctx.fillStyle = 'rgba(138,36,50,.22)'; ctx.fillRect(px + pw * 0.42, py + 4, pw * 0.16, ph - 8);
      // le finestre della villa capovolta, in alto, luce FREDDA
      ctx.fillStyle = '#6ab8ae';
      for (let i = 0; i < 6; i++) ctx.fillRect(W * 0.2 + i * W * 0.11, 8, 10, 12);
      ctx.fillStyle = 'rgba(106,184,174,.10)'; ctx.fillRect(0, 0, W, 26);
    },

    riflesso_interno(ctx, W, H) {
      const r = rng(157);
      blocks(ctx, 0, 0, W, H, '#1a1420', 16, r, 0.14);
      const floorY = H - 76;
      // scacchi INVERTITI (bianco dove era nero)
      let rowY = floorY;
      for (let row = 0; row < 5; row++) {
        const size = 16 + row * 7;
        for (let col = -12; col < 12; col++) {
          const x = W / 2 + col * size;
          ctx.fillStyle = ((col + row) % 2 === 0) ? '#14100e' : '#d8d0c4';
          ctx.fillRect(x, rowY, size, size * 0.62);
        }
        rowY += size * 0.62;
      }
      // lampadario che pende DRITTO in un mondo storto: luce fredda
      ctx.fillStyle = '#8a8478'; ctx.fillRect(W * 0.5 - 2, 0, 4, 26);
      glow(ctx, W * 0.5, 52, 60, 34, '106,184,174');
      ctx.fillStyle = '#c8bca8'; ctx.fillRect(W * 0.5 - 34, 26, 68, 8);
      for (const dx of [-34, -20, -6, 8, 22, 28]) {
        ctx.fillStyle = '#e8e0d0'; ctx.fillRect(W * 0.5 + dx, 34, 5, 10);
        ctx.fillStyle = '#6ab8ae'; ctx.fillRect(W * 0.5 + dx - 1, 44, 7, 7);
      }
      // i ritratti del Riflesso: la stessa gerarchia della hall (uno grande,
      // le altre di scorcio) ma con la luce fredda e la pelle spenta di qua
      const rp = { figures: 3, pool: '#2a4a44', back: '#243a38', skin: '#a8bcb0', frame: '#8aa0a8' };
      oilPortrait(ctx, 58, 40, 190, 190, rp);
      frameEdgeOn(ctx, 274, 66, 38, 118, '#16241f'); frameEdgeOn(ctx, 340, 72, 32, 106, '#16241f');
      oilPortrait(ctx, 596, 44, 178, 184, Object.assign({ epoca: 1 }, rp));
      frameEdgeOn(ctx, 800, 70, 30, 104, '#16241f');
      // il bancone della reception, SPECCHIATO: qui sta a destra
      blocks(ctx, W * 0.74, floorY - 40, W * 0.20, 40, '#2c1e26', 8, r, 0.12);
      blocks(ctx, W * 0.73, floorY - 46, W * 0.22, 8, '#3a2a34', 8, r, 0.08);
      ctx.fillStyle = '#d8d0c4'; ctx.fillRect(W * 0.78, floorY - 54, 16, 8);        // il registro aperto (bianco, di qua)
      ctx.fillStyle = '#12101a'; ctx.fillRect(W * 0.785, floorY - 52, 6, 4);
      glow(ctx, W * 0.88, floorY - 58, 22, 14, '106,184,174');
      ctx.fillStyle = '#6ab8ae'; ctx.fillRect(W * 0.875, floorY - 62, 8, 10);       // lampada fredda da banco
      ctx.fillStyle = '#8a8478'; ctx.fillRect(W * 0.873, floorY - 52, 12, 2);
      // lo scalone, che di qua SCENDE dove di là saliva
      for (let st = 0; st < 6; st++) {
        blocks(ctx, W * 0.03, floorY - 12 - st * 12, W * 0.16 - st * 8, 12, '#241c28', 8, r, 0.1);
        ctx.fillStyle = '#3a3036'; ctx.fillRect(W * 0.03, floorY - 12 - st * 12, W * 0.16 - st * 8, 2);
      }
      ctx.fillStyle = '#4a3a44';
      for (let st = 0; st < 6; st++) ctx.fillRect(W * 0.03 + W * 0.16 - st * 8 - 2, floorY - 34 - st * 12, 3, 24);
      // l'Inventario: un leggio al centro con un registro NERO
      blocks(ctx, W * 0.46, floorY - 46, W * 0.08, 46, '#241a1e', 8, r, 0.1);
      ctx.fillStyle = '#12101a'; ctx.fillRect(W * 0.44, floorY - 58, W * 0.12, 14);
      ctx.fillStyle = '#8a1a2a'; ctx.fillRect(W * 0.49, floorY - 56, W * 0.02, 10);
    },

    ossario(ctx, W, H) {
      const r = rng(163);
      blocks(ctx, 0, 0, W, H, '#171014', 16, r, 0.22);
      const floorY = H - 50;
      blocks(ctx, 0, floorY, W, H - floorY, '#100a0e', 14, r, 0.16);
      // le tacche del 1899: pareti INTERE di conti a gruppi di cinque
      ctx.fillStyle = '#6e6258';
      for (let row = 0; row < 8; row++) for (let i = 0; i < 30; i++) {
        const x = 20 + i * ((W - 40) / 30), y = 24 + row * ((floorY - 60) / 8);
        ctx.fillRect(x, y, 2, 12);
        if (i % 5 === 4) { ctx.save(); ctx.translate(x - 8, y + 6); ctx.rotate(-0.5); ctx.fillRect(0, 0, 12, 2); ctx.restore(); }
      }
      // i bagagli mai ritirati, accatastati per epoca
      const cols = ['#6e5238', '#8a5a35', '#3d5a80', '#5a3a5a'];
      for (let i = 0; i < 7; i++) {
        const bx = W * 0.06 + i * W * 0.13, bw = 60 + r() * 30, bh = 24 + r() * 16;
        blocks(ctx, bx, floorY - bh, bw, bh, cols[i % cols.length], 8, r, 0.14);
        ctx.fillStyle = '#c8a032'; ctx.fillRect(bx + bw / 2 - 4, floorY - bh + 4, 8, 5);
      }
      // il tavolo del Contabile: lume verde, libro mastro, pile di monete
      blocks(ctx, W * 0.38, floorY - 60, W * 0.24, 14, '#3a2c20', 8, r, 0.1);
      ctx.fillStyle = '#2a1d14'; ctx.fillRect(W * 0.40, floorY - 46, 10, 46); ctx.fillRect(W * 0.58, floorY - 46, 10, 46);
      glow(ctx, W * 0.42 + 6, floorY - 74, 60, 46, '95,224,138');
      ctx.fillStyle = '#3d5a50'; ctx.fillRect(W * 0.42, floorY - 76, 12, 16);
      ctx.fillStyle = '#8ae0a8'; ctx.fillRect(W * 0.425, floorY - 80, 9, 6);
      ctx.fillStyle = '#e8e0d0'; ctx.fillRect(W * 0.465, floorY - 70, 30, 11);
      ctx.fillStyle = '#8a1a2a'; ctx.fillRect(W * 0.478, floorY - 70, 3, 11);
      ctx.fillStyle = '#c8a032';
      for (let i = 0; i < 4; i++) ctx.fillRect(W * 0.55 + i * 7, floorY - 66 - (i % 2) * 3, 5, 6);
    },

    soffitta(ctx, W, H) {
      const r = rng(167);
      blocks(ctx, 0, 0, W, H, '#241a14', 16, r, 0.16);
      const floorY = H - 58;
      blocks(ctx, 0, floorY, W, H - floorY, '#1d140e', 12, r, 0.14);
      // le falde del tetto: due spioventi di travi a vista
      ctx.fillStyle = '#3a2a1d';
      for (let i = 0; i < 5; i++) {
        const bx = i * W * 0.115;
        ctx.save(); ctx.translate(bx, 0); ctx.rotate(0.5); ctx.fillRect(0, -20, 11, H * 0.62); ctx.restore();
        ctx.save(); ctx.translate(W - bx, 0); ctx.rotate(-0.5); ctx.fillRect(-11, -20, 11, H * 0.62); ctx.restore();
      }
      ctx.fillStyle = '#2e2115'; ctx.fillRect(0, 8, W, 10); // trave di colmo
      // l'abbaino con la luna
      ctx.fillStyle = '#3a2620'; ctx.fillRect(W * 0.44, 26, 110, 82);
      ctx.fillStyle = '#100a14'; ctx.fillRect(W * 0.45, 34, 92, 66);
      crescentMoon(ctx, W * 0.505, 62, 14, '#c8b8c0', '#100a14');
      // IL TELESCOPIO d'ottone puntato in BASSO
      ctx.save();
      ctx.translate(W * 0.32, floorY - 60);
      ctx.rotate(0.6);
      ctx.fillStyle = '#c8a032'; ctx.fillRect(0, 0, 90, 14);
      ctx.fillStyle = '#8a6a1d'; ctx.fillRect(84, -2, 14, 18);
      ctx.restore();
      ctx.fillStyle = '#4a3226';
      ctx.fillRect(W * 0.30, floorY - 34, 8, 34); ctx.fillRect(W * 0.36, floorY - 34, 8, 34); ctx.fillRect(W * 0.27, floorY - 40, 26, 8);
      // casse e bauli con la vita di prima
      for (const [bx, bw, bh] of [[0.55, 90, 40], [0.70, 70, 30], [0.84, 80, 48]]) {
        blocks(ctx, W * bx, floorY - bh, bw, bh, '#4a3826', 8, r, 0.14);
        ctx.fillStyle = '#2e2115'; ctx.fillRect(W * bx, floorY - bh + 6, bw, 4);
      }
      // l'abito da sposa di Ada, appeso a una trave: bianco nel buio, quasi una figura
      glow(ctx, W * 0.135, H * 0.4, 50, 70, '232,228,220');
      ctx.fillStyle = '#8a8478'; ctx.fillRect(W * 0.132, 36, 4, 18);
      ctx.fillStyle = '#c8c2b4'; ctx.fillRect(W * 0.118, 52, 34, 6);  // gruccia/spalle
      ctx.fillStyle = '#e8e4dc';
      ctx.fillRect(W * 0.122, 58, 26, 34);                            // corpetto
      for (let i = 0; i < 7; i++) ctx.fillRect(W * 0.114 - i * 2, 92 + i * 9, 42 + i * 4, 9); // gonna che si allarga
      ctx.fillStyle = '#c8c2b4'; ctx.fillRect(W * 0.128, 66, 3, 18); ctx.fillRect(W * 0.145, 66, 3, 18);
      // ragnatele
      ctx.strokeStyle = 'rgba(200,200,220,.2)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(50, 40); ctx.moveTo(24, 0); ctx.lineTo(50, 40); ctx.stroke();
    },

    garage(ctx, W, H) {
      /* LA RIMESSA — e qui il quadro doveva essere rifatto da zero, perché
         diceva l'opposto del testo. C'era la macchina INTERA, montata, in
         piedi sulle ruote in mezzo al garage; e tutte e quattro le scene del
         luogo dicono il contrario: gr1 «la vostra macchina non è parcheggiata.
         È SMONTATA. Il motore è appeso al muro come un trofeo di caccia, i
         pezzi separati e disposti con la precisione di un museo, ognuno su un
         gancio», e gr2 è un minigioco sul domino dei pezzi tenuti insieme dal
         fil di ferro. Il giocatore leggeva «smontata» e vedeva una macchina
         intera: la scena si smentiva da sola nel primo secondo.

         E la macchina era anche fuori scala: la serranda era larga il doppio
         di lei e alta cinque volte (9,5 m per 6,2 m di basculante). Il modo
         onesto di risolvere entrambe le cose è lo stesso: la macchina non c'è
         più — non c'è più NIENTE di intero — e l'inquadratura si stringe sulla
         bacheca. Il metro adesso è il blocco motore, 1 px ≈ 0,55 cm, quindi
         una serranda vera starebbe fuori dai bordi: è fuori inquadratura, e la
         scala del quadro resta coerente con sé stessa. */
      const r = rng(151);
      const floorY = H - 56;
      // il muro di PIETRA della rimessa (il testo dice pietra, non mattoni)
      blocks(ctx, 0, 0, W, floorY + 2, '#3a3630', 16, r, 0.16);
      ctx.fillStyle = 'rgba(0,0,0,.20)';
      for (let y = 0; y < floorY; y += 32) ctx.fillRect(0, y, W, 2);        // i corsi della pietra
      for (let y = 0; y < floorY; y += 32) for (let x = (y / 32) % 2 ? 0 : 44; x < W; x += 88) ctx.fillRect(x, y, 2, 32);
      // il pavimento in cemento, e la macchia d'olio di chi ci ha lavorato
      blocks(ctx, 0, floorY, W, H - floorY, '#2e2b28', 10, r, 0.12);
      // e la macchia sta SOTTO il cavalletto vuoto, che è dove la macchina c'era
      ctx.fillStyle = 'rgba(0,0,0,.30)';
      ctx.fillRect(52, floorY + 10, 190, 8); ctx.fillRect(92, floorY + 18, 122, 6);

      /* --- un pezzo appeso al gancio, con la targhetta d'ottone --- */
      const pezzo = (px, py, pw, ph, tipo, tono) => {
        ctx.fillStyle = '#8a9098'; ctx.fillRect(px + pw / 2 - 1, py - 9, 3, 9);            // il gancio
        ctx.fillStyle = '#aab0b8'; ctx.fillRect(px + pw / 2 - 4, py - 11, 9, 3);
        const base = tono || '#4a4d54';
        /* i dettagli sono in PROPORZIONE al pezzo, non in pixel fissi: i pezzi
           adesso sono grandi (sotto i sessanta pixel un oggetto dice solo che
           c'è, lezione 59) e con gli offset fissi il dettaglio restava
           minuscolo in un angolo, che è il modo migliore di non farlo vedere. */
        const u = k => Math.max(2, Math.round(pw * k)), v = k => Math.max(2, Math.round(ph * k));
        /* La CANDELA non ha il piastrone: ha la sua sagoma. È il pezzo che gr2
           e gr3 fanno staccare dal gancio — «la candela esce dal suo gancio con
           un piccolo clic pulito» — quindi è il pezzo che il giocatore cerca
           nel quadro, e dentro un rettangolo di lamiera si leggeva come una
           scatola con uno stecco dentro. Da sola, la sagoma la riconosce
           chiunque abbia aperto un cofano una volta nella vita. */
        if (tipo !== 'candela' && tipo !== 'carburatore') {
          // convenzione della lamiera: tre fasce di tono + un pixel chiaro sul filo
          ctx.fillStyle = shade(base, 1.22); ctx.fillRect(px, py, pw, Math.round(ph * 0.3));
          ctx.fillStyle = base; ctx.fillRect(px, py + Math.round(ph * 0.3), pw, Math.round(ph * 0.42));
          ctx.fillStyle = shade(base, 0.68); ctx.fillRect(px, py + Math.round(ph * 0.72), pw, Math.round(ph * 0.28));
          ctx.fillStyle = shade(base, 1.55); ctx.fillRect(px, py, pw, 2);
        }
        if (tipo === 'testata') {                                   // quattro sedi valvole in fila
          ctx.fillStyle = '#1d1f24';
          for (let k = 0; k < 4; k++) ctx.fillRect(px + u(0.09) + k * Math.round((pw - u(0.18)) / 4), py + v(0.34), u(0.13), v(0.30));
          ctx.fillStyle = shade(base, 1.35);                         // i prigionieri lungo il filo
          for (let k = 0; k < 5; k++) ctx.fillRect(px + u(0.06) + k * Math.round((pw - u(0.12)) / 5), py + v(0.78), u(0.06), v(0.10));
        } else if (tipo === 'carburatore') {
          /* Anche il carburatore ha la sua sagoma e non il piastrone: dentro un
             rettangolo era una CASSETTA DI LEGNO, che in una rimessa è la cosa
             più facile del mondo da confondere. Quello per cui un carburatore
             si riconosce a colpo d'occhio è il tamburo largo e piatto del
             filtro dell'aria sopra un corpo più stretto: quella silhouette lì
             è il disegno, il resto è contorno. */
          const mid = px + Math.round(pw / 2);
          ctx.fillStyle = '#3d4148'; ctx.fillRect(mid - u(0.07), py, u(0.14), v(0.08));         // il bullone del coperchio
          ctx.fillStyle = shade(base, 0.85); ctx.fillRect(px, py + v(0.07), pw, v(0.17));       // il filtro dell'aria
          ctx.fillStyle = shade(base, 1.3); ctx.fillRect(px, py + v(0.07), pw, v(0.05));
          ctx.fillStyle = shade(base, 0.6); ctx.fillRect(px, py + v(0.21), pw, v(0.03));
          ctx.fillStyle = shade(base, 1.12); ctx.fillRect(mid - u(0.22), py + v(0.24), u(0.44), v(0.32)); // il corpo
          ctx.fillStyle = shade(base, 0.8); ctx.fillRect(mid + u(0.10), py + v(0.24), u(0.12), v(0.32));
          ctx.fillStyle = '#8a9098'; ctx.fillRect(mid + u(0.22), py + v(0.30), u(0.20), v(0.07)); // la leva della farfalla
          ctx.fillStyle = '#6a7078'; ctx.fillRect(mid - u(0.42), py + v(0.38), u(0.20), v(0.06)); // il raccordo benzina
          ctx.fillStyle = shade(base, 0.95); ctx.fillRect(mid - u(0.30), py + v(0.56), u(0.60), v(0.30)); // la vaschetta
          ctx.fillStyle = shade(base, 1.25); ctx.fillRect(mid - u(0.30), py + v(0.56), u(0.60), v(0.05));
          ctx.fillStyle = '#3d4148'; ctx.fillRect(mid - u(0.05), py + v(0.86), u(0.10), v(0.11)); // la vite di scarico
        } else if (tipo === 'candela') {
          const mid = px + Math.round(pw / 2);
          ctx.fillStyle = '#8a9098'; ctx.fillRect(mid - u(0.05), py, u(0.10), v(0.08));      // il dado del cavo
          ctx.fillStyle = '#e0dcd0'; ctx.fillRect(mid - u(0.15), py + v(0.07), u(0.30), v(0.36)); // la ceramica
          ctx.fillStyle = '#f0ece0'; ctx.fillRect(mid - u(0.15), py + v(0.07), u(0.09), v(0.36));
          ctx.fillStyle = '#c8c2b4';                                                          // le tre gole della ceramica
          for (let k = 0; k < 3; k++) ctx.fillRect(mid - u(0.17), py + v(0.13) + k * v(0.08), u(0.34), v(0.03));
          ctx.fillStyle = '#9aa0a8'; ctx.fillRect(mid - u(0.26), py + v(0.43), u(0.52), v(0.17)); // il dado esagonale
          ctx.fillStyle = '#b8bec6'; ctx.fillRect(mid - u(0.26), py + v(0.43), u(0.52), v(0.04));
          ctx.fillStyle = '#6a7078'; ctx.fillRect(mid - u(0.17), py + v(0.60), u(0.34), v(0.26)); // il gambo filettato
          ctx.fillStyle = '#4c5258';
          for (let k = 0; k < 4; k++) ctx.fillRect(mid - u(0.17), py + v(0.63) + k * v(0.06), u(0.34), v(0.02));
          ctx.fillStyle = '#8a9098'; ctx.fillRect(mid - u(0.04), py + v(0.86), u(0.08), v(0.14)); // l'elettrodo
          ctx.fillStyle = '#6a7078'; ctx.fillRect(mid + u(0.04), py + v(0.90), u(0.13), v(0.05)); // e la massa
        } else if (tipo === 'pistone') {                            // cielo, fasce elastiche e biella
          ctx.fillStyle = '#2a2d33';
          for (let k = 0; k < 3; k++) ctx.fillRect(px + u(0.08), py + v(0.14) + k * v(0.12), pw - u(0.16), v(0.06));
          ctx.fillStyle = '#6a7078'; ctx.fillRect(px + Math.round(pw / 2) - u(0.07), py + v(0.58), u(0.14), v(0.42));
          ctx.fillStyle = '#8a9098'; ctx.fillRect(px + Math.round(pw / 2) - u(0.11), py + v(0.88), u(0.22), v(0.12));
        } else if (tipo === 'guarnizione') {                        // un anello piatto, il buco vero
          ctx.fillStyle = '#1d1f24'; ctx.fillRect(px + u(0.16), py + v(0.16), pw - u(0.32), ph - v(0.32));
          ctx.fillStyle = shade(base, 1.3); ctx.fillRect(px + u(0.24), py + v(0.24), pw - u(0.48), ph - v(0.48));
        }
        // (la cinghia dentata l'ho tolta: nessuna bacheca la appende più, e un
        //  ramo che nessuno chiama è una funzione costruita e vuota, lezione 44)
        // la targhetta d'ottone incisa a mano: c'è sotto OGNI pezzo, come dice gr1
        const tw = Math.round(pw * 0.66);
        ctx.fillStyle = '#8a6a1d'; ctx.fillRect(px + pw / 2 - tw / 2, py + ph + 5, tw, 10);
        ctx.fillStyle = '#c8a032'; ctx.fillRect(px + pw / 2 - tw / 2, py + ph + 5, tw, 3);
        ctx.fillStyle = '#6a4f14'; ctx.fillRect(px + pw / 2 - tw / 2 + 4, py + ph + 10, tw - 8, 3);
      };

      /* --- LA BACHECA DEL 2024, e dentro IL MOTORE: 306×176, un terzo
             dell'inquadratura da solo.

             La stesura prima di questa aveva già la bacheca giusta al posto
             della macchina intera, ma dentro sbagliava la gerarchia: il motore
             stava 152 px e intorno gli girava una corona di OTTO pezzi da
             44-58 px. Sotto i sessanta pixel un oggetto non dice cosa è, dice
             solo che c'è (lezione 59) — quindi il quadro aveva nove macchie e
             nessun soggetto, ed era la stessa malattia della macchina intera
             solo travestita da museo. Adesso: il motore grande, e CINQUE pezzi
             grandi appesi intorno, non otto piccoli. Il dettaglio piccolo sta
             DENTRO il motore, dove il giocatore lo va a cercare. --- */
      const bx = 246, by = 12, bw = 470, bh = 268;
      blocks(ctx, bx - 8, by - 8, bw + 16, bh + 16, '#4a3524', 8, r, 0.12);        // la cornice di legno
      ctx.fillStyle = '#6a5238'; ctx.fillRect(bx - 8, by - 8, bw + 16, 4);
      blocks(ctx, bx, by, bw, bh, '#1d2a26', 10, r, 0.10);                          // il fondo di feltro
      ctx.fillStyle = 'rgba(0,0,0,.28)'; ctx.fillRect(bx, by, bw, 6); ctx.fillRect(bx, by, 6, bh);

      /* Le misure del motore sono quelle che ci STANNO nel feltro con margine,
         e le ho dovute rifare una volta: alla prima stesura la puleggia
         sporgeva a sinistra sulla cornice e la tromba del carburatore usciva
         dal bordo di sopra. Un pezzo appeso che esce dalla bacheca non legge
         come un pezzo appeso: legge come un errore di disegno, e in una scena
         che parla di ORDINE maniacale è l'ultimo errore che si può permettere.
         Quindi: 296×150 dentro un feltro di 470×268, con sei pixel di aria
         sotto la puleggia a sinistra e otto sopra il filtro dell'aria. */
      const ex = bx + 40, ey = by + 48, ew = 296, eh = 150;
      const colX = bx + bw - 68;                                    // la colonna dei pezzi, a destra
      /* IL FIL DI FERRO: il domino di gr2 si vede, perché è la meccanica —
         gr2 dice «ogni pezzo è appeso a un gancio sottile, collegato al
         successivo con un fil di ferro quasi invisibile». Quindi è UNA linea
         sola, e passa per i ganci di tutti i pezzi: si capisce a occhio che
         tirare quello sbagliato tira anche gli altri. */
      ctx.fillStyle = '#9aa0a8';
      ctx.fillRect(bx + 30, ey + eh + 6, colX - bx - 29, 2);                        // la traversa sotto il motore
      ctx.fillRect(colX, by + 26, 2, ey + eh - by + 18);                            // e la montante a destra
      // le catene: a MAGLIE, perché due bastoncini bianchi leggevano come antenne
      for (const cxx of [ex + 52, ex + ew - 58]) {
        for (let k = by + 4; k < ey - 8; k += 6) {
          ctx.fillStyle = '#9aa0a8'; ctx.fillRect(cxx, k, 6, 4);
          ctx.fillStyle = '#5c6268'; ctx.fillRect(cxx + 1, k + 1, 4, 2);
        }
      }
      ctx.fillStyle = '#8a9098';                                                   // i golfari di sollevamento
      ctx.fillRect(ex + 44, ey - 10, 22, 10); ctx.fillRect(ex + ew - 66, ey - 10, 22, 10);
      ctx.fillStyle = '#aab0b8'; ctx.fillRect(ex + 44, by + 2, 22, 5); ctx.fillRect(ex + ew - 66, by + 2, 22, 5);

      /* il coperchio punterie: lega chiara, nervature longitudinali e i suoi
         otto bulloni sul bordo — è la parte che su un motore vero brilla */
      ctx.fillStyle = '#767c86'; ctx.fillRect(ex + 34, ey, ew - 76, 28);
      ctx.fillStyle = '#8f959f'; ctx.fillRect(ex + 34, ey, ew - 76, 4);
      ctx.fillStyle = '#6a707a'; for (let k = 0; k < 3; k++) ctx.fillRect(ex + 44, ey + 8 + k * 6, ew - 96, 3);
      ctx.fillStyle = '#5c626c'; ctx.fillRect(ex + 34, ey + 25, ew - 76, 3);
      ctx.fillStyle = '#aab0ba';
      for (let k = 0; k < 8; k++) ctx.fillRect(ex + 40 + k * Math.round((ew - 88) / 8), ey + 4, 6, 4);
      // il carburatore col filtro, in cima al collettore di aspirazione
      ctx.fillStyle = '#5a4a30'; ctx.fillRect(ex + 96, ey - 22, 54, 24);
      ctx.fillStyle = '#6e5c3c'; ctx.fillRect(ex + 96, ey - 22, 54, 4);
      ctx.fillStyle = '#3d3524'; ctx.fillRect(ex + 96, ey - 6, 54, 4);
      ctx.fillStyle = '#2a2d33'; ctx.fillRect(ex + 110, ey - 31, 26, 10);          // la tromba d'aspirazione
      ctx.fillStyle = '#3d4148'; ctx.fillRect(ex + 104, ey - 35, 38, 5);
      // la testata, e sotto di lei la linea della guarnizione coi prigionieri
      ctx.fillStyle = '#585d66'; ctx.fillRect(ex, ey + 28, ew, 20);
      ctx.fillStyle = '#6e747e'; ctx.fillRect(ex, ey + 28, ew, 3);
      ctx.fillStyle = '#20242a'; ctx.fillRect(ex, ey + 48, ew, 5);
      ctx.fillStyle = '#8a9098'; for (let k = 0; k < 10; k++) ctx.fillRect(ex + 8 + k * 29, ey + 33, 6, 6);
      /* il monoblocco: tre fasce di tono (la convenzione della lamiera) e le
         QUATTRO nervature dei cilindri, che sono la cosa che fa leggere «motore
         a quattro cilindri» invece di «cassa di metallo» */
      ctx.fillStyle = '#4e525a'; ctx.fillRect(ex, ey + 53, ew, 34);
      ctx.fillStyle = '#3e424a'; ctx.fillRect(ex, ey + 87, ew, 28);
      ctx.fillStyle = '#34383f'; ctx.fillRect(ex, ey + 115, ew, 9);
      ctx.fillStyle = '#6e747e'; ctx.fillRect(ex, ey + 53, ew, 2);
      for (let k = 0; k < 4; k++) {
        const cx0 = ex + 20 + k * 68;
        ctx.fillStyle = '#565b64'; ctx.fillRect(cx0, ey + 57, 40, 56);            // il bombamento del cilindro
        ctx.fillStyle = '#61666f'; ctx.fillRect(cx0, ey + 57, 40, 3);
        ctx.fillStyle = '#2e323a'; ctx.fillRect(cx0 + 40, ey + 57, 4, 56);        // l'ombra fra due cilindri
      }
      ctx.fillStyle = '#2a2d33'; pixelDisc(ctx, ex + 172, ey + 100, 12, 3);       // il tappo a espansione
      ctx.fillStyle = '#464b53'; pixelDisc(ctx, ex + 172, ey + 100, 7, 3);
      ctx.fillStyle = '#8a9098'; ctx.fillRect(ex + 232, ey + 58, 5, 36);          // l'astina dell'olio
      ctx.fillStyle = '#c8a032'; ctx.fillRect(ex + 229, ey + 54, 11, 6);
      // la coppa dell'olio, più stretta del monoblocco, col tappo di scarico
      ctx.fillStyle = '#292d33'; ctx.fillRect(ex + 30, ey + 124, ew - 60, 26);
      ctx.fillStyle = '#3d4149'; ctx.fillRect(ex + 30, ey + 124, ew - 60, 4);
      ctx.fillStyle = '#22262b'; ctx.fillRect(ex + 76, ey + 146, 30, 6);
      // il collettore di scarico: quattro curve che si riuniscono nella discesa
      ctx.fillStyle = '#5a4038';
      for (let k = 0; k < 4; k++) ctx.fillRect(ex + ew - 6, ey + 56 + k * 17, 26 - k * 4, 10);
      ctx.fillStyle = '#6e4c40'; ctx.fillRect(ex + ew + 14, ey + 56, 12, 66);
      ctx.fillStyle = '#7a5648'; ctx.fillRect(ex + ew + 14, ey + 56, 12, 4);
      ctx.fillStyle = '#4a332c'; ctx.fillRect(ex + ew + 14, ey + 118, 12, 8);
      // la puleggia dell'albero e la cinghia, a sinistra: il muso del motore
      ctx.fillStyle = '#2a2d33'; pixelDisc(ctx, ex - 10, ey + 88, 22, 3);
      ctx.fillStyle = '#6a7078'; pixelDisc(ctx, ex - 10, ey + 88, 12, 3);
      ctx.fillStyle = '#2a2d33'; pixelDisc(ctx, ex - 10, ey + 88, 5, 3);
      ctx.fillStyle = '#1a1c1e'; ctx.fillRect(ex - 32, ey + 64, 6, 48);           // la cinghia
      ctx.fillStyle = '#464b53'; ctx.fillRect(ex - 28, ey + 52, 22, 14);          // la pompa acqua
      /* i pezzi appesi: TRE, e sono esattamente i tre che il testo di gr1 legge
         sulle targhette — «Carburatore — gruppo 2024. Testata — gruppo 2024.
         Candela n°3 — gruppo 2024». Ce n'erano cinque, e il pistone e la
         guarnizione, a quella misura, restavano una scatola con tre righe e una
         cornice vuota: non si riconoscevano, e quindi si sono TOLTI (lezione
         60). Il feltro vuoto che resta non è un buco: è la parete di un museo,
         ed è quello che fa sembrare grande il motore. */
      pezzo(colX - 22, by + 26, 44, 84, 'candela', '#565b62');
      pezzo(colX - 34, by + 150, 68, 58, 'carburatore', '#5a4a30');
      pezzo(bx + 46, ey + eh + 14, 104, 34, 'testata', '#50555d');
      // la targa grande della bacheca: l'anno del gruppo, in ottone
      ctx.fillStyle = '#8a6a1d'; ctx.fillRect(bx + 186, ey + eh + 16, 140, 32);
      ctx.fillStyle = '#c8a032'; ctx.fillRect(bx + 186, ey + eh + 16, 140, 6);
      ctx.fillStyle = '#6a4f14'; ctx.fillRect(bx + 196, ey + eh + 28, 120, 5);
      ctx.fillRect(bx + 196, ey + eh + 38, 82, 4);

      /* --- LE ALTRE DUE BACHECHE, più vecchie: tagliate dai bordi, perché
             stanno sulla stessa parete e quindi hanno la stessa scala --- */
      // 1974, la Bianchina: due cilindri, mezzo motore, e la polvere
      blocks(ctx, -30, 40, 232, 216, '#3f2d1f', 8, r, 0.12);
      blocks(ctx, -22, 48, 216, 200, '#1a2320', 10, r, 0.10);
      ctx.fillStyle = '#8a9098'; ctx.fillRect(-22, 186, 200, 2); ctx.fillRect(150, 112, 2, 74);
      ctx.fillStyle = '#4a4e56'; ctx.fillRect(28, 78, 92, 20);
      ctx.fillStyle = '#40444b'; ctx.fillRect(28, 98, 92, 30);
      ctx.fillStyle = '#5c6068'; ctx.fillRect(28, 78, 92, 2);
      ctx.fillStyle = '#33373e'; ctx.fillRect(40, 128, 68, 16);
      ctx.fillStyle = '#6a7078'; ctx.fillRect(40, 64, 30, 14); ctx.fillRect(78, 64, 30, 14);
      ctx.fillStyle = '#8a9098'; ctx.fillRect(52, 50, 3, 14); ctx.fillRect(92, 50, 3, 14);
      pezzo(24, 196, 44, 28, 'candela', '#4a4f56');
      pezzo(104, 196, 44, 28, 'guarnizione', '#43474e');
      ctx.fillStyle = '#8a6a1d'; ctx.fillRect(40, 154, 76, 16);
      ctx.fillStyle = '#c8a032'; ctx.fillRect(40, 154, 76, 4);
      ctx.fillStyle = 'rgba(120,110,86,.16)'; ctx.fillRect(-22, 48, 216, 200);      // il velo di polvere
      // 1949: quasi solo un'ombra, ma la griglia dei ganci si legge
      blocks(ctx, 764, 34, 226, 220, '#3f2d1f', 8, r, 0.12);
      blocks(ctx, 772, 42, 210, 204, '#181f1d', 10, r, 0.10);
      ctx.fillStyle = '#6a7078'; ctx.fillRect(780, 184, 196, 2); ctx.fillRect(800, 110, 2, 74);
      ctx.fillStyle = '#42464d'; ctx.fillRect(834, 74, 96, 20);
      ctx.fillStyle = '#383c42'; ctx.fillRect(834, 94, 96, 32);
      ctx.fillStyle = '#52565d'; ctx.fillRect(834, 74, 96, 2);
      ctx.fillStyle = '#2a2e33'; ctx.fillRect(846, 126, 72, 16);
      ctx.fillStyle = '#8a9098'; ctx.fillRect(858, 44, 3, 30); ctx.fillRect(902, 44, 3, 30);
      pezzo(788, 194, 42, 26, 'pistone', '#3f444a');
      pezzo(864, 194, 42, 26, 'testata', '#3a3f45');
      ctx.fillStyle = '#8a6a1d'; ctx.fillRect(846, 152, 72, 15);
      ctx.fillStyle = '#c8a032'; ctx.fillRect(846, 152, 72, 4);
      ctx.fillStyle = 'rgba(120,110,86,.22)'; ctx.fillRect(772, 42, 210, 204);

      /* --- la lampada da officina che tiene il trofeo sotto una luce --- */
      ctx.fillStyle = '#2a2a30'; ctx.fillRect(bx + bw / 2 - 2, 0, 4, 16);
      ctx.fillStyle = '#3a3a42'; ctx.fillRect(bx + bw / 2 - 22, 16, 45, 9);
      ctx.fillStyle = '#4a4a52'; ctx.fillRect(bx + bw / 2 - 22, 16, 45, 3);
      ctx.fillStyle = '#f0e0a8'; ctx.fillRect(bx + bw / 2 - 9, 25, 20, 5);
      glow(ctx, bx + bw / 2, 30, 90, 54, '232,216,160');
      ctx.fillStyle = 'rgba(240,224,168,.055)';                                     // il cono che scende sul motore
      for (let k = 0; k < 22; k++) ctx.fillRect(bx + bw / 2 - 22 - k * 5, 28 + k * 9, 45 + k * 10, 9);
      // e una lampada spenta sul fondo, per dire che la stanza continua
      ctx.fillStyle = '#2a2a30'; ctx.fillRect(214, 0, 3, 22);
      ctx.fillStyle = '#3a3a42'; ctx.fillRect(200, 22, 31, 8);

      /* --- a terra: il cavalletto vuoto su cui la macchina NON c'è più.
             Sta a SINISTRA e non in mezzo: in mezzo, con la bacheca cresciuta,
             gli restavano venti pixel di pavimento e si vedevano solo le
             gambe — un oggetto che dice «non c'è niente sopra» ha bisogno di
             farsi vedere tutto, o non dice niente. --- */
      ctx.fillStyle = '#4a3524';
      ctx.fillRect(46, floorY - 26, 168, 7);
      ctx.fillRect(54, floorY - 19, 7, 19); ctx.fillRect(200, floorY - 19, 7, 19);
      ctx.fillRect(72, floorY - 19, 5, 19); ctx.fillRect(184, floorY - 19, 5, 19);
      ctx.fillStyle = '#5d4530'; ctx.fillRect(46, floorY - 26, 168, 3);
      ctx.fillStyle = '#5a6a5a'; ctx.fillRect(690, floorY - 30, 22, 30);            // la tanica
      ctx.fillStyle = '#6a7a6a'; ctx.fillRect(690, floorY - 30, 22, 3);
      ctx.fillStyle = '#2e3630'; ctx.fillRect(696, floorY - 34, 9, 5);
      ctx.fillStyle = '#6a5a45'; ctx.fillRect(724, floorY - 20, 26, 20);            // e una cassetta di legno
      ctx.fillStyle = '#7d6a52'; ctx.fillRect(724, floorY - 20, 26, 3);
    },

    albaRelais(ctx, W, H) {
      const r = rng(97);
      skyGradient(ctx, W, H, '#4a6a9a', '#e8a05a', 12);
      // il sole che sale sul filo dei monti
      moon(ctx, W * 0.5, H * 0.46, 38, '#f5d878', false);
      ctx.fillStyle = 'rgba(245,216,120,.2)'; ctx.fillRect(0, H * 0.38, W, H * 0.22);
      hills(ctx, W, H * 0.52, 60, '#3a4a5a', r, 38);
      hills(ctx, W, H * 0.62, 70, '#2d3a48', r, 32);
      const g = H - 70;
      hills(ctx, W, g, 60, '#243444', r, 30);
      // la villa, di giorno: terracotta al sole, com'è davvero
      const vx = W * 0.58, vw = W * 0.30, vh = 96;
      blocks(ctx, vx, g - vh, vw, vh, '#c05a48', 8, r, 0.08);
      blocks(ctx, vx - 5, g - vh - 3, vw + 10, 6, '#e8dcc8', 7, r, 0.04);
      for (let i = 0; i < 5; i++) {
        const rw = (vw + 20) * (1 - i / 6);
        blocks(ctx, vx - 10 + ((vw + 20) - rw) / 2, g - vh - 8 - i * 8, rw, 9, '#8a4a34', 8, r, 0.14);
      }
      // persiane a doghe chiare, aperte sul mattino
      for (let i = 0; i < 4; i++) {
        const wx = vx + 12 + i * (vw - 30) / 3;
        ctx.fillStyle = '#e8e4da'; ctx.fillRect(wx - 5, g - vh + 20, 5, 18); ctx.fillRect(wx + 13, g - vh + 20, 5, 18);
        ctx.fillStyle = '#6a86a0'; ctx.fillRect(wx, g - vh + 20, 13, 18);
      }
      ctx.fillStyle = '#3a2620'; ctx.fillRect(vx + vw / 2 - 9, g - 26, 18, 26);
      // la gemella ocra, dietro
      blocks(ctx, W * 0.40, g - 58, W * 0.13, 58, '#c8963e', 7, r, 0.08);
      for (let i = 0; i < 4; i++) {
        const rw2 = (W * 0.13 + 12) * (1 - i / 5);
        blocks(ctx, W * 0.40 - 6 + ((W * 0.13 + 12) - rw2) / 2, g - 58 - 5 - i * 6, rw2, 7, '#8a4a34', 6, r, 0.12);
      }
      // ulivi nel giardino del mattino (dopo il terreno, per non seppellirne la base)
      ground(ctx, W, H, g, '#3a5a44', r, 12, 8);
      olive(ctx, W * 0.34, g + 4, 40, r);
      olive(ctx, W * 0.96, g + 2, 44, r);
      // la piscina, tranquilla, coi CINQUE accappatoi al sole
      blocks(ctx, W * 0.06, g + 8, W * 0.34, H - g - 14, '#4aa0b8', 10, r, 0.1);
      ctx.fillStyle = 'rgba(255,255,255,.3)';
      for (let i = 0; i < 5; i++) ctx.fillRect(W * 0.08 + r() * W * 0.28, g + 12 + r() * (H - g - 22), 16, 2);
      for (let i = 0; i < 5; i++) {
        const lx = W * 0.44 + (i % 3) * 40, ly = g + 14 + Math.floor(i / 3) * 18;
        ctx.fillStyle = '#f0ece4'; ctx.fillRect(lx, ly, 26, 9);
        ctx.fillStyle = '#c8a032'; ctx.fillRect(lx + 9, ly + 3, 7, 3);
      }
      // il cancello APERTO: due pilastri e l'anta spalancata contro la siepe
      blocks(ctx, W * 0.015, g - 46, 12, 50, '#8a8074', 6, r, 0.1);
      blocks(ctx, W * 0.17, g - 46, 12, 50, '#8a8074', 6, r, 0.1);
      ctx.fillStyle = '#3a3038';
      for (let i = 0; i < 5; i++) ctx.fillRect(W * 0.032 + i * 5, g - 38 + i * 2, 3, 34);
      ctx.fillRect(W * 0.03, g - 40, 28, 3);
      // uccellini veri
      ctx.strokeStyle = '#3a3a45'; ctx.lineWidth = 2;
      for (const [bx, by] of [[W * 0.22, 60], [W * 0.28, 76], [W * 0.75, 56]]) {
        ctx.beginPath(); ctx.moveTo(bx - 7, by); ctx.lineTo(bx, by - 5); ctx.lineTo(bx + 7, by); ctx.stroke();
      }
    },
  };

  /* Disegna una scena, con eventuali eroi e PNG.
     npcKeys accetta stringhe ('gerbold') oppure oggetti posizionati:
     { key, x, y, scale, flip } con x/y in frazioni di larghezza/altezza. */
  function paint(canvasId, locationKey, heroKeys = null, npcKeys = null) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    const W = canvas.width, H = canvas.height;
    const painter = painters[locationKey] || painters.corridoio;
    painter(ctx, W, H);
    if (heroKeys && heroKeys.length) heroesRow(ctx, W, H - 8, heroKeys, 3);
    if (npcKeys && npcKeys.length) drawNpcs(ctx, W, H, npcKeys);
  }

  function drawNpcs(ctx, W, H, npcKeys) {
    // i PNG senza posizione esplicita vengono allineati a destra, sul terreno
    const plain = npcKeys.filter(n => typeof n === 'string');
    const placed = npcKeys.filter(n => typeof n === 'object' && n);
    const scale = 5, size = 16 * scale;
    // i piedi stanno sopra la didascalia, altrimenti i personaggi finiscono coperti
    const baseFeet = H - 34;
    let x = Math.floor(W * 0.70 - (plain.length - 1) * (size + 16) / 2);
    for (const key of plain) {
      const def = Sprites.registry[key];
      if (def) {
        ctx.fillStyle = 'rgba(0,0,0,.35)';
        ctx.fillRect(x + 6, baseFeet - 4, size - 12, 8);
        Sprites.drawSprite(ctx, def.map, def.palette, x, baseFeet - size, scale, true);
      }
      x += size + 16;
    }
    for (const n of placed) {
      const def = Sprites.registry[n.key];
      if (!def) continue;
      const s = n.scale || 5, sz = 16 * s;
      const px = Math.round((n.x != null ? n.x * W : W * 0.7) - sz / 2);
      // n.y indica dove poggiano i PIEDI del personaggio (frazione di altezza)
      const finalY = n.y != null ? Math.round(n.y * H) - sz : H - 34 - sz;
      ctx.fillStyle = 'rgba(0,0,0,.3)';
      ctx.fillRect(px + 6, finalY + sz - 4, sz - 12, 7);
      Sprites.drawSprite(ctx, def.map, def.palette, px, finalY, s, n.flip !== false);
    }
  }

  return { paint, painters, rng, blocks, shade, heroesRow, tree, willow, house, torch, sign, ground, hills, moon, setEclipse, getEclipse, pixelDisc };
})();
