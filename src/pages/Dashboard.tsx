import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import {
    DailyMetricsPhysical,
    DailyMetricsMental,
    TrainingSession,
    MentalHealthAlert
} from '@/types';
import {
    calculateReadinessIndex,
    calculateACWR,
    generateMentalHealthAlerts,
    calculateNumerology
} from '@/utils/calculations';
import { MetricCard } from '@/components/shared/MetricCard';
import { AlertCard } from '@/components/shared/AlertCard';
import { Activity, Brain, Dumbbell, TrendingUp, Sparkles } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function Dashboard() {
    const { profile } = useAuth();
    const [physicalMetrics, setPhysicalMetrics] = useState<DailyMetricsPhysical | null>(null);
    const [mentalMetrics, setMentalMetrics] = useState<DailyMetricsMental | null>(null);
    const [trainingSessions, setTrainingSessions] = useState<TrainingSession[]>([]);
    const [alerts, setAlerts] = useState<MentalHealthAlert[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (profile) {
            fetchTodayMetrics();
            fetchTrainingSessions();
        }
    }, [profile]);

    const fetchTodayMetrics = async () => {
        if (!profile) return;

        try {
            const today = format(new Date(), 'yyyy-MM-dd');

            // Fetch physical metrics
            const { data: physical } = await supabase
                .from('daily_metrics_physical')
                .select('*')
                .eq('patient_id', profile.id)
                .eq('date', today)
                .single();

            // Fetch mental metrics
            const { data: mental } = await supabase
                .from('daily_metrics_mental')
                .select('*')
                .eq('patient_id', profile.id)
                .eq('date', today)
                .single();

            setPhysicalMetrics(physical);
            setMentalMetrics(mental);

            if (mental) {
                const mentalAlerts = generateMentalHealthAlerts(mental);
                setAlerts(mentalAlerts);
            }
        } catch (error) {
            console.error('Error fetching metrics:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchTrainingSessions = async () => {
        if (!profile) return;

        try {
            const thirtyDaysAgo = format(subDays(new Date(), 30), 'yyyy-MM-dd');

            const { data } = await supabase
                .from('training_sessions')
                .select('*')
                .eq('patient_id', profile.id)
                .gte('date', thirtyDaysAgo)
                .order('date', { ascending: true });

            setTrainingSessions(data || []);
        } catch (error) {
            console.error('Error fetching training sessions:', error);
        }
    };

    // Calculate readiness
    const readiness = physicalMetrics
        ? calculateReadinessIndex({
            sleepQuality: physicalMetrics.sleep_quality,
            fatiguePhysical: physicalMetrics.fatigue_physical,
            stressMental: physicalMetrics.stress_mental,
            domsPain: physicalMetrics.doms_pain,
            moodGeneral: physicalMetrics.mood_general,
            readinessToTrain: physicalMetrics.readiness_to_train,
        })
        : null;

    // Calculate ACWR
    const acwr = trainingSessions.length > 0 ? calculateACWR(trainingSessions) : null;

    // Numerology
    const numerology = profile ? calculateNumerology(profile.full_name) : null;

    // Prepare chart data
    const chartData = trainingSessions.slice(-14).map((session) => ({
        date: format(new Date(session.date), 'dd/MM', { locale: ptBR }),
        load: session.internal_load || 0,
    }));

    const getReadinessColor = (value: number | null) => {
        if (!value) return 'primary';
        if (value >= 7) return 'success';
        if (value >= 5) return 'warning';
        return 'danger';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-slate-600 dark:text-slate-400">Carregando...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
                <p className="text-slate-600 dark:text-slate-400">
                    Bem-vindo, {profile?.full_name}
                </p>
            </div>

            {/* Alerts Section */}
            {alerts.length > 0 && (
                <div className="space-y-3">
                    <h2 className="text-xl font-semibold">Alertas</h2>
                    {alerts.map((alert, index) => (
                        <AlertCard
                            key={index}
                            type={alert.severity === 'critical' || alert.severity === 'high' ? 'danger' : 'warning'}
                            message={alert.message}
                            value={alert.value}
                        />
                    ))}
                </div>
            )}

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                    title="Prontidão para Treinar"
                    value={readiness !== null ? `${readiness}/10` : 'N/A'}
                    subtitle={readiness !== null && readiness >= 7 ? 'Pronto!' : readiness !== null && readiness >= 5 ? 'Moderado' : 'Descanse'}
                    icon={Activity}
                    color={getReadinessColor(readiness)}
                />

                <MetricCard
                    title="TSB (Forma)"
                    value={acwr ? acwr.tsb : 'N/A'}
                    subtitle="Training Stress Balance"
                    icon={TrendingUp}
                    color={acwr && acwr.tsb > 0 ? 'success' : acwr && acwr.tsb < -10 ? 'danger' : 'warning'}
                />

                <MetricCard
                    title="Humor Geral"
                    value={physicalMetrics?.mood_general ? `${physicalMetrics.mood_general}/10` : 'N/A'}
                    subtitle="Hoje"
                    icon={Brain}
                    color="primary"
                />

                <MetricCard
                    title="Carga Semanal"
                    value={acwr ? acwr.atl : 'N/A'}
                    subtitle="Acute Training Load"
                    icon={Dumbbell}
                    color="primary"
                />
            </div>

            {/* Numerology Card */}
            {numerology && (
                <div className="card bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800">
                    <div className="flex items-start gap-3">
                        <Sparkles className="text-purple-600 dark:text-purple-400" size={24} />
                        <div>
                            <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-1">
                                Numerologia
                            </h3>
                            <p className="text-sm text-purple-700 dark:text-purple-300">
                                Número do Destino: {numerology.destinyNumber} | Número da Alma: {numerology.soulNumber}
                            </p>
                            <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                                {numerology.interpretation}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Training Load Chart */}
            {chartData.length > 0 && (
                <div className="card">
                    <h3 className="text-lg font-semibold mb-4">Carga de Treino (Últimos 14 dias)</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                            <XAxis
                                dataKey="date"
                                className="text-xs"
                                stroke="currentColor"
                            />
                            <YAxis
                                className="text-xs"
                                stroke="currentColor"
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'var(--tooltip-bg)',
                                    border: '1px solid var(--tooltip-border)',
                                    borderRadius: '8px'
                                }}
                            />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="load"
                                stroke="#0ea5e9"
                                strokeWidth={2}
                                name="Carga Interna"
                                dot={{ fill: '#0ea5e9' }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Quick Actions */}
            {!physicalMetrics && !mentalMetrics && (
                <div className="card bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800">
                    <h3 className="font-semibold text-primary-900 dark:text-primary-100 mb-2">
                        Você ainda não fez o check-in de hoje
                    </h3>
                    <p className="text-sm text-primary-700 dark:text-primary-300 mb-4">
                        Registre suas métricas diárias para acompanhar seu progresso
                    </p>
                    <a href="/check-in" className="btn-primary inline-block">
                        Fazer Check-in Agora
                    </a>
                </div>
            )}
        </div>
    );
}
