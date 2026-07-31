"use client";

import type { ReactNode } from "react";
import type { IconType } from "react-icons";

interface EmptyStateProps {
   icon: IconType;
   title: string;
   /** Elemento do título — "h1" quando o EmptyState é o conteúdo da página */
   titleAs?: "p" | "h1" | "h2";
   description?: string;
   action?: ReactNode;
}

export function EmptyState({
   icon: Icon,
   title,
   titleAs: Title = "p",
   description,
   action,
}: EmptyStateProps) {
   return (
      <div className="rounded border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-gray-700 dark:bg-gray-800">
         <Icon className="mx-auto mb-4 h-12 w-12 text-gray-400 dark:text-gray-500" />
         <Title className="font-medium text-gray-600 dark:text-gray-300">
            {title}
         </Title>
         {description && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
               {description}
            </p>
         )}
         {action && <div className="mt-3">{action}</div>}
      </div>
   );
}
