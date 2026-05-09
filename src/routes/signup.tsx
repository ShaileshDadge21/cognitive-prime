import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AuthShell } from "./login";
import { authClient } from "@/lib/auth/client";

export const Route = createFileRoute("/signup")({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: typeof search.redirect === "string" ? search.redirect : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Create account · NeuroFlow AI" },
      { name: "description", content: "Create your NeuroFlow AI account." },
    ],
  }),
  component: Signup,
});

function Signup() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  return (
    <AuthShell
      signup
      title="Create your mind OS"
      subtitle="Start your 14-day cognitive trial"
      cta="Create account"
      altLabel="Already have an account?"
      altHref="/login"
      altCta="Sign in"
      onSubmit={async ({ name, email, password }) => {
        await authClient.signUp({ name, email, password });
        const redirectTo = search.redirect?.startsWith("/app") ? search.redirect : "/app";
        navigate({ to: redirectTo });
      }}
    />
  );
}
