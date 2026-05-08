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
  mpaa_triggered: boolean
  annual_allowance_used: number
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
    if (error) {
      console.error('Add client error:', error)
      toast.error(`Failed to add client: ${error.message}`)
      return null
    }
    setClients(prev => [...prev, data as Client])
    toast.success(`Client ${client.first_name} ${client.last_name} added`)
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

// Drawdown processor — single source of truth for crystallisation + UFPLS + FAD
import { calculatePCLS, calculateUFPLS, calculateFADIncome, ANNUAL_ALLOWANCE, MPAA_ALLOWANCE } from '@/lib/pensionCalculations'

export interface DrawdownInput {
  clientId: string
  accountId: string
  mode: 'PCLS_FAD' | 'UFPLS' | 'FAD'
  potValue: number               // current uncrystallised value (PCLS_FAD/UFPLS) or designated drawdown pot (FAD)
  pclsAmount?: number            // for PCLS_FAD
  drawdownIncome?: number        // for PCLS_FAD/FAD: taxable income to take this period
  ufplsGross?: number            // for UFPLS: total UFPLS payment
  otherIncome?: number           // other taxable income for tax calc
  effectiveDate?: string
  notes?: string
}

export async function processDrawdown(input: DrawdownInput) {
  const { clientId, accountId, mode, potValue, otherIncome = 0, effectiveDate = new Date().toISOString().slice(0, 10), notes } = input

  // Load current client to track AA / MPAA
  const { data: client } = await supabase.from('clients').select('mpaa_triggered, annual_allowance_used').eq('id', clientId).single()
  const { data: account } = await supabase.from('client_accounts').select('cash_balance, total_value').eq('id', accountId).single()

  let pclsAmount = 0
  let crystallised = 0
  let taxable = 0
  let tax = 0
  let net = 0
  let bceType = 'FAD'
  let triggersMPAA = false

  if (mode === 'PCLS_FAD') {
    const pcls = calculatePCLS(potValue, input.pclsAmount)
    pclsAmount = pcls.pcls
    crystallised = pcls.pcls + pcls.designatedToDrawdown
    bceType = 'PCLS+FAD'
    if (input.drawdownIncome && input.drawdownIncome > 0) {
      const fad = calculateFADIncome(input.drawdownIncome, otherIncome)
      taxable = fad.income
      tax = fad.tax.totalTax
      net = fad.netPayment
      triggersMPAA = true // taking taxable income from FAD triggers MPAA
    }
  } else if (mode === 'UFPLS') {
    const ufpls = calculateUFPLS(input.ufplsGross || 0, otherIncome)
    pclsAmount = ufpls.taxFreePortion
    taxable = ufpls.taxablePortion
    tax = ufpls.tax.totalTax
    net = ufpls.netPayment
    crystallised = ufpls.gross
    bceType = 'UFPLS'
    triggersMPAA = true
  } else if (mode === 'FAD') {
    const fad = calculateFADIncome(input.drawdownIncome || 0, otherIncome)
    taxable = fad.income
    tax = fad.tax.totalTax
    net = fad.netPayment
    bceType = 'FAD-Income'
    triggersMPAA = true
  }

  // 1) BCE event (skip pure FAD income from already-crystallised funds)
  let bceId: string | null = null
  if (mode !== 'FAD') {
    const { data: bce, error: bceErr } = await supabase.from('bce_events').insert({
      client_id: clientId,
      bce_type: bceType,
      event_date: effectiveDate,
      crystallised_amount: crystallised,
      tax_free_lump_sum: pclsAmount,
      lta_percentage: 0,
      notes,
    } as any).select().single()
    if (bceErr) { toast.error(`BCE create failed: ${bceErr.message}`); return null }
    bceId = bce.id

    // 2) Crystallisation segment
    await supabase.from('crystallisation_segments').insert({
      client_id: clientId,
      account_id: accountId,
      bce_event_id: bceId,
      segment_type: 'designated',
      crystallised_amount: crystallised,
      pcls_amount: pclsAmount,
      residual_fund: Math.max(0, crystallised - pclsAmount - taxable),
      drawdown_type: mode === 'UFPLS' ? 'UFPLS' : 'FAD',
      status: 'active',
    } as any)
  }

  // 3) Transactions — PCLS (tax-free), taxable income, tax withheld
  const txns: any[] = []
  if (pclsAmount > 0) {
    txns.push({
      client_id: clientId, account_id: accountId,
      transaction_type: 'pcls',
      description: `Tax-free cash (PCLS) — ${bceType}`,
      amount: -pclsAmount, status: 'settled', effective_date: effectiveDate,
      reference: `PCLS-${Date.now()}`,
    })
  }
  if (taxable > 0) {
    txns.push({
      client_id: clientId, account_id: accountId,
      transaction_type: mode === 'UFPLS' ? 'ufpls_taxable' : 'drawdown',
      description: `Taxable drawdown — ${bceType} (gross)`,
      amount: -taxable, status: 'settled', effective_date: effectiveDate,
      tax_relief_amount: -tax,
      reference: `DD-${Date.now()}`,
    })
    if (tax > 0) {
      txns.push({
        client_id: clientId, account_id: accountId,
        transaction_type: 'tax_withheld',
        description: `Income tax withheld (PAYE)`,
        amount: tax, status: 'settled', effective_date: effectiveDate,
        reference: `TAX-${Date.now()}`,
      })
    }
  }
  if (txns.length > 0) {
    const { error: txErr } = await supabase.from('transactions').insert(txns as any)
    if (txErr) { toast.error(`Transactions failed: ${txErr.message}`); return null }
  }

  // 4) Update account balance (decrement by gross outflow excluding tax which stays for HMRC)
  const grossOut = pclsAmount + taxable
  if (account && grossOut > 0) {
    const newCash = Math.max(0, Number(account.cash_balance || 0) - grossOut)
    const newTotal = Math.max(0, Number(account.total_value || 0) - grossOut)
    await supabase.from('client_accounts').update({ cash_balance: newCash, total_value: newTotal } as any).eq('id', accountId)
  }

  // 5) Update MPAA / AA usage on client
  const updates: any = {}
  if (triggersMPAA && client && !client.mpaa_triggered) updates.mpaa_triggered = true
  if (Object.keys(updates).length) {
    await supabase.from('clients').update(updates).eq('id', clientId)
  }

  await logActivity('transaction', bceId || clientId, 'created',
    `${bceType}: PCLS £${pclsAmount.toFixed(0)}, taxable £${taxable.toFixed(0)}, tax £${tax.toFixed(0)}, net £${net.toFixed(0)}`)
  toast.success(`${bceType} processed: net payment ${new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(pclsAmount + net)}`)
  return { bceId, pclsAmount, taxable, tax, net, gross: grossOut }
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
    // Validate inputs
    const { BankFileSchema } = await import('@/lib/bankFileValidation')
    const validation = BankFileSchema.safeParse({ filename, entries: fileEntries })
    if (!validation.success) {
      toast.error(`Invalid bank file: ${validation.error.errors[0]?.message || 'Validation failed'}`)
      return null
    }
    const validatedEntries = validation.data.entries
    const validatedFilename = validation.data.filename

    // Create bank file record
    const totalAmount = validatedEntries.reduce((s, e) => s + Math.abs(e.amount), 0)
    const { data: fileData, error: fileError } = await supabase.from('bank_files').insert({
      filename: validatedFilename,
      total_entries: validatedEntries.length,
      total_amount: totalAmount,
      status: 'uploaded',
    } as any).select().single()

    if (fileError) { toast.error('Failed to upload bank file'); return null }

    // Auto-match entries against clients
    const entriesToInsert = validatedEntries.map(entry => {
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
      unmatched_count: validatedEntries.length - matchedCount,
      status: 'completed',
    } as any).eq('id', fileData.id)

    await fetchAll()
    await logActivity('bank_file', fileData.id, 'created', `Bank file uploaded: ${validatedFilename} (${validatedEntries.length} entries)`)
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

// Audit trail (all activity_log entries)
export function useAuditTrail() {
  const [entries, setEntries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchEntries = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('activity_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200)
    if (error) { console.error(error) }
    setEntries(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchEntries() }, [fetchEntries])
  return { entries, loading, fetchEntries }
}

// Scheme dashboard aggregates
export function useSchemeStats() {
  const [stats, setStats] = useState<{
    totalClients: number; totalAUM: number; totalAccounts: number;
    recentTransactions: any[]; accountsByType: Record<string, { count: number; aum: number }>;
  }>({ totalClients: 0, totalAUM: 0, totalAccounts: 0, recentTransactions: [], accountsByType: {} })
  const [loading, setLoading] = useState(true)

  const fetchStats = useCallback(async () => {
    setLoading(true)
    const [clientsRes, accountsRes, txnRes] = await Promise.all([
      supabase.from('clients').select('id', { count: 'exact', head: true }),
      supabase.from('client_accounts').select('account_type, total_value, status'),
      supabase.from('transactions').select('transaction_type, amount, status, created_at').order('created_at', { ascending: false }).limit(100),
    ])

    const accounts = accountsRes.data || []
    const totalAUM = accounts.reduce((s: number, a: any) => s + (Number(a.total_value) || 0), 0)
    const byType: Record<string, { count: number; aum: number }> = {}
    accounts.forEach((a: any) => {
      if (!byType[a.account_type]) byType[a.account_type] = { count: 0, aum: 0 }
      byType[a.account_type].count++
      byType[a.account_type].aum += Number(a.total_value) || 0
    })

    setStats({
      totalClients: clientsRes.count || 0,
      totalAUM,
      totalAccounts: accounts.length,
      recentTransactions: txnRes.data || [],
      accountsByType: byType,
    })
    setLoading(false)
  }, [])

  useEffect(() => { fetchStats() }, [fetchStats])
  return { stats, loading, fetchStats }
}

// Fee schedules CRUD
export function useFeeSchedules() {
  const [schedules, setSchedules] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchSchedules = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase.from('fee_schedules').select('*').order('name')
    if (error) { toast.error('Failed to load fee schedules'); console.error(error) }
    setSchedules(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchSchedules() }, [fetchSchedules])

  const addSchedule = async (schedule: any) => {
    const { data, error } = await supabase.from('fee_schedules').insert(schedule).select().single()
    if (error) { toast.error('Failed to add fee schedule'); return null }
    setSchedules(prev => [...prev, data])
    await logActivity('fee_schedule', data.id, 'created', `Fee schedule "${schedule.name}" created`)
    return data
  }

  const updateSchedule = async (id: string, updates: any) => {
    const { error } = await supabase.from('fee_schedules').update(updates).eq('id', id)
    if (error) { toast.error('Failed to update'); return false }
    setSchedules(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s))
    await logActivity('fee_schedule', id, 'updated', `Fee schedule updated`)
    return true
  }

  const deleteSchedule = async (id: string) => {
    const name = schedules.find(s => s.id === id)?.name
    const { error } = await supabase.from('fee_schedules').delete().eq('id', id)
    if (error) { toast.error('Failed to delete'); return false }
    setSchedules(prev => prev.filter(s => s.id !== id))
    await logActivity('fee_schedule', id, 'deleted', `Fee schedule "${name}" deleted`)
    return true
  }

  return { schedules, loading, fetchSchedules, addSchedule, updateSchedule, deleteSchedule }
}

