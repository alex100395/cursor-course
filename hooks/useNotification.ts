import { useState, useCallback } from 'react';

export function useNotification() {
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState<string>('');
  const [notificationType, setNotificationType] = useState<'success' | 'error'>('success');

  const displayNotification = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setNotificationMessage(message);
    setNotificationType(type);
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
      setNotificationMessage('');
    }, 3000);
  }, []);

  return {
    showNotification,
    notificationMessage,
    notificationType,
    displayNotification,
  };
}

