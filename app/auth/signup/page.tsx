'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Loader2, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card, CardBody, CardHeader, Button, Input } from '@heroui/react';

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        {/* Floating orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
        
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px]"></div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen py-12 px-4">
        <div className="w-full max-w-6xl flex items-center justify-center lg:justify-between">
          {/* Left side - Welcome content (hidden on mobile) */}
          <div className="hidden lg:flex flex-col items-start space-y-8 max-w-lg pr-12">
            <Link href="/" className="group">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <img
                    src="/medusa.ico"
                    alt="Meduhentai"
                    className="h-16 w-16 rounded-2xl group-hover:scale-110 transition-transform duration-300 shadow-2xl"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/50 to-pink-500/50 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-300"></div>
                </div>
                <span className="text-5xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                  Meduhentai
                </span>
              </div>
            </Link>
            
            <div className="space-y-6">
              <h1 className="text-6xl font-bold text-white leading-tight">
                Tham gia
                <span className="block bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  cộng đồng!
                </span>
              </h1>
              
              <p className="text-xl text-gray-300 leading-relaxed">
                Tạo tài khoản miễn phí và khám phá thế giới manga phong phú với hàng nghìn tác phẩm chất lượng cao.
              </p>
              
              <div className="flex items-center space-x-6 text-gray-400">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <span>Miễn phí 100%</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse delay-300"></div>
                  <span>Không quảng cáo</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse delay-600"></div>
                  <span>Cộng đồng thân thiện</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Sign up form */}
          <div className="w-full max-w-lg">
            <Card className="backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl">
              <CardHeader className="text-center pb-6">
                {/* Mobile logo */}
                <Link href="/" className="flex lg:hidden items-center justify-center space-x-3 mb-6 group">
                  <div className="relative">
                    <img
                      src="/medusa.ico"
                      alt="Meduhentai"
                      className="h-12 w-12 rounded-xl group-hover:scale-110 transition-transform duration-200"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/50 to-pink-500/50 rounded-xl blur-md group-hover:blur-lg transition-all duration-300"></div>
                  </div>
                  <span className="text-3xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                    Meduhentai
                  </span>
                </Link>
                
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold text-white">Đăng ký</h2>
                  <p className="text-gray-300">
                    Tạo tài khoản để bắt đầu hành trình khám phá
                  </p>
                </div>
              </CardHeader>

              <CardBody className="space-y-6">
                <form className="space-y-5" onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 gap-4">
                    <Input
                      id="username"
                      name="username"
                      type="text"
                      placeholder="Tên đăng nhập"
                      value={formData.username}
                      onChange={handleChange}
                      required
                      size="lg"
                      minLength={3}
                      maxLength={20}
                      variant="bordered"
                      classNames={{
                        input: "text-white placeholder:text-gray-500 bg-transparent",
                        inputWrapper: "bg-black/20 backdrop-blur-sm border-white/30 hover:border-white/50 group-data-[focus=true]:border-purple-400 group-data-[focus=true]:bg-black/30",
                        label: "text-gray-200"
                      }}
                    />

                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Địa chỉ email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      size="lg"
                      variant="bordered"
                      classNames={{
                        input: "text-white placeholder:text-gray-500 bg-transparent",
                        inputWrapper: "bg-black/20 backdrop-blur-sm border-white/30 hover:border-white/50 group-data-[focus=true]:border-purple-400 group-data-[focus=true]:bg-black/30",
                        label: "text-gray-200"
                      }}
                    />

                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Mật khẩu"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      size="lg"
                      minLength={6}
                      variant="bordered"
                      classNames={{
                        input: "text-white placeholder:text-gray-500 bg-transparent",
                        inputWrapper: "bg-black/20 backdrop-blur-sm border-white/30 hover:border-white/50 group-data-[focus=true]:border-purple-400 group-data-[focus=true]:bg-black/30",
                        label: "text-gray-200"
                      }}
                      endContent={
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="text-gray-400 hover:text-white transition-colors p-1"
                          aria-label={showPassword ? "Ẩn mật khẩu" : "Hiển thị mật khẩu"}
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      }
                    />

                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Xác nhận mật khẩu"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      size="lg"
                      minLength={6}
                      variant="bordered"
                      classNames={{
                        input: "text-white placeholder:text-gray-500 bg-transparent",
                        inputWrapper: "bg-black/20 backdrop-blur-sm border-white/30 hover:border-white/50 group-data-[focus=true]:border-purple-400 group-data-[focus=true]:bg-black/30",
                        label: "text-gray-200"
                      }}
                      endContent={
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="text-gray-400 hover:text-white transition-colors p-1"
                          aria-label={showConfirmPassword ? "Ẩn mật khẩu" : "Hiển thị mật khẩu"}
                        >
                          {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      }
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-start cursor-pointer group">
                      <input
                        type="checkbox"
                        id="terms"
                        name="terms"
                        required
                        className="w-4 h-4 mt-1 rounded border-2 border-white/50 bg-transparent checked:bg-purple-500 checked:border-purple-500 focus:ring-2 focus:ring-purple-400 focus:ring-offset-0 text-purple-500 shrink-0"
                      />
                      <span className="ml-3 text-sm text-gray-300 select-none group-hover:text-white transition-colors">
                        Tôi đồng ý với{' '}
                        <a href="#" className="text-purple-300 hover:text-purple-200 underline underline-offset-2">
                          Điều khoản dịch vụ
                        </a>{' '}
                        và{' '}
                        <a href="#" className="text-purple-300 hover:text-purple-200 underline underline-offset-2">
                          Chính sách bảo mật
                        </a>
                      </span>
                    </label>

                    <label className="flex items-start cursor-pointer group">
                      <input
                        type="checkbox"
                        id="age"
                        name="age"
                        required
                        className="w-4 h-4 mt-1 rounded border-2 border-white/50 bg-transparent checked:bg-purple-500 checked:border-purple-500 focus:ring-2 focus:ring-purple-400 focus:ring-offset-0 text-purple-500 shrink-0"
                      />
                      <span className="ml-3 text-sm text-gray-300 select-none group-hover:text-white transition-colors">
                        Tôi xác nhận rằng tôi đã đủ 18 tuổi và có thể hợp pháp xem nội dung người lớn
                      </span>
                    </label>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                    disabled={loading}
                    startContent={loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <UserPlus className="h-5 w-5" />}
                  >
                    {loading ? 'Đang đăng ký...' : 'Tạo tài khoản'}
                  </Button>
                </form>

                <div className="text-center">
                  <p className="text-gray-300 text-sm">
                    Đã có tài khoản?{' '}
                    <Link 
                      href="/auth/signin" 
                      className="font-medium text-purple-300 hover:text-purple-200 transition-colors underline underline-offset-2"
                    >
                      Đăng nhập ngay
                    </Link>
                  </p>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
