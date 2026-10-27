# Wine Journal screen design

The first demo has a sign-in screen and a welcome screen. The welcome screen previews future wines, regions, and tasting notes without pretending those sections are available.

## Sign in

A two-panel layout pairs an editorial introduction with a compact form. The introduction explains the future purpose of the journal. The form has visible Username and Password labels, a clear Sign in action, and inline feedback for rejected credentials or an unavailable server. The password field clears after a rejected sign-in. A saved session opens the welcome screen on refresh.

## Welcome

The welcome page greets the signed-in account and offers Sign out. Three clearly marked “coming soon” previews introduce Wines, Regions, and Tasting notes. They are informational, not links. Signing out returns to the sign-in screen.

## Responsive states

At narrow widths, the editorial introduction stacks above the form, and the previews become one column. Light and dark themes share layout and use semantic tokens. A loading message appears while the app checks a saved session. Keyboard navigation, focus, disabled buttons, and error messages must remain usable.

There are no reference mockups in this repository. Validate the rendered screens in Playwright when browser access is available.
