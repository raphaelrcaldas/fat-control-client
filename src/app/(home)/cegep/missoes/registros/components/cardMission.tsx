import { Dropdown, DropdownItem, Tooltip } from "flowbite-react";
import { useState, Dispatch, SetStateAction, memo, useMemo, useCallback } from "react";
import { FaRegClone } from "react-icons/fa";
import MissionDetail from "./missionDetail";
import { Missao } from "services/routes/cegep/missoes";
import clsx from "clsx";
import { isoStrToDate } from "utils/dateHandler";
import { MdCalendarToday, MdDescription, MdGroup } from "react-icons/md";
import { HiDocumentText } from "react-icons/hi2";

const dayExt = {
   day: "2-digit" as const,
   month: "2-digit" as const,
   year: "2-digit" as const,
   hour: "2-digit" as const,
   minute: "2-digit" as const,
};

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

   const { ini, fim } = useMemo(() => ({
      ini: new Date(missao.afast).toLocaleDateString("pt-BR", dayExt),
      fim: new Date(missao.regres).toLocaleDateString("pt-BR", dayExt),
   }), [missao.afast, missao.regres]);

   // let colorBadge: string;
   // switch (missao.tipo) {
   //    case "adm":
   //       colorBadge = "info";
   //       break;
   //    case "opr":
   //       colorBadge = "warning";
   //       break;
   //    case "tal":
   //       colorBadge = "success";
   //       break;
   // }

   const onClone = useCallback(() => {
      const clone = { ...missao, users: [], id: null };
      setClone(clone);
      setShowForm(true);
   }, [missao, setClone, setShowForm]);

   return (
      <>
         <div className='relative bg-gradient-to-br from-white to-gray-50 p-5 shadow-lg rounded-2xl w-full border-2 border-gray-100 hover:shadow-xl transition-shadow duration-200 cursor-pointer'>
            {/* Header com documento */}
            <div className='flex items-center justify-between mb-4'>
               <div className='flex items-center gap-3'>
                  <div
                     className={clsx(
                        "p-2 bg-gradient-to-br rounded-lg shadow-md",
                        {
                           "from-blue-500 to-blue-600": missao.tipo_doc == "om",
                           "from-orange-500 to-orange-600":
                              missao.tipo_doc == "os",
                        }
                     )}
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

               <Dropdown color='light' inline>
                  <DropdownItem icon={FaRegClone} onClick={() => onClone()}>
                     Clonar
                  </DropdownItem>
               </Dropdown>
            </div>

            <div
               className='flex flex-col gap-4 h-full'
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
                        <MdCalendarToday className='text-blue-500 text-xl' />
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
                        <MdCalendarToday className='text-green-500 text-xl' />
                     </div>
                  </div>

                  {/* {missao.acrec_desloc && (
                     <Tooltip content='Acréscimo Deslocamento'>
                        <span className='flex items-center gap-1 font-semibold bg-gradient-to-r from-green-400 to-green-500 text-white px-3 py-1.5 rounded-full text-xs shadow-sm w-fit'>
                           <MdAttachMoney className='text-sm' />
                           AC
                        </span>
                     </Tooltip>
                  )} */}
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
                     <div className='flex items-center gap-2 px-1'>
                        <MdGroup className='text-blue-500 text-lg' />
                        <h4 className='text-sm font-bold text-gray-700 uppercase'>
                           Militares ({missao.users.length})
                        </h4>
                     </div>
                     <div className='grid grid-cols-2 gap-2'>
                        {missao.users.map((user) => (
                           <UserCardMis key={user.id} user={user} />
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
   const { dataIni, dataFim } = useMemo(() => ({
      dataIni: isoStrToDate(pnt.data_ini).toLocaleDateString("pt-br", {
         day: "2-digit",
         month: "short",
      }),
      dataFim: isoStrToDate(pnt.data_fim).toLocaleDateString("pt-br", {
         day: "2-digit",
         month: "short",
      }),
   }), [pnt.data_ini, pnt.data_fim]);

   return (
      <div className='flex items-center gap-3 p-1 rounded-lg border border-gray-200 bg-white'>
         {/* Datas */}
         <div className='flex items-center gap-2'>
            <MdCalendarToday className='text-gray-500 text-sm' />
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
               <Tooltip content='Acréscimo Deslocamento'>
                  <span className='font-semibold bg-gradient-to-r from-green-400 to-green-500 text-white px-2.5 py-1 rounded-full text-xs shadow-sm'>
                     AC
                  </span>
               </Tooltip>
            )}

            {pnt.meia_diaria && (
               <Tooltip content='Meia Diária'>
                  <span className='font-semibold bg-gradient-to-r from-amber-400 to-amber-500 text-white px-2.5 py-1 rounded-full text-xs shadow-sm'>
                     MD
                  </span>
               </Tooltip>
            )}
         </div>
      </div>
   );
});

const UserCardMis = memo(function UserCardMis({ user }: { user: any }) {
   const config = useMemo(() => {
      switch (user.sit) {
         case "c":
            return {
               label: "Comissionado",
               bgColor: "bg-blue-50",
               borderColor: "border-blue-300",
               textColor: "text-blue-800",
               badgeColor: "bg-blue-500",
            };
         case "d":
            return {
               label: "Diária",
               bgColor: "bg-green-50",
               borderColor: "border-green-300",
               textColor: "text-green-800",
               badgeColor: "bg-green-500",
            };
         case "g":
            return {
               label: "Grat Rep",
               bgColor: "bg-orange-50",
               borderColor: "border-orange-300",
               textColor: "text-orange-800",
               badgeColor: "bg-orange-500",
            };
         default:
            return {
               label: "",
               bgColor: "bg-gray-50",
               borderColor: "border-gray-300",
               textColor: "text-gray-800",
               badgeColor: "bg-gray-500",
            };
      }
   }, [user.sit]);

   return (
      <div
         className={clsx(
            "flex items-center gap-2 px-1 py-0.5 rounded-xl border-2 select-none text-sm",
            config.bgColor,
            config.borderColor
         )}
      >
         <span
            className={clsx(
               "text-xs font-semibold uppercase px-2 py-0.5 rounded-md text-white",
               config.badgeColor
            )}
         >
            {user.sit}
         </span>
         <div
            className={clsx("font-medium uppercase text-xs", config.textColor)}
         >
            <span className='font-bold uppercase'>{user.p_g}</span>{" "}
            <span>{user.user.nome_guerra}</span>
         </div>
      </div>
   );
});
