import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, RefreshCw, CheckCircle2, Loader2 } from 'lucide-react';
import Login from './components/Login';
import Header from './components/Header';
import DashboardStats from './components/DashboardStats';
import ApplicantsList from './components/ApplicantsList';
import ApplicantDetail from './components/ApplicantDetail';
import { User, LoginResponse, DashboardSummary, StatusType } from './types';

const API_BASE = 'https://infnova-intern.vercel.app/api';
const TOKEN_EXPIRY_MS = 3600000;

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark';
    }
    return false;
  });

  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [expiredMessage, setExpiredMessage] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const [stats, setStats] = useState<DashboardSummary | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);
  
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [trackFilter, setTrackFilter] = useState<string>('');

  const [selectedApplicantId, setSelectedApplicantId] = useState<string | null>(null);

  const [reloadTrigger, setReloadTrigger] = useState<number>(0);
  const [resettingSandbox, setResettingSandbox] = useState(false);
  const [showResetToast, setShowResetToast] = useState(false);

  useEffect(() => {
    document.title = 'INFNOVA Intern Dashboard';
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(prev => !prev);

  useEffect(() => {
    const cachedToken = localStorage.getItem('infnova_token');
    const cachedUser = localStorage.getItem('infnova_user');
    const tokenExpiry = localStorage.getItem('token_expiry');

    if (cachedToken && cachedUser) {
      if (tokenExpiry && Date.now() > Number(tokenExpiry)) {
        handleSessionExpired();
      } else {
        try {
          setToken(cachedToken);
          setUser(JSON.parse(cachedUser));
          if (!tokenExpiry) {
            localStorage.setItem('token_expiry', String(Date.now() + TOKEN_EXPIRY_MS));
          }
        } catch {
          localStorage.removeItem('infnova_token');
          localStorage.removeItem('infnova_user');
          localStorage.removeItem('token_expiry');
        }
      }
    }
    setIsInitializing(false);
  }, []);

  useEffect(() => {
    if (token && !isInitializing) {
      fetchDashboardSummary();
    }
  }, [token, reloadTrigger, isInitializing]);

  const fetchDashboardSummary = async () => {
    if (!token) return;
    setStatsLoading(true);
    setStatsError(null);

    try {
      const res = await fetch(`${API_BASE}/applicants?page=1&limit=100`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (res.status === 401) {
        handleSessionExpired();
        return;
      }

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Could not fetch dashboard summary details.');
      }

      const responseData = await res.json();
      const applicants = responseData.data || responseData.applicants || [];
      
      const byStatus = { pending: 0, shortlisted: 0, accepted: 0, rejected: 0 };
      const byTrack: Record<string, number> = {};
      
      applicants.forEach((app: any) => {
        if (byStatus.hasOwnProperty(app.status)) {
          byStatus[app.status as keyof typeof byStatus]++;
        }
        byTrack[app.track] = (byTrack[app.track] || 0) + 1;
      });

      setStats({
        totalApplicants: applicants.length,
        byStatus,
        byTrack,
      });
    } catch (err: any) {
      setStatsError(err.message || 'Error occurred syncing statistics.');
    } finally {
      setStatsLoading(false);
    }
  };

  const handleLoginSuccess = (loginData: LoginResponse) => {
    setToken(loginData.accessToken);
    setUser(loginData.user);
    setExpiredMessage(null);

    localStorage.setItem('infnova_token', loginData.accessToken);
    localStorage.setItem('infnova_user', JSON.stringify(loginData.user));
    localStorage.setItem('token_expiry', String(Date.now() + TOKEN_EXPIRY_MS));
    
    setStatusFilter('');
    setTrackFilter('');
    setReloadTrigger(prev => prev + 1);
  };

  const handleLogout = async () => {
    if (token) {
      try {
        await fetch(`${API_BASE}/auth/logout`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
        });
      } catch (e) {
        console.warn('API logout skipped:', e);
      }
    }

    setToken(null);
    setUser(null);
    setStats(null);
    setSelectedApplicantId(null);
    setStatusFilter('');
    setTrackFilter('');
    localStorage.removeItem('infnova_token');
    localStorage.removeItem('infnova_user');
    localStorage.removeItem('token_expiry');
  };

  const handleSessionExpired = () => {
    setExpiredMessage('Your session has expired (tokens last 1 hour). Please log in again.');
    setToken(null);
    setUser(null);
    setStats(null);
    setSelectedApplicantId(null);
    localStorage.removeItem('infnova_token');
    localStorage.removeItem('infnova_user');
    localStorage.removeItem('token_expiry');
  };

  const handleResetSandbox = async () => {
    if (!token) return;
    setResettingSandbox(true);
    try {
      const res = await fetch(`${API_BASE}/session/reset`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (res.status === 401) {
        handleSessionExpired();
        return;
      }

      if (!res.ok) throw new Error('Failed to reset sandbox baseline data.');

      setStatusFilter('');
      setTrackFilter('');
      setReloadTrigger(prev => prev + 1);
      setShowResetToast(true);
      setTimeout(() => setShowResetToast(false), 4000);
    } catch (err) {
      console.error('Sandbox reset failed:', err);
    } finally {
      setResettingSandbox(false);
    }
  };

  const handleStatusUpdated = (id: string, newStatus: StatusType) => {
    setReloadTrigger(prev => prev + 1);
  };

  const handleNotesUpdated = (id: string, newNotes: string | null) => {
    setReloadTrigger(prev => prev + 1);
  };

  const handleDashboardFilterChange = (type: 'status' | 'track', value: string) => {
    if (type === 'status') setStatusFilter(value);
    else setTrackFilter(value);
  };

  const handleClearDashboardFilters = () => {
    setStatusFilter('');
    setTrackFilter('');
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
      </div>
    );
  }

  if (!token || !user) {
    return <Login onLoginSuccess={handleLoginSuccess} expiredMessage={expiredMessage} />;
  }

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${isDarkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50/50 text-slate-900'}`} id="application-root">
      
      <AnimatePresence>
        {showResetToast && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-3.5 bg-slate-900 dark:bg-slate-800 text-white rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700"
            id="toast-reset-sandbox-success"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div className="text-xs font-semibold">
              <p>Sandbox baseline restored successfully!</p>
              <p className="text-slate-400 font-medium text-[10px] mt-0.5">All 52 reference application states are reset.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Header
        user={user}
        onLogout={handleLogout}
        onResetSandbox={handleResetSandbox}
        resetting={resettingSandbox}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight flex items-center gap-2">
              <span>Intern Selection Control Panel</span>
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              INFNOVA Technologies • Addis Ababa Engineering Division
            </p>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <button
              onClick={handleResetSandbox}
              disabled={resettingSandbox}
              className="md:hidden w-full flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 active:bg-slate-50 dark:active:bg-slate-800 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${resettingSandbox ? 'animate-spin' : ''}`} />
              <span>{resettingSandbox ? 'Resetting...' : 'Reset Sandbox'}</span>
            </button>
          </div>
        </div>

        <DashboardStats
          stats={stats}
          loading={statsLoading}
          activeStatusFilter={statusFilter}
          activeTrackFilter={trackFilter}
          onFilterChange={handleDashboardFilterChange}
        />

        <ApplicantsList
          token={token}
          onSelectApplicant={setSelectedApplicantId}
          statusFilterFromDashboard={statusFilter}
          trackFilterFromDashboard={trackFilter}
          onClearDashboardFilters={handleClearDashboardFilters}
          onSessionExpired={handleSessionExpired}
          onApplicantsReloadNeeded={() => setReloadTrigger(prev => prev + 1)}
          reloadTrigger={reloadTrigger}
        />

        <ApplicantDetail
          applicantId={selectedApplicantId}
          token={token}
          onClose={() => setSelectedApplicantId(null)}
          onStatusUpdated={handleStatusUpdated}
          onNotesUpdated={handleNotesUpdated}
          onSessionExpired={handleSessionExpired}
        />
      </main>
    </div>
  );
}