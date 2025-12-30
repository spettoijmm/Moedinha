
import React, { useState, useEffect } from 'react';
import { X, Check, Calendar, Repeat, ArrowRightLeft, Infinity as InfinityIcon } from 'lucide-react';
import { transactionService } from '../services/transactionService';
import { CATEGORIES, FREQUENCIES } from '../constants';
import { TransactionType, Account, RecurrenceFrequency } from '../types';

interface TransactionFormProps {
  onClose: () => void;
  initialType?: TransactionType;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ onClose, initialType = 'expense' }) => {
  const [type, setType] = useState<TransactionType>(initialType);
  
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [enableRecurrence, setEnableRecurrence] = useState(false);
  const [frequency, setFrequency] = useState<RecurrenceFrequency>('monthly');
  const [isInfinite, setIsInfinite] = useState(false); 
  const [installments, setInstallments] = useState(2);

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [accountId, setAccountId] = useState<string>(''); 
  const [toAccountId, setToAccountId] = useState<string>(''); 

  useEffect(() => {
    const accs = transactionService.getAccounts();
    setAccounts(accs);
    if (accs.length > 0) {
        setAccountId(accs[0].id);
        if (accs.length > 1) setToAccountId(accs[1].id);
        else setToAccountId(accs[0].id);
    }
    updateDefaultCategory(type);
  }, []);

  const updateDefaultCategory = (t: TransactionType) => {
      if (t === 'transfer') {
          setCategory('transfer');
          return;
      }
      const firstCat = CATEGORIES.find(c => c.type === t || c.type === 'both');
      if (firstCat) setCategory(firstCat.id);
  };

  const handleTypeChange = (newType: TransactionType) => {
      setType(newType);
      updateDefaultCategory(newType);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !accountId) return;

    if (type === 'transfer') {
        if (!toAccountId || accountId === toAccountId) {
            alert("Selecione contas diferentes para transferência.");
            return;
        }
        transactionService.addTransfer(
            accountId,
            toAccountId,
            parseFloat(amount),
            new Date(date).toISOString(),
            title || 'Transferência'
        );
    } else {
        if (!title || !category) return;
        
        const recurrenceSettings = enableRecurrence ? {
            frequency,
            isInfinite,
            count: isInfinite ? undefined : installments
        } : undefined;

        transactionService.addTransaction({
            title,
            amount: parseFloat(amount),
            date: new Date(date).toISOString(),
            type,
            category,
            accountId
        }, recurrenceSettings);
    }
    onClose();
  };

  const availableCategories = CATEGORIES.filter(c => 
      c.type === type || c.type === 'both'
  ).filter(() => type !== 'transfer');

  return (
    <div className="fixed inset-0 bg-black/60 flex items-end md:items-center justify-center p-0 md:p-4 z-50 animate-fade-in backdrop-blur-sm">
      <div className="bg-white w-full max-w-md md:rounded-[28px] rounded-t-[28px] shadow-2xl overflow-hidden transform transition-all flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
          <h2 className="text-xl font-bold text-gray-800">Nova Movimentação</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto">
          <div className="grid grid-cols-3 gap-2 p-1.5 bg-gray-100 rounded-2xl">
            <button type="button" onClick={() => handleTypeChange('income')} className={`py-3 rounded-xl text-sm font-bold transition-all ${type === 'income' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-500 hover:text-gray-700'}`}>Receita</button>
            <button type="button" onClick={() => handleTypeChange('expense')} className={`py-3 rounded-xl text-sm font-bold transition-all ${type === 'expense' ? 'bg-white shadow-sm text-red-600' : 'text-gray-500 hover:text-gray-700'}`}>Despesa</button>
             <button type="button" onClick={() => handleTypeChange('transfer')} className={`py-3 rounded-xl text-sm font-bold transition-all ${type === 'transfer' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>Transf.</button>
          </div>

          <div>
              <label className="block text-xs font-bold text-gray-500 mb-1 ml-1 uppercase tracking-wide">Valor {isInfinite ? '(por ocorrência)' : '(total)'}</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xl">R$</span>
                <input type="number" step="0.01" required value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl text-3xl font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder-gray-300" placeholder="0,00" />
              </div>
            </div>

          {type === 'transfer' ? (
              <div className="space-y-4 bg-blue-50 p-4 rounded-2xl border border-blue-100">
                  <div className="flex items-center gap-2 justify-center text-blue-800 font-medium mb-2"><ArrowRightLeft className="w-5 h-5" /><span>Transferência entre Contas</span></div>
                  <div><label className="block text-xs font-bold text-gray-500 mb-1 ml-1">DE</label><select value={accountId} onChange={(e) => setAccountId(e.target.value)} className="w-full px-3 py-3 bg-white border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm">{accounts.map(acc => (<option key={acc.id} value={acc.id}>{acc.name} (R$ {acc.balance.toFixed(2)})</option>))}</select></div>
                   <div><label className="block text-xs font-bold text-gray-500 mb-1 ml-1">PARA</label><select value={toAccountId} onChange={(e) => setToAccountId(e.target.value)} className="w-full px-3 py-3 bg-white border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm">{accounts.map(acc => (<option key={acc.id} value={acc.id} disabled={acc.id === accountId}>{acc.name}</option>))}</select></div>
                   <div><label className="block text-xs font-bold text-gray-500 mb-1 ml-1 uppercase tracking-wide">Descrição (Opcional)</label><input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" placeholder="Ex: Pagamento Cartão" /></div>
              </div>
          ) : (
            <>
            <div><label className="block text-xs font-bold text-gray-500 mb-1 ml-1 uppercase tracking-wide">Descrição</label><input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" placeholder="Ex: Supermercado" /></div>
            <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-bold text-gray-500 mb-1 ml-1 uppercase tracking-wide">Data</label><div className="relative"><Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/><input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm" /></div></div>
                 <div><label className="block text-xs font-bold text-gray-500 mb-1 ml-1 uppercase tracking-wide">Conta</label><select value={accountId} onChange={(e) => setAccountId(e.target.value)} className="w-full px-3 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm appearance-none">{accounts.map(acc => (<option key={acc.id} value={acc.id}>{acc.name}</option>))}</select></div>
            </div>
            
            <div className="space-y-3 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <div className="flex items-center justify-between"><div className="flex items-center gap-2"><Repeat className="w-5 h-5 text-indigo-600" /><span className="text-sm font-semibold text-gray-700">Repetir / Parcelar</span></div><label className="relative inline-flex items-center cursor-pointer"><input type="checkbox" checked={enableRecurrence} onChange={() => setEnableRecurrence(!enableRecurrence)} className="sr-only peer" /><div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div></label></div>
                {enableRecurrence && (
                    <div className="pt-2 space-y-3 animate-fade-in"><div className="flex gap-2"><select value={frequency} onChange={(e) => setFrequency(e.target.value as any)} className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500">{FREQUENCIES.map(f => (<option key={f.id} value={f.id}>{f.label}</option>))}</select></div><div className="flex items-center justify-between bg-white p-2 rounded-xl border border-gray-200"><button type="button" onClick={() => setIsInfinite(false)} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${!isInfinite ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500'}`}>Parcelado</button><button type="button" onClick={() => setIsInfinite(true)} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${isInfinite ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500'}`}>Recorrente <InfinityIcon className="w-3 h-3"/></button></div>{!isInfinite && (<div><label className="block text-xs font-bold text-gray-500 mb-1 ml-1 uppercase">Quantidade</label><input type="number" min="2" max="120" value={installments} onChange={(e) => setInstallments(parseInt(e.target.value))} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm" /><p className="text-[10px] text-gray-400 mt-1 ml-1">Serão criadas {installments} transações.</p></div>)}</div>
                )}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2 ml-1 uppercase tracking-wide">Categoria</label>
              <div className="grid grid-cols-4 gap-2">
                {availableCategories.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <button key={cat.id} type="button" onClick={() => setCategory(cat.id)} className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all aspect-square ${category === cat.id ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm scale-105' : 'bg-white border-gray-100 text-gray-400 hover:bg-gray-50 hover:text-gray-600'}`}><Icon className="w-5 h-5 mb-1" /><span className="text-[9px] font-medium text-center leading-tight">{cat.label}</span></button>
                  );
                })}
              </div>
            </div>
            </>
          )}

          <button type="submit" className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-lg shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 transition-all active:scale-[0.98] mt-4"><Check className="w-5 h-5" />Salvar</button>
        </form>
      </div>
    </div>
  );
};

export default TransactionForm;
