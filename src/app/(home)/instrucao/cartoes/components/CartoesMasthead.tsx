import { MdBadge } from "react-icons/md";

export default function CartoesMasthead({ count }: { count: number | null }) {
   return (
      <header className="relative overflow-hidden rounded border border-slate-200 bg-white px-5 py-4 shadow-sm sm:px-6 sm:py-5">
         {/* Espinha vermelha — ecoa a espinha dos cards */}
         <span
            aria-hidden
            className="absolute top-0 left-0 h-full w-1 bg-red-600"
         />

         <div className="relative flex flex-wrap items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-4">
               <div className="grid h-12 w-12 shrink-0 place-items-center rounded-md bg-red-50 text-red-600 ring-1 ring-red-100 ring-inset">
                  <MdBadge className="h-6 w-6" />
               </div>
               <div className="min-w-0">
                  <span className="block font-mono text-[10px] font-bold tracking-[0.3em] text-red-500 uppercase">
                     Instrução
                  </span>
                  <h1 className="text-2xl leading-none font-extrabold tracking-tight text-slate-900 sm:text-[28px]">
                     Cartões
                  </h1>
                  <p className="mt-1 text-sm text-slate-500">
                     Controle de PTAI, TAI, CVI e proficiência linguística dos
                     pilotos
                  </p>
               </div>
            </div>

            {count !== null && (
               <div className="flex items-baseline gap-1.5 rounded border border-slate-200 bg-slate-50 px-3 py-1.5">
                  <span className="text-lg font-bold text-slate-900">
                     {count}
                  </span>
                  <span className="text-xs text-slate-500">pilotos</span>
               </div>
            )}
         </div>
      </header>
   );
}
