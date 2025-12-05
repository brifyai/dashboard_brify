import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { useNotifications } from '../hooks/useNotifications';

function SweetNotifications() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [lastNotificationCount, setLastNotificationCount] = useState(0);

  useEffect(() => {
    // Verificar si hay nuevas notificaciones
    if (unreadCount > lastNotificationCount && lastNotificationCount > 0) {
      // Mostrar SweetAlert para nuevas notificaciones
      const newNotifications = unreadCount - lastNotificationCount;
      showNewNotificationsAlert(newNotifications);
    }
    setLastNotificationCount(unreadCount);
  }, [unreadCount, lastNotificationCount]);

  const showNewNotificationsAlert = (count) => {
    Swal.fire({
      title: '🔔 Nuevas Notificaciones',
      text: `Tienes ${count} nueva${count > 1 ? 's' : ''} notificación${count > 1 ? 'es' : ''}`,
      icon: 'info',
      timer: 4000,
      timerProgressBar: true,
      showConfirmButton: false,
      toast: true,
      position: 'top-end',
      customClass: {
        popup: 'sweetalert2-popup'
      }
    });
  };

  const showAllNotifications = async () => {
    if (notifications.length === 0) {
      Swal.fire({
        title: '📭 Sin Notificaciones',
        text: 'No tienes notificaciones en este momento',
        icon: 'info',
        confirmButtonText: 'Cerrar',
        customClass: {
          popup: 'sweetalert2-popup'
        }
      });
      return;
    }

    // Crear HTML para mostrar todas las notificaciones
    const notificationsHtml = notifications.map(notification => {
      const icon = getNotificationIcon(notification.type);
      const priorityColor = getPriorityColor(notification.priority);
      const isReadClass = notification.is_read ? 'opacity-60' : '';
      
      return `
        <div class="notification-item ${isReadClass}" style="
          padding: 15px; 
          margin: 10px 0; 
          border-left: 4px solid ${priorityColor}; 
          background: ${notification.is_read ? '#f8f9fa' : '#e3f2fd'};
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
        " onclick="markAsRead('${notification.id}')">
          <div style="display: flex; align-items: center; margin-bottom: 8px;">
            <span style="font-size: 18px; margin-right: 10px;">${icon}</span>
            <strong style="color: #333;">${notification.title}</strong>
            <span style="
              background: ${priorityColor}; 
              color: white; 
              padding: 2px 8px; 
              border-radius: 12px; 
              font-size: 11px; 
              margin-left: auto;
              text-transform: uppercase;
            ">${notification.priority}</span>
          </div>
          <p style="margin: 0; color: #666; font-size: 14px;">${notification.message}</p>
          <div style="margin-top: 8px; font-size: 12px; color: #999;">
            ${formatDate(notification.created_at)} • ${notification.category}
          </div>
        </div>
      `;
    }).join('');

    // Mostrar modal con SweetAlert2
    const { value: result } = await Swal.fire({
      title: '🔔 Notificaciones',
      html: `
        <div style="max-height: 400px; overflow-y: auto;">
          ${notificationsHtml}
        </div>
        <div style="margin-top: 20px; text-align: center;">
          <button id="markAllRead" style="
            background: #4CAF50; 
            color: white; 
            border: none; 
            padding: 10px 20px; 
            border-radius: 5px; 
            cursor: pointer;
            margin-right: 10px;
          ">Marcar todas como leídas</button>
        </div>
      `,
      width: '600px',
      showConfirmButton: false,
      showCloseButton: true,
      customClass: {
        popup: 'sweetalert2-popup-large'
      },
      didOpen: () => {
        // Agregar event listener para el botón "Marcar todas"
        const markAllBtn = document.getElementById('markAllRead');
        if (markAllBtn) {
          markAllBtn.addEventListener('click', async () => {
            await markAllAsRead();
            Swal.fire({
              title: '✅ Notificaciones',
              text: 'Todas las notificaciones han sido marcadas como leídas',
              icon: 'success',
              timer: 2000,
              showConfirmButton: false
            });
          });
        }
      }
    });

    // Función global para marcar como leída (se ejecuta desde el onclick del HTML)
    window.markAsRead = async (notificationId) => {
      await markAsRead(notificationId);
      // Recargar el modal para mostrar los cambios
      showAllNotifications();
    };
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return 'ℹ️';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return '#f44336';
      case 'high': return '#ff9800';
      case 'normal': return '#2196f3';
      case 'low': return '#9e9e9e';
      default: return '#2196f3';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Hace unos minutos';
    } else if (diffInHours < 24) {
      return `Hace ${diffInHours}h`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `Hace ${diffInDays}d`;
    }
  };

  // Función para mostrar notificación rápida
  const showQuickNotification = (notification) => {
    const icon = getNotificationIcon(notification.type);
    const timer = notification.priority === 'urgent' ? 8000 : 
                  notification.priority === 'high' ? 6000 : 4000;

    Swal.fire({
      title: `${icon} ${notification.title}`,
      text: notification.message,
      icon: notification.type === 'success' ? 'success' : 
            notification.type === 'error' ? 'error' : 
            notification.type === 'warning' ? 'warning' : 'info',
      timer: timer,
      timerProgressBar: true,
      showConfirmButton: false,
      toast: true,
      position: 'top-end',
      customClass: {
        popup: 'sweetalert2-popup'
      }
    });
  };

  // Exponer funciones globalmente para uso en otros componentes
  React.useEffect(() => {
    window.showSweetNotification = showQuickNotification;
    window.showAllNotifications = showAllNotifications;
    
    return () => {
      delete window.showSweetNotification;
      delete window.showAllNotifications;
    };
  }, [notifications]);

  return null; // Este componente no renderiza nada
}

export default SweetNotifications;