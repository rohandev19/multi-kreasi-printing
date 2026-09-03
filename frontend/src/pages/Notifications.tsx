import { useEffect, useState } from 'react';
import { Bell, Check, Package, CreditCard, WarningCircle, Trash } from '@phosphor-icons/react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'order' | 'payment' | 'system' | 'alert';
  isRead: boolean;
  createdAt: string;
}

export const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching notifications
    setTimeout(() => {
      setNotifications([
        {
          id: '1',
          title: 'New Order Received',
          message: 'Order #ORD-2026-0089 has been placed and is waiting for approval.',
          type: 'order',
          isRead: false,
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          title: 'Payment Confirmed',
          message: 'Payment for Invoice #INV-2026-0045 has been verified.',
          type: 'payment',
          isRead: false,
          createdAt: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: '3',
          title: 'Low Material Stock',
          message: 'Premium Glossy Paper A4 is running low (below 500 sheets).',
          type: 'alert',
          isRead: true,
          createdAt: new Date(Date.now() - 86400000).toISOString()
        }
      ]);
      setLoading(false);
    }, 500);
  }, []);

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'order': return <Package className="text-primary-500" size={20} weight="regular" />;
      case 'payment': return <CreditCard className="text-emerald-500" size={20} weight="regular" />;
      case 'alert': return <WarningCircle className="text-amber-500" size={20} weight="regular" />;
      default: return <Bell className="text-slate-500" size={20} weight="regular" />;
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 172800) return 'Yesterday';
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-4 animate-pulse">
        <div className="h-10 w-48 bg-slate-200 rounded mb-8"></div>
        {[1, 2, 3].map(i => (
          <div key={i} className="h-24 bg-slate-200 rounded-xl"></div>
        ))}
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Notifications</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">You have {unreadCount} unread messages</p>
        </div>
        
        {unreadCount > 0 && (
          <button 
            onClick={markAllAsRead}
            className="flex items-center gap-2 text-sm font-bold text-primary-600 hover:text-primary-800 transition-colors px-4 py-2 rounded-lg hover:bg-primary-50"
          >
            <Check size={16} strokeWidth={2.5} weight="regular" />
            Mark all as read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-sm flex flex-col items-center">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 mb-4">
            <Bell size={32} weight="regular" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">You're all caught up!</h3>
          <p className="text-slate-500 font-medium">No new notifications right now.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map(notification => (
            <div 
              key={notification.id} 
              className={`bg-white rounded-xl p-5 border transition-all ${
                notification.isRead 
                  ? 'border-slate-100 shadow-sm' 
                  : 'border-primary-100 shadow-md shadow-primary-50/50 bg-primary-50/10'
              }`}
            >
              <div className="flex gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${notification.isRead ? 'bg-slate-50' : 'bg-white shadow-sm border border-primary-50'}`}>
                  {getIcon(notification.type)}
                </div>
                
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className={`font-bold ${notification.isRead ? 'text-slate-700' : 'text-slate-900'}`}>
                      {notification.title}
                    </h3>
                    <span className="text-xs font-semibold text-slate-400 ml-4 shrink-0">
                      {formatTime(notification.createdAt)}
                    </span>
                  </div>
                  <p className={`text-sm ${notification.isRead ? 'text-slate-500' : 'text-slate-600 font-medium'}`}>
                    {notification.message}
                  </p>
                </div>

                <div className="flex flex-col gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!notification.isRead && (
                    <button 
                      onClick={() => markAsRead(notification.id)}
                      className="p-1.5 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      title="Mark as read"
                    >
                      <Check size={16} weight="regular" />
                    </button>
                  )}
                  <button 
                    onClick={() => deleteNotification(notification.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash size={16} weight="regular" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
