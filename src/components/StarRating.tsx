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
    <div className={`flex items-center gap-4 ${className}`}>
      <div
        className="flex items-center gap-1.5"
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
              whileTap={!readonly && !submitted ? { scale: 1.5, rotate: 15 } : {}}
              animate={isAnimated ? { scale: [1, 1.4, 1] } : { scale: 1 }}
              transition={isAnimated ? { delay: s * 0.05, duration: 0.4 } : {}}
              className={`transition-all duration-300 focus:outline-none ${
                readonly || submitted ? "cursor-default" : "cursor-pointer"
              }`}
              aria-label={`${s} star${s !== 1 ? "s" : ""}`}
            >
              <Star
                size={size}
                fill={filled ? "currentColor" : "none"}
                strokeWidth={filled ? 0 : 2}
                className={`transition-all duration-300 ${
                  filled
                    ? "text-[var(--m3-primary)] drop-shadow-lg"
                    : "text-[var(--m3-outline)] opacity-30"
                } ${
                  !readonly && !submitted && hovered >= s
                    ? "scale-110 opacity-100"
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
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--m3-primary)] italic"
          >
            {LABELS[active]}
          </motion.span>
        )}
      </AnimatePresence>

      {showCount && count > 0 && (
        <span className="text-[10px] font-black italic opacity-30 tracking-tighter uppercase font-mono">
          Reg: {count}
        </span>
      )}
    </div>
  );
}

/* Compact display-only version for cards */
export function StarDisplay({
  value,
  count,
  size = 14,
}: {
  value: number;
  count?: number;
  size?: number;
}) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-1">
        <Star size={size} fill="var(--m3-primary)" className="text-[var(--m3-primary)] drop-shadow-md" strokeWidth={0} />
        <span className="text-sm font-black text-[var(--m3-primary)] uppercase tracking-tighter">
          {value.toFixed(1)}
        </span>
      </div>
      <span className="text-[10px] font-black text-[var(--m3-on-surface-variant)] opacity-40 uppercase tracking-[0.2em] italic leading-none pt-0.5">
        Protocol Status
        {count !== undefined && count > 0 && (
          <span className="font-mono"> [{count}]</span>
        )}
      </span>
    </div>
  );
}
