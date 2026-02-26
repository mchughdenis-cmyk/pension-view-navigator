import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'

export interface Client {
  id: string
  title: string
  first_name: string
  last_name: string
  date_of_birth: string | null
  email: string | null
  phone: string | null
  address_line1: string | null
  address_line2: string | null
  city: string | null
  postcode: string | null
  ni_number: string | null
  marital_status: string | null
  employment_status: string | null
  nationality: string | null
  tax_residency: string | null
  adviser: string | null
  status: string
  risk_profile: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface ClientAccount {
  id: string
  client_id: string
  account_type: string
  account_number: string | null
  status: string
  opened_date: string | null
  cash_balance: number
  total_value: number
  created_at: string
  updated_at: string
}

export interface Transaction {
  id: string
  account_id: string
  client_id: string
  transaction_type: string
  description: string | null
  amount: number
  running_balance: number
  reference: string | null
  status: string
  effective_date: string | null
  tax_year: string | null
  tax_relief_amount: number
  notes: string | null
  created_at: string
}

export interface Investment {
  id: string
  account_id: string
  client_id: string
  fund_name: string
  isin: string | null
  sedol: string | null
  units: number
  unit_price: number
  current_value: number
  cost_basis: number
  allocation_pct: number
  status: string | null
}

export interface Beneficiary {
  id: string
  client_id: string
  name: string
  relationship: string
  date_of_birth: string | null
  allocation_pct: number
  contact_details: string | null
  notes: string | null
}

export interface BCEEvent {
  id: string
  client_id: string
  bce_type: string
  event_date: string
  crystallised_amount: number
  lta_percentage: number
  tax_free_lump_sum: number
  notes: string | null
}

// Fetch all clients
export function useClients() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)

  const fetchClients = useCallback(async () => {
    const { data, error } = await supabase.from('clients').select('*').order('last_name')
    if (error) { toast.error('Failed to load clients'); console.error(error) }
    else setClients(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchClients() }, [fetchClients])

  const addClient = async (client: Partial<Client>) => {
    const { data, error } = await supabase.from('clients').insert(client as any).select().single()
    if (error) { toast.error('Failed to add client'); return null }
    setClients(prev => [...prev, data as Client])
    await logActivity('client', data.id, 'created', `Client ${client.first_name} ${client.last_name} created`)
    return data as Client
  }

  const updateClient = async (id: string, updates: Partial<Client>) => {
    const { error } = await supabase.from('clients').update(updates as any).eq('id', id)
    if (error) { toast.error('Failed to update client'); return false }
    setClients(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c))
    await logActivity('client', id, 'updated', `Client details updated`)
    return true
  }

  return { clients, loading, fetchClients, addClient, updateClient }
}

