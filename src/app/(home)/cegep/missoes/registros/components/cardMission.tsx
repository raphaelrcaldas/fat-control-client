import { Badge, Card, Tooltip } from "flowbite-react";
import { useState } from "react";
import MissionDetail from "./missionDetail";
import { Missao } from "services/routes/cegep/missoes";

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
   });
   const fim = new Date(missao.regres).toLocaleDateString("pt-BR", {
      year: "2-digit",
      month: "2-digit",
      day: "2-digit",
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
         <Card
            className='uppercase size-52 hover:shadow-lg cursor-pointer transition-shadow duration-300 ease-in-out'
            onClick={() => setShowDetail(true)}
         >
            <div className='flex justify-between mt-2'>
               <Badge color={colorBadge}>{missao.tipo}</Badge>

               {missao.indenizavel && (
                  <Tooltip className='capitalize' content='Indenizável'>
                     <Badge color='lime'>IND</Badge>
                  </Tooltip>
               )}
            </div>
            <h3 className='text-center font-bold'>
               {missao.tipo_doc} {missao.n_doc}
            </h3>
            <h4 className='text-center text-sm'>{missao.desc}</h4>

            <p className='text-center lowercase'>
               {ini} a {fim}
            </p>
         </Card>

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
