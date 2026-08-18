import React from "react";
import { useNavigate } from "react-router-dom";
import StatusBadge from "./StatusBadge.jsx";

export default function ItemCard({ item }) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(`/item/${item.id}`)}
      className="group text-left bg-ink-panel border border-white/10 rounded-2xl overflow-hidden hover:border-brass/40 hover:shadow-glow transition-all duration-200 flex flex-col"
    >
      <div className="relative aspect-[4/5] bg-ink-plum overflow-hidden">
        <img
          src={item.image}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
        />
        <StatusBadge status={item.status} className="absolute top-3 left-3" />

        {/* category tag, bottom-right corner, hang-tag style */}
        <div className="absolute bottom-3 right-0">
          <span className="label-tag bg-brass text-ink font-mono text-[10px] uppercase tracking-wider font-semibold py-1 pl-3 pr-4 inline-block">
            {item.category}
          </span>
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-display text-lg text-parchment leading-snug">{item.title}</h3>
        </div>
        <p className="text-xs text-parchment/45 font-mono mb-3">
          Room {item.owner_room} · {item.owner_name}
        </p>
        <div className="mt-auto flex items-center justify-between">
          <span className="font-mono text-sm text-brass-light">
            {item.item_type === "borrow" ? `₹${item.price}/day` : `₹${item.price}`}
          </span>
          <span className="text-[11px] uppercase tracking-wider text-parchment/35 font-mono">
            {item.item_type === "borrow" ? "Borrow" : "Buy"}
          </span>
        </div>
      </div>
    </button>
  );
}
