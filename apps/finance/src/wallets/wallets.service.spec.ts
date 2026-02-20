import { Test, TestingModule } from '@nestjs/testing';
import { WalletsService } from './wallets.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

const mockPrismaService = {
  wallet: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('WalletsService', () => {
  let service: WalletsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<WalletsService>(WalletsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a wallet with defaults', async () => {
      const dto = { name: 'W1', type: 'Conta Corrente', userId: 'u1' };
      mockPrismaService.wallet.create.mockResolvedValue({
        id: 'w1',
        ...dto,
        balance: 0,
        currency: 'BRL',
      });

      const result = await service.create(dto);
      expect(result).toHaveProperty('id');
      expect(result.name).toBe('W1');
    });
  });

  describe('findAll', () => {
    it('should return list of wallets for user', async () => {
      mockPrismaService.wallet.findMany.mockResolvedValue([{ id: 'w1' }]);
      const result = await service.findAll('u1');
      expect(result).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('should return a wallet when found', async () => {
      const mockWallet = { id: 'w1', userId: 'u1', name: 'Conta' };
      mockPrismaService.wallet.findFirst.mockResolvedValue(mockWallet);

      const result = await service.findOne('w1', 'u1');

      expect(result).toEqual(mockWallet);
    });

    it('should throw NotFoundException when wallet not found', async () => {
      mockPrismaService.wallet.findFirst.mockResolvedValue(null);

      await expect(service.findOne('w1', 'u1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should verify ownership and update wallet', async () => {
      const mockWallet = { id: 'w1', userId: 'u1', name: 'Conta' };
      const updated = { ...mockWallet, name: 'Conta Corrente' };
      mockPrismaService.wallet.findFirst.mockResolvedValue(mockWallet);
      mockPrismaService.wallet.update.mockResolvedValue(updated);

      const result = await service.update('w1', 'u1', { name: 'Conta Corrente' });

      expect(mockPrismaService.wallet.update).toHaveBeenCalledWith({
        where: { id: 'w1' },
        data: expect.objectContaining({ name: 'Conta Corrente' }),
      });
      expect(result).toEqual(updated);
    });
  });

  describe('remove', () => {
    it('should soft delete wallet by setting deletedAt', async () => {
      const mockWallet = { id: 'w1', userId: 'u1' };
      mockPrismaService.wallet.findFirst.mockResolvedValue(mockWallet);
      mockPrismaService.wallet.update.mockResolvedValue({ ...mockWallet, deletedAt: new Date() });

      await service.remove('w1', 'u1');

      expect(mockPrismaService.wallet.update).toHaveBeenCalledWith({
        where: { id: 'w1' },
        data: { deletedAt: expect.any(Date) },
      });
    });
  });
});
