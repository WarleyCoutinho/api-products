import { ProductStatus } from "../generated/prisma/enums.js";
import { prisma } from "../lib/db.js";

// Data Transfer Object
interface InputDto {
  userId: string;
  status?: ProductStatus;
  page: number;
  limit: number;
}

interface OutputDto {
  data: Array<{
    id: string;
    name: string;
    description: string;
    priceInCents: number;
    status: ProductStatus;
    createdAt: string;
    updatedAt: string;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class ListProducts {
  async execute(dto: InputDto): Promise<OutputDto> {
    const where = {
      userId: dto.userId,
      ...(dto.status !== undefined ? { status: dto.status } : {}),
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (dto.page - 1) * dto.limit,
        take: dto.limit,
      }),
      prisma.product.count({ where }),
    ]);

    return {
      data: products.map((product) => ({
        id: product.id,
        name: product.name,
        description: product.description,
        priceInCents: product.priceInCents,
        status: product.status,
        createdAt: product.createdAt.toISOString(),
        updatedAt: product.updatedAt.toISOString(),
      })),
      pagination: {
        page: dto.page,
        limit: dto.limit,
        total,
        totalPages: Math.ceil(total / dto.limit),
      },
    };
  }
}
