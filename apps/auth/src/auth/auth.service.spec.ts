import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid'),
}));

const mockPrismaService = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
};

const mockJwtService = {
  sign: jest.fn(() => 'signed-token'),
  verify: jest.fn(),
};

const mockRedis = {
  set: jest.fn(),
  get: jest.fn(),
  del: jest.fn(),
};

describe('AuthService', () => {
  let service: AuthService;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let prisma: PrismaService;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let redis: typeof mockRedis;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: 'REDIS_CLIENT', useValue: mockRedis },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    redis = module.get('REDIS_CLIENT');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user data if validation succeeds', async () => {
      const user = {
        id: '1',
        email: 'test@example.com',
        password_hash: '$2b$10$hashedpassword',
        name: 'Test',
      };
      mockPrismaService.user.findUnique.mockResolvedValue(user);
      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation(() => Promise.resolve(true));

      const result = await service.validateUser('test@example.com', 'password');
      expect(result).toHaveProperty('id', '1');
      expect(result).not.toHaveProperty('password_hash');
    });

    it('should return null if password mismatch', async () => {
      const user = {
        id: '1',
        email: 'test@example.com',
        password_hash: '$2b$10$hashedpassword',
      };
      mockPrismaService.user.findUnique.mockResolvedValue(user);
      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation(() => Promise.resolve(false));

      const result = await service.validateUser('test@example.com', 'wrong');
      expect(result).toBeNull();
    });

    it('should return null if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      const result = await service.validateUser('missing@example.com', 'pass');
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return tokens', async () => {
      const user = {
        id: '1',
        email: 'test@example.com',
        name: 'Test',
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      };
      const result = await service.login(user);

      expect(result).toHaveProperty('accessToken', 'signed-token');
      expect(result).toHaveProperty('refreshToken');
      expect(mockRedis.set).toHaveBeenCalled();
    });
  });

  describe('refresh', () => {
    it('should rotate refresh token', async () => {
      const oldToken = 'old-token';
      const userId = '1';
      const user = { id: '1', email: 'test@example.com', name: 'Test' };

      mockRedis.get.mockResolvedValue(userId);
      mockPrismaService.user.findUnique.mockResolvedValue(user);

      const result = await service.refresh(oldToken);

      expect(mockRedis.del).toHaveBeenCalledWith(`refreshToken:${oldToken}`);
      expect(mockRedis.set).toHaveBeenCalled();
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.refreshToken).not.toBe(oldToken);
    });

    it('should throw Unauthorized if token not found in redis', async () => {
      mockRedis.get.mockResolvedValue(null);
      await expect(service.refresh('invalid')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('register', () => {
    it('should create a new user', async () => {
      const dto = { email: 'new@example.com', password: 'pass', name: 'New' };
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      jest
        .spyOn(bcrypt, 'hash')
        .mockImplementation(() => Promise.resolve('hashed'));
      mockPrismaService.user.create.mockResolvedValue({
        id: '2',
        ...dto,
        password_hash: 'hashed',
      });

      const result = await service.register(dto);
      expect(result).toHaveProperty('id');
      expect(result.email).toBe(dto.email);
    });

    it('should throw ConflictException if email exists', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({ id: '1' });
      await expect(
        service.register({
          email: 'exists@example.com',
          password: 'p',
          name: 'n',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('logout', () => {
    it('should delete refresh token from redis and return success', async () => {
      const result = await service.logout('some-token');
      expect(mockRedis.del).toHaveBeenCalledWith('refreshToken:some-token');
      expect(result).toEqual({ success: true });
    });
  });

  describe('validateToken', () => {
    it('should return payload for a valid token', async () => {
      const payload = { sub: '1', email: 'test@example.com' };
      mockJwtService.verify.mockReturnValue(payload);

      const result = await service.validateToken('valid-token');
      expect(result).toEqual(payload);
    });

    it('should throw UnauthorizedException for an invalid token', async () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('invalid');
      });

      await expect(service.validateToken('bad-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('getCurrentUser', () => {
    it('should return user without password_hash', async () => {
      const user = {
        id: '1',
        email: 'test@example.com',
        name: 'Test',
        password_hash: 'hash',
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      };
      mockPrismaService.user.findUnique.mockResolvedValue(user);

      const result = await service.getCurrentUser('1');
      expect(result).toHaveProperty('id', '1');
      expect(result).not.toHaveProperty('password_hash');
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      await expect(service.getCurrentUser('missing')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
