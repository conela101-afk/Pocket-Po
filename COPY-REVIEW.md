# Copy review

Every word the user reads, in one place, for your final edit. Nothing here is personal: it is the app's own wording.

**How to use it:** read through, and change anything that does not sound right. Either tell Claude the change, or edit `data/copy.json` (screen wording) or `data/tools.json` (tool names and instructions) directly. `npm run copy` rebuilds this file, and `npm run check` tests the tone rules.

**Tone rules to read against:** plain, short, warm; invitation wording ("If you like", "You could", "One option:"); no exclamation marks, no clinical words, no slogans; Irish or British spelling; nothing that tells you how you feel.

**Fixed wording (not for editing):** the cool-water caution, the crisis footer and the export footer are set by `SPEC.md` and are marked *fixed* below.


## App

| Where | Wording |
|---|---|
| `app.name` | Pocket Po |
| `app.error` | That screen didn't load. |
| `app.errorHome` | Back to Home |

## Bottom bar

| Where | Wording |
|---|---|
| `nav.home` | Home |
| `nav.now` | Now |
| `nav.build` | Build |
| `nav.library` | Library |
| `nav.more` | More |

## Home

| Where | Wording |
|---|---|
| `home.offer` | One option: |
| `home.plans` | Your plans |
| `home.noPlans` | Plans you write will wait here. |
| `home.plansLink` | Your plans |

## Now

| Where | Wording |
|---|---|
| `now.quiet` | Quiet |
| `now.handoff` | Handoff |
| `now.stop` | Stop |
| `now.back` | Back |

## Build

| Where | Wording |
|---|---|
| `build.intro` | If you like, a short practice for a calmer moment. Stop whenever. |

## Library

| Where | Wording |
|---|---|
| `library.search` | Search |
| `library.favourites` | Favourites |
| `library.recent` | Recently used |
| `library.empty` | Nothing here yet. |

## More

| Where | Wording |
|---|---|
| `more.title` | More |
| `more.items.setup` | Set up Now |
| `more.items.notes` | Notes and evidence |
| `more.items.plans` | If-then plans |
| `more.items.parking` | Parking lot |
| `more.items.prep` | Appointment prep |
| `more.items.tags` | Tags |
| `more.items.export` | Export |
| `more.items.settings` | Settings |
| `more.items.safety` | Safety info |
| `more.soon` | Coming soon. |

## Tool screens

| Where | Wording |
|---|---|
| `tool.stub` | This tool is on its way. |
| `tool.info` | i |
| `tool.cautionTitle` | Before you start |
| `tool.ok` | Got it |
| `tool.done` | I'm done |
| `tool.settled` | Po is settled. Stay as long as you like. |
| `tool.coolEnd` | That's the time. Stop whenever you like. |
| `tool.petHint` | Stroke Po slowly. |
| `tool.traceHint` | Follow the line with your finger. |
| `tool.pulse` | Tap each shoulder, one side and then the other. |

## Optional row after a tool

| Where | Wording |
|---|---|
| `after.lead` | If you like: |
| `after.scale` | How is it now? |
| `after.before` | Before you start, if you like: how is it now? |
| `after.lo` | Quieter |
| `after.hi` | Louder |
| `after.helped` | Helped |
| `after.neutral` | Neutral |
| `after.didnt` | Didn't |
| `after.note` | A note, if you like |
| `after.groups.trigger` | Trigger |
| `after.groups.context` | Context |
| `after.groups.body` | Body |

## Tag editor

| Where | Wording |
|---|---|
| `tags.title` | Tags |
| `tags.intro` | Rename, hide or add tags. The ones you use most move to the front. |
| `tags.notSure` | Not sure |
| `tags.hide` | Hide |
| `tags.show` | Show |
| `tags.add` | Add |
| `tags.newPlaceholder` | A new tag |
| `tags.bodyNote` | Off until you switch it on. |

## Settings

| Where | Wording |
|---|---|
| `settings.afterRow` | Show the optional row after a tool |
| `settings.bodyTags` | Show body tags |
| `settings.title` | Settings |
| `settings.reduceMotion` | Reduce motion |
| `settings.sound` | Sound |
| `settings.vibration` | Vibration |
| `settings.dark` | Theme |
| `settings.darkAuto` | Auto |
| `settings.darkOn` | Dark |
| `settings.darkOff` | Light |
| `settings.textSize` | Text size |
| `settings.highContrast` | High contrast |
| `settings.autoStart` | Auto-start top Now card |
| `settings.handoffMessage` | Handoff message |
| `settings.comfort` | Shorter exhale, just go at your pace |
| `settings.sizeSmall` | Small |
| `settings.sizeMedium` | Medium |
| `settings.sizeLarge` | Large |

