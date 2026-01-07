'use client';

import { useState, useEffect, type FormEvent } from 'react';
import Image from "next/image";
import { supabase } from '../lib/supabaseClient';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsed?: string;
}

export default function Home() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingKey, setEditingKey] = useState<ApiKey | null>(null);
  const [formData, setFormData] = useState({ name: '', key: '' });
  const [keyType, setKeyType] = useState<'development' | 'production'>('development');
  const [limitEnabled, setLimitEnabled] = useState(false);
  const [monthlyLimit, setMonthlyLimit] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [revealedIds, setRevealedIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: supaError } = await supabase
        .from('api_keys')
        .select('id, name, value, created_at, usage')
        .order('created_at', { ascending: false });

      if (supaError) {
        console.error('Error fetching API keys from Supabase:', supaError);
        setError('Failed to fetch API keys');
        return;
      }

      setApiKeys(
        (data ?? []).map((row: any) => ({
          id: row.id,
          name: row.name,
          key: row.value,
          createdAt: row.created_at,
          lastUsed: undefined,
        })),
      );
    } catch (error) {
      console.error('Error fetching API keys:', error);
      setError('Failed to fetch API keys');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const { error: supaError } = await supabase.from('api_keys').insert({
        name: formData.name,
        value: formData.key,
        usage: 0,
      });

      if (supaError) {
        console.error('Error creating API key in Supabase:', supaError);
        setError('Failed to create API key');
        return;
      }

      await fetchApiKeys();
      setIsModalOpen(false);
      setFormData({ name: '', key: '' });
    } catch (error) {
      console.error('Error creating API key:', error);
      setError('Failed to create API key');
    }
  };

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingKey) return;
    setError(null);

    try {
      const { error: supaError } = await supabase
        .from('api_keys')
        .update({
          name: formData.name,
          value: formData.key,
        })
        .eq('id', editingKey.id);

      if (supaError) {
        console.error('Error updating API key in Supabase:', supaError);
        setError('Failed to update API key');
        return;
      }

      await fetchApiKeys();
      setIsModalOpen(false);
      setEditingKey(null);
      setFormData({ name: '', key: '' });
    } catch (error) {
      console.error('Error updating API key:', error);
      setError('Failed to update API key');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this API key? This action cannot be undone.')) return;
    setError(null);

    try {
      const { error: supaError } = await supabase.from('api_keys').delete().eq('id', id);

      if (supaError) {
        console.error('Error deleting API key in Supabase:', supaError);
        setError('Failed to delete API key');
        return;
      }

      await fetchApiKeys();
    } catch (error) {
      console.error('Error deleting API key:', error);
      setError('Failed to delete API key');
    }
  };

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

  const maskApiKey = (key: string) => {
    if (key.length <= 8) return key;
    return key.substring(0, 4) + '•'.repeat(Math.min(key.length - 8, 20)) + key.substring(key.length - 4);
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const toggleReveal = (id: string) => {
    setRevealedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-black font-sans text-zinc-900 dark:text-zinc-50">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden lg:flex lg:flex-col w-64 xl:w-72 bg-white/90 dark:bg-zinc-950/90 border-r border-zinc-200 dark:border-zinc-800 backdrop-blur">
          <div className="px-6 pt-6 pb-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-500 via-violet-500 to-rose-500 text-white shadow-md">
              <span className="text-lg font-semibold">R</span>
            </div>
            <div>
              <p className="text-sm font-semibold tracking-tight">Research Console</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Personal workspace</p>
            </div>
          </div>

          <nav className="flex-1 px-3 py-4 space-y-6 text-sm">
            <div className="space-y-1">
              <p className="px-3 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500 dark:text-zinc-400">
                Pages
              </p>
              <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900 shadow-sm">
                <span className="text-lg">🏠</span>
                <span className="font-medium">Overview</span>
              </button>
              <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-zinc-100 dark:hover:bg-zinc-900/60 text-zinc-600 dark:text-zinc-300">
                <span className="text-lg">🧪</span>
                <span>API Playground</span>
              </button>
              <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-zinc-100 dark:hover:bg-zinc-900/60 text-zinc-600 dark:text-zinc-300">
                <span className="text-lg">💡</span>
                <span>Use Cases</span>
              </button>
              <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-zinc-100 dark:hover:bg-zinc-900/60 text-zinc-600 dark:text-zinc-300">
                <span className="text-lg">💳</span>
                <span>Billing</span>
              </button>
              <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-zinc-100 dark:hover:bg-zinc-900/60 text-zinc-600 dark:text-zinc-300">
                <span className="text-lg">⚙️</span>
                <span>Settings</span>
              </button>
            </div>

            <div className="space-y-1">
              <p className="px-3 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500 dark:text-zinc-400">
                Resources
              </p>
              <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-zinc-100 dark:hover:bg-zinc-900/60 text-zinc-600 dark:text-zinc-300">
                <span className="text-lg">📜</span>
                <span>Documentation</span>
              </button>
              <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-zinc-100 dark:hover:bg-zinc-900/60 text-zinc-600 dark:text-zinc-300">
                <span className="text-lg">🔌</span>
                <span>Remote MCP</span>
              </button>
            </div>

            <div className="mt-auto px-3 pb-4">
              <div className="flex items-center gap-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3 py-2.5">
                <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-sky-500 via-violet-500 to-rose-500 text-xs flex items-center justify-center text-white font-semibold">
                  A
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium leading-tight">alexpats</p>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Researcher plan</p>
                </div>
                <button className="text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200">
                  Sign out
                </button>
              </div>
            </div>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 flex flex-col">
          {/* Top bar */}
          <header className="flex items-center justify-between gap-4 px-4 sm:px-6 pt-4 pb-3 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/80 dark:bg-black/60 backdrop-blur">
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <span className="text-zinc-400">Pages</span>
              <span>/</span>
              <span className="font-medium text-zinc-700 dark:text-zinc-200">Overview</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-full border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
                  Operational
                </span>
              </div>
              <button className="hidden sm:inline-flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900">
                <span className="text-lg">🌙</span>
              </button>
            </div>
          </header>

          <div className="flex-1 px-4 sm:px-6 py-6 space-y-6 max-w-6xl mx-auto w-full">
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
                <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-950/80">
                    <div>
                      <h2 className="text-sm font-semibold tracking-tight">API Keys</h2>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        Rotate keys regularly and remove any that are no longer in use.
                      </p>
                    </div>
                    <button
                      onClick={openCreateModal}
                      className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-1.5 text-xs font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      <span className="text-base leading-none">+</span>
                      <span>New key</span>
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-zinc-50 dark:bg-zinc-900/80 border-b border-zinc-200 dark:border-zinc-800">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-600 dark:text-zinc-300 uppercase tracking-[0.12em]">
                            Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-600 dark:text-zinc-300 uppercase tracking-[0.12em]">
                            API Key
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-600 dark:text-zinc-300 uppercase tracking-[0.12em]">
                            Created
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-600 dark:text-zinc-300 uppercase tracking-[0.12em]">
                            Last Used
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-semibold text-zinc-600 dark:text-zinc-300 uppercase tracking-[0.12em]">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                        {apiKeys.map((key) => (
                          <tr key={key.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                            <td className="px-6 py-3 whitespace-nowrap">
                              <div className="text-sm font-medium">{key.name}</div>
                            </td>
                            <td className="px-6 py-3 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <code className="text-xs font-mono text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-900 px-2 py-1 rounded-md">
                                  {revealedIds[key.id] ? key.key : maskApiKey(key.key)}
                                </code>
                                <button
                                  type="button"
                                  onClick={() => toggleReveal(key.id)}
                                  className="inline-flex items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 py-1 text-[11px] text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                  title={revealedIds[key.id] ? 'Hide key' : 'Show key'}
                                >
                                  {revealedIds[key.id] ? (
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      viewBox="0 0 24 24"
                                      className="h-4 w-4"
                                      aria-hidden="true"
                                    >
                                      <path
                                        d="M3 3l18 18"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                      />
                                      <path
                                        d="M4.5 8.75C6.2 6.7 8.88 5 12 5c4.42 0 7.45 2.64 9 5- .29.47-.62.93-1 1.37"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                      />
                                      <path
                                        d="M9.88 9.88A3 3 0 0114.12 14.1"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                      />
                                      <path
                                        d="M5 12.5C6.5 14.7 9.16 17 12 17c1.37 0 2.62-.38 3.72-.98"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                      />
                                    </svg>
                                  ) : (
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      viewBox="0 0 24 24"
                                      className="h-4 w-4"
                                      aria-hidden="true"
                                    >
                                      <path
                                        d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                      />
                                      <circle
                                        cx="12"
                                        cy="12"
                                        r="3"
                                        fill="currentColor"
                                      />
                                    </svg>
                                  )}
                                </button>
                                <button
                                  onClick={() => copyToClipboard(key.key, key.id)}
                                  className="inline-flex items-center rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 py-1 text-[11px] text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                  title="Copy full key"
                                >
                                  {copiedId === key.id ? 'Copied' : 'Copy'}
                                </button>
                              </div>
                            </td>
                            <td className="px-6 py-3 whitespace-nowrap">
                              <div className="text-xs text-zinc-600 dark:text-zinc-400">
                                {formatDate(key.createdAt)}
                              </div>
                            </td>
                            <td className="px-6 py-3 whitespace-nowrap">
                              <div className="text-xs text-zinc-600 dark:text-zinc-400">
                                {key.lastUsed ? (
                                  formatDate(key.lastUsed)
                                ) : (
                                  <span className="italic text-zinc-400 dark:text-zinc-500">Never</span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-3 whitespace-nowrap text-right">
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => openEditModal(key)}
                                  className="inline-flex items-center rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2.5 py-1 text-[11px] font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDelete(key.id)}
                                  className="inline-flex items-center rounded-md border border-red-200/80 dark:border-red-900 bg-red-50/80 dark:bg-red-950 px-2.5 py-1 text-[11px] font-medium text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900"
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
            </section>
          </div>
        </main>
      </div>

      {/* Modal for Create/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-zinc-950 rounded-3xl p-6 sm:p-7 w-full max-w-md shadow-2xl border border-zinc-200/80 dark:border-zinc-800">
            <div className="space-y-1 mb-5 text-center">
              <h2 className="text-lg sm:text-xl font-semibold tracking-tight">
                {editingKey ? 'Edit API key' : 'Create a new API key'}
              </h2>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
                Enter a name and limits for the new API key.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl">
                <p className="text-xs text-red-800 dark:text-red-200">{error}</p>
              </div>
            )}

            <form onSubmit={editingKey ? handleUpdate : handleCreate} className="space-y-5">
              {/* Key name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-zinc-800 dark:text-zinc-100">
                  Key Name
                </label>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mb-1">
                  A unique name to identify this key.
                </p>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-zinc-300 dark:border-zinc-700 rounded-2xl bg-white dark:bg-zinc-900 text-sm text-black dark:text-zinc-50 shadow-[0_0_0_1px_rgba(255,255,255,0.4)] focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  placeholder="Key name"
                  required
                />
              </div>

              {/* Key type */}
              <div className="space-y-2">
                <div>
                  <label className="block text-xs font-semibold text-zinc-800 dark:text-zinc-100">
                    Key Type
                  </label>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    Choose the environment for this key.
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  <button
                    type="button"
                    onClick={() => setKeyType('development')}
                    className={`flex items-start gap-3 rounded-2xl border px-3.5 py-2.5 text-left transition 
                    ${
                      keyType === 'development'
                        ? 'border-sky-500 bg-sky-50/80 dark:bg-sky-950/40'
                        : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900'
                    }`}
                  >
                    <span
                      className={`mt-1 h-3 w-3 rounded-full border-2 ${
                        keyType === 'development'
                          ? 'border-sky-500 bg-sky-500'
                          : 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900'
                      }`}
                    />
                    <div>
                      <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-50">
                        Development
                      </p>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        Rate limited to 100 requests/minute.
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setKeyType('production')}
                    className={`flex items-start gap-3 rounded-2xl border px-3.5 py-2.5 text-left transition ${
                      keyType === 'production'
                        ? 'border-sky-500 bg-sky-50/80 dark:bg-sky-950/40'
                        : 'border-zinc-200/70 dark:border-zinc-800/80 bg-zinc-50/60 dark:bg-zinc-900/40'
                    }`}
                  >
                    <span
                      className={`mt-1 h-3 w-3 rounded-full border-2 ${
                        keyType === 'production'
                          ? 'border-sky-500 bg-sky-500'
                          : 'border-zinc-300 dark:border-zinc-700 bg-white/70 dark:bg-zinc-900/60'
                      }`}
                    />
                    <div className="opacity-80">
                      <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-50">
                        Production
                      </p>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        Rate limited to 1,000 requests/minute.
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Monthly limit */}
              <div className="space-y-2">
                <label className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-800 dark:text-zinc-100">
                  <input
                    type="checkbox"
                    checked={limitEnabled}
                    onChange={(e) => setLimitEnabled(e.target.checked)}
                    className="h-3.5 w-3.5 rounded border-zinc-300 dark:border-zinc-700 text-sky-500 focus:ring-sky-500"
                  />
                  <span>Limit monthly usage</span>
                </label>
                <input
                  type="number"
                  min={0}
                  value={monthlyLimit}
                  onChange={(e) => setMonthlyLimit(e.target.value)}
                  disabled={!limitEnabled}
                  className={`w-full px-3.5 py-2.5 border rounded-2xl bg-white dark:bg-zinc-900 text-sm text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent ${
                    limitEnabled
                      ? 'border-zinc-300 dark:border-zinc-700'
                      : 'border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-600 bg-zinc-50 dark:bg-zinc-900/60'
                  }`}
                  placeholder="1000"
                />
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  If the combined usage of all your keys exceeds your account&apos;s allocated usage
                  limit, requests will be rejected.
                </p>
              </div>

              {/* API key value */}
              <div className="space-y-1.5 pt-1 border-t border-zinc-100 dark:border-zinc-800/70">
                <label className="block text-xs font-semibold text-zinc-800 dark:text-zinc-100">
                  API Key value
                </label>
                <input
                  type="text"
                  value={formData.key}
                  onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-zinc-300 dark:border-zinc-700 rounded-2xl bg-white dark:bg-zinc-900 text-sm text-black dark:text-zinc-50 font-mono focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  placeholder="tvly-dev-..."
                  required
                />
                <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                  Your key is only shown in full here. It will be partially masked in the overview.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingKey(null);
                    setFormData({ name: '', key: '' });
                    setKeyType('development');
                    setLimitEnabled(false);
                    setMonthlyLimit('');
                    setError(null);
                  }}
                  className="px-4 py-2 text-sm rounded-full border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-900/80"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm rounded-full bg-sky-600 text-white font-medium shadow-sm hover:bg-sky-700 disabled:opacity-60"
                >
                  {editingKey ? 'Save changes' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
