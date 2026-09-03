"use client";
import { Label, Radio, Select } from "flowbite-react";
import clsx from "clsx";
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
 *
 * Centrado: cada rótulo encima um controle de largura própria — dois selects e
 * dois pares de cartões de radio —, e o eixo do bloco é o que amarra rótulo e
 * controle como uma coisa só.
 *
 * `w-full` é o que faz isso valer no Firefox, e não é redundante com o
 * `block`: nos dois `<legend>`, a caixa nasce do tamanho do texto (56px numa
 * fieldset de 195px). O Chromium ainda assim centra essa caixa dentro da
 * fieldset; o Firefox a encosta na borda esquerda — e como o `text-center`
 * atua DENTRO da caixa, não havia contra o que centrar. Esticando a caixa até
 * a largura da fieldset, o texto se centra igual nos dois.
 */
const ROTULO =
   "mb-1 block w-full text-center text-xs font-medium text-gray-500";

/**
 * Uma opção de um grupo de escolha única — o cartão com borda em volta do
 * radio.
 *
 * Eram dois `ButtonGroup` com `aria-pressed`, ou seja, botões de alternância
 * fingindo escolha única: nada no markup dizia que "Operacional" e "Militar"
 * eram as duas faces de UMA pergunta, e o teclado tratava cada um como parada
 * de Tab independente. Com radios de verdade dentro de um `fieldset`, o
 * conjunto vira uma parada só e as setas passeiam entre as opções — de graça,
 * pelo comportamento nativo.
 *
 * A borda é o que devolve ao controle a presença que o botão tinha: o radio
 * sozinho tem 16px e some ao lado de um `<select>` de 37px de altura. O cartão
 * inteiro é o alvo (é um `label` envolvendo o input), e o estado marcado se lê
 * de longe — borda e fundo na cor da org, não só o pontinho.
 *
 * Sem `color` no `Radio`: o default do Flowbite já é `text-primary-600`, que
 * segue o tema da org. `color="primary"` NÃO existe para este componente
 * (existe para o Checkbox, por override nosso) e deixaria o radio sem cor.
 */
function OpcaoRadio({
   name,
   value,
   checked,
   onChange,
   children,
}: {
   name: string;
   value: string;
   checked: boolean;
   onChange: () => void;
   children: React.ReactNode;
}) {
   return (
      <label
         className={clsx(
            "flex cursor-pointer items-center gap-2 rounded border px-3 text-sm transition-colors select-none",
            /* O anel de foco fica no cartão, não no círculo de 16px: é o
               cartão que o usuário enxerga como o controle. O `ring-0` no
               input desliga o anel nativo para não desenhar dois. */
            "has-[:focus-visible]:ring-primary-500 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-offset-1",
            checked
               ? "border-primary-600 bg-primary-50 text-primary-800 font-semibold"
               : "border-slate-200 bg-white text-gray-600 hover:border-slate-300 hover:bg-gray-50"
         )}
      >
         <Radio
            name={name}
            value={value}
            checked={checked}
            onChange={onChange}
            className="size-4 shrink-0 focus:ring-0 focus:ring-offset-0"
         />
         {children}
      </label>
   );
}

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
            {/* `grow`: a fileira ocupa a altura restante do fieldset e o
                align-items stretch do flex estica os cartões junto, que é o
                que os deixa na mesma altura dos selects ao lado. */}
            <div className="flex grow gap-2">
               <OpcaoRadio
                  name="quad-ordem"
                  value="opr"
                  checked={ordem === "opr"}
                  onChange={() => onOrdemChange("opr")}
               >
                  Operacional
               </OpcaoRadio>
               <OpcaoRadio
                  name="quad-ordem"
                  value="mil"
                  checked={ordem === "mil"}
                  onChange={() => onOrdemChange("mil")}
               >
                  Militar
               </OpcaoRadio>
            </div>
         </fieldset>
         {/* Abaixo de `md` o quadrinho já é um quadrado sem data legível, então
             a escolha entre completa e reduzida não teria efeito visível. */}
         <fieldset className="hidden flex-col md:flex">
            <legend className={ROTULO}>Visualização</legend>
            <div className="flex grow gap-2">
               <OpcaoRadio
                  name="quad-visual"
                  value="comp"
                  checked={visual === "comp"}
                  onChange={() => onVisualChange("comp")}
               >
                  Completa
               </OpcaoRadio>
               <OpcaoRadio
                  name="quad-visual"
                  value="reduz"
                  checked={visual === "reduz"}
                  onChange={() => onVisualChange("reduz")}
               >
                  Reduzida
               </OpcaoRadio>
            </div>
         </fieldset>
      </div>
   );
}
