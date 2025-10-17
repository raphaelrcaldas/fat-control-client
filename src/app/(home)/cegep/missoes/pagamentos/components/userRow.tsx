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
               checked={checked}
               onChange={onChange}
            />
         </span>
         <span className='w-8 font-semibold'>{record.missao.tipo_doc}</span>
         <span className='w-8 font-medium'>{record.missao.n_doc}</span>
         <span className='w-10 font-medium'>{record.missao.tipo}</span>
         <span className='w-32'>
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
         <span className='w-10 text-sm capitalize'>
            {record.missao.dias} dia{record.missao.dias > 1 ? "s" : ""}
         </span>
         <span
            className={clsx("w-14 text-sm capitalize", {
               "text-slate-400": record.user_mis.sit === "g",
            })}
         >
            {Number(record.missao.diarias).toFixed(1)} diárias
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
               <TableHeadCell>Valores</TableHeadCell>
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

                  const subtotal = Number(pnt.custo.subtotal).toLocaleString(
                     "pt-BR",
                     {
                        style: "currency",
                        currency: "BRL",
                     }
                  );
                  let ac_desloc;
                  if (pnt.acrec_desloc) {
                     ac_desloc = 95;
                  } else {
                     ac_desloc = 0;
                  }
                  ac_desloc = Number(ac_desloc).toLocaleString("pt-BR", {
                     style: "currency",
                     currency: "BRL",
                  });

                  return (
                     <TableRow key={pnt.id}>
                        <TableCell>{ini}</TableCell>
                        <TableCell>{fim}</TableCell>
                        <TableCell>{pnt.cidade.nome}</TableCell>
                        <TableCell>{pnt.cidade.uf}</TableCell>
                        <TableCell>
                           {pnt.custo.vals.map((val, i) => {
                              const qtd = Number(val.qtd).toFixed(1);
                              const valor = Number(val.valor).toLocaleString(
                                 "pt-BR",
                                 {
                                    style: "currency",
                                    currency: "BRL",
                                 }
                              );

                              return (
                                 <div key={i}>
                                    {qtd} x {valor}
                                 </div>
                              );
                           })}
                           {}
                        </TableCell>
                        <TableCell>{ac_desloc}</TableCell>
                        <TableCell>{subtotal}</TableCell>
                     </TableRow>
                  );
               })}
            </TableBody>
         </Table>
      </div>
   );
}
