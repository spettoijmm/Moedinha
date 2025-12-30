
import React, { useState, useEffect } from 'react';
import { Lock, User, ArrowRight, Fingerprint } from 'lucide-react';
import { transactionService } from '../services/transactionService';

interface AuthScreenProps {
  onAuthenticated: () => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthenticated }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [showBiometrics, setShowBiometrics] = useState(false);

  useEffect(() => {
    const user = transactionService.getUser();
    if (!user) {
      setIsRegistering(true);
    } else {
        if (user.biometricsEnabled) {
            setShowBiometrics(true);
        }
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (pin.length !== 8) {
      setError('A senha deve ter exatamente 8 dígitos.');
      return;
    }

    if (isRegistering) {
      if (!username) {
        setError('Por favor, insira um nome de usuário.');
        return;
      }
      transactionService.registerUser(username, pin);
      onAuthenticated();
    } else {
      if (transactionService.login(pin)) {
        onAuthenticated();
      } else {
        setError('Senha incorreta.');
      }
    }
  };

  const handleBiometricLogin = () => {
      const user = transactionService.getUser();
      if (user) {
          const btn = document.getElementById('bio-btn');
          if(btn) btn.classList.add('scale-95', 'opacity-80');
          setTimeout(() => {
             onAuthenticated();
          }, 600);
      }
  };

  const handlePinChange = (val: string) => {
      if (/^\d*$/.test(val) && val.length <= 8) {
          setPin(val);
      }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="bg-white w-full max-w-sm p-8 rounded-[32px] shadow-xl text-center animate-fade-in">
        <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Lock className="w-8 h-8" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{isRegistering ? 'Criar Perfil' : 'Bem-vindo'}</h1>
        <p className="text-gray-500 mb-8 text-sm">{isRegistering ? 'Configure sua conta.' : `Olá, ${transactionService.getUser()?.username || 'Usuário'}.`}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegistering && (
            <div className="bg-gray-50 rounded-2xl px-4 py-3 flex items-center gap-3 border border-gray-100 focus-within:border-indigo-500 transition-colors">
              <User className="w-5 h-5 text-gray-400" />
              <input type="text" placeholder="Seu nome" className="bg-transparent w-full outline-none text-gray-800 font-medium placeholder-gray-400" value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>
          )}

          <div className="space-y-2">
            <div className="flex justify-center gap-2 mb-4">{Array.from({ length: 8 }).map((_, i) => (<div key={i} className={`w-3 h-3 rounded-full transition-all ${i < pin.length ? 'bg-indigo-600 scale-110' : 'bg-gray-200'}`} />))}</div>
            <input type="password" inputMode="numeric" autoFocus={!showBiometrics} className="w-full text-center tracking-[1em] text-transparent bg-transparent absolute opacity-0" value={pin} onChange={(e) => handlePinChange(e.target.value)} />
             <div className="grid grid-cols-3 gap-3 max-w-[240px] mx-auto mt-4">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (<button key={num} type="button" onClick={() => handlePinChange(pin + num.toString())} className="h-14 rounded-2xl bg-gray-50 hover:bg-gray-100 text-xl font-bold text-gray-700">{num}</button>))}
                {showBiometrics && !isRegistering ? (<button id="bio-btn" type="button" onClick={handleBiometricLogin} className="h-14 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-600 flex items-center justify-center"><Fingerprint className="w-8 h-8" /></button>) : (<div className="h-14"></div>)}
                <button type="button" onClick={() => handlePinChange(pin + '0')} className="h-14 rounded-2xl bg-gray-50 hover:bg-gray-100 text-xl font-bold text-gray-700">0</button>
                <button type="button" onClick={() => setPin(pin.slice(0, -1))} className="h-14 rounded-2xl bg-gray-50 hover:bg-red-50 text-red-500 font-bold flex items-center justify-center">←</button>
             </div>
          </div>
          {error && <p className="text-red-500 text-sm font-medium animate-pulse">{error}</p>}
          <button type="submit" className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-lg shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 mt-6">{isRegistering ? 'Criar Conta' : 'Entrar'}<ArrowRight className="w-5 h-5" /></button>
        </form>
      </div>
    </div>
  );
};

export default AuthScreen;
