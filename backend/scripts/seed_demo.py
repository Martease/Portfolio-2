import sqlite3
import os

# Simple fallback seed script using sqlite3 to avoid SQLModel/pydantic issues
DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "contracts.db")

conn = sqlite3.connect(DB_PATH)
cur = conn.cursor()

cur.execute(
    """
    CREATE TABLE IF NOT EXISTS contract (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        contract_id TEXT UNIQUE,
        client_name TEXT,
        amount_due_cents INTEGER,
        currency TEXT,
        payment_status TEXT,
        payment_link TEXT
    )
    """
)

cur.execute("SELECT 1 FROM contract WHERE contract_id = ?", ("CTR-001",))
if cur.fetchone():
    print("Demo contract already exists")
else:
    cur.execute(
        "INSERT INTO contract (contract_id, client_name, amount_due_cents, currency, payment_status) VALUES (?, ?, ?, ?, ?)",
        ("CTR-001", "District 221", 1250000, "USD", "Pending"),
    )
    conn.commit()
    print("Demo contract created: CTR-001")

conn.close()
