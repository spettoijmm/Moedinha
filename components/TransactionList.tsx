import React from 'react';
import { Trash2 } from 'lucide-react';
import { Transaction } from '../types';
import { CATEGORIES } from '../constants';
import { transactionService } from '../services/transactionService';

interface TransactionListProps {
  transactions: Transaction[];
  limit?: number;
}

const TransactionList: React.FC<TransactionListProps> = ({ transactions, limit }) => {
  const handleDelete = (id: string) => {
    if (window.confirm('Excluir esta transação?')) {
      transactionService.deleteTransaction(id);
    }
  };

  const displayTransactions = limit ? transactions.slice(0, limit) : transactions;

  if (transactions.length === 0) {
    return (
      <div className="text-center py-10 flex flex-col items-center justify-center h-full">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
          <span className="text-2xl">🥥</span>
        </div>
        <p className="text-gray-400 font-medium">Nenhuma transação encontrada.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 pb-20">
      {displayTransactions.map((t) => {
        const cat = CATEGORIES.find(c => c.id === t.category);
        const CategoryIcon = cat?.icon || CATEGORIES[0].icon;
        const colorClass = cat?.color || 'bg-gray-100 text-gray-600';
        
        return (
          <div key={t.id} className="group bg-white p-4 rounded-[20px] shadow-sm border border-gray-50 flex items-center justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-full ${colorClass} bg-opacity-20`}>
                <CategoryIcon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">{t.title}</h4>
                <p className="text-xs text-gray-500 capitalize">{cat?.label} • {new Date(t.date).toLocaleDateString('pt-BR')}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className={`font-bold text-base ${t.type === 'income' ? 'text-emerald-600' : 'text-gray-900'}`}>
                {t.type === 'income' ? '+' : '-'} R$ {t.amount.toFixed(2)}
              </span>
              <button 
                onClick={() => handleDelete(t.id)}
                className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-all p-2"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TransactionList;
