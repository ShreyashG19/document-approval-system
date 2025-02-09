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
import Navbar from "../components/Navbar.jsx";
import { AuthContext } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { FiEdit2 } from "react-icons/fi";
import { MdOutlineDescription } from "react-icons/md";

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
  const [isRemarkModalOpen, setIsRemarkModalOpen] = useState(false);
  const navigate = useNavigate();
  const [localRemark, setLocalRemark] = useState("");
  const [departments, setDepartments] = useState([]);

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
    const fetchDepartments = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/department/get-all-departments`,
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

  useEffect(() => {
    fetchDocuments();
  }, []);

  // Document Actions
  const handleApprove = async (fileUniqueName) => {
    if (!fileUniqueName) {
      toast.error("No file selected for approval");
      return;
    }

    setIsLoading(true);

    try {
      toast.loading("Approving document...");
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/file/approve`,
        { fileUniqueName },
        { withCredentials: true }
      );

      setViewPdfDialogOpen(false);
      fetchDocuments();
      toast.dismiss();
      toast.success(response.data.message || "Document approved successfully!");
      setIsLoading(false);
    } catch (error) {
      toast.dismiss();
      console.error("Approval error:", error);
      toast.error(error.response?.data?.message || "Approval failed");
    }
  };

  const handleReject = async (fileUniqueName) => {
    if (!fileUniqueName) {
      toast.error("No file selected for rejection");
      return;
    }

    try {
      toast.loading("Rejecting document...");
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/file/reject`,
        { fileUniqueName },
        { withCredentials: true }
      );
      fetchDocuments();
      setViewPdfDialogOpen(false);
      toast.dismiss();
      toast.success(response.data.message || "Document rejected successfully!");
      fetchDocuments();
    } catch (error) {
      toast.dismiss();
      console.error("Rejection error:", error);
      toast.error(error.response?.data?.message || "Rejection failed");
    }
  };

  // New Remark Handlers
  const openRemarkModal = () => {
    setIsRemarkModalOpen(true);
  };

  const closeRemarkModal = () => {
    setIsRemarkModalOpen(false);
    setRemark("");
  };

  // Updated handleRemarkSubmit to change status to correction
  const handleRemarkSubmit = async () => {
    // Debug logging
    console.log('Remark Submission Debug - Start', {
      fileUnName,
      remark,
      localRemark,
      isRemarkModalOpen
    });

    // Validate file selection
    if (!fileUnName) {
      console.error('Remark Submission Error: No file selected');
      toast.error("No file selected");
      return;
    }

    // Determine the remark to submit with multiple fallback mechanisms
    const remarkToSubmit = (remark || localRemark || "").trim();

    // Validate remark
    if (!remarkToSubmit) {
      console.error('Remark Submission Error: Empty remark', {
        remark,
        localRemark
      });
      toast.error("Please enter a valid remark");
      return;
    }

    try {
      console.log('Remark Submission - Preparing request', {
        fileUniqueName: fileUnName,
        remarkToSubmit
      });

      toast.loading("Submitting remark...");

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/file/correction`,
        {
          fileUniqueName: fileUnName,
          remark: remarkToSubmit,
        },
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      // Debug successful response
      console.log('Remark Submission - Success', {
        responseData: response.data,
        fileUnName,
        remarkToSubmit
      });

      toast.dismiss();
      toast.success(response.data.message || "Remark added successfully!");

      // Update the selected document's remark and status directly
      setSelectedDocument((prevDoc) => {
        console.log('Updating Selected Document', {
          previousDoc: prevDoc,
          newRemark: remarkToSubmit
        });
        return prevDoc 
          ? { ...prevDoc, remark: remarkToSubmit, status: 'correction' } 
          : prevDoc;
      });

      // Update UI instantly
      setFilteredData((prevData) => {
        const updatedData = prevData.map((doc) =>
          doc.fileUniqueName === fileUnName
            ? { ...doc, remark: remarkToSubmit, status: 'correction' }
            : doc
        );
        
        console.log('Updated Filtered Data', {
          previousData: prevData,
          updatedData
        });

        return updatedData;
      });

      // Reset states
      setRemark("");
      setLocalRemark("");
      setIsRemarkModalOpen(false);
      setViewPdfDialogOpen(false);
      
      // Refresh the document list to reflect the status change
      await fetchDocuments();

      console.log('Remark Submission - Complete');
    } catch (error) {
      // Comprehensive error logging
      console.error('Remark Submission - Error', {
        errorMessage: error.message,
        errorResponse: error.response?.data,
        errorStatus: error.response?.status,
        fileUnName,
        remark,
        localRemark
      });

      toast.dismiss();
      
      // More detailed error message
      const errorMessage = 
        error.response?.data?.message || 
        error.response?.data?.error || 
        "Failed to add remark";
      
      toast.error(errorMessage);
    }
  };

  // PDF Dialog Handlers
  const openPdfDialog = (url, document) => {
    setCurrentPdfUrl(url);
    setSelectedDocument(document);
    setfileUnName(document?.fileUniqueName || "");
    setDescription(document?.description || "No description available");
    setRemark(document?.remark || "No remarks available"); // Ensure remark is set
    setViewPdfDialogOpen(true);
  };

  const closePdfDialog = () => {
    setViewPdfDialogOpen(false);
    setCurrentPdfUrl("");
    setSelectedDocument(null);
    setfileUnName("");
    setDescription("");
    setRemark("");
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-r bg-blue-100">
      <div className="flex items-center min-h-screen mt-3 h-auto justify-center flex-grow">
        <div className="w-[90%]   bg-white h-full flex flex-col flex-grow-1 shadow-lg border border-gray-200 rounded-lg">
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
                  {!isRemarkModalOpen && (
                    <FiEdit2
                      className="h-5 w-5 text-gray-500 ml-2 cursor-pointer hover:text-blue-600"
                      onClick={() => setIsRemarkModalOpen(true)}
                    />
                  )}
                </h2>

                {isRemarkModalOpen ? (
                  <div>
                    <textarea
                      className="w-full p-2 border border-gray-300 bg-white resize-none text-black text-lg rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      rows="4"
                      required
                      placeholder="Enter your remark here..."
                      value={remark}
                      onChange={(e) => setRemark(e.target.value)}
                    ></textarea>

                    <div className="flex justify-end gap-2 mt-2">
                      <button
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md shadow-md hover:bg-gray-400 transition"
                        onClick={() => setIsRemarkModalOpen(false)}
                      >
                        Cancel
                      </button>
                      <button
                        className={`px-4 py-2 bg-blue-500 text-white rounded-md shadow-md hover:bg-blue-600 transition ${
                          !remark?.trim() ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                        onClick={handleRemarkSubmit}
                        disabled={!remark.trim()}
                      >
                        Submit
                      </button>
                    </div>
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
        {selectedDocument?.status === "pending" && (
          <DialogActions>
            <div className="border-t-2 flex space-x-2   mt-3 w-full items-end justify-end">
              <button
                onClick={() => handleApprove(fileUnName)}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-md shadow-md hover:bg-green-600 transition"
              >
                <AiOutlineCheck className="h-5 w-5" />
                Approve
              </button>

              <button
                onClick={() => handleReject(fileUnName)}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-md shadow-md hover:bg-red-600 transition"
              >
                <AiOutlineCloseCircle className="h-5 w-5" />
                Reject
              </button>
            </div>
          </DialogActions>
        )}
      </Dialog>
    </div>
  );
};

export default ApproverDashboard;