import type { DbContractRow } from './db'
import { query } from './db'

export type Contract = {
  id: number
  contract_id: string
  client_name: string
  amount_due_cents: number
  currency: string
  payment_status: string
  payment_link: string | null
}

function rowToContract(row: DbContractRow): Contract {
  return {
    id: row.id,
    contract_id: row.contract_id,
    client_name: row.client_name,
    amount_due_cents: row.amount_due_cents,
    currency: row.currency,
    payment_status: row.payment_status,
    payment_link: row.payment_link,
  }
}

export async function listContracts(): Promise<Contract[]> {
  const result = await query<DbContractRow>('SELECT * FROM contract ORDER BY id ASC')
  return result.rows.map(rowToContract)
}

export async function getContract(contractId: string): Promise<Contract | undefined> {
  const result = await query<DbContractRow>('SELECT * FROM contract WHERE contract_id = $1', [contractId])
  if (result.rows.length === 0) return undefined
  return rowToContract(result.rows[0])
}

export async function createContract(data: {
  contract_id: string
  client_name: string
  amount_due_cents: number
  currency?: string
  payment_status?: string
}): Promise<Contract> {
  const existing = await getContract(data.contract_id)
  if (existing) {
    throw new Error(`Contract ${data.contract_id} already exists`)
  }

  const result = await query<DbContractRow>(
    `INSERT INTO contract (contract_id, client_name, amount_due_cents, currency, payment_status)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [
      data.contract_id,
      data.client_name,
      data.amount_due_cents,
      data.currency || 'USD',
      data.payment_status || 'Pending',
    ]
  )

  return rowToContract(result.rows[0])
}

export async function updateContract(
  contractId: string,
  updates: Partial<Omit<Contract, 'id' | 'contract_id'>>
): Promise<Contract | undefined> {
  const fields: string[] = []
  const values: any[] = []
  let index = 1

  for (const [key, value] of Object.entries(updates)) {
    fields.push(`${key} = $${index}`)
    values.push(value)
    index += 1
  }

  if (fields.length === 0) {
    return getContract(contractId)
  }

  values.push(contractId)
  const result = await query<DbContractRow>(
    `UPDATE contract SET ${fields.join(', ')} WHERE contract_id = $${index} RETURNING *`,
    values
  )

  if (result.rows.length === 0) return undefined
  return rowToContract(result.rows[0])
}
