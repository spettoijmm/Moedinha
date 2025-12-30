
import React, { useState, useEffect } from 'react';
import { Plus, ArrowLeft } from 'lucide-react';
import { Account, Transaction } from '../types';
import { transactionService } from '../services/transactionService';
import { ACCOUNT_TYPES } from '../constants';
import TransactionList from './TransactionList';

const AccountsScreen: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newAccName, setNewAccName] = useState('');
  const [newAccType, setNewAccType] = useState('wallet');
  
  // Detail View State
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [detailFilter, setDetailFilter] = useState<'all' | 'income' | 'expense'>('all');

  useEffect(() => {
    const fetchData = () => {
        setAccounts(transactionService.getAccounts());
        setTransactions(transactionService.getTransactions());
    };
    fetchData();
    const unsubscribe = transactionService.subscribe(fetchData);
    return () => unsubscribe();
  }, []);

  const handleAddAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccName) return;
    transactionService.addAccount({
        name: newAccName,
        type: newAccType as any,
        color: '#6366f1'
    });
    setIsAdding(false);
    setNewAccName('');
  };

  // Logic for Detailed View
  if (selectedAccount) {
      const currentAccountData = accounts.find(a => a.id === selectedAccount.id) || selectedAccount;
      
      const accountTransactions = transactions
        .filter(t => t.accountId === selectedAccount.id)
        .filter(t => detailFilter === 'all' ? true : t.type === detailFilter)
        .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      return (
          <div className="p-6 pb-24 h-full flex flex-col animate-fade-in">
              <header className="mb-6 flex items-center gap-4">
                <button onClick={() => setSelectedAccount(null)} className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-100">
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <div>
                   <h1 className="text-xl font-bold text-gray-900">{currentAccountData.name}</h1>
                   <p className="text-gray-500 text-sm">Extrato Detalhado</p>
                </div>
              </header>

              <div className="bg-indigo-600 text-white p-6 rounded-[24px] shadow-lg mb-6 flex flex-col items-center justify-center">
                  <p className="text-indigo-200 text-sm font-medium">Saldo Atual</p>
                  <h2 className="text-4xl font-bold mt-1">R$ {currentAccountData.balance.toFixed(2)}</h2>
              </div>

              <div className="flex bg-gray-200 p-1 rounded-xl mb-6 shrink-0">
                  <button onClick={() => setDetailFilter('all')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${detailFilter === 'all' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500'}`}>Tudo</button>
                  <button onClick={() => setDetailFilter('income')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${detailFilter === 'income' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500'}`}>Entradas</button>
                  <button onClick={() => setDetailFilter('expense')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${detailFilter === 'expense' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500'}`}>Saídas</button>
              </div>

              <div className="flex-1 overflow-y-auto">
                 <TransactionList transactions={accountTransactions} />
              </div>
          </div>
      );
  }

  // Main List View
  return (
    <div className="p-6 pb-24">
      <header className="mb-8 flex justify-between items-center">
        <div>
           <h1 className="text-2xl font-bold text-gray-900">Minhas Contas</h1>
           <p className="text-gray-500 text-sm">Gerencie carteiras e bancos</p>
        </div>
        <button 
            onClick={() => setIsAdding(!isAdding)}
            className="w-10 h-10 bg-indigo-600 rounded-full text-white flex items-center justify-center shadow-lg hover:bg-indigo-700 transition-colors"
        >
            <Plus className="w-6 h-6" />
        </button>
      </header>

      {isAdding && (
          <form onSubmit={handleAddAccount} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6 animate-fade-in">
              <h3 className="font-semibold mb-3 text-gray-800">Adicionar Conta</h3>
              <div className="space-y-3">
                  <input 
                    type="text" 
                    placeholder="Nome da Conta (Ex: Nubank)" 
                    className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                    value={newAccName}
                    onChange={e => setNewAccName(e.target.value)}
                  />
                  <div className="flex gap-2 overflow-x-auto pb-2">
                      {ACCOUNT_TYPES.map(type => {
                          const Icon = type.icon;
                          return (
                            <button
                                key={type.id}
                                type="button"
                                onClick={() => setNewAccType(type.id)}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap border ${newAccType === type.id ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-gray-100 text-gray-600'}`}
                            >
                                <Icon className="w-4 h-4" />
                                {type.label}
                            </button>
                          )
                      })}
                  </div>
                  <button type="submit" className="w-full py-3 bg-indigo-600 text-white rounded-xl font-medium">Salvar</button>
              </div>
          </form>
      )}

      <div className="space-y-4">
        {accounts.map(acc => {
            const typeInfo = ACCOUNT_TYPES.find(t => t.id === acc.type) || ACCOUNT_TYPES[0];
            const TypeIcon = typeInfo.icon;

            return (
                <button 
                    key={acc.id} 
                    onClick={() => setSelectedAccount(acc)}
                    className="w-full bg-white p-5 rounded-[24px] shadow-sm border border-gray-100 flex justify-between items-center group relative overflow-hidden hover:scale-[1.02] transition-transform text-left"
                >
                    <div className="relative z-10 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                             <TypeIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">{acc.name}</h3>
                            <p className="text-xs text-gray-500 uppercase tracking-wider">{typeInfo.label}</p>
                        </div>
                    </div>
                    <div className="relative z-10 text-right">
                        <p className="text-xs text-gray-400 mb-1">Saldo Atual</p>
                        <p className={`text-lg font-bold ${acc.balance >= 0 ? 'text-gray-900' : 'text-red-500'}`}>
                             R$ {acc.balance.toFixed(2)}
                        </p>
                    </div>
                </button>
            )
        })}
      </div>
    </div>
  );
};

export default AccountsScreen;
