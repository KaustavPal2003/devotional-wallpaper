/* slideshow.js — Background picture slideshow (reads window.WALLPAPER_IMAGES from images.js). */
/* ---------- Pictures ---------- */
const artBox = document.getElementById('art');

// window.WALLPAPER_IMAGES is written by update-images.bat into images.js
let pictures = Array.isArray(window.WALLPAPER_IMAGES)
  ? window.WALLPAPER_IMAGES.map(n => './' + n.split('/').map(encodeURIComponent).join('/')) : [];
if (!pictures.length && CENTER_IMAGE) pictures = [CENTER_IMAGE];

artBox.style.setProperty('--fade', FADE_SECONDS + 's');
artBox.style.setProperty('--hold', SLIDE_SECONDS + 's');

if (!pictures.length) artBox.remove();   // no pictures found: plain background, no default animation
else startSlides();

function startSlides() {
  let order = [], idx = 0, current = null, fails = 0, lastSrc = null;

  function reshuffle() {
    order = pictures.map((_, i) => i);
    if (SLIDE_ORDER === 'shuffle') {
      for (let i = order.length - 1; i > 0; i--) {
        const j = (Math.random() * (i + 1)) | 0;
        [order[i], order[j]] = [order[j], order[i]];
      }
      if (order.length > 1 && pictures[order[0]] === lastSrc) order.push(order.shift());
    }
    idx = 0;
  }

  function schedule() { if (pictures.length > 1) setTimeout(next, SLIDE_SECONDS * 1000); }

  function next() {
    if (idx >= order.length) reshuffle();
    const src = pictures[order[idx++]];
    const img = new Image();
    img.onload = () => {
      fails = 0;
      const go = () => { show(src, img); schedule(); };
      if (img.decode) img.decode().then(go, go); else go();   // decode first so the swap never shows a blank frame
    };
    img.onerror = () => {                       // unreadable file: skip it
      if (++fails >= pictures.length) {
        if (!current) artBox.remove(); else schedule();
        return;
      }
      next();
    };
    img.src = src;
  }

  function show(src, img) {
    lastSrc = src;
    const ratio = (img.naturalWidth / img.naturalHeight) / (innerWidth / innerHeight);
    let kind = 'cover';
    if (IMAGE_MODE === 'framed') kind = 'framed';
    else if (IMAGE_MODE === 'auto' && (ratio < 0.7 || ratio > 1.45)) kind = 'contain';

    const slide = document.createElement('div');
    slide.className = 'slide' + (kind === 'cover' ? '' : ' contain') + (kind === 'framed' ? ' framed' : '');
    if (kind === 'contain') {
      const bg = new Image(); bg.className = 'bgblur'; bg.alt = ''; bg.src = src;
      slide.appendChild(bg);
    }
    img.className = 'fg'; img.alt = '';
    img.style.objectPosition = kind === 'cover' ? IMAGE_FOCUS : 'center';
    img.style.transformOrigin = (30 + Math.random() * 40) + '% ' + (30 + Math.random() * 40) + '%';
    slide.appendChild(img);
    artBox.appendChild(slide);
    void slide.offsetWidth;
    slide.classList.add('in');

    const old = current; current = slide;
    if (old) setTimeout(() => old.remove(), FADE_SECONDS * 1000 + 300);
  }

  reshuffle();
  next();
}
