
import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis } from 'recharts';
import { Transaction, Budget } from '../types';
import { transactionService } from '../services/transactionService';
import SummaryCards from './SummaryCards';
import TransactionList from './TransactionList';
import { Sparkles, Loader2, AlertTriangle } from 'lucide-react';
import { getFinancialAdvice } from '../services/geminiService';

const Dashboard: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [aiAdvice, setAiAdvice] = useState<string>('');
  const [loadingAdvice, setLoadingAdvice] = useState(false);
  const [budgetAlerts, setBudgetAlerts] = useState<{ budget: Budget; spent: number }[]>([]);

  useEffect(() => {
    const loadData = () => {
        setTransactions(transactionService.getTransactions());
        setBudgetAlerts(transactionService.getBudgetAlerts());
    };
    loadData();
    const unsubscribe = transactionService.subscribe(loadData);
    return () => unsubscribe();
  }, []);

  const handleGetAdvice = async () => {
    setLoadingAdvice(true);
    setAiAdvice('');
    const advice = await getFinancialAdvice(transactions);
    setAiAdvice(advice);
    setLoadingAdvice(false);
  };

  const expensesByCategory = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, curr) => {
      const existing = acc.find(item => item.name === curr.category);
      if (existing) {
        existing.value += curr.amount;
      } else {
        acc.push({ name: curr.category, value: curr.amount });
      }
      return acc;
    }, [] as { name: string; value: number }[]);

  const COLORS = ['#6366f1', '#14b8a6', '#f43f5e', '#f59e0b', '#8b5cf6', '#ec4899'];

  return (
    <div className="p-4 md:p-6 pb-24 max-w-4xl mx-auto">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Moedinha</h1>
          <p className="text-gray-500 text-sm">Olá, {transactionService.getUser()?.username}</p>
        </div>
        <button 
          onClick={handleGetAdvice}
          disabled={loadingAdvice || transactions.length === 0}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium shadow-md transition-all disabled:opacity-50"
        >
          {loadingAdvice ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          IA Insights
        </button>
      </header>
      
      {budgetAlerts.length > 0 && (
        <div className="bg-red-50 border border-red-100 p-4 rounded-[20px] mb-6 flex items-start gap-3 animate-scale-in">
             <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
             <p className="text-red-600 text-xs leading-relaxed">
                 Você ultrapassou o orçamento em <strong>{budgetAlerts.length}</strong> plano(s).
             </p>
        </div>
      )}

      {aiAdvice && (
        <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-[24px] mb-8 animate-fade-in text-gray-800">
          <div className="flex items-center gap-2 mb-3 font-bold">
             <Sparkles className="w-5 h-5 text-indigo-500" /> IA Insights
          </div>
          <p className="text-sm leading-relaxed whitespace-pre-line">{aiAdvice}</p>
        </div>
      )}

      <SummaryCards transactions={transactions} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-[24px] border border-gray-100 h-80 flex flex-col">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Despesas por Categoria</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={expensesByCategory} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                {expensesByCategory.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-[24px] border border-gray-100 h-80 flex flex-col">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Atividade</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={transactions.slice(0, 7).reverse()}>
              <XAxis dataKey="date" tickFormatter={(d) => new Date(d).getDate().toString()} tickLine={false} axisLine={false} />
              <Bar dataKey="amount" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <h3 className="text-lg font-bold text-gray-800 mb-4 px-1">Últimas Movimentações</h3>
      <TransactionList transactions={transactions} limit={5} />
    </div>
  );
};

export default Dashboard;
