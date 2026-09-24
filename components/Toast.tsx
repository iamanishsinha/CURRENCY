"use client";
import { useRef, useState, useEffect } from "react";
import { AnimatePresence, m } from "framer-motion";

interface ToastMsg { id: number; text: string; type: "gain" | "loss" | "info"; }

type ToastListener = (msg: { text: string; type: ToastMsg["type"] }) => void;
const listeners = new Set<ToastListener>();

export const toast = {
  info: (text: string) => listeners.forEach((fn) => fn({ text, type: "info" })),
  gain: (text: string) => listeners.forEach((fn) => fn({ text, type: "gain" })),
  loss: (text: string) => listeners.forEach((fn) => fn({ text, type: "loss" }))
};

export function Toast() {
  const [msgs, setMsgs] = useState<ToastMsg[]>([]);
  const counterRef = useRef(0);

  useEffect(() => {
    const handler: ToastListener = ({ text, type }) => {
      const id = ++counterRef.current;
      setMsgs((prev) => [...prev.slice(-3), { id, text, type }]);
      setTimeout(() => setMsgs((prev) => prev.filter((m) => m.id !== id)), 4500);
    };
    listeners.add(handler);
    return () => {
      listeners.delete(handler);
    };
  }, []);

  const colors = {
    gain: "border-teal bg-teal/10 text-teal-bright",
    loss: "border-loss bg-loss/10 text-loss-bright",
    info: "border-amber bg-amber/10 text-amber dark:text-amber-bright"
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {msgs.map((msg) => (
          <m.div
            key={msg.id}
            initial={{ opacity: 0, x: 40, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className={`surface px-4 py-2.5 font-mono text-xs border ${colors[msg.type]} max-w-xs shadow-lg`}
          >
            {msg.text}
          </m.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
