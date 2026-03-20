import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';

export const VerifyEmailPage = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [countdown, setCountdown] = useState(5);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyToken = async () => {
      try {
        await api.get(`/api/v1/auth/verify-email/${token}`);
        setStatus('success');
      } catch (err: any) {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Verification failed. The token may be invalid or expired.');
      }
    };
    if (token) {
      verifyToken();
    } else {
      setStatus('error');
      setMessage('No verification token provided.');
    }
  }, [token]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (status === 'success') {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            navigate('/login');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [status, navigate]);

  return (
    <div className="min-h-[60vh] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-sm border border-gray-100 text-center">
        {status === 'loading' && (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-900">Verifying Email...</h2>
            <p className="text-gray-500 mt-2">Please wait while we verify your email address.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center">
            <CheckCircleIcon className="h-16 w-16 text-green-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900">Email Verified!</h2>
            <p className="text-gray-500 mt-2">Your account has been successfully verified.</p>
            <p className="text-indigo-600 font-medium mt-6">
              Redirecting to login in {countdown} seconds...
            </p>
            <Link
              to="/login"
              className="mt-6 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Go to Login Now
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center">
            <XCircleIcon className="h-16 w-16 text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900">Verification Failed</h2>
            <p className="text-gray-500 mt-2">{message}</p>
            <div className="mt-8 flex flex-col space-y-3 w-full">
              <Link
                to="/login"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Go to Login
              </Link>
              {/* Optional: Add a button to request a new verification email if we implement that endpoint */}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
