import { aiswWebGet, DEFAULT_ICAO } from "./client";

export interface RotaerOrg {
   name: string | null;
   type: string | null;
   military: boolean | null;
}

export interface RotaerRunway {
   type: string | null;
   ident: string | null;
   surface: string | null;
   length_m: number | null;
   width_m: number | null;
   surface_c: string | null;
   lights: string[];
}

export interface RotaerService {
   service_type: string;
   raw_xml: string;
}

export interface RotaerData {
   status: string | null;
   dt: string | null;
   icao: string | null;
   ciad: string | null;
   name: string | null;
   city: string | null;
   uf: string | null;
   lat: number | null;
   lng: number | null;
   lat_rotaer: string | null;
   lng_rotaer: string | null;
   distance: string | null;
   org: RotaerOrg | null;
   working_hour: string | null;
   type: string | null;
   type_util: string | null;
   type_opr: string | null;
   cat: string | null;
   utc: string | null;
   alt_m: number | null;
   alt_ft: number | null;
   fir: string | null;
   jur: string | null;
   lights: string[];
   runways: RotaerRunway[];
   services: RotaerService[];
   remarks: string[];
   complements: Record<string, string>;
}

export interface RotaerResponse {
   data: RotaerData | null;
   rotaer_html: string | null;
}

export async function getRotaer(
   icao: string = DEFAULT_ICAO,
   signal?: AbortSignal
): Promise<RotaerResponse> {
   return aiswWebGet<RotaerResponse>(`aisweb/rotaer/${icao}`, signal);
}
