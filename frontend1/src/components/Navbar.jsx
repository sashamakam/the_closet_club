import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { LogOut } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-ink/85 backdrop-blur">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="font-display text-xl tracking-wide text-parchment group-hover:text-brass-light transition-colors">
            The Closet Club
          </span>
        </Link>

        <div className="flex items-center gap-5">
          <Link
            to="/browse"
            className="hidden sm:inline text-sm font-medium text-parchment/70 hover:text-brass-light transition-colors"
          >
            Browse
          </Link>
          <div className="flex items-center gap-2 pl-4 border-l border-white/10">
            <div className="text-right leading-tight hidden sm:block">
              <p className="text-sm text-parchment/90 font-medium">{user?.name}</p>
              <p className="text-xs text-parchment/45 font-mono">Room {user?.room}</p>
            </div>
            <button
              onClick={() => {
                logout();
                navigate("/login");
              }}
              className="p-2 rounded-full text-parchment/50 hover:text-blush hover:bg-white/5 transition-colors"
              aria-label="Log out"
              title="Log out"
            >
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
