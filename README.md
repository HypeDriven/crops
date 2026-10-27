# StarHermit Crops

A procedural winter-wheat field generator with seasonal growth stages, coherent wind, and close-up botanical inspection.

## Run

Serve this repository's root with any static web server. For example:

```sh
python3 -m http.server 8000
```

Then open <http://localhost:8000>. The entry point is `index.html`; no package installation or build step is needed. The files can also be deployed directly to a static host.

For a single-file version, download [`standalone/StarHermit-Crops.html`](standalone/StarHermit-Crops.html) and open it in a modern browser. It embeds the scripts, styles, graphics dependencies, and license notices, and does not require a login or a network connection. HTML previewers may disable scripts, so use a browser rather than a document preview.

## Explore

- **Seasons:** spring stem extension, summer grain filling and ripening, autumn establishment, and winter dormancy. This follows autumn-sown winter wheat in a temperate northern climate.
- **Field controls:** stand density, natural variation, seasonal progression, deterministic seed, wind speed, and wind direction.
- **Specimen inspection:** whole plant, ear, leaf and collar, and exposed fibrous roots, with anatomy labels and an option to isolate the main culm.
- **Camera:** drag and scroll or pinch. `Space` pauses wind; `I` toggles specimen inspection. The portable renderer provides panning and zooming.
- **Capture:** save the rendered scene as a PNG.

The primary renderer uses Three.js and WebGL 2. When WebGL initialization is unavailable, a Canvas 2D renderer provides the field, seasonal controls, wind, and specimen views. The native preview environment used during development disabled WebGL; the portable renderer was browser-checked, and generated 3D mesh bounds and indices were checked separately. Hardware WebGL rendering remains to be verified on a capable device.

## Source layout

| Path | Purpose |
| --- | --- |
| `index.html` | Application entry point and botanical reference notes |
| `style.css` | Responsive interface styles |
| `app.js` | Procedural 3D geometry, instanced field, materials, wind, and controls |
| `fallback.js` | Portable Canvas renderer |
| `vendor/` | Vendored Three.js r170 and OrbitControls |
| `scripts/build-standalone.py` | Rebuild the self-contained HTML distribution |
| `standalone/StarHermit-Crops.html` | Ready-to-open single-file distribution |

Rebuild the standalone distribution after editing source files:

```sh
python3 scripts/build-standalone.py
```

Check JavaScript syntax with Node.js:

```sh
node --check app.js
node --check fallback.js
```

## Botanical scope

This is a botanically informed visual study of an awned winter form of *Triticum aestivum*. The geometry represents alternating leaves, leaf sheaths, stem nodes, ligules and auricles, alternating spikelets with glumes and florets, lemma awns, and a branching root system.

It is an illustrative model rather than a scanned cultivar, a calibrated growth or mechanical simulation, or a validated phenotyping instrument. Epidermal cells, stomata, internal floral anatomy, and deep roots are not resolved. The root inspection volume is truncated to approximately 45 cm. Blade and bract surface patterns are procedural visual cues. Development varies with cultivar, location, and weather; the summer scene represents the crop before harvest.

References are also available in the application's information dialog:

- [FAO: Botany of the wheat plant](https://www.fao.org/4/y4011e/y4011e05.htm)
- [Cornell CALS: Small-grain growth stages](https://cals.cornell.edu/field-crops/small-grains/growth-stages)
- [University of Minnesota Extension: Wheat growth and development](https://extension.umn.edu/agriculture/crop-production/small-grains/spring-wheat-growth-and-development-guide)

## License

Copyright 2026 Hype Driven Development Inc.

StarHermit Crops uses the **PolyForm Noncommercial License 1.0.0 with the same additional permission as StarHermit Engine**. The additional permission allows commercial use to make, distribute, and run a game built with the software while that game is published on StarHermit.com, publicly playable there, and kept in running order there. See the complete terms in [`LICENSE`](LICENSE).

Third-party code retains its own licenses. Three.js and OrbitControls are MIT licensed; see [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md) and [`licenses/three.js-MIT.txt`](licenses/three.js-MIT.txt).
