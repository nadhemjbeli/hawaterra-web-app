import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAuthedUser, createClient } from "@/lib/supabase/server";
import { updatePlantStatus } from "@/app/plants/actions";
import { createObservation } from "./actions";
import { ObservationForm } from "./observation-form";
import { ObservationList } from "./observation-list";
import { StatusForm } from "./status-form";
import { PhotoUploader } from "./photo-uploader";
import { PhotoGallery } from "./photo-gallery";
import { Card, cardClassName } from "@/components/ui/card";
import { buttonClassName } from "@/components/ui/button-styles";

const FIELD_LABELS: Record<string, string> = {
  source: "Source",
  location: "Location",
  propagation_method: "Propagation method",
  container_liters: "Container",
  acquired_at: "Acquired",
  planted_at: "Planted",
};

export default async function PlantDetailPage(
  props: PageProps<"/plants/[id]">,
) {
  const user = await requireAuthedUser();
  const { id } = await props.params;
  const supabase = await createClient();

  const { data: plant } = await supabase
    .from("plant")
    .select(
      "id, code, status, source, location, propagation_method, container_liters, acquired_at, planted_at, notes, plant_species(common_name), cultivar(name)",
    )
    .eq("id", id)
    .single();

  if (!plant) {
    notFound();
  }

  const { data: observations } = await supabase
    .from("observation")
    .select("id, type, notes, observed_at")
    .eq("plant_id", plant.id)
    .order("observed_at", { ascending: false });

  const { data: photoRows } = await supabase
    .from("plant_photo")
    .select("id, storage_path, caption")
    .eq("plant_id", plant.id)
    .order("created_at", { ascending: false });

  const photosWithNullableUrl = await Promise.all(
    (photoRows ?? []).map(async (photo) => {
      const { data } = await supabase.storage
        .from("plant-photos")
        .createSignedUrl(photo.storage_path, 3600);
      return { ...photo, url: data?.signedUrl ?? null };
    }),
  );
  const photos = photosWithNullableUrl.filter(
    (photo): photo is typeof photo & { url: string } => photo.url !== null,
  );

  const details: Array<[string, string]> = [
    ["source", plant.source ?? ""],
    ["location", plant.location ?? ""],
    ["propagation_method", plant.propagation_method ?? ""],
    [
      "container_liters",
      plant.container_liters != null ? `${plant.container_liters} L` : "",
    ],
    ["acquired_at", plant.acquired_at ?? ""],
    ["planted_at", plant.planted_at ?? ""],
  ].filter(([, value]) => value !== "") as Array<[string, string]>;

  return (
    <main className="mx-auto flex w-full max-w-sm flex-col gap-6 px-6 py-8">
      <Link
        href="/plants"
        className="flex w-fit items-center gap-1 text-sm font-medium text-ink-muted"
      >
        <span aria-hidden="true">←</span> All plants
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink">{plant.code}</h1>
          <p className="text-sm text-ink-muted">
            {plant.plant_species?.common_name}
            {plant.cultivar?.name ? ` · ${plant.cultivar.name}` : ""}
          </p>
        </div>
        <Link
          href={`/plants/${plant.id}/edit`}
          className={buttonClassName("secondary", "px-4 py-2 text-sm")}
        >
          Edit
        </Link>
      </div>

      <Card>
        <StatusForm
          key={plant.status}
          currentStatus={plant.status}
          action={updatePlantStatus.bind(null, plant.id)}
        />
      </Card>

      {details.length > 0 && (
        <dl className={`flex flex-col gap-2 ${cardClassName}`}>
          {details.map(([key, value]) => (
            <div key={key} className="flex justify-between gap-4 text-sm">
              <dt className="text-ink-muted">{FIELD_LABELS[key]}</dt>
              <dd className="text-right text-ink">{value}</dd>
            </div>
          ))}
        </dl>
      )}

      {plant.notes && (
        <div className="flex flex-col gap-1">
          <h2 className="text-sm font-medium text-ink-muted">Notes</h2>
          <p className="whitespace-pre-wrap text-base text-ink">
            {plant.notes}
          </p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-ink">Observations</h2>
        <ObservationForm action={createObservation.bind(null, plant.id)} />
        <ObservationList observations={observations ?? []} />
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-ink">Photos</h2>
        <PhotoUploader plantId={plant.id} userId={user.id} />
        <PhotoGallery plantId={plant.id} photos={photos} />
      </div>
    </main>
  );
}
