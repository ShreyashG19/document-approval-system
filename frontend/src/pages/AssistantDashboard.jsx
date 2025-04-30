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

const AssistantDashboard = () => {
  const [cryptoService] = useState(new CryptoService());
  const [username, setUsername] = useState("John Doe"); // Replace with actual username fetching logic
  // State Management
  const [selectedTab, setSelectedTab] = useState("PENDING");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  // const [encKey, setEncKey] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const { handleUpload } = useFileHandlers();


  // const {getEncKeyForAssistant} = useEncryption();

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

  // Fetch Documents
  // const fetchDocuments = async () => {
  //   if (documentsCache[selectedTab]) {
  //     setDocuments(documentsCache[selectedTab]); // Load from cache
  //     setFilteredData(documentsCache[selectedTab]);
  //     return;
  //   }

  //   try {
  //     setIsLoading(true);
  //     const response = await axios.get(
  //       `${import.meta.env.VITE_API_URL
  //       }/file/get-documents?status=${selectedTab.toLowerCase()}`,
  //       { withCredentials: true }
  //     );
  //     setDocuments(response.data.documents);
  //     setFilteredData(response.data.documents);

  //     setDocumentsCache((prevCache) => ({
  //       ...prevCache,
  //       [selectedTab]: response.data.documents,
  //     }));
  //   } catch (error) {
  //     setError("Failed to fetch documents");
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const fetchDocuments = async (forceRefresh = false) => {
    if (!forceRefresh && documentsCache[selectedTab]) {
      setDocuments(documentsCache[selectedTab]);
      setFilteredData(documentsCache[selectedTab]);
      return;
    }
  
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      if(!token) throw new Error("Token not found. Please log in again.");
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/file/get-documents?status=${selectedTab.toLowerCase()}`,
        { headers: {"Authorization": `Bearer ${token}`}},
        { withCredentials: true }
      );
      setDocuments(response.data.documents);
      setFilteredData(response.data.documents);
      setDocumentsCache((prevCache) => ({
        ...prevCache,
        [selectedTab]: response.data.documents,
      }));
    } catch (error) {
      setError("Failed to fetch documents");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRefresh = async () => {
    setIsLoading(true);
    await fetchDocuments();
    setIsLoading(false);
  };

  //fetch documents on tab change
  useEffect(() => {
    const initialize = async () => {
      // await generateKeysAndRequestEncKey();
      fetchDocuments();
    };
    initialize();
  }, []);

  
  // Fetch Departments
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const token = localStorage.getItem("token");
      if(!token) throw new Error("Token not found. Please log in again.");
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/department/get-all-departments`,
          {headers: {"Authorization": `Bearer ${token}`}},
          { withCredentials: true }
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
  const handleDocumentUpload = () => {
    if (!newDocFile || !newDocDepartment || !newDocTitle) {
      toast.error("Please fill all required fields");
      return;
    }
  
    handleUpload({
      file: newDocFile,
      department: newDocDepartment,
      title: newDocTitle,
      description: newDocDesc,
      onSuccess: () => {
        setNewDocFile(null);
        setNewDocDepartment("");
        setNewDocTitle("");
        setNewDocDesc("");
        fetchDocuments();
        setNewDocDialogOpen(false);
        setUploadSuccess(true);
      },
    });

  };

  useEffect(() => {
    if (uploadSuccess) {
      fetchDocuments(true); // you can skip the cache here
      setUploadSuccess(false); // reset for next upload
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
    <div className="flex flex-col min-h-screen bg-gray-100 text-gray-800">
      <Toaster />
      <main className="p-6 flex-grow">
        {/* Status Tabs */}
        <div className="flex flex-wrap gap-4 mb-6 border-b">
          {["PENDING", "APPROVED", "REJECTED", "CORRECTION"].map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`px-4 py-2 ${selectedTab === tab
                ? "border-b-2 border-blue-500 text-blue-500"
                : "text-gray-600 hover:text-blue-500"
                }`}
              disabled={isLoading}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex justify-start items-start md:flex-row gap-4">
          <div className="relative w-full max-w-xs mb-6">
            <FaSearch className="absolute top-3 left-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 rounded-md border bg-white border-gray-300 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              disabled={isLoading}
            />
          </div>
          <div>
            <button
              onClick={handleRefresh}
              className="flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-md shadow-md hover:bg-blue-600 transition"
              disabled={isLoading}
            >
              <IoMdRefresh className="h-6 w-5" />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-4 flex flex-col md:flex-row gap-4">
          <div className="flex-shrink-0">
            <label className="block text-sm font-medium text-gray-700">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="block w-full md:w-auto mt-1 p-2 text-sm border border-gray-300 bg-white rounded-md"
              disabled={isLoading}
            >
              <option value="">All</option>
              {departments?.map((department, idx) => (
                <option key={idx} value={department}>
                  {department}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-grow">
            <label className="block text-sm font-medium">Date Range</label>
            <div className="flex flex-col md:flex-row gap-4 items-center">
              {/* Start Date Picker */}
              <div className="relative flex-grow md:flex-grow-0 md:w-48">
                <input
                  ref={(input) => (window.startDateInput = input)}
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="p-2 border bg-white text-black border-gray-300 rounded-md appearance-none pointer-events-none w-full"
                  disabled={isLoading}
                />
                <svg
                  className="absolute right-3 top-3 w-5 h-5 text-grey cursor-pointer"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  onClick={() => window.startDateInput?.showPicker()} // Opens Date Picker on SVG Click
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 7V3M16 7V3M3 11h18M5 5h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z"
                  />
                </svg>
              </div>

              {/* End Date Picker */}
              <label className="block text-sm font-medium">-- To --</label>
              <div className="relative flex-grow md:flex-grow-0 md:w-48">
                <input
                  ref={(input) => (window.endDateInput = input)}
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="p-2 border bg-white text-black border-gray-300 rounded-md appearance-none pointer-events-none w-full"
                  min={startDate}
                  disabled={isLoading}
                />
                <svg
                  className="absolute right-3 top-3 w-5 h-5 text-grey cursor-pointer"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  onClick={() => window.endDateInput?.showPicker()} // Opens Date Picker on SVG Click
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 7V3M16 7V3M3 11h18M5 5h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z"
                  />
                </svg>
              </div>

              <button
                onClick={resetFilters}
                className="px-4 py-2 bg-gray-500 text-white rounded-md shadow-md hover:bg-gray-600 transition"
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
              endDate={endDate}
              searchQuery={searchQuery}
              handleTitleClick={(url, details) => {
                setCurrentPdfUrl(url);
                setCurrentDocDetails(details);
                setViewPdfDialogOpen(true);
              }}
              // encKey={encKey}
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
      <div className="fixed bottom-6 right-7 flex items-center justify-center bg-blue-500 p-2 rounded-full text-white font-bold">
        <IoIosAdd
          className="text-4xl"
          onClick={() => setNewDocDialogOpen(true)}
          disabled={isLoading}
        />
      </div>

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

export default AssistantDashboard;
