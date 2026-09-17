"use client";
import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "tab";
  active?: boolean;
  size?: "sm" | "md";
}

export function Button({
  variant = "ghost",
  active = false,
  size = "md",
  className = "",
  children,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-1.5 font-mono uppercase tracking-wide select-none transition duration-200 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber disabled:opacity-40 disabled:pointer-events-none";

  const sizes = {
    sm: "text-[10px] px-2.5 py-1 rounded-sm",
    md: "text-xs px-4 py-2 rounded-md"
  };

  const variants = {
    primary:
      "bg-amber text-white dark:bg-amber-bright dark:text-night hover:brightness-110 shadow-sm",
    ghost: active
      ? "bg-amber/15 text-amber dark:bg-amber-bright/15 dark:text-amber-bright border border-amber/40 dark:border-amber-bright/40"
      : "bg-paper-sunken text-ink-soft dark:bg-night-sunken dark:text-ink-onnightSoft border border-hairline dark:border-hairline-night hover:border-amber/60 dark:hover:border-amber-bright/60 hover:text-ink dark:hover:text-ink-onnight",
    tab: active
      ? "bg-amber text-white dark:bg-amber-bright dark:text-night shadow-sm"
      : "bg-transparent text-ink-soft dark:text-ink-onnightSoft hover:text-ink dark:hover:text-ink-onnight hover:bg-paper-sunken dark:hover:bg-night-sunken"
  };

  return (
    <button
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
