"use client";
import { useState } from "react";
import { Card, Dropdown, DropdownItem } from "flowbite-react";
import { isoStrToDate } from "utils/dateHandler";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import { FormComiss } from "./formComiss";
import {
   MdOutlineAttachMoney,
   MdOutlineCalendarToday,
   MdOutlineEdit,
} from "react-icons/md";
import { FaRegTrashAlt } from "react-icons/fa";
import { DetailComiss } from "./detailComiss";
import clsx from "clsx";
import { realCurrency } from "utils/financeiro";
import { deleteCmto } from "services/routes/cegep/comiss";
import { ComissWithMiss } from "services/routes/cegep/comiss";
import "react-circular-progressbar/dist/styles.css";

export function CardComiss({
   comiss,
   update,
}: {
   comiss: ComissWithMiss;
   update: () => void;
}) {
   const [showDetail, setShowDetail] = useState(false);
   const [showForm, setShowForm] = useState(false);
   const user = comiss.user;
   const data_abertura = isoStrToDate(comiss.data_ab).toLocaleDateString(
      "pt-br",
      {
         day: "2-digit",
         month: "2-digit",
         year: "2-digit",
      }
   );
   const data_fechamento = isoStrToDate(comiss.data_fc).toLocaleDateString(
      "pt-br",
      {
         day: "2-digit",
         month: "2-digit",
         year: "2-digit",
      }
   );

   const ajd_ab = comiss.valor_aj_ab;
   const ajd_fc = comiss.valor_aj_fc;

   async function deleteComiss() {
      const confirmed = window.confirm("Deseja deletar esse comissionamento?");
      if (!confirmed) return;

      try {
         const response = await deleteCmto(comiss.id);

         if (!response.ok) {
            const errorData = await response.json();
            alert(
               `Erro ao deletar: ${errorData.detail || "Erro desconhecido."}`
            );
            return;
         }

         const data = await response.json();
         alert(data.detail || "Comissionamento deletado com sucesso.");
         update(); // Só atualiza se deu tudo certo
      } catch (error) {
         // Erros de rede ou falhas inesperadas
         console.error("Erro ao deletar comissionamento:", error);
         alert("Erro inesperado. Verifique sua conexão ou tente novamente.");
      }
   }
   return (
      <>
         <Card
            className='uppercase hover:shadow-lg w-[28rem] select-none transition-shadow duration-300 ease-in-out'
            //
         >
            <div className='flex flex-row justify-between items-center'>
               <h3 className='font-medium text-center w-full'>
                  {user.p_g} {user.nome_guerra}
               </h3>
               <Dropdown color='light' inline dismissOnClick={false}>
                  <DropdownItem
                     icon={MdOutlineEdit}
                     onClick={() => setShowForm(true)}
                  >
                     Editar
                  </DropdownItem>
                  <DropdownItem
                     onClick={deleteComiss}
                     className='text-red-500'
                     icon={FaRegTrashAlt}
                  >
                     Deletar
                  </DropdownItem>
               </Dropdown>
            </div>
            <div className='cursor-pointer' onClick={() => setShowDetail(true)}>
               <div className='flex flex-row justify-between mb-3'>
                  <div className='grid text-base'>
                     <div className='flex flex-row gap-2 items-center justify-start'>
                        <span
                           className={clsx("size-4 bg-green-500 rounded-lg", {
                              "bg-slate-500": comiss.status == "fechado",
                           })}
                        >
                           {" "}
                        </span>
                        <span className='w-28 text-sm'>Abertura:</span>
                        <span className='font-mono'>{data_abertura}</span>
                     </div>
                     <div className='flex flex-row gap-2 items-center justify-start'>
                        <span
                           className={clsx("size-4 bg-red-500 rounded-lg", {
                              "bg-slate-500": comiss.status == "fechado",
                           })}
                        >
                           {" "}
                        </span>
                        <span className='w-28 text-sm'>Fechamento:</span>
                        <span className='font-mono'>{data_fechamento}</span>
                     </div>
                  </div>
                  <div>
                     <ComissProgress
                        value={comiss.completude}
                        status={comiss.status}
                        modulo={comiss.modulo}
                     />
                  </div>
               </div>
               <h3 className='text-center border-t p-2 text-sm flex justify-center gap-2 items-center'>
                  {comiss.dias_cumprir ? (
                     <>
                        <MdOutlineCalendarToday /> <span>Período</span>
                     </>
                  ) : (
                     <>
                        <MdOutlineAttachMoney /> <span>Comparativo</span>
                     </>
                  )}
               </h3>
               <div className='grid grid-cols-3'>
                  <div className='grid text-center'>
                     <div className='text-lg'>
                        {comiss.dias_cumprir ? (
                           <span>
                              {comiss.dias_cumprir}
                              <span className='text-sm capitalize'> dias</span>
                           </span>
                        ) : (
                           realCurrency(ajd_ab + ajd_fc)
                        )}
                     </div>
                     <div className='text-slate-500'>Previsto</div>
                  </div>
                  <div className='grid text-center'>
                     <div className='text-lg'>
                        {comiss.dias_cumprir ? (
                           <span>
                              {comiss.dias_comp}
                              <span className='text-sm capitalize'> dias</span>
                           </span>
                        ) : (
                           realCurrency(comiss.vals_comp)
                        )}
                     </div>
                     <div className='text-slate-500'>Computado</div>
                  </div>
                  <div className='grid text-center'>
                     <div className='text-lg'>
                        {comiss.dias_cumprir ? (
                           <span>
                              {comiss.dias_cumprir - comiss.dias_comp}
                              <span className='text-sm capitalize'> dias</span>
                           </span>
                        ) : (
                           realCurrency(ajd_ab + ajd_fc - comiss.vals_comp)
                        )}
                     </div>
                     <div className='text-slate-500'>Restante</div>
                  </div>
               </div>
            </div>
         </Card>

         {showDetail && (
            <DetailComiss
               show={showDetail}
               setShow={setShowDetail}
               comiss={comiss}
            />
         )}

         {showForm && (
            <FormComiss
               show={showForm}
               setShow={setShowForm}
               comiss={comiss}
               update={update}
            />
         )}
      </>
   );
}

function ComissProgress({
   value,
   modulo,
   status,
}: {
   value: number;
   modulo: boolean;
   status: string;
}) {
   let color = modulo ? "#009401" : "#d70001";
   color = status == "fechado" ? "#919191" : color;

   return (
      <CircularProgressbar
         className='size-24'
         value={value}
         strokeWidth={11}
         maxValue={1}
         text={`${(Number(value) * 100).toFixed(1)}%`}
         styles={buildStyles({
            pathColor: color,
            textColor: color,
            textSize: "21px",
         })}
      />
   );
}
