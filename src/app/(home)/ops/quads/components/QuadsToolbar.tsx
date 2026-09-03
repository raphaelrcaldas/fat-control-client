"use client";
import { Button, ButtonGroup, Label, Select } from "flowbite-react";
import { QuadTypeGroup } from "services/routes/quads";
import { useFuncoes } from "@/hooks/queries";
import { QuadOrdem } from "../utils/sortQuads";

interface QuadsToolbarProps {
   quadsType: QuadTypeGroup[];
   quadFunc: string;
   onQuadFuncChange: (func: string) => void;
   quadType: number;
   onQuadTypeChange: (id: number) => void;
   ordem: QuadOrdem;
   onOrdemChange: (ordem: QuadOrdem) => void;
   visual: "comp" | "reduz";
   onVisualChange: (visual: "comp" | "reduz") => void;
   loadingTypes: boolean;
}

/**
 * Rótulo único dos quatro controles.
 *
 * Eram dois tratamentos na mesma fileira, e a diferença não queria dizer nada:
 * "Função" e "Quadrinho" vinham do `<Label>` do Flowbite (peso 500, cinza do
 * tema) e "Antiguidade" e "Visualização" de um `<legend>` cru (peso 400, preto
 * puro — que nem é cor do projeto). Quatro rótulos lado a lado com dois pesos e
 * duas cores fazem o olho procurar uma hierarquia que não existe.
 *
 * O formato é o do painel de filtros de `ops/indisp`, o vizinho mais próximo:
 * rótulo miúdo e apagado sobre o controle, que é quem tem de ganhar o contraste.
 */
const ROTULO = "mb-1 block text-xs font-medium text-gray-500";

export function QuadsToolbar({
   quadsType,
   quadFunc,
   onQuadFuncChange,
   quadType,
   onQuadTypeChange,
   ordem,
   onOrdemChange,
   visual,
   onVisualChange,
   loadingTypes,
}: QuadsToolbarProps) {
   const { principais } = useFuncoes();

   const visibleGroups = quadsType.filter((group) =>
      group.types.some((type) => type.funcs_list.includes(quadFunc))
   );

   return (
      // `items-stretch` (o padrão do flex) é o que dá altura aos `ButtonGroup`:
      // eles não têm altura própria — quem a define é o `grow` dentro de um
      // fieldset esticado até a altura da fileira. Trocar por `items-end`
      // colapsa os dois grupos para 19px, contra os 37px dos selects. Fica
      // explícito no código justamente porque é carga estrutural, não default
      // por acaso.
      //
      // `p-3` no lugar de `px-2 py-3`: a barra tinha 7px de folga lateral, e o
      // primeiro rótulo quase encostava na borda do cartão.
      <div className="flex flex-wrap items-stretch gap-x-4 gap-y-3 rounded border border-slate-200 bg-white p-3 shadow-sm">
         {/* O QUE a grade mostra. Estes dois mudam a consulta. */}
         <div>
            {/* Sem `text-center`: o rótulo era centrado sobre um `<select>`
                cujo texto começa na esquerda, e num controle de 112px isso
                põe as duas palavras em eixos diferentes. */}
            <Label htmlFor="quad-func" className={ROTULO}>
               Função
            </Label>
            <Select
               id="quad-func"
               value={quadFunc}
               className="w-36"
               onChange={(e) => onQuadFuncChange(e.target.value)}
            >
               {principais.map((f) => (
                  <option key={f.cod} value={f.cod}>
                     {f.nome_curto}
                  </option>
               ))}
            </Select>
         </div>
         <div>
            <Label htmlFor="quad-type" className={ROTULO}>
               Quadrinho
            </Label>
            <Select
               id="quad-type"
               value={quadType}
               onChange={(e) => onQuadTypeChange(parseInt(e.target.value))}
               className="w-44"
               disabled={loadingTypes || visibleGroups.length === 0}
            >
               {visibleGroups.length === 0 && (
                  <option value="">
                     {loadingTypes ? "Carregando..." : "Nenhum disponível"}
                  </option>
               )}
               {visibleGroups.map((group, index) => {
                  const nameGroup = group.long.toUpperCase();
                  return (
                     <optgroup key={index} label={nameGroup}>
                        {group.types
                           .filter((type) => type.funcs_list.includes(quadFunc))
                           .map((type) => (
                              <option key={type.id} value={type.id}>
                                 {type.long.toUpperCase()}
                              </option>
                           ))}
                     </optgroup>
                  );
               })}
            </Select>
         </div>

         {/* COMO a grade mostra. Nenhum dos dois muda a consulta — um reordena
             as linhas que já vieram, o outro só muda o tamanho da célula. Iam
             na mesma fileira e com o mesmo peso dos filtros, como se fossem
             quatro perguntas do mesmo tipo; `sm:ml-auto` os manda para a
             ponta oposta da barra, que sobrava vazia (os quatro controles
             somavam ~500px numa barra de 1283px). */}
         <fieldset className="flex flex-col sm:ml-auto">
            <legend className={ROTULO}>Antiguidade</legend>
            {/* grow + h-auto: o grupo ocupa a altura restante do fieldset e o
                align-items stretch do flex estica os botões junto */}
            <ButtonGroup className="grow">
               <Button
                  size="sm"
                  color={ordem === "opr" ? "primary" : "light"}
                  aria-pressed={ordem === "opr"}
                  onClick={() => onOrdemChange("opr")}
                  className="h-auto"
               >
                  Operacional
               </Button>
               <Button
                  size="sm"
                  color={ordem === "mil" ? "primary" : "light"}
                  aria-pressed={ordem === "mil"}
                  onClick={() => onOrdemChange("mil")}
                  className="h-auto"
               >
                  Militar
               </Button>
            </ButtonGroup>
         </fieldset>
         {/* Abaixo de `md` o quadrinho já é um quadrado sem data legível, então
             a escolha entre completa e reduzida não teria efeito visível. */}
         <fieldset className="hidden flex-col md:flex">
            <legend className={ROTULO}>Visualização</legend>
            <ButtonGroup className="grow">
               <Button
                  size="sm"
                  color={visual === "comp" ? "primary" : "light"}
                  aria-pressed={visual === "comp"}
                  onClick={() => onVisualChange("comp")}
                  className="h-auto"
               >
                  Completa
               </Button>
               <Button
                  size="sm"
                  color={visual === "reduz" ? "primary" : "light"}
                  aria-pressed={visual === "reduz"}
                  onClick={() => onVisualChange("reduz")}
                  className="h-auto"
               >
                  Reduzida
               </Button>
            </ButtonGroup>
         </fieldset>
      </div>
   );
}
