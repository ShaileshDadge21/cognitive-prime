import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { requireAuthSession } from "@/lib/supabase/auth";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export const Route = createFileRoute("/app")({
  head: () => ({
    meta: [
      { title: "Dashboard · NeuroFlow AI" },
      { name: "description", content: "Your cognitive operating system." },
    ],
  }),
  beforeLoad: async ({ location }) => {
    // Only check auth on client side to avoid SSR issues
    if (typeof window === "undefined") {
      return;
    }

    if (!isSupabaseConfigured()) {
      return;
    }

    try {
      const session = await requireAuthSession();
      if (!session) {
        throw redirect({
          to: "/login",
          search: { redirect: location.pathname },
        });
      }
    } catch (error) {
      // If auth check fails, redirect to login
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
