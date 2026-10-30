# Sabtec — Orçamentos e Termos de Garantia

Sistema web (PWA) para geração de orçamentos e termos de garantia em PDF com identidade visual Sabtec.

## Stack
- Next.js 16 (App Router) + TypeScript
- Tailwind CSS v4 + shadcn/ui (custom)
- Prisma + SQLite (dev) / PostgreSQL (prod)
- @react-pdf/renderer para PDFs
- Vitest (unit) + Playwright (e2e)

## Setup
```bash
export PATH="$HOME/.local/node/bin:$PATH"
npm install
cp .env.example .env   # ajuste DATABASE_URL
npx prisma db push
npm run dev
```

## Variáveis de ambiente
- `DATABASE_URL` — caminho do banco (ex.: `file:/.../prisma/dev.db`)
- `RESEND_API_KEY` / `RESEND_FROM` — envio de e-mail
- `NEXT_PUBLIC_APP_URL` — URL pública (portal/QR)
- `OPENAI_API_KEY` / `OPENAI_MODEL` / `OPENAI_VISION_MODEL` — IA

## Comandos
- `npm run dev` — desenvolvimento
- `npm run build` — build de produção
- `npm run test` — testes unitários
- `npm run test:e2e` — testes E2E
- `npm run lint` — lint

## Backup
```bash
./scripts/backup.sh
```

## LGPD
- Consentimento registrado em `Customer.consentAt`.
- Exportação: `GET /api/privacy/export?customerId=...`
- Anonimização: `POST /api/privacy/delete { customerId }`

## Runbook (produção)
1. Definir `DATABASE_URL` para PostgreSQL.
2. `npx prisma migrate deploy`
3. `npm run build && npm start`
4. Configurar domínio e HTTPS.
5. Ativar backups diários do banco.