/* garland.js — Lotus garland hung between the two bells (rebuilt on resize). */
/* ---------- One continuous garland hung between the two bells ---------- */
const garlandHost = document.getElementById('garlands');
const bellLeftX  = ICON_COLUMN_PCT + 3;               // % from the left, just right of the desktop icons
const bellRightX = 100 - bellLeftX;                   // mirrored, so the whole layout is symmetric

/* ---------- Procedural lotus: rounded cup flowers with green sepals, like a real padma mala ---------- */
let rnd = Math.random;
const R = (a, b) => a + (b - a) * rnd();
const pick = a => a[Math.floor(rnd() * a.length)];
function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

function petalPath(L, W) {                              // pointed petal
  return 'M0,0 C' + (-W * .95) + ',' + (-L * .22) + ' ' + (-W * .85) + ',' + (-L * .78) + ' 0,' + (-L) +
         ' C' + (W * .85) + ',' + (-L * .78) + ' ' + (W * .95) + ',' + (-L * .22) + ' 0,0Z';
}
function petal(L, W, fill, rot, stroke) {
  const v = 'M0,' + (-L * .1) + ' L0,' + (-L * .86) +
    ' M' + (-W * .3) + ',' + (-L * .2) + ' Q' + (-W * .45) + ',' + (-L * .55) + ' ' + (-W * .14) + ',' + (-L * .84) +
    ' M' + (W * .3) + ',' + (-L * .2) + ' Q' + (W * .45) + ',' + (-L * .55) + ' ' + (W * .14) + ',' + (-L * .84);
  return '<g transform="rotate(' + rot.toFixed(1) + ')"><path d="' + petalPath(L, W) + '" fill="url(#' + fill + ')" stroke="' + stroke + '" stroke-opacity=".45" stroke-width=".8"/>' +
         '<path d="' + v + '" fill="none" stroke="#fff" stroke-opacity=".3" stroke-width=".7"/></g>';
}
function cupPetal(L, W, fill, rot, stroke) {            // broad petal with a rounded tip, forms the closed cup
  const d = 'M0,0 C' + (-W) + ',' + (-L * .15) + ' ' + (-W * 1.08) + ',' + (-L * .68) + ' ' + (-W * .36) + ',' + (-L * .96) +
            ' Q0,' + (-L * 1.06) + ' ' + (W * .36) + ',' + (-L * .96) +
            ' C' + (W * 1.08) + ',' + (-L * .68) + ' ' + W + ',' + (-L * .15) + ' 0,0Z';
  const v = 'M0,' + (-L * .1) + ' Q' + (-W * .2) + ',' + (-L * .5) + ' ' + (-W * .1) + ',' + (-L * .9) +
            ' M0,' + (-L * .1) + ' Q' + (W * .2) + ',' + (-L * .5) + ' ' + (W * .1) + ',' + (-L * .9);
  return '<g transform="rotate(' + rot.toFixed(1) + ')"><path d="' + d + '" fill="url(#' + fill + ')" stroke="' + stroke + '" stroke-opacity=".34" stroke-width=".8"/>' +
         '<path d="' + v + '" fill="none" stroke="' + stroke + '" stroke-opacity=".22" stroke-width=".7"/></g>';
}
function leafPath(L, W) {
  return 'M0,0 C' + (-W) + ',' + (-L * .25) + ' ' + (-W * .9) + ',' + (-L * .8) + ' 0,' + (-L) +
         ' C' + (W * .9) + ',' + (-L * .8) + ' ' + W + ',' + (-L * .25) + ' 0,0Z';
}
function sepal(L, W, rot, y) {                          // pale green-cream outer petal
  return '<g transform="translate(0 ' + y + ') rotate(' + rot.toFixed(1) + ')"><path d="' + leafPath(L, W) + '" fill="url(#gSepal)" stroke="#8da25a" stroke-opacity=".65" stroke-width=".8"/>' +
         '<path d="M0,' + (-L * .08) + ' L0,' + (-L * .85) + '" stroke="#fff" stroke-opacity=".5" stroke-width=".8" fill="none"/></g>';
}
/* ---------- realistic lotus: pointed, boat-shaped petals with base-to-tip colour, veins, edge shading and green sepals ---------- */
function lpPath(L, W, tx) {                              // broad ovate petal, widest low down, narrowing to a fine point
  return 'M0,0 C' + (-W * 1.02) + ',' + (-L * .12) + ' ' + (-W * 1.12) + ',' + (-L * .5) + ' ' + (tx - W * .34) + ',' + (-L * .84) +
         ' Q' + (tx - W * .08) + ',' + (-L * .96) + ' ' + tx + ',' + (-L) +
         ' Q' + (tx + W * .08) + ',' + (-L * .96) + ' ' + (tx + W * .34) + ',' + (-L * .84) +
         ' C' + (W * 1.12) + ',' + (-L * .5) + ' ' + (W * 1.02) + ',' + (-L * .12) + ' 0,0Z';
}
function lpetal(L, W, fill, rot, white, bend) {
  const tx = (bend || 0) * W;
  const d = lpPath(L, W, tx);
  const vc = white ? '#8e9a63' : '#a22a62';
  let v = '';
  [-.55, -.28, 0, .28, .55].forEach(k => {               // fine veins fanning from the base to the tip
    v += 'M0,' + (-L * .04) + ' Q' + (W * k * .95) + ',' + (-L * .5) + ' ' + (tx * (.55 + Math.abs(k) * .1) + W * k * .16) + ',' + (-L * .9) + ' ';
  });
  return '<g transform="rotate(' + rot.toFixed(1) + ')">' +
    '<path d="' + d + '" fill="url(#' + fill + ')" stroke="' + (white ? '#b6b79a' : '#b43a76') + '" stroke-opacity=".5" stroke-width=".7"/>' +
    '<path d="' + d + '" fill="url(#' + (white ? 'lpEdgeW' : 'lpEdge') + ')"/>' +
    '<path d="' + v + '" fill="none" stroke="' + vc + '" stroke-opacity=".2" stroke-width=".55"/>' +
    '<path d="M' + (-W * .5) + ',' + (-L * .3) + ' Q' + (-W * .62) + ',' + (-L * .6) + ' ' + (tx - W * .2) + ',' + (-L * .88) + '" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="1.1" stroke-linecap="round"/>' +
    '</g>';
}
function lsepal(L, W, rot) {                             // green sepal hugging the bud base
  const d = lpPath(L, W, 0);
  return '<g transform="rotate(' + rot.toFixed(1) + ')"><path d="' + d + '" fill="url(#gSepal)" stroke="#7f9a4a" stroke-opacity=".7" stroke-width=".7"/>' +
         '<path d="M0,' + (-L * .06) + ' L0,' + (-L * .85) + '" stroke="#5d7a2c" stroke-opacity=".35" stroke-width=".8" fill="none"/></g>';
}
/* ---------- real lotus photographs: pink buds, half-open pinks, white buds, and an open bloom for the ends and centre ---------- */
function pinkSVG()  { return '<use href="#lt_pink"/>'; }
function whiteSVG() { return '<use href="#lt_white"/>'; }
function openSVG()  { return '<use href="#lt_open"/>'; }

