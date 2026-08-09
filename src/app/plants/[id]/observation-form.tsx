"use client";

import { useActionState, useEffect, useRef } from "react";
import { OBSERVATION_TYPES } from "@/lib/constants";
import type { ObservationFormState } from "./actions";
import { Button } from "@/components/ui/button";
import {
  FieldGroup,
  FieldLabel,
  FieldError,
  fieldInputClassName,
  fieldSelectClassName,
} from "@/components/ui/field";

const initialState: ObservationFormState = { error: null };

export function ObservationForm({
  action,
}: {
  action: (
    prevState: ObservationFormState,
    formData: FormData,
  ) => Promise<ObservationFormState>;
}) {
  const [state, formAction, isPending] = useActionState(
    action,
    initialState,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state !== initialState && state.error === null) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-3">
      <FieldGroup>
        <FieldLabel htmlFor="obs-type">Type</FieldLabel>
        <select
          id="obs-type"
          name="type"
          required
          defaultValue="general"
          className={`${fieldSelectClassName} capitalize`}
        >
          {OBSERVATION_TYPES.map((t) => (
            <option key={t} value={t} className="capitalize">
              {t.replace("_", " ")}
            </option>
          ))}
        </select>
      </FieldGroup>

      <FieldGroup>
        <FieldLabel htmlFor="obs-notes">Notes</FieldLabel>
        <textarea
          id="obs-notes"
          name="notes"
          rows={3}
          required
          placeholder="What did you see?"
          className={fieldInputClassName}
        />
      </FieldGroup>

      <FieldError>{state.error}</FieldError>

      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving…" : "Add observation"}
      </Button>
    </form>
  );
}
