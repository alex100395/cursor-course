'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../../components/Sidebar';
import NotificationToast from '../../components/NotificationToast';
import { useNotification } from '../../hooks/useNotification';
import { VALID_API_KEY, INVALID_API_KEY } from '../../components/notifications';
// Removed apiKeysService - using API route instead

export default function ProtectedPage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isValidating, setIsValidating] = useState(true);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const { showNotification, notificationMessage, notificationType, displayNotification } =
    useNotification();

  useEffect(() => {
    const validateApiKey = async () => {
      // Get API key from sessionStorage
      const apiKeyToValidate = sessionStorage.getItem('apiKeyToValidate');

      if (!apiKeyToValidate) {
        // No API key found, show invalid and allow access to page
        displayNotification(INVALID_API_KEY, 'error');
        setIsValid(false);
        setIsValidating(false);
        return;
      }

      try {
        // Validate API key via API route (server-side, bypasses RLS)
        const response = await fetch(`/api/validate-key?key=${encodeURIComponent(apiKeyToValidate)}`);
        const result = await response.json();
        
        const keyIsValid = result.valid === true;
        setIsValid(keyIsValid);

        if (keyIsValid) {
          displayNotification(VALID_API_KEY, 'success');
        } else {
          displayNotification(INVALID_API_KEY, 'error');
        }
      } catch (error) {
        console.error('Error validating API key:', error);
        displayNotification(INVALID_API_KEY, 'error');
        setIsValid(false);
      } finally {
        setIsValidating(false);
        // Clear the API key from sessionStorage after validation
        sessionStorage.removeItem('apiKeyToValidate');
      }
    };

    validateApiKey();
  }, [router, displayNotification]);

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
                <span className="font-medium text-zinc-700 dark:text-zinc-200">Protected</span>
              </div>
            </div>
          </header>

          <div className="flex-1 px-4 sm:px-6 py-6 space-y-6 max-w-4xl mx-auto w-full">
            <div className="rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-sm p-8">
              <h1 className="text-2xl font-semibold mb-2">Protected Page</h1>
              {isValidating ? (
                <div className="mt-6">
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Validating API key...
                  </p>
                </div>
              ) : (
                <div className="mt-6 space-y-4">
                  {isValid ? (
                    <>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        ✅ Your API key is valid. You have access to this protected page.
                      </p>
                      <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                        <p className="text-sm text-green-800 dark:text-green-200">
                          This is a protected page that can only be accessed with a valid API key.
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        ❌ Your API key is invalid. This page is accessible but some features may be limited.
                      </p>
                      <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <p className="text-sm text-red-800 dark:text-red-200">
                          Please provide a valid API key to access all features.
                        </p>
                      </div>
                    </>
                  )}
                  <button
                    onClick={() => router.push('/playground')}
                    className="mt-4 px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors"
                  >
                    Go back to Playground
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

