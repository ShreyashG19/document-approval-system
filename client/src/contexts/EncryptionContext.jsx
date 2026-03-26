import React, { createContext, useContext, useState, useRef } from "react";
import forge from "node-forge";
import { fileService } from "../services/fileService";
import toast from "react-hot-toast";

const EncryptionContext = createContext(null);

export const useEncryption = () => {
  const ctx = useContext(EncryptionContext);
  if (!ctx)
    throw new Error("useEncryption must be used within EncryptionProvider");
  return ctx;
};

export const EncryptionProvider = ({ children }) => {
  const [rsaKeyPair, setRsaKeyPair] = useState(null);
  const encKeyCache = useRef({});

  const generateRSAKeyPair = () => {
    const keyPair = forge.pki.rsa.generateKeyPair({ bits: 2048, e: 0x10001 });
    const publicKeyPem = forge.pki.publicKeyToPem(keyPair.publicKey);
    const privateKeyPem = forge.pki.privateKeyToPem(keyPair.privateKey);
    setRsaKeyPair({ publicKeyPem, privateKeyPem });
    return { publicKeyPem, privateKeyPem };
  };

  const getOrGenerateKeys = () => {
    return rsaKeyPair || generateRSAKeyPair();
  };

  const decryptEncKey = (encryptedEncKey, privateKeyPem) => {
    const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
    return privateKey.decrypt(forge.util.decode64(encryptedEncKey), "RSA-OAEP", {
      md: forge.md.sha256.create(),
    });
  };

  const getEncKeyForAssistant = async () => {
    const { publicKeyPem, privateKeyPem } = getOrGenerateKeys();
    const cacheKey = "self";

    if (encKeyCache.current[cacheKey]) {
      return encKeyCache.current[cacheKey];
    }

    try {
      const resp = await fileService.getEncKey(publicKeyPem);
      const encKeyData = resp.data?.encryptedEncKey || resp.encryptedEncKey;
      const decryptedKey = decryptEncKey(encKeyData, privateKeyPem);
      encKeyCache.current[cacheKey] = decryptedKey;
      return decryptedKey;
    } catch (err) {
      toast.error("Failed to fetch encryption key");
      console.error(err);
      return null;
    }
  };

  const getEncKeyForDoc = async (fileUniqueName) => {
    const { publicKeyPem, privateKeyPem } = getOrGenerateKeys();

    if (fileUniqueName && encKeyCache.current[fileUniqueName]) {
      return encKeyCache.current[fileUniqueName];
    }

    try {
      const resp = await fileService.getEncKey(publicKeyPem, fileUniqueName);
      const encKeyData = resp.data?.encryptedEncKey || resp.encryptedEncKey;
      const decryptedKey = decryptEncKey(encKeyData, privateKeyPem);
      if (fileUniqueName) {
        encKeyCache.current[fileUniqueName] = decryptedKey;
      }
      return decryptedKey;
    } catch (err) {
      toast.error("Failed to fetch encryption key for document");
      console.error(err);
      return null;
    }
  };

  return (
    <EncryptionContext.Provider
      value={{ getEncKeyForAssistant, getEncKeyForDoc }}
    >
      {children}
    </EncryptionContext.Provider>
  );
};
