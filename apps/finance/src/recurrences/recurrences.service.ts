import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionsRepository } from '../transactions/transactions.repository';
import { WalletsRepository } from '../wallets/wallets.repository';
import { BalanceService } from '../transactions/balance.service';
import { RecurrenceQueueService } from './recurrence-queue.service';
import { CreateRecurrenceDto } from './dto/create-recurrence.dto';

@Injectable()
export class RecurrencesService {
  private readonly logger = new Logger(RecurrencesService.name);

  constructor(
    private prisma: PrismaService,
    private txRepo: TransactionsRepository,
    private walletsRepo: WalletsRepository,
    private balanceService: BalanceService,
    private queueService: RecurrenceQueueService,
  ) {}

  async create(data: CreateRecurrenceDto & { userId: string }) {
    const recurrence = await this.prisma.recurrence.create({
      data: {
        userId: data.userId,
        walletId: data.walletId,
        categoryId: data.categoryId,
        amount: data.amount,
        type: data.type,
        frequency: data.frequency,
        timezone: data.timezone ?? 'America/Sao_Paulo',
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        description: data.description,
      },
    });

    await this.queueService.scheduleNext(
      recurrence.id,
      recurrence.frequency,
      recurrence.startDate,
      recurrence.timezone,
    );

    return recurrence;
  }

  async findAll(userId: string) {
    return this.prisma.recurrence.findMany({
      where: { userId, deletedAt: null },
      include: { wallet: true, category: true },
    });
  }

  async findOne(id: string, userId: string) {
    const recurrence = await this.prisma.recurrence.findFirst({
      where: { id, userId },
      include: { wallet: true, category: true },
    });
    if (!recurrence) {
      throw new NotFoundException('Recurrence not found');
    }
    return recurrence;
  }

  async update(id: string, userId: string, data: any) {
    const existing = await this.findOne(id, userId);

    const updateData: any = { ...data };
    if (data.startDate) updateData.startDate = new Date(data.startDate);
    if (data.endDate) updateData.endDate = new Date(data.endDate);
    delete updateData.userId;
    delete updateData.id;

    const updated = await this.prisma.recurrence.update({
      where: { id },
      data: updateData,
    });

    // If frequency or startDate changed, reschedule the job
    const frequencyChanged =
      data.frequency && data.frequency !== existing.frequency;
    const startDateChanged =
      data.startDate && data.startDate !== existing.startDate.toISOString();
    if (frequencyChanged || startDateChanged) {
      await this.queueService.scheduleNext(
        updated.id,
        updated.frequency,
        updated.startDate,
        updated.timezone,
      );
    }

    return updated;
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);

    // Cancel the pending job before soft-deleting
    await this.queueService.cancel(id);

    return this.prisma.recurrence.update({
      where: { id },
      data: { deletedAt: new Date(), active: false },
    });
  }

  /**
   * Called by the Jobs worker to generate the next transaction for a recurrence.
   * Uses x-internal-key header for service-to-service auth.
   */
  async triggerTransaction(
    recurrenceId: string,
  ): Promise<{ transactionId: string }> {
    const recurrence = await this.prisma.recurrence.findFirst({
      where: { id: recurrenceId, deletedAt: null, active: true },
      include: { wallet: true },
    });

    if (!recurrence) {
      throw new NotFoundException(
        `Recurrence ${recurrenceId} not found or inactive`,
      );
    }

    const walletIsCredit = this.balanceService.isCreditCard(
      recurrence.wallet.type,
    );

    const transaction = await this.txRepo.create({
      userId: recurrence.userId,
      walletId: recurrence.walletId,
      categoryId: recurrence.categoryId,
      amount: Number(recurrence.amount),
      date: new Date(),
      description: recurrence.description ?? undefined,
      tags: [],
      status: 'Pendente',
      type: recurrence.type,
      isPaid: false,
      recurrenceId: recurrence.id,
    });

    await this.balanceService.applyBalance(
      {
        walletId: transaction.walletId,
        isPaid: transaction.isPaid,
        type: transaction.type,
        amount: transaction.amount,
      },
      walletIsCredit,
    );

    await this.prisma.recurrence.update({
      where: { id: recurrenceId },
      data: { lastGenerated: new Date() },
    });

    this.logger.log(
      `Generated transaction ${transaction.id} for recurrence ${recurrenceId} (${recurrence.description})`,
    );

    return { transactionId: transaction.id };
  }
}
