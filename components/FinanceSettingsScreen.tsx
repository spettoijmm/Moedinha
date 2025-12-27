import React, { useState, useEffect } from 'react';
import { 
  Plus, Wallet, Building2, TrendingUp, CircleDollarSign, 
  ArrowLeft, Coffee, ShoppingBag, Car, Home, Zap, HeartPulse, 
  GraduationCap, DollarSign, Briefcase, ArrowRightLeft, ChartPie,
  Star, Trash2, X, ChevronRight, CreditCard, PiggyBank, Landmark,
  Coins
} from 'lucide-react';
import { Account, CategoryItem, Transaction } from '../types';
import { transactionService } from '../services/transactionService';
import { ACCOUNT_TYPES } from '../constants';
import TransactionList from './TransactionList';

// Mapeamento de ícones para exibição dinâmica
const ICON_MAP: Record<string, any> = {
    food: Coffee, shopping: ShoppingBag, transport: Car, housing: Home,
    utilities: Zap, health: HeartPulse, education: GraduationCap,
    salary: DollarSign, freelance: Briefcase, investment_return: TrendingUp,
    transfer: ArrowRightLeft, other: ChartPie, star: Star,
    wallet: Wallet, bank: Building2, investment: TrendingUp,
    creditCard: CreditCard, piggyBank: PiggyBank, landmark: Landmark,
    coins: Coins
};

// Ícones disponíveis para seleção em contas
const ACCOUNT_AVAILABLE_ICONS = [
  { id: 'wallet', label: 'Carteira' },
  { id: 'bank', label: 'Banco' },
  { id: 'landmark', label: 'Landmark' },
  { id: 'creditCard', label: 'Cartão' },
  { id: 'piggyBank', label: 'Poupança' },
  { id: 'coins', label: 'Moedas' },
  { id: 'investment', label: 'Gráfico' },
  { id: 'briefcase', label: 'Trabalho' },
];

const FinanceSettingsScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'accounts' | 'categories'>('accounts');
  const [subTab, setSubTab] = useState<string>('wallet');
  
  // Dados sincronizados do serviço
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Estados de navegação interna (Drill-down)
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CategoryItem | null>(null);

  // Estados de Modais
  const [isAddingAccount, setIsAddingAccount] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  // Estados de Formulário
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState('wallet');
  const [newIcon, setNewIcon] = useState('wallet');

  useEffect(() => {
    const fetchData = () => {
        setAccounts(transactionService.getAccounts());
        setCategories(transactionService.getCategories());
        setTransactions(transactionService.getTransactions());
    };
    fetchData();
    const unsubscribe = transactionService.subscribe(fetchData);
    return () => unsubscribe();
  }, []);

  // Sincroniza sub-aba padrão ao alternar entre Contas e Categorias
  useEffect(() => {
    if (activeTab === 'accounts') {
        setSubTab('wallet');
    } else {
        setSubTab('expense');
    }
  }, [activeTab]);

  const handleAddAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;
    transactionService.addAccount({
        name: newName,
        type: newType as any,
        color: '#6366f1',
        iconName: newIcon
    });
    setIsAddingAccount(false);
    setNewName('');
    setNewIcon('wallet');
  };

  const handleAddCategory = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newName) return;
      transactionService.addCategory({
          label: newName,
          type: newType as any,
          iconName: 'star',
          color: newType === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
      });
      setIsAddingCategory(false);
      setNewName('');
  };

  const handleDeleteCategory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if(confirm('Deseja excluir esta categoria definitivamente?')) {
        transactionService.deleteCategory(id);
    }
  };

  // --- RENDERING: TELAS DE DETALHE (DRILL-DOWN) ---

  if (selectedAccount) {
    const accountTransactions = transactions
        .filter(t => t.accountId === selectedAccount.id)
        .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <div className="p-6 pb-24 animate-fade-in flex flex-col h-full bg-slate-50">
            <header className="mb-6 flex items-center gap-4">
              <button onClick={() => setSelectedAccount(null)} className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-100 transition-colors">
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900 leading-tight">{selectedAccount.name}</h1>
                <p className="text-gray-500 text-sm">Visão consolidada da conta</p>
              </div>
            </header>

            <div className="bg-indigo-600 text-white p-8 rounded-[32px] shadow-xl mb-8 text-center relative overflow-hidden group">
                <div className="relative z-10">
                    <p className="text-indigo-100 text-xs font-bold uppercase tracking-[0.15em] mb-2 opacity-80">Saldo disponível</p>
                    <h2 className="text-4xl font-extrabold tracking-tight">R$ {selectedAccount.balance.toFixed(2)}</h2>
                </div>
                <div className="absolute -right-6 -bottom-6 opacity-10 group-hover:scale-110 transition-transform duration-700">
                    {(() => {
                        const IconComp = (selectedAccount.iconName && ICON_MAP[selectedAccount.iconName]) || Wallet;
                        return <IconComp className="w-40 h-40" />
                    })()}
                </div>
            </div>

            <div className="flex items-center justify-between mb-4 px-1">
                <h3 className="font-bold text-gray-800">Últimas movimentações</h3>
                <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-md uppercase">{accountTransactions.length} registros</span>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-1 -mx-1 px-1">
                <TransactionList transactions={accountTransactions} />
            </div>
        </div>
    );
  }

  if (selectedCategory) {
    const catTransactions = transactions
        .filter(t => t.category === selectedCategory.id)
        .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const total = catTransactions.reduce((sum, t) => sum + t.amount, 0);
    const Icon = (selectedCategory.iconName && ICON_MAP[selectedCategory.iconName]) || ChartPie;

    return (
        <div className="p-6 pb-24 animate-fade-in flex flex-col h-full bg-slate-50">
            <header className="mb-6 flex items-center gap-4">
              <button onClick={() => setSelectedCategory(null)} className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-100 transition-colors">
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900 leading-tight">{selectedCategory.label}</h1>
                <p className="text-gray-500 text-sm">Histórico da categoria</p>
              </div>
            </header>

            <div className={`${selectedCategory.color.split(' ')[0]} p-8 rounded-[32px] shadow-sm mb-8 flex items-center gap-6 border border-white/20`}>
                <div className="p-5 bg-white/40 backdrop-blur-sm rounded-[24px] shadow-inner">
                    <Icon className={`w-10 h-10 ${selectedCategory.color.split(' ')[1]}`} />
                </div>
                <div>
                    <p className={`text-[10px] font-extrabold uppercase tracking-widest opacity-60 mb-1 ${selectedCategory.color.split(' ')[1]}`}>Acumulado no período</p>
                    <h2 className={`text-4xl font-extrabold tracking-tight ${selectedCategory.color.split(' ')[1]}`}>R$ {total.toFixed(2)}</h2>
                </div>
            </div>

            <h3 className="font-bold text-gray-800 mb-4 px-1">Lançamentos recentes</h3>
            <div className="flex-1 overflow-y-auto pr-1 -mx-1 px-1">
                <TransactionList transactions={catTransactions} />
            </div>
        </div>
    );
  }

  // --- RENDERING: TELA PRINCIPAL ---

  return (
    <div className="p-4 md:p-6 pb-24 h-full flex flex-col bg-slate-50">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Configurações</h1>
        <p className="text-gray-500 text-sm">Gerencie suas contas e categorias financeiras</p>
      </header>

      {/* Seletor de Aba Principal */}
      <div className="flex bg-gray-200 p-1 rounded-2xl mb-6 shadow-inner">
        <button 
          onClick={() => setActiveTab('accounts')}
          className={`flex-1 py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200 ${activeTab === 'accounts' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500'}`}
        >
          <Wallet className="w-4 h-4" /> Contas
        </button>
        <button 
          onClick={() => setActiveTab('categories')}
          className={`flex-1 py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200 ${activeTab === 'categories' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500'}`}
        >
          <ChartPie className="w-4 h-4" /> Categorias
        </button>
      </div>

      {activeTab === 'accounts' ? (
        <div className="animate-fade-in flex flex-col flex-1 overflow-hidden">
          {/* Sub-abas de Contas */}
          <div className="flex gap-2 mb-6 bg-slate-100 p-1 rounded-xl">
            {[
                {id: 'wallet', label: 'Carteiras', icon: Wallet}, 
                {id: 'bank', label: 'Bancos', icon: Building2}, 
                {id: 'investment', label: 'Investimentos', icon: TrendingUp}
            ].map(type => (
              <button
                key={type.id}
                onClick={() => setSubTab(type.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold transition-all ${subTab === type.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400'}`}
              >
                <type.icon className="w-3.5 h-3.5" />
                {type.label}
              </button>
            ))}
          </div>

          <div className="space-y-3 overflow-y-auto flex-1 pr-1 -mx-1 px-1">
            {accounts
              .filter(acc => acc.type === subTab)
              .map(acc => {
                const TypeIcon = (acc.iconName && ICON_MAP[acc.iconName]) || (ACCOUNT_TYPES.find(t => t.id === acc.type)?.icon || Wallet);
                return (
                  <button 
                    key={acc.id}
                    onClick={() => setSelectedAccount(acc)}
                    className="w-full bg-white p-5 rounded-[24px] border border-gray-100 flex items-center justify-between group hover:border-indigo-200 hover:shadow-lg transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-100 transition-colors">
                        <TypeIcon className="w-6 h-6" />
                      </div>
                      <div className="text-left">
                        <h3 className="font-bold text-gray-900">{acc.name}</h3>
                        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Saldo em conta</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`font-bold text-base ${acc.balance < 0 ? 'text-red-500' : 'text-gray-900'}`}>
                        R$ {acc.balance.toFixed(2)}
                      </span>
                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-400" />
                    </div>
                  </button>
                );
              })}
              
              <button 
                onClick={() => {
                  setIsAddingAccount(true);
                  setNewIcon(subTab); // Inicia com o ícone padrão da aba
                }}
                className="w-full mt-2 py-6 border-2 border-dashed border-gray-200 rounded-[24px] text-gray-400 font-bold text-sm flex items-center justify-center gap-2 hover:border-indigo-300 hover:text-indigo-500 hover:bg-white transition-all"
              >
                <Plus className="w-5 h-5" /> Nova {subTab === 'wallet' ? 'Carteira' : subTab === 'bank' ? 'Conta Bancária' : 'Investimento'}
              </button>
          </div>
        </div>
      ) : (
        <div className="animate-fade-in flex flex-col flex-1 overflow-hidden">
          {/* Sub-abas de Categorias */}
          <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
            <button 
              onClick={() => setSubTab('expense')}
              className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${subTab === 'expense' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-400'}`}
            >
              Despesas
            </button>
            <button 
              onClick={() => setSubTab('income')}
              className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${subTab === 'income' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-400'}`}
            >
              Receitas
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 overflow-y-auto flex-1 pr-1 -mx-1 px-1">
            {categories
              .filter(cat => cat.type === subTab)
              .map(cat => {
                const Icon = (cat.iconName && ICON_MAP[cat.iconName]) || ChartPie;
                return (
                  <button 
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat)}
                    className="bg-white p-6 rounded-[28px] border border-gray-100 flex flex-col items-center justify-center gap-3 hover:shadow-xl hover:border-indigo-100 transition-all group relative"
                  >
                    {cat.isCustom && (
                        <button 
                            onClick={(e) => handleDeleteCategory(cat.id, e)}
                            className="absolute top-3 right-3 p-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                    <div className={`p-4 rounded-2xl ${cat.color} bg-opacity-10 group-hover:bg-opacity-20 transition-all`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="font-bold text-gray-700 text-xs text-center">{cat.label}</span>
                  </button>
                );
              })}
              
              <button 
                onClick={() => setIsAddingCategory(true)}
                className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-[28px] flex flex-col items-center justify-center gap-2 p-6 text-gray-400 hover:border-indigo-200 hover:text-indigo-400 hover:bg-white transition-all"
              >
                <Plus className="w-6 h-6 mb-1" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Adicionar</span>
              </button>
          </div>
        </div>
      )}

      {/* Modal Nova Conta */}
      {isAddingAccount && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6 animate-fade-in overflow-y-auto">
          <div className="bg-white w-full max-w-sm rounded-[32px] p-8 shadow-2xl scale-up-center my-auto">
             <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-xl text-gray-900">Nova Conta</h3>
                <button onClick={() => setIsAddingAccount(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <X className="w-6 h-6 text-gray-400" />
                </button>
             </div>
             <form onSubmit={handleAddAccount} className="space-y-6">
                <div>
                   <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Identificação</label>
                   <input 
                      className="w-full bg-slate-50 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold border border-slate-100" 
                      placeholder="Ex: Banco do Brasil"
                      value={newName}
                      onChange={e => setNewName(e.target.value)}
                      autoFocus
                      required
                   />
                </div>
                <div>
                   <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Modalidade</label>
                   <div className="grid grid-cols-2 gap-2">
                      {[
                        {id: 'wallet', label: 'Carteira', icon: Wallet},
                        {id: 'bank', label: 'Banco', icon: Building2},
                        {id: 'investment', label: 'Investimento', icon: TrendingUp}
                      ].map(type => (
                        <button 
                          key={type.id}
                          type="button"
                          onClick={() => {
                            setNewType(type.id);
                            setNewIcon(type.id); // Sugere ícone base ao mudar tipo
                          }}
                          className={`flex items-center gap-3 p-4 rounded-2xl border text-xs font-bold transition-all ${newType === type.id ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-white border-slate-100 text-gray-500'}`}
                        >
                           <type.icon className={`w-4 h-4 ${newType === type.id ? 'text-white' : 'text-indigo-400'}`} /> {type.label}
                        </button>
                      ))}
                   </div>
                </div>

                <div>
                   <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Escolha um Ícone</label>
                   <div className="grid grid-cols-4 gap-2 bg-slate-50 p-3 rounded-[24px] border border-slate-100">
                      {ACCOUNT_AVAILABLE_ICONS.map(item => {
                        const IconComp = ICON_MAP[item.id];
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setNewIcon(item.id)}
                            className={`p-3 rounded-xl flex items-center justify-center transition-all ${newIcon === item.id ? 'bg-indigo-100 text-indigo-600 scale-110 shadow-sm ring-2 ring-indigo-200' : 'text-gray-400 hover:text-gray-600'}`}
                            title={item.label}
                          >
                             <IconComp className="w-5 h-5" />
                          </button>
                        )
                      })}
                   </div>
                </div>

                <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold mt-4 shadow-xl shadow-indigo-100 active:scale-95 transition-all">
                    Criar Registro
                </button>
             </form>
          </div>
        </div>
      )}

      {/* Modal Nova Categoria */}
      {isAddingCategory && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6 animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-[32px] p-8 shadow-2xl scale-up-center">
             <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-xl text-gray-900">Nova Categoria</h3>
                <button onClick={() => setIsAddingCategory(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <X className="w-6 h-6 text-gray-400" />
                </button>
             </div>
             <form onSubmit={handleAddCategory} className="space-y-6">
                <div>
                   <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Nome da Categoria</label>
                   <input 
                      className="w-full bg-slate-50 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold border border-slate-100" 
                      placeholder="Ex: Assinaturas Digitais"
                      value={newName}
                      onChange={e => setNewName(e.target.value)}
                      autoFocus
                      required
                   />
                </div>
                <div>
                   <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Tipo de Fluxo</label>
                   <div className="flex bg-slate-100 p-1 rounded-2xl">
                      <button type="button" onClick={() => setNewType('expense')} className={`flex-1 py-3.5 rounded-xl text-xs font-bold transition-all ${newType === 'expense' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-400'}`}>Despesa</button>
                      <button type="button" onClick={() => setNewType('income')} className={`flex-1 py-3.5 rounded-xl text-xs font-bold transition-all ${newType === 'income' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-400'}`}>Receita</button>
                   </div>
                </div>
                <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold mt-4 shadow-xl shadow-indigo-100 active:scale-95 transition-all">
                    Confirmar Categoria
                </button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinanceSettingsScreen;