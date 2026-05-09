import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/planner")({
  beforeLoad: () => {
    throw redirect({ to: "/app/planner" });
  },
});
