# F23 — Mapa de Vendas (Dia da Semana × Faixa Horária)

## 1. Definição Matemática
Mapeia a distribuição do faturamento bruto e volume de pedidos em uma matriz $7 \times 24$ (7 dias da semana $\times$ 24 horas do dia), ou agrupado em turnos operacionais (Almoço, Tarde, Jantar, Madrugada).

$$\text{Matriz}[d, h] = \sum_{p \in \text{Pedidos do dia } d \text{ na hora } h} \text{Faturamento}(p)$$

Propriedade de Conservação Estrita:
$$\sum_{d=0}^{6} \sum_{h=0}^{23} \text{Matriz}[d, h] \equiv \text{Faturamento Total do Período}$$

Identifica:
- Horários de Pico (Top 3 faixas horárias de maior receita).
- Horários Ociosos (Faixas com equipe ativa e baixa geração de receita).
- Comparativo semana a semana no mesmo dia e horário.

## 2. Exemplo Calculado à Mão
- Período com 2 pedidos:
  - Pedido 1: Sexta-feira às 19:30, R$ 120,00.
  - Pedido 2: Sexta-feira às 20:15, R$ 180,00.
- Matriz[Sexta, 19h] $= 12{.}000\text{ centavos}$.
- Matriz[Sexta, 20h] $= 18{.}000\text{ centavos}$.
- Soma total $= 30{.}000\text{ centavos} = \text{R\$} 300{,}00$, exatamente igual à soma dos pedidos.

## 3. Limites e Casos de Borda
- Se a importação de vendas não contiver carimbo de hora (apenas data): os valores são acumulados no dia e o sistema sinaliza que o dado de hora não foi fornecido pelo canal/POS.
