# Organizador OPECVAR

## O que e este projeto
Sistema de gestao de demandas para a equipe OPECVAR. Monorepo com frontend React e backend Node.js.

## Stack
- **Frontend**: React 18 + TypeScript + Vite + MUI 5 + DataGrid + Recharts + @dnd-kit + Axios + Day.js
- **Backend**: Node.js + Express + TypeScript + Prisma ORM + Zod + JWT + bcrypt
- **Banco**: PostgreSQL (schema em `backend/prisma/schema.prisma`)
- **Monorepo**: npm workspaces (root package.json)

## Estrutura
```
Organizador_OPECVAR/
├── backend/
│   ├── prisma/schema.prisma, seed.ts
│   └── src/
│       ├── index.ts          # Express app entry
│       ├── config/            # env.ts, database.ts (PrismaClient singleton)
│       ├── middleware/        # auth.ts (JWT), errorHandler.ts, validate.ts (Zod)
│       ├── routes/            # index.ts, auth.routes.ts
│       ├── controllers/       # auth.controller.ts
│       ├── services/          # auth.service.ts
│       ├── schemas/           # auth.schema.ts (Zod)
│       └── utils/             # jwt.ts, password.ts, dateHelpers.ts
├── frontend/
│   └── src/
│       ├── api/client.ts      # Axios com JWT interceptor
│       ├── context/           # AuthContext.tsx, ThemeContext.tsx
│       ├── types/             # task.ts, user.ts, dashboard.ts, common.ts
│       ├── pages/             # LoginPage.tsx
│       ├── components/
│       │   ├── auth/          # LoginForm.tsx, ProtectedRoute.tsx
│       │   ├── layout/        # AppShell.tsx, TopBar.tsx, Sidebar.tsx
│       │   └── common/        # StatusChip.tsx, PriorityChip.tsx, ConfirmDialog.tsx
│       └── utils/             # dateUtils.ts, formatters.ts
├── package.json               # Workspaces root
└── tsconfig.base.json
```

## Modelos Prisma
User, Bucket, Label, Task, TaskLabel, TaskNote, TaskHistory, TimerSession
- Enums: Role (ANALYST, MANAGER), Priority (LOW-URGENT), Status (NOT_STARTED-CANCELED)

## Credenciais do seed
- Admin: admin@opecvar.com / admin123 (MANAGER)
- 3 analistas de teste

## Status de Implementacao

| Fase | Descricao | Status | Commit |
|------|-----------|--------|--------|
| 1 | Esqueleto do Projeto (monorepo, schemas, seed, tipos, tema) | Concluida | 645db84 |
| 2 | Autenticacao (JWT, login/register, middleware, UI) | Concluida | e58df28 |
| 3 | CRUD Core (Tasks, Buckets, Labels services/controllers/routes + API clients/hooks) | Concluida | adecaa5 |
| 4 | Tela Principal (TaskDataGrid, filtros, destaque visual, TaskDetailPanel) | Concluida | 7b89873 |
| 5 | Timer e Horas (start/stop timer, useTimer, TaskTimer) | Concluida | - |
| 6 | Fila Drag-and-Drop por Analista (reorder, AnalystQueue, QueueCard, @dnd-kit) | Pendente | - |
| 7 | Dashboard Semanal (agregacoes, WeekSelector, SummaryCards, Recharts) | Pendente | - |
| 8 | Export + Polish (CSV/XLSX, SettingsPage, dark mode toggle, loading states) | Pendente | - |

## Proxima fase: 6 - Fila Drag-and-Drop por Analista
Backend: reorder endpoint
Frontend: AnalystQueue, QueueCard, @dnd-kit integration

## Comandos uteis
```bash
# Instalar dependencias (na raiz)
npm install

# Gerar Prisma client
npm run prisma:generate --workspace=backend

# Rodar seed
npm run prisma:seed --workspace=backend

# Rodar backend (dev)
npm run dev --workspace=backend

# Rodar frontend (dev)
npm run dev --workspace=frontend
```

## Preferencias do usuario
- Executar fase por fase, pausando entre cada uma para revisao
- Usar 4 agentes especializados por fase: Funcionalidade, Visual, Qualidade, Git Master
- Comunicacao em portugues
- Codigo e nomes tecnicos em ingles
