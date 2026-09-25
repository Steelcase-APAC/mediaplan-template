#!/usr/bin/env bash
# ==============================================================================
# install-antigravity.sh
# Universal Unpacker for ANTIGRAVITY_BUNDLE.md
# ==============================================================================
set -e

BUNDLE_FILE="${1:-ANTIGRAVITY_BUNDLE.md}"

if [ ! -f "$BUNDLE_FILE" ]; then
  echo "Error: Bundle file '$BUNDLE_FILE' not found."
  echo "Usage: ./install-antigravity.sh [path-to-ANTIGRAVITY_BUNDLE.md]"
  exit 1
fi

echo "==> Unpacking Antigravity customizations from $BUNDLE_FILE..."

# Extract embedded files delimited by markers
awk '
  /^===== BEGIN FILE: / {
    sub(/^===== BEGIN FILE: /, "");
    sub(/ =====$/, "");
    file = $0;
    # Ensure directory exists
    dir = file;
    sub(/\/[^\/]+$/, "", dir);
    if (dir != file) {
      system("mkdir -p \"" dir "\"");
    }
    writing = 1;
    next;
  }
  /^===== END FILE: / {
    writing = 0;
    close(file);
    print "  -> Created: " file;
    next;
  }
  writing {
    print > file;
  }
' "$BUNDLE_FILE"

echo ""
echo "==> Successfully installed Antigravity workflow & skills!"
echo "  - Top-level workflow: AGENTS.md"
echo "  - Domain architecture: main.md"
echo "  - Rules:              .agents/rules/"
echo "  - Skills:             .agents/skills/"
echo ""
echo "Next: Open AGENTS.md and main.md to adjust any repo-specific commands or invariants."