// Trade orders CRUD
export function useTradeOrders() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase.from('trade_orders').select('*').order('created_at', { ascending: false })
    if (error) { toast.error('Failed to load trade orders'); console.error(error) }
    setOrders(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  const addOrder = async (order: any) => {
    const { data, error } = await supabase.from('trade_orders').insert(order).select().single()
    if (error) { toast.error('Failed to place order'); return null }
    setOrders(prev => [data, ...prev])
    await logActivity('trade_order', data.id, 'created', `${order.side} order: ${order.instrument}`)
    return data
  }

  const updateOrder = async (id: string, updates: any) => {
    const { error } = await supabase.from('trade_orders').update(updates).eq('id', id)
    if (error) { toast.error('Failed to update order'); return false }
    setOrders(prev => prev.map(o => o.id === id ? { ...o, ...updates } : o))
    return true
  }

  return { orders, loading, fetchOrders, addOrder, updateOrder }
}

// Adviser fees CRUD
export function useAdviserFees() {
  const [fees, setFees] = useState<any[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)

  const fetchFees = useCallback(async () => {
    setLoading(true)
    const [feesRes, clientsRes] = await Promise.all([
      supabase.from('adviser_fees').select('*, clients(first_name, last_name)').order('adviser_name'),
      supabase.from('clients').select('id, first_name, last_name').order('last_name'),
    ])
    if (feesRes.error) { toast.error('Failed to load adviser fees'); console.error(feesRes.error) }
    const mapped = (feesRes.data || []).map((f: any) => ({
      ...f,
      client_name: f.clients ? `${f.clients.first_name} ${f.clients.last_name}` : null,
    }))
    setFees(mapped)
    setClients((clientsRes.data || []) as Client[])
    setLoading(false)
  }, [])

  useEffect(() => { fetchFees() }, [fetchFees])

  const addFee = async (fee: any) => {
    const { data, error } = await supabase.from('adviser_fees').insert(fee).select('*, clients(first_name, last_name)').single()
    if (error) { toast.error('Failed to add fee'); return null }
    const mapped = { ...data, client_name: (data as any).clients ? `${(data as any).clients.first_name} ${(data as any).clients.last_name}` : null }
    setFees(prev => [...prev, mapped])
    await logActivity('adviser_fee', data.id, 'created', `Adviser fee for ${fee.adviser_name} created`)
    return mapped
  }

  const updateFee = async (id: string, updates: any) => {
    const { error } = await supabase.from('adviser_fees').update(updates).eq('id', id)
    if (error) { toast.error('Failed to update fee'); return false }
    setFees(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f))
    await logActivity('adviser_fee', id, 'updated', `Adviser fee updated`)
    return true
  }

  const deleteFee = async (id: string) => {
    const { error } = await supabase.from('adviser_fees').delete().eq('id', id)
    if (error) { toast.error('Failed to delete fee'); return false }
    setFees(prev => prev.filter(f => f.id !== id))
    await logActivity('adviser_fee', id, 'deleted', `Adviser fee deleted`)
    return true
  }

  return { fees, clients, loading, fetchFees, addFee, updateFee, deleteFee }
}

