# Diretrizes de Segurança e LGPD — Mise

## Modelo de Ameaças (STRIDE)
- **Spoofing**: Autenticação segura com credenciais protegidas e sessões revogáveis com controle de dispositivos.
- **Tampering**: Histórico de estoque e movimentações financeiras imutáveis; auditoria `AuditLog` com bloqueio de deleção/edição e idempotência em todas as ações de escrita.
- **Repudiation**: Todas as alterações sensíveis (ajustes de custo, exclusões de compras, recontagens de estoque, exportação total) registram autor, timestamp UTC e IP/agente.
- **Information Disclosure**: Isolamento estrito de dados (single-tenant físico); sem exposição de salários em telas operacionais; nenhum dado pessoal sensível exposto em logs.
- **Denial of Service**: Uploads com limitação estrita de tamanho (limite 15MB para planilhas CSV/XLSX), proteção contra XML External Entity (XXE) e descompressão segura.
- **Elevation of Privilege**: Papel canônico `DONO` para administradores, sócios e contadores convidados com permissões validadas no servidor.

## Conformidade LGPD (Lei 13.709/2018)
1. **Minimização de Dados**: Coleta restrita a nome, e-mail comercial e dados cadastrais de insumos/fornecedores.
2. **Direito de Portabilidade**: O dono pode exportar o arquivo JSON integral de todos os seus dados a qualquer momento com 1 clique.
3. **Direito de Eliminação**: Opção de encerramento da empresa com confirmação dupla, exportação prévia e eliminação irrevogável de todos os registros armazenados.
