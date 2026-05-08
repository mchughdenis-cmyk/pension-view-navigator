// Shared seeded demo banking accounts used by InstantDeposit + InstantWithdrawal
export interface DemoBankAccount {
  id: string;
  accountName: string;
  accountNumber: string;
  sortCode: string;
  bankName: string;
  isDefault: boolean;
  balance: number;
}

export const DEMO_BANK_ACCOUNTS: DemoBankAccount[] = [
  { id: "s1", accountName: "Main Current Account", accountNumber: "12345678", sortCode: "12-34-56", bankName: "Lloyds Bank", isDefault: true, balance: 18540 },
  { id: "s2", accountName: "Joint Savings", accountNumber: "87654321", sortCode: "65-43-21", bankName: "HSBC", isDefault: false, balance: 42130 },
  { id: "s3", accountName: "Premium Reserve", accountNumber: "55667788", sortCode: "20-11-04", bankName: "Barclays", isDefault: false, balance: 7820 },
];

export const maskAccount = (s: string, show: boolean, keep = 4) =>
  show ? s : "•".repeat(Math.max(0, s.length - keep)) + s.slice(-keep);
