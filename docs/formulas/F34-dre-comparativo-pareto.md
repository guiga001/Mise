# F34 — DRE Comparativo e Curva de Pareto das Despesas (80/20)

## 1. Definição Matemática
Compara os blocos do DRE gerencial do período atual com o período anterior e calcula o Pareto de despesas operacionais.

### 1. DRE Comparativo
Para cada linha $\ell$ (Receita Bruta, Deduções, Receita Líquida, CMV, Lucro Bruto, Despesas Fixas, Lucro Líquido):
$$\Delta R\$ = \text{Valor}_{\text{atual}} - \text{Valor}_{\text{anterior}}$$
$$\Delta \% = \begin{cases} \frac{\text{Valor}_{\text{atual}} - \text{Valor}_{\text{anterior}}}{|\text{Valor}_{\text{anterior}}|} \times 100\%, & \text{se } \text{Valor}_{\text{anterior}} \ne 0 \\ 0\%, & \text{caso contrário} \end{cases}$$

### 2. Curva de Pareto de Despesas
Ordena as categorias de despesas operacionais em ordem decrescente do valor pago:
$$\text{Gasto Acumulado}_k = \sum_{j=1}^{k} \text{Valor}_j$$
$$\text{Percentual Acumulado}_k = \frac{\text{Gasto Acumulado}_k}{\text{Total de Despesas Operacionais}} \times 100\%$$
Identifica o grupo vital (80% dos gastos concentrados em poucas categorias-chave como Aluguel, Folha e Energia).

## 2. Exemplo Calculado à Mão
- Despesas totais: R$ 20.000,00.
  - Folha de Pagamento: R$ 10.000,00 (50%, acumulado 50%).
  - Aluguel: R$ 4.000,00 (20%, acumulado 70%).
  - Energia/Gás: R$ 2.400,00 (12%, acumulado 82% -> Linha de corte dos 80%).
  - Manutenção: R$ 1.600,00 (8%, acumulado 90%).
  - Outros: R$ 2.000,00 (10%, acumulado 100%).
- Top 3 categorias explicam 82% das saídas de caixa fixas.

## 3. Limites e Casos de Borda
- Soma dos elementos de Pareto bate centavo por centavo com o total de despesas do DRE.
