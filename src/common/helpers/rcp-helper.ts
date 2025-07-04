import { ClientProxy } from '@nestjs/microservices';
import { catchError, firstValueFrom } from 'rxjs';
import { ErrorManager } from '../utils/errorManager';

export const sendAndHandleRpcExceptionObservable = <T>(
  client: ClientProxy,
  pattern: string | object,
  data: object,
) => {
  return client.send<T>(pattern, data).pipe(
    catchError((err) => {
      throw ErrorManager.createSignatureError(err);
    }),
  );
};

export const sendAndHandleRpcExceptionPromise = async <T>(
  client: ClientProxy,
  pattern: string | object,
  data: object,
) => {
  try {
    return await firstValueFrom(client.send<T>(pattern, data));
  } catch (error) {
    throw ErrorManager.createSignatureError(error);
  }
};
