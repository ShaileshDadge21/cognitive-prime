import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AuthShell } from "./login";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Create account · NeuroFlow AI" }, { name: "description", content: "Create your NeuroFlow AI account." }] }),
  component: Signup,
});

function Signup() {
  const navigate = useNavigate();
  return <AuthShell signup title="Create your mind OS" subtitle="Start your 14-day cognitive trial" cta="Create account" altLabel="Already have an account?" altHref="/login" altCta="Sign in" onSubmit={() => navigate({ to: "/app" })} />;
}
