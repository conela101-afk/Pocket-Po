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
- Let a plan start its linked tool straight away, skipping the start screen on breathing tools.
