"use client";
import { useState } from "react";
import { Progress, Dropdown, DropdownItem, Label } from "flowbite-react";
import { isoStrToDate } from "utils/dateHandler";
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

export function ListComiss({
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
         <div className='bg-white uppercase hover:bg-green-100 px-2 py-1 rounded-md'>
            <div className='flex flex-row justify-between items-center'>
               <div className='font-medium text-center w-96'>
                  {user.p_g} {user.nome_guerra}
               </div>
               <div className='flex flex-row gap-2 w-40 items-center justify-center'>
                  <span
                     className={clsx("size-4 bg-green-500 rounded-lg", {
                        "bg-slate-500": comiss.status == "fechado",
                     })}
                  >
                     {" "}
                  </span>
                  <span className='font-mono'>{data_abertura}</span>
               </div>
               <div className='flex flex-row gap-2 w-40 items-center justify-center'>
                  <span
                     className={clsx("size-4 bg-red-500 rounded-lg", {
                        "bg-slate-500": comiss.status == "fechado",
                     })}
                  >
                     {" "}
                  </span>
                  <span className='font-mono'>{data_fechamento}</span>
               </div>
               <div
                  className={clsx(
                     "w-36 hidden md:grid justify-items-center text-sm font-medium text-blue-800",
                     {
                        "text-green-700": !comiss.dias_cumprir,
                     }
                  )}
               >
                  {comiss.dias_cumprir ? (
                     <>
                        <MdOutlineCalendarToday /> <span>Período</span>
                     </>
                  ) : (
                     <>
                        <MdOutlineAttachMoney /> <span>Comparativo</span>
                     </>
                  )}
               </div>
               <div className='w-40'>
                  <ComissProgress
                     value={comiss.completude}
                     status={comiss.status}
                     modulo={comiss.modulo}
                  />
               </div>

               <div className='hidden md:grid grid-cols-3 w-[24rem] text-base'>
                  <div className='grid text-center'>
                     <div className=''>
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
                     <div className=''>
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
                     <div className=''>
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

               {/* <Dropdown color='light' inline dismissOnClick={false}>
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
               </Dropdown> */}
            </div>
         </div>

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
   let color = modulo ? "green" : "red";
   color = status == "fechado" ? "gray" : color;
   const theme = {
      label: "mb-0.5 flex font-medium justify-center",
   };

   return (
      <div className='grid'>
         <Label className='text-center w-full'>{`${(
            Number(value) * 100
         ).toFixed(1)}%`}</Label>
         <Progress
            progress={value * 100}
            theme={theme}
            color={color}
            size='lg'
         />
      </div>
   );
}
