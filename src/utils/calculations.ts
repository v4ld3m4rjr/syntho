import {
    Exercise,
    TrainingSession,
    ACWRMetrics,
    WorkloadMetrics,
    MentalHealthAlert,
    DailyMetricsMental,
    NumerologyResult,
    ClinicalAssessment
} from '@/types';
import { THRESHOLDS, ACWR_PARAMS } from './constants';

// =====================================================
// PHYSICAL CALCULATIONS
// =====================================================

/**
 * Calculate internal load (Training Load)
 * Formula: Duration (minutes) × RPE (0-10)
 */
export function calculateInternalLoad(durationMinutes: number, rpe: number): number {
    return durationMinutes * rpe;
}

/**
 * Calculate total tonnage from exercises
 * Formula: Sum of (Sets × Reps × Load) for all exercises
 */
export function calculateTonnage(exercises: Exercise[]): number {
    return exercises.reduce((total, exercise) => {
        return total + (exercise.sets * exercise.reps * exercise.load_kg);
    }, 0);
}

/**
 * Calculate sleep hours from start and end times
 */
export function calculateSleepHours(sleepStart: string, sleepEnd: string): number {
    const start = new Date(`2000-01-01T${sleepStart}`);
    let end = new Date(`2000-01-01T${sleepEnd}`);

    // Handle overnight sleep
    if (end < start) {
        end = new Date(`2000-01-02T${sleepEnd}`);
    }

    const diffMs = end.getTime() - start.getTime();
    return diffMs / (1000 * 60 * 60); // Convert to hours
}

/**
 * Calculate readiness index from daily metrics
 * Weighted average of key recovery indicators
 */
export function calculateReadinessIndex(metrics: {
    sleepQuality?: number;
    fatiguePhysical?: number;
    stressMental?: number;
    domsPain?: number;
    moodGeneral?: number;
    readinessToTrain?: number;
}): number {
    const {
        sleepQuality = 5,
        fatiguePhysical = 5,
        stressMental = 5,
        domsPain = 5,
        moodGeneral = 5,
        readinessToTrain = 5,
    } = metrics;

    // Invert negative metrics (higher fatigue/stress/pain = lower readiness)
    const invertedFatigue = 10 - fatiguePhysical;
    const invertedStress = 10 - stressMental;
    const invertedPain = 10 - domsPain;

    // Weighted average
    const readiness = (
        sleepQuality * 0.25 +
        invertedFatigue * 0.20 +
        invertedStress * 0.15 +
        invertedPain * 0.15 +
        moodGeneral * 0.10 +
        readinessToTrain * 0.15
    );

    return Math.round(readiness * 10) / 10; // Round to 1 decimal
}

/**
 * Calculate monotony and strain for a week
 * Monotony = Mean Daily Load / Standard Deviation
 * Strain = Weekly Load × Monotony
 */
export function calculateMonotonyAndStrain(weeklyLoads: number[]): WorkloadMetrics {
    if (weeklyLoads.length === 0) {
        return { weeklyLoad: 0, monotony: 0, strain: 0, injuryRisk: false };
    }

    const weeklyLoad = weeklyLoads.reduce((sum, load) => sum + load, 0);
    const mean = weeklyLoad / weeklyLoads.length;

    // Calculate standard deviation
    const variance = weeklyLoads.reduce((sum, load) => {
        return sum + Math.pow(load - mean, 2);
    }, 0) / weeklyLoads.length;

    const stdDev = Math.sqrt(variance);
    const monotony = stdDev === 0 ? 0 : mean / stdDev;
    const strain = weeklyLoad * monotony;

    // Injury risk flag
    const injuryRisk = monotony > THRESHOLDS.MONOTONY_HIGH;

    return {
        weeklyLoad: Math.round(weeklyLoad),
        monotony: Math.round(monotony * 100) / 100,
        strain: Math.round(strain),
        injuryRisk,
    };
}

/**
 * Calculate ACWR (Acute:Chronic Workload Ratio) using EWMA
 * ATL = Acute Training Load (7 days)
 * CTL = Chronic Training Load (42 days)
 * TSB = Training Stress Balance (CTL - ATL)
 * ACWR = ATL / CTL
 */
