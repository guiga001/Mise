/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Mise — Aplicação Principal de Gestão para Comércio Alimentício
 */

import React, { useState, useEffect } from 'react';
import { loadDatabase, saveDatabase, MiseDatabaseState } from './lib/storage';
import { BootstrapScreen } from './components/BootstrapScreen';
import { Navigation, TabKey } from './components/Navigation';
import { DashboardTab } from './components/DashboardTab';
import { RecipesTab } from './components/RecipesTab';
import { IngredientsTab } from './components/IngredientsTab';
import { InventoryTab } from './components/InventoryTab';
import { PurchasesTab } from './components/PurchasesTab';
import { SalesTab } from './components/SalesTab';
import { FinancialTab } from './components/FinancialTab';
import { ProductionTab } from './components/ProductionTab';
import { SettingsTab } from './components/SettingsTab';

export default function App() {
  const [database, setDatabase] = useState<MiseDatabaseState>(() => loadDatabase());
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');

  useEffect(() => {
    // Carregar na montagem inicial
    const state = loadDatabase();
    setDatabase(state);
  }, []);

  const handleUpdateDatabase = (newState: MiseDatabaseState) => {
    setDatabase(newState);
    saveDatabase(newState);
  };

  const handleSelectStore = (storeId: string) => {
    const updated = {
      ...database,
      activeStoreId: storeId,
    };
    handleUpdateDatabase(updated);
  };

  const handleResetToBootstrap = () => {
    const emptyState = loadDatabase();
    setDatabase(emptyState);
    setActiveTab('dashboard');
  };

  // Se a empresa ainda não foi configurada, exibe a tela de Bootstrap do Dono
  if (!database.company) {
    return <BootstrapScreen onBootstrapSuccess={handleUpdateDatabase} />;
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col pb-20 md:pb-8">
      {/* Top Header & Navigation */}
      <Navigation
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        database={database}
        onSelectStore={handleSelectStore}
      />

      {/* Main Tab View */}
      <main className="flex-1">
        {activeTab === 'dashboard' && (
          <DashboardTab
            database={database}
            onNavigate={(tab) => setActiveTab(tab)}
          />
        )}
        {activeTab === 'recipes' && (
          <RecipesTab
            database={database}
            onUpdateDatabase={handleUpdateDatabase}
            onNavigateToIngredients={() => setActiveTab('ingredients')}
          />
        )}
        {activeTab === 'ingredients' && (
          <IngredientsTab
            database={database}
            onUpdateDatabase={handleUpdateDatabase}
          />
        )}
        {activeTab === 'inventory' && (
          <InventoryTab
            database={database}
            onUpdateDatabase={handleUpdateDatabase}
            onNavigateToIngredients={() => setActiveTab('ingredients')}
          />
        )}
        {activeTab === 'purchases' && (
          <PurchasesTab
            database={database}
            onUpdateDatabase={handleUpdateDatabase}
            onNavigateToIngredients={() => setActiveTab('ingredients')}
          />
        )}
        {activeTab === 'sales' && (
          <SalesTab
            database={database}
            onUpdateDatabase={handleUpdateDatabase}
            onNavigateToRecipes={() => setActiveTab('recipes')}
          />
        )}
        {activeTab === 'financial' && (
          <FinancialTab
            database={database}
            onUpdateDatabase={handleUpdateDatabase}
          />
        )}
        {activeTab === 'production' && (
          <ProductionTab
            database={database}
            onUpdateDatabase={handleUpdateDatabase}
            onNavigateToRecipes={() => setActiveTab('recipes')}
          />
        )}
        {activeTab === 'settings' && (
          <SettingsTab
            database={database}
            onUpdateDatabase={handleUpdateDatabase}
            onResetToBootstrap={handleResetToBootstrap}
          />
        )}
      </main>
    </div>
  );
}
