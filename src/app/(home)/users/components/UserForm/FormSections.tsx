/**
 * Seções do formulário de usuário
 * Usando componentes Flowbite diretamente para controle granular
 */

import { Label, TextInput, Select, Checkbox } from "flowbite-react";
import { HiMail } from "react-icons/hi";
import clsx from "clsx";
import { postoGradRecords } from "@/constants/militar/postos";
import { unidadeOptions } from "@/constants/militar/unidades";
import { onlyLettersKeyDown, onlyNumbersKeyDown } from "./utils";

// ========================================
// Tipos
// ========================================

interface FormSectionProps {
   register: any;
   errors: any;
}

// Helper para exibir erro
function FieldError({ error }: { error?: any }) {
   if (!error) return null;
   return (
      <span className="text-xs text-red-600">
         {typeof error?.message === "string" ? error.message : "Campo inválido"}
      </span>
   );
}

// ========================================
// Seção: Identificação
// ========================================

export function IdentificationSection({ register, errors }: FormSectionProps) {
   const pgOptions = postoGradRecords.map((pg) => ({
      value: pg.short,
      label: pg.mid,
   }));

   return (
      <div className="grid grid-cols-12 gap-3">
         {/* P/G */}
         <div className="col-span-2">
            <Label htmlFor="p_g">P/G</Label>
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

         {/* Especialidade */}
         <div className="col-span-2">
            <Label htmlFor="esp">Especialidade</Label>
            <TextInput
               id="esp"
               {...register("esp")}
               autoComplete="off"
               maxLength={6}
               onKeyDown={onlyLettersKeyDown}
               className={clsx({
                  "focus:border-red-500 focus:ring-red-500": errors.esp,
               })}
            />
            <FieldError error={errors.esp} />
         </div>

         {/* Nome de Guerra */}
         <div className="col-span-3">
            <Label htmlFor="nome_guerra">Nome de Guerra</Label>
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

         {/* Nome Completo */}
         <div className="col-span-5">
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
      </div>
   );
}

// ========================================
// Seção: Documentação
// ========================================

export function DocumentationSection({ register, errors }: FormSectionProps) {
   return (
      <div className="grid grid-cols-12 gap-3">
         {/* Unidade */}
         <div className="col-span-3">
            <Label htmlFor="unidade">Unidade</Label>
            <Select
               id="unidade"
               defaultValue=""
               {...register("unidade")}
               className={clsx({
                  "focus:border-red-500 focus:ring-red-500": errors.unidade,
               })}
            >
               <option value="" disabled>
                  Selecione...
               </option>
               {unidadeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                     {opt.label}
                  </option>
               ))}
            </Select>
            <FieldError error={errors.unidade} />
         </div>

         {/* SARAM */}
         <div className="col-span-3">
            <Label htmlFor="saram">SARAM</Label>
            <TextInput
               id="saram"
               {...register("saram")}
               autoComplete="off"
               maxLength={7}
               minLength={7}
               onKeyDown={onlyNumbersKeyDown}
               className={clsx({
                  "focus:border-red-500 focus:ring-red-500": errors.saram,
               })}
            />
            <FieldError error={errors.saram} />
         </div>

         {/* ID FAB */}
         <div className="col-span-3">
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

         {/* CPF */}
         <div className="col-span-3">
            <Label htmlFor="cpf">CPF</Label>
            <TextInput
               id="cpf"
               {...register("cpf")}
               autoComplete="off"
               maxLength={11}
               minLength={11}
               onKeyDown={onlyNumbersKeyDown}
               className={clsx({
                  "focus:border-red-500 focus:ring-red-500": errors.cpf,
               })}
            />
            <FieldError error={errors.cpf} />
         </div>
      </div>
   );
}

// ========================================
// Seção: Contato e Datas
// ========================================

export function ContactAndDatesSection({ register, errors }: FormSectionProps) {
   return (
      <div className="grid grid-cols-12 gap-3">
         {/* Email Zimbra */}
         <div className="col-span-4">
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

         {/* Email Particular */}
         <div className="col-span-4">
            <Label htmlFor="email_pess">Email Particular</Label>
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

         {/* Data de Nascimento */}
         <div className="col-span-4">
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
      </div>
   );
}

// ========================================
// Seção: Carreira
// ========================================

export function CareerSection({ register, errors }: FormSectionProps) {
   return (
      <div className="grid grid-cols-12 gap-3">
         {/* Última Promoção */}
         <div className="col-span-6">
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

         {/* Antiguidade Relativa */}
         <div className="col-span-6">
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
