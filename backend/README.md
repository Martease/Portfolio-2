FastAPI backend for contracts and Stripe webhook

Setup

1. Create and activate a virtualenv (recommended):

```bash
python -m venv .venv
source .venv/bin/activate
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. (Optional) Create a `.env` file with your Stripe keys:

```
STRIPE_API_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

4. Run the app:

```bash
uvicorn app.main:app --reload --port 8000
```

Notes
- The webhook endpoint will try to verify signatures when `STRIPE_WEBHOOK_SECRET` is set.
- The `contract_id` should be provided in Stripe Payment Link metadata (or as `client_reference_id`) so the webhook can map payments to contracts.
