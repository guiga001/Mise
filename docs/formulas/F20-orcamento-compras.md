# F20 — Orçamento de Compras por Categoria

## 1. Definição Matemática
Compara o gasto realizado no mês por categoria de insumo contra a meta orçamentária estipulada pelo gestor.
Calcula a projeção linear para o final do mês corrente:

$$\text{Projeção de Fim de Mês} = \frac{\text{Gasto Realizado até o Dia } d}{d} \times D$$

Onde:
- $d$: Número de dias corridos decorridos no mês até hoje.
- $D$: Total de dias do mês calendário atual.
- Desvio Projetado $= \text{Projeção} - \text{Orçamento}$.
- Se $\text{Projeção} > \text{Orçamento}$, alerta de estouro de categoria com R$ projetado em excesso.

## 2. Exemplo Calculado à Mão
- Categoria: Laticínios. Orçamento do mês: R$ 5.000,00.
- Hoje é dia 12 de um mês de 30 dias ($d = 12, D = 30$).
- Total de compras realizadas até o dia 12: R$ 2.400,00.
- Média diária: $2{.}400 / 12 = \text{R\$} 200{,}00/\text{dia}$.
- Projeção de fim de mês: $200 \times 30 = \text{R\$} 6{.}000{,}00$.
- Estouro projetado: $6{.}000 - 5{.}000 = \text{R\$} 1{.}000{,}00$ de excesso (20% acima do teto).

## 3. Limites e Casos de Borda
- $d = 0$: Primeiro dia sem compras registradas projeta zero sem divisão por zero.
- Categorias sem orçamento configurado pelo dono mostram o total realizado e orientam a definição da meta orçamentária.
