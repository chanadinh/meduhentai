'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { 
  BookOpen, 
  Upload, 
  Users, 
  Settings, 
  BarChart3, 
  Menu, 
  X,
  Home,
  FileImage,
  Tags,
  Shield
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: 'Bảng điều khiển', href: '/admin', icon: BarChart3 },
  { name: 'Quản lý Nội dung', href: '/admin/manage', icon: BookOpen },
  { name: 'Tải lên Blob', href: '/admin/upload/direct', icon: Upload },
  { name: 'Tải lên R2', href: '/admin/upload/direct-r2', icon: Upload },
  { name: 'Người dùng', href: '/admin/users', icon: Users },
  { name: 'Thẻ & Thể loại', href: '/admin/tags', icon: Tags },
  { name: 'Cài đặt', href: '/admin/settings', icon: Settings },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();

  if (!session || session.user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-dark-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-16 w-16 text-error-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-dark-900 mb-2">Truy cập bị từ chối</h1>
          <p className="text-dark-600 mb-6">Bạn không có quyền truy cập trang này.</p>
          <Link href="/" className="btn-primary">
            Về Trang chủ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 flex z-40 lg:hidden ${sidebarOpen ? '' : 'pointer-events-none'}`}>
        <div className={`fixed inset-0 bg-dark-900 bg-opacity-75 transition-opacity ease-linear duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0'}`} onClick={() => setSidebarOpen(false)} />
        
        <div className={`relative flex-1 flex flex-col max-w-xs w-full bg-white transition ease-in-out duration-300 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
          
          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <div className="flex-shrink-0 flex items-center px-4">
              <Link href="/" className="flex items-center space-x-3">
                <img src="/medusa.ico" alt="Meduhentai" className="h-8 w-8 rounded-lg" />
                <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                  Bảng quản trị
                </span>
              </Link>
            </div>
            <nav className="mt-5 px-2 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-2 py-2 text-base font-medium rounded-md transition-colors duration-200 ${
                    pathname === item.href
                      ? 'bg-primary-100 text-primary-900'
                      : 'text-dark-600 hover:bg-dark-50 hover:text-dark-900'
                  }`}
                >
                  <item.icon className={`mr-4 flex-shrink-0 h-6 w-6 ${
                    pathname === item.href ? 'text-primary-600' : 'text-dark-400 group-hover:text-dark-500'
                  }`} />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 bg-white shadow-soft">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <Link href="/" className="flex items-center space-x-3 group">
                <img src="/medusa.ico" alt="Meduhentai" className="h-10 w-10 rounded-lg group-hover:scale-110 transition-transform duration-200" />
                <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                  Admin Panel
                </span>
              </Link>
            </div>
            <nav className="mt-8 flex-1 px-2 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                    pathname === item.href
                      ? 'bg-primary-100 text-primary-900'
                      : 'text-dark-600 hover:bg-dark-50 hover:text-dark-900'
                  }`}
                >
                  <item.icon className={`mr-3 flex-shrink-0 h-5 w-5 ${
                    pathname === item.href ? 'text-primary-600' : 'text-dark-400 group-hover:text-dark-500'
                  }`} />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          
          <div className="flex-shrink-0 flex border-t border-dark-200 p-4">
            <div className="flex items-center">
              <img
                src={session.user.avatar || '/medusa.ico'}
                alt="Admin"
                className="h-10 w-10 rounded-lg"
              />
              <div className="ml-3">
                <p className="text-sm font-medium text-dark-900">{session.user.username}</p>
                <p className="text-xs font-medium text-dark-500">Administrator</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        <div className="sticky top-0 z-10 lg:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 bg-white shadow-soft">
          <button
            type="button"
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-dark-500 hover:text-dark-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
        
        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
