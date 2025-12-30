import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Download } from 'lucide-react';

interface AggregatedStats {
    phq9Distribution: { range: string; count: number }[];
    gad7Distribution: { range: string; count: number }[];
    averageScores: {
        phq9: number;
        gad7: number;
        suicideRisk: number;
    };
    totalAssessments: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export function ScientificStats() {
    const { profile } = useAuth();
    const [stats, setStats] = useState<AggregatedStats>({
        phq9Distribution: [],
        gad7Distribution: [],
        averageScores: { phq9: 0, gad7: 0, suicideRisk: 0 },
        totalAssessments: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (profile?.role === 'doctor' || profile?.role === 'admin') {
            fetchStatistics();
        }
    }, [profile]);

    const fetchStatistics = async () => {
        try {
            // Fetch all clinical assessments
            const { data: assessments } = await supabase
                .from('clinical_assessments')
                .select('type, total_score');

            // Fetch mental metrics for suicide risk
            const { data: mentalMetrics } = await supabase
                .from('daily_metrics_mental')
                .select('suicide_risk, depression_mood, anxiety');

            // Process PHQ-9 distribution
            const phq9Scores = assessments?.filter(a => a.type === 'PHQ9').map(a => a.total_score) || [];
            const phq9Dist = [
                { range: 'Mínima (0-4)', count: phq9Scores.filter(s => s >= 0 && s <= 4).length },
                { range: 'Leve (5-9)', count: phq9Scores.filter(s => s >= 5 && s <= 9).length },
                { range: 'Moderada (10-14)', count: phq9Scores.filter(s => s >= 10 && s <= 14).length },
                { range: 'Mod. Grave (15-19)', count: phq9Scores.filter(s => s >= 15 && s <= 19).length },
                { range: 'Grave (20+)', count: phq9Scores.filter(s => s >= 20).length },
            ];

            // Process GAD-7 distribution
            const gad7Scores = assessments?.filter(a => a.type === 'GAD7').map(a => a.total_score) || [];
            const gad7Dist = [
                { range: 'Mínima (0-4)', count: gad7Scores.filter(s => s >= 0 && s <= 4).length },
                { range: 'Leve (5-9)', count: gad7Scores.filter(s => s >= 5 && s <= 9).length },
                { range: 'Moderada (10-14)', count: gad7Scores.filter(s => s >= 10 && s <= 14).length },
                { range: 'Grave (15+)', count: gad7Scores.filter(s => s >= 15).length },
            ];

            // Calculate averages
            const avgPHQ9 = phq9Scores.length > 0
                ? phq9Scores.reduce((a, b) => a + b, 0) / phq9Scores.length
                : 0;

            const avgGAD7 = gad7Scores.length > 0
                ? gad7Scores.reduce((a, b) => a + b, 0) / gad7Scores.length
                : 0;

            const suicideRisks = mentalMetrics?.map(m => m.suicide_risk).filter(r => r != null) || [];
            const avgSuicideRisk = suicideRisks.length > 0
                ? suicideRisks.reduce((a, b) => a + b, 0) / suicideRisks.length
                : 0;

            setStats({
                phq9Distribution: phq9Dist,
                gad7Distribution: gad7Dist,
                averageScores: {
                    phq9: Math.round(avgPHQ9 * 10) / 10,
                    gad7: Math.round(avgGAD7 * 10) / 10,
                    suicideRisk: Math.round(avgSuicideRisk * 10) / 10,
                },
                totalAssessments: assessments?.length || 0,
            });
        } catch (error) {
            console.error('Error fetching statistics:', error);
        } finally {
            setLoading(false);
        }
    };

    const exportData = () => {
        const csvContent = `Estatísticas SynthonIA - ${new Date().toLocaleDateString('pt-BR')}\n\n` +
            `Total de Questionários: ${stats.totalAssessments}\n` +
            `Média PHQ-9: ${stats.averageScores.phq9}\n` +
            `Média GAD-7: ${stats.averageScores.gad7}\n` +
            `Média Risco Suicídio: ${stats.averageScores.suicideRisk}\n\n` +
            `Distribuição PHQ-9:\n` +
            stats.phq9Distribution.map(d => `${d.range}: ${d.count}`).join('\n') + '\n\n' +
            `Distribuição GAD-7:\n` +
            stats.gad7Distribution.map(d => `${d.range}: ${d.count}`).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `synthonia-stats-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    if (loading) {
        return <div className="text-center py-12">Carregando estatísticas...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                        <TrendingUp className="text-primary-600" size={36} />
                        Estatísticas Científicas
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">
                        Análise agregada dos dados dos pacientes
                    </p>
                </div>
                <button
                    onClick={exportData}
                    className="btn-primary flex items-center gap-2"
                >
                    <Download size={20} />
                    Exportar Dados
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="card text-center">
                    <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Total de Questionários</div>
                    <div className="text-3xl font-bold text-primary-600">{stats.totalAssessments}</div>
                </div>
                <div className="card text-center">
                    <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Média PHQ-9</div>
                    <div className="text-3xl font-bold text-blue-600">{stats.averageScores.phq9}</div>
                </div>
                <div className="card text-center">
                    <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Média GAD-7</div>
                    <div className="text-3xl font-bold text-green-600">{stats.averageScores.gad7}</div>
                </div>
                <div className="card text-center">
                    <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Média Risco Suicídio</div>
                    <div className="text-3xl font-bold text-red-600">{stats.averageScores.suicideRisk}</div>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* PHQ-9 Distribution */}
                <div className="card">
                    <h2 className="text-xl font-bold mb-4">Distribuição PHQ-9 (Depressão)</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={stats.phq9Distribution}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="range" angle={-45} textAnchor="end" height={100} />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="count" fill="#3b82f6" name="Pacientes" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* GAD-7 Distribution */}
                <div className="card">
                    <h2 className="text-xl font-bold mb-4">Distribuição GAD-7 (Ansiedade)</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={stats.gad7Distribution}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="range" angle={-45} textAnchor="end" height={100} />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="count" fill="#10b981" name="Pacientes" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Notes */}
            <div className="card bg-blue-50 dark:bg-blue-900/20">
                <h3 className="font-bold mb-2">📊 Notas Metodológicas</h3>
                <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1 list-disc list-inside">
                    <li>Dados agregados e anonimizados de todos os pacientes</li>
                    <li>PHQ-9: Patient Health Questionnaire (0-27 pontos)</li>
                    <li>GAD-7: Generalized Anxiety Disorder (0-21 pontos)</li>
                    <li>Risco de Suicídio: Escala 0-10 (auto-relatado)</li>
                    <li>Dados atualizados em tempo real</li>
                </ul>
            </div>
        </div>
    );
}
