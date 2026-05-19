---
name: arabic-rtl-ui
description: How to build Arabic / RTL-aware UI in Vision-OS using Tailwind 4, shadcn/ui, and the existing translations system. Covers logical properties, text direction, fonts, and common pitfalls.
when_to_use: When adding or editing any user-facing component (anything in `src/components/` or `src/views/`). Also when adding strings — they MUST come from `src/lib/translations.ts`, never hardcoded.
---

# Arabic / RTL UI — patterns for Vision-OS

The app is **bilingual Arabic ↔ English**. Arabic users read right-to-left. We don't just mirror English — Arabic deserves a first-class experience.

## The two switches that drive everything

```tsx
const [language, setLanguage] = useState<Language>('ar'); // 'ar' | 'en'
const t = translations[language];

return (
  <div dir={language === 'ar' ? 'rtl' : 'ltr'}>
    {/* layout flips automatically thanks to logical properties + dir attribute */}
  </div>
);
```

- `dir="rtl"` on a container makes the browser flip flexbox, grid auto-flow, text alignment, and **logical** Tailwind utilities (`ms-`, `me-`, etc.).
- `dir` is **inheritable** — set it once at the top, children inherit unless they override.

## Use logical properties, not physical ones

| ❌ Physical (don't use) | ✅ Logical (do use)           | What it does in RTL             |
| ----------------------- | ----------------------------- | ------------------------------- |
| `ml-2` (margin-left)    | `ms-2` (margin-inline-start)  | Becomes margin-right in RTL     |
| `mr-2`                  | `me-2` (margin-inline-end)    | Becomes margin-left in RTL      |
| `pl-3`                  | `ps-3` (padding-inline-start) | Becomes padding-right           |
| `pr-3`                  | `pe-3` (padding-inline-end)   | Becomes padding-left            |
| `text-left`             | `text-start`                  | Aligns to the start of the line |
| `text-right`            | `text-end`                    | Aligns to the end of the line   |
| `left-3` (positioning)  | `start-3`                     | Becomes right-3 in RTL          |
| `right-3`               | `end-3`                       | Becomes left-3 in RTL           |
| `border-l`              | `border-s`                    | Becomes border-r in RTL         |
| `border-r`              | `border-e`                    | Becomes border-l in RTL         |
| `rounded-l-lg`          | `rounded-s-lg`                | Becomes rounded-r-lg in RTL     |
| `rounded-r-lg`          | `rounded-e-lg`                | Becomes rounded-l-lg in RTL     |

If you absolutely need to override per-direction (rare), use the `rtl:` and `ltr:` Tailwind 4 variants:

```tsx
<ChevronRight className="h-4 w-4 rtl:rotate-180" />
<ArrowLeft className="rtl:rotate-180" />
```

## When NOT to flip

- **Numbers**: keep LTR. Arabic numerals (٠١٢٣) are written right-to-left **as digits** but displayed left-to-right within text. Use `dir="ltr"` and `class="font-mono"` on tender numbers, dates, phone numbers.
- **Code blocks**: `dir="ltr"`.
- **Icons that have a meaningful direction** (▶ play, ↑ ascending) typically should NOT flip.
- **Brand logos / wordmarks**: keep LTR — `<div dir="ltr">…</div>`.

## Fonts

- Inter has Arabic glyphs but they're not great. For polish, install a real Arabic font:
  - **Tajawal** (free, Google Fonts) — clean, modern, like Inter
  - **Cairo** (free, Google Fonts) — slightly more humanist
  - **Noto Sans Arabic** (free) — broadest character support
- Suggested setup (defer to Phase 5):

  ```css
  @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;900&display=swap');

  /* In @theme */
  --font-sans-ar: 'Tajawal', 'Inter', sans-serif;

  /* In a [dir="rtl"] selector */
  [dir='rtl'] body {
    font-family: var(--font-sans-ar);
  }
  ```

## Line height & spacing

Arabic glyphs are taller and have descenders/ascenders that overlap on tight line-heights. Always use:

- `leading-relaxed` (`line-height: 1.625`) minimum for body text.
- `leading-loose` for paragraphs.
- Avoid `leading-tight` on Arabic text — it clips.

## Translations system

All strings live in `src/lib/translations.ts`:

```ts
export const translations = {
  en: { newTender: "New Tender", ... },
  ar: { newTender: "مناقصة جديدة", ... },
};
export type Language = 'en' | 'ar';
```

Use:

```tsx
import { translations, Language } from '../lib/translations';
// ...
const t = translations[language];
return <h1>{t.newTender}</h1>;
```

If you find a hardcoded English string in a component, **add it to translations** (both `en` and `ar`) and replace the literal. Don't ship UI that doesn't have an Arabic counterpart.

### Adding a new translation key

1. Add the key to `en` first (English).
2. Add the same key to `ar` with the Arabic translation.
3. Use `t.<key>` in the component.

If you don't speak Arabic for a particular phrase, mark with `// TODO(ar): translate "<english>"` and leave the Arabic value empty. The agent will surface this as an `⏸ AWAITING USER` row in `PROGRESS.md`.

## Bidirectional text within one element

If you mix Arabic and English in the same paragraph, use Unicode bidi controls or wrap the foreign-direction part in a span with explicit `dir`:

```tsx
<p>
  Tender number <span dir="ltr">{tender.tenderNo}</span> من {tender.organizationNameAr}
</p>
```

## Status badges and color

- Don't rely on direction-specific positioning for status badges.
- Status colors should be **consistent across languages** (blue=new, amber=postponed, etc.). The text inside changes, the color doesn't.

## Animations

The `motion/react` library respects `dir`. For directional animations (slide-in from start), prefer:

```tsx
<motion.div
  initial={{ opacity: 0, x: 20 }} // x: 20 = from end (right in LTR, left in RTL)
  animate={{ opacity: 1, x: 0 }}
/>
```

If you need a literal "from-the-right" regardless of direction:

```tsx
<motion.div
  initial={{ opacity: 0, x: language === 'ar' ? -20 : 20 }}
  animate={{ opacity: 1, x: 0 }}
/>
```

## Common pitfalls

| Pitfall                                              | Symptom                                             | Fix                                                                                                                       |
| ---------------------------------------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Using `pl-`/`pr-` everywhere                         | Layout breaks when `dir="rtl"` (icon overlaps text) | Migrate to `ps-`/`pe-`.                                                                                                   |
| Mixing Arabic + numbers without explicit dir         | Numbers appear in wrong order                       | Wrap numbers in `<span dir="ltr">`.                                                                                       |
| Using `text-left` in a card that may be RTL          | Text aligns to the page start, not the locale start | Use `text-start`.                                                                                                         |
| Animations slide off-screen in RTL                   | `x: -100` becomes confusing                         | Use logical animations or branch on `language`.                                                                           |
| Tooltip / Popover positioned wrong                   | Anchors using `left`/`right` props                  | Use `start`/`end` if available, or pass `dir` to the lib.                                                                 |
| `&nbsp;` between Arabic words                        | Rare, but breaks line wrapping                      | Use plain spaces; let the browser handle bidi.                                                                            |
| Date formatting using `toLocaleDateString()` default | English dates appear in Arabic UI                   | Pass locale: `date.toLocaleDateString(language === 'ar' ? 'ar' : 'en')` or use `date-fns` `ar` locale (already imported). |

## Quick checklist for any new component

- [ ] All strings come from `translations.ts` (both `en` and `ar` keys exist)
- [ ] `dir={language === 'ar' ? 'rtl' : 'ltr'}` set somewhere on a parent (or inherited)
- [ ] No `pl-`/`pr-`/`ml-`/`mr-`/`text-left`/`text-right`/`left-`/`right-` in classes
- [ ] Numbers and code wrapped in `<span dir="ltr">` if mixed with Arabic text
- [ ] Tested by toggling the language switch — layout doesn't break
- [ ] Tested at 375 px width (Arabic users on phones)

## Reference

- MDN — CSS logical properties: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_logical_properties_and_values
- W3C — Inline alignment: https://www.w3.org/International/articles/inline-bidi-markup/
- Tailwind v4 — RTL variants: https://tailwindcss.com/docs/hover-focus-and-other-states#rtl-support
