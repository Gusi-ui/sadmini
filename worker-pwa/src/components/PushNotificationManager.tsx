import React, { useState } from 'react';
import { usePushNotifications } from '../hooks/usePushNotifications';
import { useServiceWorker } from '../hooks/useServiceWorker';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Bell, BellOff, RefreshCw, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface PushNotificationManagerProps {
  className?: string;
}

export const PushNotificationManager: React.FC<PushNotificationManagerProps> = ({ className }) => {
  const [testTitle, setTestTitle] = useState('Notificación de prueba');
  const [testBody, setTestBody] = useState('Esta es una notificación de prueba desde Worker PWA');
  const [isSendingTest, setIsSendingTest] = useState(false);

  const {
    permission,
    subscription,
    isSupported,
    isLoading,
    error,
    requestPermission,
    subscribe,
    unsubscribe,
    sendTestNotification
  } = usePushNotifications();

  const {
    isRegistered: swRegistered,
    isControlling: swControlling,
    error: swError,
    update: updateSW
  } = useServiceWorker();

  const handleEnableNotifications = async () => {
    const granted = await requestPermission();
    if (granted) {
      await subscribe();
    }
  };

  const handleDisableNotifications = async () => {
    await unsubscribe();
  };

  const handleSendTest = async () => {
    setIsSendingTest(true);
    try {
      await sendTestNotification(testTitle, testBody);
    } finally {
      setIsSendingTest(false);
    }
  };

  const getPermissionStatus = () => {
    switch (permission) {
      case 'granted':
        return { icon: CheckCircle, text: 'Concedido', variant: 'default' as const, color: 'text-green-600' };
      case 'denied':
        return { icon: XCircle, text: 'Denegado', variant: 'destructive' as const, color: 'text-red-600' };
      default:
        return { icon: AlertCircle, text: 'Pendiente', variant: 'secondary' as const, color: 'text-yellow-600' };
    }
  };

  const getSubscriptionStatus = () => {
    if (subscription) {
      return { icon: Bell, text: 'Activa', variant: 'default' as const, color: 'text-green-600' };
    }
    return { icon: BellOff, text: 'Inactiva', variant: 'secondary' as const, color: 'text-gray-600' };
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center p-6">
          <RefreshCw className="h-6 w-6 animate-spin mr-2" />
          <span>Cargando configuración de notificaciones...</span>
        </CardContent>
      </Card>
    );
  }

  if (!isSupported) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-600" />
            Notificaciones no compatibles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Tu navegador no es compatible con las notificaciones push. 
              Considera actualizar a una versión más reciente.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const permissionStatus = getPermissionStatus();
  const subscriptionStatus = getSubscriptionStatus();

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Gestión de Notificaciones Push
        </CardTitle>
        <CardDescription>
          Configura las notificaciones para recibir actualizaciones importantes
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Estado del Service Worker */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Estado del Service Worker</h4>
          <div className="flex items-center gap-2">
            <Badge variant={swRegistered && swControlling ? 'default' : 'secondary'}>
              {swRegistered && swControlling ? 'Activo' : 'Inactivo'}
            </Badge>
            {swRegistered && (
              <Button
                variant="outline"
                size="sm"
                onClick={updateSW}
                className="h-6 px-2 text-xs"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Actualizar
              </Button>
            )}
          </div>
        </div>

        {/* Estado de permisos */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Permisos de Notificación</h4>
          <div className="flex items-center gap-2">
            <permissionStatus.icon className={`h-4 w-4 ${permissionStatus.color}`} />
            <Badge variant={permissionStatus.variant}>
              {permissionStatus.text}
            </Badge>
          </div>
        </div>

        {/* Estado de suscripción */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Suscripción Push</h4>
          <div className="flex items-center gap-2">
            <subscriptionStatus.icon className={`h-4 w-4 ${subscriptionStatus.color}`} />
            <Badge variant={subscriptionStatus.variant}>
              {subscriptionStatus.text}
            </Badge>
          </div>
        </div>

        {/* Controles */}
        <div className="space-y-3">
          {permission !== 'granted' ? (
            <Button onClick={handleEnableNotifications} className="w-full">
              <Bell className="h-4 w-4 mr-2" />
              Habilitar Notificaciones
            </Button>
          ) : (
            <div className="space-y-2">
              {!subscription ? (
                <Button onClick={subscribe} className="w-full">
                  <Bell className="h-4 w-4 mr-2" />
                  Suscribirse a Notificaciones
                </Button>
              ) : (
                <Button 
                  onClick={handleDisableNotifications} 
                  variant="outline" 
                  className="w-full"
                >
                  <BellOff className="h-4 w-4 mr-2" />
                  Desactivar Notificaciones
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Notificación de prueba */}
        {subscription && (
          <div className="space-y-3 pt-4 border-t">
            <h4 className="text-sm font-medium">Notificación de Prueba</h4>
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Título de la notificación"
                value={testTitle}
                onChange={(e) => setTestTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
              <textarea
                placeholder="Contenido de la notificación"
                value={testBody}
                onChange={(e) => setTestBody(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-none"
              />
              <Button 
                onClick={handleSendTest}
                disabled={isSendingTest || !testTitle.trim()}
                variant="outline"
                className="w-full"
              >
                {isSendingTest ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Bell className="h-4 w-4 mr-2" />
                )}
                Enviar Notificación de Prueba
              </Button>
            </div>
          </div>
        )}

        {/* Errores */}
        {(error || swError) && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error || swError}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};