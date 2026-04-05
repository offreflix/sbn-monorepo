import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WalletsRepository {
  constructor(private prisma: PrismaService) {}

  findByIdAndUser(id: string, userId: string) {
    return this.prisma.wallet.findFirst({ where: { id, userId } });
  }

  findAllByUser(userId: string) {
    return this.prisma.wallet.findMany({ where: { userId } });
  }

  updateBalance(id: string, increment: number) {
    return this.prisma.wallet.update({
      where: { id },
      data: { balance: { increment } },
    });
  }
}
