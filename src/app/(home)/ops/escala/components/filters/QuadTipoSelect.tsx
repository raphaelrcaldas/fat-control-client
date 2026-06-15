import { useMemo } from "react";
import { Label, Select } from "flowbite-react";
import { useQuadsTypes } from "@/hooks/queries/useQuads";
import type { EscalaFiltersState } from "../../types";

const ELIGIBLE_GROUPS = new Set(["sobr", "nasc", "local", "inter"]);

interface QuadTipoSelectProps {
   value: EscalaFiltersState;
   onChange: (next: EscalaFiltersState) => void;
}

export function QuadTipoSelect({ value, onChange }: QuadTipoSelectProps) {
   const { data: quadsType = [], isLoading } = useQuadsTypes();

   const eligibleGroups = useMemo(
      () => quadsType.filter((g) => ELIGIBLE_GROUPS.has(g.short)),
      [quadsType]
   );

   return (
      <div className="md:col-span-3">
         <Label
            htmlFor="esc-tipo"
            className="text-[10px] font-bold tracking-widest text-slate-600 uppercase"
         >
            Quadrinho
         </Label>
         <Select
            id="esc-tipo"
            value={value.tipo_quad_id ?? ""}
            onChange={(e) =>
               onChange({
                  ...value,
                  tipo_quad_id: e.target.value
                     ? parseInt(e.target.value, 10)
                     : null,
               })
            }
            disabled={isLoading}
         >
            <option value="">— Selecionar —</option>
            {eligibleGroups.map((group) => (
               <optgroup key={group.id} label={group.long.toUpperCase()}>
                  {group.types.map((t) => (
                     <option key={t.id} value={t.id}>
                        {t.long.toUpperCase()}
                     </option>
                  ))}
               </optgroup>
            ))}
         </Select>
      </div>
   );
}
