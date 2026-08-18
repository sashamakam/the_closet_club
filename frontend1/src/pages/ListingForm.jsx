import React, { useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../api.js";
import { UploadCloud, Loader2 } from "lucide-react";

const CATEGORIES = ["Tops", "Bottoms", "Shoes", "Accessories"];
const CONDITIONS = ["Like new", "Gently used", "Well loved"];

export default function ListingForm() {
  const { mode } = useParams(); // "lend" | "sell"
  const isLend = mode === "lend";
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [price, setPrice] = useState("");
  const [returnByDays, setReturnByDays] = useState("3");
  const [condition, setCondition] = useState(CONDITIONS[0]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleFile = (file) => {
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) return setError("Give your item a name.");
    if (!imageFile) return setError("A photo helps people trust what they're getting.");
    if (!price || Number(price) <= 0) return setError("Enter a valid price.");

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("owner_name", user.name);
      formData.append("owner_room", user.room);
      formData.append("item_type", isLend ? "borrow" : "buy");
      formData.append("category", category);
      formData.append("price", price);
      if (isLend) formData.append("return_by_days", returnByDays);
      if (!isLend) formData.append("condition", condition);
      formData.append("image", imageFile);

      const created = await api.createItem(formData);
      navigate(`/item/${created.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-5 sm:px-8 py-12">
      <p className="font-mono text-[11px] tracking-[0.3em] text-brass/80 uppercase mb-3">
        {isLend ? "New listing · Lend" : "New listing · Sell"}
      </p>
      <h1 className="font-display text-3xl sm:text-4xl text-parchment mb-8">
        {isLend ? "Put a piece up for lending" : "List an item for sale"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Image upload */}
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-parchment/50 mb-2">
            Photo
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full aspect-[4/3] rounded-2xl border border-dashed border-white/15 hover:border-brass/50 bg-ink-panel flex items-center justify-center overflow-hidden transition-colors"
          >
            {imagePreview ? (
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <div className="text-center text-parchment/40">
                <UploadCloud className="mx-auto mb-2" size={26} strokeWidth={1.5} />
                <p className="text-sm">Tap to upload image</p>
              </div>
            )}
          </button>
        </div>

        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-parchment/50 mb-2">
            Item name
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Black satin slip dress"
            className="w-full bg-ink-panel border border-white/10 rounded-lg px-4 py-2.5 text-parchment placeholder-parchment/30 focus:border-brass outline-none transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-parchment/50 mb-2">
            Category
          </label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={`px-3.5 py-1.5 rounded-full text-sm border transition-colors ${
                  category === c
                    ? "bg-lilac/20 text-lilac border-lilac/40"
                    : "border-white/10 text-parchment/50 hover:border-lilac/30"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-parchment/50 mb-2">
              {isLend ? "Rent / day (₹)" : "Price (₹)"}
            </label>
            <input
              type="number"
              min="1"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="e.g. 50"
              className="w-full bg-ink-panel border border-white/10 rounded-lg px-4 py-2.5 text-parchment placeholder-parchment/30 focus:border-brass outline-none transition-colors"
            />
          </div>

          {isLend ? (
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-parchment/50 mb-2">
                Return within (days)
              </label>
              <input
                type="number"
                min="1"
                value={returnByDays}
                onChange={(e) => setReturnByDays(e.target.value)}
                className="w-full bg-ink-panel border border-white/10 rounded-lg px-4 py-2.5 text-parchment focus:border-brass outline-none transition-colors"
              />
            </div>
          ) : (
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-parchment/50 mb-2">
                Condition
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full bg-ink-panel border border-white/10 rounded-lg px-4 py-2.5 text-parchment focus:border-brass outline-none transition-colors"
              >
                {CONDITIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="text-xs text-parchment/40 font-mono">
          Listed by {user?.name} · Room {user?.room}
        </div>

        {error && <p className="text-sm text-blush">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-brass hover:bg-brass-light disabled:opacity-60 text-ink font-semibold rounded-lg py-3 transition-colors flex items-center justify-center gap-2"
        >
          {submitting && <Loader2 className="animate-spin" size={16} />}
          {isLend ? "List for lending" : "List for sale"}
        </button>
      </form>
    </div>
  );
}
