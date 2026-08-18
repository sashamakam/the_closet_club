import React, { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../api.js";
import StatusBadge from "../components/StatusBadge.jsx";
import { ArrowLeft, Send, Clock, Check, Loader2 } from "lucide-react";

export default function ItemDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionBusy, setActionBusy] = useState(false);

  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const chatEndRef = useRef(null);

  const [slots, setSlots] = useState([]);
  const [slotInput, setSlotInput] = useState("");

  const isOwner = item && user && item.owner_name === user.name && item.owner_room === user.room;

  const loadItem = useCallback(() => {
    api.getItem(id).then(setItem).catch((e) => setError(e.message));
  }, [id]);

  const loadMessages = useCallback(() => {
    api.getMessages(id).then(setMessages).catch(() => {});
  }, [id]);

  const loadSlots = useCallback(() => {
    api.getTimeSlots(id).then(setSlots).catch(() => {});
  }, [id]);

  useEffect(() => {
    setLoading(true);
    Promise.all([api.getItem(id), api.getMessages(id), api.getTimeSlots(id)])
      .then(([i, m, s]) => {
        setItem(i);
        setMessages(m);
        setSlots(s);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  // light polling so both sides see chat/status updates without a refresh
  useEffect(() => {
    const interval = setInterval(() => {
      loadMessages();
      loadSlots();
      loadItem();
    }, 4000);
    return () => clearInterval(interval);
  }, [loadMessages, loadSlots, loadItem]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const runStatusChange = async (status) => {
    setActionBusy(true);
    try {
      const updated = await api.updateStatus(id, status, user.name);
      setItem(updated);
    } catch (e) {
      setError(e.message);
    } finally {
      setActionBusy(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    const text = messageText.trim();
    setMessageText("");
    try {
      const msg = await api.postMessage(id, user.name, text);
      setMessages((prev) => [...prev, msg]);
    } catch (e) {
      setError(e.message);
    }
  };

  const proposeSlot = async (e) => {
    e.preventDefault();
    if (!slotInput) return;
    const label = new Date(slotInput).toLocaleString([], {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
    try {
      const slot = await api.proposeTimeSlot(id, user.name, label);
      setSlots((prev) => [...prev, slot]);
      setSlotInput("");
    } catch (e) {
      setError(e.message);
    }
  };

  const acceptSlot = async (slotId) => {
    try {
      const updated = await api.acceptTimeSlot(id, slotId, user.name);
      setSlots((prev) => prev.map((s) => (s.id === slotId ? updated : s)));
    } catch (e) {
      setError(e.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32 text-parchment/40">
        <Loader2 className="animate-spin mr-2" size={18} />
        Loading listing…
      </div>
    );
  }

  if (error && !item) {
    return (
      <div className="max-w-xl mx-auto text-center py-32 text-blush">
        {error}
        <div className="mt-4">
          <Link to="/browse" className="text-brass-light underline">
            Back to Browse
          </Link>
        </div>
      </div>
    );
  }

  if (!item) return null;

  const isBorrowType = item.item_type === "borrow";

  return (
    <div className="max-w-4xl mx-auto px-5 sm:px-8 py-10">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-sm text-parchment/50 hover:text-brass-light mb-6 transition-colors"
      >
        <ArrowLeft size={15} /> Back
      </button>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Left: image + core info */}
        <div>
          <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-ink-panel border border-white/10">
            <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
            <StatusBadge status={item.status} className="absolute top-3 left-3" />
            <div className="absolute bottom-3 right-0">
              <span className="label-tag bg-brass text-ink font-mono text-[10px] uppercase tracking-wider font-semibold py-1 pl-3 pr-4 inline-block">
                {item.category}
              </span>
            </div>
          </div>
        </div>

        {/* Right: details, actions, timeslot */}
        <div>
          <p className="font-mono text-[11px] tracking-[0.3em] text-brass/80 uppercase mb-2">
            {isBorrowType ? "Available to Borrow" : "Available to Buy"}
          </p>
          <h1 className="font-display text-3xl text-parchment mb-3">{item.title}</h1>

          <p className="text-sm text-parchment/50 font-mono mb-5">
            Listed by {item.owner_name} · Room {item.owner_room}
          </p>

          <div className="flex items-baseline gap-3 mb-6">
            <span className="font-display text-3xl text-brass-light">
              ₹{item.price}
              {isBorrowType && <span className="text-base text-parchment/40">/day</span>}
            </span>
            {isBorrowType && (
              <span className="text-sm text-parchment/45">
                Return within {item.return_by_days} day{item.return_by_days == 1 ? "" : "s"}
              </span>
            )}
            {!isBorrowType && item.condition && (
              <span className="text-sm text-parchment/45">{item.condition}</span>
            )}
          </div>

          {item.status === "borrowed" && item.borrower_name && (
            <p className="text-sm text-lilac/80 mb-4">Currently with {item.borrower_name}</p>
          )}

          {/* Status actions */}
          <div className="flex flex-wrap gap-3 mb-8">
            {isBorrowType && item.status === "available" && !isOwner && (
              <button
                disabled={actionBusy}
                onClick={() => runStatusChange("borrowed")}
                className="bg-brass hover:bg-brass-light text-ink font-semibold rounded-lg px-5 py-2.5 transition-colors disabled:opacity-60"
              >
                I'm borrowing this
              </button>
            )}
            {isBorrowType && item.status === "borrowed" && (isOwner || item.borrower_name === user.name) && (
              <button
                disabled={actionBusy}
                onClick={() => runStatusChange("returned")}
                className="bg-mint/20 hover:bg-mint/30 text-mint border border-mint/30 font-semibold rounded-lg px-5 py-2.5 transition-colors disabled:opacity-60"
              >
                Mark as returned
              </button>
            )}
            {isBorrowType && item.status === "returned" && isOwner && (
              <button
                disabled={actionBusy}
                onClick={() => runStatusChange("available")}
                className="bg-white/5 hover:bg-white/10 text-parchment border border-white/15 font-semibold rounded-lg px-5 py-2.5 transition-colors disabled:opacity-60"
              >
                List as available again
              </button>
            )}
            {!isBorrowType && item.status === "available" && !isOwner && (
              <button
                disabled={actionBusy}
                onClick={() => runStatusChange("sold")}
                className="bg-brass hover:bg-brass-light text-ink font-semibold rounded-lg px-5 py-2.5 transition-colors disabled:opacity-60"
              >
                Mark as sold to me
              </button>
            )}
            {!isBorrowType && item.status === "sold" && isOwner && (
              <button
                disabled={actionBusy}
                onClick={() => runStatusChange("available")}
                className="bg-white/5 hover:bg-white/10 text-parchment border border-white/15 font-semibold rounded-lg px-5 py-2.5 transition-colors disabled:opacity-60"
              >
                Relist item
              </button>
            )}
            {isOwner && item.status === "available" && (
              <p className="text-sm text-parchment/40 self-center">
                This is your listing — waiting for someone from the club.
              </p>
            )}
          </div>

          {/* Time slot picker */}
          <div className="bg-ink-panel border border-white/10 rounded-2xl p-5 mb-6">
            <h3 className="font-display text-lg text-parchment mb-1 flex items-center gap-2">
              <Clock size={16} className="text-brass" />
              Pickup / return time
            </h3>
            <p className="text-xs text-parchment/40 mb-4">
              Suggest a time that works for {isOwner ? "the borrower" : "the lender"}.
            </p>

            <form onSubmit={proposeSlot} className="flex flex-col sm:flex-row gap-2 mb-4">
              <input
                type="datetime-local"
                value={slotInput}
                onChange={(e) => setSlotInput(e.target.value)}
                className="flex-1 bg-ink-plum border border-white/10 rounded-lg px-3 py-2 text-sm text-parchment focus:border-brass outline-none transition-colors"
              />
              <button
                type="submit"
                className="bg-white/5 hover:bg-white/10 border border-white/15 text-parchment text-sm font-medium rounded-lg px-4 py-2 transition-colors whitespace-nowrap"
              >
                Suggest time
              </button>
            </form>

            {slots.length === 0 ? (
              <p className="text-sm text-parchment/30">No times suggested yet.</p>
            ) : (
              <ul className="space-y-2">
                {slots.map((slot) => (
                  <li
                    key={slot.id}
                    className="flex items-center justify-between bg-ink-plum/60 rounded-lg px-3 py-2"
                  >
                    <div>
                      <p className="text-sm text-parchment">{slot.slot_label}</p>
                      <p className="text-[11px] text-parchment/35 font-mono">
                        proposed by {slot.proposed_by}
                        {slot.status === "accepted" && ` · accepted by ${slot.accepted_by}`}
                      </p>
                    </div>
                    {slot.status === "accepted" ? (
                      <span className="inline-flex items-center gap-1 text-xs text-mint">
                        <Check size={13} /> Accepted
                      </span>
                    ) : slot.proposed_by !== user.name ? (
                      <button
                        onClick={() => acceptSlot(slot.id)}
                        className="text-xs font-medium text-brass-light hover:text-brass-light/80"
                      >
                        Accept
                      </button>
                    ) : (
                      <span className="text-xs text-parchment/30">Pending</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Chat */}
          <div className="bg-ink-panel border border-white/10 rounded-2xl p-5">
            <h3 className="font-display text-lg text-parchment mb-4">
              Chat with {isOwner ? "interested club members" : item.owner_name}
            </h3>

            <div className="h-56 overflow-y-auto no-scrollbar mb-3 flex flex-col gap-2 pr-1">
              {messages.length === 0 && (
                <p className="text-sm text-parchment/30">No messages yet — say hello.</p>
              )}
              {messages.map((m) => {
                const mine = m.sender_name === user.name;
                return (
                  <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm ${
                        mine
                          ? "bg-brass/20 text-parchment rounded-br-sm"
                          : "bg-white/5 text-parchment/85 rounded-bl-sm"
                      }`}
                    >
                      {!mine && (
                        <p className="text-[10px] font-mono uppercase tracking-wide text-lilac/70 mb-0.5">
                          {m.sender_name}
                        </p>
                      )}
                      {m.text}
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={sendMessage} className="flex gap-2">
              <input
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Type a message…"
                className="flex-1 bg-ink-plum border border-white/10 rounded-lg px-3.5 py-2 text-sm text-parchment placeholder-parchment/30 focus:border-brass outline-none transition-colors"
              />
              <button
                type="submit"
                className="bg-brass hover:bg-brass-light text-ink rounded-lg px-3.5 flex items-center justify-center transition-colors"
                aria-label="Send message"
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
