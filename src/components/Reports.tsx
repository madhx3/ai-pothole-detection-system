import { useState } from 'react';
import { Search, FileText, MapPin, Clock, AlertCircle, CheckCircle2, ChevronDown, ChevronUp, Loader, X } from 'lucide-react';
import GlassCard from './GlassCard';

const API_BASE = 'http://localhost:5000';

export type Report = {
  report_id: string;
  lat: number;
  lng: number;
  severity: 'high' | 'medium' | 'low';
  confidence: number;
  timestamp: string;
  notes?: string;
  image_name?: string;
};

const severityStyles = {
  high:   { text: 'text-red-400',    bg: 'bg-red-500/15',    border: 'border-red-500/30',    dot: 'bg-red-500',    label: 'High' },
  medium: { text: 'text-orange-400', bg: 'bg-orange-500/15', border: 'border-orange-500/30', dot: 'bg-orange-400', label: 'Medium' },
  low:    { text: 'text-blue-400',   bg: 'bg-blue-500/15',   border: 'border-blue-500/30',   dot: 'bg-blue-500',   label: 'Low' },
};

function ReportCard({ report, onClose }: { report: Report; onClose?: () => void }) {
  const s = severityStyles[report.severity] ?? severityStyles.low;

  return (
    <GlassCard className="p-6 relative">
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition"
        >
          <X size={18} />
        </button>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 mb-5">
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0">
            <FileText className="text-white w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold mb-0.5">Report ID</p>
            <p className="text-white font-mono text-base sm:text-lg font-bold tracking-wide break-all">{report.report_id}</p>
          </div>
        </div>
        <span className={`ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${s.bg} ${s.text} ${s.border} shrink-0`}>
          <span className={`w-2 h-2 rounded-full ${s.dot}`} />
          {s.label} Severity
        </span>
      </div>

      {/* Divider */}
      <div className="h-px bg-white/10 mb-5" />

      {/* Image preview */}
      {report.image_name && (
        <div className="mb-5">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Detected Image</p>
          <div className="w-full bg-white/5 rounded-lg overflow-hidden border border-white/10">
            <img
              src={`http://localhost:5000/uploads/${report.image_name}`}
              alt="Detected pothole"
              className="w-full h-auto max-h-64 object-contain"
            />
          </div>
        </div>
      )}

      {/* Divider */}
      <div className="h-px bg-white/10 mb-5" />

      {/* Details grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div className="space-y-1">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Confidence</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-white/10 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  report.severity === 'high' ? 'bg-red-500' :
                  report.severity === 'medium' ? 'bg-orange-400' : 'bg-blue-500'
                }`}
                style={{ width: `${report.confidence}%` }}
              />
            </div>
            <span className="text-white font-mono text-xs sm:text-sm font-semibold whitespace-nowrap">{report.confidence}%</span>
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Status</p>
          <div className="flex items-center gap-2">
            <AlertCircle className="text-red-400 w-4 h-4 shrink-0" />
            <span className="text-red-300 text-xs sm:text-sm font-medium">Pothole Detected</span>
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-xs text-gray-500 uppercase tracking-wider flex items-center gap-1">
            <MapPin className="w-3 h-3" /> Location
          </p>
          <p className="text-white font-mono text-xs sm:text-sm break-all">
            {report.lat.toFixed(6)}°, {report.lng.toFixed(6)}°
          </p>
        </div>

        <div className="space-y-1">
          <p className="text-xs text-gray-500 uppercase tracking-wider flex items-center gap-1">
            <Clock className="w-3 h-3" /> Detected At
          </p>
          <p className="text-white text-xs sm:text-sm">
            {new Date(report.timestamp).toLocaleString()}
          </p>
        </div>

        {report.notes && (
          <div className="col-span-1 sm:col-span-2 space-y-1">
            <p className="text-xs text-gray-500 uppercase tracking-wider">Notes</p>
            <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">{report.notes}</p>
          </div>
        )}
      </div>
    </GlassCard>
  );
}

export default function Reports({ recentReportId }: { recentReportId?: string | null }) {
  const [searchId, setSearchId] = useState('');
  const [searchResult, setSearchResult] = useState<Report | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);
  const [allReports, setAllReports] = useState<Report[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [loadingAll, setLoadingAll] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchId.trim()) return;

    setSearching(true);
    setSearchResult(null);
    setSearchError(null);

    try {
      const res = await fetch(`${API_BASE}/reports/${searchId.trim().toUpperCase()}`);
      if (res.ok) {
        const data: Report = await res.json();
        setSearchResult(data);
      } else {
        const err = await res.json();
        setSearchError(err.error || 'Report not found');
      }
    } catch {
      setSearchError('Could not connect to server');
    } finally {
      setSearching(false);
    }
  };

  const handleToggleAll = async () => {
    if (!showAll && allReports.length === 0) {
      setLoadingAll(true);
      try {
        const res = await fetch(`${API_BASE}/reports`);
        const data: Report[] = await res.json();
        setAllReports(data);
      } catch {
        /* ignore */
      } finally {
        setLoadingAll(false);
      }
    }
    setShowAll(prev => !prev);
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-4xl mx-auto">

        {/* Section header */}
        <div className="text-center mb-10 sm:mb-14 px-2">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 sm:mb-4 text-white leading-tight">
            Detection Reports
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
            Every detected pothole generates a unique report — search by ID to retrieve full details
          </p>
        </div>

        {/* Recent report banner */}
        {recentReportId && (
          <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-green-500/15 border border-green-500/30 rounded-xl px-4 sm:px-5 py-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="text-green-400 w-5 h-5 shrink-0" />
              <div>
                <p className="text-green-300 text-xs sm:text-sm font-medium">New report generated!</p>
                <p className="text-green-400 font-mono text-base sm:text-lg font-bold tracking-wide">{recentReportId}</p>
              </div>
            </div>
            <button
              onClick={() => { setSearchId(recentReportId); }}
              className="text-xs sm:text-sm bg-green-600/40 hover:bg-green-600/60 border border-green-500/40 text-green-200 px-3 sm:px-4 py-2 rounded-lg transition whitespace-nowrap"
            >
              View Report →
            </button>
          </div>
        )}

        {/* Search bar */}
        <GlassCard className="p-4 sm:p-6 mb-6 sm:mb-8">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
              <input
                type="text"
                value={searchId}
                onChange={e => setSearchId(e.target.value.toUpperCase())}
                placeholder="e.g. RPT-20260420-001"
                className="w-full bg-white/10 border border-white/20 rounded-xl pl-10 pr-4 py-2 sm:py-3 text-white placeholder-gray-500 font-mono text-sm focus:outline-none focus:border-blue-500/60 focus:bg-white/15 transition"
              />
            </div>
            <button
              type="submit"
              disabled={searching || !searchId.trim()}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              {searching ? <Loader className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              <span className="hidden sm:inline">Search</span>
            </button>
          </form>
        </GlassCard>

        {/* Search result */}
        {searchResult && (
          <div className="mb-8">
            <ReportCard report={searchResult} onClose={() => setSearchResult(null)} />
          </div>
        )}

        {searchError && (
          <div className="mb-8 flex items-center gap-3 bg-red-500/15 border border-red-500/30 rounded-xl px-5 py-4">
            <AlertCircle className="text-red-400 w-5 h-5 shrink-0" />
            <p className="text-red-300 text-sm">{searchError}</p>
          </div>
        )}

        {/* All reports toggle */}
        <button
          onClick={handleToggleAll}
          className="w-full flex items-center justify-between px-6 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-white transition"
        >
          <span className="font-semibold">View All Reports</span>
          {loadingAll
            ? <Loader className="w-5 h-5 animate-spin text-gray-400" />
            : showAll
              ? <ChevronUp className="w-5 h-5 text-gray-400" />
              : <ChevronDown className="w-5 h-5 text-gray-400" />
          }
        </button>

        {showAll && (
          <div className="mt-4 space-y-4">
            {allReports.length === 0 ? (
              <div className="text-center py-10 text-gray-500">No reports found</div>
            ) : (
              allReports.map(r => <ReportCard key={r.report_id} report={r} />)
            )}
          </div>
        )}
      </div>
    </section>
  );
}