"use client";

import { useCallback, useState } from "react";
import { getUsers, UserPublic } from "services/routes/users";

export default function useUsers() {
  const [usuarios, setUsuarios] = useState<UserPublic[]>([]);
  const [loading, setLoading] = useState(false);

  const updateListUsers = useCallback(async (signal?: AbortSignal, onError?: (msg: string) => void) => {
    setLoading(true);
    try {
      const users = await getUsers(undefined, signal);
      const sorted = [...users].sort((a, b) => {
        const antA = a.posto?.ant ?? 0;
        const antB = b.posto?.ant ?? 0;
        if (antA !== antB) return antA - antB;
        const promoA = a.ult_promo || "";
        const promoB = b.ult_promo || "";
        if (promoA !== promoB) return promoA.localeCompare(promoB);
        return (a.ant_rel ?? 0) - (b.ant_rel ?? 0);
      });
      setUsuarios(sorted);
    } catch (err: any) {
      const message = err?.message || String(err) || "Erro ao buscar usuários";
      if (onError) onError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { usuarios, updateListUsers, loading };
}
