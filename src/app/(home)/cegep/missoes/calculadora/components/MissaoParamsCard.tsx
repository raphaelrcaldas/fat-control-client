"use client";

import { Checkbox, Label } from "flowbite-react";

interface MissaoParamsCardProps {
   acrecDesloc: boolean;
   setAcrecDesloc: (value: boolean) => void;
}

/**
 * Opções da missão na calculadora. Não há período (afast/regres): só as
 * datas de cada pernoite entram no cálculo. Resta o acréscimo de
 * deslocamento global, somado 1× por combinação (p_g, sit).
 */
export function MissaoParamsCard({
   acrecDesloc,
   setAcrecDesloc,
}: MissaoParamsCardProps) {
   return (
      <div className="rounded border border-slate-200 bg-white p-4 shadow-sm">
         <p className="mb-3 text-xs font-semibold tracking-wide text-slate-500 uppercase">
            Missão
         </p>

         <div className="flex items-center gap-2">
            <Checkbox
               id="calc-acrec-desloc"
               color="primary"
               className="pointer-coarse:size-5"
               checked={acrecDesloc}
               onChange={(e) => setAcrecDesloc(e.target.checked)}
            />
            <Label
               htmlFor="calc-acrec-desloc"
               className="text-sm text-slate-700"
            >
               Acréscimo de deslocamento da missão
            </Label>
         </div>
      </div>
   );
}
