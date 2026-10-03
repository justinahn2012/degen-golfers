# Degen Golfers '26: main chat handover (after round 76)

You are the **main chat** for Justin's browser 3D golf game. Other chats build or rework courses; you merge their work into the latest files and own the game engine.

The live site runs on Cloudflare Workers from a GitHub repo. Justin uploads from his phone.

## 0. How to work with Justin (read first)

- **Uploads:**
  - Hand over flat, already-patched files only, as a zip of loose files with no folders, plus a list of exactly which files to upload.
  - Justin doesn't run scripts or patch anything himself.
  - Ship `worker.js` together with `intro.js`, never alone. An old title screen crashed when the leaderboard had scores.
- **Check before handing over**, and report numbers, not impressions:
  - every touched course loads in a test browser with no page errors;
  - the title screen works with a saved score for that course;
  - rendered before/after pictures of what changed.
- **Never ship the test hooks.** The test copy of `main.js` adds `window.__D`, `window.__T` and `window.__bc`; delivered files must not contain them. Grep before packaging.
- **Merging other chats' work:** they often build on an older `main.js`. Diff their file against our recent rounds to find the base and their real changes, then apply only those changes to the latest file.
- **Be honest:** if something isn't fixed or wasn't checked, say so. Justin pushes back on vague answers.
- **Short replies:** lead with what changed, then the upload list.

## 1. Latest file versions (live once uploaded)

The newest round in which each file changed. Ask Justin for the current repo files, or pull them from GitHub, to work on.

| File | Round | Notes |
|---|---|---|
| `main.js` | 76 | Everything in section 3 (see-through, shadow lift, tuft shadows, `players` in the course API) |
| `boot.js`, `intro.js` | 66 | Augusta registered |
| `worker.js` | 66 | Accepts `jp ws nc cc cb cda ko ag`; 9-hole rounds |
| `ag.js` | 76 | Leaderboards built in code (live scores), `SHADOW_LIFT=.45`; plus round 75: combined azaleas, pine straw hook, no grass in straw, azaleas off tee lines, tree collision fix |
| `ag_extra.json` | 72 | Micro-buildings under 12 m² removed, sheds capped at 3 m |
| `ag.lidar.bin` | 72 | Hole 13 tee levelled (68), banks round the 15th tee eased (72) |
| `ag.json` | 68 | Tee box added on 13 |
| `ag_board.glb` | 69 | No longer loaded (round 76 builds the board in code); harmless to leave in the repo |
| Other `ag_*` files | 66 | From the course chat |
| `putter_oil.glb` | 69 | Shaw's putter: deep blue, gradient over the back plate, no red |
| `putter_std.glb` | 55 | Standard putter, levelled head with red circles |
| `cb.json`, `cb_extra.json`, `cb.lidar.bin` | 64 | Chambers Bay |
| Other `cb_*` files, `cb.js` | 60 | |
| `cc.lidar.bin` | 62 | |
| `cc.js`, `cc.json`, `cc_extra.json`, `nc.js`, `nc.json`, `nc.lidar.bin`, `ko.js`, `ko.json`, `ko.lidar.bin`, `jp.json` | 61 | |
| `ws.json` | 49 | |
| `anims.json` | 51 | |
| `pnw_dfirAtlas.webp`, `ko_sky.jpg` | 57 | |

## 2. Courses and registration

**Keys and codes:**

| Key | Code | Course |
|---|---|---|
| jp | JPK | Jefferson Park |
| ws | WSEA | West Seattle |
| nc | NCCH | China Creek |
| cc | NCCO | Coal Creek |
| cb | CBAY | Chambers Bay |
| cda | CDA | Coeur d'Alene |
| ko | KOLN | Ko Olina |
| ag | ANGC | Augusta National |

**Menu order** (`COURSE_ORDER`): jp, ws, nc, cc, cb, cda, ko, ag.

**Difficulty** (`COURSE_DIFF`, in balls):

| Course | Balls |
|---|---|
| Jefferson Park | 1.5 |
| West Seattle | 2.5 |
| Coeur d'Alene | 2.5 |
| Ko Olina | 4.5 |
| China Creek | 5 |
| Coal Creek | 5 |
| Chambers Bay | 5 |
| Augusta National | 5 |

