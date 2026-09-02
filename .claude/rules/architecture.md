## Git

- **SEMPRE** use [Conventional Commits](https://www.conventionalcommits.org/) para mensagens de commit. Exemplo: `feat: add product delete endpoint`, `fix: product price validation`, `docs: update architecture rules`.
- **NUNCA** faça commit sem a permissão explícita do usuário. Sempre aguarde o usuário pedir para commitar.

## Fastify: Rotas de API

- **SEMPRE** siga os princípios do REST para criar rotas. Exemplo: `GET /products`, `GET /products/:id`.
- **SEMPRE** crie os arquivos das rotas em @src/routes.
- **SEMPRE** use `fastify-type-provider-zod` para definir os schemas de request e response de uma rota.
- **SEMPRE** use Zod v4, **NUNCA** use o Zod v3.
- **SEMPRE** crie os schemas das operações de criação e atualização dentro de @src/schemas/index.ts.
- **SEMPRE** use `z.enum(ProductStatus)` importado de `../generated/prisma/enums.js` para tipar o campo de status nos schemas. **NUNCA** use `z.string()` para representar um enum do Prisma.
- **SEMPRE** use o @src/schemas/index.ts para tipar respostas de erro.
- Uma rota **NUNCA** deve conter regras de negócio, apenas validações de dados (com o Zod) e de autenticação (se necessário).
- Quando uma rota precisar ser protegida (acessível apenas por usuários autenticados), **SEMPRE** use o `auth.api.getSession` (@src/lib/auth.ts) para recuperar a sessão do usuário.
- Uma rota deve **SEMPRE** instanciar e chamar um use case.
- **SEMPRE** trate os erros lançados pelo use case.
- **SEMPRE** inclua `tags` e `summary` no schema da rota para documentação no Swagger/OpenAPI.
- Um recurso que suporta as 5 operações de CRUD deve expor exatamente: `GET /:resource`, `POST /:resource`, `GET /:resource/:id`, `PATCH /:resource/:id`, `DELETE /:resource/:id`.
- Em `GET/PATCH/DELETE /:resource/:id`, o use case deve verificar se o recurso pertence ao usuário autenticado. Caso não pertença (ou não exista), lance `NotFoundError` — **NUNCA** retorne 403, para não vazar a existência de um recurso de outro usuário.
- Uma exclusão bem-sucedida deve responder `204` com `send(null)` (o response schema `z.null()` exige o argumento explícito).

### Exemplo:

```ts
import { fromNodeHeaders } from "better-auth/node";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";

import { NotFoundError } from "../errors/index.js";
import { auth } from "../lib/auth.js";
import {
  CreateProductBodySchema,
  ErrorSchema,
  ProductSchema,
} from "../schemas/index.js";
import { CreateProduct } from "../usecases/CreateProduct.js";
import { GetProduct } from "../usecases/GetProduct.js";

export const productRoutes = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/",
    schema: {
      operationId: "createProduct",
      tags: ["Product"],
      summary: "Create a product",
      body: CreateProductBodySchema,
      response: {
        201: ProductSchema,
        400: ErrorSchema,
        401: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      try {
        const session = await auth.api.getSession({
          headers: fromNodeHeaders(request.headers),
        });
        if (!session) {
          return reply.status(401).send({
            error: "Unauthorized",
            code: "UNAUTHORIZED",
          });
        }

        const createProduct = new CreateProduct();
        const result = await createProduct.execute({
          userId: session.user.id,
          name: request.body.name,
          description: request.body.description,
          priceInCents: request.body.priceInCents,
          status: request.body.status,
        });

        return reply.status(201).send(result);
      } catch (error) {
        app.log.error(error);

        return reply.status(500).send({
          error: "Internal server error",
          code: "INTERNAL_SERVER_ERROR",
        });
      }
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/:productId",
    schema: {
      operationId: "getProduct",
      tags: ["Product"],
      summary: "Get a product",
      params: z.object({
        productId: z.uuid(),
      }),
      response: {
        200: ProductSchema,
        401: ErrorSchema,
        404: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      try {
        const session = await auth.api.getSession({
          headers: fromNodeHeaders(request.headers),
        });
        if (!session) {
          return reply.status(401).send({
            error: "Unauthorized",
            code: "UNAUTHORIZED",
          });
        }

        const getProduct = new GetProduct();
        const result = await getProduct.execute({
          userId: session.user.id,
          productId: request.params.productId,
        });

        return reply.status(200).send(result);
      } catch (error) {
        app.log.error(error);

        if (error instanceof NotFoundError) {
          return reply.status(404).send({
            error: error.message,
            code: "NOT_FOUND_ERROR",
          });
        }

        return reply.status(500).send({
          error: "Internal server error",
          code: "INTERNAL_SERVER_ERROR",
        });
      }
    },
  });
};
```

> Rota completa de referência (com `POST`, `GET` (list + by id), `PATCH` e `DELETE`) em @src/routes/product.ts.

## Use Cases

- Todas as regras de negócio devem estar concentradas dentro de um use case.
- Todos os use cases devem ser criados em @src/usecases.
- Todos os use cases devem ser classes, com um método `execute`.
- Todos os use cases devem ser nomeados com verbos.
- Quando um use case receber um parâmetro, ele deve **SEMPRE** ser um DTO (`InputDto`), que é uma interface definida no mesmo arquivo.
- O retorno de um use case deve **SEMPRE** ser tipado com uma interface `OutputDto`, definida no mesmo arquivo. O use case deve mapear o resultado do banco para o `OutputDto`, **NUNCA** retornando o model do Prisma diretamente. Isso garante desacoplamento entre a camada de negócio e o banco de dados.
- Ao precisar interagir com o banco de dados, um use case deve **SEMPRE** chamar o Prisma diretamente, e não um repository.
- **NUNCA** lide com erros nos use cases. Quem lida com os erros (com try, catch) é sempre a rota @src/routes.
- Caso um use case lance uma exceção, deve ser **SEMPRE** lançado um erro customizado. Esses erros ficam em @src/errors/index.ts. Caso um erro necessário não exista, crie-o.
- Em use cases de `get`/`update`/`delete` de um recurso pertencente a um usuário, **SEMPRE** busque o recurso primeiro e valide `recurso.userId === dto.userId` antes de agir sobre ele, lançando `NotFoundError` caso não pertença.

### Exemplo:

```ts
import { ProductStatus } from "../generated/prisma/enums.js";
import { prisma } from "../lib/db.js";

// Data Transfer Object
interface InputDto {
  userId: string;
  name: string;
  description: string;
  priceInCents: number;
  status?: ProductStatus;
}

interface OutputDto {
  id: string;
  name: string;
  description: string;
  priceInCents: number;
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
}

export class CreateProduct {
  async execute(dto: InputDto): Promise<OutputDto> {
    const product = await prisma.product.create({
      data: {
        id: crypto.randomUUID(),
        name: dto.name,
        description: dto.description,
        priceInCents: dto.priceInCents,
        status: dto.status ?? "ACTIVE",
        userId: dto.userId,
      },
    });

    return {
      id: product.id,
      name: product.name,
      description: product.description,
      priceInCents: product.priceInCents,
      status: product.status,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    };
  }
}
```

> Exemplo de use case com verificação de ownership (`get`) em @src/usecases/GetProduct.ts.
