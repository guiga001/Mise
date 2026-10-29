# Fórmula F07 — Índice de Inflação da Cozinha (Laspeyres)

## Definição
Mede o índice de inflação dos insumos da cozinha através da fórmula clássica de Laspeyres, ponderando as variações de preço pela cesta de consumo real do período-base ($q_0$). Compara com a variação média ponderada dos preços de venda para apurar o gap financeiro mensal.

## Variáveis
- $q_{i0}$: Quantidade consumida do insumo $i$ no período-base.
- $p_{i0}$: Preço unitário do insumo $i$ no período-base.
- $p_{i1}$: Preço unitário do insumo $i$ no período atual.
- $I_{Laspeyres} = 100 \times \frac{\sum (p_{i1} \cdot q_{i0})}{\sum (p_{i0} \cdot q_{i0})}$
- $\Delta P_{venda}\%$: Variação média ponderada dos preços de venda do cardápio.
- $Gap_{inflação} = \left(\frac{I_{Laspeyres} - 100}{100} - \Delta P_{venda}\right) \times CMV_{base}$

## Exemplo Numérico
- Cesta base: Insumo A (10 kg a R$ 10 = R$ 100), Insumo B (5 kg a R$ 20 = R$ 100). $\sum (p_0 q_0) = \text{R\$ } 200,00$.
- Preços atuais: Insumo A foi para R$ 12, Insumo B foi para R$ 22.
  - $\sum (p_1 q_0) = (10 \times 12) + (5 \times 22) = 120 + 110 = \text{R\$ } 230,00$.
  - $I_{Laspeyres} = 100 \times (230 / 200) = 115,0$ (+15% de inflação de insumos).
- Se os preços de venda subiram apenas +5%:
  - $Gap = (0,15 - 0,05) \times \text{R\$ } 200,00 = \text{R\$ } 20,00$ de déficit de margem.

## Limites e Casos de Borda
- Preços inalterados ($p_1 = p_0$) resultam exatamente em $I = 100,0$.
- Insumo sem preço registrado no período atual: sinalizado explicitamente, nunca admitido como 0.
