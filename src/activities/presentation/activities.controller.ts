import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { IngestApiKeyGuard } from '../../common/guards/ingest-api-key.guard';
import { ActivitiesService } from '../application/activities.service';
import { CreateActivitiesBatchDto } from '../application/dto/create-activities-batch.dto';

@UseGuards(IngestApiKeyGuard)
@Controller('activities')
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async ingest(@Body() body: CreateActivitiesBatchDto) {
    return this.activitiesService.ingestBatch(body);
  }

  @Get()
  async getAll() {
    return this.activitiesService.findAll();
  }
}
