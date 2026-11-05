export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

const BASE_URL = import.meta.env.VITE_API_URL ?? "";

const MENSAJES_AMIGABLES: Record<number, string> = {
  400: "La petición no pudo procesarse. Revisa los datos e intenta de nuevo.",
  401: "Necesitas iniciar sesión para continuar.",
  404: "El elemento que buscas no existe o ya no está disponible.",
  409: "El producto no está disponible en este momento.",
  500: "Servicio temporalmente no disponible, intenta de nuevo.",
};

interface ProblemDetailResponse {
  title?: string;
  detail?: string;
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  let response: Response;
  try {
    response = await fetch(BASE_URL + path, {
      method,
      credentials: "include",
      headers: body === undefined ? undefined : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, MENSAJES_AMIGABLES[500] ?? "Error de conexión.");
  }

  if (response.status === 204 || response.status === 304) {
    return undefined as T;
  }

  if (!response.ok) {
    const message = await friendlyMessage(response);
    throw new ApiError(response.status, message);
  }
  return (await response.json()) as T;
}

async function friendlyMessage(response: Response): Promise<string> {
  let body: ProblemDetailResponse | null = null;
  try {
    body = (await response.json()) as ProblemDetailResponse;
  } catch {
    body = null;
  }
  if (body && typeof body.detail === "string" && body.detail.length > 0) {
    return body.detail;
  }
  return MENSAJES_AMIGABLES[response.status] ?? "Ocurrió un error inesperado.";
}

export const apiClient = {
  get: <T>(path: string) => request<T>("GET", path),
  post: <T>(path: string, body: unknown) => request<T>("POST", path, body),
  put: <T>(path: string, body: unknown) => request<T>("PUT", path, body),
  delete: <T>(path: string) => request<T>("DELETE", path),
};
