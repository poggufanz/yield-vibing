# YIELD VIBING — Design System

> **Versi:** 2.0 (post-redesign) · **Tanggal:** 26 Mei 2026  
> **Tujuan:** Base design system buat YIELD VIBING prototype + handoff ke implementasi React/Solidity.  
> **Aesthetic:** *Editorial financial-document* — restrained, data-forward, trust-first.

---

## 0. Bacaan singkat

YIELD VIBING adalah produk DeFi yang ngebiarin agent eksekusi transaksi atas nama user (`swap → approve → deposit`) dalam scoped permission. Karena user nge-trust agent untuk move money, **design-nya harus serius secara visual** — bukan crypto-bro vibey, bukan generic AI-dashboard, tapi document-grade yang ngebuat user yakin batasan permission-nya dihormati.

---

## 1. Prinsip Desain

Setiap keputusan visual diuji terhadap lima prinsip ini. Kalau melanggar salah satu, redesign.

| Prinsip | Penjelasan | Cek |
|---|---|---|
| **Restraint over decoration** | Border + spacing + typography melakukan kerja. Gradient, glow, blur, dan animasi dekoratif dihindari. | Setiap efek harus jawab "ini ngomong apa ke user?" Kalau gak bisa jawab, hapus. |
| **One accent, one job** | Satu warna brand (acid lime), dipake hanya untuk current action / current state. Bukan untuk dekorasi. | Kalo accent dipake di lebih dari 1 elemen per screen, pertanyakan. |
| **Data is the design** | Angka besar dengan tabular figures jadi visual anchor tiap screen. Bukan ilustrasi, bukan ikon raksasa. | Tiap screen harus punya 1 angka signature (amount, APY, progress, deposited). |
| **Motion has meaning** | Animasi cuma untuk state transition + real-time feedback. Tidak ada shimmer/pulse dekoratif. | "Apa cause-and-effect dari animasi ini?" Kalo gak bisa jawab, drop. |
| **Trust through transparency** | Permission scope, gas cost, tx hash, semua ditampilkan literal. Bukan disembunyiin atau di-abstrak. | Document-grade output — user bisa pause dan baca tiap field. |

### Anti-patterns yang HARUS dihindari

- ❌ Emoji sebagai icon (🦊, ⚡, 🔒, dll) — pakai SVG / text mark
- ❌ Radial / linear gradient sebagai background atmosphere
- ❌ Italic colored `<em>` accent di dalam headline
- ❌ Pulse / shimmer animation tanpa cause-effect
- ❌ Conic-gradient avatar / placeholder identicon
- ❌ Stepper wizard chrome (numbered circles connected by lines)
- ❌ Backdrop-blur "glass" effects
- ❌ Letter-spaced uppercase monospace di semua label
- ❌ Chip-with-dot status badge ditumpuk banyak (1 dot max)
- ❌ Generic 2×2 stat grid sebagai info display
- ❌ Card dengan left-border accent color
- ❌ Font overused (Inter, Roboto, Fraunces, Arial)

---

## 2. Color Tokens

Color disimpan sebagai CSS custom properties di `:root`. Empat palette tersedia (default = Acid Yield), switching via `[data-palette="..."]` attribute di `<html>`.

### Token contract (semua palette HARUS define)

| Token | Peran |
|---|---|
| `--bg-base` | Outermost canvas — di antara kolom layout |
| `--bg-canvas` | Kolom utama (sidebar, main, rail) |
| `--bg-card` | Card content area |
| `--bg-elev` | Elevated surface (input, pop, exec-row) |
| `--bg-elev-2` | Selected state |
| `--bg-input` | Form input background (jarang dipake) |
| `--border` | Default 1px divider (≈ 6% opacity) |
| `--border-strong` | Stronger divider (≈ 13% opacity) |
| `--border-accent` | Accent-tinted border (focus, active) |
| `--text` | Primary text |
| `--text-muted` | Body / supporting text |
| `--text-faint` | Tertiary labels, annotations |
| `--accent` | Brand accent — current action only |
| `--accent-soft` | Accent low-opacity bg (8%) |
| `--accent-fg` | FG color on accent bg |
| `--info` `--warn` `--danger` `--ok` | Status semantics |

