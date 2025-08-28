import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Users, Search, Phone, MapPin, Calendar, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Client {
  id: string;
  full_name: string;
  phone?: string;
  address?: string;
  municipality?: string;
  medical_notes?: string;
  emergency_contact?: string;
  created_at: string;
}

interface Assignment {
  id: string;
  client_id: string;
  scheduled_date: string;
  start_time: string;
  end_time: string;
  status: string;
  clients: Client;
}

export const ClientsView: React.FC = () => {
  const { worker } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadClientsData = useCallback(async () => {
    console.log('🔍 ClientsView: Loading clients data, worker:', worker);
    if (!worker?.id) {
      console.log('❌ ClientsView: No worker ID found');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('🔍 ClientsView: Querying assignments for worker_id:', worker.id);
      // Cargar asignaciones del trabajador con información del usuario
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('assignments')
        .select(`
          id,
          user_id,
          start_date,
          end_date,
          is_active,
          notes,
          users!inner (
            id,
            full_name,
            phone,
            address,
            email,
            medical_notes,
            emergency_contact,
            created_at
          )
        `)
        .eq('worker_id', worker.id)
        .eq('is_active', true)
        .order('start_date', { ascending: false });

      console.log('📊 ClientsView: Assignments query result:', { assignmentsData, assignmentsError });

      if (assignmentsError) {
        throw assignmentsError;
      }

      // Procesar datos de asignaciones y extraer usuarios
      const processedAssignments: Assignment[] = [];
      const uniqueClients: Client[] = [];

      assignmentsData?.forEach((item: any) => {
        if (item.users) {
          const client = item.users as Client;
          const assignment: Assignment = {
            id: item.id,
            client_id: item.user_id,
            scheduled_date: item.start_date,
            start_time: '08:00',
            end_time: '12:00',
            status: 'active',
            clients: client
          };
          processedAssignments.push(assignment);
          
          if (!uniqueClients.find(c => c.id === client.id)) {
            uniqueClients.push(client);
          }
        }
      });

      setAssignments(processedAssignments);
       setClients(uniqueClients);
    } catch (err) {
      console.error('Error loading clients data:', err);
      setError('Error al cargar los datos de usuarios');
    } finally {
      setLoading(false);
    }
  }, [worker]);

  useEffect(() => {
    loadClientsData();
  }, [worker, loadClientsData]);

  const getClientAssignments = (clientId: string) => {
    return assignments.filter(assignment => assignment.client_id === clientId);
  };

  const getNextAssignment = (clientId: string) => {
    const clientAssignments = getClientAssignments(clientId)
      .filter(assignment => new Date(assignment.scheduled_date) >= new Date())
      .sort((a, b) => {
        // Primero ordenar por fecha
        const dateComparison = new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime();
        if (dateComparison !== 0) return dateComparison;
        
        // Si las fechas son iguales, ordenar por hora de inicio
        const timeA = a.start_time.split(':').map(Number);
        const timeB = b.start_time.split(':').map(Number);
        const minutesA = timeA[0] * 60 + timeA[1];
        const minutesB = timeB[0] * 60 + timeB[1];
        
        return minutesA - minutesB;
      });
    
    return clientAssignments[0];
  };

  const filteredClients = clients
    .filter(client =>
      client.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone?.includes(searchTerm) ||
      client.address?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const nextAssignmentA = getNextAssignment(a.id);
      const nextAssignmentB = getNextAssignment(b.id);
      
      // Si ambos tienen próximas asignaciones, ordenar por fecha y hora más próxima
      if (nextAssignmentA && nextAssignmentB) {
        // Primero comparar por fecha
        const dateComparison = new Date(nextAssignmentA.scheduled_date).getTime() - new Date(nextAssignmentB.scheduled_date).getTime();
        if (dateComparison !== 0) return dateComparison;
        
        // Si las fechas son iguales, comparar por hora de inicio
        const timeA = nextAssignmentA.start_time.split(':').map(Number);
        const timeB = nextAssignmentB.start_time.split(':').map(Number);
        const minutesA = timeA[0] * 60 + timeA[1];
        const minutesB = timeB[0] * 60 + timeB[1];
        
        return minutesA - minutesB;
      }
      
      // Si solo uno tiene próxima asignación, ese va primero
      if (nextAssignmentA && !nextAssignmentB) return -1;
      if (!nextAssignmentA && nextAssignmentB) return 1;
      
      // Si ninguno tiene próximas asignaciones, ordenar alfabéticamente
      return a.full_name.localeCompare(b.full_name);
    });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Cargando usuarios...</p>
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
                onClick={loadClientsData} 
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
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2 mb-2">
            <Users className="h-5 w-5 sm:h-6 sm:w-6" />
            Mis Usuarios
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            {clients.length} usuario{clients.length !== 1 ? 's' : ''} asignado{clients.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Búsqueda */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar usuarios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-12 text-base bg-white shadow-sm"
          />
        </div>

        {/* Lista de usuarios */}
        {filteredClients.length === 0 ? (
          <Card className="bg-white shadow-sm">
            <CardContent className="p-6 sm:p-8">
              <div className="text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm ? 'No se encontraron usuarios' : 'No hay usuarios asignados'}
                </h3>
                <p className="text-gray-600 text-sm sm:text-base">
                  {searchTerm 
                    ? 'Intenta con otros términos de búsqueda'
                    : 'Aún no tienes usuarios asignados en el sistema'
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredClients.map((client) => {
              const nextAssignment = getNextAssignment(client.id);
              const totalAssignments = getClientAssignments(client.id).length;
              
              return (
                <Card key={client.id} className="bg-white shadow-sm hover:shadow-md transition-all duration-200 active:scale-[0.98]">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg sm:text-xl font-semibold truncate">{client.full_name}</CardTitle>
                        <CardDescription className="space-y-1 mt-2">
                          {client.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 flex-shrink-0" />
                              <span className="text-sm">{client.phone}</span>
                            </div>
                          )}
                          {client.address && (
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 flex-shrink-0" />
                              <span className="text-sm line-clamp-2">{client.address}</span>
                            </div>
                          )}
                        </CardDescription>
                      </div>
                      <Badge variant="secondary" className="flex-shrink-0">
                        {totalAssignments} visita{totalAssignments !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {/* Próxima cita */}
                    {nextAssignment && (
                      <div className="bg-blue-50 rounded-lg p-3 mb-4">
                        <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Próxima visita
                        </h4>
                        <div className="space-y-2">
                          <div className="text-sm text-blue-700">
                            {format(new Date(nextAssignment.scheduled_date), 'EEEE, d MMMM', { locale: es })}
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1 text-sm text-blue-700">
                              <Clock className="h-3 w-3" />
                              {nextAssignment.start_time} - {nextAssignment.end_time}
                            </span>
                            <Badge 
                              variant={nextAssignment.status === 'completed' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {nextAssignment.status === 'completed' ? 'Completada' : 
                               nextAssignment.status === 'in_progress' ? 'En progreso' : 'Pendiente'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Notas médicas */}
                    {client.medical_notes && (
                      <div className="bg-yellow-50 rounded-lg p-3 mb-3">
                        <h4 className="font-medium text-yellow-900 mb-1 text-sm">Notas médicas</h4>
                        <p className="text-sm text-yellow-700 leading-relaxed">{client.medical_notes}</p>
                      </div>
                    )}

                    {/* Contacto de emergencia */}
                    {client.emergency_contact && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <h4 className="font-medium text-gray-900 mb-1 text-sm">Contacto de emergencia</h4>
                        <p className="text-sm text-gray-700">{client.emergency_contact}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};