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
