# F15 — Preço Mínimo de Liquidação

## 1. Definição Matemática
Quando um insumo está prestes a vencer (identificado em F14) ou com alto risco de descarte, o restaurante pode criar promoções relâmpago ou combos. A economia financeira define dois pisos estritos:

1. **Piso de Recuperação de Caixa (Custo Marginal Afundado)**:
   O insumo já foi pago e não pode ser devolvido (custo afundado / *sunk cost*). Para não perder 100% do valor, o preço deve cobrir apenas os **outros** custos variáveis adicionais (embalagem, outros ingredientes frescos adicionados no preparo, comissões de canal e impostos variáveis):
   $$\text{Piso Recuperação} = \frac{\text{Custo Variável Adicional} + \text{Embalagem}}{1 - \text{Comissão} - \text{Taxa} - \text{Imposto}}$$
   Qualquer venda acima desse piso gera margem de contribuição positiva sobre o que seria perda total.

2. **Piso de Não Prejuízo Contábil Total**:
   Cobre todos os insumos (incluindo o insumo em risco pelo seu custo original) e deduções:
   $$\text{Piso Contábil} = \frac{\text{Custo Total da Ficha} + \text{Embalagem}}{1 - \text{Comissão} - \text{Taxa} - \text{Imposto}}$$

## 2. Exemplo Calculado à Mão
- Prato: Sobremesa de Morango com Chantilly.
- Insumo em risco: Morango fresco (custo na porção = R$ 4,00).
- Outros insumos (creme, açúcar, embalagem) $= \text{R\$} 2{,}50$.
- Deduções variáveis: 10% (5% imposto + 5% maquininha).
- Denominador $= 1 - 0{,}10 = 0{,}90$.
- **Piso de Recuperação**: $2{,}50 / 0{,}90 \approx \text{R\$} 2{,}78$. Vender a R$ 3,00 recupera R$ 0,20 do morango que iria para o lixo.
- **Piso Contábil Total**: $(4{,}00 + 2{,}50) / 0{,}90 = 6{,}50 / 0{,}90 \approx \text{R\$} 7{,}22$.

## 3. Limites e Casos de Borda
- Vender abaixo do Piso de Recuperação é estritamente pior do que jogar fora (gera prejuízo em caixa).
- Se deduções $\ge 100\%$, denominador $\le 0$: erro de domínio ("Deduções inviabilizam qualquer preço").
