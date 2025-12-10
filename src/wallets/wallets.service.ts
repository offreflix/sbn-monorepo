import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WalletsService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    userId: string;
    name: string;
    type: string;
    balance?: number;
    currency?: string;
  }) {
    return this.prisma.wallet.create({
      data: {
        user_id: data.userId,
        name: data.name,
        type: data.type,
        balance: data.balance || 0,
        currency: data.currency || 'BRL',
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.wallet.findMany({
      where: { user_id: userId },
    });
  }

  async findOne(id: string, userId: string) {
    const wallet = await this.prisma.wallet.findFirst({
      where: { id, user_id: userId },
    });
    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }
    return wallet;
  }
}
