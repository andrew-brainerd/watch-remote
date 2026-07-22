#!/usr/bin/env bash
# Regenerate every app icon from art/icon-master.png.
# App Store Connect rejects the 1024 marketing icon if it carries an alpha channel, and `tauri icon`
# always writes the iOS set as RGBA — hence the strip step. Re-run after any `tauri ios init`.
set -euo pipefail

cd "$(dirname "$0")/.."

MASTER="art/icon-master.png"
APPICONSET="src-tauri/gen/apple/Assets.xcassets/AppIcon.appiconset"

[ -f "${MASTER}" ] || { echo "✖ Missing ${MASTER}"; exit 1; }

echo "▶ Generating icons from ${MASTER}…"
pnpm tauri icon "${MASTER}"

if [ -d "${APPICONSET}" ]; then
  echo "▶ Stripping alpha from the iOS AppIcon set…"
  python3 - "${APPICONSET}" <<'PY'
import sys, glob, os
from PIL import Image

stripped = 0
for path in sorted(glob.glob(os.path.join(sys.argv[1], "*.png"))):
    im = Image.open(path)
    if im.mode == "RGB":
        continue
    alpha = im.convert("RGBA").getchannel("A").getextrema()
    if alpha != (255, 255):
        print(f"  ! {os.path.basename(path)} has real transparency {alpha} — flattening onto black")
    Image.alpha_composite(
        Image.new("RGBA", im.size, (0, 0, 0, 255)), im.convert("RGBA")
    ).convert("RGB").save(path, "PNG")
    stripped += 1
print(f"  stripped alpha from {stripped} icon(s)")
PY
else
  echo "  (no ${APPICONSET} — run 'pnpm tauri ios init' first if you need iOS icons)"
fi

# Not a target platform.
if [ -d "src-tauri/icons/android" ]; then
  rm -rf src-tauri/icons/android
  echo "▶ Removed the Android icon set."
fi

echo "✅ Icons regenerated."
