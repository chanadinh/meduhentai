'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Search, Menu, X, User, LogOut, BookOpen, Heart, Settings } from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';
import { useRouter } from 'next/navigation';

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  return (
    <nav className="nav-glass shadow-soft sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <img src="/medusa.ico" alt="Meduhentai" className="h-10 w-10 rounded-lg group-hover:scale-110 transition-transform duration-200" />
              <div className="absolute inset-0 bg-primary-500/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
              Meduhentai
            </span>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-lg mx-8 relative">
            <div className="search-bar w-full">
              <input
                type="text"
                placeholder="Tìm kiếm manga, tác giả, thể loại..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input w-full"
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              />
              <Search className="search-icon h-5 w-5" />
            </div>
            
            {/* Search Suggestions */}
            {searchQuery.trim() && showSuggestions && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-strong border border-dark-100 z-50 max-h-64 overflow-y-auto">
                <div className="p-2">
                  <div className="text-xs text-dark-500 px-3 py-2 border-b border-dark-100">
                    Gợi ý tìm kiếm nhanh
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery(searchQuery);
                      setShowSuggestions(false);
                      handleSearch({ preventDefault: () => {} } as React.FormEvent);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-dark-50 rounded-lg transition-colors duration-200"
                  >
                    <div className="flex items-center space-x-2">
                      <Search className="h-4 w-4 text-primary-500" />
                      <span>Tìm kiếm "{searchQuery}"</span>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery(`genre:${searchQuery}`);
                      setShowSuggestions(false);
                      handleSearch({ preventDefault: () => {} } as React.FormEvent);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-dark-50 rounded-lg transition-colors duration-200"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-accent-600">Thể loại:</span>
                      <span>{searchQuery}</span>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery(`author:${searchQuery}`);
                      setShowSuggestions(false);
                      handleSearch({ preventDefault: () => {} } as React.FormEvent);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-dark-50 rounded-lg transition-colors duration-200"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-accent-600">Tác giả:</span>
                      <span>{searchQuery}</span>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </form>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {session ? (
              <div className="flex items-center space-x-4">
                {/* Notifications */}
                <NotificationDropdown />

                {/* User Menu */}
                <div className="relative group">
                  <button className="flex items-center space-x-3 p-2 rounded-xl hover:bg-dark-50 transition-all duration-200">
                    <img 
                      src={session.user.avatar || '/medusa.ico'} 
                      alt="Avatar" 
                      className="h-8 w-8 rounded-lg border-2 border-dark-200"
                    />
                    <span className="font-medium text-dark-700">{session.user.username}</span>
                    <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                  </button>
                  
                  {/* Dropdown Menu */}
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-strong py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 border border-dark-100">
                    <div className="px-4 py-3 border-b border-dark-100">
                      <p className="text-sm font-medium text-dark-900">{session.user.username}</p>
                      <p className="text-xs text-dark-500">{session.user.email}</p>
                    </div>
                    
                    <Link href={`/profile/${session?.user?.id}`} className="flex items-center px-4 py-3 text-sm text-dark-700 hover:bg-dark-50 transition-colors duration-200">
                      <User className="h-4 w-4 mr-3 text-primary-500" />
                      Hồ sơ
                    </Link>
                    <Link href="/favorites" className="flex items-center px-4 py-3 text-sm text-dark-700 hover:bg-dark-50 transition-colors duration-200">
                      <Heart className="h-4 w-4 mr-3 text-accent-500" />
                      Yêu thích
                    </Link>
                    <Link href="/reading-list" className="flex items-center px-4 py-3 text-sm text-dark-700 hover:bg-dark-50 transition-colors duration-200">
                      <BookOpen className="h-4 w-4 mr-3 text-primary-500" />
                      Danh sách đọc
                    </Link>
                    
                    {session.user.role === 'admin' && (
                      <Link href="/admin" className="flex items-center px-4 py-3 text-sm text-dark-700 hover:bg-dark-50 transition-colors duration-200">
                        <Settings className="h-4 w-4 mr-3 text-accent-500" />
                        Bảng quản trị
                      </Link>
                    )}
                    
                    <div className="border-t border-dark-100 my-2"></div>
                    
                    <button
                      onClick={handleSignOut}
                      className="flex items-center w-full px-4 py-3 text-sm text-dark-700 hover:bg-dark-50 transition-colors duration-200"
                    >
                      <LogOut className="h-4 w-4 mr-3 text-error-500" />
                      Đăng xuất
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link 
                  href="/auth/signin" 
                  className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full font-medium transition-all duration-200 hover:scale-105 border border-gray-200 hover:border-gray-300"
                >
                  Đăng nhập
                </Link>
                <Link 
                  href="/auth/signup" 
                  className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-full font-medium transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-dark-600 hover:text-primary-600 hover:bg-dark-50 rounded-lg transition-colors duration-200"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden pb-4">
          <form onSubmit={handleSearch} className="w-full">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Tìm kiếm manga, tác giả, thể loại..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              <Search className="search-icon h-5 w-5" />
            </div>
          </form>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-dark-100 shadow-medium">
          <div className="px-4 py-6 space-y-4">
            
            {session ? (
              <div className="space-y-3 pt-4 border-t border-dark-100">
                <div className="flex items-center space-x-3 p-3 bg-dark-50 rounded-lg">
                  <img 
                    src={session.user.avatar || '/medusa.ico'} 
                    alt="Avatar" 
                    className="h-10 w-10 rounded-lg"
                  />
                  <div>
                    <p className="font-medium text-dark-900">{session.user.username}</p>
                    <p className="text-sm text-dark-500">{session.user.email}</p>
                  </div>
                </div>
                
                <Link
                  href={`/profile/${session?.user?.id}`}
                  className="flex items-center py-3 px-4 text-dark-700 hover:bg-dark-50 rounded-lg transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User className="h-5 w-5 mr-3 text-primary-500" />
                  Hồ sơ
                </Link>
                <Link
                  href="/favorites"
                  className="flex items-center py-3 px-4 text-dark-700 hover:bg-dark-50 rounded-lg transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Heart className="h-5 w-5 mr-3 text-accent-500" />
                  Yêu thích
                </Link>
                <Link
                  href="/reading-list"
                  className="flex items-center py-3 px-4 text-dark-700 hover:bg-dark-50 rounded-lg transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <BookOpen className="h-5 w-5 mr-3 text-primary-500" />
                  Danh sách đọc
                </Link>
                
                {session.user.role === 'admin' && (
                  <Link
                    href="/admin"
                    className="flex items-center py-3 px-4 text-dark-700 hover:bg-dark-50 rounded-lg transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Settings className="h-5 w-5 mr-3 text-accent-500" />
                    Bảng quản trị
                  </Link>
                )}
                
                <button
                  onClick={() => {
                    handleSignOut();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center w-full py-3 px-4 text-dark-700 hover:bg-dark-50 rounded-lg transition-colors duration-200"
                >
                  <LogOut className="h-5 w-5 mr-3 text-error-500" />
                  Đăng xuất
                </button>
              </div>
            ) : (
              <div className="pt-4 border-t border-dark-100 space-y-3">
                <Link
                  href="/auth/signin"
                  className="w-full px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full font-medium transition-all duration-200 hover:scale-105 border border-gray-200 hover:border-gray-300 text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/auth/signup"
                  className="w-full px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-full font-medium transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
