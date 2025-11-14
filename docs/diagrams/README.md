# Diagrams: How to Regenerate

This folder contains Mermaid sources and exported assets for the project diagrams.

## Sources
- `use-cases.mmd` — Mermaid source for use-case diagram
- `class-diagram.mmd` — Mermaid source for class diagram

## Outputs
- SVG (vector, best for print/zoom):
  - `use-cases.svg`
  - `class-diagram.svg`
- PNG/JPG (raster):
  - `use-cases.png`, `use-cases.jpg`
  - `class-diagram.png`, `class-diagram.jpg`
  - High-res @2x and @3x variants for print:
    - `use-cases@2x.png`, `use-cases@2x.jpg`, `use-cases@3x.png`, `use-cases@3x.jpg`
    - `class-diagram@2x.png`, `class-diagram@2x.jpg`, `class-diagram@3x.png`, `class-diagram@3x.jpg`

## Prereqs
From this folder, we use Mermaid CLI and sharp-cli (already in `devDependencies`).

```powershell
# Install once (if needed)
npm install
```

## Regenerate commands

Render SVG (transparent):
```powershell
npx mmdc -i use-cases.mmd -o use-cases.svg -b transparent -t neutral
npx mmdc -i class-diagram.mmd -o class-diagram.svg -b transparent -t neutral
```

Render PNG (white background):
```powershell
npx mmdc -i use-cases.mmd -o use-cases.png -b white -t neutral
npx mmdc -i class-diagram.mmd -o class-diagram.png -b white -t neutral
```

High‑resolution PNGs for print (@2x / @3x):
```powershell
# 2x
npx mmdc -i use-cases.mmd -o use-cases@2x.png -b white -t neutral -s 2
npx mmdc -i class-diagram.mmd -o class-diagram@2x.png -b white -t neutral -s 2

# 3x
npx mmdc -i use-cases.mmd -o use-cases@3x.png -b white -t neutral -s 3
npx mmdc -i class-diagram.mmd -o class-diagram@3x.png -b white -t neutral -s 3
```

Convert PNG to JPEG (quality 95):
```powershell
npx sharp-cli -i use-cases@2x.png -o use-cases@2x.jpg -q 95
npx sharp-cli -i class-diagram@2x.png -o class-diagram@2x.jpg -q 95
npx sharp-cli -i use-cases@3x.png -o use-cases@3x.jpg -q 95
npx sharp-cli -i class-diagram@3x.png -o class-diagram@3x.jpg -q 95
```

## Tips
- Prefer SVG in reports/slides for perfect scaling.
- For print, use @3x PNG/JPG. PNG is lossless and better for crisp text; JPEG at `-q 95` is a good balance for smaller files.
