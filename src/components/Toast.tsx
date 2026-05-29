"use client";

import { useEffect, useState } from "react";
import { FiCheckCircle, FiXCircle, FiX } from "react-icons/fi";

export type ToastType = "success" | "error" | "info";

interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

let toastListeners: ((msg: ToastMessage) => void)[] = [];

export function showToast(message: string, type: ToastType = "info") {
  const id = Math.random().toString(36).substring(7);
  toastListeners.forEach((listener) => listener({ id, message, type }));
  return id;
}

export default function Toast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const listener = (msg: ToastMessage) => {
      setToasts((prev) => [...prev, msg]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== msg.id));
      }, 4000);
    };
    toastListeners.push(listener);
    return () => {
      toastListeners = toastListeners.filter((l) => l !== listener);
    };
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const getIcon = (type: ToastType) => {
    switch (type) {
      case "success":
        return <FiCheckCircle className="text-green-400 text-xl" />;
      case "error":
        return <FiXCircle className="text-red-400 text-xl" />;
      default:
        return <FiCheckCircle className="text-blue-400 text-xl" />;
    }
  };

  const getBgColor = (type: ToastType) => {
    switch (type) {
      case "success":
        return "bg-green-900/90 border-green-600";
      case "error":
        return "bg-red-900/90 border-red-600";
      default:
        return "bg-blue-900/90 border-blue-600";
    }
  };

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg text-white min-w-[300px] animate-slide-in ${getBgColor(toast.type)}`}
        >
          {getIcon(toast.type)}
          <span className="flex-1 text-sm">{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-white/70 hover:text-white transition"
          >
            <FiX />
          </button>
        </div>
      ))}
    </div>
  );
}