### Palette: Acid Yield (default)

```css
--bg-base:   #0e0f0c;   /* warm near-black */
--bg-canvas: #131410;
--bg-card:   #1a1b16;
--bg-elev:   #22231d;
--text:      #ecebe1;   /* warm cream */
--text-muted:#95958a;
--text-faint:#56564f;
--accent:    #cfff3d;   /* acid lime — sparingly */
--accent-fg: #0e0f0c;
```

### Palette: Mono Slate

Most restrained — zero chroma di accent. Cocok kalau brand butuh feel lebih korporat.

```css
--bg-base:   #0c0d10;
--bg-card:   #161820;
--text:      #e8ebf3;
--accent:    #e6edff;   /* near-white, treats accent as "highlight" not "color" */
```

### Palette: Liquid Mint

Teal undertone. Cocok kalau ingin DeFi/crypto vibe tanpa lime.

```css
--bg-base:   #0a1310;
--bg-card:   #11201b;
--accent:    #5ee6c5;
```

### Palette: Bone Paper (light)

Light editorial mode — paper-feel untuk presentation atau printing.

```css
--bg-base:   #f4f1e9;
--bg-card:   #e3dfd2;
--text:      #1a180f;
--accent:    #1a180f;   /* accent = darkest text in light mode */
```

### Contrast targets (semua palette)

- Primary text vs background: **≥ 7:1** (AAA)
- Muted text vs background: **≥ 4.5:1** (AA)
- Faint text vs background: **≥ 3:1** (AA large only — pakai cuma untuk 11px+ annotations)
- Accent vs accent-fg: **≥ 7:1**

### Aturan pakai accent

1. **Tidak pernah** dipake sebagai bg dekoratif (no accent-tinted card)
2. Dipake hanya untuk:
   - Current step indicator (step rail underline + number color)
   - Active state marker (exec-row marker, permission status dot, focus-within border)
   - Primary CTA button background
   - Critical inline emphasis (max amount value, signed authorization status)
3. Kalau accent muncul di lebih dari 3 tempat dalam satu screen — pertimbangkan re-evaluasi

---

## 3. Typography

Tiga font, masing-masing punya peran spesifik. **Tidak ada italic colored accent dalam headline.** Hierarchy lewat scale & weight, bukan color.

### Font stacks

```css
--font-display: "Geist", "Söhne", system-ui, sans-serif;
--font-body:    "Geist", system-ui, sans-serif;
--font-mono:    "JetBrains Mono", "Geist Mono", ui-monospace, monospace;
--font-script:  "Instrument Serif", "Times New Roman", serif;
```

### Pemakaian

| Font | Pakai untuk | Tidak pakai untuk |
|---|---|---|
| **Geist** | Headlines, body, button labels, vault names | Numbers (pakai mono), brand "vibing" wordmark |
| **JetBrains Mono** | Numbers, addresses, tx hashes, code, technical labels (eyebrow), permission scope keys | Headlines, body prose |
| **Instrument Serif (italic)** | **Satu** kegunaan: brand wordmark "vibing" di topbar dan tweaks panel | Headlines, accents, decoration |

### Scale

| Token | Size | Pakai untuk |
|---|---|---|
| `.figure-lg` | `clamp(48px, 8vw, 96px)` | Hero signature number (jarang — landing only) |
| `.figure-md` | `clamp(36px, 5.2vw, 64px)` | Per-screen signature (APY, progress count) |
| `.figure-sm` | `clamp(28px, 3.6vw, 36px)` | Secondary big number |
| `.amount-input` | `clamp(40px, 7.2vw, 72px)` | Amount input (special — fluid font for narrow viewport) |
| `.h-display` | 38px desktop / 32px compact | Per-card headline (no italic accents) |
| `.h-sub` | 22px | Section sub-heading |
| `.rec-vault-name` | 28px | Editorial product name (vault title) |
| Body | 14px | Default prose |
| `.lede` | 15px | Subheading prose (after `.h-display`) |
| Body small | 13px | Right-rail content |
| Eyebrow / annotation | 11–12px | Always mono |

