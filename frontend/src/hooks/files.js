// useFileHandlers.js
import { useEncryption } from "../contexts/EncryptionContext";
import axios from "axios";
import CryptoJS from "crypto-js";
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
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const useFileHandlers = () => {
  const { getEncKeyForDoc } = useEncryption();

  const handlePreview = async (fileName) => {
    try {
      const currentEncKey = await getEncKeyForDoc(fileName);
      const downloadUrl = `${import.meta.env.VITE_API_URL}/file/download-pdf/${fileName}`;
      const response = await axios.get(downloadUrl, {
        withCredentials: true,
        responseType: "text",
      });

      const decrypted = CryptoJS.AES.decrypt(response.data, currentEncKey);
      const typedArray = convertWordArrayToUint8Array(decrypted);

      const blob = new Blob([typedArray], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      return url;
    } catch (error) {
      console.error("Preview Error:", error);
      toast.error("Failed to preview document");
    }
  };

  const handleDownload = async (fileName) => {
    try {
      const currentEncKey = await getEncKeyForDoc(fileName);
      const downloadUrl = `${import.meta.env.VITE_API_URL}/file/download-pdf/${fileName}`;
      const response = await axios.get(downloadUrl, {
        withCredentials: true,
        responseType: "text",
      });

      const decrypted = CryptoJS.AES.decrypt(response.data, currentEncKey);
      const typedArray = convertWordArrayToUint8Array(decrypted);

      const blob = new Blob([typedArray], { type: "application/pdf" });
      downloadBlob(blob, fileName.replace(".enc", ""));
    } catch (error) {
      console.error("Download Error:", error);
      toast.error("Failed to download document");
    }
  };

  return { handlePreview, handleDownload };
};
