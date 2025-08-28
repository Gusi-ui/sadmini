import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Clock, Play, Pause, Square, Calendar, User, MapPin } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { format, differenceInMinutes, startOfWeek, endOfWeek, addWeeks, subWeeks } from 'date-fns';
import { es } from 'date-fns/locale';

interface TimeEntry {
  id: string;
  assignment_id: string;
  start_time: string;
  end_time?: string;
  total_minutes?: number;
  notes?: string;
  created_at: string;
  assignments?: {
    id: string;
    scheduled_date: string;
    clients: {
      id: string;
      full_name: string;
      address?: string;
    };
  };
}

interface Assignment {
  id: string;
  client_id: string;
  scheduled_date: string;
  start_time: string;
  end_time: string;
  status: string;
  clients: {
    id: string;
    full_name: string;
    address?: string;
  };
}

export const TimeTrackingView: React.FC = () => {
  const { worker } = useAuth();
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [todayAssignments, setTodayAssignments] = useState<Assignment[]>([]);
  const [activeEntry, setActiveEntry] = useState<TimeEntry | null>(null);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTimeData();
  }, [worker, currentWeek]);

  useEffect(() => {
    // Actualizar cada minuto si hay una entrada activa
    const interval = setInterval(() => {
      if (activeEntry) {
        // Forzar re-render para actualizar el tiempo transcurrido
        setActiveEntry({ ...activeEntry });
      }
    }, 60000); // Cada minuto

    return () => clearInterval(interval);
  }, [activeEntry]);

  const loadTimeData = async () => {
    if (!worker?.id) return;

    try {
      setLoading(true);
      setError(null);

      const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });
      const today = format(new Date(), 'yyyy-MM-dd');

      // Cargar entradas de tiempo de la semana
      const { data: entriesData, error: entriesError } = await supabase
        .from('time_entries')
        .select(`
          id,
          assignment_id,
          start_time,
          end_time,
          total_minutes,
          notes,
          created_at,
          assignments!inner (
            id,
            scheduled_date,
            clients (
              id,
              full_name,
              address
            )
          )
        `)
        .eq('assignments.worker_id', worker.id)
        .gte('assignments.scheduled_date', format(weekStart, 'yyyy-MM-dd'))
        .lte('assignments.scheduled_date', format(weekEnd, 'yyyy-MM-dd'))
        .order('start_time', { ascending: false });

      if (entriesError) {
        throw entriesError;
      }

      // Procesar entradas de tiempo
      const processedEntries: TimeEntry[] = [];
      entriesData?.forEach((item: any) => {
        if (item.assignments && Array.isArray(item.assignments) && item.assignments.length > 0) {
          const assignment = item.assignments[0];
          const entry: TimeEntry = {
            id: item.id,
            assignment_id: item.assignment_id,
            start_time: item.start_time,
            end_time: item.end_time,
            total_minutes: item.total_minutes,
            notes: item.notes,
            created_at: item.created_at,
            assignments: {
              id: assignment.id,
              scheduled_date: assignment.scheduled_date,
              clients: assignment.clients && assignment.clients.length > 0 ? assignment.clients[0] : null
            }
          };
          processedEntries.push(entry);
        }
      });

      setTimeEntries(processedEntries);

      // Buscar entrada activa (sin end_time)
      const active = processedEntries.find(entry => !entry.end_time);
      setActiveEntry(active || null);

      // Cargar asignaciones de hoy
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('assignments')
        .select(`
          id,
          client_id,
          scheduled_date,
          start_time,
          end_time,
          status,
          clients!inner (
            id,
            full_name,
            address
          )
        `)
        .eq('worker_id', worker.id)
        .eq('scheduled_date', today)
        .order('start_time');

      if (assignmentsError) {
        throw assignmentsError;
      }

      // Procesar asignaciones de hoy
      const processedAssignments: Assignment[] = [];
      assignmentsData?.forEach((item: any) => {
        if (item.clients && Array.isArray(item.clients) && item.clients.length > 0) {
          const assignment: Assignment = {
            id: item.id,
            client_id: item.client_id,
            scheduled_date: item.scheduled_date,
            start_time: item.start_time,
            end_time: item.end_time,
            status: item.status,
            clients: item.clients[0]
          };
          processedAssignments.push(assignment);
        }
      });

      setTodayAssignments(processedAssignments);
    } catch (err) {
      console.error('Error loading time data:', err);
      setError('Error al cargar los datos de tiempo');
    } finally {
      setLoading(false);
    }
  };

  const startTimer = async (assignmentId: string) => {
    try {
      const { data, error } = await supabase
        .from('time_entries')
        .insert({
          assignment_id: assignmentId,
          start_time: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      await loadTimeData();
    } catch (err) {
      console.error('Error starting timer:', err);
      setError('Error al iniciar el cronómetro');
    }
  };

  const stopTimer = async () => {
    if (!activeEntry) return;

    try {
      const endTime = new Date();
      const startTime = new Date(activeEntry.start_time);
      const totalMinutes = differenceInMinutes(endTime, startTime);

      const { error } = await supabase
        .from('time_entries')
        .update({
          end_time: endTime.toISOString(),
          total_minutes: totalMinutes,
        })
        .eq('id', activeEntry.id);

      if (error) throw error;

      await loadTimeData();
    } catch (err) {
      console.error('Error stopping timer:', err);
      setError('Error al detener el cronómetro');
    }
  };

  const getElapsedTime = (startTime: string): string => {
    const start = new Date(startTime);
    const now = new Date();
    const minutes = differenceInMinutes(now, start);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const getWeekTotal = (): number => {
    return timeEntries
      .filter(entry => entry.total_minutes)
      .reduce((total, entry) => total + (entry.total_minutes || 0), 0);
  };

  const hasActiveTimer = (assignmentId: string): boolean => {
    return activeEntry?.assignment_id === assignmentId;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Cargando datos de tiempo...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-6">
        <Card className="border-red-200 bg-red-50 mx-auto max-w-md">
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-red-600 mb-4 text-base">{error}</p>
              <Button 
                onClick={loadTimeData} 
                variant="outline"
                className="min-h-[44px] px-6"
              >
                Reintentar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-4 py-6 pb-20 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2 mb-3">
            <Clock className="h-5 w-5 sm:h-6 sm:w-6" />
            Control de Tiempo
          </h1>
          <p className="text-gray-600 text-sm sm:text-base mb-4">
            Semana del {format(startOfWeek(currentWeek, { weekStartsOn: 1 }), 'd MMM', { locale: es })} - 
            {format(endOfWeek(currentWeek, { weekStartsOn: 1 }), 'd MMM yyyy', { locale: es })}
          </p>
          <div className="flex items-center gap-2 overflow-x-auto">
            <Button
              onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}
              variant="outline"
              size="sm"
              className="min-h-[40px] px-3 flex-shrink-0"
            >
              ← Anterior
            </Button>
            <Button
              onClick={() => setCurrentWeek(new Date())}
              variant="outline"
              size="sm"
              className="min-h-[40px] px-4 flex-shrink-0"
            >
              Hoy
            </Button>
            <Button
              onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}
              variant="outline"
              size="sm"
              className="min-h-[40px] px-3 flex-shrink-0"
            >
              Siguiente →
            </Button>
          </div>
        </div>

        {/* Resumen semanal */}
        <Card className="bg-white shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5" />
              Resumen de la Semana
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-xl sm:text-2xl font-bold text-blue-600">
                  {formatDuration(getWeekTotal())}
                </div>
                <div className="text-xs sm:text-sm text-gray-600 mt-1">Total trabajado</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-xl sm:text-2xl font-bold text-green-600">
                  {timeEntries.filter(e => e.total_minutes).length}
                </div>
                <div className="text-xs sm:text-sm text-gray-600 mt-1">Sesiones completadas</div>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="text-xl sm:text-2xl font-bold text-orange-600">
                  {activeEntry ? getElapsedTime(activeEntry.start_time) : '0h 0m'}
                </div>
                <div className="text-xs sm:text-sm text-gray-600 mt-1">Tiempo activo</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cronómetro activo */}
        {activeEntry && (
          <Card className="border-green-200 bg-green-50 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-green-800 flex items-center gap-2 text-lg">
                <Play className="h-5 w-5" />
                Cronómetro Activo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-green-900 text-lg">
                    {activeEntry.assignments?.clients?.full_name}
                  </h3>
                  <p className="text-sm text-green-700 flex items-center gap-1 mt-1">
                    <MapPin className="h-3 w-3 flex-shrink-0" />
                    <span className="line-clamp-2">{activeEntry.assignments?.clients?.address}</span>
                  </p>
                  <p className="text-sm text-green-600 mt-1">
                    Iniciado: {format(new Date(activeEntry.start_time), 'HH:mm')}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-2xl sm:text-3xl font-bold text-green-800">
                    {getElapsedTime(activeEntry.start_time)}
                  </div>
                  <Button
                    onClick={stopTimer}
                    variant="destructive"
                    size="lg"
                    className="min-h-[48px] px-6 active:scale-95 transition-transform"
                  >
                    <Square className="h-4 w-4 mr-2" />
                    Detener
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Asignaciones de hoy */}
        {todayAssignments.length > 0 && (
          <Card className="bg-white shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Asignaciones de Hoy</CardTitle>
              <CardDescription className="text-sm">
                {format(new Date(), 'EEEE, d MMMM yyyy', { locale: es })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {todayAssignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="p-4 border rounded-lg bg-gray-50 active:bg-gray-100 transition-colors"
                  >
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-semibold flex items-center gap-2 text-base">
                          <User className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">{assignment.clients.full_name}</span>
                        </h4>
                        <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3 flex-shrink-0" />
                          <span className="line-clamp-2">{assignment.clients.address}</span>
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {assignment.start_time} - {assignment.end_time}
                        </p>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <Badge
                          variant={assignment.status === 'completed' ? 'default' : 'secondary'}
                          className="flex-shrink-0"
                        >
                          {assignment.status === 'completed' ? 'Completada' :
                           assignment.status === 'in_progress' ? 'En progreso' : 'Pendiente'}
                        </Badge>
                        {!hasActiveTimer(assignment.id) && !activeEntry && (
                          <Button
                            onClick={() => startTimer(assignment.id)}
                            size="sm"
                            variant="outline"
                            className="min-h-[40px] px-4 active:scale-95 transition-transform"
                          >
                            <Play className="h-4 w-4 mr-2" />
                            Iniciar
                          </Button>
                        )}
                        {hasActiveTimer(assignment.id) && (
                          <Badge variant="default" className="bg-green-600 flex-shrink-0">
                            Activo
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Historial de tiempo */}
        <Card className="bg-white shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Historial de Tiempo</CardTitle>
            <CardDescription className="text-sm">
              Registro de sesiones de trabajo de la semana
            </CardDescription>
          </CardHeader>
          <CardContent>
            {timeEntries.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No hay registros de tiempo
                </h3>
                <p className="text-gray-600 text-sm">
                  Inicia un cronómetro para comenzar a registrar tu tiempo
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {timeEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className={`p-4 border rounded-lg transition-colors ${
                      !entry.end_time ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-semibold flex items-center gap-2 text-base">
                          <User className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">{entry.assignments?.clients?.full_name}</span>
                        </h4>
                        <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3 flex-shrink-0" />
                          <span className="line-clamp-2">{entry.assignments?.clients?.address}</span>
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {format(new Date(entry.assignments?.scheduled_date || ''), 'EEEE, d MMM', { locale: es })}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-lg font-bold">
                          {entry.total_minutes
                            ? formatDuration(entry.total_minutes)
                            : getElapsedTime(entry.start_time)
                          }
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500">
                            {format(new Date(entry.start_time), 'HH:mm')} -
                            {entry.end_time
                              ? format(new Date(entry.end_time), 'HH:mm')
                              : 'En curso'
                            }
                          </div>
                          {!entry.end_time && (
                            <Badge variant="default" className="bg-green-600 mt-1">
                              Activo
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    {entry.notes && (
                      <div className="mt-3 p-3 bg-white rounded text-sm text-gray-600 border">
                        <strong>Notas:</strong> {entry.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};