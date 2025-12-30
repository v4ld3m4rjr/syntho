import { MessageCircle } from 'lucide-react';

interface WhatsAppButtonProps {
    groupUrl: string;
    label?: string;
    className?: string;
}

export function WhatsAppButton({
    groupUrl,
    label = "Grupo de Compartilhamento de Fármaco",
    className = ""
}: WhatsAppButtonProps) {
    return (
        <a
            href={groupUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors ${className}`}
        >
            <MessageCircle className="text-green-600 dark:text-green-400" size={20} />
            <span className="text-sm font-medium text-green-700 dark:text-green-300">
                {label}
            </span>
        </a>
    );
}
