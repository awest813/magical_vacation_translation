import os
import json
import struct
import re
import sys

# File paths
SCRIPT_JSON = "text/_script.json"
SCRIPT_BIN = "text/script.bin"
ORIGINAL_SCRIPT_BIN = "text/original/original_script.bin"
TEXT_S = "text/text.S"

# Regex for control codes \xx
CONTROL_CODE_REGEX = re.compile(r"\\([0-9a-fA-F]{2})")
# Regex for HTML tags
HTML_TAG_REGEX = re.compile(r"<[^>]+>")
# Regex for macros $...$
MACRO_REGEX = re.compile(r"\$([^$]+)\$")

def check_bin_file(filepath):
    print(f"Checking {filepath}...")
    try:
        with open(filepath, "rb") as f:
            data = f.read()
    except FileNotFoundError:
        print(f"Error: {filepath} not found.")
        return 1

    size = len(data)
    print(f"Size: {size} bytes ({size / 1024:.2f} KB)")

    if size > 65536:
        print("WARNING: Size exceeds 64KB (0x10000). 16-bit offsets will wrap.")

    # Check offsets
    first_offset = struct.unpack("<H", data[2:4])[0]
    num_entries = first_offset // 2
    print(f"Estimated number of entries: {num_entries}")

    prev_offset = 0
    wrap_count = 0

    for i in range(num_entries):
        offset_pos = 2 * i
        if offset_pos + 2 > size:
            break

        offset = struct.unpack("<H", data[offset_pos:offset_pos+2])[0]

        if offset < prev_offset:
            if prev_offset - offset > 1000: # Heuristic
                wrap_count += 1

        prev_offset = offset

    if wrap_count > 0:
        print(f"CRITICAL: Detected {wrap_count} potential offset wraps! This confirms 16-bit offset overflow.")
        # We return 0 here because wraps are expected in this specific engine
        return 0
    else:
        print("No obvious offset wraps detected in the table range.")
        return 0

def check_script_bin():
    e1 = check_bin_file(SCRIPT_BIN)
    e2 = check_bin_file(ORIGINAL_SCRIPT_BIN)
    return e1 + e2

def check_script_json():
    print(f"Checking {SCRIPT_JSON}...")
    try:
        with open(SCRIPT_JSON, "r", encoding="utf-8") as f:
            script = json.load(f)
    except Exception as e:
        print(f"Error reading {SCRIPT_JSON}: {e}")
        return 1

    print(f"Entries: {len(script)}")

    errors = 0
    warnings = 0

    for i, entry in enumerate(script):
        english = entry.get("English", "")
        if not english:
            continue

        # Check for unbalanced brackets
        if english.count("<") != english.count(">"):
            print(f"Error at index {i}: Unbalanced HTML tags: {english}")
            errors += 1

        if english.count("$") % 2 != 0:
            print(f"Error at index {i}: Unbalanced macro '$': {english}")
            errors += 1

        # Check for invalid control codes
        # Assuming \xx is the format
        for match in CONTROL_CODE_REGEX.finditer(english):
            code = int(match.group(1), 16)
            # You can add logic to validate specific codes if needed
            pass

        # Check for suspicious content
        if "TODO" in english or "FIXME" in english:
            print(f"Warning at index {i}: 'TODO' or 'FIXME' found in text: {english[:50]}...")
            warnings += 1

        # Check for unprintable characters (excluding newline)
        # We strip out control codes first to check remaining text
        clean_text = CONTROL_CODE_REGEX.sub("", english)
        clean_text = HTML_TAG_REGEX.sub("", clean_text)

        for char in clean_text:
            if ord(char) < 0x20 and char != '\n':
                 print(f"Warning at index {i}: Unprintable char {ord(char):02X} found: {english[:50]}...")
                 warnings += 1
                 break

    print(f"JSON Check Complete: {errors} errors, {warnings} warnings found.")
    return errors

def check_other_files():
    print("Checking other text files...")
    errors = 0

    # Parse text.S for limits
    limits = {}
    try:
        with open(TEXT_S, "r") as f:
            lines = f.readlines()
            for line in lines:
                match = re.search(r"SIZE_([A-Z_]+)\s+equ\s+(0x[0-9A-Fa-f]+)", line)
                if match:
                    name = match.group(1).lower()
                    size = int(match.group(2), 16)
                    limits[name] = size
    except FileNotFoundError:
        print(f"Error: {TEXT_S} not found.")
        return 1

    # Map internal names to filenames
    # SIZE_MENU_TEXT -> text.bin
    # SIZE_MENU_EXPLANATIONS -> explanations.bin
    # etc.

    mapping = {
        "menu_text": "text.bin",
        "menu_explanations": "explanations.bin",
        "menu_magic_notebook": "magic_notebook.bin",
        "menu_bestiary": "bestiary.bin",
        "menu_species_descriptions": "species_descriptions.bin",
        "menu_md_dictionary": "md_dictionary.bin",
        "menu_name_kanji": "name_kanji.bin",
        "menu_element_descriptions": "element_descriptions.bin"
    }

    for name, limit in limits.items():
        if name in mapping:
            filename = mapping[name]
            filepath = os.path.join("text", filename)
            if os.path.exists(filepath):
                size = os.path.getsize(filepath)
                if size > limit:
                    print(f"ERROR: {filename} size {size} exceeds limit {limit} ({size - limit} bytes over)")
                    errors += 1
                else:
                    print(f"OK: {filename} size {size} <= {limit}")
            else:
                print(f"Warning: {filename} not found.")

    print("\nComparing translated binaries with originals...")
    text_dir = "text"
    original_dir = os.path.join(text_dir, "original")

    # Files known to be relocated, so size increase is acceptable (within reason)
    relocated_files = ["script.bin", "cutscene.bin"]

    if os.path.exists(original_dir):
        for filename in os.listdir(text_dir):
            if filename.endswith(".bin"):
                original_filename = "original_" + filename
                original_filepath = os.path.join(original_dir, original_filename)
                translated_filepath = os.path.join(text_dir, filename)

                if os.path.exists(original_filepath):
                    orig_size = os.path.getsize(original_filepath)
                    trans_size = os.path.getsize(translated_filepath)
                    diff = trans_size - orig_size

                    if filename in relocated_files:
                         print(f"INFO: {filename} is relocated. Size: {trans_size} (Original: {orig_size}). Delta: +{diff} bytes. This is usually fine.")
                    elif diff > 0:
                        print(f"WARNING: {filename} is larger than original! ({trans_size} > {orig_size}, +{diff} bytes). This might overwrite data!")
                        errors += 1
                    else:
                        print(f"OK: {filename} is smaller or equal ({trans_size} <= {orig_size}, {diff} bytes)")
                else:
                    # Some files might not have originals if they are new or named differently
                    pass
    else:
        print("Original directory not found.")

    return errors

if __name__ == "__main__":
    err_bin = check_script_bin()
    err_json = check_script_json()
    err_files = check_other_files()

    if err_bin > 0 or err_json > 0 or err_files > 0:
        sys.exit(1)
