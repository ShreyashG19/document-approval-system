import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useFetchDocuments } from "@/services/documents/documentsApi";
import useFileHandlers from "@/services/files/useFileHandlers";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { useAuth } from '@/services/auth/useAuth'

const DocumentPage = ({ status }: { status?: string }) => {
  const params = useParams();
  const pageStatus = status ?? (params as any).status ?? "pending";

  const { data, isLoading, isError, refetch } = useFetchDocuments({
    status: pageStatus,
  });
  const { handlePreview, handleDownload, handleUpload } = useFileHandlers();
  const [previewing, setPreviewing] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);
  const { user } = useAuth()

  // Upload modal state + form
  const [open, setOpen] = useState(false)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadDept, setUploadDept] = useState('')
  const [uploadTitle, setUploadTitle] = useState('')
  const [uploadDescription, setUploadDescription] = useState('')
  const [isUploading, setIsUploading] = useState(false)

  // Listen for sidebar-triggered open events (desktop)
  useEffect(() => {
    const handler = () => setOpen(true)
    window.addEventListener('openUploadModal', handler as EventListener)
    return () => window.removeEventListener('openUploadModal', handler as EventListener)
  }, [])

  if (isLoading) return <div>Loading documents...</div>;
  if (isError)
    return <div className="text-red-600">Failed to load documents</div>;

  const documents = Array.isArray(data) ? data : data?.documents ?? [];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">{pageStatus} Documents</h2>
        {user?.role === 'assistant' && (
          <button
            onClick={() => setOpen(true)}
            className="hidden sm:inline-flex items-center gap-2 px-3 py-1 bg-indigo-600 text-white rounded"
          >
            Upload Document
          </button>
        )}
      </div>
      {documents.length === 0 ? (
        <p className="text-sm text-muted-foreground">No documents found.</p>
      ) : (
        <ul className="space-y-2">
          {documents.map((doc: any) => {
            const key = doc._id || doc.id || doc.fileUniqueName;
            const fileKey = doc.fileUniqueName; // this is the server-side unique filename used for download/encryption
            const displayName = doc.title || fileKey || "Untitled";
            return (
              <li
                key={key}
                className="p-2 border rounded flex items-center justify-between"
              >
                <div>
                  <div className="font-medium">{displayName}</div>
                  <div className="text-sm text-gray-600">
                    Status: {doc.status}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm disabled:opacity-50"
                    onClick={async () => {
                      try {
                        setPreviewing(fileKey);
                        const url = await handlePreview(fileKey);
                        if (url) window.open(url, "_blank");
                      } catch (err) {
                        console.error("Preview failed", err);
                      } finally {
                        setPreviewing(null);
                      }
                    }}
                    disabled={
                      !fileKey ||
                      (Boolean(previewing) && previewing !== fileKey)
                    }
                  >
                    {previewing === fileKey ? "Previewing..." : "Preview"}
                  </button>

                  <button
                    className="px-3 py-1 bg-green-600 text-white rounded text-sm disabled:opacity-50"
                    onClick={async () => {
                      try {
                        setDownloading(fileKey);
                        await handleDownload(fileKey);
                      } catch (err) {
                        console.error("Download failed", err);
                      } finally {
                        setDownloading(null);
                      }
                    }}
                    disabled={
                      !fileKey ||
                      (Boolean(downloading) && downloading !== fileKey)
                    }
                  >
                    {downloading === fileKey ? "Downloading..." : "Download"}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
            {/* Assistant-only upload button + modal */}
            {user?.role === 'assistant' && (
              <>
                {/* Floating button for small screens */}
                <button
                  onClick={() => setOpen(true)}
                  className="fixed bottom-6 right-6 z-[9999] sm:hidden bg-indigo-600 text-white rounded-full p-4 shadow-lg"
                  aria-label="Upload document"
                >
                  +
                </button>

                {/* Modal for upload (Dialog) */}
                <Dialog open={open} onOpenChange={setOpen}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Upload Document</DialogTitle>
                    </DialogHeader>

                    <div className="p-2 space-y-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">PDF file</label>
                        <input
                          type="file"
                          accept="application/pdf"
                          onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">Department</label>
                        <input
                          type="text"
                          className="w-full border rounded px-2 py-1"
                          value={uploadDept}
                          onChange={(e) => setUploadDept(e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">Title</label>
                        <input
                          type="text"
                          className="w-full border rounded px-2 py-1"
                          value={uploadTitle}
                          onChange={(e) => setUploadTitle(e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">Description</label>
                        <textarea
                          className="w-full border rounded px-2 py-1"
                          value={uploadDescription}
                          onChange={(e) => setUploadDescription(e.target.value)}
                        />
                      </div>
                    </div>

                    <DialogFooter>
                      <div className="flex gap-2">
                        <button
                          className="px-3 py-1 bg-gray-200 rounded"
                          onClick={() => setOpen(false)}
                          disabled={isUploading}
                        >
                          Cancel
                        </button>
                        <button
                          className="px-3 py-1 bg-indigo-600 text-white rounded"
                          onClick={async () => {
                            if (!uploadFile || !uploadDept || !uploadTitle) return
                            setIsUploading(true)
                            await handleUpload({
                              file: uploadFile,
                              department: uploadDept,
                              title: uploadTitle,
                              description: uploadDescription,
                              onSuccess: () => {
                                // reset form, close modal and refetch documents
                                setUploadFile(null)
                                setUploadDept('')
                                setUploadTitle('')
                                setUploadDescription('')
                                setOpen(false)
                                refetch()
                              }
                            })
                            setIsUploading(false)
                          }}
                          disabled={isUploading}
                        >
                          {isUploading ? 'Uploading...' : 'Upload'}
                        </button>
                      </div>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </>
            )}
    </div>
  );
};

export default DocumentPage;
