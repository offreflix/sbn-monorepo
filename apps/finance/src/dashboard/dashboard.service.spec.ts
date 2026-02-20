import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from './dashboard.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrismaService = {
  wallet: {
    findMany: jest.fn(),
  },
  transaction: {
    findMany: jest.fn(),
  },
};

describe('DashboardService', () => {
  let service: DashboardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getSummary', () => {
    it('should sum balance of non-credit-card wallets', async () => {
      mockPrismaService.wallet.findMany.mockResolvedValue([
        { id: 'w1', type: 'Conta Corrente', balance: 1000 },
        { id: 'w2', type: 'Poupança', balance: 500 },
      ]);
      mockPrismaService.transaction.findMany.mockResolvedValue([]);

      const result = await service.getSummary('u1', 1, 2024);

      expect(result.cards.balance).toBe(1500);
      expect(result.cards.currentInvoice).toBe(0);
      expect(result.cards.nextInvoice).toBe(0);
    });

    it('should calculate currentInvoice and nextInvoice for credit card with invoiceClosingDay', async () => {
      const year = 2024;
      const month = 2;
      // Previous closing: Jan 15. Current closing: Feb 15.
      // Tx1 on Feb 10 → between Jan15 and Feb15 → currentInvoice
      // Tx2 on Feb 20 → after Feb 15 → nextInvoice

      mockPrismaService.wallet.findMany.mockResolvedValue([
        { id: 'cc1', type: 'Cartão de Crédito', balance: 0, invoiceClosingDay: 15 },
      ]);

      const ccTx1Date = new Date(year, month - 1, 10);
      const ccTx2Date = new Date(year, month - 1, 20);

      mockPrismaService.transaction.findMany
        .mockResolvedValueOnce([
          // CC transactions
          { id: 't1', walletId: 'cc1', amount: 200, type: 'Despesa', date: ccTx1Date, status: 'Pendente' },
          { id: 't2', walletId: 'cc1', amount: 300, type: 'Despesa', date: ccTx2Date, status: 'Pendente' },
        ])
        .mockResolvedValueOnce([]); // month transactions

      const result = await service.getSummary('u1', month, year);

      expect(result.cards.currentInvoice).toBe(200);
      expect(result.cards.nextInvoice).toBe(300);
      expect(result.cards.totalInvoices).toBe(500);
    });

    it('should use calendar month fallback for credit card without invoiceClosingDay', async () => {
      const year = 2024;
      const month = 2;

      mockPrismaService.wallet.findMany.mockResolvedValue([
        { id: 'cc1', type: 'Cartão de Crédito', balance: 0, invoiceClosingDay: null },
      ]);

      const inMonthDate = new Date(year, month - 1, 15);
      const afterMonthDate = new Date(year, month, 5);

      mockPrismaService.transaction.findMany
        .mockResolvedValueOnce([
          { id: 't1', walletId: 'cc1', amount: 150, type: 'Despesa', date: inMonthDate, status: 'Pendente' },
          { id: 't2', walletId: 'cc1', amount: 250, type: 'Despesa', date: afterMonthDate, status: 'Pendente' },
        ])
        .mockResolvedValueOnce([]);

      const result = await service.getSummary('u1', month, year);

      expect(result.cards.currentInvoice).toBe(150);
      expect(result.cards.nextInvoice).toBe(250);
    });

    it('should calculate income, expense and periodBalance from month transactions', async () => {
      mockPrismaService.wallet.findMany.mockResolvedValue([]);
      mockPrismaService.transaction.findMany
        .mockResolvedValueOnce([]) // cc transactions (empty wallets)
        .mockResolvedValueOnce([
          { type: 'Receita', amount: 3000 },
          { type: 'Receita', amount: 500 },
          { type: 'Despesa', amount: 1200 },
        ]);

      const result = await service.getSummary('u1', 1, 2024);

      expect(result.overview.income).toBe(3500);
      expect(result.overview.expense).toBe(1200);
      expect(result.overview.balance).toBe(2300);
    });
  });

  describe('getYearOverview', () => {
    it('should aggregate transactions by month', async () => {
      mockPrismaService.transaction.findMany.mockResolvedValue([
        { date: new Date(2024, 0, 15), amount: 1000, type: 'Receita' },
        { date: new Date(2024, 0, 20), amount: 400, type: 'Despesa' },
        { date: new Date(2024, 5, 10), amount: 2000, type: 'Receita' },
      ]);

      const result = await service.getYearOverview('u1', 2024);

      expect(result.year).toBe(2024);
      expect(result.months[0].income).toBe(1000);
      expect(result.months[0].expense).toBe(400);
      expect(result.months[0].balance).toBe(600);
      expect(result.months[5].income).toBe(2000);
    });

    it('should return correct totals', async () => {
      mockPrismaService.transaction.findMany.mockResolvedValue([
        { date: new Date(2024, 0, 1), amount: 500, type: 'Receita' },
        { date: new Date(2024, 1, 1), amount: 200, type: 'Despesa' },
      ]);

      const result = await service.getYearOverview('u1', 2024);

      expect(result.totals.income).toBe(500);
      expect(result.totals.expense).toBe(200);
      expect(result.totals.balance).toBe(300);
    });

    it('should include days aggregations within months', async () => {
      mockPrismaService.transaction.findMany.mockResolvedValue([
        { date: new Date(2024, 0, 10), amount: 100, type: 'Receita' },
        { date: new Date(2024, 0, 10), amount: 50, type: 'Despesa' },
        { date: new Date(2024, 0, 15), amount: 200, type: 'Receita' },
      ]);

      const result = await service.getYearOverview('u1', 2024);

      const jan = result.months[0];
      const day10 = jan.days.find((d) => d.day === 10);
      const day15 = jan.days.find((d) => d.day === 15);

      expect(day10).toBeDefined();
      expect(day10?.income).toBe(100);
      expect(day10?.expense).toBe(50);
      expect(day15?.income).toBe(200);
    });

    it('should use current year when no year is given', async () => {
      mockPrismaService.transaction.findMany.mockResolvedValue([]);

      const result = await service.getYearOverview('u1', 0);

      expect(result.year).toBe(new Date().getFullYear());
    });
  });

  describe('getCategories', () => {
    it('should return income and expense breakdown with percentages', async () => {
      mockPrismaService.transaction.findMany.mockResolvedValue([
        { type: 'Receita', amount: 100, category: { name: 'Salário' } },
        { type: 'Receita', amount: 300, category: { name: 'Freelance' } },
        { type: 'Despesa', amount: 200, category: { name: 'Alimentação' } },
        { type: 'Despesa', amount: 200, category: { name: 'Transporte' } },
      ]);

      const result = await service.getCategories('u1', 1, 2024);

      expect(result.income).toHaveLength(2);
      expect(result.expense).toHaveLength(2);

      const freelance = result.income.find((i) => i.name === 'Freelance');
      expect(freelance?.percentage).toBeCloseTo(75);

      const salario = result.income.find((i) => i.name === 'Salário');
      expect(salario?.percentage).toBeCloseTo(25);
    });

    it('should use "Outros" for transactions without a category', async () => {
      mockPrismaService.transaction.findMany.mockResolvedValue([
        { type: 'Despesa', amount: 100, category: null },
        { type: 'Despesa', amount: 50, category: null },
      ]);

      const result = await service.getCategories('u1', 1, 2024);

      expect(result.expense).toHaveLength(1);
      expect(result.expense[0].name).toBe('Outros');
      expect(result.expense[0].value).toBe(150);
    });
  });
});
