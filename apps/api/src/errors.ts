import {
  Catch,
  HttpException,
  type ArgumentsHost,
  type ExceptionFilter,
} from "@nestjs/common";
import type { Response } from "express";
import { ZodError } from "zod";
import { randomUUID } from "node:crypto";
export function fail(status: number, code: string): never {
  throw new HttpException({ code }, status);
}
@Catch()
export class SafeErrors implements ExceptionFilter {
  catch(error: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    const parserType =
      error && typeof error === "object" && "type" in error ? error.type : null;
    const status =
      error instanceof HttpException
        ? error.getStatus()
        : error instanceof ZodError || parserType === "entity.parse.failed"
          ? 400
          : parserType === "entity.too.large"
            ? 413
            : 503;
    const body =
      error instanceof HttpException ? error.getResponse() : undefined;
    const code =
      typeof body === "object" && body && "code" in body
        ? String(body.code)
        : status === 400
          ? "INVALID_INPUT"
          : status === 413
            ? "PAYLOAD_TOO_LARGE"
            : status === 404
            ? "NOT_FOUND"
            : "SERVICE_UNAVAILABLE";
    const requestId = randomUUID();
    if (status >= 500)
      console.warn(
        JSON.stringify({
          severity: "WARNING",
          event: "request_failed",
          requestId,
          status,
        }),
      );
    response
      .status(status)
      .json({
        error: {
          code,
          message:
            status === 503
              ? "Dịch vụ tạm thời không khả dụng."
              : "Yêu cầu chưa được thực hiện.",
          requestId,
          fields: [],
        },
      });
  }
}
