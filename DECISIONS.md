# Implementation decisions for Variant A

- **Rendering:** Canvas keeps the game loop, scrolling gut, sprite placement, and debug collision visualization in one lightweight renderer. The original 360×640 composition is scaled uniformly to cover the visible mobile viewport, avoiding image distortion.
- **Layers and playfield:** `bg.jpg` is the full-screen base. The playfield top and bottom are measured from the transparent alpha bounds of `border.png` at the player's x-position. `bg_texture.png` remains a transparent overlay. The scrolling `gameplay.png` strip uses its original 50%-sized export at y=0 and is clipped to the playfield plus the frame bleed; the frame is rendered above it. Player and sprites stay within the measured field.
- **Obstacle run:** Six bacteria and nine text sprites are collidable hazards with inset ellipse hit areas that ignore transparent padding. Text sprites are rendered at 72% of their intended half-size and use smaller hitboxes to keep the added challenge fair. Two randomized bacteria use middle-height lanes while the others stay near the upper/lower edges. The run ends when the single gameplay strip's right edge reaches the viewport edge; the strip is never tiled or looped.
- **Audio:** Original supplied MP3s are loaded only when needed. Music loops during play; crash and endcard sounds play on results. A centered speaker-only mute control below the logo area updates every sound, and audio pauses when the document is hidden.
- **Responsive layout:** The 360×640 logical stage uses a uniform fit scale to avoid stretching or cropping any campaign artwork. The matching navy background fills any excess viewport space.
- **Weight:** Original supplied media remains unchanged. The full asset folder is about 2.49 MB, so the project stays under the 3 MB limit without re-encoding campaign art or audio.
- **Debug and accessibility:** `?debug=1` draws the inset collision areas; keyboard jump support, reduced-motion handling for decorative movement, and live status text are included.

# Implementation decisions for Variant B

- Each creative uses its own background (`assets/left/bg.jpg`, `assets/top/bg.jpg` or `assets/right/bg.jpg`) sized to 100% × 100% of its ad. This uses the provided pre-cut assets and preserves their intended composition.
- Rendered each 2x overlay at its intended half-size. Full-canvas logo, copy and panel overlays retain their original coordinates, while the CTA is centered above the panel.
- Applied screen blending to the supplied black-matte copy and panel PNGs so their black pixels do not obscure the continuous background.
- Raised the skyscraper CTA buttons to match the supplied layout. Added a mostly opaque blue backing beneath the box artwork so the moss does not show through the panel as strongly.
- Kept the three ad units as standalone HTML documents and added `preview.html` to host them in a matching composition. A small message from the preview starts their animations together.
- Matched the preview stage to the 1684 × 1018 reference, including its gutters and central website area. `?debug=1` overlays the layout at 50% and freezes the creatives in their final state for alignment checks.
- Used CSS transform and opacity keyframes for the intro and calm loop. All motion ends after approximately 30 seconds; reduced-motion users see the final state immediately.
- Kept the product packs as part of their supplied background imagery rather than attempting to extract or redraw them.
- No assets were compressed or modified. The referenced asset payload is approximately 1.57 MiB; the combined background and design reference are excluded from the creative payload.
