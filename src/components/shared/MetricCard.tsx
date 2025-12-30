import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon?: LucideIcon;
    color?: 'primary' | 'success' | 'warning' | 'danger';
}

export function MetricCard({ title, value, subtitle, icon: Icon, color = 'primary' }: MetricCardProps) {
    const colorClasses = {
        primary: 'text-primary-600 bg-primary-50 dark:bg-primary-900/20',
        success: 'text-medical-success bg-green-50 dark:bg-green-900/20',
        warning: 'text-medical-warning bg-orange-50 dark:bg-orange-900/20',
        danger: 'text-medical-danger bg-red-50 dark:bg-red-900/20',
    };

    return (
        <div className="card">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">{title}</div>
                    <div className="text-3xl font-bold mb-1">{value}</div>
                    {subtitle && (
                        <div className="text-xs text-slate-500 dark:text-slate-500">{subtitle}</div>
                    )}
                </div>
                {Icon && (
                    <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
                        <Icon size={24} />
                    </div>
                )}
            </div>
        </div>
    );
}
