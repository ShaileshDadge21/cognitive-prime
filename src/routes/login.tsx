import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Logo } from "@/components/Logo";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { authClient } from "@/lib/auth/client";
import * as React from "react";

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: typeof search.redirect === "string" ? search.redirect : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sign in · NeuroFlow AI" },
      { name: "description", content: "Sign in to NeuroFlow AI." },
    ],
  }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const search = Route.useSearch();

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to your cognitive workspace"
      cta="Sign in"
      altLabel="New here?"
      altHref="/signup"
      altCta="Create account"
      onSubmit={async ({ email, password }) => {
        await authClient.signIn({ email, password });
        const redirectTo = search.redirect?.startsWith("/app") ? search.redirect : "/app";
        navigate({ to: redirectTo });
      }}
    />
  );
}

export function AuthShell({
  title,
  subtitle,
  cta,
  altLabel,
  altHref,
  altCta,
  onSubmit,
  signup,
}: {
  title: string;
  subtitle: string;
  cta: string;
  altLabel: string;
  altHref: string;
  altCta: string;
  onSubmit: (values: { name?: string; email: string; password: string }) => void | Promise<void>;
  signup?: boolean;
}) {
  return (
    <div className="min-h-screen relative flex items-center justify-center px-6 py-12">
      <div className="absolute inset-0 grid-bg opacity-30 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
      <div className="absolute top-1/3 -left-20 h-80 w-80 rounded-full bg-coral/30 blur-3xl" />
      <div className="absolute bottom-1/4 -right-20 h-80 w-80 rounded-full bg-electric/30 blur-3xl" />

      <div className="absolute top-6 left-6">
        <Logo />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md p-8 rounded-3xl glass-strong shadow-elevated"
      >
        <h1 className="font-display text-3xl tracking-tight">{title}</h1>
        <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>

        <div className="mt-6 grid grid-cols-2 gap-2">
          <SocialBtn label="Google" />
          <SocialBtn label="Apple" />
        </div>
        <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
          <div className="flex-1 h-px bg-white/10" /> or continue with email{" "}
          <div className="flex-1 h-px bg-white/10" />
        </div>

        <AuthForm signup={signup} onSubmit={onSubmit} cta={cta} />

        <div className="mt-6 text-sm text-center text-muted-foreground">
          {altLabel}{" "}
          <Link to={altHref} className="text-coral hover:underline">
            {altCta}
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

function AuthForm({
  signup,
  cta,
  onSubmit,
}: {
  signup?: boolean;
  cta: string;
  onSubmit: (values: { name?: string; email: string; password: string }) => void | Promise<void>;
}) {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        await onSubmit({ name: signup ? name : undefined, email, password });
      }}
      className="space-y-3"
    >
      {signup && (
        <Field
          label="Name"
          type="text"
          placeholder="Ada Lovelace"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      )}
      <Field
        label="Email"
        type="email"
        placeholder="you@neuroflow.ai"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <Field
        label="Password"
        type="password"
        placeholder="••••••••"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button
        type="submit"
        className="w-full mt-2 py-3 rounded-xl bg-foreground text-background font-medium flex items-center justify-center gap-2 hover:scale-[1.01] transition"
      >
        {cta} <ArrowRight className="h-4 w-4" />
      </button>
    </form>
  );
}

function Field({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <div className="text-xs text-muted-foreground mb-1.5">{label}</div>
      <input
        {...props}
        className="w-full px-4 py-3 rounded-xl bg-surface/60 border border-white/10 focus:border-coral/60 focus:outline-none focus:ring-2 focus:ring-coral/20 transition text-sm"
      />
    </label>
  );
}

function SocialBtn({ label }: { label: string }) {
  return (
    <button className="py-2.5 rounded-xl glass text-sm hover:bg-white/5 transition">
      Continue with {label}
    </button>
  );
}
