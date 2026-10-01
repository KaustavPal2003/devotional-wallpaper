/* bells.js — The two hanging bells: image, swing/ring animation, ring sound. */
const bellEls = [];
document.querySelectorAll('.bell-wrap').forEach((w, idx) => {
  const x = idx === 0 ? bellLeftX : bellRightX;
  w.style.left = 'calc(' + x + 'vw - 5.5vmin)';
  const pitch = idx === 0 ? 1 : 0.84;
  let bell = null;
  function useBell(el) {
    if (bell) bell.remove();
    bell = el; bellEls[idx] = el; w.appendChild(el);
    el.addEventListener('animationend', e => { if (e.animationName === 'ring') el.classList.remove('ring'); });
  }
  const svgBell = () => document.getElementById('bell-tpl').content.firstElementChild.cloneNode(true);
  if (BELL_IMAGE) {
    const im = new Image(); im.className = 'bell'; im.alt = ''; im.draggable = false;
    im.onerror = () => useBell(svgBell());               // file not found: fall back to the built-in bell
    im.src = BELL_IMAGE; useBell(im);
  } else useBell(svgBell());
  w.addEventListener('click', () => { ringBellVisual(bellEls[idx]); ringBellSound(pitch); });
});
function ringBellVisual(bell) {
  bell.classList.remove('ring'); void bell.offsetWidth; bell.classList.add('ring');
}

/* ---------- Bell sound (temple.mp3) ---------- */
const bellSrc = encodeURI(BELL_FILE);
function ringBellSound(pitch) {
  try {
    const a = new Audio(bellSrc);            // new element per ring, so rapid rings overlap naturally
    a.volume = BELL_VOLUME;
    a.preservesPitch = false;                // lets the right bell sound slightly lower
    a.playbackRate = pitch || 1;
    a.play().catch(() => { /* file missing or audio blocked: ignore */ });
  } catch (e) { /* ignore */ }
}
