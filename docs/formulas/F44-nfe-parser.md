# Fórmula F44 — Leitura de XML de NF-e de Compra (Parser Determinístico e Seguro)

## Definição
Lê arquivos XML de Nota Fiscal Eletrônica de Compra (Modelo 55 ou NFC-e Modelo 65) conforme especificação oficial do Manual de Orientação do Contribuinte (MOC da SEFAZ). Extrai os itens (`<det>`), dados do fornecedor (`<emit>`), valores, tributos e chave de acesso de 44 dígitos (`<chNFe>`).

## Regras de Segurança e Integridade
1. **Proteção contra XXE (XML External Entity)**: Parser com desativação total de DTD e entidades externas.
2. **Deduplicação Estrita**:
   - Cada NF-e possui uma chave única de 44 dígitos extraída de `<chNFe>` ou do atributo `Id` da tag `<infNFe>`.
   - Reimportação do mesmo XML é detectada e rejeitada com aviso idempotente.
3. **Extração de Itens**:
   - Descrição do produto: `<xProd>`
   - Código NCM: `<NCM>`
   - Unidade de medida comercializada: `<uCom>`
   - Quantidade comercializada: `<qCom>` (convertida de string numérica)
   - Valor unitário de comercialização: `<vUnCom>`
   - Valor total do produto: `<vProd>` (em centavos inteiros)
   - Data de emissão: `<dhEmi>` ou `<dEmi>`
4. **Conversão de Embalagens**:
   - Se o insumo estiver cadastrado com unidade-base diferente (ex: `<uCom>` = CX e base = g), solicita confirmação da conversão de embalagem caso não exista regra prévia.

## Aceite
- Reimportação da mesma chave gera aviso e não duplica lançamentos em estoque ou contas a pagar.
