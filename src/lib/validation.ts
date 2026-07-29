import { z } from "zod";

// UK sort code: 6 digits, optionally split by dashes/spaces (e.g. "20-00-00")
export const sortCodeSchema = z
  .string()
  .transform((s) => s.replace(/[-\s]/g, ""))
  .refine((s) => /^\d{6}$/.test(s), "Sort code must be 6 digits (e.g. 20-00-00)");

// UK bank account number: 8 digits
export const ukAccountSchema = z
  .string()
  .transform((s) => s.replace(/\s/g, ""))
  .refine((s) => /^\d{8}$/.test(s), "Account number must be 8 digits");

export const paymentAmountSchema = z
  .number({ invalid_type_error: "Amount must be a number" })
  .positive("Amount must be greater than zero")
  .max(10_000_000, "Amount exceeds sanity limit (£10m)");

export const paymentInstructionSchema = z.object({
  purpose: z.string().min(1),
  amount: paymentAmountSchema,
  beneficiary_name: z.string().min(2, "Beneficiary name required"),
  beneficiary_sort_code: sortCodeSchema,
  beneficiary_account: ukAccountSchema,
  beneficiary_reference: z.string().max(18, "Bacs reference max 18 chars").optional(),
  payment_method: z.enum(["bacs", "chaps", "faster_payments", "internal_transfer", "cheque"]),
  requested_date: z.string().min(1),
});

export type PaymentInstructionInput = z.infer<typeof paymentInstructionSchema>;

/** Format a validated 6-digit sort code as "NN-NN-NN" */
export function formatSortCode(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length !== 6) return raw;
  return `${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(4, 6)}`;
}
