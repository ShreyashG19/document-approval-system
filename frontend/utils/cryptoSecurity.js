import CryptoJS from "crypto-js";
import forge from "node-forge";
import axios from "axios";

export class CryptoService {
  constructor() {
    this.encKey = null;
  }

  setEncKey(key) {
    this.encKey = key;
  }

  async generateKeysAndRequestEncKey(apiUrl) {
    try {
      const keyPair = forge.pki.rsa.generateKeyPair({ bits: 2048, e: 0x10001 });
      const publicKeyPem = forge.pki.publicKeyToPem(keyPair.publicKey);
      const privateKeyPem = forge.pki.privateKeyToPem(keyPair.privateKey);

      const response = await axios.post(
        `${apiUrl}/file/get-enc-key`,
        { clientPublicKey: publicKeyPem },
        { withCredentials: true }
      );

      const encryptedEncKey = response.data.encryptedEncKey;
      const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
      const decryptedKey = privateKey.decrypt(
        forge.util.decode64(encryptedEncKey),
        "RSA-OAEP",
        { md: forge.md.sha256.create() }
      );

      this.encKey = decryptedKey;
      return true;
    } catch (error) {
      console.error("Key exchange failed:", error);
      throw error;
    }
  }

  async encryptFile(file) {
    if (!this.encKey) throw new Error("Encryption key not available");

    try {
      const arrayBuffer = await file.arrayBuffer();
      const wordArray = CryptoJS.lib.WordArray.create(arrayBuffer);
      const encrypted = CryptoJS.AES.encrypt(wordArray, this.encKey);
      return encrypted.toString();
    } catch (error) {
      console.error("File encryption failed:", error);
      throw error;
    }
  }

  decryptContent(encryptedContent) {
    if (!this.encKey) throw new Error("Encryption key not available");

    try {
      const decrypted = CryptoJS.AES.decrypt(encryptedContent, this.encKey);
      return this.convertWordArrayToUint8Array(decrypted);
    } catch (error) {
      console.error("Content decryption failed:", error);
      throw error;
    }
  }

  convertWordArrayToUint8Array(wordArray) {
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
  }

  getEncKey() {
    return this.encKey;
  }
}

export const fileUtils = {
  createPdfBlob(uint8Array) {
    return new Blob([uint8Array], { type: "application/pdf" });
  },

  downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  createPreviewUrl(blob) {
    return URL.createObjectURL(blob);
  },
};
