# F24 — Cesta de Compra (Análise de Afinidade de Pedidos)

## 1. Definição
Identifica itens vendidos em conjunto frequentemente através de mineração de regras de associação determinísticas (algoritmo Apriori/Market Basket), calculando Suporte, Confiança e Lift para sugerir combos lucrativos (F06).

## 2. Variáveis
- $N$: Total de pedidos/comandas analisados no período
- $N(A)$: Número de pedidos contendo o produto $A$
- $N(B)$: Número de pedidos contendo o produto $B$
- $N(A \cap B)$: Número de pedidos contendo simultaneamente os produtos $A$ e $B$
- $S_{\text{mín}}$: Suporte mínimo exigido (ex: $2\%$ dos pedidos)
- $C_{\text{mín}}$: Confiança mínima exigida (ex: $30\%$)

## 3. Fórmulas
$$\text{Suporte}(A) = \frac{N(A)}{N}$$
$$\text{Suporte}(A, B) = \frac{N(A \cap B)}{N}$$
$$\text{Confiança}(A \to B) = \frac{N(A \cap B)}{N(A)}$$
$$\text{Lift}(A \to B) = \frac{\text{Confiança}(A \to B)}{\text{Suporte}(B)} = \frac{N(A \cap B) \times N}{N(A) \times N(B)}$$

Critério de recomendação:
- Se $\text{Lift} > 1,2$ e $\text{Suporte}(A, B) \ge S_{\text{mín}}$: forte afinidade de compra mútua.
- Se $\text{Lift} = 1$: itens estatisticamente independentes.
- Se $\text{Lift} < 1$: itens substitutos (raramente pedidos juntos).

## 4. Exemplo Numérico Calculado à Mão
- Total de pedidos: $N = 1.000$
- Pedidos com Hambúrguer Artesanal ($A$): $400 \to \text{Suporte} = 40\%$
- Pedidos com Batata Rústica ($B$): $300 \to \text{Suporte} = 30\%$
- Pedidos com Hambúrguer E Batata ($A \cap B$): $240 \to \text{Suporte} = 24\%$
- $\text{Confiança}(A \to B) = \frac{240}{400} = 60\%$ (60% de quem pede hambúrguer pede batata)
- $\text{Lift} = \frac{0,60}{0,30} = 2,00$
- Interpretação: clientes que pedem hambúrguer têm 2 vezes mais chance de pedir batata do que a média geral. Combo altamente indicado.

## 5. Limites e Casos de Borda
- Requer identificador de comanda/pedido (`orderId` ou `ticketId`). Sem identificador de pedido nas vendas, a função reporta dados insuficientes ("Importe dados de vendas contendo número de pedido ou comanda").
- Não divide por zero se $N(A) = 0$ ou $N(B) = 0$.