export function calculateACWR(sessions: TrainingSession[]): ACWRMetrics {
    if (sessions.length === 0) {
        return { atl: 0, ctl: 0, tsb: 0, acwr: 0 };
    }

    // Sort sessions by date (newest first)
    const sortedSessions = [...sessions].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    let atl = 0;
    let ctl = 0;

    // Calculate EWMA for ATL and CTL
    sortedSessions.forEach((session, index) => {
        const load = session.internal_load || 0;

        if (index === 0) {
            atl = load;
            ctl = load;
        } else {
            atl = (load * ACWR_PARAMS.EWMA_ALPHA_ACUTE) + (atl * (1 - ACWR_PARAMS.EWMA_ALPHA_ACUTE));
            ctl = (load * ACWR_PARAMS.EWMA_ALPHA_CHRONIC) + (ctl * (1 - ACWR_PARAMS.EWMA_ALPHA_CHRONIC));
        }
    });

    const tsb = ctl - atl;
    const acwr = ctl === 0 ? 0 : atl / ctl;

    return {
        atl: Math.round(atl),
        ctl: Math.round(ctl),
        tsb: Math.round(tsb),
        acwr: Math.round(acwr * 100) / 100,
    };
}

/**
 * Check if athlete is in injury risk window
 */
export function isInInjuryWindow(monotony: number, tsb: number): boolean {
    return monotony > THRESHOLDS.MONOTONY_HIGH && tsb < THRESHOLDS.TSB_LOW;
}

// =====================================================
// MENTAL HEALTH CALCULATIONS
// =====================================================

/**
 * Calculate PHQ-9 total score
 */
export function calculatePHQ9Score(responses: Record<string, number>): number {
    return Object.values(responses).reduce((sum, value) => sum + value, 0);
}

/**
 * Calculate GAD-7 total score
 */
export function calculateGAD7Score(responses: Record<string, number>): number {
    return Object.values(responses).reduce((sum, value) => sum + value, 0);
}

/**
 * Interpret PHQ-9 score
 */
export function interpretPHQ9(score: number): string {
    if (score < THRESHOLDS.PHQ9_MILD) return 'Mínima';
    if (score < THRESHOLDS.PHQ9_MODERATE) return 'Leve';
    if (score < THRESHOLDS.PHQ9_MODERATELY_SEVERE) return 'Moderada';
    if (score < THRESHOLDS.PHQ9_SEVERE) return 'Moderadamente Grave';
    return 'Grave';
}

/**
 * Interpret GAD-7 score
 */
export function interpretGAD7(score: number): string {
    if (score < THRESHOLDS.GAD7_MILD) return 'Mínima';
    if (score < THRESHOLDS.GAD7_MODERATE) return 'Leve';
    if (score < THRESHOLDS.GAD7_SEVERE) return 'Moderada';
    return 'Grave';
}

/**
 * Generate mental health alerts based on daily metrics
 */
export function generateMentalHealthAlerts(metrics: DailyMetricsMental): MentalHealthAlert[] {
    const alerts: MentalHealthAlert[] = [];

    // Suicide risk alert
    if (metrics.suicide_risk) {
        if (metrics.suicide_risk >= THRESHOLDS.SUICIDE_RISK_CRITICAL) {
            alerts.push({
                type: 'suicide',
                severity: 'critical',
                message: 'ALERTA CRÍTICO: Risco de suicídio muito alto. Procure ajuda imediatamente.',
                value: metrics.suicide_risk,
            });
        } else if (metrics.suicide_risk >= THRESHOLDS.SUICIDE_RISK_HIGH) {
            alerts.push({
                type: 'suicide',
                severity: 'high',
                message: 'Risco de suicídio elevado. Entre em contato com seu terapeuta.',
                value: metrics.suicide_risk,
            });
        } else if (metrics.suicide_risk >= THRESHOLDS.SUICIDE_RISK_MEDIUM) {
            alerts.push({
                type: 'suicide',
                severity: 'medium',
                message: 'Risco de suicídio moderado. Monitore seus pensamentos.',
                value: metrics.suicide_risk,
            });
        }
    }

    // Mania alert
    if (
        metrics.stress_score_app &&
        metrics.energy_level &&
        metrics.stress_score_app > THRESHOLDS.MANIA_STRESS_APP &&
        metrics.energy_level > THRESHOLDS.MANIA_ENERGY
    ) {
        alerts.push({
            type: 'mania',
            severity: 'high',
            message: 'Possível episódio de mania detectado. Monitore seu humor e sono.',
            value: metrics.energy_level,
        });
    }

    // Depression alert
    if (metrics.depression_mood && metrics.depression_mood >= THRESHOLDS.DEPRESSION_HIGH) {
        alerts.push({
            type: 'depression',
            severity: 'high',
            message: 'Humor depressivo elevado. Considere conversar com seu terapeuta.',
            value: metrics.depression_mood,
        });
    }

    // Anxiety alert
    if (metrics.anxiety && metrics.anxiety >= THRESHOLDS.ANXIETY_HIGH) {
        alerts.push({
            type: 'anxiety',
            severity: 'high',
            message: 'Nível de ansiedade elevado. Pratique técnicas de relaxamento.',
            value: metrics.anxiety,
        });
    }

    return alerts;
}

