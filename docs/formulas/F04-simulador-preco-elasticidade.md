# F04 — Simulador de Preço com Elasticidade Informada

## 1. Definição
Mede o impacto de variações de preço no volume de vendas e no lucro bruto da receita, com base no coeficiente de elasticidade-preço da demanda ($\varepsilon$) explicitamente informado pelo gestor. Identifica o preço que maximiza o lucro dentro de um intervalo de varredura discreto.

## 2. Variáveis
- $P_0$: Preço atual de venda (em centavos)
- $CV$: Custo variável por porção (CMV + embalagem + tributos diretos em centavos)
- $V_0$: Volume mensal atual de porções vendidas
- $\varepsilon$: Elasticidade-preço da demanda ($\varepsilon = \frac{\% \Delta Q}{\% \Delta P}$). Sendo bem elástico/normal, $\varepsilon < 0$.
- $\Delta p$: Variação percentual de preço testada ($\frac{P' - P_0}{P_0}$)
- $CF$: Custos fixos do período (permanecem inalterados)

## 3. Fórmulas
$$V' = \max\left(0, V_0 \times (1 + \varepsilon \times \Delta p)\right)$$
$$MC' = P' - CV$$
$$\text{Lucro}' = MC' \times V' - CF$$

Para varredura discreta no intervalo $[-30\%, +50\%]$ com passo de $1\%$:
$$P^* = \arg\max_{P'} \text{Lucro}'(P')$$

## 4. Exemplo Numérico Calculado à Mão
- Preço atual: R$ 30,00 ($3.000$ centavos)
- Custo variável: R$ 12,00 ($1.200$ centavos) -> $MC_0 = 1.800$ centavos
- Volume mensal: $500$ porções -> Lucro bruto de contribuição $= 500 \times 1.800 = 900.000$ centavos (R$ 9.000)
- Elasticidade informada: $\varepsilon = -1,5$
- Teste com aumento de $+10\%$ ($P' = \text{R\$} 33,00$ / $3.300$ centavos):
  - $\Delta p = +0,10$
  - $V' = 500 \times (1 + (-1,5) \times 0,10) = 500 \times (1 - 0,15) = 425$ porções
  - $MC' = 3.300 - 1.200 = 2.100$ centavos
  - Lucro bruto de contribuição $= 425 \times 2.100 = 892.500$ centavos (R$ 8.925,00)
  - Variação do lucro: $-7.500$ centavos (-R$ 75,00).

## 5. Limites e Casos de Borda
- Se $\varepsilon = 0$: a demanda é perfeitamente inelástica; o volume não cai e o lucro cresce linearmente com o preço.
- Se $\varepsilon$ não for fornecido: a função retorna dados insuficientes solicitando ao dono informar $\varepsilon$.
- Se $V' \le 0$: volume é zerado, lucro de contribuição é zero.
