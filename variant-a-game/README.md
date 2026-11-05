# Gut Run

A portrait mobile tap-to-jump game built with plain HTML, CSS and JavaScript. No build step or UI framework is required.

## Run locally

From this folder, run `node serve.js` and open <http://localhost:8000>.

## Controls

- Tap or click anywhere on the start screen to begin.
- Tap/click or press Space / ↑ to jump during the run.
- Use the sound toggle in the top-right to mute or unmute.
- On the fail card, use **Noch einmal spielen** to restart.
- Add `?debug=1` to the URL to show collision hitboxes.

The CTA opens `window.clickTag` in a new tab, falling back to the example landing URL when no click tag is supplied.

## Notes

- The supplied 2x campaign images are rendered at their intended half-size within a 360×640 design stage. The stage scales uniformly to fit the visible viewport without cropping; the matching navy page background fills any extra space on unusually tall phones.
- Each of the six bacteria hazards and nine text decorations appears once per run. Only bacteria use inset ellipse hit areas; text never triggers collisions.
- The supplied assets total about 2.49 MB, including the original audio and design references; no asset compression or removal was needed, keeping the project below 3 MB.
- The game uses a single animation loop that pauses with page visibility. Audio only starts after the first tap.

## Next steps / known shortcuts

- Tune the obstacle order and hitbox margins through playtesting on physical iOS and Android devices.
- Connect the click tag and campaign-specific CTA destination before delivery.
- On unusually tall phones the game artwork remains uncropped and centered, leaving additional navy background above/below the 360×640 composition.

## AI note

AI assistance was used to organize the implementation and check the supplied asset inventory. The first implementation assumption to correct was treating the gameplay art as a single 720px-wide scene; inspection showed it is a 5056×1280 scrolling strip, so the game now scrolls that full-width asset.