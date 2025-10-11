import React, { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { NotificationCenter } from './NotificationCenter';
import { 
  Users, 
  RefreshCw, 
  TrendingUp, 
  User, 
  Wallet,
  Home,
  Bell,
  Settings,
  LogOut
} from 'lucide-react';
import { PageType, useUser } from '../App';
import { useI18n } from '../utils/i18n';

interface NavigationProps {
  currentPage: PageType;
  onNavigate: (page: PageType) => void;
  onLogout?: () => void;
}

export function Navigation({ currentPage, onNavigate, onLogout }: NavigationProps) {
  const { user, wallet } = useUser();
  const { t } = useI18n();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const navItems = [
    { id: 'dashboard' as PageType, label: t('navigation.dashboard'), icon: Home },
    { id: 'hire' as PageType, label: t('navigation.hire'), icon: Users },
    { id: 'skillswap' as PageType, label: t('navigation.skillSwap'), icon: RefreshCw },
    { id: 'investment' as PageType, label: t('navigation.investment'), icon: TrendingUp },
  ];

  return (
    <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="bg-primary text-primary-foreground p-2 rounded-lg">
              <TrendingUp className="h-5 w-5" />
            </div>
            <h1 className="text-lg">{t('auth.welcome')}</h1>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant={currentPage === item.id ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onNavigate(item.id)}
                  className="gap-2"
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Button>
              );
            })}
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('wallet')}
              className="gap-2"
            >
              <Wallet className="h-4 w-4" />
              <span className="hidden sm:inline">
                {wallet ? `${wallet.money} TND` : t('navigation.wallet')}
              </span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setNotificationsOpen(true)}
              className="relative"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs">
                  {unreadCount}
                </Badge>
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('profile')}
              className="gap-2"
            >
              <Avatar className="h-6 w-6">
                <AvatarFallback>
                  {user ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
                </AvatarFallback>
                {user?.avatar && <AvatarImage src={user.avatar} />}
              </Avatar>
              <span className="hidden sm:inline">
                {user ? user.name.split(' ')[0] : t('navigation.profile')}
              </span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('settings')}
              className="text-muted-foreground"
            >
              <Settings className="h-4 w-4" />
            </Button>

            {onLogout && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onLogout}
                className="text-muted-foreground"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden mt-3 flex items-center space-x-1 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant={currentPage === item.id ? "default" : "ghost"}
                size="sm"
                onClick={() => onNavigate(item.id)}
                className="gap-2 whitespace-nowrap"
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Button>
            );
          })}
        </div>
      </div>
      
      {/* Notifications Modal */}
      <NotificationCenter 
        isOpen={notificationsOpen} 
        onClose={() => setNotificationsOpen(false)}
        onUnreadCountChange={setUnreadCount}
      />
    </header>
  );
}