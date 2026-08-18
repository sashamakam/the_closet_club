import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [room, setRoom] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !room.trim()) {
      setError("Both fields help your hostel-mates find and trust you.");
      return;
    }
    login(name, room);
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <p className="font-mono text-[11px] tracking-[0.3em] text-brass/80 uppercase mb-3">
            Members Only
          </p>
          <h1 className="font-display text-4xl text-parchment">The Closet Club</h1>
          <p className="mt-3 text-sm text-parchment/55">
            Borrow, lend, buy and sell clothes within your hostel.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-ink-panel border border-white/10 rounded-2xl p-7 shadow-soft"
        >
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-parchment/50 mb-2">
                Your name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ananya Rao"
                className="w-full bg-ink-plum border border-white/10 rounded-lg px-4 py-2.5 text-parchment placeholder-parchment/30 focus:border-brass outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-parchment/50 mb-2">
                Room number
              </label>
              <input
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                placeholder="e.g. B-204"
                className="w-full bg-ink-plum border border-white/10 rounded-lg px-4 py-2.5 text-parchment placeholder-parchment/30 focus:border-brass outline-none transition-colors"
              />
            </div>

            {error && <p className="text-sm text-blush">{error}</p>}

            <button
              type="submit"
              className="w-full bg-brass hover:bg-brass-light text-ink font-semibold rounded-lg py-2.5 transition-colors"
            >
              Enter the Club
            </button>
          </div>
        </form>

        <p className="text-center text-xs text-parchment/35 mt-6">
          Prototype login — no password needed yet.
        </p>
      </div>
    </div>
  );
}
