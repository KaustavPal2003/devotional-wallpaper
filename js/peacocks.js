/* peacocks.js — a golden peacock standing on the outer side of each incense holder.
   Positions itself from the holders' on-screen size, so it follows any resize. */
(function peacocks() {
  const SRC = 'assets/peacock.webp';
  const IMG_RATIO = 1000 / 920;       // image height / width (tight crop, no padding)
  const SIZE = 1.25;                 // peacock height as a multiple of the holder height
  const GAP_FALLBACK = 0.125;        // used only if the conch/Om buttons are missing (1.5vmin / 12vmin holder width)
  const LIFT = 0.04;                 // raise the feet slightly, as a fraction of holder height
  // viewBox of the incense <svg>: -120 -1750 840 2218; the holder image fills x 0..600, y 0..468
  const VB = { x: -120, y: -1750, w: 840, h: 2218 }, HOLDER = { w: 600, h: 468 };

  const L = document.getElementById('incenseL'), R = document.getElementById('incenseR');
  if (!L || !R) return;

  function make(id, mirror) {
    const d = document.createElement('div');
    d.id = id;
    d.setAttribute('aria-hidden', 'true');
    d.style.cssText = 'position:fixed;left:0;top:0;pointer-events:none;will-change:transform;';
    const img = document.createElement('img');
    img.src = SRC; img.alt = ''; img.draggable = false;
    img.style.cssText = 'display:block;width:100%;height:100%;' +
      (mirror ? 'transform:scaleX(-1);' : '') +
      'filter:drop-shadow(0 10px 10px rgba(0,0,0,.55));' +
      'animation:peacockGlint 7s ease-in-out infinite' + (mirror ? ';animation-delay:-3.5s' : '') + ';';
    d.appendChild(img);
    document.body.appendChild(d);
    return d;
  }
  const st = document.createElement('style');
  st.textContent = '@keyframes peacockGlint{0%,100%{filter:drop-shadow(0 10px 10px rgba(0,0,0,.55)) brightness(1)}' +
                   '50%{filter:drop-shadow(0 10px 10px rgba(0,0,0,.55)) brightness(1.14)}}';
  document.head.appendChild(st);

  const pl = make('peacockL', true);    // left side: mirrored, so it faces the centre
  const pr = make('peacockR', false);   // right side: original already faces left, towards the centre

  // where the holder picture sits on screen
  function holderRect(svg) {
    const r = svg.getBoundingClientRect();
    const k = Math.min(r.width / VB.w, r.height / VB.h);
    const ox = r.left + (r.width - VB.w * k) / 2, oy = r.top + (r.height - VB.h * k) / 2;
    return { x: ox + (0 - VB.x) * k, y: oy + (0 - VB.y) * k, w: HOLDER.w * k, h: HOLDER.h * k };
  }

  function place(el, svg, side) {
    const h = holderRect(svg);
    if (!(h.w > 0)) return;
    const ph = h.h * SIZE, pw = ph / IMG_RATIO;
    el.style.width = pw + 'px'; el.style.height = ph + 'px';
    // gap = the same distance that separates the holder from the conch (left) / Om (right) button
    const btn = document.getElementById(side < 0 ? 'conchBtn' : 'omBtn');
    let gap = GAP_FALLBACK * h.w;
    if (btn) {
      const b = btn.getBoundingClientRect();
      const g = side < 0 ? b.left - (h.x + h.w) : h.x - b.right;
      if (g > 0) gap = g;
    }
    let x = side < 0 ? h.x - pw - gap : h.x + h.w + gap;
    x = Math.max(0, Math.min(innerWidth - pw, x));              // keep it on screen
    const y = h.y + h.h - ph - LIFT * h.h;                      // feet level with the holder base
    el.style.transform = `translate(${x}px, ${y}px)`;
    const z = parseInt(getComputedStyle(svg).zIndex, 10);
    el.style.zIndex = isNaN(z) ? 5 : z;
  }

  function layout() { place(pl, L, -1); place(pr, R, +1); }
  addEventListener('resize', layout);
  addEventListener('load', layout);
  if (window.ResizeObserver) { const ro = new ResizeObserver(layout); ro.observe(L); ro.observe(R); }
  layout();
  setTimeout(layout, 500); setTimeout(layout, 2000);           // catch late layout changes
})();
