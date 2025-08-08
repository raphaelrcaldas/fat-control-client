import { Badge, Tooltip } from "flowbite-react";
import { useState } from "react";
import MissionDetail from "./missionDetail";
import { Missao } from "services/routes/cegep/missoes";
import clsx from "clsx";

export function CardMission({
   missao,
   update,
}: {
   missao: Missao;
   update: () => void;
}) {
   const [showDetail, setShowDetail] = useState(false);

   const ini = new Date(missao.afast).toLocaleDateString("pt-BR", {
      year: "2-digit",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
   });
   const fim = new Date(missao.regres).toLocaleDateString("pt-BR", {
      year: "2-digit",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
   });

   let colorBadge: string;
   switch (missao.tipo) {
      case "adm":
         colorBadge = "info";
         break;
      case "opr":
         colorBadge = "warning";
         break;
      case "tal":
         colorBadge = "success";
         break;
   }

   return (
      <>
         <div
            className='bg-white p-4 pt-6 shadow-md flex flex-col gap-3 rounded-lg uppercase max-w-96 hover:shadow-lg cursor-pointer transition-shadow duration-300 ease-in-out'
            onClick={() => setShowDetail(true)}
         >
            <div className='flex flex-row justify-between'>
               <Badge color={colorBadge}>{missao.tipo}</Badge>
               <h3 className='text-center w-full font-bold'>
                  {missao.tipo_doc} {missao.n_doc}
               </h3>
               <Tooltip className='capitalize' content='Indenizável'>
                  <Badge color={missao.indenizavel ? "success" : ""}>
                     {missao.indenizavel ? "IND" : " "}
                  </Badge>
               </Tooltip>
            </div>

            <h4 className='text-center text-sm'>{missao.desc}</h4>

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

            <div className='flex flex-wrap gap-2'>
               {missao.pernoites.map((pnt) => {
                  return (
                     <span className='bg-slate-200 p-1 rounded-lg'>
                        {pnt.cidade.nome}-{pnt.cidade.uf}
                     </span>
                  );
               })}
            </div>

            <div className='flex gap-1 flex-wrap'>
               {missao.users.map((user) => {
                  return (
                     <span
                        key={user.id}
                        className={clsx(
                           "px-2.5 rounded-lg select-none font-medium",
                           {
                              "bg-blue-200": user.sit === "c",
                              "bg-green-200": user.sit === "d",
                              "bg-orange-200": user.sit === "g",
                           }
                        )}
                     >
                        {user.sit} | {user.p_g} {user.user.nome_guerra}
                     </span>
                  );
               })}
            </div>
         </div>

         {showDetail && (
            <MissionDetail
               missao={missao}
               show={showDetail}
               setShow={setShowDetail}
               update={update}
               edit={false}
            />
         )}
      </>
   );
}
