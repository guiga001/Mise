/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Mise — Tipos e Contratos Universais do Motor de Inteligência e Insights
 */

export interface DataSufficiency {
  suficiente: boolean;
  faltam?: string;
  percentualConfiabilidade: number; // 0 a 100
}

export interface DomainExplanation<T = number | string> {
  valor: T;
  unidade: string; // 'centavos', '%', 'dias', 'unidades', 'horas', 'R$/mês', 'índice'
  formula: string;
  entradas: Record<string, any>;
  passos: string[];
  suficienciaDeDados: DataSufficiency;
  confianca: 'ALTA' | 'MEDIA' | 'BAIXA' | 'INSUFICIENTE';
}

export interface InsightSnapshot {
  id: string;
  functionName: string;
  formulaVersion: string;
  inputHash: string;
  output: any;
  calculatedAt: string;
}

export interface ValueEvent {
  id: string;
  type: 'IDENTIFICADO' | 'REALIZADO';
  category: 'REAJUSTE_PRECO' | 'ECONOMIA_COMPRA' | 'PERDA_EVITADA' | 'TEMPO_ECONOMIZADO';
  title: string;
  description: string;
  amountInCents: number; // Valor monetário (em centavos)
  minutesSaved: number;
  evidenceDetails?: string;
  createdAt: string;
  explanation: DomainExplanation<number>;
}

export interface DailyTask {
  id: string;
  code: string; // ex: 'F03-PRICE-ADJUST', 'F14-FEFO-RISK'
  title: string;
  description: string;
  amountInPlayInCents: number; // R$ em jogo para ordenação estrita
  urgencyDays?: number;
  actionLabel: string;
  actionTab: string; // Tab para onde navegar
  actionPayload?: Record<string, any>;
  explanation: DomainExplanation<number>;
  completed: boolean;
}

export interface IngredientSimulationResult {
  ingredientId: string;
  ingredientName: string;
  originalUnitCostMicrocents: number;
  simulatedUnitCostMicrocents: number;
  priceDeltaPercentage: number;
  deltaMonthlyProfitInCents: number; // Negativo se for aumento de custo
  affectedRecipes: {
    recipeId: string;
    recipeName: string;
    portionCostBeforeInCents: number;
    portionCostAfterInCents: number;
    costDeltaInCents: number;
    monthlySalesVolume: number;
    monthlyImpactInCents: number;
  }[];
  explanation: DomainExplanation<number>;
}

export interface SensitivityItem {
  ingredientId: string;
  ingredientName: string;
  baseUnit: string;
  monthlyTheoreticalConsumption: number;
  currentUnitCostMicrocents: number;
  monthlySpendInCents: number;
  impactTenPercentInCents: number; // 10% do gasto
  percentOfTotalCmv: number;
}

export interface SensitivityRankingResult {
  items: SensitivityItem[];
  totalTheoreticalCmvInCents: number;
  top10RiskInCents: number;
  explanation: DomainExplanation<number>;
}

export interface MarginReadjustmentResult {
  recipeId: string;
  recipeName: string;
  currentPriceInCents: number;
  currentCostInCents: number;
  newCostInCents: number;
  targetMarginPercentage: number;
  suggestedNewPriceInCents: number;
  readjustmentPercentage: number;
  currentContributionMarginInCents: number;
  newContributionMarginInCents: number;
  maxTolerableVolumeDropPercentage: number; // 1 - MC/MC'
  explanation: DomainExplanation<number>;
}

export interface KitchenInflationResult {
  indexLaspeyres: number; // Base 100
  menuAveragePriceChangePercentage: number;
  gapMonthlyInCents: number;
  basePeriodCmvInCents: number;
  explanation: DomainExplanation<number>;
}

export interface UncostedRevenueReport {
  totalRevenueInCents: number;
  costedRevenueInCents: number;
  unmappedRevenueInCents: number;
  noRecipeRevenueInCents: number;
  totalUncostedRevenueInCents: number;
  uncostedPercentage: number;
  problematicItems: {
    externalProductName: string;
    quantity: number;
    revenueInCents: number;
    reason: 'SEM_MAPEAMENTO' | 'RECEITA_SEM_LINHAS';
  }[];
  explanation: DomainExplanation<number>;
}

export interface ChannelMarginItem {
  channel: string;
  grossRevenueInCents: number;
  cmvInCents: number;
  platformFeesInCents: number;
  paymentFeesInCents: number;
  packagingInCents: number;
  taxesInCents: number;
  netMarginInCents: number;
  netMarginPercentage: number;
}

export interface ChannelMarginReport {
  channels: ChannelMarginItem[];
  totalGrossRevenueInCents: number;
  totalNetMarginInCents: number;
  consolidatedNetMarginPercentage: number;
  explanation: DomainExplanation<number>;
}

export interface UsageVarianceItem {
  ingredientId: string;
  ingredientName: string;
  baseUnit: string;
  theoreticalConsumptionInBaseUnit: number;
  realConsumptionInBaseUnit: number;
  varianceInBaseUnit: number; // real - teórico
  variancePercentage: number;
  unitCostMicrocents: number;
  varianceInCents: number; // valor monetário do desvio/perda
}

export interface UsageVarianceReport {
  hasSufficientCounts: boolean;
  startDate?: string;
  endDate?: string;
  items: UsageVarianceItem[];
  totalDiscrepancyInCents: number;
  explanation: DomainExplanation<number>;
}

export interface FefoRiskItem {
  lotId: string;
  lotNumber: string;
  ingredientId: string;
  ingredientName: string;
  baseUnit: string;
  currentStockInBaseUnit: number;
  unitCostMicrocents: number;
  expirationDate: string;
  daysRemaining: number;
  dailyConsumptionInBaseUnit: number;
  projectedConsumptionInBaseUnit: number;
  excessInBaseUnit: number;
  amountAtRiskInCents: number;
  urgency: 'VENCIDO' | 'CRITICO' | 'ATENCAO' | 'SEGURO';
}

export interface FefoRiskReport {
  items: FefoRiskItem[];
  totalAmountAtRiskInCents: number;
  explanation: DomainExplanation<number>;
}

export interface CmvDecompositionResult {
  period0CmvInCents: number;
  period1CmvInCents: number;
  deltaCmvInCents: number;
  priceEffectInCents: number;
  volumeEffectInCents: number;
  usageMixEffectInCents: number;
  identityCheckPassed: boolean; // Preço + Volume + Uso == deltaCmv
  explanation: DomainExplanation<number>;
}

export interface DataQualityReport {
  score: number; // 0 a 100
  recipesCoveragePercentage: number;
  ingredientPricesFreshnessPercentage: number;
  salesRegularityPercentage: number;
  stockCountsFreshnessPercentage: number;
  confidenceLevel: 'ALTA' | 'MEDIA' | 'BAIXA';
  recommendations: string[];
  explanation: DomainExplanation<number>;
}
