import React, { useState } from 'react';
import { User } from '../types';
import { 
  Lock, 
  Mail, 
  ShieldAlert, 
  CheckCircle, 
  Sparkles, 
  Key, 
  HelpCircle,
  Eye,
  EyeOff,
  Wrench,
  X
} from 'lucide-react';

interface LoginViewProps {
  users: User[];
  onLoginSuccess: (user: User) => void;
}

export default function LoginView({ users, onLoginSuccess }: LoginViewProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Recovery State
  const [isRecoveryOpen, setIsRecoveryOpen] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoverySuccess, setRecoverySuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const user = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
    
    if (!user) {
      setErrorMsg('El correo electrónico no se encuentra registrado.');
      return;
    }

    if (user.estado === 'Inactivo') {
      setErrorMsg('Tu cuenta se encuentra desactivada temporalmente por la administración.');
      return;
    }

    if (user.contrasena !== password) {
      setErrorMsg('Contraseña incorrecta. Inténtalo de nuevo o usa los accesos de prueba.');
      return;
    }

    // Success
    onLoginSuccess(user);
  };

  const handleQuickLogin = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMsg(null);
    
    // Automatically submit or let them see the credentials and click
    const user = users.find(u => u.email.toLowerCase() === demoEmail.toLowerCase());
    if (user) {
      setTimeout(() => onLoginSuccess(user), 300);
    }
  };

  const handleRecoverySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryEmail.includes('@')) {
      alert('Por favor ingrese un email válido.');
      return;
    }
    setRecoverySuccess(true);
    setTimeout(() => {
      setIsRecoveryOpen(false);
      setRecoverySuccess(false);
      setRecoveryEmail('');
    }, 4000);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4" id="login-view-container">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden flex flex-col justify-between">
        
        {/* Superior Branding Card */}
        <div className="bg-slate-900 p-8 text-center text-white relative">
          {/* Subtle pattern or indicator */}
          <div className="absolute right-4 top-4 text-emerald-400 font-mono text-[9px] flex items-center gap-1 bg-emerald-950/55 px-2 py-0.5 rounded border border-emerald-800/50">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            PROJECT ENG v2.0 HD
          </div>

          {/* Premium HD Logo Container */}
          <div className="mx-auto mb-4 relative group flex items-center justify-center w-14 h-14">
            <div className="absolute -inset-1.5 bg-gradient-to-r from-blue-600 to-emerald-500 rounded-2xl blur-md opacity-80 group-hover:opacity-100 transition duration-500"></div>
            <div className="relative w-14 h-14 rounded-2xl bg-slate-900 border border-slate-700/80 flex items-center justify-center shadow-xl">
              <svg className="w-9 h-9 text-white" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 3L28 10V22L16 29L4 22V10L16 3Z" stroke="url(#hdGradientLogin1)" strokeWidth="2.2" strokeLinejoin="round" />
                <path d="M16 8L24 12.5V21.5L16 26L8 21.5V12.5L16 8Z" fill="url(#hdGradientLogin2)" fillOpacity="0.35" stroke="url(#hdGradientLogin3)" strokeWidth="1" strokeLinejoin="round" />
                <circle cx="16" cy="17" r="3.5" fill="#10b981" />
                <defs>
                  <linearGradient id="hdGradientLogin1" x1="4" y1="3" x2="28" y2="29" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#3b82f6" />
                    <stop offset="1" stopColor="#10b981" />
                  </linearGradient>
                  <linearGradient id="hdGradientLogin2" x1="8" y1="8" x2="24" y2="26" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#60a5fa" />
                    <stop offset="1" stopColor="#34d399" />
                  </linearGradient>
                  <linearGradient id="hdGradientLogin3" x1="8" y1="21.5" x2="24" y2="12.5" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#3b82f6" />
                    <stop offset="1" stopColor="#10b981" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>

          <h2 className="text-2xl font-bold tracking-tight font-sans flex items-center justify-center gap-2">
            Gestión de Proyectos
          </h2>
          <p className="text-slate-400 text-xs mt-1.5 font-sans max-w-xs mx-auto">
            Plataforma adaptada con control ágil, tablero de ingeniería y soporte de alto rendimiento.
          </p>
        </div>

        {/* Login Body */}
        <div className="p-8 space-y-6">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-lg flex items-start gap-2.5" id="login-error-badge">
              <ShieldAlert size={16} className="text-red-500 mt-0.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 font-mono block">Correo Electrónico</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-slate-400" size={15} />
                <input
                  type="email"
                  required
                  placeholder="sofia@sistemas-austral.com.ar"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 font-sans"
                  id="login-email"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-700 font-mono">Contraseña</label>
                <button
                  type="button"
                  onClick={() => setIsRecoveryOpen(true)}
                  className="text-[11px] text-blue-600 hover:underline hover:text-blue-700 font-sans cursor-pointer font-medium"
                >
                  ¿Olvidaste la contraseña?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-slate-400" size={15} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 font-sans"
                  id="login-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-all font-semibold text-sm cursor-pointer shadow-md mt-2"
              id="login-submit-btn"
            >
              Iniciar Sesión
            </button>
          </form>

          {/* Quick simulation accounts for testing */}
          <div className="pt-5 border-t border-slate-100 space-y-3" id="quick-login-pnl">
            <div className="flex items-center gap-1 text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
              <Wrench size={13} className="text-slate-400 animate-spin-slow" />
              <span>Cuentas de Prueba Rápida (1-Clic)</span>
            </div>
            
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('sofia@sistemas-austral.com.ar', 'admin123')}
                className="w-full p-2.5 text-left border border-emerald-150 hover:bg-emerald-50/50 bg-emerald-50/20 rounded-xl transition-all cursor-pointer flex items-center justify-between group"
              >
                <div>
                  <div className="text-xs font-bold text-emerald-800 group-hover:text-emerald-950 font-sans flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Administrador (Sofía Rossi)
                  </div>
                  <div className="text-[10px] text-emerald-600/70 font-mono mt-0.5">Permisos totales. Crea usuarios y proyectos.</div>
                </div>
                <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">Admin</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('mariano@sistemas-austral.com.ar', 'analista123')}
                className="w-full p-2.5 text-left border border-amber-150 hover:bg-amber-50/50 bg-amber-50/20 rounded-xl transition-all cursor-pointer flex items-center justify-between group"
              >
                <div>
                  <div className="text-xs font-bold text-amber-800 group-hover:text-amber-950 font-sans flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                    Analista (Mariano Giménez)
                  </div>
                  <div className="text-[10px] text-amber-600/70 font-mono mt-0.5">Define requerimientos, crea tareas y asigna.</div>
                </div>
                <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded">Analista</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('esteban@sistemas-austral.com.ar', 'prog123')}
                className="w-full p-2.5 text-left border border-sky-150 hover:bg-sky-50/50 bg-sky-50/20 rounded-xl transition-all cursor-pointer flex items-center justify-between group"
              >
                <div>
                  <div className="text-xs font-bold text-sky-800 group-hover:text-sky-950 font-sans flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
                    Programador (Esteban Percivati)
                  </div>
                  <div className="text-[10px] text-sky-600/70 font-mono mt-0.5">Modifica sus tareas y registra comentarios.</div>
                </div>
                <span className="text-[10px] font-mono font-bold bg-sky-100 text-sky-800 px-2 py-0.5 rounded">Prog</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-150 text-center rounded-b-2xl">
          <span className="text-[10px] text-slate-400 font-mono">
            Plataforma de Control © 2026 • Buenos Aires, Argentina
          </span>
        </div>
      </div>

      {/* RECOVERY PASSWORD DIALOG */}
      {isRecoveryOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in" id="recovery-modal">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl w-full max-w-sm overflow-hidden animate-scale-in">
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-slate-950 text-sm font-sans flex items-center gap-1.5">
                <Key size={16} className="text-slate-600" />
                Recuperación de Contraseña
              </h3>
              <button 
                onClick={() => setIsRecoveryOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleRecoverySubmit} className="p-5 space-y-4">
              {recoverySuccess ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-start gap-2 animate-pulse" id="recovery-success">
                  <CheckCircle size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-bold">Solicitud recibida:</span> Se ha enviado un token de reinicio temporal y enlace de reconfiguración a <strong className="font-mono">{recoveryEmail}</strong>. Verifique su bandeja de entrada (y SPAM).
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-xs text-slate-500 font-sans leading-relaxed">
                    Ingrese el correo electrónico institucional registrado. El sistema enviará las instrucciones automáticas autorizadas.
                  </p>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-700 font-mono block uppercase">Correo Institucional</label>
                    <input
                      type="email"
                      required
                      placeholder="ej: esteban@sistemas-austral.com.ar"
                      value={recoveryEmail}
                      onChange={(e) => setRecoveryEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </>
              )}

              <div className="flex justify-end gap-2 text-xs pt-2">
                <button
                  type="button"
                  onClick={() => setIsRecoveryOpen(false)}
                  className="px-3 py-1.5 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  Cerrar
                </button>
                {!recoverySuccess && (
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors font-medium cursor-pointer"
                  >
                    Mandar Token
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
