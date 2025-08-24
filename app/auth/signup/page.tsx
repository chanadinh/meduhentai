'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Loader2, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Account created successfully! Please sign in.');
        router.push('/auth/signin');
      } else {
        toast.error(data.error || 'Failed to create account');
      }
    } catch (error) {
      console.error('Sign up error:', error);
      toast.error('An error occurred during sign up');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
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
          <h2 className="text-3xl font-bold text-dark-900 mb-2">Tham gia cộng đồng của chúng tôi</h2>
          <p className="text-dark-600">
            Tạo tài khoản và bắt đầu đọc những bộ manga hentai tuyệt vời
          </p>
          <p className="mt-2 text-sm text-dark-500">
            Đã có tài khoản?{' '}
            <Link href="/auth/signin" className="font-medium text-primary-600 hover:text-primary-500 transition-colors">
              Đăng nhập tại đây
            </Link>
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-5">
              <div>
                <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-3">
                  Tên đăng nhập
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200 text-base"
                  placeholder="Chọn tên đăng nhập"
                  minLength={3}
                  maxLength={20}
                />
                <p className="mt-2 text-xs text-gray-500">
                  Tên đăng nhập phải có từ 3-20 ký tự
                </p>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-3">
                  Địa chỉ email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200 text-base"
                  placeholder="Nhập email của bạn"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-3">
                  Mật khẩu
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200 text-base pr-12"
                    placeholder="Tạo mật khẩu"
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Mật khẩu phải có ít nhất 6 ký tự
                </p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-3">
                  Xác nhận mật khẩu
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200 text-base pr-12"
                    placeholder="Xác nhận mật khẩu"
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>


            </div>

            <div className="space-y-5">
              <div className="flex items-start space-x-3">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  required
                  className="h-5 w-5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded-lg mt-1 focus:ring-2 focus:ring-purple-100 transition-all duration-200"
                />
                <label htmlFor="terms" className="text-sm text-gray-700">
                  Tôi đồng ý với{' '}
                  <a href="#" className="font-medium text-purple-600 hover:text-purple-500 transition-colors duration-200">
                    Điều khoản dịch vụ
                  </a>{' '}
                  và{' '}
                  <a href="#" className="font-medium text-purple-600 hover:text-purple-500 transition-colors duration-200">
                    Chính sách bảo mật
                  </a>
                </label>
              </div>

              <div className="flex items-start space-x-3">
                <input
                  id="age"
                  name="age"
                  type="checkbox"
                  required
                  className="h-5 w-5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded-lg mt-1 focus:ring-2 focus:ring-purple-100 transition-all duration-200"
                />
                <label htmlFor="age" className="text-sm text-gray-700">
                  Tôi xác nhận rằng tôi đã đủ 18 tuổi và có thể hợp pháp xem nội dung người lớn
                </label>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-2xl font-semibold text-base transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex justify-center items-center"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <UserPlus className="h-5 w-5 mr-2" />
                    Đăng ký
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
