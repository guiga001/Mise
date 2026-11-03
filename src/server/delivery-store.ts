/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Mise — Delivery Store (iFood e 99Food) com Persistência em Disco por Empresa
 * Salva configurações, pedidos, movimentações e métricas em ./data/delivery/[companyId].json
 */

import fs from 'fs';
import path from 'path';
import {
  DeliveryChannel,
  DeliveryOrderStatus,
  DeliveryOrder,
  DeliveryChannelConfig,
  DeliveryMetricsSummary,
  DeliveryFilterOptions,
} from '../domain/delivery-types';

interface CompanyDeliveryData {
  companyId: string;
  configs: {
    ifood: DeliveryChannelConfig;
    food99: DeliveryChannelConfig;
  };
  orders: DeliveryOrder[];
  lastSyncTimestamp?: string;
}

const DATA_DIR = path.resolve(process.cwd(), 'data', 'delivery');

function ensureDirectoryExists() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function getCompanyFilePath(companyId: string): string {
  const safeId = companyId.replace(/[^a-zA-Z0-9_-]/g, '_');
  return path.join(DATA_DIR, `${safeId}.json`);
}

function createDefaultData(companyId: string): CompanyDeliveryData {
  return {
    companyId,
    configs: {
      ifood: {
        channel: "IFOOD",
        enabled: false,
        storeOpen: false,
        storeName: "",
        merchantId: "",
        clientId: "",
        clientSecret: "",
        defaultCommissionRate: 23.0,
        autoAcceptOrders: false,
        defaultPrepMinutes: 25,
        autoPrintReceipt: true,
        connectionStatus: "DISCONNECTED",
        lastStatusCheck: new Date().toISOString(),
        webhookUrl: "/api/integrations/ifood/webhook",
        environment: "PRODUCTION",
      },
      food99: {
        channel: "99FOOD",
        enabled: false,
        storeOpen: false,
        storeName: "",
        merchantId: "",
        appId: "",
        appSecret: "",
        defaultCommissionRate: 15.0,
        autoAcceptOrders: false,
        defaultPrepMinutes: 20,
        autoPrintReceipt: true,
        connectionStatus: "DISCONNECTED",
        lastStatusCheck: new Date().toISOString(),
        webhookUrl: "/api/integrations/99food/webhook",
        environment: "PRODUCTION",
      },
    },
    orders: [],
    lastSyncTimestamp: undefined,
  };
}

class DeliveryStore {
  private cache: Map<string, CompanyDeliveryData> = new Map();

  constructor() {
    ensureDirectoryExists();
  }

  private load(companyId: string): CompanyDeliveryData {
    if (this.cache.has(companyId)) {
      return this.cache.get(companyId)!;
    }

    const filePath = getCompanyFilePath(companyId);
    if (fs.existsSync(filePath)) {
      try {
        const raw = fs.readFileSync(filePath, 'utf-8');
        const data = JSON.parse(raw) as CompanyDeliveryData;
        const sampleCustomerNames = new Set([
          'Mariana Silveira',
          'Rafael Mendes',
          'Camila Alcantara',
          'Bruno Henrique',
          'Juliana Paes',
          'Thiago Nogueira',
          'Carolina Nogueira',
          'Eduardo Vasconcelos',
          'Beatriz Meneghel',
          'Rodrigo Amaral',
          'Larissa Fontes',
          'Rafael Mendes de Oliveira',
          'Bruno Henrique Castro',
          'Juliana Paes de Barros',
        ]);
        data.orders = (data.orders || []).filter((o) => {
          if (sampleCustomerNames.has(o.customer?.name)) return false;
          if (o.notes?.includes('Pedido puxado automaticamente via sincronização de API')) return false;
          if (o.items?.some((i) => i.name.includes('Smash') || i.name.includes('Angus Bacon Trufado'))) return false;
          return true;
        });
        this.cache.set(companyId, data);
        return data;
      } catch (err) {
        console.error(`[DeliveryStore] Erro ao ler arquivo ${filePath}:`, err);
      }
    }

    const initial = createDefaultData(companyId);
    this.save(initial);
    return initial;
  }

  private save(data: CompanyDeliveryData) {
    this.cache.set(data.companyId, data);
    try {
      ensureDirectoryExists();
      const filePath = getCompanyFilePath(data.companyId);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error(`[DeliveryStore] Erro ao salvar dados da empresa ${data.companyId}:`, err);
    }
  }

  public getConfigs(companyId: string) {
    const data = this.load(companyId);
    return data.configs;
  }

  public updateConfig(
    companyId: string,
    channel: DeliveryChannel,
    patch: Partial<DeliveryChannelConfig>
  ): DeliveryChannelConfig {
    const data = this.load(companyId);
    const key = channel === 'IFOOD' ? 'ifood' : 'food99';
    data.configs[key] = {
      ...data.configs[key],
      ...patch,
      channel,
    };
    this.save(data);
    return data.configs[key];
  }

