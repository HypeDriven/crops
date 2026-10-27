# Third-party notices

## Three.js and OrbitControls

- Version: r170 (npm package `three@0.170.0`).
- Source: <https://github.com/mrdoob/three.js/tree/r170>.
- Files: `vendor/three.module.js` and `vendor/OrbitControls.js`.
- License: MIT. Full text: [`licenses/three.js-MIT.txt`](licenses/three.js-MIT.txt).
- Copyright © 2010–2024 three.js authors.

OrbitControls has one local modification: its import points to `./three.module.js` so no CDN or package manager is required at runtime. The standalone builder rewrites module locations to browser-created blob URLs and embeds the MIT license text.

The modular application's stylesheet requests DM Sans and Libre Caslon Display through Google Fonts. No font files are distributed in this repository. System-font fallbacks are provided; the standalone build removes the external font request.

The repository's first-party license does not replace the licenses of these third-party components.
