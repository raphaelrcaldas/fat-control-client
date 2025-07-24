"use client";
import {
   Checkbox,
   Button,
   Popover,
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeadCell,
   TableRow,
} from "flowbite-react";
import { IoMdInformationCircleOutline } from "react-icons/io";
import clsx from "clsx";

export function UserRow({ record, checked, onSelect }) {
   const pnts = record.pernoites || [];

   const afast =
      new Date(record.afast).toLocaleDateString("pt-BR", {
         day: "2-digit",
         month: "2-digit",
         year: "2-digit",
         hour: "2-digit",
         minute: "2-digit",
      }) || "N/A";

   const regres =
      new Date(record.regres).toLocaleDateString("pt-BR", {
         day: "2-digit",
         month: "2-digit",
         year: "2-digit",
         hour: "2-digit",
         minute: "2-digit",
      }) || "N/A";

   function onChange() {
      onSelect(record.id, record.valor_total, !checked);
   }

   return (
      <li
         key={record.id}
         className={clsx(
            "p-2 mb-2 text-base text-center rounded-lg shadow flex flex-row gap-2 uppercase justify-evenly items-center",
            {
               "bg-orange-100 hover:bg-orange-300": record.sit === "g",
               "bg-green-100 hover:bg-green-300": record.sit === "d",
               "bg-blue-100 hover:bg-blue-300": record.sit === "c",
            }
         )}
      >
         <span className='w-8'>
            <Checkbox
               className='size-6'
               checked={checked}
               onChange={onChange}
            />
         </span>
         <span className='w-8 font-semibold'>{record.tipo_doc}</span>
         <span className='w-8 font-medium'>{record.n_doc}</span>
         <span className='w-10 font-medium'>{record.tipo}</span>
         <span className='w-32'>
            {record.p_g} {record.user.nome_guerra}
         </span>
         <span
            className={clsx("w-4 font-medium", {
               "text-orange-500": record.sit === "g",
               "text-green-500": record.sit === "d",
               "text-blue-600": record.sit === "c",
            })}
         >
            {record.sit}
         </span>
         <span className='flex-1 text-sm text-left'>
            {record.desc || "Sem descrição"}
         </span>
         <div className='w-36 flex flex-col'>
            <span className='text-gray-500'>{afast}</span>
            <span className='text-gray-500'>{regres}</span>
         </div>
         <span className='w-10 text-sm capitalize'>{record.dias} dias</span>
         <span
            className={clsx("w-14 text-sm capitalize", {
               "text-slate-400": record.sit === "g",
            })}
         >
            {Number(record.diarias).toFixed(1)} diárias
         </span>
         <span className='w-32 font-medium text-center'>
            {Number(record.valor_total).toLocaleString("pt-BR", {
               style: "currency",
               currency: "BRL",
            })}
         </span>
         <div className='w-60 items-center gap-1 flex flex-col'>
            {pnts.length > 0 &&
               pnts.map((pnt) => (
                  <div
                     key={pnt.id}
                     className='text-sm bg-gray-200 px-2 py-1 rounded-lg'
                  >
                     {pnt.cidade.nome}-{pnt.cidade.uf}
                     {record.sit != "g" && (
                        <> ({Number(pnt.diarias).toFixed(1)})</>
                     )}
                  </div>
               ))}
         </div>
         <Popover content={<PgtContent pernoites={pnts} />} placement='left'>
            <Button className='p-0' disabled={record.sit === "g"} color='light'>
               <IoMdInformationCircleOutline size={20} />
            </Button>
         </Popover>
      </li>
   );
}

function PgtContent({ pernoites }) {
   return (
      <div className='overflow-x-auto'>
         <Table className='text-center'>
            <TableHead>
               <TableHeadCell>Chegada</TableHeadCell>
               <TableHeadCell>Saída</TableHeadCell>
               <TableHeadCell>Cidade</TableHeadCell>
               <TableHeadCell>UF</TableHeadCell>
               <TableHeadCell>QTD</TableHeadCell>
               <TableHeadCell>Acresc Desloc</TableHeadCell>
               <TableHeadCell>SubTotal</TableHeadCell>
            </TableHead>
            <TableBody className='divide-y'>
               {pernoites.map((pnt) => {
                  const ini =
                     new Date(pnt.data_ini).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                     }) || "N/A";
                  const fim =
                     new Date(pnt.data_fim).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                     }) || "N/A";
                  return (
                     <TableRow key={pnt.id}>
                        <TableCell>{ini}</TableCell>
                        <TableCell>{fim}</TableCell>
                        <TableCell>{pnt.cidade.nome}</TableCell>
                        <TableCell>{pnt.cidade.uf}</TableCell>
                        <TableCell>{Number(pnt.diarias).toFixed(1)}</TableCell>
                        <TableCell>
                           {pnt.acrec_desloc ? "Sim" : "Não"}
                        </TableCell>
                        <TableCell>
                           {Number(pnt.subtotal).toLocaleString("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                           })}
                        </TableCell>
                     </TableRow>
                  );
               })}
            </TableBody>
         </Table>
      </div>
   );
}
