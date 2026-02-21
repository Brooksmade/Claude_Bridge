#!/usr/bin/env bash
# Cleanup hook: runs on SessionStart and SessionEnd
# Removes all session artifacts from .tmp/ and flags stray temp files in root

set -euo pipefail

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-.}"
TMP_DIR="$PROJECT_DIR/.tmp"

# 1. Clean .tmp/ directory (preserve .gitkeep)
if [ -d "$TMP_DIR" ]; then
  find "$TMP_DIR" -mindepth 1 ! -name '.gitkeep' -delete 2>/dev/null || true
fi

# 2. Check for stray temp files in project root
STRAY_FILES=$(find "$PROJECT_DIR" -maxdepth 1 -type f \( \
  -name "tmp_*" -o -name "tmp-*" -o -name "*.tmp" -o \
  -name "*_payload.json" -o -name "*_var_map.json" -o \
  -name "variables_data.json" -o -name "color_var_map.json" -o \
  -name "tree.json" \
\) 2>/dev/null || true)

if [ -n "$STRAY_FILES" ]; then
  echo "STRAY_TEMP_FILES_DETECTED" >&2
  echo "The following temp files were found in the project root instead of .tmp/:" >&2
  echo "$STRAY_FILES" >&2
  echo "Ask the user whether to delete each file before removing anything." >&2
fi

exit 0
