# Fórmula F13 — Variância de Uso (Teórico × Real)

## Definição
Compara o consumo teórico de insumos gerado pela explosão das fichas técnicas sobre as vendas com o consumo real apurado entre duas contagens físicas de estoque no período.

## Variáveis
- $ConsumoTeorico_i = \sum_k (Vendas_k \times QtdFicha_{ik})$: Quantidade teórica esperada em unidade-base.
- $ConsumoReal_i = EstoqueInicial_i + EntradasCompras_i - EstoqueFinalContado_i$: Consumo real físico.
- $VarianciaQtd_i = ConsumoReal_i - ConsumoTeorico_i$: Quantidade excedente consumida ou perdida.
- $VarianciaReais_i = VarianciaQtd_i \times CustoMedioUnitario_i$: Impacto em R$ da perda/desvio.
- $VarianciaPerc_i = \frac{VarianciaQtd_i}{ConsumoTeorico_i} \times 100$.

## Exemplo Numérico
- Insumo: Filé Mignon ($Custo = \text{R\$ } 0,08/\text{g}$).
- Estoque inicial contado: 50.000 g (50 kg).
- Entradas de compras no período: 100.000 g (100 kg).
- Estoque final contado: 40.000 g (40 kg).
- $ConsumoReal = 50.000 + 100.000 - 40.000 = 110.000\text{ g}$.
- Consumo teórico segundo vendas registradas: 100.000 g.
- $VarianciaQtd = 110.000 - 100.000 = +10.000\text{ g}$ (10 kg sumiram / desperdício / porcionamento errado).
- $VarianciaReais = 10.000 \times \text{R\$ } 0,08 = \text{R\$ } 800,00$ de perda no período.

## Aceite e Invariantes
- Exige estritamente duas contagens committed no período analisado; sem elas, emite `DADOS_INSUFICIENTES`.
- Unidades de medida convertidas unicamente através de `UnitConversion` estrito.
