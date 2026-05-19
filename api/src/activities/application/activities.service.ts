import { Injectable } from '@nestjs/common';
import { ActivitiesRepository } from './activities.repository';
import { CreateActivityDto } from './dto/create-activity.dto';
import { CreateActivitiesBatchDto } from './dto/create-activities-batch.dto';
import { IngestBatchResult } from './dto/ingest-batch-result.dto';

@Injectable()
export class ActivitiesService {
  constructor(private readonly activitiesRepository: ActivitiesRepository) {}

  /**
   * Orquesta idempotencia: deduplicación intra-batch + consulta al repositorio
   * antes de un único createMany (alineado con bulkWrite / throughput).
   */
  async ingestBatch(dto: CreateActivitiesBatchDto): Promise<IngestBatchResult> {
    const received = dto.activities;
    const totalReceived = received.length;

    const skippedDuplicateIds: string[] = [];
    const uniqueInOrder: CreateActivityDto[] = [];
    const seenInBatch = new Set<string>();

    for (const activity of received) {
      const id = activity.activityId;
      if (seenInBatch.has(id)) {
        skippedDuplicateIds.push(id);
        continue;
      }
      seenInBatch.add(id);
      uniqueInOrder.push(activity);
    }

    const candidateIds = uniqueInOrder.map((a) => a.activityId);
    const existingInStore =
      await this.activitiesRepository.findExistingIds(candidateIds);

    const toPersist: CreateActivityDto[] = [];
    for (const activity of uniqueInOrder) {
      if (existingInStore.has(activity.activityId)) {
        skippedDuplicateIds.push(activity.activityId);
      } else {
        toPersist.push(activity);
      }
    }

    await this.activitiesRepository.createMany(toPersist);

    return {
      totalReceived,
      persistedIds: toPersist.map((a) => a.activityId),
      skippedDuplicateIds,
    };
  }

  findAll(): Promise<CreateActivityDto[]> {
    return this.activitiesRepository.findAll();
  }
}
