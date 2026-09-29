# Decisions

Defaults picked without asking. Change any of them and tell Claude.

- **Hosting:** app files live at the repo root (simplest for GitHub Pages from `main`). All paths are relative.
- **Default Now trio:** Cold / Pace (`ext-exhale`) / Absorb (`pet-po`). Quiet is an optional 4th card, off until switched on in setup.
- **Voice notes:** out of scope for v1 (storage and iOS microphone permission cost). `voiceNoteId` stays in the data model as null.
- **Routing:** hash routes (`#/now`), so it works under a repo subpath with no server rules.
- **Now shortcut:** manifest shortcut to `#/now`, plus the floating Now button on every screen.
- **Po placeholder:** until Milestone 2, Po is a small CSS-drawn block cat. Real spritesheet comes from `tools-dev/generate_po.py`.
- **Tools in Milestone 1:** every tool opens a shared stub screen with a big Stop button, and logs a neutral session. Real tool screens arrive in Milestones 2 to 4.
- **Crisis footer:** shown on Now and More only, as the spec says.

- **Favourites and recents:** kept in small settings (localStorage) for now, not the IndexedDB `favourites` store.
- **Quiet card and setup flow:** deferred to Milestone 3 as planned.
- **`data/defaults.json`:** added alongside the three listed data files to hold Now defaults and Home rotation.
- **Comfort toggle (breathing):** one shared setting. It removes holds and makes the exhale the same length as the inhale. It applies in Now mode too, so Now stays decision-free.
- **Now-mode breathing length:** 3 minutes, starts immediately, and Stop is always there.
- **Breathing end:** at the end of a cycle after the chosen length, Po yawns and settles, and the session logs as completed. Stopping early logs "exited early".
- **Reduced motion:** Po holds one static pose and the ring jumps instead of sweeping. The In/Out/Hold word is always shown, so the cue never depends on motion or sound.
- **Sound and vibration:** off by default. Sound is a single soft generated tone, no audio files.
- **Cool, not painful:** the Now card reads "Cool water, 30 seconds" and cold tools are named "Cool…". Tool ids keep `cold-` so the fixed safety copy and code stay linked. `cold-hands` no longer suggests holding a cold item. TIPP is a gentle version and shows the cold-tool caution.
- **Fixed safety copy** (SPEC §11) still mentions a wrapped ice pack as written; left as specified because it warns against ice on skin.
- **Silent storage failures:** logging is wrapped so a failed write never interrupts a tool or shows an error.
- **Updates:** the service worker no longer skips waiting or claims clients, so a new version takes over on the next launch only.
- **Emoji:** the three Now card icons are the only emoji; none in tool instructions.
- **Real-device testing:** I can only test headless here. iPhone and Android home-screen tests need you; I'll list what to try at each milestone.

## Licences
All art (icons, Po spritesheet) is generated in this repo by `tools-dev/`. Fonts are system fonts. No third-party assets or code.

## Proposed
(Ideas not in `SPEC.md` go here, not in code.)

## Milestone 3
- **Setup:** four short steps (Now cards; Quiet and handoff message; how Po looks; motion and sound). Shown once on first launch from the plain home address only, so the Now shortcut is never interrupted. Every step has Skip and Back. It resumes where it stopped, and "Set up Now" in More opens it again at step 1. Skipping keeps the default cards.
- **Now card choices:** only tools with a finished screen can be picked: cool face, cool hands, Pace, Pet Po, Pattern trace. More join the list as later milestones finish them.
- **Quiet:** a 4th card, off until switched on in setup (so Now is at most 3 cards plus Quiet). Leaving Quiet logs a neutral completed session, not "exited early", since it has no planned end and would otherwise always read as early.
- **Cool tools:** a calm screen for about 30 seconds with no countdown or numbers, then Po settles. The caution shows once before first use and from the "i" button any time.
- **Absorb tools:** Pet Po and Pattern trace are done, with a soft end at 3 minutes (Po yawns, input stops, screen fades). No score, and no progress ring, in line with rule 1. Bubble pop, sort shapes and kaleidoscope belong to Milestone 4.
- **Pattern trace:** the trail fades after a couple of seconds so nothing accumulates.
- **Po look:** Standard, Clearer (more contrast) or Softer (less saturated), shown on light and dark backgrounds. This is a simple check for legibility, not a colour-vision test. The chosen look shows a tick as well as a border, so colour is never the only signal.
- **Licence:** MIT, copyright holder is the repo's GitHub username.

## Milestone 4
- **Every tool has a real screen.** `data/tools.json` gives each tool a `run` type (breathing, cool, guided, timed, checklist, pulse, list, plans, and so on) and its steps, so wording can be edited without touching code. `npm run check` fails if a tool has no valid type or is missing its steps.
- **Guided tools:** one step at a time with a Next button. A few (tense and release) move on by themselves after 12 seconds. No step counters and no progress bars. Timed tools (urge surfing, three-minute anchor) rotate their prompts across the chosen time and end softly.
- **External anchors only:** urge surfing rests the eyes on the room rather than asking where the urge is felt, in line with the no-interoception rule.
- **Content screens** (evidence bank, parking lot, appointment prep, notes for later, plans, stims, handoff, name it, pros and cons) have one Back button. Leaving logs a neutral completed visit, since there is nothing to finish and it would otherwise always count as an early exit.
- **Where content lives:** entries are in IndexedDB (`evidence`, `parkingLot`, `prepPoints`, `contingencies`). "Note for later" shares the `evidence` store with a `kind` field, so no schema change was needed. Stims are in small settings on the device. The app never reads or interprets any of it.
- **Name it** and **Pros and cons** save nothing, on purpose. Saving the chosen word is under Proposed.
- **Plans:** "If … then …" with a free-text trigger (suggestions from the trigger tags), free text or a linked tool, and Archive/Restore. Tapping Start on a linked plan opens that tool with the opener logged as `plan`. Home shows one quiet "Your plans" card only when a plan exists.
- **Appointment prep:** points stay until removed. "Raised" only greys a point and moves it down; nothing is overdue.
- **Build** lists exactly the six Build tools from SPEC §5. Other tools are Library and Now only.
- **Absorb games:** bubble pop, sort shapes and kaleidoscope end softly at 3 minutes like the others. Sort shapes ignores a wrong tap quietly, with no message. Under reduced motion bubbles appear in place instead of rising.
- **Leaving by the nav bar** during a tool now logs a neutral early exit instead of nothing.
- **Butterfly hug:** two dots take turns each second, with the words always shown. The dots change state rather than move, so it works with reduced motion.

