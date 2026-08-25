CREATE TYPE capability_scope AS ENUM (
  'CONTRACT_READ',
  'DASHBOARD_READ',
  'DOCUMENTS_READ',
  'DOWNLOADS_READ',
  'WORKSPACE_READ',
  'FEEDBACK_CREATE',
  'FILE_SUBMIT',
  'SIGNED_COPY_SUBMIT',
  'PAYMENT_CREATE'
);

ALTER TABLE client_project
  ADD CONSTRAINT client_project_id_contract_id_key UNIQUE (id, contract_id);

CREATE TABLE client_capability (
  id TEXT NOT NULL,
  token_hash TEXT NOT NULL,
  contract_id TEXT NOT NULL,
  project_id INTEGER,
  scopes capability_scope[] NOT NULL,
  recipient_email TEXT,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  revoked_by TEXT,
  revoke_reason TEXT,
  last_used_at TIMESTAMPTZ,
  use_count INTEGER NOT NULL DEFAULT 0,
  max_uses INTEGER,
  replaced_by_id TEXT,

  CONSTRAINT client_capability_pkey PRIMARY KEY (id),
  CONSTRAINT client_capability_token_hash_key UNIQUE (token_hash),
  CONSTRAINT client_capability_contract_id_fkey
    FOREIGN KEY (contract_id) REFERENCES contract(contract_id) ON DELETE CASCADE,
  CONSTRAINT client_capability_project_id_contract_id_fkey
    FOREIGN KEY (project_id, contract_id) REFERENCES client_project(id, contract_id) ON DELETE CASCADE,
  CONSTRAINT client_capability_replaced_by_id_fkey
    FOREIGN KEY (replaced_by_id) REFERENCES client_capability(id) ON DELETE SET NULL
);

CREATE INDEX client_capability_contract_id_expires_at_idx
  ON client_capability(contract_id, expires_at);
CREATE INDEX client_capability_project_id_expires_at_idx
  ON client_capability(project_id, expires_at);
CREATE INDEX client_capability_expires_at_idx
  ON client_capability(expires_at);