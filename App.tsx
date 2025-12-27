import React, { useState, useEffect } from 'react';
import { Home, Wallet, PieChart, LayoutGrid, ListPlus, Plus, LogOut, User as UserIcon, BarChart3, RefreshCw, Coins } from 'lucide-react';
import Dashboard from './components/Dashboard';
import TransactionScreen from './components/TransactionScreen';
import AccountsScreen from './components/AccountsScreen';
import CategoriesScreen from './components/CategoriesScreen';
import PlanningScreen from './components/PlanningScreen';
import TransactionForm from './components/TransactionForm';
import AuthScreen from './components/AuthScreen';
import UserProfileScreen from './components/UserProfileScreen';
import ReportsScreen from './components/ReportsScreen';
import SyncScreen from './components/SyncScreen';
import { transactionService } from './services/transactionService';

type Screen = 'dashboard' | 'transactions' | 'accounts' | 'planning' | 'categories' | 'profile' | 'reports' | 'sync';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<Screen>('dashboard');
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
     // Initial check
  }, []);

  const handleLogout = () => {
      transactionService.logout();
      setIsAuthenticated(false);
  }

  if (!isAuthenticated) {
      return <AuthScreen onAuthenticated={() => setIsAuthenticated(true)} />;
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case 'dashboard': return <Dashboard />;
      case 'transactions': return <TransactionScreen />;
      case 'accounts': return <AccountsScreen />;
      case 'planning': return <PlanningScreen />;
      case 'categories': return <CategoriesScreen />;
      case 'profile': return <UserProfileScreen />;
      case 'reports': return <ReportsScreen />;
      case 'sync': return <SyncScreen />;
      default: return <Dashboard />;
    }
  };

  const navItems = [
      { id: 'dashboard', label: 'Início', icon: Home },
      { id: 'transactions', label: 'Extrato', icon: ListPlus },
      { id: 'planning', label: 'Planos', icon: PieChart },
      { id: 'profile', label: 'Perfil', icon: UserIcon },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 flex">
      
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-100 h-screen sticky top-0">
          <div className="p-8">
              <h1 className="text-2xl font-extrabold text-gray-800 flex items-center gap-2 tracking-tight">
                  <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-500 shadow-sm">
                    <Coins className="w-6 h-6 fill-amber-500" />
                  </div>
                  Moedinha
              </h1>
          </div>
          
          <nav className="flex-1 px-4 space-y-2">
              <button
                onClick={() => setCurrentScreen('dashboard')}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all font-medium ${currentScreen === 'dashboard' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
              >
                 <Home className={`w-5 h-5 ${currentScreen === 'dashboard' ? 'fill-indigo-600' : ''}`} /> Início
              </button>
              <button
                onClick={() => setCurrentScreen('transactions')}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all font-medium ${currentScreen === 'transactions' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
              >
                 <ListPlus className={`w-5 h-5 ${currentScreen === 'transactions' ? 'fill-indigo-600' : ''}`} /> Extrato
              </button>
              <button
                onClick={() => setCurrentScreen('accounts')}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all font-medium ${currentScreen === 'accounts' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
              >
                 <Wallet className={`w-5 h-5 ${currentScreen === 'accounts' ? 'fill-indigo-600' : ''}`} /> Contas
              </button>
              <button
                onClick={() => setCurrentScreen('planning')}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all font-medium ${currentScreen === 'planning' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
              >
                 <PieChart className={`w-5 h-5 ${currentScreen === 'planning' ? 'fill-indigo-600' : ''}`} /> Planos
              </button>
               <button
                onClick={() => setCurrentScreen('reports')}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all font-medium ${currentScreen === 'reports' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
              >
                 <BarChart3 className={`w-5 h-5 ${currentScreen === 'reports' ? 'fill-indigo-600' : ''}`} /> Relatórios
              </button>
               <button
                    onClick={() => setCurrentScreen('categories')}
                    className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all font-medium ${currentScreen === 'categories' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
                >
                    <LayoutGrid className={`w-5 h-5 ${currentScreen === 'categories' ? 'fill-indigo-600' : ''}`} />
                    Categorias
                </button>
                 <button
                    onClick={() => setCurrentScreen('sync')}
                    className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all font-medium ${currentScreen === 'sync' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
                >
                    <RefreshCw className={`w-5 h-5 ${currentScreen === 'sync' ? 'text-indigo-600' : ''}`} />
                    Sincronizar
                </button>
          </nav>

          <div className="p-4 border-t border-gray-100">
               <button 
                onClick={() => setCurrentScreen('profile')}
                className={`flex items-center gap-3 p-3 rounded-xl mb-3 w-full text-left transition-colors ${currentScreen === 'profile' ? 'bg-indigo-50' : 'bg-gray-50 hover:bg-gray-100'}`}
               >
                   <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-lg">
                       {transactionService.getUser()?.avatar || '👤'}
                   </div>
                   <div className="flex-1 overflow-hidden">
                       <p className="text-sm font-bold text-gray-900 truncate">{transactionService.getUser()?.username}</p>
                       <p className="text-xs text-gray-500">Editar Perfil</p>
                   </div>
               </button>
               <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 text-red-500 text-sm font-medium hover:bg-red-50 p-2 rounded-lg transition-colors">
                   <LogOut className="w-4 h-4" />
                   Sair
               </button>
          </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 w-full min-h-screen md:bg-gray-50 relative pb-20 md:pb-0">
        <div className="md:max-w-5xl md:mx-auto md:py-8 h-full">
            {renderScreen()}
        </div>
      </main>

      {/* Mobile Top Bar for Profile (Hidden if screen is Profile) */}
      <div className="fixed top-0 right-0 p-4 z-40 md:hidden flex gap-3">
          {currentScreen !== 'sync' && (
             <button 
                onClick={() => setCurrentScreen('sync')}
                className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center text-gray-600 border border-gray-100"
            >
                <RefreshCw className="w-5 h-5" />
            </button>
          )}
          {currentScreen !== 'profile' && (
            <button 
                onClick={() => setCurrentScreen('profile')}
                className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center text-xl border border-gray-100"
            >
                {transactionService.getUser()?.avatar || '👤'}
            </button>
          )}
      </div>

      {/* Mobile FAB */}
      <div className="fixed bottom-24 right-6 z-40 md:hidden">
         <button
          onClick={() => setIsFormOpen(true)}
          className="bg-indigo-600 text-white p-4 rounded-2xl shadow-xl hover:bg-indigo-700 hover:scale-105 transition-all"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {/* Desktop FAB */}
      <div className="fixed bottom-10 right-10 z-40 hidden md:block">
         <button
          onClick={() => setIsFormOpen(true)}
          className="bg-indigo-600 text-white p-4 rounded-2xl shadow-xl hover:bg-indigo-700 hover:scale-105 transition-all flex items-center gap-2"
        >
          <Plus className="w-6 h-6" />
          <span className="font-bold pr-1">Nova Transação</span>
        </button>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 px-6 py-3 flex justify-between items-center z-30 pb-safe">
        {navItems.map(item => (
             <NavButton 
                key={item.id}
                active={currentScreen === item.id} 
                onClick={() => setCurrentScreen(item.id as Screen)} 
                icon={item.icon} 
                label={item.label} 
            />
        ))}
      </nav>

      {isFormOpen && <TransactionForm onClose={() => setIsFormOpen(false)} />}
    </div>
  );
};

interface NavButtonProps {
    active: boolean;
    onClick: () => void;
    icon: React.ElementType;
    label: string;
}

const NavButton: React.FC<NavButtonProps> = ({ active, onClick, icon: Icon, label }) => (
    <button 
        onClick={onClick}
        className={`flex flex-col items-center gap-1 transition-colors min-w-[50px] ${active ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
    >
        <div className={`p-1 rounded-full ${active ? 'bg-indigo-50' : ''}`}>
            <Icon className={`w-5 h-5 ${active ? 'fill-indigo-600' : ''}`} />
        </div>
        <span className="text-[9px] font-medium">{label}</span>
    </button>
);

export default App;