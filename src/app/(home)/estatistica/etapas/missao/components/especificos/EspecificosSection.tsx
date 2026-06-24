"use client";

import clsx from "clsx";
import { GiParachute } from "react-icons/gi";
import { HiOutlineCube, HiPlus } from "react-icons/hi";
import { FaGasPump } from "react-icons/fa";
import type { IconType } from "react-icons";

import type { EspecificoKind } from "../../context/types";
import type { EtapaEspecificosGroup } from "../../hooks/useEtapaEditor";

import { HvyCdsBlock } from "./HvyCdsBlock";
import { PqdBlock } from "./PqdBlock";
import { RevoBlock } from "./RevoBlock";

interface EspecificosSectionProps {
   especificos: EtapaEspecificosGroup;
}

interface AddButtonConfig {
   kind: EspecificoKind;
   label: string;
   Icon: IconType;
   className: string;
}

const ADD_BUTTONS: AddButtonConfig[] = [
   {
      kind: "pqd",
      label: "PQD",
      Icon: GiParachute,
      className:
         "border-green-200 bg-green-50 text-green-700 hover:bg-green-100",
   },
   {
      kind: "revo",
      label: "REVO",
      Icon: FaGasPump,
      className:
         "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100",
   },
   {
      kind: "heavyCds",
      label: "Heavy/CDS",
      Icon: HiOutlineCube,
      className: "border-red-200 bg-red-50 text-red-700 hover:bg-red-100",
   },
];

export function EspecificosSection({ especificos }: EspecificosSectionProps) {
   const {
      pqd,
      revo,
      heavyCds,
      addEspecifico,
      removeEspecifico,
      updatePqd,
      updateRevo,
      updateHeavyCds,
   } = especificos;
   const total = pqd.length + revo.length + heavyCds.length;

   return (
      <section className="space-y-3">
         <div className="flex flex-wrap items-center gap-2">
            {ADD_BUTTONS.map(({ kind, label, Icon, className }) => (
               <button
                  key={kind}
                  type="button"
                  onClick={() => addEspecifico(kind)}
                  className={clsx(
                     "flex items-center gap-1.5 rounded border px-3 py-1.5 text-xs font-bold tracking-wide uppercase transition-colors focus:outline-none",
                     className
                  )}
               >
                  <HiPlus className="h-3.5 w-3.5" />
                  <Icon className="h-4 w-4" />
                  {label}
               </button>
            ))}
         </div>

         {total === 0 ? (
            <div className="flex flex-col items-center rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
               <p className="text-sm font-medium text-gray-500">
                  Nenhum específico adicionado
               </p>
               <p className="mt-1 text-xs text-gray-400">
                  Use os botões acima para registrar lançamentos de
                  paraquedista, reabastecimentos ou cargas pesadas desta etapa.
               </p>
            </div>
         ) : (
            <div className="flex flex-col gap-3">
               {pqd.map((item, i) => (
                  <PqdBlock
                     key={item.uid}
                     item={item}
                     index={i}
                     onChange={(patch) => updatePqd(item.uid, patch)}
                     onRemove={() => removeEspecifico("pqd", item.uid)}
                  />
               ))}
               {revo.map((item, i) => (
                  <RevoBlock
                     key={item.uid}
                     item={item}
                     index={i}
                     onChange={(patch) => updateRevo(item.uid, patch)}
                     onRemove={() => removeEspecifico("revo", item.uid)}
                  />
               ))}
               {heavyCds.map((item, i) => (
                  <HvyCdsBlock
                     key={item.uid}
                     item={item}
                     index={i}
                     onChange={(patch) => updateHeavyCds(item.uid, patch)}
                     onRemove={() => removeEspecifico("heavyCds", item.uid)}
                  />
               ))}
            </div>
         )}
      </section>
   );
}
