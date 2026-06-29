import * as SecureStore from 'expo-secure-store';
import { API_URL as BASE_URL } from '../constants';

const TOKEN_KEY = 'unifesto_access_token';

export async function getToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function saveToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function clearToken(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

export async function makeAuthenticatedRequest(
  path: string,
  options: RequestInit = {}
): Promise<Response | null> {
  try {
    const token = await getToken();
    if (!token) throw new Error('No token');

    const response = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (response.status === 401) {
      await clearToken();
      // Emit unauthorized event
    }

    return response;
  } catch {
    return null;
  }
}

export async function makePublicRequest(
  path: string,
  options: RequestInit = {}
): Promise<Response | null> {
  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    return response;
  } catch {
    return null;
  }
}
