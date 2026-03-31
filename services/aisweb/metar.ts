import { aiswWebGet, DEFAULT_ICAO } from "./client";

export interface MetResponse {
   metar: string;
   taf: string | null;
   icao: string;
}

export async function getMet(signal?: AbortSignal): Promise<MetResponse> {
   const data = await aiswWebGet<{ metar: string; taf: string | null }>(
      `aisweb/met/${DEFAULT_ICAO}`,
      signal
   );

   return {
      metar: data.metar,
      taf: data.taf,
      icao: DEFAULT_ICAO,
   };
}
