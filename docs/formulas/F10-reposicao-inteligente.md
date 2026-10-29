# F10 — Reposição Inteligente (SS, ROP e EOQ com Limite de Validade)

## 1. Definição Matemática
Modela os três parâmetros fundamentais de reposição contínua determinística:
1. **Estoque de Segurança (SS)**:
   $$SS = z \times \sigma_d \times \sqrt{L}$$
   onde $z = \Phi^{-1}(\text{Nível de Serviço})$ é a função inversa da distribuição normal padrão (Aproximação racional de Beasley-Springer-Moro / Acklam), $\sigma_d$ é o desvio-padrão da demanda diária e $L$ é o lead time do fornecedor em dias.
2. **Ponto de Reposição (ROP)**:
   $$ROP = \bar{d} \times L + SS$$
   onde $\bar{d}$ é a demanda média diária.
3. **Lote Econômico de Compra (EOQ)**:
   $$EOQ = \sqrt{\frac{2 \times D \times S}{H}}$$
   onde $D$ é a demanda anual projetada ($D = \bar{d} \times 365$), $S$ é o custo fixo por pedido em centavos, e $H$ é o custo anual de posse por unidade base ($H = \text{custo\_unitario} \times \text{taxa\_manutenção\_anual}$).
   **Restrição de Validade**:
   $$EOQ_{\text{efetivo}} = \min(EOQ, \bar{d} \times \text{Dias de Validade})$$

## 2. Inverso da Distribuição Normal ($z$)
Para nível de serviço $p \in (0, 1)$:
- $p = 0{,}90 \implies z \approx 1{,}282$
- $p = 0{,}95 \implies z \approx 1{,}645$
- $p = 0{,}99 \implies z \approx 2{,}326$

## 3. Exemplo Calculado à Mão
- Insumo: Queijo Mussarela. Custo $= \text{R\$} 40{,}00/\text{kg} = 40{.}000\text{ microcentavos/g}$.
- $\bar{d} = 5{.}000\text{ g/dia}$, $\sigma_d = 800\text{ g/dia}$.
- Lead time $L = 4\text{ dias}$. Nível de serviço $= 95\% \implies z = 1{,}645$.
- Custo de emissão do pedido $S = \text{R\$} 25{,}00 = 2{.}500\text{ centavos}$.
- Taxa anual de manutenção de estoque $= 20\%$.
- $H = 40{,}00 \times 0{,}20 = \text{R\$} 8{,}00/\text{kg} = 8{.}000\text{ centavos/kg}$.
- $SS = 1{,}645 \times 800 \times \sqrt{4} = 1{,}645 \times 800 \times 2 = 2{.}632\text{ g}$.
- $ROP = (5{.}000 \times 4) + 2{.}632 = 22{.}632\text{ g} \approx 22{,}63\text{ kg}$.
- $D = 5\text{ kg/dia} \times 365 = 1{.}825\text{ kg/ano}$.
- $EOQ = \sqrt{\frac{2 \times 1{.}825 \times 25}{8}} = \sqrt{\frac{91{.}250}{8}} = \sqrt{11{.}406{,}25} \approx 106{,}8\text{ kg}$.
- Validade $= 30\text{ dias}$. Consumo máximo $= 5\text{ kg/dia} \times 30 = 150\text{ kg} > 106{,}8\text{ kg}$. Portanto $EOQ_{\text{efetivo}} = 106{,}8\text{ kg}$.

## 4. Limites e Casos de Borda
- Sem $S$ ou taxa de manutenção informada pelo dono: A função sinaliza dados insuficientes para EOQ e orienta preenchimento em Configurações.
- Lead time $L \le 0$: Erro de domínio.
- Nível de serviço fora de $(0, 1)$: Erro de domínio.
