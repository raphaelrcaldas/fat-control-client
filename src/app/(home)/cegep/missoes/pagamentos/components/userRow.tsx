"use client";
import { Checkbox, Button, Popover } from "flowbite-react";
import { IoMdInformationCircleOutline } from "react-icons/io";
import clsx from "clsx";
import { MisPntsTable } from "../../../components/popMisPnts";

export function UserRow({ record, checked, onSelect }) {
   const pnts = record.missao.pernoites || [];

   const afast =
      new Date(record.missao.afast).toLocaleDateString("pt-BR", {
         day: "2-digit",
         month: "2-digit",
         year: "2-digit",
         hour: "2-digit",
         minute: "2-digit",
      }) || "N/A";

   const regres =
      new Date(record.missao.regres).toLocaleDateString("pt-BR", {
         day: "2-digit",
         month: "2-digit",
         year: "2-digit",
         hour: "2-digit",
         minute: "2-digit",
      }) || "N/A";

   function onChange() {
      onSelect(record.user_mis.id, record.missao.valor_total, !checked);
   }

   return (
      <li
         key={record.missao.id}
         className={clsx(
            "p-2 mb-2 text-base text-center rounded-lg shadow flex flex-row gap-2 uppercase justify-evenly items-center",
            {
               "bg-orange-100 hover:bg-orange-200": record.user_mis.sit === "g",
               "bg-green-100 hover:bg-green-200": record.user_mis.sit === "d",
               "bg-blue-100 hover:bg-blue-200": record.user_mis.sit === "c",
            }
         )}
      >
         <span className='w-8'>
            <Checkbox
               className='size-6'
               color='blue'
               checked={checked}
               onChange={onChange}
            />
         </span>
         <span className='w-16 font-semibold'>
            {record.missao.tipo_doc} {record.missao.n_doc}
         </span>
         <span className='w-40'>
            {record.user_mis.p_g} {record.user_mis.user.nome_guerra}
         </span>
         <span
            className={clsx("w-4 font-medium", {
               "text-orange-500": record.user_mis.sit === "g",
               "text-green-500": record.user_mis.sit === "d",
               "text-blue-600": record.user_mis.sit === "c",
            })}
         >
            {record.user_mis.sit}
         </span>
         <span className='flex-1 text-sm text-left'>
            {record.missao.desc || "Sem descrição"}
         </span>
         <div className='w-36 flex flex-col'>
            <span className='text-gray-500'>{afast}</span>
            <span className='text-gray-500'>{regres}</span>
         </div>
         <span className='w-10 text-sm grid'>
            <span>{record.missao.dias}</span>
            <span className='capitalize'>dia</span>
         </span>
         <span
            className={clsx("w-14 grid text-sm capitalize", {
               "text-slate-400": record.user_mis.sit === "g",
            })}
         >
            <span>{Number(record.missao.diarias).toFixed(1)}</span>
            <span>diária{record.missao.diarias > 1 ? "s" : ""}</span>
         </span>
         <span className='w-32 font-medium text-center'>
            {Number(record.missao.valor_total).toLocaleString("pt-BR", {
               style: "currency",
               currency: "BRL",
            })}
         </span>
         <div className='w-60 items-center gap-1 flex flex-col'>
            {pnts.length > 0 &&
               pnts.map((pnt) => {
                  const totalDiarias = pnt.custo.vals.reduce(
                     (acc, val) => acc + val.qtd,
                     0
                  );
                  return (
                     <div
                        key={pnt.id}
                        className='text-sm bg-gray-200 px-2 py-1 rounded-lg'
                     >
                        {pnt.cidade.nome}-{pnt.cidade.uf}
                        {record.user_mis.sit != "g" && (
                           <> ({Number(totalDiarias).toFixed(1)})</>
                        )}
                     </div>
                  );
               })}
         </div>
         <Popover
            content={
               <MisPntsTable
                  pernoites={pnts}
                  acDeslocSede={record.missao.acrec_desloc}
                  total={record.missao.valor_total}
               />
            }
            placement='left'
         >
            <Button
               className='size-11 p-0'
               disabled={record.sit === "g"}
               color='light'
            >
               <IoMdInformationCircleOutline size={23} />
            </Button>
         </Popover>
      </li>
   );
}
