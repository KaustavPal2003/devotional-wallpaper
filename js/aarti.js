/* aarti.js — Aarti: lamp movement, light trail, sparks, bells at each circle. */
/* =====================================================
   AARTI
   The lamp rests above the taskbar. During an aarti it rises, moves in
   clockwise circles in front of the picture (leaving a trail of light and
   sparks), rings the bells at the start of each circle, then returns.
   ===================================================== */
(function aarti() {
  const lamp = document.getElementById('aarti');
  const tc = document.getElementById('trail'), tctx = tc.getContext('2d');
  let FY = REAL_LAMP ? (LAMP_FLAMES[2][1] - 17) / 150 : 0.27;                       // flame height as a fraction of the lamp's height
  let W, H, dpr, L, Hel, home, C, R;

  function layout() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    tc.width = W * dpr; tc.height = H * dpr;
    tctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    L = lamp.offsetWidth; Hel = L * 1.25;
    lamp.style.height = Hel + 'px';
    home = { x: W / 2, y: H - TASKBAR_PX - 8 - Hel + FY * Hel };   // flame position when resting
    C = { x: W / 2, y: (H - TASKBAR_PX) * 0.46 };                  // centre of the aarti circles
    R = Math.min(W, H - TASKBAR_PX) * 0.2;
  }
  addEventListener('resize', () => { layout(); buildGarland(); });
  layout();

  const RISE = 2.0, PER = 2.6, BACK = 2.0;
  const ease = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  const lerp = (a, b, k) => ({ x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k });

  function aartiState(e) {
    const start = { x: C.x, y: C.y + R };
    const circ = PER * AARTI_CIRCLES;
    if (e < RISE) { const k = ease(e / RISE); return Object.assign(lerp(home, start, k), { k, circle: -1 }); }
    const e2 = e - RISE;
    if (e2 < circ) {
      const a = Math.PI / 2 + (e2 / PER) * Math.PI * 2;
      return { x: C.x + R * 1.12 * Math.cos(a), y: C.y + R * Math.sin(a), k: 1, circle: Math.floor(e2 / PER) };
    }
    const e3 = e2 - circ;
    if (e3 < BACK) { const k = ease(e3 / BACK); return Object.assign(lerp(start, home, k), { k: 1 - k, circle: -1 }); }
    return null;
  }

  let mode = 'idle', aStart = 0, lastCircle = -1;
  let nextAarti = performance.now() + AARTI_FIRST_DELAY_S * 1000;
  const trail = [], sparks = [];
  let acc = 0, last = performance.now();

  function startAarti(now) {
    if (mode === 'aarti') return;
    mode = 'aarti'; aStart = now; lastCircle = -1;
    document.body.classList.add('aarti-on');
  }
  lamp.addEventListener('click', () => startAarti(performance.now()));

  function frame(now) {
    const dt = Math.min((now - last) / 1000, .05); last = now;
    let p = home, k = 0;

    if (mode === 'aarti') {
      const s = aartiState((now - aStart) / 1000);
      if (s) {
        p = s; k = s.k;
        if (s.circle >= 0 && s.circle !== lastCircle) {         // a new circle begins: ring the bells
          lastCircle = s.circle;
          bellEls.forEach((b, i) => setTimeout(() => {
            ringBellVisual(b);
            if (AARTI_SOUND) ringBellSound(i === 0 ? 1 : 0.84);
          }, i * 350));
        }
      } else {
        mode = 'idle';
        nextAarti = now + AARTI_EVERY_S * 1000;
        document.body.classList.remove('aarti-on');
      }
    } else if (now >= nextAarti) {
      startAarti(now);
    }

    // lamp position: flame stays exactly on (p.x, p.y); it tilts and grows slightly while moving
    const tilt = mode === 'aarti' ? Math.sin(now / 320) * 4 * k : 0;
    const sc = 1 + .12 * k;
    lamp.style.transform = 'translate(' + (p.x - L / 2) + 'px,' + (p.y - FY * Hel) + 'px) rotate(' + tilt + 'deg) scale(' + sc + ')';

    // ---- light layer ----
    tctx.clearRect(0, 0, W, H);
    tctx.globalCompositeOperation = 'lighter';

    // warm glow around the flames
    const fl = .85 + .15 * Math.sin(now / 130) + .05 * Math.sin(now / 47);
    const gr = tctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, Hel * (1.1 + 1.5 * k));
    gr.addColorStop(0, 'rgba(255,175,60,' + ((.2 + .32 * k) * fl) + ')');
    gr.addColorStop(1, 'rgba(255,120,20,0)');
    tctx.fillStyle = gr;
    tctx.fillRect(p.x - Hel * 3, p.y - Hel * 3, Hel * 6, Hel * 6);

    // trail of light behind the moving flame
    if (mode === 'aarti' && k > .02) trail.push({ x: p.x, y: p.y, t: now });
    while (trail.length && now - trail[0].t > 1400) trail.shift();
    tctx.lineCap = 'round';
    for (let i = 1; i < trail.length; i++) {
      const a = trail[i - 1], b = trail[i], age = (now - b.t) / 1400;
      if (age >= 1 || Math.hypot(b.x - a.x, b.y - a.y) > Hel) continue;
      tctx.beginPath(); tctx.moveTo(a.x, a.y); tctx.lineTo(b.x, b.y);
      tctx.strokeStyle = 'rgba(255,150,40,' + (.22 * (1 - age)) + ')';
      tctx.lineWidth = Hel * .16 * (1 - age) + 2; tctx.stroke();
      tctx.strokeStyle = 'rgba(255,225,140,' + (.75 * (1 - age)) + ')';
      tctx.lineWidth = Hel * .045 * (1 - age) + 1; tctx.stroke();
    }

    // sparks rising from the flames
    acc += dt * (6 + 34 * k);
    while (acc >= 1) {
      acc -= 1;
      sparks.push({
        x: p.x + (Math.random() - .5) * L * .55 * sc, y: p.y - Math.random() * Hel * .08,
        vx: (Math.random() - .5) * 24, vy: -(25 + Math.random() * 55),
        age: 0, max: 1.1 + Math.random() * 1.2, r: 1 + Math.random() * 1.8
      });
    }
    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i];
      s.age += dt; s.x += (s.vx + Math.sin(s.age * 5 + i) * 10) * dt; s.y += s.vy * dt;
      if (s.age >= s.max) { sparks.splice(i, 1); continue; }
      const a = 1 - s.age / s.max;
      tctx.fillStyle = 'rgba(255,205,120,' + (a * .9) + ')';
      tctx.beginPath(); tctx.arc(s.x, s.y, s.r * (.6 + a * .6), 0, 6.283); tctx.fill();
    }
    tctx.globalCompositeOperation = 'source-over';
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
