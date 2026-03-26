import CryptoJS from "crypto-js";
import { useEncryption } from "../contexts/EncryptionContext";
import { fileService } from "../services/fileService";
import toast from "react-hot-toast";

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

export const useFileHandlers = () => {
  const { getEncKeyForAssistant, getEncKeyForDoc } = useEncryption();

  const handlePreview = async (fileName) => {
    try {
      const encKey = await getEncKeyForDoc(fileName);
      if (!encKey) throw new Error("Encryption key not available");

      const encryptedData = await fileService.downloadPdf(fileName);
      const decrypted = CryptoJS.AES.decrypt(encryptedData, encKey);
      const typedArray = convertWordArrayToUint8Array(decrypted);

      const blob = new Blob([typedArray], { type: "application/pdf" });
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error("Preview Error:", error);
      toast.error("Failed to preview document");
      return null;
    }
  };

  const handleDownload = async (fileName) => {
    try {
      const encKey = await getEncKeyForDoc(fileName);
      if (!encKey) throw new Error("Encryption key not available");

      const encryptedData = await fileService.downloadPdf(fileName);
      const decrypted = CryptoJS.AES.decrypt(encryptedData, encKey);
      const typedArray = convertWordArrayToUint8Array(decrypted);

      const blob = new Blob([typedArray], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName.replace(".enc", "");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download Error:", error);
      toast.error("Failed to download document");
    }
  };

  const handleUpload = async ({
    file,
    department,
    title,
    description = "",
    onSuccess = () => {},
    onError = () => {},
  }) => {
    if (!file || !department || !title) {
      toast.error("Please fill all required fields");
      return;
    }

    const toastId = toast.loading("Encrypting & uploading...");

    try {
      const encKey = await getEncKeyForAssistant();
      if (!encKey) throw new Error("Encryption key not available");

      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const fileContent = e.target.result;
          const wordArray = CryptoJS.lib.WordArray.create(fileContent);
          const encrypted = CryptoJS.AES.encrypt(wordArray, encKey).toString();

          const blob = new Blob([encrypted], { type: "text/plain" });
          const formData = new FormData();
          formData.append("pdfFile", new File([blob], `${file.name}.enc`));
          formData.append("department", department);
          formData.append("title", title);
          formData.append("description", description);

          await fileService.uploadPdf(formData);

          toast.dismiss(toastId);
          toast.success("Document uploaded successfully");
          onSuccess();
        } catch (err) {
          toast.dismiss(toastId);
          toast.error("Encryption or upload failed");
          console.error("Upload error:", err);
          onError(err);
        }
      };

      reader.onerror = () => {
        toast.dismiss(toastId);
        toast.error("Failed to read file");
      };

      reader.readAsArrayBuffer(file);
    } catch (err) {
      toast.dismiss(toastId);
      toast.error("Error uploading document");
      console.error("Upload error:", err);
      onError(err);
    }
  };

  return { handlePreview, handleDownload, handleUpload };
};
