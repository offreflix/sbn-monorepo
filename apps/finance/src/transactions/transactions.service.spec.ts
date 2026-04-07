import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsService } from './transactions.service';
import { TransactionsRepository } from './transactions.repository';
import { WalletsRepository } from '../wallets/wallets.repository';
import { BalanceService } from './balance.service';
import { InstallmentService } from './installment.service';
import { NubankImportService } from './nubank-import.service';
import {
  CreateTransactionDto,
  TransactionType,
  TransactionStatus,
} from './dto/create-transaction.dto';
import { NotFoundException } from '@nestjs/common';

const mockTxRepo = {
  findMany: jest.fn(),
  findFirst: jest.fn(),
  findByPurchaseGroup: jest.fn(),
  create: jest.fn(),
  createMany: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  deleteMany: jest.fn(),
  createRecurrence: jest.fn(),
};

const mockWalletsRepo = {
  findByIdAndUser: jest.fn(),
  findAllByUser: jest.fn(),
  updateBalance: jest.fn(),
};

const mockInstallmentSvc = {
  resolveUpdate: jest.fn(),
};

const mockNubankImportSvc = {
  import: jest.fn(),
};

describe('TransactionsService', () => {
  let service: TransactionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        BalanceService,
        { provide: TransactionsRepository, useValue: mockTxRepo },
        { provide: WalletsRepository, useValue: mockWalletsRepo },
        { provide: InstallmentService, useValue: mockInstallmentSvc },
        { provide: NubankImportService, useValue: mockNubankImportSvc },
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

      mockWalletsRepo.findByIdAndUser.mockResolvedValue({
        id: 'w1',
        userId: 'u1',
        balance: 50,
        type: 'corrente',
      });

      const createdTx = {
        id: 'tx1',
        walletId: 'w1',
        type: 'Receita',
        amount: 100,
        isPaid: true,
      };
      mockTxRepo.create.mockResolvedValue(createdTx);

      const result = await service.create('u1', dto);

      expect(mockWalletsRepo.findByIdAndUser).toHaveBeenCalledWith('w1', 'u1');
      expect(mockWalletsRepo.updateBalance).toHaveBeenCalledWith('w1', 100);
      expect(result).toEqual(createdTx);
    });

    it('should throw NotFoundException if wallet does not exist', async () => {
      mockWalletsRepo.findByIdAndUser.mockResolvedValue(null);
      const dto: CreateTransactionDto = {
        walletId: 'w1',
        categoryId: 'c1',
        amount: 100,
        date: '2023-01-01',
        type: TransactionType.Despesa,
      };

      await expect(service.create('u1', dto)).rejects.toThrow(
        NotFoundException,
      );
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

      mockWalletsRepo.findByIdAndUser.mockResolvedValue({
        id: 'w1',
        userId: 'u1',
        balance: 1000,
        type: 'corrente',
      });

      const mockCreated = [
        {
          id: 'tx1',
          walletId: 'w1',
          amount: 100,
          type: 'Despesa',
          isPaid: false,
        },
        {
          id: 'tx2',
          walletId: 'w1',
          amount: 100,
          type: 'Despesa',
          isPaid: false,
        },
        {
          id: 'tx3',
          walletId: 'w1',
          amount: 100,
          type: 'Despesa',
          isPaid: false,
        },
      ];
      mockTxRepo.createMany.mockResolvedValue(mockCreated);

      const result = await service.create('u1', dto);

      expect(mockTxRepo.createMany).toHaveBeenCalled();
      expect(result).toEqual(mockCreated);
    });

    it('should create a recurrence when isRecurring is true', async () => {
      mockWalletsRepo.findByIdAndUser.mockResolvedValue({
        id: 'w1',
        userId: 'u1',
        balance: 1000,
        type: 'corrente',
      });
      mockTxRepo.createRecurrence.mockResolvedValue({ id: 'rec1' });
      mockTxRepo.create.mockResolvedValue({
        id: 'tx1',
        walletId: 'w1',
        type: 'Despesa',
        amount: 100,
        isPaid: false,
      });

      const dto: CreateTransactionDto = {
        walletId: 'w1',
        categoryId: 'c1',
        amount: 100,
        date: '2024-01-01',
        type: TransactionType.Despesa,
        isRecurring: true,
        frequency: 'MONTHLY',
      };

      const result = await service.create('u1', dto);

      expect(mockTxRepo.createRecurrence).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('findAll', () => {
    it('should return all transactions without date filter', async () => {
      mockTxRepo.findMany.mockResolvedValue([{ id: 'tx1' }]);

      const result = await service.findAll('u1');

      const [where] = mockTxRepo.findMany.mock.calls[0];
      expect(where).toEqual(expect.objectContaining({ userId: 'u1' }));
      expect(result).toHaveLength(1);
    });

    it('should filter by month and year when provided', async () => {
      mockTxRepo.findMany.mockResolvedValue([]);

      await service.findAll('u1', 2, 2024);

      const [where] = mockTxRepo.findMany.mock.calls[0];
      expect(where.date).toBeDefined();
      expect(where.date.gte).toEqual(new Date(2024, 1, 1));
    });
  });

  describe('findOne', () => {
    it('should return a transaction by id', async () => {
      mockTxRepo.findFirst.mockResolvedValue({ id: 'tx1', userId: 'u1' });

      const result = await service.findOne('tx1', 'u1');

      expect(result).toEqual({ id: 'tx1', userId: 'u1' });
    });
  });

  describe('update', () => {
    it('should throw error when transaction not found', async () => {
      mockTxRepo.findFirst.mockResolvedValue(null);

      await expect(service.update('tx1', 'u1', {})).rejects.toThrow(
        'Transaction not found or denied access',
      );
    });

    it('should revert balance when transaction was previously paid', async () => {
      const existingTx = {
        id: 'tx1',
        walletId: 'w1',
        type: 'Receita',
        amount: 100,
        isPaid: true,
        wallet: { type: 'corrente' },
      };
      const updatedTx = {
        id: 'tx1',
        walletId: 'w1',
        type: 'Receita',
        amount: 100,
        isPaid: true,
      };

      mockTxRepo.findFirst.mockResolvedValue(existingTx);
      mockTxRepo.update.mockResolvedValue(updatedTx);

      await service.update('tx1', 'u1', { description: 'Updated' });

      // Should first revert: Receita was +100, so revert is -100
      expect(mockWalletsRepo.updateBalance).toHaveBeenCalledWith('w1', -100);
    });

    it('should apply new balance when updated transaction is paid', async () => {
      const existingTx = {
        id: 'tx1',
        walletId: 'w1',
        type: 'Despesa',
        amount: 100,
        isPaid: false,
        wallet: { type: 'corrente' },
      };
      const updatedTx = {
        id: 'tx1',
        walletId: 'w1',
        type: 'Despesa',
        amount: 100,
        isPaid: true,
      };

      mockTxRepo.findFirst.mockResolvedValue(existingTx);
      mockTxRepo.update.mockResolvedValue(updatedTx);

      await service.update('tx1', 'u1', { isPaid: true });

      // Should apply: Despesa paid → -100
      expect(mockWalletsRepo.updateBalance).toHaveBeenCalledWith('w1', -100);
    });

    it('should sync status to Pago when isPaid=true', async () => {
      const existingTx = {
        id: 'tx1',
        walletId: 'w1',
        type: 'Receita',
        amount: 50,
        isPaid: false,
        wallet: { type: 'corrente' },
      };
      const updatedTx = {
        id: 'tx1',
        walletId: 'w1',
        type: 'Receita',
        amount: 50,
        isPaid: true,
      };

      mockTxRepo.findFirst.mockResolvedValue(existingTx);
      mockTxRepo.update.mockResolvedValue(updatedTx);

      await service.update('tx1', 'u1', { isPaid: true });

      const [, data] = mockTxRepo.update.mock.calls[0];
      expect(data.status).toBe('Pago');
    });

    it('should sync isPaid to true when status=Pago', async () => {
      const existingTx = {
        id: 'tx1',
        walletId: 'w1',
        type: 'Receita',
        amount: 50,
        isPaid: false,
        wallet: { type: 'corrente' },
      };
      const updatedTx = {
        id: 'tx1',
        walletId: 'w1',
        type: 'Receita',
        amount: 50,
        isPaid: true,
      };

      mockTxRepo.findFirst.mockResolvedValue(existingTx);
      mockTxRepo.update.mockResolvedValue(updatedTx);

      await service.update('tx1', 'u1', { status: TransactionStatus.Pago });

      const [, data] = mockTxRepo.update.mock.calls[0];
      expect(data.isPaid).toBe(true);
    });
  });

  describe('remove', () => {
    it('should throw error when transaction not found', async () => {
      mockTxRepo.findFirst.mockResolvedValue(null);

      await expect(service.remove('tx1', 'u1')).rejects.toThrow(
        'Transaction not found or denied access',
      );
    });

    it('should revert wallet balance when transaction was paid before deleting', async () => {
      const existingTx = {
        id: 'tx1',
        walletId: 'w1',
        type: 'Receita',
        amount: 200,
        isPaid: true,
        wallet: { type: 'corrente' },
      };
      mockTxRepo.findFirst.mockResolvedValue(existingTx);
      mockTxRepo.delete.mockResolvedValue(existingTx);

      await service.remove('tx1', 'u1');

      expect(mockWalletsRepo.updateBalance).toHaveBeenCalledWith('w1', -200);
      expect(mockTxRepo.delete).toHaveBeenCalledWith('tx1');
    });

    it('should delete without wallet update when transaction was not paid', async () => {
      const existingTx = {
        id: 'tx1',
        walletId: 'w1',
        type: 'Despesa',
        amount: 100,
        isPaid: false,
        wallet: { type: 'corrente' },
      };
      mockTxRepo.findFirst.mockResolvedValue(existingTx);
      mockTxRepo.delete.mockResolvedValue(existingTx);

      await service.remove('tx1', 'u1');

      expect(mockWalletsRepo.updateBalance).not.toHaveBeenCalled();
      expect(mockTxRepo.delete).toHaveBeenCalledWith('tx1');
    });
  });

  describe('getSummary', () => {
    it('should return totalBalance, totalIncome and totalExpenses', async () => {
      mockWalletsRepo.findAllByUser.mockResolvedValue([
        { balance: 1000 },
        { balance: 500 },
      ]);
      mockTxRepo.findMany.mockResolvedValue([
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
    it('should delegate to NubankImportService', async () => {
      const file = { originalname: 'nubank.csv', buffer: Buffer.from('') };
      const expected = [{ id: 'tx1' }];
      mockNubankImportSvc.import.mockResolvedValue(expected);

      const result = await service.importNubank({
        userId: 'u1',
        walletId: 'w1',
        file,
      });

      expect(mockNubankImportSvc.import).toHaveBeenCalledWith({
        userId: 'u1',
        walletId: 'w1',
        file,
      });
      expect(result).toEqual(expected);
    });
  });
});
