/* lamp.js — Real aarti lamp photo vs the drawn lamp, and flame positions. */
/* ---------- real aarti lamp photo (set REAL_LAMP = false to use the drawn lamp) ---------- */
if (REAL_LAMP) {
  document.getElementById('lampImg').style.display = '';
  document.getElementById('lampArt').style.display = 'none';
  document.querySelectorAll('#aarti .fg5').forEach((g, i) => {
    const f = LAMP_FLAMES[i]; if (f) g.setAttribute('transform', 'translate(' + f[0] + ',' + f[1] + ')');
  });
}
