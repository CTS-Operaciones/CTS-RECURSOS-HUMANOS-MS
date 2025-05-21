import { HttpStatus } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

export class ErrorManager extends RpcException {
  constructor({
    code,
    message,
  }: {
    code: keyof typeof HttpStatus;
    message: string;
  }) {
    super({ code, message });
  }

  public static createSignatureError(error: any) {
    //Error para llaves duplicadas en Postgres
    if (error.detail || error.code === '23505') {
      throw new RpcException({
        message: error.detail,
        code: HttpStatus.BAD_REQUEST,
      });
    }
    const errorCode = error.error ? error.error.code : error.code;
    const errorMessage = error.error ? error.error.message : error.message;
    //Errores de validaciones
    if (errorCode && HttpStatus[errorCode]) {
      throw new RpcException({
        message: errorMessage,
        code: HttpStatus[errorCode],
      });
    } else {
      if (errorMessage.includes('duplicate')) {
        throw new RpcException({
          message: errorMessage,
          code: HttpStatus.CONFLICT,
        });
      }
      throw new RpcException({
        message: errorMessage,
        code: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }
}
