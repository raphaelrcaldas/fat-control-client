/**
 * Seções do formulário de usuário
 * Layout em coluna única espelhando o UserReadView
 */

import { Label, TextInput, Select, Checkbox } from "flowbite-react";
import { HiMail, HiPhone } from "react-icons/hi";
import { FaUser, FaShieldAlt } from "react-icons/fa";
import {
   Controller,
   type Control,
   type FieldError as RhfFieldError,
   type FieldErrors,
   type FieldErrorsImpl,
   type Merge,
   type UseFormRegister,
} from "react-hook-form";
import clsx from "clsx";
import { postoGradRecords } from "@/constants/militar/postos";
import { quadroOptions } from "@/constants/militar/quadros";
import { especialidadeOptions } from "@/constants/militar/especialidades";
import { SearchableSelect } from "@/components/SearchableSelect";
import { onlyLettersKeyDown, onlyNumbersKeyDown } from "./utils";
import { formatPhone, formatCpf, formatSaram } from "@/constants/formats";
import { SectionCard } from "../SectionCard";
import type { CreateUserFormData } from "../../schemas/userFormSchema";

interface FormSectionProps {
   register: UseFormRegister<CreateUserFormData>;
   errors: FieldErrors<CreateUserFormData>;
   control?: Control<CreateUserFormData>;
   /** O militar nasce ativo — o status só é editável depois de cadastrado. */
   showActive?: boolean;
}

type AnyFieldError =
   | RhfFieldError
   | Merge<RhfFieldError, FieldErrorsImpl<Record<string, unknown>>>;

function FieldError({ error }: { error?: AnyFieldError }) {
   if (!error) return null;
   return (
      <span className="text-xs text-red-600">
         {typeof error?.message === "string" ? error.message : "Campo inválido"}
      </span>
   );
}

// ========================================
// Dados Pessoais
// ========================================

export function PersonalDataSection({ register, errors }: FormSectionProps) {
   const { onChange: cpfOnChange, ...cpfRest } = register("cpf");
   const { onChange: phoneOnChange, ...phoneRest } = register("telefone");

   return (
      <SectionCard title="Dados Pessoais" icon={FaUser}>
         <div className="max-w-md">
            <Label htmlFor="nome_completo">Nome Completo</Label>
            <TextInput
               id="nome_completo"
               {...register("nome_completo")}
               autoComplete="off"
               onKeyDown={onlyLettersKeyDown}
               className={clsx({
                  "focus:border-red-500 focus:ring-red-500":
                     errors.nome_completo,
               })}
            />
            <FieldError error={errors.nome_completo} />
         </div>

         <div className="max-w-2xs">
            <Label htmlFor="cpf">CPF</Label>
            <TextInput
               id="cpf"
               {...cpfRest}
               onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, "").slice(0, 11);
                  e.target.value = formatCpf(digits);
                  cpfOnChange(e);
               }}
               autoComplete="off"
               maxLength={14}
               placeholder="000.000.000-00"
               className={clsx({
                  "focus:border-red-500 focus:ring-red-500": errors.cpf,
               })}
            />
            <FieldError error={errors.cpf} />
         </div>

         <div className="max-w-2xs">
            <Label htmlFor="nasc">Data de Nascimento</Label>
            <TextInput
               id="nasc"
               type="date"
               {...register("nasc")}
               autoComplete="off"
               className={clsx({
                  "focus:border-red-500 focus:ring-red-500": errors.nasc,
               })}
            />
            <FieldError error={errors.nasc} />
         </div>

         <div className="max-w-sm">
            <Label htmlFor="email_pess">Email Pessoal</Label>
            <TextInput
               id="email_pess"
               type="email"
               {...register("email_pess")}
               autoComplete="off"
               icon={HiMail}
               className={clsx({
                  "focus:border-red-500 focus:ring-red-500": errors.email_pess,
               })}
            />
            <FieldError error={errors.email_pess} />
         </div>

         <div className="max-w-2xs">
            <Label htmlFor="telefone">Telefone</Label>
            <TextInput
               id="telefone"
               type="tel"
               {...phoneRest}
               onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, "").slice(0, 11);
                  e.target.value = formatPhone(digits);
                  phoneOnChange(e);
               }}
               autoComplete="off"
               icon={HiPhone}
               placeholder="(00) 00000-0000"
               className={clsx({
                  "focus:border-red-500 focus:ring-red-500": errors.telefone,
               })}
            />
            <FieldError error={errors.telefone} />
         </div>
      </SectionCard>
   );
}

// ========================================
// Dados Militares
// ========================================

