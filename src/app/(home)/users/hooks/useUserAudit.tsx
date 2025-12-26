import { useEffect, useState } from "react";
import { getUserActionLogs, UserActionLog } from "services/routes/logs";

export function useUserAudit(userId?: number) {
   const [logs, setLogs] = useState<UserActionLog[]>([]);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState<string | null>(null);

   useEffect(() => {
      if (!userId) return;

      const fetchLogs = async () => {
         setLoading(true);
         setError(null);
         try {
            const data = await getUserActionLogs({
               resource: "user",
               resource_id: userId,
            });
            setLogs(data);
         } catch (err: any) {
            setError(err?.message || "Erro ao buscar auditoria");
         } finally {
            setLoading(false);
         }
      };

      fetchLogs();
   }, [userId]);

   return { logs, loading, error };
}
