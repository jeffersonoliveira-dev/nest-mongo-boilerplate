import { Controller, Get } from '@nestjs/common';
import { HealthCheckService, HealthCheck } from '@nestjs/terminus';
import { HealthCheckConfigService } from '../services/health.service';

@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly healthCheckConfigService: HealthCheckConfigService,
  ) {}

  @Get()
  @Get()
  @HealthCheck()
  async check() {
    return await this.health.check(
      this.healthCheckConfigService.createHealthChecks(),
    );
  }
}
