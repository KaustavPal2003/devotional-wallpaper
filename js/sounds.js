/* sounds.js — Conch and Om (song) buttons (plus toast and wave effects). */
/* ---------- Sound buttons ---------- */
const conchBtn = document.getElementById('conchBtn');
const omBtn = document.getElementById('omBtn');
const toastEl = document.getElementById('toast');
let toastTimer;
function toast(msg) {
  toastEl.textContent = msg; toastEl.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => toastEl.classList.remove('show'), 7000);
}
function waves(btn, n) {                                  // rings spreading out from a button
  for (let i = 0; i < n; i++) {
    const w = document.createElement('span');
    w.className = 'wave'; w.style.animationDelay = (i * 0.55) + 's';
    w.addEventListener('animationend', () => w.remove());
    btn.appendChild(w);
  }
}
if (window.speechSynthesis) speechSynthesis.getVoices();  // warm up the voice list

/* Conch (shankh.mp3) */
let conchBusy = false, conchAudio = null;
function blowConch() {
  if (conchBusy) return;
  conchBusy = true; setTimeout(() => { conchBusy = false; conchBtn.classList.remove('on'); }, 4400);
  conchBtn.classList.add('on'); waves(conchBtn, 3);
  conchAudio = conchAudio || new Audio(encodeURI(CONCH_FILE));
  conchAudio.currentTime = 0; conchAudio.volume = 1;
  conchAudio.play().catch(() => { /* file missing or audio blocked: ignore */ });
}
conchBtn.addEventListener('click', blowConch);

/* ---------- Om button: songs ----------
   click = play / stop the current song.  Hold (or right-click) = pop-up list of SONGS (see config.js).
   Only one Audio object exists at a time and it is released on stop, so extra songs cost disk space only. */
let sAudio = null, sPlaying = false, sSpeech = false, sIndex = 0, sMenu = null, sMenuTimer;
try { const k = parseInt(localStorage.getItem('wp_song'), 10); if (k >= 0 && k < SONGS.length) sIndex = k; } catch (e) { /* storage blocked: ignore */ }
const song = () => SONGS[sIndex];
function rememberSong() { try { localStorage.setItem('wp_song', sIndex); } catch (e) { /* ignore */ } }
function fade(audio, to, ms, done) {
  const from = audio.volume, t0 = performance.now();
  (function step(now) {
    const k = Math.min(1, (now - t0) / ms);
    audio.volume = Math.max(0, Math.min(1, from + (to - from) * k));
    if (k < 1) requestAnimationFrame(step); else if (done) done();
  })(t0);
}
function setPlaying(on) {
  sPlaying = on;
  omBtn.classList.toggle('on', on);
  const n = song() ? song().name : 'song';
  omBtn.title = on ? 'Stop ' + n : 'Play ' + n + (SONGS.length > 1 ? ' (hold to choose another)' : '');
}
setPlaying(false);
function speakText(text) {                                       // fallback when there is no recording
  const syn = window.speechSynthesis;
  if (!syn || !text) return false;
  const voice = syn.getVoices().find(v => /^hi/i.test(v.lang));
  if (!voice) return false;
  const say = () => {
    const u = new SpeechSynthesisUtterance(text);
    u.voice = voice; u.lang = voice.lang; u.rate = .6; u.pitch = .75; u.volume = GAYATRI_VOLUME;
    u.onend = () => {
      if (!sSpeech) return;
      if (sPlaying && GAYATRI_LOOP) setTimeout(() => { if (sPlaying && sSpeech) say(); }, 1500);
      else { sSpeech = false; setPlaying(false); }
    };
    syn.speak(u);
  };
  sSpeech = true; say();
  return true;
}
function startSong() {
  if (!song()) { toast('Add a song to SONGS in js/config.js'); return; }
  const cur = song();
  setPlaying(true); waves(omBtn, 2);
  let a = null, fell = false;
  const fallback = () => {
    if (fell || sAudio !== a) return; fell = true; sAudio = null;
    if (!speakText(cur.speak)) {
      setPlaying(false);
      toast('Save "' + cur.name + '" as ' + cur.file + ' to play it.');
    }
  };
  a = new Audio(encodeURI(cur.file));
  a.loop = GAYATRI_LOOP && !SONG_PLAYLIST; a.volume = 0;
  a.addEventListener('error', fallback);
  a.addEventListener('ended', () => {
    if (sAudio !== a) return;
    sAudio = null;
    if (SONG_PLAYLIST && SONGS.length) { sIndex = (sIndex + 1) % SONGS.length; rememberSong(); startSong(); }
    else setPlaying(false);
  });
  sAudio = a;
  a.play().then(() => fade(a, GAYATRI_VOLUME, 2500)).catch(fallback);
}
function stopSong(ms) {
  if (ms === undefined) ms = 1200;
  setPlaying(false);
  if (sSpeech) { sSpeech = false; speechSynthesis.cancel(); }
  if (sAudio) {
    const a = sAudio; sAudio = null;
    const release = () => { a.pause(); a.removeAttribute('src'); a.load(); };   // free the file straight away
    if (ms) fade(a, 0, ms, release); else release();
  }
}
function pickSong(i) {
  stopSong(0); sIndex = i; rememberSong(); startSong();
}

