# UI/UX Design — Senior Design Thinking

Read this during Phase 2 (UX & Interaction Design) and whenever building or reviewing anything user-facing.

---

## Design Starts with the Task, Not the Screen

- Before designing any screen, state the user's actual goal in that moment ("I need to confirm this payment went through," not "I need a confirmation page"). A screen designed around the task is structurally different from one designed around "what components do we have."
- Map the core user flows end-to-end (entry point → decision points → completion/error) before designing individual screens in detail. Screens designed in isolation tend to produce inconsistent flows where the user has to re-orient at every step.
- Identify the *unhappy* paths deliberately at design time, the same way senior engineering identifies them at code time: what does the user see on a failed payment, an expired session, an empty search result, a slow network? These are usually designed as an afterthought, and it shows.

---

## Usability Heuristics (Nielsen's, Applied Practically)

These aren't academic — they're a fast checklist for catching real usability problems before a user does:

1. **Visibility of system status** — the user should always know what's happening (loading states, progress indicators, confirmation after an action) — never leave them wondering if a click registered.
2. **Match between system and the real world** — use the user's language and mental model, not internal system/database terminology (a user thinks "cancel my order," not "set order status to VOID").
3. **User control and freedom** — provide an obvious way to undo or back out of an action, especially destructive ones. A delete without confirmation or undo is a design failure waiting to become a support ticket.
4. **Consistency and standards** — the same action should look and behave the same way everywhere in the product; don't reinvent a pattern (like a "save" button placement) per-screen.
5. **Error prevention** — better than a good error message is a design that prevents the error in the first place (disable a submit button until required fields are valid, confirm before an irreversible action).
6. **Recognition over recall** — don't make the user remember information from a previous screen; show it again when it's needed for a decision.
7. **Flexibility and efficiency** — support both a novice's guided path and a power user's faster path (keyboard shortcuts, bulk actions) once the product matures enough to have power users.
8. **Aesthetic and minimalist design** — every extra element on a screen competes for attention with the one that actually matters for this task; cut anything that isn't earning its place.
9. **Help users recognize, diagnose, and recover from errors** — error messages state what happened, why, and what to do next in plain language ("This email is already registered — try logging in instead," not "Error 409").
10. **Help and documentation** — should be searchable and task-focused (findable exactly when needed), not a wall of text nobody reads until they're already stuck.

---

## Accessibility by Design (Not Bolted on Later)

Accessibility retrofitted after a design is finished is expensive and usually incomplete. Build it in during design instead:

- **Color contrast**: text meets WCAG AA contrast ratio (4.5:1 for normal text, 3:1 for large text) against its background — check this at design time, not after a developer complains it fails an automated audit.
- **Never rely on color alone** to convey meaning (a red vs green status dot with no label/icon excludes colorblind users) — pair color with text, icon, or pattern.
- **Touch targets** on mobile are at least ~44x44px with adequate spacing — a beautifully dense mobile UI that's unusable with a real thumb isn't actually usable.
- **Design real focus states** for keyboard navigation — don't leave this to browser defaults that get accidentally removed later; a focus-visible outline is a functional requirement, not a cosmetic detail.
- **Design for screen readers by giving every meaningful element a clear purpose** — icon-only buttons need a design note specifying their accessible label, not just their visual appearance.
- **Don't design layouts that break at 200% browser zoom** — a real accessibility need for low-vision users, and a good stress test for responsive design generally.

---

## Design Systems & Consistency

- A design system (even a lightweight one — a shared set of colors, spacing scale, typography scale, and core components) pays for itself the moment a second screen is designed, because it removes hundreds of small, inconsistent decisions ("was this button's padding 12px or 16px on the last screen?").
- Prefer a small, consistent spacing/sizing scale (e.g. 4px or 8px increments) over arbitrary pixel values chosen per-screen — this alone makes a UI feel more polished without any additional design skill, purely from consistency.
- Component states (default, hover, active, disabled, loading, error) should be designed once per component, not improvised per screen when that component happens to need a state nobody thought about yet.

---

## Performance-Aware Design

Design decisions have real performance costs that show up in Phase 5 (frontend implementation) — negotiate this at design time, not after a beautiful design turns out to load slowly on a real device:

- Large hero images/videos, autoplaying animations, and heavy custom fonts all have a real load-time and battery cost — a design that looks stunning on a designer's high-end laptop on office wifi may be genuinely unusable on a mid-range phone on mobile data, which is the actual condition a large share of real users are in.
- Prefer system fonts or a minimal number of font weights/families over many custom font files.
- Design loading and skeleton states explicitly rather than leaving "what happens while this loads" undesigned — this is exactly the gap that produces the blank-screen-while-fetching problem covered in the frontend and backend reference files.

---

## Mobile-First & Responsive Thinking

- Design the smallest viewport first, then progressively enhance for larger screens — this forces genuine prioritization of what matters most on a screen, rather than designing a feature-dense desktop layout first and then cramming it down.
- Don't assume touch and mouse/keyboard interaction patterns are interchangeable — hover-dependent interactions (a menu that only appears on hover) have no equivalent on a touch device and need an explicit alternative.

---

## Design-to-Development Handoff

- Specify states, not just the default/happy-path appearance — a developer implementing a design that only shows the "success" state will improvise the loading, empty, and error states, usually inconsistently with the rest of the product.
- Specify behavior at breakpoints and content edge cases explicitly (what happens with a very long name, zero items in a list, a very long number) — these are exactly the cases a design mockup with placeholder content tends to hide.
- A design isn't "done" until it accounts for real content constraints (translation length differences, user-generated content of unpredictable length) — a layout that only works for the exact placeholder text used in the mockup isn't finished.
