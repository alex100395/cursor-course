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
    <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm shadow-lg overflow-hidden">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 px-4 sm:px-6 py-3 sm:py-4 border-b border-white/10 bg-white/5">
        <div className="min-w-0 flex-1">
          <h2 className="text-xs sm:text-sm font-semibold tracking-tight text-white">API Keys</h2>
          <p className="text-[10px] sm:text-xs text-gray-400">
            Rotate keys regularly and remove any that are no longer in use.
          </p>
        </div>
        <button
          onClick={onCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white border-0 px-3 py-1.5 text-xs font-medium shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 w-full sm:w-auto justify-center"
        >
          <span className="text-base leading-none">+</span>
          <span>New key</span>
        </button>
      </div>
      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <table className="w-full text-xs sm:text-sm min-w-[600px]">
          <thead className="bg-white/5 border-b border-white/10">
            <tr>
              <th className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-[0.12em]">
                Name
              </th>
              <th className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-[0.12em]">
                API Key
              </th>
              <th className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-[0.12em] hidden md:table-cell">
                Created
              </th>
              <th className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-[0.12em] hidden lg:table-cell">
                Last Used
              </th>
              <th className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-right text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-[0.12em]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10 bg-white/5">
            {apiKeys.map((key) => (
              <tr key={key.id} className="hover:bg-white/5 transition-colors">
                <td className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 whitespace-nowrap">
                  <div className="text-xs sm:text-sm font-medium text-white">{key.name}</div>
                </td>
                <td className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 whitespace-nowrap">
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                    <code className="text-[10px] sm:text-xs font-mono text-gray-300 bg-white/10 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md break-all max-w-[120px] sm:max-w-none">
                      {revealedIds[key.id] ? key.key : maskApiKey(key.key)}
                    </code>
                    <button
                      type="button"
                      onClick={() => toggleReveal(key.id)}
                      className="inline-flex items-center justify-center rounded-md border border-white/20 bg-white/5 hover:bg-white/10 px-1.5 sm:px-2 py-1 text-[10px] sm:text-[11px] text-gray-300 hover:text-white transition-colors shrink-0"
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
                      className="inline-flex items-center rounded-md border border-white/20 bg-white/5 hover:bg-white/10 px-1.5 sm:px-2 py-1 text-[10px] sm:text-[11px] text-gray-300 hover:text-white transition-colors shrink-0"
                      title="Copy full key"
                    >
                      {copiedId === key.id ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </td>
                <td className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 whitespace-nowrap hidden md:table-cell">
                  <div className="text-[10px] sm:text-xs text-gray-400">
                    {formatDate(key.createdAt)}
                  </div>
                </td>
                <td className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 whitespace-nowrap hidden lg:table-cell">
                  <div className="text-[10px] sm:text-xs text-gray-400">
                    {key.lastUsed ? (
                      formatDate(key.lastUsed)
                    ) : (
                      <span className="italic text-gray-500">Never</span>
                    )}
                  </div>
                </td>
                <td className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 whitespace-nowrap text-right">
                  <div className="flex justify-end gap-1.5 sm:gap-2">
                    <button
                      onClick={() => onEdit(key)}
                      className="inline-flex items-center rounded-md border border-white/20 bg-white/5 hover:bg-white/10 px-2 sm:px-2.5 py-1 text-[10px] sm:text-[11px] font-medium text-gray-300 hover:text-white transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(key.id)}
                      className="inline-flex items-center rounded-md border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 px-2 sm:px-2.5 py-1 text-[10px] sm:text-[11px] font-medium text-red-400 hover:text-red-300 transition-colors"
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

