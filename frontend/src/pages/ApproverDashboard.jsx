"use client";

import { useContext, useEffect, useState } from "react";
import NewCm from "./NewCm";
import SentBackTabContent from "./SentBackTabContent";
import { AuthContext } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { FiEdit2 } from "react-icons/fi";

import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import axios from "axios";
import toast from "react-hot-toast";
import {
  AiOutlineClose,
  AiOutlineInfoCircle,
  AiOutlineCheck,
  AiOutlineCloseCircle,
} from "react-icons/ai";
import { getStatusColor } from "../../utils/statusColors";

const ApproverDashboard = () => {
  const [selectedTab, setSelectedTab] = useState("NEW");
  const [currentPdfUrl, setCurrentPdfUrl] = useState("");
  const [viewPdfDialogOpen, setViewPdfDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fileUnName, setfileUnName] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [description, setDescription] = useState("");
  const [remark, setRemark] = useState("");
  const [isRemarkEditable, setIsRemarkEditable] = useState(false);
  const navigate = useNavigate();
  const [localRemark, setLocalRemark] = useState("");
  const [, setDepartments] = useState([]);
  const [currentAction, setCurrentAction] = useState("");
  const [isActionInProgress, setIsActionInProgress] = useState(false);
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
    try {
      setIsLoading(true);
      setError(null);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/file/get-documents?status=pending`,
        {
          withCredentials: true,
        }
      );

      if (response.data.status && response.data.documents) {
        setFilteredData(response.data.documents);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.response?.data?.message || "Failed to fetch documents");
      toast.error("Failed to load documents");
      setFilteredData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  // Generic Document Action
  const handleDocumentAction = async (actionType) => {
    if (!fileUnName) {
      toast.error("No file selected");
      return;
    }

    if (actionType === "correction" && (!remark || !remark.trim())) {
      toast.error("Remark is mandatory for correction");
      return;
    }
    try {
      setIsActionInProgress(true);
      const actionMessages = {
        approve: "Approving Document...",
        reject: "Rejecting Document...",
        correction: "Sending Document for Correction...",
      };

      const loadingToast = toast.loading(actionMessages[actionType]);
      const actionEndpoints = {
        approve: `${import.meta.env.VITE_API_URL}/file/approve`,
        reject: `${import.meta.env.VITE_API_URL}/file/reject`,
        correction: `${import.meta.env.VITE_API_URL}/file/correction`,
      };

      const response = await axios.post(
        actionEndpoints[actionType],
        {
          fileUniqueName: fileUnName,
          remarks: remark,
        },
        { withCredentials: true }
      );

      toast.dismiss(loadingToast);
      setViewPdfDialogOpen(false);
      await fetchDocuments();
      toast.success(
        response.data.message || `Document ${actionType}d successfully!`
      );

      // Reset states
      setCurrentAction(null);
      setRemark("");
      setIsRemarkEditable(false);
    } catch (error) {
      console.error(`${actionType} error:`, error);
      toast.error(error.response?.data?.message || `${actionType} failed`);
    } finally {
      setIsActionInProgress(false);
    }
  };

  // PDF Dialog Handlers
  const openPdfDialog = (url, document) => {
    setCurrentPdfUrl(url);
    setSelectedDocument(document);
    setfileUnName(document?.fileUniqueName || "");
    setCurrentDocDetails({
      description: document?.description || "",
      remarks: document?.remarks || "",
      title: document?.title || "",
      department: document?.department?.departmentName || "",
      createdBy: document?.createdBy?.fullName || "",
      createdDate: document?.createdDate || "",
      status: document?.status || "",
    });
    setViewPdfDialogOpen(true);
    setCurrentAction("");
    setRemark("");
    setIsRemarkEditable(false);
  };
  const closePdfDialog = () => {
    setViewPdfDialogOpen(false);
    setCurrentPdfUrl("");
    setSelectedDocument(null);
    setfileUnName("");
    setDescription("");
    setRemark("");
    setCurrentAction(null);
    setIsRemarkEditable(false);
  };

  const handleTextareaBlur = () => {
    setTimeout(() => {
      setIsRemarkEditable(false);
    }, 100);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-r from-blue-50 to-blue-100">
      <div className="flex items-center justify-center w-full py-8 px-4 md:px-6 lg:px-8">
        <div className="w-full max-w-7xl bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden transition-all duration-300 ease-in-out">
          {/* Tabs */}
          <div className="flex justify-around items-center border-b border-gray-200 p-2 bg-gray-50">
            <button
              onClick={() => setSelectedTab("NEW")}
              className={`px-4 py-2 font-medium rounded-md transition-all duration-200 text-sm md:text-base ${
                selectedTab === "NEW"
                  ? "bg-blue-500 text-white shadow-md transform scale-105"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              NEW
            </button>
            <button
              onClick={() => setSelectedTab("SENT BACK")}
              className={`px-4 py-2 font-medium rounded-md transition-all duration-200 text-sm md:text-base ${
                selectedTab === "SENT BACK"
                  ? "bg-blue-500 text-white shadow-md transform scale-105"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              SENT BACK
            </button>
          </div>

          {/* Content */}
          <div className="p-4 md:p-6">
            {selectedTab === "NEW" ? (
              <NewCm
                setfileUnName={setfileUnName}
                setDescription={setDescription}
                setRemark={setRemark}
                handleTitleClick={(url, document) =>
                  openPdfDialog(url, document)
                }
                selectedTab={selectedTab}
              />
            ) : (
              <NewCm
                setfileUnName={setfileUnName}
                setDescription={setDescription}
                setRemark={setRemark}
                handleTitleClick={(url, document) =>
                  openPdfDialog(url, document)
                }
                selectedTab={selectedTab}
              />
            )}
          </div>
        </div>
      </div>

      {/* PDF Preview Dialog */}
      <Dialog
        open={viewPdfDialogOpen}
        onClose={closePdfDialog}
        maxWidth="xl"
        fullWidth
      >
        <DialogTitle>
          <div className="flex flex-col sm:flex-row justify-between items-center w-full gap-2">
            <span className="font-semibold text-lg truncate max-w-[200px] sm:max-w-xs">
              {currentDocDetails.title || "Document Preview"}
            </span>
            <div className="flex-1 flex justify-center">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                  currentDocDetails.status
                )}`}
              >
                {currentDocDetails.status?.toUpperCase() || "UNKNOWN"}
              </span>
            </div>
            <button
              onClick={closePdfDialog}
              className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <AiOutlineClose className="h-5 w-5" />
            </button>
          </div>
        </DialogTitle>
        <DialogContent>
          <div className="flex flex-col lg:flex-row gap-4 h-[80vh]">
            {/* PDF Viewer - Left Side */}
            <div className="flex-grow h-[50vh] lg:h-full">
              <iframe
                src={currentPdfUrl}
                className="w-full h-full border rounded-md hidden md:block"
                title="PDF Preview"
              ></iframe>
              <div className="flex items-center justify-center mt-2 md:hidden h-full">
                <a
                  href={currentPdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                >
                  Download PDF
                </a>
              </div>
            </div>

            {/* Details Panel - Right Side */}
            <div className="w-full lg:w-80 bg-gray-50 p-4 rounded-lg overflow-y-auto">
              {/* Document Details */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 border-b pb-2 text-blue-700">
                  Document Details
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-600">
                      Department
                    </span>
                    <span className="text-gray-800">
                      {currentDocDetails.department || "Not assigned"}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-600">
                      Created By
                    </span>
                    <span className="text-gray-800">
                      {currentDocDetails.createdBy || "Unknown"}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-600">Date</span>
                    <span className="text-gray-800">
                      {currentDocDetails.createdDate
                        ? new Date(
                            currentDocDetails.createdDate
                          ).toLocaleDateString()
                        : "Not available"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Description Section */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2 border-b pb-2 text-blue-700">
                  Description
                </h3>
                <div className="bg-white p-3 rounded-md border border-gray-200 shadow-sm">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {currentDocDetails.description ||
                      "No description available"}
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2 flex items-center border-b pb-2 text-blue-700">
                  Remarks
                  <div className="relative inline-block ml-2 group">
                    <AiOutlineInfoCircle className="h-5 w-5 text-gray-500 cursor-help" />
                    <div className="absolute right-0 invisible group-hover:visible bg-gray-800 text-white text-xs rounded-lg p-2 w-56 bottom-full left-1/2 transform -translate-x-1/2 mb-2 shadow-lg z-50">
                      <ul className="space-y-1 list-disc pl-4 text-left">
                        <li>Approve: Optional</li>
                        <li>Reject: Optional</li>
                        <li>Correction: Required</li>
                      </ul>
                      <div className="absolute h-2 w-2 bg-gray-800 transform rotate-45 left-1/2 -ml-1 -bottom-1"></div>
                    </div>
                  </div>
                  {!isRemarkEditable && selectedTab !== "SENT BACK" && (
                    <button
                      className="ml-2 p-1 rounded-full hover:bg-gray-200 transition-colors"
                      onClick={() => setIsRemarkEditable(true)}
                    >
                      <FiEdit2 className="h-4 w-4 text-blue-600" />
                    </button>
                  )}
                </h2>
                {isRemarkEditable ? (
                  <div>
                    <textarea
                      className="w-full p-3 border border-gray-300 bg-white resize-none text-gray-800 text-base rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none mb-2 shadow-sm"
                      rows="4"
                      placeholder="Enter your remarks here..."
                      value={remark}
                      onChange={(e) => setRemark(e.target.value)}
                      onBlur={handleTextareaBlur}
                    />
                  </div>
                ) : (
                  <div className="bg-white p-3 rounded-md border border-gray-200 shadow-sm">
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {currentDocDetails.remarks || "Remark not available"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
        {selectedDocument?.status === "pending" && (
          <DialogActions>
            <div className="border-t w-full px-4 py-3 flex flex-wrap gap-2 justify-end">
              <button
                onClick={() => {
                  setCurrentAction("approve");
                  handleDocumentAction("approve");
                }}
                disabled={isActionInProgress}
                className={`flex items-center gap-2 px-4 py-2 rounded-md shadow-md transition-all ${
                  isActionInProgress
                    ? "bg-gray-400 cursor-not-allowed opacity-50"
                    : "bg-green-500 hover:bg-green-600 hover:shadow-lg transform hover:-translate-y-0.5"
                } text-white`}
              >
                <AiOutlineCheck className="h-5 w-5" />
                <span className="hidden sm:inline">
                  {isActionInProgress ? "Processing..." : "Approve"}
                </span>
                <span className="sm:hidden">OK</span>
              </button>

              <button
                onClick={() => {
                  setCurrentAction("reject");
                  handleDocumentAction("reject");
                }}
                disabled={isActionInProgress}
                className={`flex items-center gap-2 px-4 py-2 rounded-md shadow-md transition-all ${
                  isActionInProgress
                    ? "bg-gray-400 cursor-not-allowed opacity-50"
                    : "bg-red-500 hover:bg-red-600 hover:shadow-lg transform hover:-translate-y-0.5"
                } text-white`}
              >
                <AiOutlineCloseCircle className="h-5 w-5" />
                <span className="hidden sm:inline">
                  {isActionInProgress ? "Processing..." : "Reject"}
                </span>
                <span className="sm:hidden">No</span>
              </button>

              <button
                onClick={() => {
                  setCurrentAction("correction");
                  if (isRemarkEditable && remark && remark.trim()) {
                    handleDocumentAction("correction");
                  } else if (!isRemarkEditable) {
                    setIsRemarkEditable(true);
                  }
                }}
                disabled={isActionInProgress}
                className={`flex items-center gap-2 px-4 py-2 rounded-md shadow-md transition-all ${
                  isActionInProgress
                    ? "bg-gray-400 cursor-not-allowed opacity-50"
                    : "bg-yellow-500 hover:bg-yellow-600 hover:shadow-lg transform hover:-translate-y-0.5"
                } text-white`}
              >
                <FiEdit2 className="h-5 w-5" />
                <span className="hidden sm:inline">
                  {isActionInProgress ? "Processing..." : "Correction"}
                </span>
                <span className="sm:hidden">Edit</span>
              </button>
            </div>
          </DialogActions>
        )}
      </Dialog>
    </div>
  );
};

export default ApproverDashboard;
