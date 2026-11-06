# Campaign Creative Projects

This repository contains two standalone campaign projects:

- **Variant A — Gut Run:** a mobile tap-to-jump game.
- **Variant B — Fireplace:** three coordinated desktop ads with a combined preview.

Both projects use plain HTML, CSS and JavaScript. No package installation or build step is required; install [Node.js](https://nodejs.org/) to run the local servers.

## Run locally

From the repository root, start either project:

Variant A - <http://localhost:8000>
```bash
npm run start_a
```

Variant B - <http://localhost:8001>
```bash
npm run start_b
```

Add `?debug=1` to enter debug mode.

## Future improvements

Variant A
- fine-tune the placement of obstacles.
- fine-tune collision boxes.
- optime graphics and audio

Variant B
- Verify the positioning accuracy within the target ad slots and across various browsers.
- Test the synchronization of animations once the creative is embedded on the publisher's site.
- Optimize asset file sizes and check quality following compression.

## Issues and shortcuts

The project was initially developed on a company laptop during a business trip. Unfortunately, due to an issue while transferring the project to my personal computer, the original Git commit history was not preserved. The repository therefore contains only the Git history from later point in history, rather than the full development history.

For variant B i noticed that bg-big.png uses totally different graphics than left,right & top assets and layout.png. if you add width if left, right and top sum is 3344 px rather than bg-big.png 3360px. Because of that i tried to create preview to match the design/layout.png. But i also created my preferred version in folder variant-b-fireplace_my_version. In my version, there are no gaps between the elements, and the background appears as one uniform image.

Variant B My Version - <http://localhost:8002>
```bash
npm run start_b_my_version
```

## AI Note

I used Github copilot. For Variant A it struggled with stacking order (z-index) do i changed it manually. Also the button for muting was added in wrong placed so i moved it to it's current place. For variant B it struggled with filling the size of the background images.