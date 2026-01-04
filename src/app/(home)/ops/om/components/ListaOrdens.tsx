import { HiDocumentDuplicate, HiTrash } from "react-icons/hi";
import { OrdemMissao } from "../types";
import { StatusBadge } from "./StatusBadge";
import { Label } from "flowbite-react";

interface ListaOrdensProps {
   ordens: OrdemMissao[];
   onOrdemClick: (ordem: OrdemMissao) => void;
   onCloneOrdem: (ordem: OrdemMissao) => void;
   onDeleteOrdem?: (ordem: OrdemMissao) => void;
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
   onDeleteOrdem,
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
                  className="cursor-pointer rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:border-red-300 hover:shadow-md"
                  onClick={() => onOrdemClick(ordem)}
               >
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className="flex flex-col gap-1.5">
                           <Label className="pointer-events-none text-start text-xs text-gray-500">
                              Número
                           </Label>
                           <div className="pointer-events-none font-mono text-lg font-semibold text-gray-900">
                              {ordem.numero}
                           </div>
                        </div>
                        <div className="h-10 w-px bg-gray-200" />
                        {/* <div className="flex w-32 flex-col gap-1.5">
                           <Label className="pointer-events-none text-xs text-gray-500">
                              Status
                           </Label>
                           <StatusBadge status={ordem.status as any} />
                        </div>
                        <div className="hidden h-10 w-px bg-gray-200 sm:block" /> */}
                        <div className="flex w-32 flex-col gap-1.5">
                           <Label className="pointer-events-none text-xs text-gray-500">
                              Etiquetas
                           </Label>
                           {ordem.etiquetas && ordem.etiquetas.length > 0 ? (
                              ordem.etiquetas.map((et) => (
                                 <span
                                    key={et.id}
                                    className="pointer-events-none inline-flex items-center justify-center rounded-full border px-1.5 py-0.5 text-[10px] font-bold tracking-tight uppercase shadow-xs"
                                    style={{
                                       backgroundColor: `${et.cor}20`,
                                       color: et.cor,
                                       borderColor: et.cor,
                                    }}
                                 >
                                    {et.nome}
                                 </span>
                              ))
                           ) : (
                              <span className="pointer-events-none text-xs text-gray-400">
                                 Nenhuma etiqueta
                              </span>
                           )}
                        </div>
                        <div className="hidden h-10 w-px bg-gray-200 sm:block" />

                        <div className="flex flex-col gap-1.5">
                           <Label className="pointer-events-none text-xs text-gray-500">
                              Descrição
                           </Label>
                           <p className="pointer-events-none hidden w-48 text-sm sm:block">
                              <span
                                 className={
                                    ordem.tipo
                                       ? "text-gray-600"
                                       : "text-gray-400"
                                 }
                              >
                                 {ordem.tipo || "Sem descrição"}
                              </span>
                           </p>
                        </div>
                        <div className="hidden h-10 w-px bg-gray-200 md:block" />

                        <div className="flex flex-col gap-1.5">
                           <Label className="pointer-events-none text-xs text-gray-500">
                              Rota
                           </Label>
                           {Object.keys(resumoRota).length > 0 && (
                              <div className="hidden flex-col gap-2 md:flex">
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
                                             -{" "}
                                             {etapas[etapas.length - 1].destino}
                                          </span>
                                       </div>
                                    )
                                 )}
                              </div>
                           )}
                        </div>
                     </div>
                     <div className="flex items-center gap-1">
                        <button
                           onClick={(e) => {
                              e.stopPropagation();
                              onCloneOrdem(ordem);
                           }}
                           className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-500"
                           title="Clonar missao"
                        >
                           <HiDocumentDuplicate size={20} />
                        </button>
                        {onDeleteOrdem && ordem.status === "rascunho" && (
                           <button
                              onClick={(e) => {
                                 e.stopPropagation();
                                 onDeleteOrdem(ordem);
                              }}
                              className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                              title="Excluir rascunho"
                           >
                              <HiTrash size={20} />
                           </button>
                        )}
                     </div>
                  </div>
               </div>
            );
         })}
      </div>
   );
}
