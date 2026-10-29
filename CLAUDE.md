# CLAUDE.md — Diretrizes de Engenharia do Mise

## Visão Geral
**Mise** é o sistema de gestão e inteligência de margem para comércio alimentício (restaurantes, bares, padarias, confeitarias, lanchonetes e cozinhas centrais).

- **Arquitetura**: Monolítico modular com separação estrita de camadas (UI → Actions/Handlers → Serviços de Domínio Puro → Repositório).
- **Inquilino Único**: 1 instalação = 1 empresa. Banco isolado, sem `tenant_id` em tabelas e sem multi-empresa no mesmo banco.
- **Usuário Único/Papel Único**: `DONO` (sócios e contadores podem ser convidados com o mesmo papel).
- **Pergunta Central do Dono**: *"Estou ganhando dinheiro? Em qual produto, em qual loja, e onde estou perdendo?"*

---

## Regras Invioláveis do Domínio

1. **Dinheiro**:
   - Sempre representado em **BIGINT centavos** (inteiro). Nunca usar `float` ou `number` com decimais para somas e valores contábeis.
   - Custo unitário em base unitária com alta precisão (microcentavos ou até 6 casas decimais) e arredondamento estrito e documentado para centavos no total.
   - Todas as transações financeiras possuem chave de idempotência (`idempotency_key`).

2. **Unidades de Medida**:
   - Cada insumo possui uma única unidade-base do SI (`g`, `ml`, `un`).
   - Conversões de embalagem (ex: Caixa de 12kg para gramas) são sempre explícitas via tabela `UnitConversion`.
   - Proibida conversão implícita ou mágica entre grandezas incompatíveis (ex: volume para massa sem densidade cadastrada).

3. **Estoque**:
   - Saldo de estoque é **sempre derivado** do histórico de movimentações (`StockMovement`). O saldo nunca é editado diretamente.
   - Custo Médio Ponderado (CMP) recalculado a cada recebimento de compra.
   - Baixa automática de estoque orientada pelas fichas técnicas a cada importação de vendas.
   - Estoque negativo é bloqueado por padrão, exceto com confirmação explícita auditada no `AuditLog`.

4. **Zero Dados Fictícios / Zero Slop**:
   - O banco de dados inicia estritamente vazio. Estados vazios devem ser acionáveis com botões de primeiro cadastro.
   - Design System limpo com disciplina Zero-Pill: metadados limpos com separadores tipográficos (`·`), sem tags em cápsulas infladas.

---

## Comandos Principais

```bash
# Executar em desenvolvimento
npm run dev

# Validar tipagem e linting
npm run lint

# Executar build de produção
npm run build

# Bootstrap do primeiro acesso (Headless CLI)
npx tsx scripts/bootstrap-owner.ts
```

---

## Estrutura de Arquivos
- `/docs/PROGRESS.md`: Acompanhamento de fases e auditorias de qualidade.
- `/docs/adr/`: Registros de Decisões Arquiteturais (ADRs).
- `/src/domain/`: Módulos de lógica pura de negócio (testáveis, sem dependência de framework).
  - `types.ts`: Modelos de dados e contratos canônicos.
  - `units.ts`: Conversão de unidades e regras matemáticas.
  - `recipe.ts`: Rendimento, fator de correção/cocção e cálculo de CMV.
  - `inventory.ts`: Custo médio ponderado, PEPS, inventário e curvas ABC.
  - `sales.ts`: Deduplicação de vendas, importação e explosão de insumos.
  - `financial.ts`: DRE gerencial, fluxo de caixa e ponto de equilíbrio.
  - `menu-engineering.ts`: Matriz de Engenharia de Cardápio (Kasavana & Smith).
- `/src/lib/storage.ts`: Camada de persistência reativa, idempotência e auditoria.
- `/src/components/`: Componentes da UI (design system, telas do dono, formulários móveis).
- `/scripts/bootstrap-owner.ts`: Script de criação da empresa e dono no primeiro acesso.
