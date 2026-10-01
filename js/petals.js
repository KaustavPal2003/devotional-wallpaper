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
  const FEATHER_COUNT = (typeof window.FEATHER_COUNT === 'number') ? window.FEATHER_COUNT : 6;
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
      y: initial ? Math.random() * H : -h - Math.random() * H * .4,
      vy: (16 + Math.random() * 16) * (0.7 + k * 2),                  // slower than petals
      sway: 26 + Math.random() * 34, ph: Math.random() * 6.28, sp: .35 + Math.random() * .4,
      flip: Math.random() * 6.28, vf: .5 + Math.random() * .8,        // slow 3D turn
      shim: Math.random() * 6.28, vs: 1.2 + Math.random() * 1.2,      // iridescent shimmer
      lean: (Math.random() - .5) * .5                                  // personal tilt
    };
  }
  const feathers = reduce ? [] : Array.from({ length: FEATHER_COUNT }, () => makeFeather(true));

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
