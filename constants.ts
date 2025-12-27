import { 
  ChartPie, ShoppingBag, Coffee, Car, Home, DollarSign, Briefcase, 
  Zap, HeartPulse, GraduationCap, Wallet, Building2, TrendingUp, CircleDollarSign,
  ArrowRightLeft
} from 'lucide-react';
import { CategoryItem } from './types';

export const CATEGORIES: CategoryItem[] = [
  // Expenses
  { id: 'food', label: 'Alimentação', icon: Coffee, color: 'bg-orange-100 text-orange-600', type: 'expense' },
  { id: 'shopping', label: 'Compras', icon: ShoppingBag, color: 'bg-blue-100 text-blue-600', type: 'expense' },
  { id: 'transport', label: 'Transporte', icon: Car, color: 'bg-yellow-100 text-yellow-600', type: 'expense' },
  { id: 'housing', label: 'Moradia', icon: Home, color: 'bg-indigo-100 text-indigo-600', type: 'expense' },
  { id: 'utilities', label: 'Contas', icon: Zap, color: 'bg-purple-100 text-purple-600', type: 'expense' },
  { id: 'health', label: 'Saúde', icon: HeartPulse, color: 'bg-red-100 text-red-600', type: 'expense' },
  { id: 'education', label: 'Educação', icon: GraduationCap, color: 'bg-pink-100 text-pink-600', type: 'expense' },
  
  // Income
  { id: 'salary', label: 'Salário', icon: DollarSign, color: 'bg-emerald-100 text-emerald-600', type: 'income' },
  { id: 'freelance', label: 'Freelance', icon: Briefcase, color: 'bg-teal-100 text-teal-600', type: 'income' },
  { id: 'investment_return', label: 'Rendimentos', icon: TrendingUp, color: 'bg-green-100 text-green-600', type: 'income' },
  
  // Both/Transfer
  { id: 'transfer', label: 'Transferência', icon: ArrowRightLeft, color: 'bg-gray-100 text-gray-600', type: 'both' },
  { id: 'other', label: 'Outros', icon: ChartPie, color: 'bg-gray-100 text-gray-600', type: 'both' },
];

export const ACCOUNT_TYPES = [
  { id: 'wallet', label: 'Carteira', icon: Wallet },
  { id: 'bank', label: 'Banco', icon: Building2 },
  { id: 'investment', label: 'Investimento', icon: TrendingUp },
  { id: 'other', label: 'Outros', icon: CircleDollarSign },
];

export const FREQUENCIES = [
    { id: 'weekly', label: 'Semanal', days: 7 },
    { id: 'biweekly', label: 'Quinzenal', days: 15 },
    { id: 'monthly', label: 'Mensal', days: 30 },
    { id: 'semiannual', label: 'Semestral', days: 180 },
    { id: 'yearly', label: 'Anual', days: 365 },
];

export const M3_COLORS = {
  primary: 'bg-indigo-600',
  primaryContainer: 'bg-indigo-100',
  onPrimaryContainer: 'text-indigo-900',
  surface: 'bg-white',
  background: 'bg-slate-50',
};
