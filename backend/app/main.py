import os
import json
import logging
import sqlite3
from typing import List, Dict, Any
from fastapi import FastAPI, HTTPException, Request, Header
from fastapi.middleware.cors import CORSMiddleware
import stripe

logging.basicConfig(level=logging.INFO)
app = FastAPI(title="Contracts API")

# Allow local Next.js dev server to access the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

stripe.api_key = os.getenv("STRIPE_API_KEY")
DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "contracts.db")


def row_to_contract(row) -> Dict[str, Any]:
    return {
        "id": row[0],
        "contract_id": row[1],
        "client_name": row[2],
        "amount_due_cents": row[3],
        "currency": row[4],
        "payment_status": row[5],
        "payment_link": row[6],
    }


@app.post("/contracts")
def create_contract(payload: Dict[str, Any]):
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO contract (contract_id, client_name, amount_due_cents, currency, payment_status) VALUES (?, ?, ?, ?, ?)",
        (
            payload.get("contract_id"),
            payload.get("client_name"),
            payload.get("amount_due_cents"),
            payload.get("currency", "USD"),
            payload.get("payment_status", "Pending"),
        ),
    )
    conn.commit()
    cur.execute("SELECT * FROM contract WHERE contract_id = ?", (payload.get("contract_id"),))
    row = cur.fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=500, detail="Failed to create contract")
    return row_to_contract(row)


@app.get("/contracts")
def list_contracts() -> List[Dict[str, Any]]:
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("SELECT * FROM contract")
    rows = cur.fetchall()
    conn.close()
    return [row_to_contract(r) for r in rows]


@app.get("/contracts/{contract_id}")
def get_contract(contract_id: str):
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("SELECT * FROM contract WHERE contract_id = ?", (contract_id,))
    row = cur.fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="Contract not found")
    return row_to_contract(row)


@app.post("/contracts/{contract_id}/create-payment-link")
def create_payment_link(contract_id: str):
    if not stripe.api_key:
        raise HTTPException(status_code=500, detail="Stripe API key not configured")

    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("SELECT * FROM contract WHERE contract_id = ?", (contract_id,))
    row = cur.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Contract not found")

    contract = row_to_contract(row)

    try:
        link = stripe.PaymentLink.create(
            line_items=[
                {
                    'price_data': {
                        'currency': contract['currency'].lower(),
                        'unit_amount': contract['amount_due_cents'],
                        'product_data': {'name': f"Invoice {contract['contract_id']} for {contract['client_name']}"},
                    },
                    'quantity': 1,
                }
            ],
            metadata={'contract_id': contract['contract_id']},
        )
        payment_url = link.url
        cur.execute("UPDATE contract SET payment_link = ? WHERE contract_id = ?", (payment_url, contract_id))
        conn.commit()
        conn.close()
        return {"payment_link": payment_url}
    except Exception as e:
        conn.close()
        logging.exception("Failed to create payment link")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/webhooks/stripe")
async def stripe_webhook(request: Request, stripe_signature: str = Header(None)):
    payload = await request.body()
    endpoint_secret = os.getenv("STRIPE_WEBHOOK_SECRET")

    if endpoint_secret and stripe_signature:
        try:
            event = stripe.Webhook.construct_event(payload, stripe_signature, endpoint_secret)
        except Exception as e:
            logging.exception("Webhook signature verification failed")
            raise HTTPException(status_code=400, detail=str(e))
    else:
        try:
            event = json.loads(payload)
        except Exception as e:
            raise HTTPException(status_code=400, detail="Invalid payload")

    event_type = event.get("type")
    data = event.get("data", {}).get("object", {})
    logging.info("Received stripe event: %s", event_type)

    if event_type in ("checkout.session.completed", "payment_intent.succeeded"):
        contract_id = data.get("metadata", {}).get("contract_id") or data.get("client_reference_id")
        if contract_id:
            conn = sqlite3.connect(DB_PATH)
            cur = conn.cursor()
            cur.execute("SELECT * FROM contract WHERE contract_id = ?", (contract_id,))
            row = cur.fetchone()
            if row:
                cur.execute("UPDATE contract SET payment_status = ? WHERE contract_id = ?", ("Paid", contract_id))
                conn.commit()
                logging.info("Contract %s marked as Paid", contract_id)
            else:
                logging.warning("Contract %s not found", contract_id)
            conn.close()

    return {"status": "ok"}
