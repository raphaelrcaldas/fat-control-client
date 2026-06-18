// Espelha o layout real dos resultados (cards e tabela) para zero layout-shift
// na troca skeleton → conteúdo. Lê o mesmo viewMode da listagem.

const CARD_COUNT = 8;
const ROW_COUNT = 10;
// Larguras fixas (nunca aleatórias) para evitar flicker/hydration mismatch.
const CARD_MILITARES = [0, 1, 2, 3];

function CardSkeleton() {
   return (
      <div className="animate-pulse rounded border border-slate-200 bg-white p-4 shadow-sm">
         {/* Header: caixa de ícone + documento */}
         <div className="mb-1 flex items-center gap-3 p-2">
            <div className="h-9 w-9 shrink-0 rounded-md bg-slate-200" />
            <div className="flex flex-col gap-1.5">
               <div className="h-5 w-28 rounded bg-slate-200" />
               <div className="h-3 w-36 rounded bg-slate-100" />
            </div>
         </div>

         <div className="flex flex-col gap-3">
            {/* Painel de datas (afastamento → regresso) */}
            <div className="flex items-center justify-between rounded border border-slate-200 bg-white p-2">
               <div className="flex flex-col gap-1.5">
                  <div className="h-2.5 w-20 rounded bg-slate-100" />
                  <div className="h-4 w-28 rounded bg-slate-200" />
               </div>
               <div className="h-4 w-4 rounded bg-slate-100" />
               <div className="flex flex-col items-end gap-1.5">
                  <div className="h-2.5 w-16 rounded bg-slate-100" />
                  <div className="h-4 w-28 rounded bg-slate-200" />
               </div>
            </div>

            {/* Militares */}
            <div className="grid grid-cols-2 gap-2">
               {CARD_MILITARES.map((i) => (
                  <div
                     key={i}
                     className="h-8 rounded-md border border-slate-200 bg-slate-100"
                  />
               ))}
            </div>
         </div>
      </div>
   );
}

function CardsSkeleton() {
   return (
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
         {Array.from({ length: CARD_COUNT }).map((_, i) => (
            <CardSkeleton key={i} />
         ))}
      </div>
   );
}

const TABLE_HEADERS = [
   "Documento",
   "Tipo",
   "Descrição",
   "Afastamento",
   "Regresso",
   "Militares",
   "Pernoites",
   "Etiquetas",
];

function TableSkeleton() {
   return (
      <div className="overflow-x-auto rounded border border-slate-200 bg-white shadow-sm">
         <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200">
               <tr>
                  {TABLE_HEADERS.map((h) => (
                     <th
                        key={h}
                        className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase"
                     >
                        {h}
                     </th>
                  ))}
               </tr>
            </thead>
            <tbody className="animate-pulse divide-y divide-slate-200">
               {Array.from({ length: ROW_COUNT }).map((_, i) => (
                  <tr key={i}>
                     <td className="px-4 py-2">
                        <div className="flex items-center gap-2">
                           <div className="h-6 w-6 shrink-0 rounded-md bg-slate-200" />
                           <div className="h-4 w-20 rounded bg-slate-200" />
                        </div>
                     </td>
                     <td className="px-4 py-2">
                        <div className="h-4 w-10 rounded bg-slate-100" />
                     </td>
                     <td className="px-4 py-2">
                        <div className="h-4 w-32 rounded bg-slate-100" />
                     </td>
                     <td className="px-4 py-2">
                        <div className="h-4 w-24 rounded bg-slate-100" />
                     </td>
                     <td className="px-4 py-2">
                        <div className="h-4 w-24 rounded bg-slate-100" />
                     </td>
                     <td className="px-4 py-2">
                        <div className="mx-auto h-6 w-6 rounded-full bg-slate-100" />
                     </td>
                     <td className="px-4 py-2">
                        <div className="h-5 w-24 rounded bg-slate-100" />
                     </td>
                     <td className="px-4 py-2">
                        <div className="h-5 w-16 rounded-full bg-slate-100" />
                     </td>
                  </tr>
               ))}
            </tbody>
         </table>
      </div>
   );
}

export function RegistrosSkeleton({
   viewMode,
}: {
   viewMode: "cards" | "table";
}) {
   return (
      <div className="space-y-4">
         {/* Cabeçalho dos resultados (título + alternador de visão) */}
         <div className="flex items-center justify-between">
            <div className="h-6 w-56 animate-pulse rounded bg-slate-200" />
            <div className="flex overflow-hidden rounded border border-slate-200">
               <div className="h-9 w-20 bg-slate-100" />
               <div className="h-9 w-20 border-l border-slate-200 bg-slate-100" />
            </div>
         </div>

         {viewMode === "cards" ? <CardsSkeleton /> : <TableSkeleton />}
      </div>
   );
}
