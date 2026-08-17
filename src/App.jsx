import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import WhiteGreenHeader from './components/WhiteGreenHeader';
import SimpleGeneratorTab from './components/SimpleGeneratorTab';
import ManageListTab from './components/ManageListTab';
import UserManagementTab from './components/UserManagementTab';
import PublicScanPage from './pages/PublicScanPage';

function Dashboard() {
  const { isAuthenticated, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('generate'); // 'generate' | 'manage' | 'users'

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      <WhiteGreenHeader activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1">
        {activeTab === 'generate' && (
          <SimpleGeneratorTab onGoToManage={() => setActiveTab('manage')} />
        )}
        {activeTab === 'manage' && (
          <ManageListTab onGoToGenerate={() => setActiveTab('generate')} />
        )}
        {activeTab === 'users' && isAdmin && (
          <UserManagementTab />
        )}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Scanned Landing Page */}
        <Route path="/scan/:codeId" element={<PublicScanPage />} />
        <Route path="/view/:codeId" element={<PublicScanPage />} />

        {/* Protected Dashboard */}
        <Route path="*" element={<Dashboard />} />
      </Routes>
    </AuthProvider>
  );
}
