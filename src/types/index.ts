// User roles
export type UserRole = 'patient' | 'doctor' | 'admin';

export interface Profile {
    id: string;
    email: string;
    role: UserRole;
    full_name: string;
    birth_date?: string;
    gender?: string;
    height_cm?: number;
    weight_kg?: number;
    profile_type?: string;
    doctor_id?: string;
    created_at: string;
    updated_at: string;
}

export interface DailyMetricsPhysical {
    id: string;
    patient_id: string;
    date: string;
    sleep_quality?: number;
    sleep_start?: string;
    sleep_end?: string;
    sleep_hours?: number;
    sleep_regularity_score?: number;
    fatigue_physical?: number;
    stress_mental?: number;
    doms_pain?: number;
    mood_general?: number;
    readiness_to_train?: number;
    perception_recovery_prs?: number;
    resting_hr?: number;
    jump_test_result?: number;
    readiness_index?: number;
    created_at: string;
    updated_at: string;
}

export interface DailyMetricsMental {
    id: string;
    patient_id: string;
    date: string;
    sleep_hours_log?: number;
    sleep_score_app?: number;
    stress_score_app?: number;
    energy_level?: number;
    depression_mood?: number;
    mania_euphoria?: number;
    irritability?: number;
    anxiety?: number;
    obsessive_thoughts?: number;
    sensory_overload?: number;
    social_masking?: number;
    suicide_risk?: number;
    medication_taken?: boolean;
    notes?: string;
    created_at: string;
    updated_at: string;
}

export interface Exercise {
    name: string;
    sets: number;
    reps: number;
    load_kg: number;
}

export interface TrainingSession {
    id: string;
    patient_id: string;
    date: string;
    duration_minutes: number;
    session_rpe?: number;
    exercises_json?: Exercise[];
    internal_load?: number;
    total_tonnage?: number;
    created_at: string;
    updated_at: string;
}

export interface SpravatoSession {
    id: string;
    patient_id: string;
    date: string;
    dose_mg: number;
    dissociation_level?: number;
    nausea_physical?: number;
    bp_pre?: string;
    bp_post?: string;
    trip_quality?: string;
    insights?: string;
    mood_24h_after?: number;
    created_at: string;
    updated_at: string;
}

export type AssessmentType = 'PHQ9' | 'GAD7' | 'ASRM' | 'FAST' | 'YBOCS' | 'EQ5D' | 'TSQM';

export interface ClinicalAssessment {
    id: string;
    patient_id: string;
    date: string;
    type: AssessmentType;
    raw_scores: Record<string, number>;
    total_score?: number;
    burnout_index?: number;
    created_at: string;
    updated_at: string;
}

// Calculation Results
export interface ACWRMetrics {
    atl: number; // Acute Training Load (7 days)
    ctl: number; // Chronic Training Load (42 days)
    tsb: number; // Training Stress Balance
    acwr: number; // Acute:Chronic Workload Ratio
}

export interface WorkloadMetrics {
    weeklyLoad: number;
    monotony: number;
    strain: number;
    injuryRisk: boolean;
}

export interface MentalHealthAlert {
    type: 'mania' | 'suicide' | 'depression' | 'anxiety';
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    value?: number;
}

export interface NumerologyResult {
    destinyNumber: number;
    soulNumber: number;
    interpretation: string;
}

// UI Types
export interface PatientSummary {
    profile: Profile;
    latestMetrics?: {
        physical?: DailyMetricsPhysical;
        mental?: DailyMetricsMental;
    };
    alerts: MentalHealthAlert[];
    riskScore: number;
}