// Workflow definitions CRUD
export function useWorkflows() {
  const [workflows, setWorkflows] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchWorkflows = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase.from('workflow_definitions').select('*').order('name')
    if (error) { toast.error('Failed to load workflows'); console.error(error) }
    setWorkflows(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchWorkflows() }, [fetchWorkflows])

  const addWorkflow = async (wf: any) => {
    const { data, error } = await supabase.from('workflow_definitions').insert(wf).select().single()
    if (error) { toast.error('Failed to create workflow'); return null }
    setWorkflows(prev => [...prev, data])
    await logActivity('workflow', data.id, 'created', `Workflow "${wf.name}" created`)
    return data
  }

  const updateWorkflow = async (id: string, updates: any) => {
    const { error } = await supabase.from('workflow_definitions').update(updates).eq('id', id)
    if (error) { toast.error('Failed to update workflow'); return false }
    setWorkflows(prev => prev.map(w => w.id === id ? { ...w, ...updates } : w))
    await logActivity('workflow', id, 'updated', `Workflow updated`)
    return true
  }

  const deleteWorkflow = async (id: string) => {
    const name = workflows.find(w => w.id === id)?.name
    const { error } = await supabase.from('workflow_definitions').delete().eq('id', id)
    if (error) { toast.error('Failed to delete workflow'); return false }
    setWorkflows(prev => prev.filter(w => w.id !== id))
    await logActivity('workflow', id, 'deleted', `Workflow "${name}" deleted`)
    return true
  }

  return { workflows, loading, fetchWorkflows, addWorkflow, updateWorkflow, deleteWorkflow }
}

