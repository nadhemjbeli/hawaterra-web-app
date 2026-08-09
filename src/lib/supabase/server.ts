import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Database } from "@/lib/database.types";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component render, which can't write
            // cookies — proxy.ts refreshes the session for those requests.
          }
        },
      },
    },
  );
}

export type AuthedUser = {
  id: string;
  email: string | undefined;
};

/**
 * Verifies the session via getClaims() (local JWT verification) and redirects
 * to /login if there isn't a valid one. Call this at the top of every
 * protected Server Component and Server Action — proxy.ts only refreshes the
 * session cookie, it is not itself an authorization check.
 */
export async function requireAuthedUser(): Promise<AuthedUser> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data) {
    redirect("/login");
  }

  return { id: data.claims.sub, email: data.claims.email as string | undefined };
}
