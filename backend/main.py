"""
The Closet Club — backend
In-memory FastAPI backend for a hostel clothes borrow/lend/buy/sell app.
No database: everything lives in RAM and resets when the server restarts.
Images are stored as base64 strings in memory (not written to disk).
"""

import base64
import itertools
import time
from datetime import datetime
from typing import Literal, Optional

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="The Closet Club API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# In-memory "database"
# ---------------------------------------------------------------------------

ItemType = Literal["borrow", "buy"]
Category = Literal["Tops", "Bottoms", "Shoes", "Accessories"]
Status = Literal["available", "borrowed", "sold", "returned"]

items: dict[int, dict] = {}
messages: dict[int, list[dict]] = {}   # item_id -> list of messages
timeslots: dict[int, list[dict]] = {}  # item_id -> list of slots

item_id_counter = itertools.count(1)
message_id_counter = itertools.count(1)
timeslot_id_counter = itertools.count(1)


def now_iso() -> str:
    return datetime.now().isoformat()


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------

class StatusUpdate(BaseModel):
    status: Status
    actor_name: str


class MessageCreate(BaseModel):
    sender_name: str
    text: str


class TimeSlotCreate(BaseModel):
    proposed_by: str
    slot_label: str  # human readable e.g. "Sat, 6:30 PM"


class TimeSlotAccept(BaseModel):
    accepted_by: str


# ---------------------------------------------------------------------------
# Items
# ---------------------------------------------------------------------------

@app.post("/api/items")
async def create_item(
    title: str = Form(...),
    owner_name: str = Form(...),
    owner_room: str = Form(...),
    item_type: ItemType = Form(...),
    category: Category = Form(...),
    price: float = Form(...),
    condition: Optional[str] = Form(None),
    return_by_days: Optional[int] = Form(None),
    image: UploadFile = File(...),
):
    contents = await image.read()
    encoded = base64.b64encode(contents).decode("utf-8")
    data_url = f"data:{image.content_type};base64,{encoded}"

    new_id = next(item_id_counter)
    item = {
        "id": new_id,
        "title": title,
        "owner_name": owner_name,
        "owner_room": owner_room,
        "item_type": item_type,
        "category": category,
        "price": price,
        "condition": condition,
        "return_by_days": return_by_days,
        "status": "available",
        "image": data_url,
        "created_at": now_iso(),
        "borrower_name": None,
    }
    items[new_id] = item
    messages[new_id] = []
    timeslots[new_id] = []
    return item


@app.get("/api/items")
def list_items(
    item_type: Optional[ItemType] = None,
    category: Optional[Category] = None,
    status: Optional[Status] = None,
):
    result = list(items.values())
    if item_type:
        result = [i for i in result if i["item_type"] == item_type]
    if category:
        result = [i for i in result if i["category"] == category]
    if status:
        result = [i for i in result if i["status"] == status]
    result.sort(key=lambda i: i["created_at"], reverse=True)
    return result


@app.get("/api/items/{item_id}")
def get_item(item_id: int):
    item = items.get(item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Listing not found")
    return item


@app.patch("/api/items/{item_id}/status")
def update_status(item_id: int, payload: StatusUpdate):
    item = items.get(item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Listing not found")
    item["status"] = payload.status
    if payload.status == "borrowed":
        item["borrower_name"] = payload.actor_name
    if payload.status in ("available", "returned"):
        item["borrower_name"] = None
    return item


@app.delete("/api/items/{item_id}")
def delete_item(item_id: int):
    items.pop(item_id, None)
    messages.pop(item_id, None)
    timeslots.pop(item_id, None)
    return {"ok": True}


# ---------------------------------------------------------------------------
# Chat
# ---------------------------------------------------------------------------

@app.get("/api/items/{item_id}/messages")
def get_messages(item_id: int):
    if item_id not in items:
        raise HTTPException(status_code=404, detail="Listing not found")
    return messages[item_id]


@app.post("/api/items/{item_id}/messages")
def post_message(item_id: int, payload: MessageCreate):
    if item_id not in items:
        raise HTTPException(status_code=404, detail="Listing not found")
    msg = {
        "id": next(message_id_counter),
        "sender_name": payload.sender_name,
        "text": payload.text,
        "created_at": now_iso(),
    }
    messages[item_id].append(msg)
    return msg


# ---------------------------------------------------------------------------
# Time slots (pickup / return scheduling)
# ---------------------------------------------------------------------------

@app.get("/api/items/{item_id}/timeslots")
def get_timeslots(item_id: int):
    if item_id not in items:
        raise HTTPException(status_code=404, detail="Listing not found")
    return timeslots[item_id]


@app.post("/api/items/{item_id}/timeslots")
def propose_timeslot(item_id: int, payload: TimeSlotCreate):
    if item_id not in items:
        raise HTTPException(status_code=404, detail="Listing not found")
    slot = {
        "id": next(timeslot_id_counter),
        "proposed_by": payload.proposed_by,
        "slot_label": payload.slot_label,
        "status": "proposed",
        "created_at": now_iso(),
    }
    timeslots[item_id].append(slot)
    return slot


@app.patch("/api/items/{item_id}/timeslots/{slot_id}/accept")
def accept_timeslot(item_id: int, slot_id: int, payload: TimeSlotAccept):
    slots = timeslots.get(item_id)
    if slots is None:
        raise HTTPException(status_code=404, detail="Listing not found")
    for slot in slots:
        if slot["id"] == slot_id:
            slot["status"] = "accepted"
            slot["accepted_by"] = payload.accepted_by
            return slot
    raise HTTPException(status_code=404, detail="Time slot not found")


@app.get("/api/health")
def health():
    return {"ok": True, "items": len(items), "ts": time.time()}
