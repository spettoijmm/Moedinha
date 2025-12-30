
import React, { useState, useEffect } from 'react';
import { Lock, Edit2, Save, BarChart2, LogOut, ChevronRight, Settings, Info, Database } from 'lucide-react';
import { transactionService } from '../services/transactionService';
import { CATEGORIES } from '../constants';

interface UserProfileScreenProps {
  onNavigate?: (screen: string) => void;
  onLogout?: () => void;
}

const UserProfileScreen: React.FC<UserProfileScreenProps> = ({ onNavigate, onLogout }) => {
  const [user, setUser] = useState(transactionService.getUser());
  const [isEditing, setIsEditing] = useState(false);
  
  const [name, setName] = useState(user?.username || '');
  const [pin, setPin] = useState(user?.pin || '');
  const [avatar, setAvatar] = useState(user?.avatar || '👤');

  const [totalSpent, setTotalSpent] = useState(0);
  const [topCategory, setTopCategory] = useState<{name: string, value: number} | null>(null);

  useEffect(() => {
    calculateStats();
  }, []);

  const calculateStats = () => {
    const txs = transactionService.getTransactions();
    let spent = 0;
    const catMap: Record<string, number> = {};

    txs.forEach(t => {
      if(t.type === 'expense') {
        spent += t.amount;
        catMap[t.category] = (catMap[t.category] || 0) + t.amount;
      }
    });

    setTotalSpent(spent);
    
    const sortedCats = Object.entries(catMap).sort((a,b) => b[1] - a[1]);
    if (sortedCats.length > 0) {
      const catDef = CATEGORIES.find(c => c.id === sortedCats[0][0]);
      setTopCategory({ name: catDef?.label || 'Outros', value: sortedCats[0][1] });
    }
  };

  const handleSave = () => {
    if (pin.length !== 8) {
      alert("PIN deve ter 8 dígitos");
      return;
    }
    transactionService.updateUser({ username: name, pin, avatar });
    setUser(transactionService.getUser());
    setIsEditing(false);
  };

  const avatars = ['👤', '👩‍💼', '👨‍💼', '🚀', '💰', '🦊', '🐱', '🐶'];

  return (
    <div className="p-6 pb-24 animate-fade-in max-w-2xl mx-auto">
      <header className="mb-8 text-center md:text-left">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Meu Perfil</h1>
        <p className="text-gray-500 text-sm">Gerencie sua identidade e configurações</p>
      </header>

      <div className="bg-white p-8 rounded-[32px] shadow-xl shadow-slate-200/50 border border-gray-100 flex flex-col items-center mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 bg-indigo-50 rounded-full opacity-50 blur-3xl"></div>
        <div className="relative z-10 w-28 h-28 bg-indigo-50 rounded-full flex items-center justify-center text-5xl mb-6 shadow-inner ring-4 ring-white">{isEditing ? (<div className="grid grid-cols-4 gap-2 absolute bg-white p-3 rounded-2xl shadow-2xl z-20 top-0 border border-gray-100 animate-scale-in">{avatars.map(a => (<button key={a} onClick={() => setAvatar(a)} className={`hover:bg-indigo-50 p-2 rounded-xl transition-colors ${avatar === a ? 'bg-indigo-100' : ''}`}>{a}</button>))}</div>) : user?.avatar}</div>
        {isEditing ? (
          <div className="w-full space-y-4 relative z-10 max-w-sm">
            <div className="space-y-1"><label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Nome</label><input value={name} onChange={e => setName(e.target.value)} className="w-full text-center text-xl font-bold bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl py-3 outline-none text-gray-800" /></div>
            <div className="space-y-1"><label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">PIN (8 dígitos)</label><div className="flex items-center gap-2 bg-slate-50 px-4 py-3 rounded-2xl border-2 border-transparent focus-within:border-indigo-500"><Lock className="w-4 h-4 text-gray-400" /><input value={pin} onChange={e => { if(e.target.value.length <= 8 && /^\d*$/.test(e.target.value)) setPin(e.target.value) }} className="w-full bg-transparent outline-none font-mono font-bold" type="password" /></div></div>
            <div className="flex gap-2"><button onClick={() => setIsEditing(false)} className="flex-1 bg-gray-100 text-gray-600 py-4 rounded-2xl font-bold text-sm">Cancelar</button><button onClick={handleSave} className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-100"><Save className="w-4 h-4" /> Salvar</button></div>
          </div>
        ) : (
          <div className="text-center relative z-10"><h2 className="text-2xl font-black text-gray-900">{user?.username}</h2><p className="text-gray-400 text-sm font-medium mb-6 italic opacity-80">@{user?.username?.toLowerCase().replace(/\s/g, '')}</p><button onClick={() => setIsEditing(true)} className="bg-slate-50 border border-slate-100 text-slate-600 text-xs font-bold flex items-center gap-2 px-6 py-2.5 rounded-full hover:bg-indigo-50 transition-all"><Edit2 className="w-3.5 h-3.5" /> Editar Perfil</button></div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-indigo-600 p-6 rounded-[28px] shadow-lg flex flex-col justify-between group overflow-hidden relative"><BarChart2 className="absolute -right-4 -bottom-4 w-24 h-24 text-white opacity-10 group-hover:scale-125 transition-transform duration-700" /><p className="text-xs text-indigo-100 font-bold uppercase tracking-widest opacity-80 mb-1">Gasto Histórico</p><p className="text-3xl font-black text-white">R$ {totalSpent.toLocaleString('pt-BR')}</p></div>
        <div className="bg-white p-6 rounded-[28px] border border-gray-100 shadow-sm flex flex-col justify-between relative"><div className="absolute right-0 top-0 p-3 bg-indigo-50 text-indigo-600 rounded-bl-3xl"><Info className="w-4 h-4" /></div><p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mb-1">Top Categoria</p><p className="text-xl font-black text-gray-800 truncate">{topCategory?.name || '-'}</p><p className="text-xs font-bold text-indigo-600 mt-1">{topCategory ? `Acumulado: R$ ${topCategory.value.toLocaleString()}` : 'Sem dados'}</p></div>
      </div>

      <h3 className="font-black text-gray-900 mb-4 px-2 text-sm uppercase tracking-widest flex items-center gap-2"><Settings className="w-4 h-4 text-indigo-500" /> Configurações</h3>
      <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-50 mb-8">
        <button onClick={() => onNavigate && onNavigate('sync')} className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors group"><div className="flex items-center gap-4"><div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center"><Database className="w-6 h-6" /></div><div className="text-left"><p className="font-bold text-gray-800">Backup</p><p className="text-[11px] text-gray-400 font-medium">Importar ou exportar backup</p></div></div><ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" /></button>
        <button onClick={onLogout} className="w-full flex items-center justify-between p-5 hover:bg-red-50 transition-colors group"><div className="flex items-center gap-4"><div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center"><LogOut className="w-6 h-6" /></div><div className="text-left"><p className="font-bold text-red-600">Sair da Conta</p><p className="text-[11px] text-red-400 font-medium">Encerrar sessão</p></div></div><ChevronRight className="w-5 h-5 text-red-200 group-hover:text-red-400 group-hover:translate-x-1 transition-all" /></button>
      </div>
    </div>
  );
};

export default UserProfileScreen;
