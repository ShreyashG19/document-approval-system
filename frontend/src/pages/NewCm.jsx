import React, { useState, useEffect } from "react";
import { FaEye, FaSearch, FaDownload } from "react-icons/fa";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import { ClipLoader } from "react-spinners";
import {
  AiOutlineClose,
  AiOutlineCheck,
  AiOutlineCloseCircle,
} from "react-icons/ai";
import { FaCommentDots } from "react-icons/fa";
import { IoMdRefresh } from "react-icons/io";
import "../index.css";
import CryptoJS from "crypto-js";
import forge from "node-forge";
import { useFileHandlers } from "../hooks/files";
import { useNavigate } from "react-router-dom";
import { FaRegFileAlt } from "react-icons/fa"
import { FiFolder, FiUser, FiCalendar } from "react-icons/fi"
const NewCm = ({
  handleTitleClick,
  setfileUnName,
  setRemark,
  setDescription,
  selectedTab,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filteredData, setFilteredData] = useState([]);
  const [category, setCategory] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRemarkModalOpen, setIsRemarkModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  // const [remark, setRemark] = useState("");
  const [departments, setDepartments] = useState([]);
  const [displayRemark, setDisplayRemark] = useState("");
  // const { getEncKeyForDoc } = useEncryption();

  const { handleDownload, handlePreview } = useFileHandlers();

  const navigate = useNavigate();

  useEffect(() => {
    fetchDocuments();
  }, [selectedTab]);

  const [searchTerm, setSearchTerm] = useState("");
  // const convertWordArrayToUint8Array = (wordArray) => {
  //   const len = wordArray.sigBytes;
  //   const words = wordArray.words;
  //   const uint8Array = new Uint8Array(len);
  //   let offset = 0;

  //   for (let i = 0; i < len; i += 4) {
  //     const word = words[i >>> 2];
  //     for (let j = 0; j < 4 && offset < len; ++j) {
  //       uint8Array[offset++] = (word >>> (24 - j * 8)) & 0xff;
  //     }
  //   }

  //   return uint8Array;
  // };

  // const handleDownload = async (fileName) => {
  //   try {
  //     let currentEncKey = await getEncKeyForDoc(fileName);

  //     console.log("Downloading:", fileName);
  //     const downloadUrl = `${import.meta.env.VITE_API_URL
  //       }/file/download-pdf/${fileName}`;
  //     const response = await axios.get(downloadUrl, {
  //       withCredentials: true,
  //       responseType: "text",
  //     });

  //     // Decrypt the content using the secure key
  //     const decrypted = CryptoJS.AES.decrypt(response.data, currentEncKey);
  //     const typedArray = convertWordArrayToUint8Array(decrypted);

  //     // Create blob and download
  //     const blob = new Blob([typedArray], { type: "application/pdf" });
  //     downloadBlob(blob, fileName.replace(".enc", ""));
  //   } catch (error) {
  //     console.error("Download error:", error);
  //     toast.error("Failed to download document");
  //   }
  // };
  // const downloadBlob = (blob, filename) => {
  //   const url = URL.createObjectURL(blob);
  //   const link = document.createElement("a");
  //   link.href = url;
  //   link.download = filename;
  //   document.body.appendChild(link);
  //   link.click();
  //   document.body.removeChild(link);
  //   URL.revokeObjectURL(url);
  // };

  //make hook for theme

  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const queryParams = new URLSearchParams();
      if (selectedTab === "NEW") queryParams.append("status", "pending");
      else queryParams.append("status", "rejected-correction");

      // Add category to query params if selected
      if (category) queryParams.append("department", category);
      if (startDate) queryParams.append("startDate", startDate);
      if (endDate) queryParams.append("endDate", endDate);
      if (searchTerm.trim()) queryParams.append("search", searchTerm.trim());

      const getDocsUrl = `${import.meta.env.VITE_API_URL
        }/file/get-documents?${queryParams}`;
      const response = await axios.get(getDocsUrl, { withCredentials: true });
      console.log(response.data);

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
  const fetchDepartments = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/department/get-all-departments`,
        { withCredentials: true }
      );
      if (response.data && response.data.data) {
        // Add console.log to debug the response
        console.log("API Response:", response.data);
        setDepartments(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
      toast.error("Failed to fetch departments");
    }
  };
  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    const initialize = async () => {
      fetchDocuments();
    };
    initialize();
  }, [category, startDate, endDate]);

  const openModal = (document) => {
    setSelectedDocument(document);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedDocument(null);
  };

  const openRemarkModal = (document) => {
    setSelectedDocument(document);
    setRemark("");
    setIsRemarkModalOpen(true);
  };

  const closeRemarkModal = () => {
    setIsRemarkModalOpen(false);
    setSelectedDocument(null);
  };

  const handleRemarkSubmit = () => {
    console.log("Remark submitted:", remark);
    setDisplayRemark(remark || "No remarks available");
    closeRemarkModal();
  };

  const handleApprove = async (fileUniqueName) => {
    console.log("fileUniqueName:", fileUniqueName);

    try {
      toast.loading("Approving document...");
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/file/approve`,
        { fileUniqueName },
        { withCredentials: true }
      );
      closeModal();

      toast.dismiss();
      toast.success(response.data.message || "Document approved successfully!");
      fetchDocuments(); // Refresh list after approval
    } catch (error) {
      toast.dismiss();
      console.log(error.response?.data?.message);
      toast.error(error.response?.data?.message || "Approval failed");
    }
  };

  const handleReject = async (fileUniqueName) => {
    console.log("rejected file", fileUniqueName);
    try {
      toast.loading("Rejecting document...");
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/file/reject`,
        { fileUniqueName },
        { withCredentials: true }
      );
      closeModal();
      toast.dismiss();
      toast.success(response.data.message || "Document rejected successfully!");
      fetchDocuments();
    } catch (error) {
      toast.dismiss();
      console.log(error.response?.data?.message);
      toast.error(error.response?.data?.message || "Rejection failed");
    }
  };

  // const handlePreview = async (fileName) => {
  //   try {
  //     let currentEncKey = await getEncKeyForDoc(fileName);

  //     console.log("fileName", fileName);
  //     const downloadUrl =
  //       import.meta.env.VITE_API_URL + `/file/download-pdf/${fileName}`;
  //     const response = await axios.get(downloadUrl, {
  //       withCredentials: true,
  //       responseType: "text",
  //     });

  //     // Decrypt the content using the secure key
  //     const decrypted = CryptoJS.AES.decrypt(response.data, currentEncKey);

  //     // Convert to Uint8Array
  //     const typedArray = convertWordArrayToUint8Array(decrypted);

  //     // Create blob and download
  //     const blob = new Blob([typedArray], {
  //       type: "application/pdf" || "application/octet-stream",
  //     });

  //     const url = URL.createObjectURL(blob);
  //     console.log("file url generated for preview : ", url);
  //     return url;
  //   } catch (error) {
  //     console.error("Decryption error:", error);
  //     toast.error("Failed to decrypt document");
  //   }
  // };
  const resetFilters = () => {
    setSearchTerm("");
    setStartDate("");
    setEndDate("");
    setCategory("");
    toast.success("Filters reset successfully");
  };

  return (
    <div className="font-sans bg-gray-50 min-h-screen p-4 w-full">

      {/* Search Section */}
      <div className="mb-8">
        {/* Search Bar */}
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search documents..."
            className="block w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-md bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 placeholder-gray-400 transition"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filters Section */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">

            {/* Department Select */}
            <div>
              <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                Department
              </label>
              <select
                id="department"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 disabled:bg-gray-50 disabled:text-gray-500"
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

            {/* Start Date */}
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                From Date
              </label>
              <input
                type="date"
                id="startDate"
                className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            {/* End Date */}
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                To Date
              </label>
              <input
                type="date"
                id="endDate"
                className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 disabled:bg-gray-50 disabled:text-gray-500"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
                disabled={!startDate}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-end space-x-2">
              <button
                onClick={fetchDocuments}
                disabled={isLoading}
                className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed transition"
              >
                <IoMdRefresh className={`mr-1 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                {isLoading ? 'Refreshing...' : 'Refresh'}
              </button>
              <button
                onClick={resetFilters}
                disabled={isLoading}
                className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Documents List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="flex justify-center">
            <ClipLoader size={35} color={"#123abc"} loading={isLoading} />
          </div>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : filteredData.length === 0 ? (
          <p className="text-gray-500 text-center">No documents found</p>
        ) : (
          <div className="space-y-3">
            {filteredData
              .filter((doc) =>
                searchTerm.trim()
                  ? doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  doc.createdBy?.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
                  : true
              )
              .map((item) => (
                <div className="max-h-[600px] overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                  {isLoading ? (
                    <div className="flex justify-center">
                      <ClipLoader size={35} color={"#123abc"} loading={isLoading} />
                    </div>
                  ) : error ? (
                    <p className="text-red-500">{error}</p>
                  ) : filteredData.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                      <svg
                        className="w-16 h-16 mb-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1}
                          d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                        />
                      </svg>
                      <p className="text-lg">No documents found</p>
                      <p className="text-sm mt-1">
                        Try adjusting your filters or upload a new document
                      </p>
                    </div>
                  ) : (
                    filteredData
                      .filter((doc) =>
                        searchTerm.trim()
                          ? doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          doc.createdBy?.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
                          : true
                      )
                      .map((doc) => (
                        <div
                          key={doc._id}
                          className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 bg-white rounded-lg border border-gray-100 hover:border-blue-100 hover:shadow-xs transition-all"
                        >
                          <div className="flex-grow w-full md:w-auto">
                            <div className="flex items-start space-x-3">
                              <div className="bg-blue-50 p-2 rounded-lg">
                                <FaRegFileAlt className="text-blue-500 text-lg" />
                              </div>
                              <div>
                                <h3
                                  className="text-base md:text-lg font-medium text-gray-800 cursor-pointer hover:text-blue-600 transition-colors"
                                  onClick={async () => {
                                    const url = await handlePreview(doc.fileUniqueName);
                                    setfileUnName(doc.fileUniqueName || "");
                                    setDescription(doc.description || "No description available");
                                    setRemark(doc.remark || "No remarks available");
                                    handleTitleClick(url, {
                                      description: doc.description,
                                      remarks: doc.remarks,
                                      title: doc.title,
                                      department: doc.department?.departmentName,
                                      createdBy: doc.createdBy?.fullName,
                                      createdDate: doc.createdDate,
                                      status: doc.status,
                                    });
                                  }}
                                >
                                  {doc.title || "Untitled"}
                                </h3>
                                <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2 text-sm text-gray-500">
                                  <span className="flex items-center">
                                    <FiFolder className="mr-1.5" />
                                    {doc.department?.departmentName || "Unassigned"}
                                  </span>
                                  <span className="flex items-center">
                                    <FiUser className="mr-1.5" />
                                    {doc.createdBy?.fullName || "Unknown"}
                                  </span>
                                  <span className="flex items-center">
                                    <FiCalendar className="mr-1.5" />
                                    {new Date(doc.createdDate).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mt-3 md:mt-0 ml-auto">
                            {/* <button
                              onClick={async () => {
                                // const url = await handlePreview(doc.fileUniqueName);
                                setfileUnName(doc.fileUniqueName || "");
                                setDescription(doc.description || "No description available");
                                setRemark(doc.remark || "No remarks available");
                                handleTitleClick(url, {
                                  description: doc.description,
                                  remarks: doc.remarks,
                                  title: doc.title,
                                  department: doc.department?.departmentName,
                                  createdBy: doc.createdBy?.fullName,
                                  createdDate: doc.createdDate,
                                  status: doc.status,
                                });
                              }}
                              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                              title="Preview"
                            >
                              <FaEye size={16} />
                            </button> */}
                            <FaEye
                              className="h-6 w-6"
                              onClick={() => {
                                navigate(`/MainPage/previewPdf/${item.fileUniqueName}`)
                              }}
                            />
                            <button
                              onClick={() => handleDownload(doc.fileUniqueName)}
                              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                              title="Download"
                            >
                              <FaDownload size={16} />
                            </button>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              ))}
          </div>
        )}
      </div>

      {/* PDF Preview Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-md shadow-lg w-full max-w-3xl mx-4">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-medium">{selectedDocument?.title}</h3>
              <button onClick={closeModal}>
                <AiOutlineClose />
              </button>
            </div>
            <div className="p-4">
              <div className="h-96 bg-gray-100 flex items-center justify-center">
                PDF preview
              </div>
            </div>
            <div className="p-4 border-t flex justify-end gap-2">
              <button
                onClick={() => handleApprove(selectedDocument.fileUniqueName)}
                className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded"
              >
                <AiOutlineCheck />
                Approve
              </button>
              <button
                onClick={() => handleReject(selectedDocument.fileUniqueName)}
                className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded"
              >
                <AiOutlineCloseCircle />
                Reject
              </button>
              <button
                onClick={() => openRemarkModal(selectedDocument)}
                className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded"
              >
                <FaCommentDots />
                Remark
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Remark Modal */}
      {isRemarkModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-md shadow-lg w-full max-w-md mx-4">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-medium">Give Remark</h3>
              <button onClick={closeRemarkModal}>
                <AiOutlineClose />
              </button>
            </div>
            <div className="p-4">
              <textarea
                className="w-full p-2 border border-gray-300 rounded"
                rows="4"
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
              ></textarea>
            </div>
            <div className="p-4 border-t flex justify-end gap-2">
              <button
                onClick={closeRemarkModal}
                className="px-3 py-1 bg-gray-200 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleRemarkSubmit}
                className="px-3 py-1 bg-blue-600 text-white rounded"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewCm;
