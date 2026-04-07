import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { WishlistController } from './wishlist.controller';
import { WishlistService } from './wishlist.service';
import { CreateWishlistItemDto } from './dto/create-wishlist-item.dto';
import { UpdateWishlistItemDto } from './dto/update-wishlist-item.dto';
import { CreatePriceEntryDto } from './dto/create-price-entry.dto';

const mockWishlistService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  markAsPurchased: jest.fn(),
  remove: jest.fn(),
  createPriceEntry: jest.fn(),
  findPriceEntries: jest.fn(),
  removePriceEntry: jest.fn(),
};

describe('WishlistController', () => {
  let controller: WishlistController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WishlistController],
      providers: [{ provide: WishlistService, useValue: mockWishlistService }],
    }).compile();

    controller = module.get<WishlistController>(WishlistController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call service create with userId merged', () => {
      const dto: CreateWishlistItemDto = { name: 'Teclado', price: 200 };
      const mockItem = { id: 'wi1', ...dto };
      mockWishlistService.create.mockResolvedValue(mockItem);

      controller.create(dto, 'u1');

      expect(mockWishlistService.create).toHaveBeenCalledWith({
        ...dto,
        userId: 'u1',
      });
    });

    it('should throw BadRequestException when userId is missing', () => {
      expect(() => controller.create({} as CreateWishlistItemDto, '')).toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should call service findAll with filters', () => {
      mockWishlistService.findAll.mockResolvedValue([]);

      controller.findAll('u1', 'WISHED', 'HIGH');

      expect(mockWishlistService.findAll).toHaveBeenCalledWith('u1', {
        status: 'WISHED',
        priority: 'HIGH',
      });
    });

    it('should throw BadRequestException when userId is missing', () => {
      expect(() => controller.findAll('')).toThrow(BadRequestException);
    });
  });

  describe('findOne', () => {
    it('should call service findOne with id and userId', () => {
      mockWishlistService.findOne.mockResolvedValue({ id: 'wi1' });

      controller.findOne('wi1', 'u1');

      expect(mockWishlistService.findOne).toHaveBeenCalledWith('wi1', 'u1');
    });

    it('should throw BadRequestException when userId is missing', () => {
      expect(() => controller.findOne('wi1', '')).toThrow(BadRequestException);
    });
  });

  describe('update', () => {
    it('should call service update with id, userId and body', () => {
      const body: UpdateWishlistItemDto = { name: 'Updated' };
      mockWishlistService.update.mockResolvedValue({
        id: 'wi1',
        name: 'Updated',
      });

      controller.update('wi1', body, 'u1');

      expect(mockWishlistService.update).toHaveBeenCalledWith(
        'wi1',
        'u1',
        body,
      );
    });

    it('should throw BadRequestException when userId is missing', () => {
      expect(() =>
        controller.update('wi1', {} as UpdateWishlistItemDto, ''),
      ).toThrow(BadRequestException);
    });
  });

  describe('markAsPurchased', () => {
    it('should call service markAsPurchased with id and userId', () => {
      mockWishlistService.markAsPurchased.mockResolvedValue({
        id: 'wi1',
        status: 'PURCHASED',
      });

      controller.markAsPurchased('wi1', 'u1');

      expect(mockWishlistService.markAsPurchased).toHaveBeenCalledWith(
        'wi1',
        'u1',
      );
    });

    it('should throw BadRequestException when userId is missing', () => {
      expect(() => controller.markAsPurchased('wi1', '')).toThrow(
        BadRequestException,
      );
    });
  });

  describe('createPriceEntry', () => {
    it('should call service createPriceEntry with installment fields', () => {
      const body: CreatePriceEntryDto = {
        price: 3097.91,
        cashPrice: 3097.91,
        installmentCount: 12,
        installmentValue: 271.75,
        store: 'Loja Daikin',
        date: '2026-04-01',
      };
      mockWishlistService.createPriceEntry.mockResolvedValue({
        id: 'pe1',
        ...body,
      });

      controller.createPriceEntry('wi1', body, 'u1');

      expect(mockWishlistService.createPriceEntry).toHaveBeenCalledWith(
        'u1',
        'wi1',
        body,
      );
    });

    it('should call service createPriceEntry without installment fields', () => {
      const body: CreatePriceEntryDto = {
        price: 500,
        store: 'Shopee',
        date: '2026-04-01',
      };
      mockWishlistService.createPriceEntry.mockResolvedValue({
        id: 'pe2',
        ...body,
      });

      controller.createPriceEntry('wi1', body, 'u1');

      expect(mockWishlistService.createPriceEntry).toHaveBeenCalledWith(
        'u1',
        'wi1',
        body,
      );
    });

    it('should throw BadRequestException when userId is missing', () => {
      expect(() =>
        controller.createPriceEntry('wi1', {} as CreatePriceEntryDto, ''),
      ).toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('should call service remove with id and userId', () => {
      mockWishlistService.remove.mockResolvedValue({
        id: 'wi1',
        deletedAt: new Date(),
      });

      controller.remove('wi1', 'u1');

      expect(mockWishlistService.remove).toHaveBeenCalledWith('wi1', 'u1');
    });

    it('should throw BadRequestException when userId is missing', () => {
      expect(() => controller.remove('wi1', '')).toThrow(BadRequestException);
    });
  });
});
