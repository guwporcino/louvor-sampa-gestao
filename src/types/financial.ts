
export interface BankAccount {
  id: string;
  name: string;
  bank: string;
  agency: string;
  account_number: string;
  account_type: string;
  active: boolean;
  created_at: string;
}

export interface IncomeCategory {
  id: string;
  name: string;
  description?: string;
  type: string;
  active: boolean;
  created_at: string;
}

export interface ExpenseCategory {
  id: string;
  name: string;
  description?: string;
  type: string;
  active: boolean;
  created_at: string;
}

export interface IncomeTransaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  category_id: string;
  bank_account_id?: string;
  is_paid: boolean;
  payment_date?: string;
  notes?: string;
  reference_number?: string;
  document_url?: string;
  created_at: string;
  category?: IncomeCategory;
  bank_account?: BankAccount;
}

export interface ExpenseTransaction {
  id: string;
  description: string;
  amount: number;
  due_date: string;
  category_id: string;
  bank_account_id?: string;
  is_paid: boolean;
  payment_date?: string;
  notes?: string;
  reference_number?: string;
  document_url?: string;
  created_at: string;
  category?: ExpenseCategory;
  bank_account?: BankAccount;
}

export type ExportFormat = 'pdf' | 'excel';
