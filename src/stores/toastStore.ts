import { create } from 'zustand';

export interface ToastUndo {
  label: string;
  onClick: () => void;
}

export interface ToastOptions {
  message: string;
  undo?: ToastUndo;
  duration?: number;
}

interface ToastState {
  toast: ToastOptions | null;
  showToast: (toast: ToastOptions) => void;
  hideToast: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toast: null,
  showToast: (toast) => set({ toast }),
  hideToast: () => set({ toast: null }),
}));
