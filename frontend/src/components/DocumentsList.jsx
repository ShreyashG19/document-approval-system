import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { FaDownload } from "react-icons/fa";
import CryptoJS from "crypto-js";

const DocumentsList = ({
  status,
  department,
  startDate,
  endDate,
  searchQuery,
  handleTitleClick, encKey
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [documents, setDocuments] = useState([]);

  // Fetch Documents from API
  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const queryParams = new URLSearchParams();
      if (status && status !== "all") queryParams.append("status", status);
      if (department) queryParams.append("department", department);

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL
        }/file/get-documents?${queryParams.toString()}`,
        { withCredentials: true }
      );

      if (response.data.status && response.data.documents) {
        setDocuments(response.data.documents);
        console.log(documents)
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
      (!searchQuery || doc.title.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  // Handle Document Download
  const handleDownload = async (fileName) => {
    try {
      if (!encKey) {
        toast.error('Encryption key not available');
        return;
      }

      console.log("Downloading:", fileName);
      const downloadUrl = `${import.meta.env.VITE_API_URL}/file/download-pdf/${fileName}`;
      const response = await axios.get(downloadUrl, {
        withCredentials: true,
        responseType: "text",
      });

      // Decrypt the content using the secure key
      const decrypted = CryptoJS.AES.decrypt(response.data, encKey);
      const typedArray = convertWordArrayToUint8Array(decrypted);

      // Create blob and download 
      const blob = new Blob([typedArray], { type: "application/pdf" });
      downloadBlob(blob, fileName.replace(".enc", ""));
    } catch (error) {
      console.error("Download error:", error);
      toast.error('Failed to download document');
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
      const downloadUrl = `${import.meta.env.VITE_API_URL
        }/file/download-pdf/${fileName}`;
      const response = await axios.get(downloadUrl, {
        withCredentials: true,
        responseType: "text",
      });

      // Decrypt the content
      const decrypted = CryptoJS.AES.decrypt(response.data, encKey);
      const typedArray = convertWordArrayToUint8Array(decrypted);

      // Create blob and generate preview URL
      const blob = new Blob([typedArray], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      return url;
    } catch (error) {
      console.error("Preview error:", error);
    }
  };

  return (
    <div className="flex items-start justify-start flex-grow">
      <div className="w-full max-w-4xl bg-white shadow-lg border border-gray-200 rounded-lg p-6">
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
                            status: doc.status
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

export default DocumentsList;
