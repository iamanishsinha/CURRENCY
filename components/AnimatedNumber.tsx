"use client";
import React, { useEffect, useState, useRef } from "react";

interface AnimatedNumberProps {
  value: number;
  formatFn?: (val: number) => string;
  className?: string;
  prefix?: string;
  suffix?: string;
}

export function AnimatedNumber({
  value,
  formatFn,
  className = "",
  prefix = "",
  suffix = ""
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const [flash, setFlash] = useState<"gain" | "loss" | null>(null);
  const prevValueRef = useRef(value);

  useEffect(() => {
    if (value === prevValueRef.current) return;

    if (value > prevValueRef.current) {
      setFlash("gain");
    } else if (value < prevValueRef.current) {
      setFlash("loss");
    }

    prevValueRef.current = value;
    setDisplayValue(value);

    const timer = setTimeout(() => setFlash(null), 800);
    return () => clearTimeout(timer);
  }, [value]);

  const formatted = formatFn ? formatFn(displayValue) : displayValue.toLocaleString();

  const flashClass =
    flash === "gain"
      ? "text-teal dark:text-teal-bright transition-colors duration-300"
      : flash === "loss"
      ? "text-loss dark:text-loss-bright transition-colors duration-300"
      : "transition-colors duration-500";

  return (
    <span className={`tnum font-mono inline-flex items-baseline ${flashClass} ${className}`}>
      {prefix && <span className="opacity-80 text-[0.8em] mr-0.5">{prefix}</span>}
      <span>{formatted}</span>
      {suffix && <span className="opacity-80 text-[0.8em] ml-0.5">{suffix}</span>}
    </span>
  );
}
