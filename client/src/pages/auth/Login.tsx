import React from 'react';
import { Link } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../contexts/AuthContext';

// Validation schema using Yup
const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

const Login: React.FC = () => {
  const { login, loading } = useAuth();

  return (
    <div>
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
        Sign In to Your Account
      </h2>

      <Formik
        initialValues={{ email: '', password: '' }}
        validationSchema={LoginSchema}
        onSubmit={async (values) => {
          await login(values.email, values.password);
        }}
      >
        {({ isSubmitting, errors, touched }) => (
          <Form className="space-y-4">
            <div>
              <label htmlFor="email" className="label">
                Email Address
              </label>
              <Field
                id="email"
                name="email"
                type="email"
                className={`input ${errors.email && touched.email ? 'border-red-500' : ''
                  }`}
                placeholder="you@example.com"
              />
              <ErrorMessage
                name="email"
                component="div"
                className="error"
              />
            </div>

            <div>
              <div className="flex justify-between">
                <label htmlFor="password" className="label">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-primary-600 hover:text-primary-800"
                >
                  Forgot password?
                </Link>
              </div>
              <Field
                id="password"
                name="password"
                type="password"
                className={`input ${errors.password && touched.password ? 'border-red-500' : ''
                  }`}
                placeholder="••••••••"
              />
              <ErrorMessage
                name="password"
                component="div"
                className="error"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting || loading}
                className="btn btn-primary w-full flex justify-center items-center"
              >
                {loading ? (
                  <div className="h-5 w-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                ) : null}
                Sign In
              </button>
            </div>
          </Form>
        )}
      </Formik>

      <div className="text-center mt-6">
        <p className="text-sm text-gray-600">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="font-medium text-primary-600 hover:text-primary-800"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;