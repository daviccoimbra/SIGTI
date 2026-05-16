import { useState, ReactNode } from "react";
import { ToastContext, type StatusType, type Toast } from "./toastContextInstance";

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const showMessage = (text: string, type: StatusType = "info") => {
    const id = Date.now();

    setToasts((prev) => {
      const updated = [...prev, { id, text, type }];
      return updated.slice(-3); // 🔥 limite de 3 toasts
    });
  };

  return (
    <ToastContext.Provider value={{ showMessage, removeToast, toasts }}>
      {children}
    </ToastContext.Provider>
  );
};