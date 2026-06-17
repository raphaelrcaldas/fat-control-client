/**
 * Contexto de foco de campo da visualização de usuário.
 *
 * Permite que o banner de cadastro incompleto role até um campo e abra a
 * sua edição. `focusReq` carrega um nonce (`n`) para reagir mesmo a cliques
 * repetidos no mesmo campo.
 */

import { createContext, useContext } from "react";

export interface FieldFocusValue {
   focusReq: { field: string; n: number } | null;
   requestFocus: (field: string) => void;
}

export const FieldFocusContext = createContext<FieldFocusValue>({
   focusReq: null,
   requestFocus: () => {},
});

export const useFieldFocus = () => useContext(FieldFocusContext);
