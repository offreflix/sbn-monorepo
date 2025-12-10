import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    userId: string;
    walletId: string;
    categoryId: string;
    amount: number;
    date: string;
    description?: string;
    status: string;
    type: string;
    installments?: number;
    isPaid?: boolean;
  }) {
    const installments =
      data.installments && data.installments > 1 ? data.installments : 1;
    const purchaseGroupId = installments > 1 ? crypto.randomUUID() : null;
    const installmentAmount =
      installments > 1 ? data.amount / installments : data.amount;

    if (installments > 1) {
      const transactions = [];
      const baseDate = new Date(data.date);

      for (let i = 0; i < installments; i++) {
        const date = new Date(baseDate);
        date.setMonth(date.getMonth() + i);

        transactions.push(
          this.prisma.transaction.create({
            data: {
              user_id: data.userId,
              wallet_id: data.walletId,
              category_id: data.categoryId,
              amount: installmentAmount,
              date: date,
              description: data.description
                ? `${data.description} (${i + 1}/${installments})`
                : `Parcela ${i + 1}/${installments}`,
              status: 'PENDENTE', // Future installments are pending usually? Or inherit? Inherit for now but user said "future launches".
              // User Plan: "gera 10 lançamentos futuros".
              // "Lançamentos futuros ... nas faturas".
              type: data.type,
              installment_number: i + 1,
              total_installments: installments,
              purchase_group_id: purchaseGroupId,
              is_paid: data.isPaid && i === 0 ? true : false, // First one might be paid if "today"
            },
          }),
        );
      }
      // Execute all
      return this.prisma.$transaction(transactions);
    }

    return this.prisma.transaction.create({
      data: {
        user_id: data.userId,
        wallet_id: data.walletId,
        category_id: data.categoryId,
        amount: data.amount,
        date: new Date(data.date),
        description: data.description,
        status: data.status,
        type: data.type,
        is_paid: data.isPaid || false,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.transaction.findMany({
      where: { user_id: userId },
      include: {
        wallet: true,
        category: true,
      },
    });
  }
}
