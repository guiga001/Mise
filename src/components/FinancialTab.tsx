/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Mise — Fluxo de Caixa, Despesas & DRE Descomplicada
 * 100% Manual, simples e direto: lance qualquer entrada ou saída com facilidade.
 */

import React, { useState, useMemo } from 'react';
import {
  CircleDollarSign,
  Plus,
  TrendingUp,
  TrendingDown,
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Scale,
  Calendar,
  Wallet,
  Trash2,
} from 'lucide-react';
import { PayableEntry, ReceivableEntry } from '../domain/types';
import { calculateDRE, calculateBreakEven } from '../domain/financial';
import { formatCentsToCurrency, parseCurrencyToCents } from '../domain/units';
import { MiseDatabaseState, appendAuditLog } from '../lib/storage';
import { Modal } from './Modal';
import { EmptyState } from './EmptyState';

interface FinancialTabProps {
  database: MiseDatabaseState;
  onUpdateDatabase: (newState: MiseDatabaseState) => void;
}

export const FinancialTab: React.FC<FinancialTabProps> = ({ database, onUpdateDatabase }) => {
  const { activeStoreId, stores, payables, receivables, salesImports, stockMovements } = database;
  const targetStoreId = activeStoreId === 'CONSOLIDATED' ? (stores[0]?.id || 'store_1') : activeStoreId;

  const [activeSubTab, setActiveSubTab] = useState<'CASH_REGISTER' | 'DRE' | 'BILLS' | 'BREAKEVEN'>('CASH_REGISTER');

  // Modais de Entrada e Saída
  const [isInflowModalOpen, setIsInflowModalOpen] = useState(false);
  const [isOutflowModalOpen, setIsOutflowModalOpen] = useState(false);

  // Form Entrada de Dinheiro
  const [inflowDesc, setInflowDesc] = useState('');
  const [inflowAmountStr, setInflowAmountStr] = useState('');
  const [inflowChannel, setInflowChannel] = useState('PIX');
  const [inflowDate, setInflowDate] = useState(new Date().toISOString().split('T')[0]);

  // Form Saída / Conta a Pagar
  const [outflowDesc, setOutflowDesc] = useState('');
  const [outflowCategory, setOutflowCategory] = useState<PayableEntry['category']>('ALUGUEL');
  const [outflowAmountStr, setOutflowAmountStr] = useState('');
  const [outflowDueDate, setOutflowDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [isAlreadyPaid, setIsAlreadyPaid] = useState(true);

  // 1. Cálculo de Entradas Manuais + Vendas
  const totalInflowsInCents = useMemo(() => {
    // Vendas líquidas
    const salesTotal = salesImports
      .filter(s => activeStoreId === 'CONSOLIDATED' || s.storeId === activeStoreId)
      .reduce((sum, s) => sum + s.totalNetInCents, 0);

    // Entradas avulsas
    const recTotal = receivables
      .filter(r => (activeStoreId === 'CONSOLIDATED' || r.storeId === activeStoreId) && r.status === 'RECEIVED')
      .reduce((sum, r) => sum + r.amountInCents, 0);

    return salesTotal + recTotal;
  }, [salesImports, receivables, activeStoreId]);

  // 2. Cálculo de Saídas (Despesas pagas + Compras pagas)
  const totalOutflowsInCents = useMemo(() => {
    return payables
      .filter(p => (activeStoreId === 'CONSOLIDATED' || p.storeId === activeStoreId) && p.status === 'PAID')
      .reduce((sum, p) => sum + p.amountInCents, 0);
  }, [payables, activeStoreId]);

  const currentCashBalanceInCents = totalInflowsInCents - totalOutflowsInCents;

  // DRE Gerencial
  const dre = useMemo(() => {
    return calculateDRE('Período Atual', activeStoreId, salesImports, stockMovements, payables, 0, receivables);
  }, [activeStoreId, salesImports, stockMovements, payables, receivables]);

  // Ponto de Equilíbrio
  const breakEven = useMemo(() => {
    return calculateBreakEven(dre.operatingExpensesInCents, dre.grossMarginPercentage);
  }, [dre.operatingExpensesInCents, dre.grossMarginPercentage]);

  // Salvar Entrada de Dinheiro Manual
  const handleSaveInflow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inflowDesc.trim() || !inflowAmountStr) return;

    const amountInCents = parseCurrencyToCents(inflowAmountStr);
    if (amountInCents <= 0) return;

    const newReceivable: ReceivableEntry = {
      id: `rec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      storeId: targetStoreId,
      description: inflowDesc.trim(),
      channel: inflowChannel,
      amountInCents,
      dueDate: inflowDate,
      receivedDate: inflowDate,
      status: 'RECEIVED',
    };

    const newState = appendAuditLog(
      { ...database, receivables: [newReceivable, ...database.receivables] },
      'MANUAL_CASH_INFLOW',
      'ReceivableEntry',
      newReceivable.id,
      `Entrada de caixa manual de ${formatCentsToCurrency(amountInCents)} ('${newReceivable.description}') via ${inflowChannel}.`
    );

    onUpdateDatabase(newState);
    setIsInflowModalOpen(false);
    setInflowDesc('');
    setInflowAmountStr('');
  };

  // Salvar Saída / Despesa Manual
  const handleSaveOutflow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!outflowDesc.trim() || !outflowAmountStr) return;

    const amountInCents = parseCurrencyToCents(outflowAmountStr);
    if (amountInCents <= 0) return;

    const newBill: PayableEntry = {
      id: `bill_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      storeId: targetStoreId,
      description: outflowDesc.trim(),
      category: outflowCategory,
      amountInCents,
      dueDate: outflowDueDate,
      paidDate: isAlreadyPaid ? outflowDueDate : undefined,
      status: isAlreadyPaid ? 'PAID' : 'PENDING',
    };

    const newState = appendAuditLog(
      { ...database, payables: [newBill, ...database.payables] },
      'MANUAL_EXPENSE',
      'PayableEntry',
      newBill.id,
      `Despesa/conta '${newBill.description}' de ${formatCentsToCurrency(amountInCents)} lançada (${isAlreadyPaid ? 'Paga no ato' : 'A pagar'}).`
    );

    onUpdateDatabase(newState);
    setIsOutflowModalOpen(false);
    setOutflowDesc('');
    setOutflowAmountStr('');
  };

  const handleTogglePayableStatus = (payableId: string) => {
    const updated = database.payables.map(p => {
      if (p.id === payableId) {
        const isNowPaid = p.status !== 'PAID';
        return {
          ...p,
          status: isNowPaid ? ('PAID' as const) : ('PENDING' as const),
          paidDate: isNowPaid ? new Date().toISOString().split('T')[0] : undefined,
        };
      }
      return p;
    });

    onUpdateDatabase({ ...database, payables: updated });
  };

  const handleDeletePayable = (id: string) => {
    const updated = database.payables.filter(p => p.id !== id);
    onUpdateDatabase({ ...database, payables: updated });
  };

  const handleDeleteReceivable = (id: string) => {
    const updated = database.receivables.filter(r => r.id !== id);
    onUpdateDatabase({ ...database, receivables: updated });
  };

  const filteredPayables = payables.filter(
    p => activeStoreId === 'CONSOLIDATED' || p.storeId === activeStoreId
  );

  const filteredReceivables = receivables.filter(
    r => activeStoreId === 'CONSOLIDATED' || r.storeId === activeStoreId
  );

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      {/* Header bar com botões rápidos */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-stone-900 tracking-tight">
            Caixa & Gestão Financeira
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Tudo manual: lance o dinheiro que entrou e as despesas que saíram de forma descomplicada.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsInflowModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors cursor-pointer shadow-xs"
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>+ Entrada de Dinheiro</span>
          </button>
          <button
            onClick={() => setIsOutflowModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors cursor-pointer shadow-xs"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>+ Saída / Despesa</span>
          </button>
        </div>
      </div>

      {/* 3 Grandes Cartões de Caixa */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Entradas */}
        <div className="bg-white p-5 rounded-xl border border-stone-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-stone-500 font-medium">
            <span>Total que Entrou (Receitas)</span>
            <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">Entradas</span>
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-700 mt-2">
            +{formatCentsToCurrency(totalInflowsInCents)}
          </div>
          <p className="text-[11px] text-stone-400 mt-1">Vendas do cardápio + entradas manuais</p>
        </div>

        {/* Saídas */}
        <div className="bg-white p-5 rounded-xl border border-stone-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-stone-500 font-medium">
            <span>Total que Saiu (Pagas)</span>
            <span className="text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded">Saídas</span>
          </div>
          <div className="text-2xl font-bold font-mono text-rose-700 mt-2">
            -{formatCentsToCurrency(totalOutflowsInCents)}
          </div>
          <p className="text-[11px] text-stone-400 mt-1">Compras de insumos + contas pagas</p>
        </div>

        {/* Saldo Atual */}
        <div className="bg-white p-5 rounded-xl border border-stone-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-stone-500 font-medium">
            <span>Saldo em Dinheiro</span>
            <Wallet className="w-4 h-4 text-stone-500" />
          </div>
          <div className={`text-2xl font-bold font-mono mt-2 ${currentCashBalanceInCents >= 0 ? 'text-stone-900' : 'text-rose-700'}`}>
            {formatCentsToCurrency(currentCashBalanceInCents)}
          </div>
          <p className="text-[11px] text-stone-400 mt-1">
            {currentCashBalanceInCents >= 0 ? 'Saldo positivo disponível' : 'Atenção: saídas superam entradas'}
          </p>
        </div>
      </div>

      {/* Sub-abas de navegação limpas */}
      <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveSubTab('CASH_REGISTER')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            activeSubTab === 'CASH_REGISTER' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          Extrato do Caixa
        </button>
        <button
          onClick={() => setActiveSubTab('DRE')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            activeSubTab === 'DRE' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          Lucro Real (DRE Simples)
        </button>
        <button
          onClick={() => setActiveSubTab('BILLS')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            activeSubTab === 'BILLS' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          Contas a Pagar ({payables.length})
        </button>
        <button
          onClick={() => setActiveSubTab('BREAKEVEN')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            activeSubTab === 'BREAKEVEN' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          Ponto de Equilíbrio
        </button>
      </div>

      {/* SUBTAB: EXTRATO DO CAIXA */}
      {activeSubTab === 'CASH_REGISTER' && (
        <div className="bg-white rounded-xl border border-stone-200/80 overflow-hidden shadow-2xs">
          <div className="p-4 border-b border-stone-100 flex items-center justify-between">
            <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
              Movimentações do Caixa (Entradas & Saídas)
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50/60 text-stone-500 font-semibold">
                  <th className="py-3 px-4">Data</th>
                  <th className="py-3 px-4">Descrição do Lançamento</th>
                  <th className="py-3 px-4">Tipo</th>
                  <th className="py-3 px-4 text-right">Valor</th>
                  <th className="py-3 px-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {/* Entradas avulsas */}
                {filteredReceivables.map(r => (
                  <tr key={r.id} className="hover:bg-stone-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono text-stone-600">
                      {r.dueDate.split('-').reverse().join('/')}
                    </td>
                    <td className="py-3 px-4 font-semibold text-stone-900">
                      {r.description} <span className="text-[11px] text-stone-400 font-normal">({r.channel})</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                        Entrada
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">
                      +{formatCentsToCurrency(r.amountInCents)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDeleteReceivable(r.id)}
                        className="p-1 text-stone-400 hover:text-rose-600 rounded cursor-pointer"
                        title="Remover lançamento"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}

                {/* Saídas pagas */}
                {filteredPayables.filter(p => p.status === 'PAID').map(p => (
                  <tr key={p.id} className="hover:bg-stone-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono text-stone-600">
                      {(p.paidDate || p.dueDate).split('-').reverse().join('/')}
                    </td>
                    <td className="py-3 px-4 font-semibold text-stone-900">
                      {p.description} <span className="text-[11px] text-stone-400 font-normal">({p.category})</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded text-[11px]">
                        Saída
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-rose-700">
                      -{formatCentsToCurrency(p.amountInCents)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDeletePayable(p.id)}
                        className="p-1 text-stone-400 hover:text-rose-600 rounded cursor-pointer"
                        title="Remover lançamento"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredReceivables.length === 0 && filteredPayables.filter(p => p.status === 'PAID').length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-stone-400">
                      Nenhuma movimentação manual de caixa registrada. Use os botões acima para lançar uma entrada ou saída.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB: DRE SIMPLES (LUCRO REAL) */}
      {activeSubTab === 'DRE' && (
        <div className="bg-white rounded-xl border border-stone-200/80 p-6 shadow-2xs space-y-6 max-w-3xl">
          <div>
            <h3 className="text-base font-bold text-stone-900">
              Onde Está o Meu Dinheiro? (Demonstrativo Simples)
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Veja passo a passo o que sobrou de lucro limpo no bolso do proprietário.
            </p>
          </div>

          <div className="divide-y divide-stone-100 text-xs space-y-2">
            <div className="py-2.5 flex items-center justify-between font-semibold text-stone-900">
              <span>(+) Faturamento Bruto das Vendas</span>
              <span className="font-mono text-sm">{formatCentsToCurrency(dre.grossRevenueInCents)}</span>
            </div>

            <div className="py-2 flex items-center justify-between text-stone-600 pl-4">
              <span>(-) Taxas de Entrega & Maquininha</span>
              <span className="font-mono text-rose-700">-{formatCentsToCurrency(dre.taxesAndDeductionsInCents)}</span>
            </div>

            <div className="py-2.5 flex items-center justify-between font-bold text-stone-900 bg-stone-50 px-3 rounded-lg">
              <span>(=) DINHEIRO QUE REALMENTE ENTROU</span>
              <span className="font-mono text-sm">{formatCentsToCurrency(dre.netRevenueInCents)}</span>
            </div>

            <div className="py-2 flex items-center justify-between text-stone-700 pl-4">
              <span>(-) Custo dos Insumos e Comida (CMV Real + Desperdícios)</span>
              <span className="font-mono text-rose-700 font-semibold">-{formatCentsToCurrency(dre.cmvInCents)}</span>
            </div>

            <div className="py-2.5 flex items-center justify-between font-bold text-stone-900 bg-stone-50 px-3 rounded-lg">
              <span>(=) SOBRA APÓS PAGAR A COMIDA (MARGEM BRUTA)</span>
              <span className="font-mono text-sm text-stone-900">{formatCentsToCurrency(dre.grossProfitInCents)}</span>
            </div>

            <div className="py-2 flex items-center justify-between text-stone-600 pl-4">
              <span>(-) Aluguel, Luz, Gás, Água e Funcionários</span>
              <span className="font-mono text-rose-700">-{formatCentsToCurrency(dre.operatingExpensesInCents)}</span>
            </div>

            <div className={`py-4 flex items-center justify-between font-bold px-4 rounded-xl text-sm ${
              dre.netOperatingResultInCents >= 0 ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' : 'bg-rose-50 text-rose-900 border border-rose-200'
            }`}>
              <div>
                <span>(=) LUCRO LIMPO NO BOLSO DO DONO</span>
                <div className="text-xs font-normal opacity-80 mt-0.5">
                  Margem Líquida Real: {dre.netMarginPercentage}%
                </div>
              </div>
              <span className="font-mono text-lg">{formatCentsToCurrency(dre.netOperatingResultInCents)}</span>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB: CONTAS A PAGAR */}
      {activeSubTab === 'BILLS' && (
        <div className="bg-white rounded-xl border border-stone-200/80 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50/60 text-stone-500 font-semibold">
                  <th className="py-3 px-4">Descrição</th>
                  <th className="py-3 px-4">Categoria</th>
                  <th className="py-3 px-4">Vencimento</th>
                  <th className="py-3 px-4 text-right">Valor</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredPayables.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-stone-400">
                      Nenhuma conta cadastrada.
                    </td>
                  </tr>
                ) : (
                  filteredPayables.map((bill) => {
                    const isPaid = bill.status === 'PAID';
                    return (
                      <tr key={bill.id} className="hover:bg-stone-50/60 transition-colors">
                        <td className="py-3 px-4 font-semibold text-stone-900">
                          {bill.description}
                        </td>
                        <td className="py-3 px-4 text-stone-600 font-medium">
                          {bill.category}
                        </td>
                        <td className="py-3 px-4 font-mono text-stone-700">
                          {bill.dueDate.split('-').reverse().join('/')}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-stone-900">
                          {formatCentsToCurrency(bill.amountInCents)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {isPaid ? (
                            <span className="text-[11px] font-bold text-emerald-700 flex items-center justify-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Pago</span>
                            </span>
                          ) : (
                            <span className="text-[11px] font-bold text-amber-700 flex items-center justify-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              <span>Pendente</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleTogglePayableStatus(bill.id)}
                            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                              isPaid ? 'bg-stone-100 text-stone-700 hover:bg-stone-200' : 'bg-emerald-700 text-white hover:bg-emerald-800'
                            }`}
                          >
                            {isPaid ? 'Desmarcar' : 'Dar Baixa / Pagar'}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB: PONTO DE EQUILÍBRIO */}
      {activeSubTab === 'BREAKEVEN' && (
        <div className="bg-white rounded-xl border border-stone-200/80 p-6 shadow-2xs space-y-4 max-w-xl">
          <div>
            <h3 className="text-base font-bold text-stone-900">Ponto de Equilíbrio (Meta Mínima)</h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Quanto seu restaurante precisa faturar no mínimo para não ficar no prejuízo.
            </p>
          </div>
          <div className="p-4 bg-stone-50 rounded-xl space-y-2 text-xs">
            <div className="flex justify-between">
              <span>Custos Fixos do Mês:</span>
              <span className="font-mono font-bold">{formatCentsToCurrency(dre.operatingExpensesInCents)}</span>
            </div>
            <div className="flex justify-between border-t border-stone-200 pt-2 text-sm font-bold text-stone-900">
              <span>Faturamento Mínimo Necessário:</span>
              <span className="font-mono text-emerald-700">{formatCentsToCurrency(breakEven.breakEvenRevenueInCents)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Modal Entrada de Dinheiro Manual */}
      <Modal
        isOpen={isInflowModalOpen}
        onClose={() => setIsInflowModalOpen(false)}
        title="Lançar Entrada de Dinheiro no Caixa"
        subtitle="Registre uma venda no balcão, PIX, aporte ou qualquer dinheiro que entrou."
      >
        <form onSubmit={handleSaveInflow} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Descrição da Entrada *
            </label>
            <input
              type="text"
              required
              value={inflowDesc}
              onChange={(e) => setInflowDesc(e.target.value)}
              placeholder="Ex: Vendas em dinheiro do dia / Aporte do sócio / PIX avulso"
              className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-stone-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Valor que Entrou (R$) *
              </label>
              <input
                type="text"
                required
                value={inflowAmountStr}
                onChange={(e) => setInflowAmountStr(e.target.value)}
                placeholder="Ex: 450,00"
                className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300 font-mono font-bold text-emerald-700 focus:outline-none focus:ring-1 focus:ring-stone-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Forma de Recebimento *
              </label>
              <select
                value={inflowChannel}
                onChange={(e) => setInflowChannel(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300 bg-white focus:outline-none focus:ring-1 focus:ring-stone-900"
              >
                <option value="PIX">PIX</option>
                <option value="Dinheiro Vivo">Dinheiro Vivo</option>
                <option value="Cartão de Débito">Cartão de Débito</option>
                <option value="Cartão de Crédito">Cartão de Crédito</option>
                <option value="Transferência / TED">Transferência / TED</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Data do Recebimento *
            </label>
            <input
              type="date"
              required
              value={inflowDate}
              onChange={(e) => setInflowDate(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300 font-mono"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
            <button
              type="button"
              onClick={() => setIsInflowModalOpen(false)}
              className="px-3 py-2 text-xs font-medium text-stone-700 hover:bg-stone-100 rounded-lg cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg cursor-pointer shadow-xs"
            >
              Confirmar Entrada
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Saída / Despesa Manual */}
      <Modal
        isOpen={isOutflowModalOpen}
        onClose={() => setIsOutflowModalOpen(false)}
        title="Lançar Saída / Despesa"
        subtitle="Registre o pagamento de uma conta, aluguel, luz, gás, limpeza ou retirada."
      >
        <form onSubmit={handleSaveOutflow} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Descrição da Despesa *
            </label>
            <input
              type="text"
              required
              value={outflowDesc}
              onChange={(e) => setOutflowDesc(e.target.value)}
              placeholder="Ex: Conta de Luz (Enel) / Aluguel do Ponto / Compra de Gás"
              className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-stone-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Valor da Despesa (R$) *
              </label>
              <input
                type="text"
                required
                value={outflowAmountStr}
                onChange={(e) => setOutflowAmountStr(e.target.value)}
                placeholder="Ex: 380,00"
                className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300 font-mono font-bold text-rose-700 focus:outline-none focus:ring-1 focus:ring-stone-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Categoria *
              </label>
              <select
                value={outflowCategory}
                onChange={(e) => setOutflowCategory(e.target.value as any)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300 bg-white focus:outline-none focus:ring-1 focus:ring-stone-900"
              >
                <option value="ALUGUEL">Aluguel do Ponto</option>
                <option value="ENERGIA_AGUA">Energia / Gás / Água</option>
                <option value="FOLHA_MÃO_DE_OBRA">Salários / Equipe</option>
                <option value="FORNECEDOR">Fornecedor / Insumos</option>
                <option value="MANUTENÇÃO">Manutenção / Limpeza</option>
                <option value="IMPOSTOS">Impostos / Simples</option>
                <option value="OUTROS">Outras Despesas</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 items-center">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Data do Pagamento / Vencimento *
              </label>
              <input
                type="date"
                required
                value={outflowDueDate}
                onChange={(e) => setOutflowDueDate(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300 font-mono"
              />
            </div>

            <div className="pt-4">
              <label className="flex items-center gap-2 text-xs text-stone-800 font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAlreadyPaid}
                  onChange={(e) => setIsAlreadyPaid(e.target.checked)}
                  className="rounded w-4 h-4 accent-stone-900"
                />
                <span>Já foi pago agora</span>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
            <button
              type="button"
              onClick={() => setIsOutflowModalOpen(false)}
              className="px-3 py-2 text-xs font-medium text-stone-700 hover:bg-stone-100 rounded-lg cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-stone-900 hover:bg-stone-800 rounded-lg cursor-pointer shadow-xs"
            >
              Confirmar Saída
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
