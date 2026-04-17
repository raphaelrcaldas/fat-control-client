"use client";

import type { ReactNode } from "react";
import type { IconType } from "react-icons";

interface EmptyStateProps {
   icon: IconType;
   title: string;
   description?: string;
   action?: ReactNode;
}

export function EmptyState({
   icon: Icon,
   title,
   description,
   action,
}: EmptyStateProps) {
   return (
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center dark:border-gray-700 dark:bg-gray-800">
         <Icon className="mx-auto mb-4 h-12 w-12 text-gray-400 dark:text-gray-500" />
         <h3 className="font-medium text-gray-600 dark:text-gray-300">
            {title}
         </h3>
         {description && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
               {description}
            </p>
         )}
         {action && <div className="mt-3">{action}</div>}
      </div>
   );
}
