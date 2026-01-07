/**
 * Notification messages used throughout the application
 * Centralized location for all notification text to ensure consistency
 */

export const NOTIFICATIONS = {
  // Success messages
  SUCCESS: 'Success!',
  COPIED_TO_CLIPBOARD: 'Copied to clipboard!',
  API_KEY_CREATED: 'API key created successfully!',
  API_KEY_DELETED: 'API key deleted successfully!',
  VALID_API_KEY: 'Valid API key, /protected can be accessed',
  
  // Error messages
  FAILED_TO_FETCH_API_KEYS: 'Failed to fetch API keys',
  FAILED_TO_CREATE_API_KEY: 'Failed to create API key',
  FAILED_TO_UPDATE_API_KEY: 'Failed to update API key',
  FAILED_TO_DELETE_API_KEY: 'Failed to delete API key',
  FAILED_TO_COPY: 'Failed to copy to clipboard. Please try again.',
  INVALID_API_KEY: 'Invalid API key',
};

// Alternative export as individual constants for easier destructuring
export const {
  SUCCESS,
  COPIED_TO_CLIPBOARD,
  API_KEY_CREATED,
  API_KEY_DELETED,
  VALID_API_KEY,
  FAILED_TO_FETCH_API_KEYS,
  FAILED_TO_CREATE_API_KEY,
  FAILED_TO_UPDATE_API_KEY,
  FAILED_TO_DELETE_API_KEY,
  FAILED_TO_COPY,
  INVALID_API_KEY,
} = NOTIFICATIONS;

