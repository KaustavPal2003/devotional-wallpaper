# Devotional Live Wallpaper

Open `index.html` (or point Lively Wallpaper at it).

```
index.html            page structure + inline SVG (gradients, incense, lamp)
css/style.css         all styling and animations
js/config.js          SETTINGS: edit timings, files, volumes, counts here
js/slideshow.js       background picture slideshow
js/garland.js         lotus garland between the bells
js/lamp.js            real lamp photo / flame positions
js/bells.js           bells: swing, ring, bell sound
js/sounds.js          conch + Gayatri Mantra buttons
js/petals.js          falling petals
js/aarti.js           aarti lamp motion, light trail, sparks
assets/               bell, lamp, lotus, conch, Om, incense holder (webp)
```

Keep these next to `index.html`, exactly as before (not inside a subfolder):
`images.js` (written by update-images.bat), your pictures, `temple.mp3`,
`shankh.mp3`, `Gayatri Mantra.mpeg`.

Scripts are plain (non-module) files loaded in the order listed in
`index.html`, so the wallpaper works from file:// in Lively.
