import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { FaDownload, FaEye, FaRegFileAlt } from "react-icons/fa";
import { FiCalendar, FiUser, FiFolder } from "react-icons/fi";
import CryptoJS from "crypto-js";
import { useFileHandlers } from "../hooks/files";

const DocumentsList = ({
  status,
  department,
  startDate,
  endDate,
  searchQuery,
  handleTitleClick,
  encKey,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [documents, setDocuments] = useState([]);
  const { handleDownload, handlePreview } = useFileHandlers();

  // Fetch Documents from API
  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const queryParams = new URLSearchParams();
      if (status && status !== "all") queryParams.append("status", status);
      if (department) queryParams.append("department", department);
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token not found. Please log in again.");

      const response = await axios.get(
        `${
          import.meta.env.VITE_API_URL
        }/file/get-documents?${queryParams.toString()}`,
        { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
      );

      if (response.data.status && response.data.documents) {
        setDocuments(response.data.documents);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.response?.data?.message || "Failed to fetch documents");
      toast.error("Failed to load documents");
      setDocuments([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch when filters change
  useEffect(() => {
    fetchDocuments();
  }, [status, department]);

  // Apply Filtering for Search, Date, and Category
  const filteredDocuments = documents.filter((doc) => {
    const docDate = new Date(doc.createdDate);
    return (
      (!startDate || docDate >= new Date(startDate)) &&
      (!endDate || docDate <= new Date(endDate)) &&
      (!searchQuery ||
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  return (
    <div className="flex items-start justify-start flex-grow">
      <div className="w-full max-w-7xl bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
            <p className="text-gray-600">Loading documents...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-2">
            <div className="bg-red-100 p-3 rounded-full">
              <svg
                className="w-6 h-6 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p className="text-red-500 font-medium">{error}</p>
            <button
              onClick={fetchDocuments}
              className="mt-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors text-sm"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            <div className="max-h-[600px] overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              {filteredDocuments.length > 0 ? (
                filteredDocuments.map((doc) => (
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
                              const url = await handlePreview(
                                doc.fileUniqueName
                              );
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
                      <button
                        onClick={async () => {
                          const url = await handlePreview(doc.fileUniqueName);
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
                        <FaEye
                          className="h-6 w-6"
                          onClick={() => {
                            navigate(
                              `/MainPage/previewPdf/${doc.fileUniqueName}`
                            );
                          }}
                        />
                      </button>
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
              ) : (
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
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DocumentsList;
