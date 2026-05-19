import { Injectable } from '@nestjs/common';
import { ActivitiesRepository } from '../application/activities.repository';
import { CreateActivityDto } from '../application/dto/create-activity.dto';

/**
 * Implementación de desarrollo / pruebas. Sustituible por un repositorio MongoDB
 * registrando otro `useClass` en el módulo, sin cambiar ActivitiesService.
 */
@Injectable()
export class InMemoryActivitiesRepository extends ActivitiesRepository {
  private readonly store = new Map<string, CreateActivityDto>();

  async findExistingIds(activityIds: string[]): Promise<Set<string>> {
    if (activityIds.length === 0) {
      return new Set();
    }
    const existing = new Set<string>();
    for (const id of activityIds) {
      if (this.store.has(id)) {
        existing.add(id);
      }
    }
    return existing;
  }

  async createMany(activities: CreateActivityDto[]): Promise<void> {
    if (activities.length === 0) {
      return;
    }
    // Un único "coste" de red/IO por lote (análogo a bulkWrite).
    await new Promise((resolve) => setTimeout(resolve, 50));
    for (const activity of activities) {
      this.store.set(activity.activityId, activity);
    }
  }

  async findAll(): Promise<CreateActivityDto[]> {
    return Array.from(this.store.values());
  }
}