**Adding a course takes six places:**
1. `HS_CS` (code) in `main.js`
2. `HS_CN` (board name) in `main.js`
3. `COURSE_DIFF` in `main.js`
4. `COURSE_ORDER` in `main.js`
5. `CS` in `intro.js`
6. `J('xx.json')` and `COURSES.xx` in `boot.js`

Plus `COURSES` in `worker.js`.

## 3. Engine behaviour (`main.js`) that course and game work must respect

**Ground and terrain**
- **Height:** ground height is 0.5 × the 20 m DEM (sampled Catmull-Rom) + the lidar tile.
  - Ko Olina, Coal Creek, China Creek and Augusta store full elevation in the tile, so broad slopes show 1.5×.
  - Chambers Bay stores true height − 0.5 × DEM, so it shows at true height.
  - Build tiles with the game's own Catmull-Rom (`crgame.py`), or tees come out tilted in-game.
- **Drawn surfaces:**
  - coarse ground over `box` (2 m grid, or 3 m on big courses);
  - a 0.7 m fine mesh per green;
  - a fine mesh per bunker, 0.35 m by default and up to 0.9 m for huge waste bunkers away from greens;
  - a 20 m dark-green underlay that takes the lowest ground within 10 m.
- **Trees and houses** only stand right where the course ground is drawn (inside `box`); outside it they float.

**Ball and golfer placement**
- `GDRAW` (green and bunker meshes) and `HDRAW` (coarse ground) give the drawn height. `DRAWNH(x, y)` returns whichever applies.
- The ball (`placeBall`) and the golfer (`posGolfer`) stand on the drawn surface; physics still uses `H`.
- Measured worst ball-to-green gap on played greens: 0 cm.

**Per-course data keys**

| Key | What it does |
|---|---|
| `noTree` | Ellipses `[x, y, halfLen, halfWid, ux, uy]` where trees are removed after planting |
| `blade` | Grass-blade colour by lie |
| `assets.sky` | Sky image |
| `sand` | Sand colour, linear RGB |
| `box` | Area where the course ground is drawn |

**Hooks a course script can use**

| Hook | What it does |
|---|---|
| `window.NOGRASS(x, y)` | No grass blades or tufts there; pine needles are drawn instead |
| `window.setGroundStraw(img, x0, y0, x1, y1)` | Straw mask: needle-litter texture and shading in the ground shader |
| `userData.occluder = true` | The landing camera avoids that mesh; also gets see-through |
| `userData.see = true` | Gets see-through without the landing-camera raycast (use on big merged meshes) |
| `userData.noSee = 1` | Never cut by see-through (golfers are tagged automatically) |
| `window.SHADOW_LIFT` | 0–1, set before `main.js` loads: share of sunlight left in shadow (patches the shadow chunks at startup). Augusta uses .45 |
| `A.players` | Course API getter for the round's players (`name`, `card`) |
| `D.rockSolids` | Rocks the ball bounces off |

**Cameras**

| Camera | Behaviour |
|---|---|
| Aim (blind shot) | Lifts (max 6 m) only if the landing area is hidden behind a rise and the lift actually reveals it; otherwise stays at eye level |
| Aim (framing) | Steps back up to 7 m before tilting down |
| Aim (trees behind) | Moves closer first, then climbs |
| Landing | `clearCam` climbs until the landing is in view |
| Pin tag | When the pin is off-screen while aiming (incl. overhead), a yellow "Pin 198 yds" tag at the screen edge points to it (`updPinEdge`) |
| See-through (`SEE`, `updSee`) | While aiming/swinging: every instanced mesh (except grass blades and tufts) and every `occluder`/`see` mesh is cut per pixel, dithered, if it is closer to the camera than the golfer (camera-to-chest distance − 1.1 m) or within a 1.6 m corridor up to the golfer. In flight/result/replay only within 3 m of the lens. `seeScan` patches new materials every 1.5 s. Shadows unaffected |

**Gameplay**

