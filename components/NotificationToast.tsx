'use client';

interface NotificationToastProps {
  message: string;
  type: 'success' | 'error';
  isVisible: boolean;
}

export default function NotificationToast({ message, type, isVisible }: NotificationToastProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[10000] animate-[slideDown_0.3s_ease-out]">
      <div
        className={`bg-white dark:bg-zinc-900 rounded-lg px-4 py-3 shadow-lg border flex items-center gap-3 min-w-[300px] max-w-md ${
          type === 'error' ? 'border-red-500/50' : 'border-green-500/50'
        }`}
      >
        <div className="text-2xl flex-shrink-0">{type === 'error' ? '❌' : '✅'}</div>
        <div className="flex-1">
          <p
            className={`text-sm font-medium ${
              type === 'error'
                ? 'text-red-700 dark:text-red-300'
                : 'text-zinc-900 dark:text-zinc-50'
            }`}
          >
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}

