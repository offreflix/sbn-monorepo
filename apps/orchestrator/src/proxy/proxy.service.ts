import { HttpService } from '@nestjs/axios';
import {
  Injectable,
  InternalServerErrorException,
  HttpException,
} from '@nestjs/common';
import { AxiosError, AxiosRequestConfig } from 'axios';
import { firstValueFrom } from 'rxjs';
import { HeadersDictionary } from '../common/types';

export type ProxyResponseHeaders = Record<string, string | string[] | undefined>;

@Injectable()
export class ProxyService {
  constructor(private readonly httpService: HttpService) {}

  async forwardRequest<TResponse = unknown>(
    url: string,
    method: string,
    data?: unknown,
    headers?: HeadersDictionary,
    onResponseHeaders?: (headers: ProxyResponseHeaders) => void,
  ): Promise<TResponse> {
    const config: AxiosRequestConfig = {
      method,
      url,
      data,
      headers,
    };

    try {
      const response = await firstValueFrom(
        this.httpService.request<TResponse>(config),
      );
      onResponseHeaders?.(response.headers as ProxyResponseHeaders);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError && error.response) {
        throw new HttpException(error.response.data, error.response.status);
      }

      const message =
        error instanceof Error ? error.message : 'Unknown proxy error';
      throw new InternalServerErrorException(message);
    }
  }
}
