import React from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { User, Shield, Mail, Calendar } from 'lucide-react'

export default function DebugUserInfo() {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return (
      <Card className="mb-4 border-yellow-200 bg-yellow-50">
        <CardContent className="p-4">
          <p className="text-yellow-800">🔄 Cargando información del usuario...</p>
        </CardContent>
      </Card>
    )
  }

  if (!user) {
    return (
      <Card className="mb-4 border-red-200 bg-red-50">
        <CardContent className="p-4">
          <p className="text-red-800">❌ No hay usuario autenticado</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mb-4 border-blue-200 bg-blue-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <User className="h-5 w-5" />
          Información de Depuración del Usuario
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Usuario Supabase
            </h4>
            <div className="space-y-1 text-sm">
              <p><strong>ID:</strong> {user.id}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Confirmado:</strong> {user.email_confirmed_at ? '✅ Sí' : '❌ No'}</p>
              <p><strong>Último acceso:</strong> {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'N/A'}</p>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Perfil de Usuario
            </h4>
            {profile ? (
              <div className="space-y-1 text-sm">
                <p><strong>Nombre:</strong> {profile.full_name}</p>
                <p className="flex items-center gap-2">
                  <strong>Rol:</strong> 
                  <Badge variant={profile.role === 'admin' ? 'default' : 'secondary'}>
                    {profile.role === 'admin' ? '👑 Administrador' : '👷 Trabajadora'}
                  </Badge>
                </p>
                <p><strong>Teléfono:</strong> {profile.phone || 'No especificado'}</p>
                <p><strong>Dirección:</strong> {profile.address || 'No especificada'}</p>
                <p><strong>Creado:</strong> {new Date(profile.created_at).toLocaleString()}</p>
              </div>
            ) : (
              <p className="text-red-600">❌ No se encontró perfil</p>
            )}
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-white rounded border">
          <h4 className="font-semibold text-blue-800 mb-2">Permisos para Crear Trabajadoras</h4>
          {profile?.role === 'admin' ? (
            <p className="text-green-600">✅ El usuario tiene permisos de administrador para crear trabajadoras</p>
          ) : (
            <p className="text-red-600">❌ El usuario NO tiene permisos de administrador. Rol actual: {profile?.role || 'Sin rol'}</p>
          )}
        </div>
        
        <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
          <strong>Metadatos del usuario:</strong>
          <pre className="mt-1 overflow-auto">{JSON.stringify(user.user_metadata, null, 2)}</pre>
        </div>
      </CardContent>
    </Card>
  )
}