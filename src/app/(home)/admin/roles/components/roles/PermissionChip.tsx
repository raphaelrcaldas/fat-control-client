"use client";

import clsx from "clsx";
import { FaXmark } from "react-icons/fa6";
import { getActionChipTheme } from "@/constants/admin/roles";
import type { PermissionDetail } from "services/routes/security/roles";

interface PermissionChipProps {
   permission: PermissionDetail;
   onRemove: () => void;
   disabled?: boolean;
}

export function PermissionChip({
   permission,
   onRemove,
   disabled,
}: PermissionChipProps) {
   const chip = getActionChipTheme(permission.action);

   return (
      <span
         title={permission.description}
         className={clsx(
            "inline-flex min-w-18 items-center justify-between gap-1 rounded-full border py-0.5 pr-1 pl-2.5 text-sm font-medium",
            chip.bg,
            chip.text,
            chip.border
         )}
      >
         {permission.action}
         <button
            type="button"
            onClick={onRemove}
            disabled={disabled}
            aria-label={`Remover ${permission.resource}.${permission.action}`}
            className="rounded-full p-0.5 opacity-60 transition-all hover:bg-black/10 hover:opacity-100"
         >
            <FaXmark className="h-3 w-3" />
         </button>
      </span>
   );
}
