/**
 * Valida se a tecla pressionada é válida para um campo de trigrama
 * Permite apenas letras (a-z, A-Z) e teclas de navegação
 */
export function isValidTrigramaKey(key: string): boolean {
   const allowedNavigationKeys = [
      "Backspace",
      "Delete",
      "Tab",
      "ArrowLeft",
      "ArrowRight",
      "Home",
      "End",
   ];

   return (
      key.match(/^[a-zA-Z]$/) !== null || allowedNavigationKeys.includes(key)
   );
}

/**
 * Regras de validação para o campo trigrama
 * Usado com react-hook-form
 */
export const trigramaValidationRules = {
   required: "Trigrama é obrigatório",
   minLength: {
      value: 3,
      message: "Trigrama deve ter 3 letras",
   },
   maxLength: {
      value: 3,
      message: "Trigrama deve ter 3 letras",
   },
};
