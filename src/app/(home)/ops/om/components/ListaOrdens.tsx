import { HiDocumentDuplicate } from "react-icons/hi";
import { OrdemMissao } from "../types";
import { StatusBadge } from "./StatusBadge";

interface ListaOrdensProps {
   ordens: OrdemMissao[];
   onOrdemClick: (ordem: OrdemMissao) => void;
   onCloneOrdem: (ordem: OrdemMissao) => void;
}

function gerarResumoRota(
   ordem: OrdemMissao
): Record<string, typeof ordem.etapas> {
   if (!ordem.etapas || ordem.etapas.length === 0) return {};

   // Agrupar etapas por data
   const etapasPorData = ordem.etapas.reduce(
      (acc, etapa) => {
         if (!etapa.dataDecolagem) return acc;
         const [year, month, day] = etapa.dataDecolagem.split("-");
         const data = `${day}/${month}`;
         if (!acc[data]) acc[data] = [];
         acc[data].push(etapa);

         return acc;
      },
      {} as Record<string, typeof ordem.etapas>
   );

   return etapasPorData;
}

export function ListaOrdens({
   ordens,
   onOrdemClick,
   onCloneOrdem,
}: ListaOrdensProps) {
   if (ordens.length === 0) {
      return (
         <div className="rounded-xl border border-gray-200 bg-white py-16 text-center text-gray-400">
            <p className="mb-4 text-4xl">✈</p>
            <p className="text-lg text-gray-600">
               Nenhuma ordem de missão encontrada
            </p>
            <p className="text-sm">Ajuste os filtros ou crie uma nova ordem</p>
         </div>
      );
   }

   return (
      <div className="space-y-3">
         {ordens.map((ordem) => {
            const resumoRota = gerarResumoRota(ordem);

            return (
               <div
                  key={ordem.id}
                  className="cursor-pointer rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:border-red-300 hover:shadow-md"
                  onClick={() => onOrdemClick(ordem)}
               >
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className="font-mono text-lg font-bold text-gray-900">
                           {ordem.numero.slice(0, 3)}
                        </div>
                        <div className="h-10 w-px bg-gray-200" />
                        <div className="w-32">
                           <StatusBadge status={ordem.status as any} />
                        </div>
                        <div className="h-10 w-px bg-gray-200" />
                        <p className="text-sm text-gray-500">
                           {ordem.etapas[0]?.dataDecolagem
                              ? new Date(
                                   ordem.etapas[0].dataDecolagem + "T00:00:00"
                                ).toLocaleDateString("pt-BR")
                              : "-"}
                        </p>
                        <div className="h-10 w-px bg-gray-200" />
                        <p className="w-48 text-sm text-gray-600">
                           {ordem.tipo}
                        </p>
                        <div className="h-10 w-px bg-gray-200" />
                        {Object.keys(resumoRota).length > 0 && (
                           <div className="flex flex-col gap-2">
                              {Object.entries(resumoRota).map(
                                 ([data, etapas]) => (
                                    <div
                                       key={data}
                                       className="text-sm font-medium"
                                    >
                                       <span className="mr-2 rounded-full bg-gray-100 px-2 py-1 text-gray-600">
                                          {data}
                                       </span>
                                       <span className="font-mono">
                                          {etapas
                                             .map((e) => e.origem)
                                             .join(" - ")}{" "}
                                          - {etapas[etapas.length - 1].destino}
                                       </span>
                                    </div>
                                 )
                              )}
                           </div>
                        )}
                     </div>
                     <button
                        onClick={(e) => {
                           e.stopPropagation();
                           onCloneOrdem(ordem);
                        }}
                        className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                        title="Clonar missão"
                     >
                        <HiDocumentDuplicate size={20} />
                     </button>
                  </div>
               </div>
            );
         })}
      </div>
   );
}
