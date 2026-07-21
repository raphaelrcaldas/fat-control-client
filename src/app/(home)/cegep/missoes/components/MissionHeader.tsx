import { HiArrowLeft, HiCheckCircle, HiExclamation } from "react-icons/hi";

interface MissionHeaderProps {
   tipoDoc: string;
   nDoc: string;
   desc: string;
   isNew: boolean;
   cache_inconsistente?: boolean;
   onBack: () => void;
}

export function MissionHeader({
   tipoDoc,
   nDoc,
   desc,
   cache_inconsistente,
   isNew,
   onBack,
}: MissionHeaderProps) {
   return (
      <div className="flex items-center gap-4 rounded border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
         <button
            onClick={onBack}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200"
            title="Voltar"
         >
            <HiArrowLeft className="h-5 w-5" />
         </button>

         <div className="min-w-0 flex-1">
            <h1 className="truncate text-xl font-bold text-slate-800 uppercase">
               {isNew ? "Nova Missão" : `${tipoDoc} ${nDoc}`}
            </h1>
            {!isNew && desc && (
               <p className="truncate text-sm text-slate-500 uppercase">
                  {desc}
               </p>
            )}
         </div>

         {/* Integridade do cache de custos verificada ao abrir a missão.
             Missão nova ainda não foi persistida, logo não há o que verificar. */}
         {!isNew && !cache_inconsistente && (
            <div
               className="flex items-center gap-1.5 text-xs text-green-700"
               title="Integridade verificada"
            >
               <HiCheckCircle className="h-4 w-4 shrink-0" />
               <span className="hidden sm:inline">Integridade verificada</span>
            </div>
         )}
      </div>
   );
}
