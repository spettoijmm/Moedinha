
import React, { useState, useEffect } from 'react';
import { 
  PieChart, ShoppingBag, Coffee, Car, Home, DollarSign, Briefcase, 
  ArrowRightLeft, Plus, X, ArrowLeft, Star, Trash2
} from 'lucide-react';
import { CategoryItem, Transaction } from '../types';
import { transactionService } from '../services/transactionService';
import TransactionList from './TransactionList';

const ICON_MAP: Record<string, any> = {
    food: Coffee, shopping: ShoppingBag, transport: Car, housing: Home,
    salary: DollarSign, freelance: Briefcase, transfer: ArrowRightLeft, other: PieChart, star: Star
};

const CategoriesScreen: React.FC = () => {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<CategoryItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatType, setNewCatType] = useState<'income' | 'expense'>('expense');

  useEffect(() => {
    loadData();
    const unsubscribe = transactionService.subscribe(loadData);
    return () => unsubscribe();
  }, []);

  const loadData = () => {
      setCategories(transactionService.getCategories());
      setTransactions(transactionService.getTransactions());
  }

  const handleCreate = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newCatName) return;
      transactionService.addCategory({
          label: newCatName,
          type: newCatType,
          iconName: 'star', 
          color: newCatType === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
      });
      setIsCreating(false);
      setNewCatName('');
  };

  const handleDeleteCategory = (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if(confirm('Excluir categoria?')) {
          transactionService.deleteCategory(id);
      }
  }

  if (selectedCategory) {
      const filteredTx = transactions
        .filter(t => t.category === selectedCategory.id)
        .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      const total = filteredTx.reduce((sum, t) => sum + t.amount, 0);
      const Icon = (selectedCategory.iconName && ICON_MAP[selectedCategory.iconName]) || PieChart;

      return (
          <div className="p-6 pb-24 h-full flex flex-col animate-fade-in">
              <header className="mb-6 flex items-center gap-4">
                <button onClick={() => setSelectedCategory(null)} className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-100">
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <div>
                   <h1 className="text-xl font-bold text-gray-900">{selectedCategory.label}</h1>
                   <p className="text-gray-500 text-sm">Detalhes</p>
                </div>
              </header>

              <div className={`${selectedCategory.color.split(' ')[0]} p-6 rounded-[24px] mb-6 flex items-center gap-4`}>
                  <div className="p-3 bg-white bg-opacity-30 rounded-full">
                      <Icon className={`w-8 h-8 ${selectedCategory.color.split(' ')[1]}`} />
                  </div>
                  <h2 className={`text-3xl font-bold ${selectedCategory.color.split(' ')[1]}`}>R$ {total.toFixed(2)}</h2>
              </div>

              <div className="flex-1 overflow-y-auto">
                 <TransactionList transactions={filteredTx} />
              </div>
          </div>
      )
  }

  return (
    <div className="p-6 pb-24">
      <header className="mb-8 flex justify-between items-center">
           <div>
                <h1 className="text-2xl font-bold text-gray-900">Categorias</h1>
           </div>
           <button onClick={() => setIsCreating(true)} className="w-10 h-10 bg-indigo-600 rounded-full text-white flex items-center justify-center shadow-lg"><Plus className="w-6 h-6" /></button>
      </header>

      {isCreating && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white w-full max-w-sm rounded-[24px] p-6">
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-lg">Nova Categoria</h3>
                      <button onClick={() => setIsCreating(false)}><X className="w-6 h-6 text-gray-400" /></button>
                  </div>
                  <form onSubmit={handleCreate} className="space-y-4">
                      <input className="w-full bg-gray-50 p-3 rounded-xl outline-none border border-gray-100" placeholder="Nome" value={newCatName} onChange={e => setNewCatName(e.target.value)} />
                      <div className="flex bg-gray-100 p-1 rounded-xl">
                          <button type="button" onClick={() => setNewCatType('expense')} className={`flex-1 py-2 rounded-lg text-sm font-bold ${newCatType === 'expense' ? 'bg-white text-red-500 shadow-sm' : 'text-gray-500'}`}>Despesa</button>
                          <button type="button" onClick={() => setNewCatType('income')} className={`flex-1 py-2 rounded-lg text-sm font-bold ${newCatType === 'income' ? 'bg-white text-emerald-500 shadow-sm' : 'text-gray-500'}`}>Receita</button>
                      </div>
                      <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold">Criar</button>
                  </form>
              </div>
          </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {categories.map(cat => {
            const Icon = (cat.iconName && ICON_MAP[cat.iconName]) || PieChart;
            return (
                <div key={cat.id} onClick={() => setSelectedCategory(cat)} className="bg-white p-4 rounded-[20px] border border-gray-100 flex flex-col items-center gap-3 cursor-pointer group relative">
                    {cat.isCustom && <button onClick={(e) => handleDeleteCategory(cat.id, e)} className="absolute top-2 right-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4" /></button>}
                    <div className={`p-4 rounded-full ${cat.color} bg-opacity-20`}><Icon className="w-6 h-6" /></div>
                    <span className="font-semibold text-gray-700 text-sm">{cat.label}</span>
                </div>
            );
        })}
      </div>
    </div>
  );
};

export default CategoriesScreen;
