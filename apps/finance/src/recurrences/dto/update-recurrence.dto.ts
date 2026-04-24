import { PartialType } from '@nestjs/swagger';
import { CreateRecurrenceDto } from './create-recurrence.dto';

export class UpdateRecurrenceDto extends PartialType(CreateRecurrenceDto) {}
