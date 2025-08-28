import { useState, useEffect, useCallback } from 'react';

interface NotificationState {
  permission: NotificationPermission;
  subscription: PushSubscription | null;
  isSupported: boolean;
  isLoading: boolean;
  error: string | null;
}

interface PushNotificationHook extends NotificationState {
  requestPermission: () => Promise<boolean>;
  subscribe: () => Promise<PushSubscription | null>;
  unsubscribe: () => Promise<boolean>;
  sendTestNotification: (title: string, body: string) => Promise<void>;
}

// Clave pública VAPID (debe ser generada en el servidor)
const VAPID_PUBLIC_KEY = 'BEl62iUYgUivxIkv69yViEuiBIa40HI0DLLuxazjqAKHSr3txbueJHoQosyWNXBRVoCxVbQe6VUirGJRWcqDiAI';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export const usePushNotifications = (): PushNotificationHook => {
  const [state, setState] = useState<NotificationState>({
    permission: 'default',
    subscription: null,
    isSupported: false,
    isLoading: true,
    error: null
  });

  // Verificar soporte y estado inicial
  useEffect(() => {
    const checkSupport = async () => {
      try {
        const isSupported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
        
        if (!isSupported) {
          setState(prev => ({
            ...prev,
            isSupported: false,
            isLoading: false,
            error: 'Las notificaciones push no son compatibles con este navegador'
          }));
          return;
        }

        const permission = Notification.permission;
        let subscription: PushSubscription | null = null;

        if ('serviceWorker' in navigator) {
          const registration = await navigator.serviceWorker.ready;
          subscription = await registration.pushManager.getSubscription();
        }

        setState(prev => ({
          ...prev,
          permission,
          subscription,
          isSupported: true,
          isLoading: false
        }));
      } catch (error) {
        console.error('Error al verificar soporte de notificaciones:', error);
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Error al verificar soporte de notificaciones'
        }));
      }
    };

    checkSupport();
  }, []);

  // Solicitar permisos
  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      if (!state.isSupported) {
        throw new Error('Las notificaciones no son compatibles');
      }

      const permission = await Notification.requestPermission();
      setState(prev => ({ ...prev, permission }));
      
      return permission === 'granted';
    } catch (error) {
      console.error('Error al solicitar permisos:', error);
      setState(prev => ({ ...prev, error: 'Error al solicitar permisos de notificación' }));
      return false;
    }
  }, [state.isSupported]);

  // Suscribirse a notificaciones push
  const subscribe = useCallback(async (): Promise<PushSubscription | null> => {
    try {
      // Verificar soporte
      if (!state.isSupported) {
        throw new Error('Las notificaciones push no son compatibles con este navegador');
      }

      // Verificar permisos
      if (state.permission !== 'granted') {
        throw new Error('Los permisos de notificación no han sido concedidos');
      }

      // Verificar que el service worker esté disponible
      if (!('serviceWorker' in navigator)) {
        throw new Error('Service Worker no es compatible con este navegador');
      }

      // Esperar a que el service worker esté listo
      const registration = await navigator.serviceWorker.ready;
      
      if (!registration) {
        throw new Error('Service Worker no está registrado');
      }

      // Verificar si ya existe una suscripción
      const existingSubscription = await registration.pushManager.getSubscription();
      if (existingSubscription) {
        setState(prev => ({ ...prev, subscription: existingSubscription }));
        return existingSubscription;
      }

      // Crear nueva suscripción
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      });

      setState(prev => ({ ...prev, subscription, error: null }));

      // Enviar suscripción al servidor (opcional - puede fallar sin afectar la funcionalidad local)
      try {
        await fetch('/api/push/subscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            subscription,
            userAgent: navigator.userAgent
          })
        });
      } catch (serverError) {
        console.warn('No se pudo registrar la suscripción en el servidor:', serverError);
        // No lanzamos error aquí porque la suscripción local funciona
      }

      return subscription;
    } catch (error) {
      console.error('Error al suscribirse:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error al suscribirse a notificaciones';
      setState(prev => ({ ...prev, error: errorMessage }));
      return null;
    }
  }, [state.isSupported, state.permission]);

  // Desuscribirse
  const unsubscribe = useCallback(async (): Promise<boolean> => {
    try {
      if (!state.subscription) {
        return true;
      }

      await state.subscription.unsubscribe();
      setState(prev => ({ ...prev, subscription: null }));

      // Notificar al servidor
      await fetch('/api/push/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          endpoint: state.subscription.endpoint
        })
      });

      return true;
    } catch (error) {
      console.error('Error al desuscribirse:', error);
      setState(prev => ({ ...prev, error: 'Error al desuscribirse de notificaciones' }));
      return false;
    }
  }, [state.subscription]);

  // Enviar notificación de prueba
  const sendTestNotification = useCallback(async (title: string, body: string): Promise<void> => {
    try {
      if (!state.subscription) {
        throw new Error('No hay suscripción activa');
      }

      await fetch('/api/push/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription: state.subscription,
          payload: {
            title,
            body,
            icon: '/icons/icon-192x192.png',
            badge: '/icons/icon-72x72.png'
          }
        })
      });
    } catch (error) {
      console.error('Error al enviar notificación de prueba:', error);
      setState(prev => ({ ...prev, error: 'Error al enviar notificación de prueba' }));
    }
  }, [state.subscription]);

  return {
    ...state,
    requestPermission,
    subscribe,
    unsubscribe,
    sendTestNotification
  };
};