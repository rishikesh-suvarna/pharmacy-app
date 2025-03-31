import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  ShoppingBagIcon,
  CubeIcon,
  ShoppingCartIcon,
  UsersIcon,
  DocumentTextIcon,
  ChartBarIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';
import clsx from 'clsx';

type NavItemProps = {
  to: string;
  icon: React.ReactNode;
  text: string;
  onClick?: () => void;
};

const NavItem: React.FC<NavItemProps> = ({ to, icon, text, onClick }) => {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        clsx(
          'flex items-center space-x-2 p-3 rounded-md transition-colors',
          isActive
            ? 'bg-primary-700 text-white'
            : 'text-gray-300 hover:bg-primary-800 hover:text-white'
        )
      }
    >
      <div className="h-5 w-5">{icon}</div>
      <span>{text}</span>
    </NavLink>
  );
};

const DashboardLayout: React.FC = () => {
  const { user, logout, isAdmin, isPharmacist, isStaff } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const handleProfileClick = () => {
    navigate('/dashboard/profile');
    closeSidebar();
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar - Mobile Version */}
      <div
        className={clsx(
          'fixed inset-0 z-50 lg:hidden bg-gray-900 bg-opacity-50 transition-opacity duration-200',
          sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={toggleSidebar}
      >
        <div
          className={clsx(
            'fixed inset-y-0 left-0 w-64 bg-primary-900 transform transition-transform duration-200 ease-in-out',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-4 border-b border-primary-800">
            <h1 className="text-xl font-bold text-white">Pharmacy Admin</h1>
            <button
              className="text-gray-300 hover:text-white"
              onClick={toggleSidebar}
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="py-4 overflow-y-auto">
            <nav className="space-y-1 px-2">
              <NavItem
                to="/dashboard"
                icon={<HomeIcon />}
                text="Dashboard"
                onClick={closeSidebar}
              />
              <NavItem
                to="/dashboard/products"
                icon={<ShoppingBagIcon />}
                text="Products"
                onClick={closeSidebar}
              />
              <NavItem
                to="/dashboard/inventory"
                icon={<CubeIcon />}
                text="Inventory"
                onClick={closeSidebar}
              />
              <NavItem
                to="/dashboard/orders"
                icon={<ShoppingCartIcon />}
                text="Orders"
                onClick={closeSidebar}
              />
              {(isAdmin() || isPharmacist()) && (
                <NavItem
                  to="/dashboard/prescriptions"
                  icon={<DocumentTextIcon />}
                  text="Prescriptions"
                  onClick={closeSidebar}
                />
              )}
              {isAdmin() && (
                <NavItem
                  to="/dashboard/users"
                  icon={<UsersIcon />}
                  text="Users"
                  onClick={closeSidebar}
                />
              )}
              {(isAdmin() || isPharmacist() || isStaff()) && (
                <NavItem
                  to="/dashboard/reports"
                  icon={<ChartBarIcon />}
                  text="Reports"
                  onClick={closeSidebar}
                />
              )}
            </nav>
          </div>
        </div>
      </div>

      {/* Sidebar - Desktop Version */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="w-64 flex flex-col">
          <div className="bg-primary-900 h-full flex flex-col">
            <div className="flex items-center justify-center h-16 border-b border-primary-800">
              <h1 className="text-xl font-bold text-white">Pharmacy Admin</h1>
            </div>
            <div className="flex-1 flex flex-col overflow-y-auto py-4">
              <nav className="flex-1 space-y-1 px-2">
                <NavItem to="/dashboard" icon={<HomeIcon />} text="Dashboard" />
                <NavItem
                  to="/dashboard/products"
                  icon={<ShoppingBagIcon />}
                  text="Products"
                />
                <NavItem
                  to="/dashboard/inventory"
                  icon={<CubeIcon />}
                  text="Inventory"
                />
                <NavItem
                  to="/dashboard/orders"
                  icon={<ShoppingCartIcon />}
                  text="Orders"
                />
                {(isAdmin() || isPharmacist()) && (
                  <NavItem
                    to="/dashboard/prescriptions"
                    icon={<DocumentTextIcon />}
                    text="Prescriptions"
                  />
                )}
                {isAdmin() && (
                  <NavItem
                    to="/dashboard/users"
                    icon={<UsersIcon />}
                    text="Users"
                  />
                )}
                {(isAdmin() || isPharmacist() || isStaff()) && (
                  <NavItem
                    to="/dashboard/reports"
                    icon={<ChartBarIcon />}
                    text="Reports"
                  />
                )}
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm z-10">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <button
              className="lg:hidden h-10 w-10 flex items-center justify-center rounded-md text-gray-700 hover:text-gray-900 focus:outline-none"
              onClick={toggleSidebar}
            >
              <Bars3Icon className="h-6 w-6" />
            </button>

            <div className="ml-auto flex items-center">
              <div className="relative">
                <button
                  onClick={handleProfileClick}
                  className="flex items-center space-x-3 text-gray-700 hover:text-gray-900 focus:outline-none"
                >
                  <span className="hidden md:block text-sm font-medium">
                    {user?.first_name} {user?.last_name}
                  </span>
                  <UserCircleIcon className="h-8 w-8 text-gray-600" />
                </button>
              </div>

              <button
                onClick={handleLogout}
                className="ml-4 px-3 py-1.5 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto py-6 px-4 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;