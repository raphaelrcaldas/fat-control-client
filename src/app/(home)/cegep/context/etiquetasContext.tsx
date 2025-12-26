"use client";

import {
   createContext,
   useContext,
   useState,
   useEffect,
   ReactNode,
   useCallback,
} from "react";
import {
   Etiqueta,
   coresPredefinidas,
   getEtiquetas,
   createUpdateEtiqueta,
   deleteEtiquetaApi,
} from "services/routes/cegep/etiquetas";

// Re-exportar para componentes que usam o context
export { coresPredefinidas };
export type { Etiqueta };

interface EtiquetasContextType {
   etiquetas: Etiqueta[];
   loading: boolean;
   error: string | null;
   // Funções para gerenciar etiquetas via API
   fetchEtiquetas: () => Promise<void>;
   addEtiqueta: (etiqueta: Omit<Etiqueta, "id">) => Promise<Etiqueta | null>;
   updateEtiqueta: (etiqueta: Etiqueta) => Promise<Etiqueta | null>;
   deleteEtiqueta: (id: number) => Promise<boolean>;
   getEtiquetaById: (id: number) => Etiqueta | undefined;
}

const EtiquetasContext = createContext<EtiquetasContextType | null>(null);

export function EtiquetasProvider({ children }: { children: ReactNode }) {
   const [etiquetas, setEtiquetas] = useState<Etiqueta[]>([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);

   const fetchEtiquetas = useCallback(async () => {
      try {
         setLoading(true);
         setError(null);
         const data = await getEtiquetas();
         setEtiquetas(data);
      } catch (err) {
         setError("Erro ao carregar etiquetas");
         console.error(err);
      } finally {
         setLoading(false);
      }
   }, []);

   // Buscar etiquetas ao montar o provider
   useEffect(() => {
      fetchEtiquetas();
   }, [fetchEtiquetas]);

   const addEtiqueta = async (
      etiqueta: Omit<Etiqueta, "id">
   ): Promise<Etiqueta | null> => {
      try {
         const newEtiqueta = await createUpdateEtiqueta(etiqueta as Etiqueta);
         setEtiquetas((prev) => [...prev, newEtiqueta]);
         return newEtiqueta;
      } catch (err) {
         console.error("Erro ao criar etiqueta:", err);
         return null;
      }
   };

   const updateEtiqueta = async (
      etiqueta: Etiqueta
   ): Promise<Etiqueta | null> => {
      try {
         const updated = await createUpdateEtiqueta(etiqueta);
         setEtiquetas((prev) =>
            prev.map((e) => (e.id === updated.id ? updated : e))
         );
         return updated;
      } catch (err) {
         console.error("Erro ao atualizar etiqueta:", err);
         return null;
      }
   };

   const deleteEtiqueta = async (id: number): Promise<boolean> => {
      try {
         await deleteEtiquetaApi(id);
         setEtiquetas((prev) => prev.filter((e) => e.id !== id));
         return true;
      } catch (err) {
         console.error("Erro ao deletar etiqueta:", err);
         return false;
      }
   };

   const getEtiquetaById = (id: number) => etiquetas.find((e) => e.id === id);

   return (
      <EtiquetasContext.Provider
         value={{
            etiquetas,
            loading,
            error,
            fetchEtiquetas,
            addEtiqueta,
            updateEtiqueta,
            deleteEtiqueta,
            getEtiquetaById,
         }}
      >
         {children}
      </EtiquetasContext.Provider>
   );
}

export function useEtiquetas() {
   const context = useContext(EtiquetasContext);
   if (!context) {
      throw new Error("useEtiquetas must be used within EtiquetasProvider");
   }
   return context;
}
