/**
 * Visualização dos dados do usuário com edição inline
 * Cada campo pode ser editado individualmente ao clicar no ícone de edição
 */

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useMask } from "@react-input/mask";
import { TextInput, Select, Spinner } from "flowbite-react";
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
   HiPencil,
   HiCheck,
   HiX,
   HiExclamation,
   HiInformationCircle,
} from "react-icons/hi";
import { UserFull, UserSchema } from "services/routes/users";
import { formatDateFull } from "utils/dateHandler";
import {
   formatSaram,
   formatPhone,
   formatCpf,
   phoneMaskConfig,
} from "@/constants/formats";
import { postoGradRecords } from "@/constants/militar/postos";
import { quadroOptions } from "@/constants/militar/quadros";
import { especialidadeOptions } from "@/constants/militar/especialidades";
import { SearchableSelect } from "@/components/SearchableSelect";
import {
   useUpdateUser,
   useUnidadeOptions,
   useUserPromos,
} from "@/hooks/queries";
import { useToast } from "@/app/context/toast";
import { USER_FIELD_LABELS } from "./userFieldLabels";

// ========================================
// Tipos
// ========================================

interface UserReadViewProps {
   user: UserFull;
   userId: number;
}

type FieldType =
   | "text"
   | "email"
   | "date"
   | "number"
   | "select"
   | "searchable"
   | "phone";

interface FieldConfig {
   icon: React.ComponentType<{ className?: string }>;
   label: string;
   fieldName: keyof UserSchema;
   value: string;
   rawValue: string;
   type?: FieldType;
   options?: { value: string; label: string }[];
   maxLength?: number;
}

// ========================================
// Contexto de foco de campo
// ========================================

// Permite que o banner de cadastro incompleto role até um campo e abra
// sua edição. `focusReq` carrega um nonce (`n`) para reagir mesmo a
// cliques repetidos no mesmo campo.
interface FieldFocusValue {
   focusReq: { field: string; n: number } | null;
   requestFocus: (field: string) => void;
}

const FieldFocusContext = createContext<FieldFocusValue>({
   focusReq: null,
   requestFocus: () => {},
});

// ========================================
// Componentes
// ========================================

function SectionCard({
   title,
   icon: Icon,
   children,
}: {
   title: string;
   icon: React.ComponentType<{ className?: string }>;
   children: React.ReactNode;
}) {
   return (
      <div className="rounded-lg border border-gray-200 bg-white">
         <div className="border-b border-gray-100 px-5 py-3">
            <h2 className="flex items-center gap-2 text-sm font-bold text-gray-900">
               <Icon className="h-4 w-4 text-red-600" />
               {title}
            </h2>
         </div>
         <div className="grid gap-0 divide-y divide-gray-100">{children}</div>
      </div>
   );
}

