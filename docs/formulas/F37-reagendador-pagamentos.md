# F37 — Reagendador de Pagamentos Flexíveis

## 1. Definição
Algoritmo determinístico de ordenação gulosa que avalia contas a pagar cadastradas como "flexíveis" (fornecedores parceiros, compras sem juros ou vencimentos negociáveis dentro de uma janela $[\text{data\_mín}, \text{data\_máx}]$) e simula o deslocamento dessas despesas para eliminar dias de saldo projetado negativo no fluxo de caixa (F29), sem gerar multas.

## 2. Variáveis
- $P_k$: Conta a pagar $k$ com valor $V_k$, data original $D_k$, janela permitida $[D_{k,\text{mín}}, D_{k,\text{máx}}]$
- $S_t$: Saldo projetado no dia $t$
- $S_{\text{mín}}$: Menor saldo projetado do horizonte
- $D_{\text{neg}}$: Conjunto de dias com saldo projetado $S_t < 0$

## 3. Fórmulas
Para cada dia $t \in D_{\text{neg}}$, apura-se o déficit $d_t = -S_t > 0$.
Filtram-se as contas flexíveis $P_k$ agendadas em dias $d \le t$ cuja janela permita adiamento até $D_{k,\text{máx}} > t$.

Ordenam-se as contas candidatas decrescente por valor $V_k$.
A cada iteração:
- Desloca-se $P_k$ para o primeiro dia após o vale de liquidez $t_{\text{recup}}$ onde $S_{t_{\text{recup}}} > V_k$.
- Recalcula-se a trajetória completa do fluxo de caixa diário.
- Aceita-se o movimento se e somente se:
  1. O número de dias com saldo negativo diminuir; OU
  2. O menor saldo projetado $S_{\text{mín}}$ aumentar (menos negativo).

## 4. Exemplo Numérico Calculado à Mão
- Dia 10: Saldo de abertura R$ 1.000,00. Contas a pagar: Fornecedor A (R$ 2.500,00, flexível até dia 15). Recebimentos previstos: R$ 500,00.
  - Saldo projetado no Dia 10 $= 1.000 + 500 - 2.500 = -\text{R\$} 1.000,00$ (Negativo!).
- Dia 14: Recebimento expressivo de cartões programado: +R$ 8.000,00.
- Algoritmo move Fornecedor A do dia 10 para o dia 14:
  - Novo saldo Dia 10: $+1.500,00$ (Positivo, evita limite de cheque especial/juros de 12% a.m.).
  - Saldo Dia 14: $8.000 - 2.500 = +5.500,00$ (Confortável).

## 5. Limites e Casos de Borda
- Contas inflexíveis (aluguel, folha de pagamento, impostos) nunca são reagendadas.
- O algoritmo não desloca contas para fora do intervalo $[D_{k,\text{mín}}, D_{k,\text{máx}}]$.
