# F17 — Lista de Compras Otimizada

## 1. Definição Matemática
Calcula a quantidade necessária de compra por insumo no horizonte de planejamento:
$$\text{Horizonte} = \text{Lead Time (dias)} + \text{Ciclo de Compra (dias)}$$
$$\text{Demanda Projetada} = \bar{d} \times \text{Horizonte}$$
$$\text{Necessidade Bruta} = \max(0, \text{Demanda Projetada} + SS - \text{Saldo Atual} - \text{Pedidos em Aberto})$$

A quantidade é arredondada para cima ao múltiplo inteiro da embalagem comercial do fornecedor:
$$\text{Embalagens} = \lceil \text{Necessidade Bruta} / \text{Tamanho da Embalagem} \rceil$$
$$\text{Quantidade Sugerida} = \text{Embalagens} \times \text{Tamanho da Embalagem}$$

Se o pedido para o fornecedor não atingir o **Pedido Mínimo em R$**, um algoritmo guloso complementa o pedido adicionando embalagens dos itens do mesmo fornecedor que possuem a **menor cobertura em dias**, até superar o pedido mínimo.

## 2. Exemplo Calculado à Mão
- Insumo: Farinha de Trigo. Embalagem: Fardo de $25{.}000\text{ g}$.
- Demanda diária $\bar{d} = 10{.}000\text{ g}$. Horizonte $= 3 + 4 = 7\text{ dias}$. Demanda $= 70{.}000\text{ g}$.
- $SS = 15{.}000\text{ g}$. Saldo atual $= 20{.}000\text{ g}$. Em aberto $= 0$.
- Necessidade $= 70{.}000 + 15{.}000 - 20{.}000 = 65{.}000\text{ g}$.
- Fardos necessários: $\lceil 65{.}000 / 25{.}000 \rceil = \lceil 2{,}6 \rceil = 3\text{ fardos}$.
- Quantidade final sugerida: $75{.}000\text{ g}$ (3 fardos de 25 kg).

## 3. Limites e Casos de Borda
- O resultado é determinístico e independente da ordem de iteração da lista.
- Se a necessidade bruta for 0, nenhuma compra é sugerida.
