# Fórmula F08 — Receita Sem Custo (Custos Ocultos)

## Definição
Mede o percentual e o valor em R$ da receita total decorrente de itens vendidos que não possuem ficha técnica cadastrada ou que não foram mapeados na importação de vendas.

## Variáveis
- $R_{total} = \sum_{j} Receita_j$: Faturamento bruto total do período.
- $R_{sem\_ficha} = \sum_{j \in SemFicha} Receita_j$: Faturamento de produtos mapeados para receitas inexistentes ou sem linhas.
- $R_{sem\_map} = \sum_{j \in SemMapeamento} Receita_j$: Faturamento de itens vendidos sem nenhum vínculo com ficha técnica.
- $R_{com\_custo} = R_{total} - (R_{sem\_ficha} + R_{sem\_map})$
- $\%_{sem\_custo} = \frac{R_{sem\_ficha} + R_{sem\_map}}{R_{total}} \times 100$

## Exemplo Numérico
- Vendas totais: R$ 50.000,00 (5.000.000 centavos).
- Vendas com ficha completa: R$ 42.000,00.
- Vendas de produtos sem ficha: R$ 5.000,00.
- Vendas de produtos sem mapeamento: R$ 3.000,00.
- $\%_{sem\_custo} = \frac{8.000,00}{50.000,00} \times 100 = 16,0\%$.
- R$ em risco de margem desconhecida: R$ 8.000,00/mês.

## Aceite e Invariantes
- A soma das partes ($R_{com\_custo} + R_{sem\_ficha} + R_{sem\_map}$) deve ser identicamente igual a $R_{total}$ com zero discrepância de centavos.
