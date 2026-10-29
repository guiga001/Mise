# F06 — Preço de Combo e Desconto Máximo Seguro

## 1. Definição
Determina o custo total de uma oferta combinada (combo), calcula o preço mínimo aceitável para garantir uma margem mínima estipulada pelo dono e apura o teto de desconto percentual que pode ser concedido sobre a soma dos preços avulsos sem comprometer a rentabilidade.

## 2. Variáveis
- $k$: Lista de itens participantes do combo
- $C_i$: Custo unitário do item $i$ (em centavos)
- $P_i$: Preço avulso regular de venda do item $i$ (em centavos)
- $m_{\text{mín}}$: Margem mínima tolerada para o combo ($0 < m_{\text{mín}} < 1$)
- $d_{\text{escolhido}}$: Desconto percentual que o dono deseja simular ($0 \le d_{\text{escolhido}} < 1$)

## 3. Fórmulas
$$C_{\text{combo}} = \sum_{i \in k} C_i$$
$$P_{\text{avulso\_total}} = \sum_{i \in k} P_i$$
$$P_{\text{mín\_combo}} = \left\lceil \frac{C_{\text{combo}}}{1 - m_{\text{mín}}} \right\rceil$$

Desconto máximo seguro tolerável sobre a soma dos preços avulsos:
$$d_{\text{máx}} = 1 - \frac{P_{\text{mín\_combo}}}{P_{\text{avulso\_total}}}$$

Para um desconto escolhido $d_{\text{escolhido}}$:
$$P_{\text{simulado}} = \lfloor P_{\text{avulso\_total}} \times (1 - d_{\text{escolhido}}) \rfloor$$
$$m_{\text{simulada}} = \frac{P_{\text{simulado}} - C_{\text{combo}}}{P_{\text{simulado}}}$$

## 4. Exemplo Numérico Calculado à Mão
- Item 1 (Hambúrguer): Custo R$ 8,00 ($800$ centavos), Preço avulso R$ 25,00 ($2.500$ centavos)
- Item 2 (Batata Frita): Custo R$ 2,00 ($200$ centavos), Preço avulso R$ 10,00 ($1.000$ centavos)
- Item 3 (Refrigerante): Custo R$ 2,50 ($250$ centavos), Preço avulso R$ 8,00 ($800$ centavos)
- $C_{\text{combo}} = 800 + 200 + 250 = 1.250$ centavos (R$ 12,50)
- $P_{\text{avulso\_total}} = 2.500 + 1.000 + 800 = 4.300$ centavos (R$ 43,00)
- Margem mínima desejada: $50\%$ ($m_{\text{mín}} = 0,50$)
- $P_{\text{mín\_combo}} = \lceil 1.250 / (1 - 0,50) \rceil = 2.500$ centavos (R$ 25,00)
- Desconto máximo $= 1 - 2.500 / 4.300 = 1 - 0,5814 = 41,86\%$
- Se o dono simular desconto de $30\%$:
  - $P_{\text{simulado}} = 4.300 \times 0,70 = 3.010$ centavos (R$ 30,10)
  - Margem simulada $= (3.010 - 1.250) / 3.010 = 1.760 / 3.010 = 58,47\% \ge 50\%$ (Seguro).
- Se simular desconto de $45\%$:
  - $P_{\text{simulado}} = 4.300 \times 0,55 = 2.365$ centavos (R$ 23,65)
  - Margem simulada $= (2.365 - 1.250) / 2.365 = 47,15\% < 50\%$ (Alerta de margem abaixo do mínimo).

## 5. Limites e Casos de Borda
- Se $C_{\text{combo}} \ge P_{\text{avulso\_total}}$: combo com prejuízo mesmo sem desconto.
- Desconto escolhido acima de $d_{\text{máx}}$ gera sinalização clara de margem violada.
