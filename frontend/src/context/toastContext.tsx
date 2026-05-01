import { createContext, useContext, useState, ReactNode } from "react";

export type StatusType = "success" | "error" | "info";

export type Toast = {
  id: number;
  text: string;
  type: StatusType;
};

type ToastContextType = {
  showMessage: (text: string, type?: StatusType) => void;
  removeToast: (id: number) => void;
  toasts: Toast[];
};

const ToastContext = createContext<ToastContextType | null>(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error("O comando useToast deve ser usado dentro do provedor.");
  return context;
};

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