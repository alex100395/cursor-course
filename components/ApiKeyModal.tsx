'use client';

import { type FormEvent } from 'react';
import type { ApiKey, ApiKeyFormData } from '../types/apiKey';

interface ApiKeyModalProps {
  isOpen: boolean;
  editingKey: ApiKey | null;
  formData: ApiKeyFormData;
  keyType: 'development' | 'production';
  limitEnabled: boolean;
  monthlyLimit: string;
  error: string | null;
  onClose: () => void;
  onSubmit: (e: FormEvent) => void;
  onFormDataChange: (data: ApiKeyFormData) => void;
  onKeyTypeChange: (type: 'development' | 'production') => void;
  onLimitEnabledChange: (enabled: boolean) => void;
  onMonthlyLimitChange: (limit: string) => void;
  onErrorChange: (error: string | null) => void;
}

export default function ApiKeyModal({
  isOpen,
  editingKey,
  formData,
  keyType,
  limitEnabled,
  monthlyLimit,
  error,
  onClose,
  onSubmit,
  onFormDataChange,
  onKeyTypeChange,
  onLimitEnabledChange,
  onMonthlyLimitChange,
  onErrorChange,
}: ApiKeyModalProps) {
  if (!isOpen) return null;

  const handleClose = () => {
    onFormDataChange({ name: '', key: '' });
    onKeyTypeChange('development');
    onLimitEnabledChange(false);
    onMonthlyLimitChange('');
    onErrorChange(null);
    onClose();
  };

  return (
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

        <form onSubmit={onSubmit} className="space-y-5">
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
              onChange={(e) => onFormDataChange({ ...formData, name: e.target.value })}
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
                onClick={() => onKeyTypeChange('development')}
                className={`flex items-start gap-3 rounded-2xl border px-3.5 py-2.5 text-left transition ${
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
                onClick={() => onKeyTypeChange('production')}
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
                onChange={(e) => onLimitEnabledChange(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-zinc-300 dark:border-zinc-700 text-sky-500 focus:ring-sky-500"
              />
              <span>Limit monthly usage</span>
            </label>
            <input
              type="number"
              min={0}
              value={monthlyLimit}
              onChange={(e) => onMonthlyLimitChange(e.target.value)}
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
              onChange={(e) => onFormDataChange({ ...formData, key: e.target.value })}
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
              onClick={handleClose}
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
  );
}

