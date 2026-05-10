import { CreateActivityDto } from './dto/create-activity.dto';

/**
 * Contrato de persistencia de actividades.
 * El servicio de aplicación depende de esta abstracción, no de un almacén concreto
 * (MongoDB, Kafka+worker, etc.), cumpliendo el principio de inversión de dependencias (DIP).
 */
export abstract class ActivitiesRepository {
  /**
   * Devuelve el subconjunto de IDs que ya existen en el almacén.
   * Un solo round-trip escala mejor que N lookups en ingesta masiva.
   */
  abstract findExistingIds(activityIds: string[]): Promise<Set<string>>;

  /**
   * Persiste un lote; la implementación debe ser atómica o documentar su semántica.
   */
  abstract createMany(activities: CreateActivityDto[]): Promise<void>;

  abstract findAll(): Promise<CreateActivityDto[]>;
}
