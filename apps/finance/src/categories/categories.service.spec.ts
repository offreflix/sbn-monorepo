import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesService } from './categories.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

const mockPrismaService = {
  category: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
  },
};

describe('CategoriesService', () => {
  let service: CategoriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a category', async () => {
      const mockCategory = { id: 'c1', userId: 'u1', name: 'Alimentação', type: 'Despesa' };
      mockPrismaService.category.create.mockResolvedValue(mockCategory);

      const result = await service.create({ userId: 'u1', name: 'Alimentação', type: 'Despesa' });

      expect(mockPrismaService.category.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ userId: 'u1', name: 'Alimentação', type: 'Despesa' }),
      });
      expect(result).toEqual(mockCategory);
    });
  });

  describe('findAll', () => {
    it('should return categories for a user excluding soft-deleted ones', async () => {
      mockPrismaService.category.findMany.mockResolvedValue([{ id: 'c1' }, { id: 'c2' }]);

      const result = await service.findAll('u1');

      expect(mockPrismaService.category.findMany).toHaveBeenCalledWith({
        where: { userId: 'u1', deletedAt: null },
      });
      expect(result).toHaveLength(2);
    });
  });

  describe('findOne', () => {
    it('should return a category when found', async () => {
      const mockCategory = { id: 'c1', userId: 'u1', name: 'Alimentação' };
      mockPrismaService.category.findFirst.mockResolvedValue(mockCategory);

      const result = await service.findOne('c1', 'u1');

      expect(result).toEqual(mockCategory);
    });

    it('should throw NotFoundException when category not found', async () => {
      mockPrismaService.category.findFirst.mockResolvedValue(null);

      await expect(service.findOne('c1', 'u1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should verify ownership and update the category', async () => {
      const mockCategory = { id: 'c1', userId: 'u1', name: 'Alimentação' };
      const updated = { ...mockCategory, name: 'Comida' };
      mockPrismaService.category.findFirst.mockResolvedValue(mockCategory);
      mockPrismaService.category.update.mockResolvedValue(updated);

      const result = await service.update('c1', 'u1', { name: 'Comida' });

      expect(mockPrismaService.category.update).toHaveBeenCalledWith({
        where: { id: 'c1' },
        data: expect.objectContaining({ name: 'Comida' }),
      });
      expect(result).toEqual(updated);
    });
  });

  describe('remove', () => {
    it('should soft delete by setting deletedAt', async () => {
      const mockCategory = { id: 'c1', userId: 'u1' };
      mockPrismaService.category.findFirst.mockResolvedValue(mockCategory);
      mockPrismaService.category.update.mockResolvedValue({ ...mockCategory, deletedAt: new Date() });

      await service.remove('c1', 'u1');

      expect(mockPrismaService.category.update).toHaveBeenCalledWith({
        where: { id: 'c1' },
        data: { deletedAt: expect.any(Date) },
      });
    });
  });
});