function buildGarland() {
  garlandHost.innerHTML = '';
  rnd = mulberry32(20261001);                          // fixed seed: same garland every time, even after a resize
  const W = innerWidth, H = innerHeight, vmin = Math.min(W, H) / 100;
  const x0 = bellLeftX / 100 * W, x1 = bellRightX / 100 * W;
  const y0 = vmin * 10.5;                              // just under the bells
  const box = vmin * 10.5, gap = vmin * 4.3;           // flower size, and spacing (flowers overlap like a real mala)
  const sag = GARLAND_HANG == null ? (H - TASKBAR_PX - box * 0.35 - y0) : GARLAND_HANG / 100 * H;                  // how far the strand hangs below the bells

  // symmetric swag. The sides slant inwards, so the strand clears the round Rainmeter clock under the right bell,
  // and the lowest point stays above the aarti lamp, the buttons and the Rainmeter date panel.
  const cx = W / 2, cy = y0 + 2 * sag;
  const S = 400, pts = [], cum = [0];
  for (let i = 0; i <= S; i++) {
    const t = i / S, u = 1 - t;
    pts.push([u * u * x0 + 2 * u * t * cx + t * t * x1, u * u * y0 + 2 * u * t * cy + t * t * y0]);
    if (i) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  }
  const total = cum[S];
  function at(d) {
    let k = 0; while (k < S - 1 && cum[k + 1] < d) k++;
    const seg = (cum[k + 1] - cum[k]) || 1, f = Math.min(1, Math.max(0, (d - cum[k]) / seg));
    return { x: pts[k][0] + (pts[k + 1][0] - pts[k][0]) * f, y: pts[k][1] + (pts[k + 1][1] - pts[k][1]) * f,
             tx: pts[k + 1][0] - pts[k][0], ty: pts[k + 1][1] - pts[k][1] };
  }
  const heading = p => Math.atan2(p.tx, -p.ty) * 180 / Math.PI;   // direction of travel as a rotation (0 up, 90 right, 180 down)

  function place(svg, p, size, phi, mirror, z, d) {
    const b = document.createElement('div');
    b.className = 'bead';
    b.style.cssText = 'left:' + p.x + 'px;top:' + p.y + 'px;width:' + size + 'px;height:' + size + 'px;z-index:' + z +
      ';animation-duration:' + (4 + (Math.abs(Math.sin(d * 12.9898)) * 2.5)).toFixed(2) + 's' +
      ';animation-delay:' + (-(Math.abs(d - total / 2) / gap * 0.14)).toFixed(2) + 's';
    b.innerHTML = '<svg viewBox="0 0 100 100" style="transform:rotate(' + phi.toFixed(1) + 'deg)' + (mirror ? ' scaleX(-1)' : '') + ';transform-origin:50% 50%">' + svg + '</svg>';
    garlandHost.appendChild(b);
  }

  // left half: runs of pink flowers broken by white ones; the right half mirrors it so the strand stays symmetric.
  // every flower's head points along the strand towards the centre, each overlapping the next like a real mala.
  let isPink = false, run = 0, n = 0;
  const items = [];
  for (let d = 0; d < total / 2 - gap * .35; d += gap * R(.92, 1.1), n++) {
    if (run <= 0) { isPink = !isPink; run = Math.round(isPink ? R(2, 4.2) : R(1, 2.4)); }
    run--;
    const svg = n === 0 ? openSVG() : (isPink ? pinkSVG() : whiteSVG());
    items.push({ svg, d, size: box * R(.94, 1.08) * (n === 0 ? 1.0 : 1.3), flip: rnd() < .5, phi: n === 0 ? R(-12, 12) : heading(at(d)) + R(-9, 9), z: 500 - n });
  }
  items.forEach(it => {
    place(it.svg, at(it.d), it.size, it.phi, it.flip, it.z, it.d);
    const d2 = total - it.d;
    place(it.svg, at(d2), it.size, -it.phi, !it.flip, it.z, d2);
  });
  place(openSVG(), at(total / 2), box * 1.25, 0, false, 900, total / 2);   // open bloom at the lowest point

  // thin thread, mostly hidden behind the flowers
  const pathD = 'M' + x0 + ',' + y0 + ' Q' + cx + ',' + cy + ' ' + x1 + ',' + y0;
  garlandHost.insertAdjacentHTML('afterbegin',
    '<svg width="' + W + '" height="' + H + '" style="position:absolute;left:0;top:0;z-index:0;overflow:visible">' +
    '<path d="' + pathD + '" fill="none" stroke="#3b2a12" stroke-width="' + (vmin * .3) + '" stroke-linecap="round" opacity=".92"/>' +
    '<path d="' + pathD + '" fill="none" stroke="#d1a94d" stroke-width="' + (vmin * .1) + '" stroke-linecap="round" opacity=".7"/></svg>');
}

buildGarland();
