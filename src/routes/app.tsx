import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { hasSession } from "@/lib/auth/session";

export const Route = createFileRoute("/app")({
  head: () => ({
    meta: [
      { title: "Dashboard · NeuroFlow AI" },
      { name: "description", content: "Your cognitive operating system." },
    ],
  }),
  beforeLoad: ({ location }) => {
    if (typeof window !== "undefined" && !hasSession()) {
      throw redirect({
        to: "/login",
        search: { redirect: location.pathname },
      });
    }
  },
  component: AppLayout,
});

function AppLayout() {
  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
}
