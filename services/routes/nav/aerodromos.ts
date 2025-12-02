import request from "../../Api";
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
   if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
         errorData.detail || errorData.message || "Erro ao buscar aeródromos"
      );
   }
   return (await response.json()) as AerodromoPublic[];
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
   if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
         errorData.detail || errorData.message || "Erro ao buscar aeródromo"
      );
   }
   return (await response.json()) as AerodromoPublic;
}

export async function createAerodromo(
   data: AerodromoCreate
): Promise<AerodromoPublic> {
   const response = await request("POST", aerodromosRoute, data);
   if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
         errorData.detail || errorData.message || "Erro ao criar aeródromo"
      );
   }
   return (await response.json()) as AerodromoPublic;
}

export async function updateAerodromo(
   id: number,
   data: AerodromoUpdate
): Promise<AerodromoPublic> {
   const response = await request("PUT", aerodromosRoute + id, data);
   if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
         errorData.detail ||
            errorData.message ||
            "Erro ao atualizar aeródromo"
      );
   }
   return (await response.json()) as AerodromoPublic;
}

export async function deleteAerodromo(id: number): Promise<void> {
   const response = await request("DELETE", aerodromosRoute + id);
   if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
         errorData.detail || errorData.message || "Erro ao excluir aeródromo"
      );
   }
}
