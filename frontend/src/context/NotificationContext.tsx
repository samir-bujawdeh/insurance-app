import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { listNotifications } from '../api/notifications';

interface Notification {
  id: number;
  is_read: boolean;
}

interface NotificationContextType {
  unreadCount: number;
  refreshNotifications: () => Promise<void>;
  markAsRead: (notificationId: number) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Shared mock data to match NotificationsScreen
const mockNotifications: Notification[] = [
  { id: 1, is_read: false },
  { id: 2, is_read: false },
  { id: 3, is_read: true },
  { id: 4, is_read: true },
  { id: 5, is_read: true },
];

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [unreadCount, setUnreadCount] = useState(2); // Default to 2 unread from mock data
  const [readStatus, setReadStatus] = useState<Set<number>>(new Set([3, 4, 5])); // Track which IDs are read

  const refreshNotifications = async () => {
    try {
      const notifications = await listNotifications();
      // Use shared mock data since API returns empty array
      const notificationsToUse = notifications.length > 0 ? notifications : mockNotifications;
      // Apply read status to mock data
      const notificationsWithReadStatus = notificationsToUse.map((n: any) => ({
        ...n,
        is_read: n.is_read || readStatus.has(n.id)
      }));
      const unread = notificationsWithReadStatus.filter((n: any) => !n.is_read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error("Error loading notifications:", error);
      // Use mock data on error, apply read status
      const unread = mockNotifications.filter((n: any) => !readStatus.has(n.id)).length;
      setUnreadCount(unread);
    }
  };

  const markAsRead = (notificationId: number) => {
    // Update local read tracking first
    let wasAlreadyRead = false;
    setReadStatus(prev => {
      if (prev.has(notificationId)) {
        wasAlreadyRead = true;
        return prev;
      }
      const next = new Set(prev);
      next.add(notificationId);
      return next;
    });

    // Optimistically bump the unread count down immediately to avoid race with refresh
    if (!wasAlreadyRead) {
      setUnreadCount(prev => (prev > 0 ? prev - 1 : 0));
    }

    // Then refresh from source to reconcile (uses updated readStatus on next render)
    refreshNotifications();
  };

  useEffect(() => {
    refreshNotifications();
    // Refresh every 30 seconds
    const interval = setInterval(refreshNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <NotificationContext.Provider value={{ unreadCount, refreshNotifications, markAsRead }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

