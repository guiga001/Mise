# F09 — Cobertura e Giro de Estoque

## 1. Definição Matemática
Mede quantos dias de operação o saldo atual de estoque suporta e a velocidade com que o estoque gira no período.
Outliers de consumo diário são filtrados através do MAD (*Median Absolute Deviation*).

$$\text{MAD} = \text{mediana}(|x_i - \text{mediana}(x)|)$$
Item $x_i$ é outlier se $|x_i - \text{mediana}(x)| > 3{,}0 \times \text{MAD} / 0{,}6745$.
Após exclusão dos outliers, calcula-se o consumo médio diário $\bar{d}$:
$$\text{Cobertura (dias)} = \frac{\text{Saldo Atual em Unidade Base}}{\bar{d}}$$
$$\text{Giro de Estoque} = \frac{\text{CMV Total do Período em R\$}}{\text{Estoque Médio Valorizado em R\$}}$$
$$\text{Dias de Estoque} = \frac{\text{Dias do Período}}{\text{Giro}}$$

## 2. Variáveis
- $\text{Saldo Atual}$: Quantidade física atual no estoque (unidade-base: $g, ml, un$).
- $x_i$: Consumo do dia $i$ no horizonte de análise (padrão: 30 dias).
- $\bar{d}$: Consumo médio diário sem outliers.
- $\text{CMV}$: Custo da mercadoria vendida no período em centavos.
- $\text{Estoque Médio}$: $(\text{Estoque Inicial} + \text{Estoque Final}) / 2$ em centavos.

## 3. Exemplo Calculado à Mão
- Saldo atual de Farinha: $50{.}000\text{ g}$.
- Consumo dos últimos 5 dias: $[9{.}000, 10{.}000, 10{.}500, 11{.}000, 35{.}000]$.
- Mediana $= 10{.}500$. Desvios: $[1500, 500, 0, 500, 24500]$. Mediana dos desvios (MAD) $= 500$.
- Limiar de corte: $3{,}0 \times 500 / 0{,}6745 \approx 2{.}223{,}87$.
- O valor $35{.}000$ tem desvio $24{.}500 > 2{.}224$, sendo expurgado como evento atípico.
- Média limpa: $(9{.}000 + 10{.}000 + 10{.}500 + 11{.}000) / 4 = 10{.}125\text{ g/dia}$.
- Cobertura $= 50{.}000 / 10{.}125 = 4{,}94\text{ dias}$.

## 4. Limites e Casos de Borda
- Consumo médio $\bar{d} = 0$: Cobertura retorna `Infinity` ("Sem consumo registrado"). Não gera divisão por zero.
- MAD $= 0$: Não divide por zero; se desvio for zero, não há outliers.
- Estoque Médio $= 0$: Giro é 0.
