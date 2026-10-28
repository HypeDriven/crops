# StarHermit Crops

A procedural crop-field generator for winter wheat, two-row barley, maize, sunflower, and soybean with seasonal growth stages, coherent wind, and close-up botanical inspection.

## Run

Serve this repository's root with any static web server. For example:

```sh
python3 -m http.server 8000
```

Then open <http://localhost:8000>. The entry point is `index.html`; no package installation or build step is needed. The files can also be deployed directly to a static host.

For a single-file version, download [`standalone/StarHermit-Crops.html`](standalone/StarHermit-Crops.html) and open it in a modern browser. It embeds the scripts, styles, graphics dependencies, and license notices, and does not require a login or a network connection. HTML previewers may disable scripts, so use a browser rather than a document preview.

## Explore

- **Five crop studies:** winter wheat, two-row winter barley, grain maize, single-headed sunflower, and branched soybean. Select a crop in the field controls.
- **Seasons:** autumn-sown wheat and barley establish in autumn, overwinter vegetatively, extend in spring, and fill grain in summer. Spring-sown maize, sunflower, and soybean establish in spring and reproduce in summer; their autumn and winter scenes show cut, dead residue after harvest. These are temperate northern-climate study assumptions, not a planting calendar.
- **Field controls:** stand density, natural variation, seasonal progression, deterministic seed, wind speed, and wind direction.
- **Specimen inspection:** whole plant, reproductive structures, leaves, and exposed roots. Barley includes smooth clasping auricles and long awns; maize has a separate tassel view, silks, and an optional husk cutaway; sunflower has ray and disk florets and a spiral seed head; soybean has trifoliate leaves, axillary flowers, hairy pods, a pod cutaway, and root nodules. Taproot and fibrous-root architectures differ by crop.
- **Camera:** drag and scroll or pinch. `Space` pauses wind; `I` toggles specimen inspection. The portable renderer provides panning and zooming.
- **Capture:** save the rendered scene as a PNG.

The primary renderer uses Three.js and WebGL 2. When WebGL initialization is unavailable, a Canvas 2D renderer provides the field, seasonal controls, wind, and specimen views. The native preview environment used during development disabled WebGL; the portable renderer was browser-checked, and generated 3D mesh bounds and indices were checked separately. Hardware WebGL rendering remains to be verified on a capable device.

## Source layout

| Path | Purpose |
| --- | --- |
| `index.html` | Application entry point and botanical reference notes |
| `style.css` | Responsive interface styles |
| `app.js` | Procedural 3D geometry, instanced field, materials, wind, and controls |
| `fallback.js` | Portable Canvas renderer and controls |
| `crops.js` | Species profiles, phenology, anatomy labels, and camera targets |
| `crop-model.js` | 3D plant and root geometry for all five crops |
| `crop-canvas.js` | Portable drawing of the four additional crop types |
| `scripts/check-crops.mjs` | CPU geometry and portable-drawing regression checks |
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
node scripts/check-crops.mjs
```

The regression suite checks 160 crop, season, progression, and detail combinations; finite geometry and valid indices; deterministic generation; absence of living foliage or fruits on annual winter residue; root nodules; and maize and soybean cutaways. It also exercises the portable drawing routines without a GPU.

## Botanical scope

This is a botanically informed visual study of five representative crops. Wheat is an awned winter form of *Triticum aestivum*; barley is a long-awned, two-row winter form of *Hordeum vulgare*. Maize (*Zea mays*), sunflower (*Helianthus annuus*), and soybean (*Glycine max*) are represented as spring-sown annuals.

The crop models distinguish cereal spikelets and auricles, maize tassels and axillary ears, sunflower ray and disk florets and serrate leaves, and soybean compound leaves, papilionaceous flowers, pods, and nodulated taproots. The maize model uses a representative 14-row ear. Fine floret, seed, silk, hair, and nodule counts are illustrative samples rather than measured cultivar traits. Cutaways apply only to specimen inspection; the field retains closed husks and pods.

These are illustrative models rather than scanned cultivars, calibrated growth or mechanical simulations, or validated phenotyping instruments. Epidermal cells, stomata, internal tissues, and pollen grains are not resolved. Root inspection is truncated to approximately 45 cm; actual root systems may extend much deeper. Surface patterns and pubescence are procedural visual cues. Seasonal progression is an interpolation within the selected scene, not a crop forecast. Stand density is a visual plant count, not an agronomic yield model.

References are also available in the application's information dialog:

- [FAO: Botany of the wheat plant](https://www.fao.org/4/y4011e/y4011e05.htm)
- [Cornell CALS: Small-grain growth stages](https://cals.cornell.edu/field-crops/small-grains/growth-stages)
- [University of Minnesota Extension: Wheat growth and development](https://extension.umn.edu/agriculture/crop-production/small-grains/spring-wheat-growth-and-development-guide)
- [NDSU: Two-row barley](https://www.ndsu.edu/agriculture/ag-hub/publications/advanced-two-row-barley)
- [Purdue: Maize tassels and pollen](https://www.agry.purdue.edu/Ext/corn/news/timeless/Tassels.html)
- [University of Arizona: Corn growth and development](https://extension.arizona.edu/publication/corn-growth-and-development-stages)
- [NDSU: Sunflower production](https://www.ndsu.edu/agriculture/extension/publications/sunflower-production-guide)
- [Cornell: Sunflower leaf arrangement](https://cals.cornell.edu/weed-science/weed-profiles/common-sunflower)
- [Mississippi State: Soybean stages](https://extension.msstate.edu/publications/guide-soybean-growth-stages)
- [Penn State: Soybean nodulation](https://extension.psu.edu/evaluating-nodulation-in-soybeans)

## License

Copyright 2026 Hype Driven Development Inc.

StarHermit Crops uses the **PolyForm Noncommercial License 1.0.0 with the same additional permission as StarHermit Engine**. The additional permission allows commercial use to make, distribute, and run a game built with the software while that game is published on StarHermit.com, publicly playable there, and kept in running order there. See the complete terms in [`LICENSE`](LICENSE).

Third-party code retains its own licenses. Three.js and OrbitControls are MIT licensed; see [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md) and [`licenses/three.js-MIT.txt`](licenses/three.js-MIT.txt).
