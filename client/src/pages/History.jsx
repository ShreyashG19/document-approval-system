import React, { useState, useEffect } from "react";
import { fileService } from "../services/fileService";
import { departmentService } from "../services/departmentService";
import { useFileHandlers } from "../hooks/useFileHandlers";
import { getStatusColor } from "../../utils/statusColors";
import toast from "react-hot-toast";
import {
  FileText, Download, Eye, Search, RefreshCw, Filter,
  Calendar, User, Folder, X,
} from "lucide-react";

const TABS = ["pending", "approved", "rejected", "correction"];

const History = () => {
  const [tab, setTab] = useState("pending");
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [depts, setDepts] = useState([]);
  const [dept, setDept] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
  const [selDoc, setSelDoc] = useState(null);
  const { handlePreview, handleDownload } = useFileHandlers();

  const fetchDocs = async () => {
    try {
      setLoading(true);
      const data = await fileService.getDocuments({ status: tab, department: dept });
      setDocs(data.documents || []);
    } catch { toast.error("Failed to load"); setDocs([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchDocs(); }, [tab, dept]);
  useEffect(() => {
    departmentService.getAllDepartments().then((d) => setDepts(d.data || [])).catch(() => {});
  }, []);

  const filtered = docs.filter((d) => {
    const ms = !search || d.title?.toLowerCase().includes(search.toLowerCase());
    const ds = !startDate || new Date(d.createdDate) >= new Date(startDate);
    const de = !endDate || new Date(d.createdDate) <= new Date(endDate);
    return ms && ds && de;
  });

  const tabColors = { pending: "#eff6ff", approved: "#ecfdf5", rejected: "#fef2f2", correction: "#fffbeb" };
  const tabTextColors = { pending: "#1d4ed8", approved: "#047857", rejected: "#b91c1c", correction: "#b45309" };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-slate-800">History</h1>
          <p className="text-sm text-slate-500 mt-1">{filtered.length} document{filtered.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchDocs} className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all shadow-sm">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button onClick={() => setFiltersOpen(!filtersOpen)} className={`p-2.5 rounded-xl border transition-all shadow-sm ${filtersOpen ? "bg-blue-50 border-blue-200 text-blue-600" : "bg-white border-slate-200 text-slate-500 hover:text-blue-600"}`}>
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex gap-1 p-1 bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-x-auto">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} disabled={loading}
            className="flex-1 min-w-[100px] px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={tab === t ? { backgroundColor: tabColors[t], color: tabTextColors[t] } : { color: "#64748b" }}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input type="text" placeholder="Search by title..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all shadow-sm text-sm" />
      </div>

      {filtersOpen && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm animate-in slide-in-from-top-2">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div><label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Dept</label>
              <select value={dept} onChange={(e) => setDept(e.target.value)} className="w-full px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 text-sm">
                <option value="">All</option>{depts.map((d, i) => <option key={i} value={d}>{d}</option>)}
              </select>
            </div>
            <div><label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Start</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm" />
            </div>
            <div><label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">End</label>
              <input type="date" value={endDate} min={startDate} onChange={(e) => setEndDate(e.target.value)} className="w-full px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm" />
            </div>
          </div>
          <div className="flex justify-end mt-3">
            <button onClick={() => { setSearch(""); setDept(""); setStartDate(""); setEndDate(""); }} className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg">Reset</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {loading ? [0,1,2].map((i) => <div key={i} className="bg-white rounded-2xl border border-slate-200/80 p-5 animate-pulse"><div className="flex gap-4"><div className="w-11 h-11 rounded-xl bg-slate-200" /><div className="flex-1 space-y-3"><div className="h-5 bg-slate-200 rounded-lg w-1/3" /><div className="h-4 bg-slate-200 rounded w-24" /></div></div></div>) :
         filtered.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-slate-400">
            <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mb-4"><FileText className="w-10 h-10 text-slate-300" /></div>
            <p className="text-lg font-medium text-slate-500">No documents found</p>
          </div>
        ) : filtered.map((doc) => (
          <div key={doc._id} className="group bg-white rounded-2xl border border-slate-200/80 p-5 hover:border-blue-200 hover:shadow-md transition-all">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div className="flex gap-4 flex-1 min-w-0">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center flex-shrink-0"><FileText className="w-5 h-5 text-blue-600" /></div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-semibold text-slate-800 truncate cursor-pointer hover:text-blue-600 transition-colors"
                      onClick={async () => { const u = await handlePreview(doc.fileUniqueName); setPdfUrl(u); setSelDoc(doc); setViewerOpen(true); }}>
                      {doc.title || "Untitled"}
                    </h3>
                    <span className={getStatusColor(doc.status)}>{doc.status?.toUpperCase()}</span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-slate-500">
                    <span className="flex items-center gap-1"><Folder className="w-3.5 h-3.5" />{doc.department?.departmentName || "N/A"}</span>
                    <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" />{doc.createdBy?.fullName || "N/A"}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{new Date(doc.createdDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={async () => { const u = await handlePreview(doc.fileUniqueName); setPdfUrl(u); setSelDoc(doc); setViewerOpen(true); }}
                  className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"><Eye className="w-4 h-4" /></button>
                <button onClick={() => handleDownload(doc.fileUniqueName)}
                  className="p-2 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all"><Download className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {viewerOpen && selDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800 truncate">{selDoc.title}</h2>
              <button onClick={() => setViewerOpen(false)} className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 bg-slate-50 p-4 overflow-hidden">
              {pdfUrl ? <iframe src={pdfUrl} className="w-full h-full rounded-lg border border-slate-200" title="PDF" /> : <p className="text-center text-slate-400 py-12">No preview</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;
