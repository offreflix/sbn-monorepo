import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsService } from './transactions.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateTransactionDto,
  TransactionType,
  TransactionStatus,
} from './dto/create-transaction.dto';
import { NotFoundException } from '@nestjs/common';

jest.mock('pdf-parse', () => jest.fn());

const mockPrismaService = {
  transaction: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    $transaction: jest.fn(),
  },
  wallet: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
  },
  category: {
    findMany: jest.fn(),
    create: jest.fn(),
  },
  $transaction: jest.fn(),
};

describe('TransactionsService', () => {
  let service: TransactionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a transaction and update wallet balance when isPaid', async () => {
      const dto: CreateTransactionDto = {
        walletId: 'w1',
        categoryId: 'c1',
        amount: 100,
        date: new Date().toISOString(),
        type: TransactionType.Receita,
        status: TransactionStatus.Pago,
        isPaid: true,
      };

      const mockWallet = { id: 'w1', userId: 'u1', balance: 50 };
      mockPrismaService.wallet.findFirst.mockResolvedValue(mockWallet);

      const createdTx = { id: 'tx1', walletId: 'w1', type: 'Receita', amount: 100, isPaid: true };
      mockPrismaService.transaction.create.mockResolvedValue(createdTx);

      const result = await service.create('u1', dto);

      expect(mockPrismaService.wallet.findFirst).toHaveBeenCalledWith({
        where: { id: 'w1', userId: 'u1' },
      });
      expect(mockPrismaService.wallet.update).toHaveBeenCalledWith({
        where: { id: 'w1' },
        data: { balance: { increment: 100 } },
      });
      expect(result).toEqual(createdTx);
    });

    it('should throw NotFoundException if wallet does not exist', async () => {
      mockPrismaService.wallet.findFirst.mockResolvedValue(null);
      const dto: CreateTransactionDto = {
        walletId: 'w1',
        categoryId: 'c1',
        amount: 100,
        date: '2023-01-01',
        type: TransactionType.Despesa,
      };

      await expect(service.create('u1', dto)).rejects.toThrow(NotFoundException);
    });

    it('should create multiple installments when installments > 1', async () => {
      const dto: CreateTransactionDto = {
        walletId: 'w1',
        categoryId: 'c1',
        amount: 300,
        date: new Date('2024-01-01').toISOString(),
        type: TransactionType.Despesa,
        installments: 3,
        isPaid: false,
      };

      const mockWallet = { id: 'w1', userId: 'u1', balance: 1000 };
      mockPrismaService.wallet.findFirst.mockResolvedValue(mockWallet);

      const mockCreated = [
        { id: 'tx1', walletId: 'w1', amount: 100, type: 'Despesa', isPaid: false },
        { id: 'tx2', walletId: 'w1', amount: 100, type: 'Despesa', isPaid: false },
        { id: 'tx3', walletId: 'w1', amount: 100, type: 'Despesa', isPaid: false },
      ];
      mockPrismaService.$transaction.mockResolvedValue(mockCreated);

      const result = await service.create('u1', dto);

      expect(mockPrismaService.$transaction).toHaveBeenCalled();
      expect(result).toEqual(mockCreated);
    });

    it('should create a recurrence when isRecurring is true', async () => {
      const mockWallet = { id: 'w1', userId: 'u1', balance: 1000 };
      mockPrismaService.wallet.findFirst.mockResolvedValue(mockWallet);

      const createdRecurrence = { id: 'rec1' };
      mockPrismaService.transaction.create.mockImplementation((args) => {
        if (args && args.data && args.data.frequency !== undefined) {
          return Promise.resolve(createdRecurrence);
        }
        return Promise.resolve({ id: 'tx1', walletId: 'w1', type: 'Despesa', amount: 100, isPaid: false });
      });

      // Access the recurrence mock through prisma mock
      (mockPrismaService as any).recurrence = {
        create: jest.fn().mockResolvedValue({ id: 'rec1' }),
      };

      const dto: any = {
        walletId: 'w1',
        categoryId: 'c1',
        amount: 100,
        date: '2024-01-01',
        type: TransactionType.Despesa,
        isRecurring: true,
        frequency: 'MONTHLY',
      };

      mockPrismaService.transaction.create.mockResolvedValue({
        id: 'tx1', walletId: 'w1', type: 'Despesa', amount: 100, isPaid: false,
      });

      const result = await service.create('u1', dto);
      expect(result).toBeDefined();
    });
  });

  describe('findAll', () => {
    it('should return all transactions without date filter', async () => {
      mockPrismaService.transaction.findMany.mockResolvedValue([{ id: 'tx1' }]);

      const result = await service.findAll('u1');

      expect(mockPrismaService.transaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: 'u1' } }),
      );
      expect(result).toHaveLength(1);
    });

    it('should filter by month and year when provided', async () => {
      mockPrismaService.transaction.findMany.mockResolvedValue([]);

      await service.findAll('u1', 2, 2024);

      const call = mockPrismaService.transaction.findMany.mock.calls[0][0];
      expect(call.where.date).toBeDefined();
      expect(call.where.date.gte).toEqual(new Date(2024, 1, 1));
    });
  });

  describe('findOne', () => {
    it('should return a transaction by id', async () => {
      mockPrismaService.transaction.findFirst.mockResolvedValue({ id: 'tx1', userId: 'u1' });

      const result = await service.findOne('tx1', 'u1');

      expect(result).toEqual({ id: 'tx1', userId: 'u1' });
    });
  });

  describe('update', () => {
    it('should throw error when transaction not found', async () => {
      mockPrismaService.transaction.findFirst.mockResolvedValue(null);

      await expect(service.update('tx1', 'u1', {})).rejects.toThrow('Transaction not found or denied access');
    });

    it('should revert balance when transaction was previously paid', async () => {
      const existingTx = { id: 'tx1', walletId: 'w1', type: 'Receita', amount: 100, isPaid: true };
      const updatedTx = { id: 'tx1', walletId: 'w1', type: 'Receita', amount: 100, isPaid: true };

      mockPrismaService.transaction.findFirst.mockResolvedValue(existingTx);
      mockPrismaService.transaction.update.mockResolvedValue(updatedTx);

      await service.update('tx1', 'u1', { description: 'Updated' });

      // Should first revert: Receita was +100, so revert is -100
      expect(mockPrismaService.wallet.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { balance: { increment: -100 } },
        }),
      );
    });

    it('should apply new balance when updated transaction is paid', async () => {
      const existingTx = { id: 'tx1', walletId: 'w1', type: 'Despesa', amount: 100, isPaid: false };
      const updatedTx = { id: 'tx1', walletId: 'w1', type: 'Despesa', amount: 100, isPaid: true };

      mockPrismaService.transaction.findFirst.mockResolvedValue(existingTx);
      mockPrismaService.transaction.update.mockResolvedValue(updatedTx);

      await service.update('tx1', 'u1', { isPaid: true });

      // Should apply: Despesa paid → -100
      expect(mockPrismaService.wallet.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { balance: { increment: -100 } },
        }),
      );
    });

    it('should sync status to Pago when isPaid=true', async () => {
      const existingTx = { id: 'tx1', walletId: 'w1', type: 'Receita', amount: 50, isPaid: false };
      const updatedTx = { id: 'tx1', walletId: 'w1', type: 'Receita', amount: 50, isPaid: true };

      mockPrismaService.transaction.findFirst.mockResolvedValue(existingTx);
      mockPrismaService.transaction.update.mockResolvedValue(updatedTx);

      await service.update('tx1', 'u1', { isPaid: true });

      const updateCall = mockPrismaService.transaction.update.mock.calls[0][0];
      expect(updateCall.data.status).toBe('Pago');
    });

    it('should sync isPaid to true when status=Pago', async () => {
      const existingTx = { id: 'tx1', walletId: 'w1', type: 'Receita', amount: 50, isPaid: false };
      const updatedTx = { id: 'tx1', walletId: 'w1', type: 'Receita', amount: 50, isPaid: true };

      mockPrismaService.transaction.findFirst.mockResolvedValue(existingTx);
      mockPrismaService.transaction.update.mockResolvedValue(updatedTx);

      await service.update('tx1', 'u1', { status: TransactionStatus.Pago });

      const updateCall = mockPrismaService.transaction.update.mock.calls[0][0];
      expect(updateCall.data.isPaid).toBe(true);
    });
  });

  describe('remove', () => {
    it('should throw error when transaction not found', async () => {
      mockPrismaService.transaction.findFirst.mockResolvedValue(null);

      await expect(service.remove('tx1', 'u1')).rejects.toThrow('Transaction not found or denied access');
    });

    it('should revert wallet balance when transaction was paid before deleting', async () => {
      const existingTx = { id: 'tx1', walletId: 'w1', type: 'Receita', amount: 200, isPaid: true };
      mockPrismaService.transaction.findFirst.mockResolvedValue(existingTx);
      mockPrismaService.transaction.delete.mockResolvedValue(existingTx);

      await service.remove('tx1', 'u1');

      expect(mockPrismaService.wallet.update).toHaveBeenCalledWith({
        where: { id: 'w1' },
        data: { balance: { increment: -200 } },
      });
      expect(mockPrismaService.transaction.delete).toHaveBeenCalled();
    });

    it('should delete without wallet update when transaction was not paid', async () => {
      const existingTx = { id: 'tx1', walletId: 'w1', type: 'Despesa', amount: 100, isPaid: false };
      mockPrismaService.transaction.findFirst.mockResolvedValue(existingTx);
      mockPrismaService.transaction.delete.mockResolvedValue(existingTx);

      await service.remove('tx1', 'u1');

      expect(mockPrismaService.wallet.update).not.toHaveBeenCalled();
      expect(mockPrismaService.transaction.delete).toHaveBeenCalled();
    });
  });

  describe('getSummary', () => {
    it('should return totalBalance, totalIncome and totalExpenses', async () => {
      mockPrismaService.wallet.findMany.mockResolvedValue([
        { balance: 1000 },
        { balance: 500 },
      ]);
      mockPrismaService.transaction.findMany.mockResolvedValue([
        { type: 'Receita', amount: 300 },
        { type: 'Receita', amount: 200 },
        { type: 'Despesa', amount: 150 },
      ]);

      const result = await service.getSummary('u1', 1, 2024);

      expect(result.totalBalance).toBe(1500);
      expect(result.totalIncome).toBe(500);
      expect(result.totalExpenses).toBe(150);
    });
  });

  describe('importNubank', () => {
    it('should throw NotFoundException when wallet not found', async () => {
      mockPrismaService.wallet.findFirst.mockResolvedValue(null);

      const file = {
        originalname: 'nubank.csv',
        buffer: Buffer.from('date,title,amount\n2024-01-10,Mercado,-100.00'),
      };

      await expect(service.importNubank({ userId: 'u1', walletId: 'w1', file })).rejects.toThrow(NotFoundException);
    });

    it('should throw Error for unsupported file extension', async () => {
      mockPrismaService.wallet.findFirst.mockResolvedValue({ id: 'w1' });

      const file = {
        originalname: 'nubank.txt',
        buffer: Buffer.from('some content'),
      };

      await expect(service.importNubank({ userId: 'u1', walletId: 'w1', file })).rejects.toThrow('Unsupported Nubank file type');
    });

    it('should parse CSV and create transactions', async () => {
      mockPrismaService.wallet.findFirst.mockResolvedValue({ id: 'w1' });

      const csvContent = 'date,title,amount\n2024-01-10,Mercado,100.00\n2024-01-11,Salário,-3000.00';
      const file = {
        originalname: 'nubank.csv',
        buffer: { toString: () => csvContent },
      };

      mockPrismaService.category.findMany.mockResolvedValue([{ id: 'cat1', name: 'Outros' }]);
      mockPrismaService.transaction.findFirst.mockResolvedValue(null); // no duplicates
      mockPrismaService.transaction.create.mockResolvedValue({ id: 'tx1' });

      const result = await service.importNubank({ userId: 'u1', walletId: 'w1', file });

      expect(mockPrismaService.transaction.create).toHaveBeenCalled();
      expect(result.length).toBeGreaterThan(0);
    });

    it('should parse OFX and create transactions', async () => {
      mockPrismaService.wallet.findFirst.mockResolvedValue({ id: 'w1' });

      const ofxContent = `
<STMTTRN>
<TRNTYPE>DEBIT
<DTPOSTED>20240110
<TRNAMT>-100.00
<MEMO>Supermercado
</STMTTRN>
<STMTTRN>
<TRNTYPE>CREDIT
<DTPOSTED>20240115
<TRNAMT>3000.00
<MEMO>Salário
</STMTTRN>
      `;
      const file = {
        originalname: 'nubank.ofx',
        buffer: { toString: () => ofxContent },
      };

      mockPrismaService.category.findMany.mockResolvedValue([{ id: 'cat1', name: 'Outros' }]);
      mockPrismaService.transaction.findFirst.mockResolvedValue(null);
      mockPrismaService.transaction.create.mockResolvedValue({ id: 'tx1' });

      const result = await service.importNubank({ userId: 'u1', walletId: 'w1', file });

      expect(mockPrismaService.transaction.create).toHaveBeenCalled();
      expect(result.length).toBeGreaterThan(0);
    });

    it('should skip duplicate transactions (deduplication)', async () => {
      mockPrismaService.wallet.findFirst.mockResolvedValue({ id: 'w1' });

      const csvContent = 'date,title,amount\n2024-01-10,Mercado,100.00';
      const file = {
        originalname: 'nubank.csv',
        buffer: { toString: () => csvContent },
      };

      mockPrismaService.category.findMany.mockResolvedValue([{ id: 'cat1', name: 'Outros' }]);
      // Return an existing transaction → should skip
      mockPrismaService.transaction.findFirst.mockResolvedValue({ id: 'existingTx' });

      const result = await service.importNubank({ userId: 'u1', walletId: 'w1', file });

      expect(mockPrismaService.transaction.create).not.toHaveBeenCalled();
      expect(result).toHaveLength(0);
    });

    it('should parse PDF and create transactions', async () => {
      const pdfParse = require('pdf-parse');
      const pdfText = '10/01/2024 Mercado 1.500,00\n15/01/2024 Salário -3.000,00';
      (pdfParse as jest.Mock).mockResolvedValue({ text: pdfText });

      mockPrismaService.wallet.findFirst.mockResolvedValue({ id: 'w1' });
      mockPrismaService.category.findMany.mockResolvedValue([{ id: 'cat1', name: 'Outros' }]);
      mockPrismaService.transaction.findFirst.mockResolvedValue(null);
      mockPrismaService.transaction.create.mockResolvedValue({ id: 'tx1' });

      const file = {
        originalname: 'nubank.pdf',
        buffer: Buffer.from('fake pdf'),
      };

      const result = await service.importNubank({ userId: 'u1', walletId: 'w1', file });

      expect(pdfParse).toHaveBeenCalledWith(file.buffer);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should create all installments for a transaction series', async () => {
      mockPrismaService.wallet.findFirst.mockResolvedValue({ id: 'w1' });

      // A CSV line with installment pattern "Desc - Parcela 2/6"
      const csvContent = 'date,title,amount\n2024-02-01,Televisão - Parcela 2/6,200.00';
      const file = {
        originalname: 'nubank.csv',
        buffer: { toString: () => csvContent },
      };

      mockPrismaService.category.findMany.mockResolvedValue([{ id: 'cat1', name: 'Outros' }]);
      // No existing series
      mockPrismaService.transaction.findFirst.mockResolvedValue(null);
      mockPrismaService.transaction.create.mockResolvedValue({ id: 'tx1' });

      const result = await service.importNubank({ userId: 'u1', walletId: 'w1', file });

      // Should create 6 installments
      expect(mockPrismaService.transaction.create).toHaveBeenCalledTimes(6);
      expect(result).toHaveLength(6);
    });
  });

  describe('parseNubankCsv (via importNubank)', () => {
    it('should map negative amount to Receita type', async () => {
      mockPrismaService.wallet.findFirst.mockResolvedValue({ id: 'w1' });
      mockPrismaService.category.findMany.mockResolvedValue([{ id: 'cat1', name: 'Outros' }]);
      mockPrismaService.transaction.findFirst.mockResolvedValue(null);
      mockPrismaService.transaction.create.mockResolvedValue({ id: 'tx1' });

      const csvContent = 'date,title,amount\n2024-01-10,Salário,-3000.00';
      const file = {
        originalname: 'nubank.csv',
        buffer: { toString: () => csvContent },
      };

      await service.importNubank({ userId: 'u1', walletId: 'w1', file });

      const createCall = mockPrismaService.transaction.create.mock.calls[0][0];
      expect(createCall.data.type).toBe(TransactionType.Receita);
      expect(createCall.data.amount).toBe(3000);
    });

    it('should map positive amount to Despesa type', async () => {
      mockPrismaService.wallet.findFirst.mockResolvedValue({ id: 'w1' });
      mockPrismaService.category.findMany.mockResolvedValue([{ id: 'cat1', name: 'Outros' }]);
      mockPrismaService.transaction.findFirst.mockResolvedValue(null);
      mockPrismaService.transaction.create.mockResolvedValue({ id: 'tx1' });

      const csvContent = 'date,title,amount\n2024-01-10,Mercado,150.00';
      const file = {
        originalname: 'nubank.csv',
        buffer: { toString: () => csvContent },
      };

      await service.importNubank({ userId: 'u1', walletId: 'w1', file });

      const createCall = mockPrismaService.transaction.create.mock.calls[0][0];
      expect(createCall.data.type).toBe(TransactionType.Despesa);
    });
  });

  describe('parseNubankOfx (via importNubank)', () => {
    it('should map CREDIT to Receita', async () => {
      mockPrismaService.wallet.findFirst.mockResolvedValue({ id: 'w1' });
      mockPrismaService.category.findMany.mockResolvedValue([{ id: 'cat1', name: 'Outros' }]);
      mockPrismaService.transaction.findFirst.mockResolvedValue(null);
      mockPrismaService.transaction.create.mockResolvedValue({ id: 'tx1' });

      const ofxContent = `<STMTTRN>\n<TRNTYPE>CREDIT\n<DTPOSTED>20240110\n<TRNAMT>3000.00\n<MEMO>Salário\n</STMTTRN>`;
      const file = {
        originalname: 'nubank.ofx',
        buffer: { toString: () => ofxContent },
      };

      await service.importNubank({ userId: 'u1', walletId: 'w1', file });

      const createCall = mockPrismaService.transaction.create.mock.calls[0][0];
      expect(createCall.data.type).toBe(TransactionType.Receita);
    });

    it('should map DEBIT to Despesa', async () => {
      mockPrismaService.wallet.findFirst.mockResolvedValue({ id: 'w1' });
      mockPrismaService.category.findMany.mockResolvedValue([{ id: 'cat1', name: 'Outros' }]);
      mockPrismaService.transaction.findFirst.mockResolvedValue(null);
      mockPrismaService.transaction.create.mockResolvedValue({ id: 'tx1' });

      const ofxContent = `<STMTTRN>\n<TRNTYPE>DEBIT\n<DTPOSTED>20240110\n<TRNAMT>-100.00\n<MEMO>Mercado\n</STMTTRN>`;
      const file = {
        originalname: 'nubank.ofx',
        buffer: { toString: () => ofxContent },
      };

      await service.importNubank({ userId: 'u1', walletId: 'w1', file });

      const createCall = mockPrismaService.transaction.create.mock.calls[0][0];
      expect(createCall.data.type).toBe(TransactionType.Despesa);
    });
  });

  describe('parseInstallmentInfo (via importNubank)', () => {
    it('should detect installment pattern "Desc - Parcela 2/6"', async () => {
      mockPrismaService.wallet.findFirst.mockResolvedValue({ id: 'w1' });
      mockPrismaService.category.findMany.mockResolvedValue([{ id: 'cat1', name: 'Outros' }]);
      mockPrismaService.transaction.findFirst.mockResolvedValue(null);
      mockPrismaService.transaction.create.mockResolvedValue({ id: 'tx1' });

      const csvContent = 'date,title,amount\n2024-02-01,TV Nova - Parcela 1/3,100.00';
      const file = {
        originalname: 'nubank.csv',
        buffer: { toString: () => csvContent },
      };

      await service.importNubank({ userId: 'u1', walletId: 'w1', file });

      // 3 installments should be created
      expect(mockPrismaService.transaction.create).toHaveBeenCalledTimes(3);
    });

    it('should return null for description without installment pattern', async () => {
      mockPrismaService.wallet.findFirst.mockResolvedValue({ id: 'w1' });
      mockPrismaService.category.findMany.mockResolvedValue([{ id: 'cat1', name: 'Outros' }]);
      mockPrismaService.transaction.findFirst.mockResolvedValue(null);
      mockPrismaService.transaction.create.mockResolvedValue({ id: 'tx1' });

      const csvContent = 'date,title,amount\n2024-01-10,Mercado Regular,100.00';
      const file = {
        originalname: 'nubank.csv',
        buffer: { toString: () => csvContent },
      };

      await service.importNubank({ userId: 'u1', walletId: 'w1', file });

      // Single transaction created (no installment logic)
      expect(mockPrismaService.transaction.create).toHaveBeenCalledTimes(1);
    });
  });
});
