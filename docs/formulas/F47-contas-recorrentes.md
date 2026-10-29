# F47 — Contas Recorrentes com Reajuste e Ajuste de Mês Curto

## 1. Definição
Automatiza a projeção e geração de lançamentos de despesas ou receitas recorrentes (aluguel, condomínio, licenças de software, mensalidade de contabilidade, internet, segurança privada), com tratamento rigoroso para vencimentos fixados nos dias 29, 30 ou 31 em meses curtos (Fevereiro com 28 ou 29 dias; Abril, Junho, Setembro, Novembro com 30 dias), e aplicação de índices contratuais de reajuste periódico (IPCA, IGP-M ou percentual fixo informado).

## 2. Variáveis
- $V_0$: Valor base original da conta (em centavos)
- $D_{\text{dia}}$: Dia de vencimento no mês ($1 \le D_{\text{dia}} \le 31$)
- $P_{\text{rec}}$: Periodicidade (MENSAL, BIMESTRAL, TRIMESTRAL, SEMESTRAL, ANUAL)
- $\text{Ano}, \text{Mês}$: Ano e mês de competência do lançamento
- $I_{\text{reajuste}}$: Índice de reajuste contratual percentual acumulado ($0 \le I < 1$)
- $\text{DataInício}, \text{DataFim}$: Intervalo de vigência da recorrência

## 3. Fórmulas
Tratamento estrito de último dia do mês curto:
Dado o ano $Y$ e mês $M \in \{1, \dots, 12\}$:
$$D_{\text{máx}}(Y, M) = \begin{cases}
29, & \text{se } M = 2 \text{ e } (Y \bmod 4 = 0 \text{ e } (Y \bmod 100 \ne 0 \text{ ou } Y \bmod 400 = 0)) \\
28, & \text{se } M = 2 \text{ e não bissexto} \\
30, & \text{se } M \in \{4, 6, 9, 11\} \\
31, & \text{se } M \in \{1, 3, 5, 7, 8, 10, 12\}
\end{cases}$$

O dia efetivo do vencimento no mês será:
$$D_{\text{efetivo}} = \min(D_{\text{dia}}, D_{\text{máx}}(Y, M))$$

Valor da parcela com reajuste:
$$V_{\text{parcela}} = \left\lfloor V_0 \times \left(1 + \frac{I_{\text{reajuste}}}{100}\right) \right\rfloor$$

## 4. Exemplo Numérico Calculado à Mão
- Aluguel do imóvel comercial: R$ 4.500,00 ($450.000$ centavos).
- Dia de vencimento contratual: Dia 31 de cada mês.
- No mês de Fevereiro de 2026 (não bissexto):
  - $D_{\text{máx}}(2026, 2) = 28$.
  - O vencimento de Fevereiro é gerado no dia 28/02/2026.
- No mês de Abril de 2026 (mês de 30 dias):
  - $D_{\text{máx}}(2026, 4) = 30$.
  - O vencimento é gerado no dia 30/04/2026.
- Reajuste anual após 12 meses: índice IGP-M de $+4,2\%$:
  - Novo valor $= \lfloor 450.000 \times 1,042 \rfloor = 468.900$ centavos (R$ 4.689,00).

## 5. Limites e Casos de Borda
- Contas vencendo no dia 31 nunca pulam para o dia 1º do mês seguinte, evitando distorções contábeis de competência do fechamento mensal.
- Anos bissextos respeitam estritamente a regra do calendário gregoriano para o dia 29 de fevereiro.
