import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { PatientSummary } from '@/types';
import { calculatePatientRiskScore, generateMentalHealthAlerts } from '@/utils/calculations';
import { Users, Search, AlertTriangle, TrendingUp } from 'lucide-react';

export function DoctorDashboard() {
    const { profile } = useAuth();
    const navigate = useNavigate();
    const [patients, setPatients] = useState<PatientSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRisk, setFilterRisk] = useState<'all' | 'high' | 'medium'>('all');

    useEffect(() => {
        if (profile?.role === 'doctor') {
            fetchPatients();
        }
    }, [profile]);

    const fetchPatients = async () => {
        if (!profile) return;

        try {
            // Fetch patients linked to this doctor
            const { data: patientProfiles, error: profilesError } = await supabase
                .from('profiles')
                .select('*')
                .eq('doctor_id', profile.id)
                .order('full_name');

            if (profilesError) throw profilesError;

            // Fetch latest metrics for each patient
            const patientSummaries: PatientSummary[] = await Promise.all(
                (patientProfiles || []).map(async (patient) => {
                    // Get latest physical metrics
                    const { data: physical } = await supabase
                        .from('daily_metrics_physical')
                        .select('*')
                        .eq('patient_id', patient.id)
                        .order('date', { ascending: false })
                        .limit(1)
                        .single();

                    // Get latest mental metrics
                    const { data: mental } = await supabase
                        .from('daily_metrics_mental')
                        .select('*')
                        .eq('patient_id', patient.id)
                        .order('date', { ascending: false })
                        .limit(1)
                        .single();

                    // Get latest assessments
                    const { data: assessments } = await supabase
                        .from('clinical_assessments')
                        .select('*')
                        .eq('patient_id', patient.id)
                        .order('date', { ascending: false })
                        .limit(5);

                    const alerts = mental ? generateMentalHealthAlerts(mental) : [];
                    const riskScore = calculatePatientRiskScore(mental || undefined, assessments || undefined);

                    return {
                        profile: patient,
                        latestMetrics: {
                            physical: physical || undefined,
                            mental: mental || undefined,
                        },
                        alerts,
                        riskScore,
                    };
                })
            );

            // Sort by risk score (highest first)
            patientSummaries.sort((a, b) => b.riskScore - a.riskScore);
            setPatients(patientSummaries);
        } catch (error) {
            console.error('Error fetching patients:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredPatients = patients.filter((patient) => {
        const matchesSearch = patient.profile.full_name
            .toLowerCase()
            .includes(searchTerm.toLowerCase());

        const matchesRisk =
            filterRisk === 'all' ||
            (filterRisk === 'high' && patient.riskScore >= 50) ||
            (filterRisk === 'medium' && patient.riskScore >= 20 && patient.riskScore < 50);

        return matchesSearch && matchesRisk;
    });

    const getRiskColor = (score: number) => {
        if (score >= 50) return 'text-red-600 bg-red-50 dark:bg-red-900/20';
        if (score >= 20) return 'text-orange-600 bg-orange-50 dark:bg-orange-900/20';
        return 'text-green-600 bg-green-50 dark:bg-green-900/20';
    };

    const getRiskLabel = (score: number) => {
        if (score >= 50) return 'Alto Risco';
        if (score >= 20) return 'Risco Moderado';
        return 'Baixo Risco';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-slate-600 dark:text-slate-400">Carregando pacientes...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                    <Users className="text-primary-600" size={36} />
                    Meus Pacientes
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                    {patients.length} paciente{patients.length !== 1 ? 's' : ''} vinculado{patients.length !== 1 ? 's' : ''}
                </p>
            </div>

            {/* Filters */}
            <div className="card">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input-field pl-10"
                            placeholder="Buscar paciente..."
                        />
                    </div>
                    <div>
                        <select
                            value={filterRisk}
                            onChange={(e) => setFilterRisk(e.target.value as any)}
                            className="input-field"
                        >
                            <option value="all">Todos os Pacientes</option>
                            <option value="high">Alto Risco</option>
                            <option value="medium">Risco Moderado</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Patient List */}
            {filteredPatients.length === 0 ? (
                <div className="card text-center py-12">
                    <p className="text-slate-600 dark:text-slate-400">
                        {searchTerm || filterRisk !== 'all'
                            ? 'Nenhum paciente encontrado com os filtros aplicados'
                            : 'Você ainda não tem pacientes vinculados'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredPatients.map((patient) => (
                        <div
                            key={patient.profile.id}
                            onClick={() => navigate(`/patient/${patient.profile.id}`)}
                            className="card hover:shadow-lg transition-shadow cursor-pointer"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-semibold">{patient.profile.full_name}</h3>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                        {patient.profile.profile_type || 'Paciente'}
                                    </p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRiskColor(patient.riskScore)}`}>
                                    {getRiskLabel(patient.riskScore)}
                                </span>
                            </div>

                            {/* Alerts */}
                            {patient.alerts.length > 0 && (
                                <div className="mb-4 space-y-2">
                                    {patient.alerts.slice(0, 2).map((alert, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center gap-2 text-sm bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 p-2 rounded"
                                        >
                                            <AlertTriangle size={16} />
                                            <span className="truncate">{alert.message}</span>
                                        </div>
                                    ))}
                                    {patient.alerts.length > 2 && (
                                        <p className="text-xs text-slate-500">
                                            +{patient.alerts.length - 2} alerta{patient.alerts.length - 2 !== 1 ? 's' : ''}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Latest Metrics */}
                            <div className="grid grid-cols-3 gap-3 text-center">
                                <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-3">
                                    <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Humor</div>
                                    <div className="text-lg font-bold">
                                        {patient.latestMetrics?.physical?.mood_general || 'N/A'}
                                    </div>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-3">
                                    <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Ansiedade</div>
                                    <div className="text-lg font-bold">
                                        {patient.latestMetrics?.mental?.anxiety || 'N/A'}
                                    </div>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-3">
                                    <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Depressão</div>
                                    <div className="text-lg font-bold">
                                        {patient.latestMetrics?.mental?.depression_mood || 'N/A'}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 flex items-center justify-end text-primary-600 dark:text-primary-400 text-sm font-medium">
                                Ver Dashboard Completo
                                <TrendingUp size={16} className="ml-1" />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
