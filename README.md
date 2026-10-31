# StarHermit Crops

A procedural crop-field generator with 80 selectable studies: five detailed original crops and 75 regional crop forms, three for each of 25 geographic groups. Includes seasonal growth phases, coherent wind, and close-up botanical inspection.

## Run

Serve this repository's root with any static web server. For example:

```sh
python3 -m http.server 8000
```

Then open <http://localhost:8000>. The entry point is `index.html`; no package installation or build step is needed. The files can also be deployed directly to a static host.

For a single-file version, download [`standalone/StarHermit-Crops.html`](standalone/StarHermit-Crops.html) and open it in a modern browser. It embeds the scripts, styles, graphics dependencies, and license notices, and does not require a login or a network connection. HTML previewers may disable scripts, so use a browser rather than a document preview.

## Explore

- **Regional collection:** choose a region to see its three crop forms, or browse all 80 studies. Regional forms include grains, pulses, roots, vegetables, fibre crops, and perennial orchard and plantation crops. Regional names are descriptive crop forms, not named cultivars unless explicitly stated. The added studies use simplified procedural architecture shared between the 3D and portable renderers.
- **Five original crop studies:** winter wheat, two-row winter barley, grain maize, single-headed sunflower, and branched soybean. Select a crop in the field controls.
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
| `crop-model.js` | 3D plant and root geometry |
| `regional-crops.js` | 25 geographic groups, 75 regional forms, picker, and seasonal dimensions |
| `regional-plants.js` | Shared organ layouts and organ-following inspection targets |
| `reproductive-organs.js` | Species-aware flowers, pod valves, cotton seed/lint, capsules and fruit details |
| `crop-surfaces.js` | Surface categories and shared leaf/fruit shape functions |
| `plant-material.js` | Procedural PBR surface relief, roughness, transmitted light, and wind |
| `crop-canvas.js` | Portable drawing of original and regional crop forms |
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
node scripts/check-reproductive-organs.mjs
```

The regression suite checks 2,560 crop, season, progression, and detail combinations; 25 groups with exactly three regional entries each; perennial foliage and regional storage organs; finite geometry and valid indices; deterministic generation; absence of living foliage or fruits on annual winter residue; root nodules; and maize and soybean cutaways. It also exercises the portable drawing routines without a GPU. Browser checks cover all 75 regional selections, the region filter, mobile controls, and the standalone file. Representative regional specimens and the standalone build were also checked with Chrome’s software WebGL renderer; hardware GPU rendering remains unverified.

## Developmental detail

Regional reproductive close-ups now use shaped tissues and anatomical parts.
Legumes have continuous seed-bearing valves, two sutures, seed-fill bulges,
veins, persistent calyces/styles and species-dependent hairs. Their flowers
have a standard, two wings and a two-petal keel; faba flowers carry dark wing
blotches. Underground peanut pods have raised shell reticulation.

The Egyptian cotton model uses three seed-cotton locks, eight representative seeds per
lock, split recurved boll valves and persistent bracts. Each close-up lock
emits 3,200 curved fibre strands, rooted on the ellipsoidal seed surfaces, with
loose flyaway fibres. Small inner masses provide density beneath the fibre
coat. Field views use compact proxies and sparse fibres. The rendered strands
sample a much larger biological fibre population; their visible widths are
rendering approximations. Yellow flowers have a dark petal base, a staminal
column and three laciniate epicalyx bracts. Closed bolls precede lint exposure.

Poppy has four wrinkled petals, numerous stamens and a stigmatic disc retained
above the capsule. Potato has a fused five-lobed corolla and a yellow anther
cone. Flax, sesame, tobacco and perilla have their own floral/capsule forms.
Cereal hulls have shaped lemmas and paleas and exposed anthers near anthesis.
Orchard and plantation fruits have persistent calyces, ridges, scars, skin
details or husk fibres as appropriate. Inspection frames a complete reproductive
site, including petals or lint, and identifies its actual anatomical parts.

Construction references include [cotton fruit development](https://labs.plb.ucdavis.edu/rost/cotton/reproduction/frdevel.html),
[cotton seed fibres](https://sites.utexas.edu/cottongenomics/cotton-fiber-development/),
[Egyptian cotton morphology](https://powo.science.kew.org/taxon/urn%3Alsid%3Aipni.org%3Anames%3A559677-1/general-information),
[common-bean pod anatomy](https://pmc.ncbi.nlm.nih.gov/articles/PMC10255370/),
[poppy morphology](https://plantnet.rbgsyd.nsw.gov.au/cgi-bin/NSWfl.pl?lvl=in&name=Papaver~somniferum~subsp.+somniferum)
and [potato floral anatomy](https://solanaceaesource.myspecies.info/content/solanum-tuberosum).
Fine counts, surface relief and stage thresholds remain representative visual
models. `node scripts/check-reproductive-organs.mjs` checks regional stages,
seed/fibre attachment, pod walls, flower parts, framing and geometry budgets.
With `just up` running from the parent directory, browser checks are available
through `node scripts/check-reproductive-browser.cjs` and the same command with
`--portable`. These require Playwright and Chrome, check the standalone file,
and save representative close-up screenshots to a temporary directory.
`PLAYWRIGHT_MODULE`, `CHROME_PATH`, `CROPS_URL` and `ARTIFACT_DIR` can override
local dependency, server and output locations.

Regional growth now follows initiation rank on each parent axis. A smooth
expansion curve uses relative organ age; a separate rank envelope allows middle
leaves to be larger than early basal leaves. Petioles, compound rachises and
branches share that developmental state. Internode expansion lags blade
expansion, compressing growing shoot tips. Tree branches have their own node
sequence; palm leaflets inherit their frond's age rather than being treated as
separate leaves of different ages. Mature terminal crops complete upper-leaf
expansion; axillary-fruiting crops can retain a growing apex.

Orientations follow botanical arrangements before applying seeded, bounded
variation: grasses are two-ranked; olive, coffee and perilla have opposite
leaves; sesame switches from lower opposite to upper alternate foliage; tea
and cacao lateral shoots have alternate leaves. Each plant has an independent
azimuth. Young blades stand more upright and folded, while older blades spread
and droop. The same surface transform positions veins and inspection targets.
Growing axes end in folded leaves/buds, palm and vegetative banana spears, or
rosette hearts. Terminal inflorescences replace these growing tips; flowering
banana has a hanging peduncle. Dormancy retains buds and harvest retains cut
stubble.

These are representative developmental rules, not fitted growth-rate or angular
measurements for all 75 forms. The age units are relative plastochrons. The
approach is informed by [coordinated phytomer growth](https://pmc.ncbi.nlm.nih.gov/articles/PMC4217678/)
and [rank-dependent leaf size](https://www.cambridge.org/core/journals/journal-of-agricultural-science/article/new-empirical-equation-to-describe-the-vertical-leaf-distribution-profile-of-maize/B5FF7D2FC55B687E768634F6ACBE335F).
Arrangement references include [olive](https://powo.science.kew.org/taxon/urn%3Alsid%3Aipni.org%3Anames%3A610675-1/general-information),
[sesame](https://powo.science.kew.org/taxon/urn%3Alsid%3Aipni.org%3Anames%3A675971-1/general-information),
[tea](https://plants.ces.ncsu.edu/plants/camellia-sinensis/),
[cacao](https://www.nparks.gov.sg/florafaunaweb/flora/5/2/5241)
and [perilla](https://plants.ces.ncsu.edu/plants/perilla-frutescens/).
Follow [AGENTS.md](AGENTS.md) for future additions. Run
`node scripts/check-regional-growth.mjs` for age ordering, rank profiles,
phyllotaxis, rotated attachments, seasonal apices and unchanged layouts between
field and specimen detail.

Regional specimens have shaped and veined blades (including peltate taro, lobed and ruffled vegetables, serrated tea/perilla, and split banana margins), finer palm leaflets and trunk scars, grain hulls and panicle branchlets, tapered pods with sutures, fruit stalks and calyces, cotton lint lobes, and root branchlets and potato eyes. Foxtail, sorghum and pearl millet have different head outlines; teff uses smaller grain units. Leaf dimensions and primary organ placement remain stable between field and specimen detail. Field meshes sample dense grain populations and use fewer surface segments.

WebGL materials distinguish grass, broad and waxy leaves, grains, pods, bark, palm trunks, storage roots, fruit skin, petals, and lint. Procedural relief and roughness provide veins, pores, fibers, grain grooves and bark furrows; fine periodic patterns fade when smaller than a pixel. Thin foliage receives a restrained transmitted-light term. Wind bends surface normals with stems. Close-up relief is enabled in specimen mode, while field mode uses the lighter surface treatment. The Canvas renderer shares leaf and fruit shapes, raised-vein cues, and shaded organ contours, without GPU shaders. Organ close-ups follow an actual leaf, fruit, pod, or grain head rather than the nominal shoot tip.

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

The five original studies are botanically informed visual models. The 75 regional additions are simplified crop-form studies with representative organ layouts; tree and palm heights describe compact specimens. Seasonal scenes are illustrative phases, not local planting calendars. Tropical perennials retain foliage, deciduous trees shed leaves in the dormant phase, and harvested annuals show residue. Arctic entries refer to sheltered coastal gardens, including South Greenland, rather than all Arctic land.

Regional associations and crop diversity references: [European Parliament crop survey](https://www.europarl.europa.eu/RegData/etudes/STUD/2021/656330/EPRS_STU%282021%29656330%28ANN1%29_EN.pdf), [FAO millets](https://www.fao.org/millets-2023/about/), [FAO quinoa](https://www.fao.org/quinoa/en), [University of Hawaiʻi Pacific crops](https://pacific-crops.ctahr.hawaii.edu/pacific-crops/), [Trap Greenland agriculture](https://trap.gl/en/natur-og-landskab/kulturlandskaber/), [Greenland horticulture](https://trap.gl/en/natur-og-landskab/horticulture/), [NIAB Maris Otter characteristics](https://www.niab.com/uploads/files/winter_barley.pdf), and [FAO tropical crop systems](https://www.fao.org/4/s2022e/s2022e06.htm).

The original species profiles follow these assumptions: Wheat is an awned winter form of *Triticum aestivum*; barley is a long-awned, two-row winter form of *Hordeum vulgare*. Maize (*Zea mays*), sunflower (*Helianthus annuus*), and soybean (*Glycine max*) are represented as spring-sown annuals.

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

### Natural distribution and attachment review

Foliage now combines species-specific seeded shoot posture with individual blade
pitch, roll, twist, camber, sweep and asymmetry. Pairs keep their botanical
insertions but their blades have separate geometry. Branching herbs have lateral
leafy axes. Cacao uses a five-branch jorquette with secondary fan branches,
drooping flush leaves and pods on its older trunk. Grain spikelets, capsules,
palm fruits and banana hands have explicit connections to their parent axes.
Potato corollas spread outward around the terminal cluster. Pea flutter is reduced;
local leaf motion scales with blade length and development and stays pinned at
its insertion.

The [generated crop target plate](references/crop-realism-targets.png) was made
with built-in imagegen; its complete prompt is saved in
[the prompt record](references/generation-prompt.json). It guides visual review,
not anatomical measurements. The [procedural contact sheets](references/procedural-review/collection-01.png)
and `audit.json` in that directory cover all 80 presets. Regenerate them with
`node scripts/render-natural-review.cjs` while the local server is running;
`PLAYWRIGHT_MODULE`, `CHROME_PATH`, `REVIEW_URL` and `REVIEW_DIR` override tooling.
`node scripts/check-natural-layout.mjs` checks normalized blade geometry and
connections across 420 seeded layouts, including both ends of reproductive supports.

Reference principles: [leaf angle and display architecture](https://doi.org/10.1046/j.1469-8137.2003.00765.x),
[compound-leaf curvature](https://pmc.ncbi.nlm.nih.gov/articles/PMC7586739/),
[cacao branch dimorphism and flowering](https://link.springer.com/article/10.1186/s12870-021-02982-y),
[World Agroforestry cacao profile](https://apps.worldagroforestry.org/treedb2/speciesprofile.php?Spid=1641),
and [potato floral description](https://www.nparks.gov.sg/florafaunaweb/flora/6/4/6493).
Angular spreads and growth factors are representative modelling choices.

Winter-wheat attachment and stalk follow-up: `wheatSpikeLayout()` now supplies
both mesh and Canvas with a continuous rachis, short rachillae and supports that
meet each glume/floret's actual base. Curved petioles and flower/fruit stalks use
shared, fixed-sampling support paths; leaflets attach along the curved rachis.
Terminal clusters rise from a peduncle instead of flat, right-angle spokes.
Sparse cluster samples retain the same positions when detail increases.
Validate with `scripts/check-wheat-attachments.mjs`, `scripts/check-stalk-curves.mjs`
and `scripts/check-reproductive-browser.cjs --attachments` (also `--portable`).
Close-up review images are saved in `references/attachment-review/`.
