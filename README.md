# NoSmoke 🚭

Sistema de redução gradual de cigarro com gamificação por XP.

## ✨ Funcionalidades

### Usuário (Leo)

- **Dashboard**: visualiza consumo do dia, meta, XP e alertas
- **Pedir cigarro**: solicita 0.5 ou 1.0 cigarro, escolhe 2 motivos
- **Missões**: diárias e semanais para ganhar XP
- **Loja**: troca XP por recompensas (massagem, esportes, etc)
- **Progresso**: gráficos de consumo dos últimos 14 dias

### Admin (Leticia)

- **Pendentes**: aprova ou recusa pedidos e resgates
- **Histórico**: vê todos os pedidos com filtros
- **Config**: define metas diárias e configurações do sistema

## 🛠️ Stack

- **Next.js 15** (App Router)
- **TypeScript**
- **TailwindCSS + shadcn/ui**
- **Prisma ORM**
- **PostgreSQL** (Vercel Postgres / Neon)
- **Auth.js** (NextAuth v5)
- **date-fns-tz** (timezone Brasília)
- **Recharts** (gráficos)
- **Zod** (validação)

## 🚀 Setup Local

### 1. Clone e instale dependências

```bash
cd nosmoke
npm install
```

### 2. Configure variáveis de ambiente

Copie o arquivo de exemplo:

```bash
cp .env.example .env
```

Edite `.env` com suas credenciais:

```env
# Database (Vercel Postgres ou Neon)
DATABASE_URL="postgresql://user:password@host:5432/nosmoke?sslmode=require"

# NextAuth (gere um secret com: openssl rand -base64 32)
AUTH_SECRET="sua-chave-secreta-aqui-32-chars"
AUTH_URL="http://localhost:3000"
```

### 3. Setup do banco de dados

```bash
# Gera o cliente Prisma
npm run postinstall

# Cria as tabelas no banco
npm run db:push

# Popula com dados iniciais (usuários, recompensas, missões)
npm run db:seed
```

### 4. Rode o projeto

```bash
npm run dev
```

Acesse: **http://localhost:3000**

### 5. Credenciais de teste

| Role    | Email               | Senha    |
| ------- | ------------------- | -------- |
| Admin   | leticia@nosmoke.app | admin123 |
| Usuário | leo@nosmoke.app     | user123  |

## 📦 Deploy na Vercel

### 1. Conecte o repositório

1. Faça push do código para o GitHub
2. Acesse [vercel.com](https://vercel.com) e importe o projeto
3. Vercel detecta Next.js automaticamente

### 2. Configure o banco de dados

**Opção A: Vercel Postgres**

1. No dashboard Vercel, vá em "Storage" > "Create Database" > "Postgres"
2. Conecte ao projeto - variáveis são adicionadas automaticamente

**Opção B: Neon**

1. Crie um banco em [neon.tech](https://neon.tech)
2. Copie a connection string
3. Adicione `DATABASE_URL` nas env vars do projeto Vercel

### 3. Variáveis de ambiente

No dashboard Vercel, em Settings > Environment Variables, adicione:

```
DATABASE_URL=sua_connection_string
AUTH_SECRET=sua_chave_secreta
AUTH_URL=https://seu-projeto.vercel.app
```

### 4. Deploy

O deploy acontece automaticamente em cada push para `main`.

Para rodar o seed em produção (primeira vez):

```bash
npx vercel env pull .env.local
npm run db:seed
```

## 📁 Estrutura do Projeto

```
src/
├── app/
│   ├── api/auth/          # NextAuth API routes
│   ├── app/               # Páginas do usuário
│   │   ├── page.tsx       # Dashboard
│   │   ├── pedir/         # Pedir cigarro
│   │   ├── missoes/       # Missões
│   │   ├── loja/          # Loja de recompensas
│   │   └── progresso/     # Gráficos
│   ├── admin/             # Páginas do admin
│   │   ├── page.tsx       # Pendentes
│   │   ├── historico/     # Histórico
│   │   └── config/        # Configurações
│   ├── login/             # Login
│   ├── layout.tsx         # Layout global
│   └── page.tsx           # Redirect inicial
├── actions/               # Server Actions
│   ├── admin.ts           # Ações do admin
│   ├── cig-request.ts     # Pedidos de cigarro
│   ├── dashboard.ts       # Dashboard e missões
│   └── rewards.ts         # Recompensas
├── components/
│   ├── ui/                # shadcn/ui components
│   └── *.tsx              # Componentes customizados
├── lib/
│   ├── auth.ts            # Config NextAuth
│   ├── prisma.ts          # Cliente Prisma
│   ├── date-utils.ts      # Funções de data (Brasília)
│   ├── calculations.ts    # Cálculos (XP, alertas, etc)
│   ├── validations.ts     # Schemas Zod
│   └── utils.ts           # Utilitários gerais
└── middleware.ts          # Proteção de rotas
```

## 🎯 Regras de Negócio

### Pedidos

- Quantidades: 0.5 ou 1.0 cigarro
- Sempre 2 motivos diferentes
- Pedido fica pendente até admin aprovar

### Alertas

- **Alerta vermelho**: total do dia > 3.5
- **Alerta amarelo**: hoje > 30% acima da média dos últimos 7 dias

### XP e Extras

- Pedidos acima da meta diária = "extra"
- Extra 0.5 = 12 XP de custo
- Extra 1.0 = 20 XP de custo
- Se rejeitado, XP é devolvido

### Recompensas

- Massagem 15min = 30 XP
- Voucher especial = 190 XP
- Esportes juntos = 220 XP
- Cassino = 600 XP
- Limite: 1x ao dia cada

### Missões

- Diárias resetam à meia-noite (Brasília)
- Semanais resetam no domingo
- XP é concedido ao completar

## 🕐 Timezone

Todo o sistema usa **America/Sao_Paulo** (UTC-3).

- Reset do dia: 00:00 Brasília
- Semana: domingo a sábado

## 📝 Scripts disponíveis

```bash
npm run dev          # Desenvolvimento
npm run build        # Build para produção
npm run start        # Rodar build localmente
npm run db:push      # Sincroniza schema com banco
npm run db:migrate   # Cria migration
npm run db:seed      # Popula banco inicial
npm run db:studio    # Interface visual do Prisma
```

## 🔒 Segurança

- Autenticação com JWT (Auth.js)
- Middleware protege rotas por role
- Server Actions validam role e input (Zod)
- XP calculado no servidor (ledger auditável)
- Senhas hasheadas com bcrypt

---

Feito com 💜 para ajudar na redução do cigarro
