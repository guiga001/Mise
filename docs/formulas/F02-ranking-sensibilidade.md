# Fórmula F02 — Quem Manda no Seu Lucro (Ranking de Sensibilidade)

## Definição
Mede a sensibilidade do lucro mensal a uma variação de +10% no custo unitário de cada insumo utilizado nas fichas técnicas, ordenando do maior impacto financeiro para o menor.

## Variáveis
- $GastoMensal_i = \sum_{k} (q_{ik} \times V_k \times p_i)$: Gasto total mensal teórico com o insumo $i$.
- $Impacto_{10\%, i} = 0,10 \times GastoMensal_i$: Perda monetária no lucro mensal caso o insumo suba 10%.
- $CMV_{teorico} = \sum_i GastoMensal_i$: Soma dos gastos de todos os insumos.

## Exemplo Numérico Calculado à Mão
- Insumo 1: Carne Moída ($p_1 = \text{R\$ } 35,00/\text{kg}$). Consumo total no mês: 200 kg.
  - $GastoMensal_1 = 200 \times 35,00 = \text{R\$ } 7.000,00$.
  - $Impacto_{10\%, 1} = 0,10 \times 7.000,00 = \text{R\$ } 700,00/\text{mês}$.
- Insumo 2: Orégano ($p_2 = \text{R\$ } 60,00/\text{kg}$). Consumo total no mês: 1 kg.
  - $GastoMensal_2 = 1 \times 60,00 = \text{R\$ } 60,00$.
  - $Impacto_{10\%, 2} = 0,10 \times 60,00 = \text{R\$ } 6,00/\text{mês}$.
- Ranking: Carne Moída fica em 1º (R$ 700/mês em risco), Orégano em 2º (R$ 6/mês).

## Limites e Casos de Borda
- Soma dos $GastoMensal_i$ para todos os insumos deve ser idêntica ao CMV teórico do período (tolerância de arredondamento $\le 1$ centavo).
- Se não houver histórico de vendas no período: status `DADOS_INSUFICIENTES` com aviso pedindo importação de vendas.
