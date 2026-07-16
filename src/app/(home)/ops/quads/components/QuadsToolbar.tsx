"use client";
import { Button, ButtonGroup, Label, Select } from "flowbite-react";
import { QuadTypeGroup } from "services/routes/quads";
import { FUNCOES_PRINCIPAIS, getFuncLabel } from "@/constants";
import { QuadOrdem } from "../utils/sortQuads";

interface QuadsToolbarProps {
   quadsType: QuadTypeGroup[];
   quadFunc: string;
   onQuadFuncChange: (func: string) => void;
   quadType: number;
   onQuadTypeChange: (id: number) => void;
   ordem: QuadOrdem;
   onOrdemChange: (ordem: QuadOrdem) => void;
   visual: "comp" | "reduz";
   onVisualChange: (visual: "comp" | "reduz") => void;
   loadingTypes: boolean;
}

export function QuadsToolbar({
   quadsType,
   quadFunc,
   onQuadFuncChange,
   quadType,
   onQuadTypeChange,
   ordem,
   onOrdemChange,
   visual,
   onVisualChange,
   loadingTypes,
}: QuadsToolbarProps) {
   const visibleGroups = quadsType.filter((group) =>
      group.types.some((type) => type.funcs_list.includes(quadFunc))
   );

   return (
      <div className="flex flex-wrap gap-4 rounded border border-slate-200 bg-white px-2 py-3 shadow">
         <div className="grid text-center">
            <Label htmlFor="quad-func">Função</Label>
            <Select
               id="quad-func"
               value={quadFunc}
               className="w-32"
               onChange={(e) => onQuadFuncChange(e.target.value)}
            >
               {FUNCOES_PRINCIPAIS.map((f) => (
                  <option key={f} value={f}>
                     {getFuncLabel(f, true)}
                  </option>
               ))}
            </Select>
         </div>
         <div className="grid text-center">
            <Label htmlFor="quad-type">Quadrinho</Label>
            <Select
               id="quad-type"
               value={quadType}
               onChange={(e) => onQuadTypeChange(parseInt(e.target.value))}
               className="w-40"
               disabled={loadingTypes || visibleGroups.length === 0}
            >
               {visibleGroups.length === 0 && (
                  <option value="">
                     {loadingTypes ? "Carregando..." : "Nenhum disponível"}
                  </option>
               )}
               {visibleGroups.map((group, index) => {
                  const nameGroup = group.long.toUpperCase();
                  return (
                     <optgroup key={index} label={nameGroup}>
                        {group.types
                           .filter((type) => type.funcs_list.includes(quadFunc))
                           .map((type) => (
                              <option key={type.id} value={type.id}>
                                 {type.long.toUpperCase()}
                              </option>
                           ))}
                     </optgroup>
                  );
               })}
            </Select>
         </div>
         <fieldset className="flex flex-col text-center">
            <legend className="text-sm">Antiguidade</legend>
            {/* grow + h-auto: o grupo ocupa a altura restante do fieldset e o
                align-items stretch do flex estica os botões junto */}
            <ButtonGroup className="grow">
               <Button
                  size="sm"
                  color={ordem === "opr" ? "primary" : "light"}
                  aria-pressed={ordem === "opr"}
                  onClick={() => onOrdemChange("opr")}
                  className="h-auto"
               >
                  Operacional
               </Button>
               <Button
                  size="sm"
                  color={ordem === "mil" ? "primary" : "light"}
                  aria-pressed={ordem === "mil"}
                  onClick={() => onOrdemChange("mil")}
                  className="h-auto"
               >
                  Militar
               </Button>
            </ButtonGroup>
         </fieldset>
         <fieldset className="hidden flex-col text-center md:flex">
            <legend className="text-sm">Visualização</legend>
            <ButtonGroup className="grow">
               <Button
                  size="sm"
                  color={visual === "comp" ? "primary" : "light"}
                  aria-pressed={visual === "comp"}
                  onClick={() => onVisualChange("comp")}
                  className="h-auto"
               >
                  Completa
               </Button>
               <Button
                  size="sm"
                  color={visual === "reduz" ? "primary" : "light"}
                  aria-pressed={visual === "reduz"}
                  onClick={() => onVisualChange("reduz")}
                  className="h-auto"
               >
                  Reduzida
               </Button>
            </ButtonGroup>
         </fieldset>
      </div>
   );
}
