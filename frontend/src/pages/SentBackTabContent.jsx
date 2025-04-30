import React, { useState, useEffect } from "react";
import { FaSearch } from "react-icons/fa";
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
import { fileUtils, CryptoService } from "../../utils/cryptoSecurity";
import forge from "node-forge";
import { getStatusColor } from "../../utils/statusColors";

import CryptoJS from "crypto-js";
import { FaEye, FaDownload } from "react-icons/fa";
const SentBackTabContent = ({
  handleTitleClick,
  setfileUnName,
  setRemark,
  setDescription,
}) => {
  const [encKey, setEncKey] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filteredData, setFilteredData] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [category, setCategory] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRemarkModalOpen, setIsRemarkModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [cryptoService] = useState(() => {
    const service = new CryptoService();
    if (encKey) service.encKey = encKey;
    return service;
  });

  // const [remark, setRemark] = useState("");
  const resetFilters = () => {
    setSearchQuery("");
    setStartDate("");
    setEndDate("");
    setCategory("");
    toast.success("Filters reset successfully");
  };

  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const queryParams = new URLSearchParams();
      queryParams.append("status", "rejected-correction");

      if (category) {
        queryParams.append("department", category);
      }
      if (startDate) {
        queryParams.append("startDate", startDate);
      }
      if (endDate) {
        queryParams.append("endDate", endDate);
      }
      const token = localStorage.getItem("token");
      if(!token) throw new Error("Token not found. Please log in again.");

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/file/get-documents?${queryParams}`,
        {headers:{"Authorization": `Bearer ${token}`}},
        { withCredentials: true }
      );

      console.log("API Response:", response.data);

      if (response.data.status && response.data.documents) {
        setFilteredData(response.data.documents);
        console.log("Filtered Data:", response.data.documents);
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
  }, [category, startDate, endDate]);
  const fetchDepartments = async () => {
    try {
      const token = localStorage.getItem("token");
      if(!token) throw new Error("Token not found. Please log in again.");
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/department/get-all-departments`,
        {headers:{"Authorization": `Bearer ${token}`}},
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

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedDocument(null);
  };

  const openRemarkModal = (document) => {
    setSelectedDocument(document);
    setIsRemarkModalOpen(true);
  };

  const closeRemarkModal = () => {
    setIsRemarkModalOpen(false);
    setSelectedDocument(null);
  };

  const handleRemarkSubmit = () => {
    console.log("Remark submitted:", remark);
    closeRemarkModal();
  };
  useEffect(() => {
    if (encKey) {
      cryptoService.setEncKey(encKey);
    }
  }, [encKey, cryptoService]);
  // Add the handleDownload function before the return statement
  const generateKeysAndRequestEncKey = async (fileUniqueName) => {
    try {
      if (!fileUniqueName) {
        throw new Error("File unique name is required");
      }

      // Generate RSA Key Pair
      const keyPair = forge.pki.rsa.generateKeyPair({ bits: 2048, e: 0x10001 });
      const publicKeyPem = forge.pki.publicKeyToPem(keyPair.publicKey);
      const privateKeyPem = forge.pki.privateKeyToPem(keyPair.privateKey);
      const token = localStorage.getItem("token");
      if(!token) throw new Error("Token not found. Please log in again.");

      // Send Public Key to Server
      const responseUrl = `${import.meta.env.VITE_API_URL}/file/get-enc-key`;
      const response = await axios.post(
        responseUrl,
        {
          clientPublicKey: publicKeyPem,
          fileUniqueName: fileUniqueName,
        },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        }
      );

      const encryptedEncKey = response.data.encryptedEncKey;

      // Decrypt the encKey using Private Key
      const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
      const decryptedKey = privateKey.decrypt(
        forge.util.decode64(encryptedEncKey),
        "RSA-OAEP",
        { md: forge.md.sha256.create() }
      );

      setEncKey(decryptedKey);
      console.log("Successfully received and decrypted encryption key");
      return decryptedKey;
    } catch (error) {
      console.error("Error in key exchange:", error);
      toast.error("Failed to establish secure connection");
      throw error;
    }
  };
  const handleDownload = async (fileName) => {
    try {
      if (!cryptoService.getEncKey()) {
        toast.error("Encryption key not available");
        return;
      }
      const token = localStorage.getItem("token");
      if(!token) throw new Error("Token not found. Please log in again.");

      const downloadUrl = `${
        import.meta.env.VITE_API_URL
      }/file/download-pdf/${fileName}`;
      const response = await axios.get(downloadUrl, {headers: {"Authorization": `Bearer: ${token}`}}, {
        withCredentials: true,
        responseType: "text",
      });

      const decryptedData = cryptoService.decryptContent(response.data);
      const blob = fileUtils.createPdfBlob(decryptedData);
      fileUtils.downloadBlob(blob, fileName.replace(".enc", ""));
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download document");
    }
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
        {headers:{"Authorization": `Bearer ${token}`}},
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
        {headers:{"Authorization": `Bearer ${token}`}},
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

  const handlePreview = async (fileName) => {
    try {
      // Check for encryption key and try to get it if not available
      if (!cryptoService.getEncKey()) {
        try {
          await generateKeysAndRequestEncKey(fileName);
        } catch (keyError) {
          toast.error("Failed to get encryption key");
          return null;
        }
      }
      const token = localStorage.getItem("token");
      if(!token) throw new Error("Token not found. Please log in again.");

      const downloadUrl = `${
        import.meta.env.VITE_API_URL
      }/file/download-pdf/${fileName}`;
      const response = await axios.get(downloadUrl,  {headers: {"Authorization": `Bearer: ${token}`},
        withCredentials: true,
        responseType: "text",
      });

      const decryptedData = cryptoService.decryptContent(response.data);
      const blob = fileUtils.createPdfBlob(decryptedData);
      return fileUtils.createPreviewUrl(blob);
    } catch (error) {
      console.error("Preview error:", error);
      toast.error("Failed to preview document");
      return null;
    }
  };
  const filterDocuments = (documents, query) => {
    if (!query) return documents;

    return documents.filter((doc) => {
      const searchString = `${doc.title} ${
        doc.department?.departmentName || ""
      } ${doc.createdBy?.fullName || ""} ${
        doc.createdBy?.username || ""
      }`.toLowerCase();
      return searchString.includes(query.toLowerCase());
    });
  };
  return (
    <div className="flex flex-col font-sans space-y-6 p-4">
      {/* Search Section */}
      <Toaster />
      <div className="relative">
        <FaSearch className="absolute top-3 left-3 text-gray-400" />
        <input
          type="text"
          placeholder="Search"
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-md bg-gray-100 text-gray-800 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col space-y-2 tracking-tight scale-90 sm:flex-row sm:space-y-0 sm:space-x-4">
        <select
          value={category}
          onChange={(e) => {
            const newCategory = e.target.value;
            setCategory(newCategory);
          }}
          className="flex-1 px-4 py-2 rounded-md bg-gray-200 text-gray-700 border border-gray-300"
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
        <input
          type="date"
          className="flex-1 px-4 py-2 rounded-md bg-gray-200 text-gray-700 border border-gray-300"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <input
          type="date"
          className="flex-1 px-4 py-2 rounded-md bg-gray-200 text-gray-700 border border-gray-300"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
        <button
          onClick={fetchDocuments}
          className="flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-md shadow-md hover:bg-blue-600 transition"
        >
          <IoMdRefresh className="h-5 w-5" />
        </button>
        <button
          onClick={resetFilters}
          className="px-4 py-2 bg-gray-500 text-white rounded-md shadow-md hover:bg-gray-600 transition"
          disabled={isLoading}
        >
          Reset Filters
        </button>
      </div>

      {/* Documents */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center">
            <ClipLoader size={35} color={"#123abc"} loading={isLoading} />
          </div>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : filteredData.length === 0 ? (
          <p className="text-gray-500 font-thin text-center text-lg ">
            No documents found
          </p>
        ) : (
          filterDocuments(filteredData, searchQuery).map((item) => (
            <div
              key={item._id}
              className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-100 p-4 rounded-md shadow-md border border-gray-300"
            >
              <div className="flex items-start sm:items-center space-x-4 flex-grow">
                <div className="w-10 h-10 bg-gray-200 flex items-center justify-center rounded-md">
                  📄
                </div>
                <div className="flex flex-col flex-grow">
                  <h3
                    className="text-xl font-bold tracking-tight font-open-sans text-gray-800 cursor-pointer"
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
                  <div className="flex flex-col sm:flex-row sm:space-x-4">
                    <span className="text-[13px] font-light text-gray-800">
                      <span className="font-semibold">Department:</span>{" "}
                      {item.department?.departmentName || "Unassigned"}
                    </span>
                    <span className="text-[13px] font-light text-gray-800">
                      <span className="font-semibold">Created By:</span>{" "}
                      {item.createdBy?.fullName || "Unknown"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{item.date}</p>
                </div>
              </div>

              <div className="flex space-x-4 items-center">
                <p
                  className={`text-sm font-semibold ${getStatusColor(
                    item.status
                  )}`}
                >
                  {(item.status || "Unknown").toUpperCase()}
                </p>

                <FaEye
                  className="h-6 w-6 text-gray-800 cursor-pointer hover:text-blue-500"
                  onClick={async () => {
                    const url = await handlePreview(item.fileUniqueName);
                    setfileUnName(item.fileUniqueName);
                    setDescription(
                      item.description || "No description available"
                    );
                    setRemark(item.remark || "No remarks available");
                    console.log("remark", item.remark);
                    console.log("description", item.description);
                    handleTitleClick(url, item);
                  }}
                />
                <FaDownload
                  className="h-6 w-6 text-gray-800 cursor-pointer hover:text-blue-500"
                  onClick={() => handleDownload(item.fileUniqueName)}
                />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal for PDF display */}
      {isModalOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 transition-opacity duration-300 ease-in-out"
          onClick={closeModal}
        >
          <div
            className="bg-white p-4 sm:p-6 rounded-lg shadow-lg w-full max-w-3xl mx-2 sm:mx-4 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h2 className="text-2xl font-semibold text-gray-800">
                {selectedDocument?.title}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <AiOutlineClose className="h-6 w-6" />
              </button>
            </div>

            {/* PDF Viewer Placeholder */}
            <div className="flex items-center justify-center h-64 bg-gray-100 rounded-md mb-4 border border-gray-300">
              <p className="text-center text-gray-500">PDF content goes here</p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap justify-end gap-2">
              <button
                onClick={() => handleApprove(selectedDocument.fileUniqueName)}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-md shadow-md hover:bg-green-600 transition"
              >
                <AiOutlineCheck className="h-5 w-5" />
                Approve
              </button>

              <button
                onClick={() => handleReject(selectedDocument.fileUniqueName)}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-md shadow-md hover:bg-red-600 transition"
              >
                <AiOutlineCloseCircle className="h-5 w-5" />
                Reject
              </button>

              <button
                className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-md shadow-md hover:bg-yellow-600 transition"
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
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 transition-opacity duration-300 ease-in-out"
          onClick={closeRemarkModal}
        >
          <div
            className="bg-white p-4 sm:p-6 rounded-lg shadow-lg w-full max-w-md mx-2 sm:mx-4 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h2 className="text-2xl font-semibold text-gray-800">
                Give Remark
              </h2>
              <button
                onClick={closeRemarkModal}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <AiOutlineClose className="h-6 w-6" />
              </button>
            </div>

            {/* Remark Input */}
            <textarea
              className="w-full p-2 border border-gray-300 bg-white resize-none text-black text-lg rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
              rows="4"
              placeholder="Enter your remark here..."
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
            ></textarea>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 mt-4">
              <button
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md shadow-md hover:bg-gray-400 transition"
                onClick={closeRemarkModal}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded-md shadow-md hover:bg-blue-600 transition"
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

export default SentBackTabContent;
