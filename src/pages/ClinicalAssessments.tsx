import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { AssessmentType } from '@/types';
import { PHQ9_QUESTIONS, GAD7_QUESTIONS } from '@/utils/constants';
import { calculatePHQ9Score, calculateGAD7Score, interpretPHQ9, interpretGAD7 } from '@/utils/calculations';
import { FileText, Save } from 'lucide-react';
import { format } from 'date-fns';

export function ClinicalAssessments() {
    const { profile } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [selectedType, setSelectedType] = useState<AssessmentType>('PHQ9');
    const [responses, setResponses] = useState<Record<string, number>>({});

    const questions = selectedType === 'PHQ9' ? PHQ9_QUESTIONS : selectedType === 'GAD7' ? GAD7_QUESTIONS : [];

    const handleResponseChange = (questionIndex: number, value: number) => {
        setResponses({ ...responses, [`q${questionIndex + 1}`]: value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profile) return;

        // Check if all questions are answered
        if (Object.keys(responses).length < questions.length) {
            alert('Por favor, responda todas as questões');
            return;
        }

        setLoading(true);
        try {
            const totalScore = selectedType === 'PHQ9'
                ? calculatePHQ9Score(responses)
                : selectedType === 'GAD7'
                    ? calculateGAD7Score(responses)
                    : 0;

            const { error } = await supabase
                .from('clinical_assessments')
                .upsert({
                    patient_id: profile.id,
                    date: format(new Date(), 'yyyy-MM-dd'),
                    type: selectedType,
                    raw_scores: responses,
                    total_score: totalScore,
                });

            if (error) throw error;

            const interpretation = selectedType === 'PHQ9'
                ? interpretPHQ9(totalScore)
                : interpretGAD7(totalScore);

            alert(`Questionário salvo com sucesso!\n\nScore: ${totalScore}\nInterpretação: ${interpretation}`);
            navigate('/dashboard');
        } catch (error: any) {
            console.error('Error saving assessment:', error);
            alert('Erro ao salvar questionário: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                    <FileText className="text-primary-600" size={36} />
                    Questionários Clínicos
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                    {format(new Date(), "dd 'de' MMMM 'de' yyyy")}
                </p>
            </div>

            <div className="card mb-6">
                <label className="block text-sm font-medium mb-2">Selecione o Questionário</label>
                <select
                    value={selectedType}
                    onChange={(e) => {
                        setSelectedType(e.target.value as AssessmentType);
                        setResponses({});
                    }}
                    className="input-field"
                >
                    <option value="PHQ9">PHQ-9 (Depressão)</option>
                    <option value="GAD7">GAD-7 (Ansiedade)</option>
                    <option value="ASRM">ASRM (Mania)</option>
                    <option value="FAST">FAST (Funcionamento)</option>
                    <option value="YBOCS">Y-BOCS (TOC)</option>
                </select>
            </div>

            {selectedType === 'PHQ9' && (
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="card space-y-6">
                        <div>
                            <h2 className="text-xl font-semibold mb-2">PHQ-9 - Questionário de Depressão</h2>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                Nas últimas 2 semanas, com que frequência você foi incomodado por algum dos problemas abaixo?
                            </p>
                        </div>

                        {PHQ9_QUESTIONS.map((question, index) => (
                            <div key={index} className="space-y-3">
                                <label className="block font-medium">{index + 1}. {question}</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {['Nenhuma vez', 'Vários dias', 'Mais da metade dos dias', 'Quase todos os dias'].map((option, value) => (
                                        <button
                                            key={value}
                                            type="button"
                                            onClick={() => handleResponseChange(index, value)}
                                            className={`p-3 rounded-lg border-2 text-sm transition-all ${responses[`q${index + 1}`] === value
                                                    ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                                                    : 'border-slate-200 dark:border-slate-700 hover:border-primary-300'
                                                }`}
                                        >
                                            {option}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <button
                        type="submit"
                        disabled={loading || Object.keys(responses).length < PHQ9_QUESTIONS.length}
                        className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        <Save size={20} />
                        {loading ? 'Salvando...' : 'Salvar Questionário'}
                    </button>
                </form>
            )}

            {selectedType === 'GAD7' && (
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="card space-y-6">
                        <div>
                            <h2 className="text-xl font-semibold mb-2">GAD-7 - Questionário de Ansiedade</h2>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                Nas últimas 2 semanas, com que frequência você foi incomodado por algum dos problemas abaixo?
                            </p>
                        </div>

                        {GAD7_QUESTIONS.map((question, index) => (
                            <div key={index} className="space-y-3">
                                <label className="block font-medium">{index + 1}. {question}</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {['Nenhuma vez', 'Vários dias', 'Mais da metade dos dias', 'Quase todos os dias'].map((option, value) => (
                                        <button
                                            key={value}
                                            type="button"
                                            onClick={() => handleResponseChange(index, value)}
                                            className={`p-3 rounded-lg border-2 text-sm transition-all ${responses[`q${index + 1}`] === value
                                                    ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                                                    : 'border-slate-200 dark:border-slate-700 hover:border-primary-300'
                                                }`}
                                        >
                                            {option}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <button
                        type="submit"
                        disabled={loading || Object.keys(responses).length < GAD7_QUESTIONS.length}
                        className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        <Save size={20} />
                        {loading ? 'Salvando...' : 'Salvar Questionário'}
                    </button>
                </form>
            )}

            {!['PHQ9', 'GAD7'].includes(selectedType) && (
                <div className="card text-center py-12">
                    <p className="text-slate-600 dark:text-slate-400">
                        Este questionário será implementado em breve.
                    </p>
                </div>
            )}
        </div>
    );
}
