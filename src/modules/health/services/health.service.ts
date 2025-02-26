import { Injectable } from '@nestjs/common';
import { MongooseHealthIndicator } from '@nestjs/terminus';

@Injectable()
export class HealthCheckConfigService {
  private readonly MINIMUM_HEALTH_CHECK_TIMEOUT = 1500;

  constructor(private db: MongooseHealthIndicator) {}

  createHealthChecks() {
    return [
      () =>
        this.db.pingCheck('mongodb', {
          timeout: this.MINIMUM_HEALTH_CHECK_TIMEOUT,
        }),
    ];
  }
}
