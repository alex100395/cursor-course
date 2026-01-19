'use client';

import { useState, useEffect, type FormEvent } from 'react';
import Sidebar from '../../components/Sidebar';
import NotificationToast from '../../components/NotificationToast';
import ApiKeysTable from '../../components/ApiKeysTable';
import ApiKeyModal from '../../components/ApiKeyModal';
import { useApiKeys } from '../../hooks/useApiKeys';
import { useNotification } from '../../hooks/useNotification';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabaseClient';
import { API_KEY_CREATED, API_KEY_DELETED } from '../../components/notifications';
import type { ApiKey, ApiKeyFormData } from '../../types/apiKey';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingKey, setEditingKey] = useState<ApiKey | null>(null);
  const [formData, setFormData] = useState<ApiKeyFormData>({ name: '', key: '' });
  const [keyType, setKeyType] = useState<'development' | 'production'>('development');
  const [limitEnabled, setLimitEnabled] = useState(false);
  const [monthlyLimit, setMonthlyLimit] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const { apiKeys, isLoading, error, setError, createApiKey, updateApiKey, deleteApiKey, fetchApiKeys } =
    useApiKeys();
  const { showNotification, notificationMessage, notificationType, displayNotification } =
    useNotification();
  const { user, session, loading: authLoading, signInWithGoogle, signOut, isAuthenticated } = useAuth();
  const [directSession, setDirectSession] = useState<any>(null);

  // Direct session check that bypasses React state
  useEffect(() => {
    const check = async () => {
      const { data: { session: s } } = await supabase.auth.getSession();
      setDirectSession(s);
    };
    check();
    const interval = setInterval(check, 1000);
    return () => clearInterval(interval);
  }, []);
  const [forceCheck, setForceCheck] = useState(0);

  // Force check session directly - bypass state if needed
  useEffect(() => {
    const checkDirectly = async () => {
      const { data: { session: directSession } } = await supabase.auth.getSession();
      if (directSession && (!user && !session)) {
        console.log('🔧 Session exists but state is wrong - forcing update');
        setForceCheck(prev => prev + 1);
      }
    };
    
    if (!authLoading) {
      checkDirectly();
      const interval = setInterval(checkDirectly, 2000);
      return () => clearInterval(interval);
    }
  }, [authLoading, user, session]);

  // Check for session in URL hash (from OAuth redirect) and process it
  useEffect(() => {
    const processUrlHash = async () => {
      if (typeof window === 'undefined') return;
      
      const hash = window.location.hash.substring(1);
      if (hash && (hash.includes('access_token') || hash.includes('code'))) {
        // Session tokens in URL - Supabase should handle this automatically
        // but let's make sure by clearing the hash after a moment
        setTimeout(() => {
          if (window.history.replaceState) {
            window.history.replaceState(null, '', window.location.pathname + window.location.search);
          }
        }, 1000);
      }
    };
    
    processUrlHash();
  }, []);

  // NUCLEAR OPTION: If session exists in localStorage but state says not authenticated, force reload
  useEffect(() => {
    if (!authLoading && !isAuthenticated && typeof window !== 'undefined') {
      // Check if there's ANY auth token in localStorage
      const hasAuthToken = Object.keys(localStorage).some(key => 
        key.startsWith('sb-') && key.includes('auth-token')
      );
      
      if (hasAuthToken) {
        console.log('🔍 Found auth token but state says not authenticated - checking session...');
        const timer = setTimeout(async () => {
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            console.log('✅ Session found - reloading to sync state');
            window.location.reload();
          }
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [authLoading, isAuthenticated]);

  // Only fetch API keys when authenticated
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      fetchApiKeys();
    }
  }, [isAuthenticated, authLoading, fetchApiKeys]);

  const openCreateModal = () => {
    setEditingKey(null);
    setFormData({ name: '', key: '' });
    setKeyType('development');
    setLimitEnabled(false);
    setMonthlyLimit('');
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (key: ApiKey) => {
    setEditingKey(key);
    setFormData({ name: key.name, key: key.key });
    setKeyType('development');
    setLimitEnabled(false);
    setMonthlyLimit('');
    setError(null);
    setIsModalOpen(true);
  };

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    const success = await createApiKey(formData.name, formData.key);
    if (success) {
      setIsModalOpen(false);
      setFormData({ name: '', key: '' });
      displayNotification(API_KEY_CREATED, 'success');
    }
  };

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingKey) return;
    const success = await updateApiKey(editingKey.id, formData.name, formData.key);
    if (success) {
      setIsModalOpen(false);
      setEditingKey(null);
      setFormData({ name: '', key: '' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this API key? This action cannot be undone.'))
      return;
    const success = await deleteApiKey(id);
    if (success) {
      displayNotification(API_KEY_DELETED, 'error');
    }
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      displayNotification('Copied to clipboard!', 'success');
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      displayNotification('Failed to copy to clipboard. Please try again.', 'error');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      displayNotification('Failed to sign in with Google. Please try again.', 'error');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      displayNotification('Signed out successfully', 'success');
    } catch (error) {
      displayNotification('Failed to sign out. Please try again.', 'error');
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
              <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0.8" />
            </linearGradient>
            <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#a855f7" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.6" />
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
              <Link href="/landing" className="shrink-0">
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
                <span className="font-medium text-white truncate">Dashboard</span>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
              <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 sm:px-3 py-1.5 sm:py-2 backdrop-blur-sm">
                <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse shrink-0"></span>
                <span className="text-xs font-medium text-cyan-300 whitespace-nowrap">
                  Operational
                </span>
              </div>
              
              {/* Authentication Section */}
              {authLoading ? (
                <div className="h-10 sm:h-11 w-18 sm:w-22 rounded-lg bg-white/10 animate-pulse"></div>
              ) : (isAuthenticated || user || session || directSession) ? (
                <div className="flex items-center gap-2 sm:gap-2">
                  <div className="flex items-center gap-2 sm:gap-1.5 px-2.5 sm:px-2.5 lg:px-3 py-2 sm:py-1.5 rounded-lg bg-gradient-to-r from-white/10 to-white/5 border border-white/20 hover:border-purple-500/40 backdrop-blur-sm min-w-0 hover:from-white/15 hover:to-white/10 transition-all duration-200 cursor-pointer shadow-md hover:shadow-lg">
                    {((user || session?.user || directSession?.user)?.user_metadata?.avatar_url || 
                      (user || session?.user || directSession?.user)?.user_metadata?.picture) && (
                      <img
                        src={(user || session?.user || directSession?.user)?.user_metadata?.avatar_url || 
                             (user || session?.user || directSession?.user)?.user_metadata?.picture}
                        alt={(user || session?.user || directSession?.user)?.email || 'User'}
                        className="h-7 w-7 sm:h-6 md:h-6 rounded-full shrink-0 ring-1 ring-white/20"
                      />
                    )}
                    <span className="text-xs sm:text-xs md:text-[11px] font-medium text-white max-w-[100px] sm:max-w-[80px] md:max-w-[70px] lg:max-w-[90px] truncate">
                      {(user || session?.user || directSession?.user)?.user_metadata?.full_name || 
                       (user || session?.user || directSession?.user)?.user_metadata?.name || 
                       (user || session?.user || directSession?.user)?.email || 
                       'User'}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="inline-flex items-center justify-center gap-1.5 sm:gap-1.5 rounded-lg border border-white/20 bg-gradient-to-r from-white/10 to-white/5 hover:from-white/20 hover:to-white/10 active:from-white/25 active:to-white/15 px-3 sm:px-2.5 py-2 sm:py-1.5 text-xs sm:text-xs md:text-[11px] font-medium text-white transition-all duration-200 backdrop-blur-sm h-10 sm:h-9 md:h-8 shadow-md hover:shadow-lg hover:border-purple-500/50"
                  >
                    <svg
                      className="w-4 h-4 sm:w-3.5 md:w-3.5 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    <span className="hidden sm:inline whitespace-nowrap">Sign Out</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleGoogleLogin}
                  className="inline-flex items-center justify-center gap-2 sm:gap-2 rounded-xl bg-gradient-to-r from-purple-500 via-purple-600 to-cyan-500 hover:from-purple-600 hover:via-purple-700 hover:to-cyan-600 active:from-purple-700 active:to-cyan-700 text-white border-0 px-5 sm:px-4 py-3 sm:py-2.5 text-sm sm:text-xs md:text-[11px] font-semibold transition-all duration-200 shadow-2xl shadow-purple-500/50 hover:shadow-purple-500/70 hover:scale-105 active:scale-100 whitespace-nowrap min-h-[48px] sm:min-h-[44px] md:min-h-[40px] ring-2 ring-purple-500/20 hover:ring-purple-500/40"
                >
                  <svg className="w-5 h-5 sm:w-4 md:w-3.5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                    </svg>
                  <span className="hidden sm:inline">Sign in with Google</span>
                  <span className="sm:hidden">Sign in</span>
                </button>
              )}
              
              <button className="hidden md:inline-flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full border border-white/20 hover:bg-white/10 transition-colors">
                <span className="text-base sm:text-lg">🌙</span>
              </button>
            </div>
          </header>

          <div className="flex-1 px-3 sm:px-4 lg:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6 max-w-6xl mx-auto w-full">
            {/* Login Prompt - Show when not authenticated */}
            {!authLoading && !isAuthenticated && (
              <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm px-4 sm:px-6 py-6 sm:py-8 text-center shadow-lg shadow-cyan-500/10">
                <div className="max-w-md mx-auto space-y-3 sm:space-y-4">
                  <div className="text-4xl sm:text-5xl mb-2">🔐</div>
                  <h2 className="text-xl sm:text-2xl font-semibold text-white">
                    Sign in to continue
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-400 px-2">
                    Please sign in with your Google account to access your API keys and manage your account.
                  </p>
                  <button
                    onClick={handleGoogleLogin}
                    className="mt-4 inline-flex items-center gap-2 sm:gap-3 rounded-lg bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white border-0 px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-medium transition-all duration-300 shadow-lg shadow-purple-500/50 hover:shadow-purple-500/70 hover:scale-105"
                  >
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Sign in with Google
                  </button>
                </div>
              </div>
            )}

            {/* Certification banner */}
            <div className="rounded-2xl bg-gradient-to-r from-cyan-400 via-purple-600 to-pink-500 p-[1px] shadow-lg shadow-purple-500/30">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3 rounded-[1.1rem] bg-black/60 backdrop-blur-sm px-4 sm:px-6 py-3 border border-white/5">
                <p className="text-xs sm:text-sm text-white font-medium">
                  Get Research Certified! <span className="font-normal text-gray-300 hidden sm:inline">Share your badge &amp; earn free credits.</span>
                  <span className="font-normal text-gray-300 sm:hidden">Share your badge &amp; earn credits.</span>
                </p>
                <button className="text-xs sm:text-sm font-semibold text-cyan-400 hover:text-cyan-300 transition-colors whitespace-nowrap">
                  View certification
                </button>
              </div>
            </div>

            {/* Plan card */}
            <section className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] gap-4 sm:gap-6 items-stretch">
              <div className="rounded-3xl bg-gradient-to-br from-cyan-400 via-purple-600 to-pink-500 p-[1px] shadow-lg shadow-purple-500/30">
                <div className="h-full rounded-[1.6rem] bg-gradient-to-br from-indigo-950/95 via-slate-950/95 to-zinc-950/95 backdrop-blur-sm px-4 sm:px-6 lg:px-8 py-5 sm:py-7 flex flex-col justify-between border border-white/5">
                  <div className="space-y-4 sm:space-y-5">
                    <span className="inline-flex items-center rounded-full bg-white/10 px-2 sm:px-3 py-1 text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.16em] text-white">
                      Current Plan
                    </span>
                    <div>
                      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-white">
                        Researcher
                      </h1>
                      <p className="mt-1 text-xs sm:text-sm text-gray-300 max-w-md">
                        Manage your research API usage, keys and billing from a single clean overview.
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
                    <div className="flex items-center justify-between text-xs text-gray-300 gap-2">
                      <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                        <span className="font-medium tracking-wide uppercase text-[10px] sm:text-[11px] whitespace-nowrap">API Usage</span>
                        <span className="h-3 w-3 rounded-full border border-gray-500/60 text-[9px] flex items-center justify-center text-gray-400 shrink-0">
                          i
                        </span>
                      </div>
                      <span className="text-[10px] sm:text-xs whitespace-nowrap">0 / 1,000 credits</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div className="h-full w-[6%] rounded-full bg-gradient-to-r from-purple-400 via-cyan-400 to-purple-500"></div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3 text-xs text-gray-400">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex h-4 w-7 items-center rounded-full bg-white/10 p-[2px]">
                          <span className="inline-flex h-3 w-3 rounded-full bg-white shadow" />
                        </span>
                        <span>Pay as you go</span>
                      </div>
                      <button className="inline-flex items-center rounded-full border border-white/20 bg-white/5 hover:bg-white/10 px-3 py-1 text-[10px] sm:text-[11px] font-medium text-white transition-colors w-full sm:w-auto justify-center">
                        Manage plan
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* API keys summary card - only show when authenticated */}
              {!authLoading && isAuthenticated && (
              <div className="rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm shadow-lg shadow-purple-500/10 p-4 sm:p-6 flex flex-col justify-between hover:border-purple-500/50 transition-all duration-300">
                <div className="space-y-2 sm:space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">
                    API Keys
                  </p>
                  <h2 className="text-lg sm:text-xl font-semibold tracking-tight text-white">Secure access to your Research API</h2>
                  <p className="text-xs sm:text-sm text-gray-400">
                    Create, rotate and revoke keys used across your applications. Keys are always stored encrypted.
                  </p>
                </div>
                <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                  <div className="text-xs sm:text-sm text-gray-400">
                    <span className="font-semibold text-white">{apiKeys.length}</span>{' '}
                    active key{apiKeys.length === 1 ? '' : 's'}
                  </div>
                  <button
                    onClick={openCreateModal}
                    className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white border-0 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium shadow-lg shadow-purple-500/50 hover:shadow-purple-500/70 transition-all duration-300 hover:scale-105 w-full sm:w-auto justify-center"
                  >
                    <span className="text-base leading-none">+</span>
                    <span>Create API key</span>
                  </button>
                </div>
              </div>
              )}
            </section>

            {/* API Keys table / states */}
            {/* Only show API keys when authenticated (check direct session too) */}
            {!authLoading && (isAuthenticated || directSession) && (
            <section className="space-y-4">
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl backdrop-blur-sm">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              {isLoading ? (
                <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm px-6 py-12 text-center shadow-lg">
                  <p className="text-sm text-gray-400">Loading your API keys...</p>
                </div>
              ) : apiKeys.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-white/20 bg-white/5 backdrop-blur-sm px-6 py-12 text-center shadow-lg">
                  <div className="max-w-md mx-auto space-y-4">
                    <div className="text-5xl mb-2">🔑</div>
                    <h2 className="text-xl font-semibold text-white">No API keys yet</h2>
                    <p className="text-sm text-gray-400">
                      Create your first key to start authenticating requests to the Research API.
                    </p>
                    <button
                      onClick={openCreateModal}
                      className="mt-2 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white border-0 px-5 py-2.5 text-sm font-medium shadow-lg shadow-purple-500/50 hover:shadow-purple-500/70 transition-all duration-300 hover:scale-105"
                    >
                      <span className="text-base leading-none">+</span>
                      <span>Create your first API key</span>
                    </button>
                  </div>
                </div>
              ) : (
                <ApiKeysTable
                  apiKeys={apiKeys}
                  onEdit={openEditModal}
                  onDelete={handleDelete}
                  onCopy={copyToClipboard}
                  onCreate={openCreateModal}
                  copiedId={copiedId}
                />
              )}
            </section>
            )}
          </div>
        </main>
      </div>

      <ApiKeyModal
        isOpen={isModalOpen}
        editingKey={editingKey}
        formData={formData}
        keyType={keyType}
        limitEnabled={limitEnabled}
        monthlyLimit={monthlyLimit}
        error={error}
        onClose={() => setIsModalOpen(false)}
        onSubmit={editingKey ? handleUpdate : handleCreate}
        onFormDataChange={setFormData}
        onKeyTypeChange={setKeyType}
        onLimitEnabledChange={setLimitEnabled}
        onMonthlyLimitChange={setMonthlyLimit}
        onErrorChange={setError}
      />
    </div>
  );
}
