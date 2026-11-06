# Fireplace Ad

Three coordinated desktop creatives for the fireplace campaign, built with plain HTML, CSS and JavaScript.

## Run locally

Run `node serve.js` from this folder, then open <http://localhost:8001>. The preview is sized and positioned to match the supplied 1684 × 1018 layout reference, including labels for each creative. To compare it with the supplied layout at 50% opacity, open <http://localhost:8001/?debug=1> or <http://localhost:8001/preview.html?debug=1>.

The preview opens the top banner and both skyscrapers as separate documents. The individual production creatives are `top.html`, `left.html` and `right.html`.

## Notes

- The creatives use the provided 2x artwork at its intended CSS-pixel size. The preview scales the complete layout down to fit the available viewport without changing the creatives' internal dimensions.
- Each creative loads its own background from its matching asset folder: `assets/left/bg.jpg`, `assets/top/bg.jpg` or `assets/right/bg.jpg`. Each background is sized to 100% × 100% of its ad, matching the corresponding 2x dimensions.
- The skyscraper copy and panel PNGs use black mattes, so CSS screen blending removes the black while preserving their white and blue artwork.
- The CTA buttons are raised to match the supplied layout. An opaque blue backing under the box artwork reduces background show-through while retaining subtle moss texture.
- The referenced campaign assets total about 1.57 MiB; no compression or asset changes were needed. The combined `assets/bg-big.jpg` and design reference are not loaded by the creatives.
- Clickout opens `window.clickTag`, falling back to the exercise URL `https://example.com/landing`.
- The preview starts all three intros together. Each standalone creative starts on its own. Reduced-motion preferences show the final state without animation.

## Next steps / known shortcuts

- Verify each background fit in the live publisher ad slot, especially if production introduces different iframe dimensions.
- Replace the example click tag with the campaign destination before delivery.
- The product packs are part of the supplied background images, so they cannot animate independently from the moss. The background, logo, message, panel and CTA are animated instead.
- The supplied top headline artwork reads “STARK BEI HUSTENREIZ & HALSSCHMERZEN.”, while the layout reference shows “NATÜRLICH STARK BEI HUSTENREIZ & HALSSCHMERZEN.” Kept the provided artwork intact rather than redrawing its copy.
- The calming drift and CTA pulse stop after about 30 seconds; each creative then remains static.

## AI note

AI assistance was used to inspect the brief and assets and implement the creatives. One implementation detail needed correction: the original preview used a shared background instead of each creative's own background asset. The backgrounds now load from their matching asset folders and fill each ad.
