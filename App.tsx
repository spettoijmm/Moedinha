import React, { useState, useEffect } from 'react';
import { Home, Wallet, PieChart, ListPlus, Plus, LogOut, User as UserIcon, Settings, RefreshCw, ChevronRight } from 'lucide-react';
import Dashboard from './components/Dashboard';
import TransactionScreen from './components/TransactionScreen';
import FinanceSettingsScreen from './components/FinanceSettingsScreen';
import PlanningScreen from './components/PlanningScreen';
import TransactionForm from './components/TransactionForm';
import AuthScreen from './components/AuthScreen';
import UserProfileScreen from './components/UserProfileScreen';
import SyncScreen from './components/SyncScreen';
import { transactionService } from './services/transactionService';

type Screen = 'dashboard' | 'transactions' | 'financeSettings' | 'planning' | 'profile' | 'sync';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<Screen>('dashboard');
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleLogout = () => {
    transactionService.logout();
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <AuthScreen onAuthenticated={() => setIsAuthenticated(true)} />;
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case 'dashboard': return <Dashboard />;
      case 'transactions': return <TransactionScreen />;
      case 'financeSettings': return <FinanceSettingsScreen />;
      case 'planning': return <PlanningScreen />;
      case 'profile': return <UserProfileScreen onNavigate={(s: any) => setCurrentScreen(s)} onLogout={handleLogout} />;
      case 'sync': return <SyncScreen onBack={() => setCurrentScreen('profile')} />;
      default: return <Dashboard />;
    }
  };

  const navItems = [
    { id: 'dashboard' as const, label: 'Início', icon: Home },
    { id: 'financeSettings' as const, label: 'Contas', icon: Wallet },
    { id: 'transactions' as const, label: 'Extrato', icon: ListPlus },
    { id: 'planning' as const, label: 'Planos', icon: PieChart },
    { id: 'profile' as const, label: 'Perfil', icon: UserIcon },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 flex flex-col md:flex-row overflow-hidden">
      
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-100 h-screen sticky top-0 p-6">
        <div className="mb-10 flex items-center gap-3 px-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <RefreshCw className="w-6 h-6 animate-spin-slow" />
          </div>
          <h1 className="text-xl font-black text-gray-800 tracking-tighter italic">Moedinha</h1>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentScreen(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold text-sm transition-all ${
                currentScreen === item.id 
                  ? 'bg-indigo-50 text-indigo-600 shadow-sm' 
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
              }`}
            >
              <item.icon className={`w-5 h-5 ${currentScreen === item.id ? 'text-indigo-600' : 'text-gray-400'}`} />
              {item.label}
            </button>
          ))}
        </nav>

        <button 
          onClick={handleLogout}
          className="mt-auto flex items-center gap-4 px-4 py-4 text-red-500 font-bold text-sm hover:bg-red-50 rounded-2xl transition-all"
        >
          <LogOut className="w-5 h-5" />
          Sair do App
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto relative h-screen bg-slate-50">
        <div className="max-w-4xl mx-auto pb-24 md:pb-6">
          {renderScreen()}
        </div>
      </main>

      {/* Floating Action Button - Only on appropriate screens */}
      {currentScreen !== 'profile' && currentScreen !== 'sync' && (
        <button
          onClick={() => setIsFormOpen(true)}
          className="fixed right-6 bottom-24 md:bottom-8 w-16 h-16 bg-indigo-600 rounded-full text-white shadow-2xl flex items-center justify-center hover:bg-indigo-700 hover:scale-110 active:scale-95 transition-all z-40 group"
        >
          <Plus className="w-8 h-8 group-hover:rotate-90 transition-transform" />
        </button>
      )}

      {/* Bottom Navigation for Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-gray-100 flex items-center justify-around px-2 py-3 z-50 rounded-t-[32px] shadow-2xl">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentScreen(item.id)}
            className={`flex flex-col items-center gap-1.5 px-3 py-1.5 rounded-2xl transition-all ${
              currentScreen === item.id ? 'text-indigo-600' : 'text-gray-400'
            }`}
          >
            <div className={`p-1.5 rounded-xl transition-all ${currentScreen === item.id ? 'bg-indigo-100 text-indigo-600 scale-110 shadow-sm' : ''}`}>
              <item.icon className="w-5 h-5" />
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-wider ${currentScreen === item.id ? 'opacity-100' : 'opacity-60'}`}>
              {item.label}
            </span>
          </button>
        ))}
      </nav>

      {/* Transaction Modal */}
      {isFormOpen && (
        <TransactionForm onClose={() => setIsFormOpen(false)} />
      )}
    </div>
  );
};

export default App;