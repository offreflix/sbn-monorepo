import { Test, TestingModule } from '@nestjs/testing';
import { ApiKeysService } from './api-keys.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrismaService = {
  apiKey: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
  },
};

describe('ApiKeysService', () => {
  let service: ApiKeysService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApiKeysService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ApiKeysService>(ApiKeysService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an api key and return it with the raw key', async () => {
      const createdAt = new Date();
      mockPrismaService.apiKey.create.mockResolvedValue({
        id: 'key-id',
        name: 'My Key',
        keyHash: 'hash',
        keyPrefix: 'sbn_k_prefix',
        expiresAt: null,
        createdAt,
      });

      const result = await service.create('user-1', { name: 'My Key' });

      expect(result.id).toBe('key-id');
      expect(result.name).toBe('My Key');
      expect(result.key).toMatch(/^sbn_k_/);
      expect(result.keyPrefix).toBe(result.key.slice(0, 12));
      expect(mockPrismaService.apiKey.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ userId: 'user-1', name: 'My Key' }),
        }),
      );
    });

    it('should pass expiresAt when provided', async () => {
      const expiresAt = '2030-01-01T00:00:00.000Z';
      mockPrismaService.apiKey.create.mockResolvedValue({
        id: 'key-id',
        name: 'Expiring Key',
        keyHash: 'hash',
        keyPrefix: 'sbn_k_prefix',
        expiresAt: new Date(expiresAt),
        createdAt: new Date(),
      });

      await service.create('user-1', { name: 'Expiring Key', expiresAt });

      expect(mockPrismaService.apiKey.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            expiresAt: new Date(expiresAt),
          }),
        }),
      );
    });
  });

  describe('validateKey', () => {
    it('should return invalid for keys not starting with sbn_k_', async () => {
      const result = await service.validateKey('bad-key');
      expect(result).toEqual({ valid: false });
      expect(mockPrismaService.apiKey.findUnique).not.toHaveBeenCalled();
    });

    it('should return invalid for empty key', async () => {
      const result = await service.validateKey('');
      expect(result).toEqual({ valid: false });
    });

    it('should return invalid when key not found in database', async () => {
      mockPrismaService.apiKey.findUnique.mockResolvedValue(null);
      const result = await service.validateKey('sbn_k_abc123');
      expect(result).toEqual({ valid: false });
    });

    it('should return invalid when key is inactive', async () => {
      mockPrismaService.apiKey.findUnique.mockResolvedValue({
        id: '1',
        userId: 'u1',
        isActive: false,
        expiresAt: null,
      });
      const result = await service.validateKey('sbn_k_abc123');
      expect(result).toEqual({ valid: false });
    });

    it('should return invalid when key is expired', async () => {
      const pastDate = new Date(Date.now() - 1000);
      mockPrismaService.apiKey.findUnique.mockResolvedValue({
        id: '1',
        userId: 'u1',
        isActive: true,
        expiresAt: pastDate,
      });
      const result = await service.validateKey('sbn_k_abc123');
      expect(result).toEqual({ valid: false });
    });

    it('should return valid and update lastUsedAt for a valid key', async () => {
      mockPrismaService.apiKey.findUnique.mockResolvedValue({
        id: '1',
        userId: 'u1',
        isActive: true,
        expiresAt: null,
      });
      mockPrismaService.apiKey.update.mockResolvedValue({});

      const result = await service.validateKey('sbn_k_abc123');
      expect(result).toEqual({ valid: true, userId: 'u1' });
      expect(mockPrismaService.apiKey.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: '1' } }),
      );
    });

    it('should return valid for a non-expired key with future expiry', async () => {
      const futureDate = new Date(Date.now() + 100_000);
      mockPrismaService.apiKey.findUnique.mockResolvedValue({
        id: '2',
        userId: 'u2',
        isActive: true,
        expiresAt: futureDate,
      });
      mockPrismaService.apiKey.update.mockResolvedValue({});

      const result = await service.validateKey('sbn_k_abc123');
      expect(result).toEqual({ valid: true, userId: 'u2' });
    });
  });

  describe('listKeys', () => {
    it('should return keys for the given user', async () => {
      const keys = [
        { id: '1', name: 'Key 1', keyPrefix: 'sbn_k_prefix', isActive: true },
      ];
      mockPrismaService.apiKey.findMany.mockResolvedValue(keys);

      const result = await service.listKeys('user-1');
      expect(result).toEqual(keys);
      expect(mockPrismaService.apiKey.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: 'user-1' } }),
      );
    });
  });

  describe('revokeKey', () => {
    it('should set isActive to false for the matching key', async () => {
      mockPrismaService.apiKey.updateMany.mockResolvedValue({ count: 1 });

      const result = await service.revokeKey('key-id', 'user-1');
      expect(result).toEqual({ success: true });
      expect(mockPrismaService.apiKey.updateMany).toHaveBeenCalledWith({
        where: { id: 'key-id', userId: 'user-1' },
        data: { isActive: false },
      });
    });
  });
});
