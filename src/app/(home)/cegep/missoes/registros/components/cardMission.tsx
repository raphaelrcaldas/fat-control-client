import { useState, Dispatch, SetStateAction, memo, useMemo } from "react";
import MissionDetail from "./missionDetail";
import { Missao } from "services/routes/cegep/missoes";
import clsx from "clsx";
import { isoStrToDate, DATE_FORMAT_EXTENDED } from "utils/dateHandler";
import { MdDescription } from "react-icons/md";
import { HiDocumentText, HiTag } from "react-icons/hi2";
import { MissionMilitar } from "./missionDetail/militar/missionMilitar";

export const CardMission = memo(function CardMission({
   missao,
   setClone,
   setShowForm,
}: {
   missao: Missao;
   setClone: Dispatch<SetStateAction<Missao | null>>;
   setShowForm: Dispatch<SetStateAction<boolean>>;
}) {
   const [showDetail, setShowDetail] = useState(false);

   // Etiquetas vêm diretamente da missão (objetos completos da API)
   const etiquetas = missao.etiquetas || [];

   const { ini, fim } = useMemo(
      () => ({
         ini: new Date(missao.afast).toLocaleDateString(
            "pt-BR",
            DATE_FORMAT_EXTENDED
         ),
         fim: new Date(missao.regres).toLocaleDateString(
            "pt-BR",
            DATE_FORMAT_EXTENDED
         ),
      }),
      [missao.afast, missao.regres]
   );

   return (
      <>
         <div className="relative w-full rounded-2xl border-2 border-gray-100 bg-white p-4 shadow-lg transition-shadow hover:shadow-xl">
            {/* Etiquetas no topo do card (somente exibição) */}
            {etiquetas.length > 0 && (
               <div className="mb-3 flex flex-wrap items-center gap-1.5 border-b border-gray-100 pb-3">
                  {etiquetas.map((etiqueta) => (
                     <span
                        key={etiqueta.id}
                        className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium text-white"
                        style={{ backgroundColor: etiqueta.cor }}
                        title={etiqueta.descricao}
                     >
                        <HiTag className="h-2.5 w-2.5" />
                        {etiqueta.nome}
                     </span>
                  ))}
               </div>
            )}

            {/* Header com documento - CLICÁVEL */}
            <div
               className="-m-2 mb-1 flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors hover:bg-gray-50"
               onClick={() => setShowDetail(true)}
               title="Clique para ver detalhes da missão"
            >
               <div
                  className={clsx("rounded-lg p-2 shadow-md", {
                     "bg-blue-600": missao.tipo_doc == "om",
                     "bg-orange-600": missao.tipo_doc == "os",
                  })}
               >
                  <HiDocumentText className="text-xl text-white" />
               </div>
               <div>
                  <h3 className="text-lg font-bold text-gray-800 uppercase">
                     {missao.tipo_doc} {String(missao.n_doc).padStart(3, "0")}
                  </h3>
                  {missao.desc && (
                     <p className="text-xs font-medium text-gray-600 uppercase">
                        {missao.desc}
                     </p>
                  )}
               </div>
            </div>

            <div className="flex h-full flex-col gap-3">
               {/* Observações */}
               {missao.obs && (
                  <div
                     className={clsx(
                        "flex items-start gap-2 rounded-lg border p-3",
                        {
                           "border-blue-200 bg-blue-50":
                              missao.tipo_doc == "om",
                           "border-orange-200 bg-orange-50":
                              missao.tipo_doc == "os",
                        }
                     )}
                  >
                     <MdDescription
                        className={clsx("mt-0.5 shrink-0 text-lg", {
                           "text-blue-600": missao.tipo_doc == "om",
                           "text-orange-600": missao.tipo_doc == "os",
                        })}
                     />
                     <p className="text-sm text-gray-700 uppercase">
                        {missao.obs}
                     </p>
                  </div>
               )}

               {/* Datas de afastamento e regresso */}
               <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between rounded-xl border-2 border-gray-200 bg-white p-2 shadow-sm">
                     <div className="flex items-center gap-3">
                        <div className="flex flex-col">
                           <span className="text-xs font-medium text-gray-500 uppercase">
                              Afastamento
                           </span>
                           <span className="text-sm font-semibold text-gray-800">
                              {ini}
                           </span>
                        </div>
                     </div>

                     <div className="flex items-center gap-2">
                        <span className="text-xl text-gray-400">→</span>
                     </div>

                     <div className="flex items-center gap-3">
                        <div className="flex flex-col items-end">
                           <span className="text-xs font-medium text-gray-500 uppercase">
                              Regresso
                           </span>
                           <span className="text-sm font-semibold text-gray-800">
                              {fim}
                           </span>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Pernoites */}
               {missao.pernoites.length > 0 && (
                  <div className="flex flex-col gap-2">
                     {missao.pernoites.map((pnt) => (
                        <PernoiteCardMis key={pnt.id} pnt={pnt} />
                     ))}
                  </div>
               )}

               {/* Militares */}
               {missao.users.length > 0 && (
                  <div className="space-y-2">
                     <div className="grid grid-cols-2 gap-2">
                        {missao.users.map((user) => (
                           <MissionMilitar
                              key={user.id}
                              userMis={user}
                              simple={true}
                           />
                        ))}
                     </div>
                  </div>
               )}
            </div>
         </div>

         {showDetail && (
            <MissionDetail
               missao={missao}
               show={showDetail}
               setShow={setShowDetail}
               setClone={setClone}
               setShowForm={setShowForm}
               edit={false}
            />
         )}
      </>
   );
});

const PernoiteCardMis = memo(function PernoiteCardMis({ pnt }: { pnt: any }) {
   const { dataIni, dataFim } = useMemo(
      () => ({
         dataIni: isoStrToDate(pnt.data_ini).toLocaleDateString("pt-br", {
            day: "2-digit",
            month: "short",
         }),
         dataFim: isoStrToDate(pnt.data_fim).toLocaleDateString("pt-br", {
            day: "2-digit",
            month: "short",
         }),
      }),
      [pnt.data_ini, pnt.data_fim]
   );

   return (
      <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-1">
         {/* Datas */}
         <div className="flex items-center gap-2 pl-1">
            <div className="flex items-center gap-1.5">
               <span className="text-sm font-semibold text-gray-700">
                  {dataIni}
               </span>
               <span className="text-xs text-gray-400">→</span>
               <span className="text-sm font-semibold text-gray-700">
                  {dataFim}
               </span>
            </div>
         </div>

         {/* Localização */}
         <div className="flex flex-1 items-center gap-1.5">
            <span className="text-xs font-medium text-gray-800 uppercase">
               {pnt.cidade.nome}-{pnt.cidade.uf}
            </span>
         </div>
      </div>
   );
});
