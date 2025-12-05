// Notificaciones de ejemplo que se mostrarán en el sistema
export const sampleNotifications = [
  {
    id: '1',
    title: '🎉 Bienvenido al Dashboard CRM',
    message: 'Tu cuenta ha sido configurada exitosamente. Ya puedes comenzar a gestionar usuarios y pagos.',
    type: 'success',
    priority: 'normal',
    category: 'sistema',
    is_read: false,
    created_at: '2025-12-04T18:00:00Z'
  },
  {
    id: '2', 
    title: 'Nuevo Usuario Registrado',
    message: 'María González se ha registrado en la plataforma. Revisa su perfil para completar el onboarding.',
    type: 'info',
    priority: 'high',
    category: 'usuarios',
    is_read: false,
    created_at: '2025-12-04T17:30:00Z'
  },
  {
    id: '3',
    title: 'Pago Recibido',
    message: 'Pago de $45.990 CLP recibido de Carlos Silva para Plan Brify.',
    type: 'success',
    priority: 'normal',
    category: 'pagos',
    is_read: true,
    created_at: '2025-12-04T17:00:00Z'
  },
  {
    id: '4',
    title: '⚠️ Onboarding Pendiente',
    message: '3 usuarios tienen el onboarding pendiente. Revisa la sección de Onboarding para completar el proceso.',
    type: 'warning',
    priority: 'high',
    category: 'onboarding',
    is_read: false,
    created_at: '2025-12-04T16:45:00Z'
  },
  {
    id: '5',
    title: '📊 Reporte Semanal Generado',
    message: 'El reporte de estadísticas semanales está listo. Descárgalo desde la sección de Reportes.',
    type: 'info',
    priority: 'normal',
    category: 'reportes',
    is_read: true,
    created_at: '2025-12-04T16:00:00Z'
  },
  {
    id: '6',
    title: '🔒 Actualización de Seguridad',
    message: 'Se ha aplicado una actualización de seguridad. Tu cuenta está protegida con las últimas medidas.',
    type: 'info',
    priority: 'low',
    category: 'seguridad',
    is_read: true,
    created_at: '2025-12-04T15:30:00Z'
  },
  {
    id: '7',
    title: '📧 Email de Confirmación Enviado',
    message: 'Se envió un email de confirmación a ana.martinez@email.com para completar el registro.',
    type: 'info',
    priority: 'normal',
    category: 'emails',
    is_read: false,
    created_at: '2025-12-04T15:00:00Z'
  },
  {
    id: '8',
    title: '💰 Plan Actualizado',
    message: 'El plan "Plan Brify" ha sido actualizado con nuevas funcionalidades.',
    type: 'success',
    priority: 'normal',
    category: 'planes',
    is_read: true,
    created_at: '2025-12-04T14:30:00Z'
  },
  {
    id: '9',
    title: '🚨 Error en Sincronización',
    message: 'Se detectó un error menor en la sincronización de datos. El sistema se ha auto-recuperado.',
    type: 'error',
    priority: 'high',
    category: 'sistema',
    is_read: false,
    created_at: '2025-12-04T14:00:00Z'
  },
  {
    id: '10',
    title: '📈 Crecimiento de Usuarios',
    message: '¡Excelente! Has alcanzado 16 usuarios registrados este mes. Meta: 20 usuarios.',
    type: 'success',
    priority: 'normal',
    category: 'estadisticas',
    is_read: true,
    created_at: '2025-12-04T13:30:00Z'
  }
];

// Categorías de notificaciones
export const notificationCategories = {
  sistema: '🔧 Sistema',
  usuarios: 'Usuarios', 
  pagos: 'Pagos',
  onboarding: 'Onboarding',
  reportes: '📊 Reportes',
  seguridad: '🔒 Seguridad',
  emails: '📧 Emails',
  planes: '📋 Planes',
  estadisticas: '📈 Estadísticas'
};

// Tipos de notificaciones
export const notificationTypes = {
  success: { icon: '✅', color: 'green' },
  warning: { icon: '⚠️', color: 'orange' },
  error: { icon: '❌', color: 'red' },
  info: { icon: 'ℹ️', color: 'blue' }
};

// Prioridades de notificaciones
export const notificationPriorities = {
  urgent: { color: 'red', label: 'Urgente' },
  high: { color: 'orange', label: 'Alta' },
  normal: { color: 'blue', label: 'Normal' },
  low: { color: 'gray', label: 'Baja' }
};