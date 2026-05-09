// src/components/tasks/AddTaskModal.tsx

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Brain, Timer, Flag, Layers3 } from "lucide-react";

export type TaskData = {
  id: string;
  title: string;
  energy: "Low" | "Medium" | "High";
  priority: "Low" | "Medium" | "High";
  duration: number;
  category: string;
};

type AddTaskModalProps = {
  open: boolean;
  onClose: () => void;
  onSave: (task: TaskData) => void;
};

const categories = ["Deep Work", "Learning", "Meetings", "Research", "Fitness", "Creative"];

export default function AddTaskModal({ open, onClose, onSave }: AddTaskModalProps) {
  const [title, setTitle] = useState("");
  const [energy, setEnergy] = useState<"Low" | "Medium" | "High">("Medium");
  const [priority, setPriority] = useState<"Low" | "Medium" | "High">("Medium");
  const [duration, setDuration] = useState(60);
  const [category, setCategory] = useState("Deep Work");

  const handleSave = () => {
    if (!title.trim()) return;

    const newTask: TaskData = {
      id: crypto.randomUUID(),
      title,
      energy,
      priority,
      duration,
      category,
    };

    onSave(newTask);

    setTitle("");
    setEnergy("Medium");
    setPriority("Medium");
    setDuration(60);
    setCategory("Deep Work");

    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ y: 40, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 30, opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#0B1020]/95 shadow-2xl backdrop-blur-xl"
          >
            {/* HEADER */}
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
              <div>
                <h2 className="text-2xl font-bold text-white">Create New Task</h2>
                <p className="text-sm text-gray-400 mt-1">Schedule around your cognitive peak.</p>
              </div>

              <button
                onClick={onClose}
                className="rounded-full bg-white/5 p-2 text-gray-400 hover:bg-white/10 hover:text-white transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* BODY */}
            <div className="space-y-5 px-6 py-6">
              {/* TITLE */}
              <div>
                <label className="mb-2 block text-sm text-gray-300">Task Title</label>

                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <Brain className="text-cyan-400" size={18} />

                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Deep learning revision..."
                    className="w-full bg-transparent text-white outline-none placeholder:text-gray-500"
                  />
                </div>
              </div>

              {/* ENERGY + PRIORITY */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* ENERGY */}
                <div>
                  <label className="mb-2 block text-sm text-gray-300">Energy Level</label>

                  <div className="flex gap-2">
                    {["Low", "Medium", "High"].map((level) => (
                      <button
                        key={level}
                        onClick={() => setEnergy(level as "Low" | "Medium" | "High")}
                        className={`flex-1 rounded-xl px-4 py-3 text-sm font-medium transition ${
                          energy === level
                            ? "bg-cyan-500 text-white"
                            : "bg-white/5 text-gray-400 hover:bg-white/10"
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                {/* PRIORITY */}
                <div>
                  <label className="mb-2 block text-sm text-gray-300">Priority</label>

                  <div className="flex gap-2">
                    {["Low", "Medium", "High"].map((level) => (
                      <button
                        key={level}
                        onClick={() => setPriority(level as "Low" | "Medium" | "High")}
                        className={`flex-1 rounded-xl px-4 py-3 text-sm font-medium transition ${
                          priority === level
                            ? "bg-pink-500 text-white"
                            : "bg-white/5 text-gray-400 hover:bg-white/10"
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* DURATION */}
              <div>
                <label className="mb-2 block text-sm text-gray-300">Estimated Duration</label>

                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <Timer className="text-violet-400" size={18} />

                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full bg-transparent text-white outline-none"
                  />

                  <span className="text-gray-400 text-sm">mins</span>
                </div>
              </div>

              {/* CATEGORY */}
              <div>
                <label className="mb-2 block text-sm text-gray-300">Task Category</label>

                <div className="grid grid-cols-2 gap-3">
                  {categories.map((item) => (
                    <button
                      key={item}
                      onClick={() => setCategory(item)}
                      className={`rounded-2xl border px-4 py-3 text-sm transition ${
                        category === item
                          ? "border-cyan-400 bg-cyan-500/20 text-cyan-300"
                          : "border-white/10 bg-white/5 text-gray-400 hover:bg-white/10"
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Layers3 size={16} />
                        {item}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* FOOTER */}
            <div className="flex items-center justify-end gap-3 border-t border-white/10 px-6 py-5">
              <button
                onClick={onClose}
                className="rounded-xl bg-white/5 px-5 py-3 text-gray-300 transition hover:bg-white/10"
              >
                Cancel
              </button>

              <button
                onClick={handleSave}
                className="rounded-xl bg-linear-to-r from-cyan-500 to-pink-500 px-6 py-3 font-semibold text-white shadow-lg transition hover:scale-[1.02]"
              >
                Save Task
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
