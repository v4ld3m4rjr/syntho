import { AlertCircle, AlertTriangle, Info, CheckCircle } from 'lucide-react';

interface AlertCardProps {
    type: 'success' | 'warning' | 'danger' | 'info';
    title?: string;
    message: string;
    value?: number;
}

export function AlertCard({ type, title, message, value }: AlertCardProps) {
    const icons = {
        success: CheckCircle,
        warning: AlertTriangle,
        danger: AlertCircle,
        info: Info,
    };

    const Icon = icons[type];

    return (
        <div className={`alert-${type} flex items-start gap-3`}>
            <Icon size={24} className="flex-shrink-0 mt-0.5" />
            <div className="flex-1">
                {title && <div className="font-semibold mb-1">{title}</div>}
                <div className="text-sm">{message}</div>
                {value !== undefined && (
                    <div className="text-xs mt-1 opacity-75">Valor: {value}/10</div>
                )}
            </div>
        </div>
    );
}
