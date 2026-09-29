# CLAUDE.md — Pocket Po

Pocket Po is a private regulation companion PWA for a single neurodivergent adult building distress tolerance and using the app on bad days. A pixel orange cat, **Po**, is the companion. Read `SPEC.md` for the full build spec. This file is the rulebook. If the two conflict, this file wins.

## Working method

- **Outside-in.** Propose a concrete draft, then let the owner correct it. Do not ask open questions or long lists of questions. When something is ambiguous, pick a sensible default, note it in `DECISIONS.md`, and move on.
- Keep responses to the owner short and clear. Summarise what changed, not how.
- After editing any file that has counts, cross-references or lists (tool counts, tag lists, tool IDs, screen names), run a **whole-repo consistency check**, not only the section you touched. `npm run check` (see below) automates part of this.

## Non-negotiable design rules

The main risk is that the app itself becomes a demand. Prescribed coping tools often become new demands with failure states for this audience. Every rule below exists to prevent that.

1. **No failure states.** No streaks, no "you missed a day", no overdue items, no guilt copy, no progress bars toward goals, no badges that can be lost.
2. **No nagging.** No notifications, reminders or prompts unless the user has switched them on, and they must be one tap to remove. Default is off. Never use push.
3. **Invitation wording.** "If you like…", "You could…", "One option:". Never "You must", "Don't forget", "Time to…", "You should".
4. **Now mode makes zero decisions.** One large button leads straight to a pre-set default. No menus, no questions, no reading beyond a few words. Maximum 3 cards plus an optional Quiet card. The user picks the default once during setup while regulated.
5. **Questions during distress are extra load.** In Now mode, tags and ratings are never shown before or during a tool. After a tool they appear only as an optional, skippable, single-screen row that fades away by itself. Never ask twice.
6. **Logging is automatic.** Awareness of internal body signals can be limited, so self-report is unreliable and effortful. Record what the app can observe without input. Anything typed or tapped by the user is optional.
7. **Po is always fine.** Po never gets hungry, sad, sick or lonely, and never "dies". Po reacts only when the user interacts. Unlocks are permanent and cosmetic, and based on cumulative use, never streaks.
8. **Time-capped absorb tools.** Repetitive visual tools have a soft end (about 3 minutes) with Po yawning and settling. They must not become a scroll loop.
9. **Nothing interprets the user.** The app shows counts and descriptions only. It never says the user is "improving", "declining", "dysregulated" or anything diagnostic. No scores, no charts inside the app. Numbers appear only in the export.
10. **Local only.** All data stays on the device. No analytics, no accounts, no third-party scripts, no network calls at runtime other than fetching the app's own files. No fonts from a CDN.
11. **Safety copy is fixed.** The cold-water caution and the crisis footer (see `SPEC.md` §11) must appear exactly as specified and must not be removed, softened or hidden.
12. **Sensory-safe.** Reduce-motion toggle (respect `prefers-reduced-motion` by default), sound off by default, no flashing, no sudden loud audio, no full-white flashes, low-contrast-glare palette with a dark mode, large touch targets (≥ 56px), short text.
13. **Escape hatch everywhere.** Every tool has a large, always-visible Back or Stop that exits instantly without penalty and logs the session as "exited early" (a neutral fact, not a failure).

## Tech constraints

- Vanilla HTML, CSS and JavaScript (ES modules). **No framework, no build step required to run.** Optional dev tooling is allowed only for checks.
- Installable, fully offline PWA: `manifest.webmanifest`, `service-worker.js` with cache-first app shell and a versioned cache name, icons (192, 512, maskable).
- Storage: IndexedDB for session logs and user content; `localStorage` only for small settings. Call `navigator.storage.persist()` on first run. Provide manual JSON backup and restore.
- Hosting: GitHub Pages from `main` (`/docs` or root, whichever is simpler). All paths must be **relative** so the app works under a repo subpath.
- Sprites: CSS `steps()` animation on spritesheets, `image-rendering: pixelated`. No canvas or game library.
- Haptics: `navigator.vibrate` where available (Android). Do not rely on it. iOS has no equivalent, so always pair with a visual cue.
- Target: current iOS Safari and Android Chrome, installed to the home screen.

## Repo layout

```
/index.html
/manifest.webmanifest
/service-worker.js
/css/            app.css, po.css, themes.css
/js/             app.js, router.js, db.js, po.js, tools/*.js, export.js, settings.js
/data/           tools.json, tags.json, copy.json
/assets/po/      po-sheet.png (+ po-sheet.json frame map)
/assets/icons/
/tools-dev/      generate_po.py (spritesheet generator, dev only)
/SPEC.md  /CLAUDE.md  /DECISIONS.md  /CHANGELOG.md
```

All user-facing wording lives in `data/copy.json` and `data/tools.json` so it can be edited without touching code.

## Definition of done (per milestone)

- Works offline after first load (test in airplane mode).
- Installs and launches standalone on iOS and Android.
- Now mode reachable in one tap from every screen, and from cold launch in one tap.
- No rule in this file violated. Run through the list explicitly.
- `npm run check` passes (if present): validates that every tool ID referenced in `tags.json`, defaults, Home rotation and the export exists in `tools.json`, that all copy keys resolve, and that no banned phrases from `data/banned-phrases.txt` appear in user-facing copy.
- `CHANGELOG.md` updated in one or two plain lines.

## Never do

- Never add gamification that can be lost, timers that shame, or comparison to other people.
- Never add breath holds by default (4-7-8 exists only as a clearly marked optional tool).
- Never add a body-scan tool. Reliance on internal body signals tends to frustrate this audience. Use external-anchor alternatives.
- Never add medical or diagnostic claims. The export footer wording in `SPEC.md` §9 is fixed.
- Never send data anywhere.

## Privacy of this repository (hard rule)

The repo may be public and GitHub Pages is public. **No personal data about the owner or anyone connected to them may appear anywhere in the repo, commits, issues, PRs, comments, test data, screenshots, filenames or generated files.** That includes names, contact details, phone numbers, addresses, locations, diagnoses or health details, family details, and real usage logs.

- Keep all copy generic ("the user"). Use neutral defaults in `data/*.json`.
- Test data must be synthetic and obviously fake.
- Do not commit exports or backups. `.gitignore` must include `*.csv`, `*backup*.json`, `exports/`.
- The app stores nothing personal in code. Personal content (contact choice, messages, notes, logs) exists only on the user's device.
- If you find personal data in the repo or the owner pastes some into chat, do not copy it into files. Flag it in one line.
- `npm run check` should fail if `data/banned-personal-terms.txt` (kept out of git via `.gitignore`, maintained locally by the owner) matches any tracked file.
