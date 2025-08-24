'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { Mail, Loader2, ArrowLeft, CheckCircle, XCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });

  // Auto-hide notifications after 5 seconds
  useEffect(() => {
    if (notification.type) {
      const timer = setTimeout(() => {
        setNotification({ type: null, message: '' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const showNotification = useCallback((type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      showNotification('error', 'Please enter your email address');
      return;
    }

    setLoading(true);
    setNotification({ type: null, message: '' }); // Clear any existing notifications

    try {
      console.log('Sending password reset request for:', email);
      
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      console.log('Response received:', response.status, response.statusText);

      // Check if response is ok before trying to parse JSON
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      let data;
      try {
        data = await response.json();
        console.log('Response data:', data);
      } catch (parseError) {
        console.error('Failed to parse response:', parseError);
        throw new Error('Invalid response from server');
      }

      // Success case
      setSubmitted(true);
      showNotification('success', 'Password reset link sent to your email!');
      
    } catch (error) {
      console.error('Forgot password error:', error);
      
      // Handle specific error types
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          showNotification('error', 'Network error. Please check your connection.');
        } else if (error.message.includes('HTTP error')) {
          showNotification('error', 'Server error. Please try again later.');
        } else {
          showNotification('error', error.message || 'An error occurred. Please try again.');
        }
      } else {
        showNotification('error', 'An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetForm = useCallback(() => {
    setSubmitted(false);
    setEmail('');
    setLoading(false);
    setNotification({ type: null, message: '' });
  }, []);

  // Notification component
  const NotificationBanner = () => {
    if (!notification.type) return null;

    const bgColor = notification.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200';
    const textColor = notification.type === 'success' ? 'text-green-800' : 'text-red-800';
    const icon = notification.type === 'success' ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />;

    return (
      <div className={`fixed top-4 right-4 z-50 p-4 border rounded-lg shadow-lg ${bgColor} ${textColor} max-w-sm`}>
        <div className="flex items-center space-x-2">
          {icon}
          <span className="font-medium">{notification.message}</span>
          <button
            onClick={() => setNotification({ type: null, message: '' })}
            className="ml-auto text-gray-400 hover:text-gray-600"
          >
            <XCircle className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <NotificationBanner />
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <Link href="/" className="flex items-center justify-center space-x-3 mb-8 group">
              <div className="relative">
                <img src="/medusa.ico" alt="Meduhentai" className="h-16 w-16 rounded-2xl group-hover:scale-110 transition-transform duration-200" />
                <div className="absolute inset-0 bg-primary-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
              </div>
              <span className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                Meduhentai
              </span>
            </Link>
            
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8">
              <div className="text-center space-y-4">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
                  <Mail className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Check Your Email</h2>
                <p className="text-gray-600">
                  We've sent a password reset link to <strong>{email}</strong>
                </p>
                <p className="text-sm text-gray-500">
                  Please check your email and click the link to reset your password.
                </p>
                <div className="pt-4 space-y-3">
                  <Link
                    href="/auth/signin"
                    className="w-full inline-flex justify-center items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-2xl font-semibold text-base transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    <ArrowLeft className="h-5 w-5 mr-2" />
                    Back to Sign In
                  </Link>
                  <button
                    onClick={handleResetForm}
                    className="w-full px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-2xl font-semibold text-base transition-all duration-200 hover:border-purple-500 hover:text-purple-600"
                  >
                    Send Another Email
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <NotificationBanner />
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link href="/" className="flex items-center justify-center space-x-3 mb-8 group">
            <div className="relative">
              <img src="/medusa.ico" alt="Meduhentai" className="h-16 w-16 rounded-2xl group-hover:scale-110 transition-transform duration-200" />
              <div className="absolute inset-0 bg-primary-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
            </div>
            <span className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
              Meduhentai
            </span>
          </Link>
          <h2 className="text-3xl font-bold text-dark-900 mb-2">Quên mật khẩu?</h2>
          <p className="text-dark-600">
            Nhập email của bạn để nhận link đặt lại mật khẩu
          </p>
          <p className="mt-2 text-sm text-dark-500">
            Nhớ mật khẩu?{' '}
            <Link href="/auth/signin" className="font-medium text-primary-600 hover:text-primary-500 transition-colors">
              Đăng nhập tại đây
            </Link>
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-3">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200 text-base"
                placeholder="Nhập email của bạn"
                disabled={loading}
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-2xl font-semibold text-base transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex justify-center items-center"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <Mail className="h-5 w-5 mr-2" />
                    Gửi link đặt lại mật khẩu
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
