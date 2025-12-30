
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
          className="flex items-center gap-2 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white px-4 py-2 rounded-xl text-sm font-medium shadow-md hover:shadow-lg transition-all disabled:opacity-50"
        >
          {loadingAdvice ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          IA Insights
        </button>
      </header>
      
      {budgetAlerts.length > 0 && (
        <div className="bg-red-50 border border-red-100 p-4 rounded-[20px] mb-6 flex items-start gap-3 shadow-sm animate-scale-in">
             <div className="bg-red-100 text-red-600 p-2 rounded-full shrink-0">
                 <AlertTriangle className="w-5 h-5" />
             </div>
             <div>
                 <h3 className="text-red-800 font-bold text-sm">Atenção! Limites Excedidos</h3>
                 <p className="text-red-600 text-xs mt-1 leading-relaxed">
                     Você ultrapassou o orçamento em <strong>{budgetAlerts.length}</strong> plano(s): {budgetAlerts.map(b => b.budget.name).join(', ')}.
                 </p>
             </div>
        </div>
      )}

      {aiAdvice && (
        <div className="bg-gradient-to-br from-violet-50 to-fuchsia-50 border border-violet-100 p-6 rounded-[24px] mb-8 animate-fade-in text-gray-800">
          <div className="flex items-center gap-2 mb-3">
             <Sparkles className="w-5 h-5 text-fuchsia-500" />
             <h3 className="font-bold text-lg">Consultor IA</h3>
          </div>
          <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-line leading-relaxed">
            {aiAdvice}
          </div>
        </div>
      )}

      <SummaryCards transactions={transactions} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 h-80 flex flex-col">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Despesas por Categoria</h3>
          {expensesByCategory.length > 0 ? (
            <div className="flex-1 min-h-0">
               <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expensesByCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {expensesByCategory.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
              Sem dados de despesas
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 h-80 flex flex-col">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Atividade Recente</h3>
          {transactions.length > 0 ? (
             <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={transactions.slice(0, 7).reverse()}>
                  <XAxis dataKey="date" tickFormatter={(d) => new Date(d).getDate().toString()} tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={{fill: '#f3f4f6', radius: 8}}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="amount" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
             <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
              Sem dados de atividade
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center mb-4 px-1">
        <h3 className="text-lg font-bold text-gray-800">Últimas Movimentações</h3>
      </div>
      <TransactionList transactions={transactions} limit={5} />
    </div>
  );
};

export default Dashboard;
