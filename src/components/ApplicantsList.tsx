import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, RotateCcw, AlertTriangle, ArrowUpDown, ArrowUp, 
  ArrowDown, RefreshCw, Layers, ChevronLeft, ChevronRight, Info, Download
} from 'lucide-react';
import { 
  ApplicantSummary, PaginatedApplicants, ReferenceItem, FilterParams, StatusType
} from '../types';

interface ApplicantsListProps {
  token: string;
  onSelectApplicant: (id: string) => void;
  statusFilterFromDashboard: string;
  trackFilterFromDashboard: string;
  onClearDashboardFilters: () => void;
  onSessionExpired: () => void;
  onApplicantsReloadNeeded: () => void;
  reloadTrigger: number;
}

const API_BASE = 'https://infnova-intern.vercel.app/api';

export default function ApplicantsList({
  token,
  onSelectApplicant,
  statusFilterFromDashboard,
  trackFilterFromDashboard,
  onClearDashboardFilters,
  onSessionExpired,
  onApplicantsReloadNeeded,
  reloadTrigger,
}: ApplicantsListProps) {
  
  const [countries, setCountries] = useState<ReferenceItem[]>([]);
  const [tracks, setTracks] = useState<ReferenceItem[]>([]);
  const [statuses, setStatuses] = useState<ReferenceItem[]>([]);
  const [experienceLevels, setExperienceLevels] = useState<ReferenceItem[]>([]);

  const [filters, setFilters] = useState<FilterParams>({
    page: 1,
    limit: 10,
    search: '',
    status: '',
    track: '',
    country: '',
    experienceLevel: '',
    sortBy: 'applicationDate',
    sortOrder: 'desc',
    simulateError: false,
    delay: 0,
  });

  const [searchInput, setSearchInput] = useState('');
  const [data, setData] = useState<PaginatedApplicants | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      status: statusFilterFromDashboard,
      track: trackFilterFromDashboard,
      page: 1,
    }));
  }, [statusFilterFromDashboard, trackFilterFromDashboard]);

  useEffect(() => {
    fetchReferenceData();
  }, []);

  useEffect(() => {
    fetchApplicants();
  }, [
    filters.page, filters.limit, filters.search, filters.status, filters.track, 
    filters.country, filters.experienceLevel, filters.sortBy, filters.sortOrder,
    filters.simulateError, filters.delay, reloadTrigger
  ]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchInput, page: 1 }));
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const fetchReferenceData = async () => {
    const headers = { 'Authorization': `Bearer ${token}` };
    try {
      const [countriesRes, tracksRes, statusesRes, expRes] = await Promise.all([
        fetch(`${API_BASE}/countries`, { headers }),
        fetch(`${API_BASE}/tracks`, { headers }),
        fetch(`${API_BASE}/application-statuses`, { headers }),
        fetch(`${API_BASE}/experience-levels`, { headers }),
      ]);

      if (countriesRes.status === 401) { onSessionExpired(); return; }

      const [cData, tData, sData, eData] = await Promise.all([
        countriesRes.ok ? countriesRes.json() : { data: [] },
        tracksRes.ok ? tracksRes.json() : { data: [] },
        statusesRes.ok ? statusesRes.json() : { data: [] },
        expRes.ok ? expRes.json() : { data: [] },
      ]);

      setCountries(cData.data || []);
      setTracks(tData.data || []);
      setStatuses(sData.data || []);
      setExperienceLevels(eData.data || []);
    } catch (err) { console.error('Failed to load filter metadata:', err); }
  };

  const fetchApplicants = async () => {
    setLoading(true);
    setError(null);

    const query = new URLSearchParams();
    query.append('page', String(filters.page));
    query.append('limit', String(filters.limit));
    query.append('sortBy', filters.sortBy);
    query.append('sortOrder', filters.sortOrder);

    if (filters.search) query.append('search', filters.search);
    if (filters.status) query.append('status', filters.status);
    if (filters.track) query.append('track', filters.track);
    if (filters.country) query.append('country', filters.country);
    if (filters.experienceLevel) query.append('experienceLevel', filters.experienceLevel);
    if (filters.simulateError) query.append('simulateError', 'true');
    if (filters.delay > 0) query.append('delay', String(filters.delay));

    try {
      const res = await fetch(`${API_BASE}/applicants?${query.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (res.status === 401) { onSessionExpired(); return; }
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Server returned an error fetching applicants.');
      }

      const paginatedData: PaginatedApplicants = await res.json();
      setData(paginatedData);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch applicants.');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (column: FilterParams['sortBy']) => {
    setFilters(prev => {
      const isSame = prev.sortBy === column;
      const nextOrder = isSame && prev.sortOrder === 'desc' ? 'asc' : 'desc';
      return { ...prev, sortBy: column, sortOrder: nextOrder, page: 1 };
    });
  };

  const handleResetFilters = () => {
    setSearchInput('');
    setFilters(prev => ({
      ...prev, page: 1, search: '', status: '', track: '', country: '', 
      experienceLevel: '', sortBy: 'applicationDate', sortOrder: 'desc',
    }));
    onClearDashboardFilters();
  };

  const handlePageChange = (newPage: number) => {
    if (data && newPage >= 1 && newPage <= data.meta.totalPages) {
      setFilters(prev => ({ ...prev, page: newPage }));
    }
  };

  const toggleSimulateError = () => {
    setFilters(prev => ({ ...prev, simulateError: !prev.simulateError, page: 1 }));
  };

  const toggleLatency = () => {
    setFilters(prev => ({ ...prev, delay: prev.delay === 2000 ? 0 : 2000, page: 1 }));
  };

  const handleExportCSV = () => {
    if (!data || data.data.length === 0) return;
    
    const headers = ['Full Name', 'Email Address', 'Specialty Track', 'Country', 'Date Applied', 'Status'];
    const rows = data.data.map(app => [
      app.fullName,
      app.email,
      app.track,
      app.country,
      app.applicationDate,
      app.status
    ]);

    const escapeCSV = (val: string) => `"${String(val).replace(/"/g, '""')}"`;
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(escapeCSV).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `applicants_export_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatCompactDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch { return dateStr; }
  };

  const statusStyle: Record<StatusType, string> = {
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    shortlisted: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    accepted: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    rejected: 'bg-rose-50 text-rose-700 border-rose-200',
  };

  const trackStyleLabels: Record<string, string> = {
    frontend: 'Frontend', backend: 'Backend', 'ui-ux': 'UI/UX', 
    'data-analytics': 'Analytics', mobile: 'Mobile',
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden" id="applicants-directory-panel">
      
      <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center justify-between w-full md:w-auto">
          <div>
            <h3 className="font-display text-base font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
              <Layers className="w-4 h-4 text-orange-500" /> Applicants Directory
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Filter, search, and evaluate candidates</p>
          </div>
          {data && data.data.length > 0 && (
            <button 
              onClick={handleExportCSV}
              className="md:hidden ml-4 p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-orange-600 hover:border-orange-200 transition-all cursor-pointer"
              title="Export current view to CSV"
            >
              <Download className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex flex-wrap items-center gap-2.5 p-2 bg-white rounded-xl border border-slate-200/60 max-w-fit" id="reviewer-simulation-widget">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono px-1.5 flex items-center gap-1">
              <Info className="w-3 h-3 text-orange-500 shrink-0" /> Reviewer Sandbox Tools:
            </div>
            
            <button onClick={toggleLatency} className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 border ${filters.delay > 0 ? 'bg-indigo-50 text-indigo-700 border-indigo-200 shadow-sm' : 'bg-slate-50 text-slate-500 border-transparent hover:bg-slate-100'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${filters.delay > 0 ? 'bg-indigo-600 animate-pulse' : 'bg-slate-400'}`} /> 2s Latency
            </button>

            <button onClick={toggleSimulateError} className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 border ${filters.simulateError ? 'bg-rose-50 text-rose-700 border-rose-200 shadow-sm' : 'bg-slate-50 text-slate-500 border-transparent hover:bg-slate-100'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${filters.simulateError ? 'bg-rose-600 animate-pulse' : 'bg-slate-400'}`} /> Force Error
            </button>
          </div>

          {data && data.data.length > 0 && (
            <button 
              onClick={handleExportCSV}
              className="hidden md:inline-flex items-center gap-2 px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-sm"
              title="Export current view to CSV"
            >
              <Download className="w-4 h-4" /> Export CSV
            </button>
          )}
        </div>
      </div>

      <div className="p-6 border-b border-slate-50 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-4 relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400"><Search className="w-4 h-4" /></div>
            <input type="text" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-50/50 transition-all text-slate-800" placeholder="Search by name or email..." />
          </div>

          <div className="md:col-span-2">
            <select value={filters.track} onChange={(e) => setFilters(prev => ({ ...prev, track: e.target.value, page: 1 }))} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-600 focus:outline-none focus:border-orange-500 cursor-pointer">
              <option value="">All Specialty Tracks</option>
              {tracks.map((t) => (<option key={t.value} value={t.value}>{t.label}</option>))}
            </select>
          </div>

          <div className="md:col-span-2">
            <select value={filters.status} onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value, page: 1 }))} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-600 focus:outline-none focus:border-orange-500 cursor-pointer">
              <option value="">All Statuses</option>
              {statuses.map((s) => (<option key={s.value} value={s.value}>{s.label}</option>))}
            </select>
          </div>

          <div className="md:col-span-2">
            <select value={filters.country} onChange={(e) => setFilters(prev => ({ ...prev, country: e.target.value, page: 1 }))} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-600 focus:outline-none focus:border-orange-500 cursor-pointer">
              <option value="">All Countries</option>
              {countries.map((c) => (<option key={c.value} value={c.value}>{c.label}</option>))}
            </select>
          </div>

          <div className="md:col-span-2">
            <select value={filters.experienceLevel} onChange={(e) => setFilters(prev => ({ ...prev, experienceLevel: e.target.value, page: 1 }))} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-600 focus:outline-none focus:border-orange-500 cursor-pointer">
              <option value="">All Experience</option>
              {experienceLevels.map((el) => (<option key={el.value} value={el.value}>{el.label}</option>))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 font-medium">
          <div className="flex flex-wrap items-center gap-2">
            {(filters.search || filters.status || filters.track || filters.country || filters.experienceLevel) && (
              <button onClick={handleResetFilters} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-orange-200 hover:text-orange-600 bg-slate-50/50 cursor-pointer text-xs font-semibold text-slate-500 transition-all">
                <RotateCcw className="w-3.5 h-3.5" /> Reset Filters
              </button>
            )}
            {filters.search && <span className="px-2 py-1 rounded bg-slate-100 border border-slate-200 text-slate-500 text-[11px]">Search: "{filters.search}"</span>}
            {filters.track && <span className="px-2 py-1 rounded bg-slate-100 border border-slate-200 text-slate-500 text-[11px]">Track: {filters.track}</span>}
            {filters.status && <span className="px-2 py-1 rounded bg-slate-100 border border-slate-200 text-slate-500 text-[11px] capitalize">Status: {filters.status}</span>}
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <div className="flex items-center gap-1.5">
              <span>Show</span>
              <select value={filters.limit} onChange={(e) => setFilters(prev => ({ ...prev, limit: Number(e.target.value), page: 1 }))} className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-600 focus:outline-none cursor-pointer">
                {[5, 10, 20, 50].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
              <span>rows</span>
            </div>
            
            <div className="flex md:hidden items-center gap-1.5">
              <span>Sort:</span>
              <select value={`${filters.sortBy}-${filters.sortOrder}`} onChange={(e) => { const [field, order] = e.target.value.split('-'); setFilters(prev => ({ ...prev, sortBy: field as any, sortOrder: order as any, page: 1 })); }} className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-600 focus:outline-none cursor-pointer">
                <option value="applicationDate-desc">Date (Newest)</option>
                <option value="applicationDate-asc">Date (Oldest)</option>
                <option value="fullName-asc">Name (A-Z)</option>
                <option value="fullName-desc">Name (Z-A)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="relative">
        {loading ? (
          <div className="overflow-x-auto min-h-[300px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/20">
                  <th className="py-4 px-6">Applicant Name</th>
                  <th className="py-4 px-5">Email address</th>
                  <th className="py-4 px-5">Track</th>
                  <th className="py-4 px-5">Country</th>
                  <th className="py-4 px-5">Date Applied</th>
                  <th className="py-4 px-5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {Array.from({ length: filters.limit }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-4 px-6"><div className="h-4 w-32 bg-slate-200 rounded" /></td>
                    <td className="py-4 px-5"><div className="h-4 w-40 bg-slate-200 rounded" /></td>
                    <td className="py-4 px-5"><div className="h-4 w-20 bg-slate-200 rounded" /></td>
                    <td className="py-4 px-5"><div className="h-4 w-24 bg-slate-200 rounded" /></td>
                    <td className="py-4 px-5"><div className="h-4 w-20 bg-slate-200 rounded" /></td>
                    <td className="py-4 px-5"><div className="h-6 w-16 bg-slate-200 rounded-full" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : error ? (
          <div className="p-12 text-center max-w-md mx-auto">
            <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-100"><AlertTriangle className="w-6 h-6" /></div>
            <h4 className="font-display font-bold text-slate-800 text-base">API Request Failure</h4>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{error}</p>
            <div className="mt-5 flex items-center justify-center gap-3">
              <button onClick={fetchApplicants} className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl text-xs transition-all cursor-pointer shadow-md flex items-center gap-1.5"><RefreshCw className="w-3.5 h-3.5" /> Retry Connection</button>
              {filters.simulateError && <button onClick={() => setFilters(prev => ({ ...prev, simulateError: false }))} className="px-4 py-2 border border-slate-200 hover:border-slate-300 text-slate-600 font-semibold rounded-xl text-xs transition-all cursor-pointer bg-slate-50">Disable Simulation</button>}
            </div>
          </div>
        ) : !data || data.data.length === 0 ? (
          <div className="p-16 text-center max-w-md mx-auto">
            <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100"><Search className="w-5 h-5" /></div>
            <h4 className="font-display font-bold text-slate-800 text-base">No matches found</h4>
            <p className="text-xs text-slate-400 mt-1">We couldn't find any applicants matching your current filters.</p>
            <button onClick={handleResetFilters} className="mt-5 px-4 py-2 bg-orange-50 text-orange-700 hover:bg-orange-100 font-semibold rounded-xl text-xs transition-all cursor-pointer inline-flex items-center gap-1.5"><RotateCcw className="w-3.5 h-3.5" /> Clear Filter Presets</button>
          </div>
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/20">
                    <th onClick={() => handleSort('fullName')} className="py-4 px-6 font-semibold select-none cursor-pointer hover:bg-slate-50/40 transition-colors"><div className="flex items-center gap-1.5"><span>Applicant Name</span>{filters.sortBy === 'fullName' ? (filters.sortOrder === 'desc' ? <ArrowDown className="w-3 h-3 text-orange-600" /> : <ArrowUp className="w-3 h-3 text-orange-600" />) : <ArrowUpDown className="w-3 h-3 text-slate-300" />}</div></th>
                    <th onClick={() => handleSort('email')} className="py-4 px-5 font-semibold select-none cursor-pointer hover:bg-slate-50/40 transition-colors"><div className="flex items-center gap-1.5"><span>Email address</span>{filters.sortBy === 'email' ? (filters.sortOrder === 'desc' ? <ArrowDown className="w-3 h-3 text-orange-600" /> : <ArrowUp className="w-3 h-3 text-orange-600" />) : <ArrowUpDown className="w-3 h-3 text-slate-300" />}</div></th>
                    <th onClick={() => handleSort('track')} className="py-4 px-5 font-semibold select-none cursor-pointer hover:bg-slate-50/40 transition-colors"><div className="flex items-center gap-1.5"><span>Track</span>{filters.sortBy === 'track' ? (filters.sortOrder === 'desc' ? <ArrowDown className="w-3 h-3 text-orange-600" /> : <ArrowUp className="w-3 h-3 text-orange-600" />) : <ArrowUpDown className="w-3 h-3 text-slate-300" />}</div></th>
                    <th className="py-4 px-5 font-semibold">Country</th>
                    <th onClick={() => handleSort('applicationDate')} className="py-4 px-5 font-semibold select-none cursor-pointer hover:bg-slate-50/40 transition-colors"><div className="flex items-center gap-1.5"><span>Date Applied</span>{filters.sortBy === 'applicationDate' ? (filters.sortOrder === 'desc' ? <ArrowDown className="w-3 h-3 text-orange-600" /> : <ArrowUp className="w-3 h-3 text-orange-600" />) : <ArrowUpDown className="w-3 h-3 text-slate-300" />}</div></th>
                    <th onClick={() => handleSort('status')} className="py-4 px-5 font-semibold select-none cursor-pointer hover:bg-slate-50/40 transition-colors"><div className="flex items-center gap-1.5"><span>Status</span>{filters.sortBy === 'status' ? (filters.sortOrder === 'desc' ? <ArrowDown className="w-3 h-3 text-orange-600" /> : <ArrowUp className="w-3 h-3 text-orange-600" />) : <ArrowUpDown className="w-3 h-3 text-slate-300" />}</div></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.data.map((applicant: ApplicantSummary) => (
                    <tr key={applicant.id} onClick={() => onSelectApplicant(applicant.id)} className="group hover:bg-slate-50/40 transition-all cursor-pointer">
                      <td className="py-4 px-6 text-sm font-semibold text-slate-800">{applicant.fullName}</td>
                      <td className="py-4 px-5 text-xs text-slate-500 group-hover:text-orange-600 transition-colors break-all">{applicant.email}</td>
                      <td className="py-4 px-5 text-xs font-semibold text-slate-600">{trackStyleLabels[applicant.track] || applicant.track}</td>
                      <td className="py-4 px-5 text-xs text-slate-500">{applicant.country}</td>
                      <td className="py-4 px-5 text-xs text-slate-400">{formatCompactDate(applicant.applicationDate)}</td>
                      <td className="py-4 px-5"><span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border capitalize ${statusStyle[applicant.status]}`}>{applicant.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="block md:hidden divide-y divide-slate-100">
              {data.data.map((applicant: ApplicantSummary) => (
                <div key={applicant.id} onClick={() => onSelectApplicant(applicant.id)} className="p-4 space-y-3.5 hover:bg-slate-50/50 active:bg-slate-100/50 transition-all cursor-pointer">
                  <div className="flex justify-between items-start">
                    <div><h5 className="text-sm font-bold text-slate-800">{applicant.fullName}</h5><p className="text-xs text-slate-400 mt-0.5 break-all">{applicant.email}</p></div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border capitalize shrink-0 ${statusStyle[applicant.status]}`}>{applicant.status}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-500 font-semibold uppercase tracking-wider bg-slate-50 p-2.5 rounded-xl border border-slate-100/50">
                    <div className="flex flex-col gap-0.5"><span className="text-slate-400">Track</span><span className="text-slate-700 font-bold capitalize">{trackStyleLabels[applicant.track] || applicant.track}</span></div>
                    <div className="flex flex-col gap-0.5"><span className="text-slate-400">Country</span><span className="text-slate-700 font-bold truncate">{applicant.country}</span></div>
                    <div className="flex flex-col gap-0.5"><span className="text-slate-400">Date</span><span className="text-slate-700 font-bold">{formatCompactDate(applicant.applicationDate)}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {!error && data && data.meta && (
        <div className="p-6 border-t border-slate-100 bg-slate-50/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="text-xs text-slate-500 font-medium">
            Showing <span className="font-bold text-slate-700">{(filters.page - 1) * filters.limit + 1}</span> to{' '}
            <span className="font-bold text-slate-700">{Math.min(filters.page * filters.limit, data.meta.total)}</span>{' '}
            of <span className="font-bold text-orange-600 font-mono">{data.meta.total}</span> applicants
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => handlePageChange(filters.page - 1)} disabled={filters.page === 1} className="p-1.5 rounded-xl border border-slate-200/60 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-40 transition-all cursor-pointer"><ChevronLeft className="w-4 h-4 text-slate-600" /></button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: data.meta.totalPages }, (_, index) => {
                const pageNum = index + 1;
                const isSelected = filters.page === pageNum;
                return (
                  <button key={pageNum} onClick={() => handlePageChange(pageNum)} className={`w-8 h-8 rounded-xl text-xs font-semibold cursor-pointer transition-all ${isSelected ? 'bg-orange-600 text-white shadow-md shadow-orange-150' : 'border border-slate-200/50 hover:bg-slate-50 text-slate-600'}`}>
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button onClick={() => handlePageChange(filters.page + 1)} disabled={filters.page === data.meta.totalPages} className="p-1.5 rounded-xl border border-slate-200/60 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-40 transition-all cursor-pointer"><ChevronRight className="w-4 h-4 text-slate-600" /></button>
          </div>
        </div>
      )}
    </div>
  );
}