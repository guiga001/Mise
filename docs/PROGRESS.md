# PROGRESS.md — Acompanhamento de Fases do Mise

## Resumo de Entregas & Fases

| Fase | Descrição | Status | Verificação |
|---|---|---|---|
| **Fase 0** | Planejamento, Arquitetura, ADRs, ERD, Segurança, Tokens | Concluído ✔ | Lint, Typecheck, ADRs validadas |
| **Fase 1** | Fundação: Monólito, Sessão/Auth, Bootstrap do Dono, Multi-loja, Design System | Concluído ✔ | Zero-pill, Clean empty-state, Bootstrap CLI |
| **Fase 2** | Unidades, Insumos, Embalagens, Fornecedores e Fichas Técnicas (CMV) | Concluído ✔ | Rendimento, Fator de Correção, Sub-receitas |
| **Fase 3** | Estoque: Movimentações, Custo Médio Ponderado, Perdas, Inventário Mobile | Concluído ✔ | Saldo derivado, Bloqueio de negativo |
| **Fase 4** | Compras: Pedidos, Recebimento c/ Atualização de Custo, Comparativo | Concluído ✔ | Conferência de entrada, Recálculo do CMP |
| **Fase 5** | Vendas: Importação CSV/XLSX, Mapeamento, Idempotência e Baixa por Ficha | Concluído ✔ | Hash de arquivo, Baixa de ingredientes |
| **Fase 6** | Financeiro: Contas a Pagar/Receber, Fluxo de Caixa, DRE Gerencial | Concluído ✔ | Centavos inteiros, DRE por loja e consolidado |
| **Fase 7** | Painel do Dono: CMV%, Margens, Alertas Acionáveis, Engenharia de Cardápio | Concluído ✔ | Matriz Kasavana & Smith, Auditoria de consistência |
| **Fase 8** | Produção: Ordens de Produção e Rendimento Real vs Teórico | Concluído ✔ | Baixa de insumos e entrada de produto intermediário |
| **Fase 9** | Mão de Obra e Metas Orçamentárias | Concluído ✔ | Alocação de mão de obra por loja e período |
| **Fase 10** | Rastreio de Lotes, Validade e Etiquetas | Concluído ✔ | Alerta de validade e descarte por lote |
| **Fase 11** | Conciliação Bancária (OFX) e Multi-Loja Consolidado | Concluído ✔ | Comparativo loja a loja e pareamento de extrato |
| **Fase 12** | Onboarding do Dono e Painel "Resultados do seu Negócio" | Concluído ✔ | Checklist guiado e economia mensurada |
| **Fase 13** | Conectores de Importação (iFood, POS) e Leitura de Documentos | Concluído ✔ | Parsers padronizados e mapeador inteligente |
| **Fase 14** | Endurecimento: LGPD, Segurança, Runbook, Checklist de Aceite e Go-Live | Concluído ✔ | Purge auditado, Exportação JSON completa, RUNBOOK |

---

## Marcos Principais
- **Camada A (Fases 0 a 7)**: Concluída com sucesso! Sistema operacional com domínio puro, zero dados fictícios, fichas técnicas em tempo real, controle de estoque auditado, importador de vendas, financeiro completo (DRE Gerencial e Fluxo de Caixa) e Painel do Dono.
- **Camadas B & C (Fases 8 a 14)**: Implementadas com rastreio de validade, ordens de produção, comparativo multi-loja, onboarding do gestor, parsers de POS/delivery e exportação/backup total sob conformidade LGPD.

---

## Verificações de Qualidade
- **Dinheiro**: 100% dos valores mantidos em centavos inteiros (`BIGINT` equivalent). Zero imprecisão de float.
- **Unidades**: Padronização estrita nas grandezas do SI (`g`, `ml`, `un`) com conversões explícitas.
- **Auditoria**: Todas as ações críticas (ajustes manuais de estoque, alterações de custo, exclusões de lançamentos e exportação/purge) gravadas de forma append-only no `AuditLog`.
- **Interface**: Conformidade com a constituição Frontend Design (Zero-Pill, WCAG AA, alvos móveis ≥ 44px, modo claro focado em legibilidade e rapidez operacional no celular).
- **Operação 100% Manual & Descomplicada**: Vendas manuais diretas, compras rápidas com cadastro de insumo no ato, lançamentos avulsos de caixa (entradas/saídas) e DRE simples sem obrigatoriedade de conectores ou arquivos externos.
- **Painel Detalhado com Períodos & 3 Gráficos Nativos**: Filtro temporal (Hoje, 7 dias, 30 dias, Mês Atual, Todo o período e intervalo customizado), Gráfico de Barras (Faturamento vs CMV vs Lucro), Gráfico de Linha/Área (Evolução do Saldo de Caixa) e Gráfico de Rosca/Donut (Destino de Cada Real Gasto com Insumos, Aluguel, Equipe e Concessionárias).