export function MilitaryDataSection({
   register,
   errors,
   control,
   showActive = false,
}: FormSectionProps) {
   const { onChange: saramOnChange, ...saramRest } = register("saram");
   const pgOptions = postoGradRecords.map((pg) => ({
      value: pg.short,
      label: pg.mid,
   }));

   return (
      <SectionCard title="Dados Militares" icon={FaShieldAlt}>
         <div className="max-w-2xs">
            <Label htmlFor="p_g">Posto/Graduação *</Label>
            <Select
               id="p_g"
               defaultValue=""
               {...register("p_g")}
               className={clsx({
                  "focus:border-red-500 focus:ring-red-500": errors.p_g,
               })}
            >
               <option value="" disabled>
                  Selecione...
               </option>
               {pgOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                     {opt.label}
                  </option>
               ))}
            </Select>
            <FieldError error={errors.p_g} />
         </div>

         <div className="max-w-xs">
            <Label htmlFor="quadro">Quadro</Label>
            <Controller
               name="quadro"
               control={control}
               render={({ field }) => (
                  <SearchableSelect
                     options={quadroOptions}
                     value={field.value || ""}
                     onChange={field.onChange}
                     placeholder="Selecione..."
                     clearable
                  />
               )}
            />
            <FieldError error={errors.quadro} />
         </div>

         <div className="max-w-xs">
            <Label htmlFor="esp">Especialidade</Label>
            <Controller
               name="esp"
               control={control}
               render={({ field }) => (
                  <SearchableSelect
                     options={especialidadeOptions}
                     value={field.value || ""}
                     onChange={field.onChange}
                     placeholder="Selecione..."
                     clearable
                  />
               )}
            />
            <FieldError error={errors.esp} />
         </div>

         <div className="max-w-xs">
            <Label htmlFor="nome_guerra">Nome de Guerra *</Label>
            <TextInput
               id="nome_guerra"
               {...register("nome_guerra")}
               autoComplete="off"
               onKeyDown={onlyLettersKeyDown}
               className={clsx({
                  "focus:border-red-500 focus:ring-red-500": errors.nome_guerra,
               })}
            />
            <FieldError error={errors.nome_guerra} />
         </div>

         <div className="max-w-2xs">
            <Label htmlFor="saram">SARAM *</Label>
            <TextInput
               id="saram"
               {...saramRest}
               onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, "").slice(0, 7);
                  e.target.value = formatSaram(digits);
                  saramOnChange(e);
               }}
               autoComplete="off"
               maxLength={8}
               placeholder="000000-0"
               className={clsx({
                  "focus:border-red-500 focus:ring-red-500": errors.saram,
               })}
            />
            <FieldError error={errors.saram} />
         </div>

         <div className="max-w-2xs">
            <Label htmlFor="id_fab">ID FAB</Label>
            <TextInput
               id="id_fab"
               {...register("id_fab")}
               autoComplete="off"
               minLength={6}
               onKeyDown={onlyNumbersKeyDown}
               className={clsx({
                  "focus:border-red-500 focus:ring-red-500": errors.id_fab,
               })}
            />
            <FieldError error={errors.id_fab} />
         </div>

         <div className="max-w-sm">
            <Label htmlFor="email_fab">Email Zimbra</Label>
            <TextInput
               id="email_fab"
               type="email"
               {...register("email_fab")}
               autoComplete="off"
               icon={HiMail}
               className={clsx({
                  "focus:border-red-500 focus:ring-red-500": errors.email_fab,
               })}
            />
            <FieldError error={errors.email_fab} />
         </div>

         <div className="max-w-2xs">
            <Label htmlFor="data_praca">Data de Praça</Label>
            <TextInput
               id="data_praca"
               type="date"
               {...register("data_praca")}
               autoComplete="off"
               className={clsx({
                  "focus:border-red-500 focus:ring-red-500": errors.data_praca,
               })}
            />
            <FieldError error={errors.data_praca} />
         </div>

         <div className="max-w-2xs">
            <Label htmlFor="ult_promo">Última Promoção</Label>
            <TextInput
               id="ult_promo"
               type="date"
               {...register("ult_promo")}
               autoComplete="off"
               className={clsx({
                  "focus:border-red-500 focus:ring-red-500": errors.ult_promo,
               })}
            />
            <FieldError error={errors.ult_promo} />
         </div>

         <div className="max-w-2xs">
            <Label htmlFor="ant_rel">Antiguidade Relativa</Label>
            <TextInput
               id="ant_rel"
               type="number"
               min={1}
               {...register("ant_rel")}
               autoComplete="off"
               className={clsx({
                  "focus:border-red-500 focus:ring-red-500": errors.ant_rel,
               })}
            />
            <FieldError error={errors.ant_rel} />
         </div>

         {showActive && (
            <div className="flex items-center gap-2 rounded bg-gray-50 p-3">
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
         )}
      </SectionCard>
   );
}
