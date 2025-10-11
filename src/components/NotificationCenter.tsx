import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { 
  Bell, 
  Check, 
  X, 
  Clock, 
  Users, 
  RefreshCw, 
  TrendingUp, 
  DollarSign,
  CheckCircle,
  AlertCircle,
  Info,
  Settings
} from 'lucide-react';
import { useI18n } from '../utils/i18n';
import { useUser } from '../App';
import { toast } from 'sonner@2.0.3';
import { notificationsApi, Notification as ApiNotification } from '../utils/api';

interface LocalNotification {
  id: string;
  type: 'job' | 'skill' | 'investment' | 'payment' | 'system' | 'message';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
  actionUrl?: string;
  actionText?: string;
}

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  onUnreadCountChange?: (count: number) => void;
}

export function NotificationCenter({ isOpen, onClose, onUnreadCountChange }: NotificationCenterProps) {
  const { t } = useI18n();
  const { user } = useUser();
  const [notifications, setNotifications] = useState<LocalNotification[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && isOpen) {
      loadNotifications();
    }
  }, [user, isOpen]);

  // Update parent component with unread count whenever notifications change
  useEffect(() => {
    const unreadCount = notifications.filter(n => !n.read).length;
    onUnreadCountChange?.(unreadCount);
  }, [notifications, onUnreadCountChange]);

  const loadNotifications = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Try to load from API first
      try {
        const response = await notificationsApi.getNotifications(user.id);
        const apiNotifications = response.notifications.map((notif: ApiNotification): LocalNotification => ({
          id: notif.id,
          type: mapApiTypeToLocal(notif.type),
          title: notif.title,
          message: notif.message,
          timestamp: notif.createdAt,
          read: notif.read,
          priority: 'medium' // API notifications don't have priority, so default to medium
        }));
        
        setNotifications(apiNotifications);
      } catch (apiError) {
        console.log('API notifications not available, showing sample data');
        
        // Fallback to sample notifications for demo
        const sampleNotifications: LocalNotification[] = [
          {
            id: '1',
            type: 'job',
            title: 'New Job Application',
            message: 'Sarah Johnson applied to your "Website Development" project',
            timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
            read: false,
            priority: 'high'
          },
          {
            id: '2',
            type: 'payment',
            title: 'Payment Received',
            message: 'You received 250 TND for completing the logo design project',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
            read: false,
            priority: 'high'
          },
          {
            id: '3',
            type: 'skill',
            title: 'Skill Swap Match',
            message: 'Ahmed Ben Ali wants to exchange Arabic lessons for your web development skills',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
            read: true,
            priority: 'medium'
          },
          {
            id: '4',
            type: 'investment',
            title: 'Investment Update',
            message: 'Your investment in "Local Coffee Shop" has grown by 15%',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
            read: true,
            priority: 'medium'
          }
        ];
        
        setNotifications(sampleNotifications);
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
      toast.error(t('notifications.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const mapApiTypeToLocal = (apiType: string): LocalNotification['type'] => {
    switch (apiType) {
      case 'success': return 'payment';
      case 'warning': return 'system';
      case 'error': return 'system';
      default: return 'system';
    }
  };

  const markAsRead = async (id: string) => {
    if (!user) return;
    
    try {
      await notificationsApi.markAsRead(user.id, id);
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === id ? { ...notif, read: true } : notif
        )
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      // Still update locally for demo purposes
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === id ? { ...notif, read: true } : notif
        )
      );
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;
    
    try {
      await notificationsApi.markAllAsRead(user.id);
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true }))
      );
      toast.success(t('notifications.markReadSuccess'));
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      // Still update locally for demo purposes
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true }))
      );
      toast.success(t('notifications.markReadSuccess'));
    }
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
    toast.success(t('notifications.deleteSuccess'));
  };

  const getNotificationIcon = (type: LocalNotification['type']) => {
    switch (type) {
      case 'job':
        return <Users className="h-4 w-4" />;
      case 'skill':
        return <RefreshCw className="h-4 w-4" />;
      case 'investment':
        return <TrendingUp className="h-4 w-4" />;
      case 'payment':
        return <DollarSign className="h-4 w-4" />;
      case 'system':
        return <Settings className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getNotificationColor = (type: LocalNotification['type'], priority: LocalNotification['priority']) => {
    if (priority === 'high') return 'text-red-500 bg-red-500/10';
    if (type === 'payment') return 'text-green-500 bg-green-500/10';
    if (type === 'job') return 'text-blue-500 bg-blue-500/10';
    if (type === 'skill') return 'text-purple-500 bg-purple-500/10';
    if (type === 'investment') return 'text-orange-500 bg-orange-500/10';
    return 'text-gray-500 bg-gray-500/10';
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return t('notifications.justNow');
    if (diffInMinutes < 60) return `${diffInMinutes}${t('notifications.minutesAgo')}`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}${t('notifications.hoursAgo')}`;
    return `${Math.floor(diffInMinutes / 1440)}${t('notifications.daysAgo')}`;
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-16">
      <Card className="w-full max-w-md mx-4 max-h-[80vh] flex flex-col shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 flex-shrink-0">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            {t('navigation.notifications')}
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-xs"
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                {t('notifications.markAllRead')}
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <Separator className="flex-shrink-0" />
        
        <CardContent className="flex-1 p-0 overflow-hidden">
          <ScrollArea className="h-full max-h-[55vh]">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center px-4">
                <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">{t('notifications.noNotifications')}</p>
                <p className="text-sm text-muted-foreground">
                  {t('notifications.noNotificationsDesc')}
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {notifications.map((notification, index) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-muted/50 transition-colors ${
                      !notification.read ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''
                    } ${index === notifications.length - 1 ? 'border-b-0' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg flex-shrink-0 ${getNotificationColor(notification.type, notification.priority)}`}>
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1 gap-2">
                          <h4 className="text-sm font-medium truncate flex-1">
                            {notification.title}
                          </h4>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {!notification.read && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => markAsRead(notification.id)}
                                className="h-6 w-6 p-0"
                              >
                                <Check className="h-3 w-3" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteNotification(notification.id)}
                              className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-2 break-words">
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTimeAgo(notification.timestamp)}
                          </span>
                          
                          {notification.priority === 'high' && (
                            <Badge variant="destructive" className="text-xs">
                              {t('notifications.highPriority')}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}