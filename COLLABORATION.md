# The Narrow Path — collaboration brief

The Narrow Path is a biblical endless runner built around repeated, visible Scripture practice. The player runs through a wilderness, jumps or slides past procedural obstacles, collects verse fragments, and can answer a short recall prompt after a run. The library contains 72 exact KJV passages with source links.

## Review request for Andrew

Please review the app as a collaborator with a focus on:

- whether jump, slide, collision, speed ramp, combo scoring, and restart feedback feel fair and readable;
- whether one-tap and keyboard controls remain usable on a small screen;
- whether the passage rotation, fragment pacing, full-verse view, and recall prompt encourage return practice without claiming that a score proves memorization;
- whether any visual, performance, or accessibility issue would prevent someone from using the app repeatedly.

Keep Scripture wording and references tied to the cited KJV sources. Treat interface themes as labels, not additions to the quotations. Do not add telemetry, accounts, generated Scripture, or hidden text.

## Local checks

```sh
npm test
npm run build
npm run dev
```

The development server opens at `http://localhost:5173`. The generated `dist/` directory is intentionally ignored; build output can be reviewed locally without committing it.

## Review boundaries

This repo contains only the game export. It does not include private Obsidian material, personal records, source audio, or credentials. A GitHub upload does not publish a production site or establish a memorization result.
