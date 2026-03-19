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
                fill={filled ? "#FACC15" : "none"}
                className={`transition-all duration-150 ${
                  filled
                    ? "text-yellow-400 drop-shadow-[0_0_4px_rgba(250,204,21,0.6)]"
                    : "text-[var(--fg-subtle)]"
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
            className="text-[11px] font-black uppercase tracking-widest text-yellow-500"
          >
            {LABELS[active]}
          </motion.span>
        )}
      </AnimatePresence>

      {showCount && count > 0 && (
        <span className="text-[11px] font-bold text-[var(--fg-muted)]">
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
    <div className="flex items-center gap-1.5">
      <Star size={size} fill="#FACC15" className="text-yellow-400" />
      <span className="text-[11px] font-black text-[var(--fg-muted)]">
        {value.toFixed(1)}
        {count !== undefined && count > 0 && (
          <span className="font-medium"> ({count})</span>
        )}
      </span>
    </div>
  );
}
