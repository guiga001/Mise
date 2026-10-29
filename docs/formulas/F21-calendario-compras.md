# F21 — Calendário de Compras por Fornecedor

## 1. Definição
Determina a data-limite exata para emissão de cada pedido de compra a partir da data em que o estoque atingirá o ponto de pedido (F10/F17), do tempo de entrega (lead time em dias corridos ou úteis) e dos dias específicos de corte/pedidos estipulados por cada fornecedor.

## 2. Variáveis
- $T_{\text{nec}}$: Data de necessidade física do insumo (quando o estoque atinge o nível de segurança $SS$)
- $L$: Lead time do fornecedor (em dias)
- $D_{\text{corte}}$: Dias da semana em que o fornecedor aceita pedidos (ex: Segundas e Quintas)
- $H_{\text{corte}}$: Horário limite no dia de corte (ex: até 14:00)

## 3. Fórmulas
A data teórica de disparo é:
$$T_{\text{teorica}} = T_{\text{nec}} - L \text{ dias}$$

Se $T_{\text{teorica}}$ não coincidir com um dia aceito em $D_{\text{corte}}$, retrocede-se até o último dia de corte anterior:
$$T_{\text{limite}} = \max \{ d \in D_{\text{corte}} \mid d \le T_{\text{teorica}} \}$$

Se a data atual $T_{\text{atual}} > T_{\text{limite}}$, o pedido está em estado de atraso/risco de ruptura.

## 4. Exemplo Numérico Calculado à Mão
- Insumo: Queijo Mussarela. Saldo atual dura até Sexta-feira dia 20.
- Fornecedor Laticínios da Serra: Lead time $L = 2$ dias.
- Dias de pedido aceitos: Terça-feira e Quinta-feira.
- Data teórica de necessidade do pedido $= 20 - 2 = 18$ (Quarta-feira).
- Como quarta-feira não é dia de corte do fornecedor, recua-se para o dia anterior de corte: Terça-feira dia 17.
- Mensagem ao dono: "Emitir pedido até Terça-feira dia 17 para entrega garantida antes do estoque esgotar na Sexta dia 20".

## 5. Limites e Casos de Borda
- Fornecedor sem lead time cadastrado: gera status de dados insuficientes ("Informe o lead time do fornecedor nas configurações ou no cadastro").
- Prazo retroativo negativo em relação à data atual: gera alerta imediato de urgência crítica ("Ruptura iminente se não for pedido com frete expresso").
