# SPEC.md — Pocket Po

Status: draft v1, for owner correction. Contains no personal data by design (see `CLAUDE.md`, Privacy). Rules live in `CLAUDE.md` and take precedence.

## 1. Purpose

A private, offline, neurodivergent-oriented regulation app with two jobs:

1. **Bad-day use (Now mode):** near-zero-decision support when dysregulated.
2. **Daily use (Build + Library):** low-demand practice that builds distress tolerance when well.

It also quietly records what was used so the owner can bring descriptive numbers to appointments.

## 2. Screens and navigation

Bottom nav (5): **Home · Now · Build · Library · More**. The Now button is also a floating control on every screen except inside a running tool.

| Screen | Contents |
|---|---|
| **Home** | Po doing an ambient activity (nap, wash, watch a bird, loaf). 2–3 offered tools rotated by time-of-day block. Nothing overdue, no counters. |
| **Now** | Po plus up to 3 large cards (the user's defaults) and an optional Quiet card. See §3. |
| **Build** | Short (2–5 min) tolerance-building sessions. See §5. |
| **Library** | Browse by category (§4), search, "favourites" (star), "recently used" (silent, no counts). |
| **More** | Notes and evidence bank, contingency builder, parking lot, appointment prep card, tags editor, export, settings, safety info. |

First run: a 4-step setup done in one sitting while regulated (skippable, resumable, editable later): choose the 3 Now defaults, optional Quiet card, handoff message text, Po colour-blind-safe check, reduce-motion and sound preferences.

## 3. Now mode

- Opens in ≤ 1 tap from anywhere and from cold launch (a "Now" launcher shortcut in the manifest).
- Screen: Po, then up to three cards, each with an icon and ≤ 6 words. No headings, no explanatory text.
- **Default card set (editable):**
  1. **Cold** – "Cold water on your face, 30 seconds."
  2. **Pace** – Po breathes with a longer exhale than inhale; user follows.
  3. **Absorb** – pet Po, or slow pattern trace; soft end at about 3 min.
  4. **Quiet** (optional 4th slot, or replaces one) – screen dims, Po sleeps, nothing is asked.
- Optional **Auto-start**: if enabled, the top card starts immediately on entering Now.
- **Handoff button**: small, always present on the Now screen. Opens a pre-written message to the user's chosen person (§8).
- After a tool ends: Po settles. Then one optional, auto-fading row (§7). Then a quiet exit to Home or stay.
- No logging prompts before or during.

## 4. Library

Every tool has: `id`, `name`, `category`, `durationOptions`, `modes` (now/build/library), `prompt copy`, `caution` (optional), `flags` (e.g. `optional`, `avoidsInteroception`).

### Categories and tools

**Breathing**
| id | Name | Pattern |
|---|---|---|
| `box` | Box breathing | 4 in, 4 hold, 4 out, 4 hold. Offer a "no holds" variant. |
| `cyclic-sigh` | Cyclic sighing | Two nose inhales (full, then a short top-up), long slow mouth exhale. 1, 3, 5 min. |
| `paced-55` | Slow paced breathing | About 5.5 breaths/min (5.5 in / 5.5 out) with a visual pacer. |
| `ext-exhale` | Longer exhale | 4 in, 6 out. |
| `hum-exhale` | Humming exhale | 4 in, 6–8 hum out. |
| `pursed-lip` | Pursed-lip breath | 2 in, 4 out through pursed lips. |
| `478` | 4-7-8 (optional) | Marked "involves a hold; skip if it feels uncomfortable." |

All breathing tools use Po as the pacer (Po expands and contracts, and a soft ring fills). No counting is required. Optional soft audio tone or vibration. Every tool has a "shorter exhale, just go at your pace" comfort toggle.

**Body-first (no interoception needed)**
`cold-face`, `cold-hands` (hands under cool tap or holding a cold item), `warmth` (warm drink, warm hands), `wall-push`, `self-squeeze`, `tense-release` (muscle groups sequence, external prompts only), `shake-out`, `butterfly-hug` (bilateral tapping), `stim-menu` (user-editable list of their own stims, with Po examples).

**Ground (external focus)**
`room-orient` (slow look around, name colours), `sound-map`, `describe-object`, `54321` (flagged optional).

**Absorb (time-capped, soft end ~3 min)**
`pet-po`, `pattern-trace`, `bubble-pop`, `sort-shapes`, `kaleidoscope`.

**Thinking**
`name-it` (pick one word for the feeling from a short list or type), `defusion` ("I'm having the thought that…"), `demand-choice` ("What's the demand here, and what part of it is my choice?", written for demand-sensitive users), `contingency-builder` (§6), `parking-lot` (write an unresolved thought and put it away).

**DBT-adapted (reworded as invitations)**
`tipp`, `self-soothe-senses`, `radical-acceptance`, `pros-cons`.

**Household**
`handoff` (§8), `caregiver-reset` (5-minute checklist for when caring for a child: child safe in a set spot, water, breathe, cold, return).

**After an episode**
`after-checklist` (water, food, quiet, wash face), `repair-note` (optional note for later).

**Meaning**
`evidence-bank` (things that went well or that others said about you), `appointment-prep` (jot points to raise before a session; carry-forward list).

## 5. Build mode

Short practices for when the user is well. They mirror Now-mode tools so they become familiar.

- `build-cold-low` – low-intensity cold exposure (cool, not painful), 15–30 s.
- `build-exhale-3` – 3-minute extended-exhale practice.
- `build-urge-surf` – sit with a mild urge for 2 minutes before acting; Po sits alongside.
- `build-anchor-3` – external-anchor mindfulness (sounds, textures, visual focus) for 3 minutes.
- `build-contingency` – write one if-then plan.
- `build-name-it` – label one feeling.

Build mode never shows targets, levels or streaks. Sessions can be any length; ending early is fine.

## 6. Contingency builder

Forming a plan often settles unresolved-loop distress, so this is a priority feature.

- Fields: **If** (trigger, free text or from tag list) → **Then** (chosen tool or free text).
- Saved plans appear on Home as a single quiet "Your plans" card.
- Plans can link to a tool so tapping the plan starts it.
- Plans can be archived, never "failed".

## 7. Data model

Stored in IndexedDB.

**`sessions`**
```
id, ts (ISO 8601 local), dow (0–6), block (earlyMorning|morning|afternoon|evening|night),
mode (now|build|library), toolId, category,
opener (nowButton|poSuggestion|browse|anchor|plan),
durationSec, completed (bool), exitedEarly (bool), opened (bool, exit under ~5 s), contentTool (bool),
gapSincePrevNowSec (nullable), handoffPressed (bool),
ratingBefore (1–5|null), ratingAfter (1–5|null),
helped (helped|neutral|didnt|null),
triggers[] , context[] , body[] , note (text|null), voiceNoteId (nullable)
```
Time blocks: earlyMorning 05–09, morning 09–12, afternoon 12–17, evening 17–21, night 21–05.

**Other stores:** `evidence`, `parkingLot`, `contingencies`, `prepPoints`, `favourites`, `tagsConfig`, `settings`, `poState` (cosmetic unlocks, cumulative session count only).

### Default tags (all multi-select, skippable, "Not sure" always present)

- **Trigger:** Demand or pressure · Not knowing what's expected · Sensory · Tired or hungry · People or social · Something unresolved · Not sure
- **Context:** Home · Out · With family · Alone
- **Body (hidden by default, switch on in settings):** Slept badly · Hungry · In pain · Cycle-related

Behaviour: rename, hide or add tags in settings. Most-used tags move to the front. Skipped tags still log the session.

**Optional post-tool row** (single screen, auto-fades after about 8 s, only shown once per session): 5-point colour scale for how you feel now, Helped / Neutral / Didn't, trigger and context chips, note field.
The "before" rating can be entered later from a session's detail, or from the start of Build/Library tools only. It is never asked in Now mode.

## 8. Handoff

- **No phone number or contact is stored in the app or repo.** Settings hold only the message text (default: "Need you to take over, no questions.").
- Tapping the button opens the device share sheet (`navigator.share`) or an `sms:` link with a prefilled body and **no recipient** (iOS uses `sms:&body=`, Android `sms:?body=`; feature-detect), and the user picks the person in their own messaging app. Fall back to Copy-message.
- Optional: the user can pin the recipient inside their own messaging app (for example a pinned chat) so it is one tap there.
- Logs `handoffPressed = true` on the current or most recent Now session.
- No confirmation dialog. The message is already visible on the button label.

## 9. Export

Export is manual only, from More → Export. Choose a date range.

**Formats**
1. **Appointment summary** (one printable page, via `window.print()` with a print stylesheet, no libraries)
2. **Detailed report** (two pages max)
3. **CSV** (one row per session)
4. **JSON** backup, with a matching restore

**Appointment summary contents**
- Date range, number of days with any use, number of days with none (neutral phrasing).
- Now-mode uses per week (small table).
- Time-of-day block distribution for Now-mode uses.
- Tools used most; tools rated Helped most; tools with highest early-exit rate.
- Trigger and context tag frequencies (counts only, no interpretation).
- Build-mode vs Now-mode session counts by week.
- Recovery indicator (see below), with its reliability caveat.
- Handoff button presses.
- Optional: selected notes and appointment prep points.

**Definitions**
- *Recovery indicator:* minutes from a Now-mode session start to the next session (any mode) within 3 hours whose "before" rating is lower than the Now session's rating. Null if unavailable. Marked low reliability.
- *Early-exit rate:* early exits divided by sessions that were completed or exited early. Sessions marked `opened` and content tools (lists, plans, notes, stims, handoff) are left out.
- *Day with no use:* calendar day with zero logged sessions.

**Fixed footer (do not edit):**
> This summary is self-collected by the user from an app on their phone. It only records times the app was opened, so it is a minimum count, not a full picture. Ratings and tags are optional and self-reported; the user's awareness of internal body signals may be reduced, so ratings may under- or over-state distress. These figures are descriptive only and are not evidence of any diagnosis.

## 10. Po

**Look:** pixel-art orange tabby, chunky, warm palette. Frames 32×32 authored, displayed at integer scale (4×–6×). One spritesheet, one JSON frame map.

**States (frames)**
| state | frames | notes |
|---|---|---|
| `idle-loaf` | 4 | slow blink, tail flick |
| `sit` | 4 | default on Now |
| `breathe-in` | 6 | body expands |
| `breathe-out` | 6 | body contracts |
| `sleep` | 4 | Quiet mode, slow rise and fall |
| `purr` | 4 | pet-po, subtle vibration |
| `walk` | 6 | enter and exit |
| `wash` | 6 | ambient |
| `watch-bird` | 4 | ambient, tail twitch |
| `yawn-settle` | 6 | soft-end of absorb tools |
| `stretch` | 6 | ambient |

Animation via CSS `steps(N)` on `background-position`. `prefers-reduced-motion` or the settings toggle swaps animations for single static poses.

**Unlocks (permanent, cosmetic, no loss):** based on cumulative sessions (25, 75, 150, 300…): cushion, scarf, window perch, plant, blanket, fish bowl. Unlocks are shown quietly on Home, never announced with a fanfare.

**Dev tooling:** `tools-dev/generate_po.py` generates placeholder sprites procedurally with Pillow (palette-based), so the owner can iterate without art skills. It is replaceable by hand-drawn art later.

## 11. Safety copy (fixed)

**Cold tools, shown once before first use and always available from the tool's "i":**
> Cold on the face can slow your heart rate. Skip it if you have a heart condition, take medication that affects heart rate, tend to faint, or have a skin condition on your face. Use cool water or a wrapped ice pack, never ice directly on skin, never hold your breath or submerge your head. If unsure, check with your GP. Stop if you feel dizzy or unwell.

**Footer on More and Now screens (small, always visible):**
> If you're in crisis or need someone now: Samaritans 116 123 (free, 24/7) · Pieta 1800 247 247 · Emergency 999 or 112

## 12. Accessibility and sensory

- Reduce-motion, sound (off default), vibration (off default), dark mode (auto by system, overridable), text size setting, high-contrast option.
- Touch targets ≥ 56 px, spacing generous, one primary action per screen.
- No flashing content. Animations are slow and low-contrast.
- Screen-reader labels on all controls.

## 13. Milestones

1. **Skeleton:** repo, manifest, service worker, routing, IndexedDB, Home/Now/Library shells, offline test, GitHub Pages deploy.
2. **Po + pacer:** placeholder spritesheet, breathing tools with Po pacer, reduce-motion.
3. **Now mode complete:** setup flow, defaults, Quiet, handoff, cold-tool caution, absorb tools with soft end.
4. **Library and Build:** all tools from §4–5, contingency builder, parking lot, evidence bank, appointment prep.
5. **Logging and tags:** automatic session logging, post-tool optional row, tag editor.
6. **Export:** summary, detailed report, CSV, JSON backup and restore.
7. **Polish and hardening:** accessibility pass, banned-phrase check, iOS/Android install tests, unlocks, final copy edit by owner.

## 14. Open items for owner review

- Confirm the default Now trio (Cold / Pace / Absorb) and whether Quiet is the 4th slot or a replacement.
- Confirm voice notes are in scope for v1 (adds storage size and iOS microphone permission complexity).
- Handoff: decided, no number stored (§8).
- Style reference: an optional reference image for the pixel art. Never commit personal screenshots to the repo.
