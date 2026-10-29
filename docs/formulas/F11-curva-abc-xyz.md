# F11 — Curva ABC × XYZ

## 1. Definição Matemática
Combina o impacto financeiro (ABC) com a previsibilidade de demanda (XYZ) em uma matriz $3 \times 3$.
1. **Classificação ABC (Valor Monetário Consumido)**:
   - Ordena os itens por gasto total no período em ordem decrescente.
   - Calcula o percentual acumulado do gasto.
   - **Classe A**: Até 80% do valor acumulado (itens de alto impacto).
   - **Classe B**: De 80% até 95% do valor acumulado (impacto moderado).
   - **Classe C**: Restante de 95% a 100% (impacto pulverizado).
2. **Classificação XYZ (Variabilidade / Coeficiente de Variação)**:
   $$CV = \frac{\sigma_d}{\mu_d}$$
   - **Classe X**: $CV < 0{,}50$ (consumo regular, alta previsibilidade).
   - **Classe Y**: $0{,}50 \le CV \le 1{,}00$ (consumo com flutuações sazonais/moderadas).
   - **Classe Z**: $CV > 1{,}00$ (consumo espasmódico, alta incerteza).

## 2. Recomendações Determinísticas da Matriz 3x3
- **AX**: Alta prioridade financeira, fácil previsão. Parcerias com fornecedores, reposição JIT, margem de segurança enxuta.
- **AY**: Alta prioridade financeira, variação moderada. Monitoramento semanal, estoques de segurança dimensionados.
- **AZ**: Alta prioridade financeira e altíssima incerteza. Risco de ruptura e sobra; compras sob demanda estrita e revisão diária.
- **BX / BY / BZ**: Controle periódico padrão (quinzenal/mensal).
- **CX / CY**: Reposição simplificada por kanban visual e lote econômico padrão.
- **CZ**: Itens secundários de consumo esporádico. Não estocar; comprar apenas quando houver encomenda.

## 3. Exemplo Calculado à Mão
- Item 1: Gasto R$ 8.000 (80%), $\mu = 100$, $\sigma = 20 \implies CV = 0{,}20 \implies \mathbf{AX}$.
- Item 2: Gasto R$ 1.500 (15%), $\mu = 20$, $\sigma = 16 \implies CV = 0{,}80 \implies \mathbf{BY}$.
- Item 3: Gasto R$ 500 (5%), $\mu = 5$, $\sigma = 8 \implies CV = 1{,}60 \implies \mathbf{CZ}$.
- Classificação exata: 1 em AX, 1 em BY, 1 em CZ.

## 4. Limites e Casos de Borda
- Consumo médio $\mu = 0$: $CV = 0$, classificado como Z se houver histórico esporádico ou sem dados suficientes.
- Todo item cai em exatamente um único quadrante.
