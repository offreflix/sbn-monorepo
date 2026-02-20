import { Test, TestingModule } from '@nestjs/testing';
import { ProxyController } from './proxy.controller';
import { ProxyService } from './proxy.service';
import { ConfigService } from '@nestjs/config';
import { CompositeAuthGuard } from '../auth/composite-auth.guard';
import { CanActivate } from '@nestjs/common';
import { Request } from 'express';

describe('ProxyController', () => {
  let controller: ProxyController;

  const mockProxyService = {
    forwardRequest: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string, fallback: string) => fallback),
  };

  const mockCompositeAuthGuard: CanActivate = {
    canActivate: jest.fn(() => true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProxyController],
      providers: [
        {
          provide: ProxyService,
          useValue: mockProxyService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    })
      .overrideGuard(CompositeAuthGuard)
      .useValue(mockCompositeAuthGuard)
      .compile();

    controller = module.get<ProxyController>(ProxyController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('sanitizeClientHeaders', () => {
    it('removes hop-by-hop headers', () => {
      const result = controller.sanitizeClientHeaders({
        connection: 'keep-alive',
        'keep-alive': 'timeout=5',
        'transfer-encoding': 'chunked',
        te: 'trailers',
        upgrade: 'websocket',
        'proxy-authorization': 'Basic abc',
        'proxy-authenticate': 'Basic',
        'content-type': 'application/json',
      });

      expect(result).not.toHaveProperty('connection');
      expect(result).not.toHaveProperty('keep-alive');
      expect(result).not.toHaveProperty('transfer-encoding');
      expect(result).not.toHaveProperty('te');
      expect(result).not.toHaveProperty('upgrade');
      expect(result).not.toHaveProperty('proxy-authorization');
      expect(result).not.toHaveProperty('proxy-authenticate');
      expect(result).toHaveProperty('content-type', 'application/json');
    });

    it('removes internal trust headers (x-user-id, x-forwarded-for)', () => {
      const result = controller.sanitizeClientHeaders({
        'x-user-id': 'spoofed-user-123',
        'x-forwarded-for': '1.2.3.4',
        'content-type': 'application/json',
      });

      expect(result).not.toHaveProperty('x-user-id');
      expect(result).not.toHaveProperty('x-forwarded-for');
      expect(result).toHaveProperty('content-type');
    });

    it('removes host and content-length headers', () => {
      const result = controller.sanitizeClientHeaders({
        host: 'evil.com',
        'content-length': '999',
        accept: 'application/json',
      });

      expect(result).not.toHaveProperty('host');
      expect(result).not.toHaveProperty('content-length');
      expect(result).toHaveProperty('accept');
    });

    it('removes headers with CRLF in string value (header injection guard)', () => {
      const result = controller.sanitizeClientHeaders({
        'x-custom': 'legit\r\nX-Injected: evil',
        'x-other': 'legit\nX-Injected: evil',
        'x-safe': 'legit-value',
      });

      expect(result).not.toHaveProperty('x-custom');
      expect(result).not.toHaveProperty('x-other');
      expect(result).toHaveProperty('x-safe', 'legit-value');
    });

    it('removes headers with CRLF in array values', () => {
      const result = controller.sanitizeClientHeaders({
        'x-multi': ['safe-value', 'evil\r\nX-Injected: hdr'],
        'x-clean': ['a', 'b'],
      });

      expect(result).not.toHaveProperty('x-multi');
      expect(result).toHaveProperty('x-clean');
    });

    it('passes through safe headers unchanged', () => {
      const result = controller.sanitizeClientHeaders({
        accept: 'application/json',
        'accept-language': 'en-US',
        'content-type': 'application/json',
        authorization: 'Bearer token123',
        'x-request-id': 'abc-123',
      });

      expect(result).toEqual({
        accept: 'application/json',
        'accept-language': 'en-US',
        'content-type': 'application/json',
        authorization: 'Bearer token123',
        'x-request-id': 'abc-123',
      });
    });
  });

  describe('handleAuthRequest', () => {
    it('does not forward x-user-id injected by the client', async () => {
      const req = {
        headers: {
          'content-type': 'application/json',
          'x-user-id': 'spoofed-id',
        },
        method: 'POST',
        originalUrl: '/api/auth/login',
      } as unknown as Request;

      mockProxyService.forwardRequest.mockResolvedValue({});

      await controller.handleAuthRequest(req, undefined);

      const [, , , forwardedHeaders] =
        mockProxyService.forwardRequest.mock.calls[0];
      expect(forwardedHeaders).not.toHaveProperty('x-user-id');
    });

    it('forwards safe headers to the auth service', async () => {
      const req = {
        headers: {
          'content-type': 'application/json',
          accept: 'application/json',
        },
        method: 'POST',
        originalUrl: '/api/auth/login',
      } as unknown as Request;

      mockProxyService.forwardRequest.mockResolvedValue({});

      await controller.handleAuthRequest(req, undefined);

      const [, , , forwardedHeaders] =
        mockProxyService.forwardRequest.mock.calls[0];
      expect(forwardedHeaders).toHaveProperty(
        'content-type',
        'application/json',
      );
      expect(forwardedHeaders).toHaveProperty('accept', 'application/json');
    });
  });

  describe('handleFinanceRequest', () => {
    const makeAuthReq = (headers: Record<string, string> = {}) =>
      ({
        headers: {
          'content-type': 'application/json',
          authorization: 'Bearer jwt.token.here',
          ...headers,
        },
        method: 'GET',
        originalUrl: '/api/finance/wallets',
        user: { userId: 'real-user-id', email: 'user@example.com' },
      }) as any;

    it('sets x-user-id from the validated JWT, not from the client', async () => {
      const req = makeAuthReq({ 'x-user-id': 'spoofed-id' });
      mockProxyService.forwardRequest.mockResolvedValue({});

      await controller.handleFinanceRequest(req as any, undefined);

      const [, , , forwardedHeaders] =
        mockProxyService.forwardRequest.mock.calls[0];
      expect(forwardedHeaders['x-user-id']).toBe('real-user-id');
    });

    it('strips the authorization header before forwarding to finance service', async () => {
      const req = makeAuthReq();
      mockProxyService.forwardRequest.mockResolvedValue({});

      await controller.handleFinanceRequest(req as any, undefined);

      const [, , , forwardedHeaders] =
        mockProxyService.forwardRequest.mock.calls[0];
      expect(forwardedHeaders).not.toHaveProperty('authorization');
    });

    it('does not forward hop-by-hop headers to finance service', async () => {
      const req = makeAuthReq({ connection: 'keep-alive', upgrade: 'h2c' });
      mockProxyService.forwardRequest.mockResolvedValue({});

      await controller.handleFinanceRequest(req as any, undefined);

      const [, , , forwardedHeaders] =
        mockProxyService.forwardRequest.mock.calls[0];
      expect(forwardedHeaders).not.toHaveProperty('connection');
      expect(forwardedHeaders).not.toHaveProperty('upgrade');
    });

    it('does not forward headers with CRLF injection to finance service', async () => {
      const req = makeAuthReq({ 'x-custom': 'val\r\nX-Evil: injected' });
      mockProxyService.forwardRequest.mockResolvedValue({});

      await controller.handleFinanceRequest(req as any, undefined);

      const [, , , forwardedHeaders] =
        mockProxyService.forwardRequest.mock.calls[0];
      expect(forwardedHeaders).not.toHaveProperty('x-custom');
    });

    it('forwards safe headers alongside x-user-id to finance service', async () => {
      const req = makeAuthReq({ 'accept-language': 'pt-BR' });
      mockProxyService.forwardRequest.mockResolvedValue({});

      await controller.handleFinanceRequest(req as any, undefined);

      const [, , , forwardedHeaders] =
        mockProxyService.forwardRequest.mock.calls[0];
      expect(forwardedHeaders).toHaveProperty('x-user-id', 'real-user-id');
      expect(forwardedHeaders).toHaveProperty(
        'content-type',
        'application/json',
      );
      expect(forwardedHeaders).toHaveProperty('accept-language', 'pt-BR');
    });
  });
});
