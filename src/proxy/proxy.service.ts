import { HttpService } from '@nestjs/axios';
import {
  Injectable,
  InternalServerErrorException,
  HttpException,
} from '@nestjs/common';
import { AxiosRequestConfig } from 'axios';
import { firstValueFrom } from 'rxjs';
import { HeadersDictionary, JsonValue } from '../common/types';

@Injectable()
export class ProxyService {
  constructor(private readonly httpService: HttpService) {}

  async forwardRequest<TResponse = unknown>(
    url: string,
    method: string,
    data?: JsonValue,
    headers?: HeadersDictionary,
  ): Promise<TResponse> {
    const config: AxiosRequestConfig<JsonValue> = {
      method,
      url,
      data,
      headers,
    };

    try {
      const response = await firstValueFrom(
        this.httpService.request<TResponse>(config),
      );
      return response.data;
    } catch (error: unknown) {
      if (this.hasResponse(error)) {
        throw new HttpException(error.response.data, error.response.status);
      }
      const message =
        error instanceof Error ? error.message : 'Unknown proxy error';
      throw new InternalServerErrorException(message);
    }
  }

  private hasResponse(
    error: unknown,
  ): error is { response: { data: unknown; status: number } } {
    if (typeof error !== 'object' || error === null || !('response' in error)) {
      return false;
    }

    const { response } = error as { response?: unknown };
    if (typeof response !== 'object' || response === null) {
      return false;
    }

    return 'data' in response && 'status' in response;
  }
}
