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
          <Link href="/" className="flex items-center space-x-2 sm:space-x-3 group">
            <div className="relative">
              <img src="/medusa.ico" alt="Meduhentai" className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg group-hover:scale-110 transition-transform duration-200" />
              <div className="absolute inset-0 bg-primary-500/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
            </div>
            <span className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
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

          {/* Mobile Search Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors duration-200"
          >
            <Search className="h-5 w-5 text-white" />
          </button>

          {/* Right Side - User Menu & Mobile Menu Button */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Desktop User Menu */}
            <div className="hidden md:flex items-center space-x-4">
              {session ? (
                <>
                  <NotificationDropdown />
                  <div className="flex items-center space-x-3">
                    <Link href="/profile" className="flex items-center space-x-2 text-white hover:text-primary-200 transition-colors duration-200">
                      <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white/20">
                        <img 
                          src={session.user.avatar || '/medusa.ico'} 
                          alt="Avatar" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="font-medium">{session.user.username}</span>
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center space-x-2 text-white hover:text-red-200 transition-colors duration-200"
                    >
                      <LogOut className="h-4 w-4" />
                      <span className="hidden lg:inline">Đăng xuất</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link href="/auth/signin" className="text-white hover:text-primary-200 transition-colors duration-200">
                    Đăng nhập
                  </Link>
                  <Link href="/auth/signup" className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors duration-200">
                    Đăng ký
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors duration-200"
            >
              {isMenuOpen ? (
                <X className="h-5 w-5 text-white" />
              ) : (
                <Menu className="h-5 w-5 text-white" />
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
                />
                <Search className="search-icon h-5 w-5" />
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
                  <div className="flex items-center space-x-3 text-white">
                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/20">
                      <img 
                        src={session.user.avatar || '/medusa.ico'} 
                        alt="Avatar" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-medium">{session.user.username}</p>
                      <p className="text-sm text-white/70">{session.user.email}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Link 
                      href="/profile" 
                      className="flex items-center space-x-3 text-white hover:text-primary-200 transition-colors duration-200 p-2 rounded-lg hover:bg-white/10"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <User className="h-5 w-5" />
                      <span>Hồ sơ</span>
                    </Link>
                    
                    <Link 
                      href="/browse" 
                      className="flex items-center space-x-3 text-white hover:text-primary-200 transition-colors duration-200 p-2 rounded-lg hover:bg-white/10"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <BookOpen className="h-5 w-5" />
                      <span>Duyệt manga</span>
                    </Link>
                    
                    <Link 
                      href="/user/favorites" 
                      className="flex items-center space-x-3 text-white hover:text-primary-200 transition-colors duration-200 p-2 rounded-lg hover:bg-white/10"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Heart className="h-5 w-5" />
                      <span>Yêu thích</span>
                    </Link>
                    
                    {session.user.role === 'admin' && (
                      <Link 
                        href="/admin" 
                        className="flex items-center space-x-3 text-white hover:text-primary-200 transition-colors duration-200 p-2 rounded-lg hover:bg-white/10"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Settings className="h-5 w-5" />
                        <span>Quản trị</span>
                      </Link>
                    )}
                  </div>
                  
                  <div className="pt-4 border-t border-white/20">
                    <button
                      onClick={() => {
                        handleSignOut();
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center space-x-3 text-red-200 hover:text-red-100 transition-colors duration-200 p-2 rounded-lg hover:bg-red-500/20 w-full"
                    >
                      <LogOut className="h-5 w-5" />
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="space-y-3">
                  <Link 
                    href="/auth/signin" 
                    className="block text-center text-white hover:text-primary-200 transition-colors duration-200 p-3 rounded-lg hover:bg-white/10"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Đăng nhập
                  </Link>
                  <Link 
                    href="/auth/signup" 
                    className="block text-center px-4 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors duration-200"
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
