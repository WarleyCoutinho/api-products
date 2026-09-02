import { NotFoundError } from "../errors/index.js";
import { ProductStatus } from "../generated/prisma/enums.js";
import { prisma } from "../lib/db.js";

// Data Transfer Object
interface InputDto {
  userId: string;
  productId: string;
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

export class GetProduct {
  async execute(dto: InputDto): Promise<OutputDto> {
    const product = await prisma.product.findUnique({
      where: { id: dto.productId },
    });

    if (!product || product.userId !== dto.userId) {
      throw new NotFoundError("Product not found");
    }

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
