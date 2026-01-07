'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../../components/Sidebar';
import NotificationToast from '../../components/NotificationToast';
import { useNotification } from '../../hooks/useNotification';

export default function PlaygroundPage() {
  const router = useRouter();
  const [apiKey, setApiKey] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { showNotification, notificationMessage, notificationType, displayNotification } =
    useNotification();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) {
      displayNotification('Please enter an API key', 'error');
      return;
    }

    // Store API key in sessionStorage to pass to protected page
    sessionStorage.setItem('apiKeyToValidate', apiKey);
    // Redirect to protected page
    router.replace('/protected');
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
                <span className="font-medium text-zinc-700 dark:text-zinc-200">API Playground</span>
              </div>
            </div>
          </header>

          <div className="flex-1 px-4 sm:px-6 py-6 space-y-6 max-w-4xl mx-auto w-full">
            <div className="rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-sm p-8">
              <h1 className="text-2xl font-semibold mb-2">API Playground</h1>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
                Enter your API key to validate and access protected resources.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label
                    htmlFor="apiKey"
                    className="block text-sm font-semibold text-zinc-800 dark:text-zinc-100"
                  >
                    API Key
                  </label>
                  <input
                    id="apiKey"
                    type="text"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-700 rounded-2xl bg-white dark:bg-zinc-900 text-sm text-black dark:text-zinc-50 font-mono focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter your API key"
                    required
                  />
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Your API key will be validated when you submit the form.
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full px-6 py-3 rounded-2xl bg-purple-600 text-white font-medium shadow-sm hover:bg-purple-700 transition-colors"
                >
                  Validate API Key
                </button>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

