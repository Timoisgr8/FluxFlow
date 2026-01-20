// src/context/NotificationContext.jsx
import React, { createContext, useContext, useState } from "react";
import NotificationContainer from "../components/Notification/NotificationContainer";

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  const notify = ({ variant = "info", title, message, icon }) => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, variant, title, message, icon }]);
  };

  const removeNotification = (id) =>
    setNotifications((prev) => prev.filter((n) => n.id !== id));

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}
      <NotificationContainer
        notifications={notifications}
        removeNotification={removeNotification}
      />
    </NotificationContext.Provider>
  );
}

// custom hook (defined here instead of hooks/useNotification.js)
export function useNotification() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotification must be used within a NotificationProvider");
  return ctx;
}