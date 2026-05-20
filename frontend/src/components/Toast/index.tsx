import { useEffect, useRef, useState, useCallback } from "react";
import { useToast } from "../../hooks/useToast";
import { type Toast } from "../../context/toastContextInstance";

export const ToastContainer = () => {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed bottom-5 left-5 flex flex-col gap-2 z-50">
      {toasts.map((toast) => (
        <ToastCard
          key={toast.id}
          toast={toast}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};

const ToastCard = ({
  toast,
  onClose,
}: {
  toast: Toast;
  onClose: () => void;
}) => {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(100);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const duration = 3000;

  const handleClose = useCallback(() => {
    setVisible(false);
    setTimeout(onClose, 300);
  }, [onClose]);

  const startTimer = useCallback(() => {
    const startTime = Date.now();

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const percent = 100 - (elapsed / duration) * 100;

      setProgress(percent);

      if (elapsed >= duration) {
        if (timerRef.current) clearInterval(timerRef.current);
        handleClose();
      }
    }, 50);
  }, [handleClose]);

  useEffect(() => {
    // entrada
    const enterTimer = setTimeout(() => setVisible(true), 10);
    startTimer();

    return () => {
      clearTimeout(enterTimer);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startTimer]);

  const handlePause = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleResume = () => {
    startTimer();
  };

  return (
    <div
      onMouseEnter={handlePause}
      onMouseLeave={handleResume}
      className={`relative overflow-hidden px-4 py-3 rounded-lg shadow-lg text-white min-w-[250px] font-bold
        transition-all duration-300
        ${
          visible
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-5"
        }
        ${
          toast.type === "success"
            ? "bg-green-500"
            : toast.type === "error"
            ? "bg-red-500"
            : "bg-blue-500"
        }
      `}
    >
      {/* Botão fechar */}
      <button
        onClick={handleClose}
        className="absolute top-1 right-2 text-white text-sm"
      >
        ✕
      </button>

      {/* Texto */}
      <p className="pr-5">{toast.text}</p>

      {/* Barra de progresso */}
      <div className="absolute bottom-0 left-0 h-1 bg-white/30 w-full">
        <div
          className="h-full bg-white transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};