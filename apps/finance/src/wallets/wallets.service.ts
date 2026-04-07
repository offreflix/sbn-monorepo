import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateWalletDto } from './dto/update-wallet.dto';

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
        userId: data.userId,
        name: data.name,
        type: data.type,
        balance: data.balance || 0,
        currency: data.currency || 'BRL',
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.wallet.findMany({
      where: { userId: userId },
    });
  }

  async findOne(id: string, userId: string) {
    const wallet = await this.prisma.wallet.findFirst({
      where: { id, userId: userId },
    });
    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }
    return wallet;
  }

  async update(id: string, userId: string, data: UpdateWalletDto) {
    await this.findOne(id, userId); // Verify ownership

    return this.prisma.wallet.update({
      where: { id },
      data,
    });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId); // Verify ownership

    // Logical delete or soft delete?
    // Using deletedAt as per schema (paranoid)
    return this.prisma.wallet.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
