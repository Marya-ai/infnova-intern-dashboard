import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Lock, Mail, AlertCircle, Sparkles, Eye, EyeOff, ShieldCheck, Clock, CheckCircle } from 'lucide-react';
import { LoginResponse } from '../types';
import infnovaLogo from '../assets/images/infnova_logo_1784363241713.jpg';

interface LoginProps {
  onLoginSuccess: (response: LoginResponse) => void;
  expiredMessage?: string | null;
}

const API_BASE = 'https://infnova-intern.vercel.app/api';

export default function Login({ onLoginSuccess, expiredMessage }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);
  const [lastLogin, setLastLogin] = useState<string | null>(null);

  useEffect(() => {
    const savedEmail = localStorage.getItem('infnova_remember_email');
    const savedRemember = localStorage.getItem('infnova_remember_me');
    const savedLastLogin = localStorage.getItem('infnova_last_login');
    
    if (savedEmail && savedRemember === 'true') {
      setEmail(savedEmail);
      setRememberMe(true);
    }
    
    if (savedLastLogin) {
      setLastLogin(savedLastLogin);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('[LOGIN] Attempting login with:', email);
      
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      console.log('[LOGIN] Response status:', res.status);

      if (!res.ok) {
        let errorMsg = 'Invalid email or password.';
        try {
          const errorData = await res.json();
          console.log('[LOGIN] Error response:', errorData);
          errorMsg = errorData.message || errorData.error || errorMsg;
        } catch {
        }
        throw new Error(errorMsg);
      }

      const data = await res.json();
      console.log('[LOGIN] Success response:', data);
      
      if (!data.accessToken || !data.user) {
        throw new Error('Server returned invalid response format.');
      }

      const now = new Date().toISOString();
      localStorage.setItem('infnova_last_login', now);
      
      if (rememberMe) {
        localStorage.setItem('infnova_remember_email', email);
        localStorage.setItem('infnova_remember_me', 'true');
      } else {
        localStorage.removeItem('infnova_remember_email');
        localStorage.removeItem('infnova_remember_me');
      }

      onLoginSuccess(data as LoginResponse);
    } catch (err: any) {
      console.error('[LOGIN] Error:', err);
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const formatLastLogin = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden p-4">
      
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-orange-600/15 rounded-full blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-600/15 rounded-full blur-[100px] animate-pulse delay-1000"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-10"
        id="login-card"
      >
        <div className="p-8 pb-6 text-center border-b border-slate-50 flex flex-col items-center">
          <img 
            src={infnovaLogo} 
            alt="INFNOVA Logo" 
            className="w-16 h-16 object-contain mb-3"
          />
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            INFNOVA Technologies
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Internship Applicant Dashboard
          </p>
        </div>

        <div className="p-8">
          {expiredMessage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 text-amber-800 text-sm"
            >
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Session Expired</p>
                <p className="text-amber-700/90 mt-0.5">{expiredMessage}</p>
              </div>
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-rose-800 text-sm"
            >
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}

          {lastLogin && (
            <div className="mb-4 p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2 text-xs text-slate-600">
              <Clock className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Last login: {formatLastLogin(lastLogin)}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Administrator Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all text-slate-800"
                  placeholder="admin@infnova.tech"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all text-slate-800"
                  placeholder="Enter your secure password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer group" onClick={() => setRememberMe(!rememberMe)}>
                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${rememberMe ? 'bg-orange-500 border-orange-500' : 'border-slate-300 bg-white'}`}>
                  {rememberMe && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                </div>
                <span className="ml-2 text-sm text-slate-600 group-hover:text-slate-900 transition-colors">Remember me</span>
              </label>
              
              <div className="flex items-center gap-1 text-xs text-emerald-600">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span className="font-medium">Secure Connection</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-slate-900 hover:bg-orange-600 disabled:bg-slate-700 text-white rounded-xl text-sm font-semibold shadow-lg hover:shadow-orange-500/25 transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Authenticating...</span>
                </>
              ) : (
                <>Access Dashboard <ShieldCheck className="w-4 h-4" /></>
              )}
            </button>
          </form>
        </div>

        <div className="bg-slate-50 px-8 py-4 text-center text-xs text-slate-400 border-t border-slate-100">
          INFNOVA Technologies • Engineering Selection Panel
        </div>
      </motion.div>
    </div>
  );
}