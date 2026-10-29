# F38 — Planejamento de Produção e Explosão de Sub-receitas

## 1. Definição
Determina as ordens de produção necessárias para suprir a demanda prevista (F22) ou estoques mínimos de produtos acabados e intermediários (sub-receitas como molhos, massas, recheios e caldos), calculando a necessidade líquida, arredondando ao tamanho de lote ou batelada do equipamento, e realizando a explosão recursiva (BOM - Bill of Materials) até os insumos básicos de compra para confrontar com o saldo em estoque.

## 2. Variáveis
- $D_r$: Demanda prevista do produto final ou sub-receita $r$ (em porções)
- $S_r$: Saldo físico atual em estoque (em porções)
- $P_r$: Quantidade já em processo de produção aberta (em porções)
- $B_r$: Tamanho do lote padrão/batelada de produção (ex: 20 porções por tacho)
- $Q_{i,r}$: Quantidade bruta do insumo $i$ por porção de $r$ ($q_{\text{líq}} \times \text{FC}$)

## 3. Fórmulas
Necessidade líquida de porções:
$$N_r = \max(0, D_r - S_r - P_r)$$

Número de lotes a programar:
$$L_r = \left\lceil \frac{N_r}{B_r} \right\rceil$$
$$\text{ProduçãoTotal}_r = L_r \times B_r$$

Explosão da árvore de componentes (recursiva):
Para cada insumo primário $i$:
$$\text{NecessidadeTotal}_i = \sum_{r} \text{ProduçãoTotal}_r \times \text{ConsumoUnitário}(r, i)$$
Se $\text{NecessidadeTotal}_i > S_i$, apura-se a ruptura de insumo e gera-se sugestão imediata de compra (F17).

## 4. Exemplo Numérico Calculado à Mão
- Prato Final: Lasanha Bolonhesa. Previsão de vendas para o fim de semana $= 50$ unidades.
- Saldo atual: $10$ lasanhas prontas. Em produção: $0$.
- Necessidade líquida $= 50 - 10 = 40$ lasanhas.
- Cada lasanha consome $200$ g de Molho Bolonhesa (sub-receita).
- Necessidade de molho $= 40 \times 200 = 8.000$ g.
- O molho é produzido em tachos de $5.000$ g ($B_{\text{molho}} = 5.000$).
- Lotes de molho: $\lceil 8.000 / 5.000 \rceil = 2$ tachos ($10.000$ g de molho total).
- O molho consome carne moída ($700$ g/kg de molho). Para $10.000$ g de molho $= 7.000$ g de carne moída necessária.
- Confronto: Estoque de carne moída tem $5.000$ g $\to$ Faltam $2.000$ g de carne para conseguir rodar a produção planejada.

## 5. Limites e Casos de Borda
- Detecta e previne ciclos recursivos na árvore de fichas técnicas (lança `RecipeCycleError`).
- Batelada com tamanho zero ou negativo gera erro de validação.
