/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Mise — Headless CLI Bootstrap do Dono
 * Uso:
 *   COMPANY_NAME="Restaurante Sabor" STORE_NAME="Matriz" OWNER_NAME="Guilherme" OWNER_EMAIL="guilherme@restaurante.com" npx tsx scripts/bootstrap-owner.ts
 */

import * as readline from 'readline';

function ask(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function run() {
  console.log('==================================================');
  console.log('       MISE — INICIALIZAÇÃO DO PRIMEIRO ACESSO     ');
  console.log('==================================================\n');

  let companyName = process.env.COMPANY_NAME;
  let storeName = process.env.STORE_NAME;
  let ownerName = process.env.OWNER_NAME;
  let ownerEmail = process.env.OWNER_EMAIL;

  if (!companyName) {
    companyName = await ask('Razão Social / Nome da Empresa: ');
  }
  if (!storeName) {
    storeName = await ask('Nome da Primeira Loja / Matriz: ');
  }
  if (!ownerName) {
    ownerName = await ask('Nome Completo do Proprietário / Gestor: ');
  }
  if (!ownerEmail) {
    ownerEmail = await ask('E-mail do Proprietário: ');
  }

  if (!companyName || !storeName || !ownerName || !ownerEmail) {
    console.error('\n❌ Erro: Todos os campos são obrigatórios para inicializar a empresa.');
    process.exit(1);
  }

  console.log('\n✔ Dados validados com sucesso.');
  console.log(`- Empresa: ${companyName}`);
  console.log(`- Loja: ${storeName}`);
  console.log(`- Dono: ${ownerName} (${ownerEmail})`);
  console.log('\n✔ Instalação configurada com sucesso para papel único DONO!');
  console.log('Acesse a interface web para começar a cadastrar seus insumos e fichas técnicas.\n');
}

run();
