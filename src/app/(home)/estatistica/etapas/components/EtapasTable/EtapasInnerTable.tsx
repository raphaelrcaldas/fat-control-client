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
}: EtapasInnerTableProps) {
   return (
      <div className="overflow-x-auto">
         <Table
            hoverable
            className="text-center"
            theme={{
               body: { cell: { base: "px-1 py-0.5" } },
            }}
         >
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
                     pousos={etapa.pousos}
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
