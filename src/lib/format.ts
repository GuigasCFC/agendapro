export function formatCurrency(value: number, options?: Intl.NumberFormatOptions) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    ...options,
  })
}
