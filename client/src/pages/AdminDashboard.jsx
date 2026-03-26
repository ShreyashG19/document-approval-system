import React, { useState } from "react";
import DocumentsDashboard from "../components/DocumentsDashboard";
import { X, FileText, Folder, User, Calendar, Download } from "lucide-react";
import { useFileHandlers } from "../hooks/useFileHandlers";

const AdminDashboard = () => {
  const [viewerOpen, setViewerOpen] = useState(false);
  const [currentPdfUrl, setCurrentPdfUrl] = useState("");
  const [selectedDoc, setSelectedDoc] = useState(null);
  const { handleDownload } = useFileHandlers();

  const handleDocumentClick = (url, doc) => {
    setCurrentPdfUrl(url);
    setSelectedDoc(doc);
    setViewerOpen(true);
  };

  return (
    <div>
      <DocumentsDashboard
        title="Admin Dashboard"
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
              {/* PDF */}
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

              {/* Details */}
              <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-slate-200 p-5 overflow-y-auto bg-white">
                <div className="space-y-5">
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

                  <div>
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-2">
                      Description
                    </h3>
                    <div className="bg-slate-50 p-3 rounded-xl text-sm text-slate-600 border border-slate-100">
                      {selectedDoc?.description || "No description"}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-2">
                      Remarks
                    </h3>
                    <div className="bg-slate-50 p-3 rounded-xl text-sm text-slate-600 border border-slate-100">
                      {selectedDoc?.remarks || "No remarks"}
                    </div>
                  </div>

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

export default AdminDashboard;
