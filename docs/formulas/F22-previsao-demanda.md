# F22 — Previsão de Demanda Determinística (Rolling-Origin Backtest)

## 1. Definição Matemática
Gera previsões diárias por produto e loja avaliando três modelos matemáticos clássicos:
1. **Média por Dia da Semana**:
   $$\hat{y}_{t} = \frac{1}{|K_w|} \sum_{k \in K_w} y_k$$
   onde $K_w$ são as semanas históricas para o mesmo dia da semana $w$.
2. **Suavização Exponencial Simples (EWMA)**:
   $$S_t = \alpha y_t + (1 - \alpha) S_{t-1}, \quad \alpha \in [0{,}1, 0{,}5]$$
3. **Holt-Winters Sazonal Semanal Aditivo (período $m = 7$)**:
   $$\ell_t = \alpha (y_t - s_{t-m}) + (1 - \alpha)(\ell_{t-1} + b_{t-1})$$
   $$b_t = \beta (\ell_t - \ell_{t-1}) + (1 - \beta) b_{t-1}$$
   $$s_t = \gamma (y_t - \ell_t) + (1 - \gamma) s_{t-m}$$
   $$\hat{y}_{t+h} = \ell_t + h b_t + s_{t+h-m}$$

## 2. Seleção de Modelo via Rolling-Origin Backtest
A série histórica é avaliada dividindo os dados em janelas deslizantes (sem usar o futuro).
Para cada corte $t \ge \text{warmup}$, treina-se com dados até $t$ e prevê-se $t+1$.
Calcula-se o RMSE (*Root Mean Squared Error*) e MAPE (*Mean Absolute Percentage Error*):
$$\text{RMSE} = \sqrt{\frac{1}{N} \sum (y_i - \hat{y}_i)^2}$$
$$\text{MAPE} = \frac{100\%}{N} \sum \frac{|y_i - \hat{y}_i|}{\max(y_i, 1)}$$

O modelo com menor RMSE no backtest é selecionado para gerar a projeção futura.
O intervalo de confiança a 95% é dado por:
$$[\max(0, \hat{y} - 1{,}96 \times \text{RMSE}), \hat{y} + 1{,}96 \times \text{RMSE}]$$

## 3. Exemplo Calculado à Mão
- Série perfeitamente periódica de 14 dias (padrão semanal constante):
  - $y = [10, 10, 15, 20, 40, 50, 15, 10, 10, 15, 20, 40, 50, 15]$.
  - Modelo sazonal semanal captura exatamente a periodicidade.
  - No backtest, o erro da média semanal para a 2ª semana é $\text{RMSE} = 0$.
  - Previsão para a 3ª semana: exatamente idêntica ao histórico.

## 4. Limites e Casos de Borda
- Mínimo de 14 dias de vendas para estimativa preliminar, ideal $\ge 28$ dias para Holt-Winters. Se houver menos de 14 dias: retorna "dados insuficientes (mínimo 14 dias)".
- Vendas zero: Tratadas no denominador do MAPE com $\max(y_i, 1)$, impedindo divisão por zero.
- Série constante ($c, c, c$): Todos os modelos convergem para previsão exata $c$ com RMSE $= 0$.
