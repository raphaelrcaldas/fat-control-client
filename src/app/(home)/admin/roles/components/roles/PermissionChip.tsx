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
         {/* Sem `opacity`: a 60% o ✕ ficava em 2,88:1, abaixo dos 3:1 que a
             WCAG 1.4.11 pede para ícone com significado. O padding leva o alvo
             a ~26px no mouse (mínimo WCAG 2.5.8) e ~31px no dedo — 44px cravado
             num chip inline viraria parede de botões, e o espaçamento entre
             chips (gap-2) sustenta a precisão do gesto */}
         <button
            type="button"
            onClick={onRemove}
            disabled={disabled}
            aria-label={`Remover ${permission.resource}.${permission.action}`}
            className="rounded-full p-2 transition-colors hover:bg-black/10 pointer-coarse:p-2.5"
         >
            <FaXmark className="h-3 w-3" />
         </button>
      </span>
   );
}
