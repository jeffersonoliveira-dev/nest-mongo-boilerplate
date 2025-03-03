import { HttpService } from '@nestjs/axios';
import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { HTTPMethods } from 'src/common/constants';
import { Readable } from 'stream';
import { ExceptionHandler } from '../exception/axios-excpetions.handler';
import * as http from 'http'

@Injectable()
export class AxiosConfig {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.configureAxiosInstance();
  }

  private configureAxiosInstance(): void {
    const maxConnections = this.configService.get<number>(
      'REST_HTTP_MAXCONNECTIONS',
    );
    const maxConnectionsPerRoute = this.configService.get<number>(
      'REST_HTTP_MAXCONNPERROUTE',
    );
    const connectionTimeout = this.configService.get<number>(
      'REST_HTTP_CONNECTIONTIMEOUT',
    );

    this.httpService.axiosRef.defaults.httpAgent = new http.Agent({
      maxSockets: maxConnections,
      maxFreeSockets: maxConnectionsPerRoute,
      timeout: connectionTimeout,
    });
  }

  private getAxiosRequestConfig(
    headers: object,
    method: string,
    params?: any,
    body?: any,
  ): AxiosRequestConfig {
    const config: AxiosRequestConfig = {
      headers: { ...headers },
      method: method,
    };

    if (params) {
      config.params = { ...params };
    }

    if (body) {
      config.data = body;
    }

    return config;
  }

  private getUrl(basePath: string, path: string): string {
    return basePath + path;
  }

  private async call<Response>(
    url: string,
    config: AxiosRequestConfig,
    isStream: boolean = false,
  ): Promise<AxiosResponse<Response, any>> {
    try {
      return await this.httpService.axiosRef<Response>(url, config);
    } catch (error) {
      const status = error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR;

      if (isStream) {
        let streamString = '';
        const streamPromise = new Promise((resolve, reject) => {
          error.response?.data
            ?.on('data', (utf8Chunk) => {
              streamString += utf8Chunk;
            })
            .on('end', resolve)
            .on('error', reject);
        });
        await streamPromise;

        const responseParsed = JSON.parse(streamString);
        const message =
          responseParsed?.error?.message ??
          (error.response?.data?.message
            ? error.response?.data?.message
            : error.response?.data);
        const code = responseParsed?.error?.code ?? status;

        ExceptionHandler.throwHttpException(status, code, message);
      }

      const message = error.response?.data?.message
        ? error.response?.data?.message
        : error.response?.data;
      const code = error.response?.data?.code;

      ExceptionHandler.throwHttpException(status, code, message);
    }
  }

  async getRequest<Response>(
    headers: object,
    basePath: string,
    path: string,
    request?: any,
  ): Promise<Response> {
    const { data } = await this.call<Response>(
      this.getUrl(basePath, path),
      this.getAxiosRequestConfig(headers, HTTPMethods.GET, request),
    );
    return data;
  }

  async patchRequest<Response>(
    headers: object,
    basePath: string,
    path: string,
    request?: any,
    body?: any,
  ): Promise<Response> {
    const { data } = await this.call<Response>(
      this.getUrl(basePath, path),
      this.getAxiosRequestConfig(headers, HTTPMethods.PATCH, request, body),
    );
    return data;
  }

  async postRequest<Response>(
    headers: object,
    basePath: string,
    path: string,
    request?: any,
    body?: any,
  ): Promise<Response> {
    const { data } = await this.call<Response>(
      this.getUrl(basePath, path),
      this.getAxiosRequestConfig(headers, HTTPMethods.POST, request, body),
    );
    return data;
  }

  async putRequest<Response>(
    headers: object,
    basePath: string,
    path: string,
    request?: any,
    body?: any,
  ): Promise<Response> {
    const { data } = await this.call<Response>(
      this.getUrl(basePath, path),
      this.getAxiosRequestConfig(headers, HTTPMethods.PUT, request, body),
    );
    return data;
  }

  async deleteRequest<Response>(
    headers: object,
    basePath: string,
    path: string,
    request?: any,
    body?: any,
  ): Promise<Response> {
    const { data } = await this.call<Response>(
      this.getUrl(basePath, path),
      this.getAxiosRequestConfig(headers, HTTPMethods.DELETE, request, body),
    );
    return data;
  }

  async postRequestStream(
    headers: object,
    basePath: string,
    path: string,
    request?: any,
    body?: any,
  ): Promise<Readable> {
    const config = this.getAxiosRequestConfig(
      headers,
      HTTPMethods.POST,
      request,
      body,
    );
    config.responseType = 'stream';
    const { data } = await this.call<Readable>(
      this.getUrl(basePath, path),
      config,
      true,
    );
    return data;
  }

  async getRequestBuffer(
    headers: object,
    basePath: string,
    path: string,
    request?: any,
  ): Promise<Buffer> {
    const config = this.getAxiosRequestConfig(
      headers,
      HTTPMethods.GET,
      request,
    );
    config.responseType = 'arraybuffer';
    const { data } = await this.call<ArrayBuffer>(
      this.getUrl(basePath, path),
      config,
      true,
    );

    return await new Promise<Buffer>((resolve, reject) => {
      const chunks: Buffer[] = [];
      const readable = new Readable({
        read() {},
      });
      readable.push(data);
      readable.push(null);
      readable.on('data', (chunk) => chunks.push(chunk));
      readable.on('end', () => resolve(Buffer.concat(chunks)));
      readable.on('error', reject);
    });
  }
}
