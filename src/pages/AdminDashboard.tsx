import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Shield, Users, Activity, AlertTriangle, TrendingUp } from 'lucide-react';
import { MetricCard } from '@/components/shared/MetricCard';

interface SystemStats {
    totalUsers: number;
    totalPatients: number;
    totalDoctors: number;
    totalAdmins: number;
    activeToday: number;
    highRiskPatients: number;
}

export function AdminDashboard() {
    const { profile } = useAuth();
    const [stats, setStats] = useState<SystemStats>({
        totalUsers: 0,
        totalPatients: 0,
        totalDoctors: 0,
        totalAdmins: 0,
        activeToday: 0,
        highRiskPatients: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (profile?.role === 'admin') {
            fetchSystemStats();
        }
    }, [profile]);

    const fetchSystemStats = async () => {
        try {
            // Total users by role
            const { data: profiles } = await supabase
                .from('profiles')
                .select('role');

            const totalUsers = profiles?.length || 0;
            const totalPatients = profiles?.filter(p => p.role === 'patient').length || 0;
            const totalDoctors = profiles?.filter(p => p.role === 'doctor').length || 0;
            const totalAdmins = profiles?.filter(p => p.role === 'admin').length || 0;

            // High risk patients (suicide risk > 5)
            const { data: highRisk } = await supabase
                .from('daily_metrics_mental')
                .select('patient_id')
                .gt('suicide_risk', 5)
                .order('date', { ascending: false });

            const uniqueHighRisk = new Set(highRisk?.map(r => r.patient_id)).size;

            // Active today (check-ins today)
            const today = new Date().toISOString().split('T')[0];
            const { data: activePhysical } = await supabase
                .from('daily_metrics_physical')
                .select('patient_id')
                .eq('date', today);

            const activeToday = new Set(activePhysical?.map(a => a.patient_id)).size;

            setStats({
                totalUsers,
                totalPatients,
                totalDoctors,
                totalAdmins,
                activeToday,
                highRiskPatients: uniqueHighRisk,
            });
        } catch (error) {
            console.error('Error fetching system stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="text-center py-12">Carregando estatísticas...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                    <Shield className="text-primary-600" size={36} />
                    Painel Administrativo
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                    Visão geral do sistema SynthonIA
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <MetricCard
                    title="Total de Usuários"
                    value={stats.totalUsers}
                    icon={Users}
                    trend="neutral"
                />
                <MetricCard
                    title="Pacientes"
                    value={stats.totalPatients}
                    icon={Users}
                    trend="neutral"
                />
                <MetricCard
                    title="Médicos"
                    value={stats.totalDoctors}
                    icon={Users}
                    trend="neutral"
                />
                <MetricCard
                    title="Administradores"
                    value={stats.totalAdmins}
                    icon={Shield}
                    trend="neutral"
                />
                <MetricCard
                    title="Ativos Hoje"
                    value={stats.activeToday}
                    icon={Activity}
                    trend="up"
                />
                <MetricCard
                    title="Alto Risco"
                    value={stats.highRiskPatients}
                    icon={AlertTriangle}
                    trend="down"
                    className="border-red-200 dark:border-red-800"
                />
            </div>

            {/* Quick Actions */}
            <div className="card">
                <h2 className="text-xl font-bold mb-4">Ações Rápidas</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <button
                        onClick={() => window.location.href = '/admin/users'}
                        className="btn-secondary flex items-center justify-center gap-2"
                    >
                        <Users size={20} />
                        Gerenciar Usuários
                    </button>
                    <button
                        onClick={() => window.location.href = '/admin/statistics'}
                        className="btn-secondary flex items-center justify-center gap-2"
                    >
                        <TrendingUp size={20} />
                        Estatísticas Científicas
                    </button>
                </div>
            </div>

            {/* System Info */}
            <div className="card bg-gradient-to-br from-primary-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20">
                <h2 className="text-lg font-bold mb-2">ℹ️ Informações do Sistema</h2>
                <div className="text-sm space-y-1 text-slate-700 dark:text-slate-300">
                    <p><strong>Versão:</strong> 1.0.0</p>
                    <p><strong>Ambiente:</strong> Produção</p>
                    <p><strong>Última atualização:</strong> {new Date().toLocaleDateString('pt-BR')}</p>
                </div>
            </div>
        </div>
    );
}
