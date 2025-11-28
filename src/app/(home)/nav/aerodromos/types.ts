export interface BaseAerea {
   nome: string;
   sigla: string;
}

export interface Estado {
   codigo_uf: number;
   nome: string;
   uf: string;
}

export interface Cidade {
   codigo: number;
   nome: string;
   uf: string;
}

export interface Aerodromo {
   id: string;
   nome: string;
   codigo_icao: string;
   codigo_iata?: string;
   latitude: number;
   longitude: number;
   elevacao: number;
   pais: string;
   utc: number;
   base_aerea: BaseAerea | null;
   // Para Brasil (busca via API)
   codigo_cidade: number | null;
   cidade?: Cidade;
   // Para outros países (input manual)
   cidade_manual: string | null;
}

export type AerodromoFormData = Omit<Aerodromo, "id" | "cidade">;
