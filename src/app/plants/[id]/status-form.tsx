"use client";

import { useActionState } from "react";
import { motion } from "motion/react";
import { PLANT_STATUSES } from "@/lib/constants";
import type { PlantFormState } from "@/app/plants/actions";
import { Button } from "@/components/ui/button";
import { FieldGroup, FieldLabel, fieldSelectClassName } from "@/components/ui/field";

const initialState: PlantFormState = { error: null };

export function StatusForm({
  currentStatus,
  action,
}: {
  currentStatus: string;
  action: (
    prevState: PlantFormState,
    formData: FormData,
  ) => Promise<PlantFormState>;
}) {
  const [state, formAction, isPending] = useActionState(action, initialState);
  const justUpdated = state !== initialState && state.error === null;

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <div className="flex items-end gap-2">
        <FieldGroup className="flex-1">
          <FieldLabel htmlFor="status">Status</FieldLabel>
          <select
            id="status"
            name="status"
            defaultValue={currentStatus}
            className={`${fieldSelectClassName} capitalize`}
          >
            {PLANT_STATUSES.map((s) => (
              <option key={s} value={s} className="capitalize">
                {s}
              </option>
            ))}
          </select>
        </FieldGroup>
        <Button type="submit" variant="secondary" disabled={isPending}>
          {isPending ? "Updating…" : "Update"}
        </Button>
      </div>
      {justUpdated && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm font-medium text-success"
        >
          Status updated.
        </motion.p>
      )}
      {state.error && <p className="text-sm text-error">{state.error}</p>}
    </form>
  );
}
