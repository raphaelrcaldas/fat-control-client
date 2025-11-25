import request from "../Api";

const aerodromosRoute = "aerodromos/";

export interface Pista {
   numero: string;
   comprimento: number;
   largura: number;
   superficie: string;
}

export interface Frequencias {
   torre?: string;
   solo?: string;
   atis?: string;
}

export interface AerodromoPublic {
   id: number;
   nome: string;
   codigo_icao: string;
   codigo_iata?: string;
   latitude: number;
   longitude: number;
   elevacao: number;
   tipo: "civil" | "militar" | "privado" | "misto";
   cidade: string;
   estado: string;
   pais: string;
   pistas?: Pista[];
   frequencias?: Frequencias;
   observacoes?: string;
   ativo: boolean;
}

export interface AerodromoCreate {
   nome: string;
   codigo_icao: string;
   codigo_iata?: string;
   latitude: number;
   longitude: number;
   elevacao: number;
   tipo: "civil" | "militar" | "privado" | "misto";
   cidade: string;
   estado: string;
   pais: string;
   pistas?: Pista[];
   frequencias?: Frequencias;
   observacoes?: string;
   ativo?: boolean;
}

export interface AerodromoUpdate extends Partial<AerodromoCreate> {}

export async function getAerodromos(
   search?: string,
   tipo?: string,
   signal?: AbortSignal
): Promise<AerodromoPublic[]> {
   const params: Record<string, string> = {};
   if (search) params.search = search;
   if (tipo && tipo !== "todos") params.tipo = tipo;

   const response = await request(
      "GET",
      aerodromosRoute,
      null,
      Object.keys(params).length > 0 ? params : null,
      signal
   );
   return (await response.json()) as AerodromoPublic[];
}

export async function getAerodromoById(
   id: number,
   signal?: AbortSignal
): Promise<AerodromoPublic> {
   const response = await request("GET", aerodromosRoute + id, null, null, signal);
   return (await response.json()) as AerodromoPublic;
}

export async function createAerodromo(data: AerodromoCreate): Promise<Response> {
   return await request("POST", aerodromosRoute, data);
}

export async function updateAerodromo(
   id: number,
   data: AerodromoUpdate
): Promise<Response> {
   return await request("PUT", aerodromosRoute + id, data);
}

export async function deleteAerodromo(id: number): Promise<Response> {
   return await request("DELETE", aerodromosRoute + id);
}
