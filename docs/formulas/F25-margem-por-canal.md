# Fórmula F25 — Margem Líquida Real por Canal

## Definição
Segrega o resultado financeiro de cada canal de venda (Balcão/Salão, Delivery Próprio, iFood/Marketplaces), deduzindo os custos variáveis específicos: CMV dos pratos, comissões percentuais da plataforma, taxa de intermediação financeira e custos de embalagem descartável.

## Variáveis
- $R_{c}$: Receita bruta do canal $c$.
- $CMV_{c}$: Custo dos insumos dos itens vendidos no canal $c$.
- $TaxasPlataforma_{c}$: Comissão e taxas de serviço retidas pelo canal.
- $TaxasPagamento_{c}$: Taxa de maquininha / adquirente / gateway.
- $Embalagens_{c}$: Custo de embalagens descartáveis específicas do canal.
- $ImpostosVariaveis_{c}$: Alíquota proporcional de impostos sobre a venda.
- $MargemLiquidaCanal_{c} = R_c - CMV_c - TaxasPlataforma_c - TaxasPagamento_c - Embalagens_c - ImpostosVariaveis_c$
- $MargemLiquida\%_{c} = \frac{MargemLiquidaCanal_c}{R_c} \times 100$

## Exemplo Numérico
- Venda de R$ 100,00 no Balcão:
  - CMV: R$ 32,00. Taxa pagamento (PIX/Débito 1,5%): R$ 1,50. Embalagem: R$ 0. Imposto (6%): R$ 6,00.
  - Sobra: $100 - 32 - 1,50 - 6 = \text{R\$ } 60,50$ (60,5% de margem líquida).
- Mesma venda de R$ 100,00 no Marketplace Delivery:
  - CMV: R$ 32,00. Comissão (23%): R$ 23,00. Taxa pagamento (3,2%): R$ 3,20. Embalagem térmica: R$ 4,50. Imposto (6%): R$ 6,00.
  - Sobra: $100 - 32 - 23 - 3,20 - 4,50 - 6 = \text{R\$ } 31,30$ (31,3% de margem líquida).

## Aceite e Invariantes
- A soma dos resultados líquidos e custos de todos os canais reconcilia exatamente com o total consolidado do período.
