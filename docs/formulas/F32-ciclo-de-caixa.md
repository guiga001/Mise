# F32 — Ciclo Operacional e Ciclo Financeiro (Ciclo de Caixa)

## 1. Definição Matemática
O ciclo financeiro indica quantos dias a operação precisa financiar antes de receber o dinheiro de volta dos clientes:

$$\text{Ciclo Operacional} = \text{PME} + \text{PMR}$$
$$\text{Ciclo Financeiro (Ciclo de Caixa)} = \text{PME} + \text{PMR} - \text{PMP}$$

Onde:
- **PME (Prazo Médio de Estoque)**:
  $$\text{PME} = \frac{\text{Estoque Médio}}{\text{CMV Diário}} = \text{Dias do Período} / \text{Giro de Estoque}$$
- **PMR (Prazo Médio de Recebimento)**:
  $$\text{PMR} = \frac{\text{Saldo Médio de Clientes / Contas a Receber}}{\text{Faturamento Diário}}$$
- **PMP (Prazo Médio de Pagamento a Fornecedores)**:
  $$\text{PMP} = \frac{\text{Saldo Médio de Fornecedores / Contas a Pagar}}{\text{Compras Diárias}}$$

### Necessidade de Capital de Giro (NCG)
$$\text{NCG Estimada em R\$} = \text{Ciclo Financeiro (dias)} \times \text{Custo Operacional Diário}$$

## 2. Exemplo Calculado à Mão
- PME $= 12\text{ dias}$ (insumos ficam em média 12 dias no estoque antes da venda).
- PMR $= 15\text{ dias}$ (média ponderada entre dinheiro/PIX no dia e cartão a receber em 30 dias).
- PMP $= 20\text{ dias}$ (fornecedores concedem média de 20 dias para faturamento).
- Ciclo Financeiro $= 12 + 15 - 20 = 7\text{ dias}$.
- Custo operacional diário $= \text{R\$} 1{.}000{,}00/\text{dia}$.
- NCG $= 7 \times 1{.}000 = \text{R\$} 7{.}000{,}00$ que o restaurante deve manter em reserva para não depender de cheque especial.

## 3. Limites e Casos de Borda
- Reconciliação exata: Se PMP for maior que PME + PMR, o ciclo de caixa é negativo (o restaurante é financiado pelos fornecedores, gerando folga de caixa).
