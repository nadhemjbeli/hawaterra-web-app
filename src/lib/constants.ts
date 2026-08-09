// Keep in sync with the CHECK constraints in supabase/migrations — text +
// CHECK was chosen over a Postgres enum, so this is the single app-side
// source of truth for the allowed values.

export const PLANT_STATUSES = [
  "cutting",
  "rooting",
  "growing",
  "flowering",
  "fruiting",
  "dormant",
  "stressed",
  "sick",
  "dead",
  "archived",
] as const;

export type PlantStatus = (typeof PLANT_STATUSES)[number];

export const OBSERVATION_TYPES = [
  "general",
  "growth",
  "rooting",
  "flowering",
  "fruiting",
  "pest",
  "disease",
  "pruning",
  "transplant",
  "propagation",
  "weather_damage",
] as const;

export type ObservationType = (typeof OBSERVATION_TYPES)[number];

// Sentinel value for the "+ Add new species" option in the species select —
// shared between the client form and the server action so both agree on it.
export const NEW_SPECIES_OPTION_VALUE = "__new__";
