-- =====================================================
-- HEALTH MONITORING PWA - SUPABASE SCHEMA
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE: profiles
-- =====================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('patient', 'doctor')),
  full_name TEXT NOT NULL,
  birth_date DATE,
  gender TEXT,
  height_cm NUMERIC,
  weight_kg NUMERIC,
  profile_type TEXT, -- 'Atleta', 'Paciente', etc.
  doctor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for doctor lookup
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_doctor_id ON profiles(doctor_id);

-- =====================================================
-- TABLE: daily_metrics_physical
-- =====================================================
CREATE TABLE daily_metrics_physical (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  
  -- Sleep metrics
  sleep_quality INTEGER CHECK (sleep_quality BETWEEN 0 AND 10),
  sleep_start TIME,
  sleep_end TIME,
  sleep_hours NUMERIC,
  sleep_regularity_score NUMERIC,
  
  -- Recovery metrics
  fatigue_physical INTEGER CHECK (fatigue_physical BETWEEN 0 AND 10),
  stress_mental INTEGER CHECK (stress_mental BETWEEN 0 AND 10),
  doms_pain INTEGER CHECK (doms_pain BETWEEN 0 AND 10),
  mood_general INTEGER CHECK (mood_general BETWEEN 0 AND 10),
  readiness_to_train INTEGER CHECK (readiness_to_train BETWEEN 0 AND 10),
  perception_recovery_prs INTEGER CHECK (perception_recovery_prs BETWEEN 0 AND 10),
  
  -- Physiological metrics
  resting_hr INTEGER,
  jump_test_result NUMERIC,
  
  -- Calculated fields
  readiness_index NUMERIC,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(patient_id, date)
);

CREATE INDEX idx_daily_metrics_physical_patient_date ON daily_metrics_physical(patient_id, date DESC);

-- =====================================================
-- TABLE: daily_metrics_mental
-- =====================================================
CREATE TABLE daily_metrics_mental (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  
  -- Sleep from app
  sleep_hours_log NUMERIC,
  sleep_score_app INTEGER CHECK (sleep_score_app BETWEEN 0 AND 100),
  stress_score_app INTEGER CHECK (stress_score_app BETWEEN 0 AND 100),
  
  -- Mental health metrics
  energy_level INTEGER CHECK (energy_level BETWEEN 0 AND 10),
  depression_mood INTEGER CHECK (depression_mood BETWEEN 0 AND 10),
  mania_euphoria INTEGER CHECK (mania_euphoria BETWEEN 0 AND 10),
  irritability INTEGER CHECK (irritability BETWEEN 0 AND 10),
  anxiety INTEGER CHECK (anxiety BETWEEN 0 AND 10),
  
  -- Neurodivergence metrics
  obsessive_thoughts INTEGER CHECK (obsessive_thoughts BETWEEN 0 AND 10),
  sensory_overload INTEGER CHECK (sensory_overload BETWEEN 0 AND 10),
  social_masking INTEGER CHECK (social_masking BETWEEN 0 AND 10),
  
  -- Critical metrics
  suicide_risk INTEGER CHECK (suicide_risk BETWEEN 0 AND 10),
  
  -- Medication
  medication_taken BOOLEAN DEFAULT FALSE,
  
  -- Notes
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(patient_id, date)
);

CREATE INDEX idx_daily_metrics_mental_patient_date ON daily_metrics_mental(patient_id, date DESC);
CREATE INDEX idx_daily_metrics_mental_suicide_risk ON daily_metrics_mental(patient_id, suicide_risk DESC) WHERE suicide_risk > 5;

-- =====================================================
-- TABLE: training_sessions
-- =====================================================
CREATE TABLE training_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Session metrics
  duration_minutes INTEGER NOT NULL,
  session_rpe INTEGER CHECK (session_rpe BETWEEN 0 AND 10),
  
  -- Exercises (stored as JSONB array)
  -- Format: [{"name": "Squat", "sets": 3, "reps": 10, "load_kg": 100}]
  exercises_json JSONB,
  
  -- Calculated fields
  internal_load NUMERIC, -- duration * rpe
  total_tonnage NUMERIC, -- sum of (sets * reps * load)
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_training_sessions_patient_date ON training_sessions(patient_id, date DESC);

-- =====================================================
-- TABLE: spravato_sessions
-- =====================================================
CREATE TABLE spravato_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Treatment details
  dose_mg NUMERIC NOT NULL,
  
  -- Side effects
  dissociation_level INTEGER CHECK (dissociation_level BETWEEN 0 AND 10),
  nausea_physical INTEGER CHECK (nausea_physical BETWEEN 0 AND 10),
  
  -- Vital signs
  bp_pre TEXT, -- e.g., "120/80"
  bp_post TEXT,
  
  -- Experience
  trip_quality TEXT,
  insights TEXT,
  
  -- Follow-up
  mood_24h_after INTEGER CHECK (mood_24h_after BETWEEN -5 AND 5),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_spravato_sessions_patient_date ON spravato_sessions(patient_id, date DESC);

