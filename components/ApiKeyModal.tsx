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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto">
      <div className="bg-black/95 border border-white/10 rounded-3xl p-4 sm:p-6 lg:p-7 w-full max-w-md shadow-2xl backdrop-blur-sm my-4 sm:my-8">
        <div className="space-y-1 mb-5 text-center">
          <h2 className="text-lg sm:text-xl font-semibold tracking-tight text-white">
            {editingKey ? 'Edit API key' : 'Create a new API key'}
          </h2>
          <p className="text-xs sm:text-sm text-gray-400">
            Enter a name and limits for the new API key.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-2xl backdrop-blur-sm">
            <p className="text-xs text-red-400">{error}</p>
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-5">
          {/* Key name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-white">
              Key Name
            </label>
            <p className="text-[11px] text-gray-400 mb-1">
              A unique name to identify this key.
            </p>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => onFormDataChange({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-white/20 rounded-2xl bg-white/5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500/50 backdrop-blur-sm"
              placeholder="Key name"
              required
            />
          </div>

          {/* Key type */}
          <div className="space-y-2">
            <div>
              <label className="block text-xs font-semibold text-white">
                Key Type
              </label>
              <p className="text-[11px] text-gray-400">
                Choose the environment for this key.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => onKeyTypeChange('development')}
                className={`flex items-start gap-3 rounded-2xl border px-3.5 py-2.5 text-left transition ${
                  keyType === 'development'
                    ? 'border-purple-500 bg-purple-500/20'
                    : 'border-white/20 hover:bg-white/5'
                }`}
              >
                <span
                  className={`mt-1 h-3 w-3 rounded-full border-2 ${
                    keyType === 'development'
                      ? 'border-purple-500 bg-purple-500'
                      : 'border-white/30 bg-transparent'
                  }`}
                />
                <div>
                  <p className="text-xs font-semibold text-white">
                    Development
                  </p>
                  <p className="text-[11px] text-gray-400">
                    Rate limited to 100 requests/minute.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => onKeyTypeChange('production')}
                className={`flex items-start gap-3 rounded-2xl border px-3.5 py-2.5 text-left transition ${
                  keyType === 'production'
                    ? 'border-purple-500 bg-purple-500/20'
                    : 'border-white/20 hover:bg-white/5'
                }`}
              >
                <span
                  className={`mt-1 h-3 w-3 rounded-full border-2 ${
                    keyType === 'production'
                      ? 'border-purple-500 bg-purple-500'
                      : 'border-white/30 bg-transparent'
                  }`}
                />
                <div className="opacity-80">
                  <p className="text-xs font-semibold text-white">
                    Production
                  </p>
                  <p className="text-[11px] text-gray-400">
                    Rate limited to 1,000 requests/minute.
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Monthly limit */}
          <div className="space-y-2">
            <label className="inline-flex items-center gap-2 text-xs font-semibold text-white">
              <input
                type="checkbox"
                checked={limitEnabled}
                onChange={(e) => onLimitEnabledChange(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-white/30 bg-white/5 text-purple-500 focus:ring-purple-500"
              />
              <span>Limit monthly usage</span>
            </label>
            <input
              type="number"
              min={0}
              value={monthlyLimit}
              onChange={(e) => onMonthlyLimitChange(e.target.value)}
              disabled={!limitEnabled}
              className={`w-full px-3.5 py-2.5 border rounded-2xl bg-white/5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500/50 backdrop-blur-sm ${
                limitEnabled
                  ? 'border-white/20'
                  : 'border-white/10 text-gray-500 bg-white/5'
              }`}
              placeholder="1000"
            />
            <p className="text-[11px] text-gray-400">
              If the combined usage of all your keys exceeds your account&apos;s allocated usage
              limit, requests will be rejected.
            </p>
          </div>

          {/* API key value */}
          <div className="space-y-1.5 pt-1 border-t border-white/10">
            <label className="block text-xs font-semibold text-white">
              API Key value
            </label>
            <input
              type="text"
              value={formData.key}
              onChange={(e) => onFormDataChange({ ...formData, key: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-white/20 rounded-2xl bg-white/5 text-sm text-white font-mono placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500/50 backdrop-blur-sm"
              placeholder="tvly-dev-..."
              required
            />
            <p className="mt-1 text-[11px] text-gray-400">
              Your key is only shown in full here. It will be partially masked in the overview.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-xs sm:text-sm rounded-full border border-white/20 text-white bg-white/5 hover:bg-white/10 transition-colors backdrop-blur-sm w-full sm:w-auto order-2 sm:order-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs sm:text-sm rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white font-medium shadow-lg shadow-purple-500/50 hover:shadow-purple-500/70 transition-all duration-300 hover:scale-105 disabled:opacity-60 w-full sm:w-auto order-1 sm:order-2"
            >
              {editingKey ? 'Save changes' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

