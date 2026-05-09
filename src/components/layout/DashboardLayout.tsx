import { useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { AppTopbar } from "@/components/layout/AppTopbar";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const path = useRouterState({ select: (state) => state.location.pathname });

  return (
    <div className="min-h-screen flex">
      <AppSidebar
        collapsed={collapsed}
        path={path}
        onToggleCollapse={() => setCollapsed((value) => !value)}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        <AppTopbar
          mobileMenuOpen={mobileMenuOpen}
          onToggleMobileMenu={() => setMobileMenuOpen((value) => !value)}
          onCloseMobileMenu={() => setMobileMenuOpen(false)}
          path={path}
        />
        <motion.main
          key={path}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="flex-1 p-4 md:p-6 lg:p-8"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}
