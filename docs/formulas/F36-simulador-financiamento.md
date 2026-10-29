# F36 — Simulador de Financiamento e Parcelamento (Price, SAC e CET por TIR)

## 1. Definição
Modela operações de crédito, empréstimos ou parcelamentos de fornecedores pelas tabelas Price (parcelas constantes) e SAC (amortizações constantes), calculando o Custo Efetivo Total (CET) mensal e anual por Taxa Interna de Retorno (TIR) via método determinístico da bisseção, confrontando com o custo de pagar à vista com desconto (F18).

## 2. Variáveis
- $PV$: Valor financiado (em centavos)
- $i$: Taxa de juros nominal contratada por período
- $n$: Número de parcelas mensais
- $T_{\text{iof}}$: Impostos e tarifas de contratação/abertura de crédito (em centavos)
- $PMT_t$: Parcela no mês $t$ (em centavos)
- $J_t$: Juros no mês $t$
- $A_t$: Amortização no mês $t$
- $SD_t$: Saldo devedor após o mês $t$

## 3. Fórmulas
### Sistema Price (Francês)
$$PMT = \left\lceil PV \times \frac{i}{1 - (1 + i)^{-n}} \right\rceil$$
Para cada mês $t$:
$$J_t = \lfloor SD_{t-1} \times i \rfloor$$
$$A_t = PMT - J_t$$
$$SD_t = SD_{t-1} - A_t$$

### Sistema SAC (Constante)
$$A = \lceil PV / n \rceil$$
Para cada mês $t$:
$$J_t = \lfloor SD_{t-1} \times i \rfloor$$
$$PMT_t = A + J_t$$
$$SD_t = SD_{t-1} - A$$

### CET via TIR (Método da Bisseção)
Fluxo líquido de caixa: no instante $0$, recebe $PV - T_{\text{iof}}$; nos instantes $t = 1 \dots n$, paga $-PMT_t$.
Encontra-se a taxa $r$ que satisfaz:
$$f(r) = -(PV - T_{\text{iof}}) + \sum_{t=1}^n \frac{PMT_t}{(1 + r)^t} = 0$$
Via bisseção no intervalo $r \in [0, 100\%]$ com tolerância $|f(r)| < 1\text{ centavo}$ ou $\Delta r < 10^{-6}$.

## 4. Exemplo Numérico Calculado à Mão
- $PV = \text{R\$} 10.000,00$ ($1.000.000$ centavos)
- $n = 5$ meses
- $i = 2\%$ ao mês ($0,02$)
- Taxa/Tarifa = R$ 0
- Price:
  - Fator $= \frac{0,02}{1 - (1,02)^{-5}} = \frac{0,02}{1 - 0,90573} = \frac{0,02}{0,094269} = 0,212158$
  - $PMT = \lceil 1.000.000 \times 0,212158 \rceil = 212.158$ centavos (R$ 2.121,58)
  - Soma das 5 parcelas $= 1.060.790$ centavos
  - Custo total em juros $= 60.790$ centavos (R$ 607,90)
  - TIR dos fluxos $[-10.000, 2.121,58 \times 5] \to r = 2,00\%$ a.m. (reproduz com exatidão a taxa $i$).

## 5. Limites e Casos de Borda
- Se $n \le 0$ ou $PV \le 0$: erro de domínio ("Prazo e valor devem ser maiores que zero").
- A convergência da bisseção é garantida para fluxos convencionais com raiz única.
