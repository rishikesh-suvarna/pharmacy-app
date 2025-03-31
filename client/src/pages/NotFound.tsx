import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const NotFound: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center px-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-primary-600">404</h1>
        <h2 className="text-3xl font-bold text-gray-800 mt-4">Page Not Found</h2>
        <p className="text-lg text-gray-600 mt-2">
          The page you are looking for does not exist.
        </p>
        <div className="mt-8">
          <Link
            to={user ? '/dashboard' : '/'}
            className="btn btn-primary inline-flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            {user ? 'Back to Dashboard' : 'Back to Home'}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;