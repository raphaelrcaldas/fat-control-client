"use client";
import { useEffect, useState } from "react";
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
/**
 * Verdadeiro abaixo do breakpoint `sm` — o mesmo que decide o layout da barra.
 *
 * Existe porque `<option>` não obedece CSS: não dá para escrever o rótulo
 * longo e escondê-lo com uma classe responsiva, como se faria em qualquer
 * outro elemento. O texto tem de ser escolhido em JS.
 *
 * A consulta usa a expressão IDÊNTICA à do Tailwind (`40rem`) de propósito,
 * para as duas nunca discordarem — e o número não é o que parece: dentro de
 * uma media query o `rem` se resolve contra o tamanho INICIAL de fonte
 * (16px), ignorando a raiz de 87,5% do client. Então `sm:` vira 640px, e não
 * os 560px que a conta ingênua daria. Verificado no navegador: a 639px a
 * barra ainda está no layout compacto.
 *
 * O primeiro render é o de desktop, mas isso não pisca: as opções só existem
 * depois que o catálogo de funções chega, e a essa altura o efeito já rodou.
 */
function useAbaixoDeSm() {
   const [compacto, setCompacto] = useState(false);

   useEffect(() => {
      const mq = window.matchMedia("(min-width: 40rem)");
      const aplicar = () => setCompacto(!mq.matches);
      aplicar();
      mq.addEventListener("change", aplicar);
      return () => mq.removeEventListener("change", aplicar);
   }, []);

   return compacto;
}

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
            /* `py-2` porque no celular ninguém estica este cartão: ali a
               fieldset quebra para uma linha só dela, o `grow` não tem contra
               o que crescer e a altura vira a do conteúdo — 19,5px, com um
               radio de 14px dentro e 2,75px de folga. No desktop o `grow`
               continua mandando (37px, a altura dos selects ao lado) e este
               padding não tem efeito. */
            "flex cursor-pointer items-center gap-2 rounded border px-3 py-2 text-sm transition-colors select-none",
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
   const compacto = useAbaixoDeSm();

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
      <div className="flex flex-wrap items-start gap-x-2 gap-y-3 rounded border border-slate-200 bg-white p-3 shadow-sm sm:items-stretch sm:gap-x-4">
         {/* O QUE a grade mostra. Estes dois mudam a consulta.

             `flex-1 min-w-0` no celular: os dois selects espremem até o que
             sobra depois da coluna de radios, para o filtro inteiro caber numa
             linha só. `min-w-0` é obrigatório — sem ele o item flex não encolhe
             abaixo do conteúdo e a linha quebra assim mesmo. A partir de `sm`
             voltam à largura própria. */}
         <div className="w-20 shrink-0 sm:w-auto">
            <Label htmlFor="quad-func" className={ROTULO}>
               Função
            </Label>
            <Select
               id="quad-func"
               value={quadFunc}
               className="w-full sm:w-36"
               onChange={(e) => onQuadFuncChange(e.target.value)}
            >
               {principais.map((f) => (
                  <option key={f.cod} value={f.cod}>
                     {/* A sigla no celular: "MC" no lugar de "Mecânico"
                         devolve ~40px de largura, e é o que sobra para o
                         seletor de quadrinho ao lado, cujos valores são
                         longos ("BATE-PRONTO", "CALHA-NORTE"). */}
                     {compacto ? f.cod.toUpperCase() : f.nome_curto}
                  </option>
               ))}
            </Select>
         </div>
         <div className="min-w-0 flex-1 sm:flex-none">
            <Label htmlFor="quad-type" className={ROTULO}>
               Quadrinho
            </Label>
            <Select
               id="quad-type"
               value={quadType}
               onChange={(e) => onQuadTypeChange(parseInt(e.target.value))}
               className="w-full sm:w-44"
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
            {/* Em COLUNA no celular: as duas opções empilhadas ocupam a
                largura de uma palavra em vez de duas, e é isso que faz o filtro
                inteiro caber numa linha só — antes a fieldset quebrava para uma
                segunda fileira e a barra media 154px de altura contra os 117px
                de agora.

                `sm:grow`: a partir daí a fileira volta a ser horizontal e ocupa
                a altura restante da fieldset, que com o `items-stretch` do
                contêiner é o que deixa os cartões na mesma altura dos selects
                ao lado. */}
            <div className="flex flex-col gap-1 sm:grow sm:flex-row sm:gap-2">
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
