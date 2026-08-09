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

## Current status: V0.1 — Core Plant Registry (implemented)

- Email/password authentication (single account, no signup UI)
- Species / Cultivar reference data
- Plant CRUD (create, list, edit, detail view)
- Observations per plant
- Photo upload, gallery, and deletion (private Supabase Storage)
- Mobile-first usability

See `ARCHITECTURE.md` for the full technical design.

## Roadmap

Directional — not permission to build ahead of schedule.

- **V0.1 — Core Plant Registry** ✅ done: plant registry, observations,
  photos (see Current status above).
- **V0.1A — External weather**: farm location, weather API integration,
  current conditions, forecast. No hardware — a cloud data source only.
- **V0.1B — IoT proof of concept**: one physical station (`STATION-001`,
  ESP32-based), temperature + humidity, authenticated POST ingestion,
  latest local reading displayed.
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

## Explicit scope boundaries

Not implemented, and not to be implemented ahead of the roadmap above:
watering/fertilization systems, ESP32/sensor integration, environmental
charts, a dedicated flowering/pollination model, a fruit/harvest model,
expenses, a public farm journal, ecommerce, payments, multitenancy, AI,
microservices, Kubernetes.

Do not build infrastructure for these prematurely.
