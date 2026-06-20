"use client";

import { useMemo } from "react";
import { Select } from "flowbite-react";
import { HiX } from "react-icons/hi";
import { MAX_PILOTOS, type DuplaPilot, type CrewSearchResult } from "../types";
import PilotSearchInput from "./PilotSearchInput";

interface PilotSearchDropdownProps {
   pilots: DuplaPilot[];
   onAdd: (crew: CrewSearchResult) => void;
   onRemove: (tripId: number) => void;
   onUpdateFuncBordo: (tripId: number, fb: string) => void;
   showSearch: boolean;
}

export default function PilotSearchDropdown({
   pilots,
   onAdd,
   onRemove,
   onUpdateFuncBordo,
   showSearch,
}: PilotSearchDropdownProps) {
   const assignedIds = useMemo(
      () => new Set(pilots.map((p) => p.trip_id)),
      [pilots]
   );

   return (
      <div className="space-y-3">
         {showSearch && pilots.length < MAX_PILOTOS && (
            <PilotSearchInput assignedIds={assignedIds} onSelect={onAdd} />
         )}

         <div className="space-y-2">
            {pilots.length === 0 && (
               <div className="flex items-center justify-center rounded border-2 border-dashed border-slate-200 px-4 py-4 text-xs text-gray-400">
                  Busque e adicione pelo menos um piloto
               </div>
            )}
            {pilots.map((p) => (
               <div
                  key={p.trip_id}
                  className="flex items-center gap-3 rounded border border-red-200 bg-red-50/60 px-4 py-2.5"
               >
                  <div className="min-w-0 flex-1">
                     <p className="text-sm font-semibold text-gray-900 uppercase">
                        {p.p_g} {p.nome_guerra}
                     </p>
                  </div>
                  <Select
                     sizing="sm"
                     value={p.func_bordo}
                     onChange={(e) =>
                        onUpdateFuncBordo(p.trip_id, e.target.value)
                     }
                     className="w-20"
                  >
                     <option value="1P">1P</option>
                     <option value="2P">2P</option>
                     <option value="IN">IN</option>
                     <option value="AL">AL</option>
                  </Select>
                  {showSearch && (
                     <button
                        type="button"
                        onClick={() => onRemove(p.trip_id)}
                        className="rounded p-1 text-gray-400 hover:bg-red-100 hover:text-red-500"
                     >
                        <HiX className="h-4 w-4" />
                     </button>
                  )}
               </div>
            ))}
         </div>
      </div>
   );
}
