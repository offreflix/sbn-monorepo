import { HeaderSanitizationMiddleware } from './header-sanitization.middleware';
import { Request, Response } from 'express';

describe('HeaderSanitizationMiddleware', () => {
  let middleware: HeaderSanitizationMiddleware;
  let mockNext: jest.Mock;

  beforeEach(() => {
    middleware = new HeaderSanitizationMiddleware();
    mockNext = jest.fn();
  });

  const makeReq = (headers: Record<string, string | string[]>) =>
    ({ headers: { ...headers } }) as unknown as Request;

  it('removes hop-by-hop headers in-place', () => {
    const req = makeReq({
      connection: 'keep-alive',
      'keep-alive': 'timeout=5',
      'transfer-encoding': 'chunked',
      te: 'trailers',
      upgrade: 'websocket',
      'proxy-authorization': 'Basic abc',
    });

    middleware.use(req, {} as Response, mockNext);

    expect(req.headers).not.toHaveProperty('connection');
    expect(req.headers).not.toHaveProperty('keep-alive');
    expect(req.headers).not.toHaveProperty('transfer-encoding');
    expect(req.headers).not.toHaveProperty('te');
    expect(req.headers).not.toHaveProperty('upgrade');
    expect(req.headers).not.toHaveProperty('proxy-authorization');
    expect(mockNext).toHaveBeenCalled();
  });

  it('removes internal trust headers in-place', () => {
    const req = makeReq({
      'x-user-id': 'spoofed-123',
      'x-forwarded-for': '1.2.3.4',
      'content-type': 'application/json',
    });

    middleware.use(req, {} as Response, mockNext);

    expect(req.headers).not.toHaveProperty('x-user-id');
    expect(req.headers).not.toHaveProperty('x-forwarded-for');
    expect(req.headers).toHaveProperty('content-type');
  });

  it('removes headers with CRLF in string values', () => {
    const req = makeReq({
      'x-evil': 'value\r\nX-Injected: header',
      'x-also-evil': 'value\nX-Injected: header',
      'x-safe': 'clean-value',
    });

    middleware.use(req, {} as Response, mockNext);

    expect(req.headers).not.toHaveProperty('x-evil');
    expect(req.headers).not.toHaveProperty('x-also-evil');
    expect(req.headers).toHaveProperty('x-safe', 'clean-value');
  });

  it('removes headers with CRLF in array values', () => {
    const req = makeReq({
      'x-multi': ['ok', 'bad\r\nX-Injected: evil'] as unknown as string,
    });

    middleware.use(req, {} as Response, mockNext);

    expect(req.headers).not.toHaveProperty('x-multi');
  });

  it('leaves safe headers untouched and calls next()', () => {
    const req = makeReq({
      accept: 'application/json',
      authorization: 'Bearer token',
      'content-type': 'application/json',
      'x-request-id': 'req-abc',
    });

    middleware.use(req, {} as Response, mockNext);

    expect(req.headers).toHaveProperty('accept', 'application/json');
    expect(req.headers).toHaveProperty('authorization', 'Bearer token');
    expect(req.headers).toHaveProperty('content-type', 'application/json');
    expect(req.headers).toHaveProperty('x-request-id', 'req-abc');
    expect(mockNext).toHaveBeenCalledTimes(1);
  });
});
