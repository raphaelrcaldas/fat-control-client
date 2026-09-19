"use client";

import { Button, Label, TextInput } from "flowbite-react";
import { HiTrash } from "react-icons/hi";

import { SearchableSelect } from "@/components/SearchableSelect";
import { grupoLetra, type LocEsp } from "services/routes/cegep/gle";

import { GrupoBadge } from "../../localidades/components/GrupoBadge";

export interface TrechoForm {
   /** Chave estável de render — não vai para o backend. */
   uid: string;
   loc_esp_id: string;
   chegada: string;
   afastamento: string;
}

interface TrechoRowProps {
   trecho: TrechoForm;
   localidades: LocEsp[];
   erro?: string;
   podeRemover: boolean;
   onChange: (patch: Partial<TrechoForm>) => void;
   onRemove: () => void;
}

/**
 * Uma permanência: onde, de quando até quando.
 *
 * A categoria não é campo — ela vem da localidade cadastrada, então é
 * exibida como consequência da escolha, não como algo a digitar. É o que
 * elimina a coluna "CAT" da planilha, onde o usuário podia errar.
 */
export function TrechoRow({
   trecho,
   localidades,
   erro,
   podeRemover,
   onChange,
   onRemove,
}: TrechoRowProps) {
   const selecionada = localidades.find(
      (l) => String(l.id) === trecho.loc_esp_id
   );

   return (
      <div className="rounded border border-slate-200 bg-white p-3 shadow-sm">
         <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_auto]">
            <div className="min-w-0">
               {/* `SearchableSelect`: são 51 localidades e crescendo — um
                   `<select>` nativo obrigaria a rolar a lista inteira. */}
               {/* Sem `htmlFor`: o SearchableSelect renderiza um botão, não
                   um controle rotulável — mesmo padrão de EtapasFilterPanel. */}
               <Label className="mb-1 block text-xs">Localidade</Label>
               <SearchableSelect
                  options={localidades.map((loc) => ({
                     value: String(loc.id),
                     label: `${loc.cidade.nome} - ${loc.cidade.uf} (${grupoLetra(loc.grupo)})`,
                  }))}
                  value={trecho.loc_esp_id}
                  onChange={(loc_esp_id) => onChange({ loc_esp_id })}
                  placeholder="Busque por município ou UF…"
                  sizing="sm"
               />
            </div>

            <div>
               <Label
                  htmlFor={`cheg-${trecho.uid}`}
                  className="mb-1 block text-xs"
               >
                  Chegada
               </Label>
               <TextInput
                  id={`cheg-${trecho.uid}`}
                  type="datetime-local"
                  value={trecho.chegada}
                  onChange={(e) => onChange({ chegada: e.target.value })}
                  sizing="sm"
               />
            </div>

            <div>
               <Label
                  htmlFor={`afas-${trecho.uid}`}
                  className="mb-1 block text-xs"
               >
                  Afastamento
               </Label>
               <TextInput
                  id={`afas-${trecho.uid}`}
                  type="datetime-local"
                  value={trecho.afastamento}
                  onChange={(e) => onChange({ afastamento: e.target.value })}
                  sizing="sm"
               />
            </div>

            <div className="flex items-end">
               <Button
                  color="light"
                  size="sm"
                  onClick={onRemove}
                  disabled={!podeRemover}
                  title={
                     podeRemover
                        ? "Remover trecho"
                        : "O cálculo precisa de ao menos um trecho"
                  }
                  className="h-[34px] w-[34px] p-0 text-red-600 disabled:text-slate-300"
               >
                  <HiTrash className="h-4 w-4" />
                  <span className="sr-only">Remover trecho</span>
               </Button>
            </div>
         </div>

         <div className="mt-2 flex flex-wrap items-center gap-2">
            {selecionada && (
               <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                  Categoria
                  <GrupoBadge grupo={selecionada.grupo} />
                  {/* `slate-500`, não `400`: em 12px o 400 reprova AA. */}
                  <span className="text-slate-500">
                     {selecionada.grupo === 1 ? "20%" : "10%"} do soldo
                  </span>
               </span>
            )}
            {erro && (
               <span className="text-xs font-medium text-red-700">{erro}</span>
            )}
         </div>
      </div>
   );
}
