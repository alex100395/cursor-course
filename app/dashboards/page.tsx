'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient';
import Sidebar from '../../components/Sidebar';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsed?: string;
}

export default function DashboardsPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingKey, setEditingKey] = useState<ApiKey | null>(null);
  const [formData, setFormData] = useState({ name: '', key: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);
  const [showPopupNotification, setShowPopupNotification] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    fetchApiKeys();
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

  const fetchApiKeys = async () => {
    try {
      console.log('Dashboard - Fetching API keys from /api/validate-key');
      const response = await fetch('/api/validate-key');
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Dashboard - API error response:', errorData);
        throw new Error(errorData.error || 'Failed to fetch API keys');
      }
      
      const data = await response.json();
      console.log('Dashboard - Received', data.length, 'API keys');
      setApiKeys(data);
    } catch (error: any) {
      console.error('Dashboard - Error fetching API keys:', error);
      alert(`Error loading API keys: ${error.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/validate-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          key: formData.key,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create API key');
      }

      await fetchApiKeys();
      setIsModalOpen(false);
      setFormData({ name: '', key: '' });
      showNotification('API key created successfully!');
    } catch (error: any) {
      console.error('Error creating API key:', error);
      alert(`Error: ${error.message || 'Failed to create API key'}`);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingKey) return;

    try {
      const response = await fetch('/api/validate-key', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: editingKey.id,
          name: formData.name,
          key: formData.key,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update API key');
      }

      await fetchApiKeys();
      setIsModalOpen(false);
      setEditingKey(null);
      setFormData({ name: '', key: '' });
      showNotification('API key updated successfully!');
    } catch (error: any) {
      console.error('Error updating API key:', error);
      alert(`Error: ${error.message || 'Failed to update API key'}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this API key?')) return;

    try {
      const response = await fetch(`/api/validate-key?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete API key');
      }

      await fetchApiKeys();
      showNotification('API key deleted successfully!');
    } catch (error: any) {
      console.error('Error deleting API key:', error);
      alert(`Error: ${error.message || 'Failed to delete API key'}`);
    }
  };

  const openCreateModal = () => {
    setEditingKey(null);
    setFormData({ name: '', key: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (key: ApiKey) => {
    setEditingKey(key);
    setFormData({ name: key.name, key: key.key });
    setIsModalOpen(true);
  };

  const maskApiKey = (key: string) => {
    if (key.length <= 8) return key;
    return key.substring(0, 4) + '•'.repeat(key.length - 8) + key.substring(key.length - 4);
  };

  const showNotification = (message: string) => {
    console.log('Showing popup notification:', message);
    console.log('Setting notification state to:', message);
    console.log('Setting showPopupNotification to: true');
    setNotification(message);
    setShowPopupNotification(true);
    // Auto-hide the popup after 3 seconds
    setTimeout(() => {
      console.log('Hiding popup notification');
      setShowPopupNotification(false);
      setNotification(null);
    }, 3000);
  };

  const copyToClipboard = (text: string) => {
    console.log('Copy function called with text:', text);

    // Try modern clipboard API first
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        console.log('Copy successful with modern API');
        showNotification('Copied to clipboard!');
      }).catch((error) => {
        console.error('Modern clipboard API failed:', error);
        fallbackCopyTextToClipboard(text);
      });
    } else {
      console.log('Using fallback copy method');
      fallbackCopyTextToClipboard(text);
    }
  };

  const fallbackCopyTextToClipboard = (text: string) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand('copy');
      if (successful) {
        console.log('Copy successful with fallback');
        showNotification('Copied to clipboard!');
      } else {
        console.error('Fallback copy failed');
        showNotification('Failed to copy to clipboard. Please try again.');
      }
    } catch (error) {
      console.error('Fallback copy error:', error);
      showNotification('Failed to copy to clipboard. Please try again.');
    }

    document.body.removeChild(textArea);
  };

  console.log('Component rendering, showPopupNotification:', showPopupNotification, 'notification:', notification);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black flex">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} />

      {/* Main Content */}
      <main className={`flex-1 overflow-y-auto transition-all duration-300 ${
        isSidebarOpen ? 'lg:ml-64 xl:ml-72' : ''
      }`}>
        {/* Popup Notification Modal */}
        {showPopupNotification && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000]">
            <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 w-full max-w-sm mx-4 shadow-2xl border-2 border-green-500">
              <div className="text-center">
                <div className="text-4xl mb-4">✅</div>
                <h3 className="text-lg font-semibold text-black dark:text-zinc-50 mb-2">
                  Success!
                </h3>
                <p className="text-zinc-600 dark:text-zinc-400">
                  {notification}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header with Burger Menu */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2.5 rounded-full bg-purple-600 hover:bg-purple-700 transition-colors shadow-sm"
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
        </div>
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link
              href="/"
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 mb-2 inline-block"
            >
              ← Back to Home
            </Link>
            <h1 className="text-3xl font-bold text-black dark:text-zinc-50">API Keys Dashboard</h1>
            <p className="text-zinc-600 dark:text-zinc-400 mt-2">
              Manage your API keys with full CRUD operations
            </p>
          </div>
          <button
            onClick={() => showNotification('Test notification!')}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Test Notification
          </button>
          <button
            onClick={openCreateModal}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            + Create API Key
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-zinc-600 dark:text-zinc-400">Loading...</p>
          </div>
        ) : apiKeys.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
            <p className="text-zinc-600 dark:text-zinc-400 mb-4">No API keys found.</p>
            <button
              onClick={openCreateModal}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create your first API key
            </button>
          </div>
        ) : (
          <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-zinc-50 dark:bg-zinc-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                      API Key
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                      Created At
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                      Last Used
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {apiKeys.map((key) => (
                    <tr key={key.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-black dark:text-zinc-50">
                        {key.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-400">
                        <div className="flex items-center gap-2">
                          <code className="font-mono">{maskApiKey(key.key)}</code>
                          <button
                            onClick={() => {
                              console.log('Copy button clicked for key:', key.key);
                              copyToClipboard(key.key);
                            }}
                            className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
                            title="Copy full key"
                          >
                            📋
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-400">
                        {new Date(key.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-400">
                        {key.lastUsed ? new Date(key.lastUsed).toLocaleDateString() : 'Never'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEditModal(key)}
                            className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(key.id)}
                            className="text-red-600 hover:text-red-700 dark:text-red-400"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 w-full max-w-md mx-4">
              <h2 className="text-2xl font-bold mb-4 text-black dark:text-zinc-50">
                {editingKey ? 'Edit API Key' : 'Create API Key'}
              </h2>
              <form onSubmit={editingKey ? handleUpdate : handleCreate}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-zinc-50"
                    required
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    API Key
                  </label>
                  <input
                    type="text"
                    value={formData.key}
                    onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-zinc-50 font-mono"
                    required
                    placeholder="sk-..."
                  />
                </div>
                <div className="flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setEditingKey(null);
                      setFormData({ name: '', key: '' });
                    }}
                    className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {editingKey ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        </div>
      </main>
    </div>
  );
}