## Safety

| Where | Wording |
|---|---|
| `safety.cold` | *fixed* Cold on the face can slow your heart rate. Skip it if you have a heart condition, take medication that affects heart rate, tend to faint, or have a skin condition on your face. Use cool water or a wrapped ice pack, never ice directly on skin, never hold your breath or submerge your head. If unsure, check with your GP. Stop if you feel dizzy or unwell. |
| `safety.crisis` | *fixed* If you're in crisis or need someone now: Samaritans 116 123 (free, 24/7) · Pieta 1800 247 247 · Emergency 999 or 112 |

## Handoff

| Where | Wording |
|---|---|
| `handoff.copied` | Message copied |

## Breathing tools

| Where | Wording |
|---|---|
| `breathe.length` | How long |
| `breathe.noHolds` | No holds |
| `breathe.comfort` | Shorter exhale, just go at your pace |
| `breathe.start` | Start |
| `breathe.settled` | Po is settled. Stay as long as you like. |
| `breathe.in` | In |
| `breathe.out` | Out |
| `breathe.hold` | Hold |
| `breathe.topup` | A little more |
| `breathe.hum` | Hum out |

## First-run setup

| Where | Wording |
|---|---|
| `setup.title` | Set up Now |
| `setup.step` | Step |
| `setup.of` | of |
| `setup.skip` | Skip for now |
| `setup.next` | Next |
| `setup.back` | Back |
| `setup.done` | Done |
| `setup.s1.title` | Your Now cards |
| `setup.s1.intro` | If you like, pick up to three for the Now screen. You choose once, while you feel steady, so Now never needs a decision. |
| `setup.s1.limit` | Three chosen. Untick one to swap. |
| `setup.s2.title` | Quiet and handoff |
| `setup.s2.quiet` | Add a Quiet card |
| `setup.s2.quietHint` | The screen dims, Po sleeps and nothing is asked. |
| `setup.s2.handoff` | Handoff message |
| `setup.s2.handoffHint` | It opens in your messaging app, where you choose who receives it. No contact is stored here. |
| `setup.s3.title` | How Po looks |
| `setup.s3.intro` | One option: check that Po is easy to see, then pick the look that suits you. |
| `setup.s3.standard` | Standard |
| `setup.s3.clear` | Clearer |
| `setup.s3.soft` | Softer |
| `setup.s3.light` | Light background |
| `setup.s3.dark` | Dark background |
| `setup.s4.title` | Movement and sound |
| `setup.s4.intro` | Both can be changed any time in Settings. |

## Common buttons

| Where | Wording |
|---|---|
| `common.next` | Next |
| `common.done` | Done |
| `common.add` | Add |
| `common.save` | Save |
| `common.remove` | Remove |
| `common.back` | Back |
| `common.new` | New |
| `common.archive` | Archive |
| `common.restore` | Restore |
| `common.archived` | Archived |

## Lists (evidence, parking lot, prep, notes)

| Where | Wording |
|---|---|
| `lists.evidence-bank.intro` | Things that went well, or that others have said about you. Add one whenever you like. |
| `lists.evidence-bank.placeholder` | Something that went well |
| `lists.evidence-bank.empty` | Nothing here yet. That's fine. |
| `lists.parking-lot.intro` | Write a thought that isn't settled and put it here. It will wait. |
| `lists.parking-lot.placeholder` | A thought to park |
| `lists.parking-lot.empty` | Nothing parked. |
| `lists.parking-lot.added` | Parked. It can wait. |
| `lists.appointment-prep.intro` | Points to raise at your next session. They stay here until you remove them. |
| `lists.appointment-prep.placeholder` | A point to raise |
| `lists.appointment-prep.empty` | No points yet. |
| `lists.appointment-prep.toggle` | Raised |
| `lists.repair-note.intro` | An optional note for another day. |
| `lists.repair-note.placeholder` | A note for later |
| `lists.repair-note.empty` | No notes yet. |

## If-then plans

