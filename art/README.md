# App icon art

Icon art is generated with Gemini (`gemini-3-pro-image`) and rendered to every platform size by
`pnpm icons`.

| Path | Committed | What |
|---|---|---|
| `icon-master.png` | yes | The approved icon. 1024×1024, PNG, opaque RGB. Source of truth. |
| `icon.txt` | yes | Generation prompt, with a `{{PALETTE}}` placeholder. |
| `palettes/*.txt` | yes | Swappable color blocks (`amber`, `blue`, `purple`). Purple ships. |
| `icon-fixup.txt` | yes | Image-to-image prompt for touching up an existing render. |
| `generated/` | no | Raw candidates and preview sheets (~17 MB). |

## Regenerate the icon set

```sh
pnpm icons
```

## Generate new art

`GEMINI_API_KEY` lives in the **brainerd-api** Infisical project, so run from that directory:

```sh
cd ~/projects/brainerd-api
AR=1:1 infisical run --silent -- node ~/projects/docs/wedding/art/gen.mjs \
  gemini-3-pro-image <out.png> <prompt.txt> [reference-images...]
```

Substitute a palette into the prompt first:

```sh
python3 -c "
base=open('art/icon.txt').read(); pal=open('art/palettes/blue.txt').read().strip()
open('/tmp/icon-blue.txt','w').write(base.replace('{{PALETTE}}', pal))"
```

## Constraints

- Output is JPEG data under a `.png` name; convert with PIL before `tauri icon` accepts it.
- Don't say "app icon" in the prompt — it produces a rounded-square badge with white corners that
  double-masks on iOS. Ask for a square poster filling the canvas, then check the corner pixels.
- Check legibility at 40 px before approving.
