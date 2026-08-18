import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../api.js";
import ItemCard from "../components/ItemCard.jsx";
import { Loader2 } from "lucide-react";

const CATEGORIES = ["Tops", "Bottoms", "Shoes", "Accessories"];
const TYPES = [
  { key: "", label: "All" },
  { key: "borrow", label: "Borrow" },
  { key: "buy", label: "Buy" },
];

export default function Browse() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeType = searchParams.get("type") || "";
  const activeCategory = searchParams.get("category") || "";

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    api
      .listItems({ item_type: activeType || undefined, category: activeCategory || undefined })
      .then(setItems)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [activeType, activeCategory]);

  const setType = (t) => {
    const next = new URLSearchParams(searchParams);
    if (t) next.set("type", t);
    else next.delete("type");
    setSearchParams(next);
  };

  const setCategory = (c) => {
    const next = new URLSearchParams(searchParams);
    if (c && c === activeCategory) next.delete("category");
    else if (c) next.set("category", c);
    else next.delete("category");
    setSearchParams(next);
  };

  const heading = useMemo(() => {
    if (activeType === "borrow") return "Borrow from the club";
    if (activeType === "buy") return "Buy from the club";
    return "Everything in the club";
  }, [activeType]);

  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-8 py-12">
      <div className="mb-8">
        <h1 className="font-display text-3xl sm:text-4xl text-parchment mb-6">{heading}</h1>

        <div className="flex flex-wrap items-center gap-2 mb-4">
          {TYPES.map((t) => (
            <button
              key={t.key}
              onClick={() => setType(t.key)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                activeType === t.key
                  ? "bg-brass text-ink border-brass"
                  : "border-white/15 text-parchment/60 hover:border-brass/40 hover:text-parchment"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-3.5 py-1 rounded-full text-xs font-mono uppercase tracking-wider border transition-colors ${
                activeCategory === c
                  ? "bg-lilac/20 text-lilac border-lilac/40"
                  : "border-white/10 text-parchment/40 hover:border-lilac/30 hover:text-lilac/80"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-24 text-parchment/40">
          <Loader2 className="animate-spin mr-2" size={18} />
          Fetching listings…
        </div>
      )}

      {error && (
        <div className="text-center py-24 text-blush">
          Couldn't reach the club's backend. Is the API running? ({error})
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="text-center py-24 border border-dashed border-white/10 rounded-2xl">
          <p className="font-display text-2xl text-parchment/70 mb-2">Nothing here yet.</p>
          <p className="text-sm text-parchment/40">
            Be the first to lend or sell something in this category.
          </p>
        </div>
      )}

      {!loading && !error && items.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