| Where | Wording |
|---|---|
| `plans.title` | If-then plans |
| `plans.intro` | If this happens, then I could do that. |
| `plans.if` | If |
| `plans.then` | then |
| `plans.ifPlaceholder` | this happens |
| `plans.thenPlaceholder` | I could... |
| `plans.tool` | Or start a tool |
| `plans.noTool` | No tool, just my words |
| `plans.empty` | No plans yet. |
| `plans.start` | Start |

## Name it

| Where | Wording |
|---|---|
| `nameIt.intro` | If you like, pick a word, or write your own. Nothing is saved. |
| `nameIt.own` | Or your own word |
| `nameIt.words` | calm · tense · tired · fuzzy · sad · cross · wired · flat · worried · overloaded · numb · okay · hopeful · restless |

## Pros and cons

| Where | Wording |
|---|---|
| `pros.pros` | Pros |
| `pros.cons` | Cons |
| `pros.intro` | Lay out both sides. Nothing here is saved. |
| `pros.placeholder` | One per line |

## Stims

| Where | Wording |
|---|---|
| `stims.intro` | Your own movements and textures that feel good. |
| `stims.placeholder` | Add your own |
| `stims.ideas` | Po's ideas |
| `stims.empty` | Nothing yet. |
| `stims.examples` | Rub a smooth stone or soft fabric · Rock gently · Hum a low note · Squeeze a soft toy · Tap a slow rhythm · Stretch and release your fingers |

## Handoff tool

| Where | Wording |
|---|---|
| `handoffTool.intro` | This sends your message through your messaging app. You choose who receives it. |

## Absorb games

| Where | Wording |
|---|---|
| `play.bubbles` | Tap a bubble to pop it. |
| `play.shapes` | Tap the place each shape belongs. |
| `play.kaleido` | Watch the pattern turn. Tap for a new one. |
| `play.circle` | Circle |
| `play.square` | Square |
| `play.triangle` | Triangle |

## Tick lists

| Where | Wording |
|---|---|
| `checklist.intro` | Take whichever you like. |

## Export and reports

