# ADR 0003: Unidades-Base Canônicas e Conversões Explícitas

## Status
Aceito

## Contexto
Na gastronomia e indústria alimentícia, compras ocorrem em embalagens comerciais diversas (saco de 25 kg, fardo com 12 garrafas de 900 ml, caixa com 30 ovos), enquanto receitas consomem frações mínimas (gramas, mililitros, unidades). Erros em conversões manuais são a maior fonte de distorção de estoque e custo real (CMV).

## Decisão
1. Toda matéria-prima (insumo) é padronizada estritamente em **uma única unidade-base canônica**:
   - Massa: `g` (grama)
   - Volume: `ml` (mililitro)
   - Unidade discreta: `un` (unidade)
2. Conversões comerciais de compra (ex: Saco de 25kg = 25.000g) devem ser cadastradas de forma explícita na entidade `IngredientPackaging` / `UnitConversion`.
3. Conversões cruzadas entre grandezas incompatíveis (ex: colheres para gramas, xícaras para ml) só ocorrem se houver fator de densidade/peso unitário registrado. Caso contrário, o sistema rejeita a operação com erro de domínio explícito.

## Consequências
- A explosão de receitas em fichas técnicas e a baixa de estoque ocorrem de forma 100% determinística.
- Eliminação de discrepâncias ao receber caixas, fardos ou latas.
