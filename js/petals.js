/* petals.js — Falling petals + drifting peacock feathers on one canvas. */
(function petals() {
  const cv = document.getElementById('petals'), ctx = cv.getContext('2d');
  let W, H, dpr;
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  addEventListener('resize', resize); resize();
  const colors = ['#a3122a', '#c2334a', '#f4b6c2', '#f7d3da', '#f6efe6'];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ================= Peacock feather (real image cut-out) ================= */
  // Put peacock-feather.webp in the assets/ folder next to index.html (same place as the lotus images).
  const featherCount = (typeof FEATHER_COUNT === 'number') ? FEATHER_COUNT : 14;   // optional override in js/config.js
  const FEATHER_SRC = 'assets/peacock-feather.webp';
  const SPR_W = 342, SPR_H = 640;            // natural size of the image
  const EYE_DX = 14, EYE_DY = -130;          // eye position relative to the image centre
  const featherImg = new Image();
  let featherReady = false;
  featherImg.onload = () => { featherReady = true; };
  featherImg.src = FEATHER_SRC;

  function makeFeather(initial) {
    const h = (Math.min(W, H) / 1080) * (150 + Math.random() * 90);   // on-screen height in px
    const k = h / SPR_H;
    return {
      k,
      x: Math.random() * W,
      y: initial ? Math.random() * H : -h - Math.random() * H * .15,
      vy: (26 + Math.random() * 24) * (0.7 + k * 2),                  // slower than petals
      sway: 26 + Math.random() * 34, ph: Math.random() * 6.28, sp: .35 + Math.random() * .4,
      flip: Math.random() * 6.28, vf: .5 + Math.random() * .8,        // slow 3D turn
      shim: Math.random() * 6.28, vs: 1.2 + Math.random() * 1.2,      // iridescent shimmer
      lean: (Math.random() - .5) * .5                                  // personal tilt
    };
  }
  const feathers = reduce ? [] : Array.from({ length: featherCount }, () => makeFeather(true));

  function drawFeather(f) {
    ctx.save();
    ctx.translate(f.x, f.y);
    // lean into the direction of drift, like a feather riding the air
    ctx.rotate(f.lean + Math.sin(f.ph) * .42);
    ctx.scale(f.k * (0.62 + Math.abs(Math.cos(f.flip)) * .38), f.k);
    ctx.drawImage(featherImg, -SPR_W / 2, -SPR_H / 2, SPR_W, SPR_H);
    // shimmer: a pulsing teal/gold glow over the eye
    const a = 0.10 + 0.14 * (0.5 + 0.5 * Math.sin(f.shim));
    ctx.globalCompositeOperation = 'lighter';
    const R = 80;
    const gr = ctx.createRadialGradient(EYE_DX, EYE_DY, 4, EYE_DX, EYE_DY, R);
    gr.addColorStop(0, `rgba(80,255,220,${a})`);
    gr.addColorStop(.6, `rgba(240,200,80,${a * .45})`);
    gr.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gr;
    ctx.beginPath(); ctx.arc(EYE_DX, EYE_DY, R, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  /* ================= Bilva patra (বেল পাতা) — three-leaflet leaves ================= */
  const leafCount = (typeof LEAF_COUNT === 'number') ? LEAF_COUNT : 10;                // optional override in js/config.js
  const LEAF_SRC = 'assets/bilva-patra.webp';
  const LEAF_W = 328, LEAF_H = 320;                // natural size of the image
  const leafImg = new Image();
  let leafSprites = null;                          // 3 slightly different greens, so the leaves are not all identical
  leafImg.onload = () => {
    const tint = f => {
      const c = document.createElement('canvas'); c.width = LEAF_W; c.height = LEAF_H;
      const g = c.getContext('2d'); g.filter = f; g.drawImage(leafImg, 0, 0); return c;
    };
    leafSprites = [leafImg, tint('brightness(.8) saturate(1.1)'), tint('brightness(1.12) saturate(.95) hue-rotate(-10deg)')];
  };
  leafImg.src = LEAF_SRC;

  function makeLeaf(initial) {
    const h = (Math.min(W, H) / 1080) * (50 + Math.random() * 44);     // on-screen height in px
    return {
      k: h / LEAF_H, h, v: (Math.random() * 3) | 0,
      x: Math.random() * W, y: initial ? Math.random() * H : -h - Math.random() * H * .25,
      vy: (30 + Math.random() * 34) * (0.6 + h / 110),
      sway: 30 + Math.random() * 50, ph: Math.random() * 6.28, sp: .4 + Math.random() * .7,
      rot: Math.random() * 6.28, vr: (Math.random() - .5) * 1.3,          // slow tumble
      flip: Math.random() * 6.28, vf: .8 + Math.random() * 1.6            // turns face-on / edge-on as it falls
    };
  }
  const leaves = reduce ? [] : Array.from({ length: leafCount }, () => makeLeaf(true));

  /* ================= Petals (unchanged) ================= */
  function make(initial) {
    const s = (Math.min(W, H) / 1080) * (10 + Math.random() * 14);
    return {
      x: Math.random() * W, y: initial ? Math.random() * H : -30 - Math.random() * H * .3,
      s, vy: (28 + Math.random() * 40) * (s / 14),
      sway: 20 + Math.random() * 40, ph: Math.random() * 6.28, sp: .5 + Math.random() * .9,
      rot: Math.random() * 6.28, vr: (Math.random() - .5) * 1.6,
      flip: Math.random() * 6.28, vf: 1 + Math.random() * 2,
      c: colors[(Math.random() * colors.length) | 0]
    };
  }
  const list = Array.from({ length: PETAL_COUNT }, () => make(true));
  let last = performance.now();
  function frame(t) {
    const dt = Math.min((t - last) / 1000, .05); last = t;
    ctx.clearRect(0, 0, W, H);
    for (const p of list) {
      if (!reduce) {
        p.y += p.vy * dt; p.ph += p.sp * dt; p.x += Math.sin(p.ph) * p.sway * dt;
        p.rot += p.vr * dt; p.flip += p.vf * dt;
      }
      if (p.y > H + 30) Object.assign(p, make(false));
      ctx.save();
      ctx.translate(p.x, p.y); ctx.rotate(p.rot);
      ctx.scale(1, Math.abs(Math.cos(p.flip)) * .7 + .3);
      ctx.fillStyle = p.c;
      ctx.beginPath();
      ctx.moveTo(0, -p.s);
      ctx.bezierCurveTo(p.s * .9, -p.s * .5, p.s * .8, p.s * .6, 0, p.s);
      ctx.bezierCurveTo(-p.s * .8, p.s * .6, -p.s * .9, -p.s * .5, 0, -p.s);
      ctx.fill();
      ctx.restore();
    }
    // bilva patra leaves
    if (leafSprites) for (const l of leaves) {
      l.y += l.vy * dt; l.ph += l.sp * dt; l.x += Math.sin(l.ph) * l.sway * dt;
      l.rot += l.vr * dt; l.flip += l.vf * dt;
      if (l.y > H + l.h) Object.assign(l, makeLeaf(false));
      ctx.save();
      ctx.translate(l.x, l.y); ctx.rotate(l.rot);
      ctx.scale(l.k, l.k * (Math.abs(Math.cos(l.flip)) * .65 + .35));
      ctx.drawImage(leafSprites[l.v], -LEAF_W / 2, -LEAF_H / 2, LEAF_W, LEAF_H);
      ctx.restore();
    }
    // peacock feathers, drawn over the petals
    for (const f of feathers) {
      if (!featherReady) break;
      f.y += f.vy * dt; f.ph += f.sp * dt; f.x += Math.sin(f.ph) * f.sway * dt;
      f.flip += f.vf * dt; f.shim += f.vs * dt;
      if (f.y > H + f.k * SPR_H) Object.assign(f, makeFeather(false));
      drawFeather(f);
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
