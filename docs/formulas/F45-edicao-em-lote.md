# F45 — Edição em Lote e Planilha Rápida com Histórico e Desfazer

## 1. Definição
Permite reajustar em massa preços de venda de receitas, custos de insumos ou margens-alvo por filtros de categoria ou fornecedor (por percentual, acréscimo fixo em centavos ou aplicação de terminação comercial como ,90), gerando uma simulação prévia determinística do impacto na margem líquida e no faturamento mensal antes da confirmação, garantindo histórico de reversão atômica (desfazer/undo completo).

## 2. Variáveis
- $I$: Conjunto de itens selecionados para a edição em lote
- $v_{\text{atual}, j}$: Valor atual do item $j$ (preço de venda ou custo unitário em centavos)
- $\Delta\%$: Variação percentual solicitada (ex: $+8,5\%$)
- $\Delta\text{fixo}$: Acréscimo monetário fixo (em centavos)
- $R_{\text{comercial}}$: Regra de arredondamento comercial (ex: forçar final ,90)
- $V_j$: Volume de vendas mensal do prato $j$

## 3. Fórmulas
Para cada item $j \in I$:
Cálculo base do novo valor:
$$v_{\text{base}, j} = \left\lfloor v_{\text{atual}, j} \times \left(1 + \frac{\Delta\%}{100}\right) \right\rfloor + \Delta\text{fixo}$$

Aplicação do final comercial (,90):
Se ativo:
$$R = \lfloor v_{\text{base}, j} / 100 \rfloor \times 100 + 90$$
$$v_{\text{novo}, j} = \begin{cases} R, & \text{se } R \ge v_{\text{base}, j} \\ R + 100, & \text{caso contrário} \end{cases}$$

Impacto projetado de faturamento mensal no prato:
$$\Delta \text{ReceitaMensal} = \sum_{j} (v_{\text{novo}, j} - v_{\text{atual}, j}) \times V_j$$

Estado de reversão (SnapUndo):
$$\text{Snapshot} = \{ \text{timestamp}, \text{itens}: [ \{ j, v_{\text{anterior}} \} ] \}$$
A execução do desfazer restaura exatamente o valor anterior de cada item com registro no `AuditLog`.

## 4. Exemplo Numérico Calculado à Mão
- Item 1: Pizza Calabresa, Preço atual R$ 42,00 ($4.200$ centavos), Vendas $= 100$ un/mês.
- Item 2: Pizza 4 Queijos, Preço atual R$ 48,00 ($4.800$ centavos), Vendas $= 80$ un/mês.
- Reajuste em lote da categoria Pizzas: $+10\%$ com final comercial ,90.
  - Item 1: $4.200 \times 1,10 = 4.620 \to$ com final ,90 vira R$ 46,90 ($4.690$ centavos).
    - Variação por unidade: $+490$ centavos (R$ 4,90). Impacto mensal: $100 \times 4,90 = \text{R\$} 490,00$.
  - Item 2: $4.800 \times 1,10 = 5.280 \to$ com final ,90 vira R$ 52,90 ($5.290$ centavos).
    - Variação por unidade: $+490$ centavos. Impacto mensal: $80 \times 4,90 = \text{R\$} 392,00$.
  - Ganho total mensal projetado: $\text{R\$} 882,00$ ($88.200$ centavos).

## 5. Limites e Casos de Borda
- O novo preço nunca pode ser menor ou igual a zero.
- Reverter uma operação restaura fielmente o estado anterior sem resíduos.
