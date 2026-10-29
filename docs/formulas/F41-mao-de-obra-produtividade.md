# F41 — Mão de Obra: Produtividade, CMO% e Dimensionamento de Escala

## 1. Definição
Monitora a eficiência do custo de pessoal no comércio alimentício através do indicador CMO% (Custo de Mão de Obra sobre Faturamento) e da Produtividade horária (Faturamento por Hora Trabalhada). A partir da demanda prevista por dia da semana (F22), calcula o dimensionamento exato de horas de equipe necessárias, sinalizando superdimensionamento (horas ociosas) ou subdimensionamento (risco de lentidão e gargalos), e compara o custo financeiro de horas extras versus nova contratação com base nos encargos informados.

## 2. Variáveis
- $F$: Faturamento bruto do período (em centavos)
- $C_{\text{mo}}$: Custo total de folha + encargos trabalhistas + benefícios no período (em centavos)
- $H_{\text{trab}}$: Horas totais trabalhadas pela equipe no período
- $P_{\text{alvo}}$: Produtividade-alvo definida pelo gestor (em centavos de faturamento por hora de equipe, ex: R$ 120,00/hora)
- $D_w$: Demanda esperada de faturamento no dia da semana $w$ (em centavos)
- $H_{\text{escaladas}, w}$: Horas de equipe planejadas na escala para o dia $w$
- $S$: Salário-base médio
- $E$: Alíquota de encargos informada pelo dono/contador (ex: 35%)
- $Ad_{\text{he}}$: Adicional de hora extra informado (ex: 50% ou 100%)

## 3. Fórmulas
$$\text{CMO}\% = \frac{C_{\text{mo}}}{F} \times 100\%$$
$$\text{ProdutividadeReal} = \frac{F}{H_{\text{trab}}} \text{ (centavos/hora)}$$

Horas ideais necessárias para o dia $w$:
$$H_{\text{ideal}, w} = \frac{D_w}{P_{\text{alvo}}}$$

Balanço de escala do dia $w$:
$$\Delta H_w = H_{\text{escaladas}, w} - H_{\text{ideal}, w}$$
- Se $\Delta H_w > 0$: excesso de equipe (horas ociosas no dia).
- Se $\Delta H_w < 0$: déficit de equipe ($|\Delta H_w|$ horas faltantes).

Custo horário normal versus hora extra:
$$\text{CustoHoraNormal} = \frac{S \times (1 + E)}{220}$$
$$\text{CustoHoraExtra} = \text{CustoHoraNormal} \times (1 + Ad_{\text{he}})$$

## 4. Exemplo Numérico Calculado à Mão
- Faturamento mensal: R$ 100.000,00 ($10.000.000$ centavos).
- Folha com encargos: R$ 22.000,00 ($2.200.000$ centavos).
- $\text{CMO}\% = \frac{22.000}{100.000} \times 100\% = 22,0\%$.
- Horas trabalhadas no mês: $800$ horas $\to \text{Produtividade} = 100.000 / 800 = \text{R\$} 125,00/\text{hora}$.
- Terça-feira típica:
  - Faturamento previsto $= \text{R\$} 2.400,00$.
  - Produtividade-alvo $= \text{R\$} 120,00/\text{hora} \to H_{\text{ideal}} = 2.400 / 120 = 20$ horas.
  - Escala cadastrada $= 34$ horas (4 funcionários em turno de 8,5h).
  - Balanço $= 34 - 20 = +14$ horas (sobram 14 horas de equipe na terça-feira).
- Sábado típico:
  - Faturamento previsto $= \text{R\$} 8.400,00 \to H_{\text{ideal}} = 8.400 / 120 = 70$ horas.
  - Escala cadastrada $= 61$ horas.
  - Balanço $= 61 - 70 = -9$ horas (faltam 9 horas para manter o nível de serviço).

## 5. Limites e Casos de Borda
- Sem lançamento de horas de equipe, a função não inventa valores e exibe dados insuficientes solicitando preencher as horas ou a produtividade-alvo.
- Dias fechados têm horas ideais nulas.
