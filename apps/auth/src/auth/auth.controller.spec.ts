import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UnauthorizedException } from '@nestjs/common';

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid'),
}));

const mockAuthService = {
  validateUser: jest.fn(),
  login: jest.fn(),
  register: jest.fn(),
  refresh: jest.fn(),
  logout: jest.fn(),
  validateToken: jest.fn(),
  getCurrentUser: jest.fn(),
};

describe('AuthController', () => {
  let controller: AuthController;
  const mockRes = () =>
    ({
      cookie: jest.fn(),
      clearCookie: jest.fn(),
    }) as any;
  const mockReq = (refreshToken?: string) =>
    ({
      cookies: refreshToken ? { refresh_token: refreshToken } : {},
    }) as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should set refresh cookie and return access token and user on valid credentials', async () => {
      const user = { id: '1', email: 'a@b.com', name: 'A' };
      const res = mockRes();
      mockAuthService.validateUser.mockResolvedValue(user);
      mockAuthService.login.mockResolvedValue({
        accessToken: 'at',
        refreshToken: 'rt',
        user,
      });

      const result = await controller.login({
        email: 'a@b.com',
        password: 'pass',
      }, res);

      expect(res.cookie).toHaveBeenCalledWith(
        'refresh_token',
        'rt',
        expect.objectContaining({ httpOnly: true, path: '/api/auth' }),
      );
      expect(result).toEqual({ accessToken: 'at', user });
    });

    it('should throw UnauthorizedException on invalid credentials', async () => {
      mockAuthService.validateUser.mockResolvedValue(null);
      await expect(
        controller.login({ email: 'a@b.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('register', () => {
    it('should return the created user', async () => {
      const user = { id: '2', email: 'new@b.com', name: 'New' };
      mockAuthService.register.mockResolvedValue(user);

      const result = await controller.register({
        email: 'new@b.com',
        password: 'pass',
        name: 'New',
      });
      expect(result).toEqual(user);
    });
  });

  describe('refresh', () => {
    it('should rotate refresh cookie and return access token and user', async () => {
      const res = mockRes();
      const user = { id: '1', email: 'a@b.com', name: 'A' };
      mockAuthService.refresh.mockResolvedValue({
        accessToken: 'new-at',
        refreshToken: 'new-rt',
        user,
      });

      const result = await controller.refresh(mockReq('old-rt'), {}, res);
      expect(mockAuthService.refresh).toHaveBeenCalledWith('old-rt');
      expect(res.cookie).toHaveBeenCalledWith(
        'refresh_token',
        'new-rt',
        expect.objectContaining({ httpOnly: true, path: '/api/auth' }),
      );
      expect(result).toEqual({ accessToken: 'new-at', user });
    });

    it('should throw UnauthorizedException if refreshToken is missing', async () => {
      await expect(
        controller.refresh(mockReq(), {}, mockRes()),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('should call logout service and return success when token provided', async () => {
      mockAuthService.logout.mockResolvedValue({ success: true });
      const res = mockRes();
      const result = await controller.logout(mockReq('rt'), {}, res);
      expect(mockAuthService.logout).toHaveBeenCalledWith('rt');
      expect(res.clearCookie).toHaveBeenCalledWith(
        'refresh_token',
        expect.objectContaining({ path: '/api/auth' }),
      );
      expect(result).toEqual({ success: true });
    });

    it('should return success without calling logout when no token', async () => {
      const result = await controller.logout(mockReq(), {}, mockRes());
      expect(mockAuthService.logout).not.toHaveBeenCalled();
      expect(result).toEqual({ success: true });
    });
  });

  describe('validate', () => {
    it('should return jwt payload', async () => {
      const payload = { sub: '1', email: 'a@b.com' };
      mockAuthService.validateToken.mockResolvedValue(payload);

      const result = await controller.validate({ token: 'some-token' });
      expect(result).toEqual(payload);
    });
  });

  describe('getMe', () => {
    it('should return user info from req.user', async () => {
      const user = {
        id: '1',
        email: 'a@b.com',
        name: 'A',
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      };
      mockAuthService.getCurrentUser.mockResolvedValue(user);

      const req = { user: { userId: '1', email: 'a@b.com' } } as any;
      const result = await controller.getMe(req);
      expect(result).toEqual({ id: '1', email: 'a@b.com', name: 'A' });
    });
  });
});
