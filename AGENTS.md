# Adding and changing crops

- Build biological layout in `regional-plants.js`; both mesh and Canvas rendering,
  veins and inspection framing must consume that same layout.
- Use initiation rank on the parent axis for age. Do not infer age from world
  height or treat each leaflet as a separate shoot node. Scale blades, petioles,
  rachises, branches and internodes from the same developmental state. Young
  internodes elongate later than blades; old basal leaves need not be largest.
- Choose species phyllotaxis first (two-ranked, spiral, opposite/decussate, or a
  documented transition). Apply a seeded plant phase and bounded local rotation,
  pitch and twist. Do not give every plant the same azimuth or scatter leaves
  uniformly at random in place of a botanical arrangement.
- End each living axis with its actual bud, folded leaves, spear, rosette heart
  or terminal inflorescence. Axillary fruits do not replace the shoot apex.
  Dormant buds and cut harvest stubble have different geometry.
- Derive attachments from emitted axes and transform veins, organ poles and
  inspection targets with their parent organ. Detail may change tessellation,
  never seeded dimensions, angles, age or attachment positions.
- Build reproductive tissues in `reproductive-organs.js` with stable parent-site
  identities. Use shaped petal/corolla surfaces, continuous pod walls and actual
  fibre curves for fuzzy structures. Keep filament, petal and seed randomness
  independent of how many samples the renderer emits.
- Root lint on the emitted seed surface. Give each organ its persistent calyx,
  bracts, sutures, style or fruit-wall structure where appropriate. Flower,
  closed-fruit and opened-fruit stages need distinct anatomy. Record species
  exceptions, including Egyptian cotton's three locks and poppy's four petals.
- Add new primitive types to both mesh and Canvas rendering. Reuse the same
  surface coordinates for veins, attached parts and inspection labels; frame
  the complete reproductive site including petals or flyaway fibres. Preserve
  the field mesh budget and update standalone module wiring for new files.
- Face flower inspection cameras along the selected corolla's axis. Review
  actual close-up images for fuzzy silhouettes, opaque inner proxy contours,
  hidden organs and overly wide framing; numerical mesh checks alone do not
  establish visual quality. Keep natural enclosing tissues around hidden organs.
- Treat relative plastochrons, growth curves and angular spreads as modelling
  assumptions until fitted to species measurements. Record primary references
  and species exceptions in the README when adding forms.
- Run `node scripts/check-reproductive-organs.mjs`,
  `node scripts/check-regional-growth.mjs`, `node scripts/check-crops.mjs`,
  and `python3 scripts/build-standalone.py`. Browser-check representative whole
  plants and shoot tips in both WebGL and Canvas, plus the standalone HTML.
  `scripts/check-reproductive-browser.cjs` provides representative reproductive
  views and a standalone smoke test; use `--portable` for the Canvas path.

- Review the reference plate and regenerate `scripts/render-natural-review.cjs`
  contact sheets before accepting foliage changes. Inspect every preset, then
  close-ups of representative simple, compound, grass and palm foliage. The
  generated plate is a visual target; use botanical sources for anatomy.
- Key variation by species, plant, parent axis, node and leaflet hand. Combine
  shoot posture with individual pitch, roll, twist, camber, sweep and asymmetry.
  A randomly rotated copy of an otherwise rigid compound leaf still looks tiled.
  Preserve biological pair/whorl insertions while varying the displayed blades.
- Model branching herbs with actual lateral shoots. Cacao needs an orthotropic
  trunk, jorquette fan branches, distichous lateral foliage and cauliflorous pods.
- Every reproductive source needs `supportAt` on an emitted parent axis. Extend
  its pedicel to its transformed tissue, including grains, capsules, palms and
  banana bunches. Test both ends; checking only that a stalk exists misses gaps.
- Local wind bends must be scaled to blade length and expansion and pinned at
  the insertion. Avoid a high-frequency sine along the leaf's UV length; it
  makes small upright leaves wiggle. Pea flutter is deliberately restrained.
- Run `node scripts/check-natural-layout.mjs` as well as the existing checks.
  Extra branching must respect mesh budgets; retain full cotton fibre detail
  by controlling representative boll count rather than coarsening the lint.

- Cover original builders as well as regional layouts in attachment regressions.
  The attachment check also covers original barley.
  Winter wheat uses `wheatSpikeLayout()` in mesh and Canvas; its rachilla must
  connect the rachis to every glume and floret at the emitted shell base.
- Use `stalkCurve()` for flower/fruit supports and petioles, preserving attachment
  knots. When a compound rachis curves, place its leaflets with `stalkPoint()`;
  interpolating the old straight segment leaves them floating. Keep supports
  independent of detail and sample sparse cluster organs from stable identities.
- Run `node scripts/check-wheat-attachments.mjs` and
  `node scripts/check-stalk-curves.mjs`. Browser-check `--attachments` in both
  WebGL and portable paths; inspect junctions from multiple angles.
