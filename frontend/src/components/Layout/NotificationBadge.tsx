import React, { useState, useEffect } from 'react';
import { api } from "../../services/api";
import { useLocation } from 'react-router-dom';

interface NotificationBadgeProps {
  className?: string;
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({ className = "" }) => {
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const location = useLocation();

  const fetchUnreadCount = async () => {
    try {
      const response = await api.get("/notifications/unread/");
      setUnreadCount(response.data.length);
    } catch (error) {
      console.error("Error fetching unread notifications:", error);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    // const interval = setInterval(fetchUnreadCount, 30000);

    // return () => clearInterval(interval);
  }, []);

  if (unreadCount === 0) return null;

  if (location.pathname === '/notifications') return null;

  return (
    <span className={`bg-red-500 text-white text-xs font-bold rounded-full px-2 py-1 ${className}`}>
      {unreadCount}
    </span>
  );
};

export default NotificationBadge;
