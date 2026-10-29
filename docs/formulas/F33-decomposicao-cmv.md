# Fórmula F33 — Decomposição da Variação de CMV (Preço, Volume e Uso)

## Definição
Decompõe com precisão matemática estrita a variação do CMV entre dois períodos consecutivos ($\Delta CMV$) em três efeitos independentes e aditivos: Efeito Preço (variação nos custos dos fornecedores), Efeito Volume (impacto do crescimento ou retração nas vendas) e Efeito Uso/Mix (variação por perdas, porções ou mix de produtos).

## Identidade Matemática Fundamental
$$\Delta CMV = \sum_i (q_{i1} \cdot p_{i1}) - \sum_i (q_{i0} \cdot p_{i0})$$

Os três efeitos são definidos por:
1. **Efeito Preço**:
   $$EfeitoPreço = \sum_i q_{i1} \cdot (p_{i1} - p_{i0})$$
2. **Efeito Quantidade Total**:
   $$EfeitoQuantidade = \sum_i p_{i0} \cdot (q_{i1} - q_{i0})$$
   Subdividido em:
   - **Efeito Volume de Vendas**:
     $$EfeitoVolume = \left(\frac{V_1}{V_0} - 1\right) \times \sum_i (q_{i0} \cdot p_{i0})$$
     onde $V_1$ e $V_0$ representam o volume total de unidades vendidas nos períodos 1 e 0.
   - **Efeito Uso / Mix / Desperdício**:
     $$EfeitoUsoMix = EfeitoQuantidade - EfeitoVolume$$

## Prova de Identidade (Invariante Inegociável)
$$EfeitoPreço + EfeitoVolume + EfeitoUsoMix = \Delta CMV \quad \text{(Exatamente idêntico)}$$

## Exemplo Numérico Calculado à Mão
- Período 0: Insumo consome 100 kg a R$ 10,00/kg. $CMV_0 = 100 \times 10 = \text{R\$ } 1.000,00$. Volume de vendas $V_0 = 500$ pratos.
- Período 1: Insumo consome 130 kg a R$ 12,00/kg. $CMV_1 = 130 \times 12 = \text{R\$ } 1.560,00$. Volume de vendas $V_1 = 600$ pratos (+20%).
- $\Delta CMV = 1.560 - 1.000 = +\text{R\$ } 560,00$.
- $EfeitoPreço = 130 \times (12 - 10) = 130 \times 2 = +\text{R\$ } 260,00$.
- $EfeitoQuantidade = 10 \times (130 - 100) = 10 \times 30 = +\text{R\$ } 300,00$.
- Variação de volume: $\frac{600}{500} - 1 = +20\%$.
- $EfeitoVolume = 0,20 \times 1.000,00 = +\text{R\$ } 200,00$.
- $EfeitoUsoMix = 300,00 - 200,00 = +\text{R\$ } 100,00$ (desperdício ou mudança na proporção do prato).
- Soma: $260,00 + 200,00 + 100,00 = \text{R\$ } 560,00 \equiv \Delta CMV$.

## Aceite
- Teste de propriedade automatizado com dados pseudoaleatórios deve garantir que a soma fecha ao centavo sem resíduo.