// Fetch data for a single client
export function useClientDetail(clientId: string | undefined) {
  const [client, setClient] = useState<Client | null>(null)
  const [accounts, setAccounts] = useState<ClientAccount[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [investments, setInvestments] = useState<Investment[]>([])
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([])
  const [bceEvents, setBceEvents] = useState<BCEEvent[]>([])
  const [loading, setLoading] = useState(true)

  const fetchAll = useCallback(async () => {
    if (!clientId) return
    setLoading(true)
    const [clientRes, accountsRes, txnRes, invRes, benRes, bceRes] = await Promise.all([
      supabase.from('clients').select('*').eq('id', clientId).single(),
      supabase.from('client_accounts').select('*').eq('client_id', clientId).order('account_type'),
      supabase.from('transactions').select('*').eq('client_id', clientId).order('created_at', { ascending: false }),
      supabase.from('investments').select('*').eq('client_id', clientId).order('fund_name'),
      supabase.from('beneficiaries').select('*').eq('client_id', clientId),
      supabase.from('bce_events').select('*').eq('client_id', clientId).order('event_date', { ascending: false }),
    ])
    if (clientRes.data) setClient(clientRes.data as Client)
    setAccounts((accountsRes.data || []) as ClientAccount[])
    setTransactions((txnRes.data || []) as Transaction[])
    setInvestments((invRes.data || []) as Investment[])
    setBeneficiaries((benRes.data || []) as Beneficiary[])
    setBceEvents((bceRes.data || []) as BCEEvent[])
    setLoading(false)
  }, [clientId])

  useEffect(() => { fetchAll() }, [fetchAll])

  // Client updates
  const updateClient = async (updates: Partial<Client>) => {
    if (!clientId) return false
    const { error } = await supabase.from('clients').update(updates as any).eq('id', clientId)
    if (error) { toast.error('Failed to update client'); return false }
    setClient(prev => prev ? { ...prev, ...updates } : prev)
    await logActivity('client', clientId, 'updated', `Client details updated`)
    return true
  }

  // Account operations
  const addAccount = async (account: Partial<ClientAccount>) => {
    const payload = { ...account, client_id: clientId }
    const { data, error } = await supabase.from('client_accounts').insert(payload as any).select().single()
    if (error) { toast.error('Failed to add account'); return null }
    setAccounts(prev => [...prev, data as ClientAccount])
    await logActivity('client', clientId!, 'created', `${account.account_type} account opened`)
    return data as ClientAccount
  }

  const updateAccount = async (id: string, updates: Partial<ClientAccount>) => {
    const { error } = await supabase.from('client_accounts').update(updates as any).eq('id', id)
    if (error) { toast.error('Failed to update account'); return false }
    setAccounts(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a))
    await logActivity('client', clientId!, 'updated', `Account updated`)
    return true
  }

  // Transaction operations
  const addTransaction = async (txn: Partial<Transaction>) => {
    const payload = { ...txn, client_id: clientId }
    const { data, error } = await supabase.from('transactions').insert(payload as any).select().single()
    if (error) { toast.error('Failed to add transaction'); return null }
    setTransactions(prev => [data as Transaction, ...prev])
    await logActivity('transaction', data.id, 'created', `${txn.transaction_type}: ${txn.description} (£${txn.amount})`)
    return data as Transaction
  }

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    const { error } = await supabase.from('transactions').update(updates as any).eq('id', id)
    if (error) { toast.error('Failed to update transaction'); return false }
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t))
    await logActivity('transaction', id, 'updated', `Transaction updated`)
    return true
  }

  const deleteTransaction = async (id: string) => {
    const { error } = await supabase.from('transactions').delete().eq('id', id)
    if (error) { toast.error('Failed to delete transaction'); return false }
    setTransactions(prev => prev.filter(t => t.id !== id))
    await logActivity('transaction', id, 'deleted', `Transaction reversed and removed`)
    return true
  }

  // Investment operations
  const addInvestment = async (inv: Partial<Investment>) => {
    const payload = { ...inv, client_id: clientId }
    const { data, error } = await supabase.from('investments').insert(payload as any).select().single()
    if (error) { toast.error('Failed to add investment'); return null }
    setInvestments(prev => [...prev, data as Investment])
    await logActivity('investment', data.id, 'created', `Investment added: ${inv.fund_name}`)
    return data as Investment
  }

  const updateInvestment = async (id: string, updates: Partial<Investment>) => {
    const { error } = await supabase.from('investments').update(updates as any).eq('id', id)
    if (error) { toast.error('Failed to update investment'); return false }
    setInvestments(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i))
    return true
  }

  const deleteInvestment = async (id: string) => {
    const { error } = await supabase.from('investments').delete().eq('id', id)
    if (error) { toast.error('Failed to delete investment'); return false }
    setInvestments(prev => prev.filter(i => i.id !== id))
    return true
  }

  // Beneficiary operations
  const addBeneficiary = async (ben: Partial<Beneficiary>) => {
    const payload = { ...ben, client_id: clientId }
    const { data, error } = await supabase.from('beneficiaries').insert(payload as any).select().single()
    if (error) { toast.error('Failed to add beneficiary'); return null }
    setBeneficiaries(prev => [...prev, data as Beneficiary])
    await logActivity('client', clientId!, 'created', `Beneficiary added: ${ben.name}`)
    return data as Beneficiary
  }

  const updateBeneficiary = async (id: string, updates: Partial<Beneficiary>) => {
    const { error } = await supabase.from('beneficiaries').update(updates as any).eq('id', id)
    if (error) { toast.error('Failed to update beneficiary'); return false }
    setBeneficiaries(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b))
    return true
  }

  const deleteBeneficiary = async (id: string) => {
    const { error } = await supabase.from('beneficiaries').delete().eq('id', id)
    if (error) { toast.error('Failed to delete beneficiary'); return false }
    setBeneficiaries(prev => prev.filter(b => b.id !== id))
    return true
  }

  // BCE operations
  const addBCE = async (bce: Partial<BCEEvent>) => {
    const payload = { ...bce, client_id: clientId }
    const { data, error } = await supabase.from('bce_events').insert(payload as any).select().single()
    if (error) { toast.error('Failed to add BCE event'); return null }
    setBceEvents(prev => [data as BCEEvent, ...prev])
    await logActivity('client', clientId!, 'created', `BCE event: ${bce.bce_type} - £${bce.crystallised_amount}`)
    return data as BCEEvent
  }

  return {
    client, accounts, transactions, investments, beneficiaries, bceEvents, loading,
    updateClient, addAccount, updateAccount,
    addTransaction, updateTransaction, deleteTransaction,
    addInvestment, updateInvestment, deleteInvestment,
    addBeneficiary, updateBeneficiary, deleteBeneficiary,
    addBCE, fetchAll,
  }
}

