import { Module } from '@nestjs/common';
import { HealthController } from './controllers/health.controller';
import { TerminusModule } from '@nestjs/terminus';
import { HealthCheckConfigService } from './services/health.service';

@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
  providers: [HealthCheckConfigService],
})
export class HealthModule {}
