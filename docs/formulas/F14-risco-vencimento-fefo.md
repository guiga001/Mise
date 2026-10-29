# Fórmula F14 — Risco de Vencimento (FEFO)

## Definição
Ordena os lotes em estoque por data de vencimento crescente (First Expired, First Out) e projeta se o consumo médio diário consumirá o lote antes do prazo. O excedente não absorvido pela demanda é precificado como valor monetário em risco de descarte.

## Variáveis
- $ConsumoMedioDiario_i = \frac{\sum_{t=1}^D Consumo_i(t)}{D}$: Consumo médio diário nos últimos $D$ dias.
- $DiasAteValidade_{il} = \max(0, DataValidade_{il} - DataAtual)$: Dias restantes do lote $l$.
- $ConsumoProjetado_{il} = ConsumoMedioDiario_i \times DiasAteValidade_{il}$.
- $ExcedenteRisco_{il} = \max(0, SaldoLote_{il} - ConsumoProjetado_{il})$.
- $ValorEmRisco_{il} = ExcedenteRisco_{il} \times CustoUnitario_{il}$.

## Exemplo Numérico
- Lote de Queijo Brie: Saldo de 15.000 g (15 kg). Vence em 5 dias ($Dias = 5$). Custo: R$ 0,10/g (R$ 100/kg).
- Consumo médio histórico: 2.000 g/dia.
- Consumo projetado até o vencimento: $2.000 \times 5 = 10.000\text{ g}$.
- Excedente em risco de perda: $15.000 - 10.000 = 5.000\text{ g}$ (5 kg).
- Valor em risco: $5.000 \text{ g} \times \text{R\$ } 0,10/\text{g} = \text{R\$ } 500,00$ em risco iminente de descarte.

## Aceite e Invariantes
- Lote já vencido ($DiasAteValidade = 0$) projeta consumo 0 e 100% do saldo em risco.
- Perda só é lançada no estoque com autorização explícita e `AuditLog`.
