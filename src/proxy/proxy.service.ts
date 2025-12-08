import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { AxiosRequestConfig } from 'axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ProxyService {
  constructor(private readonly httpService: HttpService) {}

  async forwardRequest(url: string, method: string, data?: any, headers?: any) {
    const config: AxiosRequestConfig = {
      method,
      url,
      data,
      headers,
    };

    try {
      const response = await firstValueFrom(this.httpService.request(config));
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new InternalServerErrorException(error.response.data);
      }
      throw new InternalServerErrorException(error.message);
    }
  }
}
