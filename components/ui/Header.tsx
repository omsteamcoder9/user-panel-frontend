// components/Header.tsx
'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useState, useEffect, useRef } from 'react';
import { fetchActiveCategories } from '@/lib/categoryService';
import { quickSearchProducts, getProductImageUrl } from '@/lib/productService';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface Category {
  _id: string;
  name: string;
  slug: string;
  createdAt: string;
}

interface SearchProduct {
  _id: string;
  name: string;
  slug: string;
  price: number;
  image: string | null;
  category: string;
  featured: boolean;
}

export default function Header() {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchProduct[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Scroll behavior for footer
  const [isFooterVisible, setIsFooterVisible] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesData = await fetchActiveCategories();
        // Categories will be in the exact order they were added (sorted by createdAt)
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error loading categories:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  // Scroll behavior for footer
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show footer when scrolling down, hide when scrolling up
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down & past 100px - show footer
        setIsFooterVisible(true);
      } else {
        // Scrolling up - hide footer
        setIsFooterVisible(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    let ticking = false;
    const throttledScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', throttledScroll);
    };
  }, [lastScrollY]);

  // Search functionality
  useEffect(() => {
    const performSearch = async () => {
      if (searchQuery.trim().length < 2) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const response = await quickSearchProducts(searchQuery, 5);
        if (response.success) {
          setSearchResults(response.data);
        }
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(performSearch, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
    setIsMobileMenuOpen(false);
    router.push('/');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearch(false);
      setSearchQuery('');
      setSearchResults([]);
    }
  };

  const handleSearchClick = () => {
    setShowSearch(true);
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 100);
  };

  const handleProductClick = (product: SearchProduct) => {
    router.push(`/products/${product.slug}`);
    setShowSearch(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleViewAllResults = () => {
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearch(false);
      setSearchQuery('');
      setSearchResults([]);
    }
  };

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSearch(false);
        setSearchResults([]);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node) && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSearch, isMobileMenuOpen]);

  // Calculate cart items count safely
  const getCartItemCount = () => {
    if (!cart?.items) return 0;
    return cart.items.reduce((total, item) => total + (item.quantity || 0), 0);
  };

  const cartItemsCount = getCartItemCount();
