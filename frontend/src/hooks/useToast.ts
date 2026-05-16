import { useContext } from "react";
import { ToastContext } from "../context/toastContextInstance";

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error("O comando useToast deve ser usado dentro do provedor.");
  return context;
};
