import React, { useState, useEffect, useContext } from "react"; // ⬅️ Added useContext
import axios from "axios";
import { toast } from "react-hot-toast";
import { FaDownload } from "react-icons/fa";
import { fileUtils } from "../../utils/cryptoSecurity";
import { CryptoContext } from "../contexts/CryptoContext"; // ⬅️ Importing CryptoContext

const DocumentsList = ({ status, department, startDate, endDate, searchQuery, handleTitleClick }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [documents, setDocuments] = useState([]);

  // ⬇️ Used Context API instead of passing encKey as a prop
  const { cryptoService, encKey } = useContext(CryptoContext); // ⬅️ Now using encKey from context

  useEffect(() => {
    fetchDocuments();
  }, [status, department, startDate, endDate, searchQuery]); // ⬅️ Added missing dependencies

  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const queryParams = new URLSearchParams();
      if (status && status !== "all") queryParams.append("status", status);
      if (department) queryParams.append("department", department);
      if (startDate) queryParams.append("startDate", startDate);
      if (endDate) queryParams.append("endDate", endDate);
      if (searchQuery) queryParams.append("search", searchQuery);

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/file/get-documents?${queryParams.toString()}`,
        { withCredentials: true }
      );

      if (response.data.status && response.data.documents) {
        setDocuments(response.data.documents);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch documents");
      toast.error("Failed to load documents");
      setDocuments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (fileName) => {
    try {
      if (!encKey) { // ⬅️ Previously checked for encKey as a prop, now using Context
        toast.error("Encryption key not available");
        return;
      }

      const downloadUrl = `${import.meta.env.VITE_API_URL}/file/download-pdf/${fileName}`;
      const response = await axios.get(downloadUrl, {
        withCredentials: true,
        responseType: "text",
      });

      const decryptedData = cryptoService.decryptContent(response.data); // ⬅️ Used cryptoService from Context
      const blob = fileUtils.createPdfBlob(decryptedData);
      fileUtils.downloadBlob(blob, fileName.replace(".enc", ""));
    } catch (error) {
      toast.error("Failed to download document");
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
          <div className="space-y-4">
            {documents.length > 0 ? (
              documents.map((doc) => (
                <div key={doc._id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all">
                  <div className="flex-grow">
                    <h3
                      className="text-lg font-semibold w-fit text-gray-800 cursor-pointer"
                      onClick={() => handleDownload(doc.fileUniqueName)}
                    >
                      {doc.title || "Untitled"}
                    </h3>
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
              <div className="text-center py-8 text-gray-500">No documents found</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentsList;
