"use client";
import React from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "@/lib/theme";
import { motion, AnimatePresence } from "framer-motion";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { resolvedTheme, theme, setTheme } = useTheme();

  const options: { value: "light" | "dark" | "system"; icon: React.ReactNode; label: string }[] = [
    { value: "light", icon: <Sun size={14} />, label: "Light" },
    { value: "system", icon: <Monitor size={14} />, label: "System" },
    { value: "dark", icon: <Moon size={14} />, label: "Dark" },
  ];

  return (
    <div
      className={`flex items-center gap-1 p-1 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)] ${className}`}
      role="group"
      aria-label="Theme selector"
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => setTheme(opt.value)}
          aria-label={`${opt.label} theme`}
          aria-pressed={theme === opt.value}
          className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all duration-200 ${
            theme === opt.value
              ? "text-[var(--primary)]"
              : "text-[var(--fg-muted)] hover:text-[var(--fg)]"
          }`}
        >
          {theme === opt.value && (
            <motion.div
              layoutId="theme-pill"
              className="absolute inset-0 bg-[var(--surface)] rounded-xl shadow-sm border border-[var(--border)]"
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            />
          )}
          <span className="relative z-10">{opt.icon}</span>
          <span className="relative z-10 hidden sm:inline">{opt.label}</span>
        </button>
      ))}
    </div>
  );
}
