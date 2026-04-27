import { Test, TestingModule } from '@nestjs/testing';
import { ApiKeysController, ValidateApiKeyController } from './api-keys.controller';
import { ApiKeysService } from './api-keys.service';

const mockApiKeysService = {
  create: jest.fn(),
  listKeys: jest.fn(),
  revokeKey: jest.fn(),
  validateKey: jest.fn(),
};

const mockReq = (userId: string) =>
  ({ user: { userId, email: 'a@b.com' } }) as any;

describe('ApiKeysController', () => {
  let controller: ApiKeysController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApiKeysController],
      providers: [{ provide: ApiKeysService, useValue: mockApiKeysService }],
    }).compile();

    controller = module.get<ApiKeysController>(ApiKeysController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call service.create with userId from req.user', async () => {
      const dto = { name: 'My Key' };
      const created = { id: '1', name: 'My Key', key: 'sbn_k_abc' };
      mockApiKeysService.create.mockResolvedValue(created);

      const result = await controller.create(mockReq('user-1'), dto);
      expect(mockApiKeysService.create).toHaveBeenCalledWith('user-1', dto);
      expect(result).toEqual(created);
    });
  });

  describe('list', () => {
    it('should return keys for the authenticated user', async () => {
      const keys = [{ id: '1', name: 'Key 1' }];
      mockApiKeysService.listKeys.mockResolvedValue(keys);

      const result = await controller.list(mockReq('user-1'));
      expect(mockApiKeysService.listKeys).toHaveBeenCalledWith('user-1');
      expect(result).toEqual(keys);
    });
  });

  describe('revoke', () => {
    it('should call service.revokeKey with id and userId', async () => {
      mockApiKeysService.revokeKey.mockResolvedValue({ success: true });

      const result = await controller.revoke('key-id', mockReq('user-1'));
      expect(mockApiKeysService.revokeKey).toHaveBeenCalledWith(
        'key-id',
        'user-1',
      );
      expect(result).toEqual({ success: true });
    });
  });
});

describe('ValidateApiKeyController', () => {
  let controller: ValidateApiKeyController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ValidateApiKeyController],
      providers: [{ provide: ApiKeysService, useValue: mockApiKeysService }],
    }).compile();

    controller = module.get<ValidateApiKeyController>(ValidateApiKeyController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('validate', () => {
    it('should return valid result from service', async () => {
      mockApiKeysService.validateKey.mockResolvedValue({
        valid: true,
        userId: 'u1',
      });

      const result = await controller.validate({ apiKey: 'sbn_k_abc' });
      expect(mockApiKeysService.validateKey).toHaveBeenCalledWith('sbn_k_abc');
      expect(result).toEqual({ valid: true, userId: 'u1' });
    });

    it('should return invalid result from service', async () => {
      mockApiKeysService.validateKey.mockResolvedValue({ valid: false });

      const result = await controller.validate({ apiKey: 'bad-key' });
      expect(result).toEqual({ valid: false });
    });
  });
});
