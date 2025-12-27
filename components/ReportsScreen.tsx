import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Sparkles, Loader2, ArrowRight } from 'lucide-react';
import { Transaction } from '../types';
import { transactionService } from '../services/transactionService';
import { getFinancialAdvice } from '../services/geminiService';
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip } from 'recharts';

type Period = 'month' | 'semester' | 'year';

const ReportsScreen: React.FC = () => {
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  
  // Filter State
  const [periodType, setPeriodType] = useState<Period>('month');
  const [currentDate, setCurrentDate] = useState(new Date()); // Represents the anchor of the period
  
  // AI
  const [aiReport, setAiReport] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);

  useEffect(() => {
    setAllTransactions(transactionService.getTransactions());
  }, []);

  useEffect(() => {
    filterData();
  }, [allTransactions, periodType, currentDate]);

  const filterData = () => {
      let start = new Date(currentDate);
      let end = new Date(currentDate);

      if (periodType === 'month') {
          start.setDate(1);
          end.setMonth(end.getMonth() + 1);
          end.setDate(0);
      } else if (periodType === 'semester') {
          // Identify semester 1 or 2
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

      // Reset hours
      start.setHours(0,0,0,0);
      end.setHours(23,59,59,999);

      const filtered = allTransactions.filter(t => {
          const tDate = new Date(t.date);
          return tDate >= start && tDate <= end;
      });

      setFilteredTransactions(filtered);
      setAiReport(''); // Clear old report when filter changes
  };

  const handleNav = (direction: 'prev' | 'next') => {
      const newDate = new Date(currentDate);
      if (periodType === 'month') {
          newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
      } else if (periodType === 'semester') {
          newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 6 : -6));
      } else {
          newDate.setFullYear(newDate.getFullYear() + (direction === 'next' ? 1 : -1));
      }
      setCurrentDate(newDate);
  };

  const generateReport = async () => {
      setLoadingAi(true);
      const report = await getFinancialAdvice(filteredTransactions, 'report');
      setAiReport(report);
      setLoadingAi(false);
  };

  const getPeriodLabel = () => {
      if (periodType === 'month') return currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
      if (periodType === 'year') return currentDate.getFullYear().toString();
      if (periodType === 'semester') {
          return currentDate.getMonth() < 6 ? `1º Semestre ${currentDate.getFullYear()}` : `2º Semestre ${currentDate.getFullYear()}`;
      }
      return '';
  };

  // Chart Prep
  const chartData = filteredTransactions.reduce((acc, curr) => {
      const dateKey = new Date(curr.date).getDate().toString(); // simplify to day for now
      const existing = acc.find(a => a.name === dateKey);
      if (existing) {
          if (curr.type === 'expense') existing.expense += curr.amount;
          else if (curr.type === 'income') existing.income += curr.amount;
      } else {
          acc.push({ 
              name: dateKey, 
              expense: curr.type === 'expense' ? curr.amount : 0, 
              income: curr.type === 'income' ? curr.amount : 0 
            });
      }
      return acc;
  }, [] as any[]).sort((a,b) => parseInt(a.name) - parseInt(b.name));

  const totals = filteredTransactions.reduce((acc, t) => {
      if (t.type === 'expense') acc.expense += t.amount;
      if (t.type === 'income') acc.income += t.amount;
      return acc;
  }, { expense: 0, income: 0 });

  return (
    <div className="p-6 pb-24">
      <header className="mb-6">
           <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
           <p className="text-gray-500 text-sm">Passado e Futuro</p>
      </header>

      {/* Controls */}
      <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between mb-6">
          <button onClick={() => handleNav('prev')} className="p-2 hover:bg-gray-100 rounded-full"><ChevronLeft className="w-5 h-5 text-gray-600" /></button>
          
          <div className="flex flex-col items-center">
              <span className="font-bold text-gray-800 capitalize">{getPeriodLabel()}</span>
              <div className="flex gap-2 mt-1">
                  {(['month', 'semester', 'year'] as Period[]).map(p => (
                      <button 
                        key={p} 
                        onClick={() => setPeriodType(p)}
                        className={`text-[10px] px-2 py-0.5 rounded-md uppercase font-bold transition-all ${periodType === p ? 'bg-indigo-100 text-indigo-700' : 'text-gray-400'}`}
                      >
                          {p === 'month' ? 'Mês' : p === 'semester' ? 'Sem.' : 'Ano'}
                      </button>
                  ))}
              </div>
          </div>

          <button onClick={() => handleNav('next')} className="p-2 hover:bg-gray-100 rounded-full"><ChevronRight className="w-5 h-5 text-gray-600" /></button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
              <p className="text-xs text-emerald-600 font-bold uppercase">Entradas</p>
              <p className="text-lg font-bold text-emerald-900">R$ {totals.income.toFixed(0)}</p>
          </div>
          <div className="bg-red-50 p-4 rounded-2xl border border-red-100">
              <p className="text-xs text-red-600 font-bold uppercase">Saídas</p>
              <p className="text-lg font-bold text-red-900">R$ {totals.expense.toFixed(0)}</p>
          </div>
      </div>

      {/* Chart */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 h-64 mb-6">
          <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                  <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{fontSize: 10}} />
                  <Tooltip contentStyle={{borderRadius: '12px'}} />
                  <Bar dataKey="income" fill="#10b981" radius={[4,4,0,0]} stackId="a" />
                  <Bar dataKey="expense" fill="#ef4444" radius={[4,4,0,0]} stackId="a" />
              </BarChart>
          </ResponsiveContainer>
      </div>

      {/* AI Report Section */}
      <div className="space-y-4">
          <button 
            onClick={generateReport}
            disabled={loadingAi || filteredTransactions.length === 0}
            className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-fuchsia-200"
          >
              {loadingAi ? <Loader2 className="w-5 h-5 animate-spin"/> : <Sparkles className="w-5 h-5" />}
              Gerar Análise IA deste Período
          </button>

          {aiReport && (
             <div className="bg-white p-6 rounded-[24px] shadow-sm border border-violet-100 animate-fade-in">
                 <div className="prose prose-sm max-w-none text-gray-700">
                     <div dangerouslySetInnerHTML={{ __html: aiReport.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br/>') }} />
                 </div>
             </div>
          )}
      </div>
    </div>
  );
};

export default ReportsScreen;
