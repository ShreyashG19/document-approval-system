import { useState, useEffect, useCallback } from "react";
import { FaSearch } from "react-icons/fa";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
} from "@mui/material";
import {
  FiDownload,
  FiFile,
  FiFileText,
  FiInfo,
  FiMessageSquare,
  FiUpload,
} from "react-icons/fi";
import { CircularProgress } from "@mui/material";
import { AiOutlineClose } from "react-icons/ai";
import { toast, Toaster } from "react-hot-toast";
import axios from "axios";
import CryptoJS from "crypto-js";
import DocumentsList from "../components/DocumentsList";
import { IoIosAdd, IoMdRefresh } from "react-icons/io";
import forge from "node-forge";
import { CryptoService } from "../../utils/cryptoSecurity";
import { getStatusColor } from "../../utils/statusColors";
import { useEncryption } from "../contexts/EncryptionContext";
import { useFileHandlers } from "../hooks/files";
import { useRef } from "react";

const AssistantDashboard = () => {
  const [cryptoService] = useState(new CryptoService());
  const [username, setUsername] = useState("John Doe");
  const [selectedTab, setSelectedTab] = useState("PENDING");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const { handleUpload } = useFileHandlers();
  const [isUploading, setIsUploading] = useState(false);
  const { getEncKeyForAssistant } = useEncryption();
  const toastIdRef = useRef(null);

  // Dialog States
  const [openDialog, setOpenDialog] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [currentDocumentId, setCurrentDocumentId] = useState(null);
  const [newDocDialogOpen, setNewDocDialogOpen] = useState(false);
  const [viewPdfDialogOpen, setViewPdfDialogOpen] = useState(false);
  const [currentPdfUrl, setCurrentPdfUrl] = useState("");
  const [departments, setDepartments] = useState([]);

  // Filter States
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  // New Document States
  const [newDocTitle, setNewDocTitle] = useState("");
  const [newDocDepartment, setNewDocDepartment] = useState("");
  const [newDocFile, setNewDocFile] = useState(null);
  const [newDocDesc, setNewDocDesc] = useState("");

  const [currentDocDetails, setCurrentDocDetails] = useState({
    description: "",
    remarks: "",
    title: "",
    department: "",
    createdBy: "",
    createdDate: "",
    status: "",
  });

  const [documentsCache, setDocumentsCache] = useState({});

  const fetchDocuments = async (forceRefresh = false) => {
    if (!forceRefresh && documentsCache[selectedTab]) {
      setDocuments(documentsCache[selectedTab]);
      setFilteredData(documentsCache[selectedTab]);
      return;
    }

    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token not found. Please log in again.");
      const response = await axios.get(
        `${
          import.meta.env.VITE_API_URL
        }/file/get-documents?status=${selectedTab.toLowerCase()}`,
        { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
      );
      setDocuments(response.data.documents);
      setFilteredData(response.data.documents);
      setDocumentsCache((prevCache) => ({
        ...prevCache,
        [selectedTab]: response.data.documents,
      }));
    } catch (error) {
      setError("Failed to fetch documents");
      toast.error("Failed to fetch documents");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    await fetchDocuments(true);
    setIsLoading(false);
  };

  useEffect(() => {
    const initialize = async () => {
      fetchDocuments();
    };
    initialize();
  }, [selectedTab]);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Token not found. Please log in again.");
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/department/get-all-departments`,
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          }
        );
        setDepartments(response.data.data);
      } catch (error) {
        console.error("Error fetching departments:", error);
        toast.error("Error fetching departments");
      }
    };
    fetchDepartments();
  }, []);

  useEffect(() => {
    const filtered = documents.filter(
      (doc) =>
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        (!selectedCategory || doc.category === selectedCategory) &&
        (!startDate || new Date(doc.date) >= new Date(startDate)) &&
        (!endDate || new Date(doc.date) <= new Date(endDate))
    );
    setFilteredData(filtered);
  }, [searchQuery, selectedCategory, startDate, endDate, documents]);

  const handleDocumentUpload = () => {
    if (!newDocFile || !newDocDepartment || !newDocTitle) {
      toast.error("Please fill all required fields");
      return;
    }

    setIsUploading(true);
    toastIdRef.current = toast.loading("Uploading document...");

    handleUpload({
      file: newDocFile,
      department: newDocDepartment,
      title: newDocTitle,
      description: newDocDesc,
      onSuccess: () => {
        toast.success("File uploaded successfully!", {
          id: toastIdRef.current,
        });
        setNewDocFile(null);
        setNewDocDepartment("");
        setNewDocTitle("");
        setNewDocDesc("");
        setNewDocDialogOpen(false);
        setUploadSuccess(true);
        setIsUploading(false);
      },
      onError: (err) => {
        toast.error(err.message || "Failed to upload document", {
          id: toastIdRef.current,
        });
        setIsUploading(false);
      },
    });
  };

  useEffect(() => {
    if (uploadSuccess) {
      fetchDocuments(true);
      setUploadSuccess(false);
    }
  }, [uploadSuccess]);

  const resetFilters = () => {
    setSearchQuery("");
    setStartDate("");
    setEndDate("");
    setSelectedCategory("");
    toast.success("Filters reset successfully");
  };

  return (
    <div className="flex flex-col min-h-screen min-w-full bg-gray-50">
      <main className="p-4 md:p-6 flex-grow max-w-8xl mx-auto w-full">
        {/* Status Tabs */}
        <div className="bg-white rounded-lg shadow-sm p-1 mb-4 overflow-x-auto">
          <div className="flex gap-1 min-w-max">
            {["PENDING", "APPROVED", "REJECTED", "CORRECTION"].map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedTab === tab
                    ? "bg-blue-100 text-blue-800"
                    : "text-gray-800 hover:text-blue-700 hover:bg-blue-50"
                }`}
                disabled={isLoading}
              >
                {tab.charAt(0) + tab.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="relative mb-4">
            <FaSearch className="absolute top-3 left-3 text-gray-500" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 rounded-md border bg-white border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition"
              disabled={isLoading}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center border-t pt-4">
            <div className="w-full sm:w-auto">
              <h1 className="font-semibold text-gray-700">Departments</h1>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="block w-full p-2 text-sm border border-gray-300 bg-white rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                disabled={isLoading}
              >
                <option value="">All Departments</option>
                {departments?.map((department, idx) => (
                  <option key={idx} value={department}>
                    {department}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex xs:flex-row gap-2 w-full sm:w-auto">
              <div className="relative flex-grow">
                <h1 className="font-semibold text-gray-700">Start Date</h1>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="p-2 border bg-white text-gray-900 border-gray-300 rounded-md w-full focus:ring-blue-500 focus:border-blue-500 text-sm"
                  disabled={isLoading}
                />
              </div>
              <span className="text-gray-500 self-center hidden xs:block">
                to
              </span>
              <div className="relative flex-grow">
                <h1 className="font-semibold text-gray-700">End Date</h1>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="p-2 border bg-white text-gray-900 border-gray-300 rounded-md w-full focus:ring-blue-500 focus:border-blue-500 text-sm"
                  min={startDate}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="flex gap-2 w-full mt-6 sm:w-auto">
              <button
                onClick={handleRefresh}
                className="flex items-center justify-center p-2 bg-white border border-gray-300 text-gray-900 rounded-md shadow-sm hover:bg-gray-50 transition"
                disabled={isLoading}
              >
                <IoMdRefresh
                  className={`h-5 w-5 ${isLoading ? "animate-spin" : ""}`}
                />
              </button>

              <button
                onClick={resetFilters}
                className="px-3 py-2 bg-gray-100 text-gray-900 rounded-md shadow-sm hover:bg-gray-200 transition text-sm font-medium"
                disabled={isLoading}
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Documents List */}
        <div className="space-y-4">
          {isLoading ? (
            Array(3)
              .fill(0)
              .map((_, index) => (
                <div
                  key={index}
                  className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 animate-pulse"
                >
                  <div className="flex justify-between items-center">
                    <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-5 bg-gray-200 rounded w-24"></div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <div className="h-4 bg-gray-200 rounded w-36"></div>
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
              ))
          ) : (
            <DocumentsList
              status={selectedTab.toLowerCase()}
              department={selectedCategory}
              startDate={startDate}
              endDate={endDate}
              searchQuery={searchQuery}
              handleTitleClick={(url, details) => {
                setCurrentPdfUrl(url);
                setCurrentDocDetails(details);
                setViewPdfDialogOpen(true);
              }}
            />
          )}
        </div>
      </main>

      {/* PDF Preview Dialog */}
      <Dialog
        open={viewPdfDialogOpen}
        onClose={() => setViewPdfDialogOpen(false)}
        maxWidth="xl"
        fullWidth
      >
        <DialogTitle>
          <div className="flex justify-between items-center">
            <span>{currentDocDetails.title || "Document Preview"}</span>
            <span className={getStatusColor(currentDocDetails.status)}>
              {currentDocDetails.status?.toUpperCase() || "UNKNOWN"}
            </span>
            <button onClick={() => setViewPdfDialogOpen(false)}>
              <AiOutlineClose />
            </button>
          </div>
        </DialogTitle>
        <DialogContent>
          <div className="flex gap-4 h-[80vh]">
            {currentPdfUrl && (
              <object
                data={currentPdfUrl}
                type="application/pdf"
                className="w-full h-[75vh] rounded-md border"
              >
                <p className="text-center text-sm mt-4">
                  PDF preview is not supported in this browser.
                </p>
              </object>
            )}

            <div className="w-80 bg-gray-50 p-4 rounded-lg overflow-y-auto">
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Document Details</h3>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="font-medium">Department:</span>{" "}
                    {currentDocDetails.department || "Not assigned"}
                  </p>
                  <p>
                    <span className="font-medium">Created By:</span>{" "}
                    {currentDocDetails.createdBy || "Unknown"}
                  </p>
                  <p>
                    <span className="font-medium">Date:</span>{" "}
                    {currentDocDetails.createdDate
                      ? new Date(
                          currentDocDetails.createdDate
                        ).toLocaleDateString()
                      : "Not available"}
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <div className="bg-white p-3 rounded-md border border-gray-200">
                  <p className="text-gray-700">
                    {currentDocDetails.description ||
                      "No description available"}
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Remarks</h3>
                <div className="bg-white p-3 rounded-md border border-gray-200">
                  <p className="text-gray-700">
                    {currentDocDetails.remarks || "No remarks available"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Document Dialog */}
      <Dialog
        open={newDocDialogOpen}
        onClose={() => {
          if (!isUploading) {
            setNewDocDialogOpen(false);
          }
        }}
      >
        <DialogTitle>Upload Document</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Document Title"
            type="text"
            fullWidth
            disabled={isUploading}
            value={newDocTitle}
            onChange={(e) => setNewDocTitle(e.target.value)}
          />
          <TextField
            select
            margin="dense"
            fullWidth
            disabled={isUploading}
            value={newDocDepartment}
            onChange={(e) => setNewDocDepartment(e.target.value)}
            SelectProps={{ native: true }}
          >
            <option value="">Select Department</option>
            {departments?.map((department, idx) => (
              <option key={idx} value={department}>
                {department}
              </option>
            ))}
          </TextField>

          <input
            type="file"
            disabled={isUploading}
            accept=".pdf"
            onChange={(e) => setNewDocFile(e.target.files[0])}
            className="my-4"
          />
          <TextField
            margin="dense"
            label="Description"
            type="text"
            fullWidth
            multiline
            rows={4}
            disabled={isUploading}
            value={newDocDesc}
            onChange={(e) => setNewDocDesc(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button
            disabled={isUploading}
            onClick={() => setNewDocDialogOpen(false)}
          >
            Cancel
          </Button>
          <Button onClick={handleDocumentUpload} disabled={isUploading}>
            {isUploading ? "Uploading..." : "Upload"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button */}
      <button
        onClick={() => setNewDocDialogOpen(true)}
        disabled={isLoading}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        aria-label="Add new document"
      >
        <IoIosAdd className="text-2xl" />
      </button>
    </div>
  );
};

export default AssistantDashboard;
