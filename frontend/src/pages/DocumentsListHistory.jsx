import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { FaDownload, FaSearch } from "react-icons/fa";
import CryptoJS from "crypto-js";

const DocumentsListHistory = ({
  status,
  department,
  startDate,
  endDate,
  searchQuery,
  handleTitleClick,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch Documents from API
  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const queryParams = new URLSearchParams();
      if (department) queryParams.append("department", department);

      const response = await axios.get(
        `${
          import.meta.env.VITE_API_URL
        }/file/get-documents?status=rejected-approved-correction&${queryParams}`,
        { withCredentials: true }
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
      (!searchTerm ||
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  // Handle Document Download
  const handleDownload = async (fileName) => {
    try {
      console.log("Downloading:", fileName);
      const downloadUrl = `${
        import.meta.env.VITE_API_URL
      }/file/download-pdf/${fileName}`;
      const response = await axios.get(downloadUrl, {
        withCredentials: true,
        responseType: "text",
      });

      // Decrypt the content
      const decrypted = CryptoJS.AES.decrypt(response.data, "mykey");
      const typedArray = convertWordArrayToUint8Array(decrypted);

      // Create blob and download
      const blob = new Blob([typedArray], { type: "application/pdf" });
      downloadBlob(blob, fileName.replace(".enc", ""));
    } catch (error) {
      console.error("Download error:", error);
    }
  };

  // Convert CryptoJS WordArray to Uint8Array
  const convertWordArrayToUint8Array = (wordArray) => {
    const len = wordArray.sigBytes;
    const words = wordArray.words;
    const uint8Array = new Uint8Array(len);
    let offset = 0;

    for (let i = 0; i < len; i += 4) {
      const word = words[i >>> 2];
      for (let j = 0; j < 4 && offset < len; ++j) {
        uint8Array[offset++] = (word >>> (24 - j * 8)) & 0xff;
      }
    }

    return uint8Array;
  };

  // Download Blob File
  const downloadBlob = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Handle Document Preview
  const handlePreview = async (fileName) => {
    try {
      console.log("Previewing:", fileName);
      const downloadUrl = `${
        import.meta.env.VITE_API_URL
      }/file/download-pdf/${fileName}`;
      const response = await axios.get(downloadUrl, {
        withCredentials: true,
        responseType: "text",
      });

      // Decrypt the content
      const decrypted = CryptoJS.AES.decrypt(response.data, "mykey");
      const typedArray = convertWordArrayToUint8Array(decrypted);

      // Create blob and generate preview URL
      const blob = new Blob([typedArray], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      return url;
    } catch (error) {
      console.error("Preview error:", error);
    }
  };
  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "text-green-700 bg-green-100 border border-green-500 px-2 py-1 rounded-md font-semibold";
      case "rejected":
        return "text-red-700 bg-red-100 border border-red-500 px-2 py-1 rounded-md font-semibold";
      case "correction":
        return "text-yellow-700 bg-yellow-100 border border-yellow-500 px-2 py-1 rounded-md font-semibold";
      default:
        return "text-gray-700 bg-gray-100 border border-gray-400 px-2 py-1 rounded-md font-medium";
    }
  };

  return (
    <div className="flex flex-col items-start justify-start flex-grow">
      <div className="w-full max-w-4xl bg-white shadow-lg border border-gray-200 rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">History</h2>
        {/* Search Section */}
        <div className="relative mb-6">
          <FaSearch className="absolute top-3 left-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search"
            className="w-full pl-10 pr-4 py-2 rounded-md bg-gray-100 text-gray-800 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {isLoading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 py-4">{error}</div>
        ) : (
          <>
            <div className="space-y-4">
              {filteredDocuments.length > 0 ? (
                filteredDocuments.map((doc) => (
                  <div
                    key={doc._id}
                    className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="flex-grow">
                      <h3
                        className="text-lg font-semibold w-fit text-gray-800 cursor-pointer"
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
                      >
                        {doc.title || "Untitled"}
                      </h3>
                      <div className="flex flex-wrap gap-4 mt-2">
                        <p className="text-sm text-gray-600">
                          Department:{" "}
                          {doc.department?.departmentName || "Unassigned"}
                        </p>
                        <p className="text-sm text-gray-600">
                          Created by: {doc.createdBy?.fullName || "Unknown"}
                        </p>
                        <span className="text-xs text-gray-400">
                          {new Date(doc.createdDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <p
                        className={`text-sm font-semibold ${getStatusColor(
                          doc.status
                        )}`}
                      >
                        {(doc.status || "Unknown").toUpperCase()}
                      </p>
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
                <div className="text-center py-8 text-gray-500">
                  No documents found
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DocumentsListHistory;
