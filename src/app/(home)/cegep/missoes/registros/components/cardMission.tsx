import { Dropdown, DropdownItem, Tooltip } from "flowbite-react";
import { useState, Dispatch, SetStateAction } from "react";
import { FaRegClone } from "react-icons/fa";
import MissionDetail from "./missionDetail";
import { Missao } from "services/routes/cegep/missoes";
import clsx from "clsx";

export function CardMission({
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
   const dayExt = {
      day: "2-digit" as const,
      month: "2-digit" as const,
      year: "2-digit" as const,
      hour: "2-digit" as const,
      minute: "2-digit" as const,
   };
   const ini = new Date(missao.afast).toLocaleDateString("pt-BR", dayExt);
   const fim = new Date(missao.regres).toLocaleDateString("pt-BR", dayExt);

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

   function onClone() {
      const clone = { ...missao };
      clone.users = [];
      setClone(clone);
      setShowForm(true);
   }

   return (
      <>
         <div className='bg-white p-4 pt-6 shadow-md flex flex-col gap-3 rounded-lg uppercase max-w-96 hover:shadow-lg cursor-pointer transition-shadow duration-300 ease-in-out'>
            <div>
               <div className='flex justify-end'>
                  <Dropdown color='light' inline>
                     <DropdownItem icon={FaRegClone} onClick={() => onClone()}>
                        Clonar
                     </DropdownItem>
                  </Dropdown>
               </div>
               <h3 className='text-center w-full font-bold'>
                  {missao.tipo_doc} {missao.n_doc}
               </h3>
            </div>

            <div
               className='flex flex-col gap-3'
               onClick={() => setShowDetail(true)}
            >
               <h4 className='text-center text-sm'>{missao.desc}</h4>
               <h4 className='text-sm'>{missao.obs}</h4>

               <div className='flex flex-col gap-1 capitalize'>
                  <div className='flex flex-row'>
                     <span className='w-28'>Afastamento:</span>
                     <span className='font-mono'>{ini}</span>
                  </div>
                  <div className='flex flex-row'>
                     <span className='w-28'>Regresso:</span>
                     <span className='font-mono'>{fim}</span>
                  </div>
               </div>

               <div className='flex flex-col gap-2'>
                  {missao.pernoites.map((pnt) => (
                     <PernoiteCardMis key={pnt.id} pnt={pnt} />
                  ))}
               </div>

               <div className='flex gap-1 flex-wrap'>
                  {missao.users.map((user) => (
                     <UserCardMis key={user.id} user={user} />
                  ))}
               </div>
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
}

function PernoiteCardMis({ pnt }) {
   const dayExt = {
      day: "2-digit" as const,
      month: "2-digit" as const,
      year: "2-digit" as const,
   };
   const dataIni = new Date(pnt.data_ini).toLocaleDateString("pt-br", dayExt);
   const dataFim = new Date(pnt.data_fim).toLocaleDateString("pt-br", dayExt);

   return (
      <div className='p-1 flex flex-row gap-1 rounded-lg bg-gray-200 items-center justify-start text-sm'>
         <span className='w-40 font-mono lowercase text-center'>
            {dataIni} a {dataFim}
         </span>
         <span className='font-medium'>
            {pnt.cidade.nome}-{pnt.cidade.uf}
         </span>
         <div className='flex flex-row gap-0.5'>
            {pnt.acrec_desloc && (
               <Tooltip content='Acréscimo Deslocamento'>
                  <span className='font-semibold bg-green-400 px-2 rounded-lg'>
                     AC
                  </span>
               </Tooltip>
            )}

            {pnt.meia_diaria && (
               <Tooltip content='Meia Diária'>
                  <span className='font-semibold bg-amber-400 px-2 rounded-lg'>
                     MD
                  </span>
               </Tooltip>
            )}
         </div>
      </div>
   );
}

function UserCardMis({ user }) {
   return (
      <span
         className={clsx("px-2.5 rounded-lg select-none font-medium", {
            "bg-blue-200": user.sit === "c",
            "bg-green-200": user.sit === "d",
            "bg-orange-200": user.sit === "g",
         })}
      >
         {user.sit} | {user.p_g} {user.user.nome_guerra}
      </span>
   );
}
