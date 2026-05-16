import { createContext } from "react";

export type StatusType = "success" | "error" | "info";

export type Toast = {
  id: number;
  text: string;
  type: StatusType;
};

export type ToastContextType = {
  showMessage: (text: string, type?: StatusType) => void;
  removeToast: (id: number) => void;
  toasts: Toast[];
};

export const ToastContext = createContext<ToastContextType | null>(null);
