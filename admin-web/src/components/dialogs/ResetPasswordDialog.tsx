import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff, RefreshCw, Copy } from 'lucide-react'
import { generateTemporaryPassword } from '@/lib/utils'
import { toast } from 'sonner'
import type { Database } from '@/lib/supabase'

type Worker = Database['public']['Tables']['workers']['Row']

interface ResetPasswordDialogProps {
  worker: Worker | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (workerId: string, newPassword: string) => void
  isLoading?: boolean
}

export default function ResetPasswordDialog({
  worker,
  open,
  onOpenChange,
  onConfirm,
  isLoading = false
}: ResetPasswordDialogProps) {
  const [newPassword, setNewPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Generar nueva contraseña cuando se abre el diálogo
  React.useEffect(() => {
    if (open && worker) {
      setNewPassword(generateTemporaryPassword())
    }
  }, [open, worker])

  const handleGeneratePassword = () => {
    setNewPassword(generateTemporaryPassword())
  }

  const handleCopyPassword = async () => {
    try {
      await navigator.clipboard.writeText(newPassword)
      toast.success('Contraseña copiada al portapapeles')
    } catch (error) {
      toast.error('Error al copiar la contraseña')
    }
  }

  const handleConfirm = () => {
    if (worker && newPassword.trim()) {
      onConfirm(worker.id, newPassword)
    }
  }

  const handleClose = () => {
    setNewPassword('')
    setShowPassword(false)
    onOpenChange(false)
  }

  if (!worker) return null

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Resetear Contraseña</DialogTitle>
          <DialogDescription>
            Generar una nueva contraseña temporal para{' '}
            <span className="font-medium">{worker.full_name}</span>
            {' '}({worker.employee_id})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-password">Nueva Contraseña Temporal</Label>
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <Input
                  id="new-password"
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Contraseña temporal"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleGeneratePassword}
                disabled={isLoading}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopyPassword}
                disabled={isLoading || !newPassword}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="rounded-md bg-yellow-50 p-3">
            <div className="text-sm text-yellow-800">
              <strong>Importante:</strong> Esta contraseña temporal debe ser
              comunicada a la trabajadora de forma segura. Se recomienda que
              la trabajadora cambie esta contraseña en su primer acceso.
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading || !newPassword.trim()}
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Actualizando...
              </>
            ) : (
              'Resetear Contraseña'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}