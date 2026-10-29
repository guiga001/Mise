# Fórmula F43 — Mapeamento Automático por Similaridade Determinística

## Definição
Realiza o vínculo sugerido entre nomes de produtos importados de relatórios de PDV/delivery e fichas técnicas cadastradas utilizando métricas determinísticas: normalização de texto, distância de Jaro-Winkler e coeficiente de sobreposição de tokens (Jaccard token set).

## Regras
1. **Normalização**:
   - Minúsculas, remoção de acentos (`NFD` regex).
   - Remoção de stopwords em comércio alimentício ("de", "da", "do", "com", "ao", "a", "em", "para").
   - Remoção de termos comuns de unidades e embalagens ("kg", "g", "ml", "l", "un", "lata", "garrafa", "combo").
2. **Similaridade de Jaro-Winkler ($S_{JW}$)**:
   - Mede correspondência de caracteres com bonificação para prefixos coincidentes de até 4 caracteres ($p = 0,1$).
3. **Sobreposição de Tokens ($S_{Tokens}$)**:
   - Coeficiente de Jaccard sobre o conjunto de palavras normalizadas: $\frac{|A \cap B|}{|A \cup B|}$.
4. **Pontuação Combinada**:
   $$Score = 0,6 \times S_{JW} + 0,4 \times S_{Tokens}$$
5. **Faixas de Decisão**:
   - $Score \ge 0,85$: **Alta Similaridade** (pré-marcado como sugestão prioritária para confirmação com 1 clique).
   - $0,60 \le Score < 0,85$: **Média Similaridade** (sugestão exibida em lista de opções).
   - $Score < 0,60$: **Sem correspondência** (requer seleção manual do dono).

## Invariantes
- Proibido aplicar vinculação de forma silenciosa ou autônoma abaixo de 0,85.
- A função de similaridade é comutativa e determinística ($Sim(A, B) \equiv Sim(B, A)$).
