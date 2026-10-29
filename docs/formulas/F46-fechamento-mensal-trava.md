# F46 — Fechamento Mensal Guiado e Trava de Período

## 1. Definição Matemática e Checklist Determinístico
Um período mensal fechado não pode ser alterado retroativamente por engano, garantindo integridade contábil e de conciliação.
O fechamento executa 5 verificações determinísticas booleanas:
1. **Dias com Vendas**: Verifica se todos os dias úteis de operação possuem registros de vendas importados.
2. **Contas Classificadas**: Verifica se $100\%$ das contas pagas possuem categoria definida (sem despesas anônimas).
3. **Contagem de Estoque Realizada**: Verifica se houve pelo menos uma contagem física de estoque nos últimos dias do mês para apuração de variância (F13).
4. **Vendas sem Ficha**: Verifica se a receita sem custo (F08) é $0\%$ ou se os produtos vendidos foram mapeados.
5. **Divergências de Caixa**: Compara o saldo final de caixa registrado contra o saldo calculado das entradas e saídas.

Ao acionar **Travar Período**:
- Grava status `LOCKED` para o mês/ano correspondente no banco.
- Gera registro imutável no `AuditLog`.
- Qualquer tentativa de exclusão ou edição de vendas/movimentos do período travado exige desbloqueio explícito justificado com novo registro em auditoria.
- Exporta o **Pacote do Contador**: DRE gerencial, Contas a Pagar/Receber e Movimentações em arquivo estruturado.

## 2. Exemplo
- Mês: 09/2026.
- 30 dias com vendas (100% ✔), 45 contas todas categorizadas (100% ✔), 1 contagem realizada no dia 30 (✔), 0 vendas sem ficha (✔).
- Checklist 100% apto $\implies$ Trava habilitada.
