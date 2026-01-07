'use client';

import { useState } from 'react';
import type { ApiKey } from '../types/apiKey';
import { maskApiKey, formatDate } from '../lib/utils';

interface ApiKeysTableProps {
  apiKeys: ApiKey[];
  onEdit: (key: ApiKey) => void;
  onDelete: (id: string) => void;
  onCopy: (text: string, id: string) => void;
  onCreate: () => void;
  copiedId: string | null;
}

export default function ApiKeysTable({
  apiKeys,
  onEdit,
  onDelete,
  onCopy,
  onCreate,
  copiedId,
}: ApiKeysTableProps) {
  const [revealedIds, setRevealedIds] = useState<Record<string, boolean>>({});

  const toggleReveal = (id: string) => {
    setRevealedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-950/80">
        <div>
          <h2 className="text-sm font-semibold tracking-tight">API Keys</h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Rotate keys regularly and remove any that are no longer in use.
          </p>
        </div>
        <button
          onClick={onCreate}
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
                          <circle cx="12" cy="12" r="3" fill="currentColor" />
                        </svg>
                      )}
                    </button>
                    <button
                      onClick={() => onCopy(key.key, key.id)}
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
                      onClick={() => onEdit(key)}
                      className="inline-flex items-center rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2.5 py-1 text-[11px] font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(key.id)}
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
  );
}

