import { Test, TestingModule } from '@nestjs/testing';
import { ProxyController } from './proxy.controller';
import { ProxyService } from './proxy.service';
import { ConfigService } from '@nestjs/config';
import { CompositeAuthGuard } from '../auth/composite-auth.guard';
import { CanActivate } from '@nestjs/common';

describe('ProxyController', () => {
  let controller: ProxyController;

  const mockProxyService = {
    forwardRequest: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
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
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
