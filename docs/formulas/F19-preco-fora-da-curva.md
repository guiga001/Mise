# F19 — Preço Fora da Curva (Modified Z-Score via Mediana e MAD)

## 1. Definição Matemática
Detecta compras com preços anormalmente altos em relação ao histórico de aquisições do mesmo insumo.
Em distribuições de compras com poucos dados ou oscilações agudas, a média e o desvio padrão sofrem grande distorção. Por isso, adota-se o Z-Score Modificado de Boris Iglewicz e David Hoaglin (1993):

$$M_i = \frac{0{,}6745 \times (x_i - \tilde{x})}{\text{MAD}}$$

Onde:
- $x_i$: Preço unitário pago na compra analisada em microcentavos por unidade base.
- $\tilde{x}$: Mediana dos preços históricos de compra do insumo.
- $\text{MAD} = \text{mediana}(|x_k - \tilde{x}|)$.
- Se $M_i > 3{,}5$ (limiar estatístico conservador), a compra é classificada como **Preço Fora da Curva**.
- Valor pago a mais em centavos:
  $$\text{Excesso em R\$} = \max(0, x_i - \tilde{x}) \times \text{Quantidade Comprada}$$

## 2. Exemplo Calculado à Mão
- Compras históricas de Queijo Prato (R\$/kg): $[38{,}00, 39{,}00, 40{,}00, 41{,}00, 42{,}00]$.
- Nova compra registrada: $x_i = 58{,}00$. Quantidade: $10\text{ kg}$.
- Mediana histórica $\tilde{x} = 40{,}00$. Desvios: $[2, 1, 0, 1, 2]$. MAD $= 1{,}00$.
- $M_i = 0{,}6745 \times (58{,}00 - 40{,}00) / 1{,}00 = 0{,}6745 \times 18 = 12{,}14$.
- Como $12{,}14 > 3{,}5$, alerta crítico ativado!
- Preço excedente: $(58{,}00 - 40{,}00) \times 10 = \text{R\$} 180{,}00 = 18{.}000\text{ centavos}$.

## 3. Limites e Casos de Borda
- Se $\text{MAD} = 0$ (todos os preços anteriores foram idênticos):
  - Se $x_i == \tilde{x} \implies M_i = 0$.
  - Se $x_i \ne \tilde{x} \implies$ usa-se a diferença absoluta percentual: se $(x_i - \tilde{x}) / \tilde{x} > 0{,}10$, alerta por variação estrita. Não há divisão por zero.
