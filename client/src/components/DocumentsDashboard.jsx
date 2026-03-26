import React, { useState, useEffect } from "react";
import { fileService } from "../services/fileService";
import { departmentService } from "../services/departmentService";
import { useFileHandlers } from "../hooks/useFileHandlers";
import toast from "react-hot-toast";
import {
  FileText,
  Download,
  Eye,
  Search,
  RefreshCw,
  Filter,
  Calendar,
  User,
  Folder,
  Plus,
  X,
  Upload,
  ChevronRight,
} from "lucide-react";

const TABS = ["pending", "approved", "rejected", "correction"];

const DocumentsDashboard = ({
  showUpload = false,
  showActions = false,
  onDocumentAction,
  onDocumentClick,
  title = "Documents",
}) => {
  const [activeTab, setActiveTab] = useState("pending");
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Upload dialog
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadData, setUploadData] = useState({
    title: "",
    department: "",
    description: "",
    file: null,
  });
  const [isUploading, setIsUploading] = useState(false);

  const { handlePreview, handleDownload, handleUpload } = useFileHandlers();

  const fetchDocuments = async (forceLoading = true) => {
    try {
      if (forceLoading) setLoading(true);
      const data = await fileService.getDocuments({
        status: activeTab,
        department: selectedDepartment,
        startDate,
        endDate,
      });
      setDocuments(data.data.documents || []);
    } catch (err) {
      console.error("Error fetching documents:", err);
      toast.error("Failed to load documents");
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [activeTab, selectedDepartment]);

  useEffect(() => {
    const fetchDepts = async () => {
      try {
        const data = await departmentService.getAllDepartments();
        setDepartments(data.data.departments || []);

      } catch (err) {
        console.error("Error fetching departments:", err);
      }
    };
    fetchDepts();
  }, []);

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch =
      !searchQuery ||
      doc.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.createdBy?.fullName?.toLowerCase().includes(searchQuery.toLowerCase());
    const docDate = new Date(doc.createdDate);
    const matchesStart = !startDate || docDate >= new Date(startDate);
    const matchesEnd = !endDate || docDate <= new Date(endDate);
    return matchesSearch && matchesStart && matchesEnd;
  });

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedDepartment("");
    setStartDate("");
    setEndDate("");
  };

  const handleDocUpload = async () => {
    if (!uploadData.file || !uploadData.department || !uploadData.title) {
      toast.error("Please fill all required fields");
      return;
    }
    setIsUploading(true);
    await handleUpload({
      file: uploadData.file,
      department: uploadData.department,
      title: uploadData.title,
      description: uploadData.description,
      onSuccess: () => {
        setUploadOpen(false);
        setUploadData({ title: "", department: "", description: "", file: null });
        setIsUploading(false);
        fetchDocuments();
      },
      onError: () => {
        setIsUploading(false);
      },
    });
  };

  const tabColors = {
    pending: "blue",
    approved: "emerald",
    rejected: "red",
    correction: "amber",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
          <p className="text-sm text-slate-500 mt-1">
            {filteredDocs.length} document{filteredDocs.length !== 1 ? "s" : ""}{" "}
            found
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchDocuments()}
            className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all shadow-sm"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2.5 rounded-xl border transition-all shadow-sm ${showFilters
              ? "bg-blue-50 border-blue-200 text-blue-600"
              : "bg-white border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50"
              }`}
            title="Filters"
          >
            <Filter className="w-4 h-4" />
          </button>
          {showUpload && (
            <button
              onClick={() => setUploadOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:from-blue-700 hover:to-indigo-700 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Upload</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-x-auto">
        {TABS.map((tab) => {
          const color = tabColors[tab];
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              disabled={loading}
              className={`flex-1 min-w-[100px] px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${isActive
                ? `bg-${color}-50 text-${color}-700 shadow-sm`
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                }`}
              style={
                isActive
                  ? {
                    backgroundColor:
                      color === "blue"
                        ? "#eff6ff"
                        : color === "emerald"
                          ? "#ecfdf5"
                          : color === "red"
                            ? "#fef2f2"
                            : "#fffbeb",
                    color:
                      color === "blue"
                        ? "#1d4ed8"
                        : color === "emerald"
                          ? "#047857"
                          : color === "red"
                            ? "#b91c1c"
                            : "#b45309",
                  }
                  : {}
              }
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by title or creator..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all shadow-sm text-sm"
        />
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-4 animate-in slide-in-from-top-2">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
                Department
              </label>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all"
              >
                <option value="">All Departments</option>
                {departments.map((dept, idx) => (
                  <option key={idx} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                min={startDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              onClick={resetFilters}
              className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Reset Filters
            </button>
          </div>
        </div>
      )}

      {/* Document List */}
      <div className="space-y-3">
        {loading ? (
          Array(3)
            .fill(0)
            .map((_, i) => <SkeletonCard key={i} />)
        ) : filteredDocs.length === 0 ? (
          <EmptyState />
        ) : (
          filteredDocs.map((doc) => (
            <DocumentCard
              key={doc._id}
              doc={doc}
              onPreview={async () => {
                const url = await handlePreview(doc.fileUniqueName);
                if (onDocumentClick) {
                  onDocumentClick(url, doc);
                }
              }}
              onDownload={() => handleDownload(doc.fileUniqueName)}
              onAction={onDocumentAction}
              showActions={showActions && doc.status === "pending"}
            />
          ))
        )}
      </div>

      {/* Upload Modal */}
      {uploadOpen && (
        <UploadModal
          departments={departments}
          uploadData={uploadData}
          setUploadData={setUploadData}
          isUploading={isUploading}
          onUpload={handleDocUpload}
          onClose={() => !isUploading && setUploadOpen(false)}
        />
      )}
    </div>
  );
};

const DocumentCard = ({ doc, onPreview, onDownload, showActions, onAction }) => {
  const statusColors = {
    pending: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
    approved: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
    rejected: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
    correction: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  };

  const statusStyle = statusColors[doc.status] || statusColors.pending;

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/80 p-5 hover:border-blue-200 hover:shadow-md transition-all duration-200">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex gap-4 flex-1 min-w-0">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3
                className="text-base font-semibold text-slate-800 truncate cursor-pointer hover:text-blue-600 transition-colors"
                onClick={onPreview}
              >
                {doc.title || "Untitled"}
              </h3>
              <span
                className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-semibold ${statusStyle.bg} ${statusStyle.text} border ${statusStyle.border}`}
              >
                {doc.status?.toUpperCase()}
              </span>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-slate-500">
              <span className="flex items-center gap-1">
                <Folder className="w-3.5 h-3.5" />
                {doc.department?.departmentName || "Unassigned"}
              </span>
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5" />
                {doc.createdBy?.fullName || "Unknown"}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(doc.createdDate).toLocaleDateString()}
              </span>
            </div>
            {doc.description && (
              <p className="text-sm text-slate-400 mt-1.5 line-clamp-1">
                {doc.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={onPreview}
            className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
            title="Preview"
          >
            <Eye className="w-4.5 h-4.5" />
          </button>
          <button
            onClick={onDownload}
            className="p-2 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all"
            title="Download"
          >
            <Download className="w-4.5 h-4.5" />
          </button>
          {showActions && (
            <button
              onClick={onPreview}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-semibold hover:bg-blue-100 transition-all"
            >
              Review
              <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const SkeletonCard = () => (
  <div className="bg-white rounded-2xl border border-slate-200/80 p-5 animate-pulse">
    <div className="flex gap-4">
      <div className="w-11 h-11 rounded-xl bg-slate-200" />
      <div className="flex-1 space-y-3">
        <div className="h-5 bg-slate-200 rounded-lg w-1/3" />
        <div className="flex gap-4">
          <div className="h-4 bg-slate-200 rounded w-24" />
          <div className="h-4 bg-slate-200 rounded w-20" />
          <div className="h-4 bg-slate-200 rounded w-28" />
        </div>
      </div>
    </div>
  </div>
);

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-16 text-slate-400">
    <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
      <FileText className="w-10 h-10 text-slate-300" />
    </div>
    <p className="text-lg font-medium text-slate-500">No documents found</p>
    <p className="text-sm mt-1">Try adjusting your filters or upload a new document</p>
  </div>
);

const UploadModal = ({
  departments,
  uploadData,
  setUploadData,
  isUploading,
  onUpload,
  onClose,
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg relative animate-in fade-in zoom-in-95">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
            <Upload className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-lg font-bold text-slate-800">Upload Document</h2>
        </div>
        <button
          onClick={onClose}
          disabled={isUploading}
          className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Body */}
      <div className="px-6 py-5 space-y-4">
        <div>
          <label className="block text-sm font-semibold text-slate-600 mb-1.5">
            Title *
          </label>
          <input
            type="text"
            value={uploadData.title}
            onChange={(e) =>
              setUploadData({ ...uploadData, title: e.target.value })
            }
            disabled={isUploading}
            placeholder="Enter document title"
            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all disabled:opacity-50"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-600 mb-1.5">
            Department *
          </label>
          <select
            value={uploadData.department}
            onChange={(e) =>
              setUploadData({ ...uploadData, department: e.target.value })
            }
            disabled={isUploading}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all disabled:opacity-50"
          >
            <option value="">Select Department</option>
            {departments.map((dept, idx) => (
              <option key={idx} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-600 mb-1.5">
            PDF File *
          </label>
          <input
            type="file"
            accept=".pdf"
            disabled={isUploading}
            onChange={(e) =>
              setUploadData({ ...uploadData, file: e.target.files[0] })
            }
            className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100 disabled:opacity-50"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-600 mb-1.5">
            Description
          </label>
          <textarea
            value={uploadData.description}
            onChange={(e) =>
              setUploadData({ ...uploadData, description: e.target.value })
            }
            disabled={isUploading}
            rows={3}
            placeholder="Optional description..."
            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm resize-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all disabled:opacity-50"
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100">
        <button
          onClick={onClose}
          disabled={isUploading}
          className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={onUpload}
          disabled={isUploading}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold shadow-md shadow-blue-500/20 hover:shadow-blue-500/40 transition-all disabled:opacity-50"
        >
          {isUploading ? "Uploading..." : "Upload Document"}
        </button>
      </div>
    </div>
  </div>
);

export default DocumentsDashboard;