### Aturan headline

- **No italic accents.** Hierarchy via scale & weight. Bukan via colored `<em>`.
- `text-wrap: balance` untuk h-display
- `text-wrap: pretty` untuk lede paragraphs
- `letter-spacing: -0.02em` to `-0.03em` untuk display weights
- `letter-spacing: -0.01em` untuk semua mono (mono looks too wide otherwise)
- Max line length: ≈ 580px (≈ 65ch)

### Tabular numbers

Setiap angka yang ditampilkan sebagai data WAJIB tabular:

```css
font-variant-numeric: tabular-nums;
font-feature-settings: "tnum" 1, "lnum" 1;
```

Gunakan class `.tnum` atau apply via `.figure`, `.balance-cell .val`, `.exec-progress .value`, `.amount-input-row input`.

### Eyebrow lockup pattern

Setiap card mulai dengan satu lockup ini — substitute untuk wizard-stepper chrome:

```html
<div class="eyebrow">
  <span class="num">01</span>
  <span>Preferensi · venice ai</span>
  <span class="rule"></span>
  <span>05 langkah</span>
</div>
```

Selalu: `[step-number] · [section-name] —— [meta-right]`. Mono, 11px, lowercase, accent color hanya pada step number.

---

## 4. Spacing, Radius, Borders

### Spacing scale

Pakai kelipatan 4 (4 / 8 / 12 / 14 / 16 / 18 / 22 / 24 / 28 / 32 / 36 / 56).

| Konteks | Spacing |
|---|---|
| Tight gap dalam komponen | 4–8px |
| Form field internal | 14px (padding-bottom on input rows) |
| Section dalam card | 18–22px |
| Major divider antar group | 28–36px |
| Card padding | 36px (24px compact) |
| Topbar/sidebar padding | 14–28px |
| Stage padding | 28px (18px compact) |

### Border radius

Kecil dan crisp. Tidak ada radius di atas 18px.

```css
--radius-sm: 4px;   /* icon buttons, tags, small chips */
--radius-md: 8px;   /* buttons, form rows, mm-pop */
--radius-lg: 14px;  /* cards */
--radius-xl: 18px;  /* modal */
```

`[data-density="compact"]` ngurangi semua ke 6 / 10 / 14px.

### Border

- **Default:** `1px solid var(--border)` — ≈ 6% opacity white (atau 8% dark on light)
- **Strong:** `1px solid var(--border-strong)` — ≈ 13% opacity
- **Accent:** `1px solid var(--border-accent)` — used only on focus-within
- Tidak ada border 2px+, tidak ada dashed border kecuali untuk `tx hash` underline
- **Document-pattern divider:** stack rows pakai `border-bottom: 1px solid var(--border)` di tiap row, bukan card-per-row

---

## 5. Layout

### App shell — 3 kolom

```
┌────┬──────────────────────┬──────────────┐
│ SB │       MAIN           │     RAIL     │
│ 58 │   minmax(0, 1fr)     │     360      │
└────┴──────────────────────┴──────────────┘
```

- **Sidebar (58px):** icon-only nav, no labels (icons cuma untuk top-level), no active highlight bar — cuma background tint
- **Main (1fr):** topbar + step rail + stage (scrollable)
- **Rail (360px):** persistent wallet + permission + activity panels, scrollable

Grid template-columns **harus** `minmax(0, 1fr)`, **bukan** `1fr`, untuk mencegah child overflow.

### Stage pattern