-- =====================================================
-- TABLE: clinical_assessments
-- =====================================================
CREATE TABLE clinical_assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  
  -- Assessment type
  type TEXT NOT NULL CHECK (type IN ('PHQ9', 'GAD7', 'ASRM', 'FAST', 'YBOCS', 'EQ5D', 'TSQM')),
  
  -- Raw responses (stored as JSONB)
  -- Format: {"q1": 2, "q2": 3, ...}
  raw_scores JSONB NOT NULL,
  
  -- Calculated total
  total_score NUMERIC,
  
  -- Burnout index
  burnout_index INTEGER CHECK (burnout_index BETWEEN 0 AND 10),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(patient_id, date, type)
);

CREATE INDEX idx_clinical_assessments_patient_date ON clinical_assessments(patient_id, date DESC);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_metrics_physical_updated_at BEFORE UPDATE ON daily_metrics_physical
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_metrics_mental_updated_at BEFORE UPDATE ON daily_metrics_mental
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_training_sessions_updated_at BEFORE UPDATE ON training_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_spravato_sessions_updated_at BEFORE UPDATE ON spravato_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clinical_assessments_updated_at BEFORE UPDATE ON clinical_assessments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_metrics_physical ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_metrics_mental ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE spravato_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical_assessments ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES: profiles
-- =====================================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Doctors can view all profiles (for patient selection)
CREATE POLICY "Doctors can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'doctor'
    )
  );

-- Patients can view their doctor's profile
CREATE POLICY "Patients can view their doctor"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.doctor_id = profiles.id
    )
  );

-- =====================================================
-- RLS POLICIES: daily_metrics_physical
-- =====================================================

-- Patients can view/insert/update their own metrics
CREATE POLICY "Patients can manage own physical metrics"
  ON daily_metrics_physical FOR ALL
  USING (auth.uid() = patient_id)
  WITH CHECK (auth.uid() = patient_id);

-- Doctors can view their patients' metrics
CREATE POLICY "Doctors can view patients physical metrics"
  ON daily_metrics_physical FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.doctor_id = auth.uid() AND profiles.id = daily_metrics_physical.patient_id
    )
  );

-- =====================================================
-- RLS POLICIES: daily_metrics_mental
-- =====================================================

-- Patients can manage their own mental metrics
CREATE POLICY "Patients can manage own mental metrics"
  ON daily_metrics_mental FOR ALL
  USING (auth.uid() = patient_id)
  WITH CHECK (auth.uid() = patient_id);

-- Doctors can view their patients' mental metrics
CREATE POLICY "Doctors can view patients mental metrics"
  ON daily_metrics_mental FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.doctor_id = auth.uid() AND profiles.id = daily_metrics_mental.patient_id
    )
  );

-- =====================================================
-- RLS POLICIES: training_sessions
-- =====================================================

-- Patients can manage their own training sessions
CREATE POLICY "Patients can manage own training sessions"
  ON training_sessions FOR ALL
  USING (auth.uid() = patient_id)
  WITH CHECK (auth.uid() = patient_id);

-- Doctors can view their patients' training sessions
CREATE POLICY "Doctors can view patients training sessions"
  ON training_sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.doctor_id = auth.uid() AND profiles.id = training_sessions.patient_id
    )
  );

-- =====================================================
-- RLS POLICIES: spravato_sessions
-- =====================================================

-- Patients can manage their own spravato sessions
CREATE POLICY "Patients can manage own spravato sessions"
  ON spravato_sessions FOR ALL
  USING (auth.uid() = patient_id)
  WITH CHECK (auth.uid() = patient_id);

-- Doctors can view their patients' spravato sessions
CREATE POLICY "Doctors can view patients spravato sessions"
  ON spravato_sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.doctor_id = auth.uid() AND profiles.id = spravato_sessions.patient_id
    )
  );

-- =====================================================
-- RLS POLICIES: clinical_assessments
-- =====================================================

-- Patients can manage their own assessments
CREATE POLICY "Patients can manage own assessments"
  ON clinical_assessments FOR ALL
  USING (auth.uid() = patient_id)
  WITH CHECK (auth.uid() = patient_id);

-- Doctors can view their patients' assessments
CREATE POLICY "Doctors can view patients assessments"
  ON clinical_assessments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.doctor_id = auth.uid() AND profiles.id = clinical_assessments.patient_id
    )
  );
