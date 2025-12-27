import React, { useState, useEffect } from 'react';
import QRCode from 'react-qr-code';
import { Smartphone, Monitor, ArrowDownCircle, CheckCircle, Copy, AlertTriangle } from 'lucide-react';
import { transactionService } from '../services/transactionService';

const SyncScreen: React.FC = () => {
  const [mode, setMode] = useState<'send' | 'receive'>('send');
  const [dataString, setDataString] = useState('');
  const [importString, setImportString] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // QR Code capacity limit (approximate for reliable scanning and to prevent render errors)
  const MAX_QR_LENGTH = 2000;

  useEffect(() => {
    if (mode === 'send') {
      const data = transactionService.exportData();
      setDataString(data);
    }
  }, [mode]);

  const handleImport = () => {
      if (!importString) return;
      const success = transactionService.importData(importString);
      setStatus(success ? 'success' : 'error');
      if (success) setImportString('');
  };

  const copyToClipboard = () => {
      navigator.clipboard.writeText(dataString);
      alert("Código copiado!");
  }

  return (
    <div className="p-6 pb-24 animate-fade-in">
        <header className="mb-6">
           <h1 className="text-2xl font-bold text-gray-900">Sincronizar</h1>
           <p className="text-gray-500 text-sm">Conecte seus dispositivos via Wi-Fi</p>
        </header>

        <div className="flex bg-gray-200 p-1 rounded-xl mb-8">
             <button 
                onClick={() => setMode('send')}
                className={`flex-1 py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${mode === 'send' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500'}`}
             >
                 <Monitor className="w-4 h-4" /> Sou o Computador
             </button>
             <button 
                onClick={() => setMode('receive')}
                className={`flex-1 py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${mode === 'receive' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500'}`}
             >
                 <Smartphone className="w-4 h-4" /> Sou o Celular
             </button>
        </div>

        {mode === 'send' && (
            <div className="flex flex-col items-center justify-center bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 text-center">
                <div className="bg-white p-4 rounded-2xl shadow-inner border border-gray-100 mb-6 flex items-center justify-center min-h-[200px] w-full max-w-[250px]">
                    {dataString ? (
                        dataString.length <= MAX_QR_LENGTH ? (
                            <div style={{ height: "auto", margin: "0 auto", maxWidth: 200, width: "100%" }}>
                                <QRCode
                                    size={256}
                                    style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                    value={dataString}
                                    viewBox={`0 0 256 256`}
                                    level="L"
                                />
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center text-amber-600 p-2">
                                <AlertTriangle className="w-8 h-8 mb-2" />
                                <p className="text-xs font-bold">Muitos dados para QR Code</p>
                                <p className="text-[10px] mt-1">Copie o código manualmente abaixo ({dataString.length} chars).</p>
                            </div>
                        )
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                             <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                        </div>
                    )}
                </div>
                
                <h3 className="text-lg font-bold text-gray-800 mb-2">Parear Dispositivo</h3>
                <p className="text-gray-500 text-sm max-w-xs mb-6">
                    Abra o <strong>Moedinha</strong> no seu celular, vá em Sincronizar e escaneie este código.
                </p>

                <button onClick={copyToClipboard} className="text-indigo-600 text-sm font-bold flex items-center gap-2 hover:bg-indigo-50 px-4 py-2 rounded-xl transition-colors">
                    <Copy className="w-4 h-4" /> Copiar Código Manualmente
                </button>
            </div>
        )}

        {mode === 'receive' && (
            <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100">
                 <h3 className="text-lg font-bold text-gray-800 mb-4">Receber Dados</h3>
                 <p className="text-gray-500 text-sm mb-4">
                     Cole o código gerado pelo computador abaixo para sincronizar.
                 </p>

                 <textarea
                    value={importString}
                    onChange={(e) => setImportString(e.target.value)}
                    placeholder='Cole o código JSON aqui...'
                    className="w-full h-32 bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs font-mono mb-4 focus:ring-2 focus:ring-indigo-500 outline-none"
                 />

                 {status === 'success' && (
                     <div className="bg-emerald-50 text-emerald-700 p-3 rounded-xl flex items-center gap-2 mb-4 text-sm font-bold">
                         <CheckCircle className="w-5 h-5" /> Sincronizado com sucesso!
                     </div>
                 )}

                 {status === 'error' && (
                     <div className="bg-red-50 text-red-700 p-3 rounded-xl flex items-center gap-2 mb-4 text-sm font-bold">
                         <CheckCircle className="w-5 h-5" /> Código inválido. Tente novamente.
                     </div>
                 )}

                 <button 
                    onClick={handleImport}
                    disabled={!importString}
                    className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 disabled:opacity-50"
                 >
                     <ArrowDownCircle className="w-5 h-5" /> Importar Dados
                 </button>
            </div>
        )}
    </div>
  );
};

export default SyncScreen;