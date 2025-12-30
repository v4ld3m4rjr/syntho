import { NavLink } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
    LayoutDashboard,
    ClipboardList,
    Dumbbell,
    Pill,
    FileText,
    Users,
    LogOut,
    Activity
} from 'lucide-react';

export function Sidebar() {
    const { profile, signOut } = useAuth();

    const patientLinks = [
        { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/check-in', icon: ClipboardList, label: 'Check-in Diário' },
        { to: '/training', icon: Dumbbell, label: 'Treino' },
        { to: '/spravato', icon: Pill, label: 'Spravato' },
        { to: '/assessments', icon: FileText, label: 'Questionários' },
    ];

    const doctorLinks = [
        { to: '/doctor', icon: Users, label: 'Meus Pacientes' },
        { to: '/dashboard', icon: Activity, label: 'Meu Dashboard' },
    ];

    const links = profile?.role === 'doctor' ? doctorLinks : patientLinks;

    return (
        <aside className="w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                <h1 className="text-xl font-bold text-primary-600">Health Monitor</h1>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    {profile?.full_name}
                </p>
                <span className="text-xs text-slate-500 dark:text-slate-500 capitalize">
                    {profile?.role === 'doctor' ? 'Profissional' : 'Paciente'}
                </span>
            </div>

            <nav className="flex-1 p-4 space-y-1">
                {links.map((link) => (
                    <NavLink
                        key={link.to}
                        to={link.to}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                            }`
                        }
                    >
                        <link.icon size={20} />
                        <span className="font-medium">{link.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                <button
                    onClick={() => signOut()}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg w-full text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                    <LogOut size={20} />
                    <span className="font-medium">Sair</span>
                </button>
            </div>
        </aside>
    );
}
