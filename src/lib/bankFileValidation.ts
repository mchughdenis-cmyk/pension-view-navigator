import { z } from 'zod'

export const BankEntrySchema = z.object({
  date: z.string().min(1, 'Date is required').max(20),
  description: z.string().min(1, 'Description is required').max(500, 'Description too long'),
  amount: z.number().min(-10000000, 'Amount too small').max(10000000, 'Amount too large'),
  reference: z.string().max(100, 'Reference too long'),
})

export const BankFileSchema = z.object({
  filename: z.string().min(1, 'Filename is required').max(255, 'Filename too long').regex(/^[a-zA-Z0-9_. ()\-]+$/, 'Invalid filename characters'),
  entries: z.array(BankEntrySchema).min(1, 'At least one entry required').max(10000, 'Too many entries (max 10,000)'),
})

export type ValidatedBankEntry = z.infer<typeof BankEntrySchema>
export type ValidatedBankFile = z.infer<typeof BankFileSchema>
