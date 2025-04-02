import React, { createContext, useState, useEffect } from "react";
import { CryptoService } from "../../utils/cryptoSecurity";

export const CryptoContext = createContext();

export const CryptoProvider = ({ children }) => {
  const [cryptoService] = useState(new CryptoService());
  const [encKey, setEncKey] = useState(null);

  useEffect(() => {
    const generateKeyIfNeeded = async () => {
      if (!encKey) {
        try {
          const apiUrl = import.meta.env.VITE_API_URL;
          await cryptoService.initialize(apiUrl);
          setEncKey(cryptoService.getEncKey());
        } catch (error) {
          console.error("Encryption key initialization failed:", error);
        }
      }
    };
    generateKeyIfNeeded();
  }, [encKey, cryptoService]);

  return (
    <CryptoContext.Provider value={{ cryptoService, encKey, setEncKey }}>
      {children}
    </CryptoContext.Provider>
  );
};
