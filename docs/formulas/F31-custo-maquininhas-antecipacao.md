# F31 — Custo das Maquininhas e Custo Efetivo de Antecipação

## 1. Definição Matemática
Avalia o montante real consumido por taxas de intermediação de pagamentos e a taxa de juros real ao antecipar recebíveis.

1. **Taxa Média Ponderada da Operação**:
   $$\bar{t}_{\text{cartão}} = \sum_{m} \text{Participação}_m \times \text{Taxa Nominal}_m$$
   onde $\sum_m \text{Participação}_m = 100\%$ (distribuição por Débito, Crédito à Vista, Crédito Parcelado, PIX e Voucher).
   $$\text{Custo Mensal em R\$} = \text{Faturamento em Cartão} \times \bar{t}_{\text{cartão}}$$

2. **Custo Efetivo Mensal da Antecipação de Recebíveis**:
   Quando a adquirente antecipa um recebível com desconto de tarifa imediata:
   $$i_{\text{antecipação}} = \left( \frac{\text{Valor Nominal}}{\text{Valor Líquido Recebido}} \right)^{\frac{30}{\text{Dias Antecipados}}} - 1$$

## 2. Exemplo Calculado à Mão
- Antecipação de R$ 5.000,00 que venceria em 45 dias. Tarifa cobrada: R$ 250,00.
- Valor líquido recebido $= 5{.}000 - 250 = \text{R\$} 4{.}750{,}00$.
- Razão: $5{.}000 / 4{.}750 \approx 1{,}05263$.
- Expoente: $30 / 45 = 2 / 3 \approx 0{,}66667$.
- Taxa mensal efetiva: $(1{,}05263)^{0{,}66667} - 1 \approx 1{,}0348 - 1 = 3{,}48\%\text{ a.m.}$.
- Conclusão: Equivalente a um empréstimo bancário de 50,8% ao ano.

## 3. Limites e Casos de Borda
- Sem vendas ou taxas cadastradas: Pede que o dono insira as taxas contratadas em Configurações.
- Dias antecipados $\le 0$ ou valor líquido $\le 0$: Erro de domínio.