| Item | Rule |
|---|---|
| Grip it and rip it | Once every 3 holes (`p.ripAt`, `p.holesPlayed`) |
| Putting | Line marks flat distance; speed accounts for each surface crossed (`puttV0`) |
| Cart path landing | Big bounce |
| Rocks | Bounce |
| Scorecard | Scrolls right to the latest hole after each hole |

**Putters**
- **Standard putter:** `putter_std.glb`, head mounted at the calibrated lie and levelled at address (`levelPutter`).
- **Custom colours:**
  - Keegan's is tinted gold.
  - David, Brendan and Sherif have a black tint.
  - Shaw's loads `putter_oil.glb`.
  - Spider and DF3 putters are separate models.

**Women's putting** (Andrea, Jackie)
- **Calibration:** the putter is calibrated on the women's actual putting posture (`animApply(..., 'putter')`). Upper arms rotate 0.3 rad in, spine 0.36 more upright.
- **Grip:** the trail hand sits 8.5 cm below the lead hand on the grip.
- **Measured against Keegan:** hands 0.32 m in front of the body (Keegan 0.30), face 0.61 m from the feet (0.58).

**Other features**
- **Celebrations:** four birdie celebrations, never the same twice in a row. A new fist shape; hands grow 25% during fist celebrations.
- **Wasted and blackout signs:** lowered so the HUD doesn't cover them.
- **Course select:** ordered by `COURSE_ORDER`.

## 4. Course status and open notes

**Augusta (ag)**
- **Greens:** max tilt 6.5%, pins up to 4.0%.
- **Tees:** level.
- **Hole 13:** tee box added, and azaleas kept out of the first 45 m in front of every tee.
- **Hole 15:** banks around the tee eased.
- **Leaderboards:** built in code at 18, 11, 16 and 2: arched LEADERS header, HOLE/PAR rows from the course pars, the round's golfers sorted by score with running totals per hole (red under par, green level/over, `E` for level), THRU panel (holes played + top 3), green trim, base band, posts. Shared 2048×1024 canvas texture, redrawn only when a score changes (2 s poll).
- **Shade:** `SHADOW_LIFT=.45`. Measured on hole 2 rough: shaded green channel 48 → 67; pine straw in shade near-black → warm brown.
- **Pine straw:** needle texture, no grass, loose needles near the ball.
- **Azaleas:** combined version, eight cards plus a 15-triangle blossom core. Alternatives (`'cross8'`, `'cross3'`, `'dome'`) are selected by the `window.AG_BUSH` default in `ag.js`.
- **Performance at the first tee:** about 2.0 M triangles, 127 draw calls.

**Chambers Bay (cb)**
- **Layout:** Black tees (7,157 yd). Hole 11 starts on its real box (494 yd).
- **Greens:** real shapes; pins moved off steep spots on 7, 9 and 12.
- **Look:** Lone Fir as a 3D tree, ruins with arched openings, railway, golden fescue.
- **Open:** confirm the hole 13 floating-tree fix in play; golden-hour look not checked; ruins simplified.

**Coal Creek and China Creek:** real green shapes, steepest overall tilt 5.9% and 4.8%. Coal Creek 11 and 12 placeholder ovals keep a capped surface held 2 m past the edge.

**Ko Olina:** real greens. Open: towers behind 5 and 18 look small; no fountains on 9 and 10; waterfall plantings on 8 are sparse.

**West Seattle:** the creek about 70 m out on 12 is real; there's a footbridge in real life. Optional: add a cart-path bridge.

**Jefferson Park:** `noTree` clearings on 1, 10 and 16.

## 5. Next up: the plant review (sheets were shown to Justin)

Ranked by impact for the effort. Justin hasn't picked yet; I suggested 1–3 together.

1. **Creek rocks, Coal Creek and China Creek** (about 2,000 and 850). Bright white, plastic-looking `MeshStandardMaterial` pebbles, 80 triangles each, built in `cc.js`/`nc.js` (`creekRocks`). Give them a stone texture and colour with moss variation.
2. **Coeur d'Alene floating-green flower ring.** 668 red spheres (`MeshLambertMaterial`, 80 triangles) that read as red balls. Rebuild as geranium clumps using the azalea technique.
3. **Flat-card flowers and shrubs:**
   - Newcastle yellow broom: about 2,100 per course, canvas 128 px, 6 triangles each.
   - Ko Olina ti/ginger plantings: 478.
   - Coeur d'Alene small red flowers: about 2,000.

   Port the azalea combo (eight cards plus a core) from `ag.js` `plants()` and `plantsDome()`.
