import {
   GRUPO_A,
   GRUPO_B,
   type LocEsp,
   type LocEspCreate,
} from "services/routes/cegep/gle";

/** Faixa de fuso do território nacional — espelha o CheckConstraint. */
export const FUSO_MIN = -5;
export const FUSO_MAX = 0;

export const FUSOS = [-5, -4, -3, -2] as const;

export interface LocEspFormState {
   cidade_id: number | null;
   cidade_label: string;
   grupo: number;
   fuso: number;
   icaos: string[];
}

export function createEmptyForm(): LocEspFormState {
   return {
      cidade_id: null,
      cidade_label: "",
      grupo: GRUPO_A,
      fuso: -3,
      icaos: [],
   };
}

export function formFromLocEsp(loc: LocEsp): LocEspFormState {
   return {
      cidade_id: loc.cidade_id,
      cidade_label: `${loc.cidade.nome} - ${loc.cidade.uf}`,
      grupo: loc.grupo,
      fuso: loc.fuso,
      icaos: [...loc.icaos],
   };
}

/**
 * Valida um ICAO isolado. Devolve a mensagem de erro, ou `null` se estiver
 * bom — o chamador decide se exibe.
 *
 * Espelha o `CheckConstraint` de `loc_esp_icao` e o validador do schema
 * Pydantic: quatro letras ASCII. Validar aqui evita a ida ao servidor para
 * um erro que o usuário corrige digitando.
 */
export function validateIcao(
   icao: string,
   jaExistentes: string[]
): string | null {
   const valor = icao.trim().toUpperCase();
   if (!valor) return "Informe o código ICAO.";
   if (!/^[A-Z]{4}$/.test(valor)) {
      return "O ICAO tem 4 letras, sem números (ex.: SBEG).";
   }
   if (jaExistentes.includes(valor)) {
      return "Este ICAO já está na lista.";
   }
   return null;
}

export function validateForm(form: LocEspFormState): Record<string, string> {
   const errors: Record<string, string> = {};

   if (!form.cidade_id) {
      errors.cidade_id = "Selecione o município.";
   }
   if (form.grupo !== GRUPO_A && form.grupo !== GRUPO_B) {
      errors.grupo = "Selecione o grupo.";
   }
   if (form.fuso < FUSO_MIN || form.fuso > FUSO_MAX) {
      errors.fuso = `O fuso vai de ${FUSO_MIN} a ${FUSO_MAX}.`;
   }
   // A localidade sem ICAO é permitida pelo banco, mas não serve à pesquisa:
   // é justamente o ICAO que liga a etapa de voo à localidade.
   if (form.icaos.length === 0) {
      errors.icaos =
         "Cadastre ao menos um ICAO — sem ele a localidade não aparece na pesquisa de etapas.";
   }

   return errors;
}

export function toPayload(form: LocEspFormState): LocEspCreate {
   return {
      cidade_id: form.cidade_id as number,
      grupo: form.grupo,
      fuso: form.fuso,
      icaos: form.icaos,
   };
}
