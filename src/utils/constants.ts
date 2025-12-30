// Alert Thresholds
export const THRESHOLDS = {
    // Injury Risk
    MONOTONY_HIGH: 2.0,
    TSB_LOW: -10,

    // Mental Health Alerts
    SUICIDE_RISK_MEDIUM: 3,
    SUICIDE_RISK_HIGH: 5,
    SUICIDE_RISK_CRITICAL: 7,

    MANIA_STRESS_APP: 80,
    MANIA_ENERGY: 8,

    DEPRESSION_HIGH: 7,
    ANXIETY_HIGH: 7,

    // PHQ-9 Scores
    PHQ9_MILD: 5,
    PHQ9_MODERATE: 10,
    PHQ9_MODERATELY_SEVERE: 15,
    PHQ9_SEVERE: 20,

    // GAD-7 Scores
    GAD7_MILD: 5,
    GAD7_MODERATE: 10,
    GAD7_SEVERE: 15,

    // ACWR (Acute:Chronic Workload Ratio)
    ACWR_LOW: 0.8,
    ACWR_HIGH: 1.3,
} as const;

// ACWR Calculation Parameters
export const ACWR_PARAMS = {
    ACUTE_WINDOW: 7, // days
    CHRONIC_WINDOW: 42, // days
    EWMA_ALPHA_ACUTE: 2 / (7 + 1), // Exponential weighted moving average
    EWMA_ALPHA_CHRONIC: 2 / (42 + 1),
} as const;

// Profile Types
export const PROFILE_TYPES = [
    'Atleta',
    'Paciente',
    'Atleta de Alto Rendimento',
    'Paciente em Tratamento',
] as const;

// Assessment Questions
export const PHQ9_QUESTIONS = [
    'Pouco interesse ou prazer em fazer as coisas',
    'Sentindo-se para baixo, deprimido(a) ou sem esperança',
    'Problemas para adormecer, continuar dormindo ou dormir demais',
    'Sentindo-se cansado(a) ou com pouca energia',
    'Falta de apetite ou comendo demais',
    'Sentindo-se mal consigo mesmo(a) ou que é um fracasso',
    'Problemas de concentração',
    'Movendo-se ou falando tão devagar que outras pessoas notaram',
    'Pensamentos de que seria melhor estar morto(a) ou de se ferir',
] as const;

export const GAD7_QUESTIONS = [
    'Sentindo-se nervoso(a), ansioso(a) ou muito tenso(a)',
    'Não sendo capaz de impedir ou controlar as preocupações',
    'Preocupando-se muito com diversas coisas',
    'Dificuldade para relaxar',
    'Tão inquieto(a) que fica difícil permanecer sentado(a)',
    'Ficando facilmente irritado(a) ou chateado(a)',
    'Sentindo medo como se algo horrível fosse acontecer',
] as const;
