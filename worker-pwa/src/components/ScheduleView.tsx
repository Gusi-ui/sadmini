import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  MapPin, 
  Phone, 
  AlertCircle,
  RefreshCw,
  Check,
  X,
  Play,
  MessageSquare,
  LogIn,
  LogOut,
  AlertTriangle,
  User
} from 'lucide-react';
import '../styles/ScheduleView.css';
import { 
  format, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameDay, 
  addWeeks, 
  subWeeks,
  parseISO,
  isToday
} from 'date-fns';
import { es } from 'date-fns/locale';

interface Assignment {
  id: string;
  user_id: string;
  worker_id: string;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  status: 'active' | 'completed' | 'cancelled' | 'in_progress';
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  time_slots: any[];
  completion_notes?: string;
  completed_at?: string;
  actual_start_time?: string;
  actual_end_time?: string;
  check_in_location?: string;
  check_out_location?: string;
  user: {
    id: string;
    full_name: string;
    address: string;
    phone: string;
    medical_notes?: string;
    emergency_contact?: string;
    emergency_phone?: string;
  };
}

interface ScheduleViewProps {
  className?: string;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({ className }) => {
  const { worker } = useAuth();
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [noteText, setNoteText] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | Assignment['status']>('all');
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 }); // Lunes
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 }); // Domingo
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const filteredAssignments = assignments.filter(assignment => {
    if (statusFilter === 'all') return true;
    return assignment.status === statusFilter;
  });

  const loadWeekAssignments = useCallback(async () => {
    if (!worker?.id) return;

    try {
      setLoading(true);
      setError(null);

      const startDate = format(weekStart, 'yyyy-MM-dd');
      const endDate = format(weekEnd, 'yyyy-MM-dd');

      const { data, error } = await supabase
        .from('assignments')
        .select(`
          *,
          user:users!assignments_user_id_fkey (
            id,
            full_name,
            address,
            phone,
            medical_notes,
            emergency_contact,
            emergency_phone
          )
        `)
        .eq('worker_id', worker.id)
        .or(`and(start_date.lte.${endDate},end_date.gte.${startDate})`)
        .order('start_date', { ascending: true })
        .order('start_time', { ascending: true });

      if (error) {
        throw error;
      }

      setAssignments(data || []);
    } catch (err: any) {
      console.error('Error loading week assignments:', err);
      setError(err.message || 'Error al cargar las asignaciones de la semana');
    } finally {
      setLoading(false);
    }
  }, [worker?.id, weekStart, weekEnd]);

  const updateAssignmentStatus = async (assignmentId: string, newStatus: Assignment['status'], completionNotes?: string) => {
    try {
      const updateData: any = {
        status: newStatus,
        updated_at: new Date().toISOString()
      };
      
      if (newStatus === 'completed') {
        updateData.completed_at = new Date().toISOString();
        if (completionNotes) {
          updateData.completion_notes = completionNotes;
        }
      }
      
      const { error } = await supabase
        .from('assignments')
        .update(updateData)
        .eq('id', assignmentId);
      
      if (error) throw error;
      
      // Actualizar el estado local
      setAssignments(prev => prev.map(assignment => 
        assignment.id === assignmentId 
          ? { ...assignment, ...updateData }
          : assignment
      ));
      
    } catch (err) {
      console.error('Error updating assignment status:', err);
      setError('Error al actualizar el estado de la asignación');
    }
  };

  const handleCompleteAssignment = (assignmentId: string) => {
    const assignment = assignments.find(a => a.id === assignmentId);
    if (!assignment) return;
    
    const addNote = window.confirm('¿Quieres agregar una nota de finalización?');
    if (addNote) {
      setSelectedAssignment(assignment);
      setNoteText('');
      setNoteModalOpen(true);
    } else {
      const confirmed = window.confirm('¿Estás seguro de que quieres marcar esta asignación como completada?');
      if (confirmed) {
        updateAssignmentStatus(assignmentId, 'completed');
      }
    }
  };

  const handleSaveNote = () => {
    if (selectedAssignment) {
      updateAssignmentStatus(selectedAssignment.id, 'completed', noteText);
      setNoteModalOpen(false);
      setSelectedAssignment(null);
      setNoteText('');
    }
  };

  const handleAddNote = (assignmentId: string) => {
    const assignment = assignments.find(a => a.id === assignmentId);
    if (!assignment) return;
    
    setSelectedAssignment(assignment);
    setNoteText(assignment.notes || '');
    setNoteModalOpen(true);
  };

  const handleUpdateNote = async (assignmentId: string, newNote: string) => {
     try {
       const { error } = await supabase
         .from('assignments')
         .update({ 
           notes: newNote,
           updated_at: new Date().toISOString()
         })
         .eq('id', assignmentId);
       
       if (error) throw error;
       
       // Actualizar el estado local
       setAssignments(prev => prev.map(assignment => 
         assignment.id === assignmentId 
           ? { ...assignment, notes: newNote }
           : assignment
       ));
       
     } catch (err) {
        console.error('Error updating assignment note:', err);
        setError('Error al actualizar la nota de la asignación');
      }
    };

    const handleShowDetails = (assignment: Assignment) => {
      setSelectedAssignment(assignment);
      setShowDetailsModal(true);
    };

   const getCurrentLocation = (): Promise<string> => {
     return new Promise((resolve) => {
       if (navigator.geolocation) {
         navigator.geolocation.getCurrentPosition(
           (position) => {
             const { latitude, longitude } = position.coords;
             resolve(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
           },
           () => {
             resolve('Ubicación no disponible');
           }
         );
       } else {
         resolve('Geolocalización no soportada');
       }
     });
   };

   const handleCheckIn = async (assignmentId: string) => {
     try {
       const location = await getCurrentLocation();
       const currentTime = new Date().toLocaleTimeString('es-ES', { 
         hour: '2-digit', 
         minute: '2-digit' 
       });
       
       const { error } = await supabase
         .from('assignments')
         .update({
           status: 'in_progress',
           actual_start_time: currentTime,
           check_in_location: location,
           updated_at: new Date().toISOString()
         })
         .eq('id', assignmentId);
       
       if (error) throw error;
       
       // Actualizar el estado local
       setAssignments(prev => prev.map(assignment => 
         assignment.id === assignmentId 
           ? { 
               ...assignment, 
               status: 'in_progress' as const,
               actual_start_time: currentTime,
               check_in_location: location
             }
           : assignment
       ));
       
     } catch (err) {
       console.error('Error during check-in:', err);
       setError('Error al hacer check-in');
     }
   };

   const handleCheckOut = async (assignmentId: string) => {
     try {
       const location = await getCurrentLocation();
       const currentTime = new Date().toLocaleTimeString('es-ES', { 
         hour: '2-digit', 
         minute: '2-digit' 
       });
       
       const { error } = await supabase
         .from('assignments')
         .update({
           actual_end_time: currentTime,
           check_out_location: location,
           updated_at: new Date().toISOString()
         })
         .eq('id', assignmentId);
       
       if (error) throw error;
       
       // Actualizar el estado local
       setAssignments(prev => prev.map(assignment => 
         assignment.id === assignmentId 
           ? { 
               ...assignment, 
               actual_end_time: currentTime,
               check_out_location: location
             }
           : assignment
       ));
       
     } catch (err) {
       console.error('Error during check-out:', err);
       setError('Error al hacer check-out');
     }
   };

  const handleStartAssignment = (assignmentId: string) => {
    updateAssignmentStatus(assignmentId, 'in_progress');
  };

  const handleCancelAssignment = (assignmentId: string) => {
    const confirmed = window.confirm('¿Estás seguro de que quieres cancelar esta asignación?');
    if (confirmed) {
      updateAssignmentStatus(assignmentId, 'cancelled');
    }
  };

  const getStatusBadge = (status: Assignment['status']) => {
    switch (status) {
      case 'active':
        return { text: 'Pendiente', className: 'bg-blue-100 text-blue-700 border-blue-200' };
      case 'in_progress':
        return { text: 'En Curso', className: 'bg-yellow-100 text-yellow-700 border-yellow-200' };
      case 'completed':
        return { text: 'Completada', className: 'bg-green-100 text-green-700 border-green-200' };
      case 'cancelled':
        return { text: 'Cancelada', className: 'bg-red-100 text-red-700 border-red-200' };
      default:
        return { text: 'Desconocido', className: 'bg-gray-100 text-gray-700 border-gray-200' };
    }
  };

  const getActionButtons = (assignment: Assignment) => {
    const buttons = [];
    
    if (assignment.status === 'active') {
      buttons.push(
        <button
          key="checkin"
          onClick={() => handleCheckIn(assignment.id)}
          className="bg-green-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium active:bg-green-600 transition-colors touch-manipulation flex items-center gap-1"
        >
          <LogIn className="h-3 w-3" />
          Check-in
        </button>
      );
    }
    
    if (assignment.status === 'in_progress') {
      buttons.push(
        <button
          key="checkout"
          onClick={() => handleCheckOut(assignment.id)}
          className="bg-orange-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium active:bg-orange-600 transition-colors touch-manipulation flex items-center gap-1"
        >
          <LogOut className="h-3 w-3" />
          Check-out
        </button>
      );
    }
    
    if (assignment.status === 'active' || assignment.status === 'in_progress') {
      buttons.push(
        <button
          key="complete"
          onClick={() => handleCompleteAssignment(assignment.id)}
          className="bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium active:bg-blue-600 transition-colors touch-manipulation flex items-center gap-1"
        >
          <Check className="h-3 w-3" />
          Completar
        </button>
      );
    }
    
    if (assignment.status === 'active' || assignment.status === 'in_progress') {
      buttons.push(
        <button
          key="note"
          onClick={() => handleAddNote(assignment.id)}
          className="bg-purple-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium active:bg-purple-600 transition-colors touch-manipulation flex items-center gap-1"
        >
          <MessageSquare className="h-3 w-3" />
          Nota
        </button>
      );
    }
    
    if (assignment.status === 'active') {
      buttons.push(
        <button
          key="cancel"
          onClick={() => handleCancelAssignment(assignment.id)}
          className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium active:bg-red-600 transition-colors touch-manipulation flex items-center gap-1"
        >
          <X className="h-3 w-3" />
          Cancelar
        </button>
      );
    }
    
    return buttons;
  };

  useEffect(() => {
    loadWeekAssignments();
  }, [loadWeekAssignments]);

  const getAssignmentsForDay = (day: Date) => {
    const dayStr = format(day, 'yyyy-MM-dd');
    return filteredAssignments.filter(assignment => {
      const startDate = assignment.start_date;
      const endDate = assignment.end_date;
      return dayStr >= startDate && dayStr <= endDate;
    });
  };

  const goToPreviousWeek = () => {
    setCurrentWeek(subWeeks(currentWeek, 1));
  };

  const goToNextWeek = () => {
    setCurrentWeek(addWeeks(currentWeek, 1));
  };

  const goToCurrentWeek = () => {
    setCurrentWeek(new Date());
  };

  const formatTimeRange = (startTime: string, endTime: string) => {
    return `${startTime} - ${endTime}`;
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center py-12 ${className}`}>
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-lg text-gray-600">Cargando horarios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 pb-20 md:pb-6 ${className}`}>
      {/* Header con navegación */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <Calendar className="h-4 w-4 md:h-5 md:w-5" />
                Horarios Semanales
              </CardTitle>
            </div>
            
            {/* Navegación de semana */}
            <div className="flex items-center justify-between">
              <CardDescription className="text-sm">
                {format(weekStart, "d MMM", { locale: es })} - {format(weekEnd, "d MMM yyyy", { locale: es })}
              </CardDescription>
              <div className="flex items-center gap-1">
                <Button onClick={goToPreviousWeek} variant="outline" size="sm" className="h-8 w-8 p-0 touch-target hover-effect">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button onClick={goToCurrentWeek} variant="outline" size="sm" className="text-xs px-2 h-8 touch-target hover-effect mobile-text-xs">
                  Hoy
                </Button>
                <Button onClick={goToNextWeek} variant="outline" size="sm" className="h-8 w-8 p-0 touch-target hover-effect">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Filtros de estado */}
            <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100">
              <span className="text-sm font-medium text-gray-700 self-center">Filtrar por estado:</span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors touch-manipulation ${
                    statusFilter === 'all'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Todas
                </button>
                <button
                  onClick={() => setStatusFilter('active')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors touch-manipulation ${
                    statusFilter === 'active'
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Activas
                </button>
                <button
                  onClick={() => setStatusFilter('in_progress')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors touch-manipulation ${
                    statusFilter === 'in_progress'
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  En Curso
                </button>
                <button
                  onClick={() => setStatusFilter('completed')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors touch-manipulation ${
                    statusFilter === 'completed'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Completadas
                </button>
                <button
                  onClick={() => setStatusFilter('cancelled')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors touch-manipulation ${
                    statusFilter === 'cancelled'
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Canceladas
                </button>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Vista móvil: scroll horizontal de días */}
      <div className="md:hidden">
        {/* Indicador de scroll */}
        <div className="text-center mb-2">
          <p className="text-xs text-gray-500">← Desliza para ver más días →</p>
        </div>
        
        <div className="flex gap-3 overflow-x-auto pb-4 px-1 snap-x snap-mandatory scrollbar-hide mobile-scroll">
          {weekDays.map((day) => {
            const dayAssignments = getAssignmentsForDay(day);
            const isCurrentDay = isToday(day);
            
            return (
              <div key={day.toISOString()} className="flex-shrink-0 w-80 snap-center animate-slide-in">
                {/* Encabezado del día */}
                <div className={`text-center p-4 rounded-xl mb-4 shadow-sm touch-card ${
                  isCurrentDay 
                    ? 'current-day-gradient text-white shadow-blue-200' 
                    : 'bg-white border border-gray-200 card-shadow'
                }`}>
                  <div className={`text-sm font-medium ${
                    isCurrentDay ? 'text-blue-100' : 'text-gray-600'
                  }`}>
                    {format(day, 'EEEE', { locale: es })}
                  </div>
                  <div className={`text-2xl font-bold ${
                    isCurrentDay ? 'text-white' : 'text-gray-900'
                  }`}>
                    {format(day, 'd')}
                  </div>
                  <div className={`text-xs ${
                    isCurrentDay ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {format(day, 'MMM', { locale: es })}
                  </div>
                </div>

                {/* Asignaciones del día */}
                <div className="space-y-4 min-h-[320px]">
                  {dayAssignments.length === 0 ? (
                    <div className="bg-white rounded-xl p-8 text-center border border-gray-100 shadow-sm touch-card">
                      <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-sm text-gray-500 font-medium mobile-text-sm">Sin asignaciones</p>
                      <p className="text-xs text-gray-400 mt-1 mobile-text-xs">Día libre</p>
                    </div>
                  ) : (
                    dayAssignments.map((assignment) => (
                      <div 
                        key={assignment.id} 
                        className="bg-white border border-gray-100 rounded-xl p-5 card-shadow hover:card-shadow-hover active:scale-[0.98] transition-all duration-200 touch-card hover-effect cursor-pointer"
                        onClick={() => handleShowDetails(assignment)}
                      >
                        <div className="space-y-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <h4 className="font-semibold text-base text-gray-900 leading-tight mobile-text-sm">
                                {assignment.user.full_name}
                              </h4>
                              <div className="flex items-center gap-2 mt-2">
                                <Clock className="h-4 w-4 text-blue-500" />
                                <span className="font-semibold text-blue-600 text-sm mobile-text-xs">
                                  {formatTimeRange(assignment.start_time, assignment.end_time)}
                                </span>
                              </div>
                            </div>
                            <Badge variant="default" className={`text-xs px-3 py-1 mobile-text-xs ${getStatusBadge(assignment.status).className}`}>
                              {getStatusBadge(assignment.status).text}
                            </Badge>
                          </div>
                          
                          <div className="space-y-3">
                            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg touch-card">
                              <MapPin className="h-4 w-4 text-gray-500 mt-0.5 shrink-0" />
                              <span className="text-sm text-gray-700 leading-relaxed mobile-text-xs">{assignment.user.address}</span>
                            </div>
                            
                            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg touch-card">
                              <div className="flex items-center gap-3">
                                <Phone className="h-4 w-4 text-blue-500" />
                                <span className="text-sm text-gray-600 mobile-text-xs">Contacto</span>
                              </div>
                              <a 
                                href={`tel:${assignment.user.phone}`} 
                                className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium active:bg-blue-600 transition-colors touch-manipulation mobile-text-xs"
                              >
                                Llamar
                              </a>
                            </div>
                            
                            {assignment.user.emergency_contact && assignment.user.emergency_phone && (
                              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg touch-card border border-red-200">
                                <div className="flex items-center gap-3">
                                  <AlertTriangle className="h-4 w-4 text-red-500" />
                                  <div>
                                    <span className="text-sm font-medium text-red-800 mobile-text-xs">Emergencia</span>
                                    <p className="text-xs text-red-600 mobile-text-xs">{assignment.user.emergency_contact}</p>
                                  </div>
                                </div>
                                <a 
                                  href={`tel:${assignment.user.emergency_phone}`} 
                                  className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium active:bg-red-600 transition-colors touch-manipulation mobile-text-xs"
                                >
                                  Llamar
                                </a>
                              </div>
                            )}
                          </div>
                          
                          {assignment.user.medical_notes && (
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 touch-card">
                              <div className="flex items-start gap-2">
                                <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                                <div>
                                  <strong className="text-amber-800 text-sm mobile-text-xs">Notas médicas:</strong>
                                  <p className="mt-1 text-amber-700 text-sm leading-relaxed mobile-text-xs">{assignment.user.medical_notes}</p>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {assignment.notes && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 touch-card">
                              <div className="flex items-start gap-2">
                                <MessageSquare className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                                <div>
                                  <strong className="text-blue-800 text-sm mobile-text-xs">Notas de la asignación:</strong>
                                  <p className="mt-1 text-blue-700 text-sm leading-relaxed mobile-text-xs">{assignment.notes}</p>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {(assignment.actual_start_time || assignment.actual_end_time) && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4 touch-card">
                              <div className="flex items-start gap-2">
                                <Clock className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                                <div className="flex-1">
                                  <strong className="text-green-800 text-sm mobile-text-xs">Registro de tiempo:</strong>
                                  <div className="mt-2 space-y-1">
                                    {assignment.actual_start_time && (
                                      <div className="flex items-center gap-2">
                                        <LogIn className="h-3 w-3 text-green-600" />
                                        <span className="text-green-700 text-sm mobile-text-xs">Check-in: {assignment.actual_start_time}</span>
                                      </div>
                                    )}
                                    {assignment.actual_end_time && (
                                      <div className="flex items-center gap-2">
                                        <LogOut className="h-3 w-3 text-green-600" />
                                        <span className="text-green-700 text-sm mobile-text-xs">Check-out: {assignment.actual_end_time}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {/* Botones de acción */}
                          <div className="flex flex-wrap gap-2 pt-2">
                            {getActionButtons(assignment)}
                          </div>
                          
                          {assignment.completion_notes && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-3 touch-card">
                              <div className="flex items-start gap-2">
                                <MessageSquare className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                                <div>
                                  <strong className="text-green-800 text-sm mobile-text-xs">Notas de finalización:</strong>
                                  <p className="mt-1 text-green-700 text-sm leading-relaxed mobile-text-xs">{assignment.completion_notes}</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Vista desktop: grid de 7 columnas */}
      <div className="hidden md:block">
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="grid grid-cols-7 gap-4">
              {weekDays.map((day) => {
                const dayAssignments = getAssignmentsForDay(day);
                const isCurrentDay = isToday(day);
                
                return (
                  <div key={day.toISOString()} className="space-y-2">
                    {/* Encabezado del día */}
                    <div className={`text-center p-2 rounded-lg ${
                      isCurrentDay 
                        ? 'bg-blue-100 border-2 border-blue-300' 
                        : 'bg-gray-50'
                    }`}>
                      <div className={`text-sm font-medium ${
                        isCurrentDay ? 'text-blue-800' : 'text-gray-600'
                      }`}>
                        {format(day, 'EEEE', { locale: es })}
                      </div>
                      <div className={`text-lg font-bold ${
                        isCurrentDay ? 'text-blue-900' : 'text-gray-900'
                      }`}>
                        {format(day, 'd')}
                      </div>
                    </div>

                    {/* Asignaciones del día */}
                    <div className="space-y-2 min-h-[200px]">
                      {dayAssignments.length === 0 ? (
                        <div className="text-center text-gray-400 text-sm py-4">
                          Sin asignaciones
                        </div>
                      ) : (
                        dayAssignments.map((assignment) => (
                          <div 
                            key={assignment.id} 
                            className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => handleShowDetails(assignment)}
                          >
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium text-sm text-gray-900 truncate">
                                  {assignment.user.full_name}
                                </h4>
                                <Badge variant="default" className={`text-xs ${getStatusBadge(assignment.status).className}`}>
                                  {getStatusBadge(assignment.status).text}
                                </Badge>
                              </div>
                              
                              <div className="space-y-1">
                                <div className="flex items-center gap-1 text-xs text-gray-600">
                                  <Clock className="h-3 w-3" />
                                  <span>{formatTimeRange(assignment.start_time, assignment.end_time)}</span>
                                </div>
                                
                                <div className="flex items-start gap-1 text-xs text-gray-600">
                                  <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                  <span className="line-clamp-2">{assignment.user.address}</span>
                                </div>
                                
                                <div className="flex items-center gap-1 text-xs text-gray-600">
                                  <Phone className="h-3 w-3" />
                                  <a href={`tel:${assignment.user.phone}`} className="text-blue-600 hover:text-blue-800">
                                    {assignment.user.phone}
                                  </a>
                                </div>
                                
                                {assignment.user.emergency_contact && assignment.user.emergency_phone && (
                                  <div className="flex items-center gap-1 text-xs text-red-600">
                                    <AlertTriangle className="h-3 w-3" />
                                    <div className="flex flex-col">
                                      <span className="font-medium">Emergencia: {assignment.user.emergency_contact}</span>
                                      <a href={`tel:${assignment.user.emergency_phone}`} className="text-red-700 hover:text-red-900">
                                        {assignment.user.emergency_phone}
                                      </a>
                                    </div>
                                  </div>
                                )}
                              </div>
                              
                              {assignment.user.medical_notes && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded p-2 text-xs">
                                  <strong>Notas médicas:</strong> 
                                  <span className="line-clamp-2">{assignment.user.medical_notes}</span>
                                </div>
                              )}
                              
                              {assignment.notes && (
                                <div className="bg-blue-50 border border-blue-200 rounded p-2 text-xs">
                                  <strong>Notas:</strong> 
                                  <span className="line-clamp-2">{assignment.notes}</span>
                                </div>
                              )}
                              
                              {(assignment.actual_start_time || assignment.actual_end_time) && (
                                <div className="bg-green-50 border border-green-200 rounded p-2 text-xs">
                                  <strong>Registro:</strong>
                                  <div className="mt-1 space-y-1">
                                    {assignment.actual_start_time && (
                                      <div className="flex items-center gap-1">
                                        <LogIn className="h-3 w-3" />
                                        <span>In: {assignment.actual_start_time}</span>
                                      </div>
                                    )}
                                    {assignment.actual_end_time && (
                                      <div className="flex items-center gap-1">
                                        <LogOut className="h-3 w-3" />
                                        <span>Out: {assignment.actual_end_time}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                              
                              {/* Botones de acción */}
                              <div className="flex flex-wrap gap-1">
                                {getActionButtons(assignment).map((button, index) => (
                                  <div key={index} className="text-xs">
                                    {button}
                                  </div>
                                ))}
                              </div>
                              
                              {assignment.completion_notes && (
                                <div className="bg-green-50 border border-green-200 rounded p-2 text-xs">
                                  <strong>Finalización:</strong> 
                                  <span className="line-clamp-2">{assignment.completion_notes}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Botón de actualizar */}
      <div className="text-center pt-2">
        <Button onClick={loadWeekAssignments} variant="outline" size="sm" className="w-full md:w-auto touch-target hover-effect">
          <RefreshCw className="h-4 w-4 mr-2" />
          <span className="mobile-text-xs">Actualizar Horarios</span>
        </Button>
      </div>
      
      {/* Modal para notas */}
      {noteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {selectedAssignment?.status === 'completed' ? 'Nota de finalización' : 'Agregar nota'}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {selectedAssignment?.user.full_name}
            </p>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Escribe una nota sobre esta asignación..."
              className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="flex gap-3 mt-4">
              <Button
                onClick={() => {
                  setNoteModalOpen(false);
                  setSelectedAssignment(null);
                  setNoteText('');
                }}
                variant="outline"
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={() => {
                  if (selectedAssignment?.status === 'completed' || noteText.trim()) {
                    if (selectedAssignment?.status === 'completed') {
                      handleSaveNote();
                    } else {
                      handleUpdateNote(selectedAssignment!.id, noteText);
                      setNoteModalOpen(false);
                      setSelectedAssignment(null);
                      setNoteText('');
                    }
                  }
                }}
                className="flex-1 bg-blue-500 hover:bg-blue-600"
              >
                Guardar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de detalles completos */}
      {showDetailsModal && selectedAssignment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-xl">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  Detalles de la Asignación
                </h2>
                <Button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedAssignment(null);
                  }}
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                >
                  ×
                </Button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Información del usuario */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Información del Usuario
                </h3>
                <div className="space-y-2">
                  <p className="text-blue-800"><strong>Nombre:</strong> {selectedAssignment.user.full_name}</p>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-blue-600" />
                    <span className="text-blue-700">{selectedAssignment.user.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-blue-600" />
                    <a href={`tel:${selectedAssignment.user.phone}`} className="text-blue-700 hover:text-blue-900">
                      {selectedAssignment.user.phone}
                    </a>
                  </div>
                </div>
              </div>

              {/* Información de la asignación */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Detalles de la Asignación
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-700"><strong>Fecha:</strong> {format(new Date(selectedAssignment.start_date), 'dd/MM/yyyy', { locale: es })}</p>
                    <p className="text-gray-700"><strong>Horario:</strong> {formatTimeRange(selectedAssignment.start_time, selectedAssignment.end_time)}</p>
                  </div>
                  <div>
                    <p className="text-gray-700"><strong>Estado:</strong> 
                      <Badge variant="default" className={`ml-2 ${getStatusBadge(selectedAssignment.status).className}`}>
                        {getStatusBadge(selectedAssignment.status).text}
                      </Badge>
                    </p>
                  </div>
                </div>
              </div>

              {/* Contacto de emergencia */}
              {selectedAssignment.user.emergency_contact && selectedAssignment.user.emergency_phone && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Contacto de Emergencia
                  </h3>
                  <div className="space-y-2">
                    <p className="text-red-800"><strong>Nombre:</strong> {selectedAssignment.user.emergency_contact}</p>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-red-600" />
                      <a href={`tel:${selectedAssignment.user.emergency_phone}`} className="text-red-700 hover:text-red-900">
                        {selectedAssignment.user.emergency_phone}
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* Notas médicas */}
              {selectedAssignment.user.medical_notes && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <h3 className="font-semibold text-amber-900 mb-3 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Notas Médicas
                  </h3>
                  <p className="text-amber-800">{selectedAssignment.user.medical_notes}</p>
                </div>
              )}

              {/* Notas de la asignación */}
              {selectedAssignment.notes && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Notas de la Asignación
                  </h3>
                  <p className="text-blue-800">{selectedAssignment.notes}</p>
                </div>
              )}

              {/* Registro de tiempo */}
              {(selectedAssignment.actual_start_time || selectedAssignment.actual_end_time) && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Registro de Tiempo
                  </h3>
                  <div className="space-y-2">
                    {selectedAssignment.actual_start_time && (
                      <div className="flex items-center gap-2">
                        <LogIn className="h-4 w-4 text-green-600" />
                        <span className="text-green-800"><strong>Check-in:</strong> {selectedAssignment.actual_start_time}</span>
                        {selectedAssignment.check_in_location && (
                          <span className="text-green-700 text-sm">({selectedAssignment.check_in_location})</span>
                        )}
                      </div>
                    )}
                    {selectedAssignment.actual_end_time && (
                      <div className="flex items-center gap-2">
                        <LogOut className="h-4 w-4 text-green-600" />
                        <span className="text-green-800"><strong>Check-out:</strong> {selectedAssignment.actual_end_time}</span>
                        {selectedAssignment.check_out_location && (
                          <span className="text-green-700 text-sm">({selectedAssignment.check_out_location})</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Notas de finalización */}
              {selectedAssignment.completion_notes && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Notas de Finalización
                  </h3>
                  <p className="text-green-800">{selectedAssignment.completion_notes}</p>
                </div>
              )}

              {/* Botones de acción */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="font-semibold text-gray-900 mb-3">Acciones</h3>
                <div className="flex flex-wrap gap-2">
                  {getActionButtons(selectedAssignment)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};