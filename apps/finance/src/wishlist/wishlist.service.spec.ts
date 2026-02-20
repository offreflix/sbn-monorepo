import { Test, TestingModule } from '@nestjs/testing';
import { WishlistService } from './wishlist.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { Status } from './dto/create-wishlist-item.dto';

const mockPrismaService = {
  wishlistItem: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
  },
};

describe('WishlistService', () => {
  let service: WishlistService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WishlistService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<WishlistService>(WishlistService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create with default currency, priority and status', async () => {
      const mockItem = { id: 'wi1', name: 'Teclado', currency: 'BRL', priority: 'MEDIUM', status: 'WISHED' };
      mockPrismaService.wishlistItem.create.mockResolvedValue(mockItem);

      const result = await service.create({ userId: 'u1', name: 'Teclado' });

      expect(mockPrismaService.wishlistItem.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          currency: 'BRL',
          priority: 'MEDIUM',
          status: 'WISHED',
          tags: [],
        }),
      });
      expect(result).toEqual(mockItem);
    });

    it('should use provided currency, priority and status', async () => {
      const mockItem = { id: 'wi1', name: 'Monitor', currency: 'USD', priority: 'HIGH', status: 'SAVED' };
      mockPrismaService.wishlistItem.create.mockResolvedValue(mockItem);

      await service.create({ userId: 'u1', name: 'Monitor', currency: 'USD', priority: 'HIGH', status: 'SAVED' });

      expect(mockPrismaService.wishlistItem.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          currency: 'USD',
          priority: 'HIGH',
          status: 'SAVED',
        }),
      });
    });
  });

  describe('findAll', () => {
    it('should return all items without filters', async () => {
      mockPrismaService.wishlistItem.findMany.mockResolvedValue([{ id: 'wi1' }, { id: 'wi2' }]);

      const result = await service.findAll('u1');

      expect(mockPrismaService.wishlistItem.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'u1', deletedAt: null },
        }),
      );
      expect(result).toHaveLength(2);
    });

    it('should filter by status when provided', async () => {
      mockPrismaService.wishlistItem.findMany.mockResolvedValue([{ id: 'wi1', status: 'WISHED' }]);

      await service.findAll('u1', { status: 'WISHED' });

      expect(mockPrismaService.wishlistItem.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'u1', deletedAt: null, status: 'WISHED' },
        }),
      );
    });

    it('should filter by priority when provided', async () => {
      mockPrismaService.wishlistItem.findMany.mockResolvedValue([{ id: 'wi1', priority: 'HIGH' }]);

      await service.findAll('u1', { priority: 'HIGH' });

      expect(mockPrismaService.wishlistItem.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'u1', deletedAt: null, priority: 'HIGH' },
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return an item when found', async () => {
      const mockItem = { id: 'wi1', userId: 'u1', name: 'Teclado' };
      mockPrismaService.wishlistItem.findFirst.mockResolvedValue(mockItem);

      const result = await service.findOne('wi1', 'u1');

      expect(result).toEqual(mockItem);
    });

    it('should throw NotFoundException when not found', async () => {
      mockPrismaService.wishlistItem.findFirst.mockResolvedValue(null);

      await expect(service.findOne('wi1', 'u1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should verify ownership and update item', async () => {
      const mockItem = { id: 'wi1', userId: 'u1', name: 'Teclado', status: 'WISHED' };
      const updatedItem = { ...mockItem, name: 'Teclado Mecânico' };
      mockPrismaService.wishlistItem.findFirst.mockResolvedValue(mockItem);
      mockPrismaService.wishlistItem.update.mockResolvedValue(updatedItem);

      const result = await service.update('wi1', 'u1', { name: 'Teclado Mecânico' });

      expect(mockPrismaService.wishlistItem.update).toHaveBeenCalledWith({
        where: { id: 'wi1' },
        data: expect.objectContaining({ name: 'Teclado Mecânico' }),
      });
      expect(result).toEqual(updatedItem);
    });

    it('should auto-set purchasedAt when status is PURCHASED', async () => {
      const mockItem = { id: 'wi1', userId: 'u1', status: 'WISHED' };
      mockPrismaService.wishlistItem.findFirst.mockResolvedValue(mockItem);
      mockPrismaService.wishlistItem.update.mockResolvedValue({ ...mockItem, status: 'PURCHASED' });

      await service.update('wi1', 'u1', { status: Status.PURCHASED });

      const updateCall = mockPrismaService.wishlistItem.update.mock.calls[0][0];
      expect(updateCall.data.purchasedAt).toBeInstanceOf(Date);
    });
  });

  describe('remove', () => {
    it('should soft delete the item by setting deletedAt', async () => {
      const mockItem = { id: 'wi1', userId: 'u1' };
      mockPrismaService.wishlistItem.findFirst.mockResolvedValue(mockItem);
      mockPrismaService.wishlistItem.update.mockResolvedValue({ ...mockItem, deletedAt: new Date() });

      await service.remove('wi1', 'u1');

      expect(mockPrismaService.wishlistItem.update).toHaveBeenCalledWith({
        where: { id: 'wi1' },
        data: { deletedAt: expect.any(Date) },
      });
    });
  });

  describe('markAsPurchased', () => {
    it('should set status to PURCHASED and set purchasedAt', async () => {
      const mockItem = { id: 'wi1', userId: 'u1' };
      mockPrismaService.wishlistItem.findFirst.mockResolvedValue(mockItem);
      mockPrismaService.wishlistItem.update.mockResolvedValue({ ...mockItem, status: 'PURCHASED', purchasedAt: new Date() });

      await service.markAsPurchased('wi1', 'u1');

      expect(mockPrismaService.wishlistItem.update).toHaveBeenCalledWith({
        where: { id: 'wi1' },
        data: {
          status: 'PURCHASED',
          purchasedAt: expect.any(Date),
        },
      });
    });
  });
});
