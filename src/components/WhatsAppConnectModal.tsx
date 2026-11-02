/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Mise Atendimento — Modal de Conexão WhatsApp via QR Code
 * Cada restaurante possui sessão própria, isolada e com QR Code exclusivo.
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  QrCode,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  LogOut,
  ShieldCheck,
  Info,
  Clock,
  Sparkles,
} from 'lucide-react';
import { WhatsAppSessionInfo } from '../domain/atendimento-types';
import { atendimentoApi } from '../lib/atendimento-api';

interface WhatsAppConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyId: string;
  companyName: string;
  sessionInfo: WhatsAppSessionInfo;
  onSessionUpdated: (info: WhatsAppSessionInfo) => void;
}

export const WhatsAppConnectModal: React.FC<WhatsAppConnectModalProps> = ({
  isOpen,
  onClose,
  companyId,
  companyName,
  sessionInfo,
  onSessionUpdated,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleStartConnect = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await atendimentoApi.connectWhatsApp(companyId);
      onSessionUpdated(res);
    } catch (err: any) {
      setError(err?.message || 'Falha ao iniciar conexão WhatsApp.');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm('Deseja realmente desconectar o WhatsApp deste restaurante? O atendimento ficará pausado até reconectar.')) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await atendimentoApi.disconnectWhatsApp(companyId);
      onSessionUpdated(res);
    } catch (err: any) {
      setError(err?.message || 'Falha ao desconectar.');
    } finally {
      setLoading(false);
    }
  };

  const isConnected = sessionInfo.status === 'CONNECTED';
  const isAwaitingScan = sessionInfo.status === 'AWAITING_SCAN';
  const isConnecting = sessionInfo.status === 'CONNECTING' || sessionInfo.status === 'STARTING';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/70 backdrop-blur-xs">
      <div
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-neutral-950 text-orange-500 flex items-center justify-center shadow-xs">
              <QrCode className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-950 leading-tight">
                Conectar WhatsApp do Restaurante
              </h3>
              <p className="text-xs text-neutral-500">
                {companyName} · Sessão Exclusiva e Isolada
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* ESTADO: CONECTADO */}
          {isConnected && (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 mx-auto flex items-center justify-center shadow-xs">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  WhatsApp Conectado com Sucesso
                </span>
                <h4 className="text-xl font-black text-neutral-950 mt-3 font-mono">
                  {sessionInfo.phoneNumber ? `+${sessionInfo.phoneNumber}` : 'Número Conectado'}
                </h4>
                {sessionInfo.profileName && (
                  <p className="text-xs text-neutral-500 mt-0.5">Perfil: {sessionInfo.profileName}</p>
                )}
                {sessionInfo.connectedAt && (
                  <p className="text-[11px] text-neutral-400 mt-1 font-mono">
                    Conectado em: {new Date(sessionInfo.connectedAt).toLocaleString('pt-BR')}
                  </p>
                )}
              </div>

              <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 text-left text-xs text-neutral-600 space-y-2">
                <div className="flex items-center gap-2 font-bold text-neutral-900">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Sessão 100% isolada e ativa</span>
                </div>
                <p>
                  Todas as mensagens enviadas e recebidas por este número são sincronizadas automaticamente na Caixa de
                  Entrada do MISE em tempo real.
                </p>
              </div>

              <button
                type="button"
                onClick={handleDisconnect}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>{loading ? 'Desconectando...' : 'Desconectar Este WhatsApp'}</span>
              </button>
            </div>
          )}

          {/* ESTADO: AGUARDANDO LEITURA DO QR CODE */}
          {isAwaitingScan && sessionInfo.qrCodeDataUrl && (
            <div className="space-y-5">
              <div className="text-center">
                <p className="text-xs font-bold uppercase tracking-wider text-orange-600 font-mono">
                  Escaneie com o WhatsApp da Empresa
                </p>
                <p className="text-xs text-neutral-500 mt-1">
                  Abra o WhatsApp no celular &gt; Menu ou Configurações &gt; Aparelhos conectados &gt; Conectar um aparelho
                </p>
              </div>

              <div className="relative mx-auto w-64 h-64 p-3 bg-white rounded-2xl border-2 border-neutral-950 shadow-md flex items-center justify-center">
                <img
                  src={sessionInfo.qrCodeDataUrl}
                  alt="QR Code WhatsApp MISE Atendimento"
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="flex items-center justify-center gap-2 text-[11px] text-neutral-500 font-mono">
                <Clock className="w-3.5 h-3.5 text-neutral-400" />
                <span>O QR Code atualiza automaticamente para manter a segurança</span>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleStartConnect}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-neutral-800 bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  <span>Gerar Novo QR Code</span>
                </button>
                <button
                  type="button"
                  onClick={handleDisconnect}
                  disabled={loading}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-neutral-600 hover:text-neutral-900 bg-white border border-neutral-200 hover:bg-neutral-50 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {/* ESTADO: CONECTANDO OU INICIANDO */}
          {isConnecting && !sessionInfo.qrCodeDataUrl && (
            <div className="text-center py-10 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-neutral-950 text-orange-500 mx-auto flex items-center justify-center animate-pulse">
                <RefreshCw className="w-6 h-6 animate-spin" />
              </div>
              <h4 className="text-sm font-bold text-neutral-900">
                Iniciando motor de conexão exclusivo...
              </h4>
              <p className="text-xs text-neutral-500 max-w-xs mx-auto">
                Preparando credenciais isoladas para o restaurante {companyName}. O QR Code aparecerá em instantes.
              </p>
            </div>
          )}

          {/* ESTADO: DESCONECTADO (Inicial) */}
          {!isConnected && !isAwaitingScan && !isConnecting && (
            <div className="space-y-5">
              <div className="p-4 bg-orange-50/70 border border-orange-200 rounded-2xl flex items-start gap-3">
                <Smartphone className="w-5 h-5 text-orange-600 mt-0.5 shrink-0" />
                <div className="text-xs text-neutral-700 leading-relaxed">
                  <strong className="block text-neutral-950 font-bold mb-1">
                    Conexão Direta e Independente
                  </strong>
                  Conecte o número de WhatsApp da sua empresa escaneando o QR Code. Suas conversas, contatos e mensagens
                  ficam estritamente armazenados no cofre isolado do seu restaurante.
                </div>
              </div>

              <div className="space-y-3 text-xs text-neutral-600">
                <div className="font-bold text-neutral-900">Como funciona:</div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-neutral-950 text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                    1
                  </span>
                  <span>Clique no botão abaixo para gerar o QR Code exclusivo da sua loja.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-neutral-950 text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                    2
                  </span>
                  <span>Abra o WhatsApp no celular do restaurante e acesse "Aparelhos conectados".</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-neutral-950 text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                    3
                  </span>
                  <span>Aponte a câmera para a tela e comece a atender seus clientes diretamente pelo MISE.</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleStartConnect}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-xs font-bold text-white bg-neutral-950 hover:bg-neutral-900 border border-neutral-950 hover:border-orange-500 shadow-sm transition-all cursor-pointer"
              >
                <QrCode className="w-4 h-4 text-orange-400" />
                <span>{loading ? 'Gerando Sessão...' : 'Conectar WhatsApp Agora'}</span>
              </button>
            </div>
          )}

          {/* Aviso Técnico Legal */}
          <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/80 text-[10px] text-neutral-500 leading-relaxed flex items-start gap-2">
            <Info className="w-3.5 h-3.5 text-neutral-400 shrink-0 mt-0.5" />
            <span>
              Arquitetura modular compatível com QR Code (Baileys) e preparada para transição futura à WhatsApp Cloud API oficial. Respeite as boas práticas de envio para evitar restrições da Meta.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
