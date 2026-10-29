/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Mise — Modal de Autenticação Unificado (Entrar & Criar Conta)
 * Suporta login direto, seleção de perfil existente e cadastro rápido do dono.
 */

import React, { useState } from 'react';
import {
  ChefHat,
  Lock,
  Mail,
  User as UserIcon,
  Store,
  Sparkles,
  ArrowRight,
  LogIn,
  UserPlus,
  X,
  CheckCircle2,
  Building,
  HelpCircle,
} from 'lucide-react';
import { MiseDatabaseState, saveDatabase, appendAuditLog } from '../lib/storage';
import { createDemoSeedDatabase } from '../lib/demo-data';
import { User, Company, Store as StoreType } from '../domain/types';

export type AuthMode = 'login' | 'register';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: AuthMode;
  onClose: () => void;
  database: MiseDatabaseState;
  onAuthSuccess: (newState: MiseDatabaseState, activeUserId: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'login',
  onClose,
  database,
  onAuthSuccess,
}) => {
  const [mode, setMode] = useState<AuthMode>(initialMode);

  // Login form state
  const users = database.users || [];
  const [selectedUserId, setSelectedUserId] = useState<string>(
    users.length > 0 ? users[0].id : ''
  );
  const [loginEmail, setLoginEmail] = useState<string>('');
  const [loginPin, setLoginPin] = useState<string>('');
  const [loginError, setLoginError] = useState<string>('');

  // Register form state
  const [ownerName, setOwnerName] = useState<string>('');
  const [ownerEmail, setOwnerEmail] = useState<string>('');
  const [restaurantName, setRestaurantName] = useState<string>('');
  const [segment, setSegment] = useState<string>('Hamburgueria & Lanchonete');
  const [storeName, setStoreName] = useState<string>('Matriz');
  const [accessPin, setAccessPin] = useState<string>('1234');
  const [loadDemoData, setLoadDemoData] = useState<boolean>(true);
  const [registerError, setRegisterError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  // Handle standard login
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    let targetUser: User | undefined;
    if (selectedUserId) {
      targetUser = users.find((u) => u.id === selectedUserId);
    } else if (loginEmail.trim()) {
      targetUser = users.find(
        (u) => u.email.toLowerCase() === loginEmail.trim().toLowerCase()
      );
    }

    if (!targetUser) {
      setLoginError(
        'Usuário não encontrado. Se é seu primeiro acesso, clique na aba "Criar Conta" acima.'
      );
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const updated: MiseDatabaseState = {
        ...database,
        activeUserId: targetUser.id,
      };
      const audited = appendAuditLog(
        updated,
        'USER_LOGIN',
        'User',
        targetUser.id,
        `Usuário '${targetUser.name}' conectou-se com sucesso.`
      );
      saveDatabase(audited);
      setIsSubmitting(false);
      onAuthSuccess(audited, targetUser.id);
      onClose();
    }, 200);
  };

  // Quick 1-click Demo Login
  const handleDemoLogin = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      const demoState = createDemoSeedDatabase(
        'Bistrô & Burger Artesanal',
        'Chef Rodrigo Silva (Dono)',
        'rodrigo@misebistro.com'
      );
      saveDatabase(demoState);
      setIsSubmitting(false);
      onAuthSuccess(demoState, demoState.activeUserId!);
      onClose();
    }, 250);
  };

  // Handle Registration
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError('');

    if (!ownerName.trim()) {
      setRegisterError('Por favor informe seu nome completo.');
      return;
    }
    if (!ownerEmail.trim() || !ownerEmail.includes('@')) {
      setRegisterError('Por favor informe um e-mail válido.');
      return;
    }
    if (!restaurantName.trim()) {
      setRegisterError('Informe o nome do seu restaurante ou comércio alimentício.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      try {
        if (loadDemoData) {
          // Iniciar com modelo calibrado customizado com os dados do usuário
          const seeded = createDemoSeedDatabase(
            restaurantName.trim(),
            ownerName.trim(),
            ownerEmail.trim()
          );
          saveDatabase(seeded);
          setIsSubmitting(false);
          onAuthSuccess(seeded, seeded.activeUserId!);
          onClose();
          return;
        }

        // Iniciar limpo (sem insumos ou receitas)
        const now = new Date().toISOString();
        const companyId = `comp_${Date.now()}`;
        const storeId = `store_${Date.now()}`;
        const userId = `user_${Date.now()}`;

        const company: Company = {
          id: companyId,
          name: restaurantName.trim(),
          createdAt: now,
          updatedAt: now,
        };

        const newStore: StoreType = {
          id: storeId,
          name: storeName.trim() || 'Matriz',
          code: 'MATRIZ',
          isMainStore: true,
          createdAt: now,
        };

        const newUser: User = {
          id: userId,
          name: ownerName.trim(),
          email: ownerEmail.trim().toLowerCase(),
          role: 'DONO',
          storeIds: [storeId],
          twoFactorEnabled: false,
          createdAt: now,
        };

        const freshState: MiseDatabaseState = {
          company,
          stores: [newStore],
          users: [newUser],
          activeUserId: userId,
          activeStoreId: storeId,
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

        const audited = appendAuditLog(
          freshState,
          'USER_REGISTER',
          'Company',
          companyId,
          `Conta do proprietário '${newUser.name}' e estabelecimento '${company.name}' cadastrados.`
        );
        saveDatabase(audited);
        setIsSubmitting(false);
        onAuthSuccess(audited, userId);
        onClose();
      } catch (err: any) {
        setRegisterError(err?.message || 'Falha ao realizar cadastro.');
        setIsSubmitting(false);
      }
    }, 250);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs">
      <div
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-stone-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-stone-900 text-amber-400 flex items-center justify-center shadow-xs">
              <ChefHat className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900 leading-tight">
                Mise — Gestão Alimentícia
              </h3>
              <p className="text-xs text-stone-500">
                {mode === 'login' ? 'Acesse seu painel operacional' : 'Crie sua conta e proteja sua margem'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Buttons (Entrar vs Cadastrar) */}
        <div className="grid grid-cols-2 p-1.5 mx-6 mt-4 bg-stone-100 rounded-xl border border-stone-200/70 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`flex items-center justify-center gap-2 py-2 rounded-lg transition-all ${
              mode === 'login'
                ? 'bg-white text-stone-900 shadow-2xs font-bold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Entrar (Login)</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`flex items-center justify-center gap-2 py-2 rounded-lg transition-all ${
              mode === 'register'
                ? 'bg-white text-stone-900 shadow-2xs font-bold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Cadastrar-se (Grátis)</span>
          </button>
        </div>

        {/* Modal Body / Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {mode === 'login' ? (
            /* TAB: ENTRAR */
            <div className="space-y-4">
              {loginError && (
                <div className="p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
                  {loginError}
                </div>
              )}

              {users.length > 0 ? (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-2">
                    Selecione o Usuário Cadastrado
                  </label>
                  <div className="space-y-2">
                    {users.map((u) => {
                      const isSel = u.id === selectedUserId;
                      return (
                        <div
                          key={u.id}
                          onClick={() => {
                            setSelectedUserId(u.id);
                            setLoginEmail(u.email);
                          }}
                          className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                            isSel
                              ? 'border-stone-900 bg-stone-50/80 shadow-2xs'
                              : 'border-stone-200 hover:border-stone-300 bg-white'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold ${
                                isSel
                                  ? 'bg-stone-900 text-amber-400'
                                  : 'bg-stone-100 text-stone-600'
                              }`}
                            >
                              {u.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="text-xs font-bold text-stone-900">{u.name}</div>
                              <div className="text-[11px] text-stone-500">{u.email}</div>
                            </div>
                          </div>
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-stone-100 text-stone-700 border border-stone-200">
                            {u.role}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-amber-50/60 border border-amber-200/80 rounded-xl text-center">
                  <p className="text-xs text-amber-900 font-medium">
                    Ainda não há cadastro de restaurante gravado neste navegador.
                  </p>
                  <button
                    type="button"
                    onClick={() => setMode('register')}
                    className="mt-2 text-xs font-bold text-stone-900 hover:underline inline-flex items-center gap-1"
                  >
                    <span>Criar conta agora em 30 segundos</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              )}

              {/* Login Email fallback if user wants to type */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Ou digite seu E-mail de Acesso
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="dono@restaurante.com.br"
                    className="w-full text-xs pl-9 pr-3.5 py-2.5 rounded-lg border border-stone-300 focus:border-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Código de Acesso / PIN (Opcional)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    maxLength={6}
                    value={loginPin}
                    onChange={(e) => setLoginPin(e.target.value)}
                    placeholder="****"
                    className="w-full text-xs pl-9 pr-3.5 py-2.5 rounded-lg border border-stone-300 font-mono tracking-widest focus:border-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleLoginSubmit}
                disabled={isSubmitting || (!selectedUserId && !loginEmail.trim())}
                className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-white bg-stone-900 hover:bg-stone-800 transition-colors shadow-sm cursor-pointer disabled:opacity-50"
              >
                <LogIn className="w-4 h-4" />
                <span>{isSubmitting ? 'Conectando...' : 'Entrar no Sistema'}</span>
              </button>

              {/* Quick Demo Access Divider */}
              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-stone-200" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-bold text-stone-400">
                  <span className="bg-white px-2">Ou experimente sem cadastro</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleDemoLogin}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300/80 transition-colors cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Acesso Rápido de Demonstração (Bistrô & Burger)</span>
              </button>
            </div>
          ) : (
            /* TAB: CADASTRAR-SE */
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              {registerError && (
                <div className="p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
                  {registerError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Nome do Dono / Gestor *
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      placeholder="Ex: Carlos Eduardo"
                      className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-stone-300 focus:border-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    E-mail Profissional *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      value={ownerEmail}
                      onChange={(e) => setOwnerEmail(e.target.value)}
                      placeholder="carlos@seurestaurante.com"
                      className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-stone-300 focus:border-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Nome do Estabelecimento *
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={restaurantName}
                    onChange={(e) => setRestaurantName(e.target.value)}
                    placeholder="Ex: Cantina & Pizzaria Bella Donna"
                    className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-stone-300 focus:border-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Segmento de Atuação
                  </label>
                  <select
                    value={segment}
                    onChange={(e) => setSegment(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300 bg-white focus:border-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
                  >
                    <option value="Hamburgueria & Lanchonete">Hamburgueria & Lanchonete</option>
                    <option value="Restaurante À La Carte">Restaurante À La Carte</option>
                    <option value="Pizzaria & Forneria">Pizzaria & Forneria</option>
                    <option value="Cafeteria & Confeitaria">Cafeteria & Confeitaria</option>
                    <option value="Bar & Choperia">Bar & Choperia</option>
                    <option value="Marmitaria & Dark Kitchen">Marmitaria & Dark Kitchen</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Nome da Unidade
                  </label>
                  <div className="relative">
                    <Store className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      placeholder="Matriz"
                      className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-stone-300 focus:border-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Código PIN de Acesso Rápido
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    maxLength={6}
                    value={accessPin}
                    onChange={(e) => setAccessPin(e.target.value)}
                    placeholder="4 a 6 dígitos"
                    className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-stone-300 font-mono tracking-widest focus:border-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
                  />
                </div>
              </div>

              {/* Option to preload demo calibrated recipes */}
              <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl flex items-start gap-3">
                <input
                  type="checkbox"
                  id="preloadDemoCheck"
                  checked={loadDemoData}
                  onChange={(e) => setLoadDemoData(e.target.checked)}
                  className="mt-0.5 rounded text-stone-900 focus:ring-stone-900"
                />
                <label htmlFor="preloadDemoCheck" className="text-xs text-stone-700 cursor-pointer">
                  <span className="font-bold block text-stone-900">
                    Pré-carregar modelo inicial de insumos e fichas técnicas
                  </span>
                  Recomendado para testar simulações de custo, curva ABC, previsão de demanda e relatórios com números reais.
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-3 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-stone-950 bg-amber-400 hover:bg-amber-300 transition-colors shadow-sm cursor-pointer disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSubmitting ? 'Criando Conta...' : 'Cadastrar e Acessar o Sistema'}</span>
              </button>
            </form>
          )}
        </div>

        {/* Modal Footer Assurance */}
        <div className="px-6 py-3 bg-stone-50 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
          <span className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-stone-400" />
            <span>Instalação única por empresa · Dados sob controle do dono</span>
          </span>
          <span className="font-mono text-stone-400">Mise v1.0</span>
        </div>
      </div>
    </div>
  );
};
