"use client";

import { useActionState, useState } from "react";
import { PLANT_STATUSES, NEW_SPECIES_OPTION_VALUE } from "@/lib/constants";
import type { PlantFormState } from "@/app/plants/actions";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  FieldGroup,
  FieldLabel,
  FieldError,
  fieldInputClassName,
  fieldSelectClassName,
} from "@/components/ui/field";
import { buttonClassName } from "@/components/ui/button-styles";

type Species = { id: string; common_name: string };
type Cultivar = { id: string; species_id: string; name: string };

type PlantFormValues = {
  code: string;
  species_id: string;
  cultivar_id: string;
  source: string;
  acquired_at: string;
  planted_at: string;
  propagation_method: string;
  location: string;
  container_liters: string;
  status: string;
  notes: string;
};

const emptyValues: PlantFormValues = {
  code: "",
  species_id: "",
  cultivar_id: "",
  source: "",
  acquired_at: "",
  planted_at: "",
  propagation_method: "",
  location: "",
  container_liters: "",
  status: "growing",
  notes: "",
};

export function PlantForm({
  speciesList,
  cultivarList,
  action,
  defaultValues,
  submitLabel,
  cancelHref,
}: {
  speciesList: Species[];
  cultivarList: Cultivar[];
  action: (
    prevState: PlantFormState,
    formData: FormData,
  ) => Promise<PlantFormState>;
  defaultValues?: Partial<PlantFormValues>;
  submitLabel: string;
  cancelHref: string;
}) {
  const [state, formAction, isPending] = useActionState(action, {
    error: null,
  });
  const [speciesId, setSpeciesId] = useState(
    defaultValues?.species_id ?? emptyValues.species_id,
  );
  const isNewSpecies = speciesId === NEW_SPECIES_OPTION_VALUE;

  const availableCultivars = cultivarList.filter(
    (c) => c.species_id === speciesId,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <FieldGroup>
        <FieldLabel htmlFor="code">Code</FieldLabel>
        <input
          id="code"
          name="code"
          type="text"
          placeholder="e.g. MOR-001"
          required
          defaultValue={defaultValues?.code ?? emptyValues.code}
          className={fieldInputClassName}
        />
      </FieldGroup>

      <FieldGroup>
        <FieldLabel htmlFor="species_id">Species</FieldLabel>
        <select
          id="species_id"
          name="species_id"
          required
          value={speciesId}
          onChange={(e) => setSpeciesId(e.target.value)}
          className={fieldSelectClassName}
        >
          <option value="" disabled>
            Choose a species
          </option>
          {speciesList.map((s) => (
            <option key={s.id} value={s.id}>
              {s.common_name}
            </option>
          ))}
          <option value={NEW_SPECIES_OPTION_VALUE}>+ Add new species…</option>
        </select>
      </FieldGroup>

      {isNewSpecies && (
        <FieldGroup>
          <FieldLabel htmlFor="new_species_name">New species name</FieldLabel>
          <input
            id="new_species_name"
            name="new_species_name"
            type="text"
            required
            autoFocus
            placeholder="e.g. Kiwano"
            className={fieldInputClassName}
          />
        </FieldGroup>
      )}

      <FieldGroup>
        <FieldLabel htmlFor="cultivar_id">Cultivar (optional)</FieldLabel>
        <select
          id="cultivar_id"
          name="cultivar_id"
          defaultValue={defaultValues?.cultivar_id ?? emptyValues.cultivar_id}
          disabled={!speciesId}
          className={fieldSelectClassName}
        >
          <option value="">Unknown / not specified</option>
          {availableCultivars.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </FieldGroup>

      <FieldGroup>
        <FieldLabel htmlFor="status">Status</FieldLabel>
        <select
          id="status"
          name="status"
          required
          defaultValue={defaultValues?.status ?? emptyValues.status}
          className={`${fieldSelectClassName} capitalize`}
        >
          {PLANT_STATUSES.map((s) => (
            <option key={s} value={s} className="capitalize">
              {s}
            </option>
          ))}
        </select>
      </FieldGroup>

      <FieldGroup>
        <FieldLabel htmlFor="propagation_method">
          Propagation method (optional)
        </FieldLabel>
        <input
          id="propagation_method"
          name="propagation_method"
          type="text"
          list="propagation-methods"
          defaultValue={
            defaultValues?.propagation_method ??
            emptyValues.propagation_method
          }
          className={fieldInputClassName}
        />
        <datalist id="propagation-methods">
          <option value="cutting" />
          <option value="seed" />
          <option value="division" />
          <option value="air layering" />
          <option value="tissue culture" />
          <option value="purchased" />
        </datalist>
      </FieldGroup>

      <FieldGroup>
        <FieldLabel htmlFor="container_liters">
          Container size, liters (optional)
        </FieldLabel>
        <input
          id="container_liters"
          name="container_liters"
          type="number"
          inputMode="decimal"
          min={0}
          step="0.1"
          defaultValue={
            defaultValues?.container_liters ?? emptyValues.container_liters
          }
          className={fieldInputClassName}
        />
      </FieldGroup>

      <div className="flex gap-3">
        <FieldGroup className="flex-1">
          <FieldLabel htmlFor="acquired_at">Acquired (optional)</FieldLabel>
          <input
            id="acquired_at"
            name="acquired_at"
            type="date"
            defaultValue={
              defaultValues?.acquired_at ?? emptyValues.acquired_at
            }
            className={fieldInputClassName}
          />
        </FieldGroup>
        <FieldGroup className="flex-1">
          <FieldLabel htmlFor="planted_at">Planted (optional)</FieldLabel>
          <input
            id="planted_at"
            name="planted_at"
            type="date"
            defaultValue={defaultValues?.planted_at ?? emptyValues.planted_at}
            className={fieldInputClassName}
          />
        </FieldGroup>
      </div>

      <FieldGroup>
        <FieldLabel htmlFor="source">Source (optional)</FieldLabel>
        <input
          id="source"
          name="source"
          type="text"
          placeholder="e.g. neighbor's garden, nursery"
          defaultValue={defaultValues?.source ?? emptyValues.source}
          className={fieldInputClassName}
        />
      </FieldGroup>

      <FieldGroup>
        <FieldLabel htmlFor="location">Location (optional)</FieldLabel>
        <input
          id="location"
          name="location"
          type="text"
          placeholder="e.g. back bed, greenhouse shelf 2"
          defaultValue={defaultValues?.location ?? emptyValues.location}
          className={fieldInputClassName}
        />
      </FieldGroup>

      <FieldGroup>
        <FieldLabel htmlFor="notes">Notes (optional)</FieldLabel>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          defaultValue={defaultValues?.notes ?? emptyValues.notes}
          className={fieldInputClassName}
        />
      </FieldGroup>

      <FieldError>{state.error}</FieldError>

      <div className="flex gap-3">
        <Link
          href={cancelHref}
          className={`${buttonClassName("secondary")} flex-1`}
        >
          Cancel
        </Link>
        <Button type="submit" disabled={isPending} className="flex-1">
          {isPending ? "Saving…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}