function EditableField({
   icon: Icon,
   label,
   value,
   rawValue,
   fieldName,
   userId,
   type = "text",
   options,
   maxLength,
}: FieldConfig & { userId: number }) {
   const [editing, setEditing] = useState(false);
   const [localValue, setLocalValue] = useState(rawValue);
   const updateMutation = useUpdateUser();
   const { push } = useToast();
   const { focusReq } = useContext(FieldFocusContext);
   // Último nonce de foco já tratado — evita reabrir a edição quando o
   // efeito re-roda por mudança de `rawValue` (ex.: refetch após salvar).
   const lastFocusN = useRef(0);

   const saving = updateMutation.isPending;

   const phoneMaskRef = useMask(phoneMaskConfig);

   function startEdit() {
      setLocalValue(type === "phone" ? formatPhone(rawValue) : rawValue);
      setEditing(true);
   }

   // Abre a edição apenas quando o banner solicita um NOVO foco neste
   // campo (nonce inédito), não a cada mudança de valor.
   useEffect(() => {
      if (focusReq?.field === fieldName && focusReq.n !== lastFocusN.current) {
         lastFocusN.current = focusReq.n;
         setLocalValue(type === "phone" ? formatPhone(rawValue) : rawValue);
         setEditing(true);
      }
   }, [focusReq, fieldName, rawValue, type]);

   function cancelEdit() {
      setLocalValue(rawValue);
      setEditing(false);
   }

   async function save() {
      const stripped =
         type === "phone" ? localValue.replace(/\D/g, "") : localValue;
      const newVal =
         type === "number" ? Number(stripped) || null : stripped || null;
      if (
         String(newVal ?? "").toLowerCase() ===
         String(rawValue ?? "").toLowerCase()
      ) {
         setEditing(false);
         return;
      }

      try {
         const result = await updateMutation.mutateAsync({
            id: userId,
            data: { [fieldName]: newVal } as Partial<UserSchema>,
         });

         if (result.ok) {
            push({ message: `${label} atualizado`, type: "success" });
            setEditing(false);
         } else {
            push({
               message: result.message || "Erro ao atualizar",
               type: "error",
            });
         }
      } catch (err: any) {
         push({ message: err?.message || "Erro ao atualizar", type: "error" });
      }
   }

   function handleKeyDown(e: React.KeyboardEvent) {
      if (e.key === "Enter") save();
      if (e.key === "Escape") cancelEdit();
   }

   if (editing) {
      return (
         <div
            id={`field-${fieldName}`}
            className="flex items-center gap-3 px-5 py-3"
         >
            <div className="shrink-0 rounded-lg bg-blue-100 p-2.5">
               <Icon className="h-4 w-4 text-blue-600" />
            </div>
            <div className="min-w-0">
               <p className="mb-1 text-xs font-medium tracking-wide text-gray-500 uppercase">
                  {label}
               </p>
               <div className="flex items-center gap-1.5">
                  <div className="max-w-sm">
                     {type === "phone" ? (
                        <input
                           ref={phoneMaskRef}
                           type="text"
                           value={localValue}
                           onChange={(e) => setLocalValue(e.target.value)}
                           onKeyDown={handleKeyDown}
                           placeholder="(__) _____-____"
                           className="block w-40 rounded-lg border border-gray-300 bg-gray-50 px-2 py-1.5 text-xs text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                           autoFocus
                        />
                     ) : type === "select" && options ? (
                        <Select
                           sizing="sm"
                           value={localValue}
                           onChange={(e) => setLocalValue(e.target.value)}
                           onKeyDown={handleKeyDown}
                           autoFocus
                        >
                           <option value="" disabled>
                              Selecione...
                           </option>
                           {options.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                 {opt.label}
                              </option>
                           ))}
                        </Select>
                     ) : type === "searchable" && options ? (
                        <SearchableSelect
                           sizing="sm"
                           clearable
                           value={localValue}
                           onChange={setLocalValue}
                           options={
                              localValue &&
                              !options.some((o) => o.value === localValue)
                                 ? [
                                      { value: localValue, label: localValue },
                                      ...options,
                                   ]
                                 : options
                           }
                        />
                     ) : (
                        <TextInput
                           sizing="sm"
                           type={type}
                           value={localValue}
                           onChange={(e) => setLocalValue(e.target.value)}
                           onKeyDown={handleKeyDown}
                           maxLength={maxLength}
                           autoFocus
                        />
                     )}
                  </div>
                  {saving ? (
                     <Spinner size="sm" color="failure" />
                  ) : (
                     <>
                        <button
                           onClick={save}
                           className="shrink-0 rounded p-1 text-green-600 transition-colors hover:bg-green-50"
                           aria-label="Salvar"
                        >
                           <HiCheck className="h-4.5 w-4.5" />
                        </button>
                        <button
                           onClick={cancelEdit}
                           className="shrink-0 rounded p-1 text-gray-400 transition-colors hover:bg-gray-100"
                           aria-label="Cancelar"
                        >
                           <HiX className="h-4.5 w-4.5" />
                        </button>
                     </>
                  )}
               </div>
            </div>
         </div>
      );
   }

   return (
      <div
         id={`field-${fieldName}`}
         className="group flex items-center gap-3 px-5 py-3.5"
      >
         <div className="shrink-0 rounded-lg bg-red-100 p-2.5">
            <Icon className="h-4 w-4 text-red-600" />
         </div>
         <div className="min-w-0">
            <p className="mb-0.5 text-xs font-medium tracking-wide text-gray-500 uppercase">
               {label}
            </p>
            <div className="flex items-center gap-1.5">
               <p className="text-sm leading-tight font-semibold text-gray-900 select-all">
                  {value || "—"}
               </p>
               <button
                  onClick={startEdit}
                  className="shrink-0 rounded p-0.5 text-gray-300 opacity-0 transition-all group-hover:opacity-100 hover:bg-gray-100 hover:text-gray-600"
                  aria-label={`Editar ${label}`}
               >
                  <HiPencil className="h-3.5 w-3.5" />
               </button>
            </div>
         </div>
      </div>
   );
}

// Campo somente leitura (sem edição)
function ReadOnlyField({
   icon: Icon,
   label,
   value,
   fieldName,
}: {
   icon: React.ComponentType<{ className?: string }>;
   label: string;
   value: string;
   fieldName?: string;
}) {
   return (
      <div
         id={fieldName ? `field-${fieldName}` : undefined}
         className="flex items-center gap-3 px-5 py-3.5"
      >
         <div className="shrink-0 rounded-lg bg-red-100 p-2.5">
            <Icon className="h-4 w-4 text-red-600" />
         </div>
         <div className="min-w-0 flex-1">
            <p className="mb-0.5 text-xs font-medium tracking-wide text-gray-500 uppercase">
               {label}
            </p>
            <p className="text-sm leading-tight font-semibold text-gray-900 select-all">
               {value || "—"}
            </p>
         </div>
      </div>
   );
}

