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
  const [departments, setDepartments] = useState([]);
  const [displayRemark, setDisplayRemark] = useState("");

  const { handleDownload, handlePreview } = useFileHandlers();

  const navigate = useNavigate();

  useEffect(() => {
    fetchDocuments();
  }, [selectedTab]);

  const [searchTerm, setSearchTerm] = useState("");

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
      const token = localStorage.getItem("token");
      if(!token) throw new Error("Token not found. Please log in again.");

      const getDocsUrl = `${import.meta.env.VITE_API_URL}/file/get-documents?${queryParams}`;
      const response = await axios.get(getDocsUrl, { headers:{"Authorization": `Bearer ${token}`}, withCredentials: true});
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
      const token = localStorage.getItem("token");
      if(!token) throw new Error("Token not found. Please log in again.");
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/department/get-all-departments`,
        {headers:{"Authorization": `Bearer ${token}`}, withCredentials: true},
      );
      if (response.data && response.data.data) {
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
      const token = localStorage.getItem("token");
      if(!token) throw new Error("Token not found. Please log in again.");
      toast.loading("Approving document...");
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/file/approve`,
        { fileUniqueName },
        {headers: { "Authorization": `Bearer ${token}` }},
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
      const token = localStorage.getItem("token");
      if(!token) throw new Error("Token not found. Please log in again.");
      toast.loading("Rejecting document...");
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/file/reject`,
        { fileUniqueName },
        {headers: { "Authorization": `Bearer ${token}` }},
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

  const resetFilters = () => {
    setSearchTerm("");
    setStartDate("");
    setEndDate("");
    setCategory("");
    toast.success("Filters reset successfully");
  };

  return (
    <div className="flex flex-col font-sans space-y-6 p-4 bg-white rounded-xl shadow-sm">
      {/* Search Section */}
      <Toaster position="top-right" />
      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <FaSearch className="text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search documents by title or creator"
          className="w-full pl-10 pr-4 py-3 rounded-lg bg-gray-50 text-gray-800 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all duration-200"
          onChange={(e) => setSearchTerm(e.target.value)}
          value={searchTerm}
        />
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
        <select
          value={category}
          onChange={(e) => {
            const newCategory = e.target.value;
            setCategory(newCategory);
          }}
          className="px-4 py-2.5 rounded-lg bg-gray-50 text-gray-700 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all duration-200"
          disabled={isLoading}
        >
          <option value="">All Categories</option>
          {departments && departments.length > 0 ? (
            departments.map((department) => (
              <option key={department} value={department}>
                {department}
              </option>
            ))
          ) : (
            <option value="" disabled>
              Loading departments...
            </option>
          )}
        </select>
        
        <div className="relative">
          <label className="absolute -top-2 left-2 inline-block bg-white px-1 text-xs font-medium text-gray-600">
            Start Date
          </label>
          <input
            type="date"
            className="w-full px-4 py-2.5 rounded-lg bg-gray-50 text-gray-700 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all duration-200"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        
        <div className="relative">
          <label className="absolute -top-2 left-2 inline-block bg-white px-1 text-xs font-medium text-gray-600">
            End Date
          </label>
          <input
            type="date"
            className="w-full px-4 py-2.5 rounded-lg bg-gray-50 text-gray-700 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all duration-200"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        
        <button
          onClick={fetchDocuments}
          className="flex items-center justify-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
          disabled={isLoading}
        >
          <IoMdRefresh className="h-5 w-5 mr-2" />
          <span>Search</span>
        </button>
        
        <button
          onClick={resetFilters}
          className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg shadow-md hover:bg-gray-300 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
          disabled={isLoading}
        >
          Reset Filters
        </button>
      </div>

      {/* Documents */}
      <div className="space-y-4 mt-4">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <ClipLoader size={40} color={"#3B82F6"} loading={isLoading} />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600 text-center">
            {error}
          </div>
        ) : filteredData.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <p className="text-gray-500 font-medium text-lg">
              No documents found
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <div className="max-h-[600px] overflow-y-auto space-y-4 pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            {filteredData
              .filter((doc) =>
                searchTerm.trim()
                  ? doc.title
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase()) ||
                    doc.createdBy?.fullName
                      ?.toLowerCase()
                      .includes(searchTerm.toLowerCase())
                  : true
              )
              .map((item) => (
                <div
                  key={item._id}
                  className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-start sm:items-center space-x-4 flex-grow">
                    <div className="w-12 h-12 bg-blue-100 flex items-center justify-center rounded-lg text-blue-600 shadow-sm">
                      📄
                    </div>
                    <div className="flex flex-col flex-grow">
                      <h3
                        className="text-xl font-bold tracking-tight text-gray-800 cursor-pointer hover:text-blue-600 transition-colors duration-200"
                        onClick={async () => {
                          const url = await handlePreview(item.fileUniqueName);
                          setfileUnName(item.fileUniqueName || "");
                          setDescription(
                            item.description || "No description available"
                          );
                          setRemark(item.remark || "No remarks available");
                          handleTitleClick(url, item);
                        }}
                      >
                        {item.title}
                      </h3>
                      <div className="flex flex-col sm:flex-row sm:space-x-4 mt-1">
                        <span className="text-sm font-medium text-gray-600">
                          <span className="font-semibold text-gray-700">Department:</span>{" "}
                          {item.department?.departmentName || "Unassigned"}
                        </span>
                        <span className="text-sm font-medium text-gray-600">
                          <span className="font-semibold text-gray-700">Created By:</span>{" "}
                          {item.createdBy?.fullName || "Unknown"}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{item.date}</p>
                    </div>
                  </div>

                  <div className="flex space-x-3 items-center mt-4 sm:mt-0">
                    <button 
                      className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-600 transition-all duration-200"
                      onClick={() => {
                        navigate(`/MainPage/previewPdf/${item.fileUniqueName}`);
                      }}
                      aria-label="Preview document"
                    >
                      <FaEye className="h-5 w-5" />
                    </button>
                    <button 
                      className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 text-gray-700 hover:bg-green-100 hover:text-green-600 transition-all duration-200"
                      onClick={() => handleDownload(item.fileUniqueName)}
                      aria-label="Download document"
                    >
                      <FaDownload className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Modal for PDF display */}
      {isModalOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm z-50 transition-opacity duration-300 ease-in-out"
          onClick={closeModal}
        >
          <div
            className="bg-white p-6 rounded-xl shadow-xl w-full max-w-3xl mx-4 relative transform transition-all duration-300 ease-in-out"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <h2 className="text-2xl font-bold text-gray-800">
                {selectedDocument?.title}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-100"
                aria-label="Close modal"
              >
                <AiOutlineClose className="h-6 w-6" />
              </button>
            </div>

            {/* PDF Viewer Placeholder */}
            <div className="flex items-center justify-center h-72 bg-gray-100 rounded-lg mb-6 border border-gray-200">
              <p className="text-center text-gray-500">PDF content goes here</p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap justify-end gap-3">
              <button
                onClick={() => handleApprove(selectedDocument.fileUniqueName)}
                className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <AiOutlineCheck className="h-5 w-5" />
                Approve
              </button>

              <button
                onClick={() => handleReject(selectedDocument.fileUniqueName)}
                className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <AiOutlineCloseCircle className="h-5 w-5" />
                Reject
              </button>

              <button
                className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-white rounded-lg shadow-md hover:bg-amber-600 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                onClick={() => openRemarkModal(selectedDocument)}
              >
                <FaCommentDots className="h-5 w-5" />
                Give Remark
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Remarks */}
      {isRemarkModalOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm z-50 transition-opacity duration-300 ease-in-out"
          onClick={closeRemarkModal}
        >
          <div
            className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md mx-4 relative transform transition-all duration-300 ease-in-out"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <h2 className="text-2xl font-bold text-gray-800">
                Give Remark
              </h2>
              <button
                onClick={closeRemarkModal}
                className="text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-100"
                aria-label="Close modal"
              >
                <AiOutlineClose className="h-6 w-6" />
              </button>
            </div>

            {/* Remark Input */}
            <textarea
              className="w-full p-4 border border-gray-300 bg-white resize-none text-gray-800 text-lg rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all duration-200"
              rows="5"
              placeholder="Enter your remark here..."
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
            ></textarea>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                className="px-5 py-2.5 bg-gray-200 text-gray-700 rounded-lg shadow-md hover:bg-gray-300 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                onClick={closeRemarkModal}
              >
                Cancel
              </button>
              <button
                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                onClick={handleRemarkSubmit}
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