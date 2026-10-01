/* sounds.js — Conch and Gayatri Mantra buttons (plus toast and wave effects). */
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

/* Gayatri Mantra */
let gAudio = null, gPlaying = false, gSpeech = false;
function fade(audio, to, ms, done) {
  const from = audio.volume, t0 = performance.now();
  (function step(now) {
    const k = Math.min(1, (now - t0) / ms);
    audio.volume = Math.max(0, Math.min(1, from + (to - from) * k));
    if (k < 1) requestAnimationFrame(step); else if (done) done();
  })(t0);
}
function setGayatri(on) {
  gPlaying = on;
  omBtn.classList.toggle('on', on);
  omBtn.title = on ? 'Stop Gayatri Mantra' : 'Play Gayatri Mantra';
}
function speakMantra() {                                        // fallback when there is no recording
  const syn = window.speechSynthesis;
  if (!syn) return false;
  const voice = syn.getVoices().find(v => /^hi/i.test(v.lang));
  if (!voice) return false;
  const say = () => {
    const u = new SpeechSynthesisUtterance('ॐ भूर्भुवः स्वः। तत्सवितुर्वरेण्यं। भर्गो देवस्य धीमहि। धियो यो नः प्रचोदयात्॥');
    u.voice = voice; u.lang = voice.lang; u.rate = .6; u.pitch = .75; u.volume = GAYATRI_VOLUME;
    u.onend = () => {
      if (!gSpeech) return;
      if (gPlaying && GAYATRI_LOOP) setTimeout(() => { if (gPlaying && gSpeech) say(); }, 1500);
      else { gSpeech = false; setGayatri(false); }
    };
    syn.speak(u);
  };
  gSpeech = true; say();
  return true;
}
function startGayatri() {
  setGayatri(true); waves(omBtn, 2);
  let fell = false;
  const fallback = () => {
    if (fell) return; fell = true; gAudio = null;
    if (!speakMantra()) {
      setGayatri(false);
      toast('Save your Gayatri Mantra recording in this folder as "' + GAYATRI_FILE + '" to play it.');
    }
  };
  const a = new Audio(encodeURI(GAYATRI_FILE));
  a.loop = GAYATRI_LOOP; a.volume = 0;
  a.addEventListener('error', fallback);
  a.addEventListener('ended', () => { if (gAudio === a) { gAudio = null; setGayatri(false); } });
  gAudio = a;
  a.play().then(() => fade(a, GAYATRI_VOLUME, 2500)).catch(fallback);
}
function stopGayatri() {
  setGayatri(false);
  if (gSpeech) { gSpeech = false; speechSynthesis.cancel(); }
  if (gAudio) { const a = gAudio; gAudio = null; fade(a, 0, 1200, () => a.pause()); }
}
omBtn.addEventListener('click', () => { if (gPlaying) stopGayatri(); else startGayatri(); });
