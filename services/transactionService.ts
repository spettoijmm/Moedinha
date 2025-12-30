
import { Transaction, Account, Budget, UserProfile, RecurrenceFrequency, CategoryItem } from '../types';
import { FREQUENCIES, CATEGORIES as DEFAULT_CATEGORIES } from '../constants';

const STORAGE_KEY_TRANSACTIONS = 'finance_flow_transactions';
const STORAGE_KEY_ACCOUNTS = 'finance_flow_accounts';
const STORAGE_KEY_BUDGETS = 'finance_flow_budgets';
const STORAGE_KEY_USER = 'finance_flow_user';
const STORAGE_KEY_CATEGORIES = 'finance_flow_categories';

type Listener = () => void;

class TransactionService {
  private listeners: Listener[] = [];

  constructor() {
    this.initializeDefaults();
  }

  private initializeDefaults() {
    if (!localStorage.getItem(STORAGE_KEY_CATEGORIES)) {
        const initialCats = DEFAULT_CATEGORIES.map(c => ({
            ...c,
            iconName: c.id 
        }));
        localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(initialCats));
    }
  }

  subscribe(callback: Listener): () => void {
    this.listeners.push(callback);
    callback();
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener());
  }

  exportData(): string {
      const data = {
          transactions: this.getTransactions(),
          accounts: JSON.parse(localStorage.getItem(STORAGE_KEY_ACCOUNTS) || '[]'),
          budgets: this.getBudgets(),
          categories: this.getCategories(),
          user: this.getUser(),
          timestamp: new Date().toISOString()
      };
      return JSON.stringify(data);
  }

  importData(jsonString: string): boolean {
      try {
          const data = JSON.parse(jsonString);
          if (!data.user || !data.transactions) return false;
          localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(data.transactions));
          localStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(data.accounts));
          localStorage.setItem(STORAGE_KEY_BUDGETS, JSON.stringify(data.budgets));
          localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(data.categories));
          localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(data.user));
          this.notifyListeners();
          return true;
      } catch (e) {
          console.error(e);
          return false;
      }
  }

  getUser(): UserProfile | null {
    const raw = localStorage.getItem(STORAGE_KEY_USER);
    return raw ? JSON.parse(raw) : null;
  }

  registerUser(username: string, pin: string): void {
    const user: UserProfile = { username, pin, avatar: '👤', biometricsEnabled: true };
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    if (!localStorage.getItem(STORAGE_KEY_ACCOUNTS)) {
         const initialAccounts: Account[] = [{ id: 'acc1', name: 'Carteira', type: 'wallet', balance: 0, color: '#6366f1' }];
         localStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(initialAccounts));
         localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify([]));
    }
    this.notifyListeners();
  }

  updateUser(updates: Partial<UserProfile>): void {
      const current = this.getUser();
      if (current) {
          localStorage.setItem(STORAGE_KEY_USER, JSON.stringify({ ...current, ...updates }));
          this.notifyListeners();
      }
  }

  login(pin: string): boolean {
      const user = this.getUser();
      return user ? user.pin === pin : false;
  }

  logout(): void {}

  getCategories(): CategoryItem[] {
      const raw = localStorage.getItem(STORAGE_KEY_CATEGORIES);
      return raw ? JSON.parse(raw) : [];
  }

  addCategory(category: Omit<CategoryItem, 'id'>): void {
      const current = this.getCategories();
      const newCat: CategoryItem = { ...category, id: `custom_${crypto.randomUUID()}`, isCustom: true };
      localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify([...current, newCat]));
      this.notifyListeners();
  }

  deleteCategory(id: string): void {
      const updated = this.getCategories().filter(c => c.id !== id);
      localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(updated));
      this.notifyListeners();
  }

  getTransactions(): Transaction[] {
    const raw = localStorage.getItem(STORAGE_KEY_TRANSACTIONS);
    return raw ? JSON.parse(raw) : [];
  }

  addTransaction(transaction: Omit<Transaction, 'id'>, recurrenceSettings?: { frequency: RecurrenceFrequency, isInfinite: boolean, count?: number }): void {
    const current = this.getTransactions();
    const newTransactions: Transaction[] = [];
    const parentId = crypto.randomUUID();

    if (!recurrenceSettings) {
        newTransactions.push({ ...transaction, id: crypto.randomUUID() });
    } else {
        const { frequency, isInfinite, count } = recurrenceSettings;
        const iterations = isInfinite ? 24 : (count || 1); 
        const freqInfo = FREQUENCIES.find(f => f.id === frequency) || FREQUENCIES[2]; 
        const baseDate = new Date(transaction.date);
        const amountPerTx = isInfinite ? transaction.amount : (transaction.amount / iterations);

        for (let i = 0; i < iterations; i++) {
            const date = new Date(baseDate);
            if (frequency === 'monthly') date.setMonth(baseDate.getMonth() + i);
            else if (frequency === 'yearly') date.setFullYear(baseDate.getFullYear() + i);
            else if (frequency === 'semiannual') date.setMonth(baseDate.getMonth() + (i * 6));
            else date.setDate(baseDate.getDate() + (i * freqInfo.days));

            newTransactions.push({
                ...transaction,
                id: crypto.randomUUID(),
                amount: amountPerTx,
                date: date.toISOString(),
                title: isInfinite ? transaction.title : `${transaction.title} (${i + 1}/${iterations})`,
                recurrence: { frequency, isInfinite, current: i + 1, total: isInfinite ? undefined : iterations, parentId }
            });
        }
    }
    localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify([...newTransactions, ...current]));
    this.notifyListeners();
  }

  addTransfer(fromAccountId: string, toAccountId: string, amount: number, date: string, title: string) {
      const current = this.getTransactions();
      const updated = [
          { id: crypto.randomUUID(), title: `Envio: ${title}`, amount, date, type: 'expense' as const, category: 'transfer', accountId: fromAccountId },
          { id: crypto.randomUUID(), title: `Recebimento: ${title}`, amount, date, type: 'income' as const, category: 'transfer', accountId: toAccountId },
          ...current
      ];
      localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(updated));
      this.notifyListeners();
  }

  deleteTransaction(id: string): void {
    const updated = this.getTransactions().filter(t => t.id !== id);
    localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(updated));
    this.notifyListeners();
  }

  getAccounts(): Account[] {
    const raw = localStorage.getItem(STORAGE_KEY_ACCOUNTS);
    const accounts: Account[] = raw ? JSON.parse(raw) : [];
    const transactions = this.getTransactions();
    return accounts.map(acc => {
      const accTransactions = transactions.filter(t => t.accountId === acc.id);
      const balance = accTransactions.reduce((sum, t) => {
        if (t.type === 'income') return sum + t.amount;
        if (t.type === 'expense') return sum - t.amount;
        return sum;
      }, 0);
      return { ...acc, balance };
    });
  }

  addAccount(account: Omit<Account, 'id' | 'balance'>): void {
    const raw = localStorage.getItem(STORAGE_KEY_ACCOUNTS);
    const current: Account[] = raw ? JSON.parse(raw) : [];
    localStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify([...current, { ...account, id: crypto.randomUUID(), balance: 0 }]));
    this.notifyListeners();
  }

  getBudgets(): Budget[] {
    const raw = localStorage.getItem(STORAGE_KEY_BUDGETS);
    return raw ? JSON.parse(raw) : [];
  }

  setBudget(budget: Budget): void {
    const current = this.getBudgets();
    const existingIndex = current.findIndex(b => b.id === budget.id);
    let updated;
    if (existingIndex >= 0) {
      updated = [...current];
      updated[existingIndex] = budget;
    } else {
      updated = [...current, budget];
    }
    localStorage.setItem(STORAGE_KEY_BUDGETS, JSON.stringify(updated));
    this.notifyListeners();
  }

  deleteBudget(id: string): void {
      const updated = this.getBudgets().filter(b => b.id !== id);
      localStorage.setItem(STORAGE_KEY_BUDGETS, JSON.stringify(updated));
      this.notifyListeners();
  }

  getBudgetAlerts(): { budget: Budget; spent: number }[] {
    const budgets = this.getBudgets();
    const transactions = this.getTransactions();
    const now = new Date();
    return budgets.map(b => {
        const spent = transactions
        .filter(t => b.categoryIds.includes(t.category) && t.type === 'expense' && new Date(t.date).getMonth() === now.getMonth() && new Date(t.date).getFullYear() === now.getFullYear())
        .reduce((sum, t) => sum + t.amount, 0);
        return { budget: b, spent };
    }).filter(item => item.spent > item.budget.limit);
  }
}

export const transactionService = new TransactionService();
