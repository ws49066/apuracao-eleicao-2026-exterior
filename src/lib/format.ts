const INTEIRO = new Intl.NumberFormat("pt-BR");
const DECIMAL = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const inteiro = (n: number) => INTEIRO.format(Math.round(n));
export const percentual = (n: number) => `${DECIMAL.format(n)}%`;
