import { fromNodeHeaders } from "better-auth/node";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";

import { NotFoundError } from "../errors/index.js";
import { auth } from "../lib/auth.js";
import {
  CreateProductBodySchema,
  ErrorSchema,
  ListProductsQuerySchema,
  ListProductsSchema,
  ProductSchema,
  UpdateProductBodySchema,
} from "../schemas/index.js";
import { CreateProduct } from "../usecases/CreateProduct.js";
import { DeleteProduct } from "../usecases/DeleteProduct.js";
import { GetProduct } from "../usecases/GetProduct.js";
import { ListProducts } from "../usecases/ListProducts.js";
import { UpdateProduct } from "../usecases/UpdateProduct.js";

export const productRoutes = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/",
    schema: {
      operationId: "listProducts",
      tags: ["Product"],
      summary: "List products",
      querystring: ListProductsQuerySchema,
      response: {
        200: ListProductsSchema,
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

        const listProducts = new ListProducts();
        const result = await listProducts.execute({
          userId: session.user.id,
          status: request.query.status,
          page: request.query.page,
          limit: request.query.limit,
        });

        return reply.status(200).send(result);
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

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "PATCH",
    url: "/:productId",
    schema: {
      operationId: "updateProduct",
      tags: ["Product"],
      summary: "Update a product",
      params: z.object({
        productId: z.uuid(),
      }),
      body: UpdateProductBodySchema,
      response: {
        200: ProductSchema,
        400: ErrorSchema,
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

        const updateProduct = new UpdateProduct();
        const result = await updateProduct.execute({
          userId: session.user.id,
          productId: request.params.productId,
          name: request.body.name,
          description: request.body.description,
          priceInCents: request.body.priceInCents,
          status: request.body.status,
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

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "DELETE",
    url: "/:productId",
    schema: {
      operationId: "deleteProduct",
      tags: ["Product"],
      summary: "Delete a product",
      params: z.object({
        productId: z.uuid(),
      }),
      response: {
        204: z.null(),
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

        const deleteProduct = new DeleteProduct();
        await deleteProduct.execute({
          userId: session.user.id,
          productId: request.params.productId,
        });

        return reply.status(204).send(null);
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