| Where | Wording |
|---|---|
| `export.title` | Export |
| `export.intro` | Nothing leaves this device unless you choose to save or share a file. |
| `export.range` | Date range |
| `export.from` | From |
| `export.to` | To |
| `export.last4` | Last 4 weeks |
| `export.last3m` | Last 3 months |
| `export.all` | All time |
| `export.include` | Include, if you like |
| `export.prep` | My appointment points |
| `export.notes` | Notes I choose |
| `export.notesNone` | No notes in this range. |
| `export.notesCsv` | Notes go into the CSV only if you choose them here. |
| `export.makeSummary` | Appointment summary |
| `export.makeDetailed` | Detailed report |
| `export.makeCsv` | CSV of sessions |
| `export.makeJson` | Backup file (JSON) |
| `export.jsonNote` | A backup holds everything on this device, whatever the date range. |
| `export.restore` | Restore from a backup |
| `export.restoreIntro` | Choose a backup file you saved earlier. |
| `export.restoreNote` | Restoring replaces what is on this device with the contents of the backup. If there is anything here you want to keep, save a backup first. |
| `export.restoreGo` | Restore |
| `export.cancel` | Cancel |
| `export.restoreBad` | That file doesn't look like a Pocket Po backup. Nothing was changed. |
| `export.restoreNewer` | That backup comes from a newer version of Pocket Po. Nothing was changed. |
| `export.restoreFailed` | Something went wrong. Nothing was changed. |
| `export.restoreDone` | Restored. |
| `export.backupHas` | This backup has |
| `export.from2` | saved |
| `export.print` | Print or save as PDF |
| `export.back` | Back |
| `export.saved` | Saved |
| `export.footer` | *fixed* This summary is self-collected by the user from an app on their phone. It only records times the app was opened, so it is a minimum count, not a full picture. Ratings and tags are optional and self-reported; the user's awareness of internal body signals may be reduced, so ratings may under- or over-state distress. These figures are descriptive only and are not evidence of any diagnosis. |
| `export.report.summaryTitle` | Pocket Po summary |
| `export.report.detailedTitle` | Pocket Po detailed report |
| `export.report.range` | Range |
| `export.report.prepared` | Prepared |
| `export.report.secUse` | Use |
| `export.report.daysUse` | Days with any use |
| `export.report.daysNone` | Days with none |
| `export.report.sessions` | Sessions logged |
| `export.report.opened` | Opened and closed within seconds |
| `export.report.handoff` | Handoff button presses |
| `export.report.secPeriod` | Uses by period |
| `export.report.week` | Week of |
| `export.report.month` | Month |
| `export.report.capped` | Showing the latest 24 months. |
| `export.report.now` | Now |
| `export.report.build` | Build |
| `export.report.library` | Library |
| `export.report.secBlocks` | Now-mode uses by time of day |
| `export.report.blocks.earlyMorning` | Early morning (05–09) |
| `export.report.blocks.morning` | Morning (09–12) |
| `export.report.blocks.afternoon` | Afternoon (12–17) |
| `export.report.blocks.evening` | Evening (17–21) |
| `export.report.blocks.night` | Night (21–05) |
| `export.report.secTools` | Tools |
| `export.report.mostUsed` | Used most |
| `export.report.helpedMost` | Rated Helped most |
| `export.report.earlyRate` | Highest early-exit rate |
| `export.report.earlyNote` | Tools with at least 3 completed or early-exit sessions. Very quick exits and content screens are left out. |
| `export.report.tool` | Tool |
| `export.report.count` | Count |
| `export.report.of` | of |
| `export.report.early` | early exits |
| `export.report.none` | None recorded. |
| `export.report.secTags` | Tags (counts only) |
| `export.report.triggers` | Trigger |
| `export.report.context` | Context |
| `export.report.body` | Body |
| `export.report.secRecovery` | Recovery indicator |
| `export.report.recoveryLine` | Median minutes from a Now session to the next session with a lower "before" rating, within 3 hours: |
| `export.report.recoveryOf` | Found for {found} of {eligible} Now sessions with a rating. |
| `export.report.recoveryNA` | Not available. |
| `export.report.recoveryCaveat` | Low reliability: it depends on optional ratings and on when the app happened to be opened. |
| `export.report.secPoints` | Points to raise |
| `export.report.raised` | raised |
| `export.report.secNotes` | Notes chosen for this report |
| `export.report.secDow` | By day of week |
| `export.report.dow` | Mon · Tue · Wed · Thu · Fri · Sat · Sun |
| `export.report.secRatings` | Ratings after a tool |
| `export.report.ratingLabels` | 1 (quieter) · 2 · 3 · 4 · 5 (louder) |
| `export.report.secHelped` | Marked after a tool |
| `export.report.helped` | Helped |
| `export.report.neutral` | Neutral |
| `export.report.didnt` | Didn't |
| `export.report.secCategory` | By category |
| `export.report.category` | Category |
| `export.report.completed` | Completed |
| `export.report.earlyCol` | Early exits |
| `export.report.openedCol` | Opened |
| `export.report.total` | Total |
| `export.report.catNames.breathing` | Breathing |
| `export.report.catNames.body` | Body |
| `export.report.catNames.ground` | Ground |
| `export.report.catNames.absorb` | Absorb |
| `export.report.catNames.thinking` | Thinking |
| `export.report.catNames.dbt` | Skills |
| `export.report.catNames.household` | Household |
| `export.report.catNames.after` | After |
| `export.report.catNames.meaning` | Meaning |
| `export.report.catNames.build` | Build |
| `export.report.months` | Jan · Feb · Mar · Apr · May · Jun · Jul · Aug · Sep · Oct · Nov · Dec |
| `export.storeNames.sessions` | sessions |
| `export.storeNames.evidence` | evidence and notes |
| `export.storeNames.parkingLot` | parked thoughts |
| `export.storeNames.contingencies` | plans |
| `export.storeNames.prepPoints` | appointment points |
| `export.storeNames.favourites` | favourites |
| `export.storeNames.tagsConfig` | tag changes |
| `export.storeNames.settings` | settings |
| `export.storeNames.poState` | Po items |

## Screen-reader labels

| Where | Wording |
|---|---|
| `a11y.po` | Po, an orange cat |
| `a11y.favourite` | Favourite {name} |
| `a11y.bubble` | Bubble |
| `a11y.kaleido` | Kaleidoscope |
| `a11y.scaleN` | {n} of 5 |

## Now cards and Home

