import { motion } from 'motion/react';
import { Users, UserCheck, Clock, Bookmark, Code, Layers, Smartphone, Database, BarChart3 } from 'lucide-react';
import { DashboardSummary } from '../types';

interface DashboardStatsProps {
  stats: DashboardSummary | null;
  loading: boolean;
  activeStatusFilter: string;
  activeTrackFilter: string;
  onFilterChange: (type: 'status' | 'track', value: string) => void;
}

export default function DashboardStats({
  stats,
  loading,
  activeStatusFilter,
  activeTrackFilter,
  onFilterChange,
}: DashboardStatsProps) {
  const byStatus = stats?.byStatus || {};
  const pendingCount = byStatus.pending || 0;
  const shortlistedCount = byStatus.shortlisted || 0;
  const acceptedCount = byStatus.accepted || 0;
  const rejectedCount = byStatus.rejected || 0;
  const total = stats?.totalApplicants || 1;

  const byTrack = stats?.byTrack || {};

  if (loading || !stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm animate-pulse">
            <div className="flex justify-between items-center mb-3">
              <div className="h-4 w-24 bg-slate-100 rounded" />
              <div className="h-8 w-8 bg-slate-100 rounded-full" />
            </div>
            <div className="h-8 w-16 bg-slate-100 rounded mb-2" />
            <div className="h-3 w-32 bg-slate-100 rounded" />
          </div>
        ))}
      </div>
    );
  }

  const trackDetails: Record<string, { label: string; icon: any; color: string; bg: string }> = {
    frontend: { label: 'Frontend', icon: Code, color: '#3b82f6', bg: 'bg-blue-500' },
    backend: { label: 'Backend', icon: Database, color: '#8b5cf6', bg: 'bg-violet-500' },
    'ui-ux': { label: 'UI/UX Design', icon: Layers, color: '#ec4899', bg: 'bg-pink-500' },
    'data-analytics': { label: 'Data Analytics', icon: BarChart3, color: '#10b981', bg: 'bg-emerald-500' },
    mobile: { label: 'Mobile App', icon: Smartphone, color: '#f59e0b', bg: 'bg-amber-500' },
  };

  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  const segmentGap = 4;
  
  const statusSegments = [
    { key: 'accepted', count: acceptedCount, color: '#10b981', label: 'Accepted' },
    { key: 'shortlisted', count: shortlistedCount, color: '#6366f1', label: 'Shortlisted' },
    { key: 'pending', count: pendingCount, color: '#f59e0b', label: 'Pending' },
    { key: 'rejected', count: rejectedCount, color: '#f43f5e', label: 'Rejected' },
  ];

  let currentOffset = segmentGap / 2;

  return (
    <div className="space-y-6 mb-8" id="dashboard-analytics-section">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <motion.div whileHover={{ y: -2, scale: 1.01 }} onClick={() => onFilterChange('status', '')}
          className={`p-5 rounded-2xl bg-white border cursor-pointer transition-all shadow-sm ${activeStatusFilter === '' ? 'ring-2 ring-orange-500 border-orange-200' : 'border-slate-100 hover:border-slate-200'}`}>
          <div className="flex justify-between items-start">
            <div><p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Applicants</p>
              <h3 className="text-3xl font-extrabold text-slate-800 mt-1.5">{stats.totalApplicants}</h3></div>
            <div className="p-2.5 bg-slate-50 text-slate-500 rounded-xl"><Users className="w-5 h-5" /></div>
          </div>
          <p className="text-xs text-slate-500 mt-3">Across all active tracks & countries</p>
        </motion.div>

        <motion.div whileHover={{ y: -2, scale: 1.01 }} onClick={() => onFilterChange('status', 'accepted')}
          className={`p-5 rounded-2xl bg-white border cursor-pointer transition-all shadow-sm ${activeStatusFilter === 'accepted' ? 'ring-2 ring-emerald-500 border-emerald-200' : 'border-slate-100 hover:border-slate-200'}`}>
          <div className="flex justify-between items-start">
            <div><p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Accepted</p>
              <h3 className="text-3xl font-extrabold text-slate-800 mt-1.5">{acceptedCount}</h3></div>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl"><UserCheck className="w-5 h-5" /></div>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-slate-500">Acceptance Rate</span>
            <span className="text-xs font-bold text-emerald-600 font-mono">{Math.round((acceptedCount / total) * 100)}%</span>
          </div>
        </motion.div>

        <motion.div whileHover={{ y: -2, scale: 1.01 }} onClick={() => onFilterChange('status', 'shortlisted')}
          className={`p-5 rounded-2xl bg-white border cursor-pointer transition-all shadow-sm ${activeStatusFilter === 'shortlisted' ? 'ring-2 ring-indigo-500 border-indigo-200' : 'border-slate-100 hover:border-slate-200'}`}>
          <div className="flex justify-between items-start">
            <div><p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Shortlisted</p>
              <h3 className="text-3xl font-extrabold text-slate-800 mt-1.5">{shortlistedCount}</h3></div>
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl"><Bookmark className="w-5 h-5" /></div>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-slate-500">Shortlisted Ratio</span>
            <span className="text-xs font-bold text-indigo-600 font-mono">{Math.round((shortlistedCount / total) * 100)}%</span>
          </div>
        </motion.div>

        <motion.div whileHover={{ y: -2, scale: 1.01 }} onClick={() => onFilterChange('status', 'pending')}
          className={`p-5 rounded-2xl bg-white border cursor-pointer transition-all shadow-sm ${activeStatusFilter === 'pending' ? 'ring-2 ring-amber-500 border-amber-200' : 'border-slate-100 hover:border-slate-200'}`}>
          <div className="flex justify-between items-start">
            <div><p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Review</p>
              <h3 className="text-3xl font-extrabold text-slate-800 mt-1.5">{pendingCount}</h3></div>
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl"><Clock className="w-5 h-5" /></div>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-slate-500">Awaiting Review</span>
            <span className="text-xs font-bold text-amber-600 font-mono">{Math.round((pendingCount / total) * 100)}%</span>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="font-display text-sm font-bold text-slate-800 uppercase tracking-wide">Application Status Funnel</h4>
            <p className="text-xs text-slate-400 mt-0.5">Click a label to isolate applicants</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-around gap-6 my-4">
            <div className="relative w-40 h-40">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r={radius} fill="transparent" stroke="#f1f5f9" strokeWidth="10" />
                {statusSegments.map((seg) => {
                  if (seg.count === 0) return null;
                  const percentage = seg.count / total;
                  const strokeLength = (percentage * circumference) - segmentGap;
                  const dashArray = `${strokeLength} ${circumference}`;
                  const dashOffset = -currentOffset;
                  currentOffset += (percentage * circumference);

                  return (
                    <motion.circle key={seg.key} cx="50" cy="50" r={radius} fill="transparent"
                      stroke={seg.color} strokeWidth="10" strokeDasharray={dashArray} strokeDashoffset={dashOffset}
                      strokeLinecap="round" initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{ duration: 0.8, ease: 'easeOut', delay: statusSegments.indexOf(seg) * 0.1 }}
                      className="cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={(e) => { e.stopPropagation(); onFilterChange('status', seg.key); }} />
                  );
                })}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="text-2xl font-extrabold text-slate-800">{stats.totalApplicants}</span>
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wide">Candidates</span>
              </div>
            </div>

            <div className="space-y-2.5 shrink-0 w-full sm:w-auto">
              {statusSegments.map((seg) => {
                const isActive = activeStatusFilter === seg.key;
                const percentage = Math.round((seg.count / total) * 100) || 0;
                return (
                  <button key={seg.key} onClick={() => onFilterChange('status', isActive ? '' : seg.key)}
                    className={`flex items-center justify-between sm:justify-start gap-3 w-full px-3 py-1.5 rounded-xl border text-left transition-all cursor-pointer ${isActive ? 'bg-slate-50 border-orange-200 ring-1 ring-orange-500/20' : 'border-transparent hover:bg-slate-50'}`}>
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
                    <div className="text-xs font-medium text-slate-600 min-w-20">{seg.label}</div>
                    <div className="text-xs font-bold text-slate-800 font-mono">{seg.count} <span className="text-[10px] font-normal text-slate-400">({percentage}%)</span></div>
                  </button>
                );
              })}
            </div>
          </div>
          
          <div className="text-center pt-2 border-t border-slate-50">
            {activeStatusFilter ? (
              <button onClick={() => onFilterChange('status', '')} className="text-xs text-orange-600 hover:text-orange-800 font-bold cursor-pointer">Clear status filter</button>
            ) : (
              <span className="text-[10px] text-slate-400 font-mono">Click legends to apply filters directly</span>
            )}
          </div>
        </div>

        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="font-display text-sm font-bold text-slate-800 uppercase tracking-wide">Distribution by Specialty Track</h4>
            <p className="text-xs text-slate-400 mt-0.5">Click a track to isolate applicant specialties</p>
          </div>

          <div className="space-y-4 my-4">
            {Object.entries(byTrack).length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">No track data available</div>
            ) : (
              Object.entries(byTrack).map(([trackKey, count]) => {
                const config = trackDetails[trackKey] || { label: trackKey, icon: Code, color: '#64748b', bg: 'bg-slate-500' };
                const Icon = config.icon;
                const percentage = Math.round((count as number / total) * 100) || 0;
                const isActive = activeTrackFilter === trackKey;

                return (
                  <div key={trackKey} onClick={() => onFilterChange('track', isActive ? '' : trackKey)}
                    className={`group p-2.5 rounded-xl border cursor-pointer transition-all ${isActive ? 'bg-slate-50 border-orange-200 shadow-sm shadow-orange-50' : 'border-slate-50 hover:border-slate-100 hover:bg-slate-50/50'}`}>
                    <div className="flex items-center justify-between mb-1 text-xs">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-lg transition-all ${isActive ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-500 group-hover:bg-orange-50 group-hover:text-orange-600'}`}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-bold text-slate-700">{config.label}</span>
                      </div>
                      <div className="font-bold text-slate-800 font-mono">{count} <span className="text-[10px] font-normal text-slate-400">({percentage}%)</span></div>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.6, ease: 'easeOut' }} className={`h-full rounded-full ${config.bg}`} />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="text-center pt-2 border-t border-slate-50">
            {activeTrackFilter ? (
              <button onClick={() => onFilterChange('track', '')} className="text-xs text-orange-600 hover:text-orange-800 font-bold cursor-pointer">Clear track filter</button>
            ) : (
              <span className="text-[10px] text-slate-400 font-mono">Combined distribution of selection filters</span>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}