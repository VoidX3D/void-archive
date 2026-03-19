"use client";
import React, { useState, useCallback } from "react";
import { Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const LABELS = ["", "Poor", "Fair", "Good", "Great", "Excellent"];

interface StarRatingProps {
  value: number;
  onChange: (val: number) => void;
  size?: number;
  readonly?: boolean;
  showLabel?: boolean;
  showCount?: boolean;
  count?: number;
  className?: string;
  submitted?: boolean;
}

export function StarRating({
  value,
  onChange,
  size = 20,
  readonly = false,
  showLabel = false,
  showCount = false,
  count = 0,
  className = "",
  submitted = false,
}: StarRatingProps) {
  const [hovered, setHovered] = useState(0);
  const active = hovered || value;

  const handleClick = useCallback(
    (val: number) => {
      if (!readonly && !submitted) onChange(val);
    },
    [readonly, submitted, onChange]
  );

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div
        className="flex items-center gap-0.5"
        onMouseLeave={() => setHovered(0)}
        aria-label={`Rating: ${value} of 5 stars`}
        role={readonly ? "img" : "group"}
      >
        {[1, 2, 3, 4, 5].map((s) => {
          const filled = s <= active;
          const isAnimated = s <= value && submitted;
          return (
            <motion.button
              key={s}
              type="button"
              disabled={readonly || submitted}
              onClick={() => handleClick(s)}
              onMouseEnter={() => !readonly && !submitted && setHovered(s)}
              whileTap={!readonly && !submitted ? { scale: 1.4, rotate: 15 } : {}}
              animate={isAnimated ? { scale: [1, 1.35, 1] } : { scale: 1 }}
              transition={isAnimated ? { delay: s * 0.07, duration: 0.3 } : {}}
              className={`transition-colors duration-150 focus:outline-none ${
                readonly || submitted ? "cursor-default" : "cursor-pointer"
              }`}
              aria-label={`${s} star${s !== 1 ? "s" : ""}`}
            >
              <Star
                size={size}
                fill={filled ? "var(--fg)" : "none"}
                className={`transition-all duration-150 ${
                  filled
                    ? "text-[var(--fg)] drop-shadow-[0_0_8px_rgba(0,0,0,0.2)] dark:drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]"
                    : "text-[var(--border)]"
                } ${
                  !readonly && !submitted && hovered >= s
                    ? "scale-110"
                    : ""
                }`}
              />
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {showLabel && active > 0 && (
          <motion.span
            key={active}
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 4 }}
            className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--fg)]"
          >
            {LABELS[active]}
          </motion.span>
        )}
      </AnimatePresence>

      {showCount && count > 0 && (
        <span className="text-[10px] font-black italic opacity-20 tracking-tighter">
          ({count})
        </span>
      )}
    </div>
  );
}

/* Compact display-only version for cards */
export function StarDisplay({
  value,
  count,
  size = 12,
}: {
  value: number;
  count?: number;
  size?: number;
}) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-3">
      <Star size={size} fill="var(--fg)" className="text-[var(--fg)] opacity-100 drop-shadow-[0_0_4px_rgba(0,0,0,0.1)]" />
      <span className="text-[10px] font-black text-[var(--fg-muted)] uppercase tracking-widest italic leading-none">
        {value.toFixed(1)} protocol
        {count !== undefined && count > 0 && (
          <span className="font-medium opacity-20"> ({count})</span>
        )}
      </span>
    </div>
  );
}
