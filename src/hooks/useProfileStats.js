import { useState, useEffect } from 'react';
import { supabaseProfile } from '../config/supabaseProfile';

export const useProfileStats = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    usersLast30Days: 0,
    usersLast7Days: 0,
    usersToday: 0,
    totalTokens: 0,
    plansDistribution: {},
    recentRegistrations: [],
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStats(prev => ({ ...prev, loading: true, error: null }));

        // Obtener fecha actual y fechas de referencia
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const last7Days = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        const last30Days = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

        // Consulta para obtener todos los usuarios con sus fechas
        const { data: users, error: usersError } = await supabaseProfile
          .from('users')
          .select('id, email, created_at, plan, tokens_consumed, status')
          .order('created_at', { ascending: false });

        if (usersError) {
          throw new Error(`Error al obtener usuarios: ${usersError.message}`);
        }

        if (!users) {
          throw new Error('No se pudieron obtener los datos de usuarios');
        }

        // Procesar estadísticas
        const totalUsers = users.length;
        
        // Filtrar usuarios por fecha de registro
        const usersToday = users.filter(user => {
          const userDate = new Date(user.created_at);
          return userDate >= today;
        }).length;

        const usersLast7Days = users.filter(user => {
          const userDate = new Date(user.created_at);
          return userDate >= last7Days;
        }).length;

        const usersLast30Days = users.filter(user => {
          const userDate = new Date(user.created_at);
          return userDate >= last30Days;
        }).length;

        // Calcular tokens totales consumidos
        const totalTokens = users.reduce((sum, user) => {
          return sum + (user.tokens_consumed || 0);
        }, 0);

        // Distribución de planes
        const plansDistribution = users.reduce((acc, user) => {
          const plan = user.plan || 'Sin Plan';
          acc[plan] = (acc[plan] || 0) + 1;
          return acc;
        }, {});

        // Registros recientes (últimos 10)
        const recentRegistrations = users.slice(0, 10).map(user => ({
          id: user.id,
          email: user.email,
          created_at: user.created_at,
          plan: user.plan || 'Sin Plan',
          status: user.status || 'active'
        }));

        setStats({
          totalUsers,
          usersLast30Days,
          usersLast7Days,
          usersToday,
          totalTokens,
          plansDistribution,
          recentRegistrations,
          loading: false,
          error: null
        });

      } catch (error) {
        console.error('❌ Error al obtener estadísticas:', error);
        setStats(prev => ({
          ...prev,
          loading: false,
          error: error.message
        }));
      }
    };

    fetchStats();
  }, []);

  return stats;
};

// Hook para obtener estadísticas específicas por período
export const useStatsByPeriod = (period = '30days') => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPeriodStats = async () => {
      try {
        setLoading(true);
        setError(null);

        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        let startDate;
        switch (period) {
          case 'today':
            startDate = today;
            break;
          case '7days':
            startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case '30days':
            startDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
          case '90days':
            startDate = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);
            break;
          default:
            startDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        }

        const { data: users, error: usersError } = await supabaseProfile
          .from('users')
          .select('id, email, created_at, plan')
          .gte('created_at', startDate.toISOString())
          .order('created_at', { ascending: false });

        if (usersError) {
          throw new Error(`Error al obtener datos del período: ${usersError.message}`);
        }

        // Agrupar por día para gráficos
        const groupedData = users.reduce((acc, user) => {
          const date = new Date(user.created_at).toISOString().split('T')[0];
          if (!acc[date]) {
            acc[date] = { date, count: 0, users: [] };
          }
          acc[date].count++;
          acc[date].users.push(user);
          return acc;
        }, {});

        setData(Object.values(groupedData));
        setLoading(false);

      } catch (error) {
        console.error('❌ Error al obtener estadísticas por período:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchPeriodStats();
  }, [period]);

  return { data, loading, error };
};