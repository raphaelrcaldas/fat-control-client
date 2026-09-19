/** Espelha o `MissaoEditor`: cabeçalho com ações e as três seções. */
function SecaoSkeleton({ children }: { children: React.ReactNode }) {
   return (
      <div className="rounded border border-slate-200 bg-white p-4 shadow-sm">
         <div className="mb-4 flex items-center gap-2">
            {/* A espinha não pulsa: é moldura da seção, não conteúdo. */}
            <div className="h-4 w-1 rounded-full bg-slate-200" />
            <div className="h-3 w-24 animate-pulse rounded bg-slate-100" />
         </div>
         {children}
      </div>
   );
}

export function MissaoEditorSkeleton() {
   return (
      <div className="space-y-2">
         {/* A rota já tem um título durante o carregamento; o header real
             substitui este skeleton assim que a missão chega. */}
         <h1 className="sr-only">Carregando missão</h1>

         {/* Cabeçalho: voltar redondo, título e os dois botões de ação. */}
         <div className="flex items-center gap-2 rounded border border-slate-200 bg-white px-3 py-2.5 shadow-sm sm:gap-3 sm:px-4">
            <div className="h-[40px] w-[40px] shrink-0 animate-pulse rounded-full bg-slate-100" />
            <div className="h-5 w-48 animate-pulse rounded bg-slate-100" />
            <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
               <div className="h-[34px] w-[34px] animate-pulse rounded bg-slate-100 sm:w-24" />
               <div className="h-[34px] w-[34px] animate-pulse rounded bg-slate-100 sm:w-24" />
            </div>
         </div>

         <SecaoSkeleton>
            <div className="h-[34px] animate-pulse rounded bg-slate-100" />
         </SecaoSkeleton>

         <SecaoSkeleton>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_auto]">
               {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i}>
                     <div className="mb-1 h-3 w-20 animate-pulse rounded bg-slate-100" />
                     <div className="h-[34px] animate-pulse rounded bg-slate-100" />
                  </div>
               ))}
               <div className="flex items-end">
                  <div className="h-[34px] w-[34px] animate-pulse rounded bg-slate-100" />
               </div>
            </div>
         </SecaoSkeleton>

         <SecaoSkeleton>
            <div className="h-[34px] animate-pulse rounded bg-slate-100" />
         </SecaoSkeleton>
      </div>
   );
}
