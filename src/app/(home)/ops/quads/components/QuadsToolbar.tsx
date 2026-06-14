"use client";
import Link from "next/link";
import { Select, Radio, Label, Button } from "flowbite-react";
import { FaSliders } from "react-icons/fa6";
import { QuadTypeGroup } from "services/routes/quads";
import { FUNCOES_PRINCIPAIS, getFuncLabel } from "@/constants";
import { PermBased } from "@/app/(home)/hooks/usePermBased";
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
   return (
      <div className="mb-2 flex gap-4 rounded border border-slate-200 bg-white px-2 py-3 shadow">
         <div className="grid text-center">
            <Label>Função</Label>
            <Select
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
            <Label>Quadrinho</Label>
            <Select
               value={quadType}
               onChange={(e) => onQuadTypeChange(parseInt(e.target.value))}
               className="w-40"
               disabled={loadingTypes}
            >
               {quadsType
                  .filter((group) =>
                     group.types.some((type) =>
                        type.funcs_list.includes(quadFunc)
                     )
                  )
                  .map((group, index) => {
                     const nameGroup = group.long.toUpperCase();
                     return (
                        <optgroup key={index} label={nameGroup}>
                           {group.types
                              .filter((type) =>
                                 type.funcs_list.includes(quadFunc)
                              )
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
         <div className="grid">
            <h3 className="self-start text-center text-sm capitalize">
               Antiguidade
            </h3>
            <div className="flex items-center gap-2">
               <Radio
                  id="opr"
                  name="ordenar"
                  color="red"
                  value="opr"
                  checked={ordem === "opr"}
                  onChange={() => onOrdemChange("opr")}
               />
               <Label htmlFor="opr">Operacional</Label>
            </div>
            <div className="flex items-center gap-2">
               <Radio
                  id="mil"
                  name="ordenar"
                  color="red"
                  value="mil"
                  checked={ordem === "mil"}
                  onChange={() => onOrdemChange("mil")}
               />
               <Label htmlFor="mil">Militar</Label>
            </div>
         </div>
         <div className="hidden md:grid">
            <h3 className="self-start text-center text-sm capitalize">
               Visualização
            </h3>
            <div className="flex items-center gap-2">
               <Radio
                  id="comp"
                  name="visual"
                  color="red"
                  value="comp"
                  checked={visual === "comp"}
                  onChange={() => onVisualChange("comp")}
               />
               <Label htmlFor="comp">Completa</Label>
            </div>
            <div className="flex items-center gap-2">
               <Radio
                  id="reduz"
                  name="visual"
                  color="red"
                  value="reduz"
                  checked={visual === "reduz"}
                  onChange={() => onVisualChange("reduz")}
               />
               <Label htmlFor="reduz">Reduzida</Label>
            </div>
         </div>

         <PermBased resource="quad_ops" requiredPerm="create">
            <div className="ml-auto flex items-center">
               <Button as={Link} href="/ops/quads/gerenciar" color="light">
                  <FaSliders className="mr-2 h-4 w-4" />
                  Gerenciar
               </Button>
            </div>
         </PermBased>
      </div>
   );
}
