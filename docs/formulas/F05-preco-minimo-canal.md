# F05 — Preço Mínimo por Canal de Venda

## 1. Definição
Calcula o preço mínimo de venda necessário para atingir uma margem líquida alvo em canais específicos (ex: Balcão, Delivery Próprio, Marketplaces como iFood), descontando comissões da plataforma, taxas de antecipação/cartão, custo de embalagens e tributação variável.

## 2. Variáveis
- $C_{\text{prato}}$: Custo dos insumos da porção (CMV em centavos)
- $C_{\text{emb}}$: Custo da embalagem específica do canal (em centavos)
- $m_{\text{alvo}}$: Margem líquida alvo desejada sobre o preço de venda ($0 < m_{\text{alvo}} < 1$)
- $t_{\text{com}}$: Taxa de comissão da plataforma (ex: 12% ou 27% no marketplace)
- $t_{\text{pag}}$: Taxa de processamento de pagamento / adquirente (ex: 2,5%)
- $t_{\text{imp}}$: Alíquota de imposto variável sobre vendas (ex: Simples Nacional 5%)

## 3. Fórmulas
A soma percentual de deduções variáveis do canal é dada por:
$$D = m_{\text{alvo}} + t_{\text{com}} + t_{\text{pag}} + t_{\text{imp}}$$

Se $1 - D \le 0$, a margem desejada é matematicamente impossível com as taxas do canal.
Caso contrário:
$$P_{\text{mín}} = \left\lceil \frac{C_{\text{prato}} + C_{\text{emb}}}{1 - D} \right\rceil$$

A margem em reais por prato gerada é:
$$\text{Margem}_{\text{R\$}} = P_{\text{mín}} \times (1 - t_{\text{com}} - t_{\text{pag}} - t_{\text{imp}}) - (C_{\text{prato}} + C_{\text{emb}})$$

## 4. Exemplo Numérico Calculado à Mão
- Custo do prato: R$ 10,00 ($1.000$ centavos)
- Embalagem delivery: R$ 2,00 ($200$ centavos)
- Custo direto $= 1.200$ centavos
- Margem alvo: $20\%$ ($0,20$)
- Marketplace: comissão $23\%$ ($0,23$)
- Meio de pagamento: $3\%$ ($0,03$)
- Simples Nacional: $4\%$ ($0,04$)
- $D = 0,20 + 0,23 + 0,03 + 0,04 = 0,50$
- Denominador $= 1 - 0,50 = 0,50$
- $P_{\text{mín}} = \lceil 1.200 / 0,50 \rceil = 2.400$ centavos (R$ 24,00)
- Verificação:
  - Venda: R$ 24,00
  - Comissão ($23\%$): R$ 5,52
  - Pagamento ($3\%$): R$ 0,72
  - Imposto ($4\%$): R$ 0,96
  - Custos diretos: R$ 12,00
  - Sobra líquida $= 24,00 - 5,52 - 0,72 - 0,96 - 12,00 = 4,80$
  - Margem obtida $= 4,80 / 24,00 = 20,00\%$ (exatamente a margem alvo).

## 5. Limites e Casos de Borda
- Se $1 - D \le 0$, lança erro de domínio claro ou aviso "impossível manter esta margem neste canal".
- Arredondamento sempre para cima ao centavo superior (`Math.ceil`) para garantir não-violação da margem mínima.
