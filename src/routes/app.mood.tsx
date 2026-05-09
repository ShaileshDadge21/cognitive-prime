import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/ComingSoon";

export const Route = createFileRoute("/app/mood")({
  component: () => <ComingSoon title="Mood module" desc="This neural module is calibrating to your behavioral signals. It will activate after 7 days of cognitive baselining." />,
});
