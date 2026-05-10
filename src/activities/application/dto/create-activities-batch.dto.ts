import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { CreateActivityDto } from './create-activity.dto';

export class CreateActivitiesBatchDto {
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CreateActivityDto)
  readonly activities: CreateActivityDto[] = [];
}
