import React, { useState, useEffect } from 'react';
import { User, Lock, Edit2, Save, BarChart2 } from 'lucide-react';
import { transactionService } from '../services/transactionService';
import { Transaction } from '../types';
import { CATEGORIES } from '../constants';

const UserProfileScreen: React.FC = () => {
  const [user, setUser] = useState(transactionService.getUser());
  const [isEditing, setIsEditing] = useState(false);
  
  // Edit Form State
  const [name, setName] = useState(user?.username || '');
  const [pin, setPin] = useState(user?.pin || '');
  const [avatar, setAvatar] = useState(user?.avatar || '👤');

  // Stats
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
    <div className="p-6 pb-24 animate-fade-in">
        <header className="mb-8">
           <h1 className="text-2xl font-bold text-gray-900">Meu Perfil</h1>
        </header>

        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 flex flex-col items-center mb-6">
            <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center text-4xl mb-4 relative">
                {isEditing ? (
                    <div className="grid grid-cols-4 gap-1 absolute bg-white p-2 rounded-xl shadow-xl z-10 top-0">
                        {avatars.map(a => (
                            <button key={a} onClick={() => setAvatar(a)} className="hover:bg-gray-100 p-1 rounded">{a}</button>
                        ))}
                    </div>
                ) : user?.avatar}
            </div>
            
            {isEditing ? (
                <div className="w-full space-y-3">
                    <input 
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="w-full text-center text-xl font-bold border-b border-indigo-200 outline-none pb-1 text-gray-800"
                        placeholder="Nome"
                    />
                     <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-xl">
                        <Lock className="w-4 h-4 text-gray-400" />
                        <input 
                            value={pin}
                            onChange={e => {
                                if(e.target.value.length <= 8 && /^\d*$/.test(e.target.value)) 
                                    setPin(e.target.value)
                            }}
                            className="w-full bg-transparent outline-none text-sm font-mono"
                            placeholder="PIN (8 dígitos)"
                            type="password"
                            inputMode="numeric"
                        />
                    </div>
                    <button onClick={handleSave} className="w-full bg-indigo-600 text-white py-2 rounded-xl font-medium flex items-center justify-center gap-2">
                        <Save className="w-4 h-4" /> Salvar
                    </button>
                </div>
            ) : (
                <>
                    <h2 className="text-xl font-bold text-gray-900">{user?.username}</h2>
                    <p className="text-gray-400 text-sm">Usuário FinanceFlow</p>
                    <button onClick={() => setIsEditing(true)} className="mt-4 text-indigo-600 text-sm font-medium flex items-center gap-1 hover:bg-indigo-50 px-3 py-1 rounded-full transition-colors">
                        <Edit2 className="w-3 h-3" /> Editar
                    </button>
                </>
            )}
        </div>

        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-indigo-600" />
            Resumo Geral
        </h3>

        <div className="grid grid-cols-2 gap-4">
            <div className="bg-red-50 p-5 rounded-[24px] border border-red-100">
                <p className="text-xs text-red-400 font-bold uppercase mb-1">Total Gasto (Histórico)</p>
                <p className="text-lg font-bold text-red-900">R$ {totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
            </div>
            <div className="bg-indigo-50 p-5 rounded-[24px] border border-indigo-100">
                <p className="text-xs text-indigo-400 font-bold uppercase mb-1">Top Categoria</p>
                <p className="text-lg font-bold text-indigo-900 truncate">{topCategory?.name || '-'}</p>
                <p className="text-xs text-indigo-600">{topCategory ? `R$ ${topCategory.value}` : ''}</p>
            </div>
        </div>
    </div>
  );
};

export default UserProfileScreen;
