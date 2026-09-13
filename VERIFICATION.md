# Verification — 2026-09-12

## Automated checks

`npm test`: 29 passed, 0 failed. Covers reset, jump trajectory and buffering, grounded sliding, obstacle collisions, collision-to-game-over timing, collectible/combo scoring, pause, speed/density limits, capped frame deltas, exact scripture fragment reconstruction, and unique recall answers. The expanded suite also checks all 72 unique passages, six categories of 12, original passage identity, source links, legacy progress migration, failed-run rotation, partial collection, explicit practice selection, review scheduling, detached snapshots, and invalid saved data.

`npm run build`: completed. Static output is in `dist/`.

## Browser evidence

The local app was rendered in the Codex browser at desktop width and at 390 × 844. Inspected the start screen, full page, mobile start screen, pause overlay, and game-over/recall presentation.

- Start, Space jump, pause, and resume changed live game state correctly.
- A 22-second input-driven browser run used six jumps and two slides, reached 796 m, 4,193 points, a ×3 combo, and 405.71 world pixels/second (1.3× starting speed). All four Ephesians 6:10 fragments were collected. The test ended by pausing.
- The phone Slide button produced a grounded, 30-pixel-high sliding player. The phone Jump button produced an airborne player 122.48 pixels above ground.
- A collision produced a game-over score of 413. Keyboard selection of the correct recall answer raised the score to 513 exactly once. A page reload retained the 513 high score.
- The collection displayed the full acquired verse and recall count. Selecting the completed passage for practice retained that exact passage on the next run.
- Sound toggling enabled the original procedural choir-inspired bed and changed the enabled state successfully. Pausing and resuming the run exercised the music lifecycle, and the browser diagnostics stayed empty. Acoustic quality was not separately assessed with a listening test.

The initial synthetic keyboard harness dispatched an event to Document and exposed a non-Element target assumption. The handler was hardened, the harness switched to the game element, and the successful run above used the corrected code. Earlier error entries remain in the browser's session log; they are not errors from the final run.

## Expanded library browser evidence

- The library rendered all 72 passages across six topic filters. Spiritual warfare returned 12; searching Ephesians 6:17 returned the exact new passage and its source link. An unmatched search displayed a clear empty result and hid pagination.
- A failed run with zero collected fragments advanced from Ephesians 6:10 to James 4:7 on restart.
- A 31-second input-driven run, using 12 jump/slide actions, progressed through James 4:7, 2 Timothy 1:7, and Psalm 119:11. At pause it had reached 1,179 m, 6,734 points, a ×5 combo, and speed 444.45. This checks live in-run passage rotation rather than just the isolated scheduler.
- Selecting Philippians 4:13 from search returned to the start screen with that verse, persisted its ID, and began the next run with the selected passage.
- The expanded library was inspected at 390 × 844: page width matched the 390-pixel viewport, and dialog content width matched its 356-pixel interior without horizontal overflow. Show more increased rendered passages from 12 to 24.
- Gameplay QA used the separate 127.0.0.1 origin. The user's localhost origin retained its 17,273 high score and existing Ephesians 6:10 collection and recalls. The user's tab was refreshed and left on the expanded library.
- All 66 added full verses were compared against the cited eBible KJV edition; 15 also received independent Bible Gateway wording checks. See SCRIPTURE-ADDITIONAL-SOURCES.md for edition identity and evidence.

## Review fixes

Aligned the sliding artwork and branch canopy with their collision boundaries, fixed selecting already collected passages, preserved Space activation for ordinary buttons, prevented touch scrolling from canceling in-game swipes, corrected the foreground gateway position, moved the mobile start-screen character away from copy, and bundled fonts and their licenses locally.

This is a local, playable build. No public deployment was performed. Collected verses and correct recalls measure practice, not established memorization or a guaranteed spiritual outcome.
