import { requireAuthedUser, createClient } from "@/lib/supabase/server";
import { createPlant } from "@/app/plants/actions";
import { PlantForm } from "./plant-form";

export default async function NewPlantPage(props: PageProps<"/plants/new">) {
  await requireAuthedUser();
  const searchParams = await props.searchParams;
  const speciesParam = searchParams.species;
  const preselectedSpeciesId = Array.isArray(speciesParam)
    ? speciesParam[0]
    : speciesParam;

  const supabase = await createClient();

  const [{ data: speciesList }, { data: cultivarList }] = await Promise.all([
    supabase.from("plant_species").select("id, common_name").order("common_name"),
    supabase.from("cultivar").select("id, species_id, name").order("name"),
  ]);

  return (
    <main className="mx-auto flex w-full max-w-sm flex-col gap-6 px-6 py-8">
      <h1 className="text-2xl font-semibold">Add plant</h1>
      <PlantForm
        speciesList={speciesList ?? []}
        cultivarList={cultivarList ?? []}
        action={createPlant}
        submitLabel="Add plant"
        cancelHref={
          preselectedSpeciesId
            ? `/plants?species=${preselectedSpeciesId}`
            : "/plants"
        }
        defaultValues={
          preselectedSpeciesId
            ? { species_id: preselectedSpeciesId }
            : undefined
        }
      />
    </main>
  );
}
