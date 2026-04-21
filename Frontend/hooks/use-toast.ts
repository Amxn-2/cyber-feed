import { useState, useEffect, useCallback } from 'react';

type ToastVariant = 'default' | 'destructive' | 'success';

interface ToastOptions {
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

interface Toast extends ToastOptions {
  id: string;
}

let toastCount = 0;
const subscribers = new Set<(toasts: Toast[]) => void>();
let toasts: Toast[] = [];

const notifySubscribers = () => {
  subscribers.forEach((callback) => callback([...toasts]));
};

export const toast = (options: ToastOptions) => {
  const id = `toast-${toastCount++}`;
  const newToast: Toast = { ...options, id };
  toasts = [...toasts, newToast];
  notifySubscribers();

  if (options.duration !== 0) {
    setTimeout(() => {
      toasts = toasts.filter((t) => t.id !== id);
      notifySubscribers();
    }, options.duration || 5000);
  }

  return id;
};

export const useToast = () => {
  const [currentToasts, setCurrentToasts] = useState<Toast[]>(toasts);

  useEffect(() => {
    subscribers.add(setCurrentToasts);
    return () => {
      subscribers.delete(setCurrentToasts);
    };
  }, []);

  return {
    toast,
    toasts: currentToasts,
  };
};