```
┌────────────────────────────────┐
│  topbar                        │
├────────────────────────────────┤
│  step-rail (subtle underline)  │
├────────────────────────────────┤
│  ┌──────────────────────────┐  │
│  │       card (signature)   │  │
│  │                          │  │
│  └──────────────────────────┘  │
│           (scrollable)         │
└────────────────────────────────┘
```

Satu card per stage. Card adalah satu-satunya container yang punya bg-card, semua nested element di-divide pakai border.

### Card internal structure

```
┌────────────────────────────────┐
│  eyebrow (01 · section ── meta)│
│                                │
│  h-display headline            │
│  lede paragraph                │
│                                │
│  [content — data block]        │
│                                │
│  ─────────────────────────── ←  divider
│  foot-note · primary CTA       │
└────────────────────────────────┘
```

Action row selalu di-divide dari content via `border-top: 1px solid var(--border)`.

### Step rail

Numeric, subtle, underline-on-active. Bukan circle-with-line wizard.

```
┌──────────────────────────────────────┐
│ 01 Preferensi  02 AI  03 Connect ... │
│ ─────                                │
│  ↑ accent underline on active only   │
└──────────────────────────────────────┘
```

- 14px vertical padding per item
- 18px horizontal padding per item
- Active: text color = `--text`, num color = `--accent`, underline 1px accent at bottom
- Done: text + num color = `--text-muted`, no underline
- Idle: text + num color = `--text-faint`

---

## 6. Components

### Buttons

| Variant | Class | Pakai untuk |
|---|---|---|
| Primary | `.btn .btn-primary` | Satu per screen — primary CTA |
| Ghost | `.btn .btn-ghost` | Secondary action |
| Text | `.btn .btn-text` | Tertiary / dismissive |

Sizes: default `padding: 11px 18px`, large `padding: 14px 22px`. Radius `--radius-md` (8px). Font weight 500. **Tidak ada drop shadow.** Hover state cuma mengubah background brightness.

### Amount input (signature pattern)

Pattern khusus YIELD VIBING — input numerik dengan font raksasa sebagai visual anchor:

```html
<div class="amount-input-row">
  <input type="number" placeholder="0" />
  <span class="ticker">USDC</span>
</div>
```

- Font: mono, tabular, `clamp(40px, 7.2vw, 72px)`
- Border: cuma bottom — `1px solid var(--border-strong)`, jadi accent ketika focus-within
- Ticker label: 18px mono, baseline-aligned

### Risk row (segmented)

Three options inline, bukan stacked vertical:

```
┌──────┬──────┬──────┐
│ Low  │ Med  │ High │
│ sub  │ sub  │ sub  │
└──────┴──────┴──────┘
```

Inner border, no rounded corners di item, parent radius `--radius-md`. Selected = `bg-elev-2`, label sub jadi accent color.

### MetaMask pseudo-dialog (`.mm-pop`)

Document-grade dev-tool feel. Tidak ada fox emoji.

```
┌─────────────────────────────────────────┐
│ [MM] MetaMask         yield-vibing.app  │ ← header
│ ──────────────────────────────────────  │
│ title…                                  │
│ key       value                         │
│ key       value                         │
│ ...                                     │
└─────────────────────────────────────────┘
```

- `MM` mark = 22×22 box dengan border, mono 9px text
- Key column: 100px fixed, `var(--text-faint)`
- Value column: 1fr, `var(--text)`
- `.v.accent` untuk highlight (max amount, status, dll)

### Permission scope doc (`.perm-doc`)

Treats permission seperti dokumen formal. Setiap row = `key: value · annotation`.

```
┌───────────────────────────────────────────────┐
│ action.type      vault-deposit · swap → ...   │
│ allowed.vault    0xABCD...aBcDe · single-...  │
│ max.amount       100 USDC · hard cap · exc... │
│ expires.at       26 Mei 2026, 14:30           │
│ revocable        yes · kapanpun · onchain     │
└───────────────────────────────────────────────┘
```