| Where | Wording |
|---|---|
| `nowCards.cold-face` | Cool water, 30 seconds |
| `nowCards.ext-exhale` | Slow breath out |
| `nowCards.pet-po` | Pet Po |
| `nowCards.cold-hands` | Cool hands, 30 seconds |
| `nowCards.pattern-trace` | Trace a slow pattern |
| `nowCards.quiet` | Quiet |
| `defaults.handoffMessage` | Need you to take over, no questions. |

## Tags

| Where | Wording |
|---|---|
| `tags.trigger` | Demand or pressure · Not knowing what's expected · Sensory · Tired or hungry · People or social · Something unresolved · Not sure |
| `tags.context` | Home · Out · With family · Alone |
| `tags.body` | Slept badly · Hungry · In pain · Cycle-related |

## Tools


### Breathing

**Box breathing** (`box`)  
Breathe in 4, hold 4, out 4, hold 4. A no-holds version is one tap away.

**Cyclic sighing** (`cyclic-sigh`)  
Two breaths in through the nose, one long slow breath out through the mouth.

**Slow paced breathing** (`paced-55`)  
In and out at a gentle pace with Po. About 5 to 6 seconds each way.

**Longer exhale** (`ext-exhale`)  
Breathe in for 4, out for 6. Po breathes with you.

**Humming exhale** (`hum-exhale`)  
Breathe in for 4, then hum the breath out.

**Pursed-lip breath** (`pursed-lip`)  
In for 2, out for 4 through pursed lips.

**4-7-8 (optional)** (`478`)  
Involves a hold; skip if it feels uncomfortable.


### Body

**Cool on your face** (`cold-face`)  
Cool water on your face for about 30 seconds. Cool, not painful.

**Cool hands** (`cold-hands`)  
Hold your hands under the cool tap. Cool, not painful.

**Warmth** (`warmth`)  
A warm drink, or warm hands around something warm.
1. If you like, make a warm drink, or hold something warm.
2. Let your hands wrap around the warmth.
3. Stay with it for as long as you like.

**Wall push** (`wall-push`)  
Press your hands into a wall and push, then let go.
1. Stand facing a wall, an arm's length away.
2. Put your palms flat on the wall and push, gently or firmly, whichever feels right.
3. Hold the push for a few seconds, then let your arms drop.
4. Repeat if you like.

**Self-squeeze** (`self-squeeze`)  
Wrap your arms around yourself and squeeze gently.
1. Wrap your arms around yourself.
2. Squeeze as firmly as feels comfortable, never painful.
3. Hold for a few seconds, then loosen.
4. Repeat if you like.

**Tense and release** (`tense-release`)  
Follow the prompts through each muscle group, tense then let go.
1. Keep breathing normally throughout. Tighten only as much as is comfortable.
2. Hands: make fists, then let go.
3. Arms: bend and tighten, then let go.
4. Shoulders: lift towards your ears, then let go.
5. Face: scrunch gently, then let go.
6. Legs: press your feet into the floor, then let go.

**Shake it out** (`shake-out`)  
Shake your hands, arms and legs loose.
1. Stand or sit, whichever suits.
2. Shake out your hands, loosely.
3. Shake your arms, then your legs if you like.
4. Let everything go still. Look around the room.

**Butterfly hug** (`butterfly-hug`)  
Cross your arms and tap each shoulder, one side then the other.

**Your stims** (`stim-menu`)  
Your own list of movements and textures that feel good.

**Quiet** (`quiet`)  
The screen dims. Po sleeps. Nothing is asked.


### Ground

**Look around the room** (`room-orient`)  
Slowly look around and name the colours you see.
1. Let your eyes move slowly around the room.
2. Find something blue, or the nearest colour to it.
3. Find something round.
4. Find something soft.
5. Let your eyes rest on whichever you liked best.

**Sound map** (`sound-map`)  
Listen and notice the sounds near, then far.
1. Listen for the sounds nearest to you.
2. Now the sounds a little further away.
3. Now the furthest sounds you can find.
4. Let the sounds come and go.

**Describe an object** (`describe-object`)  
Pick something nearby and describe it in detail.
1. Pick an object near you.
2. Say or think its colour and shape.
3. Say or think how it might feel to touch.
4. Say or think what it is for.

**5-4-3-2-1** (`54321`)  
Five things you see, four you touch, three you hear, two you smell, one you taste.
1. Five things you can see.
2. Four things you can touch.
3. Three things you can hear.
4. Two things you can smell, or like the smell of.
5. One thing you can taste, or a taste you like.


