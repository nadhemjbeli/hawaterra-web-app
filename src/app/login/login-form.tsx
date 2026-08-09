"use client";

import { useActionState } from "react";
import { signIn, type SignInState } from "./actions";
import { Button } from "@/components/ui/button";
import { FieldGroup, FieldLabel, FieldError, fieldInputClassName } from "@/components/ui/field";

const initialState: SignInState = { error: null };

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(signIn, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <FieldGroup>
        <FieldLabel htmlFor="email">Email</FieldLabel>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className={fieldInputClassName}
        />
      </FieldGroup>
      <FieldGroup>
        <FieldLabel htmlFor="password">Password</FieldLabel>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={fieldInputClassName}
        />
      </FieldGroup>
      <FieldError>{state.error}</FieldError>
      <Button type="submit" disabled={isPending}>
        {isPending ? "Logging in…" : "Log in"}
      </Button>
    </form>
  );
}
