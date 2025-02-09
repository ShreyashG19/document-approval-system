import React, { useContext, useEffect, useState } from "react";
import {
  FaHistory,
  FaBell,
  FaUserAlt,
  FaSearch,
  FaCommentDots,
} from "react-icons/fa";
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
  AiOutlineCheck,
  AiOutlineCloseCircle,
} from "react-icons/ai";

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
  const [currentAction, setCurrentAction] = useState(null);

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

    // Validate remark for correction (mandatory)
    if (actionType === 'correction' && (!remark || !remark.trim())) {
      toast.error("Remark is mandatory for correction");
      return;
    }

    try {
      toast.loading(`${actionType} document...`);
      
      const actionEndpoints = {
        'approve': `${import.meta.env.VITE_API_URL}/file/approve`,
        'reject': `${import.meta.env.VITE_API_URL}/file/reject`,
        'correction': `${import.meta.env.VITE_API_URL}/file/correction`
      };

      const response = await axios.post(
        actionEndpoints[actionType],
        { 
          fileUniqueName: fileUnName,
          ...(remark && remark.trim() && { remark: remark.trim() })
        },
        { withCredentials: true }
      );

      setViewPdfDialogOpen(false);
      await fetchDocuments();
      toast.dismiss();
      toast.success(response.data.message || `Document ${actionType}d successfully!`);
      
      // Reset states
      setCurrentAction(null);
      setRemark("");
      setIsRemarkEditable(false);
    } catch (error) {
      toast.dismiss();
      console.error(`${actionType} error:`, error);
      toast.error(error.response?.data?.message || `${actionType} failed`);
    }
  };

  // PDF Dialog Handlers
  const openPdfDialog = (url, document) => {
    setCurrentPdfUrl(url);
    setSelectedDocument(document);
    setfileUnName(document?.fileUniqueName || "");
    setDescription(document?.description || "No description available");
    setRemark(document?.remark || "");
    setViewPdfDialogOpen(true);
    setCurrentAction(null);
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

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-r bg-blue-100">
      <div className="flex items-center min-h-screen mt-3 h-auto justify-center flex-grow">
        <div className="w-[90%] bg-white h-full flex flex-col flex-grow-1 shadow-lg border border-gray-200 rounded-lg">
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
          <div className="content p-4">
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
          <div className="flex justify-between items-center">
            <span>{selectedDocument?.title || "Document Preview"}</span>
            <Button onClick={closePdfDialog}>
              <AiOutlineClose className="h-5 w-5" />
            </Button>
          </div>
        </DialogTitle>
        <DialogContent>
          <div className="flex w-full h-[80vh] gap-4">
            {/* PDF Viewer */}
            <div className="w-3/4 h-full">
              {currentPdfUrl ? (
                <object
                  data={currentPdfUrl}
                  type="application/pdf"
                  width="100%"
                  height="100%"
                >
                  <p>
                    Your browser does not support PDFs.{" "}
                    <a
                      href={currentPdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Download the PDF
                    </a>
                  </p>
                </object>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p>No PDF document loaded</p>
                </div>
              )}
            </div>

            {/* Description and Remarks Panel */}
            <div className="w-1/4 h-full p-4 bg-gray-50 rounded-lg overflow-y-auto">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-2">
                  Description
                </h2>
                <p className="text-gray-600">
                  {description || "No description available"}
                </p>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
                  Remarks
                  {!isRemarkEditable && (
                    <FiEdit2
                      className="h-5 w-5 text-gray-500 ml-2 cursor-pointer hover:text-blue-600"
                      onClick={() => setIsRemarkEditable(true)}
                    />
                  )}
                </h2>

                {isRemarkEditable ? (
                  <div>
                    <textarea
                      className="w-full p-2 border border-gray-300 bg-white resize-none text-black text-lg rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      rows="4"
                      placeholder={
                        currentAction === 'correction' 
                          ? "Enter correction remark (Mandatory)" 
                          : "Enter optional remark..."
                      }
                      value={remark}
                      onChange={(e) => setRemark(e.target.value)}
                    ></textarea>
                  </div>
                ) : (
                  <p className="text-gray-600">
                    {remark || "No remarks available"}
                  </p>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
        
        {/* Action Buttons */}
        {selectedDocument?.status === "pending" && (
          <DialogActions>
            <div className="border-t-2 flex space-x-2 mt-3 w-full items-end justify-end">
              {/* Approve Button */}
              <button
                onClick={() => {
                  setCurrentAction('approve');
                  handleDocumentAction('approve');
                }}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-md shadow-md hover:bg-green-600 transition"
              >
                <AiOutlineCheck className="h-5 w-5" />
                Approve
              </button>

              {/* Reject Button */}
              <button
                onClick={() => {
                  setCurrentAction('reject');
                  handleDocumentAction('reject');
                }}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-md shadow-md hover:bg-red-600 transition"
              >
                <AiOutlineCloseCircle className="h-5 w-5" />
                Reject
              </button>

              {/* Correction Button */}
              <button
                onClick={() => {
                  setCurrentAction('correction');
                  if (isRemarkEditable && remark && remark.trim()) {
                    handleDocumentAction('correction');
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-md shadow-md hover:bg-yellow-600 transition"
              >
                <FiEdit2 className="h-5 w-5" />
                Correction
              </button>
            </div>
          </DialogActions>
        )}
      </Dialog>
    </div>
  );
};

export default ApproverDashboard;