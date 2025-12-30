import { useAuth } from '@/hooks/useAuth';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ClipboardList, Dumbbell, Syringe, FileText, Users, LogOut, Heart, Shield, TrendingUp } from 'lucide-react';
import { WhatsAppButton } from '@/components/shared/WhatsAppButton';

export function Sidebar() {
    const { profile, signOut } = useAuth();

    if (!profile) return null;

    const navLinkClass = ({ isActive }: { isActive: boolean }) =>
        `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
            ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
        }`;

    return (
        <aside className="w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                <div className="text-xl font-bold text-primary-600 dark:text-primary-400">
                    SynthonIA
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    {profile.full_name}
                </p>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                    {profile.role === 'patient' ? 'Paciente' : profile.role === 'doctor' ? 'Médico' : 'Admin'}
                </div>
            </div>

            {/* WhatsApp Group Link */}
            <div className="px-3 mt-4 mb-2">
                <WhatsAppButton
                    groupUrl="https://chat.whatsapp.com/SEU_LINK_AQUI"
                    label="Grupo de Fármaco"
                />
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 space-y-1">
                {/* Patient Routes */}
                {profile.role === 'patient' && (
                    <>
                        <NavLink to="/dashboard" className={navLinkClass}>
                            <LayoutDashboard size={20} />
                            <span>Dashboard</span>
                        </NavLink>
                        <NavLink to="/check-in" className={navLinkClass}>
                            <ClipboardList size={20} />
                            <span>Check-in Diário</span>
                        </NavLink>
                        <NavLink to="/training" className={navLinkClass}>
                            <Dumbbell size={20} />
                            <span>Treino</span>
                        </NavLink>
                        <NavLink to="/spravato" className={navLinkClass}>
                            <Syringe size={20} />
                            <span>Spravato</span>
                        </NavLink>
                        <NavLink to="/assessments" className={navLinkClass}>
                            <FileText size={20} />
                            <span>Questionários</span>
                        </NavLink>
                    </>
                )}

                {/* Doctor Routes */}
                {profile.role === 'doctor' && (
                    <>
                        <NavLink to="/doctor" className={navLinkClass}>
                            <Users size={20} />
                            <span>Meus Pacientes</span>
                        </NavLink>
                        <NavLink to="/statistics" className={navLinkClass}>
                            <TrendingUp size={20} />
                            <span>Estatísticas</span>
                        </NavLink>
                        <NavLink to="/dashboard" className={navLinkClass}>
                            <LayoutDashboard size={20} />
                            <span>Meu Dashboard</span>
                        </NavLink>
                    </>
                )}

                {/* Admin Routes */}
                {profile.role === 'admin' && (
                    <>
                        <NavLink to="/admin" className={navLinkClass}>
                            <Shield size={20} />
                            <span>Painel Admin</span>
                        </NavLink>
                        <NavLink to="/statistics" className={navLinkClass}>
                            <TrendingUp size={20} />
                            <span>Estatísticas</span>
                        </NavLink>
                        <NavLink to="/doctor" className={navLinkClass}>
                            <Users size={20} />
                            <span>Todos Pacientes</span>
                        </NavLink>
                        <NavLink to="/dashboard" className={navLinkClass}>
                            <LayoutDashboard size={20} />
                            <span>Dashboard</span>
                        </NavLink>
                    </>
                )}
            </nav>

            {/* Donation Link */}
            <div className="px-3 mb-2">
                <NavLink to="/doacao" className={navLinkClass}>
                    <Heart size={20} />
                    <span>Projeto Social</span>
                </NavLink>
            </div>

            {/* Logout */}
            <div className="p-3 border-t border-slate-200 dark:border-slate-700">
                <button
                    onClick={() => signOut()}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg w-full text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                    <LogOut size={20} />
                    <span>Sair</span>
                </button>
            </div>
        </aside>
    );
}