// Consent records CRUD
export function useConsentRecords(clientId: string | undefined) {
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchRecords = useCallback(async () => {
    if (!clientId) return
    setLoading(true)
    const { data, error } = await supabase.from('consent_records').select('*').eq('client_id', clientId).order('consent_type')
    if (error) console.error(error)
    setRecords(data || [])
    setLoading(false)
  }, [clientId])

  useEffect(() => { fetchRecords() }, [fetchRecords])

  const setConsent = async (consentType: string, granted: boolean) => {
    const existing = records.find(r => r.consent_type === consentType)
    if (existing) {
      const updates = granted
        ? { granted: true, granted_at: new Date().toISOString(), withdrawn_at: null }
        : { granted: false, withdrawn_at: new Date().toISOString() }
      const { error } = await supabase.from('consent_records').update(updates).eq('id', existing.id)
      if (error) { toast.error('Failed to update consent'); return false }
      setRecords(prev => prev.map(r => r.id === existing.id ? { ...r, ...updates } : r))
    } else {
      const { data, error } = await supabase.from('consent_records').insert({
        client_id: clientId,
        consent_type: consentType,
        granted,
        granted_at: granted ? new Date().toISOString() : null,
      }).select().single()
      if (error) { toast.error('Failed to record consent'); return false }
      setRecords(prev => [...prev, data])
    }
    await logActivity('consent', clientId!, granted ? 'granted' : 'withdrawn', `${consentType} consent ${granted ? 'granted' : 'withdrawn'}`)
    return true
  }

  return { records, loading, fetchRecords, setConsent }
}

// Crystallisation segments CRUD
export interface CrystallisationSegment {
  id: string
  client_id: string
  account_id: string
  bce_event_id: string
  segment_type: string
  crystallised_amount: number
  pcls_amount: number
  residual_fund: number
  drawdown_type: string
  status: string
  created_at: string
  updated_at: string
}

export function useCrystallisationSegments(clientId: string | undefined) {
  const [segments, setSegments] = useState<CrystallisationSegment[]>([])
  const [loading, setLoading] = useState(true)

  const fetchSegments = useCallback(async () => {
    if (!clientId) return
    setLoading(true)
    const { data, error } = await supabase
      .from('crystallisation_segments')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })
    if (error) console.error(error)
    setSegments((data || []) as CrystallisationSegment[])
    setLoading(false)
  }, [clientId])

  useEffect(() => { fetchSegments() }, [fetchSegments])

  const addSegment = async (segment: Partial<CrystallisationSegment>) => {
    const payload = { ...segment, client_id: clientId }
    const { data, error } = await supabase.from('crystallisation_segments').insert(payload as any).select().single()
    if (error) { toast.error('Failed to add segment'); return null }
    setSegments(prev => [data as CrystallisationSegment, ...prev])
    return data as CrystallisationSegment
  }

  const updateSegment = async (id: string, updates: Partial<CrystallisationSegment>) => {
    const { error } = await supabase.from('crystallisation_segments').update(updates as any).eq('id', id)
    if (error) { toast.error('Failed to update segment'); return false }
    setSegments(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s))
    return true
  }

  return { segments, loading, fetchSegments, addSegment, updateSegment }
}

