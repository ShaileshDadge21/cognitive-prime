import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/mood")({
  beforeLoad: () => {
    throw redirect({ to: "/app/mood" });
  },
});
