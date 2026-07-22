const Bar = ({ className = "" }: { className?: string }) => (
   <div className={`animate-pulse rounded bg-slate-200 ${className}`} />
);

const FaintBar = ({ className = "" }: { className?: string }) => (
   <div className={`animate-pulse rounded bg-slate-100 ${className}`} />
);

/** Bloco "valor + rótulo" centralizado, repetido nas grades de métricas. */
function StatCell() {
   return (
      <div className="flex flex-col items-center gap-1">
         <Bar className="h-5 w-16" />
         <FaintBar className="h-3 w-12" />
      </div>
   );
}

/** Célula "valor + rótulo" em fundo suave, usada em Documentos e Classificação. */
function FieldCell() {
   return (
      <div className="flex flex-col items-center gap-2 rounded bg-slate-50 p-3">
         <Bar className="h-5 w-24 max-w-full" />
         <FaintBar className="h-3 w-16 max-w-full" />
      </div>
   );
}

/** Casca de uma seção (`SectionWrapper`): espinha + título e conteúdo. */
function Section({ children }: { children: React.ReactNode }) {
   return (
      <div className="rounded border border-slate-200 bg-white p-4 shadow-sm">
         <div className="mb-4 flex items-center gap-2">
            <div className="h-4 w-1 rounded-full bg-slate-200" />
            <Bar className="h-3.5 w-44" />
         </div>
         {children}
      </div>
   );
}

/**
 * Skeleton fiel à casca do `ComissPage`: mesma coluna centralizada
 * (`max-w-7xl`), mesmas seções (`SectionWrapper`) e dimensões, para zero
 * layout-shift quando o detalhe do comissionamento carrega.
 */
export function ComissPageSkeleton() {
   return (
      <div className="flex w-full justify-center">
         <div className="flex w-full max-w-7xl flex-col gap-2">
            {/* Barra de comando: voltar + titulo + acoes */}
            <div className="flex items-center justify-between gap-3 rounded border border-slate-200 bg-white px-3 py-2.5 shadow-sm sm:px-4">
               <div className="flex items-center gap-3">
                  <Bar className="h-9 w-9 shrink-0" />
                  <Bar className="h-5 w-40" />
               </div>
               <div className="hidden shrink-0 gap-2 sm:flex">
                  <Bar className="h-8 w-24" />
                  <Bar className="h-8 w-24" />
                  <Bar className="h-8 w-20" />
               </div>
            </div>

            {/* Identidade do militar — card independente */}
            <div className="flex flex-col items-center gap-1.5 rounded border border-slate-200 bg-white px-4 py-3 shadow-sm">
               <Bar className="h-5 w-48 max-w-full" />
               <FaintBar className="h-3.5 w-64 max-w-full" />
            </div>

            {/* Documentos de Referência */}
            <Section>
               <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <FieldCell />
                  <FieldCell />
                  <FieldCell />
               </div>
            </Section>

            {/* Datas e Valores */}
            <Section>
               <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {Array.from({ length: 2 }).map((_, i) => (
                     <div key={i} className="rounded bg-slate-50 p-4">
                        <Bar className="mb-3 h-4 w-24" />
                        <div className="grid grid-cols-3 gap-4">
                           <StatCell />
                           <StatCell />
                           <StatCell />
                        </div>
                     </div>
                  ))}
               </div>
            </Section>

            {/* Classificação */}
            <Section>
               <div className="grid grid-cols-3 gap-3">
                  <FieldCell />
                  <FieldCell />
                  <FieldCell />
               </div>
            </Section>

            {/* Métricas */}
            <Section>
               <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                     <StatCell />
                     <StatCell />
                     <StatCell />
                  </div>
                  <div className="space-y-2">
                     <div className="flex justify-between">
                        <FaintBar className="h-4 w-20" />
                        <Bar className="h-4 w-10" />
                     </div>
                     <Bar className="h-4 w-full" />
                  </div>
               </div>
            </Section>

            {/* Missões Relacionadas */}
            <Section>
               <div className="divide-y divide-slate-200 overflow-hidden rounded border border-slate-200">
                  {Array.from({ length: 3 }).map((_, i) => (
                     <div
                        key={i}
                        className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-4"
                     >
                        <Bar className="h-5 w-20 shrink-0" />
                        <FaintBar className="h-4 min-w-0 flex-1" />
                        <div className="flex shrink-0 gap-2">
                           <Bar className="h-7 w-14" />
                           <Bar className="h-7 w-14" />
                        </div>
                        <Bar className="h-5 w-20 shrink-0 sm:w-24" />
                     </div>
                  ))}
               </div>
            </Section>
         </div>
      </div>
   );
}
