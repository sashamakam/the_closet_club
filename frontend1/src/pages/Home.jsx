import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { HandHeart, PackagePlus, ShoppingBag, Tag, LayoutGrid } from "lucide-react";

const tiles = [
  {
    key: "borrow",
    label: "Borrow",
    desc: "Need something just for a day or two?",
    icon: HandHeart,
    accent: "lilac",
    to: "/browse?type=borrow",
  },
  {
    key: "lend",
    label: "Lend",
    desc: "Let your wardrobe earn its keep.",
    icon: PackagePlus,
    accent: "mint",
    to: "/new/lend",
  },
  {
    key: "buy",
    label: "Buy",
    desc: "Pick up pieces your hostel-mates are selling.",
    icon: ShoppingBag,
    accent: "blush",
    to: "/browse?type=buy",
  },
  {
    key: "sell",
    label: "Sell",
    desc: "Clear space, make a little money.",
    icon: Tag,
    accent: "brass-light",
    to: "/new/sell",
  },
  {
    key: "browse",
    label: "Browse",
    desc: "See everything available right now.",
    icon: LayoutGrid,
    accent: "parchment",
    to: "/browse",
  },
];

const accentClasses = {
  lilac: "text-lilac group-hover:text-lilac",
  mint: "text-mint group-hover:text-mint",
  blush: "text-blush group-hover:text-blush",
  "brass-light": "text-brass-light group-hover:text-brass-light",
  parchment: "text-parchment/80 group-hover:text-parchment",
};

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-8 py-14">
      <div className="mb-12">
        <p className="font-mono text-[11px] tracking-[0.3em] text-brass/80 uppercase mb-3">
          Welcome back, {user?.name?.split(" ")[0]}
        </p>
        <h1 className="font-display text-4xl sm:text-5xl text-parchment leading-tight">
          What are you here for today?
        </h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {tiles.map((tile, idx) => {
          const Icon = tile.icon;
          const isLast = idx === tiles.length - 1;
          return (
            <button
              key={tile.key}
              onClick={() => navigate(tile.to)}
              className={`group text-left bg-ink-panel border border-white/10 rounded-2xl p-7 hover:border-brass/40 hover:shadow-glow transition-all duration-200 ${
                isLast ? "sm:col-span-2 lg:col-span-1" : ""
              }`}
            >
              <Icon className={`mb-5 ${accentClasses[tile.accent]} transition-colors`} size={26} strokeWidth={1.5} />
              <h2 className="font-display text-2xl text-parchment mb-1.5">{tile.label}</h2>
              <p className="text-sm text-parchment/50 leading-relaxed">{tile.desc}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