### Absorb

**Pet Po** (`pet-po`)  
Stroke Po slowly. Po purrs.

**Pattern trace** (`pattern-trace`)  
Trace the pattern slowly with your finger.

**Bubble pop** (`bubble-pop`)  
Pop bubbles as they drift by.

**Sort shapes** (`sort-shapes`)  
Sort the shapes, no score.

**Kaleidoscope** (`kaleidoscope`)  
Watch the pattern turn slowly.


### Thinking

**Name it** (`name-it`)  
Pick one word for how it feels, from a short list or your own.

**Having the thought** (`defusion`)  
Try: "I'm having the thought that..."
1. Think of the thought that is loudest right now.
2. Say it as: "I'm having the thought that..." and then the thought.
3. Try again with: "I notice I'm having the thought that..."
4. Let the thought be there, like a cloud passing or a sign on a wall.
5. You don't have to argue with it or agree with it.

**Demand and choice** (`demand-choice`)  
What's the demand here, and what part of it is yours to choose?
1. What is the demand here?
2. Who or what is it coming from?
3. Which part of it is yours to choose?
4. Which part isn't?
5. One small choice you could make: what is it?

**If-then plan** (`contingency-builder`)  
If this happens, then I could do that.

**Parking lot** (`parking-lot`)  
Write down an unresolved thought and put it away for now.


### Skills

**TIPP** (`tipp`)  
A gentle version: cool water on your face, a little easy movement, slow breathing. Pick what suits you.
1. A gentle version. Take whichever parts suit you and skip the rest.
2. Cool water on your face or hands. Cool, not painful. The i button has a safety note.
3. Some easy movement: walk around the room, or shake out your arms.
4. Slow your breathing, with a longer breath out than in.
5. Rest for a moment.

**Soothe the senses** (`self-soothe-senses`)  
One thing to see, hear, smell, taste and touch that feels kind.
1. Something to look at that you like.
2. Something to listen to that feels kind.
3. A smell you like, if there's one nearby.
4. Something small to taste, if you'd like.
5. Something soft or warm to touch.

**Radical acceptance** (`radical-acceptance`)  
This is how things are right now. You could rest with that.
1. This is how things are right now.
2. You could let that be true for a moment, without needing to like it.
3. You could loosen something: your jaw, your hands, your shoulders.
4. Rest here for as long as you like.

**Pros and cons** (`pros-cons`)  
Lay out both sides of an urge, then choose in your own time.


### Household

**Handoff** (`handoff`)  
Send a pre-written message to someone who can take over.

**Caregiver reset** (`caregiver-reset`)  
Child safe in a set spot, water, breathe, cool water, return. Five minutes.
1. The child is safe in a set spot.
2. Water for you.
3. Slow breaths, longer out than in.
4. Cool water on your face or hands.
5. Return when you're ready.


### After

**After an episode** (`after-checklist`)  
Water, food, quiet, wash your face. Take whichever you like.
1. Water
2. Food, if you can
3. Somewhere quiet
4. Wash your face

**Note for later** (`repair-note`)  
Leave a note for another day, if you like.


### Meaning

**Evidence bank** (`evidence-bank`)  
Things that went well, or that others have said about you.

**Appointment prep** (`appointment-prep`)  
Jot points to raise at your next session.


### Build

**Cool exposure** (`build-cold-low`)  
Cool, not painful, for 15 to 30 seconds.

**Three-minute longer exhale** (`build-exhale-3`)  
Three minutes of breathing out longer than in.

**Urge surfing** (`build-urge-surf`)  
Sit with a mild urge for two minutes before acting. Po sits alongside.
1. Notice the urge. You don't have to act on it yet.
2. Rest your eyes on something in the room while it is there.
3. Let it rise. Po is sitting alongside you.
4. Let it ease in its own time.
5. You can stay a little longer, or stop now.

**Three-minute anchor** (`build-anchor-3`)  
Rest your attention on sounds, textures or one thing you can see.
1. Listen to the sounds around you.
2. Pick one sound and stay with it.
3. Now look at one thing. Notice its edges and colours.
4. Touch something near you. Notice its surface.
5. Let your attention move between sound, sight and touch.
6. Rest your attention on whichever you like best.

**Write one if-then plan** (`build-contingency`)  
One if-then plan, in your words.

**Label one feeling** (`build-name-it`)  
Give one feeling a name.

