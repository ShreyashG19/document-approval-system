import React, { useState } from "react";
import DocumentsDashboard from "../components/DocumentsDashboard";
import { useFileHandlers } from "../hooks/useFileHandlers";
import { fileService } from "../services/fileService";
import toast from "react-hot-toast";
import {
  X,
  FileText,
  Folder,
  User,
  Calendar,
  CheckCircle,
  XCircle,
  Edit3,
  Download,
  Maximize2,
  Minimize2,
} from "lucide-react";

const ApproverDashboard = () => {
  const [viewerOpen, setViewerOpen] = useState(false);
  const [currentPdfUrl, setCurrentPdfUrl] = useState("");
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [remark, setRemark] = useState("");
  const [isRemarkMode, setIsRemarkMode] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const { handleDownload } = useFileHandlers();

  const handleDocumentClick = (url, doc) => {
    setCurrentPdfUrl(url);
    setSelectedDoc(doc);
    setRemark("");
    setIsRemarkMode(false);
    setViewerOpen(true);
  };

  const handleAction = async (actionType) => {
    if (!selectedDoc?.fileUniqueName) {
      toast.error("No document selected");
      return;
    }

    if (actionType === "correction" && (!remark || !remark.trim())) {
      if (!isRemarkMode) {
        setIsRemarkMode(true);
        toast("Please enter a remark for correction", { icon: "✏️" });
        return;
      }
      toast.error("Remark is required for correction");
      return;
    }

    setActionLoading(true);
    const loadingToast = toast.loading(
      `${actionType.charAt(0).toUpperCase() + actionType.slice(1)}ing document...`
    );

    try {
      let response;
      if (actionType === "approve") {
        response = await fileService.approveDocument(
          selectedDoc.fileUniqueName,
          remark
        );
      } else if (actionType === "reject") {
        response = await fileService.rejectDocument(
          selectedDoc.fileUniqueName,
          remark
        );
      } else if (actionType === "correction") {
        response = await fileService.requestCorrection(
          selectedDoc.fileUniqueName,
          remark
        );
      }

      toast.dismiss(loadingToast);
      toast.success(response?.message || `Document ${actionType}d successfully!`);
      setViewerOpen(false);
      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error(error.response?.data?.message || `${actionType} failed`);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div>
      <DocumentsDashboard
        key={refreshKey}
        title="Approver Dashboard"
        showActions
        onDocumentClick={handleDocumentClick}
      />

      {/* Document Viewer Modal */}
      {viewerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg font-bold text-slate-800 truncate">
                    {selectedDoc?.title || "Document Preview"}
                  </h2>
                  <p className="text-xs text-slate-400">
                    {selectedDoc?.department?.departmentName} •{" "}
                    {selectedDoc?.createdBy?.fullName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewerOpen(false)}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
              {/* PDF Viewer */}
              <div className="flex-1 min-h-[40vh] lg:min-h-0 bg-slate-50 p-4">
                {currentPdfUrl ? (
                  <iframe
                    src={currentPdfUrl}
                    className="w-full h-full rounded-lg border border-slate-200"
                    title="PDF Preview"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-400">
                    No preview available
                  </div>
                )}
              </div>

              {/* Details Panel */}
              <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-slate-200 p-5 overflow-y-auto bg-white">
                <div className="space-y-5">
                  {/* Document Info */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-3">
                      Details
                    </h3>
                    <div className="space-y-3">
                      <InfoRow
                        icon={<Folder className="w-4 h-4" />}
                        label="Department"
                        value={selectedDoc?.department?.departmentName}
                      />
                      <InfoRow
                        icon={<User className="w-4 h-4" />}
                        label="Created By"
                        value={selectedDoc?.createdBy?.fullName}
                      />
                      <InfoRow
                        icon={<Calendar className="w-4 h-4" />}
                        label="Date"
                        value={
                          selectedDoc?.createdDate
                            ? new Date(
                                selectedDoc.createdDate
                              ).toLocaleDateString()
                            : "N/A"
                        }
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-2">
                      Description
                    </h3>
                    <div className="bg-slate-50 p-3 rounded-xl text-sm text-slate-600 border border-slate-100">
                      {selectedDoc?.description || "No description"}
                    </div>
                  </div>

                  {/* Remarks */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">
                        Remarks
                      </h3>
                      {selectedDoc?.status === "pending" && !isRemarkMode && (
                        <button
                          onClick={() => setIsRemarkMode(true)}
                          className="p-1 rounded-md text-blue-500 hover:bg-blue-50 transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    {isRemarkMode ? (
                      <textarea
                        value={remark}
                        onChange={(e) => setRemark(e.target.value)}
                        rows={4}
                        placeholder="Enter your remarks..."
                        className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-700 resize-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all"
                      />
                    ) : (
                      <div className="bg-slate-50 p-3 rounded-xl text-sm text-slate-600 border border-slate-100">
                        {selectedDoc?.remarks || "No remarks"}
                      </div>
                    )}
                  </div>

                  {/* Download */}
                  <button
                    onClick={() =>
                      selectedDoc?.fileUniqueName &&
                      handleDownload(selectedDoc.fileUniqueName)
                    }
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 text-slate-600 text-sm font-medium hover:bg-slate-200 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download PDF
                  </button>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            {selectedDoc?.status === "pending" && (
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
                <button
                  onClick={() => handleAction("approve")}
                  disabled={actionLoading}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold shadow-md shadow-emerald-500/20 hover:bg-emerald-700 hover:shadow-emerald-500/30 transition-all disabled:opacity-50"
                >
                  <CheckCircle className="w-4 h-4" />
                  Approve
                </button>
                <button
                  onClick={() => handleAction("reject")}
                  disabled={actionLoading}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold shadow-md shadow-red-500/20 hover:bg-red-700 hover:shadow-red-500/30 transition-all disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4" />
                  Reject
                </button>
                <button
                  onClick={() => handleAction("correction")}
                  disabled={actionLoading}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 text-white text-sm font-semibold shadow-md shadow-amber-500/20 hover:bg-amber-600 hover:shadow-amber-500/30 transition-all disabled:opacity-50"
                >
                  <Edit3 className="w-4 h-4" />
                  Correction
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const InfoRow = ({ icon, label, value }) => (
  <div className="flex items-start gap-2.5">
    <span className="text-slate-400 mt-0.5">{icon}</span>
    <div>
      <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wide">
        {label}
      </p>
      <p className="text-sm text-slate-700 font-medium">{value || "N/A"}</p>
    </div>
  </div>
);

export default ApproverDashboard;
