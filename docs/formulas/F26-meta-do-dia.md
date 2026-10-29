# Fórmula F26 — Meta do Dia

## Definição
Calcula a meta de vendas diária necessária para que o mês atinja o ponto de equilíbrio e o lucro-alvo planejado, distribuindo o faturamento restante pelos dias operacionais restantes do mês, ponderado pelo peso histórico de cada dia da semana.

## Variáveis
- $CustosFixos_{mês}$: Custos fixos operacionais do mês em centavos.
- $LucroAlvo_{mês}$: Lucro líquido pretendido no mês pelo dono.
- $MC\%_{mês}$: Margem de contribuição média histórica da empresa ($0 < MC\% \le 1$).
- $ReceitaNecessaria_{mês} = \frac{CustosFixos_{mês} + LucroAlvo_{mês}}{MC\%_{mês}}$
- $ReceitaAcumulada$: Vendas já realizadas no mês até ontem.
- $ReceitaRestante = \max(0, ReceitaNecessaria_{mês} - ReceitaAcumulada)$
- $w_d$: Peso histórico de faturamento do dia da semana $d$ ($\sum_{d=0}^6 w_d = 1$).
- $Meta_{hoje} = ReceitaRestante \times \frac{w_{hoje}}{\sum_{t \in DiasRestantes} w_t}$

## Exemplo Numérico
- Custos fixos: R$ 20.000,00. Lucro-alvo: R$ 10.000,00. $MC\% = 60\%$ ($0,60$).
- Receita necessária no mês: $\frac{30.000,00}{0,60} = \text{R\$ } 50.000,00$.
- Faturamento já realizado até dia 20: R$ 38.000,00.
- Restante a faturar: R$ 12.000,00 nos 10 dias restantes.
- Se hoje é sexta-feira e as sextas representam $20\%$ do movimento total da semana, a meta ponderada de hoje é calculada pela proporção exata dos dias restantes.
- A soma das metas de todos os dias restantes totaliza exatamente os R$ 12.000,00 restantes.

## Aceite e Invariantes
- Se a receita acumulada ultrapassar a necessária, a meta restante para o ponto de equilíbrio é zero (operação no azul).
