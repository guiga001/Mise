# MAPA.md — Diagnóstico e Cruzamento de Funcionalidades (Fase M0)

Este documento registra o diagnóstico do MVP existente frente ao catálogo de funcionalidades (F01 a F52), classificando cada item em:
- **JÁ EXISTE**: presente no MVP, evoluir para incluir explicação detalhada, snapshot e parâmetros puros sem quebrar comportamento prévio.
- **PARCIAL**: estrutura base ou cálculo inicial presente, necessita expansão matemática, contrato de explicação e/ou campos adicionais.
- **NÃO EXISTE**: funcionalidade nova a ser construída em domínio puro, com documentação de fórmula em `docs/formulas/`, testes rigorosos e integração na interface.

---

## Tabela de Cruzamento e Diagnóstico

| ID | Nome | Status MVP | Ação Necessária |
|---|---|---|---|
| **F01** | Simulador "e se?" de insumo | NÃO EXISTE | Criar motor em `domain/cost-simulator.ts` com propagação em árvore de receitas/sub-receitas e cálculo de Δlucro/mês. |
| **F02** | Ranking de sensibilidade | PARCIAL | Fórmulas parciais de CMV existem; consolidar sensibilidade com impacto de +10% e ordenação por R$/mês. |
| **F03** | Reajuste para manter a margem | NÃO EXISTE | Criar cálculo de novo preço de venda mantendo margem-alvo e limite de tolerância de perda de volume (`1 - MC/MC'`). |
| **F04** | Simulador de preço com elasticidade | NÃO EXISTE | Criar função pura com parâmetro de elasticidade informado pelo dono e varredura discreta de preço ótimo. |
| **F05** | Preço mínimo por canal | NÃO EXISTE | Fórmulas deduzindo taxas de entrega, comissão e taxas financeiras por canal. |
| **F06** | Preço de combo | NÃO EXISTE | Soma de insumos dos itens, margem combinada e teto de desconto seguro. |
| **F07** | Índice de inflação da cozinha (Laspeyres) | NÃO EXISTE | Calcular índice de Laspeyres ponderado pelo consumo base e gap de reajuste vs CMV. |
| **F08** | Receita sem custo (custos ocultos) | PARCIAL | Mapeamento já existe; calcular % e R$ da receita de produtos sem ficha ou sem vínculo. |
| **F09** | Cobertura e giro de estoque | PARCIAL | Saldo existe; calcular consumo diário via MAD, giro e dias de estoque com tratamento de consumo zero. |
| **F10** | Reposição inteligente (SS, ROP, EOQ) | NÃO EXISTE | Implementar inverso da normal determinístico, cálculo de estoque de segurança, ponto de pedido e EOQ limitado pela validade. |
| **F11** | Curva ABC × XYZ | PARCIAL | Curva ABC já existe no MVP; construir matriz bidimensional ABC (valor) x XYZ (coeficiente de variação do consumo). |
| **F12** | Capital parado | PARCIAL | Valorização existe; filtrar insumos sem movimentação há N dias e calcular custo de oportunidade mensal. |
| **F13** | Variância de uso (teórico × real) | PARCIAL | Contagem de estoque existe; comparar consumo teórico derivado das vendas com consumo real apurado entre 2 contagens. |
| **F14** | Risco de vencimento (FEFO) | PARCIAL | Campos de validade existem; projetar consumo até a validade e calcular R$ em risco por lote. |
| **F15** | Preço mínimo de liquidação | NÃO EXISTE | Calcular piso de custo afundado vs custo total para itens em risco de descarte. |
| **F16** | Balanceamento entre lojas | NÃO EXISTE | Algoritmo de nivelamento entre excedente e necessidade respeitando pisos e custo de frete. |
| **F17** | Lista de compras otimizada | PARCIAL | Pedidos de compra existem; otimizar considerando demanda prevista, estoque mínimo, lote de embalagem e fornecedor mais barato. |
| **F18** | Custo efetivo de prazo | NÃO EXISTE | Taxa implícita em desconto à vista vs prazo e confronto com taxa do caixa. |
| **F19** | Preço fora da curva | NÃO EXISTE | Detecção de outliers em compras via Z-Score modificado com mediana e MAD. |
| **F20** | Orçamento de compras | NÃO EXISTE | Acompanhamento de metas de compras por categoria vs realizado e projeção fim de mês. |
| **F21** | Calendário de compras | NÃO EXISTE | Cálculo retroativo a partir do lead time do fornecedor e dia de corte. |
| **F22** | Previsão de demanda por produto/dia | NÃO EXISTE | Modelos determinísticos (média por dia da semana, EWMA e Holt-Winters) com backtest rolling origin e seleção por menor RMSE/MAPE. |
| **F23** | Mapa de vendas | PARCIAL | Vendas por data existem; agregar dia da semana x faixa horária quando disponível. |
| **F24** | Cesta de compra (afinidade) | NÃO EXISTE | Análise de associação de pedidos (suporte, confiança e lift) para sugerir combos. |
| **F25** | Margem líquida real por canal | PARCIAL | DRE geral existe; segregar receita, taxas de plataforma, embalagens e CMV por canal. |
| **F26** | Meta do dia | NÃO EXISTE | Cálculo da meta diária necessária para atingir ponto de equilíbrio e lucro-alvo, ponderada pelo histórico da semana. |
| **F27** | Queda anômala de vendas | NÃO EXISTE | Comparação com mesmo dia da semana via z robusto (mediana/MAD) com tolerância a feriados/dias fechados. |
| **F28** | Ponto de equilíbrio (mês e dia) | JÁ EXISTE | Evoluir com explicação completa, dias estimados para atingir o PE e aviso para MC% <= 0. |
| **F29** | Fluxo de caixa projetado com cenários | PARCIAL | Fluxo diário simples existe; projetar com demanda F22, contas a pagar/receber e cenários de estresse. |
| **F30** | Quanto posso retirar | NÃO EXISTE | Cálculo do valor máximo seguro de pró-labore/distribuição baseado no menor saldo projetado e reservas obrigatórias. |
| **F31** | Custo das maquininhas e antecipação | NÃO EXISTE | Custo efetivo mensal de antecipação e taxa média ponderada de adquirentes. |
| **F32** | Ciclo de caixa (PME + PMR - PMP) | NÃO EXISTE | Cálculo dos prazos médios e necessidade estimada de capital de giro (NCG). |
| **F33** | Decomposição da variação de CMV | NÃO EXISTE | Identidade matemática estrita: Efeito Preço + Efeito Volume + Efeito Mix/Uso = ΔCMV exato. |
| **F34** | DRE comparativo e Pareto de despesas | PARCIAL | DRE existe; criar visão comparativa mês a mês e curva ABC/Pareto de contas a pagar. |
| **F35** | Provisões e imposto estimado | NÃO EXISTE | Provisão trabalhista (13º/férias) e alíquota efetiva configurável do Simples Nacional ou regime próprio. |
| **F36** | Simulador de financiamento (Price/SAC/TIR) | NÃO EXISTE | Tabelas de amortização e taxa interna de retorno determinística por bisseção. |
| **F37** | Reagendador de pagamentos | NÃO EXISTE | Algoritmo guloso para sugerir movimentação de despesas com datas flexíveis para eliminar saldo negativo. |
| **F38** | Planejamento de produção | PARCIAL | Ordens de produção existem; explosão recursiva de sub-receitas até insumos base a partir da previsão F22. |
| **F39** | Rendimento e custo por lote | PARCIAL | Rendimento real existe na OP; adicionar análise estatística de controle de qualidade (média ± 3σ). |
| **F40** | Mix ótimo com recurso escasso | NÃO EXISTE | Otimização linear com restrição de capacidade (forno/tempo) por margem de contribuição por unidade de recurso. |
| **F41** | Mão de obra: produtividade e escala | NÃO EXISTE | Horas necessárias por dia a partir da demanda prevista e produtividade-alvo. |
| **F42** | Benchmark entre lojas | PARCIAL | Visão consolidada existe; adicionar ranking comparativo, MAD e cálculo do ganho financeiro se igualasse a melhor loja. |
| **F43** | Mapeamento automático por similaridade | NÃO EXISTE | Algoritmo determinístico de Jaro-Winkler e token overlap para vincular itens de vendas a receitas. |
| **F44** | Leitura de XML de NF-e | NÃO EXISTE | Parser seguro sem XXE de NF-e (XML modelo 55) com extração de itens, conversão de embalagem e deduplicação por Chave de Acesso (44 dígitos). |
| **F45** | Edição em lote e planilha rápida | NÃO EXISTE | Interface com reajuste em massa de insumos e fichas com histórico e simulação de impacto. |
| **F46** | Fechamento mensal guiado | NÃO EXISTE | Checklist determinístico de pré-requisitos contábeis e travamento de período com pacote exportável para contador. |
| **F47** | Contas recorrentes com reajuste | PARCIAL | Flag de recorrência existe; tratar meses com 28/29/30/31 dias e reajuste por índice. |
| **F48** | Central de valor "A Mise te trouxe R$ X" | NÃO EXISTE | Consolidador de ganhos auditáveis separando estritamente IDENTIFICADO de REALIZADO, mais horas economizadas. |
| **F49** | Fila "Faça hoje" | NÃO EXISTE | Fila de recomendações e tarefas ordenadas por R$ em jogo com botão de ação direta. |
| **F50** | Termômetro do negócio (0 a 100) | NÃO EXISTE | Score de saúde baseado em CMV%, margem de segurança, giro e liquidez, detalhando cada componente. |
| **F51** | Qualidade dos dados | NÃO EXISTE | Índices de confiabilidade de dados (cobertura de fichas técnicas, atualização de custos, regularidade de vendas). |
| **F52** | Relatório Raio-X do Mês | PARCIAL | DRE exportável existe; estruturar relatório executivo impresso/PDF com destaques determinísticos. |

---

## Linha de Base Validada
- Lint: `npm run lint` passou (0 erros).
- Typecheck: `tsc --noEmit` passou (0 erros).
- Testes: `npx tsx scripts/run-tests.ts` passou com 100% de sucesso nas 6 asserções canônicas de domínio.
- Build: `npm run build` compilou com sucesso.
