/**
 * Visualização dos dados do usuário com edição inline. Orquestra os campos
 * (EditableField/ReadOnlyField) e os avisos, provendo o contexto de foco que
 * permite ao banner de cadastro incompleto rolar e abrir cada campo.
 */

import { useState } from "react";
import { FaUser, FaShieldAlt } from "react-icons/fa";
import {
   HiMail,
   HiIdentification,
   HiCalendar,
   HiHashtag,
   HiOfficeBuilding,
   HiPhone,
   HiStar,
   HiSortAscending,
   HiViewGrid,
} from "react-icons/hi";
import type { UserFull } from "services/routes/users";
import { formatDateFull } from "utils/dateHandler";
import { formatSaram, formatPhone, formatCpf } from "@/constants/formats";
import { postoGradRecords } from "@/constants/militar/postos";
import { quadroOptions } from "@/constants/militar/quadros";
import { especialidadeOptions } from "@/constants/militar/especialidades";
import { useUnidadeOptions } from "@/hooks/queries";
import { SectionCard } from "../../components/SectionCard";
import { FieldFocusContext } from "./FieldFocusContext";
import { EditableField } from "./EditableField";
import { ReadOnlyField } from "./ReadOnlyField";
import { CadastroIncompletoNotice } from "./CadastroIncompletoNotice";
import { PromoHistoryNotice } from "./PromoHistoryNotice";

interface UserReadViewProps {
   user: UserFull;
   userId: number;
}

const SECTION_BODY = "grid gap-0 divide-y divide-slate-100";

export function UserReadView({ user, userId }: UserReadViewProps) {
   const unidadeOptions = useUnidadeOptions();
   const [focusReq, setFocusReq] = useState<{
      field: string;
      n: number;
   } | null>(null);

   // Rola até o campo e sinaliza (via nonce) para abrir a sua edição.
   function requestFocus(field: string) {
      setFocusReq((prev) => ({ field, n: (prev?.n ?? 0) + 1 }));
      requestAnimationFrame(() => {
         document
            .getElementById(`field-${field}`)
            ?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
   }

   const postoLabel =
      postoGradRecords.find((p) => p.short === user.p_g)?.long || user.p_g;

   const pgOptions = postoGradRecords.map((pg) => ({
      value: pg.short,
      label: pg.mid,
   }));

   return (
      <FieldFocusContext.Provider value={{ focusReq, requestFocus }}>
         <div className="space-y-2">
            <CadastroIncompletoNotice pendentes={user.campos_pendentes ?? []} />
            <PromoHistoryNotice user={user} userId={userId} />

            {/* Dados Pessoais */}
            <SectionCard
               title="Dados Pessoais"
               icon={FaUser}
               bodyClassName={SECTION_BODY}
            >
               <EditableField
                  icon={HiIdentification}
                  label="Nome Completo"
                  value={user.nome_completo?.toUpperCase()}
                  rawValue={user.nome_completo || ""}
                  fieldName="nome_completo"
                  userId={userId}
               />
               <ReadOnlyField
                  icon={HiHashtag}
                  label="CPF"
                  value={formatCpf(user.cpf || "")}
                  fieldName="cpf"
               />
               <EditableField
                  icon={HiCalendar}
                  label="Data de Nascimento"
                  value={formatDateFull(user.nasc)}
                  rawValue={user.nasc || ""}
                  fieldName="nasc"
                  userId={userId}
                  type="date"
               />
               <EditableField
                  icon={HiPhone}
                  label="Telefone"
                  value={formatPhone(user.telefone || "")}
                  rawValue={user.telefone || ""}
                  fieldName="telefone"
                  userId={userId}
                  type="phone"
               />
               <EditableField
                  icon={HiMail}
                  label="Email Pessoal"
                  value={user.email_pess}
                  rawValue={user.email_pess || ""}
                  fieldName="email_pess"
                  userId={userId}
                  type="email"
               />
            </SectionCard>

            {/* Dados Militares */}
            <SectionCard
               title="Dados Militares"
               icon={FaShieldAlt}
               bodyClassName={SECTION_BODY}
            >
               <EditableField
                  icon={HiStar}
                  label="Posto/Graduação"
                  value={postoLabel.toUpperCase()}
                  rawValue={user.p_g || ""}
                  fieldName="p_g"
                  userId={userId}
                  type="select"
                  options={pgOptions}
               />
               <EditableField
                  icon={HiViewGrid}
                  label="Quadro"
                  value={user.quadro?.toUpperCase()}
                  rawValue={user.quadro || ""}
                  fieldName="quadro"
                  userId={userId}
                  type="searchable"
                  options={quadroOptions}
               />
               <EditableField
                  icon={HiStar}
                  label="Especialidade"
                  value={user.esp?.toUpperCase()}
                  rawValue={user.esp || ""}
                  fieldName="esp"
                  userId={userId}
                  type="searchable"
                  options={especialidadeOptions}
               />
               <EditableField
                  icon={HiIdentification}
                  label="Nome de Guerra"
                  value={user.nome_guerra?.toUpperCase()}
                  rawValue={user.nome_guerra || ""}
                  fieldName="nome_guerra"
                  userId={userId}
               />
               <ReadOnlyField
                  icon={HiOfficeBuilding}
                  label="Unidade"
                  value={
                     unidadeOptions.find((u) => u.value === user.unidade)
                        ?.label ||
                     user.unidade?.toUpperCase() ||
                     ""
                  }
                  fieldName="unidade"
               />
               <EditableField
                  icon={HiHashtag}
                  label="SARAM"
                  value={user.saram ? formatSaram(user.saram) : ""}
                  rawValue={user.saram || ""}
                  fieldName="saram"
                  userId={userId}
                  maxLength={7}
               />
               <EditableField
                  icon={HiHashtag}
                  label="ID FAB"
                  value={String(user.id_fab || "")}
                  rawValue={String(user.id_fab || "")}
                  fieldName="id_fab"
                  userId={userId}
               />
               <EditableField
                  icon={HiMail}
                  label="Email Zimbra"
                  value={user.email_fab}
                  rawValue={user.email_fab || ""}
                  fieldName="email_fab"
                  userId={userId}
                  type="email"
               />
               <EditableField
                  icon={HiCalendar}
                  label="Data de Praça"
                  value={formatDateFull(user.data_praca)}
                  rawValue={user.data_praca || ""}
                  fieldName="data_praca"
                  userId={userId}
                  type="date"
               />
               <EditableField
                  icon={HiCalendar}
                  label="Última Promoção"
                  value={formatDateFull(user.ult_promo)}
                  rawValue={user.ult_promo || ""}
                  fieldName="ult_promo"
                  userId={userId}
                  type="date"
               />
               <EditableField
                  icon={HiSortAscending}
                  label="Antiguidade Relativa"
                  value={user.ant_rel ? String(user.ant_rel) : ""}
                  rawValue={user.ant_rel ? String(user.ant_rel) : ""}
                  fieldName="ant_rel"
                  userId={userId}
                  type="number"
               />
            </SectionCard>
         </div>
      </FieldFocusContext.Provider>
   );
}
