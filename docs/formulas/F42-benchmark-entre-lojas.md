# F42 — Benchmark Entre Lojas e Ganho Financeiro Potencial

## 1. Definição
Realiza a comparação sistemática entre lojas de uma mesma empresa sobre indicadores-chave de desempenho (CMV%, CMO%, Margem Líquida%, Ticket Médio e Perdas de Estoque%), calculando o desvio mediano robusto (MAD) e quantificando o valor monetário em R$/mês que cada filial ganharia caso alcançasse o índice da loja mais eficiente do grupo.

## 2. Variáveis
- $K$: Indicador analisado (ex: CMV%, onde menor é melhor; ou Ticket Médio, onde maior é melhor)
- $I_{s, K}$: Valor do indicador $K$ na loja $s$
- $F_s$: Faturamento mensal da loja $s$ (em centavos)
- $I_{\text{ótimo}, K}$: Melhor indicador registrado entre todas as lojas no período:
  - Para CMV%, CMO%, Perdas: $I_{\text{ótimo}} = \min_{s} I_{s}$
  - Para Margem Líquida%, Ticket Médio: $I_{\text{ótimo}} = \max_{s} I_{s}$
- $\text{Mediana}_K$: Mediana do indicador entre todas as lojas
- $\text{MAD}_K$: Desvio absoluto da mediana

## 3. Fórmulas
Para cada loja $s$:
Diferença de eficiência percentual frente à melhor loja:
$$\Delta I_{s, K} = |I_{s, K} - I_{\text{ótimo}, K}|$$

Impacto financeiro mensal gerado pelo gap:
$$\text{GapFinanceiroEmCentavos}_{s, K} = \left\lfloor F_s \times \frac{\Delta I_{s, K}}{100} \right\rfloor$$

Total de oportunidade de captura se todas as filiais igualassem a matriz/loja-modelo:
$$\text{PotencialTotal} = \sum_{s} \text{GapFinanceiroEmCentavos}_{s, K}$$

## 4. Exemplo Numérico Calculado à Mão
- Loja 1 (Matriz): Faturamento R$ 100.000,00, CMV $= 30,0\%$ (Melhor loja)
- Loja 2 (Shopping): Faturamento R$ 80.000,00, CMV $= 34,5\%$
- Loja 3 (Bairro): Faturamento R$ 60.000,00, CMV $= 36,0\%$
- Análise de CMV:
  - Melhor loja: Loja 1 com $30,0\%$.
  - Gap da Loja 2: $34,5\% - 30,0\% = 4,5\%$.
    - Ganho mensal se igualasse a Matriz: $80.000 \times 4,5\% = \text{R\$} 3.600,00$ ($360.000$ centavos).
  - Gap da Loja 3: $36,0\% - 30,0\% = 6,0\%$.
    - Ganho mensal se igualasse a Matriz: $60.000 \times 6,0\% = \text{R\$} 3.600,00$ ($360.000$ centavos).
- Oportunidade total consolidada de redução de desperdício/custo: R$ 7.200,00/mês ($720.000$ centavos).

## 5. Limites e Casos de Borda
- Se a empresa possui apenas 1 loja cadastrada, a função retorna dados insuficientes com a mensagem: "O benchmark comparativo requer ao menos duas lojas cadastradas".
- Indicadores sem movimentação na loja são devidamente sinalizados.
