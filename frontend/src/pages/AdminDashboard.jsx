import { useState, useEffect } from "react";
import { FaSearch } from "react-icons/fa";

import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
} from "@mui/material";
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

const AdminDashboard = () => {
  const [cryptoService] = useState(new CryptoService());
  const [username, setUsername] = useState("John Doe"); // Replace with actual username fetching logic
  // State Management
  const [selectedTab, setSelectedTab] = useState("PENDING");
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filteredData, setFilteredData] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const { getEncKeyForDoc } = useEncryption();

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
  // Fetch Documents
  const fetchDocuments = async () => {
    console.log("fetchDocuments");
    try {
      setIsLoading(true);
      setError(null);
      setDocuments([]);
      const token = localStorage.getItem("token");
      console.log("token: ", token);
      if (!token) throw new Error("Token not found. Please log in again.");
      const apiUrl = `${
        import.meta.env.VITE_API_URL
      }/file/get-documents?status=${selectedTab.toLowerCase()}`;
      // console.log("apiUrl", apiUrl);

      const response = await axios.get(apiUrl, {
        withCredentials: true,
      });

      // console.log("fetched data", response.data);
      setDocuments(response.data.documents);
      setFilteredData(response.data.documents);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to fetch documents";
      setError(errorMessage);
      console.error("Error fetching documents:", err);
      setDocuments([]);
      setFilteredData([]);
    } finally {
      setIsLoading(false);
    }
  };
  const handleRefresh = async () => {
    setIsLoading(true);
    await fetchDocuments();
    setIsLoading(false);
  };

  //   try {
  //     await cryptoService.generateKeysAndRequestEncKey(
  //       import.meta.env.VITE_API_URL
  //     );
  //     const key = cryptoService.getEncKey();
  //     setEncKey(key);
  //     console.log("Successfully received and decrypted encryption key");
  //     console.log("khud gaye ")
  //   } catch (error) {
  //     console.error("Error in key exchange:", error);
  //     toast.error("Failed to establish secure connection");
  //   }
  // };
  //fetch documents on tab change
  useEffect(() => {
    const initialize = async () => {
      await getEncKeyForDoc();
      fetchDocuments();
    };
    initialize();
  }, [selectedTab]);
  // Fetch Departments
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
        console.log("departments : ", response.data.data);
        setDepartments(response.data.data);
      } catch (error) {
        console.error("Error fetching departments:", error);
      }
    };
    fetchDepartments();
  }, []);

  // Filter Documents
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

  //modular
  const handleDocumentUpload = async () => {
    const toastId = toast.loading("Uploading document...");
    if (!newDocFile || !newDocDepartment || !newDocTitle) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      const encryptedContent = await cryptoService.encryptFile(newDocFile);

      const formData = new FormData();
      const blob = new Blob([encryptedContent], { type: "text/plain" });
      formData.append("pdfFile", new File([blob], `${newDocFile.name}.enc`));
      formData.append("department", newDocDepartment);
      formData.append("title", newDocTitle);
      formData.append("description", newDocDesc || "");
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token not found. Please log in again.");

      const uploadUrl = `${import.meta.env.VITE_API_URL}/file/upload-pdf`;
      const response = await axios.post(uploadUrl, formData, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });

      if (response.data) {
        toast.dismiss(toastId);
        toast.success("Document uploaded successfully");
        setNewDocFile(null);
        setNewDocDepartment("");
        setNewDocTitle("");
        setNewDocDesc("");
        fetchDocuments();
        setNewDocDialogOpen(false);
      }
    } catch (error) {
      toast.dismiss(toastId);
      console.error("Upload error:", error);
      toast.error(error.response?.data?.message || "Error uploading document");
    }
  };

  const resetFilters = () => {
    setSearchQuery("");
    setStartDate("");
    setEndDate("");
    setSelectedCategory("");
    toast.success("Filters reset successfully");
  };

  return (
    <div className="flex flex-col min-h-screen justify-center   bg-gray-100 text-gray-800">
      <Toaster />
      <main className="p-6 flex-grow">
        {/* Status Tabs */}
        <div className="bg- w-fit rounded-lg shadow-sm p-1 mb-4 overflow-x-auto">
          <div className="flex gap-1 min-w-7xl">
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
        <div className="space-y-4">
          {isLoading ? (
            // Skeleton loading state
            Array(3)
              .fill(0)
              .map((_, index) => (
                <div
                  key={index}
                  className="bg-white p-4 rounded-lg shadow animate-pulse w-full max-w-4xl"
                >
                  <div className="flex justify-between items-center w-full">
                    <div className="w-1/2 h-5 bg-gray-200 rounded"></div>
                    <div className="w-32 h-8 bg-gray-200 rounded"></div>
                  </div>
                  <div className="mt-4 space-y-3">
                    <div className="w-full h-4 bg-gray-200 rounded"></div>
                    <div className="w-3/4 h-4 bg-gray-200 rounded"></div>
                    <div className="flex justify-between items-center mt-4">
                      <div className="w-36 h-4 bg-gray-200 rounded"></div>
                      <div className="w-24 h-4 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </div>
              ))
          ) : (
            <DocumentsList
              status={selectedTab.toLowerCase()}
              department={selectedCategory}
              startDate={startDate}
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

      {/* New Document Dialog */}
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
            {/* PDF Viewer - Left Side */}
            <div className="flex-grow">
              <object
                data={currentPdfUrl}
                type="application/pdf"
                width="100%"
                height="100%"
              >
                <p>
                  Your browser does not support PDFs.{" "}
                  <a href={currentPdfUrl}>Download the PDF</a>.
                </p>
              </object>
            </div>

            {/* Details Panel - Right Side */}
            <div className="w-80 bg-gray-50 p-4 rounded-lg overflow-y-auto">
              {/* Document Details */}
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

              {/* Description Section */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <div className="bg-white p-3 rounded-md border border-gray-200">
                  <p className="text-gray-700">
                    {currentDocDetails.description ||
                      "No description available"}
                  </p>
                </div>
              </div>

              {/* Remarks Section */}
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
        <DialogActions></DialogActions>
      </Dialog>
      {/* Add Document Button */}

      {/* PDF Preview Dialog */}
      <Dialog
        open={newDocDialogOpen}
        onClose={() => setNewDocDialogOpen(false)}
      >
        <DialogTitle>Upload Document</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Document Title"
            type="text"
            fullWidth
            value={newDocTitle}
            onChange={(e) => setNewDocTitle(e.target.value)}
            disabled={isLoading}
          />
          <TextField
            select
            margin="dense"
            fullWidth
            value={newDocDepartment}
            onChange={(e) => setNewDocDepartment(e.target.value)}
            SelectProps={{ native: true }}
            disabled={isLoading}
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
            accept=".pdf"
            onChange={(e) => setNewDocFile(e.target.files[0])}
            className="my-4"
            disabled={isLoading}
          />
          <TextField
            margin="dense"
            label="Description"
            type="text"
            fullWidth
            multiline
            rows={4}
            value={newDocDesc}
            onChange={(e) => setNewDocDesc(e.target.value)}
            disabled={isLoading}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setNewDocDialogOpen(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button onClick={handleDocumentUpload} disabled={isLoading}>
            Upload
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
