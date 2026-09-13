# The Narrow Path

A biblical endless runner with an animated canvas wilderness, procedural rocks and branches, rising speed and density, combos, optional sound, and local progress.

## Run

On this Mac, double-click **Open The Narrow Path.command**. It starts the local server independently of the chat and opens the game in your browser. Reopening it reuses an already running server. After restarting the Mac, double-click it again.

From a terminal, `npm run launch` starts the same independent local server. Its log is `.local/server.log`.

Requires Node.js 20 or newer. No packages or API keys are required.

```sh
npm run dev
```

Open http://localhost:5173. Use Space, ↑, W, or a tap to jump; ↓, S, or swipe down to slide; P or Escape to pause. Mobile includes dedicated jump/slide buttons.

## Verify and build

```sh
npm test
npm run build
```

The build copies static assets into `dist/`, suitable for a static hosting service. Nothing is deployed by the build command.

## Scripture and progress

72 exact KJV passages across six topics are documented in SCRIPTURE-SOURCES.md and SCRIPTURE-ADDITIONAL-SOURCES.md. Every three lights reveal one phrase. Partial fragments carry across runs. Fresh passages arrive between attempts and after 20 seconds of active play, or four seconds after collecting a complete passage. Every fourth selection can revisit a previously missed recall. An optional missing-word recall appears after game over. A correct recall adds 100 points once per run. Collection and recall counts describe practice, not proven memorization.

The searchable scripture library includes all 72 passages, topic filters, direct source links, and a choice to practice any passage. Previous/Next controls also let you browse outside a run.

High score, fragments, chosen passage, exposure counts, and recall history use `the-narrow-path:v1` in localStorage. No accounts, telemetry, remote database, or AI-generated scripture. If browser storage is unavailable, the game continues with in-memory progress. Optional synthesized sound starts only when enabled by the player. Hidden tabs pause automatically; reduced motion disables decorative movement and collision flash.

## Collaboration

This repository is the shared review home for The Narrow Path. Andrew (`openandiii-prog`) is invited to review the game feel, mobile accessibility, and Scripture-practice loop. Keep Scripture text and source links intact, preserve the distinction between practice and proven memorization, and run the checks below before opening a pull request.

```sh
npm test
npm run build
```

The project is static and has no accounts, secrets, or runtime service dependencies. Review changes in a feature branch and include a short browser note for any interaction or layout change.
