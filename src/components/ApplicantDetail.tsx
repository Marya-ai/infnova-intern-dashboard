import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Mail, Phone, Globe, Calendar, Briefcase, Award, 
  ExternalLink, Github, Linkedin, FileText, 
  Save, AlertCircle, CheckCircle2, RefreshCw 
} from 'lucide-react';
import { Applicant, StatusType } from '../types';

interface ApplicantDetailProps {
  applicantId: string | null;
  token: string;
  onClose: () => void;
  onStatusUpdated: (id: string, newStatus: StatusType) => void;
  onNotesUpdated: (id: string, newNotes: string | null) => void;
  onSessionExpired: () => void;
}

const API_BASE = 'https://infnova-intern.vercel.app/api';

export default function ApplicantDetail({
  applicantId,
  token,
  onClose,
  onStatusUpdated,
  onNotesUpdated,
  onSessionExpired,
}: ApplicantDetailProps) {
  const [applicant, setApplicant] = useState<Applicant | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [notesText, setNotesText] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesSuccess, setNotesSuccess] = useState(false);
  const [notesError, setNotesError] = useState<string | null>(null);

  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [statusSuccess, setStatusSuccess] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);

  useEffect(() => {
    if (applicantId) {
      fetchApplicantDetails();
    } else {
      setApplicant(null);
    }
  }, [applicantId]);

  const fetchApplicantDetails = async () => {
    if (!applicantId) return;
    setLoading(true);
    setError(null);
    setNotesSuccess(false);
    setStatusSuccess(false);

    try {
      const res = await fetch(`${API_BASE}/applicants/${applicantId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (res.status === 401) { onSessionExpired(); return; }
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to retrieve applicant details.');
      }

      const data: Applicant = await res.json();
      setApplicant(data);
      setNotesText(data.notes || '');
    } catch (err: any) {
      setError(err.message || 'An error occurred while loading details.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus: StatusType) => {
    if (!applicant) return;
    
    const previousApplicant = { ...applicant };
    
    setUpdatingStatus(newStatus);
    setApplicant({ ...applicant, status: newStatus });
    setStatusError(null);
    setStatusSuccess(false);

    try {
      const res = await fetch(`${API_BASE}/applicants/${applicant.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.status === 401) { 
        onSessionExpired(); 
        return; 
      }
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Could not update status.');
      }

      onStatusUpdated(applicant.id, newStatus);
      setStatusSuccess(true);
      setTimeout(() => setStatusSuccess(false), 3000);
    } catch (err: any) {
      setApplicant(previousApplicant);
      setStatusError(err.message || 'Status update failed. Reverted to previous status.');
      setTimeout(() => setStatusError(null), 3000);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleSaveNotes = async () => {
    if (!applicant) return;
    setSavingNotes(true);
    setNotesError(null);
    setNotesSuccess(false);

    try {
      const trimmedNotes = notesText.trim() === '' ? null : notesText;
      const res = await fetch(`${API_BASE}/applicants/${applicant.id}/notes`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ notes: trimmedNotes }),
      });

      if (res.status === 401) { onSessionExpired(); return; }
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Could not save notes.');
      }

      setApplicant(prev => prev ? { ...prev, notes: trimmedNotes } : null);
      onNotesUpdated(applicant.id, trimmedNotes || '');
      setNotesSuccess(true);
      setTimeout(() => setNotesSuccess(false), 3000);
    } catch (err: any) {
      setNotesError(err.message || 'Notes update failed.');
    } finally {
      setSavingNotes(false);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
      });
    } catch { return dateStr; }
  };

  const statusColors: Record<StatusType, { badge: string; text: string; bg: string; border: string }> = {
    pending: { badge: 'bg-amber-100 text-amber-800 border-amber-200', text: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
    shortlisted: { badge: 'bg-indigo-100 text-indigo-800 border-indigo-200', text: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200' },
    accepted: { badge: 'bg-emerald-100 text-emerald-800 border-emerald-200', text: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
    rejected: { badge: 'bg-rose-100 text-rose-800 border-rose-200', text: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200' },
  };

  const trackLabels: Record<string, string> = {
    frontend: 'Frontend Engineering', backend: 'Backend Engineering', 'ui-ux': 'UI/UX Design', 
    'data-analytics': 'Data Analytics', mobile: 'Mobile Development',
  };

  return (
    <AnimatePresence>
      {applicantId && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end" id="applicant-detail-container">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            id="applicant-detail-backdrop"
          />

          <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="relative w-full max-w-2xl bg-white shadow-2xl h-full flex flex-col z-10 border-l border-slate-100"
            id="applicant-detail-panel"
          >
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-semibold text-slate-400 bg-slate-100 px-2 py-1 rounded">ID: {applicantId}</span>
                {applicant && (
                  <span className={`text-xs font-bold uppercase tracking-wider border px-2.5 py-0.5 rounded-full ${statusColors[applicant.status].badge}`}>
                    {applicant.status}
                  </span>
                )}
              </div>
              <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all cursor-pointer" id="close-drawer-btn">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {loading && (
                <div className="py-20 flex flex-col items-center justify-center gap-3">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-600" />
                  <p className="text-xs font-medium text-slate-500">Retrieving application dossier...</p>
                </div>
              )}

              {error && (
                <div className="py-12 px-6 text-center max-w-md mx-auto">
                  <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
                  <h4 className="font-display font-semibold text-slate-800 text-lg">Failed to Load Applicant</h4>
                  <p className="text-xs text-slate-500 mt-2">{error}</p>
                  <button onClick={fetchApplicantDetails} className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-xl text-xs font-semibold hover:bg-orange-700 cursor-pointer transition-all">
                    <RefreshCw className="w-3 h-3" /> Try Again
                  </button>
                </div>
              )}

              {applicant && !loading && !error && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                  <div className="pb-6 border-b border-slate-100">
                    <h3 className="font-display text-2xl font-bold text-slate-800 tracking-tight">{applicant.fullName}</h3>
                    <div className="flex items-center gap-2 text-orange-600 font-semibold text-sm mt-1">
                      <Briefcase className="w-4 h-4 shrink-0" />
                      <span>{trackLabels[applicant.track] || applicant.track}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100/50">
                    <div className="flex items-center gap-3 text-slate-600">
                      <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                      <a href={`mailto:${applicant.email}`} className="text-xs hover:text-orange-600 hover:underline break-all font-medium">{applicant.email}</a>
                    </div>
                    <div className="flex items-center gap-3 text-slate-600">
                      <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="text-xs font-medium">{applicant.phoneNumber}</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-600">
                      <Globe className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="text-xs font-medium">{applicant.country}</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-600">
                      <Award className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="text-xs font-medium capitalize">{applicant.experienceLevel} level</span>
                    </div>
                    <div className="col-span-1 sm:col-span-2 flex items-center gap-3 text-slate-600 pt-1 border-t border-slate-200/40">
                      <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="text-xs text-slate-500">Applied: {formatDate(applicant.applicationDate)}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2.5">
                    {applicant.portfolioUrl && (
                      <a href={applicant.portfolioUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-600 hover:text-orange-600 hover:border-orange-100 hover:bg-orange-50/20 transition-all cursor-pointer">
                        <Globe className="w-3.5 h-3.5 text-orange-500" /><span>Portfolio Website</span><ExternalLink className="w-3 h-3 text-slate-400" />
                      </a>
                    )}
                    {applicant.githubUrl && (
                      <a href={applicant.githubUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-600 hover:text-orange-600 hover:border-orange-100 hover:bg-orange-50/20 transition-all cursor-pointer">
                        <Github className="w-3.5 h-3.5 text-slate-800" /><span>GitHub Profile</span><ExternalLink className="w-3 h-3 text-slate-400" />
                      </a>
                    )}
                    {applicant.linkedInUrl && (
                      <a href={applicant.linkedInUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-600 hover:text-orange-600 hover:border-orange-100 hover:bg-orange-50/20 transition-all cursor-pointer">
                        <Linkedin className="w-3.5 h-3.5 text-blue-600" /><span>LinkedIn Connection</span><ExternalLink className="w-3 h-3 text-slate-400" />
                      </a>
                    )}
                  </div>

                  <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-3" id="status-updater-block">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Change Application Status</h4>
                      {statusSuccess && (<span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Status Saved</span>)}
                      {statusError && (<span className="text-[10px] text-rose-600 font-bold flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> Error updating</span>)}
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {(['pending', 'shortlisted', 'accepted', 'rejected'] as StatusType[]).map((statusVal) => {
                        const isSelected = applicant.status === statusVal;
                        const isPendingThis = updatingStatus === statusVal;
                        const colors = statusColors[statusVal];

                        return (
                          <button key={statusVal} onClick={() => handleUpdateStatus(statusVal)} disabled={updatingStatus !== null}
                            className={`px-3 py-2 rounded-xl border text-xs font-bold capitalize transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                              isSelected ? `${colors.bg} ${colors.border} ${colors.text} ring-2 ring-orange-500/20` : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100/70 hover:text-slate-800'
                            }`}
                          >
                            {isPendingThis && (<svg className="animate-spin h-3.5 w-3.5 text-slate-500" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>)}
                            <span>{statusVal}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide">Skills & Technologies</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {applicant.skills.map((skill) => (
                        <span key={skill} className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium border border-slate-200/50">{skill}</span>
                      ))}
                    </div>
                  </div>

                  {applicant.motivation && (
                    <div className="space-y-2 pb-2">
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-slate-400" /> Statement of Motivation
                      </h4>
                      <blockquote className="text-xs text-slate-600 bg-slate-50 p-4 rounded-2xl border-l-4 border-orange-500 leading-relaxed italic">
                        "{applicant.motivation}"
                      </blockquote>
                    </div>
                  )}

                  <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/30 space-y-4" id="internal-notes-block">
                    <div className="flex justify-between items-center">
                      <label htmlFor="notes" className="text-xs font-bold text-slate-700 uppercase tracking-wide">Internal Review Notes</label>
                      <span className="text-[10px] text-slate-400 font-mono">{notesText.length}/1000 chars</span>
                    </div>

                    <textarea
                      id="notes" value={notesText} onChange={(e) => setNotesText(e.target.value.slice(0, 1000))}
                      className="w-full h-32 p-3 bg-white border border-slate-200 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-50/50 transition-all leading-relaxed text-slate-700 resize-none"
                      placeholder="Enter internal candidate logs, interview availability, performance highlights..."
                    />

                    <div className="flex justify-between items-center pt-1">
                      <div>
                        {notesSuccess && (<motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-xs text-emerald-600 font-bold flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Notes saved successfully</motion.span>)}
                        {notesError && (<motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-xs text-rose-600 font-bold flex items-center gap-1"><AlertCircle className="w-4 h-4" /> {notesError}</motion.span>)}
                      </div>

                      <button onClick={handleSaveNotes} disabled={savingNotes || applicant.notes === (notesText.trim() === '' ? null : notesText)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl text-xs font-semibold cursor-pointer transition-all shadow-md hover:shadow-orange-100"
                        id="save-notes-btn"
                      >
                        {savingNotes ? (<RefreshCw className="w-3.5 h-3.5 animate-spin" />) : (<Save className="w-3.5 h-3.5" />)}
                        <span>{savingNotes ? 'Saving...' : 'Save Evaluation'}</span>
                      </button>
                    </div>
                  </div>

                </motion.div>
              )}
            </div>

            {applicant && (
              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 text-right">
                <span className="text-[10px] text-slate-400 font-mono">Dossier last updated: {formatDate(applicant.updatedAt)}</span>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}