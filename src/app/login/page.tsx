import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LoginForm } from "./login-form";
import { Card } from "@/components/ui/card";

export default async function LoginPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (data) {
    redirect("/plants");
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-sm flex-col justify-center gap-8 px-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold tracking-tight text-ink">
          HAWATERRA
        </h1>
        <p className="text-sm text-ink-muted">
          Experimental Farm &amp; Plant Lab
        </p>
      </div>
      <Card className="p-6">
        <LoginForm />
      </Card>
    </main>
  );
}
