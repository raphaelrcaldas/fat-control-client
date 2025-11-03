"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { Alert } from "flowbite-react";

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

export function ToastProvider({ children }: { children: React.ReactNode }) {
   const [toasts, setToasts] = useState<Toast[]>([]);

   const push = useCallback((t: Omit<Toast, "id">) => {
      const id = String(Date.now()) + Math.random().toString(36).slice(2, 8);
      const toast: Toast = { id, ...t };
      setToasts((s) => [toast, ...s]);
      // auto-remove after 6s
      setTimeout(() => setToasts((s) => s.filter((x) => x.id !== id)), 6000);
   }, []);

   const remove = useCallback((id: string) => {
      setToasts((s) => s.filter((t) => t.id !== id));
   }, []);

   return (
      <ToastContext.Provider value={{ toasts, push, remove }}>
         {children}
         <div
            aria-live='assertive'
            className='fixed inset-0 flex items-start px-4 pt-6 pointer-events-none z-[9999]'
         >
            <div className='w-full flex flex-col items-center space-y-4'>
               {toasts.map((t) => (
                  <div key={t.id} className='pointer-events-auto'>
                     <div className='w-full max-w-sm p-2 mb-2'>
                        <Alert
                           withBorderAccent
                           className='shadow-md'
                           color={
                              t.type === "error"
                                 ? "failure"
                                 : t.type === "success"
                                 ? "success"
                                 : t.type === "warning"
                                 ? "warning"
                                 : "info"
                           }
                        >
                           <div className='flex flex-col'>
                              {t.title && (
                                 <span className='font-semibold'>
                                    {t.title}
                                 </span>
                              )}
                              <span>{t.message}</span>
                           </div>
                        </Alert>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </ToastContext.Provider>
   );
}

export function useToast() {
   const ctx = useContext(ToastContext);
   if (!ctx) throw new Error("useToast must be used within a ToastProvider");
   return ctx;
}

export default ToastProvider;
