import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { useToast } from '@chakra-ui/react';
import { sampleNotifications } from '../data/sampleNotifications';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const toast = useToast();

  // Cargar notificaciones
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.warn('Error connecting to notifications table, using sample notifications:', error.message);
        // Usar notificaciones de ejemplo como fallback
        setNotifications(sampleNotifications);
        setUnreadCount(sampleNotifications.filter(n => !n.is_read).length);
        return;
      }

      // Si no hay notificaciones en la base de datos, usar las de ejemplo
      if (!data || data.length === 0) {
        console.log('No notifications found in database, using sample notifications');
        setNotifications(sampleNotifications);
        setUnreadCount(sampleNotifications.filter(n => !n.is_read).length);
      } else {
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.is_read).length);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // En caso de error, usar notificaciones de ejemplo
      console.log('Using sample notifications due to error');
      setNotifications(sampleNotifications);
      setUnreadCount(sampleNotifications.filter(n => !n.is_read).length);
      
      toast({
        title: 'Modo Demo',
        description: 'Mostrando notificaciones de ejemplo. Conecta la base de datos para notificaciones reales.',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Marcar notificación como leída
  const markAsRead = async (notificationId) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;

      // Actualizar estado local
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Marcar todas como leídas
  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('is_read', false);

      if (error) throw error;

      // Actualizar estado local
      setNotifications(prev => 
        prev.map(n => ({ ...n, is_read: true }))
      );
      setUnreadCount(0);

      toast({
        title: 'Notificaciones',
        description: 'Todas las notificaciones han sido marcadas como leídas',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Crear nueva notificación
  const createNotification = async (notification) => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert([{
          ...notification,
          created_at: new Date().toISOString(),
        }])
        .select()
        .single();

      if (error) throw error;

      // Actualizar estado local
      setNotifications(prev => [data, ...prev]);
      if (!data.is_read) {
        setUnreadCount(prev => prev + 1);
      }

      return data;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  };

  // Eliminar notificación
  const deleteNotification = async (notificationId) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;

      // Actualizar estado local
      const notification = notifications.find(n => n.id === notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      
      if (notification && !notification.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Obtener notificaciones por categoría
  const getNotificationsByCategory = (category) => {
    return notifications.filter(n => n.category === category);
  };

  // Obtener notificaciones por prioridad
  const getNotificationsByPriority = (priority) => {
    return notifications.filter(n => n.priority === priority);
  };

  useEffect(() => {
    fetchNotifications();

    // Configurar suscripción en tiempo real
    const subscription = supabase
      .channel('notifications')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'notifications' },
        (payload) => {
          console.log('Change received!', payload);
          fetchNotifications(); // Recargar notificaciones cuando hay cambios
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    notifications,
    loading,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    createNotification,
    deleteNotification,
    getNotificationsByCategory,
    getNotificationsByPriority,
  };
};