// Alerts engine - computed from real data
export function useAdminAlerts() {
  const [alerts, setAlerts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchAlerts = useCallback(async () => {
    setLoading(true)
    const computed: any[] = []

    // 1. Clients with no activity in 90+ days
    const { data: clients } = await supabase.from('clients').select('id, first_name, last_name, updated_at, status, annual_allowance_used')
    const now = new Date()
    ;(clients || []).forEach((c: any) => {
      const lastUpdate = new Date(c.updated_at)
      const daysSince = Math.floor((now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24))
      if (daysSince > 90 && c.status === 'active') {
        computed.push({ id: `review-${c.id}`, type: 'review_due', client: `${c.first_name} ${c.last_name}`, message: `No updates for ${daysSince} days — review may be overdue`, priority: daysSince > 180 ? 'high' : 'medium', timestamp: c.updated_at })
      }
      // 2. Annual allowance approaching limit
      const used = Number(c.annual_allowance_used) || 0
      if (used > 48000) {
        const pct = ((used / 60000) * 100).toFixed(0)
        computed.push({ id: `aa-${c.id}`, type: 'allowance_warning', client: `${c.first_name} ${c.last_name}`, message: `Annual allowance ${pct}% used (£${used.toLocaleString()} of £60,000)`, priority: used > 57000 ? 'high' : 'medium', timestamp: now.toISOString() })
      }
    })

    // 3. Pending transactions older than 7 days
    const { data: pendingTxns } = await supabase.from('transactions').select('id, description, created_at, status, clients(first_name, last_name)').eq('status', 'pending')
    ;(pendingTxns || []).forEach((t: any) => {
      const age = Math.floor((now.getTime() - new Date(t.created_at).getTime()) / (1000 * 60 * 60 * 24))
      if (age > 7) {
        const name = t.clients ? `${t.clients.first_name} ${t.clients.last_name}` : 'Unknown'
        computed.push({ id: `txn-${t.id}`, type: 'stale_transaction', client: name, message: `Transaction "${t.description}" pending for ${age} days`, priority: age > 14 ? 'high' : 'medium', timestamp: t.created_at })
      }
    })

    setAlerts(computed.sort((a, b) => (a.priority === 'high' ? -1 : 1) - (b.priority === 'high' ? -1 : 1)))
    setLoading(false)
  }, [])

  useEffect(() => { fetchAlerts() }, [fetchAlerts])
  return { alerts, loading, fetchAlerts }
}

// ============================================================
// CONTRIBUTIONS — with tax relief + AA tracking
// ============================================================
export interface Contribution {
  id: string
  client_id: string
  account_id: string
  contribution_type: string
  gross_amount: number
  net_amount: number
  tax_relief: number
  relief_method: string
  tax_year: string | null
  effective_date: string
  status: string
  reference: string | null
  notes: string | null
  created_at: string
}

function currentTaxYear(date = new Date()): string {
  const y = date.getFullYear()
  const apr6 = new Date(y, 3, 6)
  const start = date >= apr6 ? y : y - 1
  return `${start}/${(start + 1).toString().slice(-2)}`
}

export interface ContributionInput {
  clientId: string
  accountId: string
  type: 'member' | 'employer' | 'third_party'
  netAmount?: number       // member contributions usually net, gross-up by 25%
  grossAmount?: number     // employer contributions usually gross
  reliefMethod?: 'ras' | 'net_pay' | 'none'
  effectiveDate?: string
  notes?: string
}

export async function processContribution(input: ContributionInput) {
  const effectiveDate = input.effectiveDate || new Date().toISOString().slice(0, 10)
  const tax_year = currentTaxYear(new Date(effectiveDate))
  const reliefMethod = input.reliefMethod || (input.type === 'employer' ? 'none' : 'ras')

  let net = 0, relief = 0, gross = 0
  if (reliefMethod === 'ras') {
    net = Number(input.netAmount || 0)
    gross = +(net / 0.80).toFixed(2)
    relief = +(gross - net).toFixed(2)
  } else {
    gross = Number(input.grossAmount || input.netAmount || 0)
    net = gross
    relief = 0
  }

  // Insert contribution record
  const { data: contrib, error: cErr } = await supabase.from('contributions').insert({
    client_id: input.clientId,
    account_id: input.accountId,
    contribution_type: input.type,
    gross_amount: gross,
    net_amount: net,
    tax_relief: relief,
    relief_method: reliefMethod,
    tax_year,
    effective_date: effectiveDate,
    status: 'received',
    reference: `CON-${Date.now()}`,
    notes: input.notes,
  } as any).select().single()
  if (cErr) { toast.error(`Contribution failed: ${cErr.message}`); return null }

  // Net amount lands in cash now; relief follows later (RAS - typically a few weeks). For demo, we'll credit net immediately and add a separate relief transaction.
  const { data: account } = await supabase.from('client_accounts').select('cash_balance, total_value').eq('id', input.accountId).single()

  // Member net or employer gross hits cash
  await supabase.from('transactions').insert({
    client_id: input.clientId,
    account_id: input.accountId,
    transaction_type: input.type === 'employer' ? 'employer_contribution' : 'contribution',
    description: `${input.type === 'employer' ? 'Employer' : input.type === 'third_party' ? '3rd-party' : 'Member'} contribution${reliefMethod === 'ras' ? ' (net)' : ''}`,
    amount: net,
    status: 'settled',
    effective_date: effectiveDate,
    tax_year,
    reference: contrib.reference,
  } as any)

  // RAS tax relief
  if (relief > 0) {
    await supabase.from('transactions').insert({
      client_id: input.clientId,
      account_id: input.accountId,
      transaction_type: 'tax_relief',
      description: `Tax relief at source (20%)`,
      amount: relief,
      status: 'pending',
      effective_date: effectiveDate,
      tax_year,
      tax_relief_amount: relief,
      reference: `RAS-${contrib.id.slice(0, 8)}`,
    } as any)
  }

  // Update account balance
  if (account) {
    const credit = net + relief
    await supabase.from('client_accounts').update({
      cash_balance: Number(account.cash_balance || 0) + credit,
      total_value: Number(account.total_value || 0) + credit,
    } as any).eq('id', input.accountId)
  }

  // Update annual allowance used (gross counts)
  const { data: client } = await supabase.from('clients').select('annual_allowance_used, mpaa_triggered').eq('id', input.clientId).single()
  if (client) {
    const newUsed = Number(client.annual_allowance_used || 0) + gross
    await supabase.from('clients').update({ annual_allowance_used: newUsed } as any).eq('id', input.clientId)
    const limit = client.mpaa_triggered ? MPAA_ALLOWANCE : ANNUAL_ALLOWANCE
    if (newUsed > limit) {
      toast.warning(`Annual Allowance exceeded: £${newUsed.toLocaleString()} of £${limit.toLocaleString()}`)
    }
  }

  await logActivity('contribution', contrib.id, 'created',
    `${input.type} contribution: gross £${gross}, net £${net}, relief £${relief} (${tax_year})`)
  toast.success(`Contribution processed: gross £${gross.toLocaleString()}`)
  return contrib as Contribution
}

export function useContributions(clientId?: string) {
  const [contributions, setContributions] = useState<Contribution[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    setLoading(true)
    let q = supabase.from('contributions').select('*').order('effective_date', { ascending: false })
    if (clientId) q = q.eq('client_id', clientId)
    const { data, error } = await q
    if (error) { toast.error('Failed to load contributions') }
    setContributions((data || []) as Contribution[])
    setLoading(false)
  }, [clientId])

  useEffect(() => { fetch() }, [fetch])

  return { contributions, loading, fetch, processContribution }
}

