# ADR 0004: Motor de Insights com Explicações Estruturadas e Snapshots Imutáveis

## Contexto
O Mise precisa entregar inteligência determinística para o gestor de comércio alimentício sem o uso de IA ou heurísticas mágicas. Todo insight gerado precisa responder com clareza à pergunta: "Como calculamos?", demonstrando os dados de entrada, a fórmula pura aplicada, os passos intermediários e o nível de confiança com base na suficiência dos dados históricos.

## Decisão
1. **Contrato Universal de Explicação**:
   Toda função de inteligência e cálculo em `src/domain/` deve retornar ou conter a estrutura canônica:
   ```typescript
   export interface DomainExplanation<T = number> {
     valor: T;
     unidade: string; // 'centavos', '%', 'dias', 'unidades', 'horas'
     formula: string; // Expressão matemática formal em texto
     entradas: Record<string, any>;
     passos: string[]; // Raciocínio numérico passo a passo em português claro
     suficienciaDeDados: {
       suficiente: boolean;
       faltam?: string; // ex: "Faltam 5 dias de vendas para atingir a janela mínima de 14 dias"
       percentualConfiabilidade: number; // 0 a 100
     };
     confianca: 'ALTA' | 'MEDIA' | 'BAIXA' | 'INSUFICIENTE';
   }
   ```
2. **Separação Rígida entre IDENTIFICADO e REALIZADO**:
   - `IDENTIFICADO`: oportunidade teórica identificada nos dados (ex: se reajustar o prato ou trocar de fornecedor, poupará R$ X/mês).
   - `REALIZADO`: ganho concretizado e auditável (ex: compra efetuada com valor menor, lote consumido antes de vencer, venda faturada com novo preço).
   - É estritamente proibido somar valores identificados como se fossem ganhos realizados na Central de Valor (`F48`).
3. **Persistência de Snapshots**:
   Para auditoria e reproduzibilidade, insights gerados gravam um `InsightSnapshot` contendo a versão da fórmula, hash das entradas, saída e timestamp de cálculo.

## Consequências
- A transparência com o cliente é total, gerando alta confiança nos números.
- Casos com dados insuficientes não geram números enganosos ou "zero" arbitrário.
- Toda evolução em fórmulas exige incremento de versão de fórmula para não invalidar o histórico.
