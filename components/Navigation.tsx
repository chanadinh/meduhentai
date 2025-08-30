'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Search, Menu, X, User, LogOut, BookOpen, Heart, Settings, Upload } from 'lucide-react';
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
        <div className="flex justify-between items-center h-12">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 sm:space-x-3 group">
            <div className="relative">
              <img src="/medusa.ico" alt="Meduhentai" className="h-6 w-6 sm:h-8 sm:w-8 rounded-lg group-hover:scale-110 transition-transform duration-200" />
              <div className="absolute inset-0 bg-primary-500/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
            </div>
            <span className="text-base sm:text-xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
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
                aria-label="Tìm kiếm manga, tác giả, thể loại"
              />
              <Search className="search-icon h-4 w-4" />
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

          {/* Right Side - User Menu & Mobile Menu Button */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Desktop User Menu */}
            <div className="hidden md:flex items-center space-x-4">
              {session ? (
                <>
                  <NotificationDropdown />
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
                    
                    {/* Desktop Dropdown Menu */}
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-strong py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 border border-dark-100">
                      <div className="px-4 py-3 border-b border-dark-100">
                        <p className="text-sm font-medium text-dark-900">{session.user.username}</p>
                        <p className="text-xs text-dark-500">{session.user.email}</p>
                      </div>
                      
                      <Link href="/profile" className="flex items-center px-4 py-3 text-sm text-dark-700 hover:bg-dark-50 transition-colors duration-200">
                        <User className="h-4 w-4 mr-3 text-primary-500" />
                        Hồ sơ
                      </Link>
                      <Link href="/browse" className="flex items-center px-4 py-3 text-sm text-dark-700 hover:bg-dark-50 transition-colors duration-200">
                        <BookOpen className="h-4 w-4 mr-3 text-primary-500" />
                        Duyệt manga
                      </Link>
                      <Link href="/user/favorites" className="flex items-center px-4 py-3 text-sm text-dark-700 hover:bg-dark-50 transition-colors duration-200">
                        <Heart className="h-4 w-4 mr-3 text-accent-500" />
                        Yêu thích
                      </Link>
                      
                      {(session.user.role === 'uploader' || session.user.role === 'admin') && (
                        <Link href="/upload" className="flex items-center px-4 py-3 text-sm text-dark-700 hover:bg-dark-50 transition-colors duration-200">
                          <Upload className="h-4 w-4 mr-3 text-primary-500" />
                          Tải lên
                        </Link>
                      )}
                      
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
                </>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link href="/auth/signin" className="px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 rounded-xl font-medium transition-all duration-200 hover:scale-105 border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md">
                    Đăng nhập
                  </Link>
                  <Link href="/auth/signup" className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl font-medium transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl">
                    Đăng ký
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-white/20 transition-colors duration-200"
              aria-label={isMenuOpen ? "Đóng menu" : "Mở menu"}
            >
              {isMenuOpen ? (
                                        <X className="h-4 w-4 text-black" />
                      ) : (
                        <Menu className="h-4 w-4 text-black" />
                      )}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/20">
            <form onSubmit={handleSearch} className="relative">
              <div className="search-bar w-full">
                <input
                  type="text"
                  placeholder="Tìm kiếm manga, tác giả, thể loại..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input w-full"
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  aria-label="Tìm kiếm manga, tác giả, thể loại"
                />
                <Search className="search-icon h-4 w-4" />
              </div>
              
              {/* Mobile Search Suggestions */}
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
          </div>
        )}

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/20">
            <div className="space-y-4">
              {session ? (
                <>
                  <div className="flex items-center space-x-3 text-dark-900 bg-white/95 p-3 rounded-lg">
                    <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-dark-200">
                      <img 
                        src={session.user.avatar || '/medusa.ico'} 
                        alt="Avatar" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-medium text-dark-900">{session.user.username}</p>
                      <p className="text-sm text-dark-600">{session.user.email}</p>
                    </div>
                  </div>
                  
                  {/* Mobile Notification Button */}
                  <div className="flex justify-center mb-4">
                    <div className="w-full max-w-xs">
                      <div className="bg-white/95 p-3 rounded-lg border border-dark-200">
                        <div className="text-center mb-2 text-sm text-dark-600">Thông báo</div>
                        <NotificationDropdown />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Link 
                      href="/profile" 
                      className="flex items-center space-x-3 text-dark-900 bg-white/95 hover:bg-white p-3 rounded-lg transition-colors duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <User className="h-4 w-4 text-primary-500" />
                      <span>Hồ sơ</span>
                    </Link>
                    
                    <Link 
                      href="/browse" 
                      className="flex items-center space-x-3 text-dark-900 bg-white/95 hover:bg-white p-3 rounded-lg transition-colors duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <BookOpen className="h-4 w-4 text-primary-500" />
                      <span>Duyệt manga</span>
                    </Link>
                    
                    <Link 
                      href="/user/favorites" 
                      className="flex items-center space-x-3 text-dark-900 bg-white/95 hover:bg-white p-3 rounded-lg transition-colors duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Heart className="h-4 w-4 text-accent-500" />
                      <span>Yêu thích</span>
                    </Link>
                    
                    {(session.user.role === 'uploader' || session.user.role === 'admin') && (
                      <Link 
                        href="/upload" 
                        className="flex items-center space-x-3 text-dark-900 bg-white/95 hover:bg-white p-3 rounded-lg transition-colors duration-200"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Upload className="h-4 w-4 text-primary-500" />
                        <span>Tải lên</span>
                      </Link>
                    )}

                    
                    {session.user.role === 'admin' && (
                      <Link 
                        href="/admin" 
                        className="flex items-center space-x-3 text-dark-900 bg-white/95 hover:bg-white p-3 rounded-lg transition-colors duration-200"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Settings className="h-4 w-4 text-accent-500" />
                        <span>Quản trị</span>
                      </Link>
                    )}
                  </div>
                  
                  <div className="pt-4 border-t border-dark-200">
                    <button
                      onClick={() => {
                        handleSignOut();
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center space-x-3 text-red-600 bg-white/95 hover:bg-white p-3 rounded-lg transition-colors duration-200 w-full"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="space-y-3">
                  <Link 
                    href="/auth/signin" 
                    className="block text-center px-4 py-3 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 rounded-xl font-medium transition-all duration-200 hover:scale-105 border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Đăng nhập
                  </Link>
                  <Link 
                    href="/auth/signup" 
                    className="block text-center px-4 py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl font-medium transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Đăng ký
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
