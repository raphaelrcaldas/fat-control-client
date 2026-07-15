import { HiUserGroup } from "react-icons/hi";

export function IndispHeader() {
   return (
      <header className="relative shrink-0 overflow-hidden rounded border border-slate-200 bg-white px-5 py-4 shadow-sm sm:px-6 sm:py-5">
         {/* Espinha — identidade do módulo (ver masthead canônico) */}
         <span
            aria-hidden
            className="bg-primary-600 absolute top-0 left-0 h-full w-1"
         />

         <div className="relative flex items-center gap-4">
            <div className="bg-primary-50 text-primary-600 ring-primary-100 grid h-12 w-12 shrink-0 place-items-center rounded-md ring-1 ring-inset">
               <HiUserGroup className="h-6 w-6" />
            </div>
            <div>
               <span className="text-primary-600 block font-mono text-[10px] font-bold tracking-[0.3em] uppercase">
                  Operações
               </span>
               <h1 className="text-2xl leading-none font-extrabold tracking-tight text-slate-900 sm:text-[28px]">
                  Indisponibilidades
               </h1>
            </div>
         </div>
      </header>
   );
}
