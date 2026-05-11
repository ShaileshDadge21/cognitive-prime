import { Link } from "@tanstack/react-router";

export function Logo({ to = "/" }: { to?: string }) {
  return (
    <Link to={to} className="flex items-center gap-2 group">
      <div className="relative h-8 w-8">
        <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-coral to-electric opacity-90 group-hover:opacity-100 transition" />
        <div className="absolute inset-[3px] rounded-md bg-background flex items-center justify-center">
          <div className="h-2 w-2 rounded-full bg-coral animate-pulse-glow" />
        </div>
      </div>
      <span className="font-display font-semibold tracking-tight">
        NeuroFlow<span className="text-coral">.AI</span>
      </span>
    </Link>
  );
}
