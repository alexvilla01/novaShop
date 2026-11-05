import { apiClient } from "../lib/apiClient";

interface AdminSession {
  username: string;
}

export async function getSession(): Promise<AdminSession | null> {
  try {
    return await apiClient.get<AdminSession>("/api/admin/session");
  } catch (error) {
    if (error instanceof Error && "status" in error && (error as { status?: number }).status === 401) {
      return null;
    }
    throw error;
  }
}

export async function login(username: string, password: string): Promise<AdminSession> {
  return apiClient.post<AdminSession>("/api/admin/session", { username, password });
}

export async function logout(): Promise<void> {
  await apiClient.delete<void>("/api/admin/session");
}
