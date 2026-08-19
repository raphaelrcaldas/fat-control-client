/**
 * Visualização dos dados do tripulante com edição inline campo-a-campo via
 * EditableTripField. Os dados de identidade do militar (posto, nome, quadro)
 * não aparecem aqui: já estão no hero da página e pertencem ao cadastro do
 * User, editável em /users/[id].
 */

import { FaIdBadge } from "react-icons/fa";
import {
   HiHashtag,
   HiUserGroup,
   HiLightningBolt,
   HiPaperAirplane,
   HiCalendar,
} from "react-icons/hi";
import type { TripDetail } from "services/routes/trips";
import { formatDateFull } from "utils/dateHandler";
import { OPER_LABELS } from "@/constants/tripulantes";
import { useFuncoes } from "@/hooks/queries";
import { useOrgProjetos } from "@/hooks/queries/useAeronaves";
import { SectionCard } from "@/app/(home)/users/components/SectionCard";
import { isValidTrigramaKey } from "../../utils/validateTrigrama";
import { EditableTripField } from "./EditableTripField";

interface TripReadViewProps {
   trip: TripDetail;
   tripId: number;
}

const SECTION_BODY = "grid gap-0 divide-y divide-slate-100";

export function TripReadView({ trip, tripId }: TripReadViewProps) {
   const { data: projetos = [] } = useOrgProjetos();
   const { funcoes, label: funcLabel } = useFuncoes();

   const funcOptions = funcoes.map((func) => ({
      value: func.cod,
      label: `${func.cod.toUpperCase()} - ${func.nome}`,
   }));

   const operOptions = Object.entries(OPER_LABELS).map(([key, label]) => ({
      value: key,
      label: `${key.toUpperCase()} - ${label}`,
   }));

   const projOptions = projetos.map((projeto) => ({
      value: projeto.modelo,
      label: projeto.modelo.toUpperCase(),
   }));

   // `data_op` é obrigatório para tripulante não-aluno (`oper !== 'al'`) —
   // regra espelhada de `schemas/ops/tripulantes.py:28-33` (BaseTrip.
   // validate_data_op). Como o PATCH é campo-a-campo, o front bloqueia o
   // clear aqui em vez de deixar o backend rejeitar sem explicação.
   const dataOpRequired = trip.oper !== "al";

   return (
      <SectionCard
         title="Dados do Tripulante"
         icon={FaIdBadge}
         bodyClassName={SECTION_BODY}
      >
         <EditableTripField
            icon={HiHashtag}
            label="Trigrama"
            value={trip.trig.toUpperCase()}
            rawValue={trip.trig}
            fieldName="trig"
            tripId={tripId}
            maxLength={3}
            uppercase
            keyFilter={isValidTrigramaKey}
         />
         <EditableTripField
            icon={HiUserGroup}
            label="Função"
            value={funcLabel(trip.func)}
            rawValue={trip.func}
            fieldName="func"
            tripId={tripId}
            type="select"
            options={funcOptions}
         />
         <EditableTripField
            icon={HiLightningBolt}
            label="Operacionalidade"
            value={OPER_LABELS[trip.oper]}
            rawValue={trip.oper}
            fieldName="oper"
            tripId={tripId}
            type="select"
            options={operOptions}
         />
         <EditableTripField
            icon={HiPaperAirplane}
            label="Projeto"
            value={trip.proj?.toUpperCase()}
            rawValue={trip.proj || ""}
            fieldName="proj"
            tripId={tripId}
            type="select"
            options={projOptions}
         />
         <EditableTripField
            icon={HiCalendar}
            label="Data Operacional"
            value={formatDateFull(trip.data_op)}
            rawValue={trip.data_op || ""}
            fieldName="data_op"
            tripId={tripId}
            type="date"
            blockClear={dataOpRequired}
            blockClearMessage="Data operacional é obrigatória para não-alunos."
         />
      </SectionCard>
   );
}
