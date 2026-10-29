# Fórmula F01 — Simulador "E se?" de Insumo

## Definição
Calcula o impacto financeiro mensal nos pratos e no lucro operacional decorrente da variação percentual ou absoluta no preço unitário de um ou mais insumos, propagando o custo através de sub-receitas aninhadas de forma recursiva (com detecção estrita de ciclos).

## Variáveis
- $p_i$: Custo unitário atual do insumo $i$ na unidade base (em microcentavos).
- $p'_i$: Novo custo unitário simulado do insumo $i$.
- $\Delta p_i = p'_i - p_i$: Variação no custo do insumo.
- $q_{ik}$: Quantidade bruta do insumo $i$ utilizada na ficha técnica do produto $k$ (considerando fatores de correção e sub-receitas).
- $\Delta C_k = \sum_{i} q_{ik} \times \Delta p_i$: Variação no custo unitário de produção da porção do produto $k$.
- $V_k$: Volume médio de vendas mensais do produto $k$ (unidades vendidas no período-base).
- $\Delta Lucro_{mês} = -\sum_{k} (\Delta C_k \times V_k)$: Impacto total no lucro mensal em centavos.

## Exemplo Numérico Calculado à Mão
- Insumo: Queijo Mussarela ($i = 1$). Custo atual: R$ 40,00/kg = R$ 0,04/g (400 microcentavos/g).
- Novo custo simulado: R$ 48,00/kg (+20%) = R$ 0,048/g (480 microcentavos/g).
- Variação $\Delta p_1 = +80$ microcentavos/g = +R$ 0,008/g.
- Prato: Pizza Mussarela ($k = 1$).
  - Quantidade bruta de queijo por pizza: 350g com FC 1.10 = 385g.
  - $\Delta C_1 = 385 \text{ g} \times \text{R\$ } 0,008/\text{g} = \text{R\$ } 3,08$ (308 centavos por pizza).
  - Vendas mensais base ($V_1$): 500 pizzas/mês.
  - Impacto no lucro: $- (308 \text{ centavos} \times 500) = -154.000 \text{ centavos} = -\text{R\$ } 1.540,00/\text{mês}$.

## Limites e Casos de Borda
- Preço simulado $\le 0$: bloqueado pelo domínio com erro de validação.
- Insumo sem consumo em fichas: $\Delta Lucro = 0$, sem pratos afetados.
- Sub-receita circular ($A \to B \to A$): deve lançar `RecipeCycleError` antes de computar.
