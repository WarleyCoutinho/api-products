# Products API

> API REST de referência construída com **Fastify 5**, **TypeScript**, **Prisma 7** e **Better-Auth**, demonstrando um CRUD completo (Produtos) sobre a arquitetura em camadas (`Routes → Use Cases → Prisma`) que

Não é um boilerplate genérico: é o mesmo padrão de autenticação por sessão, validação com Zod, tratamento de erros e documentação OpenAPI (Swagger + Scalar) que roda em produção em sistemas entregues pela Adapticode — aqui exposto com um domínio simples (Produtos) só pra servir de referência pública e ponto de partida pra novos projetos.

## Stack

- **Backend:** Fastify 5, TypeScript (strict), Zod 4
- **Banco:** PostgreSQL 16 + Prisma 7 (adapter `pg`)
- **Autenticação:** Better-Auth (sessão + OAuth Google)
- **Docs:** Swagger/OpenAPI + Scalar UI (`/docs`)

## Arquitetura

```
Route (validação Zod + sessão) → Use Case (regra de negócio) → Prisma
```

Cada camada tem uma responsabilidade única — rotas nunca contêm regra de negócio, use cases nunca tratam erro HTTP, e todo recurso "de um usuário" verifica _ownership_ antes de expor ou alterar dado (404, nunca 403, pra não vazar existência de recurso de terceiro).

## Rodando localmente

```bash
docker-compose up -d
pnpm install
cp .env.example .env   # preencha as variáveis
pnpm exec prisma migrate dev
pnpm exec prisma generate
pnpm dev
```

API em `http://localhost:3378`, docs em `http://localhost:3378/docs`.

---

Desenvolvido por **[Warley Coutinho](https://adapticode.com.br)** — desenvolvimento de software sob medida (apps mobile, sistemas web, SaaS).
📩 contatoadapticode@gmail.com · 📱 WhatsApp +55 62 9 9152-7514
