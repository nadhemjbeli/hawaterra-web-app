"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAuthedUser, createClient } from "@/lib/supabase/server";
import {
  PLANT_STATUSES,
  NEW_SPECIES_OPTION_VALUE,
  NEW_CULTIVAR_OPTION_VALUE,
} from "@/lib/constants";
import type { Database } from "@/lib/database.types";
import type { SupabaseClient } from "@supabase/supabase-js";

const plantInputSchema = z.object({
  code: z.string().trim().min(1, "Code is required."),
  species_id: z.string().trim().min(1, "Choose a species."),
  new_species_name: z.string().trim().default(""),
  cultivar_id: z.string().trim(),
  new_cultivar_name: z.string().trim().default(""),
  source: z.string().trim(),
  acquired_at: z.string().trim(),
  planted_at: z.string().trim(),
  propagation_method: z.string().trim(),
  location: z.string().trim(),
  container_liters: z.string().trim(),
  status: z.enum(PLANT_STATUSES, "Choose a status."),
  notes: z.string().trim(),
});

export type PlantFormState = { error: string | null };

type PlantRow = Database["public"]["Tables"]["plant"]["Insert"];

function nullable(value: string) {
  return value === "" ? null : value;
}

// Resolves the species select's value to a real plant_species.id — creating
// the row first if the user picked "+ Add new species". Reuses a matching
// existing species (case-insensitive) instead of creating a duplicate.
async function resolveSpeciesId(
  supabase: SupabaseClient<Database>,
  species_id: string,
  new_species_name: string,
): Promise<{ speciesId: string } | { error: string }> {
  if (species_id !== NEW_SPECIES_OPTION_VALUE) {
    return { speciesId: species_id };
  }

  if (!new_species_name) {
    return { error: "Enter a name for the new species." };
  }

  const { data: existing } = await supabase
    .from("plant_species")
    .select("id")
    .ilike("common_name", new_species_name)
    .maybeSingle();

  if (existing) {
    return { speciesId: existing.id };
  }

  const { data: created, error } = await supabase
    .from("plant_species")
    .insert({ common_name: new_species_name })
    .select("id")
    .single();

  if (error || !created) {
    return { error: "Could not create the new species. Please try again." };
  }

  return { speciesId: created.id };
}

// Same idea for cultivar, but scoped to the (already-resolved) species — a
// new cultivar is always created against that specific species, matching
// the plant.cultivar_id/species_id composite FK.
async function resolveCultivarId(
  supabase: SupabaseClient<Database>,
  cultivar_id: string,
  new_cultivar_name: string,
  speciesId: string,
): Promise<{ cultivarId: string | null } | { error: string }> {
  if (cultivar_id !== NEW_CULTIVAR_OPTION_VALUE) {
    return { cultivarId: nullable(cultivar_id) };
  }

  if (!new_cultivar_name) {
    return { error: "Enter a name for the new cultivar." };
  }

  const { data: existing } = await supabase
    .from("cultivar")
    .select("id")
    .eq("species_id", speciesId)
    .ilike("name", new_cultivar_name)
    .maybeSingle();

  if (existing) {
    return { cultivarId: existing.id };
  }

  const { data: created, error } = await supabase
    .from("cultivar")
    .insert({ species_id: speciesId, name: new_cultivar_name })
    .select("id")
    .single();

  if (error || !created) {
    return { error: "Could not create the new cultivar. Please try again." };
  }

  return { cultivarId: created.id };
}

function toPlantRow(
  parsed: z.infer<typeof plantInputSchema>,
  speciesId: string,
  cultivarId: string | null,
): { row: Omit<PlantRow, "user_id"> } | { error: string } {
  let containerLiters: number | null = null;
  if (parsed.container_liters !== "") {
    const n = Number(parsed.container_liters);
    if (!Number.isFinite(n) || n < 0) {
      return { error: "Container size can't be negative." };
    }
    containerLiters = n;
  }

  return {
    row: {
      code: parsed.code,
      species_id: speciesId,
      cultivar_id: cultivarId,
      source: nullable(parsed.source),
      acquired_at: nullable(parsed.acquired_at),
      planted_at: nullable(parsed.planted_at),
      propagation_method: nullable(parsed.propagation_method),
      location: nullable(parsed.location),
      container_liters: containerLiters,
      status: parsed.status,
      notes: nullable(parsed.notes),
    },
  };
}

function friendlyError(error: { code?: string } | null): string {
  if (error?.code === "23505") {
    return "You already have a plant with that code.";
  }
  return "Could not save plant. Please try again.";
}

export async function createPlant(
  _prevState: PlantFormState,
  formData: FormData,
): Promise<PlantFormState> {
  const user = await requireAuthedUser();
  const parsed = plantInputSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const supabase = await createClient();
  const speciesResult = await resolveSpeciesId(
    supabase,
    parsed.data.species_id,
    parsed.data.new_species_name,
  );
  if ("error" in speciesResult) {
    return { error: speciesResult.error };
  }

  const cultivarResult = await resolveCultivarId(
    supabase,
    parsed.data.cultivar_id,
    parsed.data.new_cultivar_name,
    speciesResult.speciesId,
  );
  if ("error" in cultivarResult) {
    return { error: cultivarResult.error };
  }

  const result = toPlantRow(
    parsed.data,
    speciesResult.speciesId,
    cultivarResult.cultivarId,
  );
  if ("error" in result) {
    return { error: result.error };
  }

  const { data, error } = await supabase
    .from("plant")
    .insert({ ...result.row, user_id: user.id })
    .select("id")
    .single();

  if (error || !data) {
    return { error: friendlyError(error) };
  }

  revalidatePath("/plants");
  redirect(`/plants/${data.id}`);
}

export async function updatePlant(
  plantId: string,
  _prevState: PlantFormState,
  formData: FormData,
): Promise<PlantFormState> {
  await requireAuthedUser();
  const parsed = plantInputSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const supabase = await createClient();
  const speciesResult = await resolveSpeciesId(
    supabase,
    parsed.data.species_id,
    parsed.data.new_species_name,
  );
  if ("error" in speciesResult) {
    return { error: speciesResult.error };
  }

  const cultivarResult = await resolveCultivarId(
    supabase,
    parsed.data.cultivar_id,
    parsed.data.new_cultivar_name,
    speciesResult.speciesId,
  );
  if ("error" in cultivarResult) {
    return { error: cultivarResult.error };
  }

  const result = toPlantRow(
    parsed.data,
    speciesResult.speciesId,
    cultivarResult.cultivarId,
  );
  if ("error" in result) {
    return { error: result.error };
  }

  const { error } = await supabase
    .from("plant")
    .update(result.row)
    .eq("id", plantId);

  if (error) {
    return { error: friendlyError(error) };
  }

  revalidatePath("/plants");
  revalidatePath(`/plants/${plantId}`);
  redirect(`/plants/${plantId}`);
}

export async function updatePlantStatus(
  plantId: string,
  _prevState: PlantFormState,
  formData: FormData,
): Promise<PlantFormState> {
  await requireAuthedUser();
  const status = PLANT_STATUSES.find((s) => s === formData.get("status"));

  if (!status) {
    return { error: "Choose a status." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("plant")
    .update({ status })
    .eq("id", plantId);

  if (error) {
    return { error: "Could not update status. Please try again." };
  }

  revalidatePath(`/plants/${plantId}`);
  revalidatePath("/plants");
  return { error: null };
}
