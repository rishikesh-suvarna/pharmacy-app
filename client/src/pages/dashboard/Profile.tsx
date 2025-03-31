/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { UserCircleIcon } from '@heroicons/react/24/outline';

// Validation schema for profile update
const ProfileSchema = Yup.object().shape({
  first_name: Yup.string().required('First name is required'),
  last_name: Yup.string().required('Last name is required'),
  phone: Yup.string(),
  address: Yup.string(),
});

// Validation schema for password change
const PasswordSchema = Yup.object().shape({
  current_password: Yup.string().required('Current password is required'),
  new_password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('New password is required'),
  confirm_password: Yup.string()
    .oneOf([Yup.ref('new_password')], 'Passwords must match')
    .required('Confirm password is required'),
});

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleProfileUpdate = async (values: any) => {
    try {
      setProfileLoading(true);
      await api.put('/api/auth/profile', values);
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordChange = async (values: any, { resetForm }: any) => {
    try {
      setPasswordLoading(true);
      await api.post('/api/auth/change-password', {
        current_password: values.current_password,
        new_password: values.new_password,
      });
      toast.success('Password changed successfully');
      resetForm();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Your Profile</h1>
        <p className="text-gray-600 mt-1">Manage your account information and password</p>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-6 py-4 text-sm font-medium ${activeTab === 'profile'
                ? 'border-b-2 border-primary-500 text-primary-600'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              Profile Information
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`px-6 py-4 text-sm font-medium ${activeTab === 'password'
                ? 'border-b-2 border-primary-500 text-primary-600'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              Change Password
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'profile' ? (
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex flex-col items-center space-y-4 md:w-1/3">
                <div className="h-32 w-32 rounded-full bg-gray-200 flex items-center justify-center">
                  <UserCircleIcon className="h-28 w-28 text-gray-400" />
                </div>
                <div className="text-center">
                  <h2 className="text-xl font-medium text-gray-900">
                    {user.first_name} {user.last_name}
                  </h2>
                  <p className="text-gray-500">{user.email}</p>
                  <div className="mt-2">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-primary-100 text-primary-800">
                      {user.roles.join(', ')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="md:w-2/3">
                <Formik
                  initialValues={{
                    first_name: user.first_name || '',
                    last_name: user.last_name || '',
                    phone: user.phone || '',
                    address: user.address || '',
                  }}
                  validationSchema={ProfileSchema}
                  onSubmit={handleProfileUpdate}
                >
                  {({ isSubmitting, errors, touched }) => (
                    <Form className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="first_name" className="label">
                            First Name
                          </label>
                          <Field
                            id="first_name"
                            name="first_name"
                            type="text"
                            className={`input ${errors.first_name && touched.first_name
                              ? 'border-red-500'
                              : ''
                              }`}
                          />
                          <ErrorMessage
                            name="first_name"
                            component="div"
                            className="error"
                          />
                        </div>

                        <div>
                          <label htmlFor="last_name" className="label">
                            Last Name
                          </label>
                          <Field
                            id="last_name"
                            name="last_name"
                            type="text"
                            className={`input ${errors.last_name && touched.last_name
                              ? 'border-red-500'
                              : ''
                              }`}
                          />
                          <ErrorMessage
                            name="last_name"
                            component="div"
                            className="error"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="email" className="label">
                          Email Address
                        </label>
                        <input
                          id="email"
                          type="email"
                          value={user.email}
                          disabled
                          className="input bg-gray-50 cursor-not-allowed"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Email cannot be changed
                        </p>
                      </div>

                      <div>
                        <label htmlFor="phone" className="label">
                          Phone Number (Optional)
                        </label>
                        <Field
                          id="phone"
                          name="phone"
                          type="text"
                          className={`input ${errors.phone && touched.phone ? 'border-red-500' : ''
                            }`}
                        />
                        <ErrorMessage
                          name="phone"
                          component="div"
                          className="error"
                        />
                      </div>

                      <div>
                        <label htmlFor="address" className="label">
                          Address (Optional)
                        </label>
                        <Field
                          id="address"
                          name="address"
                          as="textarea"
                          rows={3}
                          className={`input ${errors.address && touched.address
                            ? 'border-red-500'
                            : ''
                            }`}
                        />
                        <ErrorMessage
                          name="address"
                          component="div"
                          className="error"
                        />
                      </div>

                      <div>
                        <button
                          type="submit"
                          disabled={isSubmitting || profileLoading}
                          className="btn btn-primary flex items-center justify-center"
                        >
                          {profileLoading ? (
                            <div className="h-5 w-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                          ) : null}
                          Save Changes
                        </button>
                      </div>
                    </Form>
                  )}
                </Formik>
              </div>
            </div>
          ) : (
            <div className="md:w-2/3 mx-auto">
              <h2 className="text-xl font-medium text-gray-900 mb-6">
                Change Your Password
              </h2>
              <Formik
                initialValues={{
                  current_password: '',
                  new_password: '',
                  confirm_password: '',
                }}
                validationSchema={PasswordSchema}
                onSubmit={handlePasswordChange}
              >
                {({ isSubmitting, errors, touched }) => (
                  <Form className="space-y-4">
                    <div>
                      <label htmlFor="current_password" className="label">
                        Current Password
                      </label>
                      <Field
                        id="current_password"
                        name="current_password"
                        type="password"
                        className={`input ${errors.current_password && touched.current_password
                          ? 'border-red-500'
                          : ''
                          }`}
                      />
                      <ErrorMessage
                        name="current_password"
                        component="div"
                        className="error"
                      />
                    </div>

                    <div>
                      <label htmlFor="new_password" className="label">
                        New Password
                      </label>
                      <Field
                        id="new_password"
                        name="new_password"
                        type="password"
                        className={`input ${errors.new_password && touched.new_password
                          ? 'border-red-500'
                          : ''
                          }`}
                      />
                      <ErrorMessage
                        name="new_password"
                        component="div"
                        className="error"
                      />
                    </div>

                    <div>
                      <label htmlFor="confirm_password" className="label">
                        Confirm New Password
                      </label>
                      <Field
                        id="confirm_password"
                        name="confirm_password"
                        type="password"
                        className={`input ${errors.confirm_password && touched.confirm_password
                          ? 'border-red-500'
                          : ''
                          }`}
                      />
                      <ErrorMessage
                        name="confirm_password"
                        component="div"
                        className="error"
                      />
                    </div>

                    <div>
                      <button
                        type="submit"
                        disabled={isSubmitting || passwordLoading}
                        className="btn btn-primary flex items-center justify-center"
                      >
                        {passwordLoading ? (
                          <div className="h-5 w-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                        ) : null}
                        Change Password
                      </button>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;