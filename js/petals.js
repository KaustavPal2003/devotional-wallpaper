/* petals.js — Falling petals canvas. */
/* ---------- Falling petals ---------- */
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
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
