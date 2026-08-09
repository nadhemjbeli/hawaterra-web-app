import { notFound } from "next/navigation";
import { requireAuthedUser, createClient } from "@/lib/supabase/server";
import { updatePlant } from "@/app/plants/actions";
import { PlantForm } from "@/app/plants/new/plant-form";

export default async function EditPlantPage(
  props: PageProps<"/plants/[id]/edit">,
) {
  await requireAuthedUser();
  const { id } = await props.params;
  const supabase = await createClient();

  const [{ data: plant }, { data: speciesList }, { data: cultivarList }] =
    await Promise.all([
      supabase.from("plant").select("*").eq("id", id).single(),
      supabase
        .from("plant_species")
        .select("id, common_name")
        .order("common_name"),
      supabase.from("cultivar").select("id, species_id, name").order("name"),
    ]);

  if (!plant) {
    notFound();
  }

  return (
    <main className="mx-auto flex w-full max-w-sm flex-col gap-6 px-6 py-8">
      <h1 className="text-2xl font-semibold">Edit {plant.code}</h1>
      <PlantForm
        speciesList={speciesList ?? []}
        cultivarList={cultivarList ?? []}
        action={updatePlant.bind(null, plant.id)}
        submitLabel="Save changes"
        cancelHref={`/plants/${plant.id}`}
        defaultValues={{
          code: plant.code,
          species_id: plant.species_id,
          cultivar_id: plant.cultivar_id ?? "",
          source: plant.source ?? "",
          acquired_at: plant.acquired_at ?? "",
          planted_at: plant.planted_at ?? "",
          propagation_method: plant.propagation_method ?? "",
          location: plant.location ?? "",
          container_liters:
            plant.container_liters != null
              ? String(plant.container_liters)
              : "",
          status: plant.status,
          notes: plant.notes ?? "",
        }}
      />
    </main>
  );
}
