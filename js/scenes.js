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

  function shade(hex, f) {
    const n = parseInt(hex.slice(1), 16);
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
        ctx.fillStyle = 'rgba(245,197,66,.16)'; ctx.fillRect(wx - 6, groundY - h + 6, 26, 26);
        ctx.fillStyle = '#f5c542'; ctx.fillRect(wx, groundY - h + 12, 14, 14);
        ctx.fillStyle = '#5a4530'; ctx.fillRect(wx + 6, groundY - h + 12, 2, 14);
      }
    }
  }

  // Torcia con staffa: non fluttua più a mezz'aria
  function torch(ctx, x, y, bracket = true) {
    if (bracket) { ctx.fillStyle = '#3a3a45'; ctx.fillRect(x - 5, y + 4, 16, 4); ctx.fillRect(x - 5, y + 4, 4, 12); }
    ctx.fillStyle = '#6e4a2a'; ctx.fillRect(x, y, 6, 22);
    ctx.fillStyle = 'rgba(245,166,35,.16)'; ctx.fillRect(x - 14, y - 22, 34, 34);
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

  // Alone luminoso morbido (fasce concentriche): evita il rettangolo squadrato
  function glow(ctx, x, y, w, h, rgb) {
    for (let i = 3; i >= 1; i--) {
      ctx.fillStyle = `rgba(${rgb},${0.05 * i})`;
      ctx.fillRect(x - w * i / 2, y - h * i / 2, w * i, h * i);
    }
  }

  function crystalVein(ctx, x, y, n, rand) {
    for (let i = 0; i < n; i++) {
      const cx = x + (rand() - 0.5) * 34, cy = y + (rand() - 0.5) * 26;
      const s = 6 + Math.round(rand() * 5);
      ctx.fillStyle = 'rgba(90,216,224,.16)'; ctx.fillRect(cx - 5, cy - 5, s + 10, s + 10);
      ctx.fillStyle = '#5ad8e0'; ctx.fillRect(cx, cy, s, s);
      ctx.fillStyle = '#a0f0f5'; ctx.fillRect(cx + 1, cy + 1, Math.max(2, s - 4), Math.max(2, s - 4));
    }
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
      blocks(ctx, W * 0.30, g - 96, W * 0.40, 96, '#1a1014', 8, r, 0.1);
      // ali laterali
      blocks(ctx, W * 0.24, g - 64, W * 0.10, 64, '#150c10', 8, r, 0.1);
      blocks(ctx, W * 0.66, g - 64, W * 0.10, 64, '#150c10', 8, r, 0.1);
      // tetto a padiglione
      for (let i = 0; i < 5; i++) {
        const rw = W * 0.44 - i * W * 0.04;
        blocks(ctx, W * 0.28 + (W * 0.44 - rw) / 2, g - 96 - 10 - i * 9, rw, 10, '#0f0a0c', 8, r, 0.1);
      }
      // torretta liberty
      blocks(ctx, W * 0.46, g - 150, W * 0.08, 60, '#1d1216', 8, r, 0.1);
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
      // nebbia bassa
      ctx.fillStyle = 'rgba(180,170,180,.08)';
      for (let i = 0; i < 8; i++) ctx.fillRect(r() * W, g - 8 + r() * 20, 80 + r() * 120, 6);
    },

    tornanti(ctx, W, H) {
      const r = rng(7);
      skyGradient(ctx, W, H, '#1a0f1d', '#4a2030', 10);
      stars(ctx, W, H, r, 26);
      moon(ctx, W * 0.84, 60, 22, '#c8b8c0', false);
      // profilo dei monti su più piani
      hills(ctx, W, H * 0.44, 70, '#1d1218', r, 40);
      hills(ctx, W, H * 0.62, 90, '#150d12', r, 34);
      const g = H - 60;
      hills(ctx, W, g + 8, 70, '#10090d', r, 30);
      // castagni scuri
      for (let i = 0; i < 6; i++) tree(ctx, 30 + i * (W / 5.5) + (r() * 30 - 15), g + 10, 66 + r() * 40, '#14201a', '#241a14', r);
      ground(ctx, W, H, g, '#182018', r, 12, 10);
      // la strada che serpeggia a tornanti
      ctx.fillStyle = '#3a3440';
      for (let i = 0; i < 4; i++) {
        const y = H * 0.52 + i * H * 0.115;
        blocks(ctx, W * (0.06 + (i % 2) * 0.16), y, W * 0.72, 16, '#332e3a', 10, r, 0.12);
      }
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
      // Pietrafonda in basso: persiane tutte chiuse
      for (let i = 0; i < 5; i++) {
        const px = W * 0.62 + (i % 3) * 30, py = H - 44 + Math.floor(i / 3) * 16;
        blocks(ctx, px, py, 24, 14, '#2a2228', 6, r, 0.12);
        ctx.fillStyle = '#1a1418'; ctx.fillRect(px + 4, py + 3, 5, 7); ctx.fillRect(px + 14, py + 3, 5, 7);
      }
    },

    relais(ctx, W, H) {
      const r = rng(11);
      skyGradient(ctx, W, H, '#120a12', '#331522', 10);
      stars(ctx, W, H, r, 34);
      moon(ctx, W * 0.12, 58, 24, '#c8b8c0', false);
      const g = H - 70;
      hills(ctx, W, g - 40, 46, '#150d12', r, 34);
      // la villa liberty color osso
      const vx = W * 0.22, vw = W * 0.56, vh = 150;
      blocks(ctx, vx, g - vh, vw, vh, '#c8bca8', 10, r, 0.08);
      // marcapiano e cornici
      blocks(ctx, vx - 6, g - vh + 66, vw + 12, 8, '#a89878', 8, r, 0.06);
      // tetto
      for (let i = 0; i < 6; i++) {
        const rw = (vw + 30) * (1 - i / 7);
        blocks(ctx, vx - 15 + ((vw + 30) - rw) / 2, g - vh - 8 - i * 9, rw, 10, '#5a3038', 8, r, 0.12);
      }
      // torretta
      blocks(ctx, vx + vw * 0.42, g - vh - 66, vw * 0.16, 66, '#c0b49e', 8, r, 0.08);
      for (let i = 0; i < 4; i++) blocks(ctx, vx + vw * 0.41 + i * 5, g - vh - 74 - i * 8, vw * 0.18 - i * 10, 9, '#5a3038', 6, r, 0.1);
      // finestre color miele con la vignetta calda
      for (let fx = 0; fx < 5; fx++) {
        const wx = vx + 16 + fx * (vw - 40) / 4;
        glow(ctx, wx + 8, g - vh + 34, 22, 26, '232,182,76');
        ctx.fillStyle = '#e8b64c'; ctx.fillRect(wx, g - vh + 22, 16, 24);
        ctx.fillStyle = '#8a6a2d'; ctx.fillRect(wx + 7, g - vh + 22, 2, 24);
        ctx.fillStyle = '#e8b64c'; ctx.fillRect(wx, g - 58, 16, 24);
        ctx.fillStyle = '#8a6a2d'; ctx.fillRect(wx + 7, g - 58, 2, 24);
      }
      // pensilina liberty sull'ingresso
      ctx.fillStyle = '#3a3440';
      ctx.fillRect(vx + vw / 2 - 30, g - 96, 60, 6);
      ctx.fillRect(vx + vw / 2 - 28, g - 92, 4, 34); ctx.fillRect(vx + vw / 2 + 24, g - 92, 4, 34);
      ctx.fillStyle = '#241a1e'; ctx.fillRect(vx + vw / 2 - 14, g - 88, 28, 30);
      // viale di ghiaia rastrellata a onde
      ground(ctx, W, H, g, '#1d1418', r, 12, 8);
      ctx.fillStyle = '#d8d0c0';
      for (let i = 0; i < 12; i++) blocks(ctx, W * 0.30 + (i % 2) * 6, g + 8 + i * ((H - g - 10) / 12), W * 0.38, 5, '#cfc4ae', 8, r, 0.06);
      // siepi a forme che non vuoi riguardare
      for (const [bx, bw] of [[0.06, 0.10], [0.82, 0.12]]) {
        blocks(ctx, W * bx, g - 40, W * bw, 44, '#1a2e1d', 8, r, 0.2);
        blocks(ctx, W * bx + 10, g - 58, W * bw - 24, 22, '#16281a', 8, r, 0.2);
        // due buchi della misura esatta di due occhi
        ctx.fillStyle = '#0a0f0a';
        ctx.fillRect(W * bx + 16, g - 50, 5, 5); ctx.fillRect(W * bx + 28, g - 50, 5, 5);
      }
    },

    hall(ctx, W, H) {
      const r = rng(19);
      blocks(ctx, 0, 0, W, H, '#2a2026', 16, r, 0.12);
      const floorY = H - 84;
      // pavimento a scacchi in prospettiva
      for (let row = 0; row < 6; row++) {
        for (let col = -1; col < 22; col++) {
          const t = row / 6;
          const size = 22 + t * 26;
          const x = W / 2 + (col - 10) * size + (row % 2) * size / 2;
          const y = floorY + row * 13;
          ctx.fillStyle = (col + row) % 2 ? '#d8d0c4' : '#1d181c';
          ctx.fillRect(x, y, size, 14);
        }
      }
      // lampadario di cristallo
      ctx.fillStyle = '#8a8478'; ctx.fillRect(W * 0.5 - 2, 0, 4, 26);
      glow(ctx, W * 0.5, 52, 60, 34, '232,182,76');
      ctx.fillStyle = '#c8bca8'; ctx.fillRect(W * 0.5 - 34, 26, 68, 8);
      for (const dx of [-34, -20, -6, 8, 22, 28]) {
        ctx.fillStyle = '#e8e0d0'; ctx.fillRect(W * 0.5 + dx, 34, 5, 10);
        ctx.fillStyle = '#e8b64c'; ctx.fillRect(W * 0.5 + dx - 1, 44, 7, 7);
      }
      // ritratti a olio: gruppi in piscina, epoche diverse
      for (const fx of [0.10, 0.26, 0.62, 0.78]) {
        ctx.fillStyle = '#c8a032'; ctx.fillRect(W * fx - 3, 62, 62, 76);
        ctx.fillStyle = '#8a6a1d'; ctx.fillRect(W * fx, 65, 56, 70);
        ctx.fillStyle = '#3d6890'; ctx.fillRect(W * fx + 3, 100, 50, 32); // la piscina dipinta
        ctx.fillStyle = '#2a1d26'; ctx.fillRect(W * fx + 3, 68, 50, 32);
        // i sorrisi
        ctx.fillStyle = '#d8c8b8';
        for (let p = 0; p < 4; p++) ctx.fillRect(W * fx + 8 + p * 12, 84, 8, 12);
      }
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
      // letto con lini freschi
      blocks(ctx, W * 0.10, floorY - 44, W * 0.34, 44, '#5a4030', 8, r, 0.1);
      blocks(ctx, W * 0.11, floorY - 56, W * 0.32, 18, '#e8e0d0', 8, r, 0.06);
      blocks(ctx, W * 0.12, floorY - 62, W * 0.10, 10, '#d8d0c0', 8, r, 0.06);
      // il cioccolatino e il biglietto sul cuscino
      ctx.fillStyle = '#4a2a1d'; ctx.fillRect(W * 0.155, floorY - 58, 6, 4);
      ctx.fillStyle = '#e8e4dc'; ctx.fillRect(W * 0.24, floorY - 54, 12, 7);
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
        glow(ctx, W * fx + 43, floorY - 60, 60, 30, '61,138,160');
        ctx.fillStyle = '#2a7a8a'; ctx.fillRect(W * fx + 10, floorY - 60, 66, 36);
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
      moon(ctx, W * 0.86, 46, 18, '#c8b8c0', true);
      const deck = H * 0.44;
      hills(ctx, W, deck - 30, 40, '#0f0a10', r, 36);
      // travertino del bordo
      blocks(ctx, 0, deck, W, H - deck, '#4a4038', 12, r, 0.1);
      // LA PISCINA: rettangolo di luce turchese nel buio
      const px = W * 0.14, pw = W * 0.72, py = deck + 22, ph = H - py - 16;
      glow(ctx, px + pw / 2, py + ph / 2, pw * 0.9, ph * 0.9, '61,158,178');
      blocks(ctx, px, py, pw, ph, '#1d7a92', 12, r, 0.14);
      blocks(ctx, px + 8, py + 8, pw - 16, ph - 16, '#2492ac', 12, r, 0.12);
      // vapore che sale in volute pigre
      ctx.fillStyle = 'rgba(220,240,245,.10)';
      for (let i = 0; i < 10; i++) {
        const vx = px + r() * pw, vy = py - 6 - r() * 26;
        ctx.fillRect(vx, vy, 14 + r() * 18, 5);
      }
      // il riflesso SBAGLIATO: luna piena rossa NELL'ACQUA
      moon(ctx, px + pw * 0.62, py + ph * 0.55, 20, '#8a2432', false);
      ctx.fillStyle = 'rgba(138,36,50,.18)'; ctx.fillRect(px + pw * 0.5, py + 8, pw * 0.26, ph - 16);
      // costellazioni sbagliate, fitte, nell'acqua
      ctx.fillStyle = '#d8ccd8';
      for (let i = 0; i < 22; i++) ctx.fillRect(px + 12 + r() * (pw - 24), py + 10 + r() * (ph - 20), 2, 2);
      // increspature
      ctx.fillStyle = 'rgba(230,250,255,.22)';
      for (let i = 0; i < 9; i++) ctx.fillRect(px + 10 + r() * (pw - 40), py + 8 + r() * (ph - 16), 18 + r() * 26, 2);
      // SEI lettini con SEI accappatoi
      for (let i = 0; i < 6; i++) {
        const lx = W * 0.055 + i * W * 0.155, ly = deck + 4;
        ctx.fillStyle = '#5a5048'; ctx.fillRect(lx, ly - 12, 44, 10);
        ctx.fillStyle = '#3a342e'; ctx.fillRect(lx + 2, ly - 2, 4, 6); ctx.fillRect(lx + 38, ly - 2, 4, 6);
        // accappatoio bianco piegato (il sesto ha gli spilli)
        ctx.fillStyle = i === 5 ? '#e8e4dc' : '#f0ece4';
        ctx.fillRect(lx + 10, ly - 20, 22, 9);
        ctx.fillStyle = '#7a2432'; ctx.fillRect(lx + 18, ly - 17, 6, 3);
      }
      // le luci sott'acqua
      for (const fx of [0.22, 0.5, 0.78]) {
        glow(ctx, W * fx, py + ph - 10, 26, 14, '120,220,235');
        ctx.fillStyle = '#a8e8f0'; ctx.fillRect(W * fx - 5, py + ph - 12, 10, 5);
      }
    },

    cantina(ctx, W, H) {
      const r = rng(43);
      blocks(ctx, 0, 0, W, H, '#1d1216', 16, r, 0.2);
      const floorY = H - 54;
      blocks(ctx, 0, floorY, W, H - floorY, '#140c10', 14, r, 0.16);
      // volte in pietra
      for (const fx of [0.18, 0.5, 0.82]) {
        blocks(ctx, W * fx - 56, H * 0.16, 22, H * 0.72, '#2e2026', 10, r, 0.14);
        blocks(ctx, W * fx + 34, H * 0.16, 22, H * 0.72, '#2e2026', 10, r, 0.14);
        blocks(ctx, W * fx - 56, H * 0.10, 112, 20, '#332430', 10, r, 0.14);
      }
      // rastrelliere di bottiglie coi nomi
      for (const fx of [0.04, 0.36, 0.68]) {
        blocks(ctx, W * fx, H * 0.34, W * 0.24, H * 0.42, '#2a1c16', 8, r, 0.12);
        for (let row = 0; row < 4; row++) for (let col = 0; col < 5; col++) {
          ctx.fillStyle = '#1a3a2a';
          ctx.fillRect(W * fx + 8 + col * (W * 0.24 - 16) / 5, H * 0.36 + row * H * 0.10, 12, 7);
          ctx.fillStyle = '#e8e0d0';
          ctx.fillRect(W * fx + 8 + col * (W * 0.24 - 16) / 5 + 3, H * 0.36 + row * H * 0.10 + 2, 6, 3);
        }
      }
      // in fondo: il bagliore del forno del Banchetto
      glow(ctx, W * 0.5, floorY - 18, 90, 40, '200,90,40');
      ctx.fillStyle = '#c85a28'; ctx.fillRect(W * 0.44, floorY - 26, W * 0.12, 20);
      ctx.fillStyle = '#e8a04c'; ctx.fillRect(W * 0.465, floorY - 20, W * 0.07, 12);
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
      moon(ctx, W * 0.16, 50, 20, '#c8b8c0', true);
      const g = H - 66;
      // il muro di nebbia FERMO al confine
      for (let i = 0; i < 6; i++) {
        ctx.fillStyle = `rgba(190,180,195,${0.05 + i * 0.02})`;
        ctx.fillRect(0, H * 0.16 + i * 6, W * 0.085 - i * 3, H);
        ctx.fillRect(W - W * 0.085 + i * 3, H * 0.16 + i * 6, W, H);
      }
      hills(ctx, W, g - 20, 34, '#0f150f', r, 34);
      ground(ctx, W, H, g, '#16241a', r, 12, 8);
      // ghiaia azzurrina rastrellata
      blocks(ctx, W * 0.30, g + 10, W * 0.40, H - g - 14, '#2e3440', 8, r, 0.1);
      // siepi-animali che non vuoi riguardare
      for (const [fx, fw, fh] of [[0.13, 0.10, 54], [0.72, 0.12, 62]]) {
        blocks(ctx, W * fx, g - fh, W * fw, fh + 4, '#14261a', 8, r, 0.2);
        blocks(ctx, W * fx + 8, g - fh - 20, W * fw - 30, 24, '#101f15', 8, r, 0.2);
        ctx.fillStyle = '#060a06';
        ctx.fillRect(W * fx + 14, g - fh - 12, 5, 5); ctx.fillRect(W * fx + 26, g - fh - 12, 5, 5);
      }
      // l'orto recintato di Ada
      blocks(ctx, W * 0.36, g - 34, W * 0.28, 30, '#1d2e1d', 8, r, 0.16);
      ctx.fillStyle = '#4a3226';
      for (let i = 0; i < 8; i++) ctx.fillRect(W * 0.36 + i * W * 0.04, g - 40, 4, 14);
      ctx.fillRect(W * 0.36, g - 34, W * 0.28, 3);
      // le erbe argentate che si scostano da sole
      ctx.fillStyle = '#a8b8ac';
      for (let i = 0; i < 6; i++) ctx.fillRect(W * 0.38 + i * W * 0.04, g - 26 + (i % 2) * 4, 3, 10);
      // lanterne da giardino
      for (const fx of [0.28, 0.68]) {
        ctx.fillStyle = '#3a3440'; ctx.fillRect(W * fx, g - 44, 5, 44);
        glow(ctx, W * fx + 2, g - 52, 16, 14, '232,182,76');
        ctx.fillStyle = '#e8b64c'; ctx.fillRect(W * fx - 2, g - 54, 9, 10);
      }
    },

    pozzo(ctx, W, H) {
      const r = rng(71);
      skyGradient(ctx, W, H, '#0a0710', '#181022', 10);
      stars(ctx, W, H, r, 36);
      moon(ctx, W * 0.80, 48, 20, '#c8b8c0', true);
      const g = H - 60;
      hills(ctx, W, g - 26, 36, '#0f150f', r, 34);
      for (let i = 0; i < 3; i++) willow(ctx, W * (0.12 + i * 0.38), g + 6, 70 + r() * 20, '#14261c', '#241a14', r);
      ground(ctx, W, H, g, '#16241a', r, 12, 8);
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
      // pavimento a scacchi, più scuro del solito
      for (let row = 0; row < 6; row++) for (let col = -1; col < 22; col++) {
        const size = 22 + (row / 6) * 26;
        const x = W / 2 + (col - 10) * size + (row % 2) * size / 2;
        ctx.fillStyle = (col + row) % 2 ? '#8a8074' : '#14100e';
        ctx.fillRect(x, floorY + row * 13, size, 14);
      }
      // i ritratti trasferiti QUI, fitti come parenti a un matrimonio
      for (let i = 0; i < 6; i++) {
        const fx = W * 0.06 + i * W * 0.16;
        ctx.fillStyle = '#c8a032'; ctx.fillRect(fx - 3, 30, 54, 66);
        ctx.fillStyle = '#8a6a1d'; ctx.fillRect(fx, 33, 48, 60);
        ctx.fillStyle = '#2a1d26'; ctx.fillRect(fx + 3, 36, 42, 54);
        ctx.fillStyle = '#d8c8b8';
        for (let p = 0; p < 3; p++) ctx.fillRect(fx + 7 + p * 13, 52, 9, 14);
        // gli occhi che seguono
        ctx.fillStyle = '#100c10';
        for (let p = 0; p < 3; p++) { ctx.fillRect(fx + 9 + p * 13, 56, 2, 2); ctx.fillRect(fx + 13 + p * 13, 56, 2, 2); }
      }
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
      // la villa, di giorno: solo una bella villa un po' stanca
      const vx = W * 0.58, vw = W * 0.30, vh = 96;
      blocks(ctx, vx, g - vh, vw, vh, '#d8ccb4', 8, r, 0.06);
      for (let i = 0; i < 5; i++) {
        const rw = (vw + 20) * (1 - i / 6);
        blocks(ctx, vx - 10 + ((vw + 20) - rw) / 2, g - vh - 6 - i * 8, rw, 9, '#7a4048', 8, r, 0.1);
      }
      ctx.fillStyle = '#6a86a0';
      for (let i = 0; i < 4; i++) ctx.fillRect(vx + 12 + i * (vw - 30) / 3, g - vh + 20, 13, 18);
      ctx.fillStyle = '#3a2620'; ctx.fillRect(vx + vw / 2 - 9, g - 26, 18, 26);
      ground(ctx, W, H, g, '#3a5a44', r, 12, 8);
      // la piscina, tranquilla, coi CINQUE accappatoi al sole
      blocks(ctx, W * 0.06, g + 8, W * 0.34, H - g - 14, '#4aa0b8', 10, r, 0.1);
      ctx.fillStyle = 'rgba(255,255,255,.3)';
      for (let i = 0; i < 5; i++) ctx.fillRect(W * 0.08 + r() * W * 0.28, g + 12 + r() * (H - g - 22), 16, 2);
      for (let i = 0; i < 5; i++) {
        const lx = W * 0.44 + (i % 3) * 40, ly = g + 14 + Math.floor(i / 3) * 18;
        ctx.fillStyle = '#f0ece4'; ctx.fillRect(lx, ly, 26, 9);
        ctx.fillStyle = '#c8a032'; ctx.fillRect(lx + 9, ly + 3, 7, 3);
      }
      // il cancello APERTO
      ctx.fillStyle = '#3a3038';
      ctx.fillRect(W * 0.015, g - 40, 5, 44);
      for (let i = 0; i < 4; i++) ctx.fillRect(W * 0.03 + i * 8, g - 36 + i * 3, 4, 40 - i * 3);
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
    const painter = painters[locationKey] || painters.strada;
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
