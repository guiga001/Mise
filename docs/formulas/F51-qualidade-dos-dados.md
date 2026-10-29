# Fórmula F51 — Qualidade dos Dados

## Definição
Audita o grau de completude, frescor e confiabilidade das informações cadastradas no sistema, gerando um índice global de qualidade (0 a 100%) e orientando o nível de confiança das recomendações analíticas.

## Sub-Índices Auditados
1. **Cobertura de Fichas Técnicas ($Q_{Fichas}$)**:
   $$Q_{Fichas} = \frac{\text{Receita de vendas vinculada a fichas com linhas}}{\text{Receita total de vendas}} \times 100$$
2. **Atualização de Preços de Insumos ($Q_{Precos}$)**:
   $$Q_{Precos} = \frac{\text{Insumos com compra ou atualização nos últimos 30 dias}}{\text{Total de insumos ativos cadastrados}} \times 100$$
3. **Regularidade de Registro de Vendas ($Q_{Vendas}$)**:
   $$Q_{Vendas} = \frac{\text{Dias com vendas importadas nos últimos 30 dias}}{\text{Dias de operação esperados no período}} \times 100$$
4. **Frequência de Contagens de Estoque ($Q_{Contagens}$)**:
   $$Q_{Contagens} = \frac{\text{Insumos contados fisicamente nos últimos 30 dias}}{\text{Total de insumos ativos}} \times 100$$

## Índice Global de Qualidade dos Dados
$$Q_{Global} = 0,35 \times Q_{Fichas} + 0,25 \times Q_{Precos} + 0,25 \times Q_{Vendas} + 0,15 \times Q_{Contagens}$$

## Níveis de Confiança
- $Q_{Global} \ge 80\%$: Confiabilidade **ALTA**.
- $50\% \le Q_{Global} < 80\%$: Confiabilidade **MÉDIA**.
- $Q_{Global} < 50\%$: Confiabilidade **BAIXA** (exibe alertas sobre pendências de cadastro).
