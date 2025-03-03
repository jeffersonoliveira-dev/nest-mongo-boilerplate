import { HttpException, HttpStatus } from '@nestjs/common';

export interface ErrorResponse {
  code?: number;
  message?: string | object;
}

export class HttpError extends HttpException {
  constructor(response: ErrorResponse, status: number) {
    super(response, status);
  }
}

export class ExceptionHandler {
  private static readonly errorMap = new Map<number, typeof HttpError>([
    [
      HttpStatus.BAD_REQUEST,
      class BadRequestException extends HttpError {} as any,
    ],
    [HttpStatus.NOT_FOUND, class NotFoundException extends HttpError {} as any],
    [
      HttpStatus.FORBIDDEN,
      class ForbiddenException extends HttpError {} as any,
    ],
    [
      HttpStatus.INTERNAL_SERVER_ERROR,
      class InternalServerErrorException extends HttpError {} as any,
    ],
  ]);

  public static getHttpException(status: number): typeof HttpError {
    return this.errorMap.get(status) || HttpError;
  }

  public static throwHttpException(
    status: number,
    code?: number,
    message?: string | object,
  ): never {
    const HttpExceptionClass = this.getHttpException(status);
    throw new HttpExceptionClass({ code, message }, status);
  }
}
