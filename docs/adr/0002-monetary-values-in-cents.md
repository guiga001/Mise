# ADR 0002: Representação Monetária em Centavos Inteiros (BigInt/Int)

## Status
Aceito

## Contexto
O padrão IEEE-754 de ponto flutuante em JavaScript (`number`) e bancos de dados gera dízimas e imprecisões aritméticas inaceitáveis para gestão financeira e contábil (ex: `0.1 + 0.2 === 0.30000000000000004`). Em fichas técnicas, compras com milhares de quilos e DRE, pequenos erros cumulativos distorcem o lucro líquido e o CMV.

## Decisão
1. Todas as quantias monetárias finais (contas a pagar, faturamento, caixa, valor do estoque, totais de pedidos) são armazenadas e calculadas em **centavos inteiros** (`BIGINT` no banco, `bigint` ou inteiros estritos na aplicação). R$ 12,50 é armazenado como `1250`.
2. Custos unitários de insumos por unidade-base (ex: custo por grama de açafrão ou farinha) utilizam representação fracionária de alta precisão (microcentavos ou fator de escala 10^6) com arredondamento padrão bancário (`half-even` ou `round-to-nearest`) apenas no fechamento das parcelas ou totais.
3. Toda operação financeira inclui chave de idempotência (`idempotency_key`).

## Consequências
- Zero distorções de centavos em balancetes e DREs.
- Total compatibilidade com gateways bancários e relatórios contábeis.
