import React, { createContext, useContext, useState } from "react";
import { notificationService } from "../services/notificationService";

const NotificationContext = createContext(null);

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx)
    throw new Error(
      "useNotifications must be used within NotificationProvider"
    );
  return ctx;
};

export const NotificationProvider = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [fcmToken, setFcmToken] = useState("");

  const fetchNotifications = async () => {
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data.data.notifications || []);
      setUnreadCount(data.data.notifications?.length || 0);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markSeen();
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };

  const incrementCount = () => setUnreadCount((prev) => prev + 1);
  const resetCount = () => setUnreadCount(0);

  return (
    <NotificationContext.Provider
      value={{
        unreadCount,
        notifications,
        fcmToken,
        setFcmToken,
        fetchNotifications,
        markAllAsRead,
        incrementCount,
        resetCount,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
