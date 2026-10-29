# F39 — Rendimento e Custo Real por Lote de Produção

## 1. Definição
Mede a eficiência de transformação física em ordens de produção concluídas, comparando o rendimento real obtido (porções ou peso final apurado) frente ao rendimento teórico padrão da ficha técnica. Identifica dispersão de custo unitário e emite alerta de controle estatístico de processo quando o rendimento desvia além de $\pm 3\sigma$ (três desvios padrão) da média histórica de lotes anteriores.

## 2. Variáveis
- $Y_{\text{teorico}}$: Rendimento padrão em porções ou kg cadastrado na ficha
- $Y_{\text{real}}$: Rendimento físico efetivamente obtido no lote
- $C_{\text{lote}}$: Custo total dos insumos consumidos na batelada (em centavos)
- $H$: Histórico de rendimentos percentuais dos últimos $N$ lotes da mesma receita ($N \ge 5$)
- $\mu$: Rendimento médio histórico: $\mu = \frac{1}{N} \sum_{j=1}^N \frac{Y_{\text{real}, j}}{Y_{\text{teorico}, j}}$
- $\sigma$: Desvio padrão amostral histórico

## 3. Fórmulas
Rendimento percentual do lote atual:
$$\eta = \frac{Y_{\text{real}}}{Y_{\text{teorico}}} \times 100\%$$

Custo real apurado por porção:
$$C_{\text{unit\_real}} = \left\lceil \frac{C_{\text{lote}}}{Y_{\text{real}}} \right\rceil$$

Custo teórico esperado por porção:
$$C_{\text{unit\_teorico}} = \left\lceil \frac{C_{\text{lote}}}{Y_{\text{teorico}}} \right\rceil$$

Perda financeira do lote decorrente de baixo rendimento:
$$\Delta \text{Custo} = \max\left(0, (C_{\text{unit\_real}} - C_{\text{unit\_teorico}}) \times Y_{\text{real}}\right)$$

Limites de controle estatístico:
$$\text{LSC} = \mu + 3\sigma$$
$$\text{LIC} = \mu - 3\sigma$$
Se $\eta < \text{LIC}$ ou $\eta > \text{LSC}$: sinaliza anomalia crítica de processo (fogo alto, tempo excessivo, evaporação, erro de pesagem ou vazamento).

## 4. Exemplo Numérico Calculado à Mão
- Batelada de Molho Pesto: Custo total de insumos $= \text{R\$} 200,00$ ($20.000$ centavos).
- Rendimento teórico da ficha: $20$ porções de $100$ g $\to C_{\text{unit\_teorico}} = 1.000$ centavos (R$ 10,00).
- Rendimento real obtido: $16$ porções de $100$ g ($\eta = 16 / 20 = 80\%$).
- Custo real por porção $= 20.000 / 16 = 1.250$ centavos (R$ 12,50).
- Desperdício apurado no lote: $(12,50 - 10,00) \times 16 = \text{R\$} 40,00$ ($4.000$ centavos).
- Histórico de lotes anteriores: $\mu = 98\%$, $\sigma = 3\%$. Limite inferior $\text{LIC} = 98\% - 3 \times 3\% = 89\%$.
- Como $80\% < 89\%$, o sistema emite alerta vermelho de anomalia estatística severa.

## 5. Limites e Casos de Borda
- Rendimento real zero ou negativo: rejeitado por validação.
- Menos de 5 lotes históricos: calcula a variância de custo e perda em R$, mas marca alerta estatístico $\pm 3\sigma$ como dados insuficientes de histórico.
