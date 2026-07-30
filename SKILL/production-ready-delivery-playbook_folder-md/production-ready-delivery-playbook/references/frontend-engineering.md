# Frontend Engineering — Architecture, Performance, Accessibility

Read this during Phase 5 (frontend implementation). This covers frontend-*specific* strategy; general naming/function-design craftsmanship lives in the `senior-software-engineer` skill.

---

## Component Architecture

- Design components around a single, clear responsibility — a component that fetches data, manages complex local state, *and* renders a large chunk of UI is usually three concerns wearing one component's clothes; splitting data-fetching/state (container/hook) from presentation makes both independently testable and reusable.
- Keep prop interfaces small and specific. A component accepting a large, loosely-typed `config` object is harder to use correctly than one with a few well-named, well-typed props — the type system/IDE autocomplete can't guide the caller through an opaque blob.
- Co-locate a component with the things only it uses (its specific styles, its specific small sub-components, its tests) — but promote genuinely shared pieces (design-system primitives, shared hooks) to a common location deliberately, once actually shared, not speculatively.
- Avoid deep prop-drilling (passing a prop through 4+ layers of components that don't use it themselves, just to reach a descendant) — this is a signal to use composition (passing the descendant as `children`/a slot) or a scoped state solution, not a signal to add more global state than needed.

---

## State Management Strategy

- Default to local component state; reach for shared/global state only when the same piece of state is genuinely needed by multiple, non-nested parts of the tree. Promoting everything to global state "to be safe" makes data flow harder to trace, not easier.
- Distinguish **server state** (data that lives on a backend and can go stale — API responses) from **client/UI state** (a modal being open, a form's current input) — they have different concerns (caching, revalidation, loading/error states for the former; simple synchronous updates for the latter) and are often better served by different tools (a data-fetching library with built-in caching/revalidation for server state, simple local state or a lightweight store for UI state) rather than treating both the same way.
- Avoid storing derived data in state when it can be computed from existing state/props at render time — duplicated state (a value stored separately from its source) is a recurring source of "why isn't this updating" bugs when the source changes but the derived copy doesn't.

---

## Performance: What Actually Matters to Users

Prioritize the metrics that map to real user-perceived experience (Core Web Vitals as of current guidance):

- **Largest Contentful Paint (LCP)** — how long until the main content is visible. Usually improved by: optimizing/compressing the largest image or content block, reducing render-blocking resources, using a CDN for static assets.
- **Interaction to Next Paint (INP)** — how responsive the page feels to actual clicks/taps/keypresses. Usually hurt by long-running JavaScript blocking the main thread — break up expensive synchronous work, defer non-critical JS, avoid large synchronous re-renders on every keystroke.
- **Cumulative Layout Shift (CLS)** — how much content visibly jumps around while loading. Usually caused by images/embeds without reserved dimensions, or content injected above existing content after load — always reserve space (explicit width/height or aspect-ratio) for anything that loads asynchronously.

Practical defaults:
- Lazy-load below-the-fold images and non-critical components/routes (code-splitting) rather than shipping the entire app's JavaScript on first load.
- Debounce or throttle expensive operations tied to frequent events (search-as-you-type, scroll handlers, resize handlers).
- Memoize genuinely expensive computations/renders, but don't reach for memoization by default on cheap operations — the memoization bookkeeping itself has a cost, and overusing it can make code harder to read for no real benefit.
- Audit bundle size periodically — a single large, rarely-used dependency pulled in for one small feature is a common, easy-to-miss source of slow initial load.

---

## Accessibility Implementation

Design intent from `ui-ux-design.md` has to actually be implemented correctly:

- Use semantic HTML elements (`<button>`, `<nav>`, `<label>`) instead of styled `<div>`s with click handlers — semantic elements give you keyboard interaction, screen-reader semantics, and focus management for free; recreating all of that manually on a `<div>` is extra work that's easy to get subtly wrong.
- Every interactive element must be reachable and operable by keyboard alone (Tab to reach it, Enter/Space to activate it) — test this manually by unplugging your mouse occasionally, not just by trusting the framework.
- Images need meaningful `alt` text (or explicitly empty `alt=""` for purely decorative images so screen readers skip them); icon-only buttons need an accessible label (`aria-label` or visually-hidden text) since there's no visible text to announce.
- Manage focus deliberately for dynamic UI: when a modal opens, focus should move into it; when it closes, focus should return to what opened it. Unmanaged focus after a dynamic UI change is one of the most common real-world screen-reader usability failures.
- Respect `prefers-reduced-motion` for users who've indicated animation causes them discomfort — don't force animations on everyone by default.

---

## Cross-Browser & Cross-Device Reality

- Test on at least one real mobile device, not just a resized desktop browser window — touch targets, viewport quirks, and performance on real mobile hardware/networks differ meaningfully from a desktop browser's device emulation.
- Don't assume the latest browser features are universally available — check actual support data for anything beyond well-established APIs, and have a fallback or a deliberate decision to not support older browsers, rather than an untested assumption.
- Test with a throttled/slow network profile at least once — a feature that works instantly on a fast office connection can reveal real UX problems (no loading state, a race condition, a timeout that's too short) under realistic mobile-network conditions.

---

## Error Boundaries & Resilience on the Frontend

- Wrap route-level or major feature-level UI in error boundaries so one component throwing doesn't take down the entire application with a blank white screen — a contained, recoverable error state is a dramatically better user experience than a full crash.
- Design and implement explicit loading, empty, and error states for every piece of UI that depends on asynchronous data — not just the success state. This is the same discipline covered in `senior-software-engineer`'s testing section, applied specifically to UI states.
- Handle the specific case of a request being cancelled (user navigated away, a newer request superseded it) distinctly from a genuine error — don't show an error message for a deliberately aborted request.

---

## Build & Tooling Hygiene

- Keep the dependency list intentional — periodically audit for unused dependencies and for multiple libraries solving the same problem (two different date libraries, two different HTTP clients) that crept in over time.
- Separate environment-specific configuration (API base URLs, feature flags) from code via environment variables/build-time config, not hardcoded values that differ silently between a developer's branch and what actually ships.
- Keep the production build's source maps handling deliberate — useful for your own error-tracking tool, but decide consciously whether they're publicly exposed (which reveals your original source code to anyone).
