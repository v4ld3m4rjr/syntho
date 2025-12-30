import { Heart, Users, Gift, ExternalLink } from 'lucide-react';

export function DonationPage() {
    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full mb-4">
                    <Heart className="text-white" size={32} />
                </div>
                <h1 className="text-4xl font-bold mb-4">Projeto Social SynthonIA</h1>
                <p className="text-xl text-slate-600 dark:text-slate-400">
                    Saúde mental e física para todos, independente da condição financeira
                </p>
            </div>

            {/* Mission */}
            <div className="card">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <Users className="text-primary-600" size={28} />
                    Nossa Missão
                </h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    O SynthonIA acredita que o acesso a cuidados de saúde mental e física de qualidade
                    é um direito fundamental. Através do nosso projeto social, oferecemos acesso gratuito
                    à plataforma para pessoas em situação de vulnerabilidade social, conectando-as com
                    profissionais voluntários e recursos de monitoramento de saúde.
                </p>
            </div>

            {/* Impact */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="card text-center">
                    <div className="text-4xl font-bold text-primary-600 mb-2">500+</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Pacientes Atendidos</div>
                </div>
                <div className="card text-center">
                    <div className="text-4xl font-bold text-primary-600 mb-2">50+</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Profissionais Voluntários</div>
                </div>
                <div className="card text-center">
                    <div className="text-4xl font-bold text-primary-600 mb-2">100%</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Gratuito para Carentes</div>
                </div>
            </div>

            {/* How to Help */}
            <div className="card">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <Gift className="text-primary-600" size={28} />
                    Como Você Pode Ajudar
                </h2>

                <div className="space-y-6">
                    {/* Doação Financeira */}
                    <div className="border-l-4 border-primary-600 pl-4">
                        <h3 className="text-lg font-semibold mb-2">💰 Doação Financeira</h3>
                        <p className="text-slate-600 dark:text-slate-400 mb-3">
                            Sua contribuição ajuda a manter a plataforma gratuita e a expandir nosso alcance.
                        </p>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <strong>PIX:</strong>
                                <code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                                    doacao@synthonia.app
                                </code>
                            </div>
                            <div className="flex items-center gap-2">
                                <strong>Banco:</strong>
                                <span className="text-sm">Nubank - Ag: 0001 - Conta: 12345678-9</span>
                            </div>
                        </div>
                    </div>

                    {/* Voluntariado */}
                    <div className="border-l-4 border-green-600 pl-4">
                        <h3 className="text-lg font-semibold mb-2">🤝 Seja Voluntário</h3>
                        <p className="text-slate-600 dark:text-slate-400 mb-3">
                            Profissionais de saúde podem se cadastrar como voluntários e atender pacientes gratuitamente.
                        </p>
                        <a
                            href="mailto:voluntario@synthonia.app"
                            className="inline-flex items-center gap-2 text-green-600 dark:text-green-400 hover:underline"
                        >
                            Quero ser voluntário
                            <ExternalLink size={16} />
                        </a>
                    </div>

                    {/* Compartilhe */}
                    <div className="border-l-4 border-blue-600 pl-4">
                        <h3 className="text-lg font-semibold mb-2">📢 Divulgue</h3>
                        <p className="text-slate-600 dark:text-slate-400 mb-3">
                            Compartilhe o SynthonIA com quem precisa. Quanto mais pessoas conhecerem,
                            mais vidas podemos impactar.
                        </p>
                        <div className="flex gap-3">
                            <a
                                href="https://twitter.com/intent/tweet?text=Conheça%20o%20SynthonIA%20-%20Plataforma%20gratuita%20de%20saúde%20mental%20e%20física&url=https://synthonia.app"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-secondary text-sm"
                            >
                                Compartilhar no Twitter
                            </a>
                            <a
                                href="https://www.facebook.com/sharer/sharer.php?u=https://synthonia.app"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-secondary text-sm"
                            >
                                Compartilhar no Facebook
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Transparency */}
            <div className="card bg-gradient-to-br from-primary-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20">
                <h2 className="text-xl font-bold mb-3">🔍 Transparência</h2>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                    Todas as doações são utilizadas exclusivamente para manutenção da plataforma,
                    desenvolvimento de novas funcionalidades e expansão do projeto social.
                    Relatórios financeiros são publicados trimestralmente.
                </p>
            </div>

            {/* Contact */}
            <div className="text-center text-sm text-slate-600 dark:text-slate-400">
                <p>Dúvidas sobre o projeto social?</p>
                <a
                    href="mailto:social@synthonia.app"
                    className="text-primary-600 dark:text-primary-400 hover:underline"
                >
                    social@synthonia.app
                </a>
            </div>
        </div>
    );
}