// ============================================================
// TRANSFERS IN — full lifecycle
// ============================================================
export interface TransferIn {
  id: string
  client_id: string
  account_id: string | null
  ceding_scheme_name: string
  ceding_scheme_ref: string | null
  ceding_provider: string | null
  transfer_type: string
  estimated_value: number
  received_value: number | null
  contains_protected_tax_free_cash: boolean
  protected_tax_free_cash_pct: number | null
  contains_safeguarded_benefits: boolean
  status: string
  request_date: string
  completed_date: string | null
  origo_used: boolean
  notes: string | null
}

export function useTransfersIn(clientId?: string) {
  const [transfers, setTransfers] = useState<TransferIn[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    setLoading(true)
    let q = supabase.from('transfers_in').select('*').order('request_date', { ascending: false })
    if (clientId) q = q.eq('client_id', clientId)
    const { data, error } = await q
    if (error) { toast.error('Failed to load transfers') }
    setTransfers((data || []) as TransferIn[])
    setLoading(false)
  }, [clientId])

  useEffect(() => { fetch() }, [fetch])

  const createTransfer = async (t: Partial<TransferIn>) => {
    const { data, error } = await supabase.from('transfers_in').insert(t as any).select().single()
    if (error) { toast.error(`Failed: ${error.message}`); return null }
    setTransfers(prev => [data as TransferIn, ...prev])
    await logActivity('transfer_in', data.id, 'created', `Transfer requested from ${t.ceding_scheme_name} (£${t.estimated_value})`)
    return data as TransferIn
  }

  const updateStatus = async (id: string, status: string, extra: Partial<TransferIn> = {}) => {
    const updates: any = { status, ...extra }
    if (status === 'completed') updates.completed_date = new Date().toISOString().slice(0, 10)
    const { error } = await supabase.from('transfers_in').update(updates).eq('id', id)
    if (error) { toast.error('Update failed'); return false }
    setTransfers(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t))
    await logActivity('transfer_in', id, 'status_changed', `Status -> ${status}`)
    return true
  }

  const completeTransfer = async (id: string, receivedValue: number) => {
    const transfer = transfers.find(t => t.id === id)
    if (!transfer || !transfer.account_id) { toast.error('No account linked to transfer'); return false }

    // Insert transaction crediting account
    await supabase.from('transactions').insert({
      client_id: transfer.client_id,
      account_id: transfer.account_id,
      transaction_type: 'transfer_in',
      description: `Transfer in from ${transfer.ceding_scheme_name}`,
      amount: receivedValue,
      status: 'settled',
      effective_date: new Date().toISOString().slice(0, 10),
      reference: `TIN-${id.slice(0, 8)}`,
    } as any)

    // Credit account balance
    const { data: account } = await supabase.from('client_accounts').select('cash_balance, total_value').eq('id', transfer.account_id).single()
    if (account) {
      await supabase.from('client_accounts').update({
        cash_balance: Number(account.cash_balance || 0) + receivedValue,
        total_value: Number(account.total_value || 0) + receivedValue,
      } as any).eq('id', transfer.account_id)
    }

    return updateStatus(id, 'completed', { received_value: receivedValue })
  }

  return { transfers, loading, fetch, createTransfer, updateStatus, completeTransfer }
}

// ============================================================
// FEE CHARGES
// ============================================================
export interface FeeCharge {
  id: string
  client_id: string
  account_id: string
  fee_type: string
  description: string | null
  basis: string
  rate: number
  amount: number
  vat: number
  total: number
  period_start: string | null
  period_end: string | null
  charged_date: string
  status: string
  reference: string | null
}