## Proposed
- Optionally save the word chosen in Name it, so it can be attached to a session.

## Milestone 5
- **When the row appears:** only after a tool ends by itself (its soft end, or Done). Never before or during a tool, never after Stop, and never once the user has left. It appears once per session, so nothing is asked twice. Content screens (lists, plans) show no row.
- **It fades on its own** after about 8 seconds. Any touch, key press or focus inside keeps it there until the user leaves. Under reduced motion it disappears without the fade. It can be switched off in Settings ("Show the optional row after a tool").
- **Everything saves as you tap.** There is no Save button. The note is stored as typed and never read or interpreted by the app.
- **The 5-point scale runs Quieter to Louder** and uses a filling circle, position and number, with colour as an extra. A higher number means louder, which matches the recovery indicator in the export (a later, lower rating is a settling). The wording says nothing about how the user is.
- **"Before" rating:** offered only on the start screen of Library and Build breathing tools, because those are the only tools that have a start screen. Now mode never shows it. The spec's "from a session's detail" route is under Proposed, since a session history screen is not in the More list.
- **Tags:** the defaults stay in `data/tags.json`. What the user changes (renames, hidden, added) is a small overlay in the `tagsConfig` store, so new default tags in a future version still appear. "Not sure" is fixed and always last. Renaming a tag does not rewrite past sessions. Most-used tags move to the front by counting past sessions.
- **Body tags** are off until switched on, in Settings or on the Tags screen. They get a "Not sure" too.
- **No schema change,** so no migration was needed this milestone. The `tagsConfig` store already existed.

- Proposed: a plain session history (tool and date only) so a "before" rating can be added later, and so single sessions can be tagged afterwards. (Owner: leave under Proposed for now.)

## Owner decisions after Milestone 5
Approved by the owner. These replace the earlier defaults where they differ.
1. **Content tools are tagged and left out of the early-exit rate.** Sessions on lists, plans, notes, stims, name it, pros and cons and handoff carry `contentTool: true`. Leaving them is never an early exit. Older records are described by the same rule when read.
2. **Left as is:** the optional "before" rating stays on breathing start screens only, and a session history screen stays under Proposed.
3. **Exits under about 5 seconds are logged as "opened",** not as an early exit (`opened: true`, `exitedEarly: false`). Opened sessions still count as a use of the app, and they are left out of the early-exit rate. `CLAUDE.md` rule 13 and `SPEC.md` §7 and §9 now say so.
4. **A plan starts its linked tool straight away,** skipping the start screen on breathing tools. The cool-water caution still shows once before first use.

## Milestone 6
- **Export is manual and stays on the device** unless the owner saves or shares a file. Phones use the share sheet when it can take a file, otherwise the browser downloads it. Nothing is uploaded.
- **Appointment summary** (one A4 page) and **detailed report** (two A4 pages at most) are on-screen pages printed with the browser's Print, so there are no libraries. They were checked at a worst case of 26 weeks and 400 sessions: 1 page and 2 pages. Adding many chosen notes can make them longer.
- **Uses by period** is one table of Now, Build and Library counts, so it covers both "Now-mode uses per week" and "Build and Now by week". Ranges over 26 weeks switch to months, capped at the latest 24.
- **Early-exit rate** follows the definition now in `SPEC.md` §9: opened sessions and content tools are left out, and a tool needs at least 3 completed or early-exit sessions to appear.
- **Recovery indicator** compares real moments in time, so a clock change cannot distort it. A Now session counts if it has an "after" rating. It looks for the earliest later session within 3 hours whose "before" rating is lower. The median is shown with how many were found, and the low-reliability line. It reads "Not available" when nothing qualifies.
- **The fixed footer** is printed on both reports, and `npm run check` fails if it differs from `SPEC.md` §9.
- **Notes and appointment points are off by default.** The owner chooses each note to include; unchosen notes stay out of the reports and the CSV.
- **CSV:** one row per session, oldest first, a leading byte-order mark so spreadsheets read accents, and every text cell quoted. A cell starting with `=`, `+`, `-` or `@` gets a leading apostrophe so a spreadsheet never runs it as a formula. Extra columns `outcome`, `opened` and `contentTool` describe each session plainly.
- **Backup** holds every store plus the small settings, whatever the date range. **Restore** shows what the file contains and asks for one more tap. It replaces what is on the device in a single transaction, so it all happens or none of it does. Wrong files and files from a newer version are refused and change nothing.
- **Round trip tested:** export a backup, wipe every store and the settings, restore, then compare. All 9 stores and the settings came back identical (400 synthetic sessions), and new sessions afterwards get fresh ids.
- **Tests in `npm run check`:** `scripts/test-export.mjs` checks the calculations with fake data, including days with no use, a clock-change case, the early-exit rules, CSV quoting and backup validation.
- **Files are named** `pocket-po-sessions-DATE.csv` and `pocket-po-backup-DATE.json`, both already covered by `.gitignore`.
