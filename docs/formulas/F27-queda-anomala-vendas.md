# F27 — Detecção de Queda Anômala de Vendas

## 1. Definição
Monitora o faturamento ou volume de vendas diário comparando-o estritamente com o histórico do mesmo dia da semana (ex: comparar Sexta-feira com as últimas 6 a 12 Sextas-feiras), utilizando estatística robusta (mediana e desvio absoluto da mediana - MAD) para sinalizar quedas graves sem ser afetado por picos eventuais de feriados ou dias atípicos.

## 2. Variáveis
- $x_t$: Faturamento do dia analisado (em centavos)
- $X_{\text{dow}}$: Série histórica de faturamento dos mesmos dias da semana ($d \in \{0, \dots, 6\}$)
- $\tilde{x}$: Mediana da série $X_{\text{dow}}$
- $\text{MAD}$: Desvio Absoluto da Mediana: $\text{mediana}(|x_i - \tilde{x}|)$
- $M_t$: Z-score modificado: $M_t = \frac{0,6745 \times (x_t - \tilde{x})}{\text{MAD}}$
- Limiar de anomalia $\theta$: tipicamente $M_t < -2,5$ ou $-3,0$

## 3. Fórmulas
$$\tilde{x} = \text{mediana}(X_{\text{dow}})$$
$$\text{MAD} = \text{mediana}_{i}(|x_i - \tilde{x}|)$$

Se $\text{MAD} = 0$: utiliza-se o desvio padrão amostral simples $s$ ou alerta percentual direto contra a mediana.
$$M_t = \frac{0,6745 \times (x_t - \tilde{x})}{\text{MAD}}$$

Perda financeira estimada frente à expectativa do dia:
$$\Delta \text{Receita} = \max(0, \tilde{x} - x_t)$$

## 4. Exemplo Numérico Calculado à Mão
- Histórico das últimas 5 sextas-feiras (em reais): $[4.800, 5.000, 5.200, 5.100, 4.900]$.
- Valores ordenados: $[4.800, 4.900, 5.000, 5.100, 5.200]$.
- Mediana $\tilde{x} = 5.000$.
- Desvios da mediana: $[200, 100, 0, 100, 200] \to \text{ordenados}: [0, 100, 100, 200, 200]$.
- $\text{MAD} = 100$.
- Na sexta-feira atual, faturamento foi de R$ 3.200 ($x_t = 3.200$).
- $M_t = \frac{0,6745 \times (3.200 - 5.000)}{100} = \frac{0,6745 \times (-1.800)}{100} = -12,14$.
- Como $-12,14 < -3,0$, anomalia severa confirmada.
- Perda estimada frente ao padrão: R$ 1.800,00 ($180.000$ centavos).

## 5. Limites e Casos de Borda
- Dias cadastrados como fechados ou feriados oficiais não geram alerta falso de queda anômala.
- Requer no mínimo 4 ocorrências históricas do mesmo dia da semana para emitir diagnóstico estatístico de alta confiança.