export function useFeeCharges(clientId?: string) {
  const [charges, setCharges] = useState<FeeCharge[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    setLoading(true)
    let q = supabase.from('fee_charges').select('*').order('charged_date', { ascending: false })
    if (clientId) q = q.eq('client_id', clientId)
    const { data } = await q
    setCharges((data || []) as FeeCharge[])
    setLoading(false)
  }, [clientId])

  useEffect(() => { fetch() }, [fetch])

  const accrueFee = async (input: { clientId: string; accountId: string; feeType: string; basis: 'percent' | 'flat'; rate: number; description?: string; applyVat?: boolean; periodStart?: string; periodEnd?: string }) => {
    // Get account total to compute amount
    const { data: account } = await supabase.from('client_accounts').select('total_value').eq('id', input.accountId).single()
    const aum = Number(account?.total_value || 0)
    const amount = input.basis === 'percent' ? +(aum * (input.rate / 100)).toFixed(2) : +Number(input.rate).toFixed(2)
    const vat = input.applyVat ? +(amount * 0.20).toFixed(2) : 0
    const total = +(amount + vat).toFixed(2)

    const { data, error } = await supabase.from('fee_charges').insert({
      client_id: input.clientId,
      account_id: input.accountId,
      fee_type: input.feeType,
      description: input.description,
      basis: input.basis,
      rate: input.rate,
      amount,
      vat,
      total,
      period_start: input.periodStart,
      period_end: input.periodEnd,
      status: 'accrued',
      reference: `FEE-${Date.now()}`,
    } as any).select().single()
    if (error) { toast.error('Failed to accrue fee'); return null }
    setCharges(prev => [data as FeeCharge, ...prev])
    await logActivity('fee_charge', data.id, 'created', `Fee accrued: ${input.feeType} £${total}`)
    return data as FeeCharge
  }

  const chargeFee = async (id: string) => {
    const charge = charges.find(c => c.id === id)
    if (!charge) return false
    // Deduct from account cash
    const { data: account } = await supabase.from('client_accounts').select('cash_balance, total_value').eq('id', charge.account_id).single()
    if (!account) { toast.error('Account not found'); return false }
    if (Number(account.cash_balance) < charge.total) {
      toast.error(`Insufficient cash: £${account.cash_balance} available, £${charge.total} required`)
      return false
    }
    await supabase.from('client_accounts').update({
      cash_balance: Number(account.cash_balance) - charge.total,
      total_value: Number(account.total_value) - charge.total,
    } as any).eq('id', charge.account_id)
    await supabase.from('transactions').insert({
      client_id: charge.client_id,
      account_id: charge.account_id,
      transaction_type: 'fee',
      description: `${charge.fee_type} fee${charge.description ? ': ' + charge.description : ''}`,
      amount: -charge.total,
      status: 'settled',
      effective_date: new Date().toISOString().slice(0, 10),
      reference: charge.reference,
    } as any)
    await supabase.from('fee_charges').update({ status: 'charged', charged_date: new Date().toISOString().slice(0, 10) } as any).eq('id', id)
    setCharges(prev => prev.map(c => c.id === id ? { ...c, status: 'charged' } : c))
    await logActivity('fee_charge', id, 'updated', `Fee charged: £${charge.total}`)
    toast.success(`Fee charged: £${charge.total}`)
    return true
  }

  return { charges, loading, fetch, accrueFee, chargeFee }
}

// ============================================================
// VALUATIONS
// ============================================================
export function useValuations(clientId?: string) {
  const [valuations, setValuations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    setLoading(true)
    let q = supabase.from('valuations').select('*').order('valuation_date', { ascending: false })
    if (clientId) q = q.eq('client_id', clientId)
    const { data } = await q
    setValuations(data || [])
    setLoading(false)
  }, [clientId])

  useEffect(() => { fetch() }, [fetch])

  const snapshot = async (cId: string) => {
    // Snapshot every account for client
    const { data: accounts } = await supabase.from('client_accounts').select('*').eq('client_id', cId)
    const { data: invs } = await supabase.from('investments').select('*').eq('client_id', cId)
    let count = 0
    for (const a of accounts || []) {
      const accountInvValue = (invs || []).filter((i: any) => i.account_id === a.id).reduce((s: number, i: any) => s + Number(i.current_value || 0), 0)
      await supabase.from('valuations').insert({
        client_id: cId,
        account_id: a.id,
        valuation_date: new Date().toISOString().slice(0, 10),
        cash_balance: a.cash_balance,
        investments_value: accountInvValue,
        total_value: Number(a.cash_balance || 0) + accountInvValue,
        source: 'system',
      } as any)
      count++
    }
    await fetch()
    await logActivity('valuation', cId, 'created', `Valuation snapshot taken for ${count} account(s)`)
    toast.success(`${count} account(s) valued`)
    return count
  }

  return { valuations, loading, fetch, snapshot }
}

