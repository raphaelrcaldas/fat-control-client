import type { ReactNode } from "react";
import Link from "next/link";
import { HiArrowLeft } from "react-icons/hi";

interface MissaoGleHeaderProps {
   title: string;
   backHref: string;
   actions?: ReactNode;
}

/**
 * Cabeçalho persistente do editor de GLE.
 *
 * As ações ficam dentro do cartão, e não no rodapé, porque o formulário pode
 * ter muitos trechos e militares. No rodapé, salvar e excluir saíam da tela
 * junto com o conteúdo e exigiam uma rolagem até o fim.
 */
export function MissaoGleHeader({
   title,
   backHref,
   actions,
}: MissaoGleHeaderProps) {
   return (
      <div className="flex min-w-0 items-center gap-2 rounded border border-slate-200 bg-white px-3 py-2.5 shadow-sm sm:gap-3 sm:px-4">
         <Link
            href={backHref}
            aria-label="Voltar para as missões"
            title="Voltar para as missões"
            className="flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200"
         >
            <HiArrowLeft className="h-5 w-5" />
         </Link>

         <h1
            className="min-w-0 flex-1 truncate text-xl font-bold text-slate-800"
            title={title}
         >
            {title}
         </h1>

         {actions && (
            <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
               {actions}
            </div>
         )}
      </div>
   );
}
