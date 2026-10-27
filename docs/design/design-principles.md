# Wine Journal design principles

## Calm and readable

Let clear language and typography carry the demo. Use wine-inspired color sparingly for emphasis, with comfortable contrast in light and dark themes. The editorial sign-in panel sets the mood; the form stays simple.

## Shared visual system

`client/src/styles/theme.css` owns shared color, typography, spacing, border, radius, shadow, and transition tokens. Component and page CSS should use those tokens for recurring values. Add a token only when a visual role is reused.

## Hierarchy and layout

Make page titles and primary actions easy to locate. Keep form labels visible above fields. Use readable line lengths and generous spacing. Let layouts reflow at narrow widths instead of relying on fixed desktop coordinates.

## Interaction and accessibility

Use semantic headings, navigation, links, buttons, labels, and form controls. Provide visible keyboard focus, adequate contrast in both themes, and comfortable touch targets. Announce loading and error states, and keep form feedback next to the action. Respect reduced-motion preferences.

## Validation

Check the sign-in and welcome screens at narrow and wide viewports in both themes. Verify valid and rejected sign-in, saved-session restoration, sign-out, server errors, hover, focus, disabled state, and browser console output. There are currently no reference screenshots to compare against.
