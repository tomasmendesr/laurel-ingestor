import { Module } from '@nestjs/common';
import { IngestApiKeyGuard } from '../common/guards/ingest-api-key.guard';
import { ActivitiesController } from './presentation/activities.controller';
import { ActivitiesService } from './application/activities.service';
import { ActivitiesRepository } from './application/activities.repository';
import { InMemoryActivitiesRepository } from './infrastructure/in-memory.activities.repository';

@Module({
  controllers: [ActivitiesController],
  providers: [
    ActivitiesService,
    IngestApiKeyGuard,
    {
      provide: ActivitiesRepository,
      useClass: InMemoryActivitiesRepository,
    },
  ],
})
export class ActivitiesModule {}
