# ADR 0001: Uma Instalação por Empresa (Arquitetura Single-Tenant Isolada)

## Status
Aceito

## Contexto
Sistemas tradicionais de gestão optam com frequência por arquiteturas multitenant compartilhadas com `tenant_id` e políticas de RLS. Para operações alimentícias com dados sensíveis de margem, receitas exclusivas, custos industriais e segredos de negócio, vazamentos entre clientes ou lentidão causada por "vizinhos barulhentos" representam riscos graves. Além disso, a complexidade acidental de checar `tenant_id` em cada query sobrecarrega o código e cria brechas de segurança.

## Decisão
O Mise adota **uma instalação independente com banco de dados próprio para cada empresa**.
- Nenhuma tabela do sistema possui coluna `tenant_id`.
- Não existe suporte a Super Admin, impersonação de clientes, planos de assinatura ou limites artificiais no código.
- Cada empresa pode possuir uma ou mais lojas (`Store`) geridas na mesma instalação física, compartilhando receitas e consolidação contábil com estrita segregação por `store_id`.

## Consequências
- **Positivas**: Segurança absoluta por isolamento de dados; código muito mais simples e seguro; backup/restore trivial por empresa; conformidade instantânea com LGPD para isolamento de dados.
- **Negativas**: A gestão de infraestrutura requer orquestração por container/instância (tratada via Docker Compose e scripts de automação no RUNBOOK).
