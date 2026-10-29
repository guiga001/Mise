# F18 — Custo Efetivo de Prazo

## 1. Definição Matemática
Avalia se compensa pagar um fornecedor à vista com desconto $d$ ou pagar a prazo em $n$ dias.
A taxa de juros implícita mensal do financiamento comercial é obtida pela capitalização composta comercial:

$$i_{\text{mensal}} = \left(\frac{1}{1 - d}\right)^{\frac{30}{n}} - 1$$

Onde:
- $d$: Desconto à vista como fração decimal (ex.: $3\% = 0{,}03$).
- $n$: Prazo de pagamento em dias (ex.: $28\text{ dias}$).
- Compara-se $i_{\text{mensal}}$ com o rendimento mensal de oportunidade do caixa do restaurante ($i_{\text{caixa}}$).

## 2. Decisão Racional
- Se $i_{\text{mensal}} > i_{\text{caixa}}$: **Compensa pagar à vista**, pois o custo de abrir mão do desconto é superior ao rendimento do dinheiro em caixa.
- Se $i_{\text{mensal}} \le i_{\text{caixa}}$: **Compensa pagar a prazo**, preservando o capital de giro.

## 3. Exemplo Calculado à Mão
- Fatura de R$ 10.000,00. Desconto de 3% à vista ($d = 0{,}03$) ou pagamento líquido em 28 dias ($n = 28$).
- $1 / (1 - 0{,}03) = 1 / 0{,}97 \approx 1{,}030928$.
- Expoente: $30 / 28 \approx 1{,}071429$.
- $i_{\text{mensal}} = (1{,}030928)^{1{,}071429} - 1 \approx 1{,}03322 - 1 = 3{,}32\%\text{ ao mês}$.
- Como o rendimento de caixa é ~1% ao mês, a taxa de 3,32% a.m. é alta; portanto, compensa pagar à vista e capturar R$ 300,00 de economia imediata.

## 4. Limites e Casos de Borda
- Se $d = 0$, $i_{\text{mensal}} = 0\%$.
- Se $n \le 0$ ou $d \ge 1$: Erro de domínio.
