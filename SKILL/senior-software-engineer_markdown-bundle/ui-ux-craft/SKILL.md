---
name: ui-ux-craft
description: Use whenever building or modifying any UI — pages, dashboards, forms, components. Governs how to avoid generic "AI slop" design (default Tailwind look, templated layouts, no visual identity) and make deliberate design decisions instead. Apply proactively before writing JSX/CSS, not just when asked to "make it look better."
---

# UI/UX Craft — No AI Slop

"AI slop" here means: interfaces that look like every other AI-generated app — centered hero with a gradient, three icon cards in a row, generic sans-serif everywhere, indigo-500/purple-600 as the only color anyone chose, default shadcn spacing with zero adaptation. It's not that these are wrong, it's that they're the **default**, chosen by not choosing.

## Before Writing Any UI Code

Ask (and answer, even briefly, before coding):
1. Who actually uses this screen — Owner checking KPIs, Production Staff updating a job status on a shop floor tablet, or a Customer checking their order on their phone? Design for that person's context, not a generic "user."
2. What's the ONE thing this screen needs to communicate first? Design hierarchy around that, not around fitting every widget in evenly.
3. What does PT Multi Kreasi Printing's actual brand feel like (their logo, existing signage, invoices)? If no brand exists yet, pick a deliberate palette now and use it everywhere — don't let it drift screen to screen.

## Concrete Rules

**Color**
- Pick one primary color, one accent, and a neutral gray scale — write them down as CSS variables once, reuse everywhere. Don't let Tailwind's default `blue-500`/`indigo-600` be the accidental brand color by never having chosen one.
- Status colors must be semantic and consistent across the whole app: same "overdue" red, same "completed" green, same "pending" amber everywhere — an Order status pill and an Invoice status pill should share the palette.

**Typography**
- Choose a type scale deliberately (e.g. 12/14/16/20/24/32px) and stick to it — don't let font sizes be whatever felt right in each component.
- One font for UI text, optionally a second for numbers/data-heavy tables (tabular figures matter for financial data — use `font-variant-numeric: tabular-nums` on invoice/dashboard numbers so columns of digits align).

**Layout and Spacing**
- Use a consistent spacing scale (4px/8px grid) — not arbitrary `mt-3 mb-5 p-2.5` scattered per component.
- Generous whitespace over cramming — especially on dashboards, resist the urge to fit 8 widgets edge-to-edge with no breathing room.
- Avoid the generic "centered hero + 3-column feature cards + testimonial carousel" pattern for the customer portal landing — this is a B2B ordering tool, not a SaaS marketing page. Design around the actual task (track my order, upload my design, pay my invoice), not a template.

**States That Are Usually Forgotten**
- Empty states (no orders yet, no design files uploaded) — design them intentionally, don't leave the default "no data" blank
- Loading states — skeleton screens or deliberate spinners, not a layout jump when data arrives
- Error states — match tone/visual language to the rest of the app, don't let a raw browser error or unstyled 404 leak through

**Componentization**
- Status pills, buttons, badges, table rows: build once as reusable components with variants, don't hand-roll the same Tailwind class soup in five different files — inconsistency here is the fastest way to look AI-generated, because it means no single design decision was made, just five separate guesses.

**Motion**
- Subtle transitions on hover/state-change (150-200ms ease) make an interface feel considered — but don't animate for its own sake. If a transition doesn't clarify what changed, skip it.

**Data Visualization (Dashboard)**
- Don't default to whatever chart library ships first — choose chart type based on what the number means (trend → line, comparison → bar, composition → avoid pie unless ≤3 segments)
- Don't use rainbow color palettes for categorical data with no meaning attached to each color — assign color deliberately (e.g. by product category, consistent across all charts)

## Self-Review Before Committing UI

- [ ] Did I choose colors deliberately, or did I use framework defaults because I didn't decide?
- [ ] Is spacing consistent with the rest of the app, not just internally consistent within this one component?
- [ ] Does this screen design for its actual primary user (Owner/Staff/Customer), not a generic user?
- [ ] Are empty/loading/error states designed, not left default?
- [ ] Would this screen look identical to a screen from a different, unrelated AI-generated app? If yes, revise.

## Anti-Patterns to Refuse

- Reaching for a generic dashboard template and filling in labels without adapting layout to what THIS business's data actually looks like
- Using every color in the Tailwind default palette because "it looks colorful" instead of a chosen palette
- Copy-pasting shadcn/ui examples verbatim without adjusting spacing/color to the project's own design tokens
