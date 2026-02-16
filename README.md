# Magical Vacation Translation (Active Fork)

This repository is an **active fork** focused on improving the English translation and overall playability of *Magical Vacation* (GBA).

## Project status

✅ Active maintenance is happening in this fork.

Current focus areas:
- improving English script quality (clarity, consistency, tone)
- fixing text rendering/layout issues (line breaks, overflow, spacing)
- updating UI/menu text where translation quality is weak
- documenting and tracking in-game glitches that affect translated content

## What this fork is trying to fix

The main goal is to make the English experience feel polished and coherent by iterating on:
- story dialogue and cutscene text
- battle text and system messages
- names/terms consistency across tools and in-game strings
- visual text glitches (misalignment, clipping, odd wrapping)

## Build overview

From the repository root:

```bash
make
```

The build process assembles graphics/text patches into `hacked.gba` (starting from your local `original.gba`) and also regenerates translation-related binary assets.

## Translation/editor tools

This repo includes browser-based helper tools under `tools/translate/` for working on script/menu/battle text data.

Typical local workflow:
1. Run a static server in repo root.
2. Open the desired tool in a browser (for example, a page under `tools/translate/`).
3. Export data and rebuild with `make`.
4. Test in emulator and note any glitches/regressions.

## Glitch triage (translation-related)

If you notice glitches while testing, please prioritize reporting these:
- text overflows outside message windows
- broken line wrapping or newline behavior
- missing glyphs/characters
- menu labels overlapping icons or borders
- inconsistent terminology between menus, battle text, and dialogue

When reporting, include:
- where it happens (location/menu/battle/cutscene)
- screenshot if possible
- emulator + save state context
- expected vs actual text

## Notes

- This repository does **not** distribute the original game ROM.
- You must provide your own legally obtained `original.gba` for local builds.

---

If you want, the next step can be creating a dedicated `GLITCHES.md` tracker in this fork so active issues are easier to organize and fix.
