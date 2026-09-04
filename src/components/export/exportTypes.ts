/**
 * Contrato do exportador de planilhas.
 *
 * Cada tela declara o seu catalogo de colunas; o modal, a gaveta e o gerador
 * do .xlsx sao genericos e nao sabem nada sobre o dominio dos dados.
 */

export interface ExportColumn<T> {
   /** Identificador estavel — e o que fica salvo na preferencia do usuario. */
   key: string;
   /** Cabecalho da coluna na planilha e rotulo no seletor. */
   label: string;
   /** Extrai o valor da linha. Devolver `null` vira celula vazia. */
   get: (row: T) => string | number | null | undefined;
   /**
    * Coluna obrigatoria: entra sempre e nao pode ser desmarcada no seletor.
    * P/G, quadro, especialidade, nome de guerra e nome completo sao as fixas
    * do sistema, nesta ordem.
    */
   required?: boolean;
   /** Largura em caracteres. Sem isto a largura e calculada pelo conteudo. */
   width?: number;
   align?: "left" | "center" | "right";
   /**
    * Identidade militar (p_g, esp, quadro, nomes, trigrama) vai em CAIXA
    * ALTA na planilha — o dado no banco nao e confiavelmente maiusculo.
    */
   uppercase?: boolean;
   /**
    * Coluna cujo valor NAO esta na linha da listagem: so chega pela
    * hidratacao, no ato da exportacao. A previa mostra o `sample` no lugar.
    */
   hydrated?: boolean;
   /**
    * Valores desta coluna nos militares FICTICIOS da previa — um por linha.
    *
    * A previa nao mostra dado real de ninguem: ela existe para conferir
    * QUAIS colunas saem e em QUE ordem, e para isso um Fulano da Silva serve
    * melhor que o efetivo verdadeiro. Assim nao ha o que confundir com dado
    * do sistema, e some a necessidade de avisar que ali e exemplo.
    */
   samples?: string[];
   /**
    * Secao do seletor de colunas. Espelha o agrupamento do formulario de
    * cadastro ("Dados Militares" / "Dados Pessoais"); tela de dominio usa o
    * nome do seu proprio bloco.
    */
   group?: string;
}
