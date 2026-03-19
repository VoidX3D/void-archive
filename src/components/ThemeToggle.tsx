"use client";
import React from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "@/lib/theme";
import { motion, AnimatePresence } from "framer-motion";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, setTheme } = useTheme();

  const options: { value: "light" | "dark" | "system"; icon: React.ReactNode; label: string }[] = [
    { value: "light", icon: <Sun size={14} />, label: "Light" },
    { value: "system", icon: <Monitor size={14} />, label: "System" },
    { value: "dark", icon: <Moon size={14} />, label: "Dark" },
  ];

  return (
    <div
      className={`flex items-center gap-1 p-1 rounded-full bg-[var(--m3-surface-container-high)] border border-[var(--m3-outline)]/10 ${className}`}
      role="group"
      aria-label="Theme selector"
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => setTheme(opt.value)}
          aria-label={`${opt.label} theme`}
          aria-pressed={theme === opt.value}
          className={`relative flex items-center gap-1.5 px-4 py-2 rounded-full text-[11px] font-black transition-all duration-300 ${
            theme === opt.value
              ? "text-[var(--m3-primary)]"
              : "text-[var(--m3-on-surface-variant)] opacity-60 hover:opacity-100"
          }`}
        >
          {theme === opt.value && (
            <motion.div
              layoutId="theme-pill"
              className="absolute inset-0 bg-[var(--m3-surface-container-lowest)] rounded-full shadow-md border border-[var(--m3-outline)]/10"
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            />
          )}
          <span className="relative z-10">{opt.icon}</span>
          <span className="relative z-10 hidden sm:inline uppercase tracking-widest">{opt.label}</span>
        </button>
      ))}
    </div>
  );
}
