export interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsed?: string;
}

export interface ApiKeyFormData {
  name: string;
  key: string;
}

