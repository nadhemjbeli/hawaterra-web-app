# HAWATERRA — Product Specification

## Mission

HAWATERRA is the digital infrastructure for a real, multi-crop experimental
farm. It combines plant records, cultivation experiments, environmental
monitoring, and — eventually — production and farm-business data into one
system the farmer actually uses day to day.

It is also a professional portfolio project — built to be genuinely used,
not a demo.

## Product identity

HAWATERRA is **not** a Dragon Fruit management application. Dragon Fruit is
one of several real experiments running on the farm and shows up prominently
in early data because it was the first crop tracked — but the product and
its architecture are crop-agnostic.

The farm includes, non-exhaustively: Dragon Fruit, Moringa, Ashwagandha,
Aloe vera, Passion Fruit, Tayberry, Kiwano, Guava, Pepino, other unusual
fruits, medicinal/aromatic plants, and future crops not yet known.

A concise public description:

> HAWATERRA is an experimental AgTech platform that combines multi-crop
> plant management, cultivation records, and environmental monitoring. It
> started as digital infrastructure for a real experimental farm and is
> designed to eventually connect plant history with IoT sensor data and
> production results.

## Core domain concepts

**Plant** — the central entity. Represents any individual plant of any
species/cultivar, tracked through its lifecycle (status: cutting → rooting →
growing → flowering → fruiting → dormant / stressed / sick / dead /
archived). Stays focused on identity and lifecycle basics — no crop-specific
fields (fruit weight, Brix, pollen donor, leaf yield, root weight, etc.)
belong on Plant.

**PlantSpecies / Cultivar** — shared reference taxonomy, not tied to any one
crop.

**Observation** — a generic, dated log entry against any plant (type:
general / growth / rooting / flowering / fruiting / pest / disease /
pruning / transplant / propagation / weather_damage). A "flowering"
observation on an Ashwagandha plant is exactly the same kind of record as
one on a Dragon Fruit — it does not imply a specialized
flowering/pollination subsystem.

**PlantPhoto** — photos attached to a plant, optionally to a specific
observation.

**Future specialized modules** (not built yet — see Roadmap): crop-specific
records such as fruit harvest / Brix / pollen donor for fruiting crops,
leaf/dry yield for Moringa, root harvest for Ashwagandha, and so on. These
will live in their own tables tied to Plant, not as columns bolted onto
Plant itself — the core Plant table must never become a giant crop-specific
table.

## Environmental monitoring / IoT (core future pillar)

```
REAL FARM → HAWATERRA SENSOR STATIONS → temperature / humidity / soil moisture
  → HAWATERRA backend → historical environmental data
  → farm dashboard / experiments / decisions
```

Sensor stations belong to a **location / growing area**, not to a single
plant — many plants can share one station's readings (e.g. `STATION-001 /
Experimental Patio`, `STATION-002 / Dragon Fruit Area`). Not implemented in
V0.1.

## HAWATERRA's pillars

1. **Farm** — real plants, real cultivation experiments.
2. **Software** — plant identity, observations, photos, history.
3. **Environment / IoT** — sensor stations measuring growing conditions.
4. **Data** — historical plant + environment + production information.
5. **Knowledge** — learning what practices, varieties, and conditions work best.

## Current status: V0.1 + V0.1A (implemented)

- Email/password authentication (single account, no signup UI)
- Species / Cultivar reference data, addable inline when creating a plant
- Plant CRUD (create, list, edit, detail view), browsable grouped by species
- Observations per plant
- Photo upload, gallery, lightbox, and deletion (private Supabase Storage)
- Farm Weather: regional current conditions + forecast (Open-Meteo)
- Mobile-first usability

See `ARCHITECTURE.md` for the full technical design.

## Roadmap

Directional — not permission to build ahead of schedule. V0.1–V0.6 are the
committed single-farm path. V0.7/V0.8 are a separate, explicitly
**conditional** branch — see the gates below each.

- **V0.1 — Core Plant Registry** ✅ done: plant registry, observations,
  photos (see Current status above).
- **V0.1A — External weather** ✅ done: farm location (server-side env
  config), Open-Meteo current conditions + forecast. No hardware — a cloud
  data source only.
- **V0.1B — IoT proof of concept**: one physical station (`STATION-001`,
  ESP32-based), temperature + humidity, authenticated POST ingestion,
  latest local reading displayed. Currently blocked on the physical ESP32
  hardware, not on software.
- **V0.2 — Environmental monitoring**: soil moisture, historical charts,
  device management, reliability improvements, and comparing local sensor
  readings against the V0.1A weather API baseline.
- **V0.3 — Farm activity**: watering, fertilization, propagation, activity
  history.
- **V0.4 — Reproduction / production records**: designed generically, with
  crop-specific capabilities where necessary — flowering, pollination where
  relevant, harvests, measurements, quality observations.
- **V0.5 — Farm economics**: expenses, costs, basic reports.
- **V0.6 — Public HAWATERRA**: farm/project homepage, experiments, journal,
  selected public results.

### V0.7/V0.8 — Multi-farm branch (conditional, not committed)

Only relevant if HAWATERRA is ever offered to farmers beyond the single
current account. Two separate concerns, deliberately not conflated:

- **V0.7 — Area/batch tracking (`GrowingUnit`)**: a new entity, a sibling
  to Plant rather than a replacement, for plot/block/field/row-level
  tracking — what large-scale farming actually needs, since nobody creates
  one Plant row per tree in a field of thousands. Plant can optionally
  belong to a GrowingUnit, so a farm can mix bulk area-tracking with a
  handful of individually-tracked prized specimens. Observations, photos,
  and V0.3's activity log can attach to a GrowingUnit instead of a Plant.
  Plant's own behavior is unchanged either way.
  **Gate**: do not design this speculatively. Only build it once a real
  farm (this one growing into it, or an actual prospective large-farm
  user) needs it — design it around that real case, not a guess.
- **V0.8 — Multi-farm / multi-tenant platform**: real account isolation so
  other farmers run their own HAWATERRA instance under their own login,
  instead of everything living under the single current account. This is
  the actual precondition for other farmers as customers/users — bigger
  and more consequential than any single feature above it.
  **Gate**: do not build until real prospective farmers (large or small)
  have confirmed they'd actually use and pay for this. Building
  multi-tenancy ahead of that validation means designing for a
  hypothetical customer — exactly what the project's own decision rule
  (useful this week over impressive but complicated) warns against.

## Explicit scope boundaries

Not implemented, and not to be implemented ahead of the roadmap above:
watering/fertilization systems, ESP32/sensor integration, environmental
charts, a dedicated flowering/pollination model, a fruit/harvest model,
expenses, a public farm journal, ecommerce, payments, multitenancy, AI,
microservices, Kubernetes.

Do not build infrastructure for these prematurely.
