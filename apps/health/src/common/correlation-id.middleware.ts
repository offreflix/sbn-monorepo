import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { randomUUID } from "crypto";

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction): void {
    if (!req.headers["x-correlation-id"]) {
      req.headers["x-correlation-id"] = randomUUID();
    }
    next();
  }
}
