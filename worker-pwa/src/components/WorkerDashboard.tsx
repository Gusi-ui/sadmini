import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Calendar, 
  Clock, 
  Users, 
  MapPin, 
  Phone, 
  AlertCircle, 
  CheckCircle,
  LogOut,
  RefreshCw,
  User
} from 'lucide-react';
import { format, isToday, isTomorrow, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

interface Assignment {
  id: string;
  user_id: string;
  worker_id: string;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  status: 'active' | 'completed' | 'cancelled';
  notes?: string;
  created_at: string;
  updated_at: string;
  user: {
    id: string;
    full_name: string;
    address: string;
    phone: string;
    medical_notes?: string;
  };
}

interface WorkerDashboardProps {
  className?: string;
}

export const WorkerDashboard: React.FC<WorkerDashboardProps> = ({ className }) => {
  const { user, worker, signOut } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [todayAssignments, setTodayAssignments] = useState<Assignment[]>([]);
  const [upcomingAssignments, setUpcomingAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAssignments = useCallback(async () => {
    console.log('🔍 WorkerDashboard: loadAssignments called');
    console.log('🔍 WorkerDashboard: worker object:', worker);
    console.log('🔍 WorkerDashboard: worker?.id:', worker?.id);
    console.log('🔍 WorkerDashboard: user object:', user);
    
    if (!worker?.id) {
      console.log('❌ WorkerDashboard: No worker ID found, stopping load');
      console.log('❌ WorkerDashboard: worker state:', worker);
      console.log('🔄 WorkerDashboard: Setting loading to false due to no worker ID');
      setLoading(false);
      return;
    }

    try {
      console.log('🔄 WorkerDashboard: Setting loading to true - starting assignments load');
      setLoading(true);
      setError(null);
      console.log('📊 WorkerDashboard: Starting assignments query for worker:', worker.id);

      const query = supabase
        .from('assignments')
        .select('*')
        .eq('worker_id', worker.id);
      
      const { data, error } = await query;

      if (error) {
        throw error;
      }

      console.log('✅ WorkerDashboard: Raw assignments data received:', data?.length || 0, 'assignments');
      setAssignments(data || []);

      // Filtrar asignaciones de hoy
      const today = new Date().toISOString().split('T')[0];
      const todayItems = (data || []).filter(assignment => 
        assignment.start_date <= today && assignment.end_date >= today
      ).sort((a, b) => {
        // Primero ordenar por fecha
        const dateComparison = new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
        if (dateComparison !== 0) return dateComparison;
        
        // Si las fechas son iguales, ordenar por hora de inicio
        const timeA = a.start_time.split(':').map(Number);
        const timeB = b.start_time.split(':').map(Number);
        const minutesA = timeA[0] * 60 + timeA[1];
        const minutesB = timeB[0] * 60 + timeB[1];
        
        return minutesA - minutesB;
      });
      console.log('📅 WorkerDashboard: Today assignments filtered and sorted:', todayItems.length);
      setTodayAssignments(todayItems);

      // Filtrar próximas asignaciones (mañana en adelante)
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];
      
      const upcomingItems = (data || []).filter(assignment => 
        assignment.start_date >= tomorrowStr
      ).sort((a, b) => {
        // Primero ordenar por fecha
        const dateComparison = new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
        if (dateComparison !== 0) return dateComparison;
        
        // Si las fechas son iguales, ordenar por hora de inicio
        const timeA = a.start_time.split(':').map(Number);
        const timeB = b.start_time.split(':').map(Number);
        const minutesA = timeA[0] * 60 + timeA[1];
        const minutesB = timeB[0] * 60 + timeB[1];
        
        return minutesA - minutesB;
      }).slice(0, 5); // Mostrar solo las próximas 5
      console.log('📅 WorkerDashboard: Upcoming assignments filtered and sorted:', upcomingItems.length);
      setUpcomingAssignments(upcomingItems);

    } catch (err: any) {
      console.error('❌ WorkerDashboard: Error loading assignments:', err);
      setError(err.message || 'Error al cargar las asignaciones');
    } finally {
      console.log('🏁 WorkerDashboard: Setting loading to false - assignments loading complete');
      setLoading(false);
    }
  }, [worker?.id]);

  useEffect(() => {
    console.log('🔄 WorkerDashboard: useEffect triggered');
    console.log('🔄 WorkerDashboard: worker dependency changed:', worker?.id);
    console.log('🔄 WorkerDashboard: current loading state:', loading);
    
    if (worker?.id) {
      console.log('✅ WorkerDashboard: Worker available, calling loadAssignments');
      loadAssignments();
    } else {
      console.log('⚠️ WorkerDashboard: No worker available, skipping loadAssignments');
    }
  }, [loadAssignments, worker?.id]);

  const getDateLabel = (startDate: string, endDate: string) => {
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    
    if (isToday(start) && isToday(end)) {
      return 'Hoy';
    } else if (isTomorrow(start) && isTomorrow(end)) {
      return 'Mañana';
    } else if (startDate === endDate) {
      return format(start, 'dd/MM/yyyy', { locale: es });
    } else {
      return `${format(start, 'dd/MM', { locale: es })} - ${format(end, 'dd/MM/yyyy', { locale: es })}`;
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  if (loading) {
    console.log('🔄 WorkerDashboard: Rendering loading screen');
    return (
      <div className={`flex items-center justify-center py-12 ${className}`}>
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-lg text-gray-600">Cargando información...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 pb-20 md:pb-6 ${className}`}>
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-600 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 md:h-6 md:w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg md:text-2xl font-bold text-gray-900">
                ¡Hola, {worker?.full_name || user?.email}!
              </h1>
              <p className="text-sm md:text-base text-gray-600">
                {format(new Date(), "EEEE, d 'de' MMMM", { locale: es })}
              </p>
            </div>
          </div>
          <Button onClick={handleSignOut} variant="outline" size="sm" className="hidden md:flex">
            <LogOut className="h-4 w-4 mr-2" />
            Cerrar Sesión
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-3 gap-3 md:gap-4">
        <Card className="shadow-sm">
          <CardContent className="p-3 md:p-6">
            <div className="flex flex-col md:flex-row md:items-center text-center md:text-left">
              <Calendar className="h-6 w-6 md:h-8 md:w-8 text-blue-600 mx-auto md:mx-0" />
              <div className="mt-2 md:mt-0 md:ml-4">
                <p className="text-xs md:text-sm font-medium text-gray-600">Hoy</p>
                <p className="text-lg md:text-2xl font-bold text-gray-900">{todayAssignments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardContent className="p-3 md:p-6">
            <div className="flex flex-col md:flex-row md:items-center text-center md:text-left">
              <Users className="h-6 w-6 md:h-8 md:w-8 text-green-600 mx-auto md:mx-0" />
              <div className="mt-2 md:mt-0 md:ml-4">
                <p className="text-xs md:text-sm font-medium text-gray-600">Usuarios</p>
                <p className="text-lg md:text-2xl font-bold text-gray-900">{assignments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardContent className="p-3 md:p-6">
            <div className="flex flex-col md:flex-row md:items-center text-center md:text-left">
              <Clock className="h-6 w-6 md:h-8 md:w-8 text-orange-600 mx-auto md:mx-0" />
              <div className="mt-2 md:mt-0 md:ml-4">
                <p className="text-xs md:text-sm font-medium text-gray-600">Próximas</p>
                <p className="text-lg md:text-2xl font-bold text-gray-900">{upcomingAssignments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Asignaciones de hoy */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <Calendar className="h-4 w-4 md:h-5 md:w-5" />
            Asignaciones de Hoy
          </CardTitle>
          <CardDescription className="text-sm">
            Tus citas programadas para hoy
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          {todayAssignments.length === 0 ? (
            <div className="text-center py-6 md:py-8">
              <CheckCircle className="h-10 w-10 md:h-12 md:w-12 text-green-500 mx-auto mb-3 md:mb-4" />
              <p className="text-gray-600 text-sm md:text-base">¡No tienes asignaciones para hoy!</p>
              <p className="text-xs md:text-sm text-gray-500">Disfruta tu día libre</p>
            </div>
          ) : (
            <div className="space-y-3 md:space-y-4">
              {todayAssignments.map((assignment) => (
                <div key={assignment.id} className="border rounded-lg p-3 md:p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold text-gray-900 text-sm md:text-base pr-2">
                        {assignment.user.full_name}
                      </h3>
                      <Badge variant="default" className="text-xs shrink-0">Activa</Badge>
                    </div>
                    
                    <div className="space-y-2 text-xs md:text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3 md:h-4 md:w-4 shrink-0" />
                        <span className="font-medium">{assignment.start_time} - {assignment.end_time}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin className="h-3 w-3 md:h-4 md:w-4 shrink-0 mt-0.5" />
                        <span className="break-words">{assignment.user.address}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3 md:h-4 md:w-4 shrink-0" />
                        <a href={`tel:${assignment.user.phone}`} className="text-blue-600 hover:text-blue-800 font-medium">
                          {assignment.user.phone}
                        </a>
                      </div>
                    </div>
                    
                    {assignment.user.medical_notes && (
                      <div className="mt-3 p-2 md:p-3 bg-yellow-50 border border-yellow-200 rounded text-xs md:text-sm">
                        <strong className="text-yellow-800">Notas médicas:</strong>
                        <p className="mt-1 text-yellow-700">{assignment.user.medical_notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Próximas asignaciones */}
      {upcomingAssignments.length > 0 && (
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <Clock className="h-4 w-4 md:h-5 md:w-5" />
              Próximas Asignaciones
            </CardTitle>
            <CardDescription className="text-sm">
              Tus próximas citas programadas
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3 md:space-y-4">
              {upcomingAssignments.map((assignment) => (
                <div key={assignment.id} className="border rounded-lg p-3 md:p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-gray-900 text-sm md:text-base">
                        {assignment.user.full_name}
                      </h3>
                      <Badge variant="secondary" className="text-xs shrink-0">
                        {getDateLabel(assignment.start_date, assignment.end_date)}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 text-xs md:text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3 md:h-4 md:w-4 shrink-0" />
                        <span className="font-medium">{assignment.start_time} - {assignment.end_time}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin className="h-3 w-3 md:h-4 md:w-4 shrink-0 mt-0.5" />
                        <span className="break-words">{assignment.user.address}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Botón de actualizar */}
      <div className="text-center pt-2">
        <Button onClick={loadAssignments} variant="outline" size="sm" className="w-full md:w-auto">
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualizar Información
        </Button>
      </div>
    </div>
  );
};