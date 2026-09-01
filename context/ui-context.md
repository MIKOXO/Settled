# UI Context

## Theme

Dark only. No light mode. Warm near-black base — not the generic bluish "tech dark mode." Coral and mustard carry the brand identity; nothing in the palette sits in blue/green/purple territory except the semantic success color, which is used only for status, never as a brand accent.

## Colors

| Role             | CSS Variable         | Value                    |
| ---------------- | -------------------- | ------------------------ |
| Page background  | `--bg-base`          | `#171310`                |
| Surface          | `--bg-surface`       | `#221C17`                |
| Elevated surface | `--bg-surface-2`     | `#2B221B`                |
| Primary text     | `--text-primary`     | `#F5F1E8`                |
| Muted text       | `--text-muted`       | `#B8A99A`                |
| Primary accent   | `--accent-primary`   | `#FF6B4A` (coral)        |
| Secondary accent | `--accent-secondary` | `#F4B942` (mustard)      |
| Border           | `--border-default`   | `rgba(245,241,232,0.12)` |
| Error            | `--state-error`      | `#E5484D`                |
| Success          | `--state-success`    | `#7FD8BE` (mint)         |

Rules:

- Coral is the primary action color (primary buttons, active states, brand marks).
- Mustard is secondary emphasis (leading option, secondary highlights) — not a substitute for coral on primary actions.
- Success green is semantic only — live/active indicators, confirmation states, focus rings. It never appears as a decorative or brand accent (no icon fills, no gradients, no illustrative use).
- No hardcoded hex values in components — always reference these tokens.

## Typography

| Role      | Font              | Variable         |
| --------- | ----------------- | ---------------- |
| Headings  | Sora              | `--font-heading` |
| UI/body   | Plus Jakarta Sans | `--font-sans`    |
| Code/mono | IBM Plex Mono     | `--font-mono`    |

- Headings (`h1`–`h3`) always use `--font-heading`, weight 600–700.
- Everything else — body copy, nav, buttons, labels — uses `--font-sans`.
- `--font-mono` is reserved for numeric/data labels (vote counts, rank numbers, step numbers) — not a general-purpose UI font.
- Sentence case throughout. No tracked-out all-caps labels.

## Border Radius

| Context             | Value     |
| ------------------- | --------- |
| Buttons / inline UI | `8px`     |
| Cards / panels      | `16px`    |
| Modals / overlays   | `20–24px` |

Buttons stay tight and small-radius deliberately — no pill-shaped buttons anywhere in the product.

## Component Library

No third-party component library. Components are hand-built with Tailwind utility classes on top of the tokens above — nothing generated from a CLI kit.

## Layout Patterns

- **Navbar**: sticky top bar, translucent/blurred background, single bottom border (`--border-default`) — no shadow.
- **Cards**: bordered surface panels (`--bg-surface`, `16px` radius), border color shifts to accent on hover rather than adding a shadow.
- **Live/real-time indicators**: small pulsing dot + short label, always in `--state-success` — this is the one place success green appears in the UI, and it always means "live/active," never anything else.
- **Modals**: centered overlay with backdrop blur, `20–24px` radius — not yet built, spec to be finalized when the first modal (board settings, decision lock-in confirmation) is implemented.
- **Signature interaction**: real-time re-ranking (options reordering live as votes come in) is the one animated moment worth calling out — motion elsewhere stays minimal and purposeful, not decorative.

## Icons

Lucide React. Stroke-based icons only. Sizes: `h-4 w-4` for inline icons, `h-5 w-5` for icons inside buttons.
