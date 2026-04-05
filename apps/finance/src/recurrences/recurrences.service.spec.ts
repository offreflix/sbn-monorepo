import { Test, TestingModule } from '@nestjs/testing';
import { RecurrencesService } from './recurrences.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrismaService = {
  recurrence: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
  },
};

describe('RecurrencesService', () => {
  let service: RecurrencesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecurrencesService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<RecurrencesService>(RecurrencesService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a recurrence without endDate', async () => {
      const mockRec = { id: 'r1', userId: 'u1', frequency: 'MONTHLY' };
      mockPrismaService.recurrence.create.mockResolvedValue(mockRec);

      const result = await service.create({
        userId: 'u1',
        walletId: 'w1',
        categoryId: 'c1',
        amount: 100,
        type: 'Despesa',
        frequency: 'MONTHLY',
        startDate: '2024-01-01',
      });

      expect(mockPrismaService.recurrence.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: 'u1',
          frequency: 'MONTHLY',
          startDate: new Date('2024-01-01'),
          endDate: null,
        }),
      });
      expect(result).toEqual(mockRec);
    });

    it('should create a recurrence with endDate', async () => {
      const mockRec = {
        id: 'r1',
        userId: 'u1',
        frequency: 'MONTHLY',
        endDate: new Date('2024-12-31'),
      };
      mockPrismaService.recurrence.create.mockResolvedValue(mockRec);

      await service.create({
        userId: 'u1',
        walletId: 'w1',
        categoryId: 'c1',
        amount: 100,
        type: 'Despesa',
        frequency: 'MONTHLY',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
      });

      expect(mockPrismaService.recurrence.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          endDate: new Date('2024-12-31'),
        }),
      });
    });
  });

  describe('findAll', () => {
    it('should return recurrences with wallet and category included', async () => {
      mockPrismaService.recurrence.findMany.mockResolvedValue([
        { id: 'r1', wallet: { id: 'w1' }, category: { id: 'c1' } },
      ]);

      const result = await service.findAll('u1');

      expect(mockPrismaService.recurrence.findMany).toHaveBeenCalledWith({
        where: { userId: 'u1', deletedAt: null },
        include: { wallet: true, category: true },
      });
      expect(result).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('should return a recurrence when found', async () => {
      const mockRec = { id: 'r1', userId: 'u1', wallet: {}, category: {} };
      mockPrismaService.recurrence.findFirst.mockResolvedValue(mockRec);

      const result = await service.findOne('r1', 'u1');

      expect(result).toEqual(mockRec);
    });

    it('should throw an Error when recurrence not found', async () => {
      mockPrismaService.recurrence.findFirst.mockResolvedValue(null);

      await expect(service.findOne('r1', 'u1')).rejects.toThrow(
        'Recurrence not found',
      );
    });
  });

  describe('update', () => {
    it('should convert startDate and endDate strings to Date objects', async () => {
      const mockRec = { id: 'r1', userId: 'u1' };
      const updated = { ...mockRec, frequency: 'WEEKLY' };
      mockPrismaService.recurrence.findFirst.mockResolvedValue(mockRec);
      mockPrismaService.recurrence.update.mockResolvedValue(updated);

      await service.update('r1', 'u1', {
        startDate: '2024-01-01',
        endDate: '2024-06-30',
        frequency: 'WEEKLY',
      });

      const updateCall = mockPrismaService.recurrence.update.mock.calls[0][0];
      expect(updateCall.data.startDate).toBeInstanceOf(Date);
      expect(updateCall.data.endDate).toBeInstanceOf(Date);
    });
  });

  describe('remove', () => {
    it('should soft delete by setting deletedAt', async () => {
      const mockRec = { id: 'r1', userId: 'u1' };
      mockPrismaService.recurrence.findFirst.mockResolvedValue(mockRec);
      mockPrismaService.recurrence.update.mockResolvedValue({
        ...mockRec,
        deletedAt: new Date(),
      });

      await service.remove('r1', 'u1');

      expect(mockPrismaService.recurrence.update).toHaveBeenCalledWith({
        where: { id: 'r1' },
        data: { deletedAt: expect.any(Date) },
      });
    });
  });
});