// Activity log
export async function logActivity(entityType: string, entityId: string | undefined, action: string, description: string) {
  await supabase.from('activity_log').insert({
    entity_type: entityType,
    entity_id: entityId || null,
    action,
    description,
    performed_by: 'System Admin',
  } as any)
}

// Fetch activity log for a client
export function useActivityLog(clientId: string | undefined) {
  const [logs, setLogs] = useState<any[]>([])

  const fetchLogs = useCallback(async () => {
    if (!clientId) return
    const { data } = await supabase.from('activity_log')
      .select('*')
      .eq('entity_id', clientId)
      .order('created_at', { ascending: false })
      .limit(50)
    setLogs(data || [])
  }, [clientId])

  useEffect(() => { fetchLogs() }, [fetchLogs])

  return { logs, fetchLogs }
}

// All transactions (for admin ledger)
export function useAllTransactions() {
  const [transactions, setTransactions] = useState<(Transaction & { client_name?: string; account_type?: string })[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTransactions = useCallback(async () => {
    setLoading(true)
    const { data: txns, error } = await supabase
      .from('transactions')
      .select('*, clients(first_name, last_name), client_accounts(account_type)')
      .order('created_at', { ascending: false })
      .limit(200)
    if (error) { toast.error('Failed to load transactions'); console.error(error) }
    else {
      const mapped = (txns || []).map((t: any) => ({
        ...t,
        client_name: t.clients ? `${t.clients.first_name} ${t.clients.last_name}` : 'Unknown',
        account_type: t.client_accounts?.account_type || 'Unknown',
      }))
      setTransactions(mapped)
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchTransactions() }, [fetchTransactions])

  const addTransaction = async (txn: Partial<Transaction>) => {
    const { data, error } = await supabase.from('transactions').insert(txn as any).select('*, clients(first_name, last_name), client_accounts(account_type)').single()
    if (error) { toast.error('Failed to add transaction'); return null }
    const mapped = {
      ...data,
      client_name: data.clients ? `${(data as any).clients.first_name} ${(data as any).clients.last_name}` : 'Unknown',
      account_type: (data as any).client_accounts?.account_type || 'Unknown',
    } as any
    setTransactions(prev => [mapped, ...prev])
    await logActivity('transaction', data.id, 'created', `Transaction: ${txn.description}`)
    return mapped
  }

  const updateTransactionStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('transactions').update({ status } as any).eq('id', id)
    if (error) { toast.error('Failed to update'); return false }
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, status } : t))
    await logActivity('transaction', id, 'status_changed', `Status changed to ${status}`)
    return true
  }

  const deleteTransaction = async (id: string) => {
    const { error } = await supabase.from('transactions').delete().eq('id', id)
    if (error) { toast.error('Failed to delete'); return false }
    setTransactions(prev => prev.filter(t => t.id !== id))
    await logActivity('transaction', id, 'deleted', `Transaction reversed`)
    return true
  }

  return { transactions, loading, fetchTransactions, addTransaction, updateTransactionStatus, deleteTransaction }
}

