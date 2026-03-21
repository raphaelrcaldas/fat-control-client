"use client";

import {
   Checkbox,
   Table,
   TableBody,
   TableHead,
   TableHeadCell,
   TableRow,
} from "flowbite-react";
import type { EtapaItem } from "services/routes/estatistica/etapas";
import { EtapaRow } from "./EtapaRow";

interface HeaderCheckboxProps {
   checked: boolean;
   indeterminate: boolean;
   onChange: () => void;
}

export interface EtapasInnerTableProps {
   etapas: EtapaItem[];
   loading: boolean;
   selectedIds: Set<number>;
   onToggleEtapa: (id: number) => void;
   onDetailEtapa: (id: number) => void;
   onEditEtapa: (id: number) => void;
   headerCheckbox?: HeaderCheckboxProps;
}

export function EtapasInnerTable({
   etapas,
   loading,
   selectedIds,
   onToggleEtapa,
   onDetailEtapa,
   onEditEtapa,
   headerCheckbox,
}: EtapasInnerTableProps) {
   return (
      <div className="overflow-x-auto">
         <Table
            hoverable
            className="text-center"
            theme={{
               head: { cell: { base: "bg-white px-2" } },
               body: { cell: { base: "px-2" } },
            }}
         >
            <TableHead>
               <TableRow>
                  <TableHeadCell className="w-10">
                     {headerCheckbox && (
                        <Checkbox
                           color="red"
                           checked={headerCheckbox.checked}
                           ref={(el) => {
                              if (el)
                                 el.indeterminate =
                                    headerCheckbox.indeterminate;
                           }}
                           onChange={headerCheckbox.onChange}
                           className="cursor-pointer"
                        />
                     )}
                  </TableHeadCell>
                  <TableHeadCell className="w-28">Data</TableHeadCell>
                  <TableHeadCell className="w-16">Origem</TableHeadCell>
                  <TableHeadCell className="w-16">Destino</TableHeadCell>
                  <TableHeadCell className="w-16">DEP</TableHeadCell>
                  <TableHeadCell className="w-16">ARR</TableHeadCell>
                  <TableHeadCell className="w-18">TV</TableHeadCell>
                  <TableHeadCell className="w-20">Aeronave</TableHeadCell>
                  <TableHeadCell className="w-68">Esforço Aéreo</TableHeadCell>
                  <TableHeadCell>Tripulação</TableHeadCell>
                  <TableHeadCell className="w-10" />
               </TableRow>
            </TableHead>
            <TableBody className="divide-y">
               {etapas.map((etapa) => (
                  <EtapaRow
                     key={etapa.id}
                     id={etapa.id}
                     data={etapa.data}
                     origem={etapa.origem}
                     destino={etapa.destino}
                     dep={etapa.dep}
                     arr={etapa.arr}
                     tvoo={etapa.tvoo}
                     anv={etapa.anv}
                     oi_etapas={etapa.oi_etapas}
                     tripulantes={etapa.tripulantes}
                     loading={loading}
                     sagem={etapa.sagem}
                     parte1={etapa.parte1}
                     checked={selectedIds.has(etapa.id)}
                     onToggleEtapa={onToggleEtapa}
                     onDetailEtapa={onDetailEtapa}
                     onEditEtapa={onEditEtapa}
                  />
               ))}
            </TableBody>
         </Table>
      </div>
   );
}