// ============================================================
// DEATH CLAIMS & BENEFIT PAYMENTS
// ============================================================
export function useDeathClaims(clientId?: string) {
  const [claims, setClaims] = useState<any[]>([])
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    setLoading(true)
    let cq = supabase.from('death_claims').select('*').order('notified_date', { ascending: false })
    if (clientId) cq = cq.eq('client_id', clientId)
    const [cRes, pRes] = await Promise.all([
      cq,
      clientId
        ? supabase.from('death_benefit_payments').select('*').eq('client_id', clientId)
        : supabase.from('death_benefit_payments').select('*'),
    ])
    setClaims(cRes.data || [])
    setPayments(pRes.data || [])
    setLoading(false)
  }, [clientId])

  useEffect(() => { fetch() }, [fetch])

  const openClaim = async (input: { clientId: string; dateOfDeath: string; cause?: string }) => {
    // Compute total pot
    const { data: accs } = await supabase.from('client_accounts').select('total_value').eq('client_id', input.clientId)
    const total = (accs || []).reduce((s: number, a: any) => s + Number(a.total_value || 0), 0)

    // Determine pre/post-75 from DOB
    const { data: client } = await supabase.from('clients').select('date_of_birth').eq('id', input.clientId).single()
    let pre75 = true
    if (client?.date_of_birth) {
      const dob = new Date(client.date_of_birth)
      const dod = new Date(input.dateOfDeath)
      const age = (dod.getTime() - dob.getTime()) / (365.25 * 24 * 3600 * 1000)
      pre75 = age < 75
    }

    const { data, error } = await supabase.from('death_claims').insert({
      client_id: input.clientId,
      date_of_death: input.dateOfDeath,
      cause_of_death: input.cause,
      total_pot_value: total,
      pre_75: pre75,
      status: 'opened',
    } as any).select().single()
    if (error) { toast.error('Failed to open claim'); return null }
    // Mark client deceased
    await supabase.from('clients').update({ status: 'deceased' } as any).eq('id', input.clientId)
    setClaims(prev => [data, ...prev])
    await logActivity('death_claim', data.id, 'created', `Death claim opened (pot £${total.toLocaleString()}, ${pre75 ? 'pre-75' : 'post-75'})`)
    toast.success('Death claim opened')
    return data
  }

  const generatePayments = async (claimId: string) => {
    const claim = claims.find(c => c.id === claimId)
    if (!claim) return false
    const { data: bens } = await supabase.from('beneficiaries').select('*').eq('client_id', claim.client_id)
    if (!bens || bens.length === 0) { toast.error('No beneficiaries on file'); return false }

    // Allocate by allocation_pct (default equal split if zeros)
    const totalPct = bens.reduce((s: number, b: any) => s + Number(b.allocation_pct || 0), 0)
    const usePct = totalPct > 0 ? totalPct : 100
    const equalSplit = totalPct === 0

    for (const b of bens) {
      const pct = equalSplit ? (100 / bens.length) : Number(b.allocation_pct || 0)
      const gross = +(claim.total_pot_value * (pct / usePct)).toFixed(2)
      // Pre-75 lump sum: tax-free up to LSDBA. Post-75: taxed at recipient marginal rate (assume 20% withholding for demo)
      const tax = claim.pre_75 ? 0 : +(gross * 0.20).toFixed(2)
      const net = +(gross - tax).toFixed(2)
      await supabase.from('death_benefit_payments').insert({
        death_claim_id: claimId,
        client_id: claim.client_id,
        beneficiary_id: b.id,
        beneficiary_name: b.name,
        payment_type: 'lump_sum',
        gross_amount: gross,
        tax_amount: tax,
        net_amount: net,
        status: 'pending',
      } as any)
    }
    await supabase.from('death_claims').update({ status: 'in_payment' } as any).eq('id', claimId)
    await fetch()
    await logActivity('death_claim', claimId, 'updated', `Generated payments for ${bens.length} beneficiaries`)
    toast.success(`Generated ${bens.length} payment(s)`)
    return true
  }

  const settlePayment = async (paymentId: string) => {
    const payment = payments.find(p => p.id === paymentId)
    if (!payment) return false
    await supabase.from('death_benefit_payments').update({
      status: 'paid',
      paid_date: new Date().toISOString().slice(0, 10),
    } as any).eq('id', paymentId)
    await fetch()
    toast.success(`Paid £${payment.net_amount} to ${payment.beneficiary_name}`)
    return true
  }

  return { claims, payments, loading, fetch, openClaim, generatePayments, settlePayment }
}

// ============================================================
// STATEMENTS — generation
// ============================================================
export function useStatements(clientId?: string) {
  const [statements, setStatements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    setLoading(true)
    let q = supabase.from('statements').select('*').order('period_end', { ascending: false })
    if (clientId) q = q.eq('client_id', clientId)
    const { data } = await q
    setStatements(data || [])
    setLoading(false)
  }, [clientId])

  useEffect(() => { fetch() }, [fetch])

  const generateAnnual = async (cId: string, taxYearStart: number) => {
    const periodStart = `${taxYearStart}-04-06`
    const periodEnd = `${taxYearStart + 1}-04-05`

    // Pull data for period
    const [accountsRes, txnsRes, contribsRes, feesRes] = await Promise.all([
      supabase.from('client_accounts').select('*').eq('client_id', cId),
      supabase.from('transactions').select('*').eq('client_id', cId).gte('effective_date', periodStart).lte('effective_date', periodEnd),
      supabase.from('contributions').select('*').eq('client_id', cId).gte('effective_date', periodStart).lte('effective_date', periodEnd),
      supabase.from('fee_charges').select('*').eq('client_id', cId).eq('status', 'charged').gte('charged_date', periodStart).lte('charged_date', periodEnd),
    ])

    const closing = (accountsRes.data || []).reduce((s: number, a: any) => s + Number(a.total_value || 0), 0)
    const contributionsTotal = (contribsRes.data || []).reduce((s: number, c: any) => s + Number(c.gross_amount || 0), 0)
    const withdrawalsTotal = (txnsRes.data || [])
      .filter((t: any) => ['drawdown', 'pcls', 'ufpls_taxable'].includes(t.transaction_type))
      .reduce((s: number, t: any) => s + Math.abs(Number(t.amount || 0)), 0)
    const feesTotal = (feesRes.data || []).reduce((s: number, f: any) => s + Number(f.total || 0), 0)
    const opening = closing - contributionsTotal + withdrawalsTotal + feesTotal // approximation
    const growth = closing - opening - contributionsTotal + withdrawalsTotal + feesTotal

    const { data, error } = await supabase.from('statements').insert({
      client_id: cId,
      statement_type: 'annual',
      period_start: periodStart,
      period_end: periodEnd,
      opening_value: Math.max(0, opening),
      closing_value: closing,
      contributions_total: contributionsTotal,
      withdrawals_total: withdrawalsTotal,
      fees_total: feesTotal,
      growth,
      payload: {
        accounts: accountsRes.data,
        transaction_count: (txnsRes.data || []).length,
        contribution_count: (contribsRes.data || []).length,
      },
    } as any).select().single()
    if (error) { toast.error(`Statement failed: ${error.message}`); return null }
    setStatements(prev => [data, ...prev])
    await logActivity('statement', data.id, 'created', `Annual statement ${taxYearStart}/${taxYearStart + 1} generated`)
    toast.success('Annual statement generated')
    return data
  }

  return { statements, loading, fetch, generateAnnual }
}
