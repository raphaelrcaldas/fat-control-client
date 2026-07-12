"use client";

import { useOrgBrand } from "@/app/context/orgBrand";

export function AppLoadingScreen() {
   const { nome, saudacao } = useOrgBrand();

   return (
      <div className="mx-4 grid min-h-full flex-1 content-center justify-items-center bg-linear-to-br from-gray-50 to-gray-100">
         {/* mx-* precisa estar aqui, no container externo. Num filho `w-full`
             dentro de `justify-items-center`, a margem do proprio filho e
             ignorada pelo grid (confirmado medindo boxLeft/width no browser:
             com `mx-8` so no card, ele tocava as duas bordas da viewport). */}
         <div className="animate-fade-in relative grid w-full max-w-md justify-items-center rounded border border-slate-200 bg-white px-6 py-8 shadow">
            {/* Identidade da org ativa (nome + lema), com animação de pulse suave */}
            <div className="animate-pulse-subtle mb-6 text-center">
               <h3 className="mb-2 text-xl font-bold tracking-tight text-gray-800 md:text-2xl">
                  {nome}
               </h3>
               {saudacao && (
                  <h5 className="text-base font-semibold text-gray-600 md:text-lg">
                     {saudacao}
                  </h5>
               )}
            </div>

            {/* Barra de progresso decorativa */}
            <div className="mt-6 h-1 w-full overflow-hidden rounded-full bg-gray-200">
               <div className="animate-loading-bar bg-primary-600 h-full rounded-full"></div>
            </div>
         </div>

         <style jsx>{`
            @keyframes fadeIn {
               from {
                  opacity: 0;
                  transform: translateY(-10px);
               }
               to {
                  opacity: 1;
                  transform: translateY(0);
               }
            }

            @keyframes pulseSubtle {
               0%,
               100% {
                  opacity: 1;
               }
               50% {
                  opacity: 0.8;
               }
            }

            @keyframes loadingBar {
               0% {
                  transform: translateX(-100%);
               }
               50% {
                  transform: translateX(0%);
               }
               100% {
                  transform: translateX(100%);
               }
            }

            .animate-fade-in {
               animation: fadeIn 0.5s ease-out;
            }

            .animate-pulse-subtle {
               animation: pulseSubtle 3s ease-in-out infinite;
            }

            .animate-loading-bar {
               animation: loadingBar 2s ease-in-out infinite;
            }
         `}</style>
      </div>
   );
}
