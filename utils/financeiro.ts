
export function realCurrency(valor: number) {

    return Number(valor).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
    })
}