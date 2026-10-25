# Notes Porbo — Logo Guidelines

*Porbo P · v1 · 2026-10-25*

The logo identifies the IUT study dashboard **Notes Porbo**. The P of *Porbo* is the
icon; its bowl counter is a dog-eared page, and the fold alone carries the accent.
The wordmark keeps the site's masthead voice: upright *Notes*, leaning *Porbo*.

## Files

| File | Use |
|---|---|
| `b-final.svg` | Master symbol — ink P, accent fold |
| `b-final-black.svg` / `-white.svg` | One-colour on light / dark |
| `b-final-mono-c96736.svg` | Single-colour brand orange (prints, embroidery) |
| `b-final-square.svg` | Square tile with padding (social avatars) |
| `b-final-favicon.svg`, `b-final-app-icon.svg` | Favicon / app icon cut |
| `lockup-b-final.svg` | Horizontal lockup, outlined type (no live text) |
| `lockup-b-final-dark.svg` | Reversed lockup for dark backgrounds |
| `stacked-b-final.svg` | Stacked lockup for narrow/badged contexts |
| `favicon.svg`, `favicon.ico`, `favicon-16/32/48.png`, `apple-touch-icon.png`, `icon-192/512.png`, `maskable-512.png`, `site.webmanifest`, `head-snippet.html` | Web icon set |
| `board.html` | Presentation board with context mockups |

## Colour

| Token | HEX | Role |
|---|---|---|
| Ink | `#16100C` | P on light backgrounds |
| Paper | `#F8F5EF` | Reversed P on dark; favicon tile |
| Accent (light mode) | `#C96736` | The fold only |
| Accent (dark mode) | `#FF7115` | The fold on dark |

Two colours ideally (ink + one accent on paper). The mark must keep working in one
colour — the fold is a shape, not a colour → mono versions still read.

## Clear space & minimum size

- Clear space: keep ≥ the width of the P's stem (≈ 36/256 of the mark) free on all sides.
- Symbol minimum: **16 px** (tested — pixel test in `renders/`). Lockup minimum: **110 px wide**; below that, use the symbol alone or the stacked lockup.

## Approved backgrounds

- Paper (`#F8F5EF`) and warm neutrals, or ink-dark (`#0E0A07`) surfaces reversed.
- Photos: place the reversed version, or the square tile behind it.
- Never place the accent fold on a background of similar hue/low contrast; when in doubt use mono.

## Misuse

1. Don't recolour outside the palette above.
2. Don't redraw the fold — the 45° chamfer geometry is the identity.
3. Don't outline, shadow, rotate or squeeze the mark; respect lockup spacing.
4. Don't rebuild the wordmark in live HTML inside logo contexts — use the outlined master (the site masthead keeps its live text as UI, that's fine).
5. Don't use the symbol at sizes where the counter closes (below 16 px) without the favicon cut.

## Honesty / open items

- Trademark search not performed (unused personal project; professional search advised if it grows).
- Wordmark built from Bricolage Grotesque ExtraBold (opsz 48), SIL OFL licence — outlined, so deploys don't need the font.
- Tests run when this kit was built: `svg_audit` (98/100 symbol, 89/100 lockup — lockup "near-miss angles" are the italic skew, expected for type), 16/32/64 px pixel tests via resvg, browser-tab and competitor shelf tests, dark + reversed context mocks on the presentation board (`board.html`).
