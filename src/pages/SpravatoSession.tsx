import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Pill, Save } from 'lucide-react';
import { format } from 'date-fns';

export function SpravatoSession() {
    const { profile } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const [doseMg, setDoseMg] = useState('');
    const [dissociationLevel, setDissociationLevel] = useState(0);
    const [nauseaPhysical, setNauseaPhysical] = useState(0);
    const [bpPre, setBpPre] = useState('');
    const [bpPost, setBpPost] = useState('');
    const [tripQuality, setTripQuality] = useState('');
    const [insights, setInsights] = useState('');
    const [mood24hAfter, setMood24hAfter] = useState(0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profile || !doseMg) return;

        setLoading(true);
        try {
            const { error } = await supabase
                .from('spravato_sessions')
                .insert({
                    patient_id: profile.id,
                    date: new Date().toISOString(),
                    dose_mg: parseFloat(doseMg),
                    dissociation_level: dissociationLevel,
                    nausea_physical: nauseaPhysical,
                    bp_pre: bpPre || null,
                    bp_post: bpPost || null,
                    trip_quality: tripQuality || null,
                    insights: insights || null,
                    mood_24h_after: mood24hAfter,
                });

            if (error) throw error;

            alert('Sessão de Spravato registrada com sucesso!');
            navigate('/dashboard');
        } catch (error: any) {
            console.error('Error saving session:', error);
            alert('Erro ao salvar sessão: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                    <Pill className="text-primary-600" size={36} />
                    Sessão de Spravato
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                    {format(new Date(), "dd 'de' MMMM 'de' yyyy")}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="card space-y-4">
                    <h2 className="text-xl font-semibold">Informações da Sessão</h2>

                    <div>
                        <label className="block text-sm font-medium mb-2">Dose (mg) *</label>
                        <input
                            type="number"
                            value={doseMg}
                            onChange={(e) => setDoseMg(e.target.value)}
                            className="input-field"
                            placeholder="56"
                            step="0.1"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Pressão Arterial Pré</label>
                            <input
                                type="text"
                                value={bpPre}
                                onChange={(e) => setBpPre(e.target.value)}
                                className="input-field"
                                placeholder="120/80"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Pressão Arterial Pós</label>
                            <input
                                type="text"
                                value={bpPost}
                                onChange={(e) => setBpPost(e.target.value)}
                                className="input-field"
                                placeholder="125/85"
                            />
                        </div>
                    </div>
                </div>

                <div className="card space-y-4">
                    <h2 className="text-xl font-semibold">Efeitos e Experiência</h2>

                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-sm font-medium">Nível de Dissociação</label>
                                <span className="text-lg font-bold text-primary-600">{dissociationLevel}/10</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="10"
                                value={dissociationLevel}
                                onChange={(e) => setDissociationLevel(parseInt(e.target.value))}
                                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary-600"
                            />
                            <div className="flex justify-between text-xs text-slate-500 mt-1">
                                <span>Nenhuma</span>
                                <span>Intensa</span>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-sm font-medium">Náusea</label>
                                <span className="text-lg font-bold text-primary-600">{nauseaPhysical}/10</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="10"
                                value={nauseaPhysical}
                                onChange={(e) => setNauseaPhysical(parseInt(e.target.value))}
                                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary-600"
                            />
                            <div className="flex justify-between text-xs text-slate-500 mt-1">
                                <span>Nenhuma</span>
                                <span>Intensa</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Qualidade da Experiência</label>
                        <select
                            value={tripQuality}
                            onChange={(e) => setTripQuality(e.target.value)}
                            className="input-field"
                        >
                            <option value="">Selecione</option>
                            <option value="Muito Positiva">Muito Positiva</option>
                            <option value="Positiva">Positiva</option>
                            <option value="Neutra">Neutra</option>
                            <option value="Desconfortável">Desconfortável</option>
                            <option value="Muito Desconfortável">Muito Desconfortável</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Insights e Reflexões</label>
                        <textarea
                            value={insights}
                            onChange={(e) => setInsights(e.target.value)}
                            className="input-field min-h-[120px]"
                            placeholder="Descreva insights, pensamentos ou reflexões durante a sessão..."
                        />
                    </div>
                </div>

                <div className="card space-y-4">
                    <h2 className="text-xl font-semibold">Acompanhamento (24h depois)</h2>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-sm font-medium">Mudança no Humor (24h após)</label>
                            <span className="text-lg font-bold text-primary-600">{mood24hAfter > 0 ? '+' : ''}{mood24hAfter}</span>
                        </div>
                        <input
                            type="range"
                            min="-5"
                            max="5"
                            value={mood24hAfter}
                            onChange={(e) => setMood24hAfter(parseInt(e.target.value))}
                            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary-600"
                        />
                        <div className="flex justify-between text-xs text-slate-500 mt-1">
                            <span>Muito Pior</span>
                            <span>Sem Mudança</span>
                            <span>Muito Melhor</span>
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading || !doseMg}
                    className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    <Save size={20} />
                    {loading ? 'Salvando...' : 'Salvar Sessão'}
                </button>
            </form>
        </div>
    );
}
