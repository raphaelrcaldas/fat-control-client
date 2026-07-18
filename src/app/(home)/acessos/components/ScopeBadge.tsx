import clsx from "clsx";
import { THEME_META, type OrgTheme } from "@/lib/orgTheme";

interface ScopeBadgeProps {
   /** Sigla da unidade a exibir, ou null para vínculo de sistema. */
   sigla: string | null;
   /** Tema da org referida — dá a cor do dot. Ausente = sistema/desconhecido. */
   tema?: OrgTheme;
}

/**
 * Chip de escopo do vínculo. O dot herda o tema do tenant referido (reforço
 * visual — a sigla carrega a informação, a cor nunca é canal único), no mesmo
 * padrão de `admin/logs`. "Sistema" (sem tenant) usa dot neutro.
 */
export function ScopeBadge({ sigla, tema }: ScopeBadgeProps) {
   return (
      <span className="inline-flex items-center gap-2">
         <span
            aria-hidden
            className={clsx(
               "size-2 shrink-0 rounded-full",
               tema ? THEME_META[tema].swatch : "bg-slate-300"
            )}
         />
         <span
            className={clsx(
               "text-sm font-medium text-slate-700",
               sigla && "uppercase"
            )}
         >
            {sigla ?? "Sistema"}
         </span>
      </span>
   );
}
