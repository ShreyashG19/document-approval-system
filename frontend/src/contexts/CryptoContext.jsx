import React, { createContext, useState, useEffect } from "react";
import { CryptoService } from  "../../utils/cryptoSecurity";

export const CryptoContext = createContext();

export const CryptoProvider = ({ children }) => {
  const [cryptoService] = useState(new CryptoService());
  const [encKey, setEncKey] = useState(null);

  useEffect(() => {
    const generateKeyIfNeeded = async () => {
      if (!encKey) {
        const generatedKey = await cryptoService.generateKeysAndRequestEncKey();
        setEncKey(generatedKey);
      }
    };
    generateKeyIfNeeded();
  }, [encKey]);

  return (
    <CryptoContext.Provider value={{ cryptoService, encKey, setEncKey }}>
      {children}
    </CryptoContext.Provider>
  );
};
