import { useCallback, useEffect, useState } from 'react';

import type { Notification } from '../src/types';

const POLL_INTERVAL_MS = 30_000;

export interface UseNotificationsResult {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => Promise<void>;
  refetch: () => Promise<void>;
}

/**
 * Single source of truth for `/api/notifications`.
 * Pass `enabled=false` (e.g. when the user is logged out) to disable polling.
 */
export function useNotifications(enabled: boolean): UseNotificationsResult {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications');
      if (!response.ok) return;
      const json = await response.json();
      const notes: Notification[] = json.data ?? json;
      const sorted = [...notes].sort((a, b) => b.createdAt - a.createdAt);
      setNotifications(sorted);
      setUnreadCount(sorted.filter((n) => !n.read).length);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    fetchNotifications();
    const interval = setInterval(fetchNotifications, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [enabled, fetchNotifications]);

  const markAsRead = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
      if (!response.ok) return;
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read', error);
    }
  }, []);

  return { notifications, unreadCount, markAsRead, refetch: fetchNotifications };
}
