# F50 — Termômetro do Negócio (Score de Saúde 0 a 100)

## 1. Definição Matemática
Gera um índice ponderado determinístico da saúde operacional e financeira do negócio no mês, sem caixas-pretas:

$$\text{Termômetro} = \frac{\sum_{i=1}^{5} w_i \times S_i}{\sum_{i=1}^{5} w_i \times \mathbb{I}(\text{dado disponível})}$$

Onde $S_i \in [0, 100]$ são 5 pilares normalizados:
1. **CMV Real vs Meta ($w_1 = 30$)**:
   Se $\text{CMV\%} \le \text{Meta}$, score $= 100$.
   Se $\text{CMV\%} > \text{Meta}$, penaliza linearmente: $S_1 = \max(0, 100 - (\text{CMV\%} - \text{Meta}) \times 5)$.
2. **Margem de Segurança do Ponto de Equilíbrio ($w_2 = 25$)**:
   $S_2 = \min(100, \max(0, \text{MargemSegurança\%} \times 2{,}5))$. (40% de margem de segurança dá 100).
3. **Runway de Caixa ($w_3 = 20$)**:
   $S_3 = \min(100, \text{Dias de Caixa Disponível} \times 3{,}33)$. (30 dias de caixa dá 100).
4. **Giro de Estoque ($w_4 = 15$)**:
   Normaliza o giro em relação ao ideal de 2 a 4 giros/mês: $S_4 = \min(100, \text{Giro} \times 33{,}3)$.
5. **Índice de Perdas / Desperdício ($w_5 = 10$)**:
   Se perda $\le 1\%$, score $= 100$; a cada $1\%$ adicional de perda, perde 20 pontos.

Se um pilar não tiver dados suficientes (ex.: meta de CMV ainda não cadastrada), seu peso é retirado do denominador, recalculando a média com transparência.

## 2. Exemplo Calculado à Mão
- CMV Real: 33% (Meta 32%): $S_1 = 100 - (33 - 32) \times 5 = 95$.
- Margem de Segurança: 30%: $S_2 = 30 \times 2{,}5 = 75$.
- Caixa: 20 dias: $S_3 = 20 \times 3{,}33 = 66{,}6$.
- Giro: 2,5 vezes: $S_4 = 83{,}3$.
- Perda: 0,8%: $S_5 = 100$.
- Termômetro $= (30 \times 95 + 25 \times 75 + 20 \times 66{,}6 + 15 \times 83{,}3 + 10 \times 100) / 100$
  $= (2850 + 1875 + 1332 + 1250 + 1000) / 100 = 8307 / 100 \approx 83/100$ (Saúde Boa).
