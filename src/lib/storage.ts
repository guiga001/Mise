/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Mise — Camada de Persistência, Auditoria Append-Only e Estado
 * Invariante: Banco inicia 100% VAZIO. Zero dados fictícios ou seeds demo.
 */

import {
  Alert,
  AuditLog,
  Company,
  Ingredient,
  InventoryCount,
  PayableEntry,
  ProductionOrder,
  PurchaseOrder,
  ReceivableEntry,
  Recipe,
  SalesImport,
  StockMovement,
  Store,
  Supplier,
  User,
  StockLot,
} from '../domain/types';

export interface MiseDatabaseState {
  company: Company | null;
  stores: Store[];
  users: User[];
  activeUserId: string | null;
  activeStoreId: string; // 'CONSOLIDATED' ou storeId
  ingredients: Ingredient[];
  recipes: Recipe[];
  stockMovements: StockMovement[];
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  salesImports: SalesImport[];
  payables: PayableEntry[];
  receivables: ReceivableEntry[];
  productionOrders: ProductionOrder[];
  inventoryCounts: InventoryCount[];
  auditLogs: AuditLog[];
  alerts: Alert[];
  productNameToRecipeIdMap: Record<string, string>;
  stockLots?: StockLot[];
  valueEvents?: any[];
  dailyTasks?: any[];
}

const STORAGE_KEY = 'mise_database_state_v1';

/**
 * Cria o estado inicial do banco: 100% vazio, sem registros fictícios.
 */
function createEmptyDatabase(): MiseDatabaseState {
  return {
    company: null,
    stores: [],
    users: [],
    activeUserId: null,
    activeStoreId: 'CONSOLIDATED',
    ingredients: [],
    recipes: [],
    stockMovements: [],
    suppliers: [],
    purchaseOrders: [],
    salesImports: [],
    payables: [],
    receivables: [],
    productionOrders: [],
    inventoryCounts: [],
    auditLogs: [],
    alerts: [],
    productNameToRecipeIdMap: {},
    stockLots: [],
    valueEvents: [],
    dailyTasks: [],
  };
}

/**
 * Carrega o estado do banco do storage local.
 */
export function loadDatabase(): MiseDatabaseState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createEmptyDatabase();
    const parsed = JSON.parse(raw);
    return {
      ...createEmptyDatabase(),
      ...parsed,
    };
  } catch (e) {
    console.error('Falha ao ler dados locais do Mise:', e);
    return createEmptyDatabase();
  }
}

/**
 * Salva o estado do banco.
 */
export function saveDatabase(state: MiseDatabaseState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Falha ao persistir dados do Mise:', e);
  }
}

/**
 * Grava entrada no AuditLog (append-only, sem deleção).
 */
export function appendAuditLog(
  state: MiseDatabaseState,
  action: string,
  entityType: string,
  entityId: string,
  details: string
): MiseDatabaseState {
  const activeUser = state.users.find(u => u.id === state.activeUserId);
  const log: AuditLog = {
    id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    action,
    entityType,
    entityId,
    userId: activeUser ? activeUser.id : 'SYSTEM',
    userName: activeUser ? activeUser.name : 'Dono / Sistema',
    storeId: state.activeStoreId === 'CONSOLIDATED' ? undefined : state.activeStoreId,
    details,
    timestamp: new Date().toISOString(),
  };

  const updatedState = {
    ...state,
    auditLogs: [log, ...state.auditLogs],
  };
  saveDatabase(updatedState);
  return updatedState;
}

/**
 * Bootstrap do Dono (Primeiro Acesso).
 * Só executa se o banco não possuir proprietário cadastrado.
 */
export function bootstrapOwner(
  companyName: string,
  storeName: string,
  ownerName: string,
  ownerEmail: string
): MiseDatabaseState {
  const currentState = loadDatabase();
  if (currentState.company !== null) {
    throw new Error('A instalação já possui um dono e empresa configurados.');
  }

  const now = new Date().toISOString();
  const companyId = `comp_${Date.now()}`;
  const storeId = `store_${Date.now()}`;
  const userId = `user_${Date.now()}`;

  const company: Company = {
    id: companyId,
    name: companyName.trim(),
    createdAt: now,
    updatedAt: now,
  };

  const store: Store = {
    id: storeId,
    name: storeName.trim(),
    code: 'MATRIZ',
    isMainStore: true,
    createdAt: now,
  };

  const user: User = {
    id: userId,
    name: ownerName.trim(),
    email: ownerEmail.trim().toLowerCase(),
    role: 'DONO',
    storeIds: [storeId],
    twoFactorEnabled: false,
    createdAt: now,
  };

  const state: MiseDatabaseState = {
    ...createEmptyDatabase(),
    company,
    stores: [store],
    users: [user],
    activeUserId: userId,
    activeStoreId: storeId,
  };

  return appendAuditLog(
    state,
    'BOOTSTRAP_OWNER',
    'Company',
    companyId,
    `Empresa '${company.name}', loja '${store.name}' e dono '${user.name}' criados no primeiro acesso.`
  );
}

/**
 * Purge total da empresa (LGPD Direito de Eliminação com confirmação).
 */
export function purgeCompanyData(): void {
  localStorage.removeItem(STORAGE_KEY);
}
