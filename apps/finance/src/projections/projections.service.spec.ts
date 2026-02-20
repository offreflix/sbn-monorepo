import { Test, TestingModule } from '@nestjs/testing';
import { ProjectionsService } from './projections.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrismaService = {
  wallet: {
    findMany: jest.fn(),
  },
  transaction: {
    findMany: jest.fn(),
  },
  recurrence: {
    findMany: jest.fn(),
  },
};

describe('ProjectionsService', () => {
  let service: ProjectionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectionsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ProjectionsService>(ProjectionsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getProjection', () => {
    it('should return empty timeline when no transactions or recurrences', async () => {
      mockPrismaService.wallet.findMany.mockResolvedValue([{ id: 'w1', balance: 1000 }]);
      mockPrismaService.transaction.findMany.mockResolvedValue([]);
      mockPrismaService.recurrence.findMany.mockResolvedValue([]);

      const result = await service.getProjection('u1', 3);

      expect(result).toEqual([]);
    });

    it('should generate simulated events for MONTHLY recurrence', async () => {
      mockPrismaService.wallet.findMany.mockResolvedValue([{ id: 'w1', balance: 5000 }]);
      mockPrismaService.transaction.findMany.mockResolvedValue([]);

      const startDate = new Date();
      mockPrismaService.recurrence.findMany.mockResolvedValue([
        {
          id: 'rec1',
          amount: 500,
          type: 'EXPENSE',
          description: 'Aluguel',
          frequency: 'MONTHLY',
          startDate: new Date(startDate.getFullYear(), startDate.getMonth(), 1),
          endDate: null,
          active: true,
        },
      ]);

      const result = await service.getProjection('u1', 2);

      // Should have at least one event from monthly recurrence
      expect(result.length).toBeGreaterThanOrEqual(1);
      expect(result[0]).toHaveProperty('balance');
      expect(result[0]).toHaveProperty('date');
    });

    it('should generate simulated events for WEEKLY recurrence', async () => {
      mockPrismaService.wallet.findMany.mockResolvedValue([{ id: 'w1', balance: 2000 }]);
      mockPrismaService.transaction.findMany.mockResolvedValue([]);

      const startDate = new Date();
      mockPrismaService.recurrence.findMany.mockResolvedValue([
        {
          id: 'rec1',
          amount: 100,
          type: 'EXPENSE',
          description: 'Lanche semanal',
          frequency: 'WEEKLY',
          startDate: new Date(startDate.getFullYear(), startDate.getMonth(), 1),
          endDate: null,
          active: true,
        },
      ]);

      const result = await service.getProjection('u1', 1);

      // Weekly over 1 month should produce ~4 events
      expect(result.length).toBeGreaterThanOrEqual(3);
    });

    it('should respect endDate of recurrence', async () => {
      mockPrismaService.wallet.findMany.mockResolvedValue([{ id: 'w1', balance: 1000 }]);
      mockPrismaService.transaction.findMany.mockResolvedValue([]);

      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 5); // ends in 5 days

      mockPrismaService.recurrence.findMany.mockResolvedValue([
        {
          id: 'rec1',
          amount: 50,
          type: 'EXPENSE',
          description: 'Short recurrence',
          frequency: 'WEEKLY',
          startDate: new Date(startDate),
          endDate: endDate,
          active: true,
        },
      ]);

      const result = await service.getProjection('u1', 3);

      // With only 5 days window and weekly frequency, should have at most 1 event
      expect(result.length).toBeLessThanOrEqual(1);
    });

    it('should map credit card transactions to due date', async () => {
      mockPrismaService.wallet.findMany.mockResolvedValue([{ id: 'w1', balance: 1000 }]);
      mockPrismaService.recurrence.findMany.mockResolvedValue([]);

      const txDate = new Date();
      txDate.setDate(10); // day 10, closing day 20 → +1 month to due
      const ccWallet = {
        id: 'cc1',
        type: 'CREDIT_CARD',
        invoiceDueDay: 5,
        invoiceClosingDay: 20,
      };

      mockPrismaService.transaction.findMany.mockResolvedValue([
        {
          id: 'tx1',
          amount: 300,
          type: 'EXPENSE',
          description: 'Compra CC',
          date: txDate,
          wallet: ccWallet,
        },
      ]);

      const result = await service.getProjection('u1', 2);

      // The event date should be shifted to the due date (day 05)
      expect(result.length).toBe(1);
      // Due date should be next month with dueDay=5 (txDate.day=10 <= closingDay=20 → +1 month)
      expect(result[0].date).toMatch(/-05$/);
    });

    it('calculateDueDate: date <= closingDay should add 1 month', async () => {
      mockPrismaService.wallet.findMany.mockResolvedValue([]);
      mockPrismaService.recurrence.findMany.mockResolvedValue([]);

      // Build a transaction with date on day 5, closingDay 20 → due next month
      const txDate = new Date(2024, 0, 5); // Jan 5
      mockPrismaService.transaction.findMany.mockResolvedValue([
        {
          id: 'tx1',
          amount: 100,
          type: 'EXPENSE',
          description: 'CC txn',
          date: txDate,
          wallet: { id: 'cc1', type: 'CREDIT_CARD', invoiceDueDay: 10, invoiceClosingDay: 20 },
        },
      ]);

      const result = await service.getProjection('u1', 6);

      // Due month should be Feb (Jan + 1), dueDay=10
      expect(result.length).toBe(1);
      expect(result[0].date).toMatch(/^2024-02/);
    });

    it('calculateDueDate: date > closingDay should add 2 months', async () => {
      mockPrismaService.wallet.findMany.mockResolvedValue([]);
      mockPrismaService.recurrence.findMany.mockResolvedValue([]);

      // transaction day 25, closingDay 20 → +2 months
      const txDate = new Date(2024, 0, 25); // Jan 25
      mockPrismaService.transaction.findMany.mockResolvedValue([
        {
          id: 'tx1',
          amount: 100,
          type: 'EXPENSE',
          description: 'CC txn next invoice',
          date: txDate,
          wallet: { id: 'cc1', type: 'CREDIT_CARD', invoiceDueDay: 10, invoiceClosingDay: 20 },
        },
      ]);

      const result = await service.getProjection('u1', 6);

      expect(result.length).toBe(1);
      // Due month should be March (Jan + 2)
      expect(result[0].date).toMatch(/^2024-03/);
    });

    it('calculateDueDate: no closingDay should return original transaction date', async () => {
      mockPrismaService.wallet.findMany.mockResolvedValue([]);
      mockPrismaService.recurrence.findMany.mockResolvedValue([]);

      const txDate = new Date(2024, 0, 15);
      mockPrismaService.transaction.findMany.mockResolvedValue([
        {
          id: 'tx1',
          amount: 100,
          type: 'EXPENSE',
          description: 'CC no closing',
          date: txDate,
          wallet: { id: 'cc1', type: 'CREDIT_CARD', invoiceDueDay: 5, invoiceClosingDay: null },
        },
      ]);

      const result = await service.getProjection('u1', 6);

      expect(result.length).toBe(1);
      // No closingDay → date unchanged, should still be in Jan 2024
      expect(result[0].date).toMatch(/^2024-01/);
    });
  });
});