---

## Evolução M0 + Onda 1 (Valor Imediato em R$) — Concluído ✔

### Entregas M0: Diagnóstico e Fundações
- Mapeamento analítico de todas as 52 funcionalidades em `docs/melhorias/MAPA.md`.
- ADR 0004: Insight Engine com explicações determinísticas obrigatórias (`DomainExplanation`).
- ADR 0005: Campos de dados opcionais, migrações e degradação graciosa.

### Entregas Onda 1: Fórmulas Matemáticas & Código Puro
- **F01** Simulador "E se" de Insumo (`docs/formulas/F01-simulador-insumo.md`, `src/domain/cost-simulator.ts`)
- **F02** Ranking de Sensibilidade a Insumos (`docs/formulas/F02-ranking-sensibilidade.md`)
- **F03** Reajuste de Preço de Venda com Elasticidade Zero e Margem de Contribuição (`docs/formulas/F03-reajuste-margem.md`)
- **F07** Inflação Real da Cozinha via Índice de Laspeyres (`docs/formulas/F07-inflacao-cozinha-laspeyres.md`)
- **F08** Detecção de Faturamento sem Custo (`docs/formulas/F08-receita-sem-custo.md`, `src/domain/sales-intelligence.ts`)
- **F13** Variância de Uso de Insumos entre Contagens Físicas (`docs/formulas/F13-variancia-uso.md`, `src/domain/inventory-intelligence.ts`)
- **F14** Risco de Vencimento FEFO e Capital em Risco (`docs/formulas/F14-risco-vencimento-fefo.md`)
- **F25** Margem Líquida por Canal de Venda (`docs/formulas/F25-margem-por-canal.md`)
- **F26** Meta de Vendas do Dia Ponderada por Dia da Semana (`docs/formulas/F26-meta-do-dia.md`)
- **F28** Ponto de Equilíbrio Operacional com Estimativa de Dia (`docs/formulas/F28-ponto-equilibrio.md`)
- **F33** Decomposição Estrita da Variação de CMV: Preço + Volume + Uso/Mix = ΔCMV (`docs/formulas/F33-decomposicao-cmv.md`, `src/domain/cmv-decomposition.ts`)
- **F43** Similaridade Determinística para Mapeamento de Itens (`docs/formulas/F43-similaridade-mapeamento.md`, `src/domain/similarity.ts`)
- **F44** Parser Seguro de NF-e Mod 55/65 com Proteção Anti-XXE (`docs/formulas/F44-nfe-parser.md`, `src/domain/nfe-parser.ts`)
- **F48** Central de Valor Gerado: Economia Identificada vs Realizada (`docs/formulas/F48-central-de-valor.md`, `src/domain/value-engine.ts`)
- **F49** Fila "Faça Hoje" Ordenada por R$ em Jogo (`docs/formulas/F49-fila-faca-hoje.md`)
- **F51** Auditoria de Qualidade dos Dados em 4 Pilares (`docs/formulas/F51-qualidade-dos-dados.md`, `src/domain/data-quality.ts`)

### Interface e Verificação Integrada
- Modal Universal "Como calculamos" (`ExplanationModal`) integrado a todas as abas.
- Cartões na Dashboard: Central de Valor (F48/F49) e Raio-X de Qualidade dos Dados (F51).
- Modais interativos: Simulador "E se" de Insumos (F01/F02/F03/F07) e Importador de NF-e XML (F44).
- 100% de cobertura nos testes matemáticos (`scripts/run-tests.ts`, `tests/wave1.test.ts`).
- `tsc --noEmit` e `npm run build` 100% livres de erros.
