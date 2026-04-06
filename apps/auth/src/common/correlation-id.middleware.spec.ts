import { CorrelationIdMiddleware } from './correlation-id.middleware';
import { Request, Response } from 'express';

describe('CorrelationIdMiddleware', () => {
  let middleware: CorrelationIdMiddleware;
  let mockNext: jest.Mock;

  beforeEach(() => {
    middleware = new CorrelationIdMiddleware();
    mockNext = jest.fn();
  });

  const makeReq = (headers: Record<string, string | string[]>) =>
    ({ headers: { ...headers } }) as unknown as Request;

  it('generates a correlation-id when none is present', () => {
    const req = makeReq({ accept: 'application/json' });

    middleware.use(req, {} as Response, mockNext);

    expect(req.headers).toHaveProperty('x-correlation-id');
    expect(mockNext).toHaveBeenCalled();
  });

  it('preserves an existing correlation-id header from orchestrator', () => {
    const existingId = 'test-corr-123';
    const req = makeReq({
      'x-correlation-id': existingId,
      accept: 'application/json',
    });

    middleware.use(req, {} as Response, mockNext);

    expect(req.headers['x-correlation-id']).toBe(existingId);
  });

  it('calls next()', () => {
    const req = makeReq({});

    middleware.use(req, {} as Response, mockNext);

    expect(mockNext).toHaveBeenCalledTimes(1);
  });
});
