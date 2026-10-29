# F29 — Fluxo de Caixa Projetado com 3 Cenários

## 1. Definição Matemática
Projeta o saldo diário de caixa para os próximos $H$ dias (padrão: 30 dias) partindo do saldo real atual:

$$\text{Saldo}_t = \text{Saldo}_{t-1} + \text{Recebimentos Previstos}_t - \text{Pagamentos Agendados}_t$$

Onde:
- $\text{Recebimentos Previstos}_t = \text{Recebíveis a Vencer}_t + \text{Projeção de Vendas à Vista}_t$.
- $\text{Pagamentos Agendados}_t = \text{Contas a Pagar na data } t$.

### Três Cenários Determinísticos
Com base em variação de faturamento $x\%$ informada pelo dono (padrão $\pm 15\%$):
1. **Cenário Base**: Vendas projetadas normais ($+0\%$).
2. **Cenário Conservador (Estresse)**: Vendas projetadas $-x\%$.
3. **Cenário Otimista**: Vendas projetadas $+x\%$.

Para cada cenário, calcula-se:
- Menor saldo projetado e a data em que ocorre ($\min_t \text{Saldo}_t$).
- Data do primeiro saldo negativo (se houver), permitindo ação preventiva com $K$ dias de antecedência.

## 2. Exemplo Calculado à Mão
- Saldo atual em $t=0$: R$ 10.000,00.
- $t=1$: Recebimentos R$ 2.000,00, Pagamentos R$ 1.500,00 $\implies$ Saldo R$ 10.500,00.
- $t=2$: Recebimentos R$ 1.000,00, Pagamentos R$ 12.000,00 (aluguel + folha) $\implies$ Saldo R$ -500,00.
- Alerta em $t=0$: Saldo negativo previsto em 2 dias (R$ -500,00).

## 3. Limites e Casos de Borda
- Cenário $-0\%$ é matematicamente idêntico ao Cenário Base.
- Pagamentos com status `PAID` não são debitados novamente na projeção futura.
