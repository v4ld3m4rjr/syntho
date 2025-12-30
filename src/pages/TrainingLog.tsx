import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Exercise } from '@/types';
import { calculateInternalLoad, calculateTonnage } from '@/utils/calculations';
import { Plus, Trash2, Save } from 'lucide-react';
import { format } from 'date-fns';

export function TrainingLog() {
    const { profile } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const [durationMinutes, setDurationMinutes] = useState('');
    const [sessionRpe, setSessionRpe] = useState(5);
    const [exercises, setExercises] = useState<Exercise[]>([
        { name: '', sets: 3, reps: 10, load_kg: 0 },
    ]);

    const addExercise = () => {
        setExercises([...exercises, { name: '', sets: 3, reps: 10, load_kg: 0 }]);
    };

    const removeExercise = (index: number) => {
        setExercises(exercises.filter((_, i) => i !== index));
    };

    const updateExercise = (index: number, field: keyof Exercise, value: string | number) => {
        const updated = [...exercises];
        updated[index] = { ...updated[index], [field]: value };
        setExercises(updated);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profile || !durationMinutes) return;

        setLoading(true);
        try {
            const duration = parseInt(durationMinutes);
            const internalLoad = calculateInternalLoad(duration, sessionRpe);
            const tonnage = calculateTonnage(exercises.filter(ex => ex.name));

            const { error } = await supabase
                .from('training_sessions')
                .insert({
                    patient_id: profile.id,
                    date: new Date().toISOString(),
                    duration_minutes: duration,
                    session_rpe: sessionRpe,
                    exercises_json: exercises.filter(ex => ex.name),
                    internal_load: internalLoad,
                    total_tonnage: tonnage,
                });

            if (error) throw error;

            alert('Treino registrado com sucesso!');
            navigate('/dashboard');
        } catch (error: any) {
            console.error('Error saving training:', error);
            alert('Erro ao salvar treino: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const totalTonnage = calculateTonnage(exercises.filter(ex => ex.name));
    const internalLoad = durationMinutes ? calculateInternalLoad(parseInt(durationMinutes), sessionRpe) : 0;

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Registro de Treino</h1>
                <p className="text-slate-600 dark:text-slate-400">
                    {format(new Date(), "dd 'de' MMMM 'de' yyyy")}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Session Info */}
                <div className="card space-y-4">
                    <h2 className="text-xl font-semibold">Informações da Sessão</h2>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Duração (minutos) *</label>
                            <input
                                type="number"
                                value={durationMinutes}
                                onChange={(e) => setDurationMinutes(e.target.value)}
                                className="input-field"
                                placeholder="60"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">RPE da Sessão (0-10)</label>
                            <div className="flex items-center gap-4">
                                <input
                                    type="range"
                                    min="0"
                                    max="10"
                                    value={sessionRpe}
                                    onChange={(e) => setSessionRpe(parseInt(e.target.value))}
                                    className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary-600"
                                />
                                <span className="text-lg font-bold text-primary-600 w-8">{sessionRpe}</span>
                            </div>
                        </div>
                    </div>

                    {/* Calculated Metrics */}
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                        <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-3">
                            <div className="text-sm text-slate-600 dark:text-slate-400">Carga Interna</div>
                            <div className="text-2xl font-bold text-primary-600">{internalLoad}</div>
                        </div>
                        <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-3">
                            <div className="text-sm text-slate-600 dark:text-slate-400">Tonelagem Total</div>
                            <div className="text-2xl font-bold text-primary-600">{totalTonnage.toFixed(0)} kg</div>
                        </div>
                    </div>
                </div>

                {/* Exercises */}
                <div className="card space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold">Exercícios</h2>
                        <button
                            type="button"
                            onClick={addExercise}
                            className="btn-secondary flex items-center gap-2"
                        >
                            <Plus size={20} />
                            Adicionar Exercício
                        </button>
                    </div>

                    <div className="space-y-4">
                        {exercises.map((exercise, index) => (
                            <div
                                key={index}
                                className="grid grid-cols-12 gap-3 items-end p-4 bg-slate-50 dark:bg-slate-900 rounded-lg"
                            >
                                <div className="col-span-4">
                                    <label className="block text-sm font-medium mb-2">Exercício</label>
                                    <input
                                        type="text"
                                        value={exercise.name}
                                        onChange={(e) => updateExercise(index, 'name', e.target.value)}
                                        className="input-field"
                                        placeholder="Ex: Agachamento"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium mb-2">Séries</label>
                                    <input
                                        type="number"
                                        value={exercise.sets}
                                        onChange={(e) => updateExercise(index, 'sets', parseInt(e.target.value) || 0)}
                                        className="input-field"
                                        min="1"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium mb-2">Reps</label>
                                    <input
                                        type="number"
                                        value={exercise.reps}
                                        onChange={(e) => updateExercise(index, 'reps', parseInt(e.target.value) || 0)}
                                        className="input-field"
                                        min="1"
                                    />
                                </div>
                                <div className="col-span-3">
                                    <label className="block text-sm font-medium mb-2">Carga (kg)</label>
                                    <input
                                        type="number"
                                        value={exercise.load_kg}
                                        onChange={(e) => updateExercise(index, 'load_kg', parseFloat(e.target.value) || 0)}
                                        className="input-field"
                                        step="0.5"
                                        min="0"
                                    />
                                </div>
                                <div className="col-span-1 flex justify-center">
                                    {exercises.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeExercise(index)}
                                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading || !durationMinutes}
                    className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    <Save size={20} />
                    {loading ? 'Salvando...' : 'Salvar Treino'}
                </button>
            </form>
        </div>
    );
}
