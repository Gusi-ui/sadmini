import React from 'react';
import { Button } from './ui/button';
import { Home, Calendar, Users, Clock, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface NavigationProps {
  currentView: 'dashboard' | 'schedule' | 'clients' | 'timetracking';
  onViewChange: (view: 'dashboard' | 'schedule' | 'clients' | 'timetracking') => void;
  className?: string;
}

export const Navigation: React.FC<NavigationProps> = ({ 
  currentView, 
  onViewChange, 
  className 
}) => {
  const { signOut, worker } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  const navigationItems = [
    {
      id: 'dashboard' as const,
      label: 'Inicio',
      icon: Home,
      description: 'Dashboard principal'
    },
    {
      id: 'schedule' as const,
      label: 'Horarios',
      icon: Calendar,
      description: 'Vista de calendario'
    },
    {
      id: 'clients' as const,
      label: 'Usuarios',
      icon: Users,
      description: 'Gestión de usuarios'
    },
    {
      id: 'timetracking' as const,
      label: 'Horas',
      icon: Clock,
      description: 'Registro de tiempo'
    }
  ];

  return (
    <>
      {/* Header para desktop y tablet */}
      <div className={`bg-white border-b border-gray-200 md:block hidden ${className}`}>
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo/Título */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4 text-white">
                  <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" fill="currentColor"/>
                  <circle cx="18" cy="6" r="2" fill="#ef4444" opacity="0.9"/>
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  SAD (gusi)
                </h1>
                <p className="text-xs text-gray-500">
                  {worker?.full_name || 'Trabajador'}
                </p>
              </div>
            </div>

            {/* Navegación principal */}
            <div className="flex items-center space-x-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                
                return (
                  <Button
                    key={item.id}
                    onClick={() => onViewChange(item.id)}
                    variant={isActive ? 'default' : 'ghost'}
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden lg:inline">{item.label}</span>
                  </Button>
                );
              })}
              
              {/* Botón de cerrar sesión */}
              <Button
                onClick={handleSignOut}
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:text-gray-900 ml-4"
              >
                <LogOut className="h-4 w-4" />
                <span className="ml-2">Salir</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Header móvil simplificado */}
      <div className={`bg-white border-b border-gray-200 md:hidden ${className}`}>
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4 text-white">
                  <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" fill="currentColor"/>
                  <circle cx="18" cy="6" r="2" fill="#ef4444" opacity="0.9"/>
                </svg>
              </div>
              <div>
                <h1 className="text-base font-semibold text-gray-900">
                  SAD (gusi)
                </h1>
                <p className="text-xs text-gray-500">
                  {worker?.full_name || 'Trabajador'}
                </p>
              </div>
            </div>
            
            <Button
              onClick={handleSignOut}
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-gray-900 p-2"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Navegación móvil inferior fija */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-inset-bottom">
        <div className="grid grid-cols-4 px-2 py-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-all duration-200 min-h-[60px] ${
                  isActive 
                    ? 'bg-blue-50 text-blue-700 scale-105' 
                    : 'text-gray-600 hover:bg-gray-50 active:bg-gray-100'
                }`}
              >
                <Icon className={`mb-1 transition-all ${
                  isActive ? 'h-6 w-6' : 'h-5 w-5'
                }`} />
                <span className={`text-xs font-medium transition-all ${
                  isActive ? 'text-blue-700' : 'text-gray-600'
                }`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};