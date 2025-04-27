import React from "react";
import AppRoutes from "./routes/AppRoutes";
import { EncryptionProvider } from "./contexts/EncryptionContext";

const App = () => {
  return (
    <>
      <EncryptionProvider>
        <AppRoutes />
      </EncryptionProvider>
    </>
  );
};

export default App;
