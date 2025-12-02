import { Cidade } from "services/routes/cities";

export interface BaseAerea {
   nome: string;
   sigla: string;
}

export interface Aerodromo {
   id: number;
   nome: string;
   codigo_icao: string;
   codigo_iata?: string | null;
   latitude: number;
   longitude: number;
   elevacao: number;
   pais: string;
   utc: number;
   base_aerea: BaseAerea | null;
   codigo_cidade: number | null;
   cidade?: Cidade | null;
   cidade_manual: string | null;
}

export type AerodromoFormData = Omit<Aerodromo, "id" | "cidade">;
