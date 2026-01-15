'use client';

import { useState, useEffect, type FormEvent } from 'react';
import Sidebar from '../components/Sidebar';
import NotificationToast from '../components/NotificationToast';
import ApiKeysTable from '../components/ApiKeysTable';
import ApiKeyModal from '../components/ApiKeyModal';
import { useApiKeys } from '../hooks/useApiKeys';
import { useNotification } from '../hooks/useNotification';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabaseClient';
import { API_KEY_CREATED, API_KEY_DELETED } from '../components/notifications';
import type { ApiKey, ApiKeyFormData } from '../types/apiKey';

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingKey, setEditingKey] = useState<ApiKey | null>(null);
  const [formData, setFormData] = useState<ApiKeyFormData>({ name: '', key: '' });
  const [keyType, setKeyType] = useState<'development' | 'production'>('development');
  const [limitEnabled, setLimitEnabled] = useState(false);
  const [monthlyLimit, setMonthlyLimit] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { apiKeys, isLoading, error, setError, createApiKey, updateApiKey, deleteApiKey, fetchApiKeys } =
    useApiKeys();
  const { showNotification, notificationMessage, notificationType, displayNotification } =
    useNotification();
  const { user, loading: authLoading, signInWithGoogle, signOut, isAuthenticated } = useAuth();

  // Check for auth session on mount (in case we're redirected back from OAuth)
  useEffect(() => {
    const checkAuthFromUrl = async () => {
      // Check if there's a session in the URL (from OAuth callback)
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const queryParams = new URLSearchParams(window.location.search);
      
      if (hashParams.get('access_token') || queryParams.get('code')) {
        // If we have auth tokens in URL, wait a moment for Supabase to process them
        await new Promise(resolve => setTimeout(resolve, 500));
        // Force a refresh of the auth state
        window.location.hash = '';
        window.location.search = '';
      }
    };
    
    checkAuthFromUrl();
  }, []);

  // Refetch API keys when authentication state changes or after auth loading completes
  useEffect(() => {
    if (!authLoading) {
      // Fetch API keys regardless of auth state (for backward compatibility)
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
    <div className="min-h-screen bg-zinc-100 dark:bg-black font-sans text-zinc-900 dark:text-zinc-50">
      <NotificationToast
        message={notificationMessage}
        type={notificationType}
        isVisible={showNotification}
      />

      <div className="flex min-h-screen">
        <Sidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} />

        <main
          className={`flex-1 flex flex-col transition-all duration-300 ${
            isSidebarOpen ? 'lg:ml-64 xl:ml-72' : ''
          }`}
        >
          {/* Top bar */}
          <header className="flex items-center justify-between gap-4 px-4 sm:px-6 pt-4 pb-3 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/80 dark:bg-black/60 backdrop-blur">
            <div className="flex items-center gap-3">
              {/* Burger Menu Button */}
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden p-2.5 rounded-full bg-purple-600 hover:bg-purple-700 transition-colors shadow-sm"
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
              {/* Desktop toggle button */}
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="hidden lg:flex p-2.5 rounded-full bg-purple-600 hover:bg-purple-700 transition-colors shadow-sm"
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
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <span className="text-zinc-400">Pages</span>
                <span>/</span>
                <span className="font-medium text-zinc-700 dark:text-zinc-200">Overview</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-full border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
                  Operational
                </span>
              </div>
              
              {/* Authentication Section */}
              {authLoading ? (
                <div className="h-9 w-20 rounded-lg bg-zinc-100 dark:bg-zinc-800 animate-pulse"></div>
              ) : isAuthenticated ? (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800">
                    {user?.user_metadata?.avatar_url && (
                      <img
                        src={user.user_metadata.avatar_url}
                        alt={user.email || 'User'}
                        className="h-6 w-6 rounded-full"
                      />
                    )}
                    <span className="text-xs font-medium text-zinc-700 dark:text-zinc-200 max-w-[120px] truncate">
                      {user?.user_metadata?.full_name || user?.email || 'User'}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    Sign Out
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleGoogleLogin}
                  className="inline-flex items-center gap-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors shadow-sm"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
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
              )}
              
              <button className="hidden sm:inline-flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900">
                <span className="text-lg">🌙</span>
              </button>
            </div>
          </header>

          <div className="flex-1 px-4 sm:px-6 py-6 space-y-6 max-w-6xl mx-auto w-full">
            {/* Login Prompt - Show when not authenticated */}
            {!authLoading && !isAuthenticated && (
              <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-6 py-8 text-center shadow-sm">
                <div className="max-w-md mx-auto space-y-4">
                  <div className="text-5xl mb-2">🔐</div>
                  <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
                    Sign in to continue
                  </h2>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Please sign in with your Google account to access your API keys and manage your account.
                  </p>
                  <button
                    onClick={handleGoogleLogin}
                    className="mt-4 inline-flex items-center gap-3 rounded-lg bg-white dark:bg-zinc-900 border-2 border-zinc-300 dark:border-zinc-700 px-6 py-3 text-base font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors shadow-sm"
                  >
                    <svg className="w-6 h-6" viewBox="0 0 24 24">
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
            <div className="rounded-2xl bg-gradient-to-r from-sky-500 via-violet-500 to-rose-500 p-[1px] shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-[1.1rem] bg-zinc-50/80 dark:bg-zinc-950/90 px-4 sm:px-6 py-3">
                <p className="text-xs sm:text-sm text-zinc-800 dark:text-zinc-100 font-medium">
                  Get Research Certified! <span className="font-normal">Share your badge &amp; earn free credits.</span>
                </p>
                <button className="text-xs sm:text-sm font-semibold text-sky-700 dark:text-sky-300 hover:underline">
                  View certification
                </button>
              </div>
            </div>

            {/* Plan card */}
            <section className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] gap-6 items-stretch">
              <div className="rounded-3xl bg-gradient-to-br from-sky-400 via-violet-500 to-rose-400 p-[1px] shadow-md">
                <div className="h-full rounded-[1.6rem] bg-gradient-to-br from-indigo-950/90 via-slate-950/90 to-zinc-950/90 px-6 sm:px-8 py-7 flex flex-col justify-between">
                  <div className="space-y-5">
                    <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-100">
                      Current Plan
                    </span>
                    <div>
                      <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white">
                        Researcher
                      </h1>
                      <p className="mt-1 text-sm text-zinc-200/80 max-w-md">
                        Manage your research API usage, keys and billing from a single clean overview.
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 space-y-4">
                    <div className="flex items-center justify-between text-xs text-zinc-200/90">
                      <div className="flex items-center gap-2">
                        <span className="font-medium tracking-wide uppercase text-[11px]">API Usage</span>
                        <span className="h-3 w-3 rounded-full border border-zinc-400/60 text-[9px] flex items-center justify-center text-zinc-300">
                          i
                        </span>
                      </div>
                      <span>0 / 1,000 credits</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-zinc-700/80 overflow-hidden">
                      <div className="h-full w-[6%] rounded-full bg-gradient-to-r from-emerald-400 to-sky-400"></div>
                    </div>
                    <div className="flex items-center justify-between gap-3 text-xs text-zinc-200/80">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex h-4 w-7 items-center rounded-full bg-zinc-900/80 p-[2px]">
                          <span className="inline-flex h-3 w-3 rounded-full bg-white shadow" />
                        </span>
                        <span>Pay as you go</span>
                      </div>
                      <button className="inline-flex items-center rounded-full border border-zinc-500/70 bg-zinc-900/40 px-3 py-1 text-[11px] font-medium text-zinc-100 hover:bg-zinc-800/60">
                        Manage plan
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* API keys summary card */}
              <div className="rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-sm p-6 flex flex-col justify-between">
                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400">
                    API Keys
                  </p>
                  <h2 className="text-xl font-semibold tracking-tight">Secure access to your Research API</h2>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Create, rotate and revoke keys used across your applications. Keys are always stored encrypted.
                  </p>
                </div>
                <div className="mt-4 flex items-center justify-between gap-4">
                  <div className="text-sm text-zinc-500 dark:text-zinc-400">
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">{apiKeys.length}</span>{' '}
                    active key{apiKeys.length === 1 ? '' : 's'}
                  </div>
                  <button
                    onClick={openCreateModal}
                    className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900 px-4 py-2 text-sm font-medium shadow-sm hover:bg-black dark:hover:bg-zinc-100"
                  >
                    <span className="text-base leading-none">+</span>
                    <span>Create API key</span>
                  </button>
                </div>
              </div>
            </section>

            {/* API Keys table / states */}
            {isAuthenticated && (
            <section className="space-y-4">
              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/15 border border-red-200 dark:border-red-800 rounded-2xl">
                  <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                </div>
              )}

              {isLoading ? (
                <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-6 py-12 text-center shadow-sm">
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">Loading your API keys...</p>
                </div>
              ) : apiKeys.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-800 bg-white/60 dark:bg-zinc-950/60 px-6 py-12 text-center shadow-sm">
                  <div className="max-w-md mx-auto space-y-4">
                    <div className="text-5xl mb-2">🔑</div>
                    <h2 className="text-xl font-semibold">No API keys yet</h2>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      Create your first key to start authenticating requests to the Research API.
                    </p>
                    <button
                      onClick={openCreateModal}
                      className="mt-2 inline-flex items-center gap-2 rounded-lg bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900 px-5 py-2.5 text-sm font-medium shadow-sm hover:bg-black dark:hover:bg-zinc-100"
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
