import { useState, useEffect, useCallback } from 'react';

interface ServiceWorkerState {
  isSupported: boolean;
  isRegistered: boolean;
  isInstalling: boolean;
  isWaiting: boolean;
  isControlling: boolean;
  error: string | null;
  registration: ServiceWorkerRegistration | null;
}

interface ServiceWorkerHook extends ServiceWorkerState {
  register: () => Promise<ServiceWorkerRegistration | null>;
  unregister: () => Promise<boolean>;
  update: () => Promise<void>;
  skipWaiting: () => void;
}

export const useServiceWorker = (swUrl: string = '/sw.js'): ServiceWorkerHook => {
  const [state, setState] = useState<ServiceWorkerState>({
    isSupported: false,
    isRegistered: false,
    isInstalling: false,
    isWaiting: false,
    isControlling: false,
    error: null,
    registration: null
  });

  // Verificar soporte inicial
  useEffect(() => {
    const isSupported = 'serviceWorker' in navigator;
    setState(prev => ({ ...prev, isSupported }));

    if (isSupported) {
      // Verificar si ya hay un service worker controlando
      const isControlling = !!navigator.serviceWorker.controller;
      setState(prev => ({ ...prev, isControlling }));
    }
  }, []);

  // Registrar service worker
  const register = useCallback(async (): Promise<ServiceWorkerRegistration | null> => {
    if (!state.isSupported) {
      console.warn('Service Workers no son compatibles con este navegador');
      return null;
    }

    try {
      setState(prev => ({ ...prev, isInstalling: true, error: null }));

      const registration = await navigator.serviceWorker.register(swUrl, {
        scope: '/'
      });

      console.log('Service Worker registrado:', registration);

      // Configurar event listeners
      registration.addEventListener('updatefound', () => {
        console.log('Nueva versión del Service Worker encontrada');
        setState(prev => ({ ...prev, isInstalling: true }));

        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed') {
              setState(prev => ({ ...prev, isInstalling: false }));
              
              if (navigator.serviceWorker.controller) {
                // Nueva versión disponible
                setState(prev => ({ ...prev, isWaiting: true }));
                console.log('Nueva versión disponible. Recarga para actualizar.');
              } else {
                // Primera instalación
                setState(prev => ({ ...prev, isControlling: true }));
                console.log('Service Worker instalado por primera vez.');
              }
            }
          });
        }
      });

      // Escuchar cambios en el controlador
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('Nuevo Service Worker tomó control');
        setState(prev => ({ 
          ...prev, 
          isControlling: true, 
          isWaiting: false 
        }));
        
        // Recargar la página para usar la nueva versión
        window.location.reload();
      });

      setState(prev => ({
        ...prev,
        isRegistered: true,
        isInstalling: false,
        registration
      }));

      return registration;
    } catch (error) {
      console.error('Error al registrar Service Worker:', error);
      setState(prev => ({
        ...prev,
        isInstalling: false,
        error: 'Error al registrar Service Worker'
      }));
      return null;
    }
  }, [state.isSupported, swUrl]);

  // Desregistrar service worker
  const unregister = useCallback(async (): Promise<boolean> => {
    if (!state.registration) {
      return false;
    }

    try {
      const result = await state.registration.unregister();
      if (result) {
        setState(prev => ({
          ...prev,
          isRegistered: false,
          isControlling: false,
          registration: null
        }));
        console.log('Service Worker desregistrado');
      }
      return result;
    } catch (error) {
      console.error('Error al desregistrar Service Worker:', error);
      setState(prev => ({ ...prev, error: 'Error al desregistrar Service Worker' }));
      return false;
    }
  }, [state.registration]);

  // Actualizar service worker
  const update = useCallback(async (): Promise<void> => {
    if (!state.registration) {
      console.warn('No hay Service Worker registrado para actualizar');
      return;
    }

    try {
      await state.registration.update();
      console.log('Verificación de actualización del Service Worker completada');
    } catch (error) {
      console.error('Error al actualizar Service Worker:', error);
      setState(prev => ({ ...prev, error: 'Error al actualizar Service Worker' }));
    }
  }, [state.registration]);

  // Saltar espera y activar nueva versión
  const skipWaiting = useCallback((): void => {
    if (!state.registration || !state.registration.waiting) {
      return;
    }

    state.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
  }, [state.registration]);

  // Auto-registrar en mount si está soportado
  useEffect(() => {
    if (state.isSupported && !state.isRegistered) {
      register();
    }
  }, [state.isSupported, state.isRegistered, register]);

  return {
    ...state,
    register,
    unregister,
    update,
    skipWaiting
  };
};