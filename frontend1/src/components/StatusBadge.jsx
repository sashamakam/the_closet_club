import React from "react";

const config = {
  available: { label: "Available", dot: "bg-mint", text: "text-mint", border: "border-mint/30" },
  borrowed: { label: "Borrowed", dot: "bg-lilac", text: "text-lilac", border: "border-lilac/30" },
  sold: { label: "Sold", dot: "bg-blush", text: "text-blush", border: "border-blush/30" },
  returned: { label: "Returned", dot: "bg-brass-light", text: "text-brass-light", border: "border-brass/30" },
};

export default function StatusBadge({ status, className = "" }) {
  const c = config[status] || config.available;
  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full bg-ink/80 backdrop-blur border ${c.border} ${c.text} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}