- Key: mono 11px, left column 180px
- Value: mono 13px, `var(--text)`
- Annotation: mono 11px, `var(--text-faint)`, gap 10px dari value
- Accent value: `.accent` class — dipake **cuma** untuk max.amount

### Execution log (terminal-style)

Bukan stepper dengan icon raksasa. Cuma marker dot + title + tx + status.

```
┌────────────────────────────────────────────────┐
│ ● Swap via DEX               step 01  confirmed│
│   USDC → USDC pool · 0.05%   tx · 0x9f3…a124 ↗ │
├────────────────────────────────────────────────┤
│ ◐ Approve vault spender      step 02  pending  │
│   ERC-20 approve · MockVault · broadcasting     │
├────────────────────────────────────────────────┤
│ ○ Deposit ke MockVault       step 03  queued   │
│   ERC-4626 deposit · mint shares                │
└────────────────────────────────────────────────┘
```

- Marker = 14px circle dengan border
- Active marker: inner 5px accent dot dengan `blink` animation (1.1s ease-in-out infinite) — satu-satunya animasi yang acceptable karena nge-convey "active operation"
- Done marker: fill solid accent
- Tx hash: `border-bottom: 1px dashed var(--text-faint)`, hover → accent

### Right rail panels

Tidak punya card chrome. Cuma `border-bottom` antar panel + 20px padding. Headline `.panel-title` 13px Geist + `.panel-meta` 10.5px mono di kanan.

### Modal

Kept minimal — `bg-card`, `border-strong`, `radius-lg`, padding 28px. Slide-up entrance 18ms. **Tidak ada backdrop-blur** — pakai `rgba(0, 0, 0, 0.6)` solid scrim.

---

## 7. Motion

### Aturan dasar

- Duration: **150–300ms** untuk micro-interactions (transition, button hover)
- Easing: `cubic-bezier(0.2, 0.8, 0.2, 1)` untuk entrance (sharp settle)
- Exit faster than enter (180ms vs 320ms)
- **Tidak ada infinite decorative loops** — kecuali `blink` di execution active marker (1.1s) karena nge-convey real ongoing operation
- Respect `prefers-reduced-motion: reduce` — semua entrance animation di-disable

### Approved animations

| Animasi | Durasi | Trigger |
|---|---|---|
| `enter` (translateY 8px + fade) | 320ms ease-out | New card mount (stage change) |
| `slideup` (modal) | 180ms ease-out | Modal open |
| `fadein` (modal backdrop) | 140ms ease-out | Modal open |
| `blink` (exec marker) | 1.1s ease-in-out infinite | Active execution step |
| Hover state transitions | 120ms ease | Buttons, icon-btns, panels |
| Progress bar fill | 600ms cubic-bezier | Exec progress update |

### Banned animations

- Shimmer / loading skeleton sweep
- Pulse glow (decorative)
- Rotation / spin (kecuali untuk genuine spinner, dan kita gak pake spinner)
- Page-scale entrance gymnastics
- Scroll-driven parallax decoration

---

## 8. Iconography

### Source

Custom inline SVG, **stroke 1.5px**, Lucide-style proportions. Disimpan dalam `Icon` component.

### Aturan

- **Tidak ada emoji** — pernah, untuk apapun
- Stroke width seragam (1.5px) — tidak ada mix dengan 1px atau 2px di hierarchy yang sama
- Outline-only — tidak ada filled icon kecuali untuk "checkmark" pattern di marker
- 14–18px default size (16px paling umum)
- Color = `currentColor` — di-control via parent text color, bukan via SVG fill

### Active icon set

`home`, `grid`, `layers`, `settings`, `bell`, `refresh`, `plus`, `arrow`, `check`, `x`, `copy`, `external`, `logout`, `chev`, `chevDown`

