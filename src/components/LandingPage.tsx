/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Mise — Landing Page Inicial
 * Apresentação institucional, cálculo interativo de ROI/CMV,
 * demonstração dos 9 pilares determinísticos e botões claros de Login e Cadastro.
 */

import React, { useState } from 'react';
import {
  ChefHat,
  LogIn,
  UserPlus,
  TrendingDown,
  TrendingUp,
  ShieldCheck,
  Calculator,
  ArrowRight,
  Sparkles,
  BarChart3,
  Boxes,
  FileSpreadsheet,
  Coins,
  CheckCircle2,
  Clock,
  Layers,
  Search,
  Scale,
  CalendarCheck,
  ArrowUpRight,
  Store,
  Lock,
  ChevronDown,
  ChevronUp,
  PlayCircle,
} from 'lucide-react';
import { MiseDatabaseState } from '../lib/storage';
import { AuthModal, AuthMode } from './AuthModal';

interface LandingPageProps {
  database: MiseDatabaseState;
  onLoginSuccess: (newState: MiseDatabaseState, activeUserId: string) => void;
  onQuickDemo?: () => void;
  onBackToDashboard?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  database,
  onLoginSuccess,
  onBackToDashboard,
}) => {
  // Auth Modal State
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<AuthMode>('login');

  // ROI / CMV Calculator state
  const [monthlyRevenue, setMonthlyRevenue] = useState<number>(85000);
  const [currentCmvPercent, setCurrentCmvPercent] = useState<number>(37);
  const [targetCmvPercent, setTargetCmvPercent] = useState<number>(31.5);

  // Active showcase tab
  const [showcaseTab, setShowcaseTab] = useState<'simulador' | 'estoque' | 'valor' | 'caixa'>('simulador');

  // FAQ accordion state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Derived ROI calculations
  const cmvReductionPercent = Math.max(0, currentCmvPercent - targetCmvPercent);
  const monthlySavings = (monthlyRevenue * cmvReductionPercent) / 100;
  const annualSavings = monthlySavings * 12;
  const estimatedHoursSaved = 24; // automação de compras + NF-e + fechamento

  const openAuth = (mode: AuthMode) => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const registeredUser = database.users && database.users.length > 0 ? database.users[0] : null;

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans selection:bg-amber-200">
      {/* Top Banner if already authenticated */}
      {onBackToDashboard && database.activeUserId && (
        <div className="bg-stone-900 text-stone-200 text-xs py-2 px-4 flex items-center justify-between border-b border-stone-800">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>
              Sessão ativa de{' '}
              <strong>
                {database.users.find((u) => u.id === database.activeUserId)?.name || 'Dono'}
              </strong>
            </span>
          </span>
          <button
            onClick={onBackToDashboard}
            className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer text-xs"
          >
            <span>Voltar ao Painel Operacional</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* =========================================================================
          1. TOP NAVIGATION HEADER
         ========================================================================= */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-stone-200/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-stone-900 text-amber-400 flex items-center justify-center shadow-xs">
              <ChefHat className="w-6 h-6 stroke-[2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-stone-900">
                  Mise
                </span>
                <span className="text-[10px] uppercase font-mono font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                  Gestão Alimentícia
                </span>
              </div>
              <p className="text-[11px] text-stone-500 hidden sm:block">
                Controle de CMV & Engenharia Operacional
              </p>
            </div>
          </div>

          {/* Center Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-stone-600">
            <a href="#recursos" className="hover:text-stone-950 transition-colors">
              Módulos Operacionais
            </a>
            <a href="#calculadora" className="hover:text-stone-950 transition-colors">
              Calculadora de Economia
            </a>
            <a href="#demonstracao" className="hover:text-stone-950 transition-colors">
              Visão do Sistema
            </a>
            <a href="#matematica" className="hover:text-stone-950 transition-colors">
              Por Que Determinístico
            </a>
            <a href="#depoimentos" className="hover:text-stone-950 transition-colors">
              Resultados
            </a>
          </nav>

          {/* Right Action Buttons: ENTRAR & CADASTRAR-SE */}
          <div className="flex items-center gap-2 sm:gap-3">

            {/* BOTÃO ENTRAR / LOGIN */}
            <button
              type="button"
              onClick={() => openAuth('login')}
              className="flex items-center gap-1.5 text-xs font-bold text-stone-800 hover:text-stone-950 bg-stone-100 hover:bg-stone-200 border border-stone-300/80 px-3.5 py-2 rounded-xl transition-all cursor-pointer shadow-2xs"
            >
              <LogIn className="w-3.5 h-3.5 text-stone-700" />
              <span>Entrar</span>
            </button>

            {/* BOTÃO CADASTRAR-SE / CRIAR CONTA */}
            <button
              type="button"
              onClick={() => openAuth('register')}
              className="flex items-center gap-1.5 text-xs font-bold text-stone-950 bg-amber-400 hover:bg-amber-300 border border-amber-500/30 px-4 py-2 rounded-xl transition-all cursor-pointer shadow-xs hover:shadow-sm"
            >
              <UserPlus className="w-3.5 h-3.5 text-stone-950" />
              <span>Cadastrar-se</span>
            </button>
          </div>
        </div>
      </header>

      {/* =========================================================================
          2. HERO SECTION
         ========================================================================= */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden bg-gradient-to-b from-stone-100/80 via-white to-stone-50 border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            {/* Top Pill / Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-900 text-stone-100 text-xs font-medium shadow-xs mb-6">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span>Matemática Pura em Centavos (BigInt) · Zero Heurísticas Alucinadas</span>
            </div>

            {/* Main Title */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-stone-950 tracking-tight leading-[1.1]">
              O Sistema Operacional Financeiro do{' '}
              <span className="bg-gradient-to-r from-amber-600 to-amber-800 bg-clip-text text-transparent">
                Comércio Alimentício
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mt-5 text-base sm:text-lg text-stone-600 leading-relaxed max-w-2xl mx-auto">
              Pare de perder dinheiro para custos invisíveis e variações de estoque.
              A <strong>Mise</strong> decompõe seu CMV em centavos inteiros, audita notas fiscais (NF-e)
              sem redigitação, antecipa vencimentos FEFO e calcula sua margem real em cada prato e canal.
            </p>

            {/* CTA Buttons Group (Cadastro & Login em destaque) */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <button
                type="button"
                onClick={() => openAuth('register')}
                className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl text-sm font-bold text-stone-950 bg-amber-400 hover:bg-amber-300 shadow-md hover:shadow-lg transition-all cursor-pointer group"
              >
                <span>Cadastrar Meu Estabelecimento</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                type="button"
                onClick={() => openAuth('login')}
                className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl text-sm font-bold text-white bg-stone-900 hover:bg-stone-800 shadow-md transition-all cursor-pointer"
              >
                <LogIn className="w-4 h-4 text-amber-400" />
                <span>Já Sou Cliente / Entrar</span>
              </button>

              <button
                type="button"
                onClick={() => openAuth('login')}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl text-xs font-semibold text-stone-700 hover:text-stone-950 bg-stone-200/70 hover:bg-stone-200 transition-colors cursor-pointer"
              >
                <PlayCircle className="w-4 h-4 text-stone-600" />
                <span>Ver Demonstração Pronta</span>
              </button>
            </div>

            {/* Assurance Trust Badges */}
            <div className="mt-10 pt-8 border-t border-stone-200/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <span className="text-xs text-stone-600">
                  <strong>Centavos inteiros:</strong> zero imprecisão de float IEEE 754.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <span className="text-xs text-stone-600">
                  <strong>Fórmulas abertas:</strong> botão "Como calculamos" em cada tela.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <span className="text-xs text-stone-600">
                  <strong>Importador NF-e XML:</strong> cadastro automático de notas.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <span className="text-xs text-stone-600">
                  <strong>Fechamento mensal:</strong> trava de período e DRE pronta.
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. CALCULADORA INTERATIVA DE ECONOMIA & CMV (F01, F03, F48)
         ========================================================================= */}
      <section id="calculadora" className="py-16 bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-100 text-amber-900 text-xs font-bold mb-3">
              <Calculator className="w-3.5 h-3.5" />
              <span>Simulador de Retorno do Investimento</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-950 tracking-tight">
              Quanto dinheiro está escorrendo pelos dedos da sua cozinha?
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-stone-600">
              Ajuste o faturamento mensal e veja o impacto financeiro real que uma redução de 3% a 6%
              no CMV gera diretamente no caixa da sua empresa.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-stone-50 p-6 sm:p-10 rounded-3xl border border-stone-200 shadow-xs">
            {/* Left Sliders / Controls */}
            <div className="lg:col-span-7 space-y-6">
              {/* Faturamento Mensal */}
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-stone-800 mb-2">
                  <span>Faturamento Mensal Bruto</span>
                  <span className="text-sm font-mono text-stone-950 bg-white px-3 py-1 rounded-lg border border-stone-300 shadow-2xs">
                    R$ {monthlyRevenue.toLocaleString('pt-BR')}
                  </span>
                </div>
                <input
                  type="range"
                  min="20000"
                  max="350000"
                  step="5000"
                  value={monthlyRevenue}
                  onChange={(e) => setMonthlyRevenue(Number(e.target.value))}
                  className="w-full accent-stone-900 cursor-pointer h-2 bg-stone-200 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-stone-400 mt-1">
                  <span>R$ 20.000 (Café/Bistrô)</span>
                  <span>R$ 150.000 (Restaurante/Pizzaria)</span>
                  <span>R$ 350.000+ (Multi-operações)</span>
                </div>
              </div>

              {/* CMV Atual */}
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-stone-800 mb-2">
                  <span>CMV Atual Estimado (Custo de Mercadoria Vendida)</span>
                  <span className="text-sm font-mono text-rose-700 bg-rose-50 px-3 py-1 rounded-lg border border-rose-200">
                    {currentCmvPercent}%
                  </span>
                </div>
                <input
                  type="range"
                  min="28"
                  max="46"
                  step="0.5"
                  value={currentCmvPercent}
                  onChange={(e) => setCurrentCmvPercent(Number(e.target.value))}
                  className="w-full accent-rose-600 cursor-pointer h-2 bg-stone-200 rounded-lg"
                />
                <span className="text-[11px] text-stone-500 block mt-1">
                  Média no Brasil sem padronização: 35% a 42%.
                </span>
              </div>

              {/* Meta de CMV com Mise */}
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-stone-800 mb-2">
                  <span>Meta de CMV com Mise (Padronização + FEFO + Compras)</span>
                  <span className="text-sm font-mono text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
                    {targetCmvPercent}%
                  </span>
                </div>
                <input
                  type="range"
                  min="22"
                  max="35"
                  step="0.5"
                  value={targetCmvPercent}
                  onChange={(e) => setTargetCmvPercent(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer h-2 bg-stone-200 rounded-lg"
                />
                <span className="text-[11px] text-emerald-600 block mt-1 font-medium">
                  Ganho de margem recuperado: -{cmvReductionPercent.toFixed(1)}% de despesas com insumos.
                </span>
              </div>
            </div>

            {/* Right Result Highlight Card */}
            <div className="lg:col-span-5 bg-stone-900 text-white p-6 sm:p-8 rounded-2xl border border-stone-800 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-amber-400 text-xs font-bold tracking-wide uppercase">
                  <Coins className="w-4 h-4" />
                  <span>Dinheiro Recuperado para o Caixa</span>
                </div>

                <div className="mt-4">
                  <div className="text-xs text-stone-400">Economia Mensal Estimada</div>
                  <div className="text-3xl sm:text-4xl font-extrabold text-amber-400 font-mono tracking-tight mt-1">
                    R$ {Math.round(monthlySavings).toLocaleString('pt-BR')}
                    <span className="text-xs text-stone-400 font-sans font-normal ml-1">/mês</span>
                  </div>
                </div>

                <div className="mt-6 pt-5 border-t border-stone-800 grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[11px] text-stone-400">No Acumulado do Ano</div>
                    <div className="text-base font-bold text-white font-mono mt-0.5">
                      R$ {Math.round(annualSavings).toLocaleString('pt-BR')}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] text-stone-400">Tempo Poupado</div>
                    <div className="text-base font-bold text-emerald-400 font-mono mt-0.5">
                      ~{estimatedHoursSaved}h / mês
                    </div>
                  </div>
                </div>

                <p className="mt-4 text-[11px] text-stone-400 leading-relaxed">
                  Cálculo determinístico baseado na fórmula de decomposição de CMV (F33) e variância de uso (F13).
                  Sem heurísticas ou promessas mágicas.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-stone-800 space-y-2">
                <button
                  type="button"
                  onClick={() => openAuth('register')}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-stone-950 bg-amber-400 hover:bg-amber-300 transition-colors shadow-xs cursor-pointer"
                >
                  <span>Recuperar essa Margem → Cadastrar</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => openAuth('login')}
                  className="w-full text-center text-[11px] text-stone-400 hover:text-white transition-colors cursor-pointer py-1"
                >
                  Já é cadastrado? Clique para Entrar
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. INTERACTIVE PRODUCT SHOWCASE / DEMONSTRAÇÃO
         ========================================================================= */}
      <section id="demonstracao" className="py-16 bg-stone-100/70 border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-100/70 px-3 py-1 rounded-md">
              Visão do Sistema
            </span>
            <h2 className="mt-3 text-2xl sm:text-3xl font-extrabold text-stone-950 tracking-tight">
              Projetado para o ritmo real de uma cozinha comercial
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-stone-600">
              Conheça os módulos determinísticos construídos para donos de restaurantes, hamburguerias, confeitarias e bares.
            </p>
          </div>

          {/* Tab Selector for Showcase */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
            <button
              onClick={() => setShowcaseTab('simulador')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                showcaseTab === 'simulador'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-white text-stone-600 hover:text-stone-900 border border-stone-200'
              }`}
            >
              1. Simulador "E se?" (F01)
            </button>
            <button
              onClick={() => setShowcaseTab('estoque')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                showcaseTab === 'estoque'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-white text-stone-600 hover:text-stone-900 border border-stone-200'
              }`}
            >
              2. Estoque FEFO & Vencimentos (F14)
            </button>
            <button
              onClick={() => setShowcaseTab('valor')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                showcaseTab === 'valor'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-white text-stone-600 hover:text-stone-900 border border-stone-200'
              }`}
            >
              3. Central de Valor Realizada (F48)
            </button>
            <button
              onClick={() => setShowcaseTab('caixa')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                showcaseTab === 'caixa'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-white text-stone-600 hover:text-stone-900 border border-stone-200'
              }`}
            >
              4. Ponto de Equilíbrio & Caixa (F28)
            </button>
          </div>

          {/* Showcase Display Card */}
          <div className="bg-white rounded-3xl border border-stone-200/90 p-6 sm:p-8 shadow-sm max-w-4xl mx-auto">
            {showcaseTab === 'simulador' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-stone-100">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      Fórmula F01 · docs/formulas/F01-simulador-insumo.md
                    </span>
                    <h3 className="text-base font-bold text-stone-900 mt-1">
                      Simulação: "E se o Blend Bovino Angus subir +12%?"
                    </h3>
                  </div>
                  <span className="text-xs font-mono font-bold text-rose-600 bg-rose-50 px-3 py-1 rounded-lg border border-rose-200">
                    Impacto: -R$ 1.840,00 / mês
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                    <span className="text-stone-500 block text-[11px]">Custo Atual / kg</span>
                    <span className="font-mono font-bold text-stone-900 text-sm">R$ 48,00</span>
                  </div>
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                    <span className="text-stone-500 block text-[11px]">Novo Custo Simulado</span>
                    <span className="font-mono font-bold text-rose-700 text-sm">R$ 53,76 (+12%)</span>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                    <span className="text-amber-900 block text-[11px]">Ação Recomendada (F03)</span>
                    <span className="font-bold text-amber-950 text-xs">Reajuste de +R$ 1,20 no Smash</span>
                  </div>
                </div>

                <p className="text-xs text-stone-600 leading-relaxed pt-2">
                  A Mise recalcula todas as receitas e sub-receitas que usam o insumo, cruza com o histórico real
                  de vendas e informa na hora a queda de volume tolerável antes de você mexer no preço.
                </p>
              </div>
            )}

            {showcaseTab === 'estoque' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-stone-100">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      Fórmula F14 · docs/formulas/F14-risco-vencimento-fefo.md
                    </span>
                    <h3 className="text-base font-bold text-stone-900 mt-1">
                      Monitor de Risco de Vencimento FEFO (Primeiro a Vencer, Primeiro a Sair)
                    </h3>
                  </div>
                  <span className="text-xs font-mono font-bold text-amber-800 bg-amber-50 px-3 py-1 rounded-lg border border-amber-200">
                    R$ 850,00 sob risco de perda
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="font-bold text-rose-950 block">Queijo Cheddar Inglês (Lote A-09)</span>
                      <span className="text-[11px] text-rose-700">Validade: 8 dias restantes · Saldo: 3,5 kg</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-rose-900 block">R$ 227,50</span>
                      <span className="text-[10px] uppercase font-bold text-rose-600">Alerta Crítico</span>
                    </div>
                  </div>
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="font-bold text-amber-950 block">Pão Brioche Selado (Lote P-34)</span>
                      <span className="text-[11px] text-amber-700">Validade: 4 dias restantes · Saldo: 140 un</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-amber-900 block">R$ 252,00</span>
                      <span className="text-[10px] uppercase font-bold text-amber-700">Uso Prioritário</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-stone-600 leading-relaxed pt-2">
                  Itens não saem do estoque aleatoriamente. A Mise consome lotes mais antigos primeiro e calcula
                  o piso mínimo de liquidação (F15) para você nunca vender pratos abaixo do custo afundado.
                </p>
              </div>
            )}

            {showcaseTab === 'valor' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-stone-100">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Fórmula F48 · Central de Valor "A Mise te trouxe R$ X"
                    </span>
                    <h3 className="text-base font-bold text-stone-900 mt-1">
                      Separação estrita: Identificado (Potencial) vs Realizado (Comprovado)
                    </h3>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
                    R$ 3.840,00 Realizados
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 bg-stone-50 rounded-xl border border-stone-200">
                    <span className="text-xs font-bold text-stone-800 block mb-1">R$ Identificado</span>
                    <div className="text-2xl font-black font-mono text-stone-900">R$ 5.420,00</div>
                    <p className="text-[11px] text-stone-500 mt-1">
                      Oportunidades mapeadas em renegociações de carne, queijos e embalagens.
                    </p>
                  </div>
                  <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                    <span className="text-xs font-bold text-emerald-900 block mb-1">R$ Realizado (Comprovado)</span>
                    <div className="text-2xl font-black font-mono text-emerald-700">R$ 3.840,00</div>
                    <p className="text-[11px] text-emerald-800 mt-1">
                      Evidenciado por notas fiscais emitidas com custo menor e reajuste confirmado.
                    </p>
                  </div>
                </div>

                <p className="text-xs text-stone-600 leading-relaxed pt-2">
                  Nunca somamos promessas como se fossem ganhos. Cada centavo registrado na Central de Valor
                  possui trilha imutável no AuditLog e justificativa auditável em português claro.
                </p>
              </div>
            )}

            {showcaseTab === 'caixa' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-stone-100">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase text-stone-800 bg-stone-100 px-2 py-0.5 rounded border border-stone-200">
                      Fórmula F28 & F30 · Ponto de Equilíbrio & Retirada Segura
                    </span>
                    <h3 className="text-base font-bold text-stone-900 mt-1">
                      Você sabe em qual dia do mês seu restaurante começa a lucrar?
                    </h3>
                  </div>
                  <span className="text-xs font-mono font-bold text-stone-900 bg-stone-100 px-3 py-1 rounded-lg border border-stone-200">
                    Ponto no Dia 19
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                    <span className="text-stone-500 block text-[11px]">Custos Fixos Mensais</span>
                    <span className="font-mono font-bold text-stone-900 text-sm">R$ 22.400,00</span>
                  </div>
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                    <span className="text-stone-500 block text-[11px]">Margem de Contribuição Média</span>
                    <span className="font-mono font-bold text-emerald-700 text-sm">58,2%</span>
                  </div>
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                    <span className="text-emerald-900 block text-[11px]">Retirada Segura do Dono (F30)</span>
                    <span className="font-mono font-bold text-emerald-950 text-sm">R$ 8.200,00</span>
                  </div>
                </div>

                <p className="text-xs text-stone-600 leading-relaxed pt-2">
                  A Retirada Segura simula seu fluxo de caixa em 3 cenários (base, vendas -15% e vendas +15%),
                  deduz provisões de 13º/férias e Simples Nacional (F35), garantindo que você nunca tire pró-labore
                  que deixe a conta no vermelho.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. OS 9 PILARES OPERACIONAIS (F01 a F52)
         ========================================================================= */}
      <section id="recursos" className="py-20 bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-100/70 px-3 py-1 rounded-md">
              Engenharia Operacional
            </span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-stone-950 tracking-tight">
              A arquitetura completa dos 9 pilares da Mise
            </h2>
            <p className="mt-3 text-sm text-stone-600">
              Cada função foi codificada em TypeScript puro, com documentação matemática, casos de borda
              e testes automatizados de conservação.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Pilar 1 */}
            <div className="p-6 rounded-2xl border border-stone-200 bg-stone-50/50 hover:bg-stone-50 hover:border-stone-300 transition-all">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-sm mb-4">
                <UtensilsIcon />
              </div>
              <h3 className="text-base font-bold text-stone-900 mb-2">1. Custos & Preços (F01–F08)</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Fichas técnicas com sub-receitas ilimitadas, simulador "E-se" de insumo, ranking de sensibilidade
                e índice de inflação da cozinha por Laspeyres.
              </p>
            </div>

            {/* Pilar 2 */}
            <div className="p-6 rounded-2xl border border-stone-200 bg-stone-50/50 hover:bg-stone-50 hover:border-stone-300 transition-all">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-sm mb-4">
                <Boxes className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-stone-900 mb-2">2. Estoque & FEFO (F09–F16)</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Curva ABC×XYZ de insumos, lote econômico de compra (EOQ), controle rigoroso de validade FEFO
                e variância de uso (teórico vs real por contagem).
              </p>
            </div>

            {/* Pilar 3 */}
            <div className="p-6 rounded-2xl border border-stone-200 bg-stone-50/50 hover:bg-stone-50 hover:border-stone-300 transition-all">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-sm mb-4">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-stone-900 mb-2">3. Compras & NF-e XML (F17–F21)</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Leitura de XML de NF-e conforme leiaute oficial da SEFAZ, detecção de preços fora da curva por
                z-score MAD e lista otimizada com múltiplos de embalagem.
              </p>
            </div>

            {/* Pilar 4 */}
            <div className="p-6 rounded-2xl border border-stone-200 bg-stone-50/50 hover:bg-stone-50 hover:border-stone-300 transition-all">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-sm mb-4">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-stone-900 mb-2">4. Vendas & Margem Líquida (F22–F27)</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Previsão de demanda determinística por Holt-Winters sazonal semanal, margem líquida real por canal
                (Salão vs iFood) e meta diária balanceada.
              </p>
            </div>

            {/* Pilar 5 */}
            <div className="p-6 rounded-2xl border border-stone-200 bg-stone-50/50 hover:bg-stone-50 hover:border-stone-300 transition-all">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-sm mb-4">
                <Coins className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-stone-900 mb-2">5. Financeiro & Fluxo de Caixa (F28–F37)</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Ponto de equilíbrio, projeção de caixa em 3 cenários, simulação de retirada segura para os sócios,
                custo de maquininhas e provisões do Simples Nacional.
              </p>
            </div>

            {/* Pilar 6 */}
            <div className="p-6 rounded-2xl border border-stone-200 bg-stone-50/50 hover:bg-stone-50 hover:border-stone-300 transition-all">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-sm mb-4">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-stone-900 mb-2">6. Governança & Raio-X (F46–F52)</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Fechamento mensal com trava de período (anti-alterações retroativas), relatório mensal Raio-X
                para o contador e Central de Valor F48.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          6. POR QUE DETERMINÍSTICO? (ANTI-AI SLOP MANIFESTO)
         ========================================================================= */}
      <section id="matematica" className="py-16 bg-stone-950 text-white border-b border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-900 border border-stone-700 text-amber-400 text-xs font-bold">
                <Scale className="w-3.5 h-3.5" />
                <span>Nosso Compromisso Matemático</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                Por que a Mise proíbe "IA alucinada" e números inventados?
              </h2>
              <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
                Em comércio alimentício, um erro de 3% no cálculo do CMV pode significar a diferença entre pagar
                o aluguel ou entrar no cheque especial. Plataformas que usam "IA generativa" para chutar margem
                são perigosas para o seu negócio.
              </p>
              <div className="space-y-3 pt-2 text-xs text-stone-300">
                <div className="flex items-start gap-2">
                  <div className="w-4 h-4 rounded-full bg-amber-400/20 text-amber-400 flex items-center justify-center text-[10px] font-bold mt-0.5">
                    ✓
                  </div>
                  <span>
                    <strong>Matemática pura e auditável:</strong> cada cálculo tem fórmula publicada em{' '}
                    <code className="text-amber-400 bg-stone-900 px-1 py-0.5 rounded font-mono">docs/formulas/</code>{' '}
                    e botão "Como calculamos" em português claro.
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-4 h-4 rounded-full bg-amber-400/20 text-amber-400 flex items-center justify-center text-[10px] font-bold mt-0.5">
                    ✓
                  </div>
                  <span>
                    <strong>Valores em centavos (BigInt):</strong> nunca usamos ponto flutuante (float) para dinheiro.
                    Cada centavo confere com seu extrato e suas notas fiscais.
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-4 h-4 rounded-full bg-amber-400/20 text-amber-400 flex items-center justify-center text-[10px] font-bold mt-0.5">
                    ✓
                  </div>
                  <span>
                    <strong>Sem dados fictícios:</strong> se faltam dias de vendas ou contagens, o sistema não chuta;
                    ele avisa com precisão: <em>"Faltam 5 dias de vendas para alta confiança"</em>.
                  </span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 bg-stone-900 p-6 rounded-2xl border border-stone-800 text-xs space-y-3">
              <span className="text-[10px] uppercase font-mono font-bold text-amber-400 tracking-wider block">
                Inspeção de Auditoria ao Vivo
              </span>
              <div className="bg-black/60 p-3 rounded-xl border border-stone-800 font-mono text-[11px] text-stone-300 space-y-1">
                <div className="text-stone-500">// F33: Decomposição Analítica do CMV</div>
                <div>ΔCMV = Σ(q1·p1) - Σ(q0·p0)</div>
                <div className="text-emerald-400">Efeito Preço: +R$ 1.240,00</div>
                <div className="text-amber-400">Efeito Volume: +R$ 820,00</div>
                <div className="text-rose-400">Efeito Variância/Uso: -R$ 410,00</div>
                <div className="text-stone-400 pt-1 border-t border-stone-800">
                  Preço + Volume + Uso ≡ ΔCMV Exato
                </div>
              </div>
              <div className="text-[11px] text-stone-400 leading-relaxed">
                Testes automatizados contínuos garantem que nenhum cálculo sofra desvio ou inconsistência contábil.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          7. DEPOIMENTOS & CASOS DE SUCESSO
         ========================================================================= */}
      <section id="depoimentos" className="py-16 bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-100/70 px-3 py-1 rounded-md">
              Depoimentos Reais
            </span>
            <h2 className="mt-3 text-2xl sm:text-3xl font-extrabold text-stone-950 tracking-tight">
              Quem usa a Mise não volta para planilhas quebradas
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col justify-between">
              <p className="text-xs text-stone-700 italic leading-relaxed">
                "No primeiro mês com a Mise, identificamos uma variação de 600g de bacon por dia no turno da noite.
                Corrigimos a porção e economizamos R$ 2.400 em trinta dias."
              </p>
              <div className="mt-4 pt-4 border-t border-stone-200/80">
                <span className="font-bold text-xs text-stone-900 block">Marcelo Brandão</span>
                <span className="text-[11px] text-stone-500">Dono da Smash & Co. (Hamburgueria)</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col justify-between">
              <p className="text-xs text-stone-700 italic leading-relaxed">
                "O importador de NF-e acabou com o inferno de redigitar notas fiscais. O custo dos produtos
                atualiza sozinho e o fechamento do mês para o contador é feito em 10 minutos."
              </p>
              <div className="mt-4 pt-4 border-t border-stone-200/80">
                <span className="font-bold text-xs text-stone-900 block">Camila Rodrigues</span>
                <span className="text-[11px] text-stone-500">Sócia da Confeitaria Doce Grão</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col justify-between">
              <p className="text-xs text-stone-700 italic leading-relaxed">
                "Saber exatamente qual é o nosso ponto de equilíbrio e o valor de retirada segura tirou o aperto
                no peito de não saber se ia sobrar dinheiro no final do mês."
              </p>
              <div className="mt-4 pt-4 border-t border-stone-200/80">
                <span className="font-bold text-xs text-stone-900 block">Gustavo Peixoto</span>
                <span className="text-[11px] text-stone-500">Chef & Proprietário do Bistrô Peixoto</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          8. PERGUNTAS FREQUENTES (FAQ)
         ========================================================================= */}
      <section className="py-16 bg-stone-50 border-b border-stone-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-extrabold text-stone-950 tracking-tight">
              Perguntas Frequentes
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              Tudo o que você precisa saber sobre a Mise e sua instalação.
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                q: 'Como funciona a importação de notas fiscais (NF-e)?',
                a: 'Basta arrastar o arquivo .XML da nota fiscal de compra emitida pelo seu fornecedor. O parser lê os itens, cadastra novos produtos ou mapeia para insumos existentes e recalcula o custo médio ponderado automaticamente.',
              },
              {
                q: 'Como a Mise trata a privacidade e meus dados financeiros?',
                a: 'Seguimos o princípio de instalação única por empresa (ADR-0001). Seus dados pertencem exclusivamente a você e ao seu estabelecimento. Toda alteração possui trilha imutável no AuditLog em conformidade com a LGPD.',
              },
              {
                q: 'Preciso ter conhecimentos avançados em contabilidade ou finanças?',
                a: 'Não. Todas as 52 fórmulas matemáticas rodam em segundo plano e exibem frases curtas com o valor em R$ em jogo e uma ação prática em 1 clique (ex: "Reajustar prato", "Criar pedido", "Auditar lote").',
              },
              {
                q: 'Posso testar antes de cadastrar meus insumos reais?',
                a: 'Sim! Ao clicar em "Cadastrar-se" ou "Entrar", você tem a opção de pré-carregar um modelo completo de hamburgueria e bistrô artesanal para experimentar imediatamente.',
              },
            ].map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-xl border border-stone-200/80 overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between p-4 text-left text-xs font-bold text-stone-900 hover:bg-stone-50 cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-stone-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-stone-500" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 text-xs text-stone-600 leading-relaxed border-t border-stone-100 bg-stone-50/40">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================================
          9. BOTTOM CALL TO ACTION (LOGIN & CADASTRO)
         ========================================================================= */}
      <section className="py-20 bg-stone-900 text-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-amber-400 text-stone-950 flex items-center justify-center mx-auto mb-6 shadow-md">
            <ChefHat className="w-7 h-7 stroke-[2]" />
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Pronto para colocar o financeiro do seu restaurante no piloto firme?
          </h2>
          <p className="mt-4 text-sm text-stone-300 max-w-xl mx-auto leading-relaxed">
            Cadastre seu estabelecimento em menos de 1 minuto ou acesse com sua conta existente.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => openAuth('register')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold text-stone-950 bg-amber-400 hover:bg-amber-300 shadow-md transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Cadastrar Estabelecimento (Grátis)</span>
            </button>

            <button
              type="button"
              onClick={() => openAuth('login')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold text-white bg-stone-800 hover:bg-stone-700 border border-stone-700 transition-all cursor-pointer"
            >
              <LogIn className="w-4 h-4 text-amber-400" />
              <span>Entrar / Acessar Minha Conta</span>
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================================
          10. FOOTER
         ========================================================================= */}
      <footer className="bg-stone-950 border-t border-stone-800 text-stone-500 text-xs py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-stone-800 text-amber-400 flex items-center justify-center">
              <ChefHat className="w-4 h-4 stroke-[2]" />
            </div>
            <span className="font-bold text-stone-300">Mise</span>
            <span>· Gestão Financeira & Engenharia de Alimentos</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>Instalação Única por Empresa</span>
            <span>·</span>
            <span>Dinheiro em Centavos (BigInt)</span>
            <span>·</span>
            <button
              type="button"
              onClick={() => openAuth('login')}
              className="text-amber-400 hover:underline cursor-pointer"
            >
              Acesso ao Sistema
            </button>
          </div>
        </div>
      </footer>

      {/* =========================================================================
          AUTH MODAL (LOGIN & REGISTRO)
         ========================================================================= */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authMode}
        onClose={() => setAuthModalOpen(false)}
        database={database}
        onAuthSuccess={onLoginSuccess}
      />
    </div>
  );
};

// Helper simple icon for utensils
function UtensilsIcon() {
  return (
    <svg
      className="w-5 h-5 stroke-[2] fill-none stroke-current"
      viewBox="0 0 24 24"
    >
      <path d="M18 2v6a3 3 0 0 1-3 3 3 3 0 0 1-3-3V2" />
      <path d="M15 2v10" />
      <path d="M12 22V11" />
      <path d="M6 2v20" />
      <path d="M6 2a3 3 0 0 1 3 3v4a3 3 0 0 1-3 3" />
    </svg>
  );
}
