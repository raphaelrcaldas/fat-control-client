import {
   useState,
   Dispatch,
   SetStateAction,
   memo,
   useMemo,
   useCallback,
} from "react";
import { FaRegClone } from "react-icons/fa";
import MissionDetail from "./missionDetail";
import { Missao } from "services/routes/cegep/missoes";
import clsx from "clsx";
import { isoStrToDate, DATE_FORMAT_EXTENDED } from "utils/dateHandler";
import { MdDescription } from "react-icons/md";
import { HiDocumentText } from "react-icons/hi2";
import { MissionMilitar } from "./missionDetail/militar/missionMilitar";

export const CardMission = memo(function CardMission({
   missao,
   update,
   setClone,
   setShowForm,
}: {
   missao: Missao;
   update: () => void;
   setClone: Dispatch<SetStateAction<Missao>>;
   setShowForm: Dispatch<SetStateAction<boolean>>;
}) {
   const [showDetail, setShowDetail] = useState(false);

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

   const onClone = useCallback(
      (e: React.MouseEvent) => {
         e.stopPropagation();
         const clone = { ...missao, users: [], id: null };
         setClone(clone);
         setShowForm(true);
      },
      [missao, setClone, setShowForm]
   );

   return (
      <>
         <div className='relative bg-white p-5 shadow-lg rounded-2xl w-full border-2 border-gray-100'>
            {/* Header com documento */}
            <div className='flex items-center justify-between mb-4'>
               <div className='flex items-center gap-3'>
                  <div
                     className={clsx("p-2 rounded-lg shadow-md", {
                        "bg-blue-600": missao.tipo_doc == "om",
                        "bg-orange-600": missao.tipo_doc == "os",
                     })}
                  >
                     <HiDocumentText className='text-white text-xl' />
                  </div>
                  <div>
                     <h3 className='text-lg font-bold text-gray-800 uppercase'>
                        {missao.tipo_doc} {missao.n_doc}
                     </h3>
                     {missao.desc && (
                        <p className='text-sm text-gray-600 font-medium uppercase'>
                           {missao.desc}
                        </p>
                     )}
                  </div>
               </div>

               <button
                  onClick={onClone}
                  title='Clonar missão'
                  className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
               >
                  <FaRegClone className='text-gray-600 text-lg' />
               </button>
            </div>

            <div
               className='flex flex-col gap-4 h-full cursor-pointer'
               onClick={() => setShowDetail(true)}
            >
               {/* Observações */}
               {missao.obs && (
                  <div
                     className={clsx(
                        "flex items-start gap-2 p-3 rounded-lg border",
                        {
                           "border-blue-200 bg-blue-50":
                              missao.tipo_doc == "om",
                           "border-orange-200 bg-orange-50":
                              missao.tipo_doc == "os",
                        }
                     )}
                  >
                     <MdDescription
                        className={clsx("text-lg mt-0.5 flex-shrink-0", {
                           "text-blue-600": missao.tipo_doc == "om",
                           "text-orange-600": missao.tipo_doc == "os",
                        })}
                     />
                     <p className='text-sm text-gray-700 uppercase'>
                        {missao.obs}
                     </p>
                  </div>
               )}

               {/* Datas de afastamento e regresso */}
               <div className='flex flex-col gap-2'>
                  <div className='flex items-center justify-between p-2 bg-white rounded-xl border-2 border-gray-200 shadow-sm'>
                     <div className='flex items-center gap-3'>
                        <div className='flex flex-col'>
                           <span className='text-xs text-gray-500 font-medium uppercase'>
                              Afastamento
                           </span>
                           <span className='font-semibold text-gray-800 text-sm'>
                              {ini}
                           </span>
                        </div>
                     </div>

                     <div className='flex items-center gap-2'>
                        <span className='text-gray-400 text-xl'>→</span>
                     </div>

                     <div className='flex items-center gap-3'>
                        <div className='flex flex-col items-end'>
                           <span className='text-xs text-gray-500 font-medium uppercase'>
                              Regresso
                           </span>
                           <span className='font-semibold text-gray-800 text-sm'>
                              {fim}
                           </span>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Pernoites */}
               {missao.pernoites.length > 0 && (
                  <div className='flex flex-col gap-2'>
                     {missao.pernoites.map((pnt) => (
                        <PernoiteCardMis key={pnt.id} pnt={pnt} />
                     ))}
                  </div>
               )}

               {/* Militares */}
               {missao.users.length > 0 && (
                  <div className='space-y-2'>
                     <div className='grid grid-cols-2 gap-2'>
                        {missao.users.map((user) => (
                           <MissionMilitar key={user.id} userMis={user} />
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
               update={update}
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
      <div className='flex items-center gap-3 p-1 rounded-lg border border-gray-200 bg-white'>
         {/* Datas */}
         <div className='flex items-center gap-2 pl-1'>
            <div className='flex items-center gap-1.5'>
               <span className='font-semibold text-gray-700 text-sm'>
                  {dataIni}
               </span>
               <span className='text-gray-400 text-xs'>→</span>
               <span className='font-semibold text-gray-700 text-sm'>
                  {dataFim}
               </span>
            </div>
         </div>

         {/* Localização */}
         <div className='flex items-center gap-1.5 flex-1'>
            <span className='font-medium text-gray-800 text-xs uppercase'>
               {pnt.cidade.nome}-{pnt.cidade.uf}
            </span>
         </div>

         {/* Tags */}
         <div className='flex items-center gap-2'>
            {pnt.acrec_desloc && (
               <span
                  title='Acréscimo Deslocamento'
                  className='font-semibold bg-green-500 text-white px-2.5 py-1 rounded-full text-xs shadow-sm cursor-help'
               >
                  AC
               </span>
            )}

            {pnt.meia_diaria && (
               <span
                  title='Meia Diária'
                  className='font-semibold bg-amber-500 text-white px-2.5 py-1 rounded-full text-xs shadow-sm cursor-help'
               >
                  MD
               </span>
            )}
         </div>
      </div>
   );
});
