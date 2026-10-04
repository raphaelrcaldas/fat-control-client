"use client";

import type {
   RegimeLinha,
   TipoMissaoLinha,
} from "services/routes/estatistica/indicadores";
import { RegimeDonut } from "./RegimeDonut";
import { SecaoCard } from "./SecaoCard";
import { TipoMissaoBarras } from "./TipoMissaoBarras";

interface IndicadoresQuebrasProps {
   porRegime: RegimeLinha[];
   porTipoMissao: TipoMissaoLinha[];
}

export function IndicadoresQuebras({
   porRegime,
   porTipoMissao,
}: IndicadoresQuebrasProps) {
   return (
      <div className="grid gap-2 lg:grid-cols-2">
         <SecaoCard titulo="Regime de Voo">
            {porRegime.length === 0 ? (
               <p className="px-4 py-8 text-center text-sm text-slate-500">
                  Sem horas registradas no período.
               </p>
            ) : (
               <RegimeDonut porRegime={porRegime} />
            )}
         </SecaoCard>

         <SecaoCard titulo="Tipo de Missão">
            {porTipoMissao.length === 0 ? (
               <p className="px-4 py-8 text-center text-sm text-slate-500">
                  Sem missões registradas no período.
               </p>
            ) : (
               <TipoMissaoBarras porTipoMissao={porTipoMissao} />
            )}
         </SecaoCard>
      </div>
   );
}
