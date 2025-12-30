import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Profile, UserRole } from '@/types';
import { PROFILE_TYPES } from '@/utils/constants';
import { User, Stethoscope, Calendar, Ruler, Weight, Users } from 'lucide-react';

interface OnboardingFlowProps {
    userId: string;
    email: string;
    onComplete: () => void;
}

export function OnboardingFlow({ userId, email, onComplete }: OnboardingFlowProps) {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [doctors, setDoctors] = useState<Profile[]>([]);

    // Form data
    const [role, setRole] = useState<UserRole>('patient');
    const [fullName, setFullName] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [gender, setGender] = useState('');
    const [heightCm, setHeightCm] = useState('');
    const [weightKg, setWeightKg] = useState('');
    const [profileType, setProfileType] = useState('Paciente');
    const [doctorId, setDoctorId] = useState('');

    useEffect(() => {
        if (role === 'patient') {
            fetchDoctors();
        }
    }, [role]);

    const fetchDoctors = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('role', 'doctor')
                .order('full_name');

            if (error) throw error;
            setDoctors(data || []);
        } catch (error) {
            console.error('Error fetching doctors:', error);
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const profileData: any = {
                id: userId,
                email,
                role,
                full_name: fullName,
            };

            if (role === 'patient') {
                profileData.birth_date = birthDate || null;
                profileData.gender = gender || null;
                profileData.height_cm = heightCm ? parseFloat(heightCm) : null;
                profileData.weight_kg = weightKg ? parseFloat(weightKg) : null;
                profileData.profile_type = profileType;
                profileData.doctor_id = doctorId || null;
            }

            const { error } = await supabase
                .from('profiles')
                .insert(profileData);

            if (error) throw error;
            onComplete();
        } catch (error: any) {
            console.error('Error creating profile:', error);
            alert('Erro ao criar perfil: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 dark:from-slate-900 dark:to-slate-800 px-4">
            <div className="card max-w-2xl w-full">
                <div className="mb-8">
                    <h2 className="text-2xl font-bold mb-2">Bem-vindo!</h2>
                    <p className="text-slate-600 dark:text-slate-400">
                        Vamos configurar seu perfil
                    </p>
                    <div className="flex gap-2 mt-4">
                        {[1, 2, 3].map((s) => (
                            <div
                                key={s}
                                className={`h-2 flex-1 rounded-full ${s <= step ? 'bg-primary-600' : 'bg-slate-200 dark:bg-slate-700'
                                    }`}
                            />
                        ))}
                    </div>
                </div>

                {/* Step 1: Role Selection */}
                {step === 1 && (
                    <div className="space-y-6">
                        <h3 className="text-xl font-semibold">Você é:</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setRole('patient')}
                                className={`p-6 rounded-xl border-2 transition-all ${role === 'patient'
                                        ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                                        : 'border-slate-200 dark:border-slate-700 hover:border-primary-300'
                                    }`}
                            >
                                <User size={48} className="mx-auto mb-3 text-primary-600" />
                                <div className="font-semibold">Paciente</div>
                            </button>
                            <button
                                onClick={() => setRole('doctor')}
                                className={`p-6 rounded-xl border-2 transition-all ${role === 'doctor'
                                        ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                                        : 'border-slate-200 dark:border-slate-700 hover:border-primary-300'
                                    }`}
                            >
                                <Stethoscope size={48} className="mx-auto mb-3 text-primary-600" />
                                <div className="font-semibold">Profissional</div>
                            </button>
                        </div>
                        <button onClick={() => setStep(2)} className="btn-primary w-full">
                            Continuar
                        </button>
                    </div>
                )}

                {/* Step 2: Basic Info */}
                {step === 2 && (
                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold">Informações Básicas</h3>

                        <div>
                            <label className="block text-sm font-medium mb-2">Nome Completo *</label>
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="input-field"
                                placeholder="Seu nome completo"
                                required
                            />
                        </div>

                        {role === 'patient' && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Data de Nascimento</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                        <input
                                            type="date"
                                            value={birthDate}
                                            onChange={(e) => setBirthDate(e.target.value)}
                                            className="input-field pl-10"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Gênero</label>
                                    <select
                                        value={gender}
                                        onChange={(e) => setGender(e.target.value)}
                                        className="input-field"
                                    >
                                        <option value="">Selecione</option>
                                        <option value="Masculino">Masculino</option>
                                        <option value="Feminino">Feminino</option>
                                        <option value="Outro">Outro</option>
                                        <option value="Prefiro não informar">Prefiro não informar</option>
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Altura (cm)</label>
                                        <div className="relative">
                                            <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                            <input
                                                type="number"
                                                value={heightCm}
                                                onChange={(e) => setHeightCm(e.target.value)}
                                                className="input-field pl-10"
                                                placeholder="170"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Peso (kg)</label>
                                        <div className="relative">
                                            <Weight className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                            <input
                                                type="number"
                                                value={weightKg}
                                                onChange={(e) => setWeightKg(e.target.value)}
                                                className="input-field pl-10"
                                                placeholder="70"
                                                step="0.1"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Tipo de Perfil</label>
                                    <select
                                        value={profileType}
                                        onChange={(e) => setProfileType(e.target.value)}
                                        className="input-field"
                                    >
                                        {PROFILE_TYPES.map((type) => (
                                            <option key={type} value={type}>
                                                {type}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </>
                        )}

                        <div className="flex gap-3">
                            <button onClick={() => setStep(1)} className="btn-secondary flex-1">
                                Voltar
                            </button>
                            <button
                                onClick={() => role === 'patient' ? setStep(3) : handleSubmit()}
                                disabled={!fullName || loading}
                                className="btn-primary flex-1 disabled:opacity-50"
                            >
                                {role === 'patient' ? 'Continuar' : loading ? 'Salvando...' : 'Finalizar'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: Doctor Selection (Patient Only) */}
                {step === 3 && role === 'patient' && (
                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold">Selecione seu Médico/Terapeuta</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Escolha o profissional que irá acompanhar seu tratamento
                        </p>

                        <div>
                            <label className="block text-sm font-medium mb-2">Médico/Terapeuta</label>
                            <div className="relative">
                                <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                <select
                                    value={doctorId}
                                    onChange={(e) => setDoctorId(e.target.value)}
                                    className="input-field pl-10"
                                >
                                    <option value="">Selecione um profissional</option>
                                    {doctors.map((doctor) => (
                                        <option key={doctor.id} value={doctor.id}>
                                            {doctor.full_name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {doctors.length === 0 && (
                                <p className="text-sm text-slate-500 mt-2">
                                    Nenhum profissional cadastrado ainda. Você pode pular esta etapa.
                                </p>
                            )}
                        </div>

                        <div className="flex gap-3">
                            <button onClick={() => setStep(2)} className="btn-secondary flex-1">
                                Voltar
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="btn-primary flex-1 disabled:opacity-50"
                            >
                                {loading ? 'Salvando...' : 'Finalizar'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
