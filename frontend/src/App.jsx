import React, { useEffect, useState } from "react";
import AppRoutes from "./routes/AppRoutes";
import { EncryptionProvider } from "./contexts/EncryptionContext";

const App = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  const handleInstall = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(() => {
        setDeferredPrompt(null);
      });
    }
  };

  return (
    <EncryptionProvider>
      {deferredPrompt && (
        <button
          onClick={handleInstall}
          style={{ position: "fixed", bottom: 20, right: 20 }}
        >
          Install App
        </button>
      )}
      <AppRoutes />
    </EncryptionProvider>
  );
};

export default App;
