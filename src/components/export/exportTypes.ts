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
    * P/G, nome de guerra e nome completo sao as tres fixas do sistema.
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
   /** Marca a coluna como dado pessoal, para o aviso no modal. */
   sensitive?: boolean;
}
