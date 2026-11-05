import { Component, type ReactNode } from "react";
import { ApiError } from "../lib/apiClient";

const MENSAJE_INESPERADO = "Ocurrió un error inesperado, intenta de nuevo.";

function FallbackScreen({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="flex min-h-[50vh] flex-col items-center justify-center gap-3 p-6 text-center"
    >
      <p className="text-lg font-semibold text-nova-ink">{message}</p>
      <button
        type="button"
        onClick={() => {
          window.location.href = "/";
        }}
        className="rounded-full bg-nova-primary px-6 py-2 font-semibold text-white hover:bg-nova-primary-strong"
      >
        Volver al inicio
      </button>
    </div>
  );
}

/** Nunca expone stack traces al usuario (FR-012). */
export default class ErrorBoundary extends Component<{ children: ReactNode }> {
  state = { failed: false, message: MENSAJE_INESPERADO };

  static getDerivedStateFromError(error: unknown) {
    const message =
      error instanceof ApiError && error.message ? error.message : MENSAJE_INESPERADO;
    return { failed: true, message };
  }

  componentDidCatch(_error: unknown) {
    // El detalle técnico queda solo en consola de desarrollo, nunca en pantalla.
    if (import.meta.env.DEV) console.error(_error);
  }

  render() {
    if (this.state.failed) return <FallbackScreen message={this.state.message} />;
    return this.props.children;
  }
}
