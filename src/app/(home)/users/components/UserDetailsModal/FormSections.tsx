/**
 * Seções do formulário de usuário
 */

import { Label, Checkbox } from "flowbite-react";
import { HiMail } from "react-icons/hi";
import { ValidatedTextInput, ValidatedSelect } from "./FormFields";
import { postoGradRecords } from "@/constants/militar/postos";

// ========================================
// Tipos
// ========================================

interface FormSectionProps {
   register: any;
   errors: any;
}

// ========================================
// Seção: Identificação
// ========================================

export function IdentificationSection({ register, errors }: FormSectionProps) {
   // Gerar opções de P/G a partir de postoGradRecords
   const pgOptions = postoGradRecords.map((pg) => ({
      value: pg.short,
      label: pg.mid,
   }));

   return (
      <div className="grid grid-cols-12 gap-3">
         <ValidatedSelect
            label="P/G"
            name="p_g"
            register={register}
            error={errors.p_g}
            options={pgOptions}
            className="col-span-2"
         />

         <ValidatedTextInput
            label="Especialidade"
            name="esp"
            register={register}
            error={errors.esp}
            maxLength={6}
            validationType="letters"
            className="col-span-2"
         />

         <ValidatedTextInput
            label="Nome de Guerra"
            name="nome_guerra"
            register={register}
            error={errors.nome_guerra}
            validationType="letters"
            className="col-span-3"
         />

         <ValidatedTextInput
            label="Nome Completo"
            name="nome_completo"
            register={register}
            error={errors.nome_completo}
            validationType="letters"
            className="col-span-5"
         />
      </div>
   );
}

// ========================================
// Seção: Documentação
// ========================================

export function DocumentationSection({ register, errors }: FormSectionProps) {
   const unidadeOptions = [
      { value: "11gt", label: "1º/1º GT" },
      { value: "12gt", label: "1º/2º GT" },
      { value: "22gt", label: "2º/2º GT" },
      { value: "eta3", label: "3º ETA" },
      { value: "bagl", label: "BAGL" },
      { value: "glog", label: "GLOG" },
      { value: "gsd_gl", label: "GSD-GL" },
      { value: "pama_gl", label: "PAMA-GL" },
      { value: "ctla", label: "CTLA" },
      { value: "gapgl", label: "GAP-GL" },
   ];

   return (
      <div className="grid grid-cols-12 gap-3">
         <ValidatedSelect
            label="Unidade"
            name="unidade"
            register={register}
            error={errors.unidade}
            options={unidadeOptions}
            className="col-span-3"
         />

         <ValidatedTextInput
            label="SARAM"
            name="saram"
            register={register}
            error={errors.saram}
            maxLength={7}
            minLength={7}
            validationType="numbers"
            className="col-span-3"
         />

         <ValidatedTextInput
            label="ID FAB"
            name="id_fab"
            register={register}
            error={errors.id_fab}
            minLength={6}
            validationType="numbers"
            className="col-span-3"
         />

         <ValidatedTextInput
            label="CPF"
            name="cpf"
            register={register}
            error={errors.cpf}
            maxLength={11}
            minLength={11}
            validationType="numbers"
            className="col-span-3"
         />
      </div>
   );
}

// ========================================
// Seção: Contato e Datas
// ========================================

export function ContactAndDatesSection({ register, errors }: FormSectionProps) {
   return (
      <div className="grid grid-cols-12 gap-3">
         <ValidatedTextInput
            label="Email Zimbra"
            name="email_fab"
            register={register}
            error={errors.email_fab}
            type="email"
            icon={HiMail}
            className="col-span-4"
         />

         <ValidatedTextInput
            label="Email Particular"
            name="email_pess"
            register={register}
            error={errors.email_pess}
            type="email"
            icon={HiMail}
            className="col-span-4"
         />

         <ValidatedTextInput
            label="Data de Nascimento"
            name="nasc"
            register={register}
            error={errors.nasc}
            type="date"
            className="col-span-4"
         />
      </div>
   );
}

// ========================================
// Seção: Carreira
// ========================================

export function CareerSection({ register, errors }: FormSectionProps) {
   return (
      <div className="grid grid-cols-12 gap-3">
         <ValidatedTextInput
            label="Última Promoção"
            name="ult_promo"
            register={register}
            error={errors.ult_promo}
            type="date"
            className="col-span-6"
         />

         <ValidatedTextInput
            label="Antiguidade Relativa"
            name="ant_rel"
            register={register}
            error={errors.ant_rel}
            type="number"
            min={1}
            className="col-span-6"
         />
      </div>
   );
}

// ========================================
// Seção: Status
// ========================================

export function StatusSection({ register }: FormSectionProps) {
   return (
      <div className="flex items-center gap-2 rounded-lg bg-gray-50 p-3">
         <Checkbox
            id="active"
            className="size-5"
            color="red"
            {...register("active")}
         />
         <Label htmlFor="active" className="cursor-pointer">
            Usuário ativo
         </Label>
      </div>
   );
}