/* ---- pop-up list: built only when asked for, removed afterwards. Styled here so it works even with an older style.css ---- */
(function () {
  const st = document.createElement('style');
  st.textContent =
    '#songMenu{position:fixed;z-index:99999;left:calc(50% + 7.5vmin + 3.4vmin);bottom:calc(var(--tb,48px) + 8px + 10.5vmin);' +
    'display:flex;flex-direction:column;gap:.4vmin;max-height:38vh;overflow-y:auto;scrollbar-width:none;padding:.8vmin;border-radius:1.6vmin;' +
    'background:rgba(30,6,1,.9);border:1px solid rgba(217,164,65,.6);box-shadow:0 1vmin 2.4vmin rgba(0,0,0,.55);pointer-events:auto}' +
    '#songMenu::-webkit-scrollbar{display:none}' +
    '#songMenu button{border:0;background:none;cursor:pointer;text-align:left;white-space:nowrap;padding:.8vmin 1.8vmin;border-radius:1vmin;color:#ffe6a8;font:2vmin/1.3 "Segoe UI",sans-serif}' +
    '#songMenu button:hover{background:rgba(217,164,65,.25)}' +
    '#songMenu button.cur{color:#ffd57a;font-weight:600}' +
    '#songMenu button.cur::before{content:"\\2022  "}';
  document.head.appendChild(st);
})();
function closeMenu() { clearTimeout(sMenuTimer); if (sMenu) { sMenu.remove(); sMenu = null; } }
function openMenu() {
  if (SONGS.length < 2) return;                                  // nothing to choose from
  closeMenu();
  const m = document.createElement('div'); m.id = 'songMenu';
  SONGS.forEach((s, i) => {
    const b = document.createElement('button');
    b.textContent = s.name; if (i === sIndex) b.className = 'cur';
    b.addEventListener('click', e => { e.stopPropagation(); closeMenu(); pickSong(i); });
    m.appendChild(b);
  });
  document.body.appendChild(m); sMenu = m;
  sMenuTimer = setTimeout(closeMenu, 8000);                      // closes itself if you walk away
}
document.addEventListener('mousedown', e => { if (sMenu && !sMenu.contains(e.target)) closeMenu(); });

let pressT = 0, longFired = false, lastTouch = 0;
function pressStart(e) {
  if (e.type === 'mousedown' && (e.button || Date.now() - lastTouch < 800)) return;   // left button only; ignore touch's echo
  if (e.type === 'touchstart') lastTouch = Date.now();
  longFired = false; clearTimeout(pressT);
  pressT = setTimeout(() => { longFired = true; openMenu(); }, 500);
}
function pressEnd() { clearTimeout(pressT); }
omBtn.addEventListener('mousedown', pressStart);
omBtn.addEventListener('touchstart', pressStart, { passive: true });
['mouseup', 'mouseleave', 'touchend', 'touchcancel'].forEach(t => omBtn.addEventListener(t, pressEnd));
omBtn.addEventListener('contextmenu', e => { e.preventDefault(); openMenu(); });
omBtn.addEventListener('click', () => {
  if (longFired) { longFired = false; return; }                  // the release after a long press is not a click
  if (sPlaying) stopSong(); else startSong();
});
