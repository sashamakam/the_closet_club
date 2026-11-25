# The Closet Club

A hostel wardrobe-exchange app: borrow, lend, buy, and sell clothes with people in your hostel.

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: FastAPI, in-memory data store (no database — resets when the server restarts)

## Design

Dark luxury base (charcoal, plum, brass) with pastel accents (lilac, blush, mint). Listing cards
are styled like fabric swatches / hang-tags, with a stitched-look status badge and a corner
category tag, per the original flow sketch.

## Running it locally

You'll need Python 3.11+ and Node.js 22.12+.

### 1. Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

The API will be live at `http://localhost:8000`. Interactive docs at `http://localhost:8000/docs`.

### 2. Frontend

In a second terminal:

```bash
cd frontend1
npm ci
npm run dev -- --host localhost --port 5173 --strictPort
```

Open the printed local URL (usually `http://localhost:5173`).

By default the frontend talks to `http://localhost:8000`. To point it elsewhere, create a
`frontend1/.env` file:

```
VITE_API_URL=http://your-backend-host:8000
```

## How the flows map to the app

| Sketch | In the app |
|---|---|
| Home screen: Borrow / Lend / Buy / Sell / Browse | 5 tiles on the home page |
| Upload image, rent/day, room no., return by (days) | Lend/Sell listing form |
| Status check after uploading (borrowed / not borrowed / returned) | Status badge on every card + status tracker & action buttons on the item page |
| Bottom-right corner shows category | Brass hang-tag on the bottom-right of each listing image |
| Select a time convenient for the lender | Time-slot picker on the item page (propose + accept) |
| Chat with the lender | In-app chat panel on the item page |
| Filter by Tops / Bottoms / Shoes / Accessories | Category filter chips on the Browse page |

## Notes on this version

- **Login is mocked** — just a name and room number, stored in the browser, no password.
- **No database yet** — all listings, chat messages, and time slots live in the backend's memory
  and are lost if the server restarts. This was a deliberate choice to keep the prototype simple;
  swapping in SQLite/Postgres later just means replacing the in-memory dicts in `backend/main.py`
  with real queries.
- **Images** are stored as base64 inside each listing record in memory (not written to disk), so
  they're visible to everyone browsing during the session but aren't persisted to a file store.
- Anyone (not just two matched people) can mark a "buy" item as sold or a "borrow" item as
  borrowed — there's no request/approval step yet. That's an easy next addition if you want it
  (e.g. an "interested" state before "borrowed"/"sold").
