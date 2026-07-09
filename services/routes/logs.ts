import request from "../Api";
import type { ApiResponse } from "@/types/api";

const logsRoute = "logs/";

export interface LogUser {
   id: number;
   p_g: string;
   nome_guerra: string;
   unidade: string;
}

export interface UserActionLog {
   id: number;
   user: LogUser;
   resource: string;
   resource_id: number | null;
   action: string;
   before: string | null;
   after: string | null;
   timestamp: string;
}

interface LogFilters {
   user_id?: number;
   resource?: string;
   resource_id?: number;
   action?: string;
   start?: string; // formato ISO: '2025-07-23'
   end?: string;
}

export async function getUserActionLogs(
   filters: LogFilters = {}
): Promise<UserActionLog[]> {
   // Remove undefined values and ensure all values are string or number
   const params: Record<string, string | number> = {};
   Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
         params[key] = value;
      }
   });

   const res = await request("GET", `${logsRoute}user-actions`, null, params);
   const json = (await res.json()) as ApiResponse<UserActionLog[]>;

   if (!res.ok) {
      throw new Error(json.message || "Erro ao buscar logs de usuário");
   }

   return json.data || [];
}

export async function deleteUserActionLog(id: number): Promise<void> {
   const res = await request("DELETE", `${logsRoute}user-actions/${id}`);
   const json = (await res.json()) as ApiResponse<null>;
   if (!res.ok) {
      throw new Error(json.message || "Erro ao excluir log");
   }
}
