# Fórmula F48 — Central de Valor "A Mise te trouxe R$ X"

## Definição
Mapeia e consolida o retorno financeiro proporcionado pelo Mise para o dono da empresa, distinguindo rigorosamente o valor financeiro **IDENTIFICADO** (potencial de economia ou ganho de margem calculado) do valor **REALIZADO** (ganho confirmado por transações e compras reais comprovadas no sistema). Adicionalmente, computa as horas operacionais economizadas por automações.

## Fórmulas
1. **Valor Total Identificado**:
   $$ValorIdentificado = \sum_{e \in EventosIdentificados} GanhosPotenciais(e)$$
2. **Valor Total Realizado**:
   $$ValorRealizado = \sum_{e \in EventosRealizados} EconomiaComprovada(e)$$
   *Invariante: $ValorRealizado \le ValorIdentificado$ para o mesmo ciclo.*
3. **Evidências para Valor Realizado**:
   - Compra realizada com custo unitário inferior à mediana histórica $\to$ Economia Realizada = $(CustoMediana - CustoPago) \times Quantidade$.
   - Lote em risco de vencimento consumido ou vendido antes do descarte $\to$ Perda Evitada = $ValorLotePreservado$.
   - Reajuste de preço de prato aplicado e verificado em vendas subseqüentes $\to$ Margem Adicional Realizada = $(PreçoNovo - PreçoAntigo) \times VendasNovas$.
4. **Horas Economizadas**:
   $$MinutosEconomizados = \sum (EventosAutomatizados \times MinutosReferenciaTarefa)$$
   $$HorasEconomizadas = \frac{MinutosEconomizados}{60}$$
   *Minutos de referência padrão (configuráveis pelo dono em Configurações):*
   - Importação e baixa automática de vendas: 15 minutos / importação.
   - Leitura de XML de NF-e vs digitação manual: 20 minutos / nota fiscal.
   - Cálculo e conciliação de DRE e estoque: 60 minutos / fechamento.

## Aceite
- É estritamente proibido somar oportunidades potenciais ao montante de ganhos realizados.
