import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';

// Validation schema
const ForgotPasswordSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
});

const ForgotPassword: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (values: { email: string }) => {
    try {
      setLoading(true);
      console.log('Sending password reset email to:', values.email);

      // In a real application, you would send a request to the backend to 
      // initiate the password reset process.
      // await axios.post('/api/auth/forgot-password', { email: values.email });

      // For this demo, we'll simulate the API call with a timeout
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast.success('Password reset instructions sent to your email!');
      setSubmitted(true);
    } catch (error) {
      console.log('Error sending password reset email:', error);
      toast.error('Failed to send password reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Check Your Email
        </h2>
        <p className="text-gray-600 mb-6">
          We've sent password reset instructions to your email address.
          Please check your inbox.
        </p>
        <Link
          to="/login"
          className="btn btn-primary inline-block"
        >
          Back to Login
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
        Forgot Your Password?
      </h2>
      <p className="text-center text-gray-600 mb-6">
        Enter your email address and we'll send you instructions to reset your password.
      </p>

      <Formik
        initialValues={{ email: '' }}
        validationSchema={ForgotPasswordSchema}
        onSubmit={handleSubmit}
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
              <button
                type="submit"
                disabled={isSubmitting || loading}
                className="btn btn-primary w-full flex justify-center items-center"
              >
                {loading ? (
                  <div className="h-5 w-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                ) : null}
                Send Reset Instructions
              </button>
            </div>
          </Form>
        )}
      </Formik>

      <div className="text-center mt-6">
        <p className="text-sm text-gray-600">
          Remember your password?{' '}
          <Link
            to="/login"
            className="font-medium text-primary-600 hover:text-primary-800"
          >
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;