import { Test, TestingModule } from '@nestjs/testing';
import { WalletsService } from './wallets.service';
import { PrismaService } from '../prisma/prisma.service';

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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<WalletsService>(WalletsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('create', () => {
    it('should create a wallet', async () => {
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
    it('should return list of wallets', async () => {
      mockPrismaService.wallet.findMany.mockResolvedValue([{ id: 'w1' }]);
      const result = await service.findAll('u1');
      expect(result).toHaveLength(1);
    });
  });
});
