# F30 — Quanto Posso Retirar (Retirada Segura de Pró-labore/Lucro)

## 1. Definição Matemática
Determina o montante máximo que o sócio/proprietário pode retirar do caixa hoje sem provocar desencaixe futuro no horizonte de $H$ dias (padrão 30 dias).

$$\text{Retirada Segura} = \max\left(0, \min_{t \in [1, H]} \text{SaldoProjetado}_t - \text{ReservasObrigatórias}\right)$$

Onde:
$$\text{ReservasObrigatórias} = \text{Provisão de Impostos (F35)} + \text{Provisões Trabalhistas (13º/Férias)} + \text{Colchão de Segurança}$$
$$\text{Colchão de Segurança} = \text{Despesa Média Diária} \times N_{\text{dias}}$$

Onde $N_{\text{dias}}$ é configurado pelo dono (padrão recomendado: 7 a 15 dias de despesas operacionais).

## 2. Invariante de Segurança Inegociável
A retirada sugerida nunca pode provocar saldo projetado $< 0$ em nenhum dia do horizonte de planejamento.

## 3. Exemplo Calculado à Mão
- Menor saldo projetado nos próximos 30 dias: R$ 18.000,00 (no dia 20).
- Reservas calculadas:
  - Imposto estimado Simples Nacional a pagar: R$ 3.500,00.
  - Provisão 13º e férias proporcional: R$ 2.000,00.
  - Colchão de 7 dias de despesas (R$ 500/dia): R$ 3.500,00.
  - Total de reservas $= 3{.}500 + 2{.}000 + 3{.}500 = \text{R\$} 9{.}000{,}00$.
- Retirada Segura $= 18{.}000 - 9{.}000 = \text{R\$} 9{.}000{,}00$.
- O dono pode retirar com tranquilidade até R$ 9.000,00 sem correr risco de atrasar contas ou impostos.

## 4. Limites e Casos de Borda
- Se $\min \text{SaldoProjetado}_t < \text{Reservas}$, a Retirada Segura é zero e o painel informa o déficit a ser coberto.
