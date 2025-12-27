import React, { useState, useEffect } from 'react';
import { Transaction } from '../types';
import { transactionService } from '../services/transactionService';
import TransactionList from './TransactionList';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

type Period = 'month' | 'biweekly' | 'semester' | 'year';

const TransactionScreen: React.FC = () => {
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [activeTab, setActiveTab] = useState<'income' | 'expense'>('expense');
  
  // Filter State
  const [periodType, setPeriodType] = useState<Period>('month');
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    // Initial fetch
    setAllTransactions(transactionService.getTransactions());
    const unsubscribe = transactionService.subscribe(() => {
        setAllTransactions(transactionService.getTransactions());
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
      filterData();
  }, [allTransactions, periodType, currentDate, activeTab]);

  const filterData = () => {
      let start = new Date(currentDate);
      let end = new Date(currentDate);

      if (periodType === 'month') {
          start.setDate(1);
          end.setMonth(end.getMonth() + 1);
          end.setDate(0);
      } else if (periodType === 'biweekly') {
           const day = start.getDate();
           if (day <= 15) {
               start.setDate(1);
               end.setDate(15);
           } else {
               start.setDate(16);
               end.setMonth(end.getMonth() + 1);
               end.setDate(0);
           }
      } else if (periodType === 'semester') {
          const currentMonth = start.getMonth();
          if (currentMonth < 6) {
              start.setMonth(0, 1);
              end.setMonth(5, 30);
          } else {
              start.setMonth(6, 1);
              end.setMonth(11, 31);
          }
      } else if (periodType === 'year') {
          start.setMonth(0, 1);
          end.setMonth(11, 31);
      }

      start.setHours(0,0,0,0);
      end.setHours(23,59,59,999);

      const filtered = allTransactions.filter(t => {
          const tDate = new Date(t.date);
          return t.type === activeTab && tDate >= start && tDate <= end;
      }).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setFilteredTransactions(filtered);
  };

  const handleNav = (direction: 'prev' | 'next') => {
      const newDate = new Date(currentDate);
      if (periodType === 'month') {
          newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
      } else if (periodType === 'biweekly') {
          // Logic for biweekly nav
          const day = newDate.getDate();
          if (direction === 'next') {
              if (day <= 15) newDate.setDate(16);
              else {
                  newDate.setMonth(newDate.getMonth() + 1);
                  newDate.setDate(1);
              }
          } else {
              if (day > 15) newDate.setDate(1);
              else {
                  newDate.setMonth(newDate.getMonth() - 1);
                  newDate.setDate(16);
              }
          }
      } else if (periodType === 'semester') {
          newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 6 : -6));
      } else {
          newDate.setFullYear(newDate.getFullYear() + (direction === 'next' ? 1 : -1));
      }
      setCurrentDate(newDate);
  };

  const getPeriodLabel = () => {
      if (periodType === 'month') return currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
      if (periodType === 'year') return currentDate.getFullYear().toString();
      if (periodType === 'semester') {
          return currentDate.getMonth() < 6 ? `1º Semestre ${currentDate.getFullYear()}` : `2º Semestre ${currentDate.getFullYear()}`;
      }
      if (periodType === 'biweekly') {
           const day = currentDate.getDate();
           const month = currentDate.toLocaleDateString('pt-BR', { month: 'short' });
           return day <= 15 ? `1ª Quinzena ${month}` : `2ª Quinzena ${month}`;
      }
      return '';
  };

  return (
    <div className="p-6 pb-24 h-full flex flex-col">
       <header className="mb-4">
           <h1 className="text-2xl font-bold text-gray-900">Extrato</h1>
           <p className="text-gray-500 text-sm">Histórico de movimentações</p>
      </header>

      {/* Date Filter Controls */}
      <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-2 mb-4">
          <div className="flex items-center justify-between">
            <button onClick={() => handleNav('prev')} className="p-2 hover:bg-gray-100 rounded-full"><ChevronLeft className="w-5 h-5 text-gray-600" /></button>
            <span className="font-bold text-gray-800 capitalize text-sm md:text-base">{getPeriodLabel()}</span>
            <button onClick={() => handleNav('next')} className="p-2 hover:bg-gray-100 rounded-full"><ChevronRight className="w-5 h-5 text-gray-600" /></button>
          </div>
          
          <div className="flex gap-1 justify-center pb-1 overflow-x-auto">
              {(['month', 'biweekly', 'semester', 'year'] as Period[]).map(p => (
                  <button 
                    key={p} 
                    onClick={() => setPeriodType(p)}
                    className={`text-[10px] px-3 py-1 rounded-full uppercase font-bold transition-all whitespace-nowrap ${periodType === p ? 'bg-indigo-100 text-indigo-700' : 'text-gray-400 bg-gray-50'}`}
                  >
                      {p === 'month' ? 'Mês' : p === 'biweekly' ? 'Quinz.' : p === 'semester' ? 'Sem.' : 'Ano'}
                  </button>
              ))}
          </div>
      </div>

      <div className="flex bg-gray-200 p-1 rounded-xl mb-6 shrink-0">
          <button
            onClick={() => setActiveTab('income')}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'income' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500'}`}
          >
              Receitas
          </button>
          <button
            onClick={() => setActiveTab('expense')}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'expense' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500'}`}
          >
              Despesas
          </button>
      </div>

      <div className="flex-1 overflow-y-auto">
         <TransactionList transactions={filteredTransactions} />
      </div>
    </div>
  );
};

export default TransactionScreen;
