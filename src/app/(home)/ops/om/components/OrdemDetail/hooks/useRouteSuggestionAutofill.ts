import { useState, useEffect, useRef } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { EtapaOut } from "services/routes/om/ordens";
import { useRouteSuggestion } from "@/hooks/queries";

export type SuggestionType = "none" | "full" | "partial";

interface UseRouteSuggestionAutofillProps {
   isOpen: boolean;
   isEditing: boolean;
   origem: string;
   dest: string;
   setFormData: Dispatch<SetStateAction<Partial<EtapaOut>>>;
}

// Sugestão de rota do EtapaModal: busca dados de missões anteriores para a
// rota digitada e auto-preenche alternativa/tvoo_alt/combustível/dt_arr.
// Em modo edição, só aplica depois que o usuário mudar a rota manualmente
// (markUserChangedRoute), para não sobrescrever os dados ao abrir o modal.
export function useRouteSuggestionAutofill({
   isOpen,
   isEditing,
   origem,
   dest,
   setFormData,
}: UseRouteSuggestionAutofillProps) {
   const { data: routeSuggestion, isFetching: isLoadingRoute } =
      useRouteSuggestion(origem, dest);

   // Tipo de sugestão aplicada: 'none', 'full' (rota completa) ou 'partial' (apenas destino)
   const [suggestionType, setSuggestionType] = useState<SuggestionType>("none");

   // Flag para rastrear se o usuário mudou a rota manualmente
   const userChangedRouteRef = useRef(false);
   const markUserChangedRoute = () => {
      userChangedRouteRef.current = true;
   };

   // Resetar estado quando origem ou dest mudam
   const prevRouteRef = useRef<string>("");
   useEffect(() => {
      const routeKey = `${origem}-${dest}`;
      if (prevRouteRef.current !== routeKey) {
         prevRouteRef.current = routeKey;
         setSuggestionType("none");
      }
   }, [origem, dest]);

   // Auto-preencher quando encontrar sugestão de rota
   useEffect(() => {
      if (origem.length !== 4 || dest.length !== 4) return;

      // Em modo edição, só aplicar sugestão se usuário mudou a rota manualmente
      if (isEditing && !userChangedRouteRef.current) {
         return;
      }

      // Se não há sugestão, manter suggestionType como 'none'
      if (!routeSuggestion) {
         return;
      }

      // Guard contra respostas stale de queries anteriores
      // Para sugestão parcial, origem é null (esperado), verificar só dest
      if (routeSuggestion.dest !== dest) {
         return;
      }
      if (routeSuggestion.has_route_data && routeSuggestion.origem !== origem) {
         return;
      }

      // Determinar tipo de sugestão baseado nas flags
      if (
         routeSuggestion.has_route_data &&
         routeSuggestion.has_destination_data
      ) {
         setSuggestionType("full");
      } else if (routeSuggestion.has_destination_data) {
         setSuggestionType("partial");
      } else {
         setSuggestionType("none");
         return;
      }

      // Aplicar sugestão
      setFormData((prev) => {
         let newDtArr = prev.dt_arr;

         // Calcular dt_arr apenas se temos dados da rota completa
         if (
            prev.dt_dep &&
            routeSuggestion.tvoo_etp &&
            routeSuggestion.tvoo_etp > 0
         ) {
            const depDate = new Date(prev.dt_dep);
            const arrDate = new Date(
               depDate.getTime() + routeSuggestion.tvoo_etp * 60 * 1000
            );
            newDtArr = arrDate.toISOString();
         }

         return {
            ...prev,
            // Sempre aplicar dados do destino se disponíveis
            alternativa: routeSuggestion.alternativa ?? prev.alternativa,
            tvoo_alt: routeSuggestion.tvoo_alt ?? prev.tvoo_alt,
            // Apenas aplicar dados da rota se disponíveis
            qtd_comb: routeSuggestion.qtd_comb ?? prev.qtd_comb,
            dt_arr: newDtArr,
         };
      });
   }, [routeSuggestion, isEditing, origem, dest, setFormData]);

   // Resetar refs e flags quando modal fecha
   useEffect(() => {
      if (!isOpen) {
         prevRouteRef.current = "";
         setSuggestionType("none");
         userChangedRouteRef.current = false;
      }
   }, [isOpen]);

   return {
      routeSuggestion,
      isLoadingRoute,
      suggestionType,
      markUserChangedRoute,
   };
}
