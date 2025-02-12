import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { FaDownload, FaSearch } from "react-icons/fa";
import CryptoJS from "crypto-js";
import { fileUtils, CryptoService } from "../../utils/cryptoSecurity";
import forge from "node-forge";
import { getStatusColor } from "../../utils/statusColors";

const DocumentsListHistory = ({
  status,
  department,
  startDate,
  endDate,
  handleTitleClick,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [encKey, setEncKey] = useState(null);

  const [cryptoService] = useState(() => {
    const service = new CryptoService();
    if (encKey) service.encKey = encKey;
    return service;
  });
  useEffect(() => {
    if (encKey) {
      cryptoService.encKey = encKey;
    }
  }, [encKey, cryptoService]);

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

  // Convert CryptoJS WordArray to Uint8Array
  const generateKeysAndRequestEncKey = async (fileUniqueName) => {
    try {
      if (!fileUniqueName) {
        throw new Error("File unique name is required");
      }

      // Generate RSA Key Pair
      const keyPair = forge.pki.rsa.generateKeyPair({ bits: 2048, e: 0x10001 });
      const publicKeyPem = forge.pki.publicKeyToPem(keyPair.publicKey);
      const privateKeyPem = forge.pki.privateKeyToPem(keyPair.privateKey);

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

      const downloadUrl = `${
        import.meta.env.VITE_API_URL
      }/file/download-pdf/${fileName}`;
      const response = await axios.get(downloadUrl, {
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

      const downloadUrl = `${
        import.meta.env.VITE_API_URL
      }/file/download-pdf/${fileName}`;
      const response = await axios.get(downloadUrl, {
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
  // Download Blob File

  // Handle Document Preview
 
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