  public toggleStoreStatus(companyId: string, channel: DeliveryChannel, storeOpen: boolean): DeliveryChannelConfig {
    return this.updateConfig(companyId, channel, {
      storeOpen,
      lastStatusCheck: new Date().toISOString(),
    });
  }

  public getOrders(companyId: string, filters: DeliveryFilterOptions = {}): DeliveryOrder[] {
    const data = this.load(companyId);
    let result = [...data.orders];

    // Filtro por canal
    if (filters.channel && filters.channel !== 'ALL') {
      result = result.filter((o) => o.channel === filters.channel);
    }

    // Filtro por status
    if (filters.status && filters.status !== 'ALL') {
      if (filters.status === 'ACTIVE') {
        result = result.filter(
          (o) => o.status === 'PENDING' || o.status === 'CONFIRMED' || o.status === 'PREPARING' || o.status === 'DISPATCHED'
        );
      } else {
        result = result.filter((o) => o.status === filters.status);
      }
    }

    // Filtro por logística
    if (filters.logisticsType && filters.logisticsType !== 'ALL') {
      result = result.filter((o) => o.logisticsType === filters.logisticsType);
    }

    // Filtro por período
    if (filters.period && filters.period !== 'ALL') {
      const now = new Date();
      let cutoffTime = 0;
      if (filters.period === 'TODAY') {
        cutoffTime = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      } else if (filters.period === 'YESTERDAY') {
        const startOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1).getTime();
        const endOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        result = result.filter((o) => {
          const t = new Date(o.createdAt).getTime();
          return t >= startOfYesterday && t < endOfYesterday;
        });
        cutoffTime = 0;
      } else if (filters.period === 'LAST_7_DAYS') {
        cutoffTime = now.getTime() - 7 * 24 * 60 * 60 * 1000;
      } else if (filters.period === 'LAST_30_DAYS') {
        cutoffTime = now.getTime() - 30 * 24 * 60 * 60 * 1000;
      } else if (filters.period === 'THIS_MONTH') {
        cutoffTime = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
      }

      if (cutoffTime > 0) {
        result = result.filter((o) => new Date(o.createdAt).getTime() >= cutoffTime);
      }
    }

    // Filtro por texto de busca
    if (filters.searchTerm && filters.searchTerm.trim().length > 0) {
      const q = filters.searchTerm.toLowerCase().trim();
      result = result.filter(
        (o) =>
          o.displayId.toLowerCase().includes(q) ||
          o.customer.name.toLowerCase().includes(q) ||
          (o.customer.phone && o.customer.phone.toLowerCase().includes(q)) ||
          o.customer.deliveryAddress.street.toLowerCase().includes(q) ||
          o.customer.deliveryAddress.neighborhood.toLowerCase().includes(q) ||
          o.items.some((i) => i.name.toLowerCase().includes(q))
      );
    }

