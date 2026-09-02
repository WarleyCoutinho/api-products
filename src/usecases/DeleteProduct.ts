import { NotFoundError } from "../errors/index.js";
import { prisma } from "../lib/db.js";

// Data Transfer Object
interface InputDto {
  userId: string;
  productId: string;
}

export class DeleteProduct {
  async execute(dto: InputDto): Promise<void> {
    const existingProduct = await prisma.product.findUnique({
      where: { id: dto.productId },
    });

    if (!existingProduct || existingProduct.userId !== dto.userId) {
      throw new NotFoundError("Product not found");
    }

    await prisma.product.delete({ where: { id: dto.productId } });
  }
}
