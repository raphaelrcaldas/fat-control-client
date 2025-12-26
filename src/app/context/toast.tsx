"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import {
   MdCheckCircle,
   MdError,
   MdWarning,
   MdInfo,
   MdClose,
} from "react-icons/md";

type Toast = {
   id: string;
   title?: string;
   message: string;
   type?: "info" | "success" | "warning" | "error";
};

type ToastContextValue = {
   toasts: Toast[];
   push: (t: Omit<Toast, "id">) => void;
   remove: (id: string) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const toastConfig = {
   success: {
      icon: MdCheckCircle,
      color: "text-green-600 dark:text-green-400",
      bg: "bg-green-100 dark:bg-green-800",
      border: "border-green-300 dark:border-green-700",
      progress: "bg-green-500",
   },
   error: {
      icon: MdError,
      color: "text-red-600 dark:text-red-400",
      bg: "bg-red-100 dark:bg-red-800",
      border: "border-red-300 dark:border-red-700",
      progress: "bg-red-500",
   },
   warning: {
      icon: MdWarning,
      color: "text-yellow-600 dark:text-yellow-400",
      bg: "bg-yellow-100 dark:bg-yellow-800",
      border: "border-yellow-300 dark:border-yellow-700",
      progress: "bg-yellow-500",
   },
   info: {
      icon: MdInfo,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-100 dark:bg-blue-800",
      border: "border-blue-300 dark:border-blue-700",
      progress: "bg-blue-500",
   },
};

function ToastItem({
   toast,
   onRemove,
}: {
   toast: Toast;
   onRemove: (id: string) => void;
}) {
   const [isExiting, setIsExiting] = useState(false);
   const config = toastConfig[toast.type || "info"];
   const Icon = config.icon;

   const handleRemove = () => {
      setIsExiting(true);
      setTimeout(() => onRemove(toast.id), 300);
   };

   return (
      <div
         className={`pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg border ${config.border} ${config.bg} shadow-lg transition-all duration-300 ease-out ${
            isExiting
               ? "translate-y-2 scale-95 opacity-0"
               : "translate-y-0 scale-100 opacity-100"
         } `}
         role="alert"
      >
         <div className="relative p-4">
            <div className="flex items-start gap-3">
               <div className={`shrink-0 ${config.color}`}>
                  <Icon className="h-6 w-6" />
               </div>

               <div className="min-w-0 flex-1">
                  {toast.title && (
                     <h3 className="mb-1 text-sm font-semibold text-gray-900 dark:text-white">
                        {toast.title}
                     </h3>
                  )}
                  <p className="text-sm text-gray-800 dark:text-gray-100">
                     {toast.message}
                  </p>
               </div>

               <button
                  onClick={handleRemove}
                  className="inline-flex shrink-0 rounded-md text-gray-600 transition-colors hover:text-gray-900 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:outline-none dark:text-gray-300 dark:hover:text-white"
                  aria-label="Fechar"
               >
                  <MdClose className="h-5 w-5" />
               </button>
            </div>

            {/* Progress bar */}
            <div className="absolute right-0 bottom-0 left-0 h-1 bg-gray-200 dark:bg-gray-700">
               <div
                  className={`h-full ${config.progress} animate-toast-progress`}
                  style={{
                     animation: "toast-progress 6s linear forwards",
                  }}
               />
            </div>
         </div>
      </div>
   );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
   const [toasts, setToasts] = useState<Toast[]>([]);

   const push = useCallback((t: Omit<Toast, "id">) => {
      const id = String(Date.now()) + Math.random().toString(36).slice(2, 8);
      const toast: Toast = { id, ...t };
      setToasts((s) => [toast, ...s]);

      // Auto-remove after 6s
      setTimeout(() => {
         setToasts((s) => s.filter((x) => x.id !== id));
      }, 6000);
   }, []);

   const remove = useCallback((id: string) => {
      setToasts((s) => s.filter((t) => t.id !== id));
   }, []);

   return (
      <ToastContext.Provider value={{ toasts, push, remove }}>
         {children}

         {/* Toast container */}
         <div
            aria-live="assertive"
            className="pointer-events-none fixed top-0 left-1/2 z-[9999] flex -translate-x-1/2 flex-col items-center gap-4 px-4 py-6"
         >
            {toasts.map((toast) => (
               <ToastItem key={toast.id} toast={toast} onRemove={remove} />
            ))}
         </div>

         {/* CSS Animation */}
         <style jsx global>{`
            @keyframes toast-progress {
               from {
                  width: 100%;
               }
               to {
                  width: 0%;
               }
            }
         `}</style>
      </ToastContext.Provider>
   );
}

export function useToast() {
   const ctx = useContext(ToastContext);
   if (!ctx) throw new Error("useToast must be used within a ToastProvider");
   return ctx;
}

export default ToastProvider;
