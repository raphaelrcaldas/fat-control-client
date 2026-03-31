import { aiswWebGet, DEFAULT_ICAO } from "./client";

export interface SolData {
   date: string;
   sunrise: string;
   sunset: string;
   weekday: number;
   aero: string;
}

export async function getSolHoje(signal?: AbortSignal): Promise<SolData> {
   const today = new Date().toISOString().slice(0, 10);
   const items = await aiswWebGet<SolData[]>(
      `aisweb/sol/${DEFAULT_ICAO}?dt_i=${today}&dt_f=${today}`,
      signal
   );
   if (!items.length) throw new Error("Dados de sol não encontrados");
   return items[0];
}
