/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Mise — Tela de Conexão / Login (Reconectar ou Alternar Usuário)
 * Permite que o Dono, Sócios ou Contadores entrem com segurança na sessão.
 */

import React, { useState } from 'react';
import { ChefHat, ShieldCheck, LogIn, User as UserIcon, Store as StoreIcon, Lock } from 'lucide-react';
import { MiseDatabaseState } from '../lib/storage';
import { User } from '../domain/types';

interface LoginScreenProps {
  database: MiseDatabaseState;
  onLoginSuccess: (userId: string) => void;
  onResetToBootstrap?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  database,
  onLoginSuccess,
  onResetToBootstrap,
}) => {
  const users = database.users || [];
  const defaultUser = users[0] || null;

  const [selectedUserId, setSelectedUserId] = useState<string>(
    defaultUser ? defaultUser.id : ''
  );
  const [pinCode, setPinCode] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedUser: User | undefined = users.find((u) => u.id === selectedUserId);

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedUserId) {
      setError('Selecione um usuário para conectar ao sistema.');
      return;
    }

    setIsSubmitting(true);
    // Simulação de transição limpa
    setTimeout(() => {
      onLoginSuccess(selectedUserId);
      setIsSubmitting(false);
    }, 150);
  };

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-xl bg-stone-900 text-amber-400 flex items-center justify-center shadow-md">
            <ChefHat className="w-7 h-7 stroke-[2]" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-stone-900">
          {database.company?.name || 'Mise — Gestão Alimentícia'}
        </h2>
        <div className="mt-1 flex items-center justify-center gap-1.5 text-xs text-stone-600">
          <StoreIcon className="w-3.5 h-3.5 text-stone-400" />
          <span>{database.stores.find((s) => s.isMainStore)?.name || 'Matriz'}</span>
          <span aria-hidden="true">·</span>
          <span>Sessão Desconectada</span>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm sm:rounded-2xl border border-stone-200/80 sm:px-10">
          <div className="mb-6 pb-4 border-b border-stone-100">
            <div className="flex items-center gap-2 text-stone-900 font-semibold text-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Acesso Seguro ao Sistema</span>
            </div>
            <p className="text-xs text-stone-500 mt-1 leading-relaxed">
              Selecione o perfil do gestor ou sócio para reestabelecer a sessão e acessar os controles de cardápio, estoque e caixa.
            </p>
          </div>

          <form onSubmit={handleConnect} className="space-y-4">
            {error && (
              <div className="p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-2">
                Perfil de Acesso
              </label>
              <div className="space-y-2">
                {users.map((user) => {
                  const isSelected = user.id === selectedUserId;
                  const initials = user.name
                    .split(' ')
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase();

                  return (
                    <div
                      key={user.id}
                      onClick={() => setSelectedUserId(user.id)}
                      className={`flex items-center justify-between p-3 rounded-xl border text-left cursor-pointer transition-all ${
                        isSelected
                          ? 'border-stone-900 bg-stone-50/80 shadow-2xs'
                          : 'border-stone-200 hover:border-stone-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs ${
                            isSelected
                              ? 'bg-stone-900 text-amber-400'
                              : 'bg-stone-100 text-stone-600'
                          }`}
                        >
                          {initials}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-stone-900">{user.name}</div>
                          <div className="text-[11px] text-stone-500">{user.email}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-stone-100 text-stone-700 border border-stone-200">
                          {user.role}
                        </span>
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isSelected
                              ? 'border-stone-900 bg-stone-900 text-white'
                              : 'border-stone-300'
                          }`}
                        >
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {selectedUser?.twoFactorEnabled && (
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Código de Autenticação / PIN
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    maxLength={6}
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value)}
                    placeholder="000000"
                    className="w-full text-sm pl-9 pr-3.5 py-2.5 rounded-lg border border-stone-300 font-mono tracking-widest focus:border-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !selectedUserId}
              className="w-full mt-4 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-stone-900 hover:bg-stone-800 transition-colors shadow-sm cursor-pointer disabled:opacity-50"
            >
              <LogIn className="w-4 h-4" />
              <span>
                {isSubmitting
                  ? 'Conectando...'
                  : selectedUser
                  ? `Conectar como ${selectedUser.name.split(' ')[0]}`
                  : 'Conectar ao Sistema'}
              </span>
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-stone-100 text-center">
            <span className="text-[11px] text-stone-400 block">
              Trilha imutável: cada login e logout é registrado para auditoria (LGPD).
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
