# F16 — Balanceamento de Estoque Entre Lojas

## 1. Definição
Identifica oportunidades de transferir insumos ou produtos entre unidades da mesma empresa, aproveitando estoques excedentes em uma loja para suprir riscos de ruptura iminente em outra, respeitando lotes de embalagem, validade dos itens e o custo logístico de transferência.

## 2. Variáveis
- $E_o$: Cobertura em dias do insumo na loja de origem
- $E_d$: Cobertura em dias do insumo na loja de destino
- $T_{\text{teto}}$: Limiar de cobertura máxima na origem para considerar estoque excedente (dias)
- $P_{\text{piso}}$: Limiar de cobertura mínima no destino para acionar necessidade de reposição (dias)
- $D_o, D_d$: Consumo médio diário na origem e no destino (unidade-base/dia)
- $S_o$: Saldo disponível na origem na unidade-base
- $Q_{\text{emb}}$: Tamanho do múltiplo de embalagem de transferência
- $C_{\text{transf}}$: Custo logístico unitário ou fixo da rota de transferência (em centavos)
- $C_{\text{unit}}$: Custo unitário do insumo (em microcentavos)

## 3. Fórmulas
Excedente seguro na origem (sem deixar a origem abaixo do piso $P_{\text{piso}}$):
$$\text{SaldoMínimo}_o = P_{\text{piso}} \times D_o$$
$$\text{Excedente}_o = \max(0, S_o - \text{SaldoMínimo}_o)$$

Necessidade líquida no destino para atingir a cobertura-alvo $T_{\text{alvo}}$:
$$\text{Necessidade}_d = \max(0, (T_{\text{alvo}} \times D_d) - S_d)$$

Quantidade transferível teórica:
$$Q_{\text{bruta}} = \min(\text{Excedente}_o, \text{Necessidade}_d)$$
$$Q_{\text{transf}} = \lfloor Q_{\text{bruta}} / Q_{\text{emb}} \rfloor \times Q_{\text{emb}}$$

Ganho financeiro líquido gerado pela transferência:
$$\text{RupturaEvitada} = \text{CustoUnitário} \times Q_{\text{transf}}$$
$$\text{GanhoLíquido} = \text{RupturaEvitada} - C_{\text{transf}}$$

## 4. Exemplo Numérico Calculado à Mão
- Loja 1 (Matriz): Saldo $= 50.000$ g de filé mignon, consumo $= 1.000$ g/dia $\to 50$ dias de cobertura. Teto $= 20$ dias.
- Piso seguro na Matriz $= 15$ dias $\to 15.000$ g.
- Excedente na Matriz $= 50.000 - 15.000 = 35.000$ g.
- Loja 2 (Filial): Saldo $= 2.000$ g, consumo $= 800$ g/dia $\to 2,5$ dias de cobertura. Alvo $= 10$ dias ($8.000$ g).
- Necessidade Filial $= 8.000 - 2.000 = 6.000$ g.
- Embalagem $= 2.000$ g.
- $Q_{\text{transf}} = \min(35.000, 6.000) = 6.000$ g ($3$ pacotes de $2.000$ g).
- Custo unitário: R$ 0,08/g ($80.000$ microcentavos). Valor transferido $= 6.000 \times 0,08 = \text{R\$} 480,00$ ($48.000$ centavos).
- Custo do frete/motoboy $= \text{R\$} 30,00$ ($3.000$ centavos).
- Ganho líquido em capital preservado $= 48.000 - 3.000 = 45.000$ centavos (R$ 450,00).

## 5. Limites e Casos de Borda
- Nunca transfere quantidade que deixe a origem com cobertura abaixo de $P_{\text{piso}}$.
- Se o ganho financeiro for menor que $C_{\text{transf}}$, a transferência é desaconselhada.
- Se a empresa tiver apenas uma loja cadastrada, informa dados insuficientes ("Requer 2 ou mais lojas").
