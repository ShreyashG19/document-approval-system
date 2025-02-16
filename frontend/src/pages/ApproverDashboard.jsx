import React, { useContext, useEffect, useState } from "react";
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
  Button,
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
  const { loggedInUser } = useContext(AuthContext);
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

   

  // Authentication Check
  useEffect(() => {
    if (!loggedInUser) {
      navigate("/");
    }
  }, [loggedInUser, navigate]);

  // Fetch Documents
  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/file/get-documents?status=pending`,
        { withCredentials: true }
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
    <div className="flex  flex-col min-h-full bg-gradient-to-r bg-blue-100">
      <div className="flex items-center min-h-screen mt-3 h-auto justify-center flex-grow">
        <div className="w-[70%] bg-white h-fit flex flex-col flex-grow-1 shadow-lg border border-gray-200 rounded-lg absolute top-40 p-3">
          {/* Tabs */}
          <div className="tabs flex justify-around items-center text-sm text-gray-700 mt-2 border-b border-gray-200">
            <button
              onClick={() => setSelectedTab("NEW")}
              className={`px-4 py-2 font-medium rounded-md ${
                selectedTab === "NEW"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              NEW
            </button>
            <button
              onClick={() => setSelectedTab("SENT BACK")}
              className={`px-4 py-2 font-medium rounded-md ${
                selectedTab === "SENT BACK"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              SENT BACK
            </button>
          </div>

          {/* Content */}
          <div className="content p-4 ">
            {selectedTab === "NEW" ? (
              <NewCm
                setfileUnName={setfileUnName}
                setDescription={setDescription}
                setRemark={setRemark}
                handleTitleClick={(url, document) =>
                  openPdfDialog(url, document)
                }
              />
            ) : (
              <SentBackTabContent
                setfileUnName={setfileUnName}
                setDescription={setDescription}
                setRemark={setRemark}
                handleTitleClick={(url, document) =>
                  openPdfDialog(url, document)
                }
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
          <div className="flex justify-between items-center w-full">
            <span>{currentDocDetails.title || "Document Preview"}</span>
            <div className="flex-1 flex justify-center">
              <span className={getStatusColor(currentDocDetails.status)}>
                {currentDocDetails.status?.toUpperCase() || "UNKNOWN"}
              </span>
            </div>
            <button onClick={closePdfDialog}>
              <AiOutlineClose className="h-5 w-5" />
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

              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2 flex items-center">
                  Remarks
                  <div className="relative inline-block ml-2 group">
                    <AiOutlineInfoCircle className="h-5 w-5 text-gray-500 cursor-help" />
                    <div className="absolute right-2 invisible group-hover:visible bg-gray-700 text-white text-sm rounded-lg p-3 w-56 bottom-full left-1/2 transform -translate-x-1/2 mb-2 shadow-lg z-50">
                      <ul className="space-y-1 list-disc pl-4 text-left">
                        <li>Approve: Optional</li>
                        <li>Reject: Optional</li>
                        <li>Correction: Required</li>
                      </ul>
                    </div>
                  </div>
                  {!isRemarkEditable && selectedTab !== "SENT BACK" && (
                    <FiEdit2
                      className="h-5 w-5 text-gray-500 ml-2 cursor-pointer hover:text-blue-600"
                      onClick={() => setIsRemarkEditable(true)}
                    />
                  )}
                </h2>
                {isRemarkEditable ? (
                  <div>
                    <textarea
                      className="w-full p-2 border border-gray-300 bg-white resize-none text-black text-lg rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none mb-2"
                      rows="4"
                      placeholder="Enter your remarks here..."
                      value={remark}
                      onChange={(e) => setRemark(e.target.value)}
                      onBlur={handleTextareaBlur}
                    />
                  </div>
                ) : (
                  <div className="bg-white p-3 rounded-md border border-gray-200">
                    <p className="text-gray-700">
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
            <div className="border-t-2 flex space-x-2 mt-3 w-full items-end justify-end">
              <button
                onClick={() => {
                  setCurrentAction("approve");
                  handleDocumentAction("approve");
                }}
                disabled={isActionInProgress}
                className={`flex items-center gap-2 px-4 py-2 rounded-md shadow-md transition ${
                  isActionInProgress
                    ? "bg-gray-400 cursor-not-allowed opacity-50"
                    : "bg-green-500 hover:bg-green-600"
                } text-white`}
              >
                <AiOutlineCheck className="h-5 w-5" />
                {isActionInProgress ? "Processing..." : "Approve"}
              </button>

              <button
                onClick={() => {
                  setCurrentAction("reject");
                  handleDocumentAction("reject");
                }}
                disabled={isActionInProgress}
                className={`flex items-center gap-2 px-4 py-2 rounded-md shadow-md transition ${
                  isActionInProgress
                    ? "bg-gray-400 cursor-not-allowed opacity-50"
                    : "bg-red-500 hover:bg-red-600"
                } text-white`}
              >
                <AiOutlineCloseCircle className="h-5 w-5" />
                {isActionInProgress ? "Processing..." : "Reject"}
              </button>

              <button
                onClick={() => {
                  setCurrentAction("correction");
                  if (isRemarkEditable && remark && remark.trim()) {
                    handleDocumentAction("correction");
                  }
                }}
                disabled={isActionInProgress}
                className={`flex items-center gap-2 px-4 py-2 rounded-md shadow-md transition ${
                  isActionInProgress
                    ? "bg-gray-400 cursor-not-allowed opacity-50"
                    : "bg-yellow-500 hover:bg-yellow-600"
                } text-white`}
              >
                <FiEdit2 className="h-5 w-5" />
                {isActionInProgress ? "Processing..." : "Correction"}
              </button>
            </div>
          </DialogActions>
        )}
      </Dialog>
    </div>
  );
};

export default ApproverDashboard;
