import { WiSunrise, WiSunset } from "react-icons/wi";
import { MetarInfoTile } from "./MetarInfoTile";

interface SolData {
   sunrise: string;
   sunset: string;
}

interface SolTilesProps {
   sol: SolData | undefined;
   solLoading: boolean;
   solError: boolean;
}

export function SolTiles({ sol, solLoading, solError }: SolTilesProps) {
   if (solLoading) {
      return (
         // Os dois blocos são itens da grade do `MetarCard`, sem wrapper: o
         // `role="status"` fica no primeiro e o segundo é decorativo. `h-18`
         // = altura do `MetarInfoTile` real.
         <>
            <div
               role="status"
               className="h-18 animate-pulse rounded-xl bg-slate-100"
            >
               <span className="sr-only">Carregando nascer e pôr do sol…</span>
            </div>
            <div
               aria-hidden
               className="h-18 animate-pulse rounded-xl bg-slate-100"
            />
         </>
      );
   }

   if (solError) {
      return (
         <p className="col-span-2 text-xs text-red-400">
            Erro ao buscar nascer/pôr do sol
         </p>
      );
   }

   if (!sol) return null;

   return (
      <>
         <MetarInfoTile
            icon={<WiSunrise size={20} className="text-amber-400" />}
            label="Nascer do sol"
            value={sol.sunrise + " UTC"}
         />
         <MetarInfoTile
            icon={<WiSunset size={20} className="text-orange-400" />}
            label="Pôr do sol"
            value={sol.sunset + " UTC"}
         />
      </>
   );
}
