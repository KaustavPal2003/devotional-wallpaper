/* config.js — Settings and shared constants. Edit the values here. */
/* =====================================================
   SETTINGS — edit these
   ===================================================== */
// Pictures: every image in this folder is used. Run update-images.bat after adding or removing pictures.
const IMAGE_MODE    = "auto";       // "auto"   = fill the screen; tall/narrow pictures are shown whole over a blurred copy
                                    // "cover"  = always fill the screen (crops pictures that don't fit)
                                    // "framed" = always show whole pictures, soft-edged
const IMAGE_FOCUS   = "center 35%"; // which part stays in view when a picture is cropped (x y)
const SLIDE_SECONDS = 45;           // time each picture stays
const SLIDE_ORDER   = "shuffle";    // "shuffle" or "name" (alphabetical)
const FADE_SECONDS  = 2.5;          // cross-fade between pictures
const CENTER_IMAGE  = "";           // optional single picture used only if no list exists. "" = plain background

const TASKBAR_PX          = 48;     // taskbar height. Lively draws behind it, so nothing important sits lower than this
const ICON_COLUMN_PCT     = 8;      // % of screen width used by desktop icons on the left

const BELL_IMAGE = "assets/bell.webp";     // your bell picture, embedded below (transparent background, hanging ring at the top). Set to "" to use the built-in drawn brass bell instead
const REAL_LAMP = true;             // true = the real brass aarti lamp photo (embedded below). false = the drawn lamp
const LAMP_FLAMES = [[9,108],[32,98],[60,92],[86,97],[111,108]];  // where the 5 animated flames sit on the lamp, [x,y] on a 120 x 150 canvas (x left to right, y top to bottom). Nudge these to line a flame up with each wick
const AARTI_FIRST_DELAY_S = 6;      // first automatic aarti, seconds after load
const AARTI_EVERY_S       = 90;     // then every this many seconds (click the lamp to start one any time)
const AARTI_CIRCLES       = 3;      // clockwise circles per aarti
const AARTI_SOUND         = true;  // true = bells also ring with sound during the aarti
const BELL_FILE           = "recording/temple.mp3";  // your bell recording, saved in this folder
const BELL_VOLUME         = 0.8;           // 0 to 1

// ---- Songs on the Om button (the screen stays exactly as clean as before: still just Om + conch) ----
//   click Om                    = play / stop the current song
//   HOLD Om for about half a second (or right-click) = a small list pops up; tap a song to play it
// To add a song: put the file in the "recording" folder and add one line to SONGS. Nothing else to change.
// "speak" is optional: if that file is missing, a Hindi voice on your PC reads this text instead.
const SONGS = [
  { name: "Gayatri Mantra", file: "recording/Gayatri Mantra.mp3",
    speak: "ॐ भूर्भुवः स्वः। तत्सवितुर्वरेण्यं। भर्गो देवस्य धीमहि। धियो यो नः प्रचोदयात्॥" },
  { name: "Aigiri Nandini", file: "recording/Aigiri_Nandini_Rajalakshmee.mp3", 
    speak: "अयि गिरिनन्दिनि नन्दितमेदिनि विश्वविनोदिनि नन्दिनुते। गिरिवरविन्ध्यशिरोऽधिनिवासिनि विष्णुविलासिनि जिष्णुनुते॥" },
  { name: "Adharam_Madhuram", file: "recording/Adharam-Madhuram.mpeg"},  
  // { name: "Hanuman Chalisa",        file: "recording/hanuman-chalisa.mp3" },
  // { name: "Om Namah Shivaya",       file: "recording/om-namah-shivaya.mp3" },
];
const GAYATRI_LOOP   = true;                  // keep repeating the current song until you click Om again
const SONG_PLAYLIST  = false;                 // true = play the songs one after another, forever (ignores the repeat setting above)
const GAYATRI_VOLUME = 0.8;                   // 0 to 1 (applies to every song)
const CONCH_FILE     = "recording/shankh.mp3";                    // your conch recording, saved in this folder

const FEATHER_COUNT = 15;
const LEAF_COUNT = 20;
const PETAL_COUNT   = 55;           // fewer = lighter on the PC
const GARLAND_HANG = null;          // null = the garland hangs down to just above the taskbar. Or give a number (% of screen height below the bells) to set the depth yourself
/* ===================================================== */

document.documentElement.style.setProperty('--tb', TASKBAR_PX + 'px');
