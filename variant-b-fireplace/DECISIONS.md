# Decisions

- Each creative uses its own background (`assets/left/bg.jpg`, `assets/top/bg.jpg` or `assets/right/bg.jpg`) sized to 100% × 100% of its ad. This uses the provided pre-cut assets and preserves their intended composition.
- Rendered each 2x overlay at its intended half-size. Full-canvas logo, copy and panel overlays retain their original coordinates, while the CTA is centered above the panel.
- Applied screen blending to the supplied black-matte copy and panel PNGs so their black pixels do not obscure the continuous background.
- Raised the skyscraper CTA buttons to match the supplied layout. Added a mostly opaque blue backing beneath the box artwork so the moss does not show through the panel as strongly.
- Kept the three ad units as standalone HTML documents and added `preview.html` to host them in a matching composition. A small message from the preview starts their animations together.
- Matched the preview stage to the 1684 × 1018 reference, including its gutters and central website area. `?debug=1` overlays the layout at 50% and freezes the creatives in their final state for alignment checks.
- Used CSS transform and opacity keyframes for the intro and calm loop. All motion ends after approximately 30 seconds; reduced-motion users see the final state immediately.
- Kept the product packs as part of their supplied background imagery rather than attempting to extract or redraw them.
- No assets were compressed or modified. The referenced asset payload is approximately 1.57 MiB; the combined background and design reference are excluded from the creative payload.
