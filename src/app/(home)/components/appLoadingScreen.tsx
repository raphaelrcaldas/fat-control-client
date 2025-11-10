"use client";

export function AppLoadingScreen() {
   return (
      <div className='h-full grid justify-items-center content-center bg-gradient-to-br from-gray-50 to-gray-100'>
         <div className='relative grid justify-items-center max-w-md w-full mx-8 p-10 bg-white border border-gray-200 rounded-xl shadow-xl animate-fade-in'>
            {/* Logo/Título com animação de pulse suave */}
            <div className='mb-6 text-center animate-pulse-subtle'>
               <h3 className='mb-2 text-2xl md:text-3xl font-bold tracking-tight text-gray-800'>
                  1º/1º Grupo de Transporte
               </h3>
               <h5 className='text-base md:text-lg font-semibold text-gray-600'>
                  Uma equipe, um coração.
               </h5>
            </div>

            {/* Barra de progresso decorativa */}
            <div className='w-full mt-6 h-1 bg-gray-200 rounded-full overflow-hidden'>
               <div className='h-full bg-red-600 rounded-full animate-loading-bar'></div>
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
