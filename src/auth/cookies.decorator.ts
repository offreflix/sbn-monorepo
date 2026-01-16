import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Custom decorator to extract cookies from the request.
 * Follows the official NestJS documentation pattern.
 * 
 * Usage:
 * @Cookies('cookieName') cookieValue: string
 * @Cookies() allCookies: Record<string, any>
 */
export const Cookies = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return data ? request.cookies?.[data] : request.cookies;
  },
);
