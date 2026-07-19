# AgendaPro

Software de agendamento e gestão para negócios de beleza e cuidados pessoais (salões, barbearias, clínicas de estética): clientes, serviços, funcionários, agendamentos e financeiro em um só painel.

## Visão geral

- Multi-tenant por organização (`Organization`), com usuários vinculados via `Membership` (papéis `OWNER`, `ADMIN`, `MEMBER`).
- Módulos: dashboard, clientes, serviços, funcionários, agendamentos, financeiro, notificações, relatórios e configurações.
- Autenticação via Supabase Auth; dados de negócio em PostgreSQL via Prisma.
- Toda rota do painel é privada — acesso exige sessão válida.

## Tecnologias

- [Next.js 16](https://nextjs.org) (App Router, Turbopack)
- [React 19](https://react.dev)
- [TypeScript](https://www.typescriptlang.org)
- [Prisma 7](https://www.prisma.io) + `@prisma/adapter-pg` (PostgreSQL)
- [Supabase](https://supabase.com) (Auth + `@supabase/ssr`)
- [Tailwind CSS 4](https://tailwindcss.com) + `@base-ui/react` + `shadcn`
- [React Hook Form](https://react-hook-form.com) + [Zod](https://zod.dev)
- [TanStack Query](https://tanstack.com/query)
- [Recharts](https://recharts.org) (gráficos do dashboard)
- [pdf-lib](https://pdf-lib.js.org) (exportação de relatórios)

## Instalação

Pré-requisitos: Node.js 20+, um banco PostgreSQL e um projeto Supabase.

```bash
npm install
```

## Variáveis de ambiente

Copie `.env.example` para `.env` e preencha com os valores reais:

```bash
cp .env.example .env
```

| Variável | Descrição |
|---|---|
| `DATABASE_URL` | Connection string do PostgreSQL, usada pelo Prisma. |
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto Supabase. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave anônima (pública) do Supabase, usada no client e no proxy de autenticação. |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave de service role do Supabase (uso administrativo/servidor). |
| `NEXT_PUBLIC_SITE_URL` | URL pública do site, usada em metadata/SEO. |

O `.env` nunca deve ser commitado (já está no `.gitignore`).

## Banco de dados

PostgreSQL, acessado via Prisma com o adapter `@prisma/adapter-pg`. O client gerado fica em `src/lib/generated/prisma` (não versionado) e a instância singleton em `src/lib/db.ts`.

Modelos principais: `User`, `Organization`, `Membership`, `Customer`, `Service`, `Employee`, `Appointment`, `Transaction`, `BusinessHours`, `Notification`.

## Prisma

Schema em `prisma/schema.prisma`, config em `prisma.config.ts` (lê `DATABASE_URL` do `.env` via `dotenv/config`).

```bash
# aplicar migrations existentes (ambiente local/dev)
npx prisma migrate dev

# aplicar migrations em produção
npx prisma migrate deploy

# gerar o Prisma Client após alterar o schema
npx prisma generate

# abrir o Prisma Studio
npx prisma studio
```

## Autenticação

Supabase Auth via `@supabase/ssr`:

- `src/lib/supabase/client.ts` — client para uso no browser.
- `src/lib/supabase/server.ts` — client para Server Components/Actions, com cookies.
- `src/proxy.ts` — proxy (antigo middleware) que revalida a sessão em cada request e redireciona não autenticados para `/login` e autenticados para fora de `/login`/`/signup`.
- `src/lib/auth/dal.ts` — camada de acesso a dados de sessão/usuário/organização ativa, usada por Server Components e Server Actions.

## Execução

```bash
# ambiente de desenvolvimento
npm run dev

# lint
npm run lint
```

A aplicação sobe em [http://localhost:3000](http://localhost:3000).

## Build

```bash
npm run build
npm run start
```

`npm run build` gera o build de produção (Turbopack); `npm run start` serve o build gerado.

## Deploy

1. Provisionar PostgreSQL e projeto Supabase de produção.
2. Configurar as variáveis de ambiente (ver seção acima) no provedor de hospedagem.
3. Rodar `npx prisma migrate deploy` contra o banco de produção.
4. Rodar `npm run build` e `npm run start` (ou usar o build integrado do provedor, ex. Vercel).

Recomendado: Vercel (suporte nativo a Next.js). Qualquer host Node.js também funciona, desde que rode `next build` seguido de `next start`.