// Aviso (não-bloqueante) de completude de cadastro. A lista de campos
// pendentes vem pronta do backend (user.campos_pendentes). Cada chip
// rola até o campo e abre sua edição (quando editável).
function CadastroIncompletoNotice({ pendentes }: { pendentes: string[] }) {
   const { requestFocus } = useContext(FieldFocusContext);

   if (pendentes.length === 0) return null;

   return (
      <div className="flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3">
         <HiExclamation className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
         <div className="min-w-0 text-sm text-amber-800">
            <p className="font-semibold">Cadastro incompleto</p>
            <p className="mt-1 text-amber-700">
               {pendentes.length === 1
                  ? "Falta preencher 1 campo. Clique para ir até ele:"
                  : `Faltam preencher ${pendentes.length} campos. Clique para ir até cada um:`}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
               {pendentes.map((field) => (
                  <button
                     key={field}
                     type="button"
                     onClick={() => requestFocus(field)}
                     className="rounded-md border border-amber-300 bg-white px-2.5 py-1 text-xs font-medium text-amber-700 transition-colors hover:bg-amber-100"
                  >
                     {USER_FIELD_LABELS[field] ?? field}
                  </button>
               ))}
            </div>
         </div>
      </div>
   );
}

// Aviso (não-bloqueante) sobre o histórico de promoções:
// - sem registros: incentiva o cadastro do histórico de carreira;
// - com registros divergentes: alerta que p_g/ult_promo não conferem.
function PromoHistoryNotice({ user, userId }: UserReadViewProps) {
   const { data: promos = [], isLoading } = useUserPromos(userId);

   if (isLoading) return null;

   if (promos.length === 0) {
      return (
         <div className="flex items-start gap-3 rounded-lg border border-sky-200 bg-sky-50 px-4 py-3">
            <HiInformationCircle className="mt-0.5 h-5 w-5 shrink-0 text-sky-500" />
            <div className="min-w-0 text-sm text-sky-800">
               <p className="font-semibold">Nenhuma promoção registrada</p>
               <p className="mt-1 text-sky-700">
                  Este militar ainda não possui histórico de progressão de
                  carreira. Registre as promoções na aba{" "}
                  <span className="font-semibold">Promoções</span> para manter a
                  antiguidade e os cálculos do sistema consistentes.
               </p>
            </div>
         </div>
      );
   }

   const latest = promos[0]; // já ordenado por data_promo desc
   const pgMismatch = user.p_g !== latest.p_g;
   const dateMismatch =
      (user.ult_promo || null) !== (latest.data_promo || null);

   if (!pgMismatch && !dateMismatch) return null;

   const latestPostoLabel =
      postoGradRecords.find((p) => p.short === latest.p_g)?.mid || latest.p_g;

   return (
      <div className="flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3">
         <HiExclamation className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
         <div className="min-w-0 text-sm text-amber-800">
            <p className="font-semibold">
               Cadastro divergente do histórico de promoções
            </p>
            <ul className="mt-1 list-inside list-disc space-y-0.5 text-amber-700">
               {pgMismatch && (
                  <li>
                     Posto/Graduação atual difere da última promoção registrada
                     ({latestPostoLabel.toUpperCase()}).
                  </li>
               )}
               {dateMismatch && (
                  <li>
                     Última Promoção não confere com a data do histórico (
                     {formatDateFull(latest.data_promo)}).
                  </li>
               )}
            </ul>
         </div>
      </div>
   );
}

// ========================================
// Componente Principal
// ========================================

export function UserReadView({ user, userId }: UserReadViewProps) {
   const unidadeOptions = useUnidadeOptions();
   const [focusReq, setFocusReq] = useState<{
      field: string;
      n: number;
   } | null>(null);

   // Rola até o campo e sinaliza (via nonce) para abrir sua edição.
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
         <div className="space-y-5">
            <CadastroIncompletoNotice pendentes={user.campos_pendentes ?? []} />
            <PromoHistoryNotice user={user} userId={userId} />

            {/* Dados Pessoais */}
            <SectionCard title="Dados Pessoais" icon={FaUser}>
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
            <SectionCard title="Dados Militares" icon={FaShieldAlt}>
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
               <EditableField
                  icon={HiOfficeBuilding}
                  label="Unidade"
                  value={
                     unidadeOptions.find((u) => u.value === user.unidade)
                        ?.label || user.unidade?.toUpperCase()
                  }
                  rawValue={user.unidade || ""}
                  fieldName="unidade"
                  userId={userId}
                  type="select"
                  options={unidadeOptions}
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
