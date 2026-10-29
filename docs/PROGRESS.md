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
