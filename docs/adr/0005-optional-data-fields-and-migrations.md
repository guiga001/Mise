# ADR 0005: Extensão de Dados com Campos Opcionais sem Quebra de Compatibilidade

## Contexto
O MVP inicial gravava vendas e estoque com campos básicos. As funcionalidades analíticas avançadas (análise por canal, mapa de vendas por hora, lote e validade no estoque, formas de pagamento) requerem granularidade adicional. Contudo, dados prévios e instalações com histórico não podem ser corrompidos.

## Decisão
1. **Padrão Expand & Contract**:
   Todos os novos campos em `SalesImportLine`, `SalesImport`, `StockMovement`, `StockLot`, `PayableEntry` e `ReceivableEntry` são modelados como estritamente opcionais (`campo?: tipo`).
2. **Novos Campos Opcionais Adicionados**:
   - `SalesImportLine`:
     - `orderId?: string` (para análise de cesta e afinidade F24)
     - `saleHour?: number` (0 a 23, para mapa de vendas por hora F23)
     - `channel?: string` (balcão, delivery, salão, marketplace F25)
     - `paymentMethod?: string` (crédito, débito, pix, dinheiro F31)
   - `StockMovement` / `StockLot`:
     - `lotNumber?: string`
     - `expirationDate?: string` (para controle FEFO F14)
   - `CompanySettings`:
     - Parâmetros informados pelo dono: taxas de adquirente, custo de oportunidade do caixa, dias de referência de corte, alíquotas do Simples, minutos de referência por tarefa.
3. **Comportamento com Ausência de Dados**:
   Se um campo opcional não foi preenchido na importação, a função analítica não inventa valores nem assume zero silencioso; emite `suficienciaDeDados.suficiente = false` com mensagem elucidativa ao usuário.

## Consequências
- Compatibilidade reversa de 100% com dados já gravados no `localStorage` ou banco existente.
- Migrações são transparentes e nunca exigem exclusão de registros legados.
