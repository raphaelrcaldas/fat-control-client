/** Normaliza texto para codigo ICAO: maiusculas, no maximo 4 caracteres. */
export function toIcao(value: string): string {
   return value.toUpperCase().slice(0, 4);
}

/** Normaliza nivel de voo (FL): apenas digitos, no maximo 3. */
export function toNivelDigits(value: string): string {
   return value.replace(/\D/g, "").slice(0, 3);
}