// Bank files
export function useBankFiles() {
  const [files, setFiles] = useState<any[]>([])
  const [entries, setEntries] = useState<any[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [clientAccounts, setClientAccounts] = useState<ClientAccount[]>([])
  const [loading, setLoading] = useState(true)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    const [filesRes, entriesRes, clientsRes, accountsRes] = await Promise.all([
      supabase.from('bank_files').select('*').order('created_at', { ascending: false }),
      supabase.from('bank_file_entries').select('*, clients(first_name, last_name)').order('created_at', { ascending: false }),
      supabase.from('clients').select('id, first_name, last_name').order('last_name'),
      supabase.from('client_accounts').select('id, client_id, account_type, account_number'),
    ])
    setFiles(filesRes.data || [])
    setEntries((entriesRes.data || []).map((e: any) => ({
      ...e,
      client_name: e.clients ? `${e.clients.first_name} ${e.clients.last_name}` : '',
    })))
    setClients((clientsRes.data || []) as Client[])
    setClientAccounts((accountsRes.data || []) as ClientAccount[])
    setLoading(false)
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const addBankFile = async (filename: string, fileEntries: { date: string; description: string; amount: number; reference: string }[]) => {
    // Create bank file record
    const totalAmount = fileEntries.reduce((s, e) => s + Math.abs(e.amount), 0)
    const { data: fileData, error: fileError } = await supabase.from('bank_files').insert({
      filename,
      total_entries: fileEntries.length,
      total_amount: totalAmount,
      status: 'uploaded',
    } as any).select().single()

    if (fileError) { toast.error('Failed to upload bank file'); return null }

    // Auto-match entries against clients
    const entriesToInsert = fileEntries.map(entry => {
      // Try auto-matching by reference pattern
      const matchedClient = clients.find(c => {
        const namePattern = `${c.first_name} ${c.last_name}`.toLowerCase()
        return entry.description.toLowerCase().includes(namePattern) ||
               entry.reference.toLowerCase().includes(namePattern.replace(' ', ''))
      })
      const matchedAccount = matchedClient
        ? clientAccounts.find(a => a.client_id === matchedClient.id)
        : null

      return {
        bank_file_id: fileData.id,
        entry_date: entry.date,
        description: entry.description,
        amount: entry.amount,
        reference: entry.reference,
        matched_client_id: matchedClient?.id || null,
        matched_account_id: matchedAccount?.id || null,
        status: matchedClient ? 'matched' : 'unmatched',
        transaction_type: entry.amount > 0 ? 'contribution' : 'withdrawal',
      }
    })

    const { data: insertedEntries, error: entriesError } = await supabase
      .from('bank_file_entries')
      .insert(entriesToInsert as any)
      .select('*, clients(first_name, last_name)')

    if (entriesError) { toast.error('Failed to process entries'); return null }

    const matchedCount = entriesToInsert.filter(e => e.status === 'matched').length
    await supabase.from('bank_files').update({
      matched_count: matchedCount,
      unmatched_count: fileEntries.length - matchedCount,
      status: 'completed',
    } as any).eq('id', fileData.id)

    await fetchAll()
    await logActivity('bank_file', fileData.id, 'created', `Bank file uploaded: ${filename} (${fileEntries.length} entries)`)
    return { file: fileData, entries: insertedEntries, matchedCount }
  }

  const matchEntry = async (entryId: string, clientId: string, accountId: string) => {
    const { error } = await supabase.from('bank_file_entries').update({
      matched_client_id: clientId,
      matched_account_id: accountId,
      status: 'matched',
    } as any).eq('id', entryId)
    if (error) { toast.error('Failed to match'); return false }
    await fetchAll()
    return true
  }

  const allocateEntry = async (entryId: string, clientId: string, accountId: string, transactionType: string, notes?: string) => {
    const { error } = await supabase.from('bank_file_entries').update({
      matched_client_id: clientId,
      matched_account_id: accountId,
      transaction_type: transactionType,
      status: 'allocated',
    } as any).eq('id', entryId)
    if (error) { toast.error('Failed to allocate'); return false }
    await fetchAll()
    return true
  }

  const applyAllocated = async () => {
    // Get all matched/allocated entries
    const toApply = entries.filter(e => e.status === 'matched' || e.status === 'allocated')
    let count = 0
    for (const entry of toApply) {
      if (!entry.matched_client_id || !entry.matched_account_id) continue
      const ref = `BANK-${entry.id.slice(0, 8)}`
      await supabase.from('transactions').insert({
        account_id: entry.matched_account_id,
        client_id: entry.matched_client_id,
        transaction_type: entry.transaction_type || 'contribution',
        description: entry.description,
        amount: entry.amount,
        reference: ref,
        status: 'settled',
        effective_date: entry.entry_date,
      } as any)
      await supabase.from('bank_file_entries').update({ status: 'applied' } as any).eq('id', entry.id)
      count++
    }
    await fetchAll()
    await logActivity('bank_file', undefined, 'updated', `Applied ${count} bank entries as transactions`)
    return count
  }

  const rejectEntry = async (entryId: string) => {
    const { error } = await supabase.from('bank_file_entries').update({ status: 'rejected' } as any).eq('id', entryId)
    if (error) { toast.error('Failed to reject'); return false }
    setEntries(prev => prev.map(e => e.id === entryId ? { ...e, status: 'rejected' } : e))
    return true
  }

  const deleteEntry = async (entryId: string) => {
    const { error } = await supabase.from('bank_file_entries').delete().eq('id', entryId)
    if (error) { toast.error('Failed to delete'); return false }
    setEntries(prev => prev.filter(e => e.id !== entryId))
    return true
  }

  const addManualEntry = async (entry: { bank_file_id?: string; entry_date: string; description: string; amount: number; reference: string; matched_client_id?: string; matched_account_id?: string }) => {
    // If no bank file, create a "manual" one
    let fileId = entry.bank_file_id
    if (!fileId) {
      const existing = files.find(f => f.filename === 'Manual Entries')
      if (existing) {
        fileId = existing.id
      } else {
        const { data } = await supabase.from('bank_files').insert({
          filename: 'Manual Entries',
          total_entries: 0,
          total_amount: 0,
          status: 'completed',
        } as any).select().single()
        fileId = data?.id
      }
    }

    const { data, error } = await supabase.from('bank_file_entries').insert({
      bank_file_id: fileId,
      entry_date: entry.entry_date,
      description: entry.description,
      amount: entry.amount,
      reference: entry.reference,
      matched_client_id: entry.matched_client_id || null,
      matched_account_id: entry.matched_account_id || null,
      status: entry.matched_client_id ? 'matched' : 'unmatched',
      transaction_type: entry.amount > 0 ? 'contribution' : 'withdrawal',
    } as any).select('*, clients(first_name, last_name)').single()

    if (error) { toast.error('Failed to add entry'); return null }
    const mapped = {
      ...data,
      client_name: (data as any).clients ? `${(data as any).clients.first_name} ${(data as any).clients.last_name}` : '',
    }
    setEntries(prev => [mapped, ...prev])
    return mapped
  }

  return {
    files, entries, clients, clientAccounts, loading,
    addBankFile, matchEntry, allocateEntry, applyAllocated, rejectEntry, deleteEntry, addManualEntry, fetchAll,
  }
}
