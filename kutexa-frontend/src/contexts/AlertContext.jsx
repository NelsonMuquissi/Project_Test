import { createContext, useContext, useState } from "react";
import '../styles/alert.css'; // CSS atualizado com prefixo

const AlertContext = createContext();

export function AlertProvider({ children }) {
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("error");

  const showNotification = (message, type = "error") => {
    setAlertMessage(message);
    setAlertType(type);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 5000);
  };

  const closeAlert = () => setShowAlert(false);

  return (
    <AlertContext.Provider value={{ showNotification }}>
      {children}

      {/* ALERT GLOBAL */}
      {showAlert && (
        <div className={`alert-global-notification ${alertType}`}>
          <div className="alert-global-content">
            <span className="alert-global-icon">
              {alertType === "success"
                ? "✓"
                : alertType === "warning"
                ? "⚠"
                : "✕"}
            </span>
            <span className="alert-global-message">{alertMessage}</span>
            <button className="alert-global-close" onClick={closeAlert}>
              ×
            </button>
          </div>
          <div className="alert-global-progress"></div>
        </div>
      )}
    </AlertContext.Provider>
  );
}

export const useAlert = () => useContext(AlertContext);
