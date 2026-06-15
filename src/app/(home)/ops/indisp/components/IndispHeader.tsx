import { HiUserGroup } from "react-icons/hi";

export function IndispHeader() {
   return (
      <header className="relative mb-2 shrink-0 overflow-hidden rounded border border-slate-200 bg-white px-4 py-6 shadow-sm">
         {/* Espinha vermelha — identidade do módulo (ver masthead canônico) */}
         <span
            aria-hidden
            className="absolute top-0 left-0 h-full w-1 bg-red-600"
         />

         <div className="relative flex items-center gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-red-50 text-red-600 ring-1 ring-red-100 ring-inset">
               <HiUserGroup className="h-5 w-5" />
            </div>
            <div>
               <h1 className="text-xl leading-none font-extrabold tracking-tight text-slate-900 sm:text-2xl">
                  Indisponibilidades
               </h1>
            </div>
         </div>
      </header>
   );
}
