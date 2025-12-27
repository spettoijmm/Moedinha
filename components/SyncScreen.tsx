import React, { useState, useRef } from 'react';
import { 
  Download, 
  Upload, 
  FileJson, 
  Copy, 
  CheckCircle, 
  AlertTriangle, 
  FileText, 
  ArrowLeft,
  Share2
} from 'lucide-react';
import { transactionService } from '../services/transactionService';

interface SyncScreenProps {
  onBack?: () => void;
}

const SyncScreen: React.FC<SyncScreenProps> = ({ onBack }) => {
  const [mode, setMode] = useState<'export' | 'import'>('export');
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'idle', message: string }>({ type: 'idle', message: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Funções de Exportação ---
  const handleExportFile = () => {
    try {
      const data = transactionService.exportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      const timestamp = new Date().toISOString().split('T')[0];
      link.href = url;
      link.download = `moedinha_backup_${timestamp}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setStatus({ type: 'success', message: 'Backup exportado com sucesso!' });
      setTimeout(() => setStatus({ type: 'idle', message: '' }), 3000);
    } catch (e) {
      setStatus({ type: 'error', message: 'Falha ao gerar arquivo de backup.' });
    }
  };

  const copyToClipboard = () => {
    const data = transactionService.exportData();
    navigator.clipboard.writeText(data);
    setStatus({ type: 'success', message: 'Código de backup copiado!' });
    setTimeout(() => setStatus({ type: 'idle', message: '' }), 3000);
  };

  // --- Funções de Importação ---
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = transactionService.importData(content);
      if (success) {
        setStatus({ type: 'success', message: 'Dados restaurados com sucesso!' });
      } else {
        setStatus({ type: 'error', message: 'Arquivo inválido ou corrompido.' });
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleTextImport = () => {
    const promptValue = window.prompt("Cole aqui o código de backup (JSON):");
    if (promptValue) {
      const success = transactionService.importData(promptValue);
      if (success) {
        setStatus({ type: 'success', message: 'Dados restaurados com sucesso!' });
      } else {
        setStatus({ type: 'error', message: 'Código inválido.' });
      }
    }
  };

  return (
    <div className="p-6 pb-24 animate-fade-in max-w-2xl mx-auto">
      <header className="mb-8 flex items-center gap-4">
        <button 
          onClick={onBack}
          className="p-2.5 bg-white rounded-full shadow-sm border border-gray-100 text-gray-600 hover:text-indigo-600 active:scale-90 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Dados e Backup</h1>
          <p className="text-gray-400 text-xs font-medium">Portabilidade das suas finanças</p>
        </div>
      </header>

      {/* Seletor de Modo */}
      <div className="flex bg-slate-200 p-1 rounded-2xl mb-8 shadow-inner">
        <button 
          onClick={() => setMode('export')}
          className={`flex-1 py-3.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${mode === 'export' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500'}`}
        >
          <Download className="w-4 h-4" /> Exportar
        </button>
        <button 
          onClick={() => setMode('import')}
          className={`flex-1 py-3.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${mode === 'import' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500'}`}
        >
          <Upload className="w-4 h-4" /> Importar
        </button>
      </div>

      {/* Alertas de Status */}
      {status.type !== 'idle' && (
        <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 animate-scale-in border ${status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
          {status.type === 'success' ? <CheckCircle className="w-5 h-5 shrink-0" /> : <AlertTriangle className="w-5 h-5 shrink-0" />}
          <p className="text-sm font-bold">{status.message}</p>
        </div>
      )}

      {mode === 'export' ? (
        <div className="space-y-4">
          <div className="bg-white p-8 rounded-[32px] shadow-xl shadow-slate-200/50 border border-gray-100 text-center">
            <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <FileJson className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2">Exportar como Arquivo</h3>
            <p className="text-gray-500 text-sm mb-8 font-medium leading-relaxed max-w-xs mx-auto">
              Crie um backup completo (.json) com todas as suas transações, contas e metas.
            </p>
            <button 
              onClick={handleExportFile}
              className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all"
            >
              <Download className="w-5 h-5" /> Baixar Backup
            </button>
          </div>

          <div 
            onClick={copyToClipboard}
            className="bg-slate-50 p-6 rounded-[28px] border border-slate-200 border-dashed flex items-center justify-between group cursor-pointer hover:bg-white hover:border-indigo-300 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                <Copy className="w-5 h-5 text-slate-400 group-hover:text-indigo-500 transition-colors" />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-slate-700">Copiar Texto de Backup</p>
                <p className="text-[11px] text-slate-400">Para enviar via chat ou e-mail</p>
              </div>
            </div>
            <Share2 className="w-5 h-5 text-slate-300" />
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-white p-8 rounded-[32px] shadow-xl shadow-slate-200/50 border border-gray-100 text-center">
            <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Upload className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2">Restaurar Backup</h3>
            <p className="text-gray-500 text-sm mb-8 font-medium leading-relaxed max-w-xs mx-auto">
              Selecione o arquivo <strong>.json</strong> para recuperar seus dados financeiros salvos.
            </p>
            
            <input 
              type="file" 
              accept=".json,application/json" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileSelect}
            />
            
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-100 hover:bg-emerald-700 active:scale-95 transition-all"
            >
              <FileJson className="w-5 h-5" /> Selecionar Arquivo
            </button>
          </div>

          <button 
            onClick={handleTextImport}
            className="w-full bg-white p-6 rounded-[28px] border border-slate-200 flex items-center justify-between hover:border-indigo-200 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-slate-400 group-hover:text-indigo-500" />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-slate-700">Restaurar via Código</p>
                <p className="text-[11px] text-slate-400">Cole o texto do backup manualmente</p>
              </div>
            </div>
            <Upload className="w-5 h-5 text-slate-300" />
          </button>
        </div>
      )}

      <div className="mt-8 p-6 bg-amber-50 rounded-[28px] border border-amber-100 flex gap-4">
        <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0" />
        <p className="text-xs text-amber-700 font-medium leading-relaxed">
          <strong>Aviso:</strong> A restauração de dados irá <strong>substituir</strong> as informações atuais deste aparelho permanentemente.
        </p>
      </div>
    </div>
  );
};

export default SyncScreen;