    // Ordenação: mais recentes primeiro
    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return result;
  }

  public getOrderById(companyId: string, orderId: string): DeliveryOrder | undefined {
    const data = this.load(companyId);
    return data.orders.find((o) => o.id === orderId || o.externalOrderId === orderId || o.displayId === orderId);
  }

  public updateOrderStatus(
    companyId: string,
    orderId: string,
    newStatus: DeliveryOrderStatus,
    extra?: { reason?: string; driverName?: string; prepMinutes?: number }
  ): DeliveryOrder {
    const data = this.load(companyId);
    const orderIndex = data.orders.findIndex(
      (o) => o.id === orderId || o.externalOrderId === orderId || o.displayId === orderId
    );

    if (orderIndex === -1) {
      throw new Error(`Pedido com ID ${orderId} não foi encontrado.`);
    }

    const order = data.orders[orderIndex];
    const nowIso = new Date().toISOString();

    const updated: DeliveryOrder = {
      ...order,
      status: newStatus,
    };

    if (newStatus === 'CONFIRMED') {
      updated.confirmedAt = nowIso;
      if (extra?.prepMinutes) {
        updated.estimatedPreparationMinutes = extra.prepMinutes;
      }
    } else if (newStatus === 'PREPARING') {
      if (!updated.confirmedAt) updated.confirmedAt = nowIso;
    } else if (newStatus === 'READY_FOR_PICKUP') {
      updated.readyAt = nowIso;
    } else if (newStatus === 'DISPATCHED') {
      if (!updated.readyAt) updated.readyAt = nowIso;
      updated.dispatchedAt = nowIso;
      if (extra?.driverName) {
        updated.driver = {
          ...updated.driver,
          name: extra.driverName,
        };
      }
    } else if (newStatus === 'DELIVERED') {
      updated.deliveredAt = nowIso;
    } else if (newStatus === 'CANCELLED') {
      updated.cancelledAt = nowIso;
      updated.cancellationReason = extra?.reason || 'Cancelado pelo operador no sistema Mise.';
      // Zerar comissão caso cancelado
      updated.financial = {
        ...updated.financial,
        marketplaceCommissionInCents: 0,
        netRestaurantPayoutInCents: 0,
      };
    }

    data.orders[orderIndex] = updated;
    this.save(data);
    return updated;
  }

  public addOrder(companyId: string, order: DeliveryOrder): DeliveryOrder {
    const data = this.load(companyId);
    data.orders.unshift(order);
    this.save(data);
    return order;
  }

  public syncChannelOrders(
    companyId: string,
    channel?: DeliveryChannel
  ): { syncedCount: number; newOrders: DeliveryOrder[] } {
    const data = this.load(companyId);
    const targetChannels: DeliveryChannel[] = channel ? [channel] : ['IFOOD', '99FOOD'];
    const now = new Date();

    for (const ch of targetChannels) {
      const configKey = ch === 'IFOOD' ? 'ifood' : 'food99';
      data.configs[configKey].lastSyncAt = now.toISOString();
    }

    // Apenas pedidos reais vindos de webhooks ou APIs oficiais
    this.save(data);
    return {
      syncedCount: 0,
      newOrders: [],
    };
  }

  public clearAllOrders(companyId: string): void {
    const data = this.load(companyId);
    data.orders = [];
    this.save(data);
  }

  public getMetrics(companyId: string, period: string = 'today'): DeliveryMetricsSummary {
    const orders = this.getOrders(companyId, {
      period: period === 'today' ? 'TODAY' : period === '7d' ? 'LAST_7_DAYS' : period === '30d' ? 'LAST_30_DAYS' : 'ALL',
    });

    const completed = orders.filter((o) => o.status === 'DELIVERED');
    const cancelled = orders.filter((o) => o.status === 'CANCELLED');

    const totalGross = completed.reduce((acc, o) => acc + o.financial.totalCustomerInCents, 0);
    const totalNet = completed.reduce((acc, o) => acc + o.financial.netRestaurantPayoutInCents, 0);
    const totalCommission = completed.reduce((acc, o) => acc + o.financial.marketplaceCommissionInCents, 0);
    const averageTicket = completed.length > 0 ? Math.round(totalGross / completed.length) : 0;
    const cancellationRate = orders.length > 0 ? Number(((cancelled.length / orders.length) * 100).toFixed(1)) : 0;

    // Breakdown por canal
    const ifoodOrders = completed.filter((o) => o.channel === 'IFOOD');
    const food99Orders = completed.filter((o) => o.channel === '99FOOD');

    const ifoodGross = ifoodOrders.reduce((acc, o) => acc + o.financial.totalCustomerInCents, 0);
    const ifoodNet = ifoodOrders.reduce((acc, o) => acc + o.financial.netRestaurantPayoutInCents, 0);
    const ifoodCommission = ifoodOrders.reduce((acc, o) => acc + o.financial.marketplaceCommissionInCents, 0);
    const ifoodTicket = ifoodOrders.length > 0 ? Math.round(ifoodGross / ifoodOrders.length) : 0;

    const food99Gross = food99Orders.reduce((acc, o) => acc + o.financial.totalCustomerInCents, 0);
    const food99Net = food99Orders.reduce((acc, o) => acc + o.financial.netRestaurantPayoutInCents, 0);
    const food99Commission = food99Orders.reduce((acc, o) => acc + o.financial.marketplaceCommissionInCents, 0);
    const food99Ticket = food99Orders.length > 0 ? Math.round(food99Gross / food99Orders.length) : 0;

    const byStatusCount: Record<DeliveryOrderStatus, number> = {
      PENDING: 0,
      CONFIRMED: 0,
      PREPARING: 0,
      READY_FOR_PICKUP: 0,
      DISPATCHED: 0,
      DELIVERED: 0,
      CANCELLED: 0,
    };

    orders.forEach((o) => {
      byStatusCount[o.status] = (byStatusCount[o.status] || 0) + 1;
    });

    return {
      period,
      totalOrders: orders.length,
      completedOrders: completed.length,
      cancelledOrders: cancelled.length,
      cancellationRate,
      totalGrossInCents: totalGross,
      totalNetInCents: totalNet,
      totalCommissionInCents: totalCommission,
      averageTicketInCents: averageTicket,
      byChannel: {
        ifood: {
          ordersCount: ifoodOrders.length,
          grossInCents: ifoodGross,
          netInCents: ifoodNet,
          commissionInCents: ifoodCommission,
          averageTicketInCents: ifoodTicket,
        },
        food99: {
          ordersCount: food99Orders.length,
          grossInCents: food99Gross,
          netInCents: food99Net,
          commissionInCents: food99Commission,
          averageTicketInCents: food99Ticket,
        },
      },
      byStatusCount,
    };
  }
}

export const deliveryStore = new DeliveryStore();
