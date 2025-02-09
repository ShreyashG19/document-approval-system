import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { FaDownload } from "react-icons/fa";
import CryptoJS from "crypto-js";

const statusStyles = {
  approved: "text-green-600 bg-green-100 px-3 py-1 rounded-md",
  rejected: "text-red-600 bg-red-100 px-3 py-1 rounded-md",
  correction: "text-orange-600 bg-orange-100 px-3 py-1 rounded-md",
};

const History = ({ department, startDate, endDate, searchQuery, handleTitleClick }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [documents, setDocuments] = useState([]);

  // Fetch Documents from API
  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const queryParams = new URLSearchParams();
      if (department) queryParams.append("department", department);
      queryParams.append("status", "approved-rejected-correction");

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/file/get-documents?${queryParams.toString()}`,
        { withCredentials: true }
      );

      if (response.data.documents) {
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

  useEffect(() => {
    fetchDocuments();
  }, [department]);

  // Apply Filtering for Search, Date, and Category
  const filteredDocuments = documents.filter((doc) => {
    const docDate = new Date(doc.createdDate);
    return (
      (!startDate || docDate >= new Date(startDate)) &&
      (!endDate || docDate <= new Date(endDate)) &&
      (!searchQuery || doc.title.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  return (
    <div className="flex flex-col items-start bg-gray-100 justify-start flex-grow">
      <div className="w-full max-w-4xl bg-white shadow-lg border border-gray-200 rounded-lg p-6">
        {isLoading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 py-4">{error}</div>
        ) : (
          <div className="space-y-4">
            {filteredDocuments.length > 0 ? (
              filteredDocuments.map((doc) => (
                <div key={doc._id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all">
                  <div className="flex-grow">
                    <h3
                      className="text-lg font-semibold w-fit text-gray-800 cursor-pointer"
                      onClick={async () => {
                        const url = await handlePreview(doc.fileUniqueName);
                        handleTitleClick(url);
                      }}
                    >
                      {doc.title || "Untitled"}
                    </h3>
                    <div className="flex flex-wrap gap-4 mt-2">
                      <p className="text-sm text-gray-600">Department: {doc.department?.departmentName || "Unassigned"}</p>
                      <p className="text-sm text-gray-600">Created by: {doc.createdBy?.fullName || "Unknown"}</p>
                      <span className="text-xs text-gray-400">{new Date(doc.createdDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`${statusStyles[doc.status] || ""}`}>{doc.status}</span>
                    <button
                      onClick={() => handleDownload(doc.fileUniqueName)}
                      className="p-2 text-blue-600 hover:text-blue-800 transition-colors"
                      title="Download Decrypted File"
                    >
                      <FaDownload size={20} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">No documents found</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
