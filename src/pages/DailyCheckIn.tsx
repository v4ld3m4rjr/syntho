import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { calculateSleepHours, calculateReadinessIndex } from '@/utils/calculations';
import { Moon, Heart, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';

export function DailyCheckIn() {
    const { profile } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Physical metrics
    const [sleepQuality, setSleepQuality] = useState(5);
    const [sleepStart, setSleepStart] = useState('22:00');
    const [sleepEnd, setSleepEnd] = useState('06:00');
    const [fatiguePhysical, setFatiguePhysical] = useState(5);
    const [stressMental, setStressMental] = useState(5);
    const [domsPain, setDomsPain] = useState(5);
    const [moodGeneral, setMoodGeneral] = useState(5);
    const [readinessToTrain, setReadinessToTrain] = useState(5);
    const [perceptionRecoveryPrs, setPerceptionRecoveryPrs] = useState(5);
    const [restingHr, setRestingHr] = useState('');
    const [jumpTestResult, setJumpTestResult] = useState('');

    // Mental metrics
    const [sleepHoursLog, setSleepHoursLog] = useState('');
    const [sleepScoreApp, setSleepScoreApp] = useState(50);
    const [stressScoreApp, setStressScoreApp] = useState(50);
    const [energyLevel, setEnergyLevel] = useState(5);
    const [depressionMood, setDepressionMood] = useState(0);
    const [maniaEuphoria, setManiaEuphoria] = useState(0);
    const [irritability, setIrritability] = useState(0);
    const [anxiety, setAnxiety] = useState(0);
    const [obsessiveThoughts, setObsessiveThoughts] = useState(0);
    const [sensoryOverload, setSensoryOverload] = useState(0);
    const [socialMasking, setSocialMasking] = useState(0);
    const [suicideRisk, setSuicideRisk] = useState(0);
    const [medicationTaken, setMedicationTaken] = useState(false);
    const [notes, setNotes] = useState('');

    const handleSubmit = async () => {
        if (!profile) return;

        setLoading(true);
        try {
            const today = format(new Date(), 'yyyy-MM-dd');
            const sleepHours = calculateSleepHours(sleepStart, sleepEnd);
            const readinessIndex = calculateReadinessIndex({
                sleepQuality,
                fatiguePhysical,
                stressMental,
                domsPain,
                moodGeneral,
                readinessToTrain,
            });

            // Upsert physical metrics
            const { error: physicalError } = await supabase
                .from('daily_metrics_physical')
                .upsert({
                    patient_id: profile.id,
                    date: today,
                    sleep_quality: sleepQuality,
                    sleep_start: sleepStart,
                    sleep_end: sleepEnd,
                    sleep_hours: sleepHours,
                    fatigue_physical: fatiguePhysical,
                    stress_mental: stressMental,
                    doms_pain: domsPain,
                    mood_general: moodGeneral,
                    readiness_to_train: readinessToTrain,
                    perception_recovery_prs: perceptionRecoveryPrs,
                    resting_hr: restingHr ? parseInt(restingHr) : null,
                    jump_test_result: jumpTestResult ? parseFloat(jumpTestResult) : null,
                    readiness_index: readinessIndex,
                });

            if (physicalError) throw physicalError;

            // Upsert mental metrics
            const { error: mentalError } = await supabase
                .from('daily_metrics_mental')
                .upsert({
                    patient_id: profile.id,
                    date: today,
                    sleep_hours_log: sleepHoursLog ? parseFloat(sleepHoursLog) : null,
                    sleep_score_app: sleepScoreApp,
                    stress_score_app: stressScoreApp,
                    energy_level: energyLevel,
                    depression_mood: depressionMood,
                    mania_euphoria: maniaEuphoria,
                    irritability,
                    anxiety,
                    obsessive_thoughts: obsessiveThoughts,
                    sensory_overload: sensoryOverload,
                    social_masking: socialMasking,
                    suicide_risk: suicideRisk,
                    medication_taken: medicationTaken,
                    notes,
                });

            if (mentalError) throw mentalError;

            alert('Check-in salvo com sucesso!');
            navigate('/dashboard');
        } catch (error: any) {
            console.error('Error saving check-in:', error);
            alert('Erro ao salvar check-in: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const SliderInput = ({
        label,
        value,
        onChange,
        min = 0,
        max = 10,
        leftLabel,
        rightLabel
    }: {
        label: string;
        value: number;
        onChange: (v: number) => void;
        min?: number;
        max?: number;
        leftLabel?: string;
        rightLabel?: string;
    }) => (
        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <label className="text-sm font-medium">{label}</label>
                <span className="text-lg font-bold text-primary-600">{value}</span>
            </div>
            <input
                type="range"
                min={min}
                max={max}
                value={value}
                onChange={(e) => onChange(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary-600"
            />
            {leftLabel && rightLabel && (
                <div className="flex justify-between text-xs text-slate-500">
                    <span>{leftLabel}</span>
                    <span>{rightLabel}</span>
                </div>
            )}
        </div>
    );

    return (
        <div className="max-w-3xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Check-in Diário</h1>
                <p className="text-slate-600 dark:text-slate-400">
                    {format(new Date(), "dd/MM/yyyy")}
                </p>
                <div className="flex gap-2 mt-4">
                    {[1, 2].map((s) => (
                        <div
                            key={s}
                            className={`h-2 flex-1 rounded-full ${s <= step ? 'bg-primary-600' : 'bg-slate-200 dark:bg-slate-700'
                                }`}
                        />
                    ))}
                </div>
            </div>

            {/* Step 1: Physical Metrics */}
            {step === 1 && (
                <div className="card space-y-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Moon className="text-primary-600" size={28} />
                        <h2 className="text-2xl font-semibold">Métricas Físicas</h2>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Hora de Dormir</label>
                            <input
                                type="time"
                                value={sleepStart}
                                onChange={(e) => setSleepStart(e.target.value)}
                                className="input-field"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Hora de Acordar</label>
                            <input
                                type="time"
                                value={sleepEnd}
                                onChange={(e) => setSleepEnd(e.target.value)}
                                className="input-field"
                            />
                        </div>
                    </div>

                    <SliderInput
                        label="Qualidade do Sono"
                        value={sleepQuality}
                        onChange={setSleepQuality}
                        leftLabel="Péssimo"
                        rightLabel="Excelente"
                    />

                    <SliderInput
                        label="Fadiga Física"
                        value={fatiguePhysical}
                        onChange={setFatiguePhysical}
                        leftLabel="Nenhuma"
                        rightLabel="Extrema"
                    />

                    <SliderInput
                        label="Estresse Mental"
                        value={stressMental}
                        onChange={setStressMental}
                        leftLabel="Nenhum"
                        rightLabel="Extremo"
                    />

                    <SliderInput
                        label="Dor Muscular (DOMS)"
                        value={domsPain}
                        onChange={setDomsPain}
                        leftLabel="Nenhuma"
                        rightLabel="Intensa"
                    />

                    <SliderInput
                        label="Humor Geral"
                        value={moodGeneral}
                        onChange={setMoodGeneral}
                        leftLabel="Péssimo"
                        rightLabel="Ótimo"
                    />

                    <SliderInput
                        label="Prontidão para Treinar"
                        value={readinessToTrain}
                        onChange={setReadinessToTrain}
                        leftLabel="Nenhuma"
                        rightLabel="Total"
                    />

                    <SliderInput
                        label="Percepção de Recuperação (PRS)"
                        value={perceptionRecoveryPrs}
                        onChange={setPerceptionRecoveryPrs}
                        leftLabel="Não Recuperado"
                        rightLabel="Totalmente Recuperado"
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">FC em Repouso (bpm)</label>
                            <input
                                type="number"
                                value={restingHr}
                                onChange={(e) => setRestingHr(e.target.value)}
                                className="input-field"
                                placeholder="60"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Teste de Salto (cm)</label>
                            <input
                                type="number"
                                value={jumpTestResult}
                                onChange={(e) => setJumpTestResult(e.target.value)}
                                className="input-field"
                                placeholder="40"
                                step="0.1"
                            />
                        </div>
                    </div>

                    <button onClick={() => setStep(2)} className="btn-primary w-full flex items-center justify-center gap-2">
                        Continuar
                        <ArrowRight size={20} />
                    </button>
                </div>
            )}

            {/* Step 2: Mental Metrics */}
            {step === 2 && (
                <div className="card space-y-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Heart className="text-primary-600" size={28} />
                        <h2 className="text-2xl font-semibold">Saúde Mental</h2>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Horas de Sono (App)</label>
                            <input
                                type="number"
                                value={sleepHoursLog}
                                onChange={(e) => setSleepHoursLog(e.target.value)}
                                className="input-field"
                                placeholder="7.5"
                                step="0.1"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Score de Sono (App)</label>
                            <input
                                type="number"
                                value={sleepScoreApp}
                                onChange={(e) => setSleepScoreApp(parseInt(e.target.value))}
                                className="input-field"
                                placeholder="85"
                                min="0"
                                max="100"
                            />
                        </div>
                    </div>

                    <SliderInput
                        label="Score de Estresse (App)"
                        value={stressScoreApp}
                        onChange={setStressScoreApp}
                        min={0}
                        max={100}
                        leftLabel="Baixo"
                        rightLabel="Alto"
                    />

                    <SliderInput
                        label="Nível de Energia"
                        value={energyLevel}
                        onChange={setEnergyLevel}
                        leftLabel="Exausto"
                        rightLabel="Energizado"
                    />

                    <SliderInput
                        label="Humor Depressivo"
                        value={depressionMood}
                        onChange={setDepressionMood}
                        leftLabel="Nenhum"
                        rightLabel="Intenso"
                    />

                    <SliderInput
                        label="Mania/Euforia"
                        value={maniaEuphoria}
                        onChange={setManiaEuphoria}
                        leftLabel="Nenhuma"
                        rightLabel="Intensa"
                    />

                    <SliderInput
                        label="Irritabilidade"
                        value={irritability}
                        onChange={setIrritability}
                        leftLabel="Nenhuma"
                        rightLabel="Intensa"
                    />

                    <SliderInput
                        label="Ansiedade"
                        value={anxiety}
                        onChange={setAnxiety}
                        leftLabel="Nenhuma"
                        rightLabel="Intensa"
                    />

                    <SliderInput
                        label="Pensamentos Obsessivos"
                        value={obsessiveThoughts}
                        onChange={setObsessiveThoughts}
                        leftLabel="Nenhum"
                        rightLabel="Intensos"
                    />

                    <SliderInput
                        label="Sobrecarga Sensorial"
                        value={sensoryOverload}
                        onChange={setSensoryOverload}
                        leftLabel="Nenhuma"
                        rightLabel="Intensa"
                    />

                    <SliderInput
                        label="Mascaramento Social"
                        value={socialMasking}
                        onChange={setSocialMasking}
                        leftLabel="Nenhum"
                        rightLabel="Intenso"
                    />

                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                        <SliderInput
                            label="Risco de Suicídio"
                            value={suicideRisk}
                            onChange={setSuicideRisk}
                            leftLabel="Nenhum"
                            rightLabel="Alto"
                        />
                        {suicideRisk > 5 && (
                            <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                                ⚠️ Se você está tendo pensamentos suicidas, procure ajuda imediatamente. Ligue 188 (CVV).
                            </p>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            id="medication"
                            checked={medicationTaken}
                            onChange={(e) => setMedicationTaken(e.target.checked)}
                            className="w-5 h-5 text-primary-600 rounded"
                        />
                        <label htmlFor="medication" className="text-sm font-medium">
                            Tomei minha medicação hoje
                        </label>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Notas / Observações</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="input-field min-h-[100px]"
                            placeholder="Como você está se sentindo hoje? Alguma observação importante?"
                        />
                    </div>

                    <div className="flex gap-3">
                        <button onClick={() => setStep(1)} className="btn-secondary flex-1 flex items-center justify-center gap-2">
                            <ArrowLeft size={20} />
                            Voltar
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loading ? 'Salvando...' : (
                                <>
                                    <CheckCircle size={20} />
                                    Salvar Check-in
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
