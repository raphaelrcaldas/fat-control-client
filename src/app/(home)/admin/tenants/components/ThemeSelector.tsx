"use client";

import clsx from "clsx";
import { FaCheck } from "react-icons/fa6";
import { Dropdown, DropdownItem, Spinner } from "flowbite-react";
import { ORG_THEMES, THEME_META, type OrgTheme } from "@/lib/orgTheme";

function Swatch({ tema }: { tema: OrgTheme }) {
   return (
      <span
         className={clsx(
            "h-4 w-4 shrink-0 rounded-full shadow-sm",
            THEME_META[tema].swatch
         )}
         aria-hidden
      />
   );
}

interface ThemeSelectorProps {
   value: OrgTheme;
   onSelect: (tema: OrgTheme) => void;
   /** Tema cuja gravação está em andamento (mostra spinner no gatilho). */
   savingTema?: OrgTheme | null;
   disabled?: boolean;
}

export function ThemeSelector({
   value,
   onSelect,
   savingTema = null,
   disabled = false,
}: ThemeSelectorProps) {
   const isSaving = savingTema !== null;

   const triggerLabel = (
      <span className="flex items-center gap-2">
         {isSaving ? (
            <Spinner size="sm" color="gray" />
         ) : (
            <Swatch tema={value} />
         )}
         {THEME_META[value].label}
      </span>
   );

   return (
      <Dropdown
         label={triggerLabel}
         color="light"
         size="sm"
         disabled={disabled || isSaving}
         dismissOnClick
      >
         {ORG_THEMES.map((tema) => (
            <DropdownItem key={tema} onClick={() => onSelect(tema)}>
               <span className="flex w-full items-center gap-2">
                  <Swatch tema={tema} />
                  <span className="flex-1 text-left">
                     {THEME_META[tema].label}
                  </span>
                  {tema === value && (
                     <FaCheck className="h-3.5 w-3.5 text-slate-500" />
                  )}
               </span>
            </DropdownItem>
         ))}
      </Dropdown>
   );
}
