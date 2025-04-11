import React, { createContext, useContext, useState, useRef } from "react";
import axios from "axios";
import forge from "node-forge";
import { toast } from "react-toastify";

const EncryptionContext = createContext();

export const EncryptionProvider = ({ children }) => {
    const [rsaKeyPair, setRsaKeyPair] = useState(null);
    const encKeyCache = useRef({}); // { fileId/userKey: decryptedKey }

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

    const getEncKeyForAssistant = async () => {
        const { publicKeyPem, privateKeyPem } = getOrGenerateKeys();
        const cacheKey = "self";

        if (encKeyCache.current[cacheKey]) {
            return encKeyCache.current[cacheKey];
        }

        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/file/get-enc-key`,
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

            encKeyCache.current[cacheKey] = decryptedKey;
            return decryptedKey;
        } catch (err) {
            toast.error("Failed to fetch your encryption key");
            console.error(err);
            return null;
        }
    };

    const getEncKeyForDoc = async (fileUniqueName) => {
        const { publicKeyPem, privateKeyPem } = getOrGenerateKeys();

        if (encKeyCache.current[fileUniqueName]) {
            return encKeyCache.current[fileUniqueName];
        }

        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/file/get-enc-key`,
                { clientPublicKey: publicKeyPem, fileUniqueName },
                { withCredentials: true }
            );

            const encryptedEncKey = response.data.encryptedEncKey;

            const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
            const decryptedKey = privateKey.decrypt(
                forge.util.decode64(encryptedEncKey),
                "RSA-OAEP",
                { md: forge.md.sha256.create() }
            );

            encKeyCache.current[fileUniqueName] = decryptedKey;
            return decryptedKey;
        } catch (err) {
            toast.error("Failed to fetch encryption key for document");
            console.error(err);
            return null;
        }
    };

    return (
        <EncryptionContext.Provider
            value={{
                getEncKeyForAssistant,
                getEncKeyForDoc,
            }}
        >
            {children}
        </EncryptionContext.Provider>
    );
};

export const useEncryption = () => useContext(EncryptionContext);
