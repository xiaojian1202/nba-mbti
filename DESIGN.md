---
name: Court Type
description: Charcoal and coral basketball editorial, inspired by the supplied Top.5 sports reference.
colors:
  charcoal: "#202020"
  white: "#f5f4f1"
  coral: "#ff5964"
  coral-hover: "#ff7e86"
  muted: "#b2b0ad"
  line: "#494949"
  surface: "#292929"
  selected: "#323232"
  choice-border: "#555555"
  court-lines: "#686868"
  marker-border: "#747474"
  header-rule: "#898886"
  indicator: "#92908d"
typography:
  display:
    fontFamily: "DM Sans, sans-serif"
    fontWeight: 700
    fontSize: "clamp(64px, 7.4vw, 106px)"
    lineHeight: 0.97
    letterSpacing: "-0.04em"
  question:
    fontFamily: "DM Sans, sans-serif"
    fontWeight: 600
    fontSize: "clamp(32px, 3.6vw, 54px)"
    lineHeight: 1.1
  body:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "17px"
    lineHeight: 1.7
rounded:
  square: "0px"
  circle: "50%"
---

# Court Type design system

The supplied Top.5 reference sets the visual direction: a continuous charcoal canvas, warm white headings, restrained coral emphasis, monochrome athletic photography, generous space, and thin rules. The basketball quiz retains its content, scoring, and three-screen flow.

## Palette

Use charcoal (#202020) on all screens and warm white (#f5f4f1) for primary text. Coral (#ff5964) identifies actions, the current play, the result code, and selected answers. Supporting text uses #b2b0ad. Keep large regions neutral; the result code is coral lettering rather than a filled color panel.

Rows use #292929 at rest and #323232 on hover or selection. Borders use #494949 for structural separation and #555555 for answer controls. The header and final result rule use #898886. Primary button hover uses #ff7e86. Keyboard focus uses a visible coral outline with an offset.

## Typography

DM Sans supplies both display and reading text. Headings use sentence case, weights 600–700, tight tracking, and open line spacing compared with the previous condensed uppercase treatment. The landing heading scales from 64 to 106px on desktop and 51 to 84px on mobile. Quiz questions scale from 32 to 54px. Body text is 15–17px with generous line height. Small uppercase labels remain for supporting navigation, counters, and report metadata.

## Layout and imagery

A shared shell has a 1600px maximum width and 5–6% horizontal gutters. The landing hero places copy beside the existing basketball photograph. CSS grayscale, edge fading, and top/bottom shading integrate the photo into the charcoal canvas; the original asset remains unchanged. The image is absolutely positioned inside its panel so its intrinsic size cannot stretch the hero.

The desktop quiz uses a 28/72 split with the current play and court diagram in the left column. Results use a 36/64 split with coral type code on the left and the named profile on the right. Thin rules and open lists organize the result details.

At 700px and below, columns stack, the decorative quiz diagram is hidden, and text and controls adjust for narrow screens. The landing photograph gets a 380px panel below the copy. Essential answer and navigation controls remain visible and usable.

## Interaction

Buttons and answer rows remain square and flat. Circular A/B labels and selection indicators echo the reference's compact numbered circles. Hover changes fill and border; selection adds the coral border and filled indicator. Native progress, focus, selection, and scrollbar colors follow the palette. Reduced motion removes transitions and smooth scrolling.

Keep the quiz questions, result descriptions, scoring, URL sharing, and restart behavior unchanged when refining presentation.
