/* lamps.js — a brass hanging oil lamp on the OUTER side of each bell, hung from the top edge,
   so it stays clear of the garland (which runs between the two bells).
   Uses the same bell positions as bells.js / garland.js, so it follows resizes. */
(function lamps() {
  const SRC = 'assets/hanging-lamp.webp';
  const IMG_RATIO = 900 / 583;      // image height / width
  const HEIGHT = 0.34;              // wanted lamp height, as a fraction of the screen height
  const GAP = 1.0;                  // space between bell and lamp, in vmin
  const MIN_W = 9;                  // never narrower than this, in vmin
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const bl = (typeof bellLeftX  === 'number') ? bellLeftX  : 11;   // % from left (set in garland.js)
  const br = (typeof bellRightX === 'number') ? bellRightX : 89;

  const st = document.createElement('style');
  st.textContent =
    '@keyframes lampSwing{0%,100%{transform:rotate(-1.6deg)}50%{transform:rotate(1.6deg)}}' +
    '@keyframes lampGlow{0%,100%{filter:drop-shadow(0 1.2vmin 1.2vmin rgba(0,0,0,.5)) drop-shadow(0 0 1.6vmin rgba(255,160,50,.28)) brightness(1)}' +
    '35%{filter:drop-shadow(0 1.2vmin 1.2vmin rgba(0,0,0,.5)) drop-shadow(0 0 2.2vmin rgba(255,170,60,.42)) brightness(1.08)}' +
    '70%{filter:drop-shadow(0 1.2vmin 1.2vmin rgba(0,0,0,.5)) drop-shadow(0 0 1.4vmin rgba(255,150,40,.24)) brightness(.97)}}';
  document.head.appendChild(st);

  function make(id, delay) {
    const d = document.createElement('div');
    d.id = id; d.setAttribute('aria-hidden', 'true');
    d.style.cssText = 'position:absolute;left:0;top:0;pointer-events:none;will-change:transform;z-index:6;';
    const swing = document.createElement('div');       // swings from its top centre, as if on its chains
    swing.style.cssText = 'width:100%;height:100%;transform-origin:50% 0;' +
      (reduce ? '' : 'animation:lampSwing 6.5s ease-in-out infinite;animation-delay:' + delay + 's;');
    const img = document.createElement('img');
    img.src = SRC; img.alt = ''; img.draggable = false;
    img.style.cssText = 'display:block;width:100%;height:100%;' +
      (reduce ? '' : 'animation:lampGlow 3.4s ease-in-out infinite;animation-delay:' + delay + 's;');
    swing.appendChild(img); d.appendChild(swing); document.body.appendChild(d);
    return d;
  }
  const ll = make('lampL', 0), lr = make('lampR', -3.2);

  function layout() {
    const W = innerWidth, H = innerHeight, vmin = Math.min(W, H) / 100;
    const bellW = 11 * vmin;                                  // .bell-wrap is 11vmin wide
    const bellLeftEdge  = bl / 100 * W - bellW / 2;           // left bell, left edge
    const bellRightEdge = br / 100 * W + bellW / 2;           // right bell, right edge
    const gap = GAP * vmin;
    const availL = bellLeftEdge - gap;                        // room between screen edge and left bell
    const availR = W - bellRightEdge - gap;                   // room between right bell and screen edge
    const wanted = HEIGHT * H / IMG_RATIO;
    const lw = Math.max(MIN_W * vmin, Math.min(wanted, availL, availR));   // same size on both sides
    const lh = lw * IMG_RATIO;
    [ll, lr].forEach(e => { e.style.width = lw + 'px'; e.style.height = lh + 'px'; });
    const xL = Math.max(0, bellLeftEdge - gap - lw);
    const xR = Math.min(W - lw, bellRightEdge + gap);
    const y = -vmin * 0.3;                                    // ceiling cap touches the top edge
    ll.style.transform = `translate(${xL}px, ${y}px)`;
    lr.style.transform = `translate(${xR}px, ${y}px)`;
  }
  addEventListener('resize', layout);
  layout();
})();
