import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useDocuments } from "@/services/documents/useDocuments";
import useFileHandlers from "@/services/files/useFileHandlers";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useAuth } from "@/services/auth/useAuth";
import { DepartmentDropdown } from "@/components/common/DepartmentDropdown";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Filter, X, Calendar } from "lucide-react";

const DocumentPage = ({ status }: { status?: string }) => {
  const params = useParams();
  const pageStatus = status ?? (params as any).status ?? "pending";
  
  // Use the Redux documents hook with initial status
  const {
    documents,
    count,
    filters,
    updateFilters,
    query,
    status: reduxStatus,
    isLoading,
    isError,
    refetch,
  } = useDocuments({ 
    status: pageStatus 
  });

  const { handlePreview, handleDownload, handleUpload } = useFileHandlers();
  const [previewing, setPreviewing] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);
  const { user } = useAuth();

  // Upload modal state + form
  const [open, setOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadDept, setUploadDept] = useState("");
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadDescription, setUploadDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // Local UI state for filters
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Listen for sidebar-triggered open events (desktop)
  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("openUploadModal", handler as EventListener);
    return () =>
      window.removeEventListener("openUploadModal", handler as EventListener);
  }, []);

  // Apply filters to Redux
  const applyFilters = (newFilters: Partial<typeof filters>) => {
    updateFilters(newFilters);
  };

  // Clear all filters
  const clearFilters = () => {
    updateFilters({
      department: undefined,
      createdBy: undefined,
      startDate: undefined,
      endDate: undefined,
    });
    setSearchQuery("");
  };

  // Helper function to safely get creator name
  const getCreatorName = (creator: any): string => {
    if (!creator) return "Unknown";
    if (typeof creator === 'string') return creator;
    if (typeof creator === 'object') {
      return creator.fullName || creator.username || creator.email || "Unknown";
    }
    return String(creator);
  };

  // Filter documents locally by search query (client-side)
  const filteredDocuments = documents.filter((doc: any) => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    const creatorName = getCreatorName(doc.createdBy).toLowerCase();
    const department = doc.deparment?.toLowerCase() || "";
    
    return (
      doc.title?.toLowerCase().includes(query) ||
      doc.fileUniqueName?.toLowerCase().includes(query) ||
      creatorName.includes(query) ||
      doc.assignedTo?.toLowerCase().includes(query) ||
      department.includes(query)
    );
  });

  // Get unique creators for filter suggestions
  const uniqueCreators = Array.from(new Set(
    documents
      .map((doc: any) => doc.createdBy)
      .filter(Boolean)
      .map((creator: any) => getCreatorName(creator))
  )).sort();

  const hasActiveFilters = 
    filters.department || 
    filters.createdBy || 
    filters.startDate || 
    filters.endDate || 
    searchQuery;

  if (isLoading || reduxStatus === "loading")
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading documents...</div>
      </div>
    );
    
  if (isError || reduxStatus === "failed")
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-600 text-lg">Failed to load documents</div>
        <Button onClick={() => refetch()} className="ml-4">
          Retry
        </Button>
      </div>
    );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {pageStatus.charAt(0).toUpperCase() + pageStatus.slice(1)} Documents
          </h2>
          <p className="text-muted-foreground">
            {count} document{count !== 1 ? 's' : ''} found
            {hasActiveFilters && ' (filtered)'}
          </p>
        </div>
        
        {user?.role === "assistant" && (
          <Button
            onClick={() => setOpen(true)}
            className="hidden sm:inline-flex"
          >
            Upload Document
          </Button>
        )}
      </div>

      {/* Search and Filter Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search documents by title, creator, department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>

            {/* Filter Toggle */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Filters
                {hasActiveFilters && (
                  <span className="bg-primary text-primary-foreground rounded-full px-2 py-1 text-xs">
                    {[
                      filters.department,
                      filters.createdBy,
                      filters.startDate,
                      filters.endDate,
                      searchQuery,
                    ].filter(Boolean).length}
                  </span>
                )}
              </Button>

              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Clear All
                </Button>
              )}
            </div>

            {/* Expandable Filters */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
                {/* Department Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Department</label>
                  <DepartmentDropdown
                    value={filters.department || ""}
                    onChange={(value) => applyFilters({ department: value || undefined })}
                    placeholder="All departments"
                  />
                </div>

                {/* Created By Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Created By</label>
                  <select
                    value={filters.createdBy || ""}
                    onChange={(e) => applyFilters({ createdBy: e.target.value || undefined })}
                    className="w-full border rounded px-3 py-2 text-sm"
                  >
                    <option value="">All users</option>
                    {uniqueCreators.map((creator) => (
                      <option key={creator} value={creator}>
                        {creator}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Start Date Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">From Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      type="date"
                      value={filters.startDate || ""}
                      onChange={(e) => applyFilters({ startDate: e.target.value || undefined })}
                      className="w-full pl-10"
                    />
                  </div>
                </div>

                {/* End Date Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">To Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      type="date"
                      value={filters.endDate || ""}
                      onChange={(e) => applyFilters({ endDate: e.target.value || undefined })}
                      className="w-full pl-10"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.department && (
            <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
              Department: {filters.department}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-blue-200"
                onClick={() => applyFilters({ department: undefined })}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
          {filters.createdBy && (
            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
              Created By: {filters.createdBy}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-green-200"
                onClick={() => applyFilters({ createdBy: undefined })}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
          {filters.startDate && (
            <div className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
              From: {new Date(filters.startDate).toLocaleDateString()}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-orange-200"
                onClick={() => applyFilters({ startDate: undefined })}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
          {filters.endDate && (
            <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
              To: {new Date(filters.endDate).toLocaleDateString()}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-purple-200"
                onClick={() => applyFilters({ endDate: undefined })}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Documents List */}
      {filteredDocuments.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">
              {hasActiveFilters 
                ? "No documents match your filters. Try adjusting your search criteria."
                : "No documents found."}
            </p>
            {hasActiveFilters && (
              <Button
                variant="outline"
                onClick={clearFilters}
                className="mt-4"
              >
                Clear All Filters
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredDocuments.map((doc: any) => {
            const key = doc._id || doc.id || doc.fileUniqueName;
            const fileKey = doc.fileUniqueName;
            const displayName = doc.title || fileKey || "Untitled";
            const creatorName = getCreatorName(doc.createdBy);

            return (
              <Card key={key} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <h3 className="font-semibold text-lg">{displayName}</h3>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-muted-foreground">
                        <div>
                          <span className="font-medium">Status:</span>{" "}
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            doc.status === 'approved' ? 'bg-green-100 text-green-800' :
                            doc.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {doc.status}
                          </span>
                        </div>
                        
                        {doc.deparment && (
                          <div>
                            <span className="font-medium">Department:</span> {doc.deparment}
                          </div>
                        )}
                        
                        {creatorName && creatorName !== "Unknown" && (
                          <div>
                            <span className="font-medium">Created By:</span> {creatorName}
                          </div>
                        )}
                        
                        {doc.createdDate && (
                          <div>
                            <span className="font-medium">Created:</span>{" "}
                            {new Date(doc.createdDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
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
                      </Button>

                      <Button
                        variant="default"
                        size="sm"
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
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Upload Modal */}
      {user?.role === "assistant" && (
        <>
          <Button
            onClick={() => setOpen(true)}
            className="fixed bottom-6 right-6 z-[9999] sm:hidden rounded-full p-4 h-auto"
            size="icon"
          >
            +
          </Button>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Upload Document</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    PDF file *
                  </label>
                  <Input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Department *
                  </label>
                  <Input
                    type="text"
                    value={uploadDept}
                    onChange={(e) => setUploadDept(e.target.value)}
                    placeholder="Enter department name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Title *
                  </label>
                  <Input
                    type="text"
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    placeholder="Enter document title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Description
                  </label>
                  <textarea
                    className="w-full border rounded-md px-3 py-2 text-sm resize-none"
                    rows={3}
                    value={uploadDescription}
                    onChange={(e) => setUploadDescription(e.target.value)}
                    placeholder="Enter document description (optional)"
                  />
                </div>
              </div>

              <DialogFooter>
                <div className="flex gap-2 w-full">
                  <Button
                    variant="outline"
                    onClick={() => setOpen(false)}
                    disabled={isUploading}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={async () => {
                      if (!uploadFile || !uploadDept || !uploadTitle) return;
                      setIsUploading(true);
                      await handleUpload({
                        file: uploadFile,
                        department: uploadDept,
                        title: uploadTitle,
                        description: uploadDescription,
                        onSuccess: () => {
                          setUploadFile(null);
                          setUploadDept("");
                          setUploadTitle("");
                          setUploadDescription("");
                          setOpen(false);
                          refetch(); // Refetch documents after upload
                        },
                      });
                      setIsUploading(false);
                    }}
                    disabled={isUploading || !uploadFile || !uploadDept || !uploadTitle}
                    className="flex-1"
                  >
                    {isUploading ? "Uploading..." : "Upload"}
                  </Button>
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