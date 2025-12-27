import React, { useState, useEffect } from 'react';
import { Target, AlertCircle, Plus, Lock, Unlock, Trash2 } from 'lucide-react';
import { CATEGORIES } from '../constants';
import { Budget, Transaction } from '../types';
import { transactionService } from '../services/transactionService';

const PlanningScreen: React.FC = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  // Create/Edit Mode
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newLimit, setNewLimit] = useState('');
  const [selectedCats, setSelectedCats] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = () => {
      setBudgets(transactionService.getBudgets());
      setTransactions(transactionService.getTransactions());
    };
    
    fetchData();
    const unsubscribe = transactionService.subscribe(fetchData);
    return () => unsubscribe();
  }, []);

  const handleSaveBudget = () => {
    if (!newLimit || !newName || selectedCats.length === 0) return;
    
    transactionService.setBudget({
        id: crypto.randomUUID(),
        name: newName,
        categoryIds: selectedCats,
        limit: parseFloat(newLimit),
        isLocked: false,
        period: 'monthly'
    });
    
    resetForm();
  };

  const handleDeleteBudget = (id: string) => {
      if(confirm("Excluir este plano?")) {
          transactionService.deleteBudget(id);
      }
  }

  const toggleLock = (budget: Budget) => {
      transactionService.setBudget({ ...budget, isLocked: !budget.isLocked });
  }

  const resetForm = () => {
      setIsCreating(false);
      setNewName('');
      setNewLimit('');
      setSelectedCats([]);
  }

  const toggleCatSelection = (id: string) => {
      if (selectedCats.includes(id)) {
          setSelectedCats(selectedCats.filter(c => c !== id));
      } else {
          setSelectedCats([...selectedCats, id]);
      }
  }

  const getSpentAmount = (categoryIds: string[]) => {
      const now = new Date();
      return transactions
        .filter(t => 
            categoryIds.includes(t.category) && 
            t.type === 'expense' &&
            new Date(t.date).getMonth() === now.getMonth() &&
            new Date(t.date).getFullYear() === now.getFullYear()
        )
        .reduce((sum, t) => sum + t.amount, 0);
  };

  return (
    <div className="p-6 pb-24">
      <header className="mb-8 flex justify-between items-center">
        <div>
           <h1 className="text-2xl font-bold text-gray-900">Planejamento</h1>
           <p className="text-gray-500 text-sm">Metas de gastos mensais</p>
        </div>
        <button 
            onClick={() => setIsCreating(true)}
            className="w-10 h-10 bg-indigo-600 rounded-full text-white flex items-center justify-center shadow-lg hover:bg-indigo-700"
        >
            <Plus className="w-6 h-6" />
        </button>
      </header>

      {isCreating && (
          <div className="bg-white p-5 rounded-[24px] shadow-lg border border-indigo-100 mb-6 animate-fade-in">
              <h3 className="font-bold text-gray-800 mb-4">Novo Plano</h3>
              <div className="space-y-4">
                  <input 
                    type="text" 
                    placeholder="Nome do Plano (Ex: Lazer)" 
                    className="w-full p-3 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                  />
                  <input 
                    type="number" 
                    placeholder="Limite Mensal (R$)" 
                    className="w-full p-3 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                    value={newLimit}
                    onChange={e => setNewLimit(e.target.value)}
                  />
                  
                  <div>
                      <p className="text-xs font-bold text-gray-500 mb-2 uppercase">Categorias Incluídas</p>
                      <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                          {CATEGORIES.filter(c => c.type === 'expense' || c.type === 'both').map(cat => (
                              <button 
                                key={cat.id}
                                onClick={() => toggleCatSelection(cat.id)}
                                className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${selectedCats.includes(cat.id) ? 'bg-indigo-100 border-indigo-200 text-indigo-700' : 'bg-white border-gray-200 text-gray-500'}`}
                              >
                                  {cat.label}
                              </button>
                          ))}
                      </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                      <button onClick={resetForm} className="flex-1 py-3 text-gray-500 font-medium text-sm hover:bg-gray-50 rounded-xl">Cancelar</button>
                      <button onClick={handleSaveBudget} className="flex-1 py-3 bg-indigo-600 text-white font-medium text-sm rounded-xl shadow-md">Criar Plano</button>
                  </div>
              </div>
          </div>
      )}

      <div className="grid gap-4">
          {budgets.length === 0 && !isCreating && (
              <p className="text-center text-gray-400 mt-10">Nenhum plano ativo.</p>
          )}

          {budgets.map(budget => {
              const spent = getSpentAmount(budget.categoryIds);
              const percentage = (spent / budget.limit) * 100;
              const isOverBudget = spent > budget.limit;

              return (
                  <div key={budget.id} className="bg-white p-5 rounded-[20px] shadow-sm border border-gray-100 relative group">
                      <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg bg-indigo-50 text-indigo-600`}>
                                  <Target className="w-5 h-5" />
                              </div>
                              <div>
                                  <h3 className="font-bold text-gray-800">{budget.name}</h3>
                                  <p className="text-[10px] text-gray-400 leading-tight max-w-[150px] truncate">
                                      {budget.categoryIds.length} categorias
                                  </p>
                              </div>
                          </div>
                          <div className="flex items-center gap-2">
                              <button onClick={() => toggleLock(budget)} className="text-gray-300 hover:text-gray-600 p-1">
                                  {budget.isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                              </button>
                              {!budget.isLocked && (
                                <button onClick={() => handleDeleteBudget(budget.id)} className="text-gray-300 hover:text-red-500 p-1">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                          </div>
                      </div>

                      <div className="space-y-1">
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                              <span className={isOverBudget ? 'text-red-500 font-bold' : ''}>
                                  R$ {spent.toFixed(0)} <span className="font-normal text-gray-400">/ {budget.limit}</span>
                              </span>
                              <span>{percentage.toFixed(0)}%</span>
                          </div>
                          <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all duration-500 ${isOverBudget ? 'bg-red-500' : 'bg-indigo-500'}`} 
                                style={{ width: `${Math.min(percentage, 100)}%` }}
                              />
                          </div>
                          {isOverBudget && (
                              <div className="flex items-center gap-1 text-xs text-red-500 mt-1 font-medium">
                                  <AlertCircle className="w-3 h-3" />
                                  <span>Limite excedido!</span>
                              </div>
                          )}
                      </div>
                  </div>
              );
          })}
      </div>
    </div>
  );
};

export default PlanningScreen;
