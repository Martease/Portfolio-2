from typing import Optional
from sqlmodel import SQLModel, Field

class Contract(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    contract_id: str = Field(index=True)
    client_name: str
    amount_due_cents: int
    currency: str = "USD"
    payment_status: str = "Pending"
    payment_link: str | None = None
