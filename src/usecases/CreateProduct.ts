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
