import React, { useState } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { CommandPalette } from './components/ui/CommandPalette';
import { ToastContainer, ToastMessage } from './components/ui/Toast';
import { Login } from './views/Login';
import { Dashboard } from './views/Dashboard';
import { FileManager } from './views/FileManager';
import { WebTerminal } from './views/WebTerminal';
import { AppStore } from './views/AppStore';
import { Settings } from './views/Settings';

export function App() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('yare_token'));
  const [currentUser, setCurrentUser] = useState<any>(() => {
    const stored = localStorage.getItem('yare_user');
    return stored ? JSON.parse(stored) : { username: 'admin', role: 'admin' };
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([
    { id: 't1', type: 'info', title: 'YARE OS v2.0', message: 'Simple & Fast Server Management Active.' }
  ]);

  const addToast = (type: 'success' | 'error' | 'warning' | 'info', title: string, message?: string) => {
    const id = `toast-${Date.now()}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const handleLoginSuccess = (newToken: string, user: any) => {
    setToken(newToken);
    setCurrentUser(user);
    localStorage.setItem('yare_user', JSON.stringify(user));
    addToast('success', 'Authenticated Successfully', `Welcome back, ${user.username}!`);
    if (user.mustChangePassword) {
      setTimeout(() => {
        addToast('warning', 'Security Alert', 'Default admin password in use! Please update your password in Settings.');
      }, 600);
    }
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('yare_token');
    localStorage.removeItem('yare_refresh_token');
    localStorage.removeItem('yare_user');
  };

  if (!token) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="flex min-h-screen bg-app-theme text-primary-theme font-sans transition-colors duration-200">
      {/* Navigation Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} hostname="yare-server" />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onOpenTerminal={() => setActiveTab('terminal')}
          onOpenSearch={() => setIsCommandPaletteOpen(true)}
          onLogout={handleLogout}
          username={currentUser.username}
          userRole={currentUser.role}
        />

        <main className="flex-1 p-6 overflow-y-auto bg-app-theme transition-colors duration-200">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'appstore' && <AppStore />}
          {activeTab === 'filemanager' && <FileManager />}
          {activeTab === 'terminal' && <WebTerminal />}
          {activeTab === 'settings' && <Settings />}
        </main>
      </div>

      {/* Global Command Palette Modal */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          addToast('info', 'Switched Section', `Navigated to ${tab.toUpperCase()}`);
        }}
      />

      {/* Realtime Toast Alerts */}
      <ToastContainer toasts={toasts} onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />
    </div>
  );
}

export default App;
