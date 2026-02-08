import request from "../../Api";
import type { ApiResponse } from "@/types/api";
import { Cidade } from "../cities";
import { navRoute } from "./index";

const aerodromosRoute = `${navRoute}aerodromos/`;

export interface BaseAerea {
   nome: string;
   sigla: string;
}

export interface AerodromoPublic {
   id: number;
   nome: string;
   codigo_icao: string;
   codigo_iata: string | null;
   latitude: number;
   longitude: number;
   elevacao: number;
   pais: string;
   utc: number;
   base_aerea: BaseAerea | null;
   codigo_cidade: number | null;
   cidade_manual: string | null;
   cidade: Cidade | null;
}

export interface AerodromoCreate {
   nome: string;
   codigo_icao: string;
   codigo_iata?: string | null;
   latitude: number;
   longitude: number;
   elevacao: number;
   pais: string;
   utc: number;
   base_aerea?: BaseAerea | null;
   codigo_cidade?: number | null;
   cidade_manual?: string | null;
}

export interface AerodromoUpdate {
   nome?: string;
   codigo_icao?: string;
   codigo_iata?: string | null;
   latitude?: number;
   longitude?: number;
   elevacao?: number;
   pais?: string;
   utc?: number;
   base_aerea?: BaseAerea | null;
   codigo_cidade?: number | null;
   cidade_manual?: string | null;
}

export async function getAerodromos(
   signal?: AbortSignal
): Promise<AerodromoPublic[]> {
   const response = await request("GET", aerodromosRoute, null, null, signal);
   const json = (await response.json()) as ApiResponse<AerodromoPublic[]>;

   if (!response.ok) {
      throw new Error(json.message || "Erro ao buscar aeródromos");
   }
   return json.data!;
}

export async function getAerodromoById(
   id: number,
   signal?: AbortSignal
): Promise<AerodromoPublic> {
   const response = await request(
      "GET",
      aerodromosRoute + id,
      null,
      null,
      signal
   );
   const json = (await response.json()) as ApiResponse<AerodromoPublic>;

   if (!response.ok) {
      throw new Error(json.message || "Erro ao buscar aeródromo");
   }
   return json.data!;
}

export async function createAerodromo(
   data: AerodromoCreate
): Promise<AerodromoPublic> {
   const response = await request("POST", aerodromosRoute, data);
   const json: ApiResponse<AerodromoPublic> = await response.json();
   if (!response.ok) {
      throw new Error(json.message || "Erro ao criar aeródromo");
   }
   return json.data as AerodromoPublic;
}

export async function updateAerodromo(
   id: number,
   data: AerodromoUpdate
): Promise<AerodromoPublic> {
   const response = await request("PUT", aerodromosRoute + id, data);
   const json: ApiResponse<AerodromoPublic> = await response.json();
   if (!response.ok) {
      throw new Error(json.message || "Erro ao atualizar aeródromo");
   }
   return json.data as AerodromoPublic;
}

export async function deleteAerodromo(id: number): Promise<void> {
   const response = await request("DELETE", aerodromosRoute + id);
   const json: ApiResponse<null> = await response.json();
   if (!response.ok) {
      throw new Error(json.message || "Erro ao excluir aeródromo");
   }
}
