'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../../components/Sidebar';
import NotificationToast from '../../components/NotificationToast';
import { useNotification } from '../../hooks/useNotification';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function PlaygroundPage() {
  const router = useRouter();
  const [apiKey, setApiKey] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const { showNotification, notificationMessage, notificationType, displayNotification } =
    useNotification();

  // Auto-open sidebar on desktop (>= 1024px), keep closed on mobile/tablet
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };
    // Set initial state based on screen size
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) {
      displayNotification('Please enter an API key', 'error');
      return;
    }

    setIsValidating(true);
    try {
      // Validate API key via API route
      const response = await fetch(`/api/validate-key?key=${encodeURIComponent(apiKey.trim())}`);
      const result = await response.json();
      
      if (result.valid === true) {
        displayNotification('API key is valid!', 'success');
        // Store API key in sessionStorage to pass to protected page
        sessionStorage.setItem('apiKeyToValidate', apiKey.trim());
        // Redirect to protected page after a short delay
        setTimeout(() => {
          router.push('/protected');
        }, 1000);
      } else {
        displayNotification('Invalid API key. Please check and try again.', 'error');
        setIsValidating(false);
      }
    } catch (error) {
      console.error('Error validating API key:', error);
      displayNotification('Failed to validate API key. Please try again.', 'error');
      setIsValidating(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans relative overflow-hidden">
      {/* Animated Wavy Background Lines */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <svg
          className="absolute top-0 left-0 w-full h-full opacity-10"
          viewBox="0 0 1200 800"
          preserveAspectRatio="none"
        >
          <path
            d="M0,200 Q300,150 600,200 T1200,200"
            stroke="url(#gradient1)"
            strokeWidth="2"
            fill="none"
            className="animate-pulse"
            style={{ animationDuration: '4s' }}
          />
          <path
            d="M0,400 Q400,350 800,400 T1600,400"
            stroke="url(#gradient2)"
            strokeWidth="2"
            fill="none"
            className="animate-pulse"
            style={{ animationDuration: '5s', animationDelay: '1s' }}
          />
          <defs>
            <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#a855f7" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#ec4899" stopOpacity="0.8" />
            </linearGradient>
            <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#a855f7" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.6" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <NotificationToast
        message={notificationMessage}
        type={notificationType}
        isVisible={showNotification}
      />

      <div className="flex min-h-screen relative z-10">
        <Sidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} />

        <main
          className={`flex-1 flex flex-col transition-all duration-300 w-full ${
            isSidebarOpen ? 'lg:ml-64 xl:ml-72' : ''
          }`}
        >
          {/* Top bar */}
          <header className="flex items-center justify-between gap-2 sm:gap-4 px-3 sm:px-4 lg:px-6 pt-3 sm:pt-4 pb-2 sm:pb-3 border-b border-white/10 bg-black/50 backdrop-blur-sm">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              {/* Back Button */}
              <Link href="/dashboard" className="shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-12 w-12 sm:h-11 md:h-10 text-white hover:bg-gradient-to-r hover:from-purple-500/20 hover:to-cyan-500/20 active:bg-white/20 border-2 border-white/20 hover:border-purple-500/40 rounded-xl transition-all duration-200 shadow-lg shadow-purple-500/20 hover:shadow-xl hover:shadow-purple-500/40"
                >
                  <ArrowLeft className="h-6 w-6 sm:h-5 md:h-4" />
                </Button>
              </Link>
              {/* Burger Menu Button - Mobile */}
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden p-3 sm:p-2.5 rounded-xl bg-gradient-to-r from-purple-500 via-purple-600 to-cyan-500 hover:from-purple-600 hover:via-purple-700 hover:to-cyan-600 active:from-purple-700 active:to-cyan-700 transition-all duration-200 shadow-2xl shadow-purple-500/50 hover:shadow-purple-500/70 shrink-0 min-h-[48px] sm:min-h-[44px] min-w-[48px] sm:min-w-[44px] flex items-center justify-center ring-2 ring-purple-500/20 hover:ring-purple-500/40"
                aria-label="Toggle sidebar"
              >
                <svg
                  className="w-6 h-6 sm:w-5 sm:h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {isSidebarOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
              {/* Desktop toggle button */}
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="hidden lg:flex p-3 rounded-lg bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 active:from-purple-700 active:to-cyan-700 transition-all duration-200 shadow-lg shadow-purple-500/50 hover:shadow-xl shrink-0 min-h-[44px] min-w-[44px] items-center justify-center"
                aria-label="Toggle sidebar"
              >
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {isSidebarOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
              <div className="hidden sm:flex items-center gap-2 text-xs text-gray-400 min-w-0">
                <span className="text-gray-500">Pages</span>
                <span>/</span>
                <span className="font-medium text-white truncate">API Playground</span>
              </div>
            </div>
          </header>

          <div className="flex-1 px-3 sm:px-4 lg:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6 max-w-4xl mx-auto w-full">
            <div className="rounded-3xl bg-gradient-to-br from-white/5 via-white/5 to-white/5 border border-white/10 backdrop-blur-sm shadow-2xl shadow-purple-500/20 p-4 sm:p-6 lg:p-8">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold mb-2 text-white">API Playground</h1>
              <p className="text-xs sm:text-sm text-gray-300 mb-4 sm:mb-6">
                Enter your API key to validate and access protected resources.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                <div className="space-y-2">
                  <label
                    htmlFor="apiKey"
                    className="block text-xs sm:text-sm font-semibold text-white"
                  >
                    API Key
                  </label>
                  <input
                    id="apiKey"
                    type="text"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full px-4 sm:px-5 py-3 sm:py-3.5 border border-white/20 rounded-xl bg-white/5 text-sm sm:text-base text-white font-mono placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Enter your API key"
                    required
                    disabled={isValidating}
                  />
                  <p className="text-[10px] sm:text-xs text-gray-400">
                    Your API key will be validated when you submit the form.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isValidating}
                    className="w-full px-5 sm:px-6 py-4 sm:py-4.5 rounded-xl bg-gradient-to-r from-purple-500 via-purple-600 to-cyan-500 hover:from-purple-600 hover:via-purple-700 hover:to-cyan-600 active:from-purple-700 active:to-cyan-700 text-white font-semibold text-sm sm:text-base shadow-2xl shadow-purple-500/50 hover:shadow-purple-500/70 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:from-purple-500 disabled:hover:via-purple-600 disabled:hover:to-cyan-500 min-h-[48px] ring-2 ring-purple-500/20 hover:ring-purple-500/40"
                  >
                    {isValidating ? 'Validating...' : 'Validate API Key'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
