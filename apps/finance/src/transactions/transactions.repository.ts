import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client-finance';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TransactionsRepository {
  constructor(private prisma: PrismaService) {}

  findMany(
    where: Prisma.TransactionWhereInput,
    options?: {
      include?: Prisma.TransactionInclude;
      orderBy?: Prisma.TransactionOrderByWithRelationInput;
    },
  ) {
    return this.prisma.transaction.findMany({
      where,
      include: options?.include,
      orderBy: options?.orderBy,
    });
  }

  findFirst(
    where: Prisma.TransactionWhereInput,
    include?: Prisma.TransactionInclude,
  ) {
    return this.prisma.transaction.findFirst({ where, include });
  }

  findByPurchaseGroup(
    purchaseGroupId: string,
    userId: string,
    options?: {
      orderBy?: Prisma.TransactionOrderByWithRelationInput;
    },
  ) {
    return this.prisma.transaction.findMany({
      where: { purchaseGroupId, userId },
      orderBy: options?.orderBy,
    });
  }

  create(
    data:
      | Prisma.TransactionCreateInput
      | Prisma.TransactionUncheckedCreateInput,
  ) {
    return this.prisma.transaction.create({ data });
  }

  createMany<T>(creates: Prisma.PrismaPromise<T>[]): Promise<T[]> {
    return this.prisma.$transaction(creates);
  }

  update(id: string, data: Prisma.TransactionUpdateInput) {
    return this.prisma.transaction.update({ where: { id }, data });
  }

  delete(id: string) {
    return this.prisma.transaction.delete({ where: { id } });
  }

  deleteMany(where: Prisma.TransactionWhereInput) {
    return this.prisma.transaction.deleteMany({ where });
  }

  createRecurrence(
    data: Prisma.RecurrenceCreateInput | Prisma.RecurrenceUncheckedCreateInput,
  ) {
    return this.prisma.recurrence.create({ data });
  }
}
