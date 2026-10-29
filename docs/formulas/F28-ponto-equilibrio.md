# Fórmula F28 — Ponto de Equilíbrio (Mês e Dia)

## Definição
Calcula o faturamento monetário necessário para que a margem de contribuição cubra integralmente os custos e despesas fixas da operação (Lucro Operacional = R$ 0,00), a margem de segurança atual e o dia estimado do mês em que a empresa começa a dar lucro.

## Variáveis
- $CustosFixos$: Custos fixos do mês (Aluguel, Folha fixa, Concessionárias, Serviços).
- $MC\% = \frac{ReceitaLiquida - CMV - CustosVariaveis}{ReceitaLiquida}$: Margem de contribuição percentual da mix real de vendas.
- $PontoEquilibrioReais = \frac{CustosFixos}{MC\%}$
- $MargemSegurança\% = \frac{ReceitaRealizada - PontoEquilibrioReais}{ReceitaRealizada} \times 100$
- $FaturamentoMedioDiario = \frac{ReceitaRealizada}{DiasDecorridos}$
- $DiaDoEquilibrio = \left\lceil \frac{PontoEquilibrioReais}{FaturamentoMedioDiario} \right\rceil$

## Exemplo Numérico
- Custos fixos mensais: R$ 30.000,00 (3.000.000 centavos).
- Margem de contribuição apurada no mês: 60% ($0,60$).
- $PE = \frac{30.000,00}{0,60} = \text{R\$ } 50.000,00$.
- Faturamento médio: R$ 2.500,00/dia.
- $DiaDoEquilibrio = \lceil 50.000 / 2.500 \rceil = \text{Dia } 20\text{ do mês}$.
- A partir do dia 21, cada real de margem de contribuição vai direto para o lucro líquido do dono.

## Aceite e Invariantes
- Se $MC\% \le 0$: emite erro de domínio explícito ("Sua margem de contribuição é negativa; os preços praticados não cobrem os custos variáveis").
