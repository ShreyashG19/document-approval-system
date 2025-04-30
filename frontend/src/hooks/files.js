// useFileHandlers.js
import axios from "axios";
import { toast } from "react-toastify";

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

const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

export const useFileHandlers = () => {
  const handleUpload = async ({
    file,
    department,
    title,
    description = "",
    onSuccess = () => {},
  }) => {
    const toastId = toast.loading("Uploading document...");

    if (!file || !department || !title) {
      toast.dismiss(toastId);
      toast.error("Please fill all required fields");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("pdfFile", file);
      formData.append("department", department);
      formData.append("title", title);
      formData.append("description", description);

      const uploadUrl = `${import.meta.env.VITE_API_URL}/file/upload-pdf`;
      const response = await axios.post(uploadUrl, formData, {
        withCredentials: true,
      });

      toast.dismiss(toastId);
      toast.success("Document uploaded successfully");
      onSuccess();
    } catch (err) {
      toast.dismiss(toastId);
      toast.error("Error uploading document");
      console.error("Upload error:", err);
    }
  };

  const handleDownload = async (fileName) => {
    try {
      const downloadUrl = `${
        import.meta.env.VITE_API_URL
      }/file/download-pdf/${fileName}`;
      const response = await axios.get(downloadUrl, {
        withCredentials: true,
        responseType: "blob", // Expect binary data (PDF)
      });

      const blob = new Blob([response.data], { type: "application/pdf" });
      downloadBlob(blob, fileName);
    } catch (error) {
      console.error("Download Error:", error);
      toast.error("Failed to download document");
    }
  };

  const handlePreview = async (fileName) => {
    try {
      const downloadUrl = `${
        import.meta.env.VITE_API_URL
      }/file/download-pdf/${fileName}`;
      const response = await axios.get(downloadUrl, {
        withCredentials: true,
        responseType: "blob", // Receive as binary PDF
      });

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      return url;
    } catch (error) {
      console.error("Preview Error:", error);
      toast.error("Failed to preview document");
    }
  };

  return {
    handlePreview,
    handleDownload,
    handleUpload,
  };
};
