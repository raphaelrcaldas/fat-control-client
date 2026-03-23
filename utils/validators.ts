/**
 * Validadores de dados.
 */

/**
 * Calcula o dígito verificador (DV) do SARAM
 * usando módulo 11 com pesos de 2 a 7.
 *
 * @param numeroBase - String com os dígitos base do SARAM (sem o DV)
 * @returns Dígito verificador calculado (0-9)
 */
function calcularDvSaram(numeroBase: string): number {
   const pesos = [2, 3, 4, 5, 6, 7];
   let soma = 0;

   const digitos = numeroBase.split("").reverse();
   for (let i = 0; i < digitos.length; i++) {
      const peso = pesos[i % pesos.length];
      soma += parseInt(digitos[i], 10) * peso;
   }

   const resto = soma % 11;
   let dv = 11 - resto;

   if (dv === 10 || dv === 11) {
      dv = 0;
   }

   return dv;
}

/**
 * Valida um SARAM completo (com DV).
 * Aceita formatos: XXXXXX-D, XXXXXXD ou number.
 *
 * @param saram - SARAM a ser validado (string ou number)
 * @returns true se o SARAM é válido, false caso contrário
 */
export function validarSaram(saram: string | number): boolean {
   // Converte para string e remove hífen, se houver
   const saramStr = String(saram).replace("-", "").trim();

   if (!/^\d+$/.test(saramStr) || saramStr.length < 2) {
      return false;
   }

   const numeroBase = saramStr.slice(0, -1);
   const dvInformado = parseInt(saramStr.slice(-1), 10);

   const dvCalculado = calcularDvSaram(numeroBase);

   return dvInformado === dvCalculado;
}