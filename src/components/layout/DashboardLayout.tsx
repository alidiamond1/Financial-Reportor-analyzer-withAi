'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { 
  HomeIcon,
  DocumentArrowUpIcon,
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';

interface DashboardLayoutProps {
  children: React.ReactNode;
  currentPage?: string;
}

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  href?: string;
  active?: boolean;
  onClick?: () => void;
  badge?: string;
}

function NavItem({ icon, label, href, active, onClick, badge }: NavItemProps) {
  const router = useRouter();
  const baseClasses = "flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200";
  const activeClasses = active 
    ? "bg-blue-50 text-blue-700 border border-blue-200" 
    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 border border-transparent";

  const content = (
    <>
      <span className="flex-shrink-0">{icon}</span>
      <span className="flex-1 text-left">{label}</span>
      {badge && (
        <span className="bg-blue-100 text-blue-600 text-xs px-2 py-0.5 rounded-full font-medium">
          {badge}
        </span>
      )}
    </>
  );

  const handleClick = () => {
    if (href) {
      router.push(href);
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <button onClick={handleClick} className={`${baseClasses} ${activeClasses} w-full`}>
      {content}
    </button>
  );
}

export function DashboardLayout({ children, currentPage }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();

  const navigation = [
    {
      label: 'Dashboard',
      icon: <HomeIcon className="h-5 w-5" />,
      href: '/dashboard',
      active: currentPage === 'dashboard'
    },
    {
      label: 'Upload Files',
      icon: <DocumentArrowUpIcon className="h-5 w-5" />,
      href: '/dashboard/upload',
      active: currentPage === 'upload'
    },
    {
      label: 'Analysis',
      icon: <ChartBarIcon className="h-5 w-5" />,
      href: '/dashboard/analysis',
      active: currentPage === 'analysis'
    },
    {
      label: 'AI Chat',
      icon: <ChatBubbleLeftRightIcon className="h-5 w-5" />,
      href: '/dashboard/chat',
      active: currentPage === 'chat',
      badge: user?.role === 'user' ? 'Pro' : undefined
    }
  ];

  const handleLogout = async () => {
    if (confirm('Are you sure you want to log out?')) {
      await logout();
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-white shadow-lg transition-transform lg:static lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Sidebar header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ChartBarIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="font-semibold text-gray-900 text-sm">Financial Analyzer</h1>
              <p className="text-xs text-gray-500">AI-Powered Platform</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-500"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => (
            <NavItem
              key={item.label}
              icon={item.icon}
              label={item.label}
              href={item.href}
              active={item.active}
              badge={item.badge}
            />
          ))}
        </nav>

        {/* User section */}
        <div className="flex-shrink-0 p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3 mb-3">
            <UserCircleIcon className="h-8 w-8 text-gray-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.name || 'User'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.email}
              </p>
            </div>
          </div>
          
          <div className="space-y-1">
            <NavItem
              icon={<CogIcon className="h-5 w-5" />}
              label="Settings"
              href="/dashboard/settings"
              active={currentPage === 'settings'}
            />
            <NavItem
              icon={<ArrowRightOnRectangleIcon className="h-5 w-5" />}
              label="Log Out"
              onClick={handleLogout}
            />
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top navigation bar */}
        <header className="flex h-16 items-center justify-between bg-white shadow-sm border-b border-gray-200 px-4 lg:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          
          <div className="flex items-center space-x-4 ml-auto">
            <div className="text-sm text-gray-600 hidden sm:block">
              Welcome back, {user?.name}!
            </div>
            
            {/* Subscription badge */}
            <div className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
              Free Plan
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 lg:p-6">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}