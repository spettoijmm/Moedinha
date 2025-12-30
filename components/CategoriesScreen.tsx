
import React, { useState, useEffect } from 'react';
import { 
  PieChart, ShoppingBag, Coffee, Car, Home, DollarSign, Briefcase, 
  Zap, HeartPulse, GraduationCap,
  ArrowRightLeft, Plus, X, ArrowLeft, Star, Trash2
} from 'lucide-react';
import { CategoryItem, Transaction } from '../types';
import { transactionService } from '../services/transactionService';
import TransactionList from './TransactionList';

// Icon mapping for rendering from string names
const ICON_MAP: Record<string, any> = {
    food: Coffee, shopping: ShoppingBag, transport: Car, housing: Home,
    utilities: Zap, health: HeartPulse, education: GraduationCap,
    salary: DollarSign, freelance: Briefcase, investment_return: ArrowRightLeft,
    transfer: ArrowRightLeft, other: PieChart, star: Star
};

const CategoriesScreen: React.FC = () => {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  const [selectedCategory, setSelectedCategory] = useState<CategoryItem | null>(null);

  const [isCreating, setIsCreating] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatType, setNewCatType] = useState<'income' | 'expense'>('expense');
  const [newCatColor, setNewCatColor] = useState('bg-gray-100 text-gray-600');

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
          color: newCatColor
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
                   <p className="text-gray-500 text-sm">Detalhes da Categoria</p>
                </div>
              </header>

              <div className={`${selectedCategory.color.split(' ')[0]} p-6 rounded-[24px] mb-6 flex items-center gap-4 shadow-sm`}>
                  <div className="p-3 bg-white bg-opacity-30 rounded-full">
                      <Icon className={`w-8 h-8 ${selectedCategory.color.split(' ')[1]}`} />
                  </div>
                  <div>
                      <p className={`text-sm font-bold opacity-70 ${selectedCategory.color.split(' ')[1]}`}>Total Movimentado</p>
                      <h2 className={`text-3xl font-bold ${selectedCategory.color.split(' ')[1]}`}>R$ {total.toFixed(2)}</h2>
                  </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                 <h3 className="font-bold text-gray-700 mb-4">Histórico</h3>
                 <TransactionList transactions={filteredTx} />
              </div>
          </div>
      )
  }

  const expenseCats = categories.filter(c => c.type === 'expense');
  const incomeCats = categories.filter(c => c.type === 'income');
  const otherCats = categories.filter(c => c.type === 'both');

  const renderGrid = (cats: CategoryItem[]) => (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {cats.map(cat => {
            const Icon = (cat.iconName && ICON_MAP[cat.iconName]) || PieChart;
            return (
                <div 
                    key={cat.id} 
                    onClick={() => setSelectedCategory(cat)}
                    className="bg-white p-4 rounded-[20px] shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-3 hover:shadow-md transition-all cursor-pointer relative group"
                >
                    {cat.isCustom && (
                        <button 
                            onClick={(e) => handleDeleteCategory(cat.id, e)}
                            className="absolute top-2 right-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                    <div className={`p-4 rounded-full ${cat.color} bg-opacity-20`}>
                        <Icon className="w-6 h-6" />
                    </div>
                    <span className="font-semibold text-gray-700 text-sm text-center">{cat.label}</span>
                </div>
            );
        })}
      </div>
  );

  return (
    <div className="p-6 pb-24">
      <header className="mb-8 flex justify-between items-center">
           <div>
                <h1 className="text-2xl font-bold text-gray-900">Categorias</h1>
                <p className="text-gray-500 text-sm">Toque para ver detalhes</p>
           </div>
           <button 
                onClick={() => setIsCreating(true)}
                className="w-10 h-10 bg-indigo-600 rounded-full text-white flex items-center justify-center shadow-lg hover:bg-indigo-700"
            >
                <Plus className="w-6 h-6" />
            </button>
      </header>

      {isCreating && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white w-full max-w-sm rounded-[24px] p-6 animate-fade-in shadow-2xl">
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-lg">Nova Categoria</h3>
                      <button onClick={() => setIsCreating(false)}><X className="w-6 h-6 text-gray-400" /></button>
                  </div>
                  <form onSubmit={handleCreate} className="space-y-4">
                      <input 
                        className="w-full bg-gray-50 p-3 rounded-xl outline-none border border-gray-100 focus:border-indigo-500" 
                        placeholder="Nome (Ex: Presentes)"
                        value={newCatName}
                        onChange={e => setNewCatName(e.target.value)}
                        autoFocus
                      />
                      <div className="flex bg-gray-100 p-1 rounded-xl">
                          <button type="button" onClick={() => setNewCatType('expense')} className={`flex-1 py-2 rounded-lg text-sm font-bold ${newCatType === 'expense' ? 'bg-white text-red-500 shadow-sm' : 'text-gray-500'}`}>Despesa</button>
                          {/* // Fix: Corrected the function name from setNewType to setNewCatType as defined in the component's state. */}
                          <button type="button" onClick={() => setNewCatType('income')} className={`flex-1 py-2 rounded-lg text-sm font-bold ${newCatType === 'income' ? 'bg-white text-emerald-500 shadow-sm' : 'text-gray-500'}`}>Receita</button>
                      </div>
                      <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold">Criar</button>
                  </form>
              </div>
          </div>
      )}

      <h3 className="font-bold text-gray-400 uppercase tracking-wider text-xs mb-4">Despesas</h3>
      {renderGrid(expenseCats)}

      <h3 className="font-bold text-gray-400 uppercase tracking-wider text-xs mb-4">Receitas</h3>
      {renderGrid(incomeCats)}

      {otherCats.length > 0 && (
          <>
            <h3 className="font-bold text-gray-400 uppercase tracking-wider text-xs mb-4">Geral</h3>
            {renderGrid(otherCats)}
          </>
      )}
    </div>
  );
};

export default CategoriesScreen;
