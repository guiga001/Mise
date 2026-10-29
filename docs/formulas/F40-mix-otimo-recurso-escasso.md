# F40 — Mix Ótimo com Recurso Escasso (Mochila Fracionária / Otimização Linear)

## 1. Definição
Maximiza a margem de contribuição total da cozinha ou salão quando a produção é limitada por um recurso físico escasso (ex: horas de forno de pizza, capacidade da masseira, tempo de fritadeira, ou capacidade máxima de assentos por hora). Utiliza o algoritmo guloso da Mochila Fracionária clássico (ordenando por Margem de Contribuição por unidade de recurso consumido), respeitando o teto de demanda previsto para cada produto.

## 2. Variáveis
- $x_i$: Quantidade a produzir do produto $i$ (em unidades)
- $MC_i$: Margem de contribuição unitária do produto $i$ ($P_i - CV_i$ em centavos)
- $a_i$: Consumo do recurso escasso por unidade do produto $i$ (ex: minutos de forno)
- $b$: Capacidade total disponível do recurso escasso (ex: $600$ minutos de forno no turno)
- $D_i$: Demanda máxima esperada no período para o produto $i$
- $r_i$: Eficiência marginal do recurso: $r_i = \frac{MC_i}{a_i}$ (centavos por minuto de recurso)

## 3. Fórmulas
Problema de Otimização:
$$\max \sum_{i=1}^n MC_i \cdot x_i$$
Sujeito a:
$$\sum_{i=1}^n a_i \cdot x_i \le b$$
$$0 \le x_i \le D_i, \quad x_i \in \mathbb{Z}_{\ge 0}$$

Algoritmo de Solução Gulosa:
1. Ordenar todos os produtos decrescente por $r_i = \frac{MC_i}{a_i}$.
2. Para cada produto $i$ ordenado:
   - Quantidade máxima viável pela capacidade restante: $q_{\text{disp}} = \lfloor \frac{b_{\text{restante}}}{a_i} \rfloor$.
   - Quantidade alocada: $x_i^* = \min(D_i, q_{\text{disp}})$.
   - Atualiza capacidade restante: $b_{\text{restante}} \leftarrow b_{\text{restante}} - (x_i^* \cdot a_i)$.
3. Lucro ótimo obtido: $\text{Lucro}^* = \sum_{i} MC_i \cdot x_i^*$.
4. Ganho frente ao mix ingênuo atual: $\Delta \text{Lucro} = \text{Lucro}^* - \text{Lucro}_{\text{atual}}$.

## 4. Exemplo Numérico Calculado à Mão
- Recurso: Tempo de Forno $= 300$ minutos de operação.
- Produto A (Pizza Margherita Especial):
  - Preço: R$ 50,00, Custo: R$ 15,00 $\to MC = \text{R\$} 35,00$ ($3.500$ centavos).
  - Tempo de forno: $5$ minutos $\to r_A = 3.500 / 5 = 700$ centavos/minuto.
  - Demanda: $40$ unidades.
- Produto B (Pão Italiano Recheado):
  - Preço: R$ 30,00, Custo: R$ 6,00 $\to MC = \text{R\$} 24,00$ ($2.400$ centavos).
  - Tempo de forno: $4$ minutos $\to r_B = 2.400 / 4 = 600$ centavos/minuto.
  - Demanda: $50$ unidades.
- Alocação:
  - 1º aloca Produto A ($r_A = 700$): produz $40$ unidades $\to$ consome $40 \times 5 = 200$ minutos. Sobram $100$ minutos.
  - 2º aloca Produto B ($r_B = 600$): capacidade restante $= 100$ minutos $\to \lfloor 100 / 4 \rfloor = 25$ unidades (demanda era 50).
- Mix ótimo: $40$ Pizzas A + $25$ Pães B.
- Margem de contribuição total gerada:
  - $40 \times 35,00 + 25 \times 24,00 = 1.400 + 600 = \text{R\$} 2.000,00$ ($200.000$ centavos).

## 5. Limites e Casos de Borda
- Se $a_i \le 0$: recurso não é consumido (sem restrição).
- Se a capacidade total for suficiente para cobrir 100% da demanda de todos os itens, a solução ótima atende toda a demanda sem gargalo.
