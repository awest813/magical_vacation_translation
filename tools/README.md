# Hacking Tools

For ease of creating UIs and portability, the tools for translating Magical Vacation are written in HTML/JS. To run them, start a static server in the root of the repository and navigate to a URL like `tools/translate/cutscene/index.html`.

Available tools under `tools/translate/`:
- `cutscene/` — cutscene dialogue editor
- `script/` — main script editor
- `menu/` — menu text editor
- `names/` — character/item name editor
- `battle_text/` — battle text editor
- `character_cutscene/` — character cutscene editor
- `omni/` — search and export tool for script JSON files

Additional utilities:
- `tools/view/` — in-browser ROM viewer
- `tools/diff/` — binary diff viewer
- `tools/analyze_text.py` — run locally (`python3 tools/analyze_text.py`) to validate JSON and binary sizes before building
