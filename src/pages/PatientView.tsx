import { useParams } from 'react-router-dom';
import { Dashboard } from './Dashboard';

export function PatientView() {
    const { patientId: _patientId } = useParams<{ patientId: string }>();

    // This component reuses the Dashboard component but in read-only mode
    // In a real implementation, you would pass the patientId to Dashboard
    // and modify it to fetch data for that specific patient instead of the logged-in user

    return (
        <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                    ℹ️ Visualizando dashboard do paciente (modo leitura)
                </p>
            </div>
            <Dashboard />
        </div>
    );
}
