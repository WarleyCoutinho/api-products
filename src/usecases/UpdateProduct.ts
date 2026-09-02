import { NotFoundError } from "../errors/index.js";
import { ProductStatus } from "../generated/prisma/enums.js";
import { prisma } from "../lib/db.js";

// Data Transfer Object
interface InputDto {
  userId: string;
  productId: string;
  name?: string;
  description?: string;
  priceInCents?: number;
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

export class UpdateProduct {
  async execute(dto: InputDto): Promise<OutputDto> {
    const existingProduct = await prisma.product.findUnique({
      where: { id: dto.productId },
    });

    if (!existingProduct || existingProduct.userId !== dto.userId) {
      throw new NotFoundError("Product not found");
    }

    const product = await prisma.product.update({
      where: { id: dto.productId },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.description !== undefined
          ? { description: dto.description }
          : {}),
        ...(dto.priceInCents !== undefined
          ? { priceInCents: dto.priceInCents }
          : {}),
        ...(dto.status !== undefined ? { status: dto.status } : {}),
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
