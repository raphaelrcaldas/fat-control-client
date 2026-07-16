"use client";

import { Button, type ButtonProps } from "flowbite-react";
import type { IconType } from "react-icons";
import { FaPlus } from "react-icons/fa6";

interface SectionHeaderProps {
   title: string;
   /** Nível do título — "h1" quando o SectionHeader é o título da página */
   headingLevel?: "h1" | "h2";
   count?: number;
   countLabel?: string;
   onCreateClick?: () => void;
   createLabel?: string;
   createButtonColor?: ButtonProps["color"];
   createIcon?: IconType;
   canCreate?: boolean;
   children?: React.ReactNode;
}

export function SectionHeader({
   title,
   headingLevel: Heading = "h2",
   count,
   countLabel,
   onCreateClick,
   createLabel,
   createButtonColor = "primary",
   createIcon: CreateIcon = FaPlus,
   canCreate = true,
   children,
}: SectionHeaderProps) {
   const showCreateButton = canCreate && onCreateClick && createLabel;

   return (
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
         <div className="flex items-center gap-3">
            <Heading className="text-xl font-semibold text-gray-900 dark:text-white">
               {title}
            </Heading>
            {count !== undefined && (
               <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                  {count} {countLabel || ""}
               </span>
            )}
         </div>
         <div className="flex items-center gap-3">
            {children}
            {showCreateButton && (
               <Button
                  color={createButtonColor}
                  onClick={onCreateClick}
                  aria-label={createLabel}
               >
                  <CreateIcon className="mr-2 h-4 w-4" />
                  {createLabel}
               </Button>
            )}
         </div>
      </div>
   );
}
