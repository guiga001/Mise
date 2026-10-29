/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Mise — Compras Manuais de Insumos & Matérias-Primas
 * 100% Manual, simples e direto: registre compras de atacado ou mercado com 1 clique.
 */

import React, { useState } from 'react';
import {
  ShoppingCart,
  Plus,
  Truck,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Clock,
  DollarSign,
  Trash2,
  Building2,
} from 'lucide-react';
import { PurchaseOrder, Supplier, Ingredient, StockMovement, PayableEntry, BaseUnit } from '../domain/types';
import { calculateMovingAverageCost, calculateStockBalances } from '../domain/inventory';
import { formatBaseQuantity, formatCentsToCurrency, parseCurrencyToCents } from '../domain/units';
import { MiseDatabaseState, appendAuditLog } from '../lib/storage';
import { Modal } from './Modal';
import { EmptyState } from './EmptyState';

interface PurchasesTabProps {
  database: MiseDatabaseState;
  onUpdateDatabase: (newState: MiseDatabaseState) => void;
  onNavigateToIngredients: () => void;
}

export const PurchasesTab: React.FC<PurchasesTabProps> = ({
  database,
  onUpdateDatabase,
  onNavigateToIngredients,
}) => {
  const { activeStoreId, stores, suppliers, ingredients, purchaseOrders, stockMovements } = database;
  const targetStoreId = activeStoreId === 'CONSOLIDATED' ? (stores[0]?.id || 'store_1') : activeStoreId;

  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);

  // Form Compra Manual Direta
  const [supplierName, setSupplierName] = useState('Atacadão / Distribuidor');
  const [selectedIngredientId, setSelectedIngredientId] = useState('');
  const [isCreatingNewIngredient, setIsCreatingNewIngredient] = useState(false);
  const [newIngredientName, setNewIngredientName] = useState('');
  const [newIngredientBaseUnit, setNewIngredientBaseUnit] = useState<BaseUnit>('g');

  const [quantityPurchased, setQuantityPurchased] = useState('1000');
  const [totalCostStr, setTotalCostStr] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentType, setPaymentType] = useState<'PAID_NOW' | 'PAY_LATER'>('PAID_NOW');
  const [dueDate, setDueDate] = useState('');

  const selectedIng = ingredients.find(i => i.id === selectedIngredientId);

  const handleOpenPurchaseModal = () => {
    if (ingredients.length === 0) {
      setIsCreatingNewIngredient(true);
      setSelectedIngredientId('NEW');
    } else {
      setIsCreatingNewIngredient(false);
      setSelectedIngredientId(ingredients[0]?.id || '');
    }
    setSupplierName('Atacadão / Distribuidor');
    setQuantityPurchased('1000');
    setTotalCostStr('');
    setPaymentType('PAID_NOW');
    setIsPurchaseModalOpen(true);
  };

  const handleSaveDirectPurchase = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseFloat(quantityPurchased);
    if (isNaN(qty) || qty <= 0) return;

    const totalCents = parseCurrencyToCents(totalCostStr);
    if (totalCents <= 0) return;

    const now = new Date().toISOString();
    let targetIngredient: Ingredient | undefined;
    let updatedIngredients = [...ingredients];

    // Se estiver criando insumo na hora
    if (isCreatingNewIngredient || selectedIngredientId === 'NEW') {
      if (!newIngredientName.trim()) return;
      const unitCostMicro = Math.round((totalCents * 10000) / qty);

      targetIngredient = {
        id: `ing_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name: newIngredientName.trim(),
        category: 'Geral',
        baseUnit: newIngredientBaseUnit,
        minimumStockInBaseUnit: 1000,
        currentUnitCostMicrocents: unitCostMicro,
        packagings: [
          {
            id: `pack_${Date.now()}`,
            packagingName: 'Embalagem de Compra',
            quantityInBaseUnit: qty,
            costInCents: totalCents,
          },
        ],
        updatedAt: now,
      };
      updatedIngredients = [...updatedIngredients, targetIngredient];
    } else {
      targetIngredient = ingredients.find(i => i.id === selectedIngredientId);
    }

    if (!targetIngredient) return;

    const balances = calculateStockBalances(targetStoreId, ingredients, stockMovements);
    const currentBalance = balances.get(targetIngredient.id)?.currentBalanceInBaseUnit || 0;

    // Custo por microcentavos da entrada
    const entryUnitCostMicro = Math.round((totalCents * 10000) / qty);

    // Recalcular Custo Médio Ponderado
    const newAverageCostMicro = calculateMovingAverageCost(
      currentBalance,
      targetIngredient.currentUnitCostMicrocents,
      qty,
      entryUnitCostMicro
    );

    // 1. Movimento de estoque (Entrada)
    const newMovement: StockMovement = {
      id: `mov_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      storeId: targetStoreId,
      ingredientId: targetIngredient.id,
      type: 'PURCHASE_RECEIPT',
      quantityInBaseUnit: qty,
      unitCostMicrocents: entryUnitCostMicro,
      totalCostInCents: totalCents,
      reason: `Compra manual: ${supplierName}`,
      createdAt: now,
      createdBy: 'Dono Gestor',
    };

    // 2. Atualizar o custo médio no cadastro do insumo
    updatedIngredients = updatedIngredients.map(i => {
      if (i.id === targetIngredient!.id) {
        return {
          ...i,
          currentUnitCostMicrocents: newAverageCostMicro,
          updatedAt: now,
        };
      }
      return i;
    });

    // 3. Registrar a Compra no histórico
    const orderId = `po_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newOrder: PurchaseOrder = {
      id: orderId,
      storeId: targetStoreId,
      supplierId: supplierName,
      status: 'RECEIVED',
      orderedDate: purchaseDate,
      receivedDate: purchaseDate,
      lines: [
        {
          id: `line_${Date.now()}`,
          ingredientId: targetIngredient.id,
          packagingName: `${formatBaseQuantity(qty, targetIngredient.baseUnit)} de ${targetIngredient.name}`,
          quantityOrdered: 1,
          baseUnitQuantity: qty,
          unitPriceInCents: totalCents,
          totalPriceInCents: totalCents,
        },
      ],
      totalAmountInCents: totalCents,
      notes: paymentType === 'PAID_NOW' ? 'Pago à vista' : `A pagar (Vencimento: ${dueDate || '15 dias'})`,
    };

    // 4. Se for a pagar a prazo, entra no Contas a Pagar
    let updatedPayables = [...database.payables];
    if (paymentType === 'PAY_LATER') {
      const billDueDate = dueDate || new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0];
      const newPayable: PayableEntry = {
        id: `pay_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        storeId: targetStoreId,
        description: `Compra: ${targetIngredient.name} (${supplierName})`,
        category: 'FORNECEDOR',
        amountInCents: totalCents,
        dueDate: billDueDate,
        status: 'PENDING',
      };
      updatedPayables = [newPayable, ...updatedPayables];
    }

    const stateWithPurchase = {
      ...database,
      purchaseOrders: [newOrder, ...database.purchaseOrders],
      stockMovements: [newMovement, ...database.stockMovements],
      ingredients: updatedIngredients,
      payables: updatedPayables,
    };

    const newState = appendAuditLog(
      stateWithPurchase,
      'MANUAL_PURCHASE',
      'PurchaseOrder',
      orderId,
      `Compra manual de ${formatBaseQuantity(qty, targetIngredient.baseUnit)} de '${targetIngredient.name}' no valor de ${formatCentsToCurrency(totalCents)} de '${supplierName}'.`
    );

    onUpdateDatabase(newState);
    setIsPurchaseModalOpen(false);
    setNewIngredientName('');
  };

  const handleDeletePurchase = (orderId: string) => {
    const updated = purchaseOrders.filter(p => p.id !== orderId);
    const newState = appendAuditLog(
      { ...database, purchaseOrders: updated },
      'DELETE_PURCHASE',
      'PurchaseOrder',
      orderId,
      'Registro de compra manual removido.'
    );
    onUpdateDatabase(newState);
  };

  const filteredOrders = purchaseOrders.filter(
    p => activeStoreId === 'CONSOLIDATED' || p.storeId === activeStoreId
  );

  const totalSpentInCents = filteredOrders.reduce((sum, o) => sum + o.totalAmountInCents, 0);

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      {/* Header bar com ação rápida e simples */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-stone-900 tracking-tight">
            Compras de Insumos & Abastecimento
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Ao lançar uma compra, o sistema coloca a mercadoria no estoque e atualiza o custo médio do prato.
          </p>
        </div>
        <button
          onClick={handleOpenPurchaseModal}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>+ Lançar Nova Compra</span>
        </button>
      </div>

      {/* Resumo de Gastos com Compras */}
      <div className="bg-white p-5 rounded-xl border border-stone-200/80 shadow-2xs flex items-center justify-between">
        <div>
          <span className="text-xs font-medium text-stone-500">Total Gasto em Compras de Insumos</span>
          <div className="text-2xl font-bold font-mono text-stone-900 mt-1">
            {formatCentsToCurrency(totalSpentInCents)}
          </div>
        </div>
        <div className="text-right text-xs text-stone-500">
          <span>{filteredOrders.length} compra(s) registrada(s)</span>
        </div>
      </div>

      {purchaseOrders.length === 0 ? (
        <EmptyState
          icon={ShoppingCart}
          title="Nenhuma compra de insumos lançada"
          description="Comprou ingredientes no mercado, distribuidor ou açougue? Lance a compra aqui para abastecer o estoque e deixar seus custos 100% atualizados."
          actionLabel="+ Lançar Minha Primeira Compra"
          onAction={handleOpenPurchaseModal}
        />
      ) : (
        <div className="bg-white rounded-xl border border-stone-200/80 overflow-hidden shadow-2xs">
          <div className="p-4 border-b border-stone-100 flex items-center justify-between">
            <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
              Histórico de Compras Realizadas
            </h3>
            <span className="text-xs text-stone-500">{filteredOrders.length} lançamento(s)</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50/60 text-stone-500 font-semibold">
                  <th className="py-3 px-4">Data</th>
                  <th className="py-3 px-4">Fornecedor / Local</th>
                  <th className="py-3 px-4">Insumo Comprado</th>
                  <th className="py-3 px-4 text-right">Valor Pago</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredOrders.map((order) => {
                  const firstLine = order.lines[0];
                  return (
                    <tr key={order.id} className="hover:bg-stone-50/60 transition-colors">
                      <td className="py-3 px-4 font-mono text-stone-600">
                        {order.orderedDate.split('-').reverse().join('/')}
                      </td>
                      <td className="py-3 px-4 font-semibold text-stone-900">
                        {order.supplierId}
                      </td>
                      <td className="py-3 px-4 text-stone-800">
                        {firstLine ? firstLine.packagingName : 'Mercadorias'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-stone-900">
                        {formatCentsToCurrency(order.totalAmountInCents)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="text-[11px] font-bold text-emerald-700 flex items-center justify-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>No Estoque</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleDeletePurchase(order.id)}
                          className="p-1 text-stone-400 hover:text-rose-600 rounded cursor-pointer transition-colors"
                          title="Remover compra"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Lançar Nova Compra (Simples e Direto) */}
      <Modal
        isOpen={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
        title="Lançar Compra de Insumos"
        subtitle="Informe o que comprou, quanto pagou e o estoque será abastecido na hora."
      >
        <form onSubmit={handleSaveDirectPurchase} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-stone-700">
                O Que Foi Comprado? (Insumo) *
              </label>
              <button
                type="button"
                onClick={() => setIsCreatingNewIngredient(!isCreatingNewIngredient)}
                className="text-[11px] text-stone-600 hover:text-stone-900 underline cursor-pointer"
              >
                {isCreatingNewIngredient ? 'Escolher da lista existente' : '+ Cadastrar novo insumo aqui'}
              </button>
            </div>

            {isCreatingNewIngredient || ingredients.length === 0 ? (
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <input
                    type="text"
                    required
                    placeholder="Nome do Insumo (ex: Queijo Mussarela, Filé Mignon)..."
                    value={newIngredientName}
                    onChange={(e) => setNewIngredientName(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-stone-900"
                  />
                </div>
                <div>
                  <select
                    value={newIngredientBaseUnit}
                    onChange={(e) => setNewIngredientBaseUnit(e.target.value as BaseUnit)}
                    className="w-full text-xs px-2 py-2 rounded-lg border border-stone-300 bg-white"
                  >
                    <option value="g">Gramas (g)</option>
                    <option value="ml">Litros/ml</option>
                    <option value="un">Unidade (un)</option>
                  </select>
                </div>
              </div>
            ) : (
              <select
                required
                value={selectedIngredientId}
                onChange={(e) => setSelectedIngredientId(e.target.value)}
                className="w-full text-xs px-3 py-2.5 rounded-lg border border-stone-300 bg-white focus:outline-none focus:ring-1 focus:ring-stone-900"
              >
                <option value="">Selecione o insumo...</option>
                {ingredients.map(ing => (
                  <option key={ing.id} value={ing.id}>
                    {ing.name} ({ing.baseUnit})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Quantidade Comprada ({isCreatingNewIngredient ? newIngredientBaseUnit : (selectedIng?.baseUnit || 'g/ml/un')}) *
              </label>
              <input
                type="number"
                required
                value={quantityPurchased}
                onChange={(e) => setQuantityPurchased(e.target.value)}
                placeholder="Ex: 5000 (para 5kg ou 5L)"
                className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-stone-900 font-mono"
              />
              <span className="text-[10px] text-stone-400 mt-0.5 block">
                {(isCreatingNewIngredient ? newIngredientBaseUnit : selectedIng?.baseUnit) === 'g'
                  ? 'Dica: 1 kg = 1.000 g'
                  : (isCreatingNewIngredient ? newIngredientBaseUnit : selectedIng?.baseUnit) === 'ml'
                  ? 'Dica: 1 L = 1.000 ml'
                  : 'Unidades'}
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Valor Total Pago (R$) *
              </label>
              <input
                type="text"
                required
                value={totalCostStr}
                onChange={(e) => setTotalCostStr(e.target.value)}
                placeholder="Ex: 85,00"
                className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-stone-900 font-mono font-bold text-stone-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Onde Comprou / Fornecedor *
              </label>
              <input
                type="text"
                required
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
                placeholder="Ex: Assaí Atacadista, Ceasa, Açougue..."
                className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-stone-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Data da Compra *
              </label>
              <input
                type="date"
                required
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-stone-900 font-mono"
              />
            </div>
          </div>

          <div className="p-3 bg-stone-50 rounded-lg border border-stone-200/80 space-y-2">
            <span className="text-xs font-bold text-stone-900 block">Condição de Pagamento</span>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-xs text-stone-700 cursor-pointer">
                <input
                  type="radio"
                  name="paymentType"
                  checked={paymentType === 'PAID_NOW'}
                  onChange={() => setPaymentType('PAID_NOW')}
                  className="accent-stone-900"
                />
                <span>Já Pago (Dinheiro / PIX / Débito)</span>
              </label>
              <label className="flex items-center gap-2 text-xs text-stone-700 cursor-pointer">
                <input
                  type="radio"
                  name="paymentType"
                  checked={paymentType === 'PAY_LATER'}
                  onChange={() => setPaymentType('PAY_LATER')}
                  className="accent-stone-900"
                />
                <span>A Pagar (Boleto / Prazo)</span>
              </label>
            </div>

            {paymentType === 'PAY_LATER' && (
              <div className="pt-2">
                <label className="block text-[11px] font-medium text-stone-600 mb-1">
                  Vencimento da Fatura
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-stone-300 bg-white"
                />
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
            <button
              type="button"
              onClick={() => setIsPurchaseModalOpen(false)}
              className="px-3 py-2 text-xs font-medium text-stone-700 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              Salvar Compra & Abastecer Estoque
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
