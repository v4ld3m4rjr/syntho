import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { AuthForm } from './components/auth/AuthForm';
import { OnboardingFlow } from './components/auth/OnboardingFlow';
import { AppShell } from './components/layout/AppShell';
import { LoadingSpinner } from './components/shared/LoadingSpinner';
import { Dashboard } from './pages/Dashboard';
import { DailyCheckIn } from './pages/DailyCheckIn';
import { TrainingLog } from './pages/TrainingLog';
import { SpravatoSession } from './pages/SpravatoSession';
import { ClinicalAssessments } from './pages/ClinicalAssessments';
import { DoctorDashboard } from './pages/DoctorDashboard';
import { PatientView } from './pages/PatientView';
import { DonationPage } from './pages/DonationPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { ScientificStats } from './pages/ScientificStats';

function App() {
    console.log('App component rendering');

    try {
        const { user, profile, loading, signUp, signIn } = useAuth();
        console.log('Auth state:', { user: !!user, profile: !!profile, loading });

        if (loading) {
            console.log('Showing loading spinner');
            return <LoadingSpinner />;
        }

        // Not authenticated
        if (!user) {
            console.log('No user, showing auth form');
            return <AuthForm onSignUp={signUp} onSignIn={signIn} />;
        }

        // Authenticated but no profile (needs onboarding)
        if (!profile) {
            console.log('User but no profile, showing onboarding');
            return (
                <OnboardingFlow
                    userId={user.id}
                    email={user.email || ''}
                    onComplete={() => window.location.reload()}
                />
            );
        }

        // Authenticated with profile
        console.log('User and profile exist, showing main app');
        return (
            <BrowserRouter>
                <AppShell>
                    <Routes>
                        {/* Patient Routes */}
                        {profile.role === 'patient' && (
                            <>
                                <Route path="/dashboard" element={<Dashboard />} />
                                <Route path="/check-in" element={<DailyCheckIn />} />
                                <Route path="/training" element={<TrainingLog />} />
                                <Route path="/spravato" element={<SpravatoSession />} />
                                <Route path="/assessments" element={<ClinicalAssessments />} />
                                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                            </>
                        )}

                        {/* Doctor Routes */}
                        {profile.role === 'doctor' && (
                            <>
                                <Route path="/doctor" element={<DoctorDashboard />} />
                                <Route path="/patient/:patientId" element={<PatientView />} />
                                <Route path="/statistics" element={<ScientificStats />} />
                                <Route path="/dashboard" element={<Dashboard />} />
                                <Route path="/" element={<Navigate to="/doctor" replace />} />
                            </>
                        )}

                        {/* Admin Routes */}
                        {profile.role === 'admin' && (
                            <>
                                <Route path="/admin" element={<AdminDashboard />} />
                                <Route path="/statistics" element={<ScientificStats />} />
                                <Route path="/doctor" element={<DoctorDashboard />} />
                                <Route path="/patient/:patientId" element={<PatientView />} />
                                <Route path="/dashboard" element={<Dashboard />} />
                                <Route path="/" element={<Navigate to="/admin" replace />} />
                            </>
                        )}

                        {/* Shared Routes (all roles) */}
                        <Route path="/doacao" element={<DonationPage />} />

                        {/* Fallback */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </AppShell>
            </BrowserRouter>
        );
    } catch (error) {
        console.error('Error in App component:', error);
        return (
            <div className="min-h-screen flex items-center justify-center bg-red-50">
                <div className="card max-w-md">
                    <h1 className="text-2xl font-bold text-red-600 mb-4">Erro na Aplicação</h1>
                    <p className="text-sm text-slate-700">
                        {error instanceof Error ? error.message : 'Erro desconhecido'}
                    </p>
                    <p className="text-xs text-slate-500 mt-4">
                        Verifique o console para mais detalhes
                    </p>
                </div>
            </div>
        );
    }
}

export default App;
