import { useCallback, useEffect, useRef, useState } from "react";

import { useToast } from "@/app/context/toast";
import { useUpdateMissao } from "@/hooks/queries/useEtapas";

interface UseMissaoObsArgs {
   missaoId: number;
   /** Valor vindo do servidor; muda a cada refetch da missao. */
   serverObs: string | null;
}

/**
 * Observacao da missao no editor de simulador. Como em `estatistica/etapas`,
 * ela NAO tem botao proprio: `flush` sobe junto do salvamento da sessao, num
 * unico clique. Botao separado ja causou perda silenciosa — o usuario digitava,
 * salvava a sessao e saia sem que a observacao fosse enviada.
 */
export function useMissaoObs({ missaoId, serverObs }: UseMissaoObsArgs) {
   const { push } = useToast();
   const updateMissao = useUpdateMissao();
   const [obs, setObs] = useState(serverObs ?? "");
   const [savedObs, setSavedObs] = useState(serverObs ?? "");
   const isDirty = obs !== savedObs;

   // O refetch traz a obs do servidor. Sem isto o campo continuaria exibindo o
   // valor antigo enquanto o banco ja tem outro — a tela mentiria sobre o que
   // esta salvo. Preserva o que o usuario esta digitando (estado sujo).
   const obsRef = useRef(obs);
   obsRef.current = obs;
   useEffect(() => {
      const fromServer = serverObs ?? "";
      setSavedObs((previousSaved) => {
         if (previousSaved === fromServer) return previousSaved;
         // Só sobrescreve o campo se nao houver edicao pendente.
         if (obsRef.current === previousSaved) setObs(fromServer);
         return fromServer;
      });
   }, [serverObs]);

   /**
    * Persiste a observacao se houver mudanca. Devolve `false` apenas quando a
    * chamada falhou, para o chamador nao anunciar sucesso indevidamente.
    */
   const flush = useCallback(async () => {
      if (obs === savedObs) return true;

      const normalizedObs = obs.trim();
      try {
         const result = await updateMissao.mutateAsync({
            id: missaoId,
            data: { obs: normalizedObs || null },
         });

         if (!result.ok) {
            push({
               title: "Erro",
               message: result.message ?? "Erro ao salvar a observação",
               type: "error",
            });
            return false;
         }

         // A mutação foi iniciada com o valor capturado por este callback. Se
         // o usuário continuou digitando enquanto ela aguardava, a resposta
         // só atualiza o baseline: substituir `obs` aqui apagaria o rascunho
         // mais novo e marcaria incorretamente o campo como limpo.
         if (obsRef.current === obs) setObs(normalizedObs);
         setSavedObs(normalizedObs);
         return true;
      } catch (error) {
         push({
            title: "Erro",
            message:
               error instanceof Error
                  ? error.message
                  : "Erro ao salvar a observação da missão",
            type: "error",
         });
         return false;
      }
   }, [missaoId, obs, push, savedObs, updateMissao]);

   return {
      obs,
      setObs,
      isDirty,
      isSaving: updateMissao.isPending,
      flush,
   };
}
