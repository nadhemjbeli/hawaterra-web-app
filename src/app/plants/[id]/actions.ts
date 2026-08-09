"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAuthedUser, createClient } from "@/lib/supabase/server";
import { OBSERVATION_TYPES } from "@/lib/constants";

const observationInputSchema = z.object({
  type: z.enum(OBSERVATION_TYPES, "Choose a type."),
  notes: z.string().trim().min(1, "Add a note."),
});

export type ObservationFormState = { error: string | null };

export async function createObservation(
  plantId: string,
  _prevState: ObservationFormState,
  formData: FormData,
): Promise<ObservationFormState> {
  const user = await requireAuthedUser();
  const parsed = observationInputSchema.safeParse(
    Object.fromEntries(formData),
  );

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("observation").insert({
    plant_id: plantId,
    user_id: user.id,
    type: parsed.data.type,
    notes: parsed.data.notes,
  });

  if (error) {
    return { error: "Could not save observation. Please try again." };
  }

  revalidatePath(`/plants/${plantId}`);
  return { error: null };
}

export type PhotoResult = { error: string | null };

export async function recordPlantPhoto(
  plantId: string,
  storagePath: string,
): Promise<PhotoResult> {
  const user = await requireAuthedUser();
  const supabase = await createClient();

  const { error } = await supabase.from("plant_photo").insert({
    plant_id: plantId,
    user_id: user.id,
    storage_path: storagePath,
  });

  if (error) {
    return { error: "Could not save photo. Please try again." };
  }

  revalidatePath(`/plants/${plantId}`);
  return { error: null };
}

export async function deletePlantPhoto(
  plantId: string,
  photoId: string,
  storagePath: string,
): Promise<PhotoResult> {
  await requireAuthedUser();
  const supabase = await createClient();

  const { error } = await supabase
    .from("plant_photo")
    .delete()
    .eq("id", photoId);

  if (error) {
    return { error: "Could not delete photo. Please try again." };
  }

  // Best-effort: the DB row is already gone either way, so a failure here
  // just leaves an orphaned file rather than surfacing an error to the user.
  await supabase.storage.from("plant-photos").remove([storagePath]);

  revalidatePath(`/plants/${plantId}`);
  return { error: null };
}
