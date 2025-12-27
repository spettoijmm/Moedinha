import React from 'react';
import { ArrowUpCircle, ArrowDownCircle, Wallet } from 'lucide-react';
import { Transaction } from '../types';

interface SummaryCardsProps {
  transactions: Transaction[];
}

const SummaryCards: React.FC<SummaryCardsProps> = ({ transactions }) => {
  const summary = transactions.reduce(
    (acc, curr) => {
      if (curr.type === 'income') {
        acc.totalIncome += curr.amount;
        acc.totalBalance += curr.amount;
      } else {
        acc.totalExpense += curr.amount;
        acc.totalBalance -= curr.amount;
      }
      return acc;
    },
    { totalBalance: 0, totalIncome: 0, totalExpense: 0 }
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-indigo-600 text-white p-6 rounded-[24px] shadow-lg flex flex-col justify-between h-32 relative overflow-hidden">
        <div className="z-10">
          <p className="text-indigo-100 text-sm font-medium">Saldo Total</p>
          <h2 className="text-3xl font-bold mt-1">R$ {summary.totalBalance.toFixed(2)}</h2>
        </div>
        <Wallet className="absolute right-4 bottom-4 opacity-20 w-16 h-16" />
      </div>

      <div className="bg-emerald-100 text-emerald-900 p-6 rounded-[24px] shadow-sm flex items-center justify-between">
        <div>
          <p className="text-emerald-700 text-sm font-medium mb-1">Receitas</p>
          <h3 className="text-2xl font-bold text-emerald-700">+R$ {summary.totalIncome.toFixed(2)}</h3>
        </div>
        <div className="bg-white p-3 rounded-full">
          <ArrowUpCircle className="w-8 h-8 text-emerald-600" />
        </div>
      </div>

      <div className="bg-red-100 text-red-900 p-6 rounded-[24px] shadow-sm flex items-center justify-between">
        <div>
          <p className="text-red-700 text-sm font-medium mb-1">Despesas</p>
          <h3 className="text-2xl font-bold text-red-700">-R$ {summary.totalExpense.toFixed(2)}</h3>
        </div>
        <div className="bg-white p-3 rounded-full">
          <ArrowDownCircle className="w-8 h-8 text-red-600" />
        </div>
      </div>
    </div>
  );
};

export default SummaryCards;
