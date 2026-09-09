import type { ReactNode } from "react";
import { HiArrowLeft, HiCheckCircle, HiExclamation } from "react-icons/hi";

interface MissionHeaderProps {
   tipoDoc: string;
   nDoc: string;
   isNew: boolean;
   cache_inconsistente?: boolean;
   onBack: () => void;
   /**
    * Ações da missão (editar, clonar, deletar, salvar). Ficam aqui, e não numa
    * barra ao pé da página, como no detalhe do comissionamento: no rodapé elas
    * saíam da tela junto com o conteúdo, e numa missão com vinte militares era
    * preciso rolar até o fim para achar o "Editar".
    */
   actions?: ReactNode;
}

export function MissionHeader({
   tipoDoc,
   nDoc,
   cache_inconsistente,
   isNew,
   onBack,
   actions,
}: MissionHeaderProps) {
   // Tudo numa linha só, inclusive a 360px: o que dá espaço é o rótulo dos
   // botões virar ícone no celular (ver MissionActionBar), não a quebra de
   // linha. Com os rótulos, ou o grupo caía para baixo ou espremia o "OM 104"
   // até sumir do cabeçalho.
   return (
      <div className="flex items-center gap-3 rounded border border-slate-200 bg-white px-4 py-2.5 shadow-sm sm:gap-4">
         <button
            onClick={onBack}
            /* `h-10` são 35px, não 40: a raiz do client é 87,5% (1rem = 14px).
               Medido no dedo, ficava 9px abaixo do mínimo. O reforço é em px
               cravado e só no ponteiro grosso — no mouse os 35px passam com
               folga dos 24px e inflar seria piorar a densidade. */
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200 pointer-coarse:h-[44px] pointer-coarse:w-[44px]"
            title="Voltar"
         >
            <HiArrowLeft className="h-5 w-5" />
         </button>

         {/* Só o identificador: a descrição tem campo próprio logo abaixo, e
             repeti-la aqui gastava uma linha do cabeçalho dizendo o que a
             tela já diz. */}
         <div className="min-w-0 flex-1">
            <h1 className="truncate text-xl font-bold text-slate-800 uppercase">
               {isNew ? "Nova Missão" : `${tipoDoc} ${nDoc}`}
            </h1>
         </div>

         {/* Integridade do cache de custos verificada ao abrir a missão.
             Missão nova ainda não foi persistida, logo não há o que verificar. */}
         {!isNew && !cache_inconsistente && (
            <div
               className="flex shrink-0 items-center gap-1.5 text-xs text-green-700"
               title="Integridade verificada"
            >
               <HiCheckCircle className="h-4 w-4 shrink-0" />
               <span className="hidden lg:inline">Integridade verificada</span>
            </div>
         )}

         {actions && (
            <div className="ml-auto flex shrink-0 items-center gap-2">
               {actions}
            </div>
         )}
      </div>
   );
}
