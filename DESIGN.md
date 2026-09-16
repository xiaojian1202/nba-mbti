---
name: Court Type — NBA Era direction
description: Near-black sports editorial with coral type, monochrome basketball photography, and compact scouting-report UI.
colors:
  ink: "#0d0d0d"
  band: "#141414"
  tile: "#1a1a1a"
  raised: "#232323"
  coral: "#f0485c"
  coral-pressed: "#d93a4e"
  white: "#ffffff"
  body: "#b4b4b4"
  muted: "#7c7c7c"
typography:
  display: "Archivo, sans-serif"
  body: "Barlow, sans-serif"
  data: "IBM Plex Mono, monospace"
rounded:
  square: "0px"
  circle: "50%"
---

# Court Type design system

The user-supplied `NBA Era System Redesign.zip` provides the visual source: the `Court Type.dc.html` screen design, token files, and image assets. The archive's design-system README describes a different NBA analytics product; its styling is useful here, but its product claims are not Court Type requirements.

## Visual language

Use the exported near-black stack, one coral accent, white display text, quiet grey body text, flat surfaces, and thin rules. Archivo carries headlines and the wordmark; Barlow carries reading text and controls; IBM Plex Mono carries counts and labels. Corners stay square except circled numbers. Athlete photography is monochrome and shaded to keep copy legible. The imported basketball glyph and favicon are used directly.

## Screens

The landing page opens with a full-bleed photographic hero, large two-line question, coral action, and a four-card instincts section — one card per role, listing that role's traits — followed by a legend of the five scale points. The quiz uses the exported 28/72 scouting-report split, a five-point Never-to-Always scale rendered as selectable columns, and an explicit Next control. The result uses the exported 36/64 split, coral tagline, strengths, the nine-trait scorecard with its proficiency bands, the two modifier readings, copy-link action, and restart action.

The imported export demonstrates 12 questions, four axes, and 16 results. Court Type does not use axes at all: 46 items are each rated 1-5, nine traits are scored independently and ranked within the player's own game, and the top two traits resolve to one of 72 types across four roles, with Tempo and Temper reported as separate modifiers. Counts and labels in the adapted UI reflect that model.

## Responsive and interaction

At 700px and below, quiz and result columns stack; controls stay in reach and the instinct cards reduce to two columns. Focus outlines use coral. Selected answers are visible by color and border, and the Next control stays disabled until an answer is chosen. Reduced-motion preference removes transitions and smooth scrolling.