4. **Chambers Bay fescue clumps.** Tufts are generic green grass. Use tall golden wispy clumps in fescue areas near the ball; the `blade` colours already handle the grass blades.
5. **3D broadleaf trees near the golfer, all courses.** Only conifers have a 3D swap (`hero` trees; fir and ponderosa hero meshes exist, plus Augusta's `lob`). Ko Olina's monkeypods and palms are cards up close too. Biggest upgrade, real work, needs a phone performance check.
6. **Coeur d'Alene juniper ground cover.** Canvas 512 px mats (2,600 × 132 triangles) plus `juniperAtlas` (5,200). Flat dark blankets.
7. **Augusta dogwoods** (1,543). Blobby white cards; the atlas needs blossom detail.
8. **Optional:** a Meshy azalea as a close-up hero bush, only near the golfer.

Plant sheet method:
- **Script:** `vegsheet.py`, captured per course.
- **What it finds:** every `InstancedMesh` type (grouped by texture and triangle count).
- **What it shows:** a typical instance near the course centre, rendered close and wide.
- **Hero 3D trees:** not swapped in for the sheets, since `updNearTrees` isn't exposed.

## 6. Other open items

- A full round on each newer course, and frame rate on a real phone.
- Hole 4 at Chambers Bay: the Black tee really sits below a rise.
- Swing posture from earlier sessions: golfers stand too upright at address and the hands sit low at the top.
- Per-golfer heights.
- Ephram's cut-off hoodie needs extra geometry; Justin is fine with placeholders for Ephram and Landon.

## 7. Test setup notes (rebuild in the new chat)

- **Files:** the live site is `https://degen-golfers.autumn-bonus-ae5a.workers.dev`; pull current files from there (send a curl-like User-Agent or Cloudflare returns 403). A small local server that serves cached files and fetches misses from the live site works well.
- **Justin's golfer id:** `green-fleece`.
- **Limits:** each command is capped at 300 s and background processes die between turns, so restart the server and browser every turn and run course checks in the background, polling a log.
- **Shader chunk changes** (`SHADOW_LIFT`) only take effect on a page reload: three's program cache ignores chunk text, so patching `THREE.ShaderChunk` at runtime does nothing.
- **See-through in custom views:** it uses the real camera, so a `__CAM` view with the golfer far away cuts everything in between. Set `__D.state='done'` for such views.
- **Camera snap:** the test copy also adds `window.__SNAP` (camera jumps to its target instead of easing; frames take ~4 s in SwiftShader).

- **Browser:** headless Chromium with SwiftShader (`--use-gl=angle --use-angle=swiftshader`). Courses load in 60–100 s; Coeur d'Alene is slowest.
- **Starting a round directly:** `index.html#dg={"c":"ag","p":["dillon"],"len":"18"}`. Wait for `window.__D.state==='aim'`, then call `__D.skipFly()`.
- **Test hooks:** the test copy of `main.js` gets `window.__T={HDRAW,GDRAW,DRAWNH,H,V,GMESH,lieAt,onPath,buildBlades,...}`, injected after `setHole(0);linearize(scene);`.
- **Custom views:** set `window.__CAM=[pos,look]`, then `__D.renderNow()`.
- **Harness limitation:** `setHoleIdx` plus setting `p.x`/`p.y` doesn't update the HUD or fully set up a turn. Aim-camera tests are only approximate; check behaviour from the numbers.
- **`pkill -f` caution:** never `pkill -f` with a pattern that also appears in the current shell command, or it kills your own shell.
- **Levelling and green tools** (in the earlier course-tools and greens packages):
  - `courseflat2.py` and `courseflat_real.py`;
  - `greencheck.py` (game-accurate tilts, pin slopes, ball gaps);
  - `pinfind.py` and `applypins.py`;
  - `crgame.py` (the game's Catmull-Rom);
  - `terrstats.py`.
  - Re-run levelling on the original lidar whenever a lidar tile is rebuilt.
