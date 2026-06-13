import { HiArrowLeft } from "react-icons/hi";

interface MissionHeaderProps {
   tipoDoc: string;
   nDoc: number | undefined;
   desc: string;
   isNew: boolean;
   onBack: () => void;
}

export function MissionHeader({
   tipoDoc,
   nDoc,
   desc,
   isNew,
   onBack,
}: MissionHeaderProps) {
   return (
      <div className="flex items-center gap-4 rounded border border-slate-200 bg-white p-4 shadow-sm">
         <button
            onClick={onBack}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200"
            title="Voltar"
         >
            <HiArrowLeft className="h-5 w-5" />
         </button>

         <div className="min-w-0 flex-1">
            <h2 className="truncate text-xl font-bold text-slate-800 uppercase">
               {isNew
                  ? "Nova Missão"
                  : `${tipoDoc} ${String(nDoc ?? "").padStart(3, "0")}`}
            </h2>
            {!isNew && desc && (
               <p className="truncate text-sm text-slate-500 uppercase">
                  {desc}
               </p>
            )}
         </div>
      </div>
   );
}
