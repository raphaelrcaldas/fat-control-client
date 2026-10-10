import { MdBadge } from "react-icons/md";

const SUBTITULO =
   "Controle de PTAI, TAI, CVI e proficiência linguística dos pilotos";

export default function CartoesMasthead({ count }: { count: number | null }) {
   return (
      <header className="relative overflow-hidden rounded border border-slate-200 bg-white px-5 py-4 shadow-sm sm:px-6 sm:py-5">
         {/* Espinha — ecoa a espinha dos cards */}
         <span
            aria-hidden
            className="bg-primary-600 absolute top-0 left-0 h-full w-1"
         />

         <div className="relative flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-4">
               <div className="bg-primary-50 text-primary-600 ring-primary-100 grid h-12 w-12 shrink-0 place-items-center rounded-md ring-1 ring-inset">
                  <MdBadge className="h-6 w-6" />
               </div>
               <div className="min-w-0">
                  <span className="text-primary-600 block font-mono text-[10px] font-bold tracking-[0.3em] uppercase">
                     Instrução
                  </span>
                  <h1 className="text-2xl leading-none font-extrabold tracking-tight text-slate-900 sm:text-[28px]">
                     Cartões
                  </h1>
                  <p
                     className="mt-1 truncate text-sm text-slate-500"
                     title={SUBTITULO}
                  >
                     {SUBTITULO}
                  </p>
               </div>
            </div>

            {count !== null && (
               <div className="flex shrink-0 items-baseline gap-1.5 rounded border border-slate-200 bg-slate-50 px-3 py-1.5">
                  <span className="text-lg font-bold text-slate-900">
                     {count}
                  </span>
                  <span className="text-xs text-slate-500">
                     {count === 1 ? "piloto" : "pilotos"}
                  </span>
               </div>
            )}
         </div>
      </header>
   );
}
