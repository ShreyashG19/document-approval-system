import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import CryptoJS from "crypto-js";
import { toast } from "react-toastify";
import { useEncryption } from "../contexts/EncryptionContext";
import { Download, Maximize2, Minimize2 } from "lucide-react";
import { useFileHandlers } from "../hooks/files";

const PdfViewer = () => {
  const { fileName } = useParams();
  const [fileUrl, setFileUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [documentName, setDocumentName] = useState("");

  const { getEncKeyForDoc } = useEncryption();
  const navigate = useNavigate();
  const { handleDownload } = useFileHandlers();

  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  const isMobile = windowWidth < 768;

  const pdfWidth = isFullScreen ? "100%" : isMobile ? "100%" : "800px";
  const pdfHeight = isFullScreen
    ? `${windowHeight - 60}px`
    : isMobile
    ? "500px"
    : "700px";

  useEffect(() => {
    if (fileName) {
      const nameWithoutExtension = fileName.split(".")[0];
      const formattedName = nameWithoutExtension
        .replace(/-/g, " ")
        .replace(/_/g, " ")
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
      setDocumentName(formattedName);
    }

    const fetchPdf = async () => {
      try {
        const encKey = await getEncKeyForDoc(fileName);
        const downloadUrl = `${
          import.meta.env.VITE_API_URL
        }/file/download-pdf/${fileName}`;

        const loadingToastId = toast.info("Loading your document...", {
          autoClose: false,
        });

        const response = await axios.get(downloadUrl, {
          withCredentials: true,
          responseType: "text",
        });

        const decrypted = CryptoJS.AES.decrypt(response.data, encKey);
        const typedArray = convertWordArrayToUint8Array(decrypted);

        const blob = new Blob([typedArray], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        setFileUrl(url);
        setLoading(false);

        toast.dismiss(loadingToastId);
        toast.success("Document loaded successfully");

        // 🚀 If mobile, open PDF directly with fallback
        if (isMobile) {
          const newTab = window.open(url, "_blank");

          if (
            !newTab ||
            newTab.closed ||
            typeof newTab.closed === "undefined"
          ) {
            // 🚨 Popup blocked or failed to open
            console.warn("Popup blocked. Redirecting user...");
            window.location.href = url;
          }
        }
      } catch (error) {
        console.error("Preview Error:", error);
        toast.error("Failed to preview document");
        setLoading(false);
      }
    };

    fetchPdf();

    return () => {
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl);
      }
    };
  }, [fileName]);

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

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  const downloadPdf = () => {
    if (!fileUrl) return;
    handleDownload(fileName);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-700 text-lg">Loading your document...</p>
      </div>
    );
  }

  // ✅ If mobile, we already opened it, show a simple message
  if (isMobile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <p className="text-gray-700 text-lg text-center">
          Document opened in a new tab.
        </p>
      </div>
    );
  }

  // ✅ Otherwise Desktop iframe
  return (
    <div
      className={`transition-all duration-300 ${
        isFullScreen ? "fixed inset-0 z-50 bg-white" : "p-4"
      }`}
    >
      {/* Header */}
      <div
        className={`flex items-center justify-between mb-4 ${
          isFullScreen ? "px-4 py-2 border-b" : ""
        }`}
      >
        <div className="flex items-center">
          <h1 className="text-xl font-semibold text-white truncate max-w-xs md:max-w-md">
            {documentName || "Document Viewer"}
          </h1>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={downloadPdf}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
            aria-label="Download PDF"
          >
            <Download size={20} />
          </button>
          <button
            onClick={toggleFullScreen}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            aria-label={isFullScreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {isFullScreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
          </button>
        </div>
      </div>

      {/* PDF iframe */}
      <div
        className={`bg-gray-100 rounded-lg shadow-md overflow-hidden mx-auto ${
          isFullScreen ? "w-full h-full" : "max-w-4xl"
        }`}
      >
        {fileUrl && (
          <iframe
            src={fileUrl}
            width={pdfWidth}
            height={pdfHeight}
            frameBorder="0"
            title="PDF Viewer"
            className="w-full border-0"
          ></iframe>
        )}
      </div>
    </div>
  );
};

export default PdfViewer;
