/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';
import { Link } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../contexts/AuthContext';

// Validation schema
const RegisterSchema = Yup.object().shape({
  first_name: Yup.string().required('First name is required'),
  last_name: Yup.string().required('Last name is required'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  confirm_password: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Confirm password is required'),
  phone: Yup.string(),
  address: Yup.string(),
});

const Register: React.FC = () => {
  const { register, loading } = useAuth();

  return (
    <div>
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
        Create Your Account
      </h2>

      <Formik
        initialValues={{
          first_name: '',
          last_name: '',
          email: '',
          password: '',
          confirm_password: '',
          phone: '',
          address: '',
        }}
        validationSchema={RegisterSchema}
        onSubmit={async (values) => {
          const { confirm_password, ...registerData } = values;
          await register(registerData);
        }}
      >
        {({ isSubmitting, errors, touched }) => (
          <Form className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="first_name" className="label">
                  First Name
                </label>
                <Field
                  id="first_name"
                  name="first_name"
                  type="text"
                  className={`input ${errors.first_name && touched.first_name ? 'border-red-500' : ''
                    }`}
                  placeholder="John"
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
                  className={`input ${errors.last_name && touched.last_name ? 'border-red-500' : ''
                    }`}
                  placeholder="Doe"
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
              <label htmlFor="password" className="label">
                Password
              </label>
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
              <label htmlFor="confirm_password" className="label">
                Confirm Password
              </label>
              <Field
                id="confirm_password"
                name="confirm_password"
                type="password"
                className={`input ${errors.confirm_password && touched.confirm_password ? 'border-red-500' : ''
                  }`}
                placeholder="••••••••"
              />
              <ErrorMessage
                name="confirm_password"
                component="div"
                className="error"
              />
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
                placeholder="+1 (555) 123-4567"
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
                className={`input ${errors.address && touched.address ? 'border-red-500' : ''
                  }`}
                placeholder="Your address"
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
                disabled={isSubmitting || loading}
                className="btn btn-primary w-full flex justify-center items-center"
              >
                {loading ? (
                  <div className="h-5 w-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                ) : null}
                Register
              </button>
            </div>
          </Form>
        )}
      </Formik>

      <div className="text-center mt-6">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-medium text-primary-600 hover:text-primary-800"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;