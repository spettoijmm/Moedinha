export type TransactionType = 'income' | 'expense' | 'transfer';

export type RecurrenceFrequency = 'weekly' | 'biweekly' | 'monthly' | 'semiannual' | 'yearly' | 'custom';

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  date: string; // ISO Date string
  type: TransactionType;
  category: string;
  accountId: string; 
  destinationAccountId?: string; 
  // Recurrence / Installment logic
  recurrence?: {
    frequency: RecurrenceFrequency;
    isInfinite: boolean;
    current?: number; // 1 of 12
    total?: number;   // 12
    parentId?: string; // Links related transactions
  };
}

export interface Account {
  id: string;
  name: string;
  type: 'wallet' | 'bank' | 'investment' | 'other';
  balance: number;
  color: string;
  iconName?: string; // Nome do ícone para persistência
}

export interface Budget {
  id: string;
  name: string; // Custom name for the plan
  categoryIds: string[]; // Supports multiple categories
  limit: number;
  isLocked: boolean;
  period: 'monthly' | 'yearly';
}

export interface TransactionSummary {
  totalBalance: number;
  totalIncome: number;
  totalExpense: number;
}

export interface UserProfile {
  username: string;
  pin: string; // 8 digits
  avatar?: string; // Emoji or generic identifier
  biometricsEnabled?: boolean;
}

export interface CategoryItem {
  id: string;
  label: string;
  iconName?: string; // Changed to optional to store icon name for persistence, might be missing in constants
  icon?: any; // Added to store React component reference in runtime constants
  color: string;
  type: 'income' | 'expense' | 'both';
  isCustom?: boolean;
}