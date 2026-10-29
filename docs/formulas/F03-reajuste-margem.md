# Fórmula F03 — Reajuste para Manter a Margem

## Definição
Determina o novo preço de venda necessário para preservar a margem-alvo após aumento de custos, calcula o lucro recuperado e a queda máxima de volume tolerável antes que a operação fique pior do que antes do aumento.

## Variáveis
- $C_{antigo}$: Custo da porção antes do aumento (centavos).
- $C_{novo}$: Custo da porção após o aumento (centavos).
- $P_{antigo}$: Preço de venda atual (centavos).
- $M_{alvo}$: Margem de contribuição percentual desejada sobre a receita ($0 < M_{alvo} < 1$).
- $P_{novo} = \lceil C_{novo} / (1 - M_{alvo}) \rceil$: Preço de venda recomposto.
- $MC_{antiga} = P_{antigo} - C_{antigo}$: Margem de contribuição unitária original.
- $MC_{nova} = P_{novo} - C_{novo}$: Nova margem de contribuição unitária.
- $QuedaMaxVolume = 1 - \frac{MC_{antiga}}{MC_{nova}}$: Queda percentual de vendas suportável mantendo o mesmo lucro total.

## Exemplo Numérico Calculado à Mão
- Prato vendido a $P_{antigo} = \text{R\$ } 40,00$ (4.000 centavos). Custo original $C_{antigo} = \text{R\$ } 12,00$ (1.200 centavos).
- Margem-alvo: 70% ($0,70$).
- Custo subiu para $C_{novo} = \text{R\$ } 15,00$ (1.500 centavos).
- Novo preço: $P_{novo} = 15,00 / (1 - 0,70) = 15,00 / 0,30 = \text{R\$ } 50,00$ (5.000 centavos).
- $MC_{antiga} = 40,00 - 12,00 = \text{R\$ } 28,00$ (2.800 centavos).
- $MC_{nova} = 50,00 - 15,00 = \text{R\$ } 35,00$ (3.500 centavos).
- $QuedaMaxVolume = 1 - (28,00 / 35,00) = 1 - 0,80 = 20\%$.
- Prova: Se vendia 100 unidades $\to Lucro = 100 \times 28,00 = \text{R\$ } 2.800,00$.
- Com queda de 20% vendendo 80 unidades a preço novo $\to Lucro = 80 \times 35,00 = \text{R\$ } 2.800,00$ (exatamente idêntico!).

## Limites e Casos de Borda
- $M_{alvo} \ge 1$: erro de domínio (margem $\ge 100\%$ inviável matematicamente).
- $MC_{nova} \le 0$: erro de domínio com mensagem clara ("Preço novo não cobre os custos variáveis").
