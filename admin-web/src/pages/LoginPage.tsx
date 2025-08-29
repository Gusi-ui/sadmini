import React, { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Heart, Shield, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const { signIn } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validación básica
    if (!email.trim()) {
      setError('El email es obligatorio')
      return
    }
    
    if (!password.trim()) {
      setError('La contraseña es obligatoria')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      await signIn(email, password)
    } catch (err: any) {
      setError(
        err.message === 'Invalid login credentials'
          ? 'Credenciales inválidas. Verifique su email y contraseña.'
          : 'Error al iniciar sesión. Inténtelo de nuevo.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <Heart className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            {import.meta.env.VITE_APP_TITLE || 'Ayuda Domicilio'}
          </h1>
          <p className="mt-2 text-gray-600">
            Panel de Administración
          </p>
          <div className="flex items-center justify-center mt-2 text-sm text-gray-500">
            <Shield className="h-4 w-4 mr-1" />
            <span>Acceso restringido a administradores</span>
          </div>
        </div>

        {/* Login Form */}
        <Card>
          <CardHeader>
            <CardTitle>Iniciar Sesión</CardTitle>
            <CardDescription>
              Ingrese sus credenciales para acceder al sistema de gestión
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@sadmini.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Iniciando sesión...
                  </>
                ) : (
                  'Iniciar Sesión'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>
            ¿Eres trabajadora?{' '}
            <a
              href={import.meta.env.VITE_PWA_URL || '#'}
              className="text-blue-600 hover:text-blue-500 font-medium"
            >
              Accede a la aplicación móvil
            </a>
          </p>
          <p className="mt-4">
            Sistema de Gestión de Cuidado Domiciliario en Mataró
          </p>
          <p className="mt-2 flex items-center justify-center gap-1">
            <span>Con mucho</span>
            <span className="text-red-500">❤️</span>
            <span>a</span>
            <span className="text-amber-600">🐹</span>
          </p>
          <p className="mt-2 text-xs">
            © {new Date().getFullYear()} - Todos los derechos reservados
          </p>
        </div>
      </div>
    </div>
  )
}
