import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export function ComingSoon({ title, desc }: { title: string; desc: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-[60vh] flex items-center justify-center"
    >
      <div className="text-center max-w-md p-10 rounded-3xl glass shadow-soft">
        <div className="mx-auto h-12 w-12 rounded-2xl bg-gradient-to-br from-coral to-electric flex items-center justify-center mb-4">
          <Sparkles className="h-5 w-5" />
        </div>
        <h1 className="font-display text-3xl tracking-tight">{title}</h1>
        <p className="text-muted-foreground mt-2 text-sm">{desc}</p>
        <button className="mt-6 px-5 py-2.5 rounded-full bg-foreground text-background text-sm font-medium">
          Notify me
        </button>
      </div>
    </motion.div>
  );
}
