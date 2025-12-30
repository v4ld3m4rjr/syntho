-- =====================================================
-- ATUALIZAÇÃO: Adicionar role 'admin' e políticas RLS
-- Execute este SQL no Supabase SQL Editor
-- =====================================================

-- 1. Atualizar constraint de role para incluir 'admin'
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
  CHECK (role IN ('patient', 'doctor', 'admin'));

-- 2. Criar conta admin
-- IMPORTANTE: Execute isso DEPOIS de criar o usuário admin@synthonia.app no Supabase Auth
-- Substitua 'USER_ID_DO_ADMIN' pelo ID do usuário criado

-- Primeiro, crie o usuário no Supabase Auth:
-- Email: admin@synthonia.app
-- Senha: V4ld@01

-- Depois, execute (substituindo o ID):
-- INSERT INTO profiles (id, email, role, full_name, created_at, updated_at)
-- VALUES (
--   'USER_ID_DO_ADMIN',  -- Substitua pelo ID real
--   'admin@synthonia.app',
--   'admin',
--   'Administrador SynthonIA',
--   NOW(),
--   NOW()
-- );

-- 3. Políticas RLS para Admin (acesso total)

-- Admin pode ver todos os perfis
CREATE POLICY "Admin can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Admin pode atualizar todos os perfis
CREATE POLICY "Admin can update all profiles"
  ON profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Admin pode ver todas as métricas físicas
CREATE POLICY "Admin can view all physical metrics"
  ON daily_metrics_physical FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Admin pode ver todas as métricas mentais
CREATE POLICY "Admin can view all mental metrics"
  ON daily_metrics_mental FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Admin pode ver todas as sessões de treino
CREATE POLICY "Admin can view all training sessions"
  ON training_sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Admin pode ver todas as sessões de Spravato
CREATE POLICY "Admin can view all spravato sessions"
  ON spravato_sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Admin pode ver todos os questionários clínicos
CREATE POLICY "Admin can view all assessments"
  ON clinical_assessments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );
