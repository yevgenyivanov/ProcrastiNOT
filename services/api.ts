import axios, { AxiosInstance } from 'axios';

// Base URL Configuration
const BASE_URL = 'https://your-backend-url';

// Axios Instance Configuration
const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add Token to Requests
export const setAuthToken = (token: string | null): void => {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
  }
};

// Types for API Responses
export interface LoginResponse {
  token: string;
}

export interface ListItem {
  _id: string;
  name: string;
  items: string[];
}

// Auth APIs
export const login = async (
  username: string,
  password: string
): Promise<LoginResponse> => {
  const response = await apiClient.post<LoginResponse>('/login', { username, password });
  return response.data;
};

// List APIs
export const fetchLists = async (): Promise<ListItem[]> => {
  const response = await apiClient.get<ListItem[]>('/lists');
  return response.data;
};

export const createList = async (listName: string): Promise<ListItem> => {
  const response = await apiClient.post<ListItem>('/lists', { name: listName });
  return response.data;
};

export const updateList = async (
  listId: string,
  updatedItems: string[]
): Promise<ListItem> => {
  const response = await apiClient.put<ListItem>(`/lists/${listId}`, { items: updatedItems });
  return response.data;
};

export const deleteList = async (listId: string): Promise<void> => {
  await apiClient.delete(`/lists/${listId}`);
};
