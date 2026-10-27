# AGENTS.md

## Scope

Applies to `client/`.

Follow the root `AGENTS.md` first. This file adds frontend-specific rules only.

Application uses Vue 3 + Vite and supports desktop, tablet, mobile, light mode, and dark mode.

## Commands

```bash
cd client
npm run lint
npm run lint:css
npm run format:check
npm run type-check
npm run test
npm run build
```

Prefer focused tests first:

```bash
npx vitest run path/to/test.js
```

## Before Editing

For UI changes, read the relevant guidance in repository-root `docs/design/`
(`../docs/design/` from `client/`). If reference images are present, open and
visually inspect the ones relevant to the affected page. Report when image
inspection is unavailable.

Inspect the target component, its parent/callers, related composables/services, relevant tests, and affected layout modes before changing behavior.

Do not assume a component is used only in the currently visible screen.

## Architecture

Follow existing Vue 3 patterns.

Typical responsibilities:

`components → rendering/interaction`
`composables → reusable reactive behavior`
`services → API and non-visual application logic`

Reuse existing services, composables, utilities, and shared components before creating new ones.

Do not extract code merely to reduce `.vue` file size.

For substantial features, identify responsibilities, state owners, and contracts first.
Extract cohesive UI or workflows when this hides meaningful complexity, even for one consumer.
Keep route/root components focused on composition and coordination.

## Vue

- Use Single File Components with Composition API and `<script setup lang="ts">`.
- Order SFC sections as script, template, then style.
- Preserve existing props, events, and slots unless the task requires changing them.
- Inspect callers before changing component contracts.
- Type props and events with `defineProps` and `defineEmits`; never mutate props.
- Pass props down and emit events up; reserve `v-model` for intentional two-way contracts.
- Use typed provide/inject only for scoped descendant dependencies when prop forwarding becomes burdensome.
- Give state one owner and an explicit lifetime; keep source state minimal.
- Prefer computed state over duplicated derived state.
- Avoid watchers when computed state or explicit event flow is clearer.
- Keep side effects out of computed properties.
- Keep templates declarative; move complex derivations into script.
- Use stable keys for lists; avoid `v-if` and `v-for` on the same element.
- Never render untrusted content through `v-html`.
- Clean up timers, listeners, observers, and subscriptions.
- Keep local behavior local; do not introduce global state unnecessarily.

Composables should expose focused state/actions and own side-effect cleanup.
Use plain functions for pure calculations; keep simple component-local logic local.
Add optional Vue features only for demonstrated requirements; optimize after behavior is verified.

Reference: [Vue best practices](https://github.com/vuejs-ai/skills/blob/main/skills/vue-best-practices/SKILL.md).

## API Integration

- Use existing service modules for API calls where available.
- Do not duplicate request or response-normalization logic in components.
- Handle relevant loading, empty, success, and error states.
- Verify the backend contract before assuming new response fields exist.

## Responsive Design

- Prefer existing breakpoints and layout logic.
- Prefer CSS for layout behavior.
- Use JavaScript layout detection only when interaction behavior requires it.
- Avoid duplicate breakpoint definitions.
- Check intermediate tablet sizes, including portrait and landscape.
- Preserve touch behavior when changing pointer/desktop interactions.

## CSS and Design

Treat current product designs in `docs/design/` as the visual reference when
they exist. Reuse design tokens and shared components for recurring patterns.

Explicit task requirements take precedence over reference designs.
Do not copy reference dimensions into fixed layouts; adapt the design
to supported screen sizes. For modes without references, extend the same
design language using existing responsive and theme patterns.

Use existing tokens, variables, utilities, and component patterns.

- For tabs, badges, buttons, cards, blocks, and other interactive elements, always preserve sufficient text/icon contrast in hover, active, selected, and focus states. When the background becomes darker, use a suitably light foreground color; when the background becomes lighter, use a suitably dark foreground color. Never introduce a state where text or icons become difficult to read against their background.

- For badges, labels, leading headers, icon containers, buttons, and similar compact UI elements, keep their text and icons visually centered both horizontally and vertically. Use flex/grid alignment rather than manual offsets, margins, or positioning hacks.

Prefer flexbox, grid, `gap`, and natural wrapping.

Avoid:

- unnecessary `!important`;
- negative-margin hacks;
- arbitrary positional offsets;
- duplicated hard-coded colors;
- global CSS for local problems;
- fixed dimensions that break responsive layouts.

Fix the underlying layout constraint rather than masking it.

Keep the interface clear and consistent across browsing and editing workflows.

## Accessibility

Use semantic elements.

Interactive controls must preserve keyboard access, focus states, accessible names, and disabled/loading behavior.

Use `<button>` for button behavior.

Icon-only controls need an accessible name.

## Performance

Avoid:

- expensive work in render paths;
- repeated expensive parsing;
- unnecessary deep watchers;
- duplicated reactive state;
- API calls triggered repeatedly by renders;
- large client-side filtering when server-side support already exists.

Do not remove existing lazy or incremental rendering behavior without understanding why it exists.

## Testing

Add focused regression tests when behavior changes and an established test pattern exists.

Prioritize:

- component contracts;
- conditional rendering;
- interactions;
- API states;
- layout-mode conditions;
- composable/service logic.

For changes affecting Vue templates, CSS, components, layouts, or other rendered UI, Playwright validation is mandatory:

- Start the application using the documented development command.
- Open the affected page with representative data.
- Capture and visually inspect screenshots at representative viewports.
- Compare the rendered page against relevant references in `docs/design/`,
  when present, correcting unintended differences in layout and styling.
- Check affected desktop, tablet, mobile, light, and dark modes.
- Verify relevant interactions and check for browser console errors.

Accessibility snapshots alone are insufficient for visual validation.
Do not overwrite reference images with generated screenshots.
Report the reference images, if any, pages, and viewport sizes inspected,
and any remaining differences or validation blockers.
If browser or image tools are unavailable, state what needs manual validation.

- Run Playwright visual regression checks for layout, header, hero, tab, sidebar, card or styling changes.
- Check container widths, alignment, spacing, sidebar proportions and horizontal overflow using DOM geometry.
- Compare screenshots against maintained visual baselines when available.
- Capture relevant overview, detail and specialized patterns with matching routes, records, themes and states.
- Preserve existing baseline screenshots; revise baselines only for explicitly justified intentional design changes.
- Reuse existing Playwright tests and screenshots without duplicate infrastructure; report visual regressions and verification results before completion.
