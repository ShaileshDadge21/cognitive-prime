import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/ComingSoon";

export const Route = createFileRoute("/app/focus")({
  component: () => <ComingSoon title="Focus module" desc="This neural module is calibrating to your behavioral signals. It will activate after 7 days of cognitive baselining." />,
});
