# Campaign Creative Projects

This repository contains two standalone campaign projects:

- **Variant A — Gut Run:** a mobile tap-to-jump game.
- **Variant B — Fireplace:** three coordinated desktop ads with a combined preview.

Both projects use plain HTML, CSS and JavaScript. No package installation or build step is required; install [Node.js](https://nodejs.org/) to run the local servers.

## Run locally

From the repository root, start either project:

```bash
npm run start_a
```

Open <http://localhost:8000> for Variant A, or run the following in a separate terminal for Variant B:

```bash
npm run start_b
```

Open <http://localhost:8001> to view the Fireplace preview. Add `?debug=1` to compare it with the supplied layout reference at 50% opacity:
<http://localhost:8001/?debug=1>

Each project also has its own README with additional controls and implementation notes.
