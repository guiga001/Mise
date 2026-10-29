# F12 — Capital Parado e Custo de Oportunidade

## 1. Definição Matemática
Identifica insumos armazenados que não registraram nenhuma saída (por venda, produção ou descarte) nos últimos $N$ dias ($N$ configurado pelo gestor, padrão 30 dias).

$$\text{Capital Parado Total (centavos)} = \sum_{i \in \text{Itens Parados}} \text{Saldo}_i \times \text{Custo Médio Ponderado}_i$$
$$\text{Custo de Oportunidade Mensal} = \text{Capital Parado Total} \times \text{Taxa Mensal de Oportunidade}$$

Onde a taxa mensal de oportunidade é informada pelo dono (ex.: CDI líquido de 1% a.m.).

## 2. Exemplo Calculado à Mão
- Insumo A: 20 un de garrafas especiais sem saída há 45 dias. Custo unitário R$ 35,00.
  Valor parado $= 20 \times 35{,}00 = \text{R\$} 700{,}00 = 70{.}000\text{ centavos}$.
- Insumo B: 15 kg de especiaria importada sem saída há 60 dias. Custo R$ 80,00/kg.
  Valor parado $= 15 \times 80{,}00 = \text{R\$} 1{.}200{,}00 = 120{.}000\text{ centavos}$.
- Total de Capital Parado $= \text{R\$} 1{.}900{,}00 = 190{.}000\text{ centavos}$.
- Taxa mensal de oportunidade $= 1\% = 0{,}01$.
- Custo de oportunidade mensal $= 1{.}900 \times 0{,}01 = \text{R\$} 19{,}00/\text{mês} = 1{.}900\text{ centavos}$.

## 3. Limites e Casos de Borda
- Se $N$ não for informado pelo dono, a interface solicita o preenchimento da regra de corte.
- Sem taxa informada, o valor de capital parado é exibido, mas o custo de oportunidade indica necessidade de taxa em Configurações.
- Itens com saldo zero ou negativo nunca entram no cálculo de capital parado.
