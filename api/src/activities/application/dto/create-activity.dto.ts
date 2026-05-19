import {
  IsString,
  IsNumber,
  IsUUID,
  IsDateString,
  IsNotEmpty,
} from 'class-validator';

export class CreateActivityDto {
  @IsUUID()
  readonly activityId!: string;

  @IsString()
  @IsNotEmpty()
  readonly userId!: string;

  @IsString()
  readonly task!: string;

  @IsNumber()
  readonly duration!: number;

  @IsDateString()
  readonly startTime!: string;
}
