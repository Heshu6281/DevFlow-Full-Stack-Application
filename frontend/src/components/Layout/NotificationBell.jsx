import { useEffect, useState } from 'react';
import { Bell, CheckCircle2, Info, AlertTriangle, CheckCheck } from 'lucide-react';
import { api } from '@/services/api';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await api.request('/notifications');

      setNotifications(response?.data || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load notifications.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  const markAsRead = async (notificationId) => {
    try {
      // Update UI immediately
      setNotifications((current) =>
        current.map((notification) =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );

      await api.request(
        `/notifications/${encodeURIComponent(notificationId)}/read`,
        {
          method: 'PUT',
        }
      );
    } catch (err) {
      // Reload actual state if API fails
      await loadNotifications();

      console.error('Failed to mark notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      // Update UI immediately
      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          read: true,
        }))
      );

      await api.request('/notifications/read-all', {
        method: 'PUT',
      });
    } catch (err) {
      await loadNotifications();

      console.error(
        'Failed to mark all notifications as read:',
        err
      );
    }
  };

  const getIcon = (type) => {
    if (type === 'success') {
      return (
        <CheckCircle2 className="h-4 w-4 text-green-500" />
      );
    }

    if (type === 'warning') {
      return (
        <AlertTriangle className="h-4 w-4 text-yellow-500" />
      );
    }

    return (
      <Info className="h-4 w-4 text-blue-500" />
    );
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => {
          setOpen((previous) => !previous);

          if (!open) {
            loadNotifications();
          }
        }}
        aria-label="Notifications"
        className="relative rounded-lg p-2 text-text-secondary transition-colors hover:bg-surface-2 hover:text-text-primary"
      >
        <Bell className="h-5 w-5" />

        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Close notifications"
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setOpen(false)}
          />

          <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border border-border bg-surface shadow-xl sm:w-96">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div>
                <h3 className="font-semibold text-text-primary">
                  Notifications
                </h3>

                <p className="text-xs text-text-secondary">
                  {unreadCount} unread notification
                  {unreadCount !== 1 ? 's' : ''}
                </p>
              </div>

              <div className="flex items-center gap-3">
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllAsRead}
                    className="flex items-center gap-1 text-xs font-medium text-accent hover:underline"
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                    Mark all read
                  </button>
                )}

                <button
                  type="button"
                  onClick={loadNotifications}
                  className="text-xs font-medium text-accent hover:underline"
                >
                  Refresh
                </button>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="space-y-3 p-4">
                  <div className="h-14 animate-pulse rounded-lg bg-surface-2" />
                  <div className="h-14 animate-pulse rounded-lg bg-surface-2" />
                  <div className="h-14 animate-pulse rounded-lg bg-surface-2" />
                </div>
              ) : error ? (
                <div className="p-6 text-center">
                  <p className="text-sm text-red-500">
                    {error}
                  </p>

                  <button
                    type="button"
                    onClick={loadNotifications}
                    className="mt-3 text-sm font-medium text-accent hover:underline"
                  >
                    Try again
                  </button>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="mx-auto h-8 w-8 text-text-secondary" />

                  <p className="mt-2 text-sm font-medium text-text-primary">
                    No notifications
                  </p>

                  <p className="mt-1 text-xs text-text-secondary">
                    You're all caught up.
                  </p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <button
                    type="button"
                    key={notification.id}
                    onClick={() => {
                      if (!notification.read) {
                        markAsRead(notification.id);
                      }
                    }}
                    className={`flex w-full gap-3 border-b border-border px-4 py-3 text-left last:border-b-0 hover:bg-surface-2 ${
                      !notification.read
                        ? 'bg-accent-soft/30'
                        : ''
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {getIcon(notification.type)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium text-text-primary">
                          {notification.title}
                        </p>

                        {!notification.read && (
                          <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-accent" />
                        )}
                      </div>

                      <p className="mt-1 text-xs text-text-secondary">
                        {notification.message}
                      </p>

                      <p className="mt-1 text-[11px] text-text-secondary">
                        {notification.time}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;