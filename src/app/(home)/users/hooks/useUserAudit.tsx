import { useEffect, useState } from "react";
import { getUserActionLogs, UserActionLog } from "services/routes/logs";

export function useUserAudit(userId?: number) {
  const [logs, setLogs] = useState<UserActionLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    getUserActionLogs({ resource: "user", resource_id: userId })
      .then(setLogs)
      .catch((err) => setError(err.message || "Erro ao buscar auditoria"))
      .finally(() => setLoading(false));
  }, [userId]);

  return { logs, loading, error };
}