Tambah icon baru hanya kalau truly dibutuhkan — kebanyakan UI element bisa pakai text label.

### Brand marks

- **Sidebar logo:** `y/` — mono 14px, di dalam 32×32 box dengan border. Bukan filled tile, bukan colored gradient.
- **MetaMask mark:** `MM` — mono 9px, 22×22 box. Replacement untuk fox emoji.
- **Brand wordmark:** `yield/vibing` — mix Geist 500 untuk "yield", `--text-faint` slash, Instrument Serif italic 19px untuk "vibing". *Satu-satunya pakai serif italic di seluruh app.*

---

## 9. Per-Screen Signatures

Tiap screen di flow harus punya **satu angka besar** sebagai visual anchor. Ini brand signature YIELD VIBING.

| Screen | Signature number | Source data |
|---|---|---|
| 01 Input | Amount input (`clamp(40px, 7.2vw, 72px)`) | User-typed amount |
| 02 Recommend | APY (`figure-md`) | AI recommendation |
| 03 Connect | — (transitional, no anchor needed; eyebrow + lede do the work) | — |
| 04 Permission | Max amount in scope row (accent color, inline) | User's max |
| 05 Execute | `done/total` count (40px tabular) + progress bar | Real-time |
| 06 Success | 3 cells: deposited / yield / signatures (`clamp(28, 4vw, 48)`) | Final state |

---

## 10. Content & Copy

### Bahasa

- **Bahasa Indonesia casual** untuk body copy (matches "vibing" brand) — tapi technical labels (eyebrow, key/value labels, status text) tetap English-lowercase
- Sentence case untuk headlines — bukan title case
- Mono labels = lowercase — *kecuali* tx hash, address, dan kode (case sensitive)
- Annotation pattern: `keyword · context · constraint` (titik dot sebagai separator)

### Tone

| Konteks | Tone |
|---|---|
| Headlines | Direct, conversational ("Set deposit kamu", "Izinkan agent — tapi cuma sebatas yang ini") |
| Lede prose | Explainer, no jargon dump (tapi technical term DI-tulis literal: "EIP-7702", "ERC-7715") |
| Foot note | Reassurance + technical fact ("Agent **tidak punya akses** ke saldo wallet di luar scope ini.") |
| Eyebrow | Telegraphic — `nn · section · meta` |
| Activity log | Past-tense fact, mono ("ERC-7715 permission granted") |

### Number formatting

- USD/USDC: tanpa currency symbol di front (pakai unit di belakang: `100 USDC`)
- Percentages: 1 decimal max (`8.2%`)
- Tx hash: short form `0x9f3…a124` (6 + … + 4)
- Address: `0xABCD7e8F…aBcDe` (8 + … + 5) — full form OK di permission scope doc
- Timestamp: locale-aware, `id-ID`, format `26 Mei 2026, 14:30`
- Duration: `86 400s` (with thin-space thousand separator dalam mono context)

---

## 11. Tweakable Surface

User bisa swap via panel:

| Tweak | Options | Effect |
|---|---|---|
| Brand palette | Acid Yield · Mono Slate · Liquid Mint · Bone Paper | `[data-palette]` attribute → swap accent + bg tokens |
| Demo speed | Fast · Med · Slow | Multiplier untuk timeout (220 / 600 / 1100 ms base) |
| Density | Comfortable · Compact | `[data-density]` attribute → smaller padding + radii |
| Jump to step | 6 buttons | Stage transition (untuk review tiap screen) |

Tweaks persisted via host protocol di `EDITMODE-BEGIN`/`EDITMODE-END` block — JSON dengan keys `palette`, `density`, `speed`.

---

## 12. Implementation Notes

### File structure

```
YIELD VIBING Prototype.html   — entrypoint, fonts, react/babel scripts
styles.css                    — all tokens + components
src/
  tweaks-panel.jsx            — host protocol + Tweak* form controls (vendored starter)
  components.jsx              — Icon, Sidebar, TopBar, StepRail
  screens.jsx                 — 6 screen components + RECOMMENDATION data
  app.jsx                     — state machine, right rail panels, Palette picker
```

