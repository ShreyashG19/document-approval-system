import React, { createContext, useContext, useState } from 'react';

const NotificationContext = createContext<any>(null);

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [fcmToken, setFcmToken] = useState('');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  return (
    <NotificationContext.Provider
      value={{ fcmToken, setFcmToken, notifications, setNotifications, unreadCount, setUnreadCount }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
