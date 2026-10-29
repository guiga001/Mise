# RUNBOOK — Operação, Deploy e Administração do Mise

## 1. Visão Geral da Operação
O Mise opera sob o princípio de **uma instalação independente por empresa**. O banco de dados armazena os dados restritos àquela organização e suas respectivas lojas. Não existem super-administradores externos.

---

## 2. Primeiro Acesso: Bootstrap do Dono
Quando a instalação é inicializada pela primeira vez, o banco de dados encontra-se **completamente vazio**.

### Modo 1: Interface Web (Primeiro Acesso Automático)
Ao acessar a URL da aplicação pela primeira vez, a interface detecta a ausência de proprietário cadastrado e exibe a tela segura de **Inicialização do Dono**, solicitando:
- Razão Social / Nome Fantasia da Empresa
- Nome da Primeira Loja / Unidade Matriz
- Nome, E-mail e Senha Forte do Proprietário

### Modo 2: Headless CLI (Automação de Infraestrutura / Docker)
Para ambientes provisionados automaticamente via container:
```bash
# Execução interativa ou com variáveis de ambiente:
COMPANY_NAME="Restaurante Sabor & Raiz" \
STORE_NAME="Matriz Jardins" \
OWNER_NAME="Guilherme Cavalcanti" \
OWNER_EMAIL="dono@restaurante.com.br" \
OWNER_PASSWORD="SenhaSuperForte123!" \
npx tsx scripts/bootstrap-owner.ts
```
*Nota de Segurança: O script recusa-se categoricamente a rodar se já existir um dono registrado.*

---

## 3. Rotinas de Backup e Restore
- **Backup dos Dados (Exportação Completa)**:
  Disponível no menu `Configurações > Exportar Dados (LGPD)`. Gera um arquivo JSON criptograficamente estruturado com hash SHA-256 e timestamp ISO.
- **Restauração**:
  Importação do arquivo de backup no módulo de configuração restaura o estado integral da empresa.
- **RPO**: $\le$ 15 minutos em storage persistente.
- **RTO**: $\le$ 1 hora para restabelecimento da instância.

---

## 4. Verificação de Saúde (Health Check)
A aplicação responde no endpoint `/api/health` com status HTTP 200 e confirmação de prontidão de armazenamento.