console.log(searchResults);

  return (
    <>
      {/* Main Header */}
      <header className="bg-gradient-to-r from-blue-500 to-purple-600 shadow-md border-b border-blue-400 font-sans">
        <div className="container mx-auto px-3 sm:px-4 lg:px-6">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo and Mobile Menu Button */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="xl:hidden p-1.5 text-white/90 hover:text-white transition-all duration-200 hover:bg-white/10 rounded-lg cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              {/* Desktop Logo */}
              <Link href="/" className="flex items-center space-x-2 sm:space-x-3 group cursor-pointer">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-200 border border-white/30 overflow-hidden">
                  <Image
                    src="/favicon.png"
                    alt="EcoStore Logo"
                    width={48}
                    height={48}
                    
                    priority
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl sm:text-2xl font-bold text-white tracking-tight">EcoStore</span>
                  <span className="text-[10px] sm:text-xs text-white/80 tracking-wider font-medium">SUSTAINABLE LIVING</span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation - EXACT ORDER: Home → Categories (in added order) → All Products → About → Contact */}
            <nav className="hidden xl:flex items-center space-x-4 2xl:space-x-6">
              {/* 1. Home - Always First */}
              <Link 
                href="/" 
                className="text-white/90 hover:text-white transition-all duration-200 font-medium px-3 py-2 rounded-lg hover:bg-white/10 border-b-2 border-transparent hover:border-white/50 text-sm 2xl:text-base cursor-pointer"
              >
                Home
              </Link>
              
              {/* 2. Categories from Database - In exact order they were added */}
              {!loading && categories.map((category) => (
                <Link 
                  key={category._id}
                  href={`/products?category=${category._id}`}
                  className="text-white/90 hover:text-white transition-all duration-200 font-medium px-3 py-2 rounded-lg hover:bg-white/10 border-b-2 border-transparent hover:border-white/50 text-sm 2xl:text-base cursor-pointer"
                >
                  {category.name}
                </Link>
              ))}
              
              {/* 3. All Products - After Categories */}
              <Link 
                href="/products" 
                className="text-white/90 hover:text-white transition-all duration-200 font-medium px-3 py-2 rounded-lg hover:bg-white/10 border-b-2 border-transparent hover:border-white/50 text-sm 2xl:text-base cursor-pointer"
              >
                All Products
              </Link>
              
              {/* 4. About */}
              <Link 
                href="/about" 
                className="text-white/90 hover:text-white transition-all duration-200 font-medium px-3 py-2 rounded-lg hover:bg-white/10 border-b-2 border-transparent hover:border-white/50 text-sm 2xl:text-base cursor-pointer"
              >
                About
              </Link>
              
              {/* 5. Contact - Last */}
              <Link 
                href="/contact" 
                className="text-white/90 hover:text-white transition-all duration-200 font-medium px-3 py-2 rounded-lg hover:bg-white/10 border-b-2 border-transparent hover:border-white/50 text-sm 2xl:text-base cursor-pointer"
              >
                Contact
              </Link>
            </nav>

            {/* Actions */}
            <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-3">
              {/* Search Button and Input */}
              <div ref={searchContainerRef} className="relative">
                {showSearch ? (
                  <div className="relative">
                    <form onSubmit={handleSearchSubmit} className="flex items-center">
                      <input
                        ref={searchInputRef}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search products..."
                        className="bg-white text-gray-900 px-3 py-2 rounded-lg border-2 border-white/30 focus:outline-none focus:border-white focus:ring-2 focus:ring-white/20 w-32 sm:w-40 md:w-44 lg:w-52 xl:w-56 2xl:w-64 transition-all duration-200 text-sm placeholder-gray-500"
                        autoFocus
                      />
                      <button
                        type="submit"
                        className="ml-1 p-1.5 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-all duration-200 shadow hover:shadow-white/25 cursor-pointer"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowSearch(false);
                          setSearchQuery('');
                          setSearchResults([]);
                        }}
                        className="ml-1 p-1.5 text-white/80 hover:text-white transition-all duration-200 hover:bg-white/10 rounded-lg cursor-pointer"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </form>

                    {/* Search Results Dropdown */}
                    {(searchResults.length > 0 || isSearching) && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-gray-200 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto w-full md:w-80 lg:w-96">
                        {isSearching ? (
                          <div className="p-3 text-center text-gray-500">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500 mx-auto"></div>
                            <p className="mt-1 text-xs">Searching...</p>
                          </div>
                        ) : (
                          <>
                            {searchResults.map((product) => (
                              <div
                                key={product._id}
                                className="p-2 border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition-all duration-200 hover:border-blue-200"
                                onClick={() => handleProductClick(product)}
                              >
                                <div className="flex items-center space-x-2">
                                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden border border-gray-200">
                                    {product.image ? (
                                      <img
                                       src={`${process.env.NEXT_PUBLIC_BASE_URL}${product.image}`}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-gray-900 font-medium truncate text-sm">{product.name}</p>
                                    <p className="text-gray-500 text-xs truncate">{product.category}</p>
                                    <p className="text-blue-600 font-medium text-sm">
                                      ₹{product.price}
                                      {product.featured && (
                                        <span className="ml-1 text-xs bg-yellow-500 text-white px-1 py-0.5 rounded">Featured</span>
                                      )}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                            <div
                              className="p-2 bg-gray-50 hover:bg-blue-500 hover:text-white cursor-pointer text-center transition-all duration-200 rounded-b-lg"
                              onClick={handleViewAllResults}
                            >
                              <p className="font-medium text-sm">View all results for "{searchQuery}"</p>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <button 
                    onClick={handleSearchClick}
                    className="p-1.5 text-white/90 hover:text-white hover:bg-white/10 transition-all duration-200 rounded-lg cursor-pointer"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                )}
              </div>
              
              {/* Cart Button */}
              <Link 
                href="/cart"
                className="p-1.5 text-white/90 hover:text-white hover:bg-white/10 transition-all duration-200 rounded-lg relative group cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {cartItemsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-white text-blue-600 text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold shadow">
                    {cartItemsCount > 9 ? '9+' : cartItemsCount}
                  </span>
                )}
              </Link>
              
              {/* User Section */}
              <div className="flex items-center">
                {user ? (
                  <div className="relative">
                    <button
                      onClick={() => setShowDropdown(!showDropdown)}
                      className="flex items-center space-x-1 sm:space-x-2 text-white/90 hover:text-white transition-all duration-200 hover:bg-white/10 rounded-lg p-1.5 cursor-pointer"
                    >
                      <div className="w-7 h-7 sm:w-8 sm:h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm shadow border border-white/30">
                        {user.email?.charAt(0).toUpperCase()}
                      </div>
                      <span className="hidden 2xl:block text-white/90 font-medium text-sm">
                        {user.name || user.email}
                      </span>
                      <svg
                        className={`hidden 2xl:block w-3 h-3 sm:w-4 sm:h-4 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Dropdown Menu */}
                    {showDropdown && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 z-50 border border-gray-200">
                        <div className="px-3 py-2 border-b border-gray-100">
                          <p className="text-gray-900 font-bold text-sm truncate">{user.name || user.email}</p>
                          <p className="text-blue-500 text-xs">Welcome back!</p>
                        </div>
                        <Link
                          href="/profile"
                          className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 cursor-pointer"
                          onClick={() => setShowDropdown(false)}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span>My Profile</span>
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="flex items-center space-x-2 w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all duration-200 rounded-b-lg cursor-pointer"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          <span>Sign Out</span>
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <Link
                      href="/login"
                      className="text-white/90 hover:text-white transition-all duration-200 font-medium px-2 py-1.5 rounded-md hover:bg-white/10 border border-transparent hover:border-white/30 text-xs sm:text-sm whitespace-nowrap cursor-pointer min-w-[45px] sm:min-w-[50px] text-center"
                    >
                      Login
                    </Link>
                    <Link
                      href="/signup"
                      className="bg-white text-blue-600 px-2 py-1.5 rounded-md hover:bg-gray-100 transition-all duration-200 font-medium shadow hover:shadow-white/25 text-xs sm:text-sm whitespace-nowrap cursor-pointer min-w-[50px] sm:min-w-[55px] text-center"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Menu - EXACT SAME ORDER: Home → Categories (in added order) → All Products → About → Contact */}
          {isMobileMenuOpen && (
            <div ref={mobileMenuRef} className="xl:hidden fixed inset-0 z-50">
              {/* Transparent overlay */}
              <div 
                className="absolute inset-0 bg-transparent"
                onClick={() => setIsMobileMenuOpen(false)}
              />
              
              {/* Smaller sidebar */}
              <div className="absolute top-0 left-0 h-full w-64 bg-gradient-to-br from-blue-500 to-purple-600 border-r border-blue-400 shadow-2xl">
                <div className="flex flex-col h-full">
                  {/* Mobile Menu Header */}
                  <div className="flex items-center justify-between p-4 border-b border-blue-400 bg-gradient-to-r from-blue-500 to-purple-600">
                    <Link 
                      href="/" 
                      className="flex items-center space-x-2 group cursor-pointer"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {/* Mobile Logo */}
                      <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg border border-white/30 overflow-hidden">
                        <Image
                          src="/favicon.png"
                          alt="EcoStore Logo"
                          width={32}
                          height={32}
                          className="w-full h-full object-contain p-0.5"
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-lg font-bold text-white">EcoStore</span>
                        <span className="text-[10px] text-white/80">SUSTAINABLE LIVING</span>
                      </div>
                    </Link>
                    <button
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200 rounded-lg cursor-pointer"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* Mobile Navigation Links - EXACT SAME ORDER */}
                  <nav className="flex-1 p-4">
                    <div className="space-y-1">
                      {/* 1. Home - Always First */}
                      <Link 
                        href="/" 
                        className="flex items-center space-x-3 text-white/90 hover:text-white hover:bg-white/10 transition-all duration-200 font-medium p-3 rounded-lg border border-transparent hover:border-white/30 text-sm cursor-pointer"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        <span>Home</span>
                      </Link>
                      
                      {/* 2. Categories from Database - In exact order they were added */}
                      {!loading && categories.map((category) => (
                        <Link
                          key={category._id}
                          href={`/products?category=${category._id}`}
                          className="flex items-center space-x-3 text-white/90 hover:text-white hover:bg-white/10 transition-all duration-200 font-medium p-3 rounded-lg border border-transparent hover:border-white/30 text-sm cursor-pointer ml-3"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                          <span>{category.name}</span>
                        </Link>
                      ))}
                      
                      {/* 3. All Products - After Categories */}
                      <Link 
                        href="/products" 
                        className="flex items-center space-x-3 text-white/90 hover:text-white hover:bg-white/10 transition-all duration-200 font-medium p-3 rounded-lg border border-transparent hover:border-white/30 text-sm cursor-pointer"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        <span>All Products</span>
                      </Link>
                      
                      {/* 4. About */}
                      <Link 
                        href="/about" 
                        className="flex items-center space-x-3 text-white/90 hover:text-white hover:bg-white/10 transition-all duration-200 font-medium p-3 rounded-lg border border-transparent hover:border-white/30 text-sm cursor-pointer"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>About</span>
                      </Link>
                      
                      {/* 5. Contact - Last */}
                      <Link 
                        href="/contact" 
                        className="flex items-center space-x-3 text-white/90 hover:text-white hover:bg-white/10 transition-all duration-200 font-medium p-3 rounded-lg border border-transparent hover:border-white/30 text-sm cursor-pointer"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span>Contact</span>
                      </Link>
                    </div>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Bottom Navigation Footer */}
      <div className={`
        fixed bottom-0 left-0 right-0 bg-gradient-to-r from-blue-500 to-purple-600 border-t border-blue-400 shadow-2xl z-40
        transition-transform duration-300 ease-in-out
        ${isFooterVisible ? 'translate-y-0' : 'translate-y-full'}
        xl:hidden
      `}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Home */}
            <Link 
              href="/" 
              className="flex flex-col items-center justify-center flex-1 p-2 text-white/90 hover:text-white transition-all duration-200 cursor-pointer"
            >
              <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="text-xs font-medium">Home</span>
            </Link>

            {/* Search */}
            <button 
              onClick={handleSearchClick}
              className="flex flex-col items-center justify-center flex-1 p-2 text-white/90 hover:text-white transition-all duration-200 cursor-pointer"
            >
              <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="text-xs font-medium">Search</span>
            </button>

            {/* Products */}
            <Link 
              href="/products" 
              className="flex flex-col items-center justify-center flex-1 p-2 text-white/90 hover:text-white transition-all duration-200 cursor-pointer"
            >
              <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <span className="text-xs font-medium">Products</span>
            </Link>

            {/* Cart */}
            <Link 
              href="/cart"
              className="flex flex-col items-center justify-center flex-1 p-2 text-white/90 hover:text-white transition-all duration-200 relative cursor-pointer"
            >
              <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {cartItemsCount > 0 && (
                <span className="absolute top-1 right-6 bg-white text-blue-600 text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold shadow border border-blue-400">
                  {cartItemsCount > 9 ? '9+' : cartItemsCount}
                </span>
              )}
              <span className="text-xs font-medium">Cart</span>
            </Link>

            {/* Login & Signup */}
            {user ? (
              <Link 
                href="/profile" 
                className="flex flex-col items-center justify-center flex-1 p-2 text-white/90 hover:text-white transition-all duration-200 cursor-pointer"
              >
                <div className="w-6 h-6 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white font-bold text-xs mb-1 border border-white/30">
                  {user.email?.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs font-medium">Account</span>
              </Link>
            ) : (
              <div className="flex flex-col items-center justify-center flex-1 p-2">
                <div className="flex flex-col items-center space-y-1">
                  <div className="flex space-x-2">
                    <Link
                      href="/login"
                      className="px-2 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-medium rounded hover:bg-white/30 transition-all duration-200 min-w-[45px] text-center border border-white/30 cursor-pointer"
                    >
                      Login
                    </Link>
                    <Link
                      href="/signup"
                      className="px-2 py-1 bg-white text-blue-600 text-xs font-medium rounded hover:bg-gray-100 transition-all duration-200 min-w-[45px] text-center cursor-pointer"
                    >
                      Signup
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}