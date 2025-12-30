# Health Monitoring PWA

Aplicação web PWA para monitoramento integrativo de saúde física e mental, conectando pacientes aos seus médicos/terapeutas.

## 🚀 Stack Tecnológico

- **Frontend:** React 18 + Vite + TypeScript
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Charts:** Recharts
- **Backend/Database:** Supabase (Auth, Postgres, RLS)
- **Router:** React Router Dom v6
- **PWA:** Vite PWA Plugin

## 📋 Pré-requisitos

1. Node.js 18+ instalado
2. Conta no Supabase (gratuita)
3. Git (opcional)

## 🔧 Configuração

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Supabase

1. Crie um projeto no [Supabase](https://supabase.com)
2. No SQL Editor do Supabase, execute o arquivo `supabase/schema.sql`
3. Copie a URL do projeto e a chave anônima (anon key)

### 3. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```bash
cp .env.example .env
```

Edite o arquivo `.env` e adicione suas credenciais do Supabase:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_aqui
```

## 🏃 Executar Localmente

```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`

## 🏗️ Build para Produção

```bash
npm run build
```

Os arquivos otimizados estarão na pasta `dist/`

## 📦 Deploy no Netlify

1. Conecte seu repositório ao Netlify
2. Configure as variáveis de ambiente no painel do Netlify
3. O deploy será automático a cada push

Ou use o Netlify CLI:

```bash
npm install -g netlify-cli
netlify deploy --prod
```

## 🎯 Funcionalidades

### Para Pacientes

- ✅ Check-in diário (métricas físicas e mentais)
- ✅ Registro de treinos com cálculo automático de carga
- ✅ Registro de sessões de Spravato (esketamina)
- ✅ Questionários clínicos (PHQ-9, GAD-7)
- ✅ Dashboard com métricas e alertas
- ✅ Cálculos ACWR (Acute:Chronic Workload Ratio)
- ✅ Alertas de risco (mania, suicídio, lesão)
- ✅ Numerologia personalizada

### Para Médicos/Terapeutas

- ✅ Lista de pacientes vinculados
- ✅ Filtros por nível de risco
- ✅ Visualização de dashboards dos pacientes
- ✅ Alertas em tempo real

## 🔐 Segurança

- Autenticação via Supabase Auth
- Row Level Security (RLS) configurado
- Pacientes veem apenas seus dados
- Médicos veem apenas dados dos pacientes vinculados

## 📊 Cálculos Implementados

### Físicos
- Carga Interna (Duração × RPE)
- Tonelagem Total
- Monotonia e Strain
- ACWR (ATL, CTL, TSB)
- Janela de Lesão

### Mentais
- Scores PHQ-9 e GAD-7
- Alertas de mania
- Alertas de risco suicida
- Risk Score geral do paciente

## 🎨 Temas

A aplicação suporta modo claro e escuro automaticamente baseado nas preferências do sistema.

## 📱 PWA

A aplicação pode ser instalada como um app nativo em dispositivos móveis e desktop.

## 🤝 Contribuindo

Este é um projeto de demonstração. Para uso em produção, considere:

- Adicionar testes automatizados
- Implementar mais questionários clínicos
- Adicionar notificações push
- Implementar sincronização offline
- Adicionar mais validações de dados

## 📄 Licença

MIT

## ⚠️ Aviso Importante

Esta aplicação lida com dados sensíveis de saúde. Certifique-se de:

1. Revisar as políticas RLS antes do deploy
2. Consultar profissionais de saúde para validar thresholds de alerta
3. Implementar backups regulares
4. Seguir regulamentações de privacidade (LGPD, HIPAA, etc.)
5. **NUNCA** use esta aplicação como substituto para atendimento médico profissional

## 🆘 Suporte

Para emergências de saúde mental no Brasil:
- CVV (Centro de Valorização da Vida): 188
- SAMU: 192
- Emergência: 190/193
