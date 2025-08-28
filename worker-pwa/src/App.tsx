import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginForm } from './components/LoginForm';
import { WorkerDashboard } from './components/WorkerDashboard';
import { ScheduleView } from './components/ScheduleView';
import { ClientsView } from './components/ClientsView';
import { TimeTrackingView } from './components/TimeTrackingView';
import { Navigation } from './components/Navigation';
import { ErrorBoundary } from './components/ErrorBoundary';
import './App.css';

type ViewType = 'dashboard' | 'schedule' | 'clients' | 'timetracking';

function AppContent() {
  const { user, worker, loading } = useAuth();
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');

  // Debug logging
  React.useEffect(() => {
    console.log('🔍 App: State changed - loading:', loading, 'user:', !!user, 'worker:', !!worker);
    if (loading) {
      console.log('⏳ App: Still loading...');
    } else {
      console.log('✅ App: Loading complete');
    }
  }, [loading, user, worker]);

  if (loading) {
    console.log('🔄 App: Rendering loading screen');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-sm w-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-6"></div>
          <h2 className="text-lg font-medium text-gray-900 mb-2">Cargando aplicación</h2>
          <p className="text-sm text-gray-600">Por favor espera un momento...</p>
        </div>
      </div>
    );
  }

  // Si no hay usuario o no hay datos de worker, mostrar login
  if (!user || !worker) {
    console.log('🔑 App: Rendering login - user:', !!user, 'worker:', !!worker);
    return (
      <div className="min-h-screen bg-gray-50">
        <LoginForm />
      </div>
    );
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <WorkerDashboard />;
      case 'schedule':
        return <ScheduleView />;
      case 'clients':
        return <ClientsView />;
      case 'timetracking':
        return <TimeTrackingView />;
      default:
        return <WorkerDashboard />;
    }
  };

  console.log('🏠 App: Rendering main app with user and worker');
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navigation 
        currentView={currentView} 
        onViewChange={setCurrentView}
      />
      <main className="flex-1 overflow-auto pb-safe">
        <div className="container mx-auto px-4 py-4 max-w-md sm:max-w-lg md:max-w-4xl">
          {renderCurrentView()}
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
