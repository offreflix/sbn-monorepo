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
    data?: any,
    headers?: HeadersDictionary,
  ): Promise<TResponse> {
    const config: AxiosRequestConfig<any> = {
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
      if (this.isAxiosError(error) && error.response) {
        throw new HttpException(error.response.data, error.response.status);
      }

      const message =
        error instanceof Error ? error.message : 'Unknown proxy error';
      throw new InternalServerErrorException(message);
    }
  }

  private isAxiosError(
    error: unknown,
  ): error is { response: { data: unknown; status: number } } {
    // Basic check to see if it has response with data and status
    // Real AxiosError check would be better but this maintains the previous logic safely
    return (
      typeof error === 'object' &&
      error !== null &&
      'response' in error &&
      typeof (error as any).response === 'object' &&
      (error as any).response !== null &&
      'data' in (error as any).response &&
      'status' in (error as any).response
    );
  }
}
