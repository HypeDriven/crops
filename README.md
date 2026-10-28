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

## Developmental detail

Leaf dimensions, expansion, folding, droop, colour and senescence follow node rank, the crop, and the selected growth stage. Middle leaves can be larger than both older basal leaves and emerging apical leaves; position is not treated as a simple global random scale. Vegetative grass apices carry an emerging rolled whorl, vegetative sunflower tips carry folded young leaves, and growing soybean axes end in young trifoliates. Soybean represents an indeterminate form: main and branch internodes shorten toward the apex, and the uppermost trifoliate attaches within 2.2 mm of a compact terminal bud. After extension stops, that final leaf remains expanded beside the bud. Upper leaf and petiole dimensions follow developmental age; arrested growth does not remove the final leaf. Mature cereal spikes, maize tassels and sunflower heads terminate their respective shoots, without fictitious new leaves above them.

Sunflower heads use a curved receptacle with a closed back, a stage-dependent orientation, three imbricate rows of pointed bracts, five-lobed tubular disk florets, a centripetal flowering front, persistent wilting ray corollas, and elongated achenes at maturity. The cordate, serrate foliage has three basal primary veins and branching secondary veins.

Maize has an axillary ear on a shank, a closed tapered wrapping husk, visible silk and a smaller secondary ear shoot. The labelled cutaway removes a frontal husk sector to expose 14 paired kernel rows with 32 kernels per row; intact husks are checked to enclose the kernels.

Soybean close-ups use a continuous, gently compressed pod wall with dorsal and ventral sutures, a short pedicel and a tapered style remnant. The enclosed seeds are smooth and visible only in cutaway. Fine, short, tapered trichomes are attached to pod, stem, petiole and leaflet surfaces. Leaflets have entire margins, rounded bases, subtly asymmetric lateral blades, a longer terminal rachis, and subdued pinnate/reticulate venation. Pubescence density is a representative sample for rendering, not a measured cultivar trait.

Sunflower disks use tightly packed golden-angle units with receptacular paleae, closed central buds, five-lobed corollas, anther tubes and bifid styles at anthesis, spent outer florets, and compressed achenes at seed maturity. The ligules overlap at their broadest point; their width follows the head circumference and ray count. Head pitch, roll, size, floral detail and organ proportions vary with seed and developmental stage.

Within each plant, keyed, bounded multiplicative distributions vary organ length, width, depth, petiole length, curl, twist and gentle asymmetry. A branch-level vigour term correlates related organs; individual terms give each leaf, leaflet, ray, floret, spikelet, awn, pod, ear, kernel, root and nodule its own proportions. Node intervals are reweighted and normalized, preserving their order and axis endpoints. The final soybean leaf stays beside its terminal bud. Wider/thicker fruits share their dimensions with husks and seeds so variation does not expose enclosed kernels. Sunflower ray widths retain overlap even when neighboring ray lengths and spacing differ.

Organ randomness is keyed by plant seed, branch, organ type and rank. Detail level, draw order, and cutaway state do not reseed biological dimensions. The Natural variation control adjusts these organ-level distributions as well as field variation. They are plausible visual modelling distributions, not measured universal distributions for the species.

Across all five crops, bounded normal variates control modest plant lean and developmental spread; a shared vigour term correlates height and breadth. These size/age distributions are explicit visual modelling assumptions, not fitted agronomic data. Mature sunflower azimuth is centred on a common easterly bearing. At the default variation, its spread uses the approximately 42.8° pooled SD reported by Takács et al. (2022) for 2,800 heads in 14 plantations; that sample is not a universal cultivar distribution. The variation control narrows or widens the population. Ripening heads progressively droop. The scene is a fixed-time study, not a simulation of diurnal heliotropism.

Additional regression checks verify positional ageing, reproductive shoot termination, convergent blade tips, watertight culm ends, and husk containment. Software projections of the actual 3D meshes were inspected alongside the interactive portable views. Native WebGL rendering remains unverified in the preview environment.

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
- [Kew: Sunflower morphology](https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:119003-2/general-information)
- [Purdue: Maize ear development](https://agry.purdue.edu/Ext/corn/news/timeless/EarSize.html)
- [Purdue: Silk development](https://agry.purdue.edu/Ext/corn/news/timeless/Silks.html)
- [UMN: Corn leaf growth](https://extension.umn.edu/agriculture/crop-production/corn/growth-and-development)
- [UMN: Soybean leaf development](https://extension.umn.edu/agriculture/crop-production/soybean/soybean-growth-stages)
- [Cornell: Sunflower leaf arrangement](https://cals.cornell.edu/weed-science/weed-profiles/common-sunflower)
- [Mississippi State: Soybean stages](https://extension.msstate.edu/publications/guide-soybean-growth-stages)
- [Flora of China: Glycine max morphology](https://www.efloras.org/florataxon.aspx?flora_id=2&taxon_id=242323602)
- [CFIA: Soybean biology and trichomes](https://inspection.canada.ca/en/plant-varieties/plants-novel-traits/applicants/directive-94-08/biology-documents/glycine-max-merr)
- [Burke Herbarium / Flora of North America: Sunflower morphology](https://burkeherbarium.org/imagecollection/taxon.php?Taxon=Helianthus+annuus)
- [Atamian et al. 2016: Sunflower heliotropism](https://doi.org/10.1126/science.aaf9793)
- [Takács et al. 2022: Measured sunflower head orientation](https://doi.org/10.3389/fpls.2022.842560)
- [Penn State: Soybean nodulation](https://extension.psu.edu/evaluating-nodulation-in-soybeans)

## License

Copyright 2026 Hype Driven Development Inc.

StarHermit Crops uses the **PolyForm Noncommercial License 1.0.0 with the same additional permission as StarHermit Engine**. The additional permission allows commercial use to make, distribute, and run a game built with the software while that game is published on StarHermit.com, publicly playable there, and kept in running order there. See the complete terms in [`LICENSE`](LICENSE).

Third-party code retains its own licenses. Three.js and OrbitControls are MIT licensed; see [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md) and [`licenses/three.js-MIT.txt`](licenses/three.js-MIT.txt).
