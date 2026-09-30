"use client";

import type { DraftEtapa } from "@/app/(home)/estatistica/etapas/missao/context/types";
import { MissaoSidebar } from "@/app/(home)/estatistica/etapas/missao/components/MissaoSidebar";
import { computeTvoo } from "../../helpers/tvoo";
import { SESSAO_LABEL } from "../../helpers/itemLabel";

interface SimuladorMissaoSidebarProps {
   pilotNames: string;
   etapas: DraftEtapa[];
   selectedLocalId: string | null;
   disabled: boolean;
   obs: string;
   canCreate: boolean;
   onObsChange: (value: string) => void;
   onSelectEtapa: (localId: string) => void;
   onAddEtapa: () => void;
   onDeleteMissao?: () => void;
}

/** O simulador adapta seus dados à mesma sidebar usada em Estatística. */
export function SimuladorMissaoSidebar({
   pilotNames,
   etapas,
   selectedLocalId,
   disabled,
   obs,
   canCreate,
   onObsChange,
   onSelectEtapa,
   onAddEtapa,
   onDeleteMissao,
}: SimuladorMissaoSidebarProps) {
   return (
      <MissaoSidebar
         ariaLabel="Painel da missão de simulador"
         tituloMissao={pilotNames}
         obsValue={obs}
         onObsChange={onObsChange}
         etapas={etapas.map((etapa, index) => ({
            localId: etapa.localId,
            numero: String(index + 1).padStart(2, "0"),
            data: etapa.form.data,
            origem: etapa.form.origem || "----",
            destino: etapa.form.destino || "----",
            anv: etapa.form.anv,
            depHora: etapa.form.dep || "--:--",
            arrHora: etapa.form.arr || "--:--",
            tvooMin: computeTvoo(etapa.form.dep, etapa.form.arr),
            status: etapa.status,
            sagem: etapa.form.sagem,
            parte1: etapa.form.parte1,
            selected: etapa.localId === selectedLocalId,
            isModified: etapa.dirty && etapa.serverId !== null,
            isNew: etapa.serverId === null,
         }))}
         onSelectEtapa={onSelectEtapa}
         onAddEtapa={canCreate ? onAddEtapa : undefined}
         addEtapaLabel="Nova sessão"
         parte1Label="Ficha"
         parte1Title="Ficha pendente"
         itemLabel={SESSAO_LABEL}
         onDeleteMissao={onDeleteMissao}
         disabled={disabled}
      />
   );
}
