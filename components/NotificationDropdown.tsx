'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Bell, User, Check, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  data?: {
    mangaId: any;
    chapterId?: any;
    fromUser?: any;
  };
}

export default function NotificationDropdown() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (session?.user?.id) {
      fetchNotifications();
      // Poll for new notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/notifications?limit=10');
      
      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }
      
      const data = await response.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.notifications?.filter((n: Notification) => !n.isRead).length || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    // Close the dropdown
    setIsOpen(false);
    
    // Navigate to the manga page with comment section anchor
    if (notification.data?.mangaId) {
      let mangaId: string | null = null;
      
      // Handle both populated object and string ID cases
      if (typeof notification.data.mangaId === 'string') {
        mangaId = notification.data.mangaId;
      } else if (notification.data.mangaId?._id) {
        mangaId = notification.data.mangaId._id;
      }
      
      if (mangaId) {
        const mangaUrl = `/manga/${mangaId}#comments`;
        router.push(mangaUrl);
        
        // Add smooth scrolling after navigation
        setTimeout(() => {
          const commentsSection = document.getElementById('comments');
          if (commentsSection) {
            commentsSection.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      }
    }
  };

  const handleNotificationAction = async (notificationIds: string[], action: 'mark_read' | 'mark_unread' | 'delete') => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notificationIds,
          action,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update notifications');
      }

      // Update local state
      setNotifications(prev => prev.map(notification => {
        if (notificationIds.includes(notification._id)) {
          if (action === 'delete') {
            return null;
          }
          return {
            ...notification,
            isRead: action === 'mark_read' ? true : action === 'mark_unread' ? false : notification.isRead,
          };
        }
        return notification;
      }).filter(Boolean) as Notification[]);

      // Update unread count
      if (action === 'mark_read') {
        setUnreadCount(prev => Math.max(0, prev - notificationIds.length));
      } else if (action === 'mark_unread') {
        setUnreadCount(prev => prev + notificationIds.length);
      } else if (action === 'delete') {
        // Recalculate unread count after deletion
        setUnreadCount(notifications.filter(n => !n.isRead && !notificationIds.includes(n._id)).length);
      }

      toast.success(`Notifications ${action.replace('_', ' ')} successfully`);
    } catch (error) {
      console.error('Error updating notifications:', error);
      toast.error('Failed to update notifications');
    }
  };

  const markAllAsRead = () => {
    const unreadIds = notifications.filter(n => !n.isRead).map(n => n._id);
    if (unreadIds.length > 0) {
      handleNotificationAction(unreadIds, 'mark_read');
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Vừa xong';
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} giờ trước`;
    return `${Math.floor(diffInMinutes / 1440)} ngày trước`;
  };

  if (!session?.user?.id) {
    return null;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-dark-600 hover:text-purple-600 transition-colors duration-200 w-full flex items-center justify-center"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="notification-dropdown">
          {/* Header */}
          <div className="notification-header">
            <span>Thông báo</span>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded transition-colors duration-200"
                >
                  Đánh dấu tất cả đã đọc
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white transition-colors duration-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-400 overflow-y-auto custom-scrollbar">
            {loading ? (
              <div className="p-4 text-center text-dark-600">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto"></div>
                <p className="mt-2">Đang tải...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-dark-600">
                <Bell className="h-12 w-12 mx-auto mb-2 text-dark-400" />
                <p>Không có thông báo nào</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="notification-content">
                    <img
                      src={notification.data?.fromUser?.avatar || '/medusa.ico'}
                      alt="User"
                      className="notification-avatar"
                    />
                    <div className="notification-text">
                      <div className="notification-title">{notification.title}</div>
                      <div className="notification-message">{notification.message}</div>
                      <div className="notification-time">{formatTime(notification.createdAt)}</div>
                    </div>
                  </div>
                  
                  <div className="notification-actions">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNotificationAction([notification._id], notification.isRead ? 'mark_unread' : 'mark_read');
                      }}
                      className={`notification-action-btn ${notification.isRead ? 'mark-unread' : 'mark-read'}`}
                    >
                      {notification.isRead ? 'Đánh dấu chưa đọc' : 'Đánh dấu đã đọc'}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNotificationAction([notification._id], 'delete');
                      }}
                      className="notification-action-btn delete"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