/**
 * Calculate overall risk score for patient (used by doctors to prioritize)
 */
export function calculatePatientRiskScore(
    mentalMetrics?: DailyMetricsMental,
    assessments?: ClinicalAssessment[]
): number {
    let riskScore = 0;

    if (mentalMetrics) {
        // Suicide risk is the highest priority
        if (mentalMetrics.suicide_risk) {
            riskScore += mentalMetrics.suicide_risk * 10;
        }

        // Depression and anxiety
        if (mentalMetrics.depression_mood) {
            riskScore += mentalMetrics.depression_mood * 2;
        }
        if (mentalMetrics.anxiety) {
            riskScore += mentalMetrics.anxiety * 2;
        }
    }

    // Add assessment scores
    if (assessments && assessments.length > 0) {
        const latestPHQ9 = assessments.find(a => a.type === 'PHQ9');
        const latestGAD7 = assessments.find(a => a.type === 'GAD7');

        if (latestPHQ9?.total_score) {
            riskScore += latestPHQ9.total_score;
        }
        if (latestGAD7?.total_score) {
            riskScore += latestGAD7.total_score;
        }
    }

    return Math.min(riskScore, 100); // Cap at 100
}

// =====================================================
// NUMEROLOGY CALCULATIONS
// =====================================================

/**
 * Convert letter to numerology number (A=1, B=2, ..., Z=26, then reduce)
 */
function letterToNumber(letter: string): number {
    const code = letter.toUpperCase().charCodeAt(0);
    if (code >= 65 && code <= 90) {
        return code - 64; // A=1, B=2, etc.
    }
    return 0;
}

/**
 * Reduce number to single digit (except master numbers 11, 22, 33)
 */
function reduceToSingleDigit(num: number): number {
    while (num > 9 && num !== 11 && num !== 22 && num !== 33) {
        num = num.toString().split('').reduce((sum, digit) => sum + parseInt(digit), 0);
    }
    return num;
}

/**
 * Calculate Destiny Number (from full name)
 */
export function calculateDestinyNumber(fullName: string): number {
    const sum = fullName
        .split('')
        .filter(char => /[a-zA-Z]/.test(char))
        .reduce((total, char) => total + letterToNumber(char), 0);

    return reduceToSingleDigit(sum);
}

/**
 * Calculate Soul Number (from vowels in name)
 */
export function calculateSoulNumber(fullName: string): number {
    const vowels = 'AEIOU';
    const sum = fullName
        .toUpperCase()
        .split('')
        .filter(char => vowels.includes(char))
        .reduce((total, char) => total + letterToNumber(char), 0);

    return reduceToSingleDigit(sum);
}

/**
 * Calculate Life Path Number (from birth date)
 */
export function calculateLifePathNumber(birthDate: string): number {
    // birthDate format: YYYY-MM-DD
    const digits = birthDate.replace(/-/g, '').split('').map(d => parseInt(d));
    const sum = digits.reduce((total, digit) => total + digit, 0);

    return reduceToSingleDigit(sum);
}

/**
 * Get numerology interpretation
 */
export function getNumerologyInterpretation(destinyNumber: number, soulNumber: number): string {
    const interpretations: Record<number, string> = {
        1: 'Liderança e independência',
        2: 'Cooperação e diplomacia',
        3: 'Criatividade e expressão',
        4: 'Estabilidade e organização',
        5: 'Liberdade e aventura',
        6: 'Responsabilidade e cuidado',
        7: 'Espiritualidade e análise',
        8: 'Poder e sucesso material',
        9: 'Humanitarismo e compaixão',
        11: 'Intuição e inspiração (Número Mestre)',
        22: 'Construtor mestre e visão',
        33: 'Mestre professor e cura',
    };

    return `Destino: ${interpretations[destinyNumber] || 'Desconhecido'} | Alma: ${interpretations[soulNumber] || 'Desconhecido'}`;
}

/**
 * Calculate complete numerology profile
 */
export function calculateNumerology(fullName: string): NumerologyResult {
    const destinyNumber = calculateDestinyNumber(fullName);
    const soulNumber = calculateSoulNumber(fullName);
    const interpretation = getNumerologyInterpretation(destinyNumber, soulNumber);

    return {
        destinyNumber,
        soulNumber,
        interpretation,
    };
}
