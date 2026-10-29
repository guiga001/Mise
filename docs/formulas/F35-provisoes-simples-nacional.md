# F35 — Provisões Trabalhistas e Alíquota Efetiva do Simples Nacional

## 1. Definição Matemática
Garante o provisionamento financeiro mensal correto de encargos de folha e tributos federais/estaduais.

### 1. Provisões Trabalhistas
Calculadas sobre a folha salarial bruta com alíquotas configuradas pelo gestor/contador:
- Provisão de 13º Salário: $1/12 \approx 8{,}333\%$
- Provisão de Férias: $1/12 \approx 8{,}333\%$
- 1/3 Constitucional de Férias: $(1/3) \times (1/12) \approx 2{,}778\%$
- Encargos/FGTS sobre provisões: alíquota informada (ex.: 8%).
$$\text{Total Provisão Mensal} = \text{Folha Bruta} \times \text{Percentual Total de Provisão}$$

### 2. Imposto Estimado — Alíquota Efetiva do Simples Nacional (Anexo I - Comércio)
Conforme Lei Complementar nº 123/2006:
$$\text{Alíquota Efetiva} = \frac{(\text{RBT12} \times \text{Alíquota Nominal}) - \text{Parcela a Deduzir}}{\text{RBT12}}$$

Onde $\text{RBT12}$ é a Receita Bruta Total acumulada nos últimos 12 meses.
O imposto mensal a recolher no DAS:
$$\text{DAS Mensal (centavos)} = \text{Faturamento do Mês} \times \text{Alíquota Efetiva}$$

## 2. Exemplo Calculado à Mão
- Empresa no Simples Nacional (Anexo I, 2ª Faixa):
  - RBT12 $= \text{R\$} 300{.}000{,}00$.
  - Alíquota Nominal $= 7{,}30\%$. Parcela a Deduzir $= \text{R\$} 5{.}940{,}00$.
- Cálculo da Alíquota Efetiva:
  $$\text{Imposto Bruto} = 300{.}000 \times 0{,}073 = \text{R\$} 21{.}900{,}00$$
  $$\text{Imposto Líquido} = 21{.}900 - 5{.}940 = \text{R\$} 15{.}960{,}00$$
  $$\text{Alíquota Efetiva} = \frac{15{.}960}{300{.}000} = 5{,}32\%$$
- Se a loja faturou R$ 30.000,00 no mês atual:
  $$\text{DAS Estimado} = 30{.}000 \times 5{,}32\% = \text{R\$} 1{.}596{,}00$$

## 3. Limites e Casos de Borda
- Se $\text{RBT12} \le 0$, a função alerta a necessidade de informar o histórico de faturamento para cálculo da alíquota do Simples.
- Aviso obrigatório em UI: *"Os parâmetros tributários são estimativas gerenciais. Confirme sempre com sua contabilidade os dados apurados no PGDAS."*
