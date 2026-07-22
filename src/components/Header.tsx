import { motion } from 'motion/react';
import { LogOut, RefreshCw, Sun, Moon } from 'lucide-react';
import { User } from '../types';
import infnovaLogo from '../assets/images/infnova_logo_1784363241713.jpg';

interface HeaderProps {
  user: User;
  onLogout: () => void;
  onResetSandbox: () => Promise<void>;
  resetting: boolean;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

export default function Header({ user, onLogout, onResetSandbox, resetting, isDarkMode, toggleTheme }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-300" id="app-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          <div className="flex items-center gap-3">
            <img src={infnovaLogo} alt="INFNOVA Logo" className="w-10 h-10 object-contain rounded-lg" />
            <div className="hidden sm:block">
              <h1 className="font-display text-lg font-bold text-slate-900 dark:text-white tracking-tight leading-none">
                INFNOVA
              </h1>
              <span className="text-[10px] font-bold text-orange-600 tracking-widest uppercase">
                Technologies
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={onResetSandbox}
              disabled={resetting}
              className="hidden md:inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-orange-600 dark:hover:text-orange-500 hover:border-orange-200 dark:hover:border-orange-800 hover:bg-orange-50 dark:hover:bg-slate-700 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              title="Restores the pristine 52-record baseline. Perfect for re-testing!"
              id="reset-sandbox-header-btn"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin' : ''}`} />
              <span>{resetting ? 'Resetting...' : 'Reset Sandbox'}</span>
            </button>

            <button
              onClick={onResetSandbox}
              disabled={resetting}
              className="md:hidden p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-orange-600 dark:hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-slate-700 transition-all cursor-pointer disabled:opacity-50"
              title="Reset Sandbox"
            >
              <RefreshCw className={`w-4 h-4 ${resetting ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={toggleTheme}
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onLogout}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-colors cursor-pointer"
              title="Logout session"
              id="logout-button"
            >
              <LogOut className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>
    </header>
  );
}