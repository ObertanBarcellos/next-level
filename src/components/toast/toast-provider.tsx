"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { CircleCheck, Info, TriangleAlert, X } from "lucide-react";
import { Button } from "@/src/components/button/button";

type ToastVariant = "info" | "warn" | "success" | "custom";

interface ToastBaseOptions {
  title?: string;
  description?: string;
  duration?: number;
  sticky?: boolean;
}

type ToastRenderer = (props: { id: string; close: () => void }) => ReactNode;

interface ToastOptions extends ToastBaseOptions {
  variant?: ToastVariant;
  render?: ToastRenderer;
}

interface ToastItem extends ToastBaseOptions {
  id: string;
  variant: ToastVariant;
  render?: ToastRenderer;
}

interface ToastContextValue {
  show: (options: ToastOptions) => string;
  info: (options?: ToastBaseOptions) => string;
  warn: (options?: ToastBaseOptions) => string;
  success: (options?: ToastBaseOptions) => string;
  custom: (options: ToastBaseOptions & { render: ToastRenderer }) => string;
  close: (id: string) => void;
  clear: () => void;
}

const DEFAULT_DURATION = 5000;

const ToastContext = createContext<ToastContextValue | null>(null);

const toastToneMap: Record<
  Exclude<ToastVariant, "custom">,
  { icon: ReactNode; barClass: string; badgeClass: string; accentClass: string }
> = {
  info: {
    icon: <Info size={20} className="text-sky-600" />,
    barClass: "bg-sky-600",
    badgeClass: "bg-sky-50 text-sky-700 border-sky-200",
    accentClass: "bg-sky-600/90",
  },
  warn: {
    icon: <TriangleAlert size={20} className="text-amber-600" />,
    barClass: "bg-amber-600",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
    accentClass: "bg-amber-600/90",
  },
  success: {
    icon: <CircleCheck size={20} className="text-emerald-600" />,
    barClass: "bg-emerald-600",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
    accentClass: "bg-emerald-600/90",
  },
};

function getDefaultTitle(variant: ToastVariant) {
  if (variant === "warn") return "Atencao";
  if (variant === "success") return "Sucesso";
  if (variant === "custom") return "Notificacao";
  return "Informacao";
}

function ToastCard({
  toast,
  onClose,
}: {
  toast: ToastItem;
  onClose: (id: string) => void;
}) {
  const variant = toast.variant === "custom" ? "info" : toast.variant;
  const isSticky = toast.sticky === true;
  const duration = toast.duration ?? DEFAULT_DURATION;
  const tone = toastToneMap[variant];

  return (
    <article className="w-[360px] overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-lg animate-[toast-enter_220ms_ease-out]">
      <div className="flex items-start gap-3 px-4 py-3">
        {toast.render ? (
          <div className="w-full">{toast.render({ id: toast.id, close: () => onClose(toast.id) })}</div>
        ) : (
          <>
            <div className="mt-0.5 flex items-center gap-2">
              <div className={`h-10 w-1 rounded-full ${tone.accentClass}`} />
              <div className="flex h-10 items-center">{tone.icon}</div>
            </div>
            <div className="min-w-0 flex-1">
              <div className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold ${tone.badgeClass}`}>
                {getDefaultTitle(toast.variant)}
              </div>
              {toast.title ? <p className="mt-1 text-sm font-semibold text-zinc-900">{toast.title}</p> : null}
              {toast.description ? <p className="mt-1 text-sm text-zinc-600">{toast.description}</p> : null}
            </div>
          </>
        )}
        <Button
          type="button"
          aria-label="Fechar notificacao"
          onClick={() => onClose(toast.id)}
          variant="icon-plain"
          tone="neutral"
          className="text-zinc-400 hover:text-zinc-700"
        >
          <X size={16} />
        </Button>
      </div>
      {!isSticky ? (
        <div className="h-1 w-full bg-zinc-100">
          <div
            className={`h-full origin-left ${tone.barClass}`}
            style={{ animation: `toast-progress ${duration}ms linear forwards` }}
          />
        </div>
      ) : null}
    </article>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const close = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const show = useCallback(
    (options: ToastOptions) => {
      const id = crypto.randomUUID();
      const nextToast: ToastItem = {
        id,
        variant: options.variant ?? "info",
        title: options.title,
        description: options.description,
        duration: options.duration,
        sticky: options.sticky,
        render: options.render,
      };

      setToasts((current) => [...current, nextToast]);

      if (!nextToast.sticky) {
        window.setTimeout(() => {
          close(id);
        }, nextToast.duration ?? DEFAULT_DURATION);
      }

      return id;
    },
    [close]
  );

  const contextValue = useMemo<ToastContextValue>(
    () => ({
      show,
      info: (options) => show({ variant: "info", ...options }),
      warn: (options) => show({ variant: "warn", ...options }),
      success: (options) => show({ variant: "success", ...options }),
      custom: (options) => show({ variant: "custom", ...options }),
      close,
      clear: () => setToasts([]),
    }),
    [close, show]
  );

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[9999] flex w-fit max-w-[calc(100vw-2rem)] flex-col gap-3">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastCard toast={toast} onClose={close} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used inside ToastProvider.");
  }

  return context;
}

export { DEFAULT_DURATION };
