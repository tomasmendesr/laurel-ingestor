import { Test, TestingModule } from '@nestjs/testing';
import { ActivitiesService } from './activities.service';
import { ActivitiesRepository } from './activities.repository';
import { CreateActivityDto } from './dto/create-activity.dto';

/** Factory de test: `activityId` obligatorio; el resto opcional con defaults (Partial + Pick). */
function activity(partial: Partial<CreateActivityDto> & Pick<CreateActivityDto, 'activityId'>): CreateActivityDto {
  return {
    userId: 'user-1',
    task: 'task',
    duration: 1,
    startTime: '2026-05-10T10:00:00.000Z',
    ...partial,
  };
}

describe('ActivitiesService', () => {
  let service: ActivitiesService;

  const mockRepo = {
    findExistingIds: jest.fn(),
    createMany: jest.fn(),
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    mockRepo.findExistingIds.mockResolvedValue(new Set<string>());
    mockRepo.createMany.mockResolvedValue(undefined);
    mockRepo.findAll.mockResolvedValue([]);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActivitiesService,
        {
          provide: ActivitiesRepository,
          useValue: mockRepo,
        },
      ],
    }).compile();

    service = module.get(ActivitiesService);
  });

  it('ingestBatch: persiste actividades nuevas y consulta el repo en lote', async () => {
    const a = activity({
      activityId: '11111111-1111-1111-1111-111111111111',
      task: 'A',
    });
    const b = activity({
      activityId: '22222222-2222-2222-2222-222222222222',
      task: 'B',
    });

    const result = await service.ingestBatch({ activities: [a, b] });

    expect(mockRepo.findExistingIds).toHaveBeenCalledTimes(1);
    expect(mockRepo.findExistingIds).toHaveBeenCalledWith([a.activityId, b.activityId]);

    expect(mockRepo.createMany).toHaveBeenCalledTimes(1);
    expect(mockRepo.createMany).toHaveBeenCalledWith([a, b]);

    expect(result.totalReceived).toBe(2);
    expect(result.persistedIds).toEqual([a.activityId, b.activityId]);
    expect(result.skippedDuplicateIds).toEqual([]);
  });

  it('ingestBatch: omite ids que ya existen en el almacén', async () => {
    const existingId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
    const newId = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

    const existing = activity({ activityId: existingId, task: 'old' });
    const fresh = activity({ activityId: newId, task: 'new' });

    mockRepo.findExistingIds.mockResolvedValue(new Set([existingId]));

    const result = await service.ingestBatch({ activities: [existing, fresh] });

    expect(mockRepo.findExistingIds).toHaveBeenCalledWith([existingId, newId]);
    expect(mockRepo.createMany).toHaveBeenCalledWith([fresh]);

    expect(result.totalReceived).toBe(2);
    expect(result.persistedIds).toEqual([newId]);
    expect(result.skippedDuplicateIds).toEqual([existingId]);
  });

  it('ingestBatch: deduplica por activityId dentro del mismo batch (gana la primera)', async () => {
    const id = 'cccccccc-cccc-cccc-cccc-cccccccccccc';
    const first = activity({ activityId: id, task: 'first' });
    const second = activity({ activityId: id, task: 'second' });

    const result = await service.ingestBatch({ activities: [first, second] });

    expect(mockRepo.findExistingIds).toHaveBeenCalledWith([id]);
    expect(mockRepo.createMany).toHaveBeenCalledWith([first]);

    expect(result.totalReceived).toBe(2);
    expect(result.persistedIds).toEqual([id]);
    expect(result.skippedDuplicateIds).toEqual([id]);
  });

  it('ingestBatch: si todo es duplicado, createMany recibe array vacío', async () => {
    const id = 'dddddddd-dddd-dddd-dddd-dddddddddddd';
    const a = activity({ activityId: id });

    mockRepo.findExistingIds.mockResolvedValue(new Set([id]));

    const result = await service.ingestBatch({ activities: [a] });

    expect(mockRepo.createMany).toHaveBeenCalledWith([]);
    expect(result.persistedIds).toEqual([]);
    expect(result.skippedDuplicateIds).toEqual([id]);
  });
});
