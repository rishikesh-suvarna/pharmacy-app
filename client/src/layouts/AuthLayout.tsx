import React from 'react';
import { Outlet } from 'react-router-dom';

const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-primary-600">Pharmacy Admin</h1>
          <p className="text-gray-600 mt-2">Manage your pharmacy efficiently</p>
        </div>
        <div className="bg-white p-8 rounded-lg shadow-md">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;