import { create } from 'zustand';

import type { ToastActionElement, ToastProps } from '@/components/ui/Toast';

const TOAST_LIMIT = 5;
const TOAST_REMOVE_DELAY = 5000;

type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
};

interface ToastState {
  toasts: ToasterToast[];
  toast: (props: Omit<ToasterToast, 'id'>) => string;
  dismiss: (toastId?: string) => void;
  removeToast: (toastId: string) => void;
}

let count = 0;

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],

  toast: (props) => {
    const id = genId();

    const newToast: ToasterToast = {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) get().dismiss(id);
      },
    };

    set((state) => ({
      toasts: [newToast, ...state.toasts].slice(0, TOAST_LIMIT),
    }));

    // Auto dismiss after TOAST_REMOVE_DELAY
    setTimeout(() => {
      get().dismiss(id);
    }, TOAST_REMOVE_DELAY);

    return id;
  },

  dismiss: (toastId) => {
    set((state) => ({
      toasts: state.toasts.map((t) =>
        t.id === toastId || toastId === undefined ? { ...t, open: false } : t
      ),
    }));

    // Remove from DOM after animation
    setTimeout(() => {
      if (toastId) {
        get().removeToast(toastId);
      }
    }, 300);
  },

  removeToast: (toastId) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== toastId),
    }));
  },
}));

export function useToast() {
  const { toasts, toast, dismiss } = useToastStore();
  return { toasts, toast, dismiss };
}