### React patterns

- React 18.3.1 + Babel inline (no build)
- Each `.jsx` file does `Object.assign(window, { ... })` at end to share scope between Babel script tags
- State machine: `stage`, `aiPhase`, `connectPhase`, `permPhase`, `permActive`, `execState`, `logs`
- All animations timer-based via `setTimeout(..., speed * multiplier)` — speed comes from tweaks

### Naming conventions

- BEM-ish flat classes (`.exec-row`, `.exec-marker`, `.exec-title`) — no deeply nested
- Variant via modifier class (`.exec-row.done`, `.exec-row.active`, `.exec-row.idle`)
- Utility class minimum (`.flex`, `.gap-3`, `.tnum`, `.muted`, `.faint`, `.mono`)

### Accessibility floor (must-have)

- All interactive elements `≥ 32×32px` hit target (icon-btn = 30px borderline OK at desktop; bump to 44px for mobile)
- `aria-label` on icon-only buttons
- `role="radiogroup"` on risk-row, `aria-checked` per option
- `role="progressbar"` + `aria-valuenow`/`aria-valuemax` on step rail
- `role="dialog"` + `aria-modal="true"` on MetaMask permission modal
- Focus-visible ring via native browser (no `outline: none` override)
- Color contrast verified untuk semua palette (Acid Yield + Mono Slate + Bone Paper minimum)

---

## 13. Extending the System

Kalau perlu screen / komponen baru, ikuti urutan ini:

1. **Identify signature data point** — apa angka besar yang anchor screen ini?
2. **Pick the layout pattern** — card with eyebrow + headline + content + action-row? Atau lebih ke document-doc style (perm-doc)? Atau log-style (exec-log)?
3. **Reuse existing tokens** — jangan invent warna baru, jangan invent radius baru
4. **Mono untuk data, Geist untuk prose** — strict
5. **One accent moment** — di mana accent muncul di screen ini? Itu satu, dan dia jelas
6. **Run through anti-pattern list di §1** — sebelum commit, cek ulang

Kalau bingung apakah suatu treatment qualify atau "AI-slop": tanya "apakah ini bantuin user nge-trust permission scope mereka, atau ini cuma making it look 'designed'?" Kalau yang kedua — drop.

---

## 14. Reference Files

| File | Status |
|---|---|
| `YIELD VIBING Prototype.html` | Current (v2) — base reference |
| `YIELD VIBING Prototype v1.html` | Original — kept for compare (AI-slop baseline) |
| `styles-v1.css`, `src/components-v1.jsx`, `src/screens-v1.jsx` | v1 snapshot |
| `styles.css`, `src/*.jsx` (current) | v2 active design system |

---

## 15. Open Questions / Future

Hal-hal yang belum di-resolve dan bisa di-iterate:

- **Mobile breakpoint** — saat ini design desktop-first 1024px+. Mobile butuh full rethink: sidebar jadi bottom-bar? Right rail jadi bottom-sheet? Belum di-design.
- **Empty states** — kalau user gak punya history, kalau Venice AI timeout, kalau 1Shot down. Belum punya treatment.
- **Error states** — permission revert toast, AI fail toast. Belum di-design.
- **Multi-vault dashboard** — kalau user punya >1 active position, gimana display. Belum di-scope.
- **Settings screen** — gear icon di sidebar belum punya tujuan.
- **Notifications panel** — bell icon di sidebar bottom belum punya tujuan.
- **Loading skeleton** — banned shimmer, tapi butuh pattern lain untuk genuine loading >300ms. Saat ini cuma pakai `blink` pada marker — mungkin perlu eksplor "step list dengan progressive reveal" sebagai genuine alternative.

Semua ini buat iterasi berikutnya. Base sudah cukup buat handoff implementasi.
