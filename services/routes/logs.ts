import request from "../Api";

const logsRoute = "logs/";

export interface LogUser {
   id: number;
   p_g: string;
   nome_guerra: string;
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
   if (!res.ok) {
      throw new Error("Erro ao buscar logs de usuário");
   }

   return res.json();
}
