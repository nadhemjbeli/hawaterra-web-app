import Link from "next/link";
import { requireAuthedUser, createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/login/actions";
import { buttonClassName } from "@/components/ui/button-styles";
import { StatTile } from "@/components/ui/stat-tile";
import { StatusChart } from "@/components/status-chart";
import { PlantList } from "./plant-list";
import { SpeciesList } from "./species-list";

export default async function PlantsPage(props: PageProps<"/plants">) {
  await requireAuthedUser();
  const searchParams = await props.searchParams;
  const speciesFilterRaw = searchParams.species;
  const speciesFilter = Array.isArray(speciesFilterRaw)
    ? speciesFilterRaw[0]
    : speciesFilterRaw;
  const supabase = await createClient();

  const [{ data: plants, error }, { count: observationCount }] =
    await Promise.all([
      supabase
        .from("plant")
        .select(
          "id, code, status, species_id, plant_species(common_name), cultivar(name)",
        )
        .order("created_at", { ascending: false }),
      supabase
        .from("observation")
        .select("id", { count: "exact", head: true }),
    ]);

  const speciesGroups = new Map<
    string,
    { id: string; name: string; plants: NonNullable<typeof plants> }
  >();
  for (const plant of plants ?? []) {
    const key = plant.species_id;
    const existing = speciesGroups.get(key);
    if (existing) {
      existing.plants.push(plant);
    } else {
      speciesGroups.set(key, {
        id: key,
        name: plant.plant_species?.common_name ?? "Unknown species",
        plants: [plant],
      });
    }
  }
  const sortedGroups = Array.from(speciesGroups.values()).sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  const activeGroup = speciesFilter
    ? speciesGroups.get(speciesFilter)
    : undefined;

  const statusCounts: Partial<Record<string, number>> = {};
  for (const plant of plants ?? []) {
    statusCounts[plant.status] = (statusCounts[plant.status] ?? 0) + 1;
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-sm flex-col gap-6 px-6 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-ink">Plants</h1>
        <form action={signOut}>
          <button
            type="submit"
            className={buttonClassName("secondary", "px-4 py-2 text-sm")}
          >
            Log out
          </button>
        </form>
      </div>

      {error && <p className="text-sm text-error">Could not load plants.</p>}

      {!error && plants?.length === 0 && (
        <>
          <Link
            href="/plants/new"
            className={`${buttonClassName("primary")} active:scale-[0.97] transition-transform`}
          >
            + Add plant
          </Link>
          <p className="text-sm text-ink-muted">
            No plants yet. Add your first plant above.
          </p>
        </>
      )}

      {activeGroup ? (
        <>
          <Link
            href="/plants"
            className="flex w-fit items-center gap-1 text-sm font-medium text-ink-muted"
          >
            <span aria-hidden="true">←</span> All species
          </Link>
          <h2 className="text-xl font-semibold text-ink">
            {activeGroup.name}
          </h2>
          <Link
            href={`/plants/new?species=${activeGroup.id}`}
            className={`${buttonClassName("primary")} active:scale-[0.97] transition-transform`}
          >
            + Add {activeGroup.name} plant
          </Link>
          <PlantList plants={activeGroup.plants} />
        </>
      ) : (
        plants &&
        plants.length > 0 && (
          <>
            <div className="flex gap-3">
              <StatTile label="Plants" value={plants.length} />
              <StatTile
                label="Observations logged"
                value={observationCount ?? 0}
              />
            </div>

            <div className="flex flex-col gap-2 rounded-2xl border border-border bg-surface p-4 shadow-sm">
              <h2 className="text-sm font-medium text-ink-muted">
                Plants by status
              </h2>
              <StatusChart counts={statusCounts} />
            </div>

            <Link
              href="/plants/new"
              className={`${buttonClassName("primary")} active:scale-[0.97] transition-transform`}
            >
              + Add plant
            </Link>

            <h2 className="text-sm font-medium text-ink-muted">
              Browse by species
            </h2>
            <SpeciesList groups={sortedGroups} />
          </>
        )
      )}
    </main>
  );